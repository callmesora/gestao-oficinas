import type { Client } from "pg";
import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { repairFormInitialiseSchema, repairFormVehicleSchema, repairFormCustomerLookupSchema, repairFormNumberSchema,
  repairFormStateChangeSchema, repairFormPrepareSchema, repairFormSaveSchema, repairFormRequiredInfo,
  repairFormNeedsDifferentDay, repairFormDateRequests, repairFormApplyDateAnswers, repairFormNumericValuesValid,
  repairFormMessages, type RepairOrderRecord28, type RepairOrderWrite18, type RepairFormInitialiseResult,
  type RepairFormStateOption, type RepairFormMechanicOption, type RepairFormReceptionistOption,
  type RepairFormVehicle, type RepairFormCustomer, type RepairFormVehicleResult, type RepairFormCustomerResult,
  type RepairVehicleChangeResult, type RepairStateChangeResult, type RepairFormPrepareInput,
  type RepairFormContext, type RepairFormPrepareResult, type RepairFormSaveResult, type RepairDeleteResult } from "../../../../packages/domain/src/repair-order-form";

// Verified: QRY_select/insert/update_ordens_reparacao. Transport all 28 raw source fields; no joined descriptions.
const returning = `_row_id::text AS id,"ordem_reparacaoID"::text,"numero"::text,"matricula","km_viatura"::text,
  "recepcao_util","recepcao_datahora","recepcao_cliente"::text,"recepcao_terceiro"::text,"recepacao_contatos",
  "recepcao_servico","recepcao_obs","recepcao_entrega_prevista","recepcao_prioridade","reparacao_mecanico",
  "reparacao_estado","reparacao_estado_obs","reparacao_servico","reparacao_estado_data","reparacao_estado_historico",
  "totaL_mao_obra"::text,"total_pecas"::text,"total_desconto"::text,"total_reparacao"::text,"faturado",
  "total_pago"::text,"Estados_reparacaoID"::text,"numero_fatura","data_pagamento"`;
const stateColumns = `_row_id::text AS id,"Codigo","Descricao","tipo","confirmacao","pedir_data_entrega","pedir_data_pag"`;
const mechanicColumns = `_row_id::text AS id,"Codigo","Descricao","inativo"`;
const customerColumns = `"Codigo"::text,"Descricao","Telefone1","Telemovel"`;
const writeColumns = ["numero", "matricula", "km_viatura", "recepcao_util", "recepcao_datahora", "recepcao_cliente", "recepcao_terceiro",
  "recepacao_contatos", "recepcao_servico", "recepcao_obs", "recepcao_entrega_prevista", "recepcao_prioridade", "reparacao_mecanico",
  "reparacao_estado", "faturado", "total_pago", "numero_fatura", "data_pagamento"] as const satisfies readonly (keyof RepairOrderWrite18)[];

async function readVehicle(client: Client, registration: string) {
  return (await client.query<RepairFormVehicle>(`SELECT _row_id::text AS id,"matricula","Cliente"::text,"marca","modelo"
    FROM app."Viaturas" WHERE "matricula"=$1 ORDER BY _row_id LIMIT 1`, [registration])).rows[0];
}
async function readCustomer(client: Client, code: string | null) {
  return (await client.query<RepairFormCustomer>(`SELECT ${customerColumns} FROM app."Clientes" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1`, [code])).rows[0] ?? null;
}
async function readState(client: Client, code: string | null) {
  return (await client.query<RepairFormStateOption>(`SELECT ${stateColumns} FROM app."estados_reparacao" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1`, [code])).rows[0];
}

export async function initialiseRepairOrderForm(connect: DatabaseConnection, input: unknown): Promise<RepairFormInitialiseResult> {
  const parsed = repairFormInitialiseSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    let order: RepairOrderRecord28 | null = null, nextNumero: string | null = null;
    if (parsed.data.target.mode === "update") {
      order = (await client.query<RepairOrderRecord28>(`SELECT ${returning} FROM app."ordem_reparacao" WHERE "numero"=$1 ORDER BY _row_id LIMIT 1`, [parsed.data.target.originalNumero])).rows[0] ?? null;
      if (!order) return { kind: "missing" };
    } else {
      // SRC-b2e6eeadd9 / ADR-002: unreserved MAX+1 suggestion; never narrow through JavaScript Number.
      const maximum = (await client.query<{ maximum: string }>('SELECT GREATEST(COALESCE(MAX("numero"),0),0)::text AS maximum FROM app."ordem_reparacao"')).rows[0].maximum;
      if (BigInt(maximum) >= 18446744073709551615n) return { kind: "exhausted" };
      nextNumero = String(BigInt(maximum) + 1n);
    }
    const states = await client.query<RepairFormStateOption>(`SELECT ${stateColumns} FROM app."estados_reparacao" ORDER BY "tipo" ASC NULLS LAST,_row_id`);
    const mechanics = await client.query<RepairFormMechanicOption>(`SELECT ${mechanicColumns} FROM app."mecanicos" ORDER BY "Codigo" ASC NULLS LAST,_row_id`);
    const receptionists = await client.query<RepairFormReceptionistOption>('SELECT _row_id::text AS id,"Codigo","Descricao" FROM app."utilizadores" ORDER BY "Codigo" ASC NULLS LAST,_row_id');
    return { kind: "loaded", order, nextNumero, states: states.rows, mechanics: mechanics.rows, receptionists: receptionists.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function resolveRepairOrderVehicle(connect: DatabaseConnection, input: unknown): Promise<RepairFormVehicleResult> {
  const parsed = repairFormVehicleSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // Source seek precedes Upper; programmatically assigned registrations have no generated-control length restriction.
    const vehicle = await readVehicle(client, parsed.data.registration ?? "");
    return vehicle ? { kind: "loaded", vehicle, customer: await readCustomer(client, vehicle.Cliente) } : { kind: "missing" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function lookupRepairOrderCustomer(connect: DatabaseConnection, input: unknown): Promise<RepairFormCustomerResult> {
  const parsed = repairFormCustomerLookupSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  // ADR-002: blank picker return is a nonmatching seek, not a decimal conversion or fabricated customer0.
  if (parsed.data.code === "") return { kind: "missing" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const customer = await readCustomer(client, parsed.data.code);
    return customer ? { kind: "loaded", customer } : { kind: "missing" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function checkRepairOrderVehicleChange(connect: DatabaseConnection, input: unknown): Promise<RepairVehicleChangeResult> {
  const parsed = repairFormNumberSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // ADR-006 U03: conservative interpretation of source's ambiguous query AND; either movement kind warns.
    const result = await client.query<{ movements: boolean }>(`SELECT EXISTS(SELECT 1 FROM app."material_reparacao" WHERE "numero"=$1)
      OR EXISTS(SELECT 1 FROM app."tempos_reparacao" WHERE "numero"=$1) AS movements`, [parsed.data.numero]);
    return result.rows[0].movements ? { kind: "needs-confirmation", reason: "movements", messages: [
      "Ordem de reparação já tem movimentos de material e/ou tempos.", "Tem a certeza que pretende alterar a matrícula?",
    ] } : { kind: "ready" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function checkRepairOrderStateChange(connect: DatabaseConnection, input: unknown): Promise<RepairStateChangeResult> {
  const parsed = repairFormStateChangeSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // Verified SRC-d0b8d7715c: only literal empty fim denotes work here; NULL and zero timestamps do not.
    const working = await client.query('SELECT 1 FROM app."tempos_reparacao" WHERE "numero"=$1 AND "fim"=\'\' LIMIT 1', [parsed.data.numero]);
    if (working.rowCount) return { kind: "working", message: repairFormMessages.working };
    const state = await readState(client, parsed.data.stateCode);
    return state?.confirmacao ? { kind: "needs-confirmation", description: state.Descricao } : { kind: "ready" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

type CurrentPreparation = { kind: "current"; context: RepairFormContext; registration: string; customer: { Descricao: string | null } | null };
async function currentPreparation(client: Client, input: RepairFormPrepareInput): Promise<CurrentPreparation | Extract<RepairFormPrepareResult, { kind: "needs-vehicle" | "activeOrder" | "mechanicRequired" }>> {
  const lookupRegistration = input.values.matricula ?? "", vehicle = await readVehicle(client, lookupRegistration);
  if (!vehicle) return { kind: "needs-vehicle", registration: input.values.matricula };
  const registration = lookupRegistration.toLocaleUpperCase("pt-PT");
  // SRC-55e462b0d2: this reread refreshes only the displayed customer description, never captured gnCliente.
  const customer = await readCustomer(client, vehicle.Cliente);
  const resolved = { registration, customer: customer ? { Descricao: customer.Descricao } : null };
  if (input.target.mode === "create") {
    const active = await client.query(`SELECT 1 FROM app."ordem_reparacao" o INNER JOIN app."estados_reparacao" s
      ON o."reparacao_estado"=s."Codigo" WHERE o."matricula"=$1 AND s."tipo"<>7 LIMIT 1`, [registration]);
    if (active.rowCount) return { kind: "activeOrder", message: repairFormMessages.activeOrder, resolved };
  }
  const state = await readState(client, input.values.reparacao_estado);
  if (state?.tipo !== null && state?.tipo !== undefined && state.tipo > 1 && input.formMeta.mechanicEmpty) return { kind: "mechanicRequired", message: repairFormMessages.mechanicRequired, resolved };
  return { kind: "current", ...resolved,
    context: { lookupRegistration, vehicleId: vehicle.id, stateId: state?.id ?? null,
      deliveryRequested: state?.pedir_data_entrega === true, paymentRequested: state?.pedir_data_pag === true } };
}

export async function prepareRepairOrderSave(connect: DatabaseConnection, input: unknown): Promise<RepairFormPrepareResult> {
  const parsed = repairFormPrepareSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const required = repairFormRequiredInfo(parsed.data);
  if (required) return required;
  if (repairFormNeedsDifferentDay(parsed.data)) return { kind: "needs-confirmation", reason: "different-entry-day", consent: { entryValue: parsed.data.values.recepcao_datahora, workstationDay: parsed.data.workstationDay } };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const current = await currentPreparation(client, parsed.data);
    if (current.kind !== "current") return current;
    const prepared = { input: parsed.data, context: current.context, registration: current.registration };
    const requests = repairFormDateRequests(prepared);
    return requests.length ? { kind: "needs-dates", prepared, requests, customer: current.customer } : { kind: "ready", prepared, customer: current.customer };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveRepairOrder(connect: DatabaseConnection, input: unknown): Promise<RepairFormSaveResult> {
  const parsed = repairFormSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const { prepared, dateAnswers, inactiveMechanicConsent } = parsed.data, command = prepared.input;
  // Recheck the original required values, never the answers returned by WIN_Data (cancel continues).
  const required = repairFormRequiredInfo(command);
  if (required) return required;
  if (repairFormNeedsDifferentDay(command)) return { kind: "invalid" };
  const answered = repairFormApplyDateAnswers(prepared, dateAnswers);
  if (answered.kind !== "valid") return answered;
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-006/011: match existing Clientes→Viaturas→ordem and estados→ordem edges, with mecanicos before states.
    await client.query('LOCK TABLE app."Clientes",app."Viaturas",app."mecanicos",app."estados_reparacao",app."ordem_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    // Await each refusal before finally closes: pg.end() aborts an active non-pipelined ROLLBACK.
    const refuse = async (result: RepairFormSaveResult) => { await client.query("ROLLBACK"); return result; };
    const current = await currentPreparation(client, command);
    if (current.kind === "needs-vehicle") return await refuse({ kind: "stale" });
    if (current.kind !== "current") return await refuse(current);
    if (current.registration !== prepared.registration || current.context.lookupRegistration !== prepared.context.lookupRegistration
      || current.context.vehicleId !== prepared.context.vehicleId || current.context.stateId !== prepared.context.stateId
      || current.context.deliveryRequested !== prepared.context.deliveryRequested || current.context.paymentRequested !== prepared.context.paymentRequested) return await refuse({ kind: "stale" });
    // Source mechanic check is AFTER both dates; no additional running-labor save guard.
    const mechanic = command.formMeta.mechanicEmpty ? undefined : (await client.query<RepairFormMechanicOption>(`SELECT ${mechanicColumns} FROM app."mecanicos" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1`, [command.values.reparacao_mecanico])).rows[0];
    if (inactiveMechanicConsent && (!mechanic || mechanic.id !== inactiveMechanicConsent.id || mechanic.Codigo !== inactiveMechanicConsent.code)) return await refuse({ kind: "stale" });
    if (mechanic?.inativo === true) {
      if (command.target.mode === "create") return await refuse({ kind: "inactiveMechanic", message: repairFormMessages.inactiveMechanic });
      if (!inactiveMechanicConsent) return await refuse({ kind: "needs-confirmation", reason: "inactive-mechanic", consent: { id: mechanic.id, code: mechanic.Codigo! } });
    }
    if (!repairFormNumericValuesValid(answered.values)) return await refuse({ kind: "invalid" });
    const parameters = writeColumns.map(column => answered.values[column]);
    let result;
    if (command.target.mode === "create") {
      // Source suggestion is never silently refreshed. Refuse collision only after its earlier source guards.
      if ((await client.query('SELECT 1 FROM app."ordem_reparacao" WHERE "numero"=$1 LIMIT 1', [answered.values.numero])).rowCount) return await refuse({ kind: "duplicate" });
      const maximum = (await client.query<{ maximum: string }>('SELECT GREATEST(COALESCE(MAX("ordem_reparacaoID"),0),0)::text AS maximum FROM app."ordem_reparacao"')).rows[0].maximum;
      if (BigInt(maximum) >= 9223372036854775807n) return await refuse({ kind: "exhausted" });
      // ADR-002 target defaults for NEW's omitted parameters, matching available source defaults; no imported provenance.
      result = await client.query<RepairOrderRecord28>(`INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID",${writeColumns.map(column => `"${column}"`).join(",")},
        "reparacao_estado_obs","reparacao_servico","reparacao_estado_data","reparacao_estado_historico","totaL_mao_obra","total_pecas","total_desconto","total_reparacao","Estados_reparacaoID")
        VALUES ($19,${writeColumns.map((_, index) => `$${index + 1}`).join(",")},'','','','',0,0,0,0,0) RETURNING ${returning}`, [...parameters, String(BigInt(maximum) + 1n)]);
    } else {
      // SRC-55e462b0d2: business-numero scope, retaining each row's CURRENT eight omitted fields, source IDs and provenance.
      result = await client.query<RepairOrderRecord28>(`UPDATE app."ordem_reparacao" SET ${writeColumns.map((column, index) => `"${column}"=$${index + 1}`).join(",")}
        WHERE "numero"=$19 RETURNING ${returning}`, [...parameters, command.target.originalNumero]);
      if (!result.rowCount) return await refuse({ kind: "missing" });
    }
    await client.query("COMMIT");
    return { kind: "saved", orders: result.rows };
  } catch {
    await rollbackAfterFailure(client);
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

export async function deleteRepairOrder(connect: DatabaseConnection, input: unknown): Promise<RepairDeleteResult> {
  const parsed = repairFormNumberSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    // Verified SRC-eb9499fa91 / ADR-006: source order and scope, even when parent vanished; no stock restoration.
    const order = await client.query('DELETE FROM app."ordem_reparacao" WHERE "numero"=$1', [parsed.data.numero]);
    const material = await client.query('DELETE FROM app."material_reparacao" WHERE "numero"=$1', [parsed.data.numero]);
    const labor = await client.query('DELETE FROM app."tempos_reparacao" WHERE "numero"=$1', [parsed.data.numero]);
    await client.query("COMMIT");
    return { kind: order.rowCount || material.rowCount || labor.rowCount ? "deleted" : "missing" };
  } catch {
    await rollbackAfterFailure(client);
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
