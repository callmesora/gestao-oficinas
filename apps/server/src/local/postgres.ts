import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { readFile, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Client } from "pg";
import { databaseUrl, LocalServiceError, profilePaths, privateFile, type LocalProfile } from "./profile";
type Binaries = { initdb: string; pg_ctl: string; postgres: string };
export async function installedPostgres(): Promise<Binaries> {
  const packages: Record<string, string> = { "win32/x64": "@embedded-postgres/windows-x64", "darwin/arm64": "@embedded-postgres/darwin-arm64", "darwin/x64": "@embedded-postgres/darwin-x64" };
  const name = packages[`${process.platform}/${process.arch}`]; if (!name) throw new LocalServiceError("platform_unavailable");
  try { const binaries = await import(name) as Binaries; const version = await postgresCommand(binaries.postgres, ["--version"], true); if (!/^postgres \(PostgreSQL\) 18\.4(?:\s|$)/.test(version)) throw new Error(); return binaries; }
  catch { throw new LocalServiceError("matching_postgres_required"); }
}
export function postgresCommand(executable: string, args: string[], capture = false): Promise<string> {
  return new Promise((done, reject) => {
    const child = spawn(executable, args, { windowsHide: true, stdio: ["ignore", capture ? "pipe" : "ignore", "ignore"] }); let output = "";
    child.stdout?.on("data", chunk => { if (output.length < 4096) output += String(chunk); });
    const timer = setTimeout(() => { child.kill(); reject(new LocalServiceError("postgres_command_failed")); }, 45000);
    child.once("error", () => { clearTimeout(timer); reject(new LocalServiceError("postgres_command_failed")); });
    child.once("exit", code => { clearTimeout(timer); if (code === 0) done(output); else reject(new LocalServiceError("postgres_command_failed")); });
  });
}
export async function assertPortFree(port: number): Promise<void> {
  const server = createServer();
  try { await new Promise<void>((done, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", done); }); }
  catch { throw new LocalServiceError("configured_port_busy"); }
  finally { if (server.listening) await new Promise<void>(done => server.close(() => done())); }
}
export async function connectLocal(profile: LocalProfile, database: string = profile.databaseName): Promise<Client> {
  const client = new Client({ connectionString: databaseUrl(profile, database), connectionTimeoutMillis: 5000 }); client.on("error", () => undefined);
  try { await client.connect(); return client; } catch { try { await client.end(); } catch { /* no private diagnostics */ } throw new LocalServiceError("database_unavailable"); }
}
export async function startOwnedPostgres(directory: string, profile: LocalProfile, binaries: Binaries): Promise<{ stop: () => Promise<void> }> {
  const paths = profilePaths(directory); await assertPortFree(profile.databasePort);
  await postgresCommand(binaries.pg_ctl, ["start", "-D", paths.data, "-l", paths.log, "-w", "-t", "30", "-o", `-h 127.0.0.1 -p ${profile.databasePort}`]);
  const pidFile = join(paths.data, "postmaster.pid"), initial = (await readFile(pidFile, "utf8")).split(/\r?\n/), expected = initial[0]; let stopped = false;
  if (!/^[1-9][0-9]*$/.test(expected) || resolve(initial[1] ?? "") !== paths.data) throw new LocalServiceError("owned_pid_changed");
  return { stop: async () => {
    if (stopped) return;
    let current: string[]; try { current = (await readFile(pidFile, "utf8")).split(/\r?\n/); } catch { stopped = true; return; }
    if (current[0] !== expected || resolve(current[1] ?? "") !== paths.data) throw new LocalServiceError("owned_pid_changed");
    await postgresCommand(binaries.pg_ctl, ["stop", "-D", paths.data, "-m", "fast", "-w", "-t", "30"]); stopped = true;
  } };
}
export async function acquireRunner(directory: string, id: string): Promise<() => Promise<void>> {
  const paths = profilePaths(directory), value = JSON.stringify({ id, pid: process.pid });
  try { await privateFile(paths.lock, value); }
  catch { throw new LocalServiceError("runner_already_present"); }
  return async () => { try { if (await readFile(paths.lock, "utf8") === value) await unlink(paths.lock); } catch { /* Never remove a different owner's lock. */ } };
}
