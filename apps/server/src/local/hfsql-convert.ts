import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, mkdir, open, readdir, readFile } from "node:fs/promises";
import { basename, isAbsolute, join } from "node:path";
import { createInterface } from "node:readline";
import { DatabaseSync } from "node:sqlite";
import { Readable } from "node:stream";
import mapping from "../db/column-mapping.v1.json" with { type: "json" };

// Input is the official driver's typed JSONL, never the original HFSQL files.
const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
type Header = { table: string; count: number; columns: Array<{ name: string }> };
const fingerprint = async (file: string) => { const hash = createHash("sha256"); for await (const chunk of createReadStream(file)) hash.update(chunk); return hash.digest("hex"); };
const sorted = (values: string[]) => [...values].sort().join("\0");
async function* strictUtf8(file: string) {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  for await (const chunk of createReadStream(file)) yield decoder.decode(chunk as Uint8Array, { stream: true });
  yield decoder.decode();
}

export async function convertHfsqlExport(source: string, output: string, signal?: AbortSignal): Promise<void> {
  const active = () => { if (signal?.aborted) throw new Error("conversion interrupted"); };
  active();
  if (!isAbsolute(source) || !isAbsolute(output) || source === output) throw new Error("absolute separate directories required");
  if (!(await lstat(source)).isDirectory()) throw new Error("invalid export directory");
  const expected = new Map(mapping.tables.map(table => [table.name, table]));
  const entries = await readdir(source, { withFileTypes: true });
  if (entries.some(entry => !entry.isFile() || entry.isSymbolicLink() || !entry.name.endsWith(".jsonl"))) throw new Error("unexpected export file");
  if (sorted(entries.map(entry => entry.name.slice(0, -6))) !== sorted([...expected.keys()])) throw new Error("table inventory mismatch");
  const files = entries.map(entry => join(source, entry.name)).sort();
  const before = await Promise.all(files.map(fingerprint));
  await mkdir(output); // Fresh output only. Failures are preserved for inspection.
  const destination = join(output, "data.sqlite");
  const reserved = await open(destination, "wx", 0o600); await reserved.close();
  const database = new DatabaseSync(destination);
  const manifest: { tables: Record<string, { rows: number; columns: unknown[]; sha256_typed_rows: string }> } = { tables: {} };
  try {
    database.exec("BEGIN");
    for (const file of files) {
      const table = basename(file).slice(0, -6), definition = expected.get(table);
      if (!definition) throw new Error("unknown table");
      const lines = createInterface({ input: Readable.from(strictUtf8(file)), crlfDelay: Infinity });
      let count = 0, header: Header | undefined;
      let insert: ReturnType<DatabaseSync["prepare"]> | undefined;
      const hash = createHash("sha256");
      for await (const line of lines) {
        active();
        const value: unknown = JSON.parse(line);
        if (!header) {
          const candidate = value as Header;
          if (!candidate || candidate.table !== table || !Number.isSafeInteger(candidate.count) || candidate.count < 0 || !Array.isArray(candidate.columns)) throw new Error("invalid table header");
          const names = candidate.columns.map(column => column?.name);
          const mapped = definition.columns.map(column => column.sourceName || column.name);
          if (names.some(name => typeof name !== "string") || new Set(names).size !== names.length || sorted(names) !== sorted(mapped)) throw new Error("column inventory mismatch");
          header = candidate;
          database.exec(`CREATE TABLE ${quote(table)} (${names.map(quote).join(",")})`);
          insert = database.prepare(`INSERT INTO ${quote(table)} VALUES (${names.map(() => "?").join(",")})`);
          continue;
        }
        if (!Array.isArray(value) || value.length !== header.columns.length) throw new Error("row width mismatch");
        const cells = value.map((cell: unknown) => {
          if (cell === null || typeof cell === "string") return cell;
          if (!cell || typeof cell !== "object" || Object.keys(cell).join() !== "base64" || typeof (cell as {base64?: unknown}).base64 !== "string") throw new Error("invalid cell");
          const encoded = (cell as {base64: string}).base64, decoded = Buffer.from(encoded, "base64");
          if (decoded.toString("base64") !== encoded) throw new Error("invalid binary encoding");
          return decoded;
        });
        const frame = Buffer.alloc(5); frame.write("R"); frame.writeUInt32BE(cells.length, 1); hash.update(frame);
        for (const cell of cells) {
          if (cell === null) { hash.update("N"); continue; }
          const bytes = typeof cell === "string" ? Buffer.from(cell, "utf8") : cell;
          const prefix = Buffer.alloc(9); prefix.write(typeof cell === "string" ? "T" : "B"); prefix.writeBigUInt64BE(BigInt(bytes.length), 1); hash.update(prefix); hash.update(bytes);
        }
        insert!.run(...cells); count++;
      }
      if (!header || count !== header.count) throw new Error("table row count mismatch");
      manifest.tables[table] = { rows: count, columns: header.columns, sha256_typed_rows: hash.digest("hex") };
    }
    for (let i = 0; i < files.length; i++) if (await fingerprint(files[i]) !== before[i]) throw new Error("export changed during conversion");
    active();
    database.exec("CREATE TABLE __export (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    database.prepare("INSERT INTO __export VALUES (?, ?)").run("manifest", JSON.stringify(manifest));
    database.exec("COMMIT");
  } catch (error) { try { database.exec("ROLLBACK"); } catch { /* preserve the original failure */ } throw error; }
  finally { database.close(); }
  // Verify publication is readable; the subsequent PostgreSQL importer rechecks every row.
  await readFile(destination);
}
