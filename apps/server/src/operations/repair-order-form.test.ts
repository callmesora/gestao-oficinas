import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { setTimeout as delay } from "node:timers/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import { initialiseRepairOrderForm, resolveRepairOrderVehicle, lookupRepairOrderCustomer, checkRepairOrderVehicleChange,
  checkRepairOrderStateChange, prepareRepairOrderSave, saveRepairOrder, deleteRepairOrder } from "./repair-order-form";
import { repairFormInitialValues, type RepairFormPrepareInput, type RepairFormPrepared, type RepairFormSaveInput } from "../../../../packages/domain/src/repair-order-form";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  await database.query('TRUNCATE app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao",app."Clientes",app."Viaturas",app."estados_reparacao",app."mecanicos",app."utilizadores",app."artigos",app."cab_stocks",app."lin_stocks" RESTART IDENTITY');
});
async function seed() {
  await database.query(`INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao","Telefone1","Telemovel") VALUES (1,3,'CURRENT',' 123 ','456 ');
    INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo") VALUES (1,'A''1',3,'MAKE','MODEL');
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","confirmacao","pedir_data_entrega","pedir_data_pag")
      VALUES (1,'A','Initial',1,false,false,false),(2,'P','Prompt',2,true,true,true),(3,'Z','Closed',7,false,false,false);
    INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (1,2,'Mechanic','synthetic-only',false);
    INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,1,'Reception','synthetic-only')`);
}
function command(numero = "10"): RepairFormPrepareInput {
  return { target: { mode: "create" }, values: { ...repairFormInitialValues(numero, "20240229123456")!, matricula: "A'1", km_viatura: "1",
    recepcao_util: 1, recepcao_cliente: "42", reparacao_estado: "P", reparacao_mecanico: 2 },
  formMeta: { state: { index: 1, value: "1", storedValue: "P" }, mechanicEmpty: false, receptionistEmpty: false }, workstationDay: "20240229" };
}
function state(input: RepairFormPrepareInput, code: string) { input.values.reparacao_estado = code; input.formMeta.state.storedValue = code; return input; }
async function order(patch: Record<string, unknown> = {}) {
  const row = { ...command().values, reparacao_estado: "Z", ordem_reparacaoID: "77", ...patch }, keys = Object.keys(row);
  return (await database.query<{ id: string }>(`INSERT INTO app."ordem_reparacao" (${keys.map(key => `"${key}"`).join(",")}) VALUES (${keys.map((_, index) => `$${index + 1}`).join(",")}) RETURNING _row_id::text AS id`, Object.values(row))).rows[0].id;
}
async function prepare(input = command()): Promise<RepairFormPrepared> {
  const result = await prepareRepairOrderSave(connect, input);
  if (result.kind !== "ready" && result.kind !== "needs-dates") throw new Error(`Synthetic preparation refused: ${result.kind}`);
  return result.prepared;
}
function answers(prepared: RepairFormPrepared): RepairFormSaveInput {
  return { prepared, dateAnswers: [
    ...(prepared.context.deliveryRequested ? [{ field: "delivery" as const, value: "" }] : []),
    ...(prepared.context.paymentRequested ? [{ field: "payment" as const, value: prepared.input.values.data_pagamento }] : []),
  ] };
}
async function snapshot() {
  return (await database.query(`SELECT 'order' AS kind,to_jsonb(o)::text AS row FROM app."ordem_reparacao" o UNION ALL
    SELECT 'material',to_jsonb(m)::text FROM app."material_reparacao" m UNION ALL SELECT 'labor',to_jsonb(t)::text FROM app."tempos_reparacao" t ORDER BY kind,row`)).rows;
}
async function awaitState(probe: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) { if (await probe()) return; await delay(10); }
  throw new Error(message);
}
async function blocked(pid: number | undefined, type: string) {
  return pid !== undefined && (await database.query<{ blocked: boolean }>("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype=$2 AND NOT granted) AS blocked", [pid, type])).rows[0].blocked;
}

it("strict form boundaries and original required/date consent refuse before acquiring a connection", async () => {
  let connections = 0; const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  expect(await initialiseRepairOrderForm(observed, { target: { mode: "create" }, credentials: true })).toEqual({ kind: "invalid" });
  expect(await resolveRepairOrderVehicle(observed, { registration: 1 })).toEqual({ kind: "invalid" });
  expect(await lookupRepairOrderCustomer(observed, { code: "1\n" })).toEqual({ kind: "invalid" });
  expect(await checkRepairOrderVehicleChange(observed, { numero: "1\n" })).toEqual({ kind: "invalid" });
  expect(await checkRepairOrderStateChange(observed, { numero: "1", stateCode: "P", extra: true })).toEqual({ kind: "invalid" });
  expect(await deleteRepairOrder(observed, { numero: "18446744073709551616" })).toEqual({ kind: "invalid" });
  const input = command(); input.values.recepcao_datahora = null;
  expect(await prepareRepairOrderSave(observed, input)).toMatchObject({ kind: "required", field: "entry" });
  input.values.recepcao_datahora = "20240228123456";
  expect(await prepareRepairOrderSave(observed, input)).toEqual({ kind: "needs-confirmation", reason: "different-entry-day", consent: { entryValue: "20240228123456", workstationDay: "20240229" } });
  const forged = { input: command(), context: { lookupRegistration: "different", vehicleId: "1", stateId: "2", deliveryRequested: true, paymentRequested: true }, registration: "A'1" };
  expect(await saveRepairOrder(observed, { prepared: forged, dateAnswers: [] })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0);
});

it("SRC-b2e6eeadd9 loads raw 28 fields and exact MAX+1 with public-only typed combo options", async () => {
  expect(await initialiseRepairOrderForm(connect, { target: { mode: "create" } })).toEqual({ kind: "loaded", order: null, nextNumero: "1", states: [], mechanics: [], receptionists: [] });
  await seed(); await order({ numero: "9007199254740993", km_viatura: "18446744073709551615", recepcao_datahora: "2024-02-29 12:34:56.789", total_pago: "-1234567890123456789.123456789", recepcao_obs: null });
  const initial = await initialiseRepairOrderForm(connect, { target: { mode: "create" } });
  expect(initial).toMatchObject({ kind: "loaded", order: null, nextNumero: "9007199254740994", mechanics: [{ Codigo: 2, inativo: false }], receptionists: [{ Codigo: 1, Descricao: "Reception" }] });
  if (initial.kind !== "loaded") throw new Error("Synthetic initial form did not load");
  expect(initial.states.map(row => row.tipo)).toEqual([1, 2, 7]); expect(JSON.stringify(initial)).not.toContain("synthetic-only");
  const edit = await initialiseRepairOrderForm(connect, { target: { mode: "update", originalNumero: "9007199254740993" } });
  expect(edit).toMatchObject({ kind: "loaded", nextNumero: null, order: { numero: "9007199254740993", km_viatura: "18446744073709551615", recepcao_datahora: "2024-02-29 12:34:56.789", total_pago: "-1234567890123456789.123456789", recepcao_obs: null } });
  expect(await initialiseRepairOrderForm(connect, { target: { mode: "update", originalNumero: "123" } })).toEqual({ kind: "missing" });
  await database.query('UPDATE app."ordem_reparacao" SET "numero"=18446744073709551615');
  expect(await initialiseRepairOrderForm(connect, { target: { mode: "create" } })).toEqual({ kind: "exhausted" });
});

it("form option queries have only public column privileges and never need stored passwords", async () => {
  await seed();
  await database.query(`CREATE ROLE repair_form_public NOLOGIN; GRANT USAGE ON SCHEMA app TO repair_form_public;
    GRANT SELECT ON app."ordem_reparacao",app."estados_reparacao" TO repair_form_public;
    GRANT SELECT (_row_id,"Codigo","Descricao","inativo") ON app."mecanicos" TO repair_form_public;
    GRANT SELECT (_row_id,"Codigo","Descricao") ON app."utilizadores" TO repair_form_public`);
  try {
    const restricted: DatabaseConnection = async () => { const client = await connect(); await client.query("SET ROLE repair_form_public"); return client; };
    expect(await initialiseRepairOrderForm(restricted, { target: { mode: "create" } })).toEqual(await initialiseRepairOrderForm(connect, { target: { mode: "create" } }));
  } finally { await database.query("DROP OWNED BY repair_form_public; DROP ROLE repair_form_public"); }
});

it("SRC-f349dfb841 resolves exact registration before Upper and distinguishes missing customer from found NULL", async () => {
  await seed();
  expect(await resolveRepairOrderVehicle(connect, { registration: "a'1" })).toEqual({ kind: "missing" });
  expect(await resolveRepairOrderVehicle(connect, { registration: "A'1" })).toMatchObject({ kind: "loaded", vehicle: { Cliente: "3", marca: "MAKE", modelo: "MODEL" }, customer: { Codigo: "3", Telefone1: " 123 ", Telemovel: "456 " } });
  const long = "Programmatic plate with more than fifteen characters'";
  await database.query('UPDATE app."Viaturas" SET "matricula"=$1', [long]); await database.query('UPDATE app."Clientes" SET "Descricao"=NULL');
  expect(await resolveRepairOrderVehicle(connect, { registration: long })).toMatchObject({ kind: "loaded", vehicle: { matricula: long }, customer: { Descricao: null } });
  expect(await lookupRepairOrderCustomer(connect, { code: "3" })).toMatchObject({ kind: "loaded", customer: { Descricao: null } });
  for (const code of [null, "", "18446744073709551615"]) expect(await lookupRepairOrderCustomer(connect, { code })).toEqual({ kind: "missing" });
  await database.query('DELETE FROM app."Clientes"');
  expect(await resolveRepairOrderVehicle(connect, { registration: long })).toMatchObject({ kind: "loaded", customer: null });
});

it("SRC-b0064a0577 / ADR-006 warns for either own-number movement kind without quantity/date predicates", async () => {
  await seed(); expect(await checkRepairOrderVehicleChange(connect, { numero: "10" })).toEqual({ kind: "ready" });
  await database.query('INSERT INTO app."material_reparacao" ("numero","quantidade") VALUES (10,0),(99,1)');
  expect(await checkRepairOrderVehicleChange(connect, { numero: "10" })).toMatchObject({ kind: "needs-confirmation", reason: "movements" });
  await database.query('DELETE FROM app."material_reparacao" WHERE "numero"=10; INSERT INTO app."tempos_reparacao" ("numero","fim") VALUES (10,NULL)');
  expect(await checkRepairOrderVehicleChange(connect, { numero: "10" })).toMatchObject({ kind: "needs-confirmation", messages: ["Ordem de reparação já tem movimentos de material e/ou tempos.", "Tem a certeza que pretende alterar a matrícula?"] });
  expect(await checkRepairOrderVehicleChange(connect, { numero: "11" })).toEqual({ kind: "ready" });
});

it("SRC-d0b8d7715c checks literal empty fim before selected-state confirmation", async () => {
  await seed();
  await database.query(`INSERT INTO app."tempos_reparacao" ("numero","fim") VALUES (10,NULL),(10,'00000000000000000'),(99,'')`);
  expect(await checkRepairOrderStateChange(connect, { numero: "10", stateCode: "P" })).toEqual({ kind: "needs-confirmation", description: "Prompt" });
  expect(await checkRepairOrderStateChange(connect, { numero: "10", stateCode: "missing" })).toEqual({ kind: "ready" });
  await database.query('INSERT INTO app."tempos_reparacao" ("numero","fim") VALUES (10,\'\')');
  expect(await checkRepairOrderStateChange(connect, { numero: "10", stateCode: "P" })).toEqual({ kind: "working", message: "Ordem de reparação tem mecânico a trabalhar na viatura" });
});

it("SRC-55e462b0d2 projects source Upper/customer before active-order and required-mechanic refusals", async () => {
  await seed(); await database.query('UPDATE app."Viaturas" SET "matricula"=\'a\'\'1\'; UPDATE app."Clientes" SET "Descricao"=NULL');
  await order({ reparacao_estado: "P" }); const input = command(); input.values.matricula = "a'1"; input.formMeta.mechanicEmpty = true;
  expect(await prepareRepairOrderSave(connect, input)).toEqual({ kind: "activeOrder", message: "Viatura já em reparação", resolved: { registration: "A'1", customer: { Descricao: null } } });
  await database.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=\'Z\'');
  expect(await prepareRepairOrderSave(connect, input)).toEqual({ kind: "mechanicRequired", message: "Este estado de reparação requer um mecânico", resolved: { registration: "A'1", customer: { Descricao: null } } });
  input.formMeta.mechanicEmpty = false;
  expect(await prepareRepairOrderSave(connect, input)).toMatchObject({ kind: "needs-dates", prepared: { registration: "A'1", input: { values: { recepcao_cliente: "42" } } }, customer: { Descricao: null }, requests: [{ field: "delivery" }, { field: "payment" }] });
});

it("new active-order inner join respects NULL/orphan states and any duplicate code with tipo other than7", async () => {
  await seed(); await order({ reparacao_estado: "orphan" }); expect((await prepareRepairOrderSave(connect, command())).kind).toBe("needs-dates");
  await database.query('INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","tipo") VALUES (4,\'orphan\',NULL)');
  expect((await prepareRepairOrderSave(connect, command())).kind).toBe("needs-dates");
  await database.query('INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","tipo") VALUES (5,\'orphan\',7),(6,\'orphan\',1)');
  expect((await prepareRepairOrderSave(connect, command())).kind).toBe("activeOrder");
});

it("save retains captured customer/raw precision and accepts deliberately blank Date answers after earlier required checks", async () => {
  await seed(); const input = command(); input.values.km_viatura = "18446744073709551615"; input.values.recepcao_terceiro = "18446744073709551615";
  input.values.total_pago = "-1234567890123456789.123456789"; input.values.recepacao_contatos = "  raw\r\nphones  "; input.values.recepcao_obs = null;
  const prepared = await prepare(input); const saved = await saveRepairOrder(connect, answers(prepared));
  expect(saved).toMatchObject({ kind: "saved", orders: [{ ordem_reparacaoID: "1", numero: "10", recepcao_cliente: "42", recepcao_terceiro: "18446744073709551615", km_viatura: "18446744073709551615", recepcao_entrega_prevista: "", total_pago: "-1234567890123456789.123456789", recepacao_contatos: "  raw\r\nphones  ", recepcao_obs: null, reparacao_estado_obs: "", reparacao_servico: "", reparacao_estado_data: "", reparacao_estado_historico: "", totaL_mao_obra: "0", total_pecas: "0", total_desconto: "0", total_reparacao: "0", Estados_reparacaoID: "0" }] });
  expect((await database.query('SELECT _import_id,_source_row FROM app."ordem_reparacao"')).rows).toEqual([{ _import_id: null, _source_row: null }]);
  expect(prepared.input.values.recepcao_entrega_prevista).toBe("20240229");
});

it("update preserves CURRENT eight omitted values/source IDs/provenance and adds no running-labor save guard", async () => {
  await seed(); const run = "00000000-0000-4000-8000-000000000082";
  await database.query('INSERT INTO import_audit.runs (id,source_sha256,mapping_version) VALUES ($1,$2,1)', [run, "a".repeat(64)]);
  await order({ _import_id: run, _source_row: "42", Estados_reparacaoID: "9007199254740993", reparacao_estado_historico: "old", reparacao_estado: "P" });
  const input = command(); input.target = { mode: "update", originalNumero: "10" }; const prepared = await prepare(input);
  await database.query(`UPDATE app."ordem_reparacao" SET "reparacao_estado_obs"='CURRENT  ',"reparacao_servico"='raw\r\ncurrent',"reparacao_estado_data"='opaque',"reparacao_estado_historico"=NULL,
    "totaL_mao_obra"=1234567890123456789.125,"total_pecas"=-0.125,"total_desconto"=0.00001,"total_reparacao"=1234567890123456789.00001;
    INSERT INTO app."tempos_reparacao" ("numero","fim") VALUES (10,'')`);
  const saved = await saveRepairOrder(connect, answers(prepared));
  expect(saved).toMatchObject({ kind: "saved", orders: [{ ordem_reparacaoID: "77", Estados_reparacaoID: "9007199254740993", reparacao_estado_obs: "CURRENT  ", reparacao_servico: "raw\r\ncurrent", reparacao_estado_data: "opaque", reparacao_estado_historico: null,
    totaL_mao_obra: "1234567890123456789.125", total_pecas: "-0.125", total_desconto: "0.00001", total_reparacao: "1234567890123456789.00001" }] });
  expect((await database.query('SELECT _import_id::text,_source_row::text FROM app."ordem_reparacao"')).rows).toEqual([{ _import_id: run, _source_row: "42" }]);
});

it("ADR-006 refuses changed Date flags/vehicle identity and forged/reordered answers without writes", async () => {
  await seed(); const prepared = await prepare(), before = await snapshot();
  expect(await saveRepairOrder(connect, { ...answers(prepared), dateAnswers: [{ field: "payment", value: "" }, { field: "delivery", value: "" }] })).toEqual({ kind: "invalid" });
  expect(await saveRepairOrder(connect, { ...answers(prepared), dateAnswers: [{ field: "delivery", value: null }, { field: "payment", value: "" }] })).toEqual({ kind: "invalid" });
  await database.query('UPDATE app."estados_reparacao" SET "pedir_data_pag"=false WHERE "Codigo"=\'P\'');
  expect(await saveRepairOrder(connect, answers(prepared))).toEqual({ kind: "stale" });
  await database.query('UPDATE app."estados_reparacao" SET "pedir_data_pag"=true WHERE "Codigo"=\'P\'; DELETE FROM app."Viaturas"; INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente") VALUES (2,\'A\'\'1\',3)');
  expect(await saveRepairOrder(connect, answers(prepared))).toEqual({ kind: "stale" }); expect(await snapshot()).toEqual(before);
});

it("inactive mechanic is checked after dates, refusing NEW and allowing identity-bound UPDATE continuation with original snapshot", async () => {
  await seed(); const newPrepared = await prepare(); await database.query('UPDATE app."mecanicos" SET "inativo"=true');
  expect(await saveRepairOrder(connect, answers(newPrepared))).toEqual({ kind: "inactiveMechanic", message: "Mecânico inativo" });
  await order(); const input = command(); input.target = { mode: "update", originalNumero: "10" }; const prepared = await prepare(input), payload = answers(prepared);
  const response = await saveRepairOrder(connect, payload);
  expect(response).toEqual({ kind: "needs-confirmation", reason: "inactive-mechanic", consent: { id: "1", code: 2 } });
  if (response.kind !== "needs-confirmation") throw new Error("Synthetic inactive mechanic did not request confirmation");
  expect(await saveRepairOrder(connect, { ...payload, inactiveMechanicConsent: response.consent })).toMatchObject({ kind: "saved", orders: [{ recepcao_entrega_prevista: "" }] });
  await database.query('DELETE FROM app."mecanicos"; INSERT INTO app."mecanicos" ("mecanicosID","Codigo","inativo") VALUES (2,2,true)');
  expect(await saveRepairOrder(connect, { ...payload, inactiveMechanicConsent: response.consent })).toEqual({ kind: "stale" });
});

it("no-selection0 mechanic skips lookup while an actually selected code0 retains the inactive check", async () => {
  await seed(); await database.query('INSERT INTO app."mecanicos" ("mecanicosID","Codigo","inativo") VALUES (2,0,true)');
  const input = state(command(), "A"); input.values.reparacao_mecanico = 0; input.formMeta.mechanicEmpty = true;
  expect((await saveRepairOrder(connect, answers(await prepare(input)))).kind).toBe("saved");
  await database.query('DELETE FROM app."ordem_reparacao"'); input.formMeta.mechanicEmpty = false;
  expect(await saveRepairOrder(connect, answers(await prepare(input)))).toEqual({ kind: "inactiveMechanic", message: "Mecânico inativo" });
});

it("source missing-state and missing-mechanic reads fall through without invented existence guards", async () => {
  await seed(); const input = state(command(), "orphan"); input.formMeta.mechanicEmpty = true;
  const prepared = await prepare(input);
  expect(prepared.context).toMatchObject({ stateId: null, deliveryRequested: false, paymentRequested: false });
  expect((await saveRepairOrder(connect, answers(prepared))).kind).toBe("saved");
  await database.query('DELETE FROM app."ordem_reparacao"; DELETE FROM app."mecanicos"');
  const normal = command(); normal.values.reparacao_mecanico = 255;
  expect(await saveRepairOrder(connect, answers(await prepare(normal)))).toMatchObject({ kind: "saved", orders: [{ reparacao_mecanico: 255 }] });
});

it("new collision occurs after earlier mechanic refusal and never silently allocates a different numero", async () => {
  await seed(); await order(); const prepared = await prepare(state(command(), "Z"));
  await database.query('UPDATE app."mecanicos" SET "inativo"=true');
  expect((await saveRepairOrder(connect, answers(prepared))).kind).toBe("inactiveMechanic");
  await database.query('UPDATE app."mecanicos" SET "inativo"=false');
  expect(await saveRepairOrder(connect, answers(prepared))).toEqual({ kind: "duplicate" });
  expect((await database.query('SELECT "numero"::text FROM app."ordem_reparacao"')).rows).toEqual([{ numero: "10" }]);
  await database.query('UPDATE app."ordem_reparacao" SET "ordem_reparacaoID"=9223372036854775807');
  expect(await saveRepairOrder(connect, answers(await prepare(state(command("11"), "Z"))))).toEqual({ kind: "exhausted" });
});

it("ADR-002 refuses invalid edited numeric drafts without changing NULL into zero or bypassing earlier source guards", async () => {
  await seed(); const input = command(); input.values.total_pago = ""; const prepared = await prepare(input);
  await database.query('UPDATE app."mecanicos" SET "inativo"=true');
  expect((await saveRepairOrder(connect, answers(prepared))).kind).toBe("inactiveMechanic");
  await database.query('UPDATE app."mecanicos" SET "inativo"=false');
  expect(await saveRepairOrder(connect, answers(prepared))).toEqual({ kind: "invalid" });
  input.values.total_pago = null;
  expect(await saveRepairOrder(connect, answers(await prepare(input)))).toMatchObject({ kind: "saved", orders: [{ total_pago: null }] });
});

it("concurrent same-number creates commit once and refuse the unreserved collision without Number rounding", async () => {
  await seed(); const prepared = await prepare(state(command("9007199254740993"), "Z"));
  const results = await Promise.all([saveRepairOrder(connect, answers(prepared)), saveRepairOrder(connect, answers(prepared))]);
  expect(results.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  expect((await database.query('SELECT "numero"::text,"ordem_reparacaoID"::text FROM app."ordem_reparacao"')).rows).toEqual([{ numero: "9007199254740993", ordem_reparacaoID: "1" }]);
});

it("save waits for the real state writer and rechecks its committed current Date flags", async () => {
  await seed(); const prepared = await prepare(), writer = await connect(); let pid: number | undefined, pending: ReturnType<typeof saveRepairOrder> | undefined;
  try {
    await writer.query('BEGIN; LOCK TABLE app."estados_reparacao" IN SHARE ROW EXCLUSIVE MODE; UPDATE app."estados_reparacao" SET "pedir_data_entrega"=false WHERE "Codigo"=\'P\'');
    pending = saveRepairOrder(async () => { const client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; }, answers(prepared));
    await awaitState(() => blocked(pid, "relation"), "Form save did not wait for the actual state writer"); await writer.query("COMMIT");
    expect(await pending).toEqual({ kind: "stale" }); expect(await snapshot()).toEqual([]);
  } finally {
    await writer.query("ROLLBACK");
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await pending; await writer.end();
  }
}, 30000);

it("SRC-eb9499fa91 deletes exact numero across all three tables including orphan children, with source delete order", async () => {
  await seed(); await order(); await order({ numero: "11", ordem_reparacaoID: "78" });
  await database.query('INSERT INTO app."material_reparacao" ("numero") VALUES (10),(11),(12); INSERT INTO app."tempos_reparacao" ("numero") VALUES (10),(11),(12)');
  await database.query(`INSERT INTO app."artigos" ("Codigo","stock") VALUES ('SYNTHETIC',5.125);
    UPDATE app."material_reparacao" SET "artigo"='SYNTHETIC',"quantidade"=2,"lancado"=true;
    INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero") VALUES ('S',10);
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","quantidade") VALUES ('S',10,'SYNTHETIC',-2.25)`);
  const stockSnapshot = async () => (await database.query(`SELECT 'article' AS kind,to_jsonb(a)::text AS row FROM app."artigos" a UNION ALL
    SELECT 'header',to_jsonb(c)::text FROM app."cab_stocks" c UNION ALL SELECT 'line',to_jsonb(l)::text FROM app."lin_stocks" l ORDER BY kind,row`)).rows;
  const stockBefore = await stockSnapshot();
  await database.query(`CREATE TABLE public.repair_form_delete_order (kind text);
    CREATE FUNCTION public.log_repair_form_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.repair_form_delete_order VALUES (TG_TABLE_NAME); RETURN OLD; END $$;
    CREATE TRIGGER form_delete_order AFTER DELETE ON app."ordem_reparacao" FOR EACH ROW EXECUTE FUNCTION public.log_repair_form_delete();
    CREATE TRIGGER form_delete_material AFTER DELETE ON app."material_reparacao" FOR EACH ROW EXECUTE FUNCTION public.log_repair_form_delete();
    CREATE TRIGGER form_delete_labor AFTER DELETE ON app."tempos_reparacao" FOR EACH ROW EXECUTE FUNCTION public.log_repair_form_delete()`);
  try {
    expect(await deleteRepairOrder(connect, { numero: "10" })).toEqual({ kind: "deleted" });
    expect((await database.query("SELECT kind FROM public.repair_form_delete_order")).rows.map(row => row.kind)).toEqual(["ordem_reparacao", "material_reparacao", "tempos_reparacao"]);
    expect(await deleteRepairOrder(connect, { numero: "12" })).toEqual({ kind: "deleted" });
    expect(await deleteRepairOrder(connect, { numero: "12" })).toEqual({ kind: "missing" });
    expect((await snapshot()).every(row => JSON.parse(row.row).numero === 11)).toBe(true);
    expect(await stockSnapshot()).toEqual(stockBefore);
  } finally {
    await database.query('DROP TRIGGER form_delete_order ON app."ordem_reparacao"; DROP TRIGGER form_delete_material ON app."material_reparacao"; DROP TRIGGER form_delete_labor ON app."tempos_reparacao"');
  }
});

it("delete failure after its third write rolls back parent, material, labor and trigger effects together", async () => {
  await seed(); await order(); await database.query('INSERT INTO app."material_reparacao" ("numero") VALUES (10); INSERT INTO app."tempos_reparacao" ("numero") VALUES (10)');
  const before = await snapshot();
  await database.query(`CREATE TABLE public.repair_form_delete_effects (numero numeric);
    CREATE FUNCTION public.reject_repair_form_delete() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.repair_form_delete_effects VALUES (OLD."numero"); RAISE EXCEPTION 'synthetic failure'; RETURN OLD; END $$;
    CREATE TRIGGER reject_form_delete AFTER DELETE ON app."tempos_reparacao" FOR EACH ROW EXECUTE FUNCTION public.reject_repair_form_delete()`);
  try { expect(await deleteRepairOrder(connect, { numero: "10" })).toEqual({ kind: "failed" }); }
  finally { await database.query('DROP TRIGGER reject_form_delete ON app."tempos_reparacao"'); }
  expect(await snapshot()).toEqual(before); expect((await database.query("SELECT * FROM public.repair_form_delete_effects")).rows).toEqual([]);
});

it("AFTER-insert failure rolls back new order and dependent effects without claiming success", async () => {
  await seed(); const prepared = await prepare();
  await database.query(`CREATE TABLE public.repair_form_save_effects (numero numeric);
    CREATE FUNCTION public.reject_repair_form_save() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.repair_form_save_effects VALUES (NEW."numero"); RAISE EXCEPTION 'synthetic failure'; RETURN NEW; END $$;
    CREATE TRIGGER reject_form_save AFTER INSERT ON app."ordem_reparacao" FOR EACH ROW EXECUTE FUNCTION public.reject_repair_form_save()`);
  try { expect(await saveRepairOrder(connect, answers(prepared))).toEqual({ kind: "failed" }); }
  finally { await database.query('DROP TRIGGER reject_form_save ON app."ordem_reparacao"'); }
  expect(await snapshot()).toEqual([]); expect((await database.query("SELECT * FROM public.repair_form_save_effects")).rows).toEqual([]);
});

it("C3 actual API loss after an update rolls back its raw values/effects and settles typed failed", async () => {
  await seed(); await order(); const input = command(); input.target = { mode: "update", originalNumero: "10" }; const payload = answers(await prepare(input)), before = await snapshot(), gate = 732082;
  let pid: number | undefined, client: Client | undefined, done = false, pending: Promise<unknown> | undefined;
  const observed: DatabaseConnection = async () => { client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
  const app = createApp({ repairOrderConnect: observed, authenticate: async () => ({ userId: "synthetic" }) });
  await database.query(`CREATE TABLE public.repair_form_loss_effects (numero numeric);
    CREATE FUNCTION public.repair_form_after_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.repair_form_loss_effects VALUES (NEW."numero"); PERFORM pg_advisory_xact_lock(${gate}::bigint); RETURN NEW; END $$;
    CREATE TRIGGER repair_form_loss_gate AFTER UPDATE ON app."ordem_reparacao" FOR EACH ROW EXECUTE FUNCTION public.repair_form_after_write()`);
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gate]);
  try {
    pending = app.inject({ method: "POST", url: "/api/repair-orders/save", payload }).then(reply => { done = true; return { status: reply.statusCode, body: reply.json() }; }, () => { done = true; return { kind: "rejected" }; });
    await awaitState(async () => { if (done) throw new Error("Form API completed before its AFTER-write barrier"); return blocked(pid, "advisory"); }, "Form API did not reach its AFTER-write barrier");
    await database.query("SELECT pg_terminate_backend($1)", [pid]); await awaitState(async () => done, "Disconnected form API did not settle");
    expect(await pending).toEqual({ status: 200, body: { kind: "failed" } }); expect(await snapshot()).toEqual(before);
    expect((await database.query("SELECT * FROM public.repair_form_loss_effects")).rows).toEqual([]);
  } finally {
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gate]); await pending; await client?.end();
    await database.query('DROP TRIGGER repair_form_loss_gate ON app."ordem_reparacao"'); await app.close();
  }
}, 30000);

it("all eight operations classify refused and already ended clients as typed failed", async () => {
  await seed(); const payload = answers(await prepare());
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_repair_form_database");
  const ended: DatabaseConnection = async () => { const client = await connect(); await client.end(); return client; };
  for (const connection of [unavailable, ended]) {
    expect(await initialiseRepairOrderForm(connection, { target: { mode: "create" } })).toEqual({ kind: "failed" });
    expect(await resolveRepairOrderVehicle(connection, { registration: "A'1" })).toEqual({ kind: "failed" });
    expect(await lookupRepairOrderCustomer(connection, { code: "3" })).toEqual({ kind: "failed" });
    expect(await checkRepairOrderVehicleChange(connection, { numero: "10" })).toEqual({ kind: "failed" });
    expect(await checkRepairOrderStateChange(connection, { numero: "10", stateCode: "P" })).toEqual({ kind: "failed" });
    expect(await prepareRepairOrderSave(connection, command())).toEqual({ kind: "failed" });
    expect(await saveRepairOrder(connection, payload)).toEqual({ kind: "failed" });
    expect(await deleteRepairOrder(connection, { numero: "10" })).toEqual({ kind: "failed" });
  }
});

it.each([
  { name: "initialise", table: 'app."ordem_reparacao"', input: { target: { mode: "create" } }, operation: initialiseRepairOrderForm },
  { name: "resolve vehicle", table: 'app."Viaturas"', input: { registration: "A'1" }, operation: resolveRepairOrderVehicle },
  { name: "lookup customer", table: 'app."Clientes"', input: { code: "3" }, operation: lookupRepairOrderCustomer },
  { name: "vehicle change", table: 'app."material_reparacao"', input: { numero: "10" }, operation: checkRepairOrderVehicleChange },
  { name: "state change", table: 'app."tempos_reparacao"', input: { numero: "10", stateCode: "P" }, operation: checkRepairOrderStateChange },
  { name: "prepare save", table: 'app."Viaturas"', input: command(), operation: prepareRepairOrderSave },
])("C3 pending real $name read settles typed failed after disconnection without source writes", async test => {
  await seed(); await order(); const before = await snapshot();
  let pid: number | undefined, client: Client | undefined, done = false, pending: Promise<unknown> | undefined;
  const observed: DatabaseConnection = async () => { client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
  await database.query("BEGIN"); await database.query(`LOCK TABLE ${test.table} IN ACCESS EXCLUSIVE MODE`);
  try {
    pending = test.operation(observed, test.input).then(value => { done = true; return value; }, () => { done = true; return { kind: "rejected" }; });
    await awaitState(async () => { if (done) throw new Error("Read completed before its real table barrier"); return blocked(pid, "relation"); }, "Form read did not reach its real table barrier");
    await database.query("SELECT pg_terminate_backend($1)", [pid]); await awaitState(async () => done, "Disconnected form read did not settle");
    expect(await pending).toEqual({ kind: "failed" });
  } finally {
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("ROLLBACK"); await pending; await client?.end();
  }
  expect(await snapshot()).toEqual(before);
}, 30000);

it("protected actual form routes authenticate before database acquisition and dispatch all eight operations", async () => {
  let connections = 0; const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  const actions = ["form-initialise", "resolve-vehicle", "lookup-customer", "check-vehicle-change", "check-state-change", "prepare-save", "save", "delete"];
  const denied = createApp({ repairOrderConnect: observed });
  try { for (const action of actions) expect((await denied.inject({ method: "POST", url: `/api/repair-orders/${action}`, payload: {} })).statusCode).toBe(401); }
  finally { await denied.close(); } expect(connections).toBe(0);
  const unavailable = createApp({ authenticate: async () => ({ userId: "synthetic" }) });
  try { for (const action of actions) expect((await unavailable.inject({ method: "POST", url: `/api/repair-orders/${action}`, payload: {} })).statusCode).toBe(503); }
  finally { await unavailable.close(); }
  await seed(); const allowed = createApp({ repairOrderConnect: observed, authenticate: async () => ({ userId: "synthetic" }) });
  try {
    const call = async (action: string, payload: object) => { const response = await allowed.inject({ method: "POST", url: `/api/repair-orders/${action}`, payload }); expect(response.statusCode).toBe(200); return response.json(); };
    expect(await call("form-initialise", { target: { mode: "create" } })).toMatchObject({ kind: "loaded", nextNumero: "1" });
    expect(await call("resolve-vehicle", { registration: "A'1" })).toMatchObject({ kind: "loaded", customer: { Codigo: "3" } });
    expect(await call("lookup-customer", { code: "3" })).toMatchObject({ kind: "loaded", customer: { Descricao: "CURRENT" } });
    expect(await call("check-vehicle-change", { numero: "10" })).toEqual({ kind: "ready" });
    expect(await call("check-state-change", { numero: "10", stateCode: "P" })).toMatchObject({ kind: "needs-confirmation" });
    const result = await call("prepare-save", command()); expect(result.kind).toBe("needs-dates");
    expect(await call("save", answers(result.prepared))).toMatchObject({ kind: "saved", orders: [{ numero: "10" }] });
    expect(await call("delete", { numero: "10" })).toEqual({ kind: "deleted" }); expect(await snapshot()).toEqual([]);
  } finally { await allowed.close(); }
});
