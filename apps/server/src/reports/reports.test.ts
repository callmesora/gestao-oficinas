import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import { renderReport } from "../operations/reports";
import { createReportRenderer, loadReportAssets } from "./renderer";
import type { DatabaseConnection } from "../db/connection";
import { repairOrderReportSnapshot } from "../../../../src/application/reports";
import type { RepairOrderList, RepairOrderListRow } from "../../../../packages/domain/src/repair-orders";
import type { OrderReportRequest, ReportRenderResult } from "../../../../packages/domain/src/reports";
import { familyReportIds, type FamilyReportRequest } from "../../../../packages/domain/src/reports";
import { familyReportDocument } from "./families";
import { reportLayouts } from "./fixed-layout";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const renderer = createReportRenderer({ assets: loadReportAssets(process.env.REPORT_TEST_MODULES ? resolve(process.env.REPORT_TEST_MODULES) : undefined) });
const context = { company: "OFICINA SINTÉTICA  ", dateText: "25/10/2026" };
const filter: RepairOrderList = { entryStart: "", entryEnd: "", deliveryStart: "", deliveryEnd: "", priority: 0, mechanic: 0, customer: "", registration: "AA", states: ["R"], sort: "numero", descending: false };
const row: RepairOrderListRow = { id: "1", orderId: "1", numero: "18446744073709551615", matricula: "AA-00-AA", Descricao_Cliente: "AÇÃO  ", Descricao_Terceiro: null, marcamodelo: "MARCA MODELO", recepcao_datahora: "20261025123456000", recepcao_entrega_prevista: "20261026", Descricao: "Reparação", recepcao_prioridade: 2, Descricao_me: "MECÂNICO", Cor: null };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60_000);

it("executes every remaining fixed report family through actual PostgreSQL sources and source metadata", async () => {
  await database.query(`INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao") VALUES (1,1,'CLIENTE SINTÉTICO');
    INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo") VALUES (1,'AA-00-AA',1,'MARCA','MODELO');
    INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe") VALUES (1,1,'MECÂNICO SINTÉTICO','synthetic-report-secret');
    INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,1,'UTILIZADOR SINTÉTICO','synthetic-report-secret');
    INSERT INTO app."unidades" ("unidadesID","Codigo","Descricao") VALUES (1,'UN','UNIDADE SINTÉTICA');
    INSERT INTO app."estados_descritivos" ("estados_descritivosID","Codigo","Descricao") VALUES (1,'ED','ESTADO DESCRITIVO');
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo") VALUES (1,'R','ESTADO REPARAÇÃO',3);
    INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","unidade","preco","stock") VALUES (1,'A','ARTIGO SINTÉTICO','UN',0.1234567890123456789,-1.234567890123456789);
    INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ('E','SAÍDA SINTÉTICA',2);
    INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data","mecanico") VALUES ('E',100,'20260202000000000',1);
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('E',100,'A','ARTIGO SINTÉTICO',0.1);
    INSERT INTO app."ordem_reparacao" ("numero","recepcao_datahora") VALUES (18446744073709551615,'20260203000000000');
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade") VALUES (18446744073709551615,'A','ARTIGO SINTÉTICO',0.2);
    UPDATE app."ordem_reparacao" SET "matricula"='AA-00-AA',"recepcao_cliente"=1,"reparacao_mecanico"=1,"reparacao_estado"='R',"recepcao_entrega_prevista"='20260204',"data_pagamento"='20260205',"total_pago"=1.234567890123456789,"recepcao_servico"='SERVIÇO SINTÉTICO',"recepcao_obs"='OBSERVAÇÃO SINTÉTICA',"recepacao_contatos"='CONTACTO SINTÉTICO';
    UPDATE app."material_reparacao" SET "mecanico"=1,"data_hora"='20260203000000000';
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES (18446744073709551615,1,'20260203080000000','20260203093000000')`);
  for (const reportId of familyReportIds) {
    const source: FamilyReportRequest["source"] = reportId.startsWith("RPT_List_") ? { kind: "embedded-query" }
      : reportId === "RPT_inventario" ? { kind: "file" }
      : reportId === "RPT_Materiais" ? { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: "18446744073709551615", formattedTotal: "€ 123,4500", rows: [{ COL_cod_art: "A", COL_desc_artigo: "MATERIAL DA TABELA", COL_quant: "0.1234567890123456789", COL_preco: "1.234567890123456789", COL_lancado: "1" }] }
      : reportId === "RPT_Servico_Avaria" ? { kind: "programmatic", orderNumber: "18446744073709551615" }
      : { kind: "query", parameters: reportId.startsWith("RPT_Consumo_") ? reportId.includes("Viatura")
        ? { ParamDaData: "20260201000000", ParamAData: "20260228235959", ParamDoArtigo: "A", ParamAoArtigo: "Z", ParamDaViatura: "AA", ParamAViatura: "ZZ" }
        : { ParamDoArtigo: "A", ParamAoArtigo: "Z", ParamDaData: "20260201000000", ParamAData: "20260228235959", ParamDescricao: "" }
        : reportId.startsWith("RPT_Ordens_") ? { ParamDaData: "20260201", ParamAData: "20260228", ParamEstados: ["R"] }
        : { ParamDaData: "20260201000000", ParamAData: "20260228235959", ...(reportId.endsWith("viatura") ? { ParamDaViatura: "AA", ParamAViatura: "ZZ" } : reportId === "RPT_Tempos_Ordem_Reparacao" ? { ParamDaOrdem: "0", ParamAOrdem: "18446744073709551615" } : { ParamDoMecanico: "0", ParamAoMecanico: "255" }) } };
    const result = await familyReportDocument(database, { reportId, context, source });
    expect("html" in result, reportId + " " + JSON.stringify(result)).toBe(true);
    if (!("html" in result)) continue;
    expect(result.html, reportId).toContain('data-band="BODY"');
    expect(result.html).not.toContain("synthetic-report-secret");
    expect(result.css).toContain(reportLayouts[reportId].paper === "A4" ? "210mm 297mm" : reportLayouts[reportId].paper === "A5" ? "148mm 210mm" : "215.9mm 279.4mm");
    if (reportId === "RPT_Servico_Avaria") expect(result.html).toContain("SERVIÇO SINTÉTICO");
    if (reportId === "RPT_Materiais") { expect(result.html).toContain("MATERIAL DA TABELA"); expect(result.html).toContain("€ 123,4500"); }
    if (reportId.startsWith("RPT_Tempos_")) expect(result.html).toContain("01:30");
  }
}, 30_000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60_000);
beforeEach(async () => {
  await database.query('TRUNCATE app."Clientes",app."Viaturas",app."mecanicos",app."utilizadores",app."unidades",app."estados_descritivos",app."estados_reparacao",app."artigos",app."documentos",app."cab_stocks",app."lin_stocks",app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao" RESTART IDENTITY');
});
function rendered(result: ReportRenderResult) {
  expect(result.kind).toBe("rendered");
  if (result.kind !== "rendered") throw new Error(`Report result ${result.kind}`);
  return result;
}
function inspectPdf(base64: string): { pages: { text: string; width: number; height: number }[]; embeddedFonts: number } {
  const script = `import sys,io,json
from pypdf import PdfReader
r=PdfReader(io.BytesIO(sys.stdin.buffer.read())); embedded=set()
for p in r.pages:
 for ref in p['/Resources'].get('/Font',{}).values():
  f=ref.get_object()
  for child in f.get('/DescendantFonts',[f]):
   d=child.get_object().get('/FontDescriptor')
   if d:
    d=d.get_object()
    if any(k in d for k in ['/FontFile','/FontFile2','/FontFile3']): embedded.add(str(d.get('/FontName')))
print(json.dumps({'pages':[{'text':p.extract_text(),'width':float(p.mediabox.width),'height':float(p.mediabox.height)} for p in r.pages], 'embeddedFonts':len(embedded)}))`;
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", script], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}

it("protects the report API and validates the full source contract before any data/renderer access", async () => {
  let reads = 0, renders = 0;
  const app = createApp({ reportConnect: async () => { reads++; return connect(); }, reportRenderer: async () => { renders++; return { kind: "failed" }; },
    authenticate: async request => request.headers.authorization === "Bearer synthetic-report" ? { userId: "synthetic" } : null });
  const denied = await app.inject({ method: "POST", url: "/api/reports/render", payload: {} });
  expect(denied.statusCode).toBe(401); expect(denied.headers["cache-control"]).toBe("no-store");
  const invalid = await app.inject({ method: "POST", url: "/api/reports/render", headers: { authorization: "Bearer synthetic-report" }, payload: { reportId: "RPT_Ordens_Reparacao", sql: "SELECT *" } });
  expect(invalid.json()).toEqual({ kind: "invalid" }); expect(reads).toBe(0); expect(renders).toBe(0);
  await app.close();
});

it("renders the explicit live caller table snapshot and same offline preview/PDF without reading the database", async () => {
  let reads = 0;
  const source: OrderReportRequest = repairOrderReportSnapshot([row, { ...row, numero: "2", Descricao_Cliente: "<img src=https://invalid.test/x onerror=alert(1)>" }], filter, context);
  const app = createApp({ reportConnect: async () => { reads++; return connect(); }, reportRenderer: renderer, authenticate: async () => ({ userId: "synthetic" }) });
  const response = await app.inject({ method: "POST", url: "/api/reports/render", payload: source });
  const result = rendered(response.json<ReportRenderResult>());
  expect(reads).toBe(0); expect(result.pageCount).toBe(1);
  expect(result.html).toContain("18446744073709551615"); expect(result.html).toContain("Elevada");
  expect(result.html).toContain("&lt;img"); expect(result.html).not.toContain("<img"); expect(result.html).not.toContain("<script");
  expect(result.html).toContain("data:font/woff2;base64,"); expect(result.html).toContain("SIL OPEN FONT LICENSE");
  const pdf = inspectPdf(result.pdfBase64);
  expect(pdf.pages).toHaveLength(1); expect(pdf.pages[0]).toMatchObject({ width: 612, height: 792 });
  expect(pdf.pages[0].text).toContain("Ordens de Reparação"); expect(pdf.pages[0].text).toContain("Elevada");
  expect(pdf.embeddedFonts).toBeGreaterThanOrEqual(2);
  await app.close();
}, 60_000);

it("renders an empty live-table report with its source header and a valid PDF without querying replacement rows", async () => {
  let reads = 0;
  const result = rendered(await renderReport(async () => { reads++; return connect(); }, renderer, repairOrderReportSnapshot([], filter, context)));
  expect(reads).toBe(0); expect(result.pageCount).toBe(1);
  const pdf = inspectPdf(result.pdfBase64); expect(pdf.pages).toHaveLength(1);
  expect(pdf.pages[0].text).toContain("Ordens de Reparação");
  expect(pdf.pages[0].text).not.toContain(row.numero!);
}, 60_000);

it("executes both real source movement branches, preserves code+number joins/duplicates/inclusive history and paginates totals/headers", async () => {
  await database.query(`INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ('E','Entrada sintética '||repeat('texto ',100),1),('S','Saída sintética',2),('X','Outro',9);
    INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data") VALUES ('E',1,'20260101000000000'),('E',2,'20260201000000000'),('S',2,'20260201000000000'),('E',3,'20260202000000000');
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('E',1,'A','ÓLEO',10),('E',2,'A','ÓLEO',0.1),('S',2,'A','ÓLEO',0.2);
    INSERT INTO app."ordem_reparacao" ("numero","recepcao_datahora") VALUES (18446744073709551615,'20260203000000000');
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","data_hora") VALUES (18446744073709551615,'A','ÓLEO',0.3,'20990101000000000');`);
  await database.query(`INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade")
    SELECT 'E',3,'A','DESCRIÇÃO LONGA '||repeat('texto ',100),0.1 FROM generate_series(1,100)`);
  await database.query(`INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data") VALUES ('E',4,'20260202000000000');
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('E',4,'B','SEGUNDO ARTIGO',7)`);
  const result = rendered(await renderReport(connect, renderer, { reportId: "RPT_Extrato_artigos", context,
    source: { kind: "query", from: "20260201000000", to: "20260228235959", articleFrom: "A", articleTo: "B", openingCutoff: "20260201000000" } }));
  expect(result.pageCount).toBeGreaterThan(1);
  expect(result.html).toContain("Total Anterior: 9.9"); // opening intentionally also includes both first-day rows
  expect(result.html).toContain("Total Final: 19.5"); //10-.1 current date pair +100*.1-.3 material
  expect(result.html).toContain("Total Final: 7");
  expect(result.html).not.toContain('data-control="ITEM_Quantidade"'); expect(result.html).not.toContain('data-control="ITEM_Stock"');
  const pdf = inspectPdf(result.pdfBase64);
  expect(pdf.pages).toHaveLength(result.pageCount);
  for (const page of pdf.pages) {
    expect(page).toMatchObject({ width: 612, height: 792 });
    expect(page.text).toContain("Data"); expect(page.text).toContain("Número"); expect(page.text).toContain("Descrição");
  }
  expect(pdf.pages.at(-1)!.text).toContain("Total Final: 7"); expect(pdf.embeddedFonts).toBeGreaterThan(0);
}, 60_000);
