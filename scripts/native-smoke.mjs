// Playwright's official WebView2 CDP approach; only this child receives debugging settings.
import { spawn, spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, realpath, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:net";
import { URL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, expect } from "@playwright/test";

if (process.platform !== "win32") throw new Error("Native check requires Windows/WebView2");
await writeFile("docs/runbooks/native-metadata-check.json", JSON.stringify({ passed: false, checkedAt: new Date().toISOString(), status: "started-not-completed" }, null, 2) + "\n");
const executable = resolve("src-tauri/target/debug/gestao-oficinas.exe");
await access(executable);
await mkdir("analysis-local", { recursive: true });
await mkdir("ui-report", { recursive: true });
const profile = await mkdtemp(resolve(await realpath(tmpdir()), "gestao-native-webview-"));
const portReservation = createServer();
await new Promise((done, reject) => { portReservation.once("error", reject); portReservation.listen(0, "127.0.0.1", done); });
const port = portReservation.address().port;
await new Promise((done, reject) => portReservation.close(error => error ? reject(error) : done()));
const child = spawn(executable, [], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: {
  ...process.env,
  WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${port} --remote-debugging-address=127.0.0.1`,
  WEBVIEW2_USER_DATA_FOLDER: profile,
} });
let nativeLog = "";
for (const stream of [child.stdout, child.stderr]) stream.on("data", data => { nativeLog = (nativeLog + data.toString()).slice(-65536); });
let launchError;
child.once("error", error => { launchError = error; });
let browser;
try {
  const endpoint = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (launchError) throw launchError;
    if (child.exitCode !== null) throw new Error(`Native process exited early: ${child.exitCode}`);
    try { const response = await fetch(`${endpoint}/json/version`); if (response.ok) { ready = true; break; } } catch { /* Native process is starting. */ }
    await delay(250);
  }
  if (!ready) throw new Error("Own native WebView2 did not expose CDP within 30 seconds");
  browser = await chromium.connectOverCDP(endpoint);
  const context = browser.contexts()[0];
  await expect.poll(() => context.pages().length).toBeGreaterThan(0);
  const page = context.pages()[0];
  await page.goto(new URL("?diagnostics=foundation", page.url()).href);
  await expect(page).toHaveTitle("Gestão de Oficinas");
  await expect(page.getByTestId("foundation-inspect")).toBeVisible();
  await expect(page.getByTestId("foundation-preview")).toHaveCount(0);
  await page.getByTestId("foundation-inspect").click();
  await expect(page.getByTestId("foundation-info")).toHaveText("0.1.0 · windows");
  await page.reload();
  await page.getByTestId("foundation-inspect").click();
  await expect(page.getByTestId("foundation-info")).toHaveText("0.1.0 · windows");
  await page.screenshot({ path: "ui-report/foundation-native.png" });
  const result = { passed: true, checkedAt: new Date().toISOString(), platform: process.platform, webviewVersion: browser.version(),
    evidence: "Built Tauri debug executable, actual WebView2 -> invoke -> registered Rust command -> rendered metadata, including reload", metadata: "0.1.0 · windows",
    notCovered: ["installer", "business data", "printing", "devices", "legacy parity"] };
  await writeFile("docs/runbooks/native-metadata-check.json", JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  await writeFile("ui-report/native-process.log", nativeLog);
  console.error(`Native process exitCode=${child.exitCode}, signal=${child.signalCode}; diagnostic log saved in ui-report/native-process.log`);
  const diagnostics = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command",
    `$rootProcess = Get-Process -Id ${child.pid} -ErrorAction SilentlyContinue; $rootProcess | Select-Object ProcessName,Id,SessionId,MainWindowTitle | ConvertTo-Json; Get-CimInstance Win32_Process -Filter "ParentProcessId = ${child.pid}" | Select-Object Name,ProcessId,ParentProcessId,SessionId | ConvertTo-Json; Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object State,LocalAddress,LocalPort,OwningProcess | ConvertTo-Json`
  ], { windowsHide: true, encoding: "utf8" });
  console.error(diagnostics.stdout);
  // Only foundation metadata is loaded by this process.
  if (nativeLog) console.error(nativeLog);
  throw error;
} finally {
  try { if (browser) await browser.close(); } finally {
    if (child.pid && child.exitCode === null) {
      const closed = spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      if (closed.status !== 0 && child.exitCode === null) child.kill();
    }
  }
}
