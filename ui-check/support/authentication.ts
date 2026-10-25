import { test as base, expect } from "@playwright/test";
import type { Client } from "pg";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../../apps/server/test-support/postgres";
import { createBusinessApp } from "../../apps/server/src/business-app";
import { readServiceConfiguration } from "../../apps/server/src/configuration";

type AuthenticationServer = { origin: string; database: Client; setupToken: string; restart: () => Promise<void> };
export const test = base.extend<{ authenticationDatabase: Client }, { authenticationServer: AuthenticationServer }>({
  authenticationServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Configured Chrome required");
    const engine = await startIsolatedPostgres();
    let database: Client | undefined, app: Awaited<ReturnType<typeof createBusinessApp>> | undefined, vite: Awaited<ReturnType<typeof createServer>> | undefined;
    try {
      database = await engine.database();
      const connection = new URL(`postgresql://127.0.0.1:${database.port}/${database.database}`); connection.username = database.user!; connection.password = database.password!;
      const origin = "http://127.0.0.1:1435", setupToken = "a".repeat(64), tokenFile = resolve(engine.directory, "synthetic-operator-token"); await writeFile(tokenFile, setupToken, { mode: 0o600 });
      const configuration = await readServiceConfiguration({ WORKSHOP_DATABASE_URL: connection.href, WORKSHOP_ALLOWED_ORIGINS: origin, WORKSHOP_SETUP_TOKEN_FILE: tokenFile });
      // The actual persistent factory runs immutable migrations and wires every protected resource.
      app = await createBusinessApp(configuration); await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address(); if (!address || typeof address === "string") throw new Error("Authentication API unavailable");
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), cacheDir: resolve(engine.directory, "vite-authentication"), define: { "import.meta.env.VITE_WORKSHOP_API_BASE": JSON.stringify("") }, server: { host: "127.0.0.1", port: 1435, strictPort: true, proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } }); await vite.listen();
      await use({ origin, database, setupToken, restart: async () => { await app!.close(); app = await createBusinessApp(configuration); await app.listen({ host: "127.0.0.1", port: address.port }); } });
    } finally { try { await vite?.close(); } finally { try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } } } }
  }, { scope: "worker", timeout: 90000 }],
  authenticationDatabase: [async ({ authenticationServer }, use) => {
    await authenticationServer.database.query('TRUNCATE auth.mechanic_credentials,auth.sessions,auth.credentials,app."sistema",app."utilizadores",app."Clientes" RESTART IDENTITY');
    await authenticationServer.database.query('UPDATE auth.enrollment SET consumed=false');
    await authenticationServer.database.query('TRUNCATE app."material_reparacao",app."tempos_reparacao",app."ordem_reparacao",app."Viaturas",app."mecanicos",app."estados_reparacao",app."artigos",app."unidades" RESTART IDENTITY');
    await authenticationServer.restart();
    await use(authenticationServer.database);
  }, { auto: true }],
});
export { expect };
