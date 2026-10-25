import type { DatabaseConnection } from "../db/connection";
import { descriptiveStateIdentitySchema, descriptiveStateListSchema, descriptiveStateSaveSchema, descriptiveStateRequiredMessage, descriptiveStateDuplicateMessage,
  type DescriptiveState, type DescriptiveStateListResult, type DescriptiveStateSaveResult, type DescriptiveStateDeleteResult } from "../../../../packages/domain/src/descriptive-states";

const returning = `_row_id::text AS id,"estados_descritivosID"::text,"Codigo","Descricao"`;

export async function listDescriptiveStates(connect: DatabaseConnection, input: unknown): Promise<DescriptiveStateListResult> {
  const parsed = descriptiveStateListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connect().catch(() => null);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<DescriptiveState>(`SELECT ${returning} FROM app."estados_descritivos" ORDER BY "${parsed.data.sort ?? "estados_descritivosID"}" ${parsed.data.descending ? "DESC" : "ASC"},_row_id`);
    return { kind: "loaded", descriptiveStates: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await client.end(); }
}

export async function saveDescriptiveState(connect: DatabaseConnection, input: unknown): Promise<DescriptiveStateSaveResult> {
  const parsed = descriptiveStateSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, required = descriptiveStateRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connect().catch(() => null);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-015: serialize allocation/exact new key checks without altering imported text indexes.
    await client.query('LOCK TABLE app."estados_descritivos" IN SHARE ROW EXCLUSIVE MODE');
    let result;
    if (command.mode === "create") {
      const duplicate = await client.query('SELECT 1 FROM app."estados_descritivos" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo]);
      if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: descriptiveStateDuplicateMessage(values.Codigo) }; }
      result = await client.query<DescriptiveState>(`INSERT INTO app."estados_descritivos" ("estados_descritivosID","Codigo","Descricao") SELECT GREATEST(COALESCE(MAX("estados_descritivosID"),0),0)+1,$1,$2 FROM app."estados_descritivos"
        HAVING GREATEST(COALESCE(MAX("estados_descritivosID"),0),0)<9223372036854775807 RETURNING ${returning}`, [values.Codigo, values.Descricao]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."estados_descritivos" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      result = await client.query<DescriptiveState>(`UPDATE app."estados_descritivos" SET "Descricao"=$1 WHERE _row_id=$2 RETURNING ${returning}`, [values.Descricao, command.id]);
    }
    await client.query("COMMIT");
    return { kind: "saved", descriptiveState: result.rows[0] };
  } catch {
    await client.query("ROLLBACK");
    // UNRESOLVED U-CB7C31CC-03: rollback, no invented failure message/success fallthrough.
    return { kind: "failed" };
  } finally { await client.end(); }
}

export async function deleteDescriptiveState(connect: DatabaseConnection, input: unknown): Promise<DescriptiveStateDeleteResult> {
  const parsed = descriptiveStateIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connect().catch(() => null);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."estados_descritivos" IN SHARE ROW EXCLUSIVE MODE');
    const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."estados_descritivos" WHERE _row_id=$1', [parsed.data.id]);
    if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    await client.query('DELETE FROM app."estados_descritivos" WHERE _row_id=$1', [parsed.data.id]);
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await client.query("ROLLBACK");
    // UNRESOLVED U-CC5618D6-03: failure presentation remains unrecovered.
    return { kind: "failed" };
  } finally { await client.end(); }
}
