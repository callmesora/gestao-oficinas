import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { renderReport } from "../operations/reports";
import { createReportRenderer } from "./renderer";
import { reportLayouts } from "./fixed-layout";
import type { DatabaseConnection } from "../db/connection";
import { familyReportIds, type ReportId, type ReportRequest, type ReportRenderResult } from "../../../../packages/domain/src/reports";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection, databaseName: string;
const context = { company: "EMPRESA EDGE", dateText: "25/10/2026" }, renderer = createReportRenderer();
const tables = ['Clientes', 'Viaturas', 'mecanicos', 'utilizadores', 'unidades', 'estados_descritivos', 'estados_reparacao', 'artigos', 'documentos', 'cab_stocks', 'lin_stocks', 'ordem_reparacao', 'material_reparacao', 'tempos_reparacao'];
beforeAll(async () => {
  engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database);
  databaseName = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => engine.connect(databaseName);
}, 60_000);
afterAll(async () => { await database?.end(); await engine?.stop(); }, 60_000);
beforeEach(async () => { await database.query(`TRUNCATE ${tables.map(table => `app."${table}"`).join(",")} RESTART IDENTITY`); });
function controls(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`data-control="${name}"[^>]*>([^<]*)</div>`, "g"))].map(match => match[1]);
}
function request(reportId: ReportId): ReportRequest {
  if (reportId === "RPT_Ordens_Reparacao") return { reportId, context, source: { kind: "window-table", window: "WIN_Ordens_Reparacao", table: "TABLE_QRY_select_ordens_reparacao", rows: [], filter: { entryStart: "", entryEnd: "", deliveryStart: "", deliveryEnd: "", priority: 0, mechanic: 0, customer: "", registration: "", states: [], sort: "numero", descending: true } } };
  if (reportId === "RPT_Extrato_artigos") return { reportId, context, source: { kind: "query", articleFrom: "", articleTo: "ZZ", from: "20261025000000", to: "20261025235959", openingCutoff: "20261025000000" } };
  const source: ReportRequest["source"] = reportId.startsWith("RPT_List_") ? { kind: "embedded-query" }
    : reportId === "RPT_inventario" ? { kind: "file" }
    : reportId === "RPT_Servico_Avaria" ? { kind: "programmatic", orderNumber: "10" }
    : reportId === "RPT_Materiais" ? { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", rows: [], orderNumber: "10", formattedTotal: "CALLER TOTAL" }
    : { kind: "query", parameters: reportId.startsWith("RPT_Consumo_") ? { ParamDaData: "20261025000000", ParamAData: "20261025235959", ParamDoArtigo: "", ParamAoArtigo: "ZZ", ...(reportId.includes("Viatura") ? { ParamDaViatura: "", ParamAViatura: "ZZ" } : { ParamDescricao: null }) }
      : reportId.startsWith("RPT_Ordens_") ? { ParamDaData: "20261025", ParamAData: "20261025", ParamEstados: null }
      : { ParamDaData: "20261025000000", ParamAData: "20261025235959", ...(reportId.endsWith("viatura") ? { ParamDaViatura: "", ParamAViatura: "ZZ" } : reportId === "RPT_Tempos_Ordem_Reparacao" ? { ParamDaOrdem: "0", ParamAOrdem: "18446744073709551615" } : { ParamDoMecanico: "0", ParamAoMecanico: "18446744073709551615" }) } };
  return { reportId, context, source } as ReportRequest;
}
function rendered(result: ReportRenderResult) {
  expect(result.kind).toBe("rendered"); if (result.kind !== "rendered") throw new Error(`Report ${result.kind}`); return result;
}
function pdf(base64: string): { text: string; width: number; height: number }[] {
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;print(json.dumps([{'text':p.extract_text(),'width':float(p.mediabox.width)*25.4/72,'height':float(p.mediabox.height)*25.4/72} for p in PdfReader(io.BytesIO(sys.stdin.buffer.read())).pages]))"], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}
function footerText(reportId: ReportId): string | undefined {
  return reportLayouts[reportId].bands.flatMap(band => band.controls).find(control => control.visible && control.name.startsWith("PoweredWx"))?.literal;
}

it("all28 report runtime defaults render a real empty PDF with literal A4/A5/Letter paper, source header/footer and freshly reset counter0", async () => {
  for (const reportId of ["RPT_Ordens_Reparacao", "RPT_Extrato_artigos", ...familyReportIds] as const) {
    const result = rendered(await renderReport(connect, renderer, request(reportId))), pages = pdf(result.pdfBase64);
    expect(pages, reportId).toHaveLength(result.pageCount); expect(pages, reportId).toHaveLength(1);
    const [width, height] = reportId.startsWith("RPT_List_") ? [210, 297] : ["RPT_Materiais", "RPT_Servico_Avaria"].includes(reportId) ? [148, 210] : [215.9, 279.4];
    expect(pages[0].width, reportId).toBeCloseTo(width, 0); expect(pages[0].height, reportId).toBeCloseTo(height, 0);
    expect(pages[0].text, reportId).toContain("EMPRESA EDGE");
    const footer = footerText(reportId);
    if (footer) expect(pages[0].text, reportId).toContain(footer);
    // These two source footer captions have no recovered literal; keep them blank.
    else { expect(["RPT_Consumo_Material_Descriminado_ordens_saidas", "RPT_Servico_Avaria"]).toContain(reportId); expect(controls(result.html, "PoweredWx1")).toEqual([""]); }
    // Service's source PAGE_FOOTER is empty; do not add another report's counter.
    if (reportId !== "RPT_Servico_Avaria") expect(pages[0].text, reportId).toContain("1/1");
    expect(result.html, reportId).not.toContain("undefined"); expect(result.html, reportId).not.toContain(">null<");
    if (reportId !== "RPT_Servico_Avaria") {
      const counter = reportId === "RPT_Ordens_Reparacao" || reportId.startsWith("RPT_Ordens_Reparacao_Data") || reportId.startsWith("RPT_Consumo_Material_Descriminado_") ? "COUNTER1" : "COUNTER";
      expect(controls(result.html, counter), reportId).toEqual(["0"]);
      // pypdf can concatenate separately positioned footer cells into one run
      // ("Golfinho Software, Lda0"). Retain a numeric boundary, not a space-only one.
      expect(pages[0].text, reportId).toMatch(/(?:^|\D)0(?!\d)/);
      expect(result.html, reportId).not.toContain('data-band="BODY"');
    } else expect(controls(result.html, "ITEM_Servico_Avaria")).toEqual([""]);
    expect(result.unresolved.some(item => /U-R\d+-02/.test(item)), reportId).toBe(true);
  }
}, 180_000);

it("service Open lookups share a read-only repeatable snapshot and release it before actual Chromium pagination", async () => {
  await database.query(`INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (2,'CUSTOMER BEFORE');
    INSERT INTO app."Viaturas" ("matricula","marca","modelo") VALUES ('AA','VEHICLE BEFORE','MODEL');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","recepcao_servico") VALUES (10,'AA',2,'SERVICE BEFORE')`);
  const locker = await engine.connect(databaseName); await locker.query('BEGIN; LOCK TABLE app."Viaturas" IN ACCESS EXCLUSIVE MODE');
  let reportPid: number | undefined;
  const isolatedConnect = async () => { const client = await connect(); reportPid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
  let checkedReleased = false;
  const running = renderReport(isolatedConnect, async document => {
    expect((await database.query("SELECT 1 FROM pg_stat_activity WHERE pid=$1", [reportPid])).rowCount).toBe(0);
    checkedReleased = true; return renderer(document);
  }, request("RPT_Servico_Avaria"));
  try {
    // Lock the second source lookup after the first SELECT has fixed its snapshot.
    await expect.poll(async () => (await database.query("SELECT query FROM pg_stat_activity WHERE pid=$1 AND wait_event_type='Lock'", [reportPid])).rows[0]?.query, { timeout: 10_000 }).toContain('FROM app."Viaturas"');
    await locker.query('UPDATE app."Viaturas" SET "marca"=\'VEHICLE AFTER\'; UPDATE app."Clientes" SET "Descricao"=\'CUSTOMER AFTER\'; COMMIT');
    const result = rendered(await running), text = pdf(result.pdfBase64).map(page => page.text).join("\n");
    expect(checkedReleased).toBe(true); expect(text).toContain("CUSTOMER BEFORE"); expect(text).toContain("VEHICLE BEFORE"); expect(text).not.toContain("AFTER");
    const next = rendered(await renderReport(connect, renderer, request("RPT_Servico_Avaria"))), fresh = pdf(next.pdfBase64).map(page => page.text).join("\n");
    expect(fresh).toContain("CUSTOMER AFTER"); expect(fresh).toContain("VEHICLE AFTER");
    await writeFile("analysis-local/report-snapshot-service.pdf", Buffer.from(result.pdfBase64, "base64"));
  } finally { await locker.query("ROLLBACK").catch(() => undefined); await locker.end(); await running; }
}, 60_000);

it("report parameter errors are typed invalid before connection; explicit NULL, empty text and state[] cannot reuse earlier filters", async () => {
  let connections = 0;
  const observedConnect = async () => { connections++; return connect(); };
  const base = request("RPT_Tempos_Ordem_Reparacao_Mecanico");
  if (base.source.kind !== "query" || !("parameters" in base.source)) throw new Error("Fixture source");
  for (const parameters of [{ ...base.source.parameters, ParamDoMecanico: "0.5" }, { ...base.source.parameters, ParamAoMecanico: "1e4" }, { ...base.source.parameters, ParamAoMecanico: undefined }, { ...base.source.parameters, Arbitrary: null }]) expect(await renderReport(observedConnect, renderer, { ...base, source: { kind: "query", parameters } })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0);
  await database.query(`INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'CLIENT'); INSERT INTO app."Viaturas" ("matricula","Cliente") VALUES ('AA',1);
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao") VALUES ('R','STATE');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_estado","recepcao_entrega_prevista","total_pago") VALUES (10,'AA','R','20261025',0.1),(11,'AA','R',NULL,0.2)`);
  const delivery = request("RPT_Ordens_Reparacao_DataEntrega");
  const samples = [[{ ParamDaData: "20261025", ParamAData: "20261025", ParamEstados: ["R"] }, ["10"]], [{ ParamDaData: null, ParamAData: null, ParamEstados: null }, ["10", "11"]], [{ ParamDaData: "", ParamAData: "", ParamEstados: null }, []], [{ ParamDaData: null, ParamAData: null, ParamEstados: [] }, []]] as const;
  for (const [parameters, expected] of samples) {
    const result = rendered(await renderReport(connect, renderer, { ...delivery, source: { kind: "query", parameters } }));
    expect(controls(result.html, "ITEM_Numero")).toEqual(expected);
    if (expected.length) expect(pdf(result.pdfBase64).map(page => page.text).join("\n")).toContain("10");
  }
}, 60_000);

it("NULL bound values render blank but NULL arithmetic keeps the report unresolved and the original rows intact", async () => {
  await database.query(`INSERT INTO app."artigos" ("Codigo","Descricao","stock") VALUES ('A',NULL,NULL); INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,NULL);
    INSERT INTO app."Viaturas" ("matricula","Cliente") VALUES ('AA',1); INSERT INTO app."estados_reparacao" ("Codigo","Descricao") VALUES ('R',NULL);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_estado","recepcao_entrega_prevista","total_pago") VALUES (10,'AA','R','20261025',NULL)`);
  const inventory = rendered(await renderReport(connect, renderer, request("RPT_inventario")));
  expect(controls(inventory.html, "ITEM_Descricao")).toEqual([""]); expect(controls(inventory.html, "ITEM_Stock")).toEqual([""]);
  expect(pdf(inventory.pdfBase64)[0].text).toContain("Inventário de Artigos");
  expect(await renderReport(connect, renderer, request("RPT_Ordens_Reparacao_DataEntrega"))).toEqual({ kind: "unresolved", unresolved: ["U-report: NULL automatic sum"] });
  expect((await database.query('SELECT "Descricao","stock" FROM app."artigos"')).rows).toEqual([{ Descricao: null, stock: null }]);
}, 60_000);

it("all28 source Auto.Resiz date controls grow their bands without losing lines, changing paper, or overlapping the source footer", async () => {
  const dateText = Array.from({ length: 11 }, (_, index) => `DATE ${String(index + 1).padStart(2, "0")}`).join("\r\n");
  for (const reportId of ["RPT_Ordens_Reparacao", "RPT_Extrato_artigos", ...familyReportIds] as const) {
    const input = request(reportId), result = rendered(await renderReport(connect, renderer, { ...input, context: { ...context, dateText } })), pages = pdf(result.pdfBase64), text = pages.map(page => page.text).join("\n");
    for (const line of dateText.split("\r\n")) expect(text, reportId).toContain(line);
    const footer = footerText(reportId); if (footer) expect(text, reportId).toContain(footer);
    expect(pages).toHaveLength(result.pageCount);
    expect(result.html, reportId).toContain('data-control="CONTROL58" class="control flow-control');
  }
  const long = request("RPT_List_Clientes");
  expect(await renderReport(connect, renderer, { ...long, context: { ...context, dateText: "DATE\r\n".repeat(150) } })).toEqual({ kind: "unresolved", unresolved: ["U-R10-01: indivisible report content exceeds the printable page"] });
}, 180_000);

it("statement query keeps both inclusive boundary movements, group balances and fresh repeated-preview reset in its actual PDF", async () => {
  await database.query(`INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ('E','ENTRADA',1),('S','SAIDA',2);
    INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data") VALUES ('E',1,'20261025000000000'),('S',2,'20261025120000000'),('E',3,'20261025000000000');
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('E',1,'A','ARTICLE A',0.25),('S',2,'A','ARTICLE A',0.1),('E',3,'B','ARTICLE B',2)`);
  for (let preview = 0; preview < 2; preview++) {
    const result = rendered(await renderReport(connect, renderer, request("RPT_Extrato_artigos"))), text = pdf(result.pdfBase64).map(page => page.text).join("\n");
    expect(controls(result.html, "STC_total_anterior")).toEqual(["Total Anterior: 0.25", "Total Anterior: 2"]);
    expect(controls(result.html, "ITEM_total")).toEqual(["0.5", "0.4", "4"]);
    expect(controls(result.html, "STC_total_final")).toEqual(["Total Final: 0.4", "Total Final: 4"]);
    expect(controls(result.html, "COUNTER")).toEqual(["3"]);
    for (const value of ["Total Anterior: 0.25", "Total Anterior: 2", "Total Final: 0.4", "Total Final: 4", "ARTICLE A", "ARTICLE B"]) expect(text).toContain(value);
    if (!preview) await writeFile("analysis-local/report-inclusive-statement.pdf", Buffer.from(result.pdfBase64, "base64"));
  }
  expect((await database.query('SELECT "quantidade"::text FROM app."lin_stocks" ORDER BY _row_id')).rows.map(row => row.quantidade)).toEqual(["0.25", "0.1", "2"]);
}, 60_000);
