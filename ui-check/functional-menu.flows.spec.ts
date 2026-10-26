import type { Locator, Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import type { ReportRequest, ReportRenderResult } from "../packages/domain/src/reports";
import { test, expect } from "./support/functional-menu";

test.use({ viewport: { width: 1440, height: 1000 } });

async function enter(page: Page, server: { origin: string; setupToken: string }, query = "") {
  await page.goto(`${server.origin}/${query}`);
  const setup = page.getByTestId("authentication-enrollment");
  await setup.getByLabel("Código de configuração").fill(server.setupToken);
  await setup.getByLabel("Nova palavra-passe").fill("SyntheticMenu42");
  await setup.getByTestId("enrollment-confirm").click();
  const menu = page.getByTestId("WIN_MENU"); await expect(menu).toBeVisible(); return menu;
}
async function menuItem(menu: Locator, group: string, control: string) {
  const details = menu.locator("details").filter({ has: menu.page().getByText(group, { exact: true }) });
  if (await details.getAttribute("open") === null) await details.locator("summary").click();
  await menu.getByTestId(control).click();
}
async function closeWorkspaceScreen(screen: Locator) {
  await screen.locator("xpath=ancestor::*[contains(concat(' ',normalize-space(@class),' '),' wd-workspace-window ')][1]").getByTestId("BTN_SYST_FERMER").click();
  await expect(screen).toHaveCount(0);
}
function pdfText(base64: string) {
  return execFileSync(process.env.PYTHON ?? "python3", ["-c", "import io,sys;from pypdf import PdfReader;r=PdfReader(io.BytesIO(sys.stdin.buffer.read()));print('\\n'.join(p.extract_text() for p in r.pages))"], { input: Buffer.from(base64, "base64"), encoding: "utf8" });
}
async function preview(page: Page, action: () => Promise<void>, reportId: string, text: string[]) {
  const response = page.waitForResponse(item => item.url().endsWith("/api/reports/render") && item.request().method() === "POST");
  await action(); const reply = await response;
  expect(reply.status()).toBe(200);
  const rendered = await reply.json() as ReportRenderResult;
  expect(rendered.kind).toBe("rendered");
  if (rendered.kind !== "rendered") throw new Error(`Report failed: ${rendered.kind}`);
  expect(rendered.reportId).toBe(reportId); expect(rendered.pageCount).toBeGreaterThan(0);
  expect(Buffer.from(rendered.pdfBase64, "base64").subarray(0, 5).toString()).toBe("%PDF-");
  const extracted = pdfText(rendered.pdfBase64), dialog = page.locator("dialog.report-preview");
  await expect(dialog).toBeVisible(); await expect(dialog.locator("iframe")).toHaveAttribute("title", reportId);
  for (const value of text) {
    expect(extracted.replaceAll(/\s+/g, " ")).toContain(value);
    await expect(dialog.frameLocator("iframe").locator("body")).toContainText(value);
  }
  const download = page.waitForEvent("download"); await dialog.getByRole("link", { name: "PDF", exact: true }).click();
  const pdf = await download; expect(pdf.suggestedFilename()).toBe(`${reportId}.pdf`);
  expect(await readFile((await pdf.path())!)).toEqual(Buffer.from(rendered.pdfBase64, "base64"));
  await dialog.getByRole("button", { name: "Fechar", exact: true }).click(); await expect(dialog).toHaveCount(0);
  return { request: reply.request().postDataJSON() as ReportRequest, extracted, html: rendered.html };
}

test("FC-CORE-MENU-EXIT actual Menu Sair releases open and minimized business children and revokes the session", async ({ page, request, functionalMenuServer }) => {
  const paths: string[] = []; page.on("request", item => { if (item.url().includes("/api/")) paths.push(new URL(item.url()).pathname); });
  const menu = await enter(page, functionalMenuServer);
  await menu.getByTestId("BTN_Artigos").click(); const articles = page.getByTestId("WIN_Table_artigos"); await expect(articles.getByRole("cell", { name: "ARTIGO MENU A", exact: true })).toBeVisible();
  await page.getByTestId("workspace-window-1").getByTestId("BTN_SYST_MINIMIZE").click();
  await menu.getByTestId("BTN_movimentos_stock").click(); await expect(page.getByTestId("WIN_Table_cab_stocks").getByTestId("TABLE_cab_stocks")).toBeVisible();
  expect((await functionalMenuServer.database.query("SELECT count(*)::text AS count FROM auth.sessions")).rows[0].count).toBe("1");
  await menuItem(menu, "Menu", "MENU_OPT_Exit");
  await expect(page.getByTestId("startup-terminated")).toBeVisible(); await expect(menu).toHaveCount(0);
  await expect(page.locator(".wd-workspace-window")).toHaveCount(0); await expect(page.getByTestId("workspace-tasks")).toHaveCount(0);
  expect((await functionalMenuServer.database.query("SELECT count(*)::text AS count FROM auth.sessions")).rows[0].count).toBe("0");
  expect((await request.post(`${functionalMenuServer.origin}/api/articles/list`, { data: {} })).status()).toBe(401);
  expect(paths).not.toContain("/api/development/session");
});

test("FC-CORE-MENU-REPORT-ROUTES all twelve real material labor sales statement and reconstruction menu routes cancel back to a usable shell", async ({ page, functionalMenuServer }) => {
  const menu = await enter(page, functionalMenuServer);
  const routes = [
    ["OPT_Consumo_material_resumo", "WIN_Filtro_Mapas_Artigos", "Consumo Material (Resumo)", "EDT_Do_artigo"],
    ["OPT_Consumo_material_descriminado", "WIN_Filtro_Mapas_Artigos", "Consumo Material (Descriminado)", "EDT_Descrição"],
    ["OPT_Consumo_material_por_viatura_resumo", "WIN_Filtro_Mapas_Artigos", "Consumo Material (Resumo por viatura)", "EDT_Da_viatura"],
    ["OPT_Consumo_material_por_viatura_descriminado", "WIN_Filtro_Mapas_Artigos", "Consumo Material (Descriminado por viatura)", "EDT_Da_viatura"],
    ["OPT_Tempos_de_reparação_por_ordem", "WIN_Filtro_Mapas_Tempos", "Tempos por ordem reparação (Descriminado)", "EDT_Da_ordem"],
    ["OPT_Tempos_de_reparação_por_mecânico_resumo", "WIN_Filtro_Mapas_Tempos", "Tempos por mecânico (Resumo)", "EDT_Do_mecanico"],
    ["OPT_Tempos_de_reparação_por_mecânico_descriminado", "WIN_Filtro_Mapas_Tempos", "Tempos por mecânico (Descriminado)", "EDT_Do_mecanico"],
    ["OPT_Tempos_de_reparação_por_viatura", "WIN_Filtro_Mapas_Tempos", "Tempos por viatura (Descriminado)", "EDT_Da_viatura"],
    ["OPT_Vendas", "WIN_Mapa_Vendas", "Mapa de Vendas", "TABLE_Estados"],
    ["OPT_Recebimentos", "WIN_Mapa_Vendas", "Mapa de Recebimentos", "TABLE_Estados"],
  ];
  let writes = 0; page.on("request", item => { if (/\/api\/(?:reports\/render|stock\/rebuild)$/.test(new URL(item.url()).pathname)) writes++; });
  for (const [control, name, title, field] of routes) {
    await menuItem(menu, "Mapas", control); const screen = page.getByTestId(name); await expect(screen).toBeVisible();
    await expect(screen.getByTestId(field)).toBeVisible(); await expect(page.getByTestId("RADTitle").filter({ hasText: title })).toBeVisible();
    if (name === "WIN_Mapa_Vendas") await expect(screen.getByRole("checkbox")).toHaveCount(1);
    await closeWorkspaceScreen(screen); await expect(menu.getByTestId("BTN_Artigos")).toBeEnabled();
  }
  await menuItem(menu, "Mapas", "OPT_Extrato_de_artigos"); const statement = page.getByTestId("WIN_Extrato_Artigos");
  await expect(statement.getByTestId("EDT_Do_artigo")).toBeVisible(); await statement.getByTestId("BTN_SYST_FERMER").click(); await expect(statement).toHaveCount(0);
  await menuItem(menu, "Utilitários", "OPT_Reconstrução_de_Stocks"); const reconstruction = page.getByTestId("WIN_Reconstrucao_Stocks");
  await expect(reconstruction.getByTestId("BTN_Reconstruir")).toBeEnabled(); await reconstruction.getByTestId("BTN_SYST_FERMER").click(); await expect(reconstruction).toHaveCount(0);
  await menu.getByTestId("BTN_Artigos").click(); await expect(page.getByTestId("WIN_Table_artigos").getByRole("cell", { name: "ARTIGO MENU B", exact: true })).toBeVisible();
  expect(writes).toBe(0);
  expect((await functionalMenuServer.database.query('SELECT "Codigo","stock"::text FROM app."artigos" ORDER BY "Codigo"')).rows).toEqual([{ Codigo: "A", stock: "10" }, { Codigo: "B", stock: "8" }]);
});

test("FC-CORE-LAUNCH-ARTICLES-ACTIONS authenticated artigos=1 opens both actual toolbar targets and preserves usable minimize restore close returns", async ({ page, functionalMenuServer }) => {
  const menu = await enter(page, functionalMenuServer, "?artigos=1");
  await expect(menu.locator("nav")).toHaveCount(0); await expect(menu.getByRole("button")).toHaveCount(2);
  for (const [button, name, table, witness] of [
    ["BTN_Artigos", "WIN_Table_artigos", "TABLE_artigos", "ARTIGO MENU A"],
    ["BTN_movimentos_stock", "WIN_Table_cab_stocks", "TABLE_cab_stocks", "SAÍDA MENU"],
  ]) {
    await menu.getByTestId(button).click(); const screen = page.getByTestId(name); await expect(screen.getByTestId(table)).toContainText(witness);
    const frame = screen.locator("xpath=ancestor::*[contains(concat(' ',normalize-space(@class),' '),' wd-workspace-window ')][1]");
    const identity = await frame.getAttribute("data-testid");
    await frame.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(screen.getByTestId(table)).not.toBeVisible();
    await expect(page.getByTestId(`${identity}-task`)).toContainText("minimizada");
    await menu.getByTestId(button).click(); await expect(screen.getByTestId(table)).toBeVisible(); await expect(page.locator(".wd-workspace-window")).toHaveCount(1);
    await frame.getByTestId("BTN_SYST_MINIMIZE").click(); await page.getByTestId(`${identity}-task`).click(); await expect(screen.getByTestId(table)).toBeVisible();
    await frame.getByTestId("BTN_SYST_FERMER").click(); await expect(screen).toHaveCount(0); await expect(page.locator(".wd-workspace-window")).toHaveCount(0);
    await expect(menu.getByTestId("BTN_Artigos")).toBeEnabled(); await expect(menu.getByTestId("BTN_movimentos_stock")).toBeEnabled();
  }
  await menu.getByTestId("BTN_Artigos").click(); await expect(page.getByTestId("WIN_Table_artigos")).toBeVisible();
  expect((await functionalMenuServer.database.query('SELECT count(*)::text AS count FROM app."artigos"')).rows[0].count).toBe("2");
});

test("FUNC-OPS-FILTER-04 actual labor invalid dates and numeric bounds retain drafts with zero dispatch then corrected real PDFs", async ({ page, functionalMenuServer }) => {
  test.setTimeout(90_000); const menu = await enter(page, functionalMenuServer);
  let requests = 0; page.on("request", item => { if (item.url().endsWith("/api/reports/render")) requests++; });
  for (const [control, fromName, toName, reportId] of [
    ["OPT_Tempos_de_reparação_por_ordem", "EDT_Da_ordem", "EDT_a_ordem", "RPT_Tempos_Ordem_Reparacao"],
    ["OPT_Tempos_de_reparação_por_mecânico_descriminado", "EDT_Do_mecanico", "EDT_Ao_mecanico", "RPT_Tempos_Ordem_Reparacao_Mecanico"],
  ]) {
    await menuItem(menu, "Mapas", control); const screen = page.getByTestId("WIN_Filtro_Mapas_Tempos"), button = screen.getByTestId("BTN_Visualizar_impressão"), before = requests;
    const from = screen.getByTestId("EDT_Da_data"), to = screen.getByTestId("EDT_a_data"), lower = screen.getByTestId(fromName), upper = screen.getByTestId(toName);
    await from.fill("31/02/2026"); await to.fill("25/10/2026"); await button.click();
    await expect(from).toHaveValue("31/02/2026"); await expect(from).toHaveAttribute("aria-invalid", "true"); expect(requests).toBe(before);
    await from.fill("25/10/2026"); await to.fill("31/02/2026"); await button.click();
    await expect(to).toHaveValue("31/02/2026"); await expect(to).toHaveAttribute("aria-invalid", "true"); expect(requests).toBe(before);
    await to.fill("25/10/2026"); await lower.fill(""); await button.click();
    await expect(lower).toHaveValue(""); await expect(screen.getByTestId("report-filter-diagnostic")).toHaveText("invalid-number"); expect(requests).toBe(before);
    await lower.fill(fromName === "EDT_Da_ordem" ? "10" : "7"); await upper.fill(""); await button.click();
    await expect(upper).toHaveValue(""); await expect(screen.getByTestId("report-filter-diagnostic")).toHaveText("invalid-number"); expect(requests).toBe(before);
    await upper.fill(fromName === "EDT_Da_ordem" ? "10" : "7");
    const actual = await preview(page, () => button.click(), reportId, ["MECÂNICO MENU", "AA-00-AA"]);
    expect(actual.request).toMatchObject({ reportId, source: { kind: "query", parameters: { ParamDaData: "20261025000000", ParamAData: "20261025235959", ...(fromName === "EDT_Da_ordem" ? { ParamDaOrdem: "10", ParamAOrdem: "10" } : { ParamDoMecanico: "7", ParamAoMecanico: "7" }) } } });
    expect(requests).toBe(before + 1); await expect(from).toHaveValue("25/10/2026"); await expect(upper).toHaveValue(fromName === "EDT_Da_ordem" ? "10" : "7");
    await closeWorkspaceScreen(screen);
  }
});

test("FUNC-OPS-PRINT-02 actual selected repair details print current material snapshot total and service PDFs while retaining the unsaved draft", async ({ page, functionalMenuServer }) => {
  test.setTimeout(90_000); const menu = await enter(page, functionalMenuServer);
  await menu.getByTestId("BTN_Ordens_reparacao").click(); const screen = page.getByTestId("WIN_Ordens_Reparacao");
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click(); await screen.getByTestId("BTN_Actualizar_Dados").click();
  await screen.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await screen.getByTestId("BTN_informacao").click(); const detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes");
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click();
  const table = detail.getByTestId("TABLE_materiais"), first = table.getByRole("row").filter({ hasText: "MATERIAL MENU A" });
  await first.getByRole("button", { name: "1.25", exact: true }).click();
  const price = page.getByTestId("WIN_Inserir_quantidade_password"); await price.getByTestId("EDT_quantidade").fill("2,50"); await price.getByTestId("BTN_Confirmar").click();
  await detail.getByRole("checkbox", { name: "Extra A", exact: true }).click();
  const total = "Extras: 5.00    Total: 6.00    Total c/iva: 7.38";
  await expect(detail.getByTestId("STC_total_material")).toHaveText(total);
  await first.click(); await expect(first).toHaveAttribute("aria-selected", "true");
  const material = await preview(page, () => detail.getByTestId("BTN_Imprimir").click(), "RPT_Materiais", ["MATERIAL MENU A", "MATERIAL MENU B", "Extras: 5.00 Total: 6.00 Total c/iva: 7.38", "2.50"]);
  expect([...material.html.matchAll(/data-control="ITEM_COL_preco"[^>]*>([^<]*)<\/div>/g)].map(match => match[1])).toEqual(["2.50", "4"]);
  expect(material.request).toMatchObject({ source: { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: "10", formattedTotal: total, rows: [
    { COL_cod_art: "A", COL_desc_artigo: "MATERIAL MENU A", COL_quant: "2", COL_preco: "2.50", COL_extra: "1", COL_lancado: "0" },
    { COL_cod_art: "B", COL_desc_artigo: "MATERIAL MENU B", COL_quant: "1.5", COL_preco: "4", COL_extra: "0", COL_lancado: "0" },
  ] } });
  await expect(detail.getByRole("tab", { name: "Materiais", exact: true })).toHaveAttribute("aria-selected", "true"); await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(detail.getByRole("checkbox", { name: "Extra A", exact: true })).toBeChecked(); await expect(first.getByRole("button", { name: "2.50", exact: true })).toBeVisible();
  await detail.getByRole("tab", { name: "Descrições/Observações", exact: true }).click();
  await expect(detail.getByTestId("EDT_servico_avaria")).toHaveValue("SERVIÇO SELECIONADO DEZ");
  const service = await preview(page, () => detail.getByTestId("BTN_listagem").click(), "RPT_Servico_Avaria", ["SERVIÇO SELECIONADO DEZ", "OBSERVAÇÃO SELECIONADA DEZ", "AA-00-AA"]);
  expect(service.request).toMatchObject({ source: { kind: "programmatic", orderNumber: "10" } }); expect(service.extracted).not.toContain("SERVIÇO OUTRA ORDEM VINTE");
  await expect(detail.getByRole("tab", { name: "Descrições/Observações", exact: true })).toHaveAttribute("aria-selected", "true");
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click(); await expect(detail.getByTestId("STC_total_material")).toHaveText(total);
  expect((await functionalMenuServer.database.query('SELECT "preco"::text,"extra" FROM app."material_reparacao" WHERE "artigo"=\'A\'')).rows).toEqual([{ preco: "1.25", extra: false }]);
  await detail.getByTestId("BTN_SYST_FERMER").click(); await expect(detail).toHaveCount(0);
  expect((await functionalMenuServer.database.query('SELECT "preco"::text,"extra" FROM app."material_reparacao" WHERE "artigo"=\'A\'')).rows).toEqual([{ preco: "1.25", extra: false }]);
  expect((await functionalMenuServer.database.query('SELECT "Codigo","stock"::text FROM app."artigos" ORDER BY "Codigo"')).rows).toEqual([{ Codigo: "A", stock: "10" }, { Codigo: "B", stock: "8" }]);
});
