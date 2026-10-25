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
import type { RepairFormPrepareResult, RepairFormSaveResult } from "../../../../packages/domain/src/repair-order-form";
import scenario from "../../../../docs/golden/GS-REPAIR-FORM-001/scenario.json";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);

const columns = ["ordem_reparacaoID", "numero", "matricula", "km_viatura", "recepcao_util", "recepcao_datahora", "recepcao_cliente", "recepcao_terceiro",
  "recepacao_contatos", "recepcao_servico", "recepcao_obs", "recepcao_entrega_prevista", "recepcao_prioridade", "reparacao_mecanico", "reparacao_estado",
  "reparacao_estado_obs", "reparacao_servico", "reparacao_estado_data", "reparacao_estado_historico", "totaL_mao_obra", "total_pecas", "total_desconto",
  "total_reparacao", "faturado", "total_pago", "Estados_reparacaoID", "numero_fatura", "data_pagamento"];
const decimals = new Set(["ordem_reparacaoID", "numero", "km_viatura", "recepcao_cliente", "recepcao_terceiro", "totaL_mao_obra", "total_pecas", "total_desconto", "total_reparacao", "total_pago", "Estados_reparacaoID"]);
async function exportOrders(directory: string) {
  const rows = (await database.query(`SELECT ${columns.map(column => `"${column}"${decimals.has(column) ? "::text" : ""}`).join(",")} FROM app."ordem_reparacao" ORDER BY "numero"`)).rows;
  const csv = (value: string) => '"' + value.replaceAll('"', '""') + '"';
  const cell = (column: string, value: unknown): string => {
    if (value === null) return "N:";
    if (typeof value === "boolean") return `I:${value ? "1" : "0"}`;
    if (typeof value === "number") return `I:${value}`;
    if (typeof value === "string") return `${decimals.has(column) ? "D" : "T"}:${value}`;
    throw new Error("Unsupported synthetic golden export cell");
  };
  await mkdir(directory);
  await writeFile(resolve(directory, "ordem_reparacao.csv"), columns.map(csv).join(",") + "\n"
    + rows.map(row => columns.map(column => csv(cell(column, row[column]))).join(",")).join("\n") + "\n", { flag: "wx" });
}
async function compare(directory: string, phase: "before" | "after", count: number) {
  const result = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config",
    "docs/golden/GS-REPAIR-FORM-001/compare.json", "--legacy", `docs/golden/GS-REPAIR-FORM-001/${phase}`, "--target", directory]);
  expect(result.stderr).toBe(""); const report = JSON.parse(result.stdout);
  expect(report.equal).toBe(true); expect(report.tables.ordem_reparacao.target_rows).toBe(count);
}

it("GS-REPAIR-FORM-001 protected API create/edit matches all 28 independent source/ADR expected fields exactly", async () => {
  // Independently authored synthetic input and expected exports; no private legacy records or expected-result rewrites.
  for (const [table, rows] of Object.entries(scenario.tables)) for (const row of rows) {
    const keys = Object.keys(row);
    await database.query(`INSERT INTO app."${table}" (${keys.map(key => `"${key}"`).join(",")}) VALUES (${keys.map((_, index) => `$${index + 1}`).join(",")})`, Object.values(row));
  }
  const before = resolve(server.directory, "repair-form-before"); await exportOrders(before); await compare(before, "before", 1);
  const api = createApp({ repairOrderConnect: connect, authenticate: async () => ({ userId: "synthetic-repair-form-golden" }) });
  try {
    const initial = await api.inject({ method: "POST", url: "/api/repair-orders/form-initialise", payload: { target: { mode: "create" } } });
    expect(initial.statusCode).toBe(200); expect(initial.json()).toMatchObject({ kind: "loaded", nextNumero: "9007199254740993" });
    for (const [command, answers] of [[scenario.create, scenario.createAnswers], [scenario.update, scenario.updateAnswers]] as const) {
      const preparation = await api.inject({ method: "POST", url: "/api/repair-orders/prepare-save", payload: command });
      expect(preparation.statusCode).toBe(200);
      const result = preparation.json<RepairFormPrepareResult>();
      expect(result).toMatchObject({ kind: "needs-dates", customer: { Descricao: "Cliente atual" }, requests: [{ field: "delivery" }, { field: "payment" }] });
      if (result.kind !== "needs-dates") throw new Error("Synthetic golden repair form did not request source Date prompts");
      const saved = await api.inject({ method: "POST", url: "/api/repair-orders/save", payload: { prepared: result.prepared, dateAnswers: answers } });
      expect(saved.statusCode).toBe(200);
      const persisted = saved.json<RepairFormSaveResult>();
      expect(persisted.kind).toBe("saved");
      if (persisted.kind !== "saved") throw new Error("Synthetic golden repair form did not persist");
      expect(persisted.orders).toHaveLength(1);
      expect(persisted.orders[0].recepcao_cliente).toBe(command.values.recepcao_cliente);
    }
    const after = resolve(server.directory, "repair-form-after"); await exportOrders(after); await compare(after, "after", 2);
  } finally { await api.close(); }
});
