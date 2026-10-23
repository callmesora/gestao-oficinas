import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import Decimal from "decimal.js";
import type { Client } from "pg";
import { columnMapping, quoteIdentifier, type Cell, type LegacySource } from "./legacy-import";

const csvRow = (cells: string[]) => cells.map(value => '"' + value.replaceAll('"', '""') + '"').join(",") + "\n";
function canonical(value: unknown, conversion: string, source: boolean): string {
  if (value === null) return "N:";
  if (conversion === "binary") {
    if (!(value instanceof Uint8Array)) throw new Error("Expected binary CSV cell");
    return "B:" + Buffer.from(value).toString("base64");
  }
  if (conversion === "integer" || conversion === "decimal") return "D:" + new Decimal(String(value)).toFixed();
  if (conversion === "boolean") return "I:" + (source ? String(value) : value === true ? "1" : "0");
  if (typeof value !== "string") throw new Error("Expected text CSV cell");
  return "T:" + value;
}

// CSV cannot distinguish NULL/empty/binary itself. Explicit tags preserve those types;
// numeric canonicalization changes notation only, with no rounding or trimming.
export async function exportComparison(client: Client, source: LegacySource, root: string): Promise<{ legacy: string; target: string; config: string }> {
  const legacy = resolve(root, "legacy-csv"), target = resolve(root, "target-csv");
  await mkdir(legacy); await mkdir(target);
  const tables: Record<string, { key: string[]; columns: Record<string, { trim: false }> }> = {};
  for (const table of columnMapping.tables) {
    const names = table.columns.map(column => column.name);
    const header = ["__source_row", ...names];
    const positions = table.columns.map(column => source.manifest.tables[table.name].columns.findIndex(item => item.name === column.sourceName));
    let before = csvRow(header), after = csvRow(header);
    for (const row of source.rows(table.name)) {
      before += csvRow([row.sourceRow, ...table.columns.map((column, index) => canonical(row.values[positions[index]] as Cell, column.conversion, true))]);
    }
    const rows = await client.query(`SELECT _source_row,${names.map(quoteIdentifier).join(",")} FROM app.${quoteIdentifier(table.name)} ORDER BY _source_row`);
    for (const row of rows.rows) after += csvRow([String(row._source_row), ...table.columns.map(column => canonical(row[column.name], column.conversion, false))]);
    await writeFile(resolve(legacy, `${table.name}.csv`), before, { flag: "wx" });
    await writeFile(resolve(target, `${table.name}.csv`), after, { flag: "wx" });
    tables[table.name] = { key: ["__source_row"], columns: Object.fromEntries(header.map(name => [name, { trim: false as const }])) };
  }
  const config = resolve(root, "compare.json");
  await writeFile(config, JSON.stringify({ cellEncoding: "N: NULL; T: exact text; B: base64 bytes; D: exact decimal notation; I: 0/1 boolean",
    normalizations: "Numeric notation only, decimal.js toFixed without rounding. No trim/case/accent/date normalization.", tables }, null, 2), { flag: "wx" });
  return { legacy, target, config };
}
