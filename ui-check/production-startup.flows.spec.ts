import { test, expect } from "./support/local-reports";

test("production startup retains the authenticated session after a failed initialization and retries the real service", async ({ page, localReportServer }) => {
  const errors: string[] = [], requests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => requests.push(new URL(request.url()).pathname));
  let initializations = 0;
  await page.route("**/api/startup/initialise", async route => {
    initializations++;
    if (initializations === 1) await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ kind: "failed", detail: "synthetic-private-diagnostic" }) });
    else await route.continue();
  });
  await page.goto(localReportServer.origin);
  const setup = page.getByTestId("authentication-enrollment");
  await setup.getByLabel("Código de configuração").fill(localReportServer.setupToken);
  await setup.getByLabel("Nova palavra-passe").fill("Startup42");
  await setup.getByTestId("enrollment-confirm").click();
  await expect(page.getByTestId("startup-retry")).toBeVisible();
  await expect(page.getByTestId("business-session-user")).toHaveText("Administrador");
  await expect(page.getByTestId("startup-diagnostic")).toHaveText("Serviço indisponível. Tente novamente.");
  await expect(page.locator("body")).not.toContainText("synthetic-private-diagnostic");
  expect(initializations).toBe(1);
  await page.getByTestId("startup-retry").click();
  const menu = page.getByTestId("WIN_MENU"); await expect(menu).toBeVisible();
  expect(initializations).toBe(2);
  await expect(page.getByTestId("startup-diagnostic")).toHaveCount(0);
  await menu.getByTestId("BTN_Clientes").click();
  await expect(page.getByTestId("WIN_Table_Clientes").getByTestId("Btn_New")).toBeEnabled();
  await page.getByTestId("business-logout").click();
  await expect(page.getByTestId("WIN_Acesso")).toBeVisible();
  await expect(page.getByTestId("WIN_Table_Clientes")).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(requests).not.toContain("/api/development/session");
});
