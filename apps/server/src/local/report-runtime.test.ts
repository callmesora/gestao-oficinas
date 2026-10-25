import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createServer } from "node:net";
import { access, chmod, mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { provisionLocalReportRuntime, createLocalReportRenderer, localReportPinPath } from "./report-runtime";
import { profilePaths, privateFile, readLocalProfile } from "./profile";
import { acquireRunner, connectLocal } from "./postgres";
import { setupLocalService, startLocalService } from "./service";

// Explicit executable supplied by this test fixture only. Production has no search/default.
const executable = process.env.REPORT_TEST_EXECUTABLE ?? (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  : process.platform === "win32" ? join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe") : chromium.executablePath());
let root: string, directory: string, frontend: string, originalPin: string, profileBefore: string;
const pin = () => localReportPinPath(directory);
const exists = (path: string) => access(path).then(() => true, () => false);
const hash = async (path: string) => createHash("sha256").update(await readFile(path)).digest("hex");
async function freePort() {
  const server = createServer(); await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  const address = server.address(); if (!address || typeof address === "string") throw new Error();
  await new Promise<void>(done => server.close(() => done())); return address.port;
}
async function restorePin(contents = originalPin) { await unlink(pin()).catch(() => undefined); await privateFile(pin(), contents); }
const envFor = (value = JSON.parse(originalPin)) => ({ GESTAO_REPORT_CHROMIUM_EXECUTABLE: value.executablePath, GESTAO_REPORT_CHROMIUM_SHA256: value.sha256, GESTAO_REPORT_CHROMIUM_VERSION: value.browserVersion });
function pdfInfo(base64: string): { text: string; embedded: number } {
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;r=PdfReader(io.BytesIO(sys.stdin.buffer.read()));fonts=[f.get_object() for p in r.pages for f in p['/Resources']['/Font'].values()];embedded=[d.get_object().get('/FontDescriptor').get_object() for f in fonts for d in f.get('/DescendantFonts',[])];print(json.dumps({'text':' '.join(p.extract_text() for p in r.pages),'embedded':sum(any(k in d for k in ['/FontFile','/FontFile2','/FontFile3']) for d in embedded)}))"], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}
const smoke = { reportId: "RPT_inventario" as const, html: '<article style="font-family:ReportSans"><h1>LOCAL — AÇÃO</h1><p>9007199254740993</p></article>', css: "@page{size:A4;margin:20mm;}h1{font-weight:700;}p{font-weight:400;}", unresolved: [] };
beforeAll(async () => {
  root = await mkdtemp(resolve("analysis-local/local-reports-test-")); directory = join(root, "profile"); frontend = join(root, "dist");
  await mkdir(frontend); await writeFile(join(frontend, "index.html"), "<!doctype html><title>Owned built report service fixture</title>");
  const databasePort = await freePort(); let apiPort = await freePort(); while (apiPort === databasePort) apiPort = await freePort();
  await setupLocalService({ directory, databasePort, apiPort }); profileBefore = await hash(profilePaths(directory).profile);
  const provisioned = await provisionLocalReportRuntime({ directory, executable }); expect(provisioned.pinFile).toBe(pin());
  originalPin = await readFile(pin(), "utf8");
}, 90_000);
beforeEach(async () => { await restorePin(); });
afterAll(async () => { if (root) await rm(root, { recursive: true }); }, 60_000);

it("explicit chosen launch stores exact private profile-bound pins and the existing renderer produces offline PDF/font bytes", async () => {
  const saved = JSON.parse(originalPin), profile = await readLocalProfile(directory);
  expect(Object.keys(saved).sort()).toEqual(["version", "profileId", "executablePath", "sha256", "browserVersion"].sort());
  expect(saved).toMatchObject({ version: 1, profileId: profile.id, executablePath: executable, sha256: await hash(executable) });
  expect(saved.browserVersion).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
  if (process.platform !== "win32") expect((await stat(pin())).mode & 0o777).toBe(0o600);
  const render = await createLocalReportRenderer(directory, {}); expect(render).toBeTypeOf("function");
  const result = await render!(smoke); expect(result.kind).toBe("rendered"); if (result.kind !== "rendered") throw new Error();
  const actual = pdfInfo(result.pdfBase64); expect(actual.text).toContain("LOCAL — AÇÃO"); expect(actual.text).toContain("9007199254740993"); expect(actual.embedded).toBeGreaterThanOrEqual(2);
  expect(result.html).toContain("data:font/woff2;base64,"); expect(result.html).not.toContain("<script");
  expect(await hash(profilePaths(directory).profile)).toBe(profileBefore); expect(await exists(profilePaths(directory).lock)).toBe(false);
}, 60_000);

it("existing pins require explicit replacement; failed/cancelled/invalid executable attempts preserve prior bytes and release only their lock", async () => {
  await expect(provisionLocalReportRuntime({ directory, executable })).rejects.toThrow("report_pin_exists");
  for (const selected of [join(root, "missing-private-executable"), "relative-chrome", root]) {
    await expect(provisionLocalReportRuntime({ directory, executable: selected, replace: true })).rejects.toThrow(/report_runtime_(executable|configuration)/);
    expect(await readFile(pin(), "utf8")).toBe(originalPin); expect(await exists(profilePaths(directory).lock)).toBe(false);
  }
  const invalid = join(root, process.platform === "win32" ? "invalid-browser.exe" : "invalid-browser"); await writeFile(invalid, "not an executable browser", { mode: 0o700 });
  await expect(provisionLocalReportRuntime({ directory, executable: invalid, replace: true })).rejects.toThrow("report_runtime_launch");
  const abort = new AbortController(); abort.abort();
  await expect(provisionLocalReportRuntime({ directory, executable, replace: true, signal: abort.signal })).rejects.toThrow("report_provision_interrupted");
  expect(await readFile(pin(), "utf8")).toBe(originalPin); expect((await readdir(directory)).filter(name => name.startsWith(".report-runtime-"))).toEqual([]);
  expect(await exists(profilePaths(directory).lock)).toBe(false);
}, 60_000);

it("explicit replacement publishes a validated pin atomically and missing/foreign profiles never create state or change another runner lock", async () => {
  await restorePin("{invalid old owned pin}"); await provisionLocalReportRuntime({ directory, executable, replace: true });
  expect(await readFile(pin(), "utf8")).toBe(originalPin);
  const missing = join(root, "missing-profile"); await expect(provisionLocalReportRuntime({ directory: missing, executable })).rejects.toThrow("existing_profile_required"); expect(await exists(missing)).toBe(false);
  const profile = await readLocalProfile(directory), release = await acquireRunner(directory, profile.id), lock = await readFile(profilePaths(directory).lock, "utf8");
  try { await expect(provisionLocalReportRuntime({ directory, executable, replace: true })).rejects.toThrow("runner_already_present"); expect(await readFile(profilePaths(directory).lock, "utf8")).toBe(lock); }
  finally { await release(); }
}, 60_000);

it("ordinary start refuses invalid/bounded/profile-mismatched/private pin state before starting any database and releases its lock", async () => {
  const value = JSON.parse(originalPin);
  for (const invalid of ["not JSON", JSON.stringify({ ...value, extra: true }), JSON.stringify({ ...value, profileId: "00000000-0000-4000-8000-000000000000" }), JSON.stringify({ ...value, sha256: "secret-invalid-value" }), " ".repeat(64 * 1024 + 1)]) {
    await restorePin(invalid); await expect(startLocalService({ directory, frontend, environment: {} })).rejects.toThrow("report_pin_invalid");
    expect(await readFile(pin(), "utf8")).toBe(invalid); expect(await exists(profilePaths(directory).lock)).toBe(false); expect(await exists(join(profilePaths(directory).data, "postmaster.pid"))).toBe(false);
  }
  if (process.platform !== "win32") {
    await restorePin(); await chmod(pin(), 0o644); await expect(startLocalService({ directory, frontend, environment: {} })).rejects.toThrow("report_pin_invalid"); await chmod(pin(), 0o600);
    const target = join(root, "outside-pin.json"); await privateFile(target, originalPin); await unlink(pin()); await symlink(target, pin());
    await expect(startLocalService({ directory, frontend, environment: {} })).rejects.toThrow("report_pin_invalid"); expect(await readFile(target, "utf8")).toBe(originalPin);
  }
});

it("explicit partial/invalid environment never falls back to even a valid pin; complete explicit settings ignore a malformed pin", async () => {
  for (const environment of [{ GESTAO_REPORT_CHROMIUM_EXECUTABLE: executable }, { ...envFor(), GESTAO_REPORT_CHROMIUM_SHA256: "" }, { ...envFor(), GESTAO_REPORT_CHROMIUM_SHA256: "0".repeat(64) }, { ...envFor(), GESTAO_REPORT_CHROMIUM_VERSION: "0.0.0.0" }]) {
    await expect(startLocalService({ directory, frontend, environment })).rejects.toThrow(/report_runtime_(configuration|fingerprint|version)/);
    expect(await exists(profilePaths(directory).lock)).toBe(false); expect(await exists(join(profilePaths(directory).data, "postmaster.pid"))).toBe(false); expect(await readFile(pin(), "utf8")).toBe(originalPin);
  }
  await restorePin("malformed pin must not be read for explicit settings");
  expect(await createLocalReportRenderer(directory, envFor())).toBeTypeOf("function"); expect(await readFile(pin(), "utf8")).toBe("malformed pin must not be read for explicit settings");
}, 60_000);

it("actual persistent service renders authenticated database reports before/after full restart from the same saved pin; missing pins keep typed unavailable", async () => {
  let running: Awaited<ReturnType<typeof startLocalService>> | undefined;
  const api = async (path: string, payload: unknown, token?: string) => {
    const response = await fetch(`${running!.origin}/api/${path}`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) });
    return { status: response.status, body: await response.json() };
  };
  try {
    running = await startLocalService({ directory, frontend, environment: {} });
    expect((await api("reports/render", {})).status).toBe(401);
    const operator = (await readFile(profilePaths(directory).token, "utf8")).trim(), enrolled = await api("auth/enroll", { code: 1, password: "Reports42", token: operator }); expect(enrolled.body.kind).toBe("continuar"); const token = enrolled.body.session.token;
    const database = await connectLocal(await readLocalProfile(directory));
    try { await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES ($1,$2)', ["9007199254740993", "Profile AÇÃO"]); } finally { await database.end(); }
    const request = { reportId: "RPT_List_Clientes", context: { company: "Synthetic local report company", dateText: "25/10/2026" }, source: { kind: "embedded-query" } };
    const first = await api("reports/render", request, token); expect(first.status).toBe(200); expect(first.body.kind).toBe("rendered");
    expect(pdfInfo(first.body.pdfBase64).text).toContain("Profile AÇÃO"); expect(pdfInfo(first.body.pdfBase64).text.replace(/\s/g, "")).toContain("9007199254740993");
    await running.close(); running = undefined; expect(await exists(profilePaths(directory).lock)).toBe(false);
    expect(await readFile(pin(), "utf8")).toBe(originalPin); expect(await hash(profilePaths(directory).profile)).toBe(profileBefore);
    running = await startLocalService({ directory, frontend, environment: {} });
    const restarted = await api("reports/render", request, token); expect(restarted.status).toBe(200); expect(restarted.body.kind).toBe("rendered");
    const pdf = pdfInfo(restarted.body.pdfBase64); expect(pdf.text).toContain("Profile AÇÃO"); expect(pdf.text).toContain("Synthetic local report company"); expect(pdf.embedded).toBeGreaterThanOrEqual(2); expect(restarted.body.html).not.toContain("<script");
    await running.close(); running = undefined; await unlink(pin());
    running = await startLocalService({ directory, frontend, environment: {} });
    const unavailable = await api("reports/render", request, token); expect(unavailable.status).toBe(503); expect(unavailable.body).toEqual({ kind: "unavailable" });
    expect((await api("auth/session", {}, token)).body.kind).toBe("authenticated");
  } finally { await running?.close(); }
  expect(await exists(profilePaths(directory).lock)).toBe(false); expect(await exists(join(profilePaths(directory).data, "postmaster.pid"))).toBe(false);
}, 90_000);

it("actual Node CLI rejects absent/unsupported arguments without creating a default profile or leaking chosen-path errors", () => {
  for (const args of [[], ["--unexpected"], ["--executable", ""]]) {
    let stderr: string;
    try { execFileSync(process.execPath, ["--import", "tsx", "apps/server/src/local/reports.ts", ...args], { cwd: resolve("."), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30_000 }); throw new Error("Command unexpectedly succeeded"); }
    catch (error) { stderr = String((error as { stderr?: string }).stderr); expect((error as { status?: number }).status).toBe(1); }
    expect(stderr).not.toContain("ERR_IMPORT_ATTRIBUTE_MISSING"); expect(stderr).not.toContain("SyntaxError"); expect(stderr).not.toContain(executable);
  }
});
