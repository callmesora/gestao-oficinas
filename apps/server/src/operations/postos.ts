import type { DatabaseConnection } from "../db/connection";
import { postoIdentitySchema, postoListSchema, postoSaveSchema, postoRequiredMessage, postoDuplicateMessage,
  type Posto, type PostoListResult, type PostoSaveResult, type PostoDeleteResult } from "../../../../packages/domain/src/postos";

const returning = '_row_id::text AS id,"Codigo","Descricao","terminal","teste"';

export async function listPostos(connect: DatabaseConnection, input: unknown): Promise<PostoListResult> {
  const parsed = postoListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connect().catch(() => null);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<Posto>(`SELECT ${returning} FROM app."postos" ORDER BY "${parsed.data.sort ?? "Codigo"}" ${parsed.data.descending ? "DESC" : "ASC"},_row_id`);
    return { kind: "loaded", postos: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await client.end().catch(() => undefined); }
}

export async function savePosto(connect: DatabaseConnection, input: unknown): Promise<PostoSaveResult> {
  const parsed = postoSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, required = postoRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connect().catch(() => null);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-016: serialize numeric key changes and create checks, retaining the existing unique index.
    await client.query('LOCK TABLE app."postos" IN SHARE ROW EXCLUSIVE MODE');
    if (command.mode === "update") {
      const existing = await client.query('SELECT 1 FROM app."postos" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    }
    const duplicate = await client.query('SELECT 1 FROM app."postos" WHERE "Codigo"=$1 AND ($2::bigint IS NULL OR _row_id<>$2) LIMIT 1', [values.Codigo, command.mode === "create" ? null : command.id]);
    if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: postoDuplicateMessage(values.Codigo!) }; }
    const parameters = [values.Codigo, values.Descricao, values.terminal];
    const result = command.mode === "create"
      ? await client.query<Posto>(`INSERT INTO app."postos" ("Codigo","Descricao","terminal","teste") VALUES ($1,$2,$3,'') RETURNING ${returning}`, parameters)
      : await client.query<Posto>(`UPDATE app."postos" SET "Codigo"=$1,"Descricao"=$2,"terminal"=$3 WHERE _row_id=$4 RETURNING ${returning}`, [...parameters, command.id]);
    await client.query("COMMIT");
    return { kind: "saved", posto: result.rows[0] };
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    // UNRESOLVED U-CD4F0FE3-03: typed rollback/failure, never an invented message or false saved result.
    return { kind: "failed" };
  } finally { await client.end().catch(() => undefined); }
}

export async function deletePosto(connect: DatabaseConnection, input: unknown): Promise<PostoDeleteResult> {
  const parsed = postoIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connect().catch(() => null);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."postos" IN SHARE ROW EXCLUSIVE MODE');
    // Verified WIN_Table_postos.wdw:220–236 has no terminal or other relationship guard.
    const result = await client.query('DELETE FROM app."postos" WHERE _row_id=$1', [parsed.data.id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return { kind: "failed" };
  } finally { await client.end().catch(() => undefined); }
}
