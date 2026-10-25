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
    await expect(list.getByTestId("TABLE_cab_stocks").getByRole("cell", { name: "Synthetic stock document", exact: true })).toBeVisible();
    let rows = await api("stock", "list", { document: fixture.code }); expect(rows.rows).toHaveLength(1); const createdId = rows.rows[0].id;
    let read = await api("stock", "read", { id: createdId }); expect(read.lines[0].quantidade).toBe("3.125");
    await list.getByTestId("COMBO_tipo_doc").selectOption(fixture.code); await expect(list.getByTestId("TABLE_cab_stocks").getByRole("row")).toHaveCount(2);
    await list.getByTestId("TABLE_cab_stocks").getByRole("row").nth(1).dblclick(); await expect(form.getByTestId("COMBO_tipo_doc")).toBeDisabled(); await expect(form.getByTestId("EDT_Data")).toBeDisabled();
    await form.getByTestId("COL_Quant-0").fill("4,500"); await form.getByTestId("EDT_descricao").fill("Updated stock document"); await form.getByTestId("BTN_Confirmar").click(); await expect(form).toHaveCount(0);
    read = await api("stock", "read", { id: createdId }); expect(read.lines[0].quantidade).toBe("4.500"); expect(read.header.Descricao).toBe("Updated stock document");
    await expect(list.getByTestId("TABLE_cab_stocks").getByRole("cell", { name: "Updated stock document", exact: true })).toBeVisible();
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

test("stock source filter events preserve inclusive number defaults, literal document-description alias and the date-event no-date predicate", async ({ page, request }) => {
  const api = await apiFor(request), fixture = await fixtures(api), other = await fixtures(api);
  try {
    expect((await api("stock", "save", { mode: "create", document: other.code, number: "1", date: "20261025", description: "Other type header", mechanic: null, lines: [{ linha: "1", artigo: other.articleCode, descricao_artigo: "Other article", quantidade: "1", preco: "3.25" }] })).kind).toBe("saved");
    for (const number of ["1", "2", "10"]) expect((await api("stock", "save", { mode: "create", document: fixture.code, number, date: number === "1" ? "20200101" : "20261025", description: `Header ${number}`, mechanic: null, lines: [{ linha: "1", artigo: fixture.articleCode, descricao_artigo: "Synthetic stock article", quantidade: "1", preco: "3.25" }] })).kind).toBe("saved");
    await page.goto("/?workflow=stock"); await page.getByTestId("stock-open").click(); const list = page.getByTestId("WIN_Table_cab_stocks"), table = list.getByTestId("TABLE_cab_stocks");
    await list.getByTestId("COMBO_tipo_doc").selectOption(fixture.code); await expect(table.locator("tbody tr")).toHaveCount(3);
    await list.getByTestId("EDT_Do_n").fill("2"); await list.getByTestId("EDT_Ao_n").fill("10"); await expect(table.locator("tbody tr")).toHaveCount(2);
    await expect(table).toContainText("Header 2"); await expect(table).toContainText("Header 10");
    await list.getByTestId("EDT_Ao_n").fill("2"); await expect(table.locator("tbody tr")).toHaveCount(1); await expect(table).toContainText("Header 2");
    await list.getByTestId("EDT_Ao_n").fill("10"); await expect(table.locator("tbody tr")).toHaveCount(2);
    await list.getByTestId("EDT_Do_n").fill("0"); await expect(list.getByTestId("EDT_Do_n")).toHaveValue("1"); await list.getByTestId("EDT_Ao_n").fill("0"); await expect(list.getByTestId("EDT_Ao_n")).toHaveValue("9999999999");
    await list.getByTestId("EDT_descricao").fill("Header 1"); await expect(table.locator("tbody tr")).toHaveCount(0);
    await list.getByTestId("EDT_descricao").fill("Synthetic stock document"); await expect(table.locator("tbody tr")).toHaveCount(3);
    await list.getByTestId("EDT_Da_data").fill("01/01/2030"); await list.getByTestId("EDT_a_data").fill("02/01/2030"); await expect(table.locator("tbody tr")).toHaveCount(3);
    await list.getByTestId("BTN_VISION").click(); const picker = page.getByTestId("WIN_Table_documentos"); await picker.getByRole("cell", { name: fixture.code, exact: true }).click(); await picker.getByTestId("BTN_selecionar").click();
    await expect(list.getByTestId("COMBO_tipo_doc")).toHaveValue(fixture.code); await expect(table.locator("tbody tr")).toHaveCount(3);
    await table.getByRole("cell", { name: "Header 2", exact: true }).click(); await list.getByTestId("BTN_alterar").click();
    const form = page.getByTestId("WIN_Table_Lin_Stocks"); await expect(form.getByTestId("EDT_Numero")).toHaveValue("2"); await expect(form.getByTestId("EDT_descricao")).toHaveValue("Header 2");
    await form.getByTestId("BTN_Cancelar").click(); await page.getByTestId("WINDEVDIALOGBOX").getByRole("button", { name: "Sim", exact: true }).click(); await expect(form).toHaveCount(0);
  } finally { await fixture.cleanup(); await other.cleanup(); }
});

test("stock actual line handlers retain empty refusal, lookup focus, decimal header sort/search, bounded line IDs and both delete/cancel results", async ({ page, request }) => {
  const api = await apiFor(request), fixture = await fixtures(api);
  try {
    await page.goto("/?workflow=stock"); await page.getByTestId("stock-open").click(); const list = page.getByTestId("WIN_Table_cab_stocks");
    await expect(list.getByTestId("BTN_novo")).toBeEnabled(); await list.getByTestId("BTN_novo").click(); const form = page.getByTestId("WIN_Table_Lin_Stocks"), table = form.getByTestId("TABLE_lin_Stocks");
    await form.getByTestId("COMBO_tipo_doc").selectOption(fixture.code); await expect(form.getByTestId("EDT_Numero")).toHaveValue("1");
    await form.getByTestId("BTN_Confirmar").click(); await expect(page.getByTestId("LIB_INFO")).toHaveText("Documento sem linhas"); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await expect(form).toBeVisible();
    await form.getByTestId("EDT_codigo").fill("missing-stock-article"); await form.getByTestId("EDT_quant").focus(); await expect(page.getByTestId("LIB_INFO")).toHaveText("Artigo não existente"); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
    await expect(form.getByTestId("EDT_codigo")).toHaveValue(""); await expect(form.getByTestId("EDT_codigo")).toBeFocused(); await expect(form.getByTestId("EDT_preco")).toHaveValue("0,00");
    for (const amount of ["2,500", "10,000"]) {
      await form.getByTestId("EDT_codigo").fill(fixture.articleCode); await form.getByTestId("EDT_quant").focus(); await expect(form.getByTestId("EDT_descricao_Artigo")).toHaveValue("Synthetic stock article");
      await form.getByTestId("EDT_quant").fill(amount); await form.getByTestId("EDT_descricao").focus(); await expect(form.getByTestId("EDT_preco")).toBeFocused();
      await form.getByTestId("BTN_Adicionar").click(); await expect(form.getByTestId("EDT_codigo")).toHaveValue(""); await expect(form.getByTestId("EDT_codigo")).toBeFocused(); await expect(form.getByTestId("EDT_quant")).toHaveValue("1,000"); await expect(form.getByTestId("EDT_preco")).toHaveValue("0,00");
    }
    await expect(table.locator("tbody tr")).toHaveCount(2);
    await table.getByTestId("COL_Quant").locator(".wd-searchable-caption").click(); await expect(table.locator("tbody tr").first().getByTestId("COL_Quant-0")).toHaveValue("2,500");
    await table.getByTestId("COL_Quant").locator(".wd-searchable-caption").click(); await expect(table.locator("tbody tr").first().getByTestId("COL_Quant-1")).toHaveValue("10,000");
    await table.getByTestId("COL_Quant__search").click(); await table.getByRole("textbox", { name: /Pesquisar/ }).fill("10"); await page.keyboard.press("Enter"); await expect(table.locator('tbody tr[aria-selected="true"]').getByTestId("COL_Quant-1")).toHaveValue("10,000");
    await form.getByTestId("BTN_Adicionar1").click(); let confirm = page.getByTestId("WINDEVDIALOGBOX"); await expect(confirm.getByTestId("LIB_INFO")).toHaveText("Confirma a eliminação da linha?"); await confirm.getByRole("button", { name: "Não", exact: true }).click(); await expect(table.locator("tbody tr")).toHaveCount(2);
    await form.getByTestId("BTN_Adicionar1").click(); confirm = page.getByTestId("WINDEVDIALOGBOX"); await confirm.getByRole("button", { name: "Sim", exact: true }).click(); await expect(table.locator("tbody tr")).toHaveCount(1);
    await form.getByTestId("BTN_Cancelar").click(); confirm = page.getByTestId("WINDEVDIALOGBOX"); await expect(confirm.getByTestId("LIB_INFO")).toHaveText("Confirma o cancelamento das alterações?"); await confirm.getByRole("button", { name: "Não", exact: true }).click(); await expect(form).toBeVisible();
    await form.getByTestId("BTN_Cancelar").click(); await page.getByTestId("WINDEVDIALOGBOX").getByRole("button", { name: "Sim", exact: true }).click(); await expect(form).toHaveCount(0);
    expect((await api("stock", "list", { document: fixture.code })).rows).toHaveLength(0);
    await list.getByTestId("BTN_novo").click(); await form.getByTestId("COMBO_tipo_doc").selectOption(fixture.code); await expect(form.getByTestId("EDT_Numero")).toHaveValue("1");
    for (const amount of ["2,500", "10,000"]) {
      await form.getByTestId("EDT_codigo").fill(fixture.articleCode); await form.getByTestId("EDT_quant").focus(); await expect(form.getByTestId("EDT_descricao_Artigo")).toHaveValue("Synthetic stock article");
      await form.getByTestId("EDT_quant").fill(amount); await form.getByTestId("BTN_Adicionar").click();
    }
    await form.getByTestId("BTN_Confirmar").click(); await expect(form).toHaveCount(0);
    const rows = await api("stock", "list", { document: fixture.code }); expect(rows.rows).toHaveLength(1);
    const saved = await api("stock", "read", { id: rows.rows[0].id }); expect(saved.lines.map(row => [row.linha, row.quantidade])).toEqual([["1", "2.500"], ["2", "10.000"]]);
  } finally { await fixture.cleanup(); }
});

test("stock statement actual article pickers hand returned bounds back in source order and initial dates use the workstation day", async ({ page, request }) => {
  const api = await apiFor(request), fixture = await fixtures(api);
  try {
    await page.goto("/?workflow=stock-statement"); await page.getByTestId("stock-statement-open").click(); const statement = page.getByTestId("WIN_Extrato_Artigos"), now = new Date();
    const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    await expect(statement.getByTestId("EDT_Da_data")).toHaveValue(date); await expect(statement.getByTestId("EDT_a_data")).toHaveValue(date); await expect(statement.getByTestId("EDT_Ao_artigo")).toHaveValue("zzzzzzzzzz");
    for (const button of ["BTN_VISION4", "BTN_VISION3"]) {
      await statement.getByTestId(button).click(); const picker = page.getByTestId("WIN_Table_artigos");
      const row = picker.getByTestId("TABLE_artigos").locator("tbody tr").filter({ has: page.getByRole("cell", { name: fixture.articleCode, exact: true }) });
      await expect(row).toHaveCount(1); await row.click(); await picker.getByTestId("BTN_selecionar").click();
      await expect(statement.getByTestId("EDT_Ao_artigo")).toHaveValue(fixture.articleCode);
    }
    await expect(statement.getByTestId("EDT_Do_artigo")).toHaveValue(fixture.articleCode);
    for (const button of ["BTN_VISION4", "BTN_VISION3"]) {
      await statement.getByTestId(button).click(); await page.getByTestId("WIN_Table_artigos").getByTestId("BTN_Fechar").click();
      await expect(statement.getByTestId("EDT_Do_artigo")).toHaveValue(fixture.articleCode); await expect(statement.getByTestId("EDT_Ao_artigo")).toHaveValue(fixture.articleCode);
    }
  } finally { await fixture.cleanup(); }
});
