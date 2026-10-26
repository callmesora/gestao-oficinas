import type { Locator, Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { test, expect } from "./support/functional-list-print";
import type { ReportId, ReportRenderResult } from "../packages/domain/src/reports";

test.use({ viewport: { width: 1280, height: 900 } });

type ListCase = { acceptance: string; menu: string; screen: string; table: string; reportId: ReportId; title: string;
  databaseTable: string; valueColumn: string; values: [string, string]; publicColumns: Record<string, string[]> };
// Independent caller, caption and binding oracles from the eight committed screen/report specs.
// ADR005 owns embedded-query defaults; these checks do not resolve their retained legacy U items.
const cases: ListCase[] = [
  { acceptance: "FC-CORE-VEHICLES-PRINT", menu: "OPT_Viaturas", screen: "WIN_Table_Viaturas", table: "TABLE_Viaturas", reportId: "RPT_List_Viaturas", title: "Viaturas",
    databaseTable: "Viaturas", valueColumn: "modelo", values: ["VIATURA AÇÃO", "VIATURA SEGUNDA"], publicColumns: { ITEM_Matricula: ["AA-00-AA", "BB-00-BB"], ITEM_Cliente: ["101", "102"], ITEM_Marca: ["MARCA A", "MARCA B"], ITEM_Ano: ["2020", "2021"] } },
  { acceptance: "FC-CORE-UNITS-PRINT", menu: "OPT_Unidades", screen: "WIN_Table_unidades", table: "TABLE_unidades", reportId: "RPT_List_unidades", title: "Unidades",
    databaseTable: "unidades", valueColumn: "Descricao", values: ["UNIDADE AÇÃO", "UNIDADE SEGUNDA"], publicColumns: { ITEM_Codigo: ["UN", "LT"] } },
  { acceptance: "FC-CORE-DESCRIPTIVE-STATES-PRINT", menu: "OPT_Estados_descritivos", screen: "WIN_Table_estados_descritivos", table: "TABLE_estados_descritivos", reportId: "RPT_List_estados_descritivos", title: "Estados descritivos",
    databaseTable: "estados_descritivos", valueColumn: "Descricao", values: ["DESCRITIVO AÇÃO", "DESCRITIVO SEGUNDO"], publicColumns: { ITEM_Codigo: ["DA", "DB"] } },
  { acceptance: "FC-CORE-MECHANICS-PRINT", menu: "OPT_Mecânicos", screen: "WIN_Table_mecanicos", table: "TABLE_mecanicos", reportId: "RPT_List_mecanicos", title: "Mecânicos",
    databaseTable: "mecanicos", valueColumn: "Descricao", values: ["MECÂNICO AÇÃO", "MECÂNICO SEGUNDO"], publicColumns: { ITEM_Codigo: ["7", "8"] } },
  { acceptance: "FC-CORE-REPAIR-STATES-PRINT", menu: "OPT_Estados_de_Reparação", screen: "WIN_Table_estados_reparacao", table: "TABLE_estados_reparacao", reportId: "RPT_List_estados_reparacao", title: "Estados de reparação",
    databaseTable: "estados_reparacao", valueColumn: "Descricao", values: ["REPARAÇÃO AÇÃO", "REPARAÇÃO SEGUNDA"], publicColumns: { ITEM_Codigo: ["R", "S"], ITEM_Tipo: ["3", "4"] } },
  { acceptance: "FC-CORE-DOCUMENT-TYPES-PRINT", menu: "OPT_Documentos", screen: "WIN_Table_documentos", table: "TABLE_documentos", reportId: "RPT_List_documentos", title: "Documentos",
    databaseTable: "documentos", valueColumn: "Descricao", values: ["DOCUMENTO AÇÃO", "DOCUMENTO SEGUNDO"], publicColumns: { ITEM_Codigo: ["E", "S"] } },
  { acceptance: "FC-CORE-ARTICLES-PRINT", menu: "OPT_Artigos", screen: "WIN_Table_artigos", table: "TABLE_artigos", reportId: "RPT_List_artigos", title: "Artigos",
    databaseTable: "artigos", valueColumn: "Descricao", values: ["ARTIGO AÇÃO", "ARTIGO SEGUNDO"], publicColumns: { ITEM_Codigo: ["A", "B"], ITEM_Codbarras: ["BAR-A", "BAR-B"], ITEM_Unidade: ["UN", "LT"], ITEM_Preco: ["99.99", "88.88"], INT_Inativo: ["false", "true"] } },
  { acceptance: "FC-CORE-USERS-PRINT", menu: "OPT_Utilizadores", screen: "WIN_Table_utilizadores", table: "TABLE_utilizadores", reportId: "RPT_List_utilizadores", title: "Utilizadores",
    databaseTable: "utilizadores", valueColumn: "Descricao", values: ["UTILIZADOR AÇÃO", "UTILIZADOR SEGUNDO"], publicColumns: { ITEM_Codigo: ["71", "72"] } },
];

async function printAndDownload(page: Page, screen: Locator, item: ListCase, values: string[], count: number) {
  const pending = page.waitForResponse(response => response.url().endsWith("/api/reports/render") && response.request().method() === "POST");
  await screen.getByTestId("BTN_Imprimir").click();
  const response = await pending;
  expect(response.status()).toBe(200);
  expect(response.request().postDataJSON()).toMatchObject({ reportId: item.reportId, source: { kind: "embedded-query" } });
  const result = await response.json() as ReportRenderResult;
  expect(result.kind, JSON.stringify(result).slice(0, 300)).toBe("rendered");
  if (result.kind !== "rendered") throw new Error(`${item.reportId}: ${result.kind}`);
  expect(result.reportId).toBe(item.reportId); expect(result.pageCount).toBe(1);
  const preview = page.locator("dialog.report-preview"); await expect(preview).toBeVisible();
  await expect(preview.locator("iframe")).toHaveAttribute("title", item.reportId);
  await expect(preview.locator("iframe")).toHaveAttribute("sandbox", "");
  const frame = preview.frameLocator("iframe");
  await expect(frame.locator('[data-control="DOCTITLE"]')).toHaveText(item.title);
  await expect(frame.locator('[data-control="STC_Empresa"]')).toHaveText("OFICINA TESTE LISTAS");
  await expect(frame.locator('[data-control="COUNTER"]')).toHaveText(String(count));
  const detail = frame.locator(`[data-control="${item.valueColumn === "modelo" ? "ITEM_Modelo" : "ITEM_Descricao"}"]`);
  await expect(detail).toHaveCount(count);
  expect(new Set(await detail.allTextContents())).toEqual(new Set(values));
  for (const value of values) await expect(frame.getByText(value, { exact: true })).toBeVisible();
  if (count === 2 && values[0] === item.values[0]) for (const [control, expected] of Object.entries(item.publicColumns)) {
    expect(new Set(await frame.locator(`[data-control="${control}"]`).allTextContents())).toEqual(new Set(expected));
  }
  const downloaded = page.waitForEvent("download"); await preview.getByRole("link", { name: "PDF", exact: true }).click();
  const download = await downloaded; expect(download.suggestedFilename()).toBe(`${item.reportId}.pdf`);
  const path = await download.path(); expect(path).not.toBeNull();
  const bytes = await readFile(path!); expect(bytes).toEqual(Buffer.from(result.pdfBase64, "base64"));
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  // Parse the actual downloaded file independently of the report HTML/template factories.
  const pdf = JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c",
    "import sys,io,json;from pypdf import PdfReader;r=PdfReader(io.BytesIO(sys.stdin.buffer.read()));print(json.dumps([{'text':p.extract_text(),'width':float(p.mediabox.width),'height':float(p.mediabox.height)} for p in r.pages]))"],
  { input: bytes, encoding: "utf8" })) as { text: string; width: number; height: number }[];
  expect(pdf).toHaveLength(1);
  expect(Math.abs(pdf[0].width * 25.4 / 72 - 210)).toBeLessThan(0.5); expect(Math.abs(pdf[0].height * 25.4 / 72 - 297)).toBeLessThan(0.5);
  const text = pdf.map(value => value.text).join("\n");
  for (const expected of [item.title, "OFICINA TESTE LISTAS", "Número de linhas:", "Golfinho Software, Lda", ...values]) expect(text).toContain(expected);
  expect(text).toMatch(new RegExp(`Número de linhas:\\s*${count}(?:\\s|$)`));
  if (item.reportId === "RPT_List_artigos" && count) { expect(text).toContain("99.99"); expect(text).toContain("88.88"); }
  expect(text).not.toContain("never-print-"); expect(result.html).not.toContain("never-print-");
  for (const initial of item.values) if (!values.includes(initial)) expect(text).not.toContain(initial);
  await preview.getByRole("button", { name: "Fechar", exact: true }).click(); await expect(preview).toHaveCount(0);
  await expect(screen.getByTestId("BTN_Imprimir")).toBeEnabled();
}

for (const item of cases) test(`${item.acceptance} real menu list Print previews and downloads current, refreshed and empty PostgreSQL PDFs`, async ({ page, listPrintServer, listPrintDatabase }) => {
  test.setTimeout(90_000);
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${listPrintServer.origin}/?workflow=menu`);
  await page.getByTestId("startup-development-open").click();
  const menu = page.getByTestId("WIN_MENU"); await expect(menu).toBeVisible(); await menu.getByText("Tabelas", { exact: true }).click();
  await menu.getByTestId(item.menu).click();
  const screen = page.getByTestId(item.screen), table = screen.getByTestId(item.table);
  await expect(table).toBeVisible(); await expect(table).toContainText(item.values[0]);
  if (item.databaseTable === "artigos") await expect(table).not.toContainText(item.values[1]); // The report's embedded query includes the inactive article.
  const before = await listPrintDatabase.query(`SELECT to_jsonb(s) AS row FROM app."${item.databaseTable}" s ORDER BY _row_id`);
  await printAndDownload(page, screen, item, item.values, 2);
  expect((await listPrintDatabase.query(`SELECT to_jsonb(s) AS row FROM app."${item.databaseTable}" s ORDER BY _row_id`)).rows).toEqual(before.rows);
  // The next Print must run its own query, even though the management list still has the prior rows.
  const changed = item.values[0].replace(/AÇÃO$/, "NOVA");
  await listPrintDatabase.query(`UPDATE app."${item.databaseTable}" SET "${item.valueColumn}"=$1 WHERE "${item.valueColumn}"=$2`, [changed, item.values[0]]);
  await expect(table).toContainText(item.values[0]); await expect(table).not.toContainText(changed);
  await printAndDownload(page, screen, item, [changed, item.values[1]], 2);
  await listPrintDatabase.query(`DELETE FROM app."${item.databaseTable}"`);
  await printAndDownload(page, screen, item, [], 0);
  expect(errors).toEqual([]);
});
