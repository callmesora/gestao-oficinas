import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { StockReadResult, StockSave } from "../../../../packages/domain/src/stock";
let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, app: ReturnType<typeof createApp>;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  app = createApp({ stockConnect: () => server.connect(name), authenticate: async request => request.headers.authorization === "Bearer synthetic-stock" ? { userId: "synthetic-stock" } : null });
}, 60000);
afterAll(async () => { await app?.close(); await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  await database.query('TRUNCATE app."documentos",app."cab_stocks",app."lin_stocks",app."artigos",app."material_reparacao",app."mecanicos",app."postos",app."Terminais" RESTART IDENTITY');
  await database.query('INSERT INTO app."documentos" ("Codigo","Descricao","stock","obriga_macanico") VALUES ($1,$2,1,false),($3,$4,2,true),($5,$6,3,false)', ["E", "Entrada", "S", "Saída", "X", "Outro"]);
  await database.query('INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","preco","stock") VALUES ($1,$2,$3,$4,$5)', ["A", "Artigo d'água", "123", "3.12345678901234567890123456789", "10"]);
});
async function post(action: string, payload: unknown) { const result = await app.inject({ method: "POST", url: `/api/stock/${action}`, headers: { authorization: "Bearer synthetic-stock", "content-type": "application/json" }, payload: JSON.stringify(payload) }); expect(result.statusCode).toBe(200); return result.json(); }
const command = (document = "E", number = "1", quantity = "2"): StockSave => ({ mode: "create", document, number, description: "Cabeçalho d'água", date: "20261025", mechanic: null, lines: [{ linha: "1", artigo: "A", descricao_artigo: "Artigo d'água", quantidade: quantity, preco: "3.12345678901234567890123456789" }] });
const stock = async () => (await database.query<{ stock: string | null }>('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock;
it("every stock endpoint requires an authenticated principal before database access", async () => {
  for (const action of ["list", "read", "next", "lookup", "save", "delete", "inventory", "rebuild", "scanner-config", "scanner-partition"]) expect((await app.inject({ method: "POST", url: `/api/stock/${action}`, payload: {} })).statusCode).toBe(401);
});
it("create and replace apply exact source arithmetic; stale drafts preserve all committed stock/lines", async () => {
  const created = await post("save", command()); expect(created.kind).toBe("saved"); expect(await stock()).toBe("12");
  const read = await post("read", { id: created.id }) as Extract<StockReadResult, { kind: "loaded" }>;
  expect(read.lines[0].preco).toBe("3.12345678901234567890123456789");
  expect((await post("save", { ...command("E", "1", "3"), mode: "update", id: created.id, baseline: read.baseline })).kind).toBe("saved"); expect(await stock()).toBe("13");
  const after = (await database.query('SELECT to_jsonb(l) AS row FROM app."lin_stocks" l')).rows;
  expect((await post("save", { ...command("E", "1", "9"), mode: "update", id: created.id, baseline: read.baseline })).kind).toBe("stale");
  expect(await stock()).toBe("13"); expect((await database.query('SELECT to_jsonb(l) AS row FROM app."lin_stocks" l')).rows).toEqual(after);
});
it("source deletion deliberately adds incoming quantities again and removes the document atomically", async () => {
  const created = await post("save", command()); expect(await stock()).toBe("12");
  expect((await post("delete", { id: created.id })).kind).toBe("deleted"); expect(await stock()).toBe("14");
  expect((await database.query('SELECT COUNT(*)::text AS count FROM app."cab_stocks"')).rows[0].count).toBe("0");
  expect((await database.query('SELECT COUNT(*)::text AS count FROM app."lin_stocks"')).rows[0].count).toBe("0");
});
it("save all movement values except1 subtract, preserving negatives without a nonnegative guard", async () => {
  expect((await post("save", command("S", "1", "12.00000000000000000000001"))).kind).toBe("saved"); expect(await stock()).toBe("-2.00000000000000000000001");
  expect((await post("save", command("X", "1", "2"))).kind).toBe("saved"); expect(await stock()).toBe("-4.00000000000000000000001");
});
it("serialized creation refuses an actual number collision without partial rows or double stock", async () => {
  const results = await Promise.all([post("save", command()), post("save", command())]);
  expect(results.map((r: { kind: string }) => r.kind).sort()).toEqual(["duplicate", "saved"]); expect(await stock()).toBe("12");
  expect((await post("next", { document: "E" })).number).toBe("2");
});
it("a PostgreSQL failure after writing a line rolls back header, line and stock, retaining exact typed failure", async () => {
  await database.query(`CREATE FUNCTION app.stock_test_fail() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RAISE EXCEPTION ''synthetic''; END'; CREATE TRIGGER stock_test_fail AFTER INSERT ON app."lin_stocks" FOR EACH ROW EXECUTE FUNCTION app.stock_test_fail()`);
  try { expect((await post("save", command())).kind).toBe("failed"); expect(await stock()).toBe("10"); expect((await database.query('SELECT COUNT(*)::text AS count FROM app."cab_stocks"')).rows[0].count).toBe("0"); }
  finally { await database.query('DROP TRIGGER stock_test_fail ON app."lin_stocks"; DROP FUNCTION app.stock_test_fail()'); }
});
it("query preserves duplicate inner joins and literal descricao document alias, independent of displayed dates", async () => {
  await post("save", command("E", "2")); await post("save", command("E", "10"));
  const source = await post("list", { description: "Entrada", sort: "number" }); expect(source.rows.map((r: { documento_numero: string }) => r.documento_numero)).toEqual(["2", "10"]);
  expect((await post("list", { description: "Cabeçalho d'água" })).rows).toHaveLength(0);
  await database.query('INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ($1,$2,1)', ["E", "Entrada"]);
  expect((await post("list", {})).rows).toHaveLength(4);
  await database.query('INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero") VALUES ($1,3)', ["orphan"]);
  expect((await post("list", {})).rows).toHaveLength(4);
});
it("barcode lookup precedes code and leaves literal quotes parameterized", async () => {
  await database.query('INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","stock") VALUES ($1,$2,$3,0)', ["123", "Other code", "other"]);
  expect((await post("lookup", { code: "123" })).article.Codigo).toBe("A");
  expect((await post("lookup", { code: "123", barcode: false })).article.Codigo).toBe("123");
  expect((await post("lookup", { code: "' OR true --" })).kind).toBe("missing");
});
it("rebuild computes incoming-outgoing-allrepairmaterial, ignoring non1/non2 document movements", async () => {
  await post("save", command("E", "1", "10")); await post("save", command("S", "1", "3")); await post("save", command("X", "1", "100"));
  await database.query('INSERT INTO app."material_reparacao" ("artigo","quantidade","lancado","extra") VALUES ($1,2,true,true)', ["A"]);
  expect((await post("rebuild", {})).kind).toBe("rebuilt"); expect(await stock()).toBe("5");
  const inventory = await post("inventory", {}); expect(inventory.articles[0].stock).toBe("5");
});
it("unresolved reconstruction refuses orphan movement before zeroing any stock", async () => {
  await database.query('INSERT INTO app."lin_stocks" ("documento_codigo","artigo","quantidade") VALUES ($1,$2,99)', ["missing", "A"]);
  expect((await post("rebuild", {})).kind).toBe("unresolved"); expect(await stock()).toBe("10");
});
it("scanner resolves actual postos1 terminal, partitions barcode rows without writing permanent records", async () => {
  await database.query('INSERT INTO app."postos" ("Codigo","terminal") VALUES (1,$1)', ["T"]);
  await database.query('INSERT INTO app."Terminais" ("Codigo","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim","pasta_localizacao","nome_ficheiro") VALUES ($1,1,3,5,4,$2,$3)', ["T", "C:\\Synthetic d'água", "scanner.txt"]);
  expect((await post("scanner-config", {})).config).toEqual({ barcodeStart: 1, barcodeLength: 3, quantityStart: 5, quantityLength: 4, terminalCode: "T", folder: "C:\\Synthetic d'água", filename: "scanner.txt" });
  const result = await post("scanner-partition", { rows: [{ barcode: "123", quantity: "2.25" }, { barcode: "unrecognized", quantity: "opaque" }] });
  expect(result.kind).toBe("partitioned"); expect(result.known).toEqual([{ barcode: "123", quantity: "2.25", code: "A", description: "Artigo d'água", price: "3.12345678901234567890123456789" }]); expect(result.unknown).toEqual([{ barcode: "unrecognized", quantity: "opaque" }]); expect(await stock()).toBe("10");
});
it("scanner config selects only Postos1 and retains NULL/blank source path identity without interpreting a host path", async () => {
  await database.query('INSERT INTO app."postos" ("Codigo","terminal") VALUES (1,$1),(2,$2)', ["T", "OTHER"]);
  await database.query('INSERT INTO app."Terminais" ("Codigo","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim","pasta_localizacao","nome_ficheiro") VALUES ($1,2,3,6,4,NULL,NULL),($2,1,99,100,9,$3,$4)', ["T", "OTHER", "/unrelated/host/folder", "other.txt"]);
  expect((await post("scanner-config", {})).config).toEqual({ terminalCode: "T", folder: null, filename: null, barcodeStart: 2, barcodeLength: 3, quantityStart: 6, quantityLength: 4 });
  await database.query('UPDATE app."Terminais" SET "pasta_localizacao"=$1,"nome_ficheiro"=$2 WHERE "Codigo"=$3', ["", "scan d'água.txt", "T"]);
  expect((await post("scanner-config", {})).config).toMatchObject({ terminalCode: "T", folder: "", filename: "scan d'água.txt" });
  expect((await post("scanner-config", { path: "/untrusted" })).kind).toBe("invalid");
});
it("missing and ambiguous scanner joins retain typed unresolved without guessing a terminal from client context", async () => {
  expect((await post("scanner-config", {})).kind).toBe("unresolved");
  await database.query('INSERT INTO app."postos" ("Codigo","terminal") VALUES (1,$1)', ["T"]);
  expect((await post("scanner-config", {})).kind).toBe("unresolved");
  await database.query('INSERT INTO app."Terminais" ("Codigo","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim") VALUES ($1,1,3,5,4),($1,1,3,5,4)', ["T"]);
  expect((await post("scanner-config", {})).kind).toBe("unresolved");
  expect(await stock()).toBe("10");
});
