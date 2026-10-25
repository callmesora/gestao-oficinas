import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { userIdentitySchema, userSaveSchema, userRequiredMessage, userDuplicateMessage, userUppercase, userValuesSchema, type UserReadResult, type UserSaveResult, type UserDeleteResult, type UserListRow } from "../../../../packages/domain/src/users";
import { hashPassword } from "./passwords";
const fields = '_row_id::text AS id,"Codigo","Descricao"';

/** ADR004 production override: no imported plaintext or hash is ever returned for editing. */
export async function readSecureUser(connect: DatabaseConnection, input: unknown): Promise<UserReadResult> {
  const parsed = userIdentitySchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const result = await client.query(`SELECT ${fields},"utilizadoresID"::text,NULL::text AS "palavra_passe",EXISTS(SELECT 1 FROM auth.credentials c WHERE c.user_id=u._row_id) AS "credentialManaged" FROM app."utilizadores" u WHERE _row_id=$1`, [parsed.data.id]);
    return result.rowCount ? { kind: "loaded", user: result.rows[0] } : { kind: "missing" };
  } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function saveSecureUser(connect: DatabaseConnection, input: unknown): Promise<UserSaveResult> {
  const parsed = userSaveSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, unchanged = command.mode === "update" && command.passwordUnchanged === true;
  const required = userRequiredMessage(command.values, unchanged); if (required) return { kind: "required", message: required };
  if (unchanged && command.values.palavra_passe !== null && command.values.palavra_passe !== "") return { kind: "invalid" };
  const values = { ...command.values, palavra_passe: unchanged ? null : userUppercase(command.values.palavra_passe!) };
  if (!userValuesSchema.safeParse(values).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const passwordHash = unchanged ? null : await hashPassword(values.palavra_passe!);
    await client.query("BEGIN"); await client.query('LOCK TABLE app."utilizadores",auth.credentials,auth.sessions IN SHARE ROW EXCLUSIVE MODE');
    let result;
    if (command.mode === "create") {
      if ((await client.query('SELECT 1 FROM app."utilizadores" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo])).rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: userDuplicateMessage(values.Codigo!) }; }
      result = await client.query<UserListRow>(`INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") SELECT GREATEST(COALESCE(MAX("utilizadoresID"),0),0)+1,$1,$2,NULL FROM app."utilizadores" HAVING GREATEST(COALESCE(MAX("utilizadoresID"),0),0)<9223372036854775807 RETURNING ${fields}`, [values.Codigo, values.Descricao]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const old = await client.query<{ Codigo: number | null; managed: boolean }>('SELECT "Codigo",EXISTS(SELECT 1 FROM auth.credentials WHERE user_id=u._row_id) AS managed FROM app."utilizadores" u WHERE _row_id=$1', [command.id]);
      if (!old.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (old.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      if (unchanged && !old.rows[0].managed) { await client.query("ROLLBACK"); return { kind: "invalid" }; }
      result = await client.query<UserListRow>(`UPDATE app."utilizadores" SET "Descricao"=$1,"palavra_passe"=NULL WHERE _row_id=$2 RETURNING ${fields}`, [values.Descricao, command.id]);
    }
    const user = result.rows[0];
    if (passwordHash !== null) {
      await client.query('INSERT INTO auth.credentials (user_id,password_hash) VALUES ($1,$2) ON CONFLICT (user_id) DO UPDATE SET password_hash=EXCLUDED.password_hash,version=auth.credentials.version+1,changed_at=clock_timestamp()', [user.id, passwordHash]);
      await client.query('DELETE FROM auth.sessions WHERE user_id=$1', [user.id]);
    }
    await client.query("COMMIT"); return { kind: "saved", user };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function deleteSecureUser(connect: DatabaseConnection, input: unknown): Promise<UserDeleteResult> {
  const parsed = userIdentitySchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN"); await client.query('LOCK TABLE app."utilizadores",auth.credentials,auth.sessions IN SHARE ROW EXCLUSIVE MODE');
    await client.query('DELETE FROM auth.sessions WHERE user_id=$1', [parsed.data.id]);
    await client.query('DELETE FROM auth.credentials WHERE user_id=$1', [parsed.data.id]);
    const result = await client.query('DELETE FROM app."utilizadores" WHERE _row_id=$1', [parsed.data.id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    await client.query("COMMIT"); return { kind: "deleted" };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
