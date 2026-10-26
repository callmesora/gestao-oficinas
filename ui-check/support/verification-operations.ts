import { test as base, expect } from "@playwright/test";
import type { Client } from "pg";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../../apps/server/test-support/postgres";
import { migrate } from "../../apps/server/src/db/migrate";
import { createApp } from "../../apps/server/src/app";
import { developmentSessions } from "../../apps/server/src/development-sessions";

type OperationsFixture = { operations: { origin: string; database: Client; post: (resource: string, action: string, data: unknown) => Promise<unknown> } };

// Each case owns a new migrated database, development-session registry and Vite cache.
// Fixed, explicitly configured loopback ports prevent attachment to a running owner service.
export const test = base.extend<OperationsFixture>({
  operations: async ({ request }, use) => {
    const port = Number(process.env.WORKSHOP_OPERATIONS_TEST_PORT ?? "1463");
    const apiPort = Number(process.env.WORKSHOP_OPERATIONS_TEST_API_PORT ?? "1464");
    const origin = `http://localhost:${port}`, engine = await startIsolatedPostgres();
    // Production build fixtures can leave NODE_ENV in the reused Playwright worker.
    // Keep this explicit development server and its later transforms in development.
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    let database: Client | undefined, app: ReturnType<typeof createApp> | undefined;
    let vite: Awaited<ReturnType<typeof createServer>> | undefined;
    try {
      database = await engine.database(); await migrate(database);
      const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
      const connect = () => engine.connect(name);
      app = createApp({ stockConnect: connect, articleConnect: connect, unitConnect: connect,
        documentTypeConnect: connect, mechanicsConnect: connect, postoConnect: connect, terminalConnect: connect,
        repairOrderConnect: connect, repairMaterialsConnect: connect, repairLaborConnect: connect,
        customerConnect: connect, vehicleConnect: connect, descriptiveStateConnect: connect,
        development: developmentSessions(origin) });
      await app.listen({ host: "127.0.0.1", port: apiPort });
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), mode: "development", cacheDir: resolve(engine.directory, "vite-operations"),
        server: { host: "localhost", port, strictPort: true, proxy: { "/api": { target: `http://127.0.0.1:${apiPort}` } } } });
      await vite.listen();
      const session = await request.post(`${origin}/api/development/session`, { headers: { Origin: origin, "X-Isolated-Development": "1" } });
      expect(session.ok()).toBe(true);
      const { token } = await session.json() as { token: string };
      const post = async (resource: string, action: string, data: unknown): Promise<unknown> => {
        const response = await request.post(`${origin}/api/${resource}/${action}`, { headers: { Authorization: `Bearer ${token}` }, data });
        expect(response.ok()).toBe(true); return response.json();
      };
      await use({ origin, database, post });
    } finally {
      try {
        try { await vite?.close(); } finally { try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } } }
      } finally {
        if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = previousNodeEnv;
      }
    }
  },
});
export { expect };
