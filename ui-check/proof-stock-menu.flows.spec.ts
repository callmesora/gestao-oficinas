import { test, expect } from "./support/functional-menu";

test("stock proof actual menu successful inventory reconstruction awaits completion Info and opens recomputed inventory", async ({ page, functionalMenuServer, functionalMenuDatabase }) => {
  await page.goto(functionalMenuServer.origin); const enrollment = page.getByTestId("authentication-enrollment");
  await enrollment.getByLabel("Código de configuração").fill(functionalMenuServer.setupToken); await enrollment.getByLabel("Nova palavra-passe").fill("SyntheticMenu42"); await enrollment.getByTestId("enrollment-confirm").click();
  const menu = page.getByTestId("WIN_MENU"); await expect(menu).toBeVisible(); await menu.getByText("Mapas", { exact: true }).click(); await menu.getByTestId("OPT_Inventário1").click();
  const prompt = page.locator('dialog[data-testid="WIN_Inventario_Reconstrucao"]'); await expect(prompt).toContainText("Pretende fazê-lo agora?");
  const rebuilt = page.waitForResponse(response => response.url().endsWith("/api/stock/rebuild")); await prompt.getByTestId("BTN_Reconstruir").click(); expect((await (await rebuilt).json()).kind).toBe("rebuilt");
  await expect(page.getByTestId("LIB_INFO")).toHaveText("Reconstrução terminada"); await expect(page.getByTestId("WIN_Inventario")).toHaveCount(0);
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await expect(prompt).toHaveCount(0);
  const inventory = page.getByTestId("WIN_Inventario"), table = inventory.getByTestId("TABLE_Artigos"); await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(table.getByRole("cell", { name: "-2,100", exact: true })).toBeVisible(); await expect(table.getByRole("cell", { name: "-1,500", exact: true })).toBeVisible();
  expect((await functionalMenuDatabase.query('SELECT "Codigo","stock"::text FROM app."artigos" ORDER BY "Codigo"')).rows).toEqual([{ Codigo: "A", stock: "-2.1" }, { Codigo: "B", stock: "-1.5" }]);
  await inventory.getByTestId("BTN_Sair").click(); await expect(inventory).toHaveCount(0); await expect(menu).toBeVisible();
});
