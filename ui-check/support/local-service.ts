import { test as base, expect } from "@playwright/test";
import { createServer } from "node:net";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { setupLocalService, startLocalService } from "../../apps/server/src/local/service";
async function freePort() { const server = createServer(); await new Promise<void>(done => server.listen(0, "127.0.0.1", done)); const address = server.address(); if (!address || typeof address === "string") throw new Error(); await new Promise<void>(done => server.close(() => done())); return address.port; }
type LocalServer = { origin: string; setupToken: string; restart: () => Promise<void> };
export const test = base.extend<object, { localServiceServer: LocalServer }>({
  localServiceServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Configured Chrome required");
    const root = fileURLToPath(new URL("../../", import.meta.url)), directory = await mkdtemp(resolve(root, "analysis-local/local-service-browser-")), frontend = join(directory, "dist"), state = join(directory, "profile");
    let running: Awaited<ReturnType<typeof startLocalService>> | undefined;
    try {
      // Test preparation builds production assets once; ordinary runtime never starts Vite or rebuilds.
      await build({ root, logLevel: "silent", define: { "import.meta.env.VITE_WORKSHOP_API_BASE": JSON.stringify("") }, build: { outDir: frontend, emptyOutDir: false } });
      const databasePort = await freePort(); let apiPort = await freePort(); while (apiPort === databasePort) apiPort = await freePort();
      const prepared = await setupLocalService({ directory: state, databasePort, apiPort }); running = await startLocalService({ directory: state, frontend, environment: {} });
      await use({ origin: running.origin, setupToken: (await readFile(prepared.tokenFile, "utf8")).trim(), restart: async () => { await running!.close(); running = await startLocalService({ directory: state, frontend, environment: {} }); } });
    } finally { try { await running?.close(); } finally { await rm(directory, { recursive: true }); } }
  }, { scope: "worker", timeout: 90000 }],
});
export { expect };
