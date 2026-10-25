import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { createApp } from "../app";
import { authenticateRepairLabor, initialiseRepairLabor, listRepairLabor, prepareRepairLabor, readRepairLabor, saveRepairLaborMaterials, saveRepairLaborState, tickRepairLabor, toggleRepairLabor } from "./repair-labor";
import type { RepairLaborProof } from "../../../../packages/domain/src/repair-labor";
import { OPEN_LABOR_FINISH } from "../../../../packages/domain/src/repair-labor-time";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const now = "20261025120000000", proof: RepairLaborProof = { mechanic: 2, password: "Synthetique ' only" };
beforeAll(async () => { server = await startIsolatedPostgres(); database = await server.database(); await migrate(database); const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => server.connect(name); }, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => { await database.query('TRUNCATE app."tempos_reparacao",app."material_reparacao",app."ordem_reparacao",app."Clientes",app."Viaturas",app."estados_reparacao",app."mecanicos",app."sistema" RESTART IDENTITY'); });
async function seed() {
  await database.query('INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (1,2,\'Mecânico\',$1,true)', [proof.password]);
  await database.query(`INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'Cliente Açores');
    INSERT INTO app."Viaturas" ("ViaturasID","matricula","marca","modelo") VALUES (1,'AA-00-AA','MARCA','MODELO');
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor") VALUES (1,'E','Espera',2,255),(2,'R','Reparação',3,65280),(3,'F','Finalizada',6,16711680),(4,'X','Alternativa',4,0);
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_mecanico","reparacao_estado","reparacao_estado_historico","reparacao_servico","recepcao_servico","recepcao_obs","recepacao_contatos") VALUES (1,9007199254740993,'AA-00-AA',1,2,'R','','Serviço','Recepção','Observação','Contactos');
    INSERT INTO app."sistema" ("Tempo_tempos","encerrar_tempos1","encerrar_tempos2") VALUES (10,'120000','180000')`);
}
const numero = "9007199254740993";
async function labor(id: string, number = numero, finish: string | null = OPEN_LABOR_FINISH, inicio = "20261025100000000", startState = "R") {
  return (await database.query<{ id: string }>('INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim","Inicio_reparacao_estado","fim_reparacao_estado") VALUES ($1,$2,2,$3,$4,$5,\'\') RETURNING _row_id::text AS id', [id, number, inicio, finish, startState])).rows[0].id;
}
async function snapshot() { return (await database.query('SELECT to_jsonb(t)::text AS row FROM app."tempos_reparacao" t ORDER BY _row_id')).rows; }
async function plan() { const result = await prepareRepairLabor(connect, { numero, proof }); if (result.kind !== "prepared") throw new Error(result.kind); return result; }
async function read() { const result = await readRepairLabor(connect, { numero }); if (result.kind !== "loaded") throw new Error(result.kind); return result; }

it("rejects invalid shapes and untrusted unauthenticated API calls before a database connection", async () => {
  let count = 0; const observed: DatabaseConnection = async () => { count++; return connect(); };
  expect(await toggleRepairLabor(observed, { numero, proof, now: "opaque", baseline: "", closeOthers: [], state: null })).toEqual({ kind: "invalid" });
  expect(await listRepairLabor(observed, { mechanic: 256, states: [] })).toEqual({ kind: "invalid" });
  expect(await initialiseRepairLabor(observed, { now, credentials: true })).toEqual({ kind: "invalid" });
  const app = createApp({ repairLaborConnect: observed });
  try { expect((await app.inject({ method: "POST", url: "/api/repair-labor/toggle", payload: {} })).statusCode).toBe(401); } finally { await app.close(); }
  expect(count).toBe(0);
});
it("keeps password comparison server-only, exact case and empty denial, without an invented inactive rule", async () => {
  await seed();
  expect(await authenticateRepairLabor(connect, proof)).toEqual({ kind: "authenticated", mechanic: { id: "1", Codigo: 2, Descricao: "Mecânico" } });
  expect(await authenticateRepairLabor(connect, { ...proof, password: proof.password.toUpperCase() })).toEqual({ kind: "denied" });
  expect(await authenticateRepairLabor(connect, { ...proof, password: "" })).toEqual({ kind: "denied" });
  const app = createApp({ repairLaborConnect: connect, authenticate: async () => ({ userId: "synthetic" }) });
  try {
    const response = await app.inject({ method: "POST", url: "/api/repair-labor/authenticate", payload: proof });
    expect(response.headers["cache-control"]).toBe("no-store"); expect(response.body).not.toContain(proof.password); expect(response.body).not.toContain("palavra_passe");
  } finally { await app.close(); }
});
it("uses actual source joins, typed numero ordering and none-selected-unrestricted filters", async () => {
  await seed();
  await database.query('INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","reparacao_estado","reparacao_mecanico") VALUES (2,10,\'AA-00-AA\',\'R\',2),(3,2,\'AA-00-AA\',\'R\',2),(4,1,\'ORPHAN\',\'R\',2)');
  const result = await listRepairLabor(connect, { mechanic: null, states: [] });
  expect(result.kind).toBe("loaded"); if (result.kind !== "loaded") return;
  expect(result.orders.map(row => row.numero)).toEqual(["2", "10", numero]);
  expect(await listRepairLabor(connect, { mechanic: null, states: [null] })).toEqual({ kind: "loaded", orders: [] });
  expect(await listRepairLabor(connect, { mechanic: 3, states: [] })).toEqual({ kind: "loaded", orders: [] });
});
it("chooses latest source labor ID rather than start date, preserving literal zero17 and NULL distinctions", async () => {
  await seed(); await labor("9007199254740993", numero, OPEN_LABOR_FINISH, "20261025080000000"); await labor("2", numero, "20261025115900000", "20261025110000000");
  expect(await plan()).toMatchObject({ finish: true });
  const prepared = await plan(); expect(await toggleRepairLabor(connect, { numero, proof, now, baseline: prepared.baseline, closeOthers: [], state: null })).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "fim" FROM app."tempos_reparacao" WHERE "tempos_reparacaoID"=9007199254740993')).rows[0].fim).toBe(now);
  await labor("9007199254740994", numero, null);
  expect(await plan()).toMatchObject({ finish: false });
});
it("starts with source old state buffer after actual type3/4/5 picker selection", async () => {
  await seed(); await database.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=\'E\'');
  const prepared = await plan(), loaded = await read();
  const chosen = loaded.choices.find(row => row.Codigo === "X")!;
  expect(prepared.stateAllowed).toBe(false);
  expect(await toggleRepairLabor(connect, { numero, proof, now, baseline: prepared.baseline, closeOthers: [], state: chosen.id })).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "reparacao_estado" FROM app."ordem_reparacao"')).rows[0].reparacao_estado).toBe("X");
  expect((await database.query('SELECT "inicio","fim","Inicio_reparacao_estado" FROM app."tempos_reparacao"')).rows).toEqual([{ inicio: now, fim: OPEN_LABOR_FINISH, Inicio_reparacao_estado: "E" }]);
});
it("asks about other orders without enforcing same-mechanic exclusivity and closes only affirmative candidates", async () => {
  await seed(); await database.query('INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","reparacao_estado") VALUES (2,20,\'OTHER\',\'X\'),(3,21,\'KEEP\',\'R\')');
  await labor("1", "20"); await labor("2", "21");
  const prepared = await plan(); expect(prepared.others.map(row => row.numero)).toEqual(["20", "21"]);
  expect(await toggleRepairLabor(connect, { numero, proof, now, baseline: prepared.baseline, closeOthers: ["20"], state: null })).toEqual({ kind: "saved" });
  const rows = (await database.query('SELECT "numero"::text,"fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY "numero"')).rows;
  expect(rows[0]).toEqual({ numero: "20", fim: now, fim_reparacao_estado: "X" }); expect(rows[1].fim).toBe(OPEN_LABOR_FINISH); expect(rows[2].fim).toBe(OPEN_LABOR_FINISH);
});
it("rechecks password and every prepared baseline after dialogs with no partial closes or writes", async () => {
  await seed(); const prepared = await plan(), before = await snapshot();
  await database.query('UPDATE app."mecanicos" SET "palavra_passe"=\'changed\'');
  expect(await toggleRepairLabor(connect, { numero, proof, now, baseline: prepared.baseline, closeOthers: [], state: null })).toEqual({ kind: "denied" });
  expect(await snapshot()).toEqual(before);
  await database.query('UPDATE app."mecanicos" SET "palavra_passe"=$1', [proof.password]);
  await database.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=\'X\'');
  expect(await toggleRepairLabor(connect, { numero, proof, now, baseline: prepared.baseline, closeOthers: [], state: null })).toEqual({ kind: "stale" });
  expect(await snapshot()).toEqual(before);
});
it("state save appends exact cached history and closes all zero17 running rows only for type6/7", async () => {
  await seed(); await labor("1"); await labor("2", numero, ""); await labor("3", numero, null);
  const loaded = await read(), state = loaded.choices.find(row => row.Codigo === "F")!;
  expect(await saveRepairLaborState(connect, { numero, baseline: loaded.baseline, stateId: state.id, when: "20261025123456789", description: "Feito ' sem normalização ", service: "Serviço\r\n2", now })).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "reparacao_estado_historico","reparacao_servico" FROM app."ordem_reparacao"')).rows[0]).toEqual({ reparacao_estado_historico: "25/10/2026 12:34    Finalizada\r\nFeito ' sem normalização ", reparacao_servico: "Serviço\r\n2" });
  expect((await database.query('SELECT "fim" FROM app."tempos_reparacao" ORDER BY _row_id')).rows.map(row => row.fim)).toEqual([now, "", null]);
});
it("changed state choices/history invalidate a stale state action and unsupported datetime arithmetic writes nothing", async () => {
  await seed(); const loaded = await read(), state = loaded.choices.find(row => row.Codigo === "F")!;
  await database.query('UPDATE app."estados_reparacao" SET "Descricao"=\'new\' WHERE "Codigo"=\'F\'');
  expect(await saveRepairLaborState(connect, { numero, baseline: loaded.baseline, stateId: state.id, when: now, description: "", service: "", now })).toEqual({ kind: "stale" });
  const next = await read();
  expect(await saveRepairLaborState(connect, { numero, baseline: next.baseline, stateId: state.id, when: "", description: "", service: "", now })).toEqual({ kind: "unsupported" });
  expect((await database.query('SELECT "reparacao_estado" FROM app."ordem_reparacao"')).rows[0].reparacao_estado).toBe("R");
});
it("startup closes prior-day open labor at that start day plus configured second closure and start state", async () => {
  await seed(); await labor("1", numero, OPEN_LABOR_FINISH, "20261024090000000", "X"); await labor("2", numero, OPEN_LABOR_FINISH, "20261025110000000", "R");
  expect(await initialiseRepairLabor(connect, { now })).toMatchObject({ kind: "loaded", settings: { Tempo_tempos: "10" } });
  // Source first update predicate includes all open rows for number/mechanic, including current-day second row.
  expect((await database.query('SELECT "fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual([{ fim: "20261024180000000", fim_reparacao_estado: "X" }, { fim: "20261024180000000", fim_reparacao_estado: "X" }]);
});
it("periodic closure retains the visible-order state bug across another order and rejects fabricated visible state", async () => {
  await seed(); await database.query('INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","reparacao_estado") VALUES (2,20,\'OTHER\',\'X\')'); await labor("1", "20");
  expect(await tickRepairLabor(connect, { now, visible: [{ numero, mechanic: 2, state: "fabricated" }] })).toEqual({ kind: "stale" });
  expect(await tickRepairLabor(connect, { now, visible: [{ numero, mechanic: 2, state: "R" }] })).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "fim","fim_reparacao_estado" FROM app."tempos_reparacao"')).rows[0]).toEqual({ fim: now, fim_reparacao_estado: "R" });
});
it("combined material Sair uses exact duplicate predicate, nullable retention and rolls every row back on failure", async () => {
  await seed(); await database.query(`INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","artigo","data_hora","quantidade","preco","lancado","extra") VALUES (1,$1,'A','20261025110000000',1,2,false,false),(2,$1,'A','20261025110000000',1,3,false,false),(3,$1,'B','20261025120000000',1,NULL,NULL,NULL)`, [numero]);
  const loaded = await read(), rows = loaded.materials.map((row, index) => ({ id: row.id, preco: index === 0 ? "9.123456789" : row.preco, extra: row.extra, lancado: true }));
  expect(await saveRepairLaborMaterials(connect, { numero, baseline: loaded.materialBaseline, rows })).toEqual({ kind: "saved" });
  // Last memory row overwrites every duplicate under the original numero+artigo+data_hora predicate.
  expect((await database.query('SELECT "preco"::text,"lancado","extra" FROM app."material_reparacao" ORDER BY _row_id')).rows).toEqual([{ preco: "3", lancado: true, extra: false }, { preco: "3", lancado: true, extra: false }, { preco: null, lancado: true, extra: null }]);
  const before = (await database.query('SELECT to_jsonb(m)::text AS row FROM app."material_reparacao" m ORDER BY _row_id')).rows;
  await database.query(`CREATE FUNCTION app.fail_labor_material() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."artigo"='B' THEN RAISE EXCEPTION 'synthetic'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_labor_material BEFORE UPDATE ON app."material_reparacao" FOR EACH ROW EXECUTE FUNCTION app.fail_labor_material()`);
  try {
    const next = await read(); expect(await saveRepairLaborMaterials(connect, { numero, baseline: next.materialBaseline, rows: next.materials.map(row => ({ id: row.id, preco: "10", extra: true, lancado: false })) })).toEqual({ kind: "failed" });
    expect((await database.query('SELECT to_jsonb(m)::text AS row FROM app."material_reparacao" m ORDER BY _row_id')).rows).toEqual(before);
  } finally { await database.query('DROP TRIGGER fail_labor_material ON app."material_reparacao"; DROP FUNCTION app.fail_labor_material()'); }
});
it("rolls other-order closes and a state change back if the final labor insert fails", async () => {
  await seed(); await database.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=\'E\'; INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","reparacao_estado") VALUES (2,20,\'OTHER\',\'R\')'); await labor("1", "20");
  const prepared = await plan(), loaded = await read(), before = await snapshot();
  await database.query(`CREATE FUNCTION app.fail_labor_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic'; END $$; CREATE TRIGGER fail_labor_insert BEFORE INSERT ON app."tempos_reparacao" FOR EACH ROW EXECUTE FUNCTION app.fail_labor_insert()`);
  try {
    expect(await toggleRepairLabor(connect, { numero, proof, now, baseline: prepared.baseline, closeOthers: ["20"], state: loaded.choices.find(row => row.Codigo === "R")!.id })).toEqual({ kind: "failed" });
    expect(await snapshot()).toEqual(before);
    expect((await database.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=$1', [numero])).rows[0].reparacao_estado).toBe("E");
  } finally { await database.query('DROP TRIGGER fail_labor_insert ON app."tempos_reparacao"; DROP FUNCTION app.fail_labor_insert()'); }
});
it("returns typed in-use immediately for an incompatible actual transaction lock without retaining locks", async () => {
  await seed(); const prepared = await plan(), blocker = await connect();
  try {
    await blocker.query('BEGIN; LOCK TABLE app."tempos_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    expect(await toggleRepairLabor(connect, { numero, proof, now, baseline: prepared.baseline, closeOthers: [], state: null })).toEqual({ kind: "in_use" });
  } finally { await blocker.query("ROLLBACK"); await blocker.end(); }
  expect(await toggleRepairLabor(connect, { numero, proof, now, baseline: prepared.baseline, closeOthers: [], state: null })).toEqual({ kind: "saved" });
});
