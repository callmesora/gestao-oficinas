import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { execFileSync } from "node:child_process";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { renderReport } from "../operations/reports";
import { createReportRenderer } from "./renderer";
import type { FamilyReportRequest, ReportId, ReportRequest, ReportRenderResult } from "../../../../packages/domain/src/reports";

// Source-derived synthetic inputs. These tests exercise the real DB/Paged.js/Chromium
// path; they are not recorded legacy PDF goldens or answers to the retained U items.
let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const renderer = createReportRenderer(), context = { company: "OFICINA VERIFICAÇÃO", dateText: "25/10/2026" };
const tables = 'app."Clientes",app."Viaturas",app."mecanicos",app."utilizadores",app."unidades",app."estados_descritivos",app."estados_reparacao",app."artigos",app."documentos",app."cab_stocks",app."lin_stocks",app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao"';
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60_000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60_000);
beforeEach(async () => { await database.query(`TRUNCATE ${tables} RESTART IDENTITY`); });

async function seed() {
  await database.query(`INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao","Morada1","Morada2","codpostal","Telefone1","Telemovel") VALUES (1,101,'CUSTA','RUA A','PISO A','1000','211','911'),(2,102,'CUSTB','RUA B','PISO B','2000','212','912');
    INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo","Ano","mes") VALUES (1,'AA',101,'MARCAA','MODELOA',2020,1),(2,'BB',102,'MARCAB','MODELOB',2021,2);
    INSERT INTO app."mecanicos" ("Codigo","Descricao","palavra_passe") VALUES (7,'MECHA','never-print-mechanic-secret'),(8,'MECHB','never-print-mechanic-secret');
    INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,71,'USERA','never-print-user-secret'),(2,72,'USERB','never-print-user-secret');
    INSERT INTO app."unidades" ("unidadesID","Codigo","Descricao") VALUES (1,'UN','UNITA'),(2,'LT','UNITB');
    INSERT INTO app."estados_descritivos" ("estados_descritivosID","Codigo","Descricao") VALUES (1,'DA','STDESCA'),(2,'DB','STDESCB');
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","pedir_data_entrega","pedir_data_pag") VALUES (1,'R','STREPA',3,true,true),(2,'S','STREPB',4,true,true);
    INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","codbarras","unidade","preco","stock","inativo") VALUES (1,'A','ARTA','BARCA','UN',99.99,-1.25,true),(2,'B','ARTB','BARCB','LT',88.88,0,false);
    INSERT INTO app."documentos" ("documentosID","Codigo","Descricao","stock") VALUES (1,'X','DOCA',2),(2,'Y','DOCB',2);
    INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data","mecanico") VALUES ('X',1,'20261025080000000',7),('Y',2,'20261025090000000',8);
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('X',1,'A','LINEA',0.1),('Y',2,'B','LINEB',0.2);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_mecanico","reparacao_estado","recepcao_datahora","recepcao_entrega_prevista","data_pagamento","total_pago","recepcao_servico","recepcao_obs","recepacao_contatos") VALUES
      (11,'AA',102,7,'R','20261025070000000','20261025','20261025',0.1,'SVCA','OBSA','CONTACTA'),(12,'BB',101,8,'S','20261025073000000','20261026','20261026',0.2,'SVCB','OBSB','CONTACTB');
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","mecanico","data_hora") VALUES (11,'A','MATA',0.3,7,'20261025100000000'),(12,'B','MATB',0.4,8,'20261025110000000');
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES (11,7,'20261025080000000','20261025094000000'),(12,8,'20261025100000000','20261025123500000')`);
}

function request(reportId: ReportId, empty = false): ReportRequest {
  if (reportId === "RPT_Ordens_Reparacao") return { reportId, context, source: { kind: "window-table", window: "WIN_Ordens_Reparacao", table: "TABLE_QRY_select_ordens_reparacao",
    filter: { entryStart: "", entryEnd: "", deliveryStart: "", deliveryEnd: "", priority: 0, mechanic: 0, customer: "", registration: "", states: [], sort: "numero", descending: true },
    rows: empty ? [] : [{ COL_Numero: "12", COL_Cliente: "LIVECUST", COL_marca_modelo: "LIVECAR", COL_Matricula: "LIVEBB", COL_Recepcao_datahora: "25/10/2026 07:30", COL_Recepcao_entrega_prevista: "26/10/2026", COL_Reparacao_estado: "LIVE STATE", COL_Recepcao_prioridade: "3", COL_Reparacao_mecanico: "LIVEMECH" },
      { COL_Numero: "11", COL_Cliente: "LIVECUST", COL_marca_modelo: "LIVECAR", COL_Matricula: "LIVEAA", COL_Recepcao_datahora: "25/10/2026 07:00", COL_Recepcao_entrega_prevista: "25/10/2026", COL_Reparacao_estado: "LIVE STATE", COL_Recepcao_prioridade: "1", COL_Reparacao_mecanico: "LIVEMECH" }] } };
  if (reportId === "RPT_Extrato_artigos") return { reportId, context, source: { kind: "query", from: "20261025000000", to: "20261026235959", articleFrom: "A", articleTo: "B", openingCutoff: "20261024000000" } };
  let source: FamilyReportRequest["source"];
  if (reportId.startsWith("RPT_List_")) source = { kind: "embedded-query" };
  else if (reportId === "RPT_inventario") source = { kind: "file" };
  else if (reportId === "RPT_Servico_Avaria") source = { kind: "programmatic", orderNumber: empty ? "99999" : "11" };
  else if (reportId === "RPT_Materiais") source = { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: empty ? "99999" : "11", formattedTotal: "TOTAL DO CHAMADOR 0,70 €  ", rows: empty ? [] : [
    { COL_cod_art: "B", COL_desc_artigo: "LIVEB", COL_quant: "0.4", COL_preco: "88.88", COL_lancado: "1" },
    { COL_cod_art: "A", COL_desc_artigo: "LIVEA", COL_quant: "0.3", COL_preco: "99.99", COL_lancado: "0" },
  ] };
  else if (reportId.startsWith("RPT_Ordens_")) source = { kind: "query", parameters: { ParamDaData: "20261025", ParamAData: "20261026", ParamEstados: ["R", "S"] } };
  else if (reportId.startsWith("RPT_Consumo_")) source = { kind: "query", parameters: { ParamDaData: "20261025000000", ParamAData: "20261026235959", ParamDoArtigo: "A", ParamAoArtigo: "B",
    ...(reportId.includes("Viatura") ? { ParamDaViatura: "AA", ParamAViatura: "BB" } : { ParamDescricao: null }) } };
  else source = { kind: "query", parameters: { ParamDaData: "20261025000000", ParamAData: "20261026235959", ...(reportId.endsWith("viatura") ? { ParamDaViatura: "AA", ParamAViatura: "BB" }
    : reportId === "RPT_Tempos_Ordem_Reparacao" ? { ParamDaOrdem: "11", ParamAOrdem: "12" } : { ParamDoMecanico: "7", ParamAoMecanico: "8" }) } };
  return { reportId, context, source };
}
type Pdf = { pages: { text: string; width: number; height: number }[] };
function pdf(base64: string): Pdf {
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;r=PdfReader(io.BytesIO(sys.stdin.buffer.read()));print(json.dumps({'pages':[{'text':p.extract_text(),'width':float(p.mediabox.width),'height':float(p.mediabox.height)} for p in r.pages]}))"], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}
async function render(input: ReportRequest) {
  const result: ReportRenderResult = await renderReport(connect, renderer, input);
  expect(result.kind, input.reportId + " " + JSON.stringify(result).slice(0, 300)).toBe("rendered");
  if (result.kind !== "rendered") throw new Error(`${input.reportId}: ${result.kind}`);
  return { ...result, pdf: pdf(result.pdfBase64) };
}
function controls(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`data-control="${name}"[^>]*>([^<]*)</div>`, "g"))].map(match => match[1]);
}
// Independent oracles copied from each committed report spec, never generated from
// the implementation layout. A5/A4 tolerances cover Chromium's integer print dots.
const cases: { reportId: ReportId; paper: "A4" | "A5" | "Letter"; marker: string; counter?: string; count: number; footer: boolean }[] = [
  { reportId: "RPT_List_Clientes", paper: "A4", marker: "CUSTA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_List_Viaturas", paper: "A4", marker: "MODELOA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_List_artigos", paper: "A4", marker: "BARCA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_List_documentos", paper: "A4", marker: "DOCA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_List_estados_descritivos", paper: "A4", marker: "STDESCA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_List_estados_reparacao", paper: "A4", marker: "STREPA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_List_mecanicos", paper: "A4", marker: "MECHA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_List_unidades", paper: "A4", marker: "UNITA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_List_utilizadores", paper: "A4", marker: "USERA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_inventario", paper: "Letter", marker: "ARTA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Consumo_Material_Descriminado_Ordens", paper: "Letter", marker: "MECHA", counter: "COUNTER1", count: 2, footer: true },
  { reportId: "RPT_Consumo_Material_Descriminado_Saidas", paper: "Letter", marker: "DOCA", counter: "COUNTER1", count: 2, footer: true },
  { reportId: "RPT_Consumo_Material_Descriminado_ordens_saidas", paper: "Letter", marker: "DOCA", counter: "COUNTER1", count: 4, footer: false },
  { reportId: "RPT_Consumo_Material_Resumo_Saidas", paper: "Letter", marker: "ARTA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Consumo_Material_Resumo_ordem_saidas", paper: "Letter", marker: "ARTA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Consumo_Material_Resumo_ordens", paper: "Letter", marker: "ARTA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Consumo_Material_Viatura_Descriminado", paper: "Letter", marker: "MATA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Consumo_Material_Viatura_Resumo", paper: "Letter", marker: "MATA", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Ordens_Reparacao_DataEntrega", paper: "Letter", marker: "CUSTA", counter: "COUNTER1", count: 2, footer: true },
  { reportId: "RPT_Ordens_Reparacao_DataPag", paper: "Letter", marker: "CUSTA", counter: "COUNTER1", count: 2, footer: true },
  { reportId: "RPT_Tempos_Ordem_Reparacao", paper: "Letter", marker: "01:40", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Tempos_Ordem_Reparacao_Mecanico", paper: "Letter", marker: "01:40", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo", paper: "Letter", marker: "01:40", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Tempos_Ordem_Reparacao_viatura", paper: "Letter", marker: "01:40", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Materiais", paper: "A5", marker: "LIVEB", counter: "COUNTER", count: 2, footer: true },
  { reportId: "RPT_Servico_Avaria", paper: "A5", marker: "SVCA", count: 1, footer: false },
  { reportId: "RPT_Ordens_Reparacao", paper: "Letter", marker: "LIVECUST", counter: "COUNTER1", count: 2, footer: true },
  { reportId: "RPT_Extrato_artigos", paper: "Letter", marker: "DOCA", counter: "COUNTER", count: 4, footer: true },
];

it.each(cases)("$reportId real PDF retains source text, paper, footer and per-document counter", async ({ reportId, paper, marker, counter, count, footer }) => {
  await seed();
  const result = await render(request(reportId));
  const text = result.pdf.pages.map(page => page.text).join("\n");
  expect(text).toContain(marker); expect(text).toContain(context.company);
  expect(text).not.toContain("never-print-");
  const [width, height] = paper === "A4" ? [210, 297] : paper === "A5" ? [148, 210] : [215.9, 279.4];
  for (const page of result.pdf.pages) {
    expect(Math.abs(page.width * 25.4 / 72 - width)).toBeLessThan(0.5);
    expect(Math.abs(page.height * 25.4 / 72 - height)).toBeLessThan(0.5);
  }
  if (footer) expect(text).toContain("Golfinho Software, Lda");
  if (counter) expect(controls(result.html, counter)).toEqual([String(count)]);
  if (reportId.startsWith("RPT_List_") || reportId === "RPT_inventario" || reportId.startsWith("RPT_Ordens_")) expect(text).toContain("Número de linhas:");
  if (reportId === "RPT_List_artigos") expect(controls(result.html, "ITEM_Preco")).toEqual(["true", "false"]); // source binds inativo, not preco
  if (reportId === "RPT_Materiais") {
    expect(controls(result.html, "ITEM_COL_cod_art")).toEqual(["B", "A"]);
    expect(controls(result.html, "ITEM_COL_preco")).toEqual(["1", "0"]); // source binds lancado, not preco
    expect(controls(result.html, "STC_Total_material")).toEqual(["TOTAL DO CHAMADOR 0,70 €  "]);
    expect(text).toContain("Cliente: CUSTB");
  }
  if (reportId === "RPT_Servico_Avaria") { expect(text).toContain("CUSTB"); expect(text).toContain("OBSA"); expect(text).toContain("CONTACTA"); }
  if (reportId === "RPT_Ordens_Reparacao") { expect(controls(result.html, "ITEM_COL_Numero")).toEqual(["12", "11"]); expect(text).toContain("Urgente"); expect(text).toContain("Normal"); }
  if (reportId === "RPT_Ordens_Reparacao_DataEntrega" || reportId === "RPT_Ordens_Reparacao_DataPag") {
    expect(controls(result.html, "CALC_Total_pago")).toEqual(["0.3"]); expect(text).toContain("Total:");
    expect(text).toContain("Ordens de Reparação por data de entrega");
    if (reportId.endsWith("DataPag")) {
      expect(new Set(controls(result.html, "STC_Recepcao_entrega_prevista"))).toEqual(new Set(["Data pagamento"]));
      expect(text).toMatch(/Data\s+pagamento/);
    }
  }
  if (reportId.includes("Descriminado") && !reportId.includes("Viatura")) expect(controls(result.html, "STC_total")).toEqual([reportId.endsWith("Ordens") ? "0.7" : reportId.endsWith("Saidas") ? "0.3" : "1"]);
  if (reportId === "RPT_Consumo_Material_Resumo_ordem_saidas") expect(controls(result.html, "ITEM_Soma")).toEqual(["0.4", "0.6"]);
  if (reportId.startsWith("RPT_Tempos_")) expect(text).toContain("02:35");
  if (reportId === "RPT_Extrato_artigos") { expect(text).toContain("Total Final: -0.4"); expect(text).toContain("Total Final: -0.6"); }
}, 60_000);

it.each(cases)("$reportId empty PDF has an independent counter and no stale prior-preview rows", async ({ reportId, marker, counter }) => {
  await seed(); const first = await render(request(reportId));
  expect(first.pdf.pages.map(page => page.text).join("\n")).toContain(marker);
  await database.query(`TRUNCATE ${tables} RESTART IDENTITY`);
  const empty = await render(request(reportId, true)), text = empty.pdf.pages.map(page => page.text).join("\n");
  expect(empty.pdf.pages.length).toBeGreaterThan(0); expect(text).toContain(context.company);
  expect(text).not.toContain(marker);
  if (counter) expect(controls(empty.html, counter)).toEqual(["0"]);
  if (reportId === "RPT_Ordens_Reparacao_DataEntrega" || reportId === "RPT_Ordens_Reparacao_DataPag") expect(controls(empty.html, "CALC_Total_pago")).toEqual(["0"]);
  if (reportId === "RPT_Consumo_Material_Resumo_ordem_saidas") expect(controls(empty.html, "ITEM_Soma")).toEqual([]);
}, 60_000);

const masterPages: { reportId: ReportId; table: string; fields: string; values: string; control: string; header: string }[] = [
  { reportId: "RPT_List_Clientes", table: "Clientes", fields: '"ClientesID","Codigo","Descricao"', values: "n,n,'V'||lpad(n::text,6,'0')", control: "ITEM_Descricao", header: "Código" },
  { reportId: "RPT_List_Viaturas", table: "Viaturas", fields: '"ViaturasID","matricula","Cliente","marca","modelo"', values: "n,'V'||lpad(n::text,6,'0'),101,'MARCA','MODELO'", control: "ITEM_Matricula", header: "Matricula" },
  { reportId: "RPT_List_artigos", table: "artigos", fields: '"artigosID","Codigo","Descricao"', values: "n,n::text,'V'||lpad(n::text,6,'0')", control: "ITEM_Descricao", header: "Código" },
  { reportId: "RPT_List_documentos", table: "documentos", fields: '"documentosID","Codigo","Descricao"', values: "n,n::text,'V'||lpad(n::text,6,'0')", control: "ITEM_Descricao", header: "Código" },
  { reportId: "RPT_List_estados_descritivos", table: "estados_descritivos", fields: '"estados_descritivosID","Codigo","Descricao"', values: "n,n::text,'V'||lpad(n::text,6,'0')", control: "ITEM_Descricao", header: "Código" },
  { reportId: "RPT_List_estados_reparacao", table: "estados_reparacao", fields: '"estados_reparacaoID","Codigo","Descricao"', values: "n,n::text,'V'||lpad(n::text,6,'0')", control: "ITEM_Descricao", header: "Código" },
  { reportId: "RPT_List_mecanicos", table: "mecanicos", fields: '"Codigo","Descricao"', values: "n,'V'||lpad(n::text,6,'0')", control: "ITEM_Descricao", header: "Código" },
  { reportId: "RPT_List_unidades", table: "unidades", fields: '"unidadesID","Codigo","Descricao"', values: "n,n::text,'V'||lpad(n::text,6,'0')", control: "ITEM_Descricao", header: "Código" },
  { reportId: "RPT_List_utilizadores", table: "utilizadores", fields: '"utilizadoresID","Codigo","Descricao"', values: "n,n,'V'||lpad(n::text,6,'0')", control: "ITEM_Descricao", header: "Código" },
  { reportId: "RPT_inventario", table: "artigos", fields: '"artigosID","Codigo","Descricao","stock","inativo"', values: "n,n::text,'V'||lpad(n::text,6,'0'),-n/10.0,true", control: "ITEM_Descricao", header: "Código" },
];
it.each(masterPages)("$reportId multipage PDF prints all120 records once with repeated source headers and final footer", async ({ reportId, table, fields, values, control, header }) => {
  if (reportId === "RPT_List_Viaturas") await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (101,\'OWNER\')');
  await database.query(`INSERT INTO app."${table}" (${fields}) SELECT ${values} FROM generate_series(1,120) n`);
  const result = await render(request(reportId)), pages = result.pdf.pages, text = pages.map(page => page.text).join("\n");
  expect(pages.length).toBeGreaterThan(1); expect(pages).toHaveLength(result.pageCount);
  const expected = Array.from({ length: 120 }, (_, index) => `V${String(index + 1).padStart(6, "0")}`);
  expect(controls(result.html, control).sort()).toEqual(expected);
  for (const value of expected) expect(text.match(new RegExp(`\\b${value}\\b`, "g")), value).toHaveLength(1);
  for (const [index, page] of pages.entries()) { expect(page.text).toContain(header); expect(page.text).toContain(`${index + 1}/${pages.length}`); }
  expect(pages.at(-1)!.text).toContain("Número de linhas:"); expect(pages.at(-1)!.text).toContain("Golfinho Software, Lda");
  expect(controls(result.html, "COUNTER")).toEqual(["120"]);
}, 60_000);

it("RPT_Materiais multipage A5 snapshot retains all120 caller rows once, inherited total and repeated source headers", async () => {
  await seed(); const input = request("RPT_Materiais");
  if (input.reportId !== "RPT_Materiais" || input.source.kind !== "window-table") throw new Error("Expected material snapshot");
  const expected = Array.from({ length: 120 }, (_, index) => `M${String(index + 1).padStart(5, "0")}`);
  input.source.rows = expected.map(value => ({ COL_cod_art: value, COL_desc_artigo: "MATERIAL", COL_quant: "0.1", COL_preco: "99.99", COL_lancado: "1" }));
  const result = await render(input), pages = result.pdf.pages, text = pages.map(page => page.text).join("\n");
  expect(pages.length).toBeGreaterThan(1); expect(pages).toHaveLength(result.pageCount);
  expect(controls(result.html, "ITEM_COL_cod_art")).toEqual(expected);
  for (const value of expected) expect(text.match(new RegExp(`\\b${value}\\b`, "g")), value).toHaveLength(1);
  for (const [index, page] of pages.entries()) { expect(page.text).toContain("Artigo"); expect(page.text).toContain("Descrição"); expect(page.text).toContain(`${index + 1}/${pages.length}`); }
  expect(pages.at(-1)!.text).toContain("TOTAL DO CHAMADOR 0,70 €");
  expect(controls(result.html, "COUNTER")).toEqual(["120"]);
}, 60_000);
