import { expect, it } from "vitest";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { setupLocalService } from "./service";
import { profilePaths } from "./profile";

async function freePort() {
  const server = createServer(); await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("Port unavailable");
  await new Promise<void>(done => server.close(() => done())); return address.port;
}
const exists = (path: string) => access(path).then(() => true, () => false);

it("ordinary Node local:start selects only the explicit profile, serves the built app, and stops its owned cluster without changing profile bytes", async () => {
  const directory = await mkdtemp(resolve("analysis-local/local-cli-test-")), state = join(directory, "profile");
  const databasePort = await freePort(); let apiPort = await freePort(); while (databasePort === apiPort) apiPort = await freePort();
  let child: ReturnType<typeof spawn> | undefined;
  try {
    await setupLocalService({ directory: state, databasePort, apiPort });
    const paths = profilePaths(state), before = await readFile(paths.profile), origin = `http://127.0.0.1:${apiPort}`;
    const environment = { ...process.env };
    for (const key of ["GESTAO_REPORT_CHROMIUM_EXECUTABLE", "GESTAO_REPORT_CHROMIUM_SHA256", "GESTAO_REPORT_CHROMIUM_VERSION"]) delete environment[key];
    child = spawn(process.execPath, ["--import", "tsx", "apps/server/src/local/start.ts", "--profile", state], { cwd: resolve("."), env: environment, stdio: ["ignore", "pipe", "pipe"] });
    const exited = new Promise<number | null>((done, reject) => { child!.once("error", reject); child!.once("exit", done); });
    let output = "", errors = "";
    child.stderr!.on("data", chunk => { errors += String(chunk); });
    await new Promise<void>((done, reject) => {
      const timeout = setTimeout(() => reject(new Error("Local CLI startup timeout")), 30_000);
      child!.stdout!.on("data", chunk => { output += String(chunk); if (output.includes(origin)) { clearTimeout(timeout); done(); } });
      void exited.then(() => { clearTimeout(timeout); reject(new Error(`Local CLI exited before startup: ${errors}`)); }, reject);
    });
    expect((await fetch(origin)).status).toBe(200);
    expect((await fetch(`${origin}/api/auth/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).status).toBe(200);
    expect(output).not.toContain("databasePassword"); expect(errors).not.toContain("postgresql://");
    child.kill("SIGTERM"); expect(await exited).toBe(0); child = undefined;
    expect(await readFile(paths.profile)).toEqual(before);
    expect(await exists(paths.lock)).toBe(false); expect(await exists(join(paths.data, "postmaster.pid"))).toBe(false);
  } finally {
    if (child && child.exitCode === null) { const ended = new Promise<void>(done => child!.once("exit", () => done())); child.kill("SIGTERM"); await ended; }
    await rm(directory, { recursive: true });
  }
}, 60_000);

it("ordinary Node local commands reject empty profiles and unsupported arguments without selecting the default", () => {
  for (const [entry, args] of [["start", ["--profile", ""]], ["start", ["--unexpected"]], ["reports", ["--profile", "", "--executable", "explicit-unused-browser"]]] as const) {
    try {
      execFileSync(process.execPath, ["--import", "tsx", `apps/server/src/local/${entry}.ts`, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30_000 });
      throw new Error("Command unexpectedly succeeded");
    } catch (error) {
      expect((error as { status?: number }).status).toBe(1);
      const stderr = String((error as { stderr?: string }).stderr);
      expect(stderr).not.toContain("ERR_IMPORT_ATTRIBUTE_MISSING"); expect(stderr).not.toContain("SyntaxError"); expect(stderr).not.toContain("explicit-unused-browser");
    }
  }
});
