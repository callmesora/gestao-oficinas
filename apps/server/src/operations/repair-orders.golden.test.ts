import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import type { RepairOrderList, RepairOrderListResult } from "../../../../packages/domain/src/repair-orders";
import scenario from "../../../../docs/golden/GS-REPAIR-LIST-001/scenario.json";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);

const listColumns = ["position", "numero", "matricula", "Descricao_Cliente", "Descricao_Terceiro", "marcamodelo", "recepcao_datahora", "recepcao_entrega_prevista", "Descricao", "recepcao_prioridade", "Descricao_me", "Cor"];
const stateColumns = ["_import_id", "_source_row", "estados_reparacaoID", "Codigo", "Descricao", "tipo", "Cor", "lancar_defa", "lancar_material", "confirmacao", "pedir_data_entrega", "pedir_data_pag"];
const decimalIdentifierColumns = new Set(["numero", "_source_row", "estados_reparacaoID"]);
function taggedCell(key: string, value: unknown): string {
  if (value === null) return "N:";
  if (typeof value === "boolean") return `I:${value ? "1" : "0"}`;
  if (typeof value === "number") return `I:${value}`;
  if (typeof value !== "string") throw new Error("Golden export received an unsupported cell");
  return `${decimalIdentifierColumns.has(key) ? "D" : "T"}:${value}`;
}
async function exportRows(directory: string, name: string, columns: readonly string[], rows: readonly Record<string, unknown>[]) {
  const csv = (value: string) => '"' + value.replaceAll('"', '""') + '"';
  const contents = columns.map(csv).join(",") + "\n" + rows.map(row => columns.map(key => csv(taggedCell(key, row[key]))).join(",")).join("\n") + "\n";
  await writeFile(resolve(directory, `${name}.csv`), contents, { flag: "wx" });
}

it("GS-REPAIR-LIST-001 actual protected API joins/filter/default save match the independent source-derived exports", async () => {
  // This database and every fixture row are newly created here; no private legacy input is opened.
  await database.query('INSERT INTO import_audit.runs (id,source_sha256,mapping_version) VALUES ($1,$2,1)', [scenario.importId, "a".repeat(64)]);
  const tables = ["Clientes", "Viaturas", "estados_reparacao", "mecanicos", "sistema", "ordem_reparacao"] as const;
  for (const table of tables) {
    for (const row of scenario.tables[table]) {
      const columns = Object.keys(row);
      await database.query(`INSERT INTO app."${table}" (${columns.map(column => `"${column}"`).join(",")}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(",")})`, Object.values(row));
    }
  }
  const ordersBefore = (await database.query('SELECT to_jsonb(o)::text AS row FROM app."ordem_reparacao" o ORDER BY _row_id')).rows;
  const api = createApp({ repairOrderConnect: connect, authenticate: async () => ({ userId: "synthetic-repair-list-golden" }) });
  try {
    const initial = await api.inject({ method: "POST", url: "/api/repair-orders/initialise", payload: {} });
    expect(initial.statusCode).toBe(200);
    expect(initial.json()).toMatchObject({ kind: "loaded", settings: { Data_inicio: 2, Tempo_ordem_reparacao: "3" }, mechanics: [{ Codigo: 2, Descricao: "Mecânico público" }] });
    const list = async (input: RepairOrderList) => {
      const response = await api.inject({ method: "POST", url: "/api/repair-orders/list", payload: input });
      expect(response.statusCode).toBe(200);
      const result = response.json<RepairOrderListResult>();
      if (result.kind !== "loaded") throw new Error("Synthetic golden repair list did not load");
      return result.orders;
    };
    const full = await list(scenario.filter), filtered = await list({ ...scenario.filter, ...scenario.narrowFilter });
    expect(full).toHaveLength(8); expect(new Set(full.map(row => row.id)).size).toBe(8);
    expect(filtered).toHaveLength(2); expect(new Set(filtered.map(row => row.id)).size).toBe(2);
    const saved = await api.inject({ method: "POST", url: "/api/repair-orders/save-defaults", payload: scenario.saveDefaults });
    expect(saved.statusCode).toBe(200); expect(saved.json()).toEqual({ kind: "saved" });
    expect(await list(scenario.filter)).toEqual(full);
    expect((await database.query('SELECT to_jsonb(o)::text AS row FROM app."ordem_reparacao" o ORDER BY _row_id')).rows).toEqual(ordersBefore);
    const states = await database.query('SELECT _import_id::text,_source_row::text,"estados_reparacaoID"::text,"Codigo","Descricao","tipo","Cor"::double precision AS "Cor","lancar_defa","lancar_material","confirmacao","pedir_data_entrega","pedir_data_pag" FROM app."estados_reparacao" ORDER BY _source_row');
    const target = resolve(server.directory, "repair-list-golden"); await mkdir(target);
    await exportRows(target, "repair_list", listColumns, full.map((row, index) => ({ ...row, position: index + 1 })));
    await exportRows(target, "repair_filtered", listColumns, filtered.map((row, index) => ({ ...row, position: index + 1 })));
    await exportRows(target, "estados_reparacao", stateColumns, states.rows);
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-REPAIR-LIST-001/compare.json", "--legacy", "docs/golden/GS-REPAIR-LIST-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
    const report = JSON.parse(compared.stdout);
    expect(report.equal).toBe(true);
    expect(report.tables.repair_list.target_rows).toBe(8);
    expect(report.tables.repair_filtered.target_rows).toBe(2);
    expect(report.tables.estados_reparacao.target_rows).toBe(4);
  } finally { await api.close(); }
});
