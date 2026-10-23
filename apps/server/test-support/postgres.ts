// Development/test only: fresh native PostgreSQL, loopback, random credentials, no service install.
import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { cp, mkdir, mkdtemp, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { setTimeout, clearTimeout } from "node:timers";
import { initdb, pg_ctl } from "@embedded-postgres/windows-x64";
import pg from "pg";

export async function startIsolatedPostgres() {
  if (process.platform !== "win32") throw new Error("This project currently targets Windows");
  const parent = resolve("analysis-local"); await mkdir(parent, { recursive: true });
  const directory = await mkdtemp(resolve(parent, "postgres-test-"));
  let data = resolve(directory, "cluster"), running = false;
  const password = randomBytes(32).toString("hex");
  const passwordFile = resolve(directory, "initial-password");
  const server = createServer();
  await new Promise<void>((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
  const address = server.address(); if (address === null || typeof address === "string") throw new Error("Port allocation failed");
  const port = address.port;
  await new Promise<void>((done, reject) => server.close(error => error ? reject(error) : done()));
  const run = (executable: string, args: string[]) => new Promise<void>((done, reject) => {
    const child = spawn(executable, args, { windowsHide: true, stdio: "ignore" });
    const timer = setTimeout(() => { child.kill(); reject(new Error("PostgreSQL utility timed out")); }, 45000);
    child.once("error", error => { clearTimeout(timer); reject(error); });
    child.once("exit", code => { clearTimeout(timer); if (code === 0) done(); else reject(new Error("PostgreSQL utility failed")); });
  });
  await writeFile(passwordFile, password, { mode: 0o600, flag: "wx" });
  try {
    await run(initdb, ["-D", data, "--username=postgres", "--auth=scram-sha-256", `--pwfile=${passwordFile}`, "--locale=C", "--encoding=UTF8"]);
  } finally { await unlink(passwordFile); }
  const start = async () => {
    await run(pg_ctl, ["start", "-D", data, "-l", resolve(directory, "postgres.log"), "-w", "-t", "30", "-o", `-h 127.0.0.1 -p ${port}`]);
    running = true;
  };
  const stop = async () => {
    if (running) { await run(pg_ctl, ["stop", "-D", data, "-m", "fast", "-w", "-t", "30"]); running = false; }
  };
  try { await start(); } catch (error) {
    await run(pg_ctl, ["stop", "-D", data, "-m", "fast", "-w", "-t", "30"]).catch(() => undefined);
    throw error;
  }
  const connect = async (database: string) => {
    const client = new pg.Client({ host: "127.0.0.1", port, user: "postgres", password, database, connectionTimeoutMillis: 10000 });
    await client.connect(); return client;
  };
  return {
    directory, stop, connect,
    async database(): Promise<pg.Client> {
      const name = "gestao_migration_" + randomUUID().replaceAll("-", "");
      const admin = await connect("postgres");
      try { await admin.query(`CREATE DATABASE "${name}"`); } finally { await admin.end(); }
      return connect(name);
    },
    async backupAndRestore(): Promise<void> {
      // PostgreSQL filesystem backup: stopped cluster, complete directory including WAL.
      // Both destinations are newly created under this helper's own ignored test directory.
      await stop();
      const backup = resolve(directory, "backup"), restored = resolve(directory, "restored");
      await cp(data, backup, { recursive: true, force: false, errorOnExist: true });
      await cp(backup, restored, { recursive: true, force: false, errorOnExist: true });
      data = restored; await start();
    },
  };
}
