import { readFile } from "node:fs/promises";
import { test, expect } from "./support/local-reports";

test("ADR017 actual built business app uses explicitly provisioned offline report pins across full local-service restart", async ({ page, localReportServer }) => {
  const requests: string[] = []; page.on("request", request => requests.push(new URL(request.url()).pathname));
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  const originalPin = await localReportServer.pinHash(); await page.goto(localReportServer.origin);
  const setup = page.getByTestId("authentication-enrollment"); await setup.getByLabel("Código de configuração").fill(localReportServer.setupToken); await setup.getByLabel("Nova palavra-passe").fill("Reports42"); await setup.getByTestId("enrollment-confirm").click();
  const menu = page.getByTestId("WIN_MENU"); await expect(menu).toBeVisible(); await menu.getByTestId("BTN_Clientes").click();
  const list = page.getByTestId("WIN_Table_Clientes"); await list.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_Clientes"); await form.getByTestId("EDT_Codigo").fill("9007199254740993"); await form.getByTestId("EDT_Descricao").fill("Persistent report browser AÇÃO"); await form.getByTestId("BTN_Validar").click();
  await expect(form).toHaveCount(0); await expect(list.getByRole("cell", { name: "Persistent report browser AÇÃO", exact: true })).toBeVisible();
  for (let launch = 0; launch < 2; launch++) {
    if (launch) { await localReportServer.restart(); expect(await localReportServer.pinHash()).toBe(originalPin); }
    const response = page.waitForResponse(value => value.url().endsWith("/api/reports/render")); await list.getByTestId("BTN_Imprimir").click();
    const actual = await (await response).json(); expect(actual.kind).toBe("rendered"); expect(actual.reportId).toBe("RPT_List_Clientes"); expect(actual.html).toContain("data:font/woff2;base64,"); expect(actual.html).not.toContain("<script");
    const preview = page.locator("dialog.report-preview"); await expect(preview).toBeVisible(); await expect(preview.frameLocator("iframe").getByText("Persistent report browser AÇÃO", { exact: true })).toBeVisible();
    const downloaded = page.waitForEvent("download"); await preview.getByRole("link", { name: "PDF", exact: true }).click(); const pdf = await downloaded;
    expect(pdf.suggestedFilename()).toBe("RPT_List_Clientes.pdf"); expect(await readFile((await pdf.path())!)).toEqual(Buffer.from(actual.pdfBase64, "base64"));
    await preview.getByRole("button", { name: "Fechar", exact: true }).click(); await expect(preview).toHaveCount(0);
  }
  expect(await localReportServer.pinHash()).toBe(originalPin); expect(errors).toEqual([]);
  expect(requests).not.toContain("/api/development/session"); expect(requests).not.toContain("/@vite/client"); expect(requests).not.toContain("/src/main.tsx");
});
