import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, realpath, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { setTimeout, clearTimeout } from "node:timers";
import { startIsolatedPostgres } from "../apps/server/test-support/postgres.ts";
import { createBusinessApp } from "../apps/server/src/business-app.ts";
import { createReportRenderer } from "../apps/server/src/reports/renderer.ts";
import { readServiceConfiguration } from "../apps/server/src/configuration.ts";
import { build as buildFrontend } from "vite";

if (!["darwin", "win32"].includes(process.platform)) throw new Error("Native business probe requires Windows/macOS");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const syntheticCustomerCount = 1001;
assert.ok(process.env.npm_execpath, "Run through npm run native:business");
const build = spawnSync(process.execPath, [process.env.npm_execpath, "run", "typecheck"], { cwd: root, encoding: "utf8", timeout: 180_000 });
assert.equal(build.status, 0, build.stderr || "Frontend build failed");
const engine = await startIsolatedPostgres(), profile = await mkdtemp(join(await realpath(tmpdir()), "gestao-native-business-"));
let database, app, child;
try {
  database = await engine.database();
  const url = new URL(`postgresql://127.0.0.1:${database.port}/${database.database}`); url.username = database.user; url.password = database.password;
  const token = randomBytes(32).toString("hex"), tokenFile = join(engine.directory, "synthetic-native-operator-token");
  await writeFile(tokenFile, token, { mode: 0o600, flag: "wx" });
  const render = createReportRenderer(), reports = [];
  app = await createBusinessApp(await readServiceConfiguration({ WORKSHOP_DATABASE_URL: url.href, WORKSHOP_SETUP_TOKEN_FILE: tokenFile }), async document => {
    const result = await render(document);
    if (result.kind === "rendered") {
      assert.equal(result.reportId, "RPT_List_Clientes");
      assert.ok(result.pageCount > 1); assert.ok(result.html.includes("data:font/woff2;base64,")); assert.ok(!result.html.includes("<script"));
      assert.ok(result.html.includes("Native synthetic customer") && result.html.includes("Native virtual synthetic 1001"));
      const pdf = Buffer.from(result.pdfBase64, "base64"); assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
      await writeFile(join(root, "analysis-local/native-business-report.pdf"), pdf);
      reports.push({ reportId: result.reportId, pageCount: result.pageCount, pdfBytes: pdf.length, offlineFontInSnapshot: true });
    }
    return result;
  });
  // Owned empty database only, before any enrollment or UI access; no imported customer records.
  await database.query(`INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao","observacao")
    SELECT 9000000+n,99999+n,'Native virtual synthetic '||lpad(n::text,4,'0'),'Native virtual memo '||lpad(n::text,4,'0')
    FROM generate_series(1,$1::int) AS fixture(n)`, [syntheticCustomerCount]);
  assert.equal((await database.query('SELECT count(*)::int AS count FROM app."Clientes"')).rows[0].count, syntheticCustomerCount);
  let developmentRequests = 0;
  app.addHook("onRequest", async request => { if (request.url.startsWith("/api/development/")) developmentRequests++; });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address(); assert.ok(address && typeof address !== "string");
  assert.notEqual(address.port, 3210, "Native probe must not use the owner's service port");
  const origin = `http://127.0.0.1:${address.port}`;
  // Separate assets/port leave the owner's persistent demo available during development.
  await buildFrontend({ root, logLevel: "silent", define: { "import.meta.env.VITE_WORKSHOP_API_BASE": JSON.stringify(origin) }, build: { outDir: join(root, "analysis-local/native-business-dist") } });
  const desktop = JSON.parse(await readFile(join(root, "src-tauri/tauri.conf.json"), "utf8"));
  const nativeConfiguration = { build: { frontendDist: "../analysis-local/native-business-dist" }, app: { security: { csp: desktop.app.security.csp.replace("http://127.0.0.1:3210", origin) } } };
  const native = spawnSync("cargo", ["build", "--locked", "--manifest-path", "src-tauri/Cargo.toml", "--features", "tauri/custom-protocol,development-tools", "--bin", "native-probe"], { cwd: root, encoding: "utf8", timeout: 180_000, env: { ...process.env, TAURI_CONFIG: JSON.stringify(nativeConfiguration) } });
  assert.equal(native.status, 0, native.stderr || "Native build failed");
  const executable = join(root, "src-tauri/target/debug", `native-probe${process.platform === "win32" ? ".exe" : ""}`);
  let stdout = "", stderr = "";
  child = spawn(executable, [], { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, GESTAO_NATIVE_PROBE_MODE: "business", GESTAO_NATIVE_PROBE_SETUP_TOKEN: token, GESTAO_NATIVE_PROBE_DATA_DIRECTORY: profile } });
  child.stdout.on("data", data => { stdout = (stdout + data).slice(-16_384); }); child.stderr.on("data", data => { stderr = (stderr + data).slice(-16_384); });
  const exitCode = await new Promise((done, reject) => {
    const timeout = setTimeout(() => { child.kill(); reject(new Error("Native business probe timed out")); }, 140_000);
    child.once("error", error => { clearTimeout(timeout); reject(error); }); child.once("exit", code => { clearTimeout(timeout); done(code); });
  });
  assert.equal(exitCode, 0, stderr || "Native business probe failed");
  const line = stdout.split(/\r?\n/).find(value => value.startsWith("NATIVE_PROBE "));
  assert.ok(line, "Native result missing: " + stderr.split(/\r?\n/).filter(value => value.startsWith("NATIVE_PROBE ")).join("; "));
  const result = JSON.parse(line.slice("NATIVE_PROBE ".length)); assert.equal(result.passed, true);
  assert.deepEqual(result.result.business, { enrolled: true, customerSaved: true, reportPreview: true, loggedOut: true, loggedInAgain: true });
  assert.equal(reports.length, 1);
  const customers = (await database.query('SELECT count(*)::int AS count FROM app."Clientes" WHERE "Codigo"=771 AND "Descricao"=$1', ["Native synthetic customer"])).rows[0].count;
  const totalCustomers = (await database.query('SELECT count(*)::int AS count FROM app."Clientes"')).rows[0].count;
  const retainedSyntheticCustomers = (await database.query(`SELECT count(*)::int AS count FROM app."Clientes"
    WHERE "ClientesID" BETWEEN 9000001 AND 9001001 AND "Codigo"="ClientesID"-8900001
      AND "Descricao"='Native virtual synthetic '||lpad(("ClientesID"-9000000)::text,4,'0')
      AND "observacao"='Native virtual memo '||lpad(("ClientesID"-9000000)::text,4,'0')`)).rows[0].count;
  const sessions = (await database.query("SELECT count(*)::int AS count FROM auth.sessions")).rows[0].count;
  assert.equal(customers, 1); assert.equal(totalCustomers, syntheticCustomerCount + 1); assert.equal(retainedSyntheticCustomers, syntheticCustomerCount);
  assert.equal(sessions, 0); assert.equal(developmentRequests, 0);
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }); assert.equal(commit.status, 0);
  await writeFile(join(root, "analysis-local/native-business-probe.json"), JSON.stringify({ platform: process.platform, architecture: process.arch, baseCommit: commit.stdout.trim(), workingTree: true, passed: true, customerRows: customers, seededCustomers: syntheticCustomerCount, retainedSyntheticCustomers, totalCustomers, nativeLargeCustomerList: { fullModelCount: syntheticCustomerCount, renderedRowsLessThan: 100, offscreenLastSelected: true, savedCustomerSelected: true }, reports, remainingSessions: sessions, developmentRequests, native: result, limits: "Actual native business window, preview iframe and output-control availability plus real Chromium PDF generation. The sandboxed iframe is opaque: native font/raster fidelity, OS save/print panels, physical devices and other-host acceptance remain separate." }, null, 2) + "\n");
  console.log(`Native business probe passed on ${process.platform}/${process.arch}: ${syntheticCustomerCount} synthetic customers, bounded native DOM and offscreen source search; enrollment, customer save, multipage report preview/PDF, logout/login, real database effects and zero DEV requests.`);
} finally {
  if (child && child.exitCode === null && child.signalCode === null) child.kill();
  try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } }
  await rm(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
}
