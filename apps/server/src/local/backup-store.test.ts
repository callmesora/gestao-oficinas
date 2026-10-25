import { afterAll, beforeAll, expect, it } from "vitest";
import { createServer } from "node:net";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { access, chmod, copyFile, mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { backupLocalService, restoreLocalService, matchingBackupTools, fingerprintDatabase } from "./backup-store";
import { setupLocalService, startLocalService } from "./service";
import { profilePaths, readLocalProfile, databaseUrl } from "./profile";
import { acquireRunner, connectLocal, installedPostgres, startOwnedPostgres } from "./postgres";
import { createBusinessApp } from "../business-app";
import { readServiceConfiguration } from "../configuration";
let directory: string, tools: string;
beforeAll(async () => {
  directory = await mkdtemp(resolve("analysis-local/recovery-test-"));
  tools = process.env.WORKSHOP_TEST_BACKUP_TOOLS ?? fileURLToPath(new URL("../../../../analysis-local/toolchain/postgres-clients-18.4/bin/", import.meta.url)).replace(/\/$/, "");
  await matchingBackupTools(tools);
}, 60000);
afterAll(async () => { await rm(directory, { recursive: true, force: true }); }, 60000);
async function port() { const server = createServer(); await new Promise<void>(done => server.listen(0, "127.0.0.1", done)); const address = server.address(); if (!address || typeof address === "string") throw new Error(); await new Promise<void>(done => server.close(() => done())); return address.port; }
async function ports() { const databasePort = await port(); let apiPort = await port(); while (apiPort === databasePort) apiPort = await port(); return { databasePort, apiPort }; }
async function profile(name: string) { const path = join(directory, name); await setupLocalService({ directory: path, ...await ports() }); return path; }
async function sourceDatabase<T>(path: string, work: (client: Awaited<ReturnType<typeof connectLocal>>) => Promise<T>): Promise<T> {
  const settings = await readLocalProfile(path), release = await acquireRunner(path, settings.id), engine = await startOwnedPostgres(path, settings, await installedPostgres());
  try { const client = await connectLocal(settings); try { return await work(client); } finally { await client.end(); } } finally { try { await engine.stop(); } finally { await release(); } }
}
async function fingerprint(path: string) { return sourceDatabase(path, async client => { await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY"); const result = await fingerprintDatabase(client); await client.query("COMMIT"); return result; }); }
const exists = (path: string) => access(path).then(() => true, () => false);
async function privateBackup(source: string, name: string) { const destination = join(directory, name); await backupLocalService({ directory: source, destination, toolsDirectory: tools }); return destination; }

it("actual dump/restore preserves every current table/schema/sequence/hash and only revokes restored sessions, with new independent credentials and real persistent login/CRUD", async () => {
  const source = await profile("source"), settings = await readLocalProfile(source), sourcePaths = profilePaths(source), sourceProfile = await readFile(sourcePaths.profile), originalToken = await readFile(sourcePaths.token, "utf8");
  let oldBearer = "";
  await sourceDatabase(source, async client => {
    // Enrollment token is explicit private fixture input; a real production session is backed up.
    const configured = await createBusinessApp({ ...await readServiceConfiguration({ WORKSHOP_DATABASE_URL: databaseUrl(settings) }), setupToken: originalToken.trim() });
    try {
      const enrolled = await configured.inject({ method: "POST", url: "/api/auth/enroll", payload: { code: 1, password: "Synthetic42", token: originalToken.trim() } }); expect(enrolled.json().kind).toBe("continuar"); oldBearer = enrolled.json().session.token;
      const headers = { authorization: `Bearer ${oldBearer}` };
      const saved = await configured.inject({ method: "POST", url: "/api/customers/save", headers, payload: { mode: "create", values: { Codigo: "9007199254740993", Descricao: "Açores  ", Morada1: "", Morada2: null, codpostal: "", Telefone1: "", Telemovel: "", observacao: "line1\r\nline2  " } } }); expect(saved.json().kind).toBe("saved");
      const mechanic = await configured.inject({ method: "POST", url: "/api/mechanics/save", headers, payload: { mode: "create", values: { Codigo: 255, Descricao: "Synthetic mechanic", palavra_passe: "MiXeD7", inativo: null } } }); expect(mechanic.json().kind).toBe("saved");
      await client.query(`INSERT INTO app."artigos" ("Codigo","Descricao","preco","stock") VALUES ('A','Text  ',123.4500,-2.5000),('B',NULL,NULL,NULL);
        INSERT INTO app."lin_stocks" ("artigo","Documento_codigodocumento_numero") VALUES ('A',decode('0000ff','hex')),('B',decode('','hex'));
        INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (2,'Sequence gap'); DELETE FROM app."Clientes" WHERE "Codigo"=2`);
      await client.query("SELECT lo_from_bytea(23123,decode('0000ff','hex'))");
    } finally { await configured.close(); }
  });
  const before = await fingerprint(source), backup = await privateBackup(source, "backup"), backupBytes = await readFile(join(backup, "database.dump")), manifest = JSON.parse(await readFile(join(backup, "manifest.json"), "utf8"));
  expect(manifest.fingerprint).toEqual(before); expect(manifest.archive.sha256).toBe(createHash("sha256").update(backupBytes).digest("hex")); expect(await fingerprint(source)).toEqual(before); expect(await readFile(sourcePaths.profile)).toEqual(sourceProfile); expect(await readFile(sourcePaths.token, "utf8")).toBe(originalToken);
  const destination = join(directory, "restored"), targetPorts = await ports(); const restored = await restoreLocalService({ backup, directory: destination, toolsDirectory: tools, ...targetPorts }); expect(restored.invalidatedSessions).toBe(1); expect(restored.tokenFile).toBeNull();
  const target = await readLocalProfile(destination); expect(target.id).not.toBe(settings.id); expect(target.databasePassword).not.toBe(settings.databasePassword); expect(await exists(profilePaths(destination).token)).toBe(false);
  const report = JSON.parse(await readFile(join(destination, "restore-report.json"), "utf8")); expect(report.verified).toBe(true); expect(report.fingerprint).toEqual(before); expect((await fingerprint(destination)).tables.filter(row => row.schema !== "auth" || row.name !== "sessions")).toEqual(before.tables.filter(row => row.schema !== "auth" || row.name !== "sessions"));
  await sourceDatabase(destination, async client => {
    expect((await client.query("SELECT count(*)::text AS count FROM auth.sessions")).rows[0].count).toBe("0");
    const app = await createBusinessApp(await readServiceConfiguration({ WORKSHOP_DATABASE_URL: databaseUrl(target) }));
    try {
      expect((await app.inject({ method: "POST", url: "/api/auth/session", headers: { authorization: `Bearer ${oldBearer}` }, payload: {} })).statusCode).toBe(200);
      expect((await app.inject({ method: "POST", url: "/api/auth/session", headers: { authorization: `Bearer ${oldBearer}` }, payload: {} })).json()).toEqual({ kind: "unauthenticated" });
      const loggedIn = (await app.inject({ method: "POST", url: "/api/auth/login", payload: { code: 1, password: "synthetic42" } })).json(); expect(loggedIn.kind).toBe("continuar");
      const headers = { authorization: `Bearer ${loggedIn.session.token}` }; const customers = (await app.inject({ method: "POST", url: "/api/customers/list", headers, payload: { mode: "todos", term: "" } })).json(); expect(customers.customers).toHaveLength(1); expect(customers.customers[0]).toMatchObject({ Codigo: "9007199254740993", Descricao: "Açores  ", Morada2: null });
      expect((await app.inject({ method: "POST", url: "/api/repair-labor/authenticate", headers, payload: { mechanic: 255, password: "MiXeD7" } })).json().kind).toBe("authenticated");
      expect((await client.query('SELECT encode("Documento_codigodocumento_numero",\'hex\') AS bytes FROM app."lin_stocks" ORDER BY _row_id')).rows).toEqual([{ bytes: "0000ff" }, { bytes: "" }]);
      expect((await client.query("SELECT encode(lo_get(23123),'hex') AS bytes")).rows).toEqual([{ bytes: "0000ff" }]);
      expect((await client.query('INSERT INTO app."Clientes" ("Codigo") VALUES (3) RETURNING _row_id::text AS id')).rows[0].id).toBe("3");
    } finally { await app.close(); }
  });
  expect(await fingerprint(source)).toEqual(before); expect(await readFile(join(backup, "database.dump"))).toEqual(backupBytes);
  for (const path of [sourcePaths.lock,join(sourcePaths.data,"postmaster.pid"),profilePaths(destination).lock,join(profilePaths(destination).data,"postmaster.pid")]) expect(await exists(path)).toBe(false);
  if (process.platform !== "win32") { expect((await stat(backup)).mode & 0o777).toBe(0o700); for (const path of [join(backup,"database.dump"),join(backup,"manifest.json"),profilePaths(destination).profile]) expect((await stat(path)).mode & 0o777).toBe(0o600); }
}, 90000);

it("unconsumed enrollment gets a new one-use operator file without copying the source token", async () => {
  const source = await profile("unenrolled"), old = await readFile(profilePaths(source).token,"utf8"), backup = await privateBackup(source,"unenrolled-backup"), destination = join(directory,"unenrolled-restore");
  const result = await restoreLocalService({ backup, directory: destination, toolsDirectory: tools, ...await ports() }); expect(result.tokenFile).toBe(profilePaths(destination).token); const next = await readFile(result.tokenFile!,"utf8"); expect(next).toMatch(/^[a-f0-9]{64}\n$/); expect(next).not.toBe(old);
  await sourceDatabase(destination, async client => { expect((await client.query("SELECT consumed FROM auth.enrollment")).rows).toEqual([{ consumed:false }]); expect((await client.query("SELECT count(*)::text AS count FROM auth.credentials")).rows[0].count).toBe("0"); });
}, 60000);

it("running/existing source and destination locks are never bypassed or stopped, and incompatible tools fail before output creation", async () => {
  const source = await profile("protected"), settings = await readLocalProfile(source), lock = await acquireRunner(source,settings.id), destination = join(directory,"locked-backup");
  try { await expect(backupLocalService({ directory:source,destination,toolsDirectory:tools })).rejects.toThrow("runner_already_present"); expect(await exists(profilePaths(source).lock)).toBe(true); expect(await exists(destination)).toBe(false); } finally { await lock(); }
  const backup = await privateBackup(source,"protected-backup"); await expect(backupLocalService({ directory:source,destination:backup,toolsDirectory:tools })).rejects.toThrow("fresh_directory_required");
  await expect(restoreLocalService({ backup,directory:source,toolsDirectory:tools,...await ports() })).rejects.toThrow("fresh_directory_required");
  await expect(restoreLocalService({ backup,directory:join(directory,"same-ports"),toolsDirectory:tools,databasePort:settings.databasePort,apiPort:settings.apiPort })).rejects.toThrow("distinct_restore_ports_required"); expect(await exists(join(directory,"same-ports"))).toBe(false);
  const fake = join(directory,"tools-invalid"); await mkdir(fake,{mode:0o700}); await expect(matchingBackupTools(fake)).rejects.toThrow("matching_backup_tools_required"); await expect(backupLocalService({ directory:source,destination:join(directory,"invalid-tools-output"),toolsDirectory:fake })).rejects.toThrow("matching_backup_tools_required"); expect(await exists(join(directory,"invalid-tools-output"))).toBe(false);
  expect(await exists(profilePaths(source).lock)).toBe(false); expect(await exists(join(profilePaths(source).data,"postmaster.pid"))).toBe(false);
}, 60000);

it("corrupt archive/manifest and symlink/private-path violations refuse restore before a target is created", async () => {
  const source = await profile("corruption"), backup = await privateBackup(source,"corruption-backup"), archive = join(backup,"database.dump"), contents = await readFile(archive), target = join(directory,"corrupt-target");
  await writeFile(archive,Buffer.concat([contents,Buffer.from("changed")])); await expect(restoreLocalService({ backup,directory:target,toolsDirectory:tools,...await ports() })).rejects.toThrow("backup_invalid"); expect(await exists(target)).toBe(false); await writeFile(archive,contents);
  if (process.platform !== "win32") { await chmod(archive,0o644); await expect(restoreLocalService({ backup,directory:target,toolsDirectory:tools,...await ports() })).rejects.toThrow("backup_invalid"); await chmod(archive,0o600); }
  const realArchive = join(directory,"private-archive"); await copyFile(archive,realArchive); await chmod(realArchive,0o600); await rm(archive); await symlink(realArchive,archive); await expect(restoreLocalService({ backup,directory:target,toolsDirectory:tools,...await ports() })).rejects.toThrow("backup_invalid"); expect(await exists(target)).toBe(false);
}, 60000);

it("a fingerprint mismatch never publishes a profile or leaves an owned process/runner behind", async () => {
  const source = await profile("mismatch"), backup = await privateBackup(source,"mismatch-backup"), manifestFile = join(backup,"manifest.json"), manifest = JSON.parse(await readFile(manifestFile,"utf8")); manifest.fingerprint.tables[0].sha256="f".repeat(64); await writeFile(manifestFile,JSON.stringify(manifest));
  const target = join(directory,"mismatch-target"); await expect(restoreLocalService({ backup,directory:target,toolsDirectory:tools,...await ports() })).rejects.toThrow("restore_verification_failed"); expect(await exists(profilePaths(target).profile)).toBe(false); expect(await exists(profilePaths(target).lock)).toBe(false); expect(await exists(join(profilePaths(target).data,"postmaster.pid"))).toBe(false);
}, 60000);


it("actual operator Node CLIs create a verified backup/fresh restore which starts normally and performs protected business writes without DEV or reimport", async () => {
  const execute = promisify(execFile), source = await profile("operator-source"), sourceBefore = await fingerprint(source), backup = join(directory,"operator-backup"), destination = join(directory,"operator-restored"), settings = await ports();
  const command = async (entry: string, args: string[]) => execute(process.execPath,["--import","tsx",`apps/server/src/local/${entry}.ts`,...args],{timeout:60000,maxBuffer:32768});
  const copied = await command("backup",["--profile",source,"--out",backup,"--tools",tools]); expect(copied.stdout).toContain("Cópia local verificada");
  const restored = await command("restore",["--profile",destination,"--backup",backup,"--tools",tools,"--database-port",String(settings.databasePort),"--api-port",String(settings.apiPort)]); expect(restored.stdout).toContain("restaurada e verificada");
  const frontend = join(directory,"operator-dist"); await mkdir(frontend); await mkdir(join(frontend,"assets")); await writeFile(join(frontend,"index.html"),"<!doctype html><title>Synthetic restored production</title>");
  const running = await startLocalService({directory:destination,frontend,environment:{}});
  try {
    const post = async (resource: string, payload: unknown, token?: string) => fetch(`${running.origin}/api/${resource}`,{method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(payload)});
    expect((await fetch(running.origin)).status).toBe(200); expect((await post("customers/list",{mode:"todos",term:""})).status).toBe(401); expect((await post("development/session",{})).status).toBe(404);
    const operator = (await readFile(profilePaths(destination).token,"utf8")).trim(), enrolled = await (await post("auth/enroll",{code:1,password:"FreshRecovery42",token:operator})).json(); expect(enrolled.kind).toBe("continuar");
    const saved = await (await post("customers/save",{mode:"create",values:{Codigo:"864",Descricao:"Restored real business",Morada1:"",Morada2:null,codpostal:"",Telefone1:"",Telemovel:"",observacao:""}},enrolled.session.token)).json(); expect(saved.kind).toBe("saved");
    const listed = await (await post("customers/list",{mode:"todos",term:""},enrolled.session.token)).json(); expect(listed.customers).toHaveLength(1); expect(listed.customers[0]).toMatchObject({Codigo:"864",Descricao:"Restored real business"});
    const profile = await readLocalProfile(destination); for (const output of [copied.stdout,copied.stderr,restored.stdout,restored.stderr]) { expect(output).not.toContain(profile.databasePassword); expect(output).not.toContain(operator); }
  } finally { await running.close(); }
  expect(await fingerprint(source)).toEqual(sourceBefore); expect(await exists(profilePaths(destination).lock)).toBe(false); expect(await exists(join(profilePaths(destination).data,"postmaster.pid"))).toBe(false);
},90000);

it("migration checksum drift refuses backup before publication and leaves the source state unchanged", async () => {
  const source = await profile("migration-drift"), target = join(directory,"migration-drift-backup"); await sourceDatabase(source,client=>client.query("UPDATE public.schema_migrations SET sha256=repeat('f',64) WHERE name='0003_mechanic_credentials.sql'"));
  const before = await fingerprint(source); await expect(backupLocalService({directory:source,destination:target,toolsDirectory:tools})).rejects.toThrow("current_migrations_required"); expect(await exists(target)).toBe(false); expect(await fingerprint(source)).toEqual(before); expect(await exists(profilePaths(source).lock)).toBe(false); expect(await exists(join(profilePaths(source).data,"postmaster.pid"))).toBe(false);
},60000);
