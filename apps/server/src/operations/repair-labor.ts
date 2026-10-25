import type { Client } from "pg";
import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { repairLaborAuthenticateSchema, repairLaborInitialiseSchema, repairLaborListSchema, repairLaborMaterialSaveSchema, repairLaborNumberSchema, repairLaborPrepareSchema, repairLaborStateSchema, repairLaborTickSchema, repairLaborToggleSchema,
  type RepairLaborAuthenticateResult, type RepairLaborDetail, type RepairLaborInitialiseResult, type RepairLaborListResult, type RepairLaborMaterial, type RepairLaborOrder, type RepairLaborPrepareResult, type RepairLaborProof, type RepairLaborReadResult, type RepairLaborRow, type RepairLaborSettings, type RepairLaborWriteResult } from "../../../../packages/domain/src/repair-labor";
import type { RepairOrderMechanic, RepairOrderStateFilter } from "../../../../packages/domain/src/repair-orders";
import { OPEN_LABOR_FINISH, laborDateTimeMilliseconds, laborStateHistory, laborWithinClosure } from "../../../../packages/domain/src/repair-labor-time";
import { dateTimeComparisonKey } from "../../../../packages/domain/src/date-time";

const stateColumns = '_row_id::text AS id,"Codigo","Descricao","tipo","Cor"::double precision AS "Cor","lancar_defa"';
const laborColumns = 't._row_id::text AS id,t."numero"::text,t."mecanico",t."inicio",t."fim",t."Inicio_reparacao_estado",t."fim_reparacao_estado",t."tempos_reparacaoID"::text';
const materialColumns = '_row_id::text AS id,"numero"::text,"artigo","descricao_artigo","quantidade"::text,"data_hora","preco"::text,"lancado","extra"';
const detailSql = `SELECT o._row_id::text AS id,o."numero"::text,o."matricula",o."reparacao_mecanico",o."reparacao_estado",o."reparacao_estado_historico",o."reparacao_servico",o."recepcao_servico",o."recepcao_obs",o."recepacao_contatos",
  (SELECT (v."marca"||' ')||v."modelo" FROM app."Viaturas" v WHERE v."matricula"=o."matricula" ORDER BY v._row_id LIMIT 1) AS marcamodelo,
  (SELECT c."Descricao" FROM app."Clientes" c WHERE c."Codigo"=o."recepcao_cliente" ORDER BY c._row_id LIMIT 1) AS cliente
  FROM app."ordem_reparacao" o WHERE o."numero"=$1 ORDER BY o._row_id LIMIT 1`;
async function detail(client: Client, numero: string) { return (await client.query<RepairLaborDetail>(detailSql, [numero])).rows[0]; }
async function materialRows(client: Client, numero: string) { return (await client.query<RepairLaborMaterial>(`SELECT ${materialColumns} FROM app."material_reparacao" WHERE "numero"=$1 ORDER BY "data_hora" ASC NULLS LAST,_row_id`, [numero])).rows; }
async function rawLabor(client: Client, numero: string) { return (await client.query<Omit<RepairLaborRow, "Descricao">>(`SELECT ${laborColumns} FROM app."tempos_reparacao" t WHERE t."numero"=$1 ORDER BY t."tempos_reparacaoID" ASC NULLS LAST,t._row_id`, [numero])).rows; }
async function stateRows(client: Client) { return (await client.query<RepairOrderStateFilter>(`SELECT ${stateColumns} FROM app."estados_reparacao" ORDER BY "tipo" ASC NULLS LAST,_row_id`)).rows; }
async function authenticate(client: Client, proof: RepairLaborProof): Promise<RepairOrderMechanic | null> {
  // WIN_Tempos_Reparacao_Tempo241–279/304–326: exact case-sensitive compare, no inactive rule.
  if (proof.password === "") return null;
  const row = (await client.query<RepairOrderMechanic & { matches: boolean }>('SELECT _row_id::text AS id,"Codigo","Descricao",("palavra_passe"=$2) AS matches FROM app."mecanicos" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1', [proof.mechanic, proof.password])).rows[0];
  return row?.matches === true ? { id: row.id, Codigo: row.Codigo, Descricao: row.Descricao } : null;
}
function inUse(error: unknown): boolean { return typeof error === "object" && error !== null && "code" in error && error.code === "55P03"; }
async function lock(client: Client, tables: string[]) {
  // ADR006: only required subset, in shared M→S→O→material→tempos order; never hold across dialogs.
  for (const table of tables) await client.query(`LOCK TABLE app."${table}" IN SHARE ROW EXCLUSIVE MODE NOWAIT`);
}
function baseline(order: RepairLaborDetail, labor: unknown[], states: RepairOrderStateFilter[]) { return JSON.stringify({ order, labor, states }); }
async function laborPlan(client: Client, numero: string, mechanic: number) {
  const order = await detail(client, numero);
  if (!order) return null;
  const labor = await rawLabor(client, numero);
  const latest = labor.filter(row => row.mecanico === mechanic).at(-1);
  const others = (await client.query<{ id: string; numero: string; matricula: string | null; state: string | null; inicio: string | null }>(`SELECT t._row_id::text AS id,t."numero"::text,o."matricula",o."reparacao_estado" AS state,t."inicio" FROM app."tempos_reparacao" t INNER JOIN app."ordem_reparacao" o ON o."numero"=t."numero" WHERE t."mecanico"=$1 AND t."fim"=$2 AND t."numero"<>$3 ORDER BY t._row_id,o._row_id`, [mechanic, OPEN_LABOR_FINISH, numero])).rows;
  const states = await stateRows(client), currentState = states.find(state => state.Codigo !== null && state.Codigo === order.reparacao_estado);
  return { order, latest, others, states, finish: latest?.fim === OPEN_LABOR_FINISH, stateAllowed: currentState?.tipo === 3 || currentState?.tipo === 4 || currentState?.tipo === 5,
    baseline: JSON.stringify({ order, labor, others, states }) };
}

export async function initialiseRepairLabor(connect: DatabaseConnection, input: unknown): Promise<RepairLaborInitialiseResult> {
  const parsed = repairLaborInitialiseSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN"); await lock(client, ["ordem_reparacao", "tempos_reparacao"]);
    const settings = (await client.query<RepairLaborSettings>('SELECT "Tempo_tempos"::text,"encerrar_tempos1","encerrar_tempos2" FROM app."sistema" ORDER BY _row_id LIMIT 1')).rows[0] ?? { Tempo_tempos: null, encerrar_tempos1: null, encerrar_tempos2: null };
    const open = (await client.query<Omit<RepairLaborRow, "Descricao">>(`SELECT ${laborColumns} FROM app."tempos_reparacao" t WHERE t."fim"=$1 ORDER BY t._row_id`, [OPEN_LABOR_FINISH])).rows;
    const today = parsed.data.now.slice(0, 8);
    for (const row of open) {
      const key = dateTimeComparisonKey(row.inicio);
      if (laborDateTimeMilliseconds(row.inicio) === null) { await client.query("ROLLBACK"); return { kind: "unsupported" }; }
      if (key!.slice(0, 8) >= today) continue;
      const finish = `${key!.slice(0, 8)}${settings.encerrar_tempos2 ?? ""}000`;
      if (laborDateTimeMilliseconds(finish) === null) { await client.query("ROLLBACK"); return { kind: "unsupported" }; }
      // Source1381–1386 updates all open rows for that numero/mechanic, not only this start.
      await client.query('UPDATE app."tempos_reparacao" SET "fim"=$3,"fim_reparacao_estado"=$4 WHERE "numero"=$1 AND "mecanico"=$2 AND "fim"=$5', [row.numero, row.mecanico, finish, row.Inicio_reparacao_estado, OPEN_LABOR_FINISH]);
    }
    const states = (await stateRows(client)).filter(state => state.tipo !== null && state.tipo >= 2 && state.tipo <= 6);
    const mechanics = (await client.query<RepairOrderMechanic>('SELECT _row_id::text AS id,"Codigo","Descricao" FROM app."mecanicos" ORDER BY "Codigo" ASC NULLS LAST,_row_id')).rows;
    await client.query("COMMIT"); return { kind: "loaded", settings, states, mechanics };
  } catch (error) { await rollbackAfterFailure(client); return { kind: inUse(error) ? "in_use" : "failed" }; }
  finally { await closeOperationClient(client); }
}
export async function listRepairLabor(connect: DatabaseConnection, input: unknown): Promise<RepairLaborListResult> {
  const parsed = repairLaborListSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const filter = parsed.data, values: unknown[] = [], predicates: string[] = ['s."tipo" IN (2,3,4,5,6)'];
    if (filter.mechanic !== null) { values.push(filter.mechanic); predicates.push(`o."reparacao_mecanico"=$${values.length}`); }
    if (filter.states.length > 0) { values.push(filter.states); predicates.push(`o."reparacao_estado"=ANY($${values.length}::text[])`); }
    const orders = (await client.query<RepairLaborOrder>(`SELECT json_build_array(o._row_id::text,s._row_id::text,v._row_id::text,m._row_id::text)::text AS id,o._row_id::text AS "orderId",o."numero"::text,o."matricula",(v."marca"||' ')||v."modelo" AS marcamodelo,o."reparacao_mecanico",o."reparacao_estado",m."Descricao" AS "Descricao_me",s."Descricao",s."tipo",s."Cor"::double precision AS "Cor",o."recepcao_prioridade",o."reparacao_estado_data",o."reparacao_estado_obs",o."reparacao_servico"
      FROM app."ordem_reparacao" o INNER JOIN app."estados_reparacao" s ON o."reparacao_estado"=s."Codigo" INNER JOIN app."Viaturas" v ON o."matricula"=v."matricula" LEFT JOIN app."mecanicos" m ON m."Codigo"=o."reparacao_mecanico" WHERE ${predicates.join(" AND ")} ORDER BY o."numero" ASC NULLS LAST,o._row_id,s._row_id,v._row_id,m._row_id`, values)).rows;
    return { kind: "loaded", orders };
  } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function readRepairLabor(connect: DatabaseConnection, input: unknown): Promise<RepairLaborReadResult> {
  const parsed = repairLaborNumberSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const order = await detail(client, parsed.data.numero); if (!order) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const raw = await rawLabor(client, parsed.data.numero), materials = await materialRows(client, parsed.data.numero);
    const labor = (await client.query<RepairLaborRow>(`SELECT json_build_array(t._row_id::text,m._row_id::text)::text AS id,t."numero"::text,t."mecanico",t."inicio",t."fim",t."Inicio_reparacao_estado",t."fim_reparacao_estado",t."tempos_reparacaoID"::text,m."Descricao" FROM app."tempos_reparacao" t INNER JOIN app."mecanicos" m ON m."Codigo"=t."mecanico" WHERE t."numero"=$1 ORDER BY t._row_id,m._row_id`, [parsed.data.numero])).rows;
    const choices = (await stateRows(client)).filter(state => state.tipo !== null && state.tipo >= 3 && state.tipo <= 7);
    await client.query("COMMIT"); return { kind: "loaded", order, labor, materials, baseline: baseline(order, raw, choices), materialBaseline: JSON.stringify(materials), choices };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function authenticateRepairLabor(connect: DatabaseConnection, input: unknown): Promise<RepairLaborAuthenticateResult> {
  const parsed = repairLaborAuthenticateSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try { const mechanic = await authenticate(client, parsed.data); return mechanic ? { kind: "authenticated", mechanic } : { kind: "denied" }; }
  catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function prepareRepairLabor(connect: DatabaseConnection, input: unknown): Promise<RepairLaborPrepareResult> {
  const parsed = repairLaborPrepareSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    if (!await authenticate(client, parsed.data.proof)) { await client.query("ROLLBACK"); return { kind: "denied" }; }
    const plan = await laborPlan(client, parsed.data.numero, parsed.data.proof.mechanic); await client.query("COMMIT");
    return plan ? { kind: "prepared", baseline: plan.baseline, finish: plan.finish, stateAllowed: plan.stateAllowed, others: plan.others.map(({ numero, matricula }) => ({ numero, matricula })) } : { kind: "missing" };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function toggleRepairLabor(connect: DatabaseConnection, input: unknown): Promise<RepairLaborWriteResult> {
  const parsed = repairLaborToggleSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const command = parsed.data;
    await client.query("BEGIN"); await lock(client, ["mecanicos", "estados_reparacao", "ordem_reparacao", "tempos_reparacao"]);
    if (!await authenticate(client, command.proof)) { await client.query("ROLLBACK"); return { kind: "denied" }; }
    const plan = await laborPlan(client, command.numero, command.proof.mechanic);
    if (!plan) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    if (plan.baseline !== command.baseline) { await client.query("ROLLBACK"); return { kind: "stale" }; }
    if (command.closeOthers.some(numero => !plan.others.some(row => row.numero === numero))) { await client.query("ROLLBACK"); return { kind: "invalid" }; }
    const state = command.state === null ? null : plan.states.find(row => row.id === command.state && (row.tipo === 3 || row.tipo === 4 || row.tipo === 5));
    if (!plan.finish && !plan.stateAllowed && !state) { await client.query("ROLLBACK"); return { kind: "invalid" }; }
    for (const other of plan.others) if (command.closeOthers.includes(other.numero)) await client.query('UPDATE app."tempos_reparacao" SET "fim"=$3,"fim_reparacao_estado"=$4 WHERE "numero"=$1 AND "mecanico"=$2 AND "fim"=$5', [other.numero, command.proof.mechanic, command.now, other.state, OPEN_LABOR_FINISH]);
    if (plan.finish) {
      await client.query('UPDATE app."tempos_reparacao" SET "fim"=$4,"fim_reparacao_estado"=$5 WHERE "numero"=$1 AND "mecanico"=$2 AND "inicio"=$3', [command.numero, command.proof.mechanic, plan.latest!.inicio, command.now, plan.order.reparacao_estado]);
    } else {
      if (!plan.stateAllowed && state) await client.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=$2 WHERE "numero"=$1', [command.numero, state.Codigo]);
      const next = (await client.query<{ next: string }>('SELECT (GREATEST(COALESCE(MAX("tempos_reparacaoID"),0),0)+1)::text AS next FROM app."tempos_reparacao"')).rows[0].next;
      if (BigInt(next) > 9223372036854775807n) { await client.query("ROLLBACK"); return { kind: "failed" }; }
      // Source386/420 keeps the pre-update order buffer's state. Omitted finish gets the source zero sentinel.
      await client.query('INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim","Inicio_reparacao_estado","fim_reparacao_estado") VALUES ($1,$2,$3,$4,$5,$6,$7)', [next, command.numero, command.proof.mechanic, command.now, OPEN_LABOR_FINISH, plan.order.reparacao_estado, ""]);
    }
    await client.query("COMMIT"); return { kind: "saved" };
  } catch (error) { await rollbackAfterFailure(client); return { kind: inUse(error) ? "in_use" : "failed" }; } finally { await closeOperationClient(client); }
}
export async function saveRepairLaborState(connect: DatabaseConnection, input: unknown): Promise<RepairLaborWriteResult> {
  const parsed = repairLaborStateSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const command = parsed.data;
    await client.query("BEGIN"); await lock(client, ["estados_reparacao", "ordem_reparacao", "tempos_reparacao"]);
    const order = await detail(client, command.numero); if (!order) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const choices = (await stateRows(client)).filter(state => state.tipo !== null && state.tipo >= 3 && state.tipo <= 7);
    if (baseline(order, await rawLabor(client, command.numero), choices) !== command.baseline) { await client.query("ROLLBACK"); return { kind: "stale" }; }
    const state = command.stateId === null ? null : choices.find(row => row.id === command.stateId);
    // No invented required-state rule. No-selection/NULL native concatenation is unsupported/U05.
    const history = state && command.when !== null ? laborStateHistory(order.reparacao_estado_historico, command.when, state.Descricao, command.description) : null;
    if (!state || history === null) { await client.query("ROLLBACK"); return { kind: "unsupported" }; }
    await client.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=$2,"reparacao_estado_obs"=$3,"reparacao_servico"=$4,"reparacao_estado_data"=$5,"reparacao_estado_historico"=$6 WHERE "numero"=$1', [command.numero, state.Codigo, command.description, command.service, command.when, history]);
    if (state.tipo === 6 || state.tipo === 7) await client.query('UPDATE app."tempos_reparacao" SET "fim"=$2,"fim_reparacao_estado"=$3 WHERE "numero"=$1 AND "fim"=$4', [command.numero, command.now, state.Codigo, OPEN_LABOR_FINISH]);
    await client.query("COMMIT"); return { kind: "saved" };
  } catch (error) { await rollbackAfterFailure(client); return { kind: inUse(error) ? "in_use" : "failed" }; } finally { await closeOperationClient(client); }
}
export async function tickRepairLabor(connect: DatabaseConnection, input: unknown): Promise<RepairLaborWriteResult> {
  const parsed = repairLaborTickSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN"); await lock(client, ["ordem_reparacao", "tempos_reparacao"]);
    const settings = (await client.query<RepairLaborSettings>('SELECT "Tempo_tempos"::text,"encerrar_tempos1","encerrar_tempos2" FROM app."sistema" ORDER BY _row_id LIMIT 1')).rows[0];
    if (settings && laborWithinClosure(parsed.data.now, settings.encerrar_tempos1, settings.encerrar_tempos2)) {
      // Source1454–1470 uses the visible order state, even for other orders of its mechanic.
      for (const visible of parsed.data.visible) {
        if (visible.mechanic === null) continue;
        const current = await client.query(`SELECT 1 FROM app."ordem_reparacao" o INNER JOIN app."estados_reparacao" s ON s."Codigo"=o."reparacao_estado" INNER JOIN app."Viaturas" v ON v."matricula"=o."matricula" WHERE o."numero"=$1 AND o."reparacao_mecanico"=$2 AND o."reparacao_estado" IS NOT DISTINCT FROM $3 AND s."tipo" IN (2,3,4,5,6) LIMIT 1`, [visible.numero, visible.mechanic, visible.state]);
        if (current.rowCount === 0) { await client.query("ROLLBACK"); return { kind: "stale" }; }
        await client.query('UPDATE app."tempos_reparacao" t SET "fim"=$2,"fim_reparacao_estado"=$3 WHERE t."mecanico"=$1 AND t."fim"=$4 AND EXISTS(SELECT 1 FROM app."ordem_reparacao" o WHERE o."numero"=t."numero")', [visible.mechanic, parsed.data.now, visible.state, OPEN_LABOR_FINISH]);
      }
    }
    await client.query("COMMIT"); return { kind: "saved" };
  } catch (error) { await rollbackAfterFailure(client); return { kind: inUse(error) ? "in_use" : "failed" }; } finally { await closeOperationClient(client); }
}
export async function saveRepairLaborMaterials(connect: DatabaseConnection, input: unknown): Promise<RepairLaborWriteResult> {
  const parsed = repairLaborMaterialSaveSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  if (parsed.data.rows.some(row => row.preco !== null && !/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(row.preco))) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const command = parsed.data;
    await client.query("BEGIN"); await lock(client, ["ordem_reparacao", "material_reparacao"]);
    const rows = await materialRows(client, command.numero);
    if (JSON.stringify(rows) !== command.baseline || rows.length !== command.rows.length || new Set(command.rows.map(row => row.id)).size !== rows.length || command.rows.some(row => !rows.some(current => current.id === row.id))) { await client.query("ROLLBACK"); return { kind: "stale" }; }
    // Source963–969: preserve exact original predicate and ordered overwrite of matching duplicates.
    for (const original of rows) {
      const draft = command.rows.find(row => row.id === original.id)!;
      await client.query('UPDATE app."material_reparacao" SET "lancado"=$4,"extra"=$5,"preco"=$6 WHERE "numero"=$1 AND "artigo"=$2 AND "data_hora"=$3', [command.numero, original.artigo, original.data_hora, draft.lancado, draft.extra, draft.preco]);
    }
    await client.query("COMMIT"); return { kind: "saved" };
  } catch (error) { await rollbackAfterFailure(client); return { kind: inUse(error) ? "in_use" : "failed" }; } finally { await closeOperationClient(client); }
}
