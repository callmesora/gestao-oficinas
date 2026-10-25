import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import { createSessionSecurity } from "./sessions";
import { hashPassword, verifyPassword } from "./passwords";
let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: () => Promise<Client>, app: ReturnType<typeof createApp>;
let at = Date.UTC(2026, 9, 25, 12), acquisitions = 0;
const setupToken = "a".repeat(64), origin = "http://localhost:1435";
function freshApp() { return createApp({ security: createSessionSecurity(async () => { acquisitions++; return connect(); }, { setupToken, now: () => at }), origins: [origin], userConnect: connect, startupConnect: connect, customerConnect: connect }); }
beforeAll(async () => { engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database); const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => engine.connect(name); }, 60000);
afterAll(async () => { await app?.close(); await database?.end(); await engine?.stop(); }, 60000);
beforeEach(async () => {
  await app?.close(); await database.query('TRUNCATE auth.sessions,auth.credentials,app."utilizadores" RESTART IDENTITY'); await database.query('UPDATE auth.enrollment SET consumed=false');
  at = Date.UTC(2026, 9, 25, 12); acquisitions = 0; app = freshApp();
});
async function post(action: string, body: unknown = {}, token?: string) {
  const response = await app.inject({ method: "POST", url: `/api/auth/${action}`, payload: JSON.stringify(body), headers: { origin, "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) } });
  expect(response.statusCode).toBe(200); expect(response.headers["cache-control"]).toBe("no-store"); return response.json();
}
async function enroll() { const response = await post("enroll", { code: 1, password: "Synthetic42", token: setupToken }); expect(response.kind).toBe("continuar"); return response.session.token as string; }
it("ADR004 real empty-database enrollment chooses a password, creates only source Administrator and never stores/returns it", async () => {
  expect(await post("status")).toEqual({ kind: "ready", setupRequired: true, setupAvailable: true, emptyUsers: true });
  expect(await post("enroll", { code: 1, password: "Synthetic42", token: "b".repeat(64) })).toEqual({ kind: "unavailable" });
  const token = await enroll(); expect(token).toMatch(/^[a-f0-9]{64}$/);
  expect((await database.query('SELECT "Codigo","Descricao","palavra_passe" FROM app."utilizadores"')).rows).toEqual([{ Codigo: 1, Descricao: "Administrador", palavra_passe: null }]);
  const stored = (await database.query('SELECT password_hash FROM auth.credentials')).rows[0].password_hash as string; expect(stored).toMatch(/^scrypt\$v1\$131072\$8\$1\$/); expect(stored).not.toContain("SYNTHETIC42");
  expect(await verifyPassword("SYNTHETIC42", stored)).toBe(true); expect(await verifyPassword("Synthetic42", stored)).toBe(false);
  const rows = (await database.query('SELECT token_hash FROM auth.sessions')).rows; expect(rows).toHaveLength(1); expect(rows[0].token_hash).not.toBe(token); expect(rows[0].token_hash).toMatch(/^[a-f0-9]{64}$/);
  expect(await post("users")).toEqual({ kind: "loaded", users: [{ Codigo: 1, Descricao: "Administrador" }] });
  expect(await post("status")).toEqual({ kind: "ready", setupRequired: false, setupAvailable: false, emptyUsers: false });
});
it("ADR004 existing imported credentials are never accepted or rehashed; only explicit selected-account enrollment clears that copied plaintext", async () => {
  await database.query('INSERT INTO app."utilizadores" ("Codigo","Descricao","palavra_passe") VALUES (7,$1,$2),(8,$3,$4)', ["Selected", "OLD-SYNTHETIC", "Other", "OTHER-SYNTH"]);
  expect((await post("login", { code: 7, password: "OLD-SYNTHETIC" })).kind).toBe("resetRequired");
  expect((await database.query('SELECT count(*)::text AS count FROM auth.credentials')).rows[0].count).toBe("0");
  expect((await post("enroll", { code: 7, password: "Replacement", token: setupToken })).kind).toBe("continuar");
  expect((await database.query('SELECT "palavra_passe" IS NULL AS cleared FROM app."utilizadores" ORDER BY "Codigo"')).rows).toEqual([{ cleared: true }, { cleared: false }]);
  expect((await post("login", { code: 8, password: "OTHER-SYNTH" })).kind).toBe("resetRequired");
  expect((await post("enroll", { code: 8, password: "Replacement", token: setupToken })).kind).toBe("unavailable");
});
it("SRC-7891e7fd29 selected code and Upper are real access checks; wrong password shows exact source text and missing selection stays distinct", async () => {
  await enroll();
  expect((await post("login", { code: 1, password: "synthetic42" })).kind).toBe("continuar");
  expect(await post("login", { code: 1, password: "wrong" })).toEqual({ kind: "incorrect", message: "Utilizador e/ou palavra-passe incorreto(s)" });
  expect(await post("login", { code: 99, password: "Synthetic42" })).toEqual({ kind: "missing" });
  expect(await post("login", { code: 1, password: "0123456789012345" })).toEqual({ kind: "invalid" });
});
it("ADR004 live sessions survive service restart, expire after exactly8h and logout revokes the actual token", async () => {
  const token = await enroll(); await app.close(); app = freshApp();
  expect((await post("session", {}, token)).kind).toBe("authenticated"); at += 8 * 3600000 - 1; expect((await post("session", {}, token)).kind).toBe("authenticated"); at++;
  expect(await post("session", {}, token)).toEqual({ kind: "unauthenticated" });
  const next = await post("login", { code: 1, password: "Synthetic42" }); expect(next.kind).toBe("continuar");
  expect(await post("logout", {}, next.session.token)).toEqual({ kind: "loggedOut" }); expect(await post("session", {}, next.session.token)).toEqual({ kind: "unauthenticated" });
});
it("ADR004 every protected resource denies direct anonymous requests before acquiring a database; untrusted browser origins are denied", async () => {
  for (const [resource, action] of [["customers", "list"], ["vehicles", "save"], ["units", "save"], ["terminals", "save"], ["postos", "save"], ["mechanics", "read"], ["repair-states", "save"], ["document-types", "save"], ["articles", "save"], ["users", "list"], ["users", "read"], ["users", "save"], ["users", "delete"], ["repair-orders", "save"], ["repair-materials", "save"], ["repair-labor", "toggle"], ["stock", "save"], ["startup", "initialise"], ["reports", "render"], ["report-filters", "states"]]) {
    const response = await app.inject({ method: "POST", url: `/api/${resource}/${action}`, payload: {} }); expect(response.statusCode, `${resource}/${action}`).toBe(401); expect(response.json()).toEqual({ kind: "unauthenticated" });
  }
  expect(acquisitions).toBe(0);
  expect((await app.inject({ method: "POST", url: "/api/auth/status", headers: { origin: "https://untrusted.invalid" }, payload: {} })).statusCode).toBe(403); expect(acquisitions).toBe(0);
  expect((await app.inject({ method: "POST", url: "/api/development/session", headers: { origin, "x-isolated-development": "1" }, payload: {} })).statusCode).toBe(404);
});
it("ADR004 secure user read/reset/description save never leaks a secret and reset revokes other sessions atomically", async () => {
  const token = await enroll(), initial = await post("session", {}, token), id = initial.user.id;
  const read = await app.inject({ method: "POST", url: "/api/users/read", headers: { authorization: `Bearer ${token}` }, payload: { id } });
  expect(read.statusCode).toBe(200); expect(read.json().user).toMatchObject({ palavra_passe: null, credentialManaged: true }); expect(read.body).not.toContain("scrypt");
  const keep = await app.inject({ method: "POST", url: "/api/users/save", headers: { authorization: `Bearer ${token}` }, payload: { mode: "update", id, passwordUnchanged: true, values: { Codigo: 1, Descricao: "Renamed", palavra_passe: null } } });
  expect(keep.json().kind).toBe("saved"); expect((await post("session", {}, token)).kind).toBe("authenticated");
  const reset = await app.inject({ method: "POST", url: "/api/users/save", headers: { authorization: `Bearer ${token}` }, payload: { mode: "update", id, values: { Codigo: 1, Descricao: "Renamed", palavra_passe: "NewSynthetic" } } });
  expect(reset.json().kind).toBe("saved"); expect(reset.body).not.toContain("NewSynthetic"); expect(await post("session", {}, token)).toEqual({ kind: "unauthenticated" });
  expect((await post("login", { code: 1, password: "Synthetic42" })).kind).toBe("incorrect"); expect((await post("login", { code: 1, password: "newsynthetic" })).kind).toBe("continuar");
});
it("ADR004 deleting the last account revokes its tokens and does not reactivate consumed enrollment", async () => {
  const token = await enroll(), user = (await post("session", {}, token)).user;
  const removed = await app.inject({ method: "POST", url: "/api/users/delete", headers: { authorization: `Bearer ${token}` }, payload: { id: user.id } }); expect(removed.json()).toEqual({ kind: "deleted" });
  expect(await post("session", {}, token)).toEqual({ kind: "unauthenticated" });
  expect(await post("status")).toEqual({ kind: "ready", setupRequired: true, setupAvailable: false, emptyUsers: true });
  expect((await post("enroll", { code: 1, password: "NewSynthetic", token: setupToken })).kind).toBe("unavailable");
});
it("ADR004 expired/revoked/forged bearer tokens cannot invoke actual protected persistence", async () => {
  const token = await enroll(); at += 8 * 3600000;
  for (const header of [`Bearer ${token}`, `Bearer ${"f".repeat(64)}`, "Bearer incorrect", ""]) {
    const result = await app.inject({ method: "POST", url: "/api/startup/initialise", headers: { authorization: header }, payload: {} }); expect(result.statusCode).toBe(401);
  }
});
it("ADR004 login/setup attempts are bounded and hashes use independent salts with strict supported envelopes", async () => {
  await enroll(); for (let i = 0; i < 9; i++) expect((await post("login", { code: 1, password: "wrong" })).kind).toBe("incorrect");
  expect((await post("login", { code: 1, password: "Synthetic42" })).kind).toBe("throttled"); at += 60000; expect((await post("login", { code: 1, password: "Synthetic42" })).kind).toBe("continuar");
  const a = await hashPassword("SYNTHETIC"), b = await hashPassword("SYNTHETIC"); expect(a).not.toBe(b); expect(await verifyPassword("SYNTHETIC", a)).toBe(true); expect(await verifyPassword("SYNTHETIC", "scrypt$v1$999999999$8$1$bad$bad")).toBe(false);
}, 20000);

it("ADR004 coordinated real login and credential reset serialize without table/row lock deadlock and reset revokes the newly issued token", async () => {
  const oldToken = await enroll(), user = (await post("session", {}, oldToken)).user;
  let pause!: () => void, release!: () => void;
  const paused = new Promise<void>(resolve => { pause = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  const instrumented = async () => {
    const client = await connect(), original = client.query.bind(client);
    // Pause before the actual session INSERT takes its table lock, after login holds its credential row.
    Object.defineProperty(client, "query", { value: (sql: string, values?: unknown[]) => {
      if (typeof sql === "string" && sql.startsWith("INSERT INTO auth.sessions")) { pause(); return gate.then(() => original(sql, values)); }
      return original(sql, values);
    } }); return client;
  };
  await app.close(); app = createApp({ security: createSessionSecurity(instrumented, { now: () => at }), origins: [origin], userConnect: connect });
  const login = app.inject({ method: "POST", url: "/api/auth/login", payload: { code: 1, password: "Synthetic42" } }).then(response => response.json());
  await paused;
  const reset = app.inject({ method: "POST", url: "/api/users/save", headers: { authorization: `Bearer ${oldToken}` }, payload: { mode: "update", id: user.id, values: { Codigo: 1, Descricao: "Reset user", palavra_passe: "Replacement42" } } }).then(response => response.json());
  try {
    await expect.poll(async () => (await database.query("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE relation='auth.credentials'::regclass AND mode='ShareRowExclusiveLock' AND NOT granted) AS blocked")).rows[0].blocked, { timeout: 10000 }).toBe(true);
    release(); const [signedIn, changed] = await Promise.all([login, reset]); expect(signedIn.kind).toBe("continuar"); expect(changed.kind).toBe("saved");
    expect(await post("session", {}, signedIn.session.token)).toEqual({ kind: "unauthenticated" }); expect(await post("session", {}, oldToken)).toEqual({ kind: "unauthenticated" });
    expect((await database.query("SELECT count(*)::text AS count FROM auth.sessions")).rows[0].count).toBe("0");
  } finally { release(); await Promise.allSettled([login, reset]); }
}, 20000);
