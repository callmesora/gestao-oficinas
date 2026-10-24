import { resolve } from "node:path";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../test-support/postgres";
import { migrate } from "./db/migrate";
import { importLegacy, SqliteLegacySource } from "./db/legacy-import";
import { developmentSessions } from "./development-sessions";
import { createApp } from "./app";

// Explicit opt-in, isolated destination only. Never accepts a database URL (ADR-009).
const engine = await startIsolatedPostgres();
const database = await engine.database();
let app: ReturnType<typeof createApp> | undefined;
let vite: Awaited<ReturnType<typeof createServer>> | undefined;
try {
  await migrate(database);
  if (process.argv[2]) {
    const source = new SqliteLegacySource(resolve(process.argv[2]));
    try { await importLegacy(database, source); } finally { source.close(); }
  }
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  app = createApp({ customerConnect: () => engine.connect(name), development: developmentSessions("http://localhost:1431") });
  await app.listen({ host: "127.0.0.1", port: 0 });
  const address = app.server.address();
  if (!address || typeof address === "string") throw new Error("Development API address unavailable");
  vite = await createServer({ server: { host: "localhost", port: 1431, strictPort: true,
    proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } });
  await vite.listen();
  console.log("Isolated PostgreSQL workflow: http://localhost:1431/?workflow=customers");
} catch (error) {
  await vite?.close(); await app?.close(); await database.end(); await engine.stop();
  throw error;
}
let stopping = false;
async function stop() {
  if (stopping) return; stopping = true;
  await vite?.close(); await app?.close(); await database.end(); await engine.stop();
}
for (const signal of ["SIGINT", "SIGTERM"] as const) process.once(signal, () => { void stop(); });
