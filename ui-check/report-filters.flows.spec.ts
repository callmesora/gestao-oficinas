import type { Locator, Page } from "@playwright/test";
import { test, expect } from "./support/report-filters";
import type { FamilyReportRequest } from "../packages/domain/src/reports";

async function start(page: Page, origin: string, launcher: string, screen: string) {
  await page.goto(`${origin}/?workflow=report-filters`);
  await page.getByTestId(launcher).click();
  const window = page.getByTestId(screen);
  await expect(window).toBeVisible();
  return window;
}
async function dates(screen: Locator, vehicleMaterial = false, sales = false) {
  await screen.getByTestId(`EDT_Da_data${vehicleMaterial ? "1" : ""}`).fill("25/10/2026");
  await screen.getByTestId(sales ? "EDT_A_data" : `EDT_a_data${vehicleMaterial ? "1" : ""}`).fill("25/10/2026");
}
async function preview(page: Page, screen: Locator, button: string, reportId: string): Promise<FamilyReportRequest> {
  const response = page.waitForResponse(result => result.url().endsWith("/api/reports/render") && result.request().method() === "POST");
  await screen.getByTestId(button).click();
  const result = await response;
  expect((await result.json()).kind).toBe("rendered");
  const request = result.request().postDataJSON() as FamilyReportRequest;
  expect(request.reportId).toBe(reportId);
  const dialog = page.locator("dialog.report-preview"); await expect(dialog).toBeVisible();
  await expect(dialog.locator("iframe")).toHaveAttribute("title", reportId);
  await expect(dialog.getByRole("link", { name: "PDF", exact: true })).toHaveAttribute("href", /^blob:/);
  await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
  return request;
}

test("SRC-9079af9bc2 actual material planes, article picker and every document checkbox branch reach PDF", async ({ page, reportFiltersServer }) => {
  test.setTimeout(90_000);
  for (const mode of ["resumo", "descriminado"] as const) {
    const screen = await start(page, reportFiltersServer.origin, `report-filter-material-${mode}`, "WIN_Filtro_Mapas_Artigos");
    await dates(screen);
    const suffix = mode === "resumo" ? "" : "2";
    await expect(screen.getByTestId(`EDT_Ao_artigo${suffix}`)).toHaveValue("zzzzzzzzzz");
    await expect(screen.getByTestId("CBOX_doc[1]")).not.toBeChecked(); await expect(screen.getByTestId("CBOX_doc[2]")).not.toBeChecked();
    let requests = 0; const observe = () => { requests++; }; page.on("request", request => { if (request.url().endsWith("/api/reports/render")) observe(); });
    await screen.getByTestId("BTN_Visualizar_impressão").click(); expect(requests).toBe(0);
    await screen.getByTestId(mode === "resumo" ? "BTN_VISION6" : "BTN_VISION8").click();
    const picker = page.getByTestId("article-picker"); await expect(picker).toBeVisible();
    await picker.getByTestId("TABLE_artigos").getByRole("row").filter({ hasText: "ARTIGO FILTROS" }).click();
    await picker.getByTestId("BTN_selecionar").click();
    await expect(screen.getByTestId(`EDT_Do_artigo${suffix}`)).toHaveValue("A"); await expect(screen.getByTestId(`EDT_Ao_artigo${suffix}`)).toHaveValue("A");
    if (mode === "descriminado") await screen.getByTestId("EDT_Descrição").fill("FILTROS");
    if (mode === "descriminado") await page.screenshot({ path: test.info().outputPath("material-filter.png") });
    await screen.getByTestId("CBOX_doc[1]").check();
    const prefix = mode === "resumo" ? "Resumo" : "Descriminado";
    const orders = await preview(page, screen, "BTN_Visualizar_impressão", `RPT_Consumo_Material_${prefix}_${mode === "resumo" ? "ordens" : "Ordens"}`);
    if (orders.source.kind === "query") expect(orders.source.parameters.ParamDescricao).toBe(mode === "resumo" ? null : "FILTROS");
    await screen.getByTestId("CBOX_doc[2]").check();
    await preview(page, screen, "BTN_Visualizar_impressão", `RPT_Consumo_Material_${prefix}_${mode === "resumo" ? "ordem_saidas" : "ordens_saidas"}`);
    await screen.getByTestId("CBOX_doc[1]").uncheck();
    await preview(page, screen, "BTN_Visualizar_impressão", `RPT_Consumo_Material_${prefix}_Saidas`);
  }
});
test("SRC-b160751af6 actual two vehicle material branches use the vehicle picker and separate source controls", async ({ page, reportFiltersServer }) => {
  test.setTimeout(60_000);
  for (const mode of ["resumo_viatura", "descriminado_viatura"] as const) {
    const screen = await start(page, reportFiltersServer.origin, `report-filter-material-${mode}`, "WIN_Filtro_Mapas_Artigos"); await dates(screen, true);
    await expect(screen.getByTestId("CBOX_doc")).toHaveCount(0);
    await screen.getByTestId("EDT_Do_artigo1").fill("A");
    await screen.getByTestId("BTN_VISION1").click();
    const picker = page.getByTestId("vehicle-picker"); await expect(picker).toBeVisible();
    await picker.getByTestId("TABLE_Viaturas").getByRole("row").filter({ hasText: "AA-00-AA" }).click();
    await picker.getByTestId("BTN_selecionar").click();
    await expect(screen.getByTestId("EDT_Da_viatura")).toHaveValue("AA-00-AA"); await expect(screen.getByTestId("EDT_a_viatura")).toHaveValue("AA-00-AA");
    const result = await preview(page, screen, "BTN_Visualizar_impressão1", mode === "resumo_viatura" ? "RPT_Consumo_Material_Viatura_Resumo" : "RPT_Consumo_Material_Viatura_Descriminado");
    expect(result.source).toMatchObject({ kind: "query", parameters: { ParamDaData: "20261025000000", ParamAData: "20261025235959", ParamDaViatura: "AA-00-AA", ParamAViatura: "AA-00-AA" } });
  }
});
test("WIN_Filtro_Mapas_Tempos.wdw:266-291 actual four planes and mechanic return/cancel behavior reach PDF", async ({ page, reportFiltersServer }) => {
  test.setTimeout(75_000);
  const reports = { ordem_reparacao: "RPT_Tempos_Ordem_Reparacao", mecanico_descriminado: "RPT_Tempos_Ordem_Reparacao_Mecanico", mecanico_resumo: "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo", viatura: "RPT_Tempos_Ordem_Reparacao_viatura" };
  for (const mode of ["ordem_reparacao", "mecanico_descriminado", "mecanico_resumo", "viatura"] as const) {
    const screen = await start(page, reportFiltersServer.origin, `report-filter-labor-${mode}`, "WIN_Filtro_Mapas_Tempos"); await dates(screen);
    if (mode === "ordem_reparacao") { await expect(screen.getByTestId("EDT_Da_ordem")).toHaveValue("1"); await expect(screen.getByTestId("EDT_a_ordem")).toHaveValue("9999999999"); }
    else if (mode === "viatura") { await screen.getByTestId("EDT_Da_viatura").fill("AA-00-AA"); await screen.getByTestId("EDT_a_viatura").fill("AA-00-AA"); }
    else {
      await screen.getByTestId("BTN_VISION4").click(); const picker = page.getByTestId("mechanic-picker"); await expect(picker).toBeVisible();
      await picker.getByTestId("TABLE_mecanicos").getByRole("row").filter({ hasText: "MECÂNICO FILTROS" }).click(); await picker.getByTestId("BTN_selecionar").click();
      await expect(screen.getByTestId("EDT_Do_mecanico")).toHaveValue("7"); await expect(screen.getByTestId("EDT_Ao_mecanico")).toHaveValue("7");
      await screen.getByTestId("EDT_Ao_mecanico").fill("9"); await screen.getByTestId("BTN_VISION4").click(); await page.getByTestId("mechanic-picker").getByTestId("BTN_Fechar").click();
      await expect(screen.getByTestId("EDT_Ao_mecanico")).toHaveValue("7");
    }
    if (mode === "mecanico_descriminado") await page.screenshot({ path: test.info().outputPath("labor-filter.png") });
    await preview(page, screen, "BTN_Visualizar_impressão", reports[mode]);
  }
});
test("WIN_Mapa_Vendas.wdw:337-442 actual flag query, checked table/empty selection and Date8 calls reach PDF", async ({ page, reportFiltersServer }) => {
  test.setTimeout(60_000);
  for (const mode of ["vendas", "recebimentos"] as const) {
    const screen = await start(page, reportFiltersServer.origin, `report-filter-sales-${mode}`, "WIN_Mapa_Vendas"); await dates(screen, false, true);
    const table = screen.getByTestId("TABLE_Estados");
    await expect(table.getByRole("checkbox")).toHaveCount(2);
    await expect(table).toContainText(mode === "vendas" ? "Só entrega" : "Só pagamento");
    await expect(table).not.toContainText(mode === "vendas" ? "Só pagamento" : "Só entrega");
    if (mode === "vendas") await page.screenshot({ path: test.info().outputPath("sales-filter.png") });
    const id = mode === "vendas" ? "RPT_Ordens_Reparacao_DataEntrega" : "RPT_Ordens_Reparacao_DataPag";
    const result = await preview(page, screen, "BTN_Visualizar_impressão1", id);
    expect(result.source).toEqual({ kind: "query", parameters: { ParamDaData: "20261025", ParamAData: "20261025", ParamEstados: mode === "vendas" ? ["E", "B"] : ["P", "B"] } });
    for (const checkbox of await table.getByRole("checkbox").all()) await checkbox.click();
    const empty = await preview(page, screen, "BTN_Visualizar_impressão1", id);
    if (empty.source.kind === "query") expect(empty.source.parameters.ParamEstados).toEqual([]);
  }
});
test("date blocking keeps the invalid material draft and allows a corrected preview through the actual engine", async ({ page, reportFiltersServer }) => {
  const screen = await start(page, reportFiltersServer.origin, "report-filter-material-descriminado", "WIN_Filtro_Mapas_Artigos"); await dates(screen);
  await screen.getByTestId("CBOX_doc[1]").check();
  await screen.getByTestId("EDT_Da_data").fill("31/02/2026");
  let requests = 0;
  page.on("request", request => { if (request.url().endsWith("/api/reports/render")) requests++; });
  await screen.getByTestId("BTN_Visualizar_impressão").click();
  await expect(screen.getByTestId("EDT_Da_data")).toHaveAttribute("aria-invalid", "true");
  await expect(screen.getByTestId("EDT_Da_data")).toHaveValue("31/02/2026");
  expect(requests).toBe(0);
  await screen.getByTestId("EDT_Da_data").fill("25/10/2026");
  await preview(page, screen, "BTN_Visualizar_impressão", "RPT_Consumo_Material_Descriminado_Ordens");
  expect(requests).toBe(1);
});

test("source material lower and upper pickers preserve distinct unconditional cancel continuations in every source plane", async ({ page, reportFiltersServer }) => {
  for (const mode of ["resumo", "descriminado", "resumo_viatura", "descriminado_viatura"] as const) {
    const screen = await start(page, reportFiltersServer.origin, `report-filter-material-${mode}`, "WIN_Filtro_Mapas_Artigos");
    const vehicle = mode.endsWith("viatura"), suffix = vehicle ? "1" : mode === "descriminado" ? "2" : "";
    const lower = vehicle ? "BTN_VISION4" : mode === "descriminado" ? "BTN_VISION8" : "BTN_VISION6";
    const upper = vehicle ? "BTN_VISION3" : mode === "descriminado" ? "BTN_VISION7" : "BTN_VISION5";
    const from = screen.getByTestId(`EDT_Do_artigo${suffix}`), to = screen.getByTestId(`EDT_Ao_artigo${suffix}`), picker = page.getByTestId("article-picker");
    await from.fill("A"); await to.fill("Z"); await screen.getByTestId(lower).click(); await picker.getByTestId("BTN_Fechar").click();
    await expect(from).toHaveValue("A"); await expect(to).toHaveValue("A");
    await from.fill("B"); await to.fill("Z"); await screen.getByTestId(upper).click();
    await picker.getByTestId("TABLE_artigos").getByRole("row").filter({ hasText: "ARTIGO FILTROS" }).click(); await picker.getByTestId("BTN_selecionar").click();
    await expect(from).toHaveValue("B"); await expect(to).toHaveValue("A");
    await to.fill("Z"); await screen.getByTestId(upper).click(); await picker.getByTestId("BTN_Fechar").click();
    await expect(from).toHaveValue("B"); await expect(to).toHaveValue("Z");
    if (vehicle) {
      await screen.getByTestId("EDT_Da_viatura").fill("AA-00-AA"); await screen.getByTestId("EDT_a_viatura").fill("ZZ"); await screen.getByTestId("BTN_VISION1").click();
      await page.getByTestId("vehicle-picker").getByTestId("BTN_Fechar").click(); await expect(screen.getByTestId("EDT_a_viatura")).toHaveValue("AA-00-AA");
      await screen.getByTestId("EDT_Da_viatura").fill("BB"); await screen.getByTestId("BTN_VISION2").click();
      const vehicles = page.getByTestId("vehicle-picker"); await vehicles.getByTestId("TABLE_Viaturas").getByRole("row").filter({ hasText: "AA-00-AA" }).click(); await vehicles.getByTestId("BTN_selecionar").click();
      await expect(screen.getByTestId("EDT_Da_viatura")).toHaveValue("BB"); await expect(screen.getByTestId("EDT_a_viatura")).toHaveValue("AA-00-AA");
    }
  }
});

test("source labor upper pickers change only upper values and lower cancellation reassigns each nonzero origin", async ({ page, reportFiltersServer }) => {
  for (const mode of ["mecanico_descriminado", "mecanico_resumo", "viatura"] as const) {
    const screen = await start(page, reportFiltersServer.origin, `report-filter-labor-${mode}`, "WIN_Filtro_Mapas_Tempos"), vehicle = mode === "viatura";
    const from = screen.getByTestId(vehicle ? "EDT_Da_viatura" : "EDT_Do_mecanico"), to = screen.getByTestId(vehicle ? "EDT_a_viatura" : "EDT_Ao_mecanico");
    const lower = vehicle ? "BTN_VISION1" : "BTN_VISION4", upper = vehicle ? "BTN_VISION2" : "BTN_VISION3", id = vehicle ? "vehicle-picker" : "mechanic-picker";
    await from.fill(vehicle ? "AA-00-AA" : "7"); await to.fill(vehicle ? "ZZ" : "9"); await screen.getByTestId(lower).click(); await page.getByTestId(id).getByTestId("BTN_Fechar").click();
    await expect(to).toHaveValue(vehicle ? "AA-00-AA" : "7");
    await from.fill(vehicle ? "BB" : "8"); await to.fill(vehicle ? "ZZ" : "9"); await screen.getByTestId(upper).click();
    const picker = page.getByTestId(id); await picker.getByTestId(vehicle ? "TABLE_Viaturas" : "TABLE_mecanicos").getByRole("row").filter({ hasText: vehicle ? "AA-00-AA" : "MECÂNICO FILTROS" }).click(); await picker.getByTestId("BTN_selecionar").click();
    await expect(from).toHaveValue(vehicle ? "BB" : "8"); await expect(to).toHaveValue(vehicle ? "AA-00-AA" : "7");
  }
});
