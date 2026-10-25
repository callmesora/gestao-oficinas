import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { repairStateIdentitySchema, repairStateListSchema, repairStateSaveSchema, repairStateRequiredMessage, repairStateDuplicateMessage,
  type RepairState, type RepairStateListResult, type RepairStateSaveResult, type RepairStateDeleteResult } from "../../../../packages/domain/src/repair-states";

// The source unsigned32 Cor fits exactly in a JS number; pg bigint otherwise returns a string.
const returning = `_row_id::text AS id,"estados_reparacaoID"::text,"Codigo","Descricao","tipo","Cor"::double precision AS "Cor","lancar_defa","lancar_material","confirmacao","pedir_data_entrega","pedir_data_pag"`;
const associatedMessage = "Estado de reparação associado a ordens de reparação, não pode ser eliminado";
// ADR-012: sort displayed source text, not the backing byte. No raw input reaches SQL identifiers.
const typeDisplay = `CASE "tipo" WHEN 1 THEN 'Recepçao' WHEN 2 THEN 'Aguardar início reparação' WHEN 3 THEN 'Em reparação' WHEN 4 THEN 'Teste' WHEN 5 THEN 'Lavagem' WHEN 6 THEN 'Reparação suspensa' WHEN 7 THEN 'Reparação finalizada' WHEN 8 THEN 'Orçamento' ELSE COALESCE("tipo"::text,'') END`;

export async function listRepairStates(connect: DatabaseConnection, input: unknown): Promise<RepairStateListResult> {
  const parsed = repairStateListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const sort = parsed.data.sort === "tipo" ? typeDisplay : `"${parsed.data.sort ?? "estados_reparacaoID"}"`;
    const result = await client.query<RepairState>(`SELECT ${returning} FROM app."estados_reparacao" ORDER BY ${sort} ${parsed.data.descending ? "DESC" : "ASC"} NULLS LAST,_row_id`);
    return { kind: "loaded", repairStates: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveRepairState(connect: DatabaseConnection, input: unknown): Promise<RepairStateSaveResult> {
  const parsed = repairStateSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, required = repairStateRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-011: exact key/allocation serialization without repairing imported text anomalies.
    await client.query('LOCK TABLE app."estados_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    const bindings = [values.Descricao, values.tipo, values.Cor, values.lancar_defa, values.lancar_material, values.confirmacao, values.pedir_data_entrega, values.pedir_data_pag];
    let result;
    if (command.mode === "create") {
      const duplicate = await client.query('SELECT 1 FROM app."estados_reparacao" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo]);
      if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: repairStateDuplicateMessage(values.Codigo) }; }
      result = await client.query<RepairState>(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor","lancar_defa","lancar_material","confirmacao","pedir_data_entrega","pedir_data_pag")
        SELECT GREATEST(COALESCE(MAX("estados_reparacaoID"),0),0)+1,$9,$1,$2,$3,$4,$5,$6,$7,$8 FROM app."estados_reparacao"
        HAVING GREATEST(COALESCE(MAX("estados_reparacaoID"),0),0)<9223372036854775807 RETURNING ${returning}`, [...bindings, values.Codigo]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."estados_reparacao" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      result = await client.query<RepairState>(`UPDATE app."estados_reparacao" SET "Descricao"=$1,"tipo"=$2,"Cor"=$3,"lancar_defa"=$4,"lancar_material"=$5,"confirmacao"=$6,"pedir_data_entrega"=$7,"pedir_data_pag"=$8 WHERE _row_id=$9 RETURNING ${returning}`, [...bindings, command.id]);
    }
    await client.query("COMMIT");
    return { kind: "saved", repairState: result.rows[0] };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-CE554DEA-03: safe typed failure replaces ambiguous source success fallthrough.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

export async function checkRepairStateDelete(connect: DatabaseConnection, input: unknown): Promise<RepairStateDeleteResult | { kind: "ready" }> {
  const parsed = repairStateIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<{ associated: boolean }>(`SELECT EXISTS(SELECT 1 FROM app."ordem_reparacao" o WHERE o."reparacao_estado"=s."Codigo") AS associated FROM app."estados_reparacao" s WHERE s._row_id=$1`, [parsed.data.id]);
    if (!result.rowCount) return { kind: "missing" };
    return result.rows[0].associated ? { kind: "associated", message: associatedMessage } : { kind: "ready" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function deleteRepairState(connect: DatabaseConnection, input: unknown): Promise<RepairStateDeleteResult> {
  const parsed = repairStateIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-011: future order writes use this state-before-orders lock order.
    await client.query('LOCK TABLE app."estados_reparacao",app."ordem_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."estados_reparacao" WHERE _row_id=$1', [parsed.data.id]);
    if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const orders = await client.query('SELECT 1 FROM app."ordem_reparacao" WHERE "reparacao_estado"=$1 LIMIT 1', [existing.rows[0].Codigo]);
    if (orders.rowCount) { await client.query("ROLLBACK"); return { kind: "associated", message: associatedMessage }; }
    await client.query('DELETE FROM app."estados_reparacao" WHERE _row_id=$1', [parsed.data.id]);
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-CEBED898-03: no invented failure message or success on a failed transaction.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
