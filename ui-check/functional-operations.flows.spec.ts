import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import type { Client } from "pg";
import type { Page, Locator } from "@playwright/test";
import type { ReportRenderResult, ReportRequest } from "../packages/domain/src/reports";
import { test, expect } from "./support/functional-operations";

test.use({ viewport: { width: 1440, height: 1000 } });

// Functional target acceptance (ADR007); these real callers do not resolve retained native/source U items.
const response = (page: Page, resource: string, action: string) => page.waitForResponse(r => r.request().method() === "POST" && r.url().endsWith(`/api/${resource}/${action}`));
async function snapshot(database: Client) {
  const result: Record<string, unknown> = {};
  for (const table of ["cab_stocks", "lin_stocks", "artigos"]) result[table] = (await database.query(`SELECT to_jsonb(t) AS row FROM app."${table}" t ORDER BY _row_id`)).rows;
  return result;
}
async function stockSeed(database: Client) {
  await database.query(`INSERT INTO app."unidades" ("Codigo","Descricao") VALUES ('UN','Unidade');
    INSERT INTO app."documentos" ("Codigo","Descricao","stock","obriga_macanico") VALUES ('E','Entrada funcional',1,false);
    INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","unidade","preco","stock","inativo") VALUES ('BASE','Artigo base','BASE','UN',3.25,10,false)`);
}
async function stockList(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=stock`); await page.getByTestId("stock-open").click();
  const list = page.getByTestId("WIN_Table_cab_stocks"); await expect(list.getByTestId("BTN_novo")).toBeEnabled(); return list;
}
async function inventorySeed(database: Client) {
  await database.query(`INSERT INTO app."artigos" ("Codigo","Descricao","preco","stock","inativo") VALUES
    ('A-NEG','Stock negativo',1,-2.5,false),('B-TEN','Stock dez',2,10,false),
    ('C-NULL','Stock nulo',NULL,NULL,false),('D-FRAC','Stock fracionário',3,0.125,false)`);
}
async function inventory(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=inventory`); await page.getByTestId("inventory-open").click();
  await page.getByTestId("WIN_Inventario_Reconstrucao").getByTestId("BTN_Reconstruir1").click();
  const screen = page.getByTestId("WIN_Inventario"); await expect(screen.getByTestId("TABLE_Artigos").locator("tbody tr")).toHaveCount(4); return screen;
}
async function realPdf(page: Page, screen: Locator, button: string, reportId: string) {
  const rendered = response(page, "reports", "render"); await screen.getByTestId(button).click();
  const reply = await rendered; expect(reply.ok()).toBe(true);
  const result = await reply.json() as ReportRenderResult;
  expect(result.kind).toBe("rendered"); if (result.kind !== "rendered") throw new Error(result.kind);
  expect(result.reportId).toBe(reportId);
  const preview = page.locator("dialog.report-preview"); await expect(preview).toBeVisible();
  await expect(preview.locator("iframe")).toHaveAttribute("title", reportId);
  const download = page.waitForEvent("download"); await preview.getByRole("link", { name: "PDF", exact: true }).click();
  const pdf = await download; expect(pdf.suggestedFilename()).toBe(`${reportId}.pdf`);
  const bytes = await readFile((await pdf.path())!); expect(bytes).toEqual(Buffer.from(result.pdfBase64, "base64"));
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  const text: string = JSON.parse(execFileSync(process.env.PYTHON ?? "python3", ["-c", "import sys,io,json;from pypdf import PdfReader;print(json.dumps('\\n'.join(p.extract_text() for p in PdfReader(io.BytesIO(sys.stdin.buffer.read())).pages)))"], { input: bytes, encoding: "utf8" }));
  return { result, text, request: reply.request().postDataJSON() as ReportRequest, preview };
}

test("FUNC-OPS-ORD-14 existing priorities 2 and 3 restore visibly and survive unrelated saved edits plus reload", async ({ page, operations }) => {
  const { database, origin } = operations;
  await database.query(`INSERT INTO app."sistema" ("Data_inicio","Tempo_ordem_reparacao") VALUES (65535,60);
    INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'CLIENTE PRIORIDADE');
    INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo","Ano","mes") VALUES ('AA-00-AA',1,'MARCA','MODELO',2024,1);
    INSERT INTO app."utilizadores" ("Codigo","Descricao","palavra_passe") VALUES (1,'RECEPÇÃO','SYNTHETIC');
    INSERT INTO app."mecanicos" ("Codigo","Descricao","inativo") VALUES (2,'MECÂNICO',false);
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo","pedir_data_entrega","pedir_data_pag") VALUES ('R','Em reparação',1,false,false);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","km_viatura","recepcao_util","recepcao_cliente","recepcao_datahora","recepcao_entrega_prevista","recepcao_prioridade","reparacao_mecanico","reparacao_estado","recepcao_servico","recepcao_obs","total_pago") VALUES
    (12,'AA-00-AA',100,1,1,'20261025120000000','20261027',2,2,'R','Serviço elevado','Original',0),
    (13,'AA-00-AA',200,1,1,'20261025120000000','20261027',3,2,'R','Serviço urgente','Original',0)`);
  const open = async () => {
    await page.goto(`${origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
    const list = page.getByTestId("WIN_Ordens_Reparacao"); await expect(list.getByTestId("repair-order-read-state")).toHaveText("ready");
    await list.getByTestId("BTN_Nenhum").click(); const read = response(page, "repair-orders", "list"); await list.getByTestId("BTN_Actualizar_Dados").click(); await read;
    await expect(list.getByTestId("TABLE_QRY_select_ordens_reparacao").locator("tbody tr")).toHaveCount(2); return list;
  };
  const edit = async (list: Locator, number: string) => {
    await list.getByRole("row").filter({ has: page.getByRole("cell", { name: number, exact: true }) }).click(); await list.getByTestId("BTN_Alterar").click();
    const form = page.getByTestId("WIN_Ordens_Reparacao_Form"); await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready"); return form;
  };
  let list = await open();
  for (const [number, priority, label] of [["12", "2", "Elevada"], ["13", "3", "Urgente"]]) {
    const form = await edit(list, number);
    await expect(form.getByTestId("COMBO_Prioridade")).toHaveValue(priority);
    await expect(form.getByTestId("COMBO_Prioridade").locator("option:checked")).toHaveText(label);
    await form.getByTestId("EDT_observacao").fill(`Alteração sem prioridade ${number}`);
    const saved = response(page, "repair-orders", "save"); await form.getByTestId("BTN_Gravar").click(); expect((await (await saved).json()).kind).toBe("saved"); await expect(form).toHaveCount(0);
    expect((await database.query('SELECT "recepcao_prioridade","recepcao_obs" FROM app."ordem_reparacao" WHERE "numero"=$1', [number])).rows).toEqual([{ recepcao_prioridade: Number(priority), recepcao_obs: `Alteração sem prioridade ${number}` }]);
    list = await open(); const reopened = await edit(list, number);
    await expect(reopened.getByTestId("COMBO_Prioridade")).toHaveValue(priority); await expect(reopened.getByTestId("EDT_observacao")).toHaveValue(`Alteração sem prioridade ${number}`);
    await reopened.getByTestId("BTN_SYST_FERMER").click(); await expect(reopened).toHaveCount(0);
  }
});

test("FUNC-OPS-STOCK-09 actual header No and Escape preserve the header every line and exact stock", async ({ page, operations }) => {
  await stockSeed(operations.database);
  const saved = await operations.post("stock", "save", { mode: "create", document: "E", number: "1", date: "20261025", description: "Documento conservado", mechanic: null,
    lines: [{ linha: "1", artigo: "BASE", descricao_artigo: "Artigo base", quantidade: "2.125", preco: "3.25" }, { linha: "2", artigo: "BASE", descricao_artigo: "Segunda linha", quantidade: "0.875", preco: "4.5" }] }) as { kind: string; id: string };
  expect(saved.kind).toBe("saved"); expect((await operations.database.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=\'BASE\'')).rows).toEqual([{ stock: "13.000" }]);
  const before = await snapshot(operations.database), list = await stockList(page, operations.origin);
  const row = list.getByRole("row").filter({ has: page.getByRole("cell", { name: "Documento conservado", exact: true }) });
  await expect(row).toBeVisible(); await row.click();
  const writes: string[] = []; page.on("request", request => { if (request.url().endsWith("/api/stock/delete")) writes.push(request.url()); });
  for (const cancel of ["No", "Escape"]) {
    await list.getByTestId("BTN_Eliminar").click(); const prompt = page.getByTestId("WINDEVMESSAGEBOX"); await expect(prompt.getByTestId("LIB_INFO")).toHaveText("Eliminar Documento?"); await expect(prompt.getByTestId("BTN_NON")).toBeFocused();
    if (cancel === "No") await prompt.getByTestId("BTN_NON").click(); else await page.keyboard.press("Escape");
    await expect(prompt).toHaveCount(0); await expect(row).toBeVisible(); await expect(list.getByTestId("BTN_Eliminar")).toBeEnabled();
    expect(await snapshot(operations.database)).toEqual(before);
    const read = await operations.post("stock", "read", { id: saved.id }) as { kind: string; lines: unknown[] }; expect(read.kind).toBe("loaded"); expect(read.lines).toHaveLength(2);
  }
  expect(writes).toEqual([]); await page.reload(); await page.getByTestId("stock-open").click(); await expect(row).toBeVisible();
});

test("FUNC-OPS-STOCK-11 actual Artigos create then edit returns to the same stock draft and saves its updated article", async ({ page, operations }) => {
  await stockSeed(operations.database); const list = await stockList(page, operations.origin);
  await list.getByTestId("BTN_novo").click(); const draft = page.getByTestId("WIN_Table_Lin_Stocks");
  await draft.getByTestId("COMBO_tipo_doc").selectOption("E"); await expect(draft.getByTestId("EDT_Numero")).toHaveValue("1");
  await draft.getByTestId("EDT_descricao").fill("Rascunho retido entre Artigos");
  await draft.getByTestId("EDT_codigo").fill("BASE"); await draft.getByTestId("EDT_quant").focus(); await expect(draft.getByTestId("EDT_descricao_Artigo")).toHaveValue("Artigo base");
  await draft.getByTestId("EDT_quant").fill("2,125"); await draft.getByTestId("BTN_Adicionar").click();
  await expect(draft.getByTestId("EDT_codigo")).toBeFocused();
  await draft.getByTestId("COL_Quant-0").fill("2,500");
  await expect(draft.getByTestId("COL_Quant-0")).toHaveValue("2,500");
  // Identity witnesses only: user actions remain ordinary clicks and edits.
  const originalDraft = await draft.elementHandle();
  for (const mode of ["create", "edit"]) {
    await draft.getByTestId("BTN_Artigos").click(); const articles = page.locator('dialog[data-testid="stock-articles"]'); await expect(articles).toBeVisible();
    if (mode === "create") await articles.getByTestId("Btn_New").click();
    else { await articles.getByRole("cell", { name: "Artigo criado no rascunho", exact: true }).click(); await articles.getByTestId("BTN_Modificar").click(); }
    const form = page.getByTestId("WIN_Form_artigos");
    if (mode === "create") { await form.getByTestId("EDT_Codigo").fill("NOVO"); await form.getByTestId("EDT_Codbaras").fill("NOVO"); await form.getByTestId("COMBO_Unidade").selectOption("UN"); }
    await form.getByTestId("EDT_Descricao").fill(mode === "create" ? "Artigo criado no rascunho" : "Artigo atualizado no rascunho"); await form.getByTestId("EDT_Preco").fill(mode === "create" ? "4,25" : "7,75");
    const saved = response(page, "articles", "save"); await form.getByTestId("BTN_Validar").click(); expect((await (await saved).json()).kind).toBe("saved"); await expect(form).toHaveCount(0);
    await expect(articles).toContainText(mode === "create" ? "Artigo criado no rascunho" : "Artigo atualizado no rascunho"); await articles.getByTestId("BTN_Fechar").click(); await expect(articles).toHaveCount(0);
    expect(await originalDraft!.evaluate(element => element.isConnected)).toBe(true);
    await expect(draft.getByTestId("EDT_descricao")).toHaveValue("Rascunho retido entre Artigos"); await expect(draft.getByTestId("EDT_Numero")).toHaveValue("1"); await expect(draft.getByTestId("COL_Quant-0")).toHaveValue("2,500");
  }
  await draft.getByTestId("EDT_codigo").fill("NOVO"); await draft.getByTestId("EDT_quant").focus(); await expect(draft.getByTestId("EDT_descricao_Artigo")).toHaveValue("Artigo atualizado no rascunho"); await expect(draft.getByTestId("EDT_preco")).toHaveValue("7,75");
  await draft.getByTestId("EDT_quant").fill("1,250"); await draft.getByTestId("BTN_Adicionar").click();
  const saved = response(page, "stock", "save"); await draft.getByTestId("BTN_Confirmar").click(); expect((await (await saved).json()).kind).toBe("saved"); await expect(draft).toHaveCount(0);
  expect((await operations.database.query('SELECT "artigo","descricao_artigo","quantidade"::text,"preco"::text FROM app."lin_stocks" ORDER BY "linha"')).rows).toEqual([
    { artigo: "BASE", descricao_artigo: "Artigo base", quantidade: "2.500", preco: "3.25" }, { artigo: "NOVO", descricao_artigo: "Artigo atualizado no rascunho", quantidade: "1.250", preco: "7.75" }]);
  expect((await operations.database.query('SELECT "Codigo","stock"::text FROM app."artigos" ORDER BY "Codigo"')).rows).toEqual([{ Codigo: "BASE", stock: "12.500" }, { Codigo: "NOVO", stock: "1.250" }]);
  await page.reload(); await page.getByTestId("stock-open").click(); await list.getByRole("cell", { name: "Rascunho retido entre Artigos", exact: true }).dblclick(); await expect(draft.getByTestId("TABLE_lin_Stocks")).toContainText("Artigo atualizado no rascunho"); await expect(draft.getByTestId("COL_Preco-1")).toHaveValue("7,75");
});

test("FUNC-OPS-INV-04 actual inventory searches and numerically sorts negative fractional NULL stock without edits", async ({ page, operations }) => {
  await inventorySeed(operations.database); const before = await snapshot(operations.database), screen = await inventory(page, operations.origin), table = screen.getByTestId("TABLE_Artigos");
  const codes = () => table.locator("tbody tr").evaluateAll(rows => rows.map(row => row.querySelector("td")?.textContent));
  expect((await codes()).sort()).toEqual(["A-NEG", "B-TEN", "C-NULL", "D-FRAC"]);
  const negative = table.getByRole("row").filter({ has: page.getByRole("cell", { name: "A-NEG", exact: true }) }), nullable = table.getByRole("row").filter({ has: page.getByRole("cell", { name: "C-NULL", exact: true }) });
  await expect(negative.locator("td").nth(2)).toHaveText("-2,500"); await expect(nullable.locator("td").nth(2)).toHaveText("");
  await table.getByTestId("COL_Stock").locator(".wd-searchable-caption").click(); expect(await codes()).toEqual(["A-NEG", "D-FRAC", "B-TEN", "C-NULL"]);
  await table.getByTestId("COL_Stock").locator(".wd-searchable-caption").click(); expect(await codes()).toEqual(["B-TEN", "D-FRAC", "A-NEG", "C-NULL"]);
  await table.getByTestId("COL_Codigo__search").click(); await table.getByRole("textbox", { name: /Pesquisar/ }).fill("C-NULL"); await page.keyboard.press("Enter"); await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("C-NULL");
  await table.getByTestId("COL_Descricao__search").click(); await table.getByRole("textbox", { name: /Pesquisar/ }).fill("Stock negativo"); await page.keyboard.press("Enter"); await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("A-NEG");
  await expect(table.locator("tbody input,tbody textarea,tbody select,[contenteditable=true]")).toHaveCount(0); await expect(table.locator("tbody tr")).toHaveCount(4);
  await screen.getByTestId("BTN_Sair").click(); await expect(screen).toHaveCount(0); expect(await snapshot(operations.database)).toEqual(before);
  const again = await inventory(page, operations.origin); await expect(again.getByTestId("TABLE_Artigos")).toContainText("Stock negativo"); expect(await snapshot(operations.database)).toEqual(before);
});

test("FUNC-OPS-INV-05 actual inventory Print previews and downloads the real current inventory PDF", async ({ page, operations }) => {
  await inventorySeed(operations.database); const before = await snapshot(operations.database), screen = await inventory(page, operations.origin);
  const report = await realPdf(page, screen, "BTN_Imprimir", "RPT_inventario"); expect(report.request).toMatchObject({ reportId: "RPT_inventario", source: { kind: "file" } });
  for (const code of ["A-NEG", "B-TEN", "C-NULL", "D-FRAC"]) { expect(report.text).toContain(code); await expect(report.preview.frameLocator("iframe").getByText(code, { exact: true })).toBeVisible(); }
  for (const value of ["Inventário de Artigos", "-2.5", "0.125", "Stock nulo"]) expect(report.text).toContain(value);
  await expect(report.preview.frameLocator("iframe").locator('[data-control="ITEM_Stock"]')).toHaveText(["-2.5", "10", "", "0.125"]);
  await report.preview.getByRole("button", { name: "Fechar", exact: true }).click(); await expect(screen).toBeVisible(); expect(await snapshot(operations.database)).toEqual(before);
});

test("FUNC-OPS-STATEMENT-03 actual chosen article and date bounds return exact opening movement balances and real PDF", async ({ page, operations }) => {
  await operations.database.query(`INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ('E','Entrada extrato',1),('S','Saída extrato',2);
    INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data") VALUES
    ('E',1,'20261024120000000'),('E',2,'20261025000001000'),('S',3,'20261026235959000'),('E',4,'20261027120000000'),
    ('S',5,'20261024120000000'),('E',6,'20261026120000000'),('E',7,'20261026120000000'),('E',8,'20261026120000000');
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES
    ('E',1,'B','Artigo B escolhido',5),('E',2,'B','Artigo B escolhido',0.5),('S',3,'B','Artigo B escolhido',1.25),('E',4,'B','DEPOIS DO INTERVALO',100),
    ('S',5,'C','Artigo C escolhido',2),('E',6,'C','Artigo C escolhido',3),('E',7,'A','FORA ARTIGO INFERIOR',500),('E',8,'D','FORA ARTIGO SUPERIOR',900);
    INSERT INTO app."ordem_reparacao" ("numero","recepcao_datahora") VALUES (90,'20261026120000000');
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","data_hora") VALUES (90,'B','Artigo B escolhido',0.75,'20261028120000000')`);
  const before = await snapshot(operations.database);
  await page.goto(`${operations.origin}/?workflow=stock-statement`); await page.getByTestId("stock-statement-open").click(); const screen = page.getByTestId("WIN_Extrato_Artigos");
  await screen.getByTestId("EDT_Da_data").fill("25/10/2026"); await screen.getByTestId("EDT_a_data").fill("26/10/2026"); await screen.getByTestId("EDT_Do_artigo").fill("B"); await screen.getByTestId("EDT_Ao_artigo").fill("C");
  const report = await realPdf(page, screen, "BTN_Visualizar_impressão", "RPT_Extrato_artigos");
  expect(report.request).toMatchObject({ reportId: "RPT_Extrato_artigos", source: { kind: "query", from: "20261025000000", to: "20261026235959", openingCutoff: "20261025000000", articleFrom: "B", articleTo: "C" } });
  const frame = report.preview.frameLocator("iframe");
  // Independent fixture arithmetic: B 5 + .5 - .75 - 1.25 = 3.5; C -2 + 3 = 1.
  await expect(frame.locator('[data-control="STC_total_anterior"]')).toHaveText(["Total Anterior: 5", "Total Anterior: -2"]);
  await expect(frame.locator('[data-control="ITEM_total"]')).toHaveText(["5.5", "4.75", "3.5", "1"]);
  await expect(frame.locator('[data-control="STC_total_final"]')).toHaveText(["Total Final: 3.5", "Total Final: 1"]);
  for (const text of ["B - Artigo B escolhido", "C - Artigo C escolhido", "Total Anterior: 5", "Total Anterior: -2", "Total Final: 3.5", "Total Final: 1"]) expect(report.text).toContain(text);
  for (const excluded of ["DEPOIS DO INTERVALO", "FORA ARTIGO INFERIOR", "FORA ARTIGO SUPERIOR"]) expect(report.text).not.toContain(excluded);
  await report.preview.getByRole("button", { name: "Fechar", exact: true }).click(); await expect(screen.getByTestId("EDT_Da_data")).toHaveValue("25/10/2026"); expect(await snapshot(operations.database)).toEqual(before);
});
