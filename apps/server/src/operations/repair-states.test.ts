import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import type { RepairStateValues } from "../../../../packages/domain/src/repair-states";
import { checkRepairStateDelete, deleteRepairState, listRepairStates, saveRepairState } from "./repair-states";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const initial: RepairStateValues = { Codigo: "A", Descricao: "", tipo: 1, Cor: 0, lancar_defa: false, lancar_material: false, confirmacao: false, pedir_data_entrega: false, pedir_data_pag: false };
const associated = { kind: "associated", message: "Estado de reparação associado a ordens de reparação, não pode ser eliminado" };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  // Only this newly created scratch database; no original records are imported.
  await database.query('TRUNCATE app."estados_reparacao",app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY');
});

async function create(values: RepairStateValues = initial) {
  const result = await saveRepairState(connect, { mode: "create", values });
  if (result.kind !== "saved") throw new Error("Synthetic repair-state setup failed");
  return result.repairState;
}
async function snapshot() {
  return (await database.query('SELECT to_jsonb(s) AS row FROM app."estados_reparacao" s ORDER BY _row_id')).rows;
}
async function awaitState(probe: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) { if (await probe()) return; await delay(10); }
  throw new Error(message);
}

it("SRC-01a3c75d73 validates before connecting and permits only optional nullable source fields", async () => {
  let connections = 0;
  const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  expect(await saveRepairState(observed, { mode: "create", values: { ...initial, Codigo: "" } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  const invalid = [{ ...initial, Codigo: "LONG" }, { ...initial, Descricao: "x".repeat(51) }, { ...initial, tipo: 256 }, { ...initial, Cor: 4294967296 }, { ...initial, Cor: "0" }, { ...initial, lancar_defa: 1 }, { ...initial, pedir_data_pag: "false" }, { ...initial, estados_reparacaoID: "1" }];
  for (const values of invalid) expect(await saveRepairState(observed, { mode: "create", values })).toEqual({ kind: "invalid" });
  expect(await saveRepairState(observed, { mode: "create", values: initial, _source_row: "1" })).toEqual({ kind: "invalid" });
  expect(await saveRepairState(observed, { mode: "update", id: "9223372036854775808", values: initial })).toEqual({ kind: "invalid" });
  expect(await listRepairStates(observed, { sort: "Cor" })).toEqual({ kind: "invalid" });
  expect(await checkRepairStateDelete(observed, { id: "1 OR 1=1" })).toEqual({ kind: "invalid" });
  expect(await deleteRepairState(observed, { id: 1 })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0);
  expect(await snapshot()).toEqual([]);
});

it("SRC-01a3c75d73 retains exact text, optional description, source values and immutable existing code", async () => {
  const values = { ...initial, Codigo: "a' ", Descricao: "d'Água  ", tipo: 255, Cor: 4294967295, lancar_defa: null, lancar_material: true, confirmacao: null, pedir_data_entrega: false, pedir_data_pag: true };
  const saved = await create(values);
  expect(saved).toEqual({ ...values, id: "1", estados_reparacaoID: "1" });
  expect(await saveRepairState(connect, { mode: "update", id: saved.id, values: { ...values, Codigo: "A" } })).toEqual({ kind: "codeLocked" });
  expect(await saveRepairState(connect, { mode: "update", id: saved.id, values: { ...values, Descricao: null, Cor: null, tipo: 0 } })).toEqual({ kind: "saved", repairState: { ...saved, Descricao: null, Cor: null, tipo: 0 } });
  expect(await saveRepairState(connect, { mode: "create", values })).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: a' " });
  // Exact case/spacing/text zero remain permitted under ADR-011; no trimming/uppercasing.
  for (const Codigo of ["A' ", " ", "0"]) expect(await saveRepairState(connect, { mode: "create", values: { ...initial, Codigo, Descricao: null } })).toMatchObject({ kind: "saved", repairState: { Codigo, Descricao: null } });
});

it("ADR-002 ADR-011 preserves imported NULLs, duplicate codes, large identity and provenance on selected writes", async () => {
  const runId = "00000000-0000-4000-8000-000000000015";
  await database.query('INSERT INTO import_audit.runs (id,source_sha256,mapping_version) VALUES ($1,$2,1)', [runId, "b".repeat(64)]);
  const imported = await database.query<{ id: string }>('INSERT INTO app."estados_reparacao" (_import_id,_source_row,"estados_reparacaoID","Codigo","Descricao","tipo","Cor") VALUES ($1,42,9007199254740993,$2,NULL,255,4294967295),(NULL,NULL,9007199254740994,$2,$3,NULL,NULL),(NULL,NULL,NULL,NULL,NULL,NULL,NULL) RETURNING _row_id::text AS id', [runId, "DUP", "Untouched  "]);
  const list = await listRepairStates(connect, {});
  if (list.kind !== "loaded") throw new Error("Synthetic list failed");
  expect(list.repairStates.find(row => row.id === imported.rows[0].id)).toEqual({ ...initial, Codigo: "DUP", Descricao: null, tipo: 255, Cor: 4294967295, lancar_defa: null, lancar_material: null, confirmacao: null, pedir_data_entrega: null, pedir_data_pag: null, id: imported.rows[0].id, estados_reparacaoID: "9007199254740993" });
  expect(list.repairStates.find(row => row.id === imported.rows[2].id)).toEqual({ id: imported.rows[2].id, estados_reparacaoID: null, Codigo: null, Descricao: null, tipo: null, Cor: null, lancar_defa: null, lancar_material: null, confirmacao: null, pedir_data_entrega: null, pedir_data_pag: null });
  const values: RepairStateValues = { Codigo: "DUP", Descricao: "x');DROP TABLE estados_reparacao;--", tipo: 255, Cor: 4294967295, lancar_defa: null, lancar_material: null, confirmacao: null, pedir_data_entrega: null, pedir_data_pag: null };
  expect(await saveRepairState(connect, { mode: "update", id: imported.rows[0].id, values })).toEqual({ kind: "saved", repairState: { ...values, id: imported.rows[0].id, estados_reparacaoID: "9007199254740993" } });
  expect((await database.query('SELECT "estados_reparacaoID"::text,_import_id::text,_source_row::text FROM app."estados_reparacao" WHERE _row_id=$1', [imported.rows[0].id])).rows).toEqual([{ estados_reparacaoID: "9007199254740993", _import_id: runId, _source_row: "42" }]);
  expect(await deleteRepairState(connect, { id: imported.rows[0].id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "estados_reparacaoID"::text,"Descricao" FROM app."estados_reparacao" WHERE "Codigo"=$1', ["DUP"])).rows).toEqual([{ estados_reparacaoID: "9007199254740994", Descricao: "Untouched  " }]);
});

it("RULE-CEBED898-016 ADR-012 sorts Tipo by exact displayed labels and whitelists all sort fields", async () => {
  const one = await create({ ...initial, Codigo: "Z", Descricao: "Alpha", tipo: 1 });
  const two = await create({ ...initial, Codigo: "A", Descricao: "Zulu", tipo: 2 });
  for (const [input, expected] of [[{}, [one.id, two.id]], [{ sort: "Codigo" }, [two.id, one.id]], [{ sort: "Descricao" }, [one.id, two.id]], [{ sort: "tipo" }, [two.id, one.id]], [{ sort: "tipo", descending: true }, [one.id, two.id]]] as const) {
    const result = await listRepairStates(connect, input);
    if (result.kind !== "loaded") throw new Error("Synthetic sorted list failed");
    expect(result.repairStates.map(row => row.id)).toEqual(expected);
    expect(result.repairStates.find(row => row.id === one.id)?.tipo).toBe(1);
  }
  for (const tipo of [3, 4, 5, 6, 7, 8]) await create({ ...initial, Codigo: String(tipo), tipo });
  const allTypes = await listRepairStates(connect, { sort: "tipo" });
  if (allTypes.kind !== "loaded") throw new Error("Synthetic type display list failed");
  expect(allTypes.repairStates.map(row => row.tipo)).toEqual([2, 3, 5, 8, 1, 7, 6, 4]);
  expect(await listRepairStates(connect, { sort: 'Codigo";DROP TABLE estados_reparacao;--' })).toEqual({ kind: "invalid" });
  expect(await listRepairStates(connect, { sort: "Cor" })).toEqual({ kind: "invalid" });
  expect(await listRepairStates(connect, { mode: "active" })).toEqual({ kind: "invalid" });
});

it("ADR-011 serializes concurrent allocation and duplicate creates without source-ID narrowing", async () => {
  await database.query('INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo") VALUES (9007199254740993,$1)', ["OLD"]);
  const different = await Promise.all(["N1", "N2"].map(Codigo => saveRepairState(connect, { mode: "create", values: { ...initial, Codigo } })));
  expect(different.map(result => result.kind)).toEqual(["saved", "saved"]);
  const ids = different.map(result => { if (result.kind !== "saved") throw new Error("Concurrent allocation failed"); return result.repairState.estados_reparacaoID; });
  expect(new Set(ids)).toEqual(new Set(["9007199254740994", "9007199254740995"]));
  const same = await Promise.all([1, 2].map(() => saveRepairState(connect, { mode: "create", values: { ...initial, Codigo: "RAC" } })));
  expect(same.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."estados_reparacao" WHERE "Codigo"=$1', ["RAC"])).rows[0].n).toBe("1");
});

it("SRC-0981321613 rechecks the exact repair-order link after preconfirmation and leaves all records intact", async () => {
  const saved = await create({ ...initial, Codigo: "USE" });
  expect(await checkRepairStateDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  const order = await database.query<{ id: string }>('INSERT INTO app."ordem_reparacao" ("reparacao_estado","Estados_reparacaoID") VALUES ($1,0) RETURNING _row_id::text AS id', ["USE"]);
  expect(await checkRepairStateDelete(connect, { id: saved.id })).toEqual(associated);
  expect(await deleteRepairState(connect, { id: saved.id })).toEqual(associated);
  expect((await database.query('SELECT "reparacao_estado","Estados_reparacaoID"::text FROM app."ordem_reparacao" WHERE _row_id=$1', [order.rows[0].id])).rows).toEqual([{ reparacao_estado: "USE", Estados_reparacaoID: "0" }]);
  expect((await listRepairStates(connect, {}))).toMatchObject({ kind: "loaded", repairStates: [saved] });
});

it("ADR-011 actual concurrent order insertion is observed by the protected delete after its table-lock wait", async () => {
  const saved = await create({ ...initial, Codigo: "RAC" }), writer = await connect();
  expect(await checkRepairStateDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  let pid: number | undefined, pending: Promise<unknown> | undefined;
  try {
    await writer.query("BEGIN");
    await writer.query('INSERT INTO app."ordem_reparacao" ("reparacao_estado") VALUES ($1)', ["RAC"]);
    const observed: DatabaseConnection = async () => { const client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
    pending = deleteRepairState(observed, { id: saved.id });
    await awaitState(async () => pid !== undefined && (await database.query<{ blocked: boolean }>("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype='relation' AND NOT granted) AS blocked", [pid])).rows[0].blocked, "Delete never waited for the actual order writer");
    await writer.query("COMMIT");
    expect(await pending).toEqual(associated);
    expect((await database.query('SELECT count(*)::text AS n FROM app."estados_reparacao" WHERE _row_id=$1', [saved.id])).rows[0].n).toBe("1");
  } finally {
    await writer.query("ROLLBACK");
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await pending;
    await writer.end();
  }
}, 30000);

it("SRC-0981321613 deletion uses selected identity and invents no time/material or automatic-ID relationship guard", async () => {
  const saved = await create({ ...initial, Codigo: "DEL" });
  await database.query('INSERT INTO app."ordem_reparacao" ("reparacao_estado","Estados_reparacaoID") VALUES ($1,$2)', ["OTHER", saved.estados_reparacaoID]);
  await database.query('INSERT INTO app."tempos_reparacao" ("Inicio_reparacao_estado") VALUES ($1)', ["DEL"]);
  await database.query('INSERT INTO app."material_reparacao" ("reparacao_estado") VALUES ($1)', ["DEL"]);
  expect(await checkRepairStateDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  expect(await deleteRepairState(connect, { id: saved.id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "reparacao_estado" FROM app."material_reparacao"')).rows).toEqual([{ reparacao_estado: "DEL" }]);
  expect((await database.query('SELECT "Inicio_reparacao_estado" FROM app."tempos_reparacao"')).rows).toEqual([{ Inicio_reparacao_estado: "DEL" }]);
  expect(await deleteRepairState(connect, { id: saved.id })).toEqual({ kind: "missing" });
  expect(await checkRepairStateDelete(connect, { id: saved.id })).toEqual({ kind: "missing" });
  expect(await saveRepairState(connect, { mode: "update", id: saved.id, values: { ...initial, Codigo: "DEL" } })).toEqual({ kind: "missing" });
});

it("ADR-008 actual trigger exceptions roll back insert/update/delete and dependent effects", async () => {
  const saved = await create();
  const before = await snapshot();
  await database.query('CREATE TABLE public.repair_state_effects (operation text)');
  await database.query(`CREATE FUNCTION public.reject_repair_state() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.repair_state_effects VALUES (TG_OP); RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_repair_state AFTER INSERT OR UPDATE OR DELETE ON app."estados_reparacao" FOR EACH ROW EXECUTE FUNCTION public.reject_repair_state()');
  try {
    expect(await saveRepairState(connect, { mode: "create", values: { ...initial, Codigo: "ERR" } })).toEqual({ kind: "failed" });
    expect(await saveRepairState(connect, { mode: "update", id: saved.id, values: { ...initial, Descricao: "Changed", Cor: 4294967295 } })).toEqual({ kind: "failed" });
    expect(await deleteRepairState(connect, { id: saved.id })).toEqual({ kind: "failed" });
  } finally { await database.query('DROP TRIGGER reject_repair_state ON app."estados_reparacao"'); }
  expect(await snapshot()).toEqual(before);
  expect((await database.query('SELECT * FROM public.repair_state_effects')).rows).toEqual([]);
});

it("ADR-008 actual API loses connection AFTER insert, rolls back and returns typed failed without factory error listeners", async () => {
  const before = await snapshot(), gateKey = 731415;
  let client: Client | undefined, pid: number | undefined, done = false, pending: Promise<unknown> | undefined;
  const observed: DatabaseConnection = async () => { client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
  const app = createApp({ repairStateConnect: observed, authenticate: async () => ({ userId: "synthetic-connection-loss" }) });
  await database.query('CREATE TABLE public.repair_state_loss_effects (operation text)');
  await database.query(`CREATE FUNCTION public.repair_state_after_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.repair_state_loss_effects VALUES (TG_OP); PERFORM pg_advisory_xact_lock(${gateKey}::bigint); RETURN NULL; END $$`);
  await database.query('CREATE TRIGGER repair_state_loss_gate AFTER INSERT ON app."estados_reparacao" FOR EACH ROW EXECUTE FUNCTION public.repair_state_after_write()');
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gateKey]);
  try {
    pending = app.inject({ method: "POST", url: "/api/repair-states/save", payload: { mode: "create", values: initial } }).then(reply => { done = true; return { statusCode: reply.statusCode, body: reply.json() }; }, () => { done = true; return { kind: "rejected" }; });
    await awaitState(async () => {
      if (done) throw new Error("API completed before the real AFTER-write lock barrier");
      return pid !== undefined && (await database.query<{ blocked: boolean }>("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype='advisory' AND NOT granted) AS blocked", [pid])).rows[0].blocked;
    }, "API never reached the actual AFTER-write lock barrier");
    await database.query("SELECT pg_terminate_backend($1)", [pid]);
    await awaitState(async () => done, "Disconnected API did not settle");
    expect(await pending).toEqual({ statusCode: 200, body: { kind: "failed" } });
    expect(await snapshot()).toEqual(before);
    expect((await database.query('SELECT * FROM public.repair_state_loss_effects')).rows).toEqual([]);
  } finally {
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]);
    await pending;
    await client?.end();
    await database.query('DROP TRIGGER repair_state_loss_gate ON app."estados_reparacao"');
    await app.close();
  }
}, 30000);

it("ADR-008 all four actual operations retain typed failure for refused databases and ended clients", async () => {
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_repair_states_database");
  const ended: DatabaseConnection = async () => { const client = await connect(); await client.end(); return client; };
  for (const connection of [unavailable, ended]) {
    expect(await listRepairStates(connection, {})).toEqual({ kind: "failed" });
    expect(await saveRepairState(connection, { mode: "create", values: initial })).toEqual({ kind: "failed" });
    expect(await checkRepairStateDelete(connection, { id: "1" })).toEqual({ kind: "failed" });
    expect(await deleteRepairState(connection, { id: "1" })).toEqual({ kind: "failed" });
  }
  expect(await snapshot()).toEqual([]);
});

it("ADR-004 actual repair-state routes deny anonymous calls and authenticate before database acquisition", async () => {
  let connections = 0;
  const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  const denied = createApp({ repairStateConnect: observed });
  try {
    for (const action of ["list", "save", "check-delete", "delete"]) expect((await denied.inject({ method: "POST", url: `/api/repair-states/${action}`, payload: {} })).statusCode).toBe(401);
  } finally { await denied.close(); }
  expect(connections).toBe(0);
  const unavailable = createApp({ authenticate: async () => ({ userId: "synthetic" }) });
  try {
    for (const action of ["list", "save", "check-delete", "delete"]) expect((await unavailable.inject({ method: "POST", url: `/api/repair-states/${action}`, payload: {} })).statusCode).toBe(503);
  } finally { await unavailable.close(); }
  const app = createApp({ repairStateConnect: observed, authenticate: async () => ({ userId: "synthetic" }) });
  try {
    const beforeInvalid = connections;
    for (const payload of [{ mode: "create", values: { ...initial, Cor: 4294967296 } }, { mode: "create", values: { ...initial, estados_reparacaoID: "1" } }, { mode: "update", id: "9223372036854775808", values: initial }]) expect((await app.inject({ method: "POST", url: "/api/repair-states/save", payload })).json()).toEqual({ kind: "invalid" });
    expect((await app.inject({ method: "POST", url: "/api/repair-states/delete", payload: { id: "1 OR 1=1" } })).json()).toEqual({ kind: "invalid" });
    expect(connections).toBe(beforeInvalid);
    const result = (await app.inject({ method: "POST", url: "/api/repair-states/save", payload: { mode: "create", values: initial } })).json();
    expect(result).toMatchObject({ kind: "saved", repairState: initial });
    expect((await app.inject({ method: "POST", url: "/api/repair-states/list", payload: {} })).json()).toEqual({ kind: "loaded", repairStates: [result.repairState] });
    expect((await app.inject({ method: "POST", url: "/api/repair-states/check-delete", payload: { id: result.repairState.id } })).json()).toEqual({ kind: "ready" });
    expect((await app.inject({ method: "POST", url: "/api/repair-states/delete", payload: { id: result.repairState.id } })).json()).toEqual({ kind: "deleted" });
  } finally { await app.close(); }
});

it("GS-REPAIR-STATES-001 real API replay matches all spec-derived color/radio/flag values and exact text", async () => {
  const app = createApp({ repairStateConnect: connect, authenticate: async () => ({ userId: "synthetic-repair-state-golden" }) });
  try {
    const values = { ...initial, Codigo: "R01" };
    const saved = (await app.inject({ method: "POST", url: "/api/repair-states/save", payload: { mode: "create", values } })).json();
    expect(saved).toMatchObject({ kind: "saved", repairState: values });
    const changed = { ...values, Descricao: "Final d'Água  ", tipo: 6, Cor: 197121, lancar_defa: true, lancar_material: false, confirmacao: true, pedir_data_entrega: false, pedir_data_pag: true };
    expect((await app.inject({ method: "POST", url: "/api/repair-states/save", payload: { mode: "update", id: saved.repairState.id, values: changed } })).json()).toEqual({ kind: "saved", repairState: { ...changed, id: saved.repairState.id, estados_reparacaoID: saved.repairState.estados_reparacaoID } });
    expect((await app.inject({ method: "POST", url: "/api/repair-states/save", payload: { mode: "create", values: changed } })).json().kind).toBe("duplicate");
    const exported = await database.query('SELECT "Codigo","Descricao","tipo","Cor","lancar_defa","lancar_material","confirmacao","pedir_data_entrega","pedir_data_pag" FROM app."estados_reparacao" WHERE _row_id=$1', [saved.repairState.id]);
    const target = resolve(server.directory, "repair-state-golden"); await mkdir(target);
    const columns = ["Codigo", "Descricao", "tipo", "Cor", "lancar_defa", "lancar_material", "confirmacao", "pedir_data_entrega", "pedir_data_pag"], csv = (value: unknown) => '"' + String(value).replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "estados_reparacao.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(key => csv(row[key])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-REPAIR-STATES-001/compare.json", "--legacy", "docs/golden/GS-REPAIR-STATES-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

it("ADR-002 ADR-011 allocates the final signed8 identifier and refuses exhausted allocation without mutation", async () => {
  await database.query('INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo") VALUES (9223372036854775806,$1)', ["TOP"]);
  const last = await create({ ...initial, Codigo: "END" });
  expect(last.estados_reparacaoID).toBe("9223372036854775807");
  const before = await snapshot();
  expect(await saveRepairState(connect, { mode: "create", values: { ...initial, Codigo: "MAX" } })).toEqual({ kind: "failed" });
  expect(await snapshot()).toEqual(before);
});
