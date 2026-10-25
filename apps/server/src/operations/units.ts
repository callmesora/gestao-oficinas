import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { unitIdentitySchema, unitListSchema, unitSaveSchema, unitRequiredMessage, unitDuplicateMessage,
  type Unit, type UnitListResult, type UnitSaveResult, type UnitDeleteResult } from "../../../../packages/domain/src/units";

const returning = `_row_id::text AS id,"unidadesID"::text,"Codigo","Descricao"`;
const associatedMessage = "Unidade usada em artigos, não pode ser eliminada";

export async function listUnits(connect: DatabaseConnection, input: unknown): Promise<UnitListResult> {
  const parsed = unitListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<Unit>(`SELECT ${returning} FROM app."unidades" u ORDER BY u."${parsed.data.sort ?? "unidadesID"}" ${parsed.data.descending ? "DESC" : "ASC"},u._row_id`);
    return { kind: "loaded", units: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveUnit(connect: DatabaseConnection, input: unknown): Promise<UnitSaveResult> {
  const parsed = unitSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, required = unitRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-011: serialize allocation/exact new key checks without altering imported text indexes.
    await client.query('LOCK TABLE app."unidades" IN SHARE ROW EXCLUSIVE MODE');
    let result;
    if (command.mode === "create") {
      const duplicate = await client.query('SELECT 1 FROM app."unidades" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo]);
      if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: unitDuplicateMessage(values.Codigo) }; }
      result = await client.query<Unit>(`INSERT INTO app."unidades" ("unidadesID","Codigo","Descricao") SELECT GREATEST(COALESCE(MAX("unidadesID"),0),0)+1,$1,$2 FROM app."unidades"
        HAVING GREATEST(COALESCE(MAX("unidadesID"),0),0)<9223372036854775807 RETURNING ${returning}`, [values.Codigo, values.Descricao]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."unidades" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      result = await client.query<Unit>(`UPDATE app."unidades" SET "Descricao"=$1 WHERE _row_id=$2 RETURNING ${returning}`, [values.Descricao, command.id]);
    }
    await client.query("COMMIT");
    return { kind: "saved", unit: result.rows[0] };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-C77806F9-03: rollback, no invented failure message/success fallthrough.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

export async function checkUnitDelete(connect: DatabaseConnection, input: unknown): Promise<UnitDeleteResult | { kind: "ready" }> {
  const parsed = unitIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<{ associated: boolean }>(`SELECT EXISTS(SELECT 1 FROM app."artigos" a WHERE a."unidade"=u."Codigo") AS associated FROM app."unidades" u WHERE u._row_id=$1`, [parsed.data.id]);
    if (!result.rowCount) return { kind: "missing" };
    return result.rows[0].associated ? { kind: "associated", message: associatedMessage } : { kind: "ready" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function deleteUnit(connect: DatabaseConnection, input: unknown): Promise<UnitDeleteResult> {
  const parsed = unitIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."unidades",app."artigos" IN SHARE ROW EXCLUSIVE MODE');
    const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."unidades" WHERE _row_id=$1', [parsed.data.id]);
    if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const articles = await client.query('SELECT 1 FROM app."artigos" WHERE "unidade"=$1 LIMIT 1', [existing.rows[0].Codigo]);
    if (articles.rowCount) { await client.query("ROLLBACK"); return { kind: "associated", message: associatedMessage }; }
    await client.query('DELETE FROM app."unidades" WHERE _row_id=$1', [parsed.data.id]);
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-CCB16084-03: failure presentation remains unrecovered.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
