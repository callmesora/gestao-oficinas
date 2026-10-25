import { z } from "zod";
import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { accessSchema, systemValuesSchema, systemDefaults, type AccessResult, type StartupResult, type SystemRecord, type SystemReadResult, type SystemSaveResult } from "../../../../packages/domain/src/startup";
import { userUppercase } from "../../../../packages/domain/src/users";
const empty = z.strictObject({});
const fields = '_row_id::text AS id,"Tempo_ordem_reparacao"::text,"Tempo_materiais"::text,"Tempo_tempos"::text,"Data_inicio","encerrar_tempos1","encerrar_tempos2"';
const keys = Object.keys(systemDefaults);

/** Source safe system defaults only; an empty user file never creates an embedded credential. */
export async function initialiseStartup(connect: DatabaseConnection, input: unknown): Promise<StartupResult> {
  if (!empty.safeParse(input).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."sistema" IN SHARE ROW EXCLUSIVE MODE');
    let result = await client.query<SystemRecord>(`SELECT ${fields} FROM app."sistema" ORDER BY _row_id LIMIT 1`);
    if (!result.rowCount) result = await client.query<SystemRecord>(`INSERT INTO app."sistema" (${keys.map(key => `"${key}"`).join(",")}) VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${fields}`, Object.values(systemDefaults));
    // Public existence only: no credentials read during startup or public listing.
    const users = await client.query<{ present: boolean }>('SELECT EXISTS(SELECT 1 FROM app."utilizadores") AS present');
    await client.query("COMMIT");
    return { kind: "ready", system: result.rows[0], bootstrapRequired: !users.rows[0].present };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}
export async function readSystem(connect: DatabaseConnection, input: unknown): Promise<SystemReadResult> {
  if (!empty.safeParse(input).success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try { const result = await client.query<SystemRecord>(`SELECT ${fields} FROM app."sistema" ORDER BY _row_id LIMIT 1`); return { kind: "loaded", system: result.rows[0] ?? null }; }
  catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
export async function saveSystem(connect: DatabaseConnection, input: unknown): Promise<SystemSaveResult> {
  const parsed = systemValuesSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN"); await client.query('LOCK TABLE app."sistema" IN SHARE ROW EXCLUSIVE MODE');
    const first = await client.query<{ id: string }>('SELECT _row_id::text AS id FROM app."sistema" ORDER BY _row_id LIMIT 1');
    const values = keys.map(key => parsed.data[key as keyof typeof parsed.data]);
    // WIN_sistema198–214 rereads first at save; current provenance and other rows stay intact.
    const result = first.rowCount ? await client.query<SystemRecord>(`UPDATE app."sistema" SET ${keys.map((key, index) => `"${key}"=$${index + 1}`).join(",")} WHERE _row_id=$7 RETURNING ${fields}`, [...values, first.rows[0].id])
      : await client.query<SystemRecord>(`INSERT INTO app."sistema" (${keys.map(key => `"${key}"`).join(",")}) VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${fields}`, values);
    await client.query("COMMIT"); return { kind: "saved", system: result.rows[0] };
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
/** ADR004: selected compare only inside an already authenticated context; no production session adoption. */
export async function checkStartupAccess(connect: DatabaseConnection, input: unknown): Promise<AccessResult> {
  const parsed = accessSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
  try {
    const result = await client.query<{ id: string; Codigo: number; Descricao: string | null; matches: boolean }>('SELECT _row_id::text AS id,"Codigo","Descricao",("palavra_passe"=$2) IS TRUE AS matches FROM app."utilizadores" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1', [parsed.data.code, userUppercase(parsed.data.password)]);
    const row = result.rows[0]; if (!row) return { kind: "missing" };
    return row.matches ? { kind: "continuar", user: { id: row.id, Codigo: row.Codigo, Descricao: row.Descricao } }
      : { kind: "incorrect", message: "Utilizador e/ou palavra-passe incorreto(s)" };
  } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
}
