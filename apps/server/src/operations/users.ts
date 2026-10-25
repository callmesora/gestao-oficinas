import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { userIdentitySchema, userListSchema, userSaveSchema, userValuesSchema, userRequiredMessage, userDuplicateMessage, userUppercase,
  type UserListRow, type UserRecord, type UserListResult, type UserReadResult, type UserSaveResult, type UserDeleteResult } from "../../../../packages/domain/src/users";

// ADR-004/008: public list/save replies omit credentials and the automatic source identifier.
const publicFields = '_row_id::text AS id,"Codigo","Descricao"';
const recordFields = `${publicFields},"utilizadoresID"::text,"palavra_passe"`;

export async function listUsers(connect: DatabaseConnection, input: unknown): Promise<UserListResult> {
  const parsed = userListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // Dossier: TABLE_utilizadores browses utilizadoresID. Qualify typed source columns before transport.
    // NULL placement/internal-id ties remain target defaults under U-CD9683DC-02.
    const direction = parsed.data.sort && parsed.data.descending ? "DESC" : "ASC";
    const result = await client.query<UserListRow>(`SELECT ${publicFields} FROM app."utilizadores" u ORDER BY u."${parsed.data.sort ?? "utilizadoresID"}" ${direction} NULLS LAST,u._row_id`);
    return { kind: "loaded", users: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function readUser(connect: DatabaseConnection, input: unknown): Promise<UserReadResult> {
  const parsed = userIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<UserRecord>(`SELECT ${recordFields} FROM app."utilizadores" WHERE _row_id=$1`, [parsed.data.id]);
    return result.rowCount ? { kind: "loaded", user: result.rows[0] } : { kind: "missing" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveUser(connect: DatabaseConnection, input: unknown): Promise<UserSaveResult> {
  const parsed = userSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, required = userRequiredMessage(command.values);
  if (required) return { kind: "required", message: required };
  // Source always converts after all required checks, even if an existing password was not edited.
  const values = { ...command.values, palavra_passe: userUppercase(command.values.palavra_passe!) };
  // ADR-008/U03: reject expansion beyond the bound field without truncation or acquiring a connection.
  if (!userValuesSchema.safeParse(values).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."utilizadores" IN SHARE ROW EXCLUSIVE MODE');
    let result;
    if (command.mode === "create") {
      const duplicate = await client.query('SELECT 1 FROM app."utilizadores" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo]);
      if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: userDuplicateMessage(values.Codigo!) }; }
      // Source automatic identifiers are signed eight-byte values despite the wider NUMERIC column.
      result = await client.query<UserListRow>(`INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe")
        SELECT GREATEST(COALESCE(MAX("utilizadoresID"),0),0)+1,$1,$2,$3 FROM app."utilizadores"
        HAVING GREATEST(COALESCE(MAX("utilizadoresID"),0),0)<9223372036854775807 RETURNING ${publicFields}`, [values.Codigo, values.Descricao, values.palavra_passe]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const existing = await client.query<{ Codigo: number | null }>('SELECT "Codigo" FROM app."utilizadores" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      result = await client.query<UserListRow>(`UPDATE app."utilizadores" SET "Descricao"=$1,"palavra_passe"=$2 WHERE _row_id=$3 RETURNING ${publicFields}`, [values.Descricao, values.palavra_passe, command.id]);
    }
    await client.query("COMMIT");
    return { kind: "saved", user: result.rows[0] };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-CE3323C9-03: typed rollback/failure never invents a message or claims success.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

export async function deleteUser(connect: DatabaseConnection, input: unknown): Promise<UserDeleteResult> {
  const parsed = userIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."utilizadores" IN SHARE ROW EXCLUSIVE MODE');
    // Verified WIN_Table_utilizadores.wdw:248–257: no relationship, self or last-user restriction.
    const result = await client.query('DELETE FROM app."utilizadores" WHERE _row_id=$1', [parsed.data.id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client);
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
