import { expect, test } from "@playwright/test";

const launchers = [
  ["SRC-08cc189746", "Tabelas", "OPT_Clientes", "WIN_Table_Clientes"],
  ["SRC-6448eb3213", "Tabelas", "OPT_Viaturas", "WIN_Table_Viaturas"],
  ["SRC-91e8dc14f8", "Tabelas", "OPT_Artigos", "WIN_Table_artigos"],
  ["SRC-1d83b076e7", "Tabelas", "OPT_Estados_descritivos", "WIN_Table_estados_descritivos"],
  ["SRC-71de633816", "Tabelas", "OPT_Estados_de_Reparação", "WIN_Table_estados_reparacao"],
  ["SRC-242a5b7484", "Tabelas", "OPT_Documentos", "WIN_Table_documentos"],
  ["SRC-34942ef6f0", "Tabelas", "OPT_Terminais", "WIN_Table_Terminais"],
  ["SRC-84b951a5b2", "Tabelas", "OPT_Unidades", "WIN_Table_unidades"],
  ["SRC-99826c3ba9", "Tabelas", "OPT_Utilizadores", "WIN_Table_utilizadores"],
  ["SRC-f1671747dc", "Tabelas", "OPT_Mecânicos", "WIN_Table_mecanicos"],
  ["SRC-87763b02d7", "Menu", "OPT_Postos", "WIN_Table_postos"],
  ["SRC-927f1ae365", "", "BTN_Viaturas", "WIN_Table_Viaturas"],
  ["SRC-ec175a2444", "", "BTN_Ordens_reparacao", "WIN_Ordens_Reparacao"],
  ["SRC-e028d70833", "", "BTN_Artigos", "WIN_Table_artigos"],
  ["SRC-03607912bd", "", "BTN_movimentos_stock", "TABLE_cab_stocks"],
  ["SRC-5f76c51321", "", "BTN_tempos", "WIN_Tempos_Reparacao"],
  ["SRC-59704205b3", "", "BTN_material", "LIST_mecanicos"],
  ["SRC-6e1630ec80", "Movimentos", "OPT_Ordens_de_Reparação", "WIN_Ordens_Reparacao"],
  ["SRC-db14524700", "Movimentos", "OPT_Entradas_e_Saídas_de_Stock", "TABLE_cab_stocks"],
] as const;
for (const [id, group, name, target] of launchers) {
  test(`${id} actual menu launches ${target} once and restores its retained live instance`, async ({ page }) => {
    await page.goto("/?workflow=menu"); await page.getByTestId("startup-development-open").click();
    const menu = page.getByTestId("WIN_MENU");
    if (group) await menu.getByText(group, { exact: true }).click();
    const trigger = menu.getByTestId(name); await trigger.click();
    const screen = page.getByTestId(target); await expect(screen).toBeVisible();
    const frame = page.getByTestId("workspace-window-1"), title = frame.getByTestId("RADTitle");
    await expect(title).toBeVisible();
    const originalNode = await frame.elementHandle(); await expect(frame).toHaveAttribute("data-active", "true");
    if (group) await menu.getByText(group, { exact: true }).click();
    await menu.getByTestId(target === "WIN_Table_Clientes" ? "BTN_Viaturas" : "BTN_Clientes").click();
    if (group) await menu.getByText(group, { exact: true }).click();
    const competitor = page.getByTestId("workspace-window-2"); await expect(competitor).toHaveAttribute("data-active", "true"); await expect(frame).toHaveAttribute("data-active", "false");
    await trigger.click(); await expect(frame).toHaveAttribute("data-active", "true"); await expect(competitor).toHaveAttribute("data-active", "false");
    expect(await originalNode!.evaluate(node => node.isConnected && node === document.querySelector('[data-testid="workspace-window-1"]'))).toBe(true);
    await expect(page.locator(".wd-workspace-window")).toHaveCount(2);
    await frame.getByRole("button", { name: "Minimizar", exact: true }).click(); await expect(frame).toBeHidden();
    await trigger.click(); await expect(frame).toBeVisible(); await expect(frame).toHaveAttribute("data-active", "true"); await expect(screen).toBeVisible(); await expect(page.locator(".wd-workspace-window")).toHaveCount(2);
    await frame.getByTestId("BTN_SYST_FERMER").click(); await expect(screen).toHaveCount(0);
    await trigger.click(); await expect(screen).toBeVisible(); await expect(page.getByTestId("workspace-window-3")).toHaveAttribute("data-active", "true"); await expect(page.locator(".wd-workspace-window")).toHaveCount(2);
  });
}

test("WIN_Acesso proposed chrome preserves the password draft, restores focus and cancel ends the actual shell", async ({ page }) => {
  await page.goto("/?workflow=menu"); await page.getByTestId("startup-access-open").click(); const access = page.getByTestId("WIN_Acesso");
  const field = access.getByTestId("EDT_palavra_passe"), frame = access.locator(".wd-frame"), original = (await frame.boundingBox())!;
  await field.fill("Synthetic42"); await access.getByTestId("BTN_Syst_Maximize").click(); expect((await frame.boundingBox())!.width).toBeGreaterThan(original.width);
  await access.getByTestId("BTN_Syst_Maximize").click(); expect((await frame.boundingBox())!.width).toBe(original.width);
  await field.focus(); await access.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(field).toBeHidden();
  await page.getByTestId("startup-access-restore").click(); await expect(field).toHaveValue("Synthetic42"); await expect(field).toBeFocused();
  await access.getByTestId("BTN_SYST_FERMER").click(); await expect(access).toHaveCount(0); await expect(page.getByTestId("startup-terminated")).toBeVisible();
  await page.getByRole("button", { name: "Reabrir", exact: true }).click(); await page.getByTestId("startup-access-open").click();
  await expect(field).toHaveValue(""); await access.getByTestId("BTN_Cancelar").click(); await expect(page.getByTestId("startup-terminated")).toBeVisible();
});

test("WIN_sistema proposed chrome retains draft and close/cancel leave persisted settings unchanged", async ({ page }) => {
  let writes = 0; page.on("request", request => { if (request.url().endsWith("/api/startup/system/save")) writes++; });
  await page.goto("/?workflow=menu"); await page.getByTestId("startup-development-open").click(); const menu = page.getByTestId("WIN_MENU");
  await menu.getByText("Menu", { exact: true }).click(); await menu.getByTestId("OPT_Sistema").click();
  const system = page.getByTestId("WIN_sistema"), field = system.getByTestId("EDT_Atualizacao_materiais"), frame = system.locator(".wd-frame");
  await expect(field).toBeEnabled(); const value = await field.inputValue(), original = (await frame.boundingBox())!;
  await field.fill("98"); await system.getByTestId("BTN_Syst_Maximize").click(); expect((await frame.boundingBox())!.width).toBeGreaterThan(original.width);
  await system.getByTestId("BTN_Syst_Maximize").click(); expect((await frame.boundingBox())!.width).toBe(original.width);
  await field.focus(); await system.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(field).toBeHidden(); await page.getByTestId("system-restore").click();
  await expect(field).toHaveValue("98"); await expect(field).toBeFocused(); await system.getByTestId("BTN_SYST_FERMER").click(); await expect(system).toHaveCount(0);
  await menu.getByTestId("OPT_Sistema").click(); await expect(field).toHaveValue(value); await field.fill("97"); await system.getByTestId("BTN_Cancelar").click();
  await menu.getByTestId("OPT_Sistema").click(); await expect(field).toHaveValue(value); expect(writes).toBe(0);
});

test("WIN_MENU proposed chrome retains its actual child and closes the entered shell", async ({ page }) => {
  await page.goto("/?workflow=menu"); await page.getByTestId("startup-development-open").click(); const menu = page.getByTestId("WIN_MENU"), frame = page.getByTestId("startup-menu-frame");
  await menu.getByTestId("BTN_Clientes").click(); const child = page.getByTestId("WIN_Table_Clientes"); await expect(child).toBeVisible();
  const width = (await frame.boundingBox())!.width; await frame.getByTestId("BTN_Syst_Maximize").first().click(); expect((await frame.boundingBox())!.width).toBeLessThan(width);
  await frame.getByTestId("BTN_Syst_Maximize").first().click(); expect((await frame.boundingBox())!.width).toBe(width);
  await frame.getByTestId("BTN_SYST_MINIMIZE").first().click(); await expect(child).toBeHidden(); await page.getByTestId("startup-menu-restore").click(); await expect(child).toBeVisible();
  await frame.getByTestId("BTN_SYST_FERMER").first().click(); await expect(menu).toHaveCount(0); await expect(page.getByTestId("startup-terminated")).toBeVisible();
});
