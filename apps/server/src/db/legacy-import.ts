import { createHash, randomUUID, type Hash } from "node:crypto";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import Decimal from "decimal.js";
import type { Client, QueryResult } from "pg";
import { z } from "zod";
import mapping from "./column-mapping.v1.json" with { type: "json" };
import { rollbackAfterFailure } from "./connection";

export const columnMapping = mapping;
type Column = typeof mapping.tables[number]["columns"][number];
export type Cell = string | Uint8Array | null;
type TaggedCell = null | { utf8: string } | { base64: string };
const manifestSchema = z.object({ tables: z.record(z.string(), z.object({
  rows: z.number().int().nonnegative(),
  columns: z.array(z.object({ name: z.string() })),
  sha256_typed_rows: z.string().regex(/^[a-f0-9]{64}$/),
})) });
export type ExportManifest = z.infer<typeof manifestSchema>;
export interface LegacySource {
  manifest: ExportManifest;
  fingerprint: string;
  rows(table: string): Iterable<{ sourceRow: string; values: Cell[] }>;
  assertUnchanged(): void;
}
export const quoteIdentifier = (name: string): string => '"' + name.replaceAll('"', '""') + '"';

export class SqliteLegacySource implements LegacySource {
  readonly manifest: ExportManifest;
  readonly fingerprint: string;
  private readonly database: DatabaseSync;
  constructor(private readonly file: string) {
    this.fingerprint = createHash("sha256").update(readFileSync(file)).digest("hex");
    this.database = new DatabaseSync(file, { readOnly: true });
    this.database.exec("BEGIN");
    try {
      const result = this.database.prepare("SELECT value FROM __export WHERE key = 'manifest'").get();
      this.manifest = manifestSchema.parse(JSON.parse(String(result?.value)));
      const tables = this.database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name <> '__export'").all();
      if (tables.map(row => row.name).sort().join("\0") !== Object.keys(this.manifest.tables).sort().join("\0")) {
        throw new Error("Export table inventory differs from manifest");
      }
      for (const [table, manifest] of Object.entries(this.manifest.tables)) {
        const columns = this.database.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`).all().map(column => column.name);
        if (columns.join("\0") !== manifest.columns.map(column => column.name).join("\0")) throw new Error("Export column inventory differs from manifest");
      }
    } catch (error) { this.database.close(); throw error; }
  }
  *rows(table: string): Iterable<{ sourceRow: string; values: Cell[] }> {
    const columns = this.manifest.tables[table].columns.map(column => column.name);
    const statement = this.database.prepare(`SELECT rowid AS __source_row, ${columns.map(quoteIdentifier).join(", ")} FROM ${quoteIdentifier(table)} ORDER BY rowid`);
    statement.setReadBigInts(true);
    for (const row of statement.iterate()) {
      const values = columns.map(column => {
        const value = row[column];
        if (value !== null && typeof value !== "string" && !(value instanceof Uint8Array)) {
          throw new Error("Export cell is not lossless text, binary or NULL");
        }
        return value;
      });
      yield { sourceRow: String(row.__source_row), values };
    }
  }
  assertUnchanged(): void {
    if (createHash("sha256").update(readFileSync(this.file)).digest("hex") !== this.fingerprint) throw new Error("Source export changed");
  }
  close(): void { this.database.close(); }
}

export function updateTypedHash(hash: Hash, cells: Cell[]): void {
  const header = Buffer.alloc(5); header.write("R"); header.writeUInt32BE(cells.length, 1); hash.update(header);
  for (const value of cells) {
    if (value === null) { hash.update("N"); continue; }
    const data = typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);
    const frame = Buffer.alloc(9); frame.write(typeof value === "string" ? "T" : "B"); frame.writeBigUInt64BE(BigInt(data.length), 1);
    hash.update(frame); hash.update(data);
  }
}
const tagged = (cells: Cell[]): TaggedCell[] => cells.map(value => value === null ? null : typeof value === "string" ? { utf8: Buffer.from(value, "utf8").toString("base64") } : { base64: Buffer.from(value).toString("base64") });
function untag(cells: TaggedCell[]): Cell[] {
  return cells.map(value => value === null ? null : "utf8" in value ? Buffer.from(value.utf8, "base64").toString("utf8") : Buffer.from(value.base64, "base64"));
}
class ConversionError extends Error {}
const ranges: Record<string, [bigint, bigint]> = {
  "9": [0n, 65535n], "36": [0n, 255n], "26": [0n, 4294967295n],
  "24": [-9223372036854775808n, 9223372036854775807n],
  "25": [-9223372036854775808n, 9223372036854775807n], "27": [0n, 18446744073709551615n],
};
export function convertCell(column: Column, value: Cell): string | Buffer | boolean | null {
  if (value === null) return null;
  if (column.conversion === "binary") {
    if (!(value instanceof Uint8Array)) throw new ConversionError("expected-binary");
    return Buffer.from(value);
  }
  if (typeof value !== "string") throw new ConversionError("expected-text");
  if (column.conversion === "text") {
    if (value.includes("\0")) throw new ConversionError("postgres-text-nul");
    return value;
  }
  if (column.conversion === "boolean") {
    if (value !== "0" && value !== "1") throw new ConversionError("invalid-boolean");
    return value === "1";
  }
  if (column.conversion === "integer") {
    if (!/^[+-]?\d+$/.test(value)) throw new ConversionError("invalid-integer");
    const number = BigInt(value), range = ranges[column.sourceCode];
    if (!range || number < range[0] || number > range[1]) throw new ConversionError("integer-out-of-range");
    return value;
  }
  if (column.conversion === "decimal") {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) throw new ConversionError("invalid-decimal");
    const number = new Decimal(value);
    if (!number.isFinite() || number.e > 131071 || number.decimalPlaces() > 16383) throw new ConversionError("decimal-out-of-range");
    return value;
  }
  throw new Error("Unknown column conversion");
}

async function insertRows(client: Client, table: string, columns: string[], rows: unknown[][]): Promise<void> {
  if (!rows.length) return;
  const values: unknown[] = [];
  const groups = rows.map(row => "(" + row.map(value => { values.push(value); return "$" + values.length; }).join(",") + ")");
  await client.query(`INSERT INTO ${table} (${columns.map(quoteIdentifier).join(",")}) VALUES ${groups.join(",")}`, values);
}
export interface TableResult { rows: number; imported: number; quarantined: number; nulls: number; binary: number; sourceHash: string; provenanceHash: string; mismatches: number }
export interface ImportResult { dryRun: boolean; sourceSha256: string; tables: Record<string, TableResult> }

export async function importLegacy(client: Client, source: LegacySource, options: { dryRun?: boolean; afterBatch?: () => void; checkActive?: () => void } = {}): Promise<ImportResult> {
  const report: ImportResult = { dryRun: options.dryRun ?? false, sourceSha256: source.fingerprint, tables: {} };
  const names = mapping.tables.map(table => table.name).sort();
  if (names.join("\0") !== Object.keys(source.manifest.tables).sort().join("\0")) throw new Error("Source table set differs from mapping");
  source.assertUnchanged();
  options.checkActive?.();
  await client.query("BEGIN");
  try {
    // A fresh target only. Locks also prevent simultaneous imports or application writes.
    await client.query("LOCK TABLE import_audit.runs IN ACCESS EXCLUSIVE MODE");
    await client.query(`LOCK TABLE ${names.map(name => `app.${quoteIdentifier(name)}`).join(",")} IN ACCESS EXCLUSIVE MODE`);
    if ((await client.query("SELECT 1 FROM import_audit.runs LIMIT 1")).rowCount) throw new Error("Target already imported");
    for (const name of names) {
      if ((await client.query(`SELECT 1 FROM app.${quoteIdentifier(name)} LIMIT 1`)).rowCount) throw new Error("Target is not empty");
    }
    const run = randomUUID();
    await client.query("INSERT INTO import_audit.runs (id, source_sha256, mapping_version) VALUES ($1,$2,$3)", [run, source.fingerprint, mapping.version]);
    for (const table of mapping.tables) {
      const manifest = source.manifest.tables[table.name];
      const sourceColumns = manifest.columns.map(column => column.name);
      if (new Set(sourceColumns).size !== table.columns.length || table.columns.some(column => !sourceColumns.includes(column.sourceName))) {
        throw new Error(`Column inventory differs: ${table.name}`);
      }
      const positions = table.columns.map(column => sourceColumns.indexOf(column.sourceName));
      const digest = createHash("sha256");
      const result: TableResult = { rows: 0, imported: 0, quarantined: 0, nulls: 0, binary: 0, sourceHash: "", provenanceHash: "", mismatches: 0 };
      report.tables[table.name] = result;
      let previousSourceRow: bigint | null = null;
      let targetBatch: unknown[][] = [], auditBatch: unknown[][] = [], quarantineBatch: unknown[][] = [];
      const flush = async () => {
        await insertRows(client, `app.${quoteIdentifier(table.name)}`, ["_import_id", "_source_row", ...table.columns.map(column => column.name)], targetBatch);
        await insertRows(client, "import_audit.rows", ["run_id", "table_name", "source_row", "original_values"], auditBatch);
        await insertRows(client, "import_audit.quarantine", ["run_id", "table_name", "source_row", "reason", "original_values"], quarantineBatch);
        targetBatch = []; auditBatch = []; quarantineBatch = [];
        options.afterBatch?.();
        options.checkActive?.();
      };
      for (const row of source.rows(table.name)) {
        // ADR002: SQLite rowid is signed64, including zero/negative identities.
        // Refuse invalid/duplicate/out-of-order provenance rather than merging or re-keying.
        if (typeof row.sourceRow !== "string" || !/^(?:0|[1-9][0-9]*|-[1-9][0-9]*)$/.test(row.sourceRow)) throw new Error("Invalid source row identity");
        const identity = BigInt(row.sourceRow);
        if (identity < -9223372036854775808n || identity > 9223372036854775807n) throw new Error("Source row identity out of range");
        if (previousSourceRow !== null && identity <= previousSourceRow) throw new Error("Source row identities are not strictly increasing");
        previousSourceRow = identity;
        if (row.values.length !== sourceColumns.length) throw new Error("Source row width differs");
        updateTypedHash(digest, row.values); result.rows++;
        result.nulls += row.values.filter(value => value === null).length;
        result.binary += row.values.filter(value => value instanceof Uint8Array).length;
        const original = JSON.stringify(tagged(row.values));
        try {
          const values = table.columns.map((column, index) => convertCell(column, row.values[positions[index]]));
          targetBatch.push([run, row.sourceRow, ...values]);
          auditBatch.push([run, table.name, row.sourceRow, original]); result.imported++;
        } catch (error) {
          if (!(error instanceof ConversionError)) throw error;
          quarantineBatch.push([run, table.name, row.sourceRow, error.message, original]); result.quarantined++;
        }
        if ((targetBatch.length + quarantineBatch.length) >= 250) await flush();
      }
      await flush();
      result.sourceHash = digest.digest("hex");
      if (result.rows !== manifest.rows || result.sourceHash !== manifest.sha256_typed_rows) throw new Error(`Source manifest mismatch: ${table.name}`);
      const reconciliation = await reconcileTable(client, table, sourceColumns, run);
      options.checkActive?.();
      result.provenanceHash = reconciliation.hash; result.mismatches = reconciliation.mismatches;
      if (result.sourceHash !== reconciliation.hash || result.mismatches || result.rows !== reconciliation.rows) throw new Error(`Target reconciliation failed: ${table.name}`);
    }
    source.assertUnchanged();
    await client.query("UPDATE import_audit.runs SET completed_at=clock_timestamp() WHERE id=$1", [run]);
    options.checkActive?.();
    await client.query(options.dryRun ? "ROLLBACK" : "COMMIT");
    return report;
  } catch (error) {
    await rollbackAfterFailure(client);
    throw error;
  }
}

async function reconcileTable(client: Client, table: typeof mapping.tables[number], sourceColumns: string[], run: string): Promise<{ hash: string; mismatches: number; rows: number }> {
  const digest = createHash("sha256"); let last: string | null = null, mismatches = 0, rows = 0;
  const columns = table.columns.map(column => `t.${quoteIdentifier(column.name)}`).join(",");
  for (;;) {
    const page: QueryResult<Record<string, unknown> & { source_row: string; original_values: TaggedCell[]; quarantined: boolean; _row_id: string | null }> = await client.query(`
      SELECT a.source_row, a.original_values, a.quarantined, t._row_id, ${columns}
      FROM (
        SELECT source_row, original_values, false AS quarantined FROM import_audit.rows WHERE run_id=$1 AND table_name=$2
        UNION ALL SELECT source_row, original_values, true AS quarantined FROM import_audit.quarantine WHERE run_id=$1 AND table_name=$2
      ) a LEFT JOIN app.${quoteIdentifier(table.name)} t ON t._import_id=$1 AND t._source_row=a.source_row
      WHERE ($3::bigint IS NULL OR a.source_row > $3::bigint) ORDER BY a.source_row LIMIT 1000`, [run, table.name, last]);
    if (!page.rowCount) break;
    for (const row of page.rows) {
      last = row.source_row; rows++;
      const original = untag(row.original_values as TaggedCell[]); updateTypedHash(digest, original);
      if (row.quarantined) { if (row._row_id !== null) mismatches++; continue; }
      if (row._row_id === null) { mismatches++; continue; }
      for (const column of table.columns) {
        const value = original[sourceColumns.indexOf(column.sourceName)];
        const actual: unknown = row[column.name];
        if (value === null) { if (actual !== null) mismatches++; }
        else if (column.conversion === "binary") { if (!(actual instanceof Uint8Array) || !Buffer.from(value).equals(Buffer.from(actual))) mismatches++; }
        else if (column.conversion === "decimal" || column.conversion === "integer") { if (actual === null || !new Decimal(String(value)).equals(String(actual))) mismatches++; }
        else if (column.conversion === "boolean") { if (actual !== (value === "1")) mismatches++; }
        else if (actual !== value) mismatches++;
      }
    }
  }
  const count = await client.query<{ count: string }>(`SELECT count(*) FROM app.${quoteIdentifier(table.name)} WHERE _import_id=$1`, [run]);
  const imported = await client.query<{ count: string }>("SELECT count(*) FROM import_audit.rows WHERE run_id=$1 AND table_name=$2", [run, table.name]);
  if (count.rows[0].count !== imported.rows[0].count) mismatches++;
  return { hash: digest.digest("hex"), mismatches, rows };
}

export async function reconcileLegacy(client: Client, source: LegacySource): Promise<void> {
  source.assertUnchanged();
  await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
  try {
    const runs = await client.query<{ id: string; source_sha256: string; mapping_version: number }>("SELECT id, source_sha256, mapping_version FROM import_audit.runs");
    if (runs.rowCount !== 1 || runs.rows[0].source_sha256 !== source.fingerprint || runs.rows[0].mapping_version !== mapping.version) throw new Error("Import identity mismatch");
    for (const table of mapping.tables) {
      const manifest = source.manifest.tables[table.name];
      const result = await reconcileTable(client, table, manifest.columns.map(column => column.name), runs.rows[0].id);
      if (result.mismatches || result.rows !== manifest.rows || result.hash !== manifest.sha256_typed_rows) throw new Error(`Target reconciliation failed: ${table.name}`);
    }
    await client.query("COMMIT");
  } catch (error) { await rollbackAfterFailure(client); throw error; }
}
