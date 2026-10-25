import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { createApp } from "../app";
import type { RepairMaterialLine, RepairMaterialsSave } from "../../../../packages/domain/src/repair-materials";
import scenario from "../../../../docs/golden/GS-REPAIR-MATERIALS-001/scenario.json";
import { authenticateRepairMaterialMechanic, listRepairMaterials, lookupRepairMaterialArticle, readRepairMaterials, saveRepairMaterials } from "./repair-materials";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  await database.query('TRUNCATE app."ordem_reparacao",app."material_reparacao",app."artigos",app."mecanicos",app."estados_reparacao",app."Viaturas",app."sistema" RESTART IDENTITY');
  await database.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES ($1,$2,7,$3)', [scenario.order, "AA' ", "R"]);
  await database.query('INSERT INTO app."Viaturas" ("matricula","marca","modelo") VALUES ($1,$2,$3)', ["AA' ", "Marca", "Modelo"]);
  await database.query('INSERT INTO app."mecanicos" ("Codigo","Descricao","palavra_passe","inativo") VALUES (7,$1,$2,FALSE),(8,$3,$4,TRUE)', ["Mecânico  ", "CaSe' ", "Inativo", "synthetic"]);
  await database.query('INSERT INTO app."estados_reparacao" ("Codigo","tipo","lancar_material") VALUES ($1,2,TRUE)', ["R"]);
  await database.query('INSERT INTO app."sistema" ("Tempo_materiais") VALUES (3)');
  await database.query('INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","codbarras","preco","stock") VALUES (1,$1,$2,$3,$4,$5)', [scenario.article, "Descrição  ", "BAR' ", scenario.before.price, scenario.before.stock]);
  await database.query('INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","preco","data_hora","reparacao_estado","lancado","extra") VALUES (9007199254740993,$1,7,$2,$3,$4,$5,$6,$7,FALSE,TRUE)', [scenario.order, scenario.article, "Antiga", scenario.before.quantity, scenario.before.price, "20240229123456987", "OLD"]);
});
const payload = (row: RepairMaterialLine) => ({ id: row.id, data_hora: row.data_hora, mecanico: row.mecanico, artigo: row.artigo, descricao_artigo: row.descricao_artigo, quantidade: row.quantidade, preco: row.preco, lancado: row.lancado });
async function command(): Promise<RepairMaterialsSave> {
  const result = await readRepairMaterials(connect, { numero: scenario.order });
  if (result.kind !== "loaded") throw new Error("Synthetic material read failed");
  return { orderId: result.document.orderId, numero: result.document.numero, state: result.document.state, baseline: result.document.baseline, rows: result.document.rows.map(payload), proofs: [] };
}
async function snapshot() {
  return { articles: (await database.query('SELECT to_jsonb(a)::text FROM app."artigos" a ORDER BY _row_id')).rows,
    materials: (await database.query('SELECT to_jsonb(m)::text FROM app."material_reparacao" m ORDER BY _row_id')).rows };
}
const newLine = (overrides: Partial<RepairMaterialLine> = {}): RepairMaterialLine => ({ id: null, data_hora: "20240301123456000", mecanico: 7,
  artigo: scenario.article, descricao_artigo: "Nova  ", quantidade: "1", preco: "1", lancado: false, ...overrides });

it("SRC-eb5a859599 invalid input and unauthenticated API requests cannot acquire a database or disclose credentials", async () => {
  let acquisitions = 0;
  const observed: DatabaseConnection = async () => { acquisitions++; return connect(); };
  expect(await saveRepairMaterials(observed, { orderId: 1 })).toEqual({ kind: "invalid" });
  expect(await readRepairMaterials(observed, { orderId: "1 OR TRUE" })).toEqual({ kind: "invalid" });
  expect(await lookupRepairMaterialArticle(observed, { value: "A", barcodeFirst: true, sql: "x" })).toEqual({ kind: "invalid" });
  const api = createApp({ repairMaterialsConnect: observed });
  try {
    for (const action of ["list", "read", "article", "authenticate", "save"]) {
      const response = await api.inject({ method: "POST", url: `/api/repair-materials/${action}`, payload: {} });
      expect(response.statusCode).toBe(401); expect(response.json()).toEqual({ kind: "unauthenticated" });
      expect(response.headers["cache-control"]).toBe("no-store");
    }
  } finally { await api.close(); }
  expect(acquisitions).toBe(0);
});

it("SRC-ccd6dd9cc2/SRC-91067de207 load raw dates/NULL/decimals and prefer barcode matches over code without an inactive article filter", async () => {
  const loaded = await readRepairMaterials(connect, { orderId: "1" });
  expect(loaded).toMatchObject({ kind: "loaded", document: { numero: scenario.order, matricula: "AA' ", marcamodelo: "Marca Modelo", mechanic: { Codigo: 7, Descricao: "Mecânico  " }, rows: [{ data_hora: "20240229123456987", preco: scenario.before.price, mechanicDescription: "Mecânico  " }] } });
  expect(JSON.stringify(loaded)).not.toContain("CaSe"); expect(JSON.stringify(loaded)).not.toContain("palavra_passe");
  await database.query('INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","inativo","preco") VALUES ($1,$2,$3,TRUE,NULL)', ["OTHER", "Barcode wins", scenario.article]);
  expect(await lookupRepairMaterialArticle(connect, { value: scenario.article, barcodeFirst: true })).toEqual({ kind: "loaded", article: { Codigo: "OTHER", Descricao: "Barcode wins", preco: null } });
  expect(await lookupRepairMaterialArticle(connect, { value: scenario.article, barcodeFirst: false })).toMatchObject({ kind: "loaded", article: { Codigo: scenario.article } });
  expect(await lookupRepairMaterialArticle(connect, { value: "' OR TRUE --", barcodeFirst: true })).toEqual({ kind: "missing" });
});

it("SRC-08f76d0b2c/SRC-24e17a93a6 mechanic inactive, cancellation and exact password cases remain distinct with public replies", async () => {
  expect(await authenticateRepairMaterialMechanic(connect, { code: 8, password: "" })).toEqual({ kind: "inactive" });
  expect(await authenticateRepairMaterialMechanic(connect, { code: 7, password: "" })).toEqual({ kind: "cancelled", mechanic: { Codigo: 7, Descricao: "Mecânico  ", inativo: false } });
  expect(await authenticateRepairMaterialMechanic(connect, { code: 7, password: "CASE' " })).toEqual({ kind: "incorrect" });
  expect(await authenticateRepairMaterialMechanic(connect, { code: 7, password: "CaSe' " })).toEqual({ kind: "authenticated", mechanic: { Codigo: 7, Descricao: "Mecânico  ", inativo: false } });
  const draft = await command(); draft.rows.push(payload(newLine()));
  const before = await snapshot();
  expect(await saveRepairMaterials(connect, draft)).toEqual({ kind: "incorrect" });
  expect(await snapshot()).toEqual(before);
  draft.proofs.push({ code: 7, password: "CaSe' " });
  expect(await saveRepairMaterials(connect, draft)).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "material_reparacaoID"::text FROM app."material_reparacao" ORDER BY _row_id')).rows).toEqual([{ material_reparacaoID: "9007199254740993" }, { material_reparacaoID: "9007199254740994" }]);
});

it("GS-REPAIR-MATERIALS-001 protected actual API replacement matches source10+old2-new3=9 and preserves existing identity/extra", async () => {
  const draft = await command(), prior = (await database.query('SELECT _row_id::text,"material_reparacaoID"::text,"extra",_import_id,_source_row FROM app."material_reparacao"')).rows[0];
  draft.rows[0] = { ...draft.rows[0], quantidade: scenario.draft.quantity, preco: scenario.draft.price, descricao_artigo: scenario.draft.description };
  const api = createApp({ repairMaterialsConnect: connect, authenticate: async () => ({ userId: "synthetic-material-golden" }) });
  try {
    const saved = await api.inject({ method: "POST", url: "/api/repair-materials/save", payload: draft });
    expect(saved.statusCode).toBe(200); expect(saved.json()).toEqual({ kind: "saved" });
    const material = (await database.query('SELECT _row_id::text,"material_reparacaoID"::text,"extra",_import_id,_source_row,"quantidade"::text,"preco"::text,"descricao_artigo","reparacao_estado" FROM app."material_reparacao"')).rows[0];
    expect(material).toEqual({ ...prior, quantidade: scenario.after.quantity, preco: scenario.after.price, descricao_artigo: scenario.after.description, reparacao_estado: "R" });
    expect((await database.query('SELECT "stock"::text FROM app."artigos"')).rows).toEqual([{ stock: scenario.after.stock }]);
  } finally { await api.close(); }
});

it("SRC-eb5a859599 unchanged launched rows still restore/deduct; edit/removal are refused with rollback", async () => {
  await database.query('UPDATE app."material_reparacao" SET "lancado"=TRUE');
  const draft = await command();
  expect(await saveRepairMaterials(connect, draft)).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "stock"::text FROM app."artigos"')).rows[0].stock).toBe("10");
  const next = await command(), before = await snapshot();
  expect(await saveRepairMaterials(connect, { ...next, rows: [] })).toEqual({ kind: "launched" });
  expect(await saveRepairMaterials(connect, { ...next, rows: [{ ...next.rows[0], quantidade: "7" }] })).toEqual({ kind: "launched" });
  expect(await snapshot()).toEqual(before);
});

it("SRC-eb5a859599 stale material/state snapshots and forged existing keys cannot overwrite current rows", async () => {
  const draft = await command();
  await database.query('UPDATE app."material_reparacao" SET "quantidade"=4');
  const before = await snapshot();
  expect(await saveRepairMaterials(connect, draft)).toEqual({ kind: "stale" });
  expect(await snapshot()).toEqual(before);
  const current = await command();
  expect(await saveRepairMaterials(connect, { ...current, rows: [{ ...current.rows[0], id: "999" }] })).toEqual({ kind: "invalid" });
  expect(await saveRepairMaterials(connect, { ...current, rows: [{ ...current.rows[0], artigo: "OTHER" }] })).toEqual({ kind: "invalid" });
  expect(await saveRepairMaterials(connect, { ...current, rows: [current.rows[0], current.rows[0]] })).toEqual({ kind: "invalid" });
  await database.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=$1', ["CHANGED"]);
  expect(await saveRepairMaterials(connect, current)).toEqual({ kind: "stale" });
});

it("SRC-eb5a859599 rollback covers prior stock restore, inserts, deletes and retained row updates on mid-save failure", async () => {
  const draft = await command(); draft.rows[0].quantidade = "7"; draft.rows.push(payload(newLine())); draft.proofs.push({ code: 7, password: "CaSe' " });
  const before = await snapshot();
  await database.query("CREATE FUNCTION app.material_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$");
  await database.query('CREATE TRIGGER material_test_failure BEFORE INSERT ON app."material_reparacao" FOR EACH ROW EXECUTE FUNCTION app.material_test_failure()');
  try { expect(await saveRepairMaterials(connect, draft)).toEqual({ kind: "failed" }); expect(await snapshot()).toEqual(before); }
  finally { await database.query('DROP TRIGGER material_test_failure ON app."material_reparacao"'); await database.query("DROP FUNCTION app.material_test_failure()"); }
});

it("SRC-eb5a859599 exact negative/NULL quantities and missing/duplicate article stock follow the evidenced formula", async () => {
  await database.query('INSERT INTO app."artigos" ("Codigo","stock") VALUES ($1,500)', [scenario.article]);
  const draft = await command(); draft.rows[0].quantidade = "-0.000000000000000001";
  expect(await saveRepairMaterials(connect, draft)).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "stock"::text FROM app."artigos" ORDER BY _row_id')).rows).toEqual([{ stock: "12.000000000000000001" }, { stock: "500" }]);
  const nullable = await command(); nullable.rows[0].quantidade = null;
  expect(await saveRepairMaterials(connect, nullable)).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "stock" FROM app."artigos" ORDER BY _row_id')).rows[0].stock).toBeNull();
  const orphan = await command(); orphan.rows.push(payload(newLine({ artigo: "missing article", quantidade: "-2" }))); orphan.proofs.push({ code: 7, password: "CaSe' " });
  expect(await saveRepairMaterials(connect, orphan)).toEqual({ kind: "saved" });
  expect((await database.query('SELECT count(*)::text AS count FROM app."material_reparacao" WHERE "artigo"=$1', ["missing article"])).rows[0].count).toBe("1");
});

it("SRC-5b7c9d17d1 order row NOWAIT maps a competing editor lock to the source in-use result", async () => {
  const draft = await command(), blocker = await connect();
  try {
    await blocker.query("BEGIN"); await blocker.query('SELECT 1 FROM app."ordem_reparacao" WHERE _row_id=1 FOR UPDATE');
    expect(await saveRepairMaterials(connect, draft)).toEqual({ kind: "inUse" });
  } finally { await blocker.query("ROLLBACK"); await blocker.end(); }
  expect(await saveRepairMaterials(connect, draft)).toEqual({ kind: "saved" });
});

it("SRC-2a6708ad6f/SRC-26d646dccd actual material-list query preserves source joins, tipo/material flags and mechanic filtering", async () => {
  expect(await listRepairMaterials(connect, { restricted: false })).toMatchObject({ kind: "loaded", timer: "3", orders: [{ numero: scenario.order, marcamodelo: "Marca Modelo" }], mechanics: [{ Codigo: 7 }, { Codigo: 8 }] });
  expect(await listRepairMaterials(connect, { restricted: true, mechanic: 8 })).toMatchObject({ kind: "loaded", orders: [] });
  await database.query('UPDATE app."estados_reparacao" SET "tipo"=8');
  expect(await listRepairMaterials(connect, { restricted: true })).toMatchObject({ kind: "loaded", orders: [] });
  expect(await listRepairMaterials(connect, { restricted: false })).toMatchObject({ kind: "loaded", orders: [{ numero: scenario.order }] });
  await database.query('UPDATE app."estados_reparacao" SET "lancar_material"=FALSE');
  expect(await listRepairMaterials(connect, { restricted: false })).toMatchObject({ kind: "loaded", orders: [] });
});


it("SRC-5b7c9d17d1 read refuses a competing writer before editing, releases successful launch locks and observes current public mechanic changes", async () => {
  const blocker = await connect();
  try {
    await blocker.query("BEGIN"); await blocker.query('SELECT 1 FROM app."ordem_reparacao" WHERE _row_id=1 FOR UPDATE');
    expect(await readRepairMaterials(connect, { orderId: "1" })).toEqual({ kind: "inUse" });
  } finally { await blocker.query("ROLLBACK"); await blocker.end(); }
  expect(await readRepairMaterials(connect, { orderId: "1" })).toMatchObject({ kind: "loaded", document: { numero: scenario.order } });
  const next = await connect();
  try {
    await next.query("BEGIN");
    expect((await next.query('SELECT _row_id FROM app."ordem_reparacao" WHERE _row_id=1 FOR UPDATE NOWAIT')).rowCount).toBe(1);
  } finally { await next.query("ROLLBACK"); await next.end(); }
  await database.query('UPDATE app."mecanicos" SET "Descricao"=$1 WHERE "Codigo"=7', ["Renomeado"]);
  expect(await authenticateRepairMaterialMechanic(connect, { code: 7, password: "" })).toEqual({ kind: "cancelled", mechanic: { Codigo: 7, Descricao: "Renomeado", inativo: false } });
  await database.query('UPDATE app."mecanicos" SET "inativo"=TRUE WHERE "Codigo"=7');
  expect(await authenticateRepairMaterialMechanic(connect, { code: 7, password: "" })).toEqual({ kind: "inactive" });
});
