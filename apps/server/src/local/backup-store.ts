import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, lstat, mkdir, open, readFile, realpath, stat, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { z } from "zod";
import type { Client } from "pg";
import { assertProtected, defaultLocalDirectory, LocalServiceError, newProfile, privateFile, profilePaths, readLocalProfile, type LocalProfile } from "./profile";
import { acquireRunner, assertPortFree, connectLocal, installedPostgres, postgresCommand, startOwnedPostgres } from "./postgres";

const sha = z.string().regex(/^[a-f0-9]{64}$/), count = z.string().regex(/^(?:0|[1-9][0-9]*)$/), identifier = z.string().min(1).max(63);
const rowsSchema = z.strictObject({ rows: count, sha256: sha });
const fingerprintSchema = z.strictObject({
  schema: sha,
  tables: z.array(z.strictObject({ schema: identifier, name: identifier, ...rowsSchema.shape })).max(1024),
  sequences: z.array(z.strictObject({ schema: identifier, name: identifier, value: z.string().regex(/^-?(?:0|[1-9][0-9]*)$/), called: z.boolean() })).max(1024),
  largeObjects: rowsSchema,
  migrations: z.array(z.strictObject({ name: z.string().regex(/^\d{4}_[a-z_]+\.sql$/), sha256: sha })).max(1000),
});
const backupSchema = z.strictObject({ version: z.literal(1), id: z.uuid(), postgresVersion: z.literal("18.4"), createdAt: z.iso.datetime(),
  source: z.strictObject({ id: z.uuid(), databasePort: z.number().int().min(1).max(65535), apiPort: z.number().int().min(1).max(65535) }),
  tools: z.strictObject({ dump: sha, restore: sha }),
  archive: z.strictObject({ bytes: z.number().int().min(5).max(32 * 1024 ** 3), sha256: sha }),
  fingerprint: fingerprintSchema,
});
type Fingerprint = z.infer<typeof fingerprintSchema>;
type Backup = z.infer<typeof backupSchema>;
type Tools = { dump: string; restore: string; fingerprints: Backup["tools"] };
const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
const qualified = (schema: string, name: string) => `${quote(schema)}.${quote(name)}`;
const userSchema = "n.nspname NOT LIKE 'pg_%' AND n.nspname<>'information_schema'";
const stopped = (signal?: AbortSignal) => { if (signal?.aborted) throw new LocalServiceError("recovery_interrupted"); };
const inside = (parent: string, child: string) => { const path = relative(parent, child); return path === "" || path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path); };

async function fileHash(path: string, signal?: AbortSignal): Promise<string> { const hash = createHash("sha256"); for await (const bytes of createReadStream(path)) { stopped(signal); hash.update(bytes); } return hash.digest("hex"); }
function utility(executable: string, args: string[], options: { passwordFile?: string; signal?: AbortSignal; version?: boolean } = {}): Promise<string> {
  stopped(options.signal);
  return new Promise((done, reject) => {
    const environment = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("PG")));
    const child = spawn(executable, args, { windowsHide: true, stdio: ["ignore", options.version ? "pipe" : "ignore", "pipe"], env: { ...environment, ...(options.passwordFile ? { PGPASSFILE: options.passwordFile } : {}) } });
    let output = "", warned = false, finished = false, interrupted = false;
    let force: ReturnType<typeof setTimeout> | undefined;
    child.stdout?.on("data", bytes => { if (output.length < 4096) output += String(bytes); });
    // PostgreSQL errors can contain copied values. Retain only that stderr occurred, never its contents.
    child.stderr?.on("data", () => { warned = true; });
    const finish = (success: boolean) => { if (finished) return; finished = true; clearTimeout(timer); clearTimeout(force); options.signal?.removeEventListener("abort", abort); if (success) done(output); else reject(new LocalServiceError(options.signal?.aborted ? "recovery_interrupted" : "backup_utility_failed")); };
    const abort = () => { if (interrupted || finished) return; interrupted = true; child.kill(); force = setTimeout(() => child.kill("SIGKILL"), 5000); };
    const timer = setTimeout(abort, 300000); options.signal?.addEventListener("abort", abort, { once: true });
    child.once("error", () => finish(false)); child.once("close", code => finish(code === 0 && !warned && !interrupted));
    if (options.signal?.aborted) abort();
  });
}
/** Explicit native utilities only; no PATH lookup, provisioning or arbitrary connection option. */
export async function matchingBackupTools(directory: string): Promise<Tools> {
  try {
    if (!isAbsolute(directory) || await realpath(directory) !== directory) throw new Error();
    const suffix = process.platform === "win32" ? ".exe" : "", dump = join(directory, `pg_dump${suffix}`), restore = join(directory, `pg_restore${suffix}`);
    for (const [path, name] of [[dump, "pg_dump"], [restore, "pg_restore"]]) {
      if (!(await lstat(path)).isFile() || await realpath(path) !== path) throw new Error();
      const version = await utility(path, ["--version"], { version: true });
      if (!new RegExp(`^${name} \\(PostgreSQL\\) 18\\.4(?:\\s|$)`).test(version)) throw new Error();
    }
    return { dump, restore, fingerprints: { dump: await fileHash(dump), restore: await fileHash(restore) } };
  } catch { throw new LocalServiceError("matching_backup_tools_required"); }
}
async function passwordFile<T>(directory: string, profile: LocalProfile, action: (file: string) => Promise<T>): Promise<T> {
  const file = join(directory, `connection-${randomUUID()}.pgpass`);
  await privateFile(file, `127.0.0.1:${profile.databasePort}:${profile.databaseName}:${profile.databaseUser}:${profile.databasePassword}\n`);
  try { return await action(file); } finally { await unlink(file); }
}
const connectionArgs = (profile: LocalProfile) => ["--host=127.0.0.1", `--port=${profile.databasePort}`, `--username=${profile.databaseUser}`, `--dbname=${profile.databaseName}`, "--no-password"];
async function hashRows(client: Client, query: string, signal?: AbortSignal): Promise<z.infer<typeof rowsSchema>> {
  const hash = createHash("sha256"); let rows = 0n;
  await client.query(`DECLARE workshop_recovery_rows NO SCROLL CURSOR FOR ${query}`);
  try {
    for (;;) {
      stopped(signal); const batch = await client.query<{ row: string }>("FETCH 256 FROM workshop_recovery_rows"); if (!batch.rowCount) break;
      for (const { row } of batch.rows) { const bytes = Buffer.from(row, "utf8"); hash.update(`${bytes.length}:`); hash.update(bytes); hash.update("\n"); rows++; }
    }
  } finally { await client.query("CLOSE workshop_recovery_rows"); }
  return { rows: rows.toString(), sha256: hash.digest("hex") };
}
/** Target database verification, including non-imported edits, auth, provenance, raw values and sequence gaps. */
export async function fingerprintDatabase(client: Client, signal?: AbortSignal): Promise<Fingerprint> {
  await client.query("SET LOCAL TIME ZONE 'UTC'");
  const tables = (await client.query<{ schema: string; name: string }>(`SELECT n.nspname AS schema,c.relname AS name FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE ${userSchema} AND c.relkind IN ('r','p','m') ORDER BY n.nspname COLLATE "C",c.relname COLLATE "C"`)).rows;
  if (tables.length > 1024) throw new LocalServiceError("backup_catalog_unsupported");
  const fingerprints: Fingerprint["tables"] = [];
  for (const table of tables) fingerprints.push({ ...table, ...await hashRows(client, `SELECT to_jsonb(t)::text AS row FROM ${qualified(table.schema, table.name)} t ORDER BY to_jsonb(t)::text COLLATE "C"`, signal) });
  const sequences: Fingerprint["sequences"] = [];
  const sequenceNames = (await client.query<{ schema: string; name: string }>('SELECT schemaname AS schema,sequencename AS name FROM pg_sequences WHERE schemaname NOT LIKE \'pg_%\' ORDER BY schemaname COLLATE "C",sequencename COLLATE "C"')).rows;
  for (const sequence of sequenceNames) { const value = (await client.query<{ value: string; called: boolean }>(`SELECT last_value::text AS value,is_called AS called FROM ${qualified(sequence.schema, sequence.name)}`)).rows[0]; sequences.push({ ...sequence, ...value }); }
  const schema = createHash("sha256");
  const schemaQueries = [
    `SELECT n.nspname,c.relname,c.relkind,c.relpersistence FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE ${userSchema} AND c.relkind IN ('r','p','m','v','S','f') ORDER BY n.nspname COLLATE "C",c.relname COLLATE "C"`,
    `SELECT table_schema,table_name,column_name,ordinal_position,column_default,is_nullable,data_type,udt_schema,udt_name,character_maximum_length,numeric_precision,numeric_scale,is_identity,identity_generation,is_generated,generation_expression FROM information_schema.columns WHERE table_schema NOT LIKE 'pg_%' AND table_schema<>'information_schema' ORDER BY table_schema COLLATE "C",table_name COLLATE "C",ordinal_position`,
    `SELECT n.nspname,c.relname,k.conname,pg_get_constraintdef(k.oid,true) AS definition FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE ${userSchema} ORDER BY n.nspname COLLATE "C",c.relname COLLATE "C",k.conname COLLATE "C"`,
    `SELECT schemaname,tablename,indexname,indexdef FROM pg_indexes WHERE schemaname NOT LIKE 'pg_%' ORDER BY schemaname COLLATE "C",tablename COLLATE "C",indexname COLLATE "C"`,
    `SELECT n.nspname,p.proname,pg_get_functiondef(p.oid) AS definition FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE ${userSchema} AND p.prokind IN ('f','p') ORDER BY n.nspname COLLATE "C",p.proname COLLATE "C",pg_get_functiondef(p.oid) COLLATE "C"`,
    `SELECT schemaname,viewname,definition FROM pg_views WHERE schemaname NOT LIKE 'pg_%' AND schemaname<>'information_schema' ORDER BY schemaname COLLATE "C",viewname COLLATE "C"`,
    `SELECT schemaname,sequencename,data_type::text,start_value,min_value,max_value,increment_by,cycle,cache_size FROM pg_sequences WHERE schemaname NOT LIKE 'pg_%' ORDER BY schemaname COLLATE "C",sequencename COLLATE "C"`,
    `SELECT n.nspname,c.relname,t.tgname,pg_get_triggerdef(t.oid,true) AS definition FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE ${userSchema} AND NOT t.tgisinternal ORDER BY n.nspname COLLATE "C",c.relname COLLATE "C",t.tgname COLLATE "C"`,
  ];
  for (const query of schemaQueries) { stopped(signal); schema.update(JSON.stringify((await client.query(query)).rows)); schema.update("\n"); }
  const largeObjects = await hashRows(client, `SELECT row FROM (SELECT json_build_array('metadata',oid::text)::text AS row FROM pg_largeobject_metadata UNION ALL SELECT json_build_array('data',loid::text,pageno,encode(data,'base64'))::text AS row FROM pg_largeobject) l ORDER BY row COLLATE "C"`, signal);
  const migrations = (await client.query<{ name: string; sha256: string }>("SELECT name,sha256 FROM public.schema_migrations ORDER BY name COLLATE \"C\"")).rows;
  return fingerprintSchema.parse({ schema: schema.digest("hex"), tables: fingerprints, sequences, largeObjects, migrations });
}
async function knownMigrations(fingerprint: Fingerprint) {
  const { readdir } = await import("node:fs/promises"), directory = new URL("../../migrations/", import.meta.url);
  const names = (await readdir(directory)).filter(name => /^\d{4}_[a-z_]+\.sql$/.test(name)).sort();
  if (!fingerprint.migrations.length || fingerprint.migrations.length !== names.length) throw new LocalServiceError("current_migrations_required");
  for (let i = 0; i < names.length; i++) if (fingerprint.migrations[i].name !== names[i] || fingerprint.migrations[i].sha256 !== createHash("sha256").update(await readFile(new URL(names[i], directory))).digest("hex")) throw new LocalServiceError("current_migrations_required");
}
async function freshDirectory(directory: string) { await mkdir(dirname(directory), { recursive: true }); try { await mkdir(directory, { mode: 0o700 }); } catch { throw new LocalServiceError("fresh_directory_required"); } if (await realpath(directory) !== directory) throw new LocalServiceError("canonical_directory_required"); }

export async function backupLocalService(options: { directory?: string; destination: string; toolsDirectory: string; signal?: AbortSignal }) {
  const source = profilePaths(options.directory ?? defaultLocalDirectory), profile = await readLocalProfile(source.directory), tools = await matchingBackupTools(options.toolsDirectory), destination = resolve(options.destination);
  if (!options.destination || inside(source.directory, destination) || inside(destination, source.directory)) throw new LocalServiceError("separate_backup_required");
  let release: (() => Promise<void>) | undefined, postgres: Awaited<ReturnType<typeof startOwnedPostgres>> | undefined, client: Client | undefined;
  try {
    stopped(options.signal); release = await acquireRunner(source.directory, profile.id);
    postgres = await startOwnedPostgres(source.directory, profile, await installedPostgres()); client = await connectLocal(profile);
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY"); const snapshot = (await client.query<{ snapshot: string }>("SELECT pg_export_snapshot() AS snapshot")).rows[0].snapshot;
    const fingerprint = await fingerprintDatabase(client, options.signal); await knownMigrations(fingerprint);
    await freshDirectory(destination); const id = randomUUID(), archive = join(destination, "database.dump"); await privateFile(join(destination, "owner.json"), JSON.stringify({ version: 1, id }) + "\n"); await privateFile(archive, "");
    await passwordFile(source.directory, profile, file => utility(tools.dump, [...connectionArgs(profile), "--format=custom", "--compress=0", "--no-owner", "--no-acl", `--snapshot=${snapshot}`, `--file=${archive}`], { passwordFile: file, signal: options.signal }));
    await client.query("COMMIT"); const size = (await stat(archive)).size;
    const manifest = backupSchema.parse({ version: 1, id, postgresVersion: "18.4", createdAt: new Date().toISOString(), source: { id: profile.id, databasePort: profile.databasePort, apiPort: profile.apiPort }, tools: tools.fingerprints, archive: { bytes: size, sha256: await fileHash(archive, options.signal) }, fingerprint });
    stopped(options.signal); await privateFile(join(destination, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    return { directory: destination, tables: fingerprint.tables.length, rows: fingerprint.tables.reduce((total, table) => total + BigInt(table.rows), 0n).toString() };
  } catch (error) { if (error instanceof LocalServiceError) throw error; throw new LocalServiceError("backup_failed"); }
  finally { try { await client?.end(); } finally { try { await postgres?.stop(); } finally { await release?.(); } } }
}
async function readBackup(directory: string, signal?: AbortSignal): Promise<Backup> {
  try {
    await assertProtected(directory, true); const manifestFile = join(directory, "manifest.json"), archive = join(directory, "database.dump"), ownerFile = join(directory, "owner.json");
    await assertProtected(manifestFile); await assertProtected(archive); await assertProtected(ownerFile);
    if ((await stat(manifestFile)).size > 2 * 1024 ** 2 || (await stat(ownerFile)).size > 256) throw new Error();
    const manifest = backupSchema.parse(JSON.parse(await readFile(manifestFile, "utf8"))), owner = z.strictObject({ version: z.literal(1), id: z.uuid() }).parse(JSON.parse(await readFile(ownerFile, "utf8")));
    if (owner.id !== manifest.id || (await stat(archive)).size !== manifest.archive.bytes || await fileHash(archive, signal) !== manifest.archive.sha256) throw new Error();
    const handle = await open(archive, "r"); try { const header = Buffer.alloc(5); await handle.read(header, 0, 5, 0); if (header.toString("ascii") !== "PGDMP") throw new Error(); } finally { await handle.close(); }
    await knownMigrations(manifest.fingerprint); return manifest;
  } catch (error) { if (error instanceof LocalServiceError && ["current_migrations_required", "recovery_interrupted"].includes(error.code)) throw error; throw new LocalServiceError("backup_invalid"); }
}

export async function restoreLocalService(options: { backup: string; directory: string; toolsDirectory: string; databasePort: number; apiPort: number; signal?: AbortSignal }) {
  const backup = resolve(options.backup), target = profilePaths(options.directory), manifest = await readBackup(backup, options.signal), profile = newProfile(options.databasePort, options.apiPort), tools = await matchingBackupTools(options.toolsDirectory);
  if (!options.directory || !options.backup || profile.id === manifest.source.id || inside(backup, target.directory) || inside(target.directory, backup)) throw new LocalServiceError("separate_restore_required");
  if ([manifest.source.databasePort, manifest.source.apiPort].includes(profile.databasePort) || [manifest.source.databasePort, manifest.source.apiPort].includes(profile.apiPort)) throw new LocalServiceError("distinct_restore_ports_required");
  // Never create a nested profile inside an existing owned profile.
  for (let parent = dirname(target.directory); parent !== dirname(parent); parent = dirname(parent)) if (await access(join(parent, "profile.json")).then(() => true, () => false)) throw new LocalServiceError("separate_restore_required");
  await assertPortFree(profile.databasePort); await assertPortFree(profile.apiPort);
  let release: (() => Promise<void>) | undefined, postgres: Awaited<ReturnType<typeof startOwnedPostgres>> | undefined, client: Client | undefined;
  try {
    stopped(options.signal); await freshDirectory(target.directory); await privateFile(target.owner, JSON.stringify({ version: 1, id: profile.id }) + "\n"); release = await acquireRunner(target.directory, profile.id);
    const binaries = await installedPostgres(), initial = join(target.directory, "initial-password"); await privateFile(initial, profile.databasePassword);
    try { await postgresCommand(binaries.initdb, ["-D", target.data, `--username=${profile.databaseUser}`, "--auth=scram-sha-256", `--pwfile=${initial}`, "--locale=C", "--encoding=UTF8"]); } finally { await unlink(initial); }
    await privateFile(target.clusterOwner, JSON.stringify({ version: 1, id: profile.id }) + "\n"); stopped(options.signal); postgres = await startOwnedPostgres(target.directory, profile, binaries);
    const admin = await connectLocal(profile, "postgres"); try { await admin.query('CREATE DATABASE "gestao_oficinas"'); } finally { await admin.end(); }
    await passwordFile(target.directory, profile, file => utility(tools.restore, [...connectionArgs(profile), "--no-owner", "--no-acl", "--exit-on-error", "--single-transaction", join(backup, "database.dump")], { passwordFile: file, signal: options.signal }));
    client = await connectLocal(profile); await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY"); const restored = await fingerprintDatabase(client, options.signal); await client.query("COMMIT");
    if (JSON.stringify(restored) !== JSON.stringify(manifest.fingerprint)) throw new LocalServiceError("restore_verification_failed");
    stopped(options.signal); await client.query("BEGIN");
    // ADR004: only this newly restored target loses copied bearer sessions; credentials/enrollment remain exact.
    const sessions = await client.query("DELETE FROM auth.sessions"), enrollment = (await client.query<{ consumed: boolean }>("SELECT consumed FROM auth.enrollment WHERE singleton=true")).rows[0];
    if (!enrollment) throw new LocalServiceError("restore_verification_failed"); await client.query("COMMIT");
    if (!enrollment.consumed) await privateFile(target.token, randomBytes(32).toString("hex") + "\n");
    await privateFile(join(target.directory, "restore-report.json"), JSON.stringify({ version: 1, backupId: manifest.id, verified: true, fingerprint: restored, invalidatedSessions: sessions.rowCount, enrollmentConsumed: enrollment.consumed }, null, 2) + "\n");
    // A published profile is ready for ordinary start, with no recovery-owned server still running.
    await client.end(); client = undefined; await postgres.stop(); postgres = undefined;
    stopped(options.signal); await privateFile(target.profile, JSON.stringify(profile, null, 2) + "\n");
    return { directory: target.directory, invalidatedSessions: sessions.rowCount ?? 0, tokenFile: enrollment.consumed ? null : target.token, tables: restored.tables.length };
  } catch (error) { if (error instanceof LocalServiceError) throw error; throw new LocalServiceError("restore_failed"); }
  finally { try { await client?.end(); } finally { try { await postgres?.stop(); } finally { await release?.(); } } }
}
