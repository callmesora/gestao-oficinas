import type { Client } from "pg";
import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { mechanicIdentitySchema, mechanicSaveSchema, mechanicRequiredMessage, mechanicDuplicateMessage, type MechanicReadResult, type MechanicSaveResult, type MechanicDeleteResult, type MechanicListRow } from "../../../../packages/domain/src/mechanics";
import { hashPassword, verifyPassword } from "./passwords";

const fields = '_row_id::text AS id,"Codigo","Descricao","inativo"';
export interface MechanicCredentialPolicy {
  lock(client: Client, write: boolean): Promise<void>;
  verify(client: Client, id: string, password: string, revision: string | undefined, revalidate: boolean): Promise<{ valid: boolean; revision?: string }>;
}

/** ADR004: selected production reads never fetch a copied secret or a password hash. */
export async function readSecureMechanic(connect: DatabaseConnection, input: unknown): Promise<MechanicReadResult> {
  const parsed = mechanicIdentitySchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const result = await client.query(`SELECT ${fields},"mecanicosID"::text,NULL::text AS "palavra_passe",EXISTS(SELECT 1 FROM auth.mechanic_credentials c WHERE c.mechanic_id=m._row_id) AS "credentialManaged" FROM app."mecanicos" m WHERE _row_id=$1`, [parsed.data.id]);
    return result.rowCount ? { kind: "loaded", mechanic: result.rows[0] } : { kind: "missing" };
  } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}

export async function saveSecureMechanic(connect: DatabaseConnection, input: unknown): Promise<MechanicSaveResult> {
  const parsed = mechanicSaveSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, unchanged = command.mode === "update" && command.passwordUnchanged === true;
  const required = mechanicRequiredMessage(values, unchanged); if (required) return { kind: "required", message: required };
  if (unchanged && values.palavra_passe !== null && values.palavra_passe !== "") return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    // Source mechanics do not Upper or trim. Hashing precedes database locks and is globally bounded.
    const passwordHash = unchanged ? null : await hashPassword(values.palavra_passe!);
    await client.query("BEGIN"); await client.query('LOCK TABLE app."mecanicos",auth.mechanic_credentials IN SHARE ROW EXCLUSIVE MODE');
    let result;
    if (command.mode === "create") {
      if ((await client.query('SELECT 1 FROM app."mecanicos" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo])).rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: mechanicDuplicateMessage(values.Codigo!) }; }
      result = await client.query<MechanicListRow>(`INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") SELECT GREATEST(COALESCE(MAX("mecanicosID"),0),0)+1,$1,$2,NULL,$3 FROM app."mecanicos" HAVING GREATEST(COALESCE(MAX("mecanicosID"),0),0)<9223372036854775807 RETURNING ${fields}`, [values.Codigo, values.Descricao, values.inativo]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const old = await client.query<{ Codigo: number | null; managed: boolean }>('SELECT "Codigo",EXISTS(SELECT 1 FROM auth.mechanic_credentials WHERE mechanic_id=m._row_id) AS managed FROM app."mecanicos" m WHERE _row_id=$1', [command.id]);
      if (!old.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (old.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      if (unchanged && !old.rows[0].managed) { await client.query("ROLLBACK"); return { kind: "invalid" }; }
      result = await client.query<MechanicListRow>(`UPDATE app."mecanicos" SET "Descricao"=$1,"inativo"=$2,"palavra_passe"=CASE WHEN $3 THEN NULL ELSE "palavra_passe" END WHERE _row_id=$4 RETURNING ${fields}`, [values.Descricao, values.inativo, passwordHash !== null, command.id]);
    }
    const mechanic = result.rows[0];
    if (passwordHash !== null) await client.query('INSERT INTO auth.mechanic_credentials (mechanic_id,password_hash) VALUES ($1,$2) ON CONFLICT (mechanic_id) DO UPDATE SET password_hash=EXCLUDED.password_hash,version=auth.mechanic_credentials.version+1,changed_at=clock_timestamp()', [mechanic.id, passwordHash]);
    await client.query("COMMIT"); return { kind: "saved", mechanic };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}

export async function deleteSecureMechanic(connect: DatabaseConnection, input: unknown): Promise<MechanicDeleteResult> {
  const parsed = mechanicIdentitySchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN"); await client.query('LOCK TABLE app."mecanicos",auth.mechanic_credentials IN SHARE ROW EXCLUSIVE MODE');
    await client.query('DELETE FROM auth.mechanic_credentials WHERE mechanic_id=$1', [parsed.data.id]);
    const deleted = await client.query('DELETE FROM app."mecanicos" WHERE _row_id=$1', [parsed.data.id]);
    if (!deleted.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    await client.query("COMMIT"); return { kind: "deleted" };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}

/** One bounded failure window per app/address/selected mechanic; successful recurring proofs consume no allowance. */
export function createMechanicCredentials(options: { now?: () => number } = {}) {
  const now = options.now ?? Date.now, failures = new Map<string, { count: number; expires: number }>();
  return (address: string): MechanicCredentialPolicy => ({
    async lock(client, write) {
      // Same order as maintenance. Lock before any order/article/material/labor lock, never across dialogs.
      await client.query(`LOCK TABLE app."mecanicos" IN ${write ? "SHARE ROW EXCLUSIVE MODE NOWAIT" : "SHARE MODE"}`);
      await client.query("LOCK TABLE auth.mechanic_credentials IN SHARE MODE");
    },
    async verify(client, id, password, expected, revalidate) {
      if (password === "" || password.length > 15) return { valid: false };
      const at = now(), key = `${address}:${id}`;
      for (const [old, entry] of failures) if (entry.expires <= at) failures.delete(old);
      if (!failures.has(key) && failures.size >= 10000) return { valid: false };
      if ((failures.get(key)?.count ?? 0) >= 10) return { valid: false };
      const credential = (await client.query<{ password_hash: string; version: string }>('SELECT password_hash,version::text FROM auth.mechanic_credentials WHERE mechanic_id=$1', [id])).rows[0];
      const revision = credential ? `${id}:${credential.version}` : undefined;
      // An old proof cannot silently authorize a same-password reset or a replaced selected row.
      if (revalidate && (expected === undefined || expected !== revision)) return { valid: false };
      if (credential && await verifyPassword(password, credential.password_hash)) { failures.delete(key); return { valid: true, revision }; }
      if (failures.has(key) || failures.size < 10000) { const old = failures.get(key); failures.set(key, { count: (old?.count ?? 0) + 1, expires: old?.expires ?? at + 60000 }); }
      return { valid: false };
    },
  });
}
