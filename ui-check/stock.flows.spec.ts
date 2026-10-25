import { expect, test, type APIRequestContext } from "@playwright/test";

import type { Article } from "../packages/domain/src/articles";
import type { DocumentType } from "../packages/domain/src/document-types";
import type { Unit } from "../packages/domain/src/units";
import type { Terminal } from "../packages/domain/src/terminals";
import type { Posto } from "../packages/domain/src/postos";
import type { StockHeader, StockLine, StockListRow, StockArticle } from "../packages/domain/src/stock";
// Public projections consumed by these authenticated test helpers; each caller asserts its kind.
interface ApiResult { kind: string; documentTypes: DocumentType[]; documentType: DocumentType; unit: Unit; units: Unit[]; article: Article; articles: StockArticle[]; rows: StockListRow[]; lines: StockLine[]; header: StockHeader; terminals: Terminal[]; terminal: Terminal; postos: Posto[]; posto: Posto }
type Api = (resource: string, operation: string, data: unknown) => Promise<ApiResult>;
async function apiFor(request: APIRequestContext): Promise<Api> {
  const session = await request.post("/api/development/session", { headers: { Origin: process.env.STOCK_BROWSER_ORIGIN ?? "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(session.ok()).toBe(true); const { token } = await session.json();
  return async (resource, operation, data) => { const response = await request.post(`/api/${resource}/${operation}`, { headers: { Authorization: `Bearer ${token}` }, data }); expect(response.ok()).toBe(true); return response.json(); };
}
async function fixtures(api: Api) {
  const docs = await api("document-types", "list", {}), used = new Set(docs.documentTypes.map(r => r.Codigo));
  const code = Array.from({ length: 1296 }, (_, i) => "S" + i.toString(36).padStart(2, "0")).find(c => !used.has(c))!;
  const units = await api("units", "list", {}), unitUsed = new Set(units.units.map(r => r.Codigo));
  const unitCode = Array.from({ length: 1296 }, (_, i) => "Q" + i.toString(36).padStart(2, "0")).find(c => !unitUsed.has(c))!;
  const unit = await api("units", "save", { mode: "create", values: { Codigo: unitCode, Descricao: "Synthetic stock unit" } }); expect(unit.kind).toBe("saved");
  const document = await api("document-types", "save", { mode: "create", values: { Codigo: code, Descricao: "Synthetic stock document", stock: 1, obriga_macanico: false } }); expect(document.kind).toBe("saved");
  const articleCode = `stock-${code}-${Date.now()}`, article = await api("articles", "save", { mode: "create", values: { Codigo: articleCode, Descricao: "Synthetic stock article", codbarras: articleCode, unidade: unitCode, preco: "3.25", inativo: false } }); expect(article.kind).toBe("saved");
  return { code, document, unit, article, articleCode, async cleanup() {
    const list = await api("stock", "list", { document: code });
    if (list.kind === "loaded") for (const row of list.rows) await api("stock", "delete", { id: row.id });
    await api("articles", "delete", { id: article.article.id }); await api("document-types", "delete", { id: document.documentType.id }); await api("units", "delete", { id: unit.unit.id });
  } };
}

test("MIG11 actual stock list/document supports atomic creation, editable lines, reload, replacement and source delete sign", async ({ page, request }) => {
  const api = await apiFor(request), fixture = await fixtures(api), errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  try {
    await page.goto("/?workflow=stock"); await page.getByTestId("stock-open").click(); const list = page.getByTestId("workspace-window-1-frame"), form = page.getByTestId("WIN_Table_Lin_Stocks");
    await expect(list.getByTestId("BTN_novo")).toBeEnabled(); await list.getByTestId("BTN_novo").click(); await form.getByTestId("COMBO_tipo_doc").selectOption(fixture.code); await expect(form.getByTestId("EDT_Numero")).toHaveValue("1");
    await expect(form.getByTestId("COMBO_mecanico")).toBeHidden(); await form.getByTestId("EDT_codigo").fill(fixture.articleCode); await form.getByTestId("EDT_quant").focus(); await expect(form.getByTestId("EDT_descricao_Artigo")).toHaveValue("Synthetic stock article");
    await form.getByTestId("EDT_quant").fill("2,500"); await form.getByTestId("BTN_Adicionar").click(); await expect(form.getByTestId("TABLE_lin_Stocks").getByRole("cell", { name: fixture.articleCode, exact: true })).toBeVisible();
    await form.getByTestId("COL_Quant-0").fill("3,125"); await form.getByTestId("BTN_Confirmar").click(); await expect(form).toHaveCount(0);
    let rows = await api("stock", "list", { document: fixture.code }); expect(rows.rows).toHaveLength(1); const createdId = rows.rows[0].id;
    let read = await api("stock", "read", { id: createdId }); expect(read.lines[0].quantidade).toBe("3.125");
    await list.getByTestId("COMBO_tipo_doc").selectOption(fixture.code); await expect(list.getByTestId("TABLE_cab_stocks").getByRole("row")).toHaveCount(2);
    await list.getByTestId("TABLE_cab_stocks").getByRole("row").nth(1).dblclick(); await expect(form.getByTestId("COMBO_tipo_doc")).toBeDisabled(); await expect(form.getByTestId("EDT_Data")).toBeDisabled();
    await form.getByTestId("COL_Quant-0").fill("4,500"); await form.getByTestId("EDT_descricao").fill("Updated stock document"); await form.getByTestId("BTN_Confirmar").click(); await expect(form).toHaveCount(0);
    read = await api("stock", "read", { id: createdId }); expect(read.lines[0].quantidade).toBe("4.500"); expect(read.header.Descricao).toBe("Updated stock document");
    await page.reload(); await page.getByTestId("stock-open").click(); await list.getByTestId("COMBO_tipo_doc").selectOption(fixture.code); const row = list.getByTestId("TABLE_cab_stocks").getByRole("row").nth(1); await expect(row).toContainText("Updated stock document"); await row.click();
    await list.getByTestId("BTN_Eliminar").click(); const confirm = page.getByTestId("WINDEVMESSAGEBOX"); await expect(confirm.getByTestId("BTN_NON")).toBeFocused(); await confirm.getByTestId("BTN_OUI").click(); await expect(row).toHaveCount(0);
    rows = await api("stock", "inventory", {}); expect(rows.articles.find((a: { id: string }) => a.id === fixture.article.article.id)?.stock).toBe("9.000"); expect(errors).toEqual([]);
  } finally { await fixture.cleanup(); }
});

test("MIG11 actual inventory decline continues and reconstruction screen completes against the real API", async ({ page, request }) => {
  const api = await apiFor(request), fixture = await fixtures(api);
  try {
    await page.goto("/?workflow=inventory"); await page.getByTestId("inventory-open").click(); const prompt = page.getByTestId("WIN_Inventario_Reconstrucao"); await expect(prompt.getByTestId("STC_reconstrucao_stocks")).toContainText("Pretende fazê-lo agora?"); await prompt.getByTestId("BTN_Reconstruir1").click();
    const inventory = page.getByTestId("WIN_Inventario"); await expect(inventory.getByTestId("TABLE_Artigos").getByRole("cell", { name: fixture.articleCode, exact: true })).toBeVisible(); await inventory.getByTestId("BTN_Sair").click(); await expect(inventory).toHaveCount(0);
    await page.goto("/?workflow=stock-rebuild"); await page.getByTestId("stock-rebuild-open").click(); await page.getByTestId("WIN_Reconstrucao_Stocks").getByTestId("BTN_Reconstruir").click(); await expect(page.getByTestId("LIB_INFO")).toHaveText("Reconstrução terminada"); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await expect(page.getByTestId("WIN_Reconstrucao_Stocks")).toHaveCount(0);
    await page.goto("/?workflow=stock-statement"); await page.getByTestId("stock-statement-open").click(); const statement = page.getByTestId("WIN_Extrato_Artigos"); await expect(statement.getByTestId("EDT_Ao_artigo")).toHaveValue("zzzzzzzzzz"); await expect(statement.getByTestId("EDT_Da_data")).not.toHaveValue(""); await page.keyboard.press("Escape"); await expect(statement).toHaveCount(0);
  } finally { await fixture.cleanup(); }
});

test("MIG11 actual selected UTF8 scanner file reaches known/unknown original screens through real terminal config", async ({ page, request }) => {
  const api = await apiFor(request), fixture = await fixtures(api);
  const terminals = await api("terminals", "list", {}), used = new Set(terminals.terminals.map(r => r.Codigo)), terminalCode = Array.from({ length: 1296 }, (_, i) => "B" + i.toString(36).padStart(2, "0")).find(c => !used.has(c))!;
  const terminal = await api("terminals", "save", { mode: "create", values: { Codigo: terminalCode, Descricao: "Synthetic stock scanner", codbarras_inicio: 1, codbarras_fim: 30, quant_inicio: 31, quant_fim: 4, pasta_localizacao: "", nome_ficheiro: "scanner.txt" } }); expect(terminal.kind).toBe("saved");
  const posts = await api("postos", "list", {}), original = posts.postos.find(r => r.Codigo === 1);
  const posto = await api("postos", "save", { mode: original ? "update" : "create", ...(original ? { id: original.id } : {}), values: { Codigo: 1, Descricao: "Synthetic stock scanner workstation", terminal: terminalCode } }); expect(posto.kind).toBe("saved");
  try {
    const content = `${fixture.articleCode.padEnd(30, " ")}2.25\r\n${"unknown".padEnd(30, " ")}1.00\r\n\r\n${"ignored".padEnd(30, " ")}9.00`;
    await page.goto("/?workflow=stock-scanner"); await page.getByTestId("stock-scanner-file").setInputFiles({ name: "scanner.txt", mimeType: "text/plain", buffer: Buffer.from(content) });
    const scanner = page.getByTestId("WIN_Leitor_cod_barras"); await expect(scanner.getByTestId("TABLE_Leitura").getByRole("row")).toHaveCount(3); await scanner.getByTestId("BTN_Confirmar").click();
    const unknown = page.getByTestId("WIN_Leitor_cod_barras_desconhecidos"); await expect(unknown.getByTestId("TABLE_Leitura").getByRole("cell", { name: "unknown", exact: true })).toBeVisible(); await unknown.getByTestId("BTN_Confirmar").click();
    await expect(page.getByTestId("stock-scanner-returned")).toContainText(`"code":"${fixture.articleCode}"`); await expect(page.getByTestId("stock-scanner-returned")).not.toContainText("ignored");
  } finally {
    if (original) await api("postos", "save", { mode: "update", id: original.id, values: { Codigo: original.Codigo, Descricao: original.Descricao, terminal: original.terminal } }); else await api("postos", "delete", { id: posto.posto.id });
    await api("terminals", "delete", { id: terminal.terminal.id }); await fixture.cleanup();
  }
});
