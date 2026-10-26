import { test, expect } from "./support/report-filters";

// Actual UI/API/PostgreSQL fixtures. Source text/ranges below are independent of
// the implementation's title/layout factories and do not resolve native U items.
function today() {
  const value = new Date();
  return `${String(value.getDate()).padStart(2, "0")}/${String(value.getMonth() + 1).padStart(2, "0")}/${value.getFullYear()}`;
}
for (const [mode, title] of [
  ["resumo", "Consumo Material (Resumo)"], ["descriminado", "Consumo Material (Descriminado)"],
  ["resumo_viatura", "Consumo Material (Resumo por viatura)"], ["descriminado_viatura", "Consumo Material (Descriminado por viatura)"],
] as const) {
  test(`WIN_Filtro_Mapas_Artigos ${mode} initializes source title, current dates, article range and distinct plane`, async ({ page, reportFiltersServer }) => {
    const date = today(); await page.goto(`${reportFiltersServer.origin}/?workflow=report-filters`);
    await page.getByTestId(`report-filter-material-${mode}`).click();
    const screen = page.getByTestId("WIN_Filtro_Mapas_Artigos"), vehicle = mode.endsWith("viatura"), suffix = vehicle ? "1" : mode === "descriminado" ? "2" : "";
    await expect(page.getByTestId("RADTitle")).toHaveText(title);
    await expect(screen.getByTestId(`EDT_Da_data${vehicle ? "1" : ""}`)).toHaveValue(date);
    await expect(screen.getByTestId(`EDT_a_data${vehicle ? "1" : ""}`)).toHaveValue(date);
    await expect(screen.getByTestId(`EDT_Do_artigo${suffix}`)).toHaveValue("");
    await expect(screen.getByTestId(`EDT_Ao_artigo${suffix}`)).toHaveValue("zzzzzzzzzz");
    if (vehicle) { await expect(screen.getByTestId("EDT_Da_viatura")).toBeVisible(); await expect(screen.getByTestId("EDT_a_viatura")).toBeVisible(); }
    else { await expect(screen.getByTestId("CBOX_doc[1]")).not.toBeChecked(); await expect(screen.getByTestId("CBOX_doc[2]")).not.toBeChecked(); }
    await expect(screen.getByTestId("EDT_Descrição")).toHaveCount(mode === "descriminado" ? 1 : 0);
  });
}
for (const [mode, title, lower, upper] of [
  ["ordem_reparacao", "Tempos por ordem reparação (Descriminado)", "EDT_Da_ordem", "EDT_a_ordem"],
  ["mecanico_descriminado", "Tempos por mecânico (Descriminado)", "EDT_Do_mecanico", "EDT_Ao_mecanico"],
  ["mecanico_resumo", "Tempos por mecânico (Resumo)", "EDT_Do_mecanico", "EDT_Ao_mecanico"],
  ["viatura", "Tempos por viatura (Descriminado)", "EDT_Da_viatura", "EDT_a_viatura"],
] as const) {
  test(`WIN_Filtro_Mapas_Tempos ${mode} initializes source title, current dates and actual source range plane`, async ({ page, reportFiltersServer }) => {
    const date = today(); await page.goto(`${reportFiltersServer.origin}/?workflow=report-filters`);
    await page.getByTestId(`report-filter-labor-${mode}`).click();
    const screen = page.getByTestId("WIN_Filtro_Mapas_Tempos");
    await expect(page.getByTestId("RADTitle")).toHaveText(title);
    await expect(screen.getByTestId("EDT_Da_data")).toHaveValue(date); await expect(screen.getByTestId("EDT_a_data")).toHaveValue(date);
    await expect(screen.getByTestId(lower)).toBeVisible(); await expect(screen.getByTestId(upper)).toBeVisible();
    if (mode === "ordem_reparacao") { await expect(screen.getByTestId(lower)).toHaveValue("1"); await expect(screen.getByTestId(upper)).toHaveValue("9999999999"); }
    if (mode !== "ordem_reparacao") await expect(screen.getByTestId("EDT_Da_ordem")).toHaveCount(0);
    if (mode !== "viatura") await expect(screen.getByTestId("EDT_Da_viatura")).toHaveCount(0);
  });
}
for (const [mode, title, suffix] of [["vendas", "Mapa de Vendas", "entrega"], ["recebimentos", "Mapa de Recebimentos", "pagamento"]] as const) {
  test(`WIN_Mapa_Vendas ${mode} initializes source captions/dates and independently checked state rows`, async ({ page, reportFiltersServer }) => {
    const date = today(); await page.goto(`${reportFiltersServer.origin}/?workflow=report-filters`);
    await page.getByTestId(`report-filter-sales-${mode}`).click();
    const screen = page.getByTestId("WIN_Mapa_Vendas"), table = screen.getByTestId("TABLE_Estados");
    await expect(page.getByTestId("RADTitle")).toHaveText(title);
    await expect(screen.getByText(`Da data de ${suffix}`, { exact: true })).toBeVisible();
    await expect(screen.getByText(`À data de ${suffix}`, { exact: true })).toBeVisible();
    await expect(screen.getByTestId("STC_Titulo_Tabela")).toHaveText(`Estados de reparação que pedem data de ${suffix}`);
    await expect(screen.getByTestId("EDT_Da_data")).toHaveValue(date); await expect(screen.getByTestId("EDT_A_data")).toHaveValue(date);
    await expect(table.getByRole("checkbox")).toHaveCount(2);
    for (const checkbox of await table.getByRole("checkbox").all()) await expect(checkbox).toBeChecked();
    const first = table.getByRole("checkbox").first(), last = table.getByRole("checkbox").last();
    await first.click(); await expect(first).not.toBeChecked(); await expect(last).toBeChecked();
    await table.focus(); await table.press("Space"); await expect(first).toBeChecked(); await expect(last).toBeChecked();
  });
}
