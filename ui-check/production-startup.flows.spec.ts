import { test, expect } from "./support/local-reports";

test("local enrollment keeps its received token when the acknowledgement response is lost", async ({ page, localReportServer }) => {
  await page.addInitScript(({ token }) => {
    const bridge = window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string) => Promise<unknown> }; __ackReached?: boolean };
    bridge.__TAURI_INTERNALS__ = { invoke: async command => {
      if (command === "read_startup_arguments") return { modulo: null, artigos: null };
      if (command === "local_setup_token") return token;
      if (command === "ack_local_setup") { bridge.__ackReached = true; throw new Error("synthetic acknowledgement response lost"); }
      throw new Error("Unexpected synthetic IPC");
    } };
  }, { token: localReportServer.setupToken });
  await page.goto(localReportServer.origin);
  const setup = page.getByTestId("authentication-enrollment");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __ackReached?: boolean }).__ackReached)).toBe(true);
  await expect(setup.getByLabel("Código de configuração")).toHaveCount(0);
  await setup.getByLabel("Nova palavra-passe").fill("Startup42");
  await setup.getByTestId("enrollment-confirm").click();
  await expect(page.getByTestId("WIN_MENU")).toBeVisible();
});

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
