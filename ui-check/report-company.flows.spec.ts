import { readFile } from "node:fs/promises";
import { test, expect } from "./support/report-company";

test("ordinary built-app customer Print inherits the configured company in preview/download across local-service restart", async ({ page, companyReportServer }) => {
  const errors: string[] = [], requests: string[] = []; page.on("pageerror", error => errors.push(error.message)); page.on("request", request => requests.push(new URL(request.url()).pathname));
  await page.goto(companyReportServer.origin);
  const setup = page.getByTestId("authentication-enrollment"); await setup.getByLabel("Código de configuração").fill(companyReportServer.setupToken); await setup.getByLabel("Nova palavra-passe").fill("Company42"); await setup.getByTestId("enrollment-confirm").click();
  const menu = page.getByTestId("WIN_MENU"); await expect(menu).toBeVisible(); await menu.getByTestId("BTN_Clientes").click();
  const list = page.getByTestId("WIN_Table_Clientes"); await list.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_Clientes"); await form.getByTestId("EDT_Codigo").fill("861"); await form.getByTestId("EDT_Descricao").fill("Cliente normal AÇÃO"); await form.getByTestId("BTN_Validar").click();
  await expect(form).toHaveCount(0); await expect(list.getByRole("cell", { name: "Cliente normal AÇÃO", exact: true })).toBeVisible();
  for (let launch = 0; launch < 2; launch++) {
    if (launch) await companyReportServer.restart();
    const outgoing = page.waitForRequest(value => value.url().endsWith("/api/reports/render")), response = page.waitForResponse(value => value.url().endsWith("/api/reports/render"));
    await list.getByTestId("BTN_Imprimir").click();
    expect((await outgoing).postDataJSON().context.company).toBe("");
    const actual = await (await response).json(); expect(actual.kind).toBe("rendered"); expect(actual.reportId).toBe("RPT_List_Clientes");
    const preview = page.locator("dialog.report-preview"); await expect(preview).toBeVisible();
    const printedCompany = preview.frameLocator("iframe").locator('[data-control="STC_Empresa"]'); await expect(printedCompany).toBeVisible();
    expect(await printedCompany.textContent()).toBe(companyReportServer.company);
    await expect(preview.frameLocator("iframe").getByText("Cliente normal AÇÃO", { exact: true })).toBeVisible();
    expect(actual.html).toContain("OFICINA AÇÃO &amp; FILHOS &lt;Lda&gt;"); expect(actual.html).not.toContain("<Lda>");
    const downloaded = page.waitForEvent("download"); await preview.getByRole("link", { name: "PDF", exact: true }).click(); const pdf = await downloaded;
    expect(pdf.suggestedFilename()).toBe("RPT_List_Clientes.pdf"); expect(await readFile((await pdf.path())!)).toEqual(Buffer.from(actual.pdfBase64, "base64"));
    await preview.getByRole("button", { name: "Fechar", exact: true }).click(); await expect(preview).toHaveCount(0);
  }
  expect(errors).toEqual([]); expect(requests).not.toContain("/api/development/session"); expect(requests).not.toContain("/@vite/client");
});
