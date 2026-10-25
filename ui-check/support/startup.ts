import { test as base, expect } from "@playwright/test";
import type { Client } from "pg";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../../apps/server/test-support/postgres";
import { migrate } from "../../apps/server/src/db/migrate";
import { createApp } from "../../apps/server/src/app";
import { developmentSessions } from "../../apps/server/src/development-sessions";

type StartupServer = { origin: string; database: Client };
export const test = base.extend<{ startupDatabase: Client }, { startupServer: StartupServer }>({
  startupServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Configured Chrome required");
    const engine = await startIsolatedPostgres();
    let database: Client | undefined, app: ReturnType<typeof createApp> | undefined, vite: Awaited<ReturnType<typeof createServer>> | undefined;
    try {
      database = await engine.database(); await migrate(database);
      const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name, connect = () => engine.connect(name);
      const sessions = developmentSessions("unbound");
      app = createApp({ customerConnect: connect, vehicleConnect: connect, unitConnect: connect, descriptiveStateConnect: connect, terminalConnect: connect, postoConnect: connect, mechanicsConnect: connect, repairStateConnect: connect, documentTypeConnect: connect, articleConnect: connect, userConnect: connect, repairOrderConnect: connect, repairLaborConnect: connect, repairMaterialsConnect: connect, stockConnect: connect, startupConnect: connect, development: sessions });
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address(); if (!address || typeof address === "string") throw new Error("Startup test API unavailable");
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), cacheDir: resolve(engine.directory, "vite-startup"), server: { host: "127.0.0.1", port: 0, proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } });
      await vite.listen();
      const origin = vite.resolvedUrls?.local[0]?.replace(/\/$/, ""); if (!origin) throw new Error("Startup test Vite unavailable");
      sessions.origin = origin;
      await use({ origin, database });
    } finally { try { await vite?.close(); } finally { try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } } } }
  }, { scope: "worker", timeout: 90000 }],
  startupDatabase: [async ({ startupServer }, use) => {
    await startupServer.database.query('TRUNCATE app."sistema",app."utilizadores",app."Clientes" RESTART IDENTITY');
    await use(startupServer.database);
  }, { auto: true }],
});
export { expect };
