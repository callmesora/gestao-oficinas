import type { Route } from "@playwright/test";
import { test, expect } from "./support/report-filters";

for (const action of ["button", "escape"] as const) test(`report runtime U-02 ${action} cancellation releases the actual caller and suppresses the late real PostgreSQL/PDF response`, async ({ page, reportFiltersServer }) => {
  test.setTimeout(60_000);
  await page.goto(`${reportFiltersServer.origin}/?workflow=report-filters`);
  await page.getByTestId("report-filter-sales-vendas").click();
  const screen = page.getByTestId("WIN_Mapa_Vendas"), print = screen.getByTestId("BTN_Visualizar_impressão1");
  await screen.getByTestId("EDT_Da_data").fill("25/10/2026"); await screen.getByTestId("EDT_A_data").fill("25/10/2026");
  let release!: () => void, started!: () => void, finished!: () => void;
  const gate = new Promise<void>(done => { release = done; }), accepted = new Promise<void>(done => { started = done; }), delivered = new Promise<void>(done => { finished = done; });
  const delay = async (route: Route) => {
    started();
    try {
      const response = await route.fetch(), result = await response.json();
      expect(result.kind).toBe("rendered"); expect(result.reportId).toBe("RPT_Ordens_Reparacao_DataEntrega"); expect(result.html).toContain("12.3456");
      await gate; await route.fulfill({ response });
    } finally { finished(); }
  };
  await page.route("**/api/reports/render", delay);
  try {
    await print.click(); await accepted;
    const progress = page.locator("dialog.report-progress"); await expect(progress).toBeVisible(); await expect(print).toBeDisabled();
    if (action === "button") await progress.getByTestId("report-cancel").click(); else await page.keyboard.press("Escape");
    await expect(progress).toHaveCount(0); await expect(print).toBeEnabled(); await expect(screen).toBeVisible();
    release(); await delivered;
    await expect(page.locator("dialog.report-preview")).toHaveCount(0); await expect(page.getByTestId("report-diagnostic")).toHaveCount(0);
    await page.unroute("**/api/reports/render", delay);
    const response = page.waitForResponse(value => value.url().endsWith("/api/reports/render"));
    await print.click(); expect((await (await response).json()).kind).toBe("rendered");
    const preview = page.locator("dialog.report-preview"); await expect(preview).toBeVisible();
    await expect(preview.frameLocator("iframe").locator('[data-control="ITEM_Total_pago"]')).toHaveText("12.3456");
    await expect(preview.frameLocator("iframe").locator('[data-control="ITEM_Total_pago"]')).toBeVisible();
    await preview.getByRole("button", { name: "Fechar", exact: true }).click(); await expect(print).toBeEnabled();
  } finally { release(); await page.unroute("**/api/reports/render", delay); }
});
