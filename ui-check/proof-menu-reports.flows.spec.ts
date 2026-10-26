import type { FamilyReportRequest, ReportRenderResult } from "../packages/domain/src/reports";
import { test, expect } from "./support/functional-menu";

test.use({ viewport: { width: 1440, height: 1000 } });

const routes = [
  { id: "SRC-82a7a6d6e3", entry: "OPT_Consumo_material_resumo", family: "material", mode: "resumo", report: "RPT_Consumo_Material_Resumo_ordens" },
  { id: "SRC-65bf3c58a5", entry: "OPT_Consumo_material_descriminado", family: "material", mode: "descriminado", report: "RPT_Consumo_Material_Descriminado_Ordens" },
  { id: "SRC-d3627f95a7", entry: "OPT_Consumo_material_por_viatura_resumo", family: "material", mode: "resumo_viatura", report: "RPT_Consumo_Material_Viatura_Resumo" },
  { id: "SRC-9123ab6123", entry: "OPT_Consumo_material_por_viatura_descriminado", family: "material", mode: "descriminado_viatura", report: "RPT_Consumo_Material_Viatura_Descriminado" },
  { id: "SRC-87c5b84dce", entry: "OPT_Tempos_de_reparação_por_mecânico_resumo", family: "labor", mode: "mecanico_resumo", report: "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo" },
  { id: "SRC-47e33b2ab7", entry: "OPT_Tempos_de_reparação_por_viatura", family: "labor", mode: "viatura", report: "RPT_Tempos_Ordem_Reparacao_viatura" },
  { id: "SRC-b66e224ab2", entry: "OPT_Vendas", family: "sales", mode: "vendas", report: "RPT_Ordens_Reparacao_DataEntrega" },
  { id: "SRC-8c32f67662", entry: "OPT_Recebimentos", family: "sales", mode: "recebimentos", report: "RPT_Ordens_Reparacao_DataPag" },
] as const;

for (const route of routes) {
  test(`${route.id} actual menu ${route.entry} carries its source mode through authenticated real preview and returns to the same filter`, async ({ page, functionalMenuServer }) => {
    test.setTimeout(60_000);
    await page.goto(functionalMenuServer.origin);
    const setup = page.getByTestId("authentication-enrollment");
    await setup.getByLabel("Código de configuração").fill(functionalMenuServer.setupToken);
    await setup.getByLabel("Nova palavra-passe").fill("SyntheticMenu42");
    await setup.getByTestId("enrollment-confirm").click();
    const menu = page.getByTestId("WIN_MENU"); await expect(menu).toBeVisible();
    await menu.getByText("Mapas", { exact: true }).click();
    await menu.getByTestId(route.entry).click();
    const name = route.family === "material" ? "WIN_Filtro_Mapas_Artigos" : route.family === "labor" ? "WIN_Filtro_Mapas_Tempos" : "WIN_Mapa_Vendas";
    const screen = page.getByTestId(name);
    await expect(screen).toBeVisible();
    const vehicleMaterial = route.family === "material" && route.mode.endsWith("viatura");
    const fromDate = `EDT_Da_data${vehicleMaterial ? "1" : ""}`;
    const toDate = route.family === "sales" ? "EDT_A_data" : `EDT_a_data${vehicleMaterial ? "1" : ""}`;
    await screen.getByTestId(fromDate).fill("25/10/2026");
    await screen.getByTestId(toDate).fill("25/10/2026");
    const parameters: Record<string, unknown> = { ParamDaData: "20261025000000", ParamAData: "20261025235959" };
    if (route.family === "material") {
      const suffix = vehicleMaterial ? "1" : route.mode === "descriminado" ? "2" : "";
      await screen.getByTestId(`EDT_Do_artigo${suffix}`).fill("A");
      await screen.getByTestId(`EDT_Ao_artigo${suffix}`).fill("B");
      Object.assign(parameters, { ParamDoArtigo: "A", ParamAoArtigo: "B" });
      if (vehicleMaterial) {
        await screen.getByTestId("EDT_Da_viatura").fill("AA-00-AA");
        await screen.getByTestId("EDT_a_viatura").fill("AA-00-AA");
        Object.assign(parameters, { ParamDaViatura: "AA-00-AA", ParamAViatura: "AA-00-AA" });
      } else {
        await screen.getByTestId("CBOX_doc[1]").check();
        await expect(screen.getByTestId("CBOX_doc[2]")).not.toBeChecked();
        if (route.mode === "descriminado") await screen.getByTestId("EDT_Descrição").fill("MENU");
        parameters.ParamDescricao = route.mode === "resumo" ? null : "MENU";
      }
    } else if (route.family === "labor") {
      if (route.mode === "viatura") {
        await screen.getByTestId("EDT_Da_viatura").fill("AA-00-AA");
        await screen.getByTestId("EDT_a_viatura").fill("AA-00-AA");
        Object.assign(parameters, { ParamDaViatura: "AA-00-AA", ParamAViatura: "AA-00-AA" });
      } else {
        await screen.getByTestId("EDT_Do_mecanico").fill("7");
        await screen.getByTestId("EDT_Ao_mecanico").fill("7");
        Object.assign(parameters, { ParamDoMecanico: "7", ParamAoMecanico: "7" });
      }
    } else {
      await expect(screen.getByRole("checkbox")).toHaveCount(1);
      Object.assign(parameters, { ParamDaData: "20261025", ParamAData: "20261025", ParamEstados: ["R"] });
    }
    const response = page.waitForResponse(item => item.url().endsWith("/api/reports/render") && item.request().method() === "POST");
    await screen.getByTestId(vehicleMaterial || route.family === "sales" ? "BTN_Visualizar_impressão1" : "BTN_Visualizar_impressão").click();
    const actual = await response;
    expect(actual.ok()).toBe(true);
    const request = actual.request().postDataJSON() as FamilyReportRequest;
    expect(request.reportId).toBe(route.report);
    expect(request.source).toEqual({ kind: "query", parameters });
    const rendered = await actual.json() as ReportRenderResult;
    expect(rendered.kind).toBe("rendered");
    if (rendered.kind !== "rendered") throw new Error(rendered.kind);
    expect(rendered.reportId).toBe(route.report);
    expect(rendered.pageCount).toBeGreaterThan(0);
    expect(Buffer.from(rendered.pdfBase64, "base64").subarray(0, 5).toString()).toBe("%PDF-");
    const preview = page.locator("dialog.report-preview");
    await expect(preview).toBeVisible();
    await expect(preview.locator("iframe")).toHaveAttribute("title", route.report);
    await expect(preview.frameLocator("iframe").locator(".pagedjs_page").first()).toBeVisible();
    await expect(preview.getByRole("link", { name: "PDF", exact: true })).toHaveAttribute("href", /^blob:/);
    await preview.getByRole("button", { name: "Fechar", exact: true }).click();
    await expect(preview).toHaveCount(0);
    await expect(screen.getByTestId(fromDate)).toHaveValue("25/10/2026");
    await expect(screen.getByTestId(toDate)).toHaveValue("25/10/2026");
    const frame = screen.locator("xpath=ancestor::*[contains(concat(' ',normalize-space(@class),' '),' wd-workspace-window ')][1]");
    await frame.getByTestId("BTN_SYST_FERMER").click();
    await expect(screen).toHaveCount(0);
    await expect(menu.getByTestId("BTN_Artigos")).toBeEnabled();
  });
}
