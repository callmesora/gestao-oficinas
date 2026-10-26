import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { StockReadResult, StockSave } from "../../../../packages/domain/src/stock";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, app: ReturnType<typeof createApp>;
beforeAll(async () => { engine = await startIsolatedPostgres(); }, 60000);
beforeEach(async () => {
  database = await engine.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  app = createApp({ stockConnect: () => engine.connect(name), authenticate: async request => request.headers.authorization === "Bearer synthetic-verification-operations" ? { userId: "synthetic-verification-operations" } : null });
  await database.query(`INSERT INTO app."documentos" ("Codigo","Descricao","stock","obriga_macanico") VALUES ('E','Entrada',1,false),('S','Saída',2,true),('X','Outro',3,false);
    INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","preco","stock") VALUES ('A','Água d''aço','BAR-A',2.25,10),('B','B',NULL,5,30)`);
});
afterEach(async () => { await app?.close(); await database?.end(); });
afterAll(async () => { await engine?.stop(); }, 60000);
async function post(action: string, payload: unknown) {
  const result = await app.inject({ method: "POST", url: `/api/stock/${action}`, headers: { authorization: "Bearer synthetic-verification-operations", "content-type": "application/json" }, payload: JSON.stringify(payload) });
  expect(result.statusCode).toBe(200); return result.json();
}
const command = (document = "E", number = "1", quantity = "2"): StockSave => ({ mode: "create", document, number, description: "Cabeçalho d'água", date: "20261026", mechanic: null,
  lines: [{ linha: "1", artigo: "A", descricao_artigo: "Água d'aço", quantidade: quantity, preco: "2.25" }] });
const inventory = async () => (await database.query('SELECT "Codigo","stock"::text FROM app."artigos" ORDER BY _row_id')).rows;
const state = async () => (await database.query(`SELECT jsonb_build_object('headers',(SELECT jsonb_agg(to_jsonb(c) ORDER BY _row_id) FROM app."cab_stocks" c),
  'lines',(SELECT jsonb_agg(to_jsonb(l) ORDER BY _row_id) FROM app."lin_stocks" l),'articles',(SELECT jsonb_agg(to_jsonb(a) ORDER BY _row_id) FROM app."artigos" a)) AS state`)).rows[0].state;

it("verification operations stock replacement reverses outgoing lines before applying current memory order and skips orphan article writes", async () => {
  // WIN_Table_Lin_Stocks853–931: source exact seek changes one article and preserves orphan lines.
  const created = await post("save", { ...command("S"), lines: [...command().lines, { linha: "2", artigo: "ORPHAN", descricao_artigo: "Keep orphan", quantidade: "7", preco: "1.25" }] });
  expect(created.kind).toBe("saved"); expect(await inventory()).toEqual([{ Codigo: "A", stock: "8" }, { Codigo: "B", stock: "30" }]);
  const loaded = await post("read", { id: created.id }) as Extract<StockReadResult, { kind: "loaded" }>;
  expect(loaded.lines.map(row => row.artigo)).toEqual(["A", "ORPHAN"]);
  expect(await post("save", { ...command("S", "1", "-0.125"), mode: "update", id: created.id, baseline: loaded.baseline,
    lines: [{ linha: "7", artigo: "B", descricao_artigo: "Now first", quantidade: "0.125", preco: "5" }, ...command("S", "1", "-0.125").lines] })).toEqual({ kind: "saved", id: created.id });
  expect(await inventory()).toEqual([{ Codigo: "A", stock: "10.125" }, { Codigo: "B", stock: "29.875" }]);
  const result = await post("read", { id: created.id }) as Extract<StockReadResult, { kind: "loaded" }>;
  expect(result.lines.map(row => [row.linha, row.artigo, row.quantidade])).toEqual([["7", "B", "0.125"], ["1", "A", "-0.125"]]);
});

it("verification operations stock exact seek updates one duplicate article and the delete sign subtracts outgoing again", async () => {
  await database.query(`INSERT INTO app."artigos" ("Codigo","Descricao","stock") VALUES ('A','Duplicate article',100)`);
  const created = await post("save", command("S", "1", "2.125")); expect(created.kind).toBe("saved");
  expect(await inventory()).toEqual([{ Codigo: "A", stock: "7.875" }, { Codigo: "B", stock: "30" }, { Codigo: "A", stock: "100" }]);
  expect(await post("delete", { id: created.id })).toEqual({ kind: "deleted" });
  expect(await inventory()).toEqual([{ Codigo: "A", stock: "5.750" }, { Codigo: "B", stock: "30" }, { Codigo: "A", stock: "100" }]);
  expect((await database.query('SELECT COUNT(*)::text AS count FROM app."lin_stocks"')).rows[0].count).toBe("0");
  expect((await database.query('SELECT COUNT(*)::text AS count FROM app."cab_stocks"')).rows[0].count).toBe("0");
});

it("verification operations stock deletion rollback restores already changed quantities and every header line after a real final delete failure", async () => {
  const created = await post("save", command()); expect(created.kind).toBe("saved"); const before = await state();
  await database.query(`CREATE FUNCTION app.verification_operations_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic'; END $$;
    CREATE TRIGGER verification_operations_failure BEFORE DELETE ON app."cab_stocks" FOR EACH ROW EXECUTE FUNCTION app.verification_operations_failure()`);
  expect(await post("delete", { id: created.id })).toEqual({ kind: "failed" }); expect(await state()).toEqual(before);
  await database.query('DROP TRIGGER verification_operations_failure ON app."cab_stocks"; DROP FUNCTION app.verification_operations_failure()');
  expect(await post("delete", { id: created.id })).toEqual({ kind: "deleted" });
  expect(await inventory()).toEqual([{ Codigo: "A", stock: "14" }, { Codigo: "B", stock: "30" }]);
});

it("verification operations concurrent stock replacements accept exactly one current baseline without duplicate lines or double quantity effects", async () => {
  const created = await post("save", command()); expect(created.kind).toBe("saved");
  const loaded = await post("read", { id: created.id }) as Extract<StockReadResult, { kind: "loaded" }>;
  const result = await Promise.all(["3.125", "4.250"].map(quantity => post("save", { ...command("E", "1", quantity), mode: "update", id: created.id, baseline: loaded.baseline })));
  expect(result.map(row => row.kind).sort()).toEqual(["saved", "stale"]);
  const saved = await post("read", { id: created.id }) as Extract<StockReadResult, { kind: "loaded" }>;
  const accepted = result[0].kind === "saved" ? "3.125" : "4.250";
  expect(saved.lines).toHaveLength(1); expect(saved.lines[0].quantidade).toBe(accepted);
  expect((await inventory())[0].stock).toBe(result[0].kind === "saved" ? "13.125" : "14.250");
});

it("verification operations stock read preserves large identities nullable cells and source spaces across the real API", async () => {
  await database.query(`INSERT INTO app."cab_stocks" (_row_id,"documento_codigo","documento_numero","Descricao","data","mecanico") OVERRIDING SYSTEM VALUE VALUES (9007199254740993,'E',18446744073709551615,NULL,'00000000',NULL);
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","linha","artigo","descricao_artigo","quantidade","preco") VALUES ('E',18446744073709551615,2147483647,'  A  ',' Peça Ω  ',1.12345678901234567890123456789,NULL)`);
  const result = await post("read", { id: "9007199254740993" }) as Extract<StockReadResult, { kind: "loaded" }>;
  expect(result.kind).toBe("loaded"); expect(result.header).toEqual({ id: "9007199254740993", documento_codigo: "E", documento_numero: "18446744073709551615", Descricao: null, data: "00000000", mecanico: null });
  expect(result.lines).toEqual([{ linha: "2147483647", artigo: "  A  ", descricao_artigo: " Peça Ω  ", quantidade: "1.12345678901234567890123456789", preco: null }]);
  expect(JSON.parse(result.baseline)).toEqual([result.header, result.lines]);
});

it("verification operations malformed stock commands are rejected without touching previously committed stock and document data", async () => {
  const created = await post("save", command()); expect(created.kind).toBe("saved"); const before = await state();
  for (const payload of [{ ...command(), lines: [{ ...command().lines[0], quantidade: "1e3" }] }, { ...command(), lines: [{ ...command().lines[0], preco: "NaN" }] },
    { ...command(), number: "1 OR true" }, { ...command(), mechanic: "Infinity" }, { ...command(), mode: "update", id: created.id }, { ...command(), extra: "ignored-field" }]) {
    expect(await post("save", payload)).toEqual({ kind: "invalid" }); expect(await state()).toEqual(before);
  }
  for (const action of ["read", "delete"]) {
    expect(await post(action, { id: "9007199254740993\n" })).toEqual({ kind: "invalid" });
    expect(await post(action, { id: "9223372036854775808" })).toEqual({ kind: "invalid" });
  }
  expect(await state()).toEqual(before);
});

it("verification operations scanner partition preserves duplicate and unmatched memory rows in caller order without code fallback or persistent writes", async () => {
  // WIN_Leitor_cod_barras329–390 searches barcode only and appends every source row.
  await database.query(`INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","preco","stock") VALUES ('DUP','Second duplicate','BAR-A',99,50)`);
  const before = await state();
  expect(await post("scanner-partition", { rows: [{ barcode: "BAR-A", quantity: "2.125" }, { barcode: "A", quantity: "1" }, { barcode: "BAR-A", quantity: "-1.25" }, { barcode: "unknown Ω ", quantity: "0" }] })).toEqual({ kind: "partitioned",
    known: [{ barcode: "BAR-A", quantity: "2.125", code: "A", description: "Água d'aço", price: "2.25" }, { barcode: "BAR-A", quantity: "-1.25", code: "A", description: "Água d'aço", price: "2.25" }],
    unknown: [{ barcode: "A", quantity: "1" }, { barcode: "unknown Ω ", quantity: "0" }] });
  expect(await state()).toEqual(before);
});
