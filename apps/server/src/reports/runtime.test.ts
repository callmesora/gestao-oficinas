import { afterAll, beforeAll, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chmod, cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";
import { createApp } from "../app";
import { createReportRenderer, loadReportAssets } from "./renderer";
import { createConfiguredReportRenderer, reportRuntimeConfiguration, ReportRuntimeConfigurationError } from "./runtime";

const require = createRequire(import.meta.url);
const executablePath = process.env.REPORT_TEST_EXECUTABLE ?? (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  : process.platform === "win32" ? join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe") : chromium.executablePath());
const report = { reportId: "RPT_inventario" as const, html: '<article style="font-family:ReportSans"><h1>RUNTIME — AÇÃO</h1><p>9007199254740993</p></article>', css: "@page{size:A4;margin:20mm;}h1{font-weight:700;}p{font-weight:400;}", unresolved: [] };
let folder: string, sha256: string, version: string;
beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "gestao-report-runtime-"));
  sha256 = createHash("sha256").update(await readFile(executablePath)).digest("hex");
  const browser = await chromium.launch({ executablePath, headless: true });
  try { version = browser.version(); } finally { await browser.close(); }
}, 60_000);
afterAll(async () => { if (folder) await rm(folder, { recursive: true, force: true }); });
const environment = () => ({ GESTAO_REPORT_CHROMIUM_EXECUTABLE: executablePath, GESTAO_REPORT_CHROMIUM_SHA256: sha256, GESTAO_REPORT_CHROMIUM_VERSION: version });
async function errorCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ name: "ReportRuntimeConfigurationError", code, message: `Report runtime configuration failed (${code})` });
}

it("absent provisioning leaves the real authenticated report endpoint typed unavailable", async () => {
  const renderer = await createConfiguredReportRenderer({});
  expect(renderer).toBeUndefined();
  const app = createApp({ reportRenderer: renderer, authenticate: async () => ({ userId: "synthetic-runtime" }) });
  try {
    const result = await app.inject({ method: "POST", url: "/api/reports/render", payload: {} });
    expect(result.statusCode).toBe(503); expect(result.json()).toEqual({ kind: "unavailable" });
  } finally { await app.close(); }
});

it("requires all explicit pins, accepts native Windows/macOS absolute paths and refuses relative/network locations", async () => {
  expect(reportRuntimeConfiguration(environment())).toEqual({ executablePath, sha256, version });
  expect(reportRuntimeConfiguration({ ...environment(), GESTAO_REPORT_CHROMIUM_EXECUTABLE: "C:\\Runtime With Spaces\\chrome.exe" }, "win32")?.executablePath).toBe("C:\\Runtime With Spaces\\chrome.exe");
  expect(reportRuntimeConfiguration({ ...environment(), GESTAO_REPORT_CHROMIUM_EXECUTABLE: "/Applications/Offline Runtime.app/Contents/MacOS/Chrome" }, "darwin")?.executablePath).toBe("/Applications/Offline Runtime.app/Contents/MacOS/Chrome");
  for (const patch of [{ GESTAO_REPORT_CHROMIUM_EXECUTABLE: undefined }, { GESTAO_REPORT_CHROMIUM_SHA256: "" }, { GESTAO_REPORT_CHROMIUM_VERSION: "156" }, { GESTAO_REPORT_CHROMIUM_SHA256: "secret-invalid-value" }, { GESTAO_REPORT_CHROMIUM_EXECUTABLE: "relative/chrome" }, { GESTAO_REPORT_CHROMIUM_EXECUTABLE: "https://example.invalid/chrome" }, { GESTAO_REPORT_CHROMIUM_EXECUTABLE: executablePath + "\0" }]) {
    await errorCode(createConfiguredReportRenderer({ ...environment(), ...patch }), "configuration");
  }
  expect(() => reportRuntimeConfiguration({ ...environment(), GESTAO_REPORT_CHROMIUM_EXECUTABLE: "\\\\network\\share\\chrome.exe" }, "win32")).toThrow(ReportRuntimeConfigurationError);
});

it("missing, directory and unreadable executable configurations fail without a channel or cache fallback", async () => {
  await errorCode(createConfiguredReportRenderer({ ...environment(), GESTAO_REPORT_CHROMIUM_EXECUTABLE: join(folder, "missing-private-location") }), "executable");
  await errorCode(createConfiguredReportRenderer({ ...environment(), GESTAO_REPORT_CHROMIUM_EXECUTABLE: folder }), "executable");
  if (process.platform !== "win32") {
    const noExecute = join(folder, "not-executable"); await writeFile(noExecute, "not a browser", { mode: 0o600 });
    await errorCode(createConfiguredReportRenderer({ ...environment(), GESTAO_REPORT_CHROMIUM_EXECUTABLE: noExecute }), "executable");
  }
});

it("fingerprint and actual browser version mismatches have fixed secret-safe startup errors", async () => {
  const wrongHash = (sha256[0] === "0" ? "1" : "0") + sha256.slice(1);
  await errorCode(createConfiguredReportRenderer({ ...environment(), GESTAO_REPORT_CHROMIUM_SHA256: wrongHash }), "fingerprint");
  await errorCode(createConfiguredReportRenderer({ ...environment(), GESTAO_REPORT_CHROMIUM_VERSION: "0.0.0.0" }), "version");
}, 60_000);

it("an existing executable that cannot start Chromium is rejected rather than replaced with installed Chrome", async () => {
  const invalidBrowser = join(folder, process.platform === "win32" ? "invalid-browser.exe" : "invalid-browser");
  await writeFile(invalidBrowser, "not an executable browser"); await chmod(invalidBrowser, 0o700);
  const hash = createHash("sha256").update(await readFile(invalidBrowser)).digest("hex");
  await errorCode(createConfiguredReportRenderer({ ...environment(), GESTAO_REPORT_CHROMIUM_EXECUTABLE: invalidBrowser, GESTAO_REPORT_CHROMIUM_SHA256: hash }), "launch");
}, 60_000);

it("offline assets require the pinned packages and actual valid regular/bold WOFF2 files", async () => {
  const assets = await loadReportAssets();
  expect(Buffer.from(assets.fontRegular, "base64").toString("ascii", 0, 4)).toBe("wOF2");
  expect(Buffer.from(assets.fontBold, "base64").toString("ascii", 0, 4)).toBe("wOF2");
  expect(assets.notices).toContain("SIL OPEN FONT LICENSE");
  const modules = join(folder, "modules"), paged = join(modules, "pagedjs"), fonts = join(modules, "@fontsource", "noto-sans");
  await mkdir(join(paged, "dist"), { recursive: true }); await mkdir(join(fonts, "files"), { recursive: true });
  const pagedRoot = resolve(dirname(require.resolve("pagedjs")), ".."), fontRoot = dirname(require.resolve("@fontsource/noto-sans/package.json"));
  for (const file of ["package.json", "LICENSE.md", "dist/paged.js"]) await cp(join(pagedRoot, file), join(paged, file));
  for (const file of ["package.json", "LICENSE", "files/noto-sans-latin-400-normal.woff2", "files/noto-sans-latin-700-normal.woff2"]) await cp(join(fontRoot, file), join(fonts, file));
  await writeFile(join(paged, "package.json"), '{"version":"0.0.0"}');
  await expect(loadReportAssets(modules)).rejects.toThrow("Report asset version mismatch");
  await writeFile(join(paged, "package.json"), '{"version":"0.4.3"}');
  await writeFile(join(fonts, "files/noto-sans-latin-700-normal.woff2"), "broken font");
  await expect(loadReportAssets(modules)).rejects.toThrow("Report font invalid");
  await rm(join(fonts, "files/noto-sans-latin-700-normal.woff2"));
  await expect(loadReportAssets(modules)).rejects.toThrow();
});

it("the configured executable produces the actual scriptless offline PDF with both embedded fonts", async () => {
  const render = await createConfiguredReportRenderer(environment());
  expect(render).toBeTypeOf("function");
  const result = await render!(report);
  expect(result.kind).toBe("rendered");
  if (result.kind !== "rendered") throw new Error("Configured report did not render");
  expect(result.pageCount).toBe(1); expect(result.html).toContain("data:font/woff2;base64,");
  expect(result.html).toContain("SIL OPEN FONT LICENSE"); expect(result.html).not.toContain("<script");
  const pdf = JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;r=PdfReader(io.BytesIO(sys.stdin.buffer.read()));fonts=[f.get_object() for p in r.pages for f in p['/Resources']['/Font'].values()];embedded=[d.get_object().get('/FontDescriptor').get_object() for f in fonts for d in f.get('/DescendantFonts',[])];print(json.dumps({'text':' '.join(p.extract_text() for p in r.pages),'embedded':sum(any(k in d for k in ['/FontFile','/FontFile2','/FontFile3']) for d in embedded)}))"], { input: Buffer.from(result.pdfBase64, "base64"), encoding: "utf8" }));
  expect(pdf.text).toContain("RUNTIME — AÇÃO"); expect(pdf.text).toContain("9007199254740993"); expect(pdf.embedded).toBeGreaterThanOrEqual(2);
}, 60_000);

it("each render checks the configured version again and never falls back when its executable is missing", async () => {
  expect(await createReportRenderer({ executablePath, expectedVersion: "0.0.0.0" })(report)).toEqual({ kind: "unavailable" });
  expect(await createReportRenderer({ executablePath: join(folder, "missing-after-startup"), expectedVersion: version })(report)).toEqual({ kind: "failed" });
}, 60_000);
