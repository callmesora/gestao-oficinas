import { test as base, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { createServer } from "node:net";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { chromium } from "playwright-core";
import { setupLocalService, startLocalService } from "../../apps/server/src/local/service";
import { localReportPinPath, provisionLocalReportRuntime } from "../../apps/server/src/local/report-runtime";
async function freePort() {
  const server = createServer(); await new Promise<void>(done => server.listen(0, "127.0.0.1", done)); const address = server.address(); if (!address || typeof address === "string") throw new Error(); await new Promise<void>(done => server.close(() => done())); return address.port;
}
type ReportServer = { origin: string; setupToken: string; restart: () => Promise<void>; pinHash: () => Promise<string> };
export const test = base.extend<object, { localReportServer: ReportServer }>({
  localReportServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Configured Chrome required");
    const root = fileURLToPath(new URL("../../", import.meta.url)), directory = await mkdtemp(resolve(root, "analysis-local/local-report-browser-")), frontend = join(directory, "dist"), state = join(directory, "profile");
    // Explicit fixture selection only; no production path search/default is introduced.
    const executable = process.env.REPORT_TEST_EXECUTABLE ?? (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : process.platform === "win32" ? join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe") : chromium.executablePath());
    let running: Awaited<ReturnType<typeof startLocalService>> | undefined;
    try {
      await build({ root, logLevel: "silent", define: { "import.meta.env.VITE_WORKSHOP_API_BASE": JSON.stringify("") }, build: { outDir: frontend, emptyOutDir: false } });
      const databasePort = await freePort(); let apiPort = await freePort(); while (apiPort === databasePort) apiPort = await freePort();
      const prepared = await setupLocalService({ directory: state, databasePort, apiPort });
      await provisionLocalReportRuntime({ directory: state, executable });
      running = await startLocalService({ directory: state, frontend, environment: {} });
      await use({ origin: running.origin, setupToken: (await readFile(prepared.tokenFile, "utf8")).trim(),
        restart: async () => { await running!.close(); running = await startLocalService({ directory: state, frontend, environment: {} }); },
        pinHash: async () => createHash("sha256").update(await readFile(localReportPinPath(state))).digest("hex") });
    } finally { try { await running?.close(); } finally { await rm(directory, { recursive: true }); } }
  }, { scope: "worker", timeout: 120000 }],
});
export { expect };
