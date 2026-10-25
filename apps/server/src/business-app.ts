import { Client } from "pg";
import { createApp } from "./app";
import { createSessionSecurity } from "./security/sessions";
import { migrate } from "./db/migrate";
import { initialiseStartup } from "./operations/startup";
import type { ServiceConfiguration } from "./configuration";
import type { ReportRenderer } from "./reports/renderer";
/** Operator starts the persistent service; desktop clients never create or reset databases. */
export async function createBusinessApp(configuration: ServiceConfiguration, reportRenderer?: ReportRenderer) {
  const connect = async () => { const client = new Client({ connectionString: configuration.databaseUrl, connectionTimeoutMillis: 5000 }); try { await client.connect(); return client; } catch { try { await client.end(); } catch { /* No credentials in diagnostics. */ } throw new Error("Workshop database unavailable"); } };
  const migration = await connect();
  try { await migrate(migration); } finally { await migration.end(); }
  const initialized = await initialiseStartup(connect, {});
  if (initialized.kind !== "ready") throw new Error("Workshop system defaults unavailable");
  return createApp({ security: createSessionSecurity(connect, { setupToken: configuration.setupToken }), origins: configuration.origins, reportCompany: configuration.reportCompany,
    customerConnect: connect, vehicleConnect: connect, unitConnect: connect, descriptiveStateConnect: connect, terminalConnect: connect, postoConnect: connect, mechanicsConnect: connect, repairStateConnect: connect, documentTypeConnect: connect, articleConnect: connect, userConnect: connect, repairOrderConnect: connect, repairMaterialsConnect: connect, repairLaborConnect: connect, startupConnect: connect, stockConnect: connect, reportFilterConnect: connect, reportConnect: connect, reportRenderer });
}
