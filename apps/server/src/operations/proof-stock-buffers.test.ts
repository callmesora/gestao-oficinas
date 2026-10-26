import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { StockReadResult, StockSave } from "../../../../packages/domain/src/stock";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, app: ReturnType<typeof createApp>;
beforeAll(async () => {
  engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  app = createApp({ stockConnect: () => engine.connect(name), authenticate: async request => request.headers.authorization === "Bearer proof-stock" ? { userId: "proof-stock" } : null });
}, 60_000);
afterAll(async () => { await app?.close(); await database?.end(); await engine?.stop(); }, 60_000);
beforeEach(async () => {
  await database.query(`TRUNCATE app."documentos",app."cab_stocks",app."lin_stocks",app."artigos",app."material_reparacao",app."mecanicos",app."postos",app."Terminais" RESTART IDENTITY;
    INSERT INTO app."documentos" ("Codigo","Descricao","stock","obriga_macanico") VALUES ('E','Entrada',1,false),('S','Saída',2,true),('X','Outro',3,NULL);
    INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","preco","stock") VALUES ('A','Água Ω  ','BAR-A',3.125,10),('B',NULL,'BAR-B',NULL,20)`);
});
async function post(action: string, payload: unknown) {
  const response = await app.inject({ method: "POST", url: `/api/stock/${action}`, headers: { authorization: "Bearer proof-stock", "content-type": "application/json" }, payload: JSON.stringify(payload) });
  expect(response.statusCode).toBe(200); return response.json();
}
const command = (document = "E", quantity = "2"): StockSave => ({ mode: "create", document, number: "1", description: "Cabeçalho d'água Ω  ", date: "20261026", mechanic: "7", lines: [{ linha: "1", artigo: "A", descricao_artigo: "Água Ω  ", quantidade: quantity, preco: "3.125" }] });
async function state() {
  return (await database.query(`SELECT jsonb_build_object('headers',(SELECT jsonb_agg(to_jsonb(c) ORDER BY _row_id) FROM app."cab_stocks" c),
    'lines',(SELECT jsonb_agg(to_jsonb(l) ORDER BY _row_id) FROM app."lin_stocks" l),'articles',(SELECT jsonb_agg(to_jsonb(a) ORDER BY _row_id) FROM app."artigos" a)) AS value`)).rows[0].value;
}
async function stocks() { return (await database.query('SELECT "Codigo","stock"::text FROM app."artigos" ORDER BY _row_id')).rows; }
async function loaded(id: string) { const value = await post("read", { id }) as StockReadResult; expect(value.kind).toBe("loaded"); if (value.kind !== "loaded") throw new Error(value.kind); return value; }

it.each(["missing", "duplicate"])("stock proof %s document buffer refuses create and replacement without any writes", async problem => {
  const created = await post("save", command()); expect(created.kind).toBe("saved"); const draft = await loaded(created.id);
  if (problem === "missing") await database.query('DELETE FROM app."documentos" WHERE "Codigo"=\'E\'');
  else await database.query('INSERT INTO app."documentos" ("Codigo","stock") VALUES (\'E\',2)');
  const before = await state();
  expect(await post("save", { ...command(), number: "2" })).toEqual({ kind: "unresolved" }); expect(await state()).toEqual(before);
  expect(await post("save", { ...command("E", "9"), mode: "update", id: created.id, baseline: draft.baseline })).toEqual({ kind: "unresolved" }); expect(await state()).toEqual(before);
});
it("stock proof duplicate matching headers refuse replacement without reversing either scope", async () => {
  const created = await post("save", command()); const draft = await loaded(created.id);
  await database.query('INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","Descricao","data","mecanico") VALUES (\'E\',1,\'Duplicate\',\'20261026\',7)');
  const before = await state();
  expect(await post("save", { ...command("E", "8"), mode: "update", id: created.id, baseline: draft.baseline })).toEqual({ kind: "unresolved" });
  expect(await state()).toEqual(before);
});
it.each([
  { name: "document", patch: { document: "S" } }, { name: "number", patch: { number: "2" } }, { name: "date", patch: { date: "20261027" } }, { name: "NULL date", patch: { date: null } },
])("stock proof immutable $name tampering refuses the actual update without mutation", async ({ patch }) => {
  const created = await post("save", command()); const draft = await loaded(created.id), before = await state();
  expect(await post("save", { ...command("E", "99"), mode: "update", id: created.id, baseline: draft.baseline, ...patch })).toEqual({ kind: "stale" });
  expect(await state()).toEqual(before);
});
it("stock proof vanished header returns missing while retaining its orphan lines and stock", async () => {
  const created = await post("save", command()); const draft = await loaded(created.id);
  await database.query('DELETE FROM app."cab_stocks" WHERE _row_id=$1', [created.id]); const before = await state();
  expect(await post("save", { ...command(), mode: "update", id: created.id, baseline: draft.baseline })).toEqual({ kind: "missing" });
  expect(await post("read", { id: created.id })).toEqual({ kind: "missing" }); expect(await post("delete", { id: created.id })).toEqual({ kind: "missing" }); expect(await state()).toEqual(before);
});
it.each(["header", "line"])("stock proof concurrent %s change invalidates the complete baseline", async changed => {
  const created = await post("save", command()); const draft = await loaded(created.id);
  if (changed === "header") await database.query('UPDATE app."cab_stocks" SET "Descricao"=\'other writer\' WHERE _row_id=$1', [created.id]);
  else await database.query('UPDATE app."lin_stocks" SET "preco"=9.5 WHERE "documento_codigo"=\'E\'');
  const before = await state(); expect(await post("save", { ...command(), mode: "update", id: created.id, baseline: draft.baseline })).toEqual({ kind: "stale" }); expect(await state()).toEqual(before);
});
it.each([{ movement: 1, expected: "8.875" }, { movement: 2, expected: "11.125" }, { movement: 3, expected: "11.125" }, { movement: null, expected: "11.125" }])("stock proof movement $movement reverses all old lines and applies edited header and negative quantity exactly", async ({ movement, expected }) => {
  await database.query('UPDATE app."documentos" SET "stock"=$1 WHERE "Codigo"=\'E\'', [movement]);
  const created = await post("save", { ...command(), lines: [...command().lines, { linha: "2", artigo: "B", descricao_artigo: null, quantidade: "0.125", preco: null }] });
  const draft = await loaded(created.id);
  expect(await post("save", { ...command("E", "-1.125"), mode: "update", id: created.id, baseline: draft.baseline, description: "Texto editado ' Ω  ", mechanic: "255" })).toEqual({ kind: "saved", id: created.id });
  expect(await stocks()).toEqual([{ Codigo: "A", stock: expected }, { Codigo: "B", stock: "20.000" }]);
  const after = await loaded(created.id); expect(after.header).toMatchObject({ Descricao: "Texto editado ' Ω  ", mecanico: "255", data: "20261026", documento_numero: "1", documento_codigo: "E" });
  expect(after.lines).toEqual([{ linha: "1", artigo: "A", descricao_artigo: "Água Ω  ", quantidade: "-1.125", preco: "3.125" }]);
});
it.each(["second line", "article update", "final header"])("stock proof real PostgreSQL failure at $0 restores replacement header lines and all stock", async stage => {
  const created = await post("save", command()); const draft = await loaded(created.id), before = await state();
  const table = stage === "article update" ? "artigos" : stage === "final header" ? "cab_stocks" : "lin_stocks";
  const event = stage === "second line" ? "INSERT" : "UPDATE";
  const condition = stage === "second line" ? `IF NEW."linha"=2 THEN RAISE EXCEPTION 'proof failure'; END IF;` : "RAISE EXCEPTION 'proof failure';";
  await database.query(`CREATE FUNCTION app.proof_stock_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN ${condition} RETURN NEW; END $$;
    CREATE TRIGGER proof_stock_failure BEFORE ${event} ON app."${table}" FOR EACH ROW EXECUTE FUNCTION app.proof_stock_failure()`);
  try {
    expect(await post("save", { ...command("E", "7"), mode: "update", id: created.id, baseline: draft.baseline, description: "must roll back", lines: [...command("E", "7").lines, { linha: "2", artigo: "B", descricao_artigo: null, quantidade: "3", preco: null }] })).toEqual({ kind: "failed" });
    expect(await state()).toEqual(before);
  } finally { await database.query(`DROP TRIGGER proof_stock_failure ON app."${table}"; DROP FUNCTION app.proof_stock_failure()`); }
  expect(await post("save", { ...command("E", "4"), mode: "update", id: created.id, baseline: draft.baseline })).toEqual({ kind: "saved", id: created.id });
});
it("stock proof duplicate article exact seeks change only first buffer while NULL and missing article lines remain lossless", async () => {
  await database.query(`INSERT INTO app."artigos" ("Codigo","Descricao","stock") VALUES ('A','duplicate',99); UPDATE app."artigos" SET "stock"=NULL WHERE "Codigo"='B'`);
  const lines = [...command().lines, { linha: "2", artigo: "B", descricao_artigo: null, quantidade: "2", preco: null }, { linha: null, artigo: "absent", descricao_artigo: "orphan  ", quantidade: "4.00000000000000000001", preco: null }, { linha: "-1", artigo: null, descricao_artigo: null, quantidade: null, preco: null }];
  const created = await post("save", { ...command(), lines }); expect(created.kind).toBe("saved");
  expect(await stocks()).toEqual([{ Codigo: "A", stock: "12" }, { Codigo: "B", stock: null }, { Codigo: "A", stock: "99" }]);
  expect((await loaded(created.id)).lines).toEqual(lines);
});
it.each(["duplicate document", "missing document", "NULL document", "blank document", "NULL line quantity", "NULL material quantity"])("stock proof rebuild %s refuses before zeroing any article", async problem => {
  const code = problem === "NULL document" ? null : problem === "blank document" ? "" : problem === "missing document" ? "missing" : "E";
  await database.query('INSERT INTO app."lin_stocks" ("documento_codigo","artigo","quantidade") VALUES ($1,\'A\',$2)', [code, problem === "NULL line quantity" ? null : "2"]);
  if (problem === "duplicate document") await database.query('INSERT INTO app."documentos" ("Codigo","stock") VALUES (\'E\',1)');
  if (problem === "NULL material quantity") await database.query('INSERT INTO app."material_reparacao" ("artigo","quantidade") VALUES (\'A\',NULL)');
  const before = await state(); expect(await post("rebuild", {})).toEqual({ kind: "unresolved" }); expect(await state()).toEqual(before);
});
it("stock proof reconstruction counts duplicate articles independently, ignores orphan articles and resets unused NULL stock", async () => {
  await database.query(`INSERT INTO app."artigos" ("Codigo","stock") VALUES ('A',999),('Z',NULL);
    INSERT INTO app."lin_stocks" ("documento_codigo","artigo","quantidade") VALUES ('E','A',10.125),('S','A',1.25),('X','A',1000),('E','orphan',10);
    INSERT INTO app."material_reparacao" ("artigo","quantidade","lancado","extra") VALUES ('A',0.875,true,true),('A',1,false,false),('B',-3,NULL,NULL)`);
  expect(await post("rebuild", {})).toEqual({ kind: "rebuilt", articles: "4" });
  expect(await stocks()).toEqual([{ Codigo: "A", stock: "7.000" }, { Codigo: "B", stock: "3" }, { Codigo: "A", stock: "7.000" }, { Codigo: "Z", stock: "0" }]);
  expect((await post("inventory", {})).articles.map((row: { Codigo: string }) => row.Codigo)).toEqual(["A", "A", "B", "Z"]);
});
it("stock proof article and header allocation exhaustion roll back complete commands", async () => {
  await database.query('INSERT INTO app."lin_stocks" ("lin_stocksID","documento_codigo","artigo","quantidade") VALUES (9223372036854775807,\'orphan\',\'A\',1)');
  const before = await state(); expect(await post("save", command())).toEqual({ kind: "failed" }); expect(await state()).toEqual(before);
  await database.query('TRUNCATE app."lin_stocks"; INSERT INTO app."cab_stocks" ("cab_stocksID","documento_codigo","documento_numero") VALUES (9223372036854775807,\'S\',99)');
  const headerBefore = await state(); expect(await post("save", command())).toEqual({ kind: "failed" }); expect(await state()).toEqual(headerBefore);
});
it.each([
  { name: "NULL barcode start", values: [null, 3, 5, 4] }, { name: "zero barcode start", values: [0, 3, 5, 4] }, { name: "NULL quantity start", values: [1, 3, null, 4] }, { name: "zero quantity start", values: [1, 3, 0, 4] },
  { name: "NULL barcode length", values: [1, null, 5, 4] }, { name: "negative barcode length", values: [1, -1, 5, 4] }, { name: "NULL quantity length", values: [1, 3, 5, null] }, { name: "negative quantity length", values: [1, 3, 5, -1] },
])("stock proof scanner $name retains unresolved and current stock", async ({ values }) => {
  await database.query('INSERT INTO app."postos" ("Codigo","terminal") VALUES (1,\'T\')');
  await database.query('INSERT INTO app."Terminais" ("Codigo","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim") VALUES (\'T\',$1,$2,$3,$4)', values);
  const before = await state(); expect(await post("scanner-config", {})).toEqual({ kind: "unresolved" }); expect(await state()).toEqual(before);
});
it("stock proof zero-length scanner fields and nullable article result cells survive exact partition without writes", async () => {
  await database.query(`INSERT INTO app."postos" ("Codigo","terminal") VALUES (1,'T');
    INSERT INTO app."Terminais" ("Codigo","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim") VALUES ('T',1,0,1,0)`);
  expect((await post("scanner-config", {})).config).toMatchObject({ barcodeStart: 1, barcodeLength: 0, quantityStart: 1, quantityLength: 0 });
  const before = await state(); expect(await post("scanner-partition", { rows: [{ barcode: "BAR-B", quantity: "opaque Ω  " }, { barcode: "", quantity: "" }, { barcode: "B", quantity: "1" }, { barcode: "BAR-B", quantity: "-0" }] })).toEqual({ kind: "partitioned",
    known: [{ barcode: "BAR-B", quantity: "opaque Ω  ", code: "B", description: null, price: null }, { barcode: "BAR-B", quantity: "-0", code: "B", description: null, price: null }], unknown: [{ barcode: "", quantity: "" }, { barcode: "B", quantity: "1" }] }); expect(await state()).toEqual(before);
});
