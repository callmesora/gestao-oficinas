import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import type { Client } from "pg";
import { rollbackAfterFailure } from "./connection";

export async function migrate(client: Client): Promise<void> {
  const directory = new URL("../../migrations/", import.meta.url);
  const files = (await readdir(directory)).filter(name => /^\d{4}_[a-z_]+\.sql$/.test(name)).sort();
  await client.query("BEGIN");
  try {
    await client.query("SELECT pg_advisory_xact_lock(724129830)");
    await client.query(`CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )`);
    const applied = await client.query<{ name: string; sha256: string }>("SELECT name, sha256 FROM public.schema_migrations");
    if (applied.rows.some(row => !files.includes(row.name))) throw new Error("Unknown applied migration");
    for (const name of files) {
      const sql = await readFile(new URL(name, directory), "utf8");
      const hash = createHash("sha256").update(sql).digest("hex");
      const previous = applied.rows.find(row => row.name === name);
      if (previous && previous.sha256 !== hash) throw new Error("Committed migration checksum changed");
      if (!previous) {
        await client.query(sql);
        await client.query("INSERT INTO public.schema_migrations (name, sha256) VALUES ($1, $2)", [name, hash]);
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await rollbackAfterFailure(client);
    throw error;
  }
}
