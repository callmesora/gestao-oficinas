import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { importLegacy, reconcileLegacy, SqliteLegacySource } from "./legacy-import";
import { migrate } from "./migrate";
import { exportComparison } from "./csv-exports";

// Opt-in only. The destination is always a freshly generated local test database.
await writeFile("docs/data/postgres-reconciliation.json", JSON.stringify({ passed: false, checkedAt: new Date().toISOString(), status: "started-not-completed" }, null, 2) + "\n");
if (!process.argv[2]) throw new Error("Supply the path to the copied official-driver SQLite export");
const source = new SqliteLegacySource(resolve(process.argv[2]));
let engine: Awaited<ReturnType<typeof startIsolatedPostgres>> | undefined;
let phase = "start isolated engine";
try {
  engine = await startIsolatedPostgres();
  phase = "create fresh database";
  let client = await engine.database();
  try {
    phase = "apply schema";
    await migrate(client);
    phase = "import and reconcile";
    const report = await importLegacy(client, source, { dryRun: true });
    const remaining = await client.query<{ count: string }>("SELECT count(*) FROM import_audit.runs");
    if (remaining.rows[0].count !== "0") throw new Error("Dry run did not roll back");
    console.log("Dry run reconciled and rolled back; rehearsing committed import and restore.");
    phase = "committed scratch import";
    await importLegacy(client, source); await reconcileLegacy(client, source);
    const database = String((await client.query("SELECT current_database() AS name")).rows[0].name);
    const version = String((await client.query("SELECT version() AS version")).rows[0].version);
    phase = "cold backup and restore";
    await client.end(); await engine.backupAndRestore(); client = await engine.connect(database);
    phase = "reconcile restored database";
    await reconcileLegacy(client, source);
    phase = "CSV comparator";
    const exports = await exportComparison(client, source, engine.directory);
    await promisify(execFile)(process.execPath, ["scripts/py.mjs", "scripts/compare_exports.py", "--config", exports.config,
      "--legacy", exports.legacy, "--target", exports.target, "--limit", "0", "--report", "docs/data/postgres-csv-comparison.json"], { windowsHide: true });
    await writeFile("docs/data/postgres-reconciliation.json", JSON.stringify({ passed: true, checkedAt: new Date().toISOString(), engine: version, ...report,
      checks: { dryRunRolledBack: true, committedImportReconciled: true, stoppedClusterBackupRestored: true, restoredDataReconciled: true, csvComparatorPassed: true } }, null, 2) + "\n");
    console.log(JSON.stringify({ tables: Object.keys(report.tables).length,
      rows: Object.values(report.tables).reduce((sum, table) => sum + table.rows, 0),
      quarantined: Object.values(report.tables).reduce((sum, table) => sum + table.quarantined, 0),
      mismatches: Object.values(report.tables).reduce((sum, table) => sum + table.mismatches, 0), dryRunRolledBack: true, backupRestored: true }));
  } finally { await client.end(); }
} catch (error) {
  // PostgreSQL/validation error objects can contain source values. Do not print them.
  const details = error as { code?: unknown; table?: unknown; column?: unknown; constraint?: unknown };
  const identifiers = Object.fromEntries(Object.entries(details).filter(([key, value]) => ["code", "table", "column", "constraint"].includes(key) && typeof value === "string" && /^[A-Za-z0-9_]+$/.test(value)));
  console.error(JSON.stringify({ error: "Database dry run failed", phase, ...identifiers }));
  process.exitCode = 1;
} finally { source.close(); await engine?.stop(); }
