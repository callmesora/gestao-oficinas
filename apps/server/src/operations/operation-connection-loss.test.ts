import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { setTimeout as delay } from "node:timers/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import { checkCustomerDelete, deleteCustomer, listCustomers, saveCustomer } from "./customers";
import { checkVehicleDelete, deleteVehicle, listVehicles, lookupVehicle, saveVehicle } from "./vehicles";
import { checkUnitDelete, deleteUnit, listUnits, saveUnit } from "./units";
import { deleteDescriptiveState, listDescriptiveStates, saveDescriptiveState } from "./descriptive-states";
import { deleteTerminal, listTerminals, prepareTerminalFolder, saveTerminal } from "./terminals";
import { deletePosto, listPostos, savePosto } from "./postos";
import { deleteMechanic, listMechanics, readMechanic, saveMechanic } from "./mechanics";

type Operation = (connect: DatabaseConnection, input: unknown) => Promise<unknown>;
type Outcome = { status: "resolved"; value: unknown } | { status: "rejected" };
type Workflow = { name: string; table: string; save: Operation; remove: Operation; create: Record<string, unknown>; update: Record<string, unknown>; identity: Record<string, unknown> };
const customer = { Codigo: "1", Descricao: "Synthetic customer", Morada1: null, Morada2: "", codpostal: null, Telefone1: null, Telemovel: null, observacao: "kept  " };
const vehicle = { matricula: "C3-BASE", Cliente: "2", marca: "Synthetic", modelo: "Model", Ano: null, mes: 0 };
const terminal = { Codigo: "T01", Descricao: "Synthetic terminal", codbarras_inicio: 1, codbarras_fim: 2, quant_inicio: null, quant_fim: 255, pasta_localizacao: "", nome_ficheiro: null };
const mechanic = { Codigo: 1, Descricao: "Synthetic mechanic", palavra_passe: "SyntheticOnly", inativo: null };
const workflows: Workflow[] = [
  { name: "customers", table: "Clientes", save: saveCustomer, remove: deleteCustomer, create: { mode: "create", values: { ...customer, Codigo: "3" } }, update: { mode: "update", id: "1", values: { ...customer, Descricao: "Changed" } }, identity: { id: "1" } },
  { name: "vehicles", table: "Viaturas", save: saveVehicle, remove: deleteVehicle, create: { mode: "create", values: { ...vehicle, matricula: "C3-NEW" } }, update: { mode: "update", originalRegistration: "C3-BASE", values: { ...vehicle, modelo: "Changed" } }, identity: { registration: "C3-BASE" } },
  { name: "units", table: "unidades", save: saveUnit, remove: deleteUnit, create: { mode: "create", values: { Codigo: "U02", Descricao: "Synthetic" } }, update: { mode: "update", id: "1", values: { Codigo: "U01", Descricao: "Changed" } }, identity: { id: "1" } },
  { name: "descriptive-states", table: "estados_descritivos", save: saveDescriptiveState, remove: deleteDescriptiveState, create: { mode: "create", values: { Codigo: "D02", Descricao: "Synthetic" } }, update: { mode: "update", id: "1", values: { Codigo: "D01", Descricao: "Changed" } }, identity: { id: "1" } },
  { name: "terminals", table: "Terminais", save: saveTerminal, remove: deleteTerminal, create: { mode: "create", values: { ...terminal, Codigo: "T02" } }, update: { mode: "update", id: "1", values: { ...terminal, Descricao: "Changed" } }, identity: { id: "1" } },
  { name: "postos", table: "postos", save: savePosto, remove: deletePosto, create: { mode: "create", values: { Codigo: 2, Descricao: "Synthetic", terminal: null } }, update: { mode: "update", id: "1", values: { Codigo: 1, Descricao: "Changed", terminal: null } }, identity: { id: "1" } },
  { name: "mechanics", table: "mecanicos", save: saveMechanic, remove: deleteMechanic, create: { mode: "create", values: { ...mechanic, Codigo: 2 } }, update: { mode: "update", id: "1", values: { ...mechanic, Descricao: "Changed" } }, identity: { id: "1" } },
];
const reads: { name: string; table: string; operation: Operation; input: unknown }[] = [
  { name: "customer list", table: "Clientes", operation: listCustomers, input: { mode: "todos", term: "" } },
  { name: "customer relationship check", table: "Clientes", operation: checkCustomerDelete, input: { id: "1" } },
  { name: "vehicle list", table: "Viaturas", operation: listVehicles, input: { mode: "todos", term: "" } },
  { name: "vehicle lookup", table: "Viaturas", operation: lookupVehicle, input: { registration: "C3-BASE" } },
  { name: "vehicle relationship check", table: "Viaturas", operation: checkVehicleDelete, input: { registration: "C3-BASE" } },
  { name: "unit list", table: "unidades", operation: listUnits, input: {} },
  { name: "unit relationship check", table: "unidades", operation: checkUnitDelete, input: { id: "1" } },
  { name: "descriptive state list", table: "estados_descritivos", operation: listDescriptiveStates, input: {} },
  { name: "terminal list", table: "Terminais", operation: listTerminals, input: {} },
  { name: "terminal folder seek", table: "Terminais", operation: prepareTerminalFolder, input: { code: "T01" } },
  { name: "posto list", table: "postos", operation: listPostos, input: {} },
  { name: "mechanic public list", table: "mecanicos", operation: listMechanics, input: {} },
  { name: "mechanic selected read", table: "mecanicos", operation: readMechanic, input: { id: "1" } },
];
let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const quotedTables = [...workflows.map(workflow => `app."${workflow.table}"`), 'app."artigos"', 'app."ordem_reparacao"'];
const gateKey = 731404;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
  await database.query('CREATE TABLE public.lifecycle_effects (operation text NOT NULL)');
  await database.query(`CREATE FUNCTION public.lifecycle_after_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO public.lifecycle_effects VALUES (TG_OP);
    PERFORM pg_advisory_xact_lock(${gateKey}::bigint);
    RETURN NULL;
  END $$`);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  // Explicitly this fixture's newly created scratch database; no original records are imported.
  await database.query(`TRUNCATE ${quotedTables.join(",")},public.lifecycle_effects RESTART IDENTITY`);
  await database.query('INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao") VALUES (1,1,$1),(2,2,$2)', ["Synthetic selected customer", "Synthetic vehicle customer"]);
  await database.query('INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo") VALUES (1,$1,2,$2,$3)', ["C3-BASE", "Synthetic", "Model"]);
  await database.query('INSERT INTO app."unidades" ("unidadesID","Codigo","Descricao") VALUES (1,$1,$2)', ["U01", "Synthetic"]);
  await database.query('INSERT INTO app."estados_descritivos" ("estados_descritivosID","Codigo","Descricao") VALUES (1,$1,$2)', ["D01", "Synthetic"]);
  await database.query('INSERT INTO app."Terminais" ("Codigo","Descricao") VALUES ($1,$2)', ["T01", "Synthetic"]);
  await database.query('INSERT INTO app."postos" ("Codigo","Descricao","terminal","teste") VALUES (1,$1,NULL,$2)', ["Synthetic", "kept  "]);
  await database.query('INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (1,1,$1,$2,NULL)', ["Synthetic", "SyntheticOnly"]);
});

function observeConnection() {
  let client: Client | undefined, pid: number | undefined;
  return {
    // Deliberately no Client error listener here: production operation ownership must handle it.
    connect: async () => {
      client = await connect();
      pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid;
      return client;
    },
    pid: () => pid,
    async close() { await client?.end(); },
  };
}
function settled(operation: Promise<unknown>) {
  let done = false;
  const result: Promise<Outcome> = operation.then(value => { done = true; return { status: "resolved", value }; }, () => { done = true; return { status: "rejected" }; });
  return { done: () => done, result };
}
async function awaitState(probe: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) { if (await probe()) return; await delay(10); }
  throw new Error(message);
}
async function awaitBlocked(pid: () => number | undefined, pending: ReturnType<typeof settled>, lockType: "advisory" | "relation") {
  await awaitState(async () => {
    if (pending.done()) throw new Error("Operation completed before reaching the real database wait");
    if (pid() === undefined) return false;
    return (await database.query<{ blocked: boolean }>("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype=$2 AND NOT granted) AS blocked", [pid(), lockType])).rows[0].blocked;
  }, "Operation did not reach its real PostgreSQL lock barrier");
}
async function terminate(pid: number | undefined) {
  if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
}
async function snapshot() {
  const result: Record<string, unknown> = {};
  for (const table of quotedTables) result[table] = (await database.query(`SELECT to_jsonb(t) AS row FROM ${table} t ORDER BY _row_id`)).rows;
  result.effects = (await database.query("SELECT * FROM public.lifecycle_effects")).rows;
  return result;
}

const writes = workflows.flatMap(workflow => (["INSERT", "UPDATE", "DELETE"] as const).map(event => ({ ...workflow, event })));
it.each(writes)("ADR-008 $name $event connection loss after the real write resolves failed and rolls back all effects", async workflow => {
  const before = await snapshot(), observed = observeConnection();
  let pending: ReturnType<typeof settled> | undefined, outcome: Outcome | undefined;
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gateKey]);
  await database.query(`CREATE TRIGGER lifecycle_gate AFTER ${workflow.event} ON app."${workflow.table}" FOR EACH ROW EXECUTE FUNCTION public.lifecycle_after_write()`);
  try {
    pending = settled(workflow.event === "DELETE" ? workflow.remove(observed.connect, workflow.identity) : workflow.save(observed.connect, workflow.event === "INSERT" ? workflow.create : workflow.update));
    await awaitBlocked(observed.pid, pending, "advisory");
    // AFTER trigger proves the business write and synthetic dependent write both preceded disconnection.
    await terminate(observed.pid());
    await awaitState(async () => pending!.done(), "Disconnected write did not settle");
    outcome = await pending.result;
  } finally {
    if (pending && !pending.done()) await terminate(observed.pid());
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]);
    await observed.close();
    await database.query(`DROP TRIGGER lifecycle_gate ON app."${workflow.table}"`);
  }
  expect(await snapshot()).toEqual(before);
  expect(outcome).toEqual({ status: "resolved", value: { kind: "failed" } });
}, 30000);

it.each(reads)("ADR-008 $name handles a disconnected real pending read without mutation", async read => {
  const before = await snapshot(), observed = observeConnection();
  let pending: ReturnType<typeof settled> | undefined, outcome: Outcome | undefined;
  await database.query("BEGIN");
  await database.query(`LOCK TABLE app."${read.table}" IN ACCESS EXCLUSIVE MODE`);
  try {
    pending = settled(read.operation(observed.connect, read.input));
    await awaitBlocked(observed.pid, pending, "relation");
    await terminate(observed.pid());
    await awaitState(async () => pending!.done(), "Disconnected read did not settle");
    outcome = await pending.result;
  } finally {
    if (pending && !pending.done()) await terminate(observed.pid());
    await database.query("ROLLBACK");
    await observed.close();
  }
  expect(await snapshot()).toEqual(before);
  expect(outcome).toEqual({ status: "resolved", value: { kind: "failed" } });
}, 30000);

it("ADR-008 all real operations retain typed failure for refused databases and already-ended actual clients", async () => {
  const before = await snapshot();
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_lifecycle_database");
  const ended: DatabaseConnection = async () => { const client = await connect(); await client.end(); return client; };
  const operations = [...reads.map(read => ({ operation: read.operation, input: read.input })), ...workflows.flatMap(workflow => [{ operation: workflow.save, input: workflow.create }, { operation: workflow.remove, input: workflow.identity }])];
  for (const connection of [unavailable, ended]) for (const operation of operations) expect(await settled(operation.operation(connection, operation.input)).result).toEqual({ status: "resolved", value: { kind: "failed" } });
  expect(await snapshot()).toEqual(before);
}, 30000);

it("ADR-004 ADR-008 actual authenticated API returns typed failed after an AFTER-write backend loss", async () => {
  const before = await snapshot(), observed = observeConnection();
  const app = createApp({ customerConnect: observed.connect, authenticate: async () => ({ userId: "synthetic-lifecycle" }) });
  let pending: ReturnType<typeof settled> | undefined, response: { statusCode: number; body: unknown } | undefined;
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gateKey]);
  await database.query('CREATE TRIGGER lifecycle_gate AFTER INSERT ON app."Clientes" FOR EACH ROW EXECUTE FUNCTION public.lifecycle_after_write()');
  try {
    const request = app.inject({ method: "POST", url: "/api/customers/save", payload: workflows[0].create }).then(reply => { response = { statusCode: reply.statusCode, body: reply.json() }; });
    pending = settled(request);
    await awaitBlocked(observed.pid, pending, "advisory");
    await terminate(observed.pid());
    await awaitState(async () => pending!.done(), "Disconnected API operation did not settle");
    await pending.result;
  } finally {
    if (pending && !pending.done()) await terminate(observed.pid());
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]);
    await observed.close();
    await database.query('DROP TRIGGER lifecycle_gate ON app."Clientes"');
    await app.close();
  }
  expect(await snapshot()).toEqual(before);
  expect(response).toEqual({ statusCode: 200, body: { kind: "failed" } });
}, 30000);
