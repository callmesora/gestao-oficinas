import { afterAll, beforeAll, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { createServer } from "node:net";
import { mkdtemp, mkdir, writeFile, readFile, access, stat, chmod, rm, unlink } from "node:fs/promises";
import { resolve, join } from "node:path";
import { legacyFixture } from "../../test-support/legacy-fixture";
import { quoteIdentifier } from "../db/legacy-import";
import { setupLocalService, startLocalService } from "./service";
import { readLocalProfile, profilePaths, privateFile } from "./profile";
import { connectLocal, installedPostgres, startOwnedPostgres } from "./postgres";
let directory: string, frontend: string;
beforeAll(async () => { directory = await mkdtemp(resolve("analysis-local/local-service-test-")); frontend = join(directory, "dist"); await mkdir(frontend); await mkdir(join(frontend, "assets")); await writeFile(join(frontend, "index.html"), '<!doctype html><title>Synthetic production build</title>'); });
afterAll(async () => { await rm(directory, { recursive: true }); }, 60000);
async function freePort() { const server = createServer(); await new Promise<void>(done => server.listen(0, "127.0.0.1", done)); const address = server.address(); if (!address || typeof address === "string") throw new Error(); await new Promise<void>(done => server.close(() => done())); return address.port; }
async function options(name: string) { const databasePort = await freePort(); let apiPort = await freePort(); while (databasePort === apiPort) apiPort = await freePort(); return { directory: join(directory, name), databasePort, apiPort }; }
async function exists(path: string) { return access(path).then(() => true, () => false); }
function snapshot(file: string, invalid = false) {
  const fixture = legacyFixture(invalid), database = new DatabaseSync(file);
  try {
    database.exec('CREATE TABLE "__export" (key TEXT PRIMARY KEY,value TEXT NOT NULL)'); database.prepare('INSERT INTO "__export" VALUES (?,?)').run("manifest", JSON.stringify(fixture.manifest));
    for (const [table, definition] of Object.entries(fixture.manifest.tables)) {
      database.exec(`CREATE TABLE ${quoteIdentifier(table)} (${definition.columns.map(column => `${quoteIdentifier(column.name)} BLOB`).join(",")})`);
      const insert = database.prepare(`INSERT INTO ${quoteIdentifier(table)} VALUES (${definition.columns.map(() => "?").join(",")})`); for (const row of fixture.rows(table)) insert.run(...row.values);
    }
  } finally { database.close(); }
}
const hash = async (file: string) => createHash("sha256").update(await readFile(file)).digest("hex");
async function api(origin: string, resource: string, body: unknown, token?: string) { const response = await fetch(`${origin}/api/${resource}`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }); return { status: response.status, body: await response.json() }; }
it("ADR017 actual one-time readonly snapshot setup and strict restart preserve edits/accounts/sessions without reimporting or touching the snapshot", async () => {
  const settings = await options("persistent"), copied = join(directory, "synthetic.sqlite"); snapshot(copied); const before = await hash(copied);
  const result = await setupLocalService({ ...settings, snapshot: copied }); expect(result.imported).toBe(7); expect(await hash(copied)).toBe(before);
  const paths = profilePaths(settings.directory), profile = await readLocalProfile(settings.directory); expect(profile.databasePassword).toMatch(/^[a-f0-9]{64}$/); expect(await exists(paths.lock)).toBe(false); expect(await exists(join(paths.data, "postmaster.pid"))).toBe(false);
  if (process.platform !== "win32") { expect((await stat(paths.directory)).mode & 0o777).toBe(0o700); for (const file of [paths.profile, paths.owner, paths.token, paths.report]) expect((await stat(file)).mode & 0o777).toBe(0o600); }
  let running: Awaited<ReturnType<typeof startLocalService>> | undefined;
  try {
    running = await startLocalService({ directory: settings.directory, frontend, environment: {} }); expect((await fetch(running.origin)).status).toBe(200); expect((await api(running.origin, "customers/list", { mode: "todos", term: "" })).status).toBe(401); expect((await api(running.origin, "development/session", {})).status).toBe(404);
    const operator = (await readFile(paths.token, "utf8")).trim(), enrollment = await api(running.origin, "auth/enroll", { code: 1, password: "Synthetic42", token: operator }); expect(enrollment.body.kind).toBe("continuar"); const token = enrollment.body.session.token;
    const listed = await api(running.origin, "customers/list", { mode: "todos", term: "" }, token), customer = listed.body.customers[0]; expect(customer.Codigo).toBe("18446744073709551615"); const { id, ClientesID: _sourceId, ...values } = customer; void _sourceId;
    expect((await api(running.origin, "customers/save", { mode: "update", id, values: { ...values, Descricao: "Persisted ordinary business edit" } }, token)).body.kind).toBe("saved");
    await expect(startLocalService({ directory: settings.directory, frontend, environment: {} })).rejects.toThrow("configured_port_busy"); await expect(setupLocalService(settings)).rejects.toThrow("configured_port_busy"); expect((await api(running.origin, "auth/session", {}, token)).body.kind).toBe("authenticated");
    await running.close(); running = undefined; expect(await exists(paths.lock)).toBe(false); expect(await exists(join(paths.data, "postmaster.pid"))).toBe(false); expect(await hash(copied)).toBe(before);
    await unlink(copied); await unlink(paths.token); // Ordinary restart has no import/source/token-file dependency after enrollment.
    running = await startLocalService({ directory: settings.directory, frontend, environment: {} }); expect((await api(running.origin, "auth/session", {}, token)).body.kind).toBe("authenticated"); const loaded = await api(running.origin, "customers/list", { mode: "todos", term: "" }, token); expect(loaded.body.customers).toHaveLength(1); expect(loaded.body.customers[0].Descricao).toBe("Persisted ordinary business edit");
    expect((await api(running.origin, "auth/status", {})).body).toMatchObject({ setupRequired: false, setupAvailable: false }); const database = await connectLocal(profile); try { expect((await database.query('SELECT count(*)::text AS count FROM import_audit.runs')).rows[0].count).toBe("1"); expect((await database.query('SELECT count(*)::text AS count FROM app."sistema"')).rows[0].count).toBe("1"); } finally { await database.end(); }
  } finally { await running?.close(); }
  await expect(setupLocalService(settings)).rejects.toThrow("fresh_directory_required");
}, 60000);
it("ADR017 missing profile/build, held runner lock and mismatched owner refuse without initializing/resetting or removing another lock", async () => {
  const missing = join(directory, "missing"); await expect(startLocalService({ directory: missing, frontend, environment: {} })).rejects.toThrow("existing_profile_required"); expect(await exists(missing)).toBe(false);
  const settings = await options("refusals"); await setupLocalService(settings); const paths = profilePaths(settings.directory); await expect(startLocalService({ directory: settings.directory, frontend: join(directory, "no-dist"), environment: {} })).rejects.toThrow("built_frontend_required"); expect(await exists(join(paths.data, "postmaster.pid"))).toBe(false);
  await privateFile(paths.lock, "synthetic-other-runner"); await expect(startLocalService({ directory: settings.directory, frontend, environment: {} })).rejects.toThrow("runner_already_present"); expect(await readFile(paths.lock, "utf8")).toBe("synthetic-other-runner"); await unlink(paths.lock);
  const original = await readFile(paths.owner, "utf8"); await writeFile(paths.owner, JSON.stringify({ version: 1, id: "00000000-0000-4000-8000-000000000000" })); await expect(startLocalService({ directory: settings.directory, frontend, environment: {} })).rejects.toThrow("existing_profile_required"); await writeFile(paths.owner, original);
  if (process.platform !== "win32") { await chmod(paths.profile, 0o644); await expect(startLocalService({ directory: settings.directory, frontend, environment: {} })).rejects.toThrow("existing_profile_required"); await chmod(paths.profile, 0o600); }
  expect(await exists(join(paths.data, "postmaster.pid"))).toBe(false);
}, 60000);
it("ADR017 quarantined snapshot setup publishes no startup profile and stops only its initialized cluster", async () => {
  const settings = await options("quarantine"), copied = join(directory, "invalid.sqlite"); snapshot(copied, true); const before = await hash(copied); await expect(setupLocalService({ ...settings, snapshot: copied })).rejects.toThrow("snapshot_requires_review"); const paths = profilePaths(settings.directory); expect(await exists(paths.profile)).toBe(false); expect(await exists(paths.lock)).toBe(false); expect(await exists(join(paths.data, "postmaster.pid"))).toBe(false); expect(await hash(copied)).toBe(before); await expect(startLocalService({ directory: settings.directory, frontend, environment: {} })).rejects.toThrow("existing_profile_required");
}, 60000);

it("ADR017 ordinary start refuses a missing owned database and never recreates it or changes the initialized profile", async () => {
  const settings = await options("missing-database"); await setupLocalService(settings); const profile = await readLocalProfile(settings.directory), paths = profilePaths(settings.directory), binaries = await installedPostgres(), before = await hash(paths.profile);
  let postgres = await startOwnedPostgres(settings.directory, profile, binaries);
  try { const admin = await connectLocal(profile, "postgres"); try { await admin.query('DROP DATABASE "gestao_oficinas"'); } finally { await admin.end(); } }
  finally { await postgres.stop(); }
  await expect(startLocalService({ directory: settings.directory, frontend, environment: {} })).rejects.toThrow("database_unavailable"); expect(await hash(paths.profile)).toBe(before); expect(await exists(paths.lock)).toBe(false); expect(await exists(join(paths.data, "postmaster.pid"))).toBe(false);
  postgres = await startOwnedPostgres(settings.directory, profile, binaries);
  try { const admin = await connectLocal(profile, "postgres"); try { expect((await admin.query("SELECT count(*)::text AS count FROM pg_database WHERE datname='gestao_oficinas'")).rows[0].count).toBe("0"); } finally { await admin.end(); } }
  finally { await postgres.stop(); }
}, 60000);
