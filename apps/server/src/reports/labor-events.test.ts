import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { renderReport } from "../operations/reports";
import { createReportRenderer } from "./renderer";
import type { FamilyReportRequest, ReportRenderResult } from "../../../../packages/domain/src/reports";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const renderer = createReportRenderer(), context = { company: "SOMA HORAS AÇÃO", dateText: "25/10/2026" };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60_000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60_000);
beforeEach(async () => {
  await database.query('TRUNCATE app."Viaturas",app."mecanicos",app."ordem_reparacao",app."tempos_reparacao" RESTART IDENTITY');
  await database.query(`INSERT INTO app."Viaturas" ("matricula","marca","modelo") VALUES ('AA','MARCA','MODELO'),('BB','MARCA','MODELO'),('CC','MARCA','MODELO');
    INSERT INTO app."mecanicos" ("Codigo","Descricao") VALUES (7,'MECÂNICO SETE'),(8,'MECÂNICO OITO'),(9,'MECÂNICO NOVE');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_datahora") VALUES (10,'AA','20261025080000000'),(11,'AA','20261025090000000'),(12,'BB','20261025100000000'),(13,'CC','20261025110000000');
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") SELECT 10,7,'20261025120000000','20261025113000000' FROM generate_series(1,6);
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES (11,7,'20261025120000000','20261025120100000');
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") SELECT 12,8,'20261025120000000','20261025113000000' FROM generate_series(1,5);
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES (13,9,'20261025000000000','20261029040000000'),(13,9,'20261025120000000','00000000000000000')`);
});
function controls(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`data-control="${name}"[^>]*>([^<]*)</div>`, "g"))].map(match => match[1]);
}
function rendered(result: ReportRenderResult) {
  expect(result.kind).toBe("rendered");
  if (result.kind !== "rendered") throw new Error(`Report ${result.kind}`);
  return result;
}
function pdfPages(base64: string): string[] {
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;print(json.dumps([p.extract_text() for p in PdfReader(io.BytesIO(sys.stdin.buffer.read())).pages]))"], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}
const variants = [
  { reportId: "RPT_Tempos_Ordem_Reparacao", range: { ParamDaOrdem: "10", ParamAOrdem: "13" }, inner: ["00:-3", "00:01", "00:-10", "100:00"], outer: [] },
  { reportId: "RPT_Tempos_Ordem_Reparacao_Mecanico", range: { ParamDoMecanico: "7", ParamAoMecanico: "9" }, inner: ["00:-3", "00:01", "00:-10", "100:00"], outer: ["00:-2", "00:-1", "100:00"] },
  // Summary assigns the body accumulator directly; it has no inner-footer soma_horas call.
  { reportId: "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo", range: { ParamDoMecanico: "7", ParamAoMecanico: "9" }, inner: [], outer: ["00:-2", "00:-10", "100:00"] },
  { reportId: "RPT_Tempos_Ordem_Reparacao_viatura", range: { ParamDaViatura: "AA", ParamAViatura: "CC" }, inner: ["00:-3", "00:01", "00:-10", "100:00"], outer: ["00:-2", "00:-1", "100:00"] },
] as const;
for (const variant of variants) it(`${variant.reportId} preserves literal two-character minute parsing, footer event depth and fresh repeated-preview totals`, async () => {
  const source: FamilyReportRequest["source"] = { kind: "query", parameters: { ...variant.range, ParamDaData: "20261025000000", ParamAData: "20261025235959" } };
  const original = (await database.query('SELECT "numero"::text,"inicio","fim" FROM app."tempos_reparacao" ORDER BY _row_id')).rows;
  for (let preview = 0; preview < 2; preview++) {
    const result = rendered(await renderReport(connect, renderer, { reportId: variant.reportId, context, source })), pages = pdfPages(result.pdfBase64);
    expect(controls(result.html, variant.reportId.endsWith("viatura") ? "ITEM_Tempo" : "ITEM_tempo")).toEqual([...Array(6).fill("00:-29"), "00:01", ...Array(5).fill("00:-29"), "100:00", "00:00"]);
    expect(controls(result.html, "STC_total_horas")).toEqual(variant.inner);
    expect(controls(result.html, "STC_total_horas1")).toEqual(variant.outer);
    for (const value of [...variant.inner, ...variant.outer]) expect(pages.join("\n")).toContain(value);
    expect(pages.join("\n")).toContain("00:-29"); expect(pages.join("\n")).toContain("100:00");
    expect(pages).toHaveLength(result.pageCount);
    expect(result.unresolved).toContain(variant.reportId.includes("Resumo") ? "U-R26-03" : variant.reportId.endsWith("viatura") ? "U-R27-03" : variant.reportId.endsWith("Mecanico") ? "U-R25-03" : "U-R24-03");
    if (preview === 0) { await writeFile(`analysis-local/report-minute-${variant.reportId}.html`, result.html); await writeFile(`analysis-local/report-minute-${variant.reportId}.pdf`, Buffer.from(result.pdfBase64, "base64")); }
  }
  expect((await database.query('SELECT "numero"::text,"inicio","fim" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual(original);
}, 60_000);

for (const finish of [null, "opaque"]) it(`source NULL/unsupported end ${String(finish)} stays unresolved rather than entering the string sum as zero`, async () => {
  await database.query('UPDATE app."tempos_reparacao" SET "fim"=$1 WHERE "numero"=10', [finish]);
  expect(await renderReport(connect, renderer, { reportId: "RPT_Tempos_Ordem_Reparacao", context, source: { kind: "query", parameters: { ParamDaOrdem: "10", ParamAOrdem: "10", ParamDaData: "20261025000000", ParamAData: "20261025235959" } } })).toEqual({ kind: "unresolved", unresolved: ["U-report: NULL/opaque labor datetime"] });
  expect((await database.query('SELECT DISTINCT "fim" FROM app."tempos_reparacao" WHERE "numero"=10')).rows).toEqual([{ fim: finish }]);
});
