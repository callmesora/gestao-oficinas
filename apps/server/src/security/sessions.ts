import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Client } from "pg";
import type { FastifyRequest } from "fastify";
import { authenticationEnrollmentSchema, authenticationLoginSchema, type AuthenticationResult, type AuthenticationStatus, type AuthenticationCheck, type AuthenticationUserListResult } from "../../../../packages/domain/src/authentication";
import { userListSchema, userUppercase, type UserListRow } from "../../../../packages/domain/src/users";
import { connectOperationClient, closeOperationClient, rollbackAfterFailure, type DatabaseConnection } from "../db/connection";
import { hashPassword, verifyPassword, HashCapacityError } from "./passwords";

const publicFields = 'u._row_id::text AS id,u."Codigo",u."Descricao"';
const duration = 8 * 60 * 60 * 1000;
const digest = (token: string) => createHash("sha256").update(token).digest("hex");
const tokenFrom = (request: FastifyRequest) => /^Bearer ([a-f0-9]{64})$/.exec(request.headers.authorization ?? "")?.[1] ?? null;
const incorrect = { kind: "incorrect", message: "Utilizador e/ou palavra-passe incorreto(s)" } as const;
type Credential = UserListRow & { password_hash: string | null; version: string | null };
export function createSessionSecurity(connect: DatabaseConnection, options: { setupToken?: string; now?: () => number } = {}) {
  const now = options.now ?? Date.now, setupDigest = options.setupToken ? digest(options.setupToken) : null;
  const attempts = new Map<string, { count: number; expiry: number }>();
  function permitted(address: string, code: number): boolean {
    const at = now();
    for (const [key, value] of attempts) if (value.expiry <= at) attempts.delete(key);
    const key = `${address}:${code}`, previous = attempts.get(key);
    if (previous && previous.count >= 10) return false;
    // Bound attacker-controlled keys as well as expensive hash work.
    if (!previous && attempts.size >= 10000) return false;
    attempts.set(key, { count: (previous?.count ?? 0) + 1, expiry: previous?.expiry ?? at + 60000 }); return true;
  }
  async function issue(client: Client, user: UserListRow, version: string) {
    const token = randomBytes(32).toString("hex"), expiresAt = new Date(now() + duration).toISOString();
    await client.query('INSERT INTO auth.sessions (token_hash,user_id,credential_version,expires_at) VALUES ($1,$2,$3,$4)', [digest(token), user.id, version, expiresAt]);
    return { kind: "continuar", user, session: { token, expiresAt, user } } as const;
  }
  async function status(): Promise<AuthenticationStatus> {
    const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
    try {
      const result = await client.query<{ credentials: boolean; consumed: boolean; users: boolean }>('SELECT EXISTS(SELECT 1 FROM auth.credentials c JOIN app."utilizadores" u ON u._row_id=c.user_id) AS credentials,(SELECT consumed FROM auth.enrollment WHERE singleton) AS consumed,EXISTS(SELECT 1 FROM app."utilizadores") AS users');
      const row = result.rows[0]; return { kind: "ready", setupRequired: !row.credentials, setupAvailable: !row.credentials && !row.consumed && setupDigest !== null, emptyUsers: !row.users };
    } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
  }
  async function users(input: unknown): Promise<AuthenticationUserListResult> {
    const parsed = userListSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
    const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
    try {
      // Source pre-login picker exposes public code/name only. No credential or internal source ID.
      const result = await client.query<Pick<UserListRow, "Codigo" | "Descricao">>(`SELECT u."Codigo",u."Descricao" FROM app."utilizadores" u ORDER BY u."${parsed.data.sort ?? "utilizadoresID"}" ${parsed.data.descending ? "DESC" : "ASC"} NULLS LAST,u._row_id`);
      return { kind: "loaded", users: result.rows };
    } catch { return { kind: "failed" }; } finally { await closeOperationClient(client); }
  }
  async function login(input: unknown, address: string): Promise<AuthenticationResult> {
    const parsed = authenticationLoginSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
    const password = userUppercase(parsed.data.password);
    if (password.length > 15) return { kind: "invalid" };
    if (!permitted(address, parsed.data.code)) return { kind: "throttled" };
    const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
    try {
      const result = await client.query<Credential>(`SELECT ${publicFields},c.password_hash,c.version::text FROM app."utilizadores" u LEFT JOIN auth.credentials c ON c.user_id=u._row_id WHERE u."Codigo"=$1 ORDER BY u._row_id LIMIT 1`, [parsed.data.code]);
      const row = result.rows[0]; if (!row) return { kind: "missing" };
      if (row.password_hash === null || row.version === null) return { kind: "resetRequired" };
      if (!await verifyPassword(password, row.password_hash)) return incorrect;
      await client.query("BEGIN");
      // Reset/delete lock credentials before sessions. Serialize here before holding a row.
      await client.query("LOCK TABLE auth.credentials IN ROW EXCLUSIVE MODE");
      const current = await client.query('SELECT 1 FROM auth.credentials c JOIN app."utilizadores" u ON u._row_id=c.user_id WHERE c.user_id=$1 AND c.version=$2 AND c.password_hash=$3 FOR UPDATE OF c', [row.id, row.version, row.password_hash]);
      if (!current.rowCount) { await client.query("ROLLBACK"); return incorrect; }
      const reply = await issue(client, { id: row.id, Codigo: row.Codigo, Descricao: row.Descricao }, row.version);
      await client.query("COMMIT"); return reply;
    } catch (error) { await rollbackAfterFailure(client); return { kind: error instanceof HashCapacityError ? "throttled" : "failed" }; }
    finally { await closeOperationClient(client); }
  }
  async function enroll(input: unknown, address: string): Promise<AuthenticationResult> {
    const parsed = authenticationEnrollmentSchema.safeParse(input); if (!parsed.success) return { kind: "invalid" };
    if (!permitted(address, parsed.data.code)) return { kind: "throttled" };
    if (setupDigest === null || !timingSafeEqual(Buffer.from(digest(parsed.data.token), "hex"), Buffer.from(setupDigest, "hex"))) return { kind: "unavailable" };
    const password = userUppercase(parsed.data.password); if (password.length > 15) return { kind: "invalid" };
    const client = await connectOperationClient(connect); if (!client) return { kind: "failed" };
    try {
      const passwordHash = await hashPassword(password);
      await client.query("BEGIN");
      await client.query('LOCK TABLE app."utilizadores",auth.credentials,auth.enrollment IN SHARE ROW EXCLUSIVE MODE');
      const state = await client.query<{ consumed: boolean; credentials: boolean }>('SELECT consumed,EXISTS(SELECT 1 FROM auth.credentials) AS credentials FROM auth.enrollment WHERE singleton FOR UPDATE');
      if (state.rows[0].consumed || state.rows[0].credentials) { await client.query("ROLLBACK"); return { kind: "unavailable" }; }
      const present = await client.query('SELECT 1 FROM app."utilizadores" LIMIT 1');
      let result;
      if (present.rowCount) result = await client.query<UserListRow>(`SELECT ${publicFields} FROM app."utilizadores" u WHERE u."Codigo"=$1 ORDER BY u._row_id LIMIT 1`, [parsed.data.code]);
      else {
        if (parsed.data.code !== 1) { await client.query("ROLLBACK"); return { kind: "missing" }; }
        result = await client.query<UserListRow>('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,1,$1,NULL) RETURNING _row_id::text AS id,"Codigo","Descricao"', ["Administrador"]);
      }
      const user = result.rows[0]; if (!user) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      await client.query('INSERT INTO auth.credentials (user_id,password_hash) VALUES ($1,$2)', [user.id, passwordHash]);
      // Only this explicit reset clears its copied plaintext. Originals/import evidence stay untouched.
      await client.query('UPDATE app."utilizadores" SET "palavra_passe"=NULL WHERE _row_id=$1', [user.id]);
      await client.query('UPDATE auth.enrollment SET consumed=true WHERE singleton');
      const reply = await issue(client, user, "1");
      await client.query("COMMIT"); return reply;
    } catch (error) { await rollbackAfterFailure(client); return { kind: error instanceof HashCapacityError ? "throttled" : "failed" }; }
    finally { await closeOperationClient(client); }
  }
  async function inspect(request: FastifyRequest): Promise<AuthenticationCheck> {
    const token = tokenFrom(request); if (!token) return { kind: "unauthenticated" };
    const client = await connectOperationClient(connect); if (!client) return { kind: "unauthenticated" };
    try {
      const result = await client.query<UserListRow & { expiresAt: Date }>(`SELECT ${publicFields},s.expires_at AS "expiresAt" FROM auth.sessions s JOIN auth.credentials c ON c.user_id=s.user_id AND c.version=s.credential_version JOIN app."utilizadores" u ON u._row_id=c.user_id WHERE s.token_hash=$1 AND s.expires_at>$2`, [digest(token), new Date(now())]);
      const row = result.rows[0]; return row ? { kind: "authenticated", user: { id: row.id, Codigo: row.Codigo, Descricao: row.Descricao }, expiresAt: row.expiresAt.toISOString() } : { kind: "unauthenticated" };
    } catch { return { kind: "unauthenticated" }; } finally { await closeOperationClient(client); }
  }
  async function logout(request: FastifyRequest) {
    const token = tokenFrom(request); if (!token) return { kind: "loggedOut" } as const;
    const client = await connectOperationClient(connect); if (!client) return { kind: "failed" } as const;
    try { await client.query('DELETE FROM auth.sessions WHERE token_hash=$1', [digest(token)]); return { kind: "loggedOut" } as const; }
    catch { return { kind: "failed" } as const; }
    finally { await closeOperationClient(client); }
  }
  return { status, users, login, enroll, inspect, logout, async authenticate(request: FastifyRequest) { const result = await inspect(request); return result.kind === "authenticated" ? { userId: result.user.id } : null; } };
}
export type SessionSecurity = ReturnType<typeof createSessionSecurity>;
