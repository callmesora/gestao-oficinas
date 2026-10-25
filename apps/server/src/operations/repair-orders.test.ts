import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { setTimeout as delay } from "node:timers/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import { initialiseRepairOrders, listRepairOrders, saveRepairOrderDefaults } from "./repair-orders";
import type { RepairOrderList, RepairOrderListRow } from "../../../../packages/domain/src/repair-orders";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const all: RepairOrderList = { entryStart: "20240228000000", entryEnd: "20240301235959", deliveryStart: "20240228", deliveryEnd: "20240308", priority: 0, mechanic: 0, customer: "", registration: "", states: [] };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  await database.query('TRUNCATE app."ordem_reparacao",app."Clientes",app."Viaturas",app."estados_reparacao",app."mecanicos",app."sistema" RESTART IDENTITY');
});
async function seed() {
  await database.query(`INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao") VALUES (1,1,'RECEPÇÃO'),(2,2,'TERCEIRO');
    INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo") VALUES (1,'AA-00-AA',999,'MERCEDES','SPRINTER');
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor","lancar_defa","lancar_material","confirmacao","pedir_data_entrega","pedir_data_pag") VALUES (1,'R','Em reparação',3,4294967295,true,false,true,false,true);
    INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (1,255,'MECÂNICO','synthetic-only',true)`);
}
type OrderInput = { numero: string; matricula: string | null; recepcao_cliente: string | null; recepcao_terceiro: string | null; recepcao_datahora: string | null; recepcao_entrega_prevista: string | null; reparacao_estado: string | null; recepcao_prioridade: number | null; reparacao_mecanico: number | null };
async function order(patch: Partial<OrderInput> = {}) {
  const values: OrderInput = { numero: "10", matricula: "AA-00-AA", recepcao_cliente: "1", recepcao_terceiro: "2", recepcao_datahora: "20240228235959000", recepcao_entrega_prevista: "20240229", reparacao_estado: "R", recepcao_prioridade: 2, reparacao_mecanico: 255, ...patch };
  const columns = Object.keys(values);
  return (await database.query<{ id: string }>(`INSERT INTO app."ordem_reparacao" (${columns.map(column => `"${column}"`).join(",")}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(",")}) RETURNING _row_id::text AS id`, Object.values(values))).rows[0].id;
}
async function rows(filter: RepairOrderList = all): Promise<RepairOrderListRow[]> {
  const result = await listRepairOrders(connect, filter);
  if (result.kind !== "loaded") throw new Error("Synthetic repair list did not load");
  return result.orders;
}
async function snapshot() { return (await database.query('SELECT to_jsonb(s)::text AS row FROM app."estados_reparacao" s ORDER BY _row_id')).rows; }
async function awaitState(probe: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) { if (await probe()) return; await delay(10); }
  throw new Error(message);
}
async function blocked(pid: number | undefined, locktype: string) {
  return pid !== undefined && (await database.query<{ blocked: boolean }>("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype=$2 AND NOT granted) AS blocked", [pid, locktype])).rows[0].blocked;
}

it("strict repair-list/init/default schemas reject unsupported requests before acquiring a connection", async () => {
  let connections = 0;
  const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  for (const patch of [{ sort: 'numero";--' }, { customer: "18446744073709551616" }, { customer: "1\n" }, { entryEnd: "20240230235959" }, { deliveryStart: "opaque" }, { mechanic: 256 }, { registration: 1 }, { states: [1] }, { extra: true }]) expect(await listRepairOrders(observed, { ...all, ...patch })).toEqual({ kind: "invalid" });
  expect(await initialiseRepairOrders(observed, { credentials: true })).toEqual({ kind: "invalid" });
  expect(await saveRepairOrderDefaults(observed, { states: [{ Codigo: "R", checked: true, Descricao: "stale" }] })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0);
});

it("SRC-9b6239c2c7 initialises first settings, typed state/mechanic browse and public-only projections", async () => {
  await seed();
  await database.query(`INSERT INTO app."sistema" ("Data_inicio","Tempo_ordem_reparacao") VALUES (366,18446744073709551615),(1,1);
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor","lancar_defa") VALUES (2,'X',NULL,1,NULL,NULL);
    INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (2,2,NULL,'second-synthetic',false)`);
  const result = await initialiseRepairOrders(connect, {});
  expect(result).toEqual({ kind: "loaded", settings: { Data_inicio: 366, Tempo_ordem_reparacao: "18446744073709551615" },
    states: [{ id: "2", Codigo: "X", Descricao: null, tipo: 1, Cor: null, lancar_defa: null }, { id: "1", Codigo: "R", Descricao: "Em reparação", tipo: 3, Cor: 4294967295, lancar_defa: true }],
    mechanics: [{ id: "2", Codigo: 2, Descricao: null }, { id: "1", Codigo: 255, Descricao: "MECÂNICO" }] });
  await database.query('CREATE ROLE repair_list_public NOLOGIN; GRANT USAGE ON SCHEMA app TO repair_list_public; GRANT SELECT ON app."sistema",app."estados_reparacao" TO repair_list_public; GRANT SELECT (_row_id,"Codigo","Descricao") ON app."mecanicos" TO repair_list_public');
  try {
    const restricted: DatabaseConnection = async () => { const client = await connect(); await client.query("SET ROLE repair_list_public"); return client; };
    expect(await initialiseRepairOrders(restricted, {})).toEqual(result);
  } finally { await database.query("DROP OWNED BY repair_list_public; DROP ROLE repair_list_public"); }
  await database.query('DELETE FROM app."sistema"');
  expect(await initialiseRepairOrders(connect, {})).toMatchObject({ kind: "loaded", settings: { Data_inicio: null, Tempo_ordem_reparacao: null } });
});

it("SRC-a2f17b1885 uses the order reception customer, preserves four joined duplicates and omits only inner orphans", async () => {
  await seed(); const id = await order();
  await database.query(`INSERT INTO app."Viaturas" ("ViaturasID","matricula","marca","modelo") VALUES (2,'AA-00-AA',NULL,'SECOND');
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor") VALUES (2,'R','DUPLICATE',3,255)`);
  await order({ numero: "11", recepcao_cliente: "999" });
  await order({ numero: "12", matricula: "MISSING" });
  await order({ numero: "13", reparacao_estado: "BAD" });
  const result = await rows();
  expect(result).toHaveLength(4); expect(new Set(result.map(row => row.id)).size).toBe(4);
  expect(result.every(row => row.orderId === id && row.numero === "10" && row.Descricao_Cliente === "RECEPÇÃO" && row.Descricao_Terceiro === "TERCEIRO")).toBe(true);
  expect(result.map(row => row.marcamodelo)).toEqual(["MERCEDES SPRINTER", "MERCEDES SPRINTER", null, null]);
  expect(result.every(row => row.recepcao_datahora === "20240228235959000" && row.recepcao_entrega_prevista === "20240229")).toBe(true);
  await order({ numero: "14", reparacao_mecanico: 254, recepcao_terceiro: "999" });
  expect((await rows()).filter(row => row.numero === "14").every(row => row.Descricao_me === null && row.Descricao_Terceiro === null)).toBe(true);
  expect((await rows()).filter(row => row.numero === "14")).toHaveLength(4);
});

it("SRC-a2f17b1885 retains optional priority/mechanic/client-or-thirdparty/checked-state filters and literal LIKE wildcards", async () => {
  await seed(); await order();
  await database.query(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao") VALUES (2,'X','Other')`);
  await order({ numero: "2", recepcao_cliente: "2", recepcao_terceiro: "1", recepcao_prioridade: 1, reparacao_mecanico: 0, reparacao_estado: "X" });
  expect((await rows()).map(row => row.numero)).toEqual(["10", "2"]);
  expect((await rows({ ...all, priority: 1 })).map(row => row.numero)).toEqual(["2"]);
  expect((await rows({ ...all, mechanic: 255 })).map(row => row.numero)).toEqual(["10"]);
  for (const customer of ["", "0", "1", "2"]) expect(await rows({ ...all, customer })).toHaveLength(2);
  expect(await rows({ ...all, customer: "18446744073709551615" })).toEqual([]);
  expect((await rows({ ...all, states: ["X"] })).map(row => row.numero)).toEqual(["2"]);
  expect(await rows({ ...all, states: ["R", "X"] })).toHaveLength(2);
  // ADR-006/U05: checked NULL is a nonmatching SQL alternative, distinct from no checked states.
  expect(await rows({ ...all, states: [null] })).toEqual([]);
  expect((await rows({ ...all, states: [null, "R"] })).map(row => row.numero)).toEqual(["10"]);
  for (const registration of ["mercedes", "aa-00", "MERC%SPR", "_", "%"]) expect(await rows({ ...all, registration })).toHaveLength(2);
  expect(await rows({ ...all, registration: "' OR 1=1--" })).toEqual([]);
  expect(await rows({ ...all, priority: 1, mechanic: 255 })).toEqual([]);
});

it("ADR-002 applies all four inclusive bounds to compact14/17/spaced23 with exact milliseconds, NULL and opaque fallback", async () => {
  await seed();
  const fixtures = [
    ["1", "20240228000000000", "20240228"], ["2", "20240301235959000", "20240308"], ["3", "2024-03-01 23:59:59.000", "2024-03-08"],
    ["4", "20240301235959001", "20240308"], ["5", "20240227235959999", "20240308"], ["6", "20240228120000", "20240227"], ["7", "20240228120000", "20240309"],
    ["8", null, "20240301"], ["9", "20240228120000", null], ["10", "", ""], ["11", "00000000000000000", "00000000"], ["12", "20240228120000?", "20240301"],
  ] as const;
  for (const [numero, recepcao_datahora, recepcao_entrega_prevista] of fixtures) await order({ numero, recepcao_datahora, recepcao_entrega_prevista });
  expect((await rows()).map(row => row.numero)).toEqual(["12", "3", "2", "1"]);
  expect((await rows()).find(row => row.numero === "3")).toMatchObject({ recepcao_datahora: "2024-03-01 23:59:59.000", recepcao_entrega_prevista: "2024-03-08" });
  expect((await rows({ ...all, entryStart: "", entryEnd: "", deliveryStart: "", deliveryEnd: "" })).map(row => row.numero)).toEqual(["10"]);
  expect((await rows({ ...all, entryStart: "00000000000000", entryEnd: "00000000000000", deliveryStart: "00000000", deliveryEnd: "00000000" })).map(row => row.numero)).toEqual(["11"]);
});

it("SRC-b1f760ae86 reads complete picker-assigned registrations and uppercase expansions through the actual API", async () => {
  await seed();
  const longPlate = "A'PROGRAMMATIC-LONG-PLATE", expanded = "SS".repeat(15);
  await database.query('INSERT INTO app."Viaturas" ("ViaturasID","matricula","marca","modelo") VALUES (2,$1,$2,$3),(3,$4,$2,$3)', [longPlate, "SYNTHETIC", "MODEL", expanded]);
  await order({ numero: "1", matricula: longPlate }); await order({ numero: "2", matricula: expanded });
  const app = createApp({ repairOrderConnect: connect, authenticate: async () => ({ userId: "synthetic-picker-read" }) });
  try {
    const selected = await app.inject({ method: "POST", url: "/api/repair-orders/list", payload: { ...all, registration: longPlate } });
    expect(selected.statusCode).toBe(200);
    expect(selected.json()).toMatchObject({ kind: "loaded", orders: [{ numero: "1", matricula: longPlate }] });
    expect(selected.json().orders).toHaveLength(1);
    const uppercase = await app.inject({ method: "POST", url: "/api/repair-orders/list", payload: { ...all, registration: "ß".repeat(15) } });
    expect(uppercase.statusCode).toBe(200);
    expect(uppercase.json()).toMatchObject({ kind: "loaded", orders: [{ numero: "2", matricula: expanded }] });
    expect(uppercase.json().orders).toHaveLength(1);
  } finally { await app.close(); }
});

it("ADR-012 orders numeric source numero before transport and manual dates by comparison keys with displayed priority/typed color", async () => {
  await seed();
  for (const [numero, entry, delivery, priority] of [["2", "20240301000000", "20240301", 1], ["10", "2024-02-29 00:00:00.000", "2024-03-02", 2], ["9007199254740992", "20240228000000000", "20240303", 3], ["9007199254740993", "20240228000000001", "20240304", null], ["18446744073709551615", "20240228120000", "20240305", 255]] as const) await order({ numero, recepcao_datahora: entry, recepcao_entrega_prevista: delivery, recepcao_prioridade: priority });
  expect((await rows()).map(row => row.numero)).toEqual(["18446744073709551615", "9007199254740993", "9007199254740992", "10", "2"]);
  expect((await rows({ ...all, sort: "numero" })).map(row => row.numero)).toEqual(["2", "10", "9007199254740992", "9007199254740993", "18446744073709551615"]);
  const chronology = ["9007199254740992", "9007199254740993", "18446744073709551615", "10", "2"];
  expect((await rows({ ...all, sort: "recepcao_datahora" })).map(row => row.numero)).toEqual(chronology);
  expect((await rows({ ...all, sort: "recepcao_datahora", descending: true })).map(row => row.numero)).toEqual([...chronology].reverse());
  expect((await rows({ ...all, sort: "recepcao_entrega_prevista" })).map(row => row.numero)).toEqual(["2", "10", "9007199254740992", "9007199254740993", "18446744073709551615"]);
  expect((await rows({ ...all, sort: "recepcao_prioridade" })).map(row => row.numero)).toEqual(["18446744073709551615", "10", "2", "9007199254740992", "9007199254740993"]);
  await database.query(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Cor") VALUES (2,'X',2),(3,'Y',10)`);
  await order({ numero: "20", reparacao_estado: "X" }); await order({ numero: "21", reparacao_estado: "Y" });
  expect((await rows({ ...all, sort: "Cor" })).slice(0, 2).map(row => row.Cor)).toEqual([2, 10]);
});

it("SRC-974f184730 writes only current first-match flags, preserves NULL/provenance and skips vanished/NULL codes", async () => {
  await seed();
  const run = "00000000-0000-4000-8000-000000000024";
  await database.query('INSERT INTO import_audit.runs (id,source_sha256,mapping_version) VALUES ($1,$2,1)', [run, "a".repeat(64)]);
  await database.query(`UPDATE app."estados_reparacao" SET _import_id=$1,_source_row=42,"Descricao"='CURRENT',"confirmacao"=false WHERE "Codigo"='R'`, [run]);
  await database.query(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","lancar_defa") VALUES (2,'R',true),(3,'N',NULL),(4,NULL,true)`);
  const before = await snapshot();
  expect(await saveRepairOrderDefaults(connect, { states: [{ Codigo: "R", checked: false }, { Codigo: "N", checked: null }, { Codigo: "M", checked: true }, { Codigo: null, checked: false }] })).toEqual({ kind: "saved" });
  const after = await snapshot();
  expect(after.slice(1)).toEqual(before.slice(1));
  const previous = JSON.parse(before[0].row), current = JSON.parse(after[0].row);
  expect(current).toEqual({ ...previous, lancar_defa: false });
  expect(await saveRepairOrderDefaults(connect, { states: [{ Codigo: "R", checked: true }, { Codigo: "R", checked: false }] })).toEqual({ kind: "saved" });
  expect(await snapshot()).toEqual(after);
});

it("ADR-006 flag-only save waits for a current state writer without overwriting its other changes", async () => {
  await seed(); const writer = await connect(); let pid: number | undefined, pending: ReturnType<typeof saveRepairOrderDefaults> | undefined;
  try {
    await writer.query("BEGIN");
    await writer.query('LOCK TABLE app."estados_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    await writer.query(`UPDATE app."estados_reparacao" SET "Descricao"='CONCURRENT',"pedir_data_pag"=false WHERE "Codigo"='R'`);
    pending = saveRepairOrderDefaults(async () => { const client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; }, { states: [{ Codigo: "R", checked: false }] });
    await awaitState(() => blocked(pid, "relation"), "Default save never waited for the real state writer");
    await writer.query("COMMIT");
    expect(await pending).toEqual({ kind: "saved" });
    expect((await database.query('SELECT "Descricao","pedir_data_pag","lancar_defa" FROM app."estados_reparacao" WHERE "Codigo"=$1', ["R"])).rows).toEqual([{ Descricao: "CONCURRENT", pedir_data_pag: false, lancar_defa: false }]);
  } finally {
    await writer.query("ROLLBACK");
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await pending; await writer.end();
  }
}, 30000);

it("ADR-006 failure AFTER a second flag write rolls back every flag and dependent effect", async () => {
  await seed(); await database.query(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","lancar_defa") VALUES (2,'X',true)`);
  const before = await snapshot();
  await database.query(`CREATE TABLE public.repair_defaults_effects (code text);
    CREATE FUNCTION public.reject_repair_defaults() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.repair_defaults_effects VALUES (NEW."Codigo"); IF NEW."Codigo"='X' THEN RAISE EXCEPTION 'synthetic failure'; END IF; RETURN NULL; END $$;
    CREATE TRIGGER reject_repair_defaults AFTER UPDATE ON app."estados_reparacao" FOR EACH ROW EXECUTE FUNCTION public.reject_repair_defaults()`);
  try { expect(await saveRepairOrderDefaults(connect, { states: [{ Codigo: "R", checked: false }, { Codigo: "X", checked: false }] })).toEqual({ kind: "failed" }); }
  finally { await database.query('DROP TRIGGER reject_repair_defaults ON app."estados_reparacao"'); }
  expect(await snapshot()).toEqual(before); expect((await database.query("SELECT * FROM public.repair_defaults_effects")).rows).toEqual([]);
});

it("C3 actual API connection loss after a default write rolls back flag/effects and resolves typed failed", async () => {
  await seed(); const before = await snapshot(), gate = 732024;
  let pid: number | undefined, client: Client | undefined, done = false, pending: Promise<unknown> | undefined;
  const observed: DatabaseConnection = async () => { client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
  const app = createApp({ repairOrderConnect: observed, authenticate: async () => ({ userId: "synthetic" }) });
  await database.query(`CREATE TABLE public.repair_defaults_loss_effects (code text);
    CREATE FUNCTION public.repair_defaults_after_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.repair_defaults_loss_effects VALUES (NEW."Codigo"); PERFORM pg_advisory_xact_lock(${gate}::bigint); RETURN NULL; END $$;
    CREATE TRIGGER repair_defaults_loss_gate AFTER UPDATE ON app."estados_reparacao" FOR EACH ROW EXECUTE FUNCTION public.repair_defaults_after_write()`);
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gate]);
  try {
    pending = app.inject({ method: "POST", url: "/api/repair-orders/save-defaults", payload: { states: [{ Codigo: "R", checked: false }] } }).then(reply => { done = true; return { status: reply.statusCode, body: reply.json() }; }, () => { done = true; return { kind: "rejected" }; });
    await awaitState(async () => { if (done) throw new Error("Default API completed before its AFTER-write barrier"); return blocked(pid, "advisory"); }, "Default API never reached its AFTER-write barrier");
    await database.query("SELECT pg_terminate_backend($1)", [pid]);
    await awaitState(async () => done, "Disconnected default API did not settle");
    expect(await pending).toEqual({ status: 200, body: { kind: "failed" } });
    expect(await snapshot()).toEqual(before); expect((await database.query("SELECT * FROM public.repair_defaults_loss_effects")).rows).toEqual([]);
  } finally {
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gate]); await pending; await client?.end();
    await database.query('DROP TRIGGER repair_defaults_loss_gate ON app."estados_reparacao"'); await app.close();
  }
}, 30000);

it("all repair operations classify refused/ended connections as failed without inventing business messages", async () => {
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_repair_orders_database");
  const ended: DatabaseConnection = async () => { const client = await connect(); await client.end(); return client; };
  for (const connection of [unavailable, ended]) {
    expect(await initialiseRepairOrders(connection, {})).toEqual({ kind: "failed" });
    expect(await listRepairOrders(connection, all)).toEqual({ kind: "failed" });
    expect(await saveRepairOrderDefaults(connection, { states: [] })).toEqual({ kind: "failed" });
  }
});

it.each([
  { name: "initialise", table: 'app."sistema"', input: {}, operation: initialiseRepairOrders },
  { name: "list", table: 'app."ordem_reparacao"', input: all, operation: listRepairOrders },
])("C3 pending real $name read resolves failed after disconnection without mutating source rows", async test => {
  await seed(); await order(); const before = await snapshot();
  let pid: number | undefined, client: Client | undefined, done = false, pending: Promise<unknown> | undefined;
  const observed: DatabaseConnection = async () => { client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
  await database.query("BEGIN");
  await database.query(`LOCK TABLE ${test.table} IN ACCESS EXCLUSIVE MODE`);
  try {
    pending = test.operation(observed, test.input).then(value => { done = true; return value; }, () => { done = true; return { kind: "rejected" }; });
    await awaitState(async () => { if (done) throw new Error("Read completed before the real table lock"); return blocked(pid, "relation"); }, "Repair read never reached its real table lock");
    await database.query("SELECT pg_terminate_backend($1)", [pid]);
    await awaitState(async () => done, "Disconnected repair read did not settle");
    expect(await pending).toEqual({ kind: "failed" });
  } finally {
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("ROLLBACK"); await pending; await client?.end();
  }
  expect(await snapshot()).toEqual(before);
}, 30000);

it("ADR-004 protected actual routes authenticate before acquisition and dispatch all three real operations", async () => {
  let connections = 0; const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  const denied = createApp({ repairOrderConnect: observed });
  try { for (const action of ["initialise", "list", "save-defaults"]) expect((await denied.inject({ method: "POST", url: `/api/repair-orders/${action}`, payload: {} })).statusCode).toBe(401); }
  finally { await denied.close(); }
  expect(connections).toBe(0);
  const unavailable = createApp({ authenticate: async () => ({ userId: "synthetic" }) });
  try { for (const action of ["initialise", "list", "save-defaults"]) expect((await unavailable.inject({ method: "POST", url: `/api/repair-orders/${action}`, payload: {} })).statusCode).toBe(503); }
  finally { await unavailable.close(); }
  await seed(); await order();
  const allowed = createApp({ repairOrderConnect: observed, authenticate: async () => ({ userId: "synthetic" }) });
  try {
    expect((await allowed.inject({ method: "POST", url: "/api/repair-orders/initialise", payload: {} })).json()).toMatchObject({ kind: "loaded", mechanics: [{ Codigo: 255, Descricao: "MECÂNICO" }] });
    expect((await allowed.inject({ method: "POST", url: "/api/repair-orders/list", payload: all })).json()).toEqual({ kind: "loaded", orders: await rows() });
    expect((await allowed.inject({ method: "POST", url: "/api/repair-orders/save-defaults", payload: { states: [{ Codigo: "R", checked: false }] } })).json()).toEqual({ kind: "saved" });
    expect((await database.query('SELECT "lancar_defa" FROM app."estados_reparacao" WHERE "Codigo"=$1', ["R"])).rows).toEqual([{ lancar_defa: false }]);
  } finally { await allowed.close(); }
});
