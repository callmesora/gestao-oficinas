import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { legacyFixture } from "../../test-support/legacy-fixture";
import { columnMapping, importLegacy, reconcileLegacy } from "./legacy-import";
import { migrate } from "./migrate";
import { exportComparison } from "./csv-exports";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

describe("MIG-4 real PostgreSQL schema/import", () => {
  let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>;
  let client: Client;
  beforeAll(async () => { engine = await startIsolatedPostgres(); }, 60000);
  afterAll(async () => { await engine?.stop(); }, 60000);
  beforeEach(async () => { client = await engine.database(); await migrate(client); }, 30000);
  afterEach(async () => { await client?.end(); });

  it("creates every mapped field and refuses migration checksum drift", async () => {
    const columns = await client.query<{ table_name: string; column_name: string; type: string; nullable: boolean }>(`SELECT c.relname AS table_name,a.attname AS column_name,format_type(a.atttypid,a.atttypmod) AS type,NOT a.attnotnull AS nullable
      FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='app' AND a.attnum>0 AND NOT a.attisdropped`);
    expect(columnMapping.tables).toHaveLength(17);
    expect(columnMapping.tables.reduce((sum, table) => sum + table.columns.length, 0)).toBe(135);
    for (const table of columnMapping.tables) for (const column of table.columns) {
      expect(columns.rows.find(row => row.table_name === table.name && row.column_name === column.name)).toEqual({ table_name: table.name, column_name: column.name, type: column.postgresType, nullable: column.nullable });
    }
    await migrate(client);
    await client.query("UPDATE public.schema_migrations SET sha256='changed'");
    await expect(migrate(client)).rejects.toThrow("checksum changed");
  });

  it("dry run rolls back, real import preserves exact boundaries and duplicate IDs, retry refuses overwrite", async () => {
    const source = legacyFixture();
    const dry = await importLegacy(client, source, { dryRun: true });
    expect(dry.tables.Clientes).toMatchObject({ rows: 1, imported: 1, quarantined: 0, mismatches: 0 });
    expect((await client.query("SELECT count(*) FROM app.\"Clientes\"")).rows[0].count).toBe("0");
    expect((await client.query("SELECT count(*) FROM import_audit.runs")).rows[0].count).toBe("0");
    await importLegacy(client, source);
    await reconcileLegacy(client, source);
    const customer = (await client.query('SELECT "ClientesID","Codigo","Descricao","Morada1","Morada2","observacao" FROM app."Clientes"')).rows[0];
    expect(customer).toEqual({ ClientesID: "9223372036854775807", Codigo: "18446744073709551615", Descricao: "  Oficina Açores  ", Morada1: "", Morada2: null, observacao: "linha 1\r\nlinha 2" });
    expect((await client.query('SELECT stock,preco,inativo FROM app.artigos')).rows[0]).toEqual({ stock: "-12.34567890123456789", preco: "0.10000000000000001", inativo: false });
    expect((await client.query('SELECT count(*),count(DISTINCT _row_id) AS identities FROM app.tempos_reparacao WHERE "tempos_reparacaoID"=7')).rows[0]).toEqual({ count: "2", identities: "2" });
    expect((await client.query('SELECT "Documento_codigodocumento_numero" AS binary,linha,quantidade FROM app.lin_stocks')).rows[0]).toEqual({ binary: Buffer.alloc(0), linha: "4294967295", quantidade: "0.0000120" });
    await expect(importLegacy(client, source)).rejects.toThrow("already imported");
    await client.query('UPDATE app."Clientes" SET "Descricao"=\'changed\'');
    await expect(reconcileLegacy(client, source)).rejects.toThrow("reconciliation failed");
  });

  it("interruption rolls back all rows and provenance, then a clean retry succeeds", async () => {
    const source = legacyFixture();
    let batches = 0;
    await expect(importLegacy(client, source, { afterBatch() { if (++batches === 4) throw new Error("simulated interruption"); } })).rejects.toThrow("simulated interruption");
    expect((await client.query('SELECT count(*) FROM app."Clientes"')).rows[0].count).toBe("0");
    expect((await client.query('SELECT count(*) FROM app."Viaturas"')).rows[0].count).toBe("0");
    expect((await client.query("SELECT count(*) FROM import_audit.rows")).rows[0].count).toBe("0");
    expect((await client.query("SELECT count(*) FROM import_audit.runs")).rows[0].count).toBe("0");
    await importLegacy(client, source); await reconcileLegacy(client, source);
  });

  it("quarantines an out-of-range value without rounding or losing its original", async () => {
    const result = await importLegacy(client, legacyFixture(true));
    expect(result.tables.Clientes).toMatchObject({ rows: 1, imported: 0, quarantined: 1, mismatches: 0 });
    expect((await client.query('SELECT count(*) FROM app."Clientes"')).rows[0].count).toBe("0");
    const item = (await client.query("SELECT reason,original_values FROM import_audit.quarantine")).rows[0];
    expect(item.reason).toBe("integer-out-of-range");
    expect(item.original_values[1]).toEqual({ utf8: Buffer.from("18446744073709551616").toString("base64") });
  });

  it("restores a complete stopped-cluster backup and reconciles persisted data", async () => {
    const source = legacyFixture(); await importLegacy(client, source);
    const name = String((await client.query("SELECT current_database() AS name")).rows[0].name);
    await client.end();
    await engine.backupAndRestore();
    client = await engine.connect(name);
    await reconcileLegacy(client, source);
    const exports = await exportComparison(client, source, engine.directory);
    const comparison = await promisify(execFile)(process.execPath, ["scripts/py.mjs", "scripts/compare_exports.py", "--config", exports.config, "--legacy", exports.legacy, "--target", exports.target, "--limit", "0"], { windowsHide: true });
    expect(JSON.parse(comparison.stdout).equal).toBe(true);
    expect((await client.query("SELECT count(*) FROM app.tempos_reparacao")).rows[0].count).toBe("2");
  }, 60000);

  it("retains actual embedded NUL text in quarantine without treating it as an empty value", async () => {
    const source = legacyFixture(false, true);
    const report = await importLegacy(client, source);
    expect(report.tables.Clientes).toMatchObject({ imported: 0, quarantined: 1 });
    const item = (await client.query("SELECT reason,original_values FROM import_audit.quarantine")).rows[0];
    expect(item.reason).toBe("postgres-text-nul");
    expect(item.original_values[8]).toEqual({ utf8: Buffer.from("a\0b").toString("base64") });
    await reconcileLegacy(client, source);
  });

  it("refuses a populated target even without a previous import record", async () => {
    await client.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (17,\'synthetic existing row\')');
    await expect(importLegacy(client, legacyFixture())).rejects.toThrow("Target is not empty");
    expect((await client.query('SELECT "Codigo" FROM app."Clientes"')).rows).toEqual([{ Codigo: "17" }]);
    expect((await client.query("SELECT count(*) FROM import_audit.runs")).rows[0].count).toBe("0");
  });

  it("serializes simultaneous imports and rejects the second instead of duplicating or overwriting", async () => {
    const name = String((await client.query("SELECT current_database() AS name")).rows[0].name);
    const other = await engine.connect(name);
    try {
      const results = await Promise.allSettled([importLegacy(client, legacyFixture()), importLegacy(other, legacyFixture())]);
      expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
      const rejected = results.find(result => result.status === "rejected");
      expect(rejected?.status === "rejected" && rejected.reason.message).toBe("Target already imported");
      await reconcileLegacy(client, legacyFixture());
    } finally { await other.end(); }
  });
});
