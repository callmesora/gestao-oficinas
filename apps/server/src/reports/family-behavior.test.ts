import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { familyReportDocument } from "./families";
import { createReportRenderer } from "./renderer";
import { renderReport } from "../operations/reports";
import type { DatabaseConnection } from "../db/connection";
import { familyReportIds, type FamilyReportRequest, type ReportRenderResult } from "../../../../packages/domain/src/reports";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const context = { company: "EMPRESA DOS EVENTOS  ", dateText: "25/10/2026" };
const renderer = createReportRenderer();
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60_000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60_000);
beforeEach(async () => {
  await database.query('TRUNCATE app."Clientes",app."Viaturas",app."mecanicos",app."utilizadores",app."unidades",app."estados_descritivos",app."estados_reparacao",app."artigos",app."documentos",app."cab_stocks",app."lin_stocks",app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao" RESTART IDENTITY');
});
function controls(html: string, name: string): string[] {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...html.matchAll(new RegExp(`data-control="${escaped}"[^>]*>([^<]*)</div>`, "g"))].map(match => match[1]);
}
async function document(reportId: FamilyReportRequest["reportId"], source: FamilyReportRequest["source"]) {
  const result = await familyReportDocument(database, { reportId, context, source });
  if (!("html" in result)) throw new Error(`Report ${reportId}: ${JSON.stringify(result)}`);
  return result;
}
function rendered(result: ReportRenderResult) {
  expect(result.kind).toBe("rendered");
  if (result.kind !== "rendered") throw new Error(`PDF ${result.kind}`);
  return result;
}
function pdfText(base64: string): string[] {
  return JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;print(json.dumps([p.extract_text() for p in PdfReader(io.BytesIO(sys.stdin.buffer.read())).pages]))"], { input: Buffer.from(base64, "base64"), encoding: "utf8" }));
}
async function people() {
  await database.query(`INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'VEHICLE OWNER'),(2,'RECEPTION CUSTOMER');
    INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ('AA',1,'MARCA','MODELO'),('BB',1,'SEGUNDA','VIATURA');
    INSERT INTO app."mecanicos" ("Codigo","Descricao","palavra_passe") VALUES (7,'MATERIAL MECHANIC','fixture-secret'),(8,'ORDER MECHANIC','fixture-secret');
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao","pedir_data_entrega","pedir_data_pag") VALUES ('R','ESTADO',true,true)`);
}
const salesSource: FamilyReportRequest["source"] = { kind: "query", parameters: { ParamDaData: "20260101", ParamAData: "20261231", ParamEstados: ["R"] } };
const mechanicSource: FamilyReportRequest["source"] = { kind: "query", parameters: { ParamDoMecanico: "7", ParamAoMecanico: "7", ParamDaData: "20261025000000", ParamAData: "20261025235959" } };

it("delivery source DESC orders supported Date representations by calendar value and keeps vehicle-customer join and exact total", async () => {
  await people();
  for (const [index, date] of ["2026-11-01", "20261031", "2026-12-01"].entries()) await database.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_estado","recepcao_entrega_prevista","data_pagamento","total_pago") VALUES ($1,\'AA\',2,\'R\',$2,$2,$3)', [String(9007199254740993n + BigInt(index)), date, `0.${index + 1}`]);
  const result = await document("RPT_Ordens_Reparacao_DataEntrega", salesSource);
  expect(controls(result.html, "ITEM_Numero")).toEqual(["9007199254740995", "9007199254740993", "9007199254740994"]);
  expect(controls(result.html, "ITEM_Cliente")).toEqual(["VEHICLE OWNER", "VEHICLE OWNER", "VEHICLE OWNER"]);
  expect(controls(result.html, "CALC_Total_pago")).toEqual(["0.6"]);
});

it("mechanic report source reception DateTime ASC uses supported values before inner subtotal events", async () => {
  await people();
  for (const [numero, date, start, end] of [["102", "20260201000000000", "20261025080000000", "20261025103500000"], ["103", "2026-03-01 00:00:00.000", "20261025080000000", "00000000000000000"], ["101", "20260101000000", "20261025080000000", "20261025094000000"]]) {
    await database.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_datahora") VALUES ($1,\'AA\',$2)', [numero, date]);
    await database.query('INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES ($1,7,$2,$3)', [numero, start, end]);
  }
  const result = await document("RPT_Tempos_Ordem_Reparacao_Mecanico", mechanicSource);
  expect(controls(result.html, "ITEM_Numero")).toEqual(["101", "102", "103"]);
  expect(controls(result.html, "ITEM_tempo")).toEqual(["01:40", "02:35", "00:00"]);
  expect(controls(result.html, "STC_total_horas")).toEqual(["01:40", "02:35", "00:00"]);
  expect(controls(result.html, "STC_total_horas1")).toEqual(["04:15"]);
  const summary = await document("RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo", mechanicSource);
  expect(controls(summary.html, "ITEM_Recepcao_datahora")).toEqual(["20260101000000", "20260201000000000", "2026-03-01 00:00:00.000"]);
  expect(controls(summary.html, "STC_total_horas1")).toEqual(["04:15"]);
});

it("all six ordinary consumption branches retain their distinct joins, description parameter, source sum and programmatic group reset", async () => {
  await people();
  await database.query(`INSERT INTO app."artigos" ("Codigo","Descricao","unidade") VALUES ('A','MASTER A','UN'),('B','MASTER B','LT');
    INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ('S','SAÍDA',2),('E','ENTRADA',1);
    INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data","mecanico") VALUES ('S',1,'20261025080000000',7),('S',2,'20261025090000000',99),('E',1,'20261025100000000',8);
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('S',1,'A','MATCH',0.1),('S',2,'B','OTHER',0.2),('E',1,'A','MATCH',99);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico") VALUES (10,'AA',8),(11,'BB',99);
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","mecanico","data_hora") VALUES (10,'A','NOT MATCHED BY DESCRIPTION',0.3,7,'20261025110000000'),(11,'A','MISSING ORDER MECHANIC',99,7,'20261025120000000')`);
  const parameters = { ParamDoArtigo: "A", ParamAoArtigo: "B", ParamDaData: "20261025000000", ParamAData: "20261025235959", ParamDescricao: "MATCH" };
  const variants = [
    ["RPT_Consumo_Material_Descriminado_Ordens", ["0.3"], "0.3"],
    // Source header join uses number alone: both number1 headers multiply the source exit line.
    ["RPT_Consumo_Material_Descriminado_Saidas", ["0.1", "0.1"], "0.2"],
    ["RPT_Consumo_Material_Descriminado_ordens_saidas", ["0.1", "0.1", "0.3"], "0.5"],
    ["RPT_Consumo_Material_Resumo_ordens", ["0.3"], null],
    ["RPT_Consumo_Material_Resumo_Saidas", ["0.1", "0.1"], null],
    ["RPT_Consumo_Material_Resumo_ordem_saidas", ["0.1", "0.1", "0.3"], null],
  ] as const;
  for (const [reportId, quantities, total] of variants) {
    const result = await document(reportId, { kind: "query", parameters });
    expect(controls(result.html, "ITEM_Quantidade"), reportId).toEqual(quantities);
    if (total !== null) expect(controls(result.html, "STC_total")).toEqual([total]);
    if (reportId === "RPT_Consumo_Material_Descriminado_Ordens") expect(controls(result.html, "ITEM_Descricao_me")).toEqual(["ORDER MECHANIC"]);
    if (reportId === "RPT_Consumo_Material_Resumo_ordem_saidas") {
      expect(controls(result.html, "ITEM_Soma")).toEqual(["0.5"]);
      expect(controls(result.html, "COUNTER")).toEqual(["1"]);
    }
  }
  // NULL omits the description condition for summary callers; no native LIKE/collation claim.
  const combined = await document("RPT_Consumo_Material_Resumo_ordem_saidas", { kind: "query", parameters: { ...parameters, ParamDescricao: null } });
  expect(controls(combined.html, "ITEM_Soma")).toEqual(["0.5", "0.2"]);
  expect(controls(combined.html, "COUNTER")).toEqual(["2"]);
  const plainStock = await document("RPT_Consumo_Material_Descriminado_Saidas", { kind: "query", parameters: { ...parameters, ParamDescricao: null } });
  expect(controls(plainStock.html, "ITEM_Descricao_me")).toEqual(["MATERIAL MECHANIC", "ORDER MECHANIC", ""]);
  expect(controls(plainStock.html, "STC_total")).toEqual(["0.4"]);
});

it("vehicle consumption uses the MATERIAL mechanic, material timestamp predicate and exact vehicle header assignments", async () => {
  await people();
  await database.query(`INSERT INTO app."artigos" ("Codigo","Descricao","unidade") VALUES ('A','MASTER A','UN');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","recepcao_datahora") VALUES (10,'AA',8,'19990101000000000'),(11,'BB',8,'20990101000000000');
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","mecanico","data_hora") VALUES (10,'A','SOURCE DESCRIPTION A',0.1,7,'20261025120000000'),(11,'A','SOURCE DESCRIPTION B',0.2,7,'20261025130000000'),(10,'A','OUTSIDE MATERIAL DATE',99,7,'20261024080000000')`);
  for (const reportId of ["RPT_Consumo_Material_Viatura_Descriminado", "RPT_Consumo_Material_Viatura_Resumo"] as const) {
    const result = await document(reportId, { kind: "query", parameters: { ParamDoArtigo: "A", ParamAoArtigo: "A", ParamDaData: "20261025000000", ParamAData: "20261025235959", ParamDaViatura: "AA", ParamAViatura: "BB" } });
    expect(controls(result.html, "STC_matricula")).toEqual(["AA", "BB"]);
    expect(controls(result.html, "STC_marca_modelo")).toEqual(["MARCA MODELO", "SEGUNDA VIATURA"]);
    expect(controls(result.html, "ITEM_Quantidade")).toEqual(["0.1", "0.2"]);
    expect(controls(result.html, "ITEM_Descricao_artigo")).toEqual(["SOURCE DESCRIPTION A", "SOURCE DESCRIPTION B"]);
    if (reportId.endsWith("Descriminado")) expect(controls(result.html, "ITEM_Descricao_me")).toEqual(["MATERIAL MECHANIC", "MATERIAL MECHANIC"]);
  }
});

it("all four labor families print row sentinel, source HH:mm carry and group reset without decimal-hours replacement", async () => {
  await people();
  await database.query(`INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_datahora") VALUES (10,'AA','20261025000000000'),(11,'AA','20261025010000000'),(12,'BB','20261025020000000');
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES
      (10,7,'20261025080000000','20261025094000000'),(10,7,'20261025100000000','20261025123500000'),
      (11,7,'20261025130000000','00000000000000000'),(12,8,'20261025080000000','20261025083000000'),
      (10,7,'20261024080000000','20261025093000000')`);
  const ranges = {
    RPT_Tempos_Ordem_Reparacao: { ParamDaOrdem: "10", ParamAOrdem: "12" },
    RPT_Tempos_Ordem_Reparacao_Mecanico: { ParamDoMecanico: "7", ParamAoMecanico: "8" },
    RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo: { ParamDoMecanico: "7", ParamAoMecanico: "8" },
    RPT_Tempos_Ordem_Reparacao_viatura: { ParamDaViatura: "AA", ParamAViatura: "BB" },
  };
  for (const [reportId, range] of Object.entries(ranges)) {
    const result = await document(reportId as FamilyReportRequest["reportId"], { kind: "query", parameters: { ...range, ParamDaData: "20261025000000", ParamAData: "20261025235959" } });
    expect(controls(result.html, reportId.endsWith("viatura") ? "ITEM_Tempo" : "ITEM_tempo"), reportId).toEqual(["01:40", "02:35", "00:00", "00:30"]);
    if (reportId === "RPT_Tempos_Ordem_Reparacao") {
      expect(controls(result.html, "STC_numero")).toEqual(["10", "11", "12"]);
      expect(controls(result.html, "STC_total_horas")).toEqual(["04:15", "00:00", "00:30"]);
    } else {
      expect(controls(result.html, "STC_total_horas1")).toEqual(["04:15", "00:30"]);
      if (!reportId.endsWith("Resumo")) expect(controls(result.html, "STC_total_horas")).toEqual(["04:15", "00:00", "00:30"]);
    }
  }
});

it("programmatic service/material reports use reception customer and preserve live material order and caller total text", async () => {
  await people();
  await database.query(`INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","recepcao_servico","recepcao_obs","recepacao_contatos") VALUES (10,'AA',2,'SOURCE SERVICE','SOURCE OBS','123\r\n456');
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade") VALUES (10,'DB','UNRELATED DATABASE MATERIAL',99)`);
  const service = await document("RPT_Servico_Avaria", { kind: "programmatic", orderNumber: "10" });
  expect(controls(service.html, "ITEM_Cliente")).toEqual(["RECEPTION CUSTOMER"]);
  expect(controls(service.html, "ITEM_marca_modelo")).toEqual(["MARCA  MODELO"]);
  expect(controls(service.html, "ITEM_Servico_Avaria")).toEqual(["SOURCE SERVICE"]);
  expect(controls(service.html, "ITEM_Observacao")).toEqual(["SOURCE OBS"]);
  const materials = await document("RPT_Materiais", { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: "10", formattedTotal: "€ 1,234567  ", rows: [
    { COL_cod_art: "Z", COL_desc_artigo: "LIVE SECOND", COL_quant: "0.2", COL_preco: "3.5", COL_lancado: "1" },
    { COL_cod_art: "A", COL_desc_artigo: "LIVE FIRST", COL_quant: "0.1", COL_preco: "99", COL_lancado: "0" },
  ] });
  expect(controls(materials.html, "ITEM_COL_cod_art")).toEqual(["Z", "A"]);
  expect(controls(materials.html, "STC_Total_material")).toEqual(["€ 1,234567  "]);
  expect(controls(materials.html, "STC_informacao")).toEqual(["Nrº Ordem Reparação: 10\r\nMatrícula: AA   MARCA/MODELO\r\nCliente: RECEPTION CUSTOMER"]);
  expect(materials.html).not.toContain("UNRELATED DATABASE MATERIAL");
  // The captured dossier binds the price-named control to launched; preserve that source anomaly.
  expect(controls(materials.html, "ITEM_COL_preco")).toEqual(["1", "0"]);
});

it("each of the26 other source report Open events assigns the actual company context into its generated offline PDF", async () => {
  for (const reportId of familyReportIds) {
    const source: FamilyReportRequest["source"] = reportId.startsWith("RPT_List_") ? { kind: "embedded-query" }
      : reportId === "RPT_inventario" ? { kind: "file" }
      : reportId === "RPT_Materiais" ? { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: "99999", formattedTotal: "CALLER TOTAL", rows: [] }
      : reportId === "RPT_Servico_Avaria" ? { kind: "programmatic", orderNumber: "99999" }
      : { kind: "query", parameters: reportId.startsWith("RPT_Consumo_") ? reportId.includes("Viatura")
        ? { ParamDaData: "20261025000000", ParamAData: "20261025235959", ParamDoArtigo: "A", ParamAoArtigo: "Z", ParamDaViatura: "AA", ParamAViatura: "ZZ" }
        : { ParamDoArtigo: "A", ParamAoArtigo: "Z", ParamDaData: "20261025000000", ParamAData: "20261025235959", ParamDescricao: null }
        : reportId.startsWith("RPT_Ordens_") ? { ParamDaData: "20261025", ParamAData: "20261025", ParamEstados: ["R"] }
        : { ParamDaData: "20261025000000", ParamAData: "20261025235959", ...(reportId.endsWith("viatura") ? { ParamDaViatura: "AA", ParamAViatura: "ZZ" } : reportId === "RPT_Tempos_Ordem_Reparacao" ? { ParamDaOrdem: "1", ParamAOrdem: "99" } : { ParamDoMecanico: "1", ParamAoMecanico: "99" }) } };
    const result = rendered(await renderReport(connect, renderer, { reportId, context, source }));
    expect(controls(result.html, "STC_Empresa"), reportId).toEqual([context.company]);
    expect(result.html).not.toContain("<script");
    expect(pdfText(result.pdfBase64).join("\n"), reportId).toContain("EMPRESA DOS EVENTOS");
    if (reportId.startsWith("RPT_List_")) expect(result.unresolved.some(item => item.startsWith("assumed:"))).toBe(true);
  }
}, 180_000);

it("actual delivery PDF spans source pages with repeated headers, page counters, exact sum and no lost last-row text", async () => {
  await people();
  await database.query(`INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_estado","recepcao_entrega_prevista","total_pago") SELECT n,'AA','R','20261025',0.1 FROM generate_series(1,120) n`);
  const result = rendered(await renderReport(connect, renderer, { reportId: "RPT_Ordens_Reparacao_DataEntrega", context, source: salesSource }));
  await writeFile("analysis-local/report-delivery-pagination.html", result.html);
  await writeFile("analysis-local/report-delivery-pagination.pdf", Buffer.from(result.pdfBase64, "base64"));
  const pages = pdfText(result.pdfBase64);
  expect(pages.length).toBeGreaterThan(1); expect(pages.length).toBe(result.pageCount);
  for (const [index, text] of pages.entries()) {
    expect(text).toContain("Número"); expect(text).toContain("Cliente"); expect(text).toContain(`${index + 1}/${pages.length}`);
  }
  expect(controls(result.html, "ITEM_Numero")).toHaveLength(120);
  expect(controls(result.html, "CALC_Total_pago")).toEqual(["12"]);
  expect(pages.at(-1)).toContain("Total:"); expect(pages.at(-1)).toContain("Golfinho Software, Lda");
}, 60_000);
