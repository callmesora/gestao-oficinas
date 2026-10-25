import { expect, test } from "./support/startup";

test("source keyboard options apply to actual caller returns and caption preserves its distinct focus continuation", async ({ page, startupServer }) => {
  await page.goto(`${startupServer.origin}/?workflow=touch-keyboards&kind=alpha&value=&maxLength=2&password=nomepasta`);
  await page.getByTestId("touch-keyboard-open").click(); const alpha = page.getByTestId("WIN_Teclado_Alfa");
  for (const name of ["BTN_barra_direita", "BTN_barra_esquerda", "BTN_dois_pontos", "BTN_asterisco", "BTN_ponto_interrogacao", "BTN_aspas"]) await expect(alpha.getByTestId(name)).toBeDisabled();
  await expect(alpha.getByTestId("EDT_Texto")).toHaveAttribute("type", "text");
  await alpha.getByTestId("BTN_a").click(); await alpha.getByTestId("BTN_b").click(); await alpha.getByTestId("BTN_c").click();
  await expect(alpha.getByTestId("EDT_Texto")).toHaveValue("ab");
  await alpha.getByTestId("BTN_apagar_ultimo").click(); await alpha.getByTestId("BTN_Caption").click();
  await expect(alpha.getByTestId("EDT_Texto")).toHaveValue("a7"); await expect(alpha.getByTestId("BTN_Caption")).toBeFocused();
  await alpha.getByTestId("BTN_confirmar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("a7");
  await page.goto(`${startupServer.origin}/?workflow=touch-keyboards&kind=alpha&value=secret&password=true`);
  await page.getByTestId("touch-keyboard-open").click(); await expect(alpha.getByTestId("EDT_Texto")).toHaveAttribute("type", "password");
  await alpha.getByTestId("BTN_cancelar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("secret");
});

test("numeric limits show exact source Info then resume manual focus and real caller confirmation", async ({ page, startupServer }) => {
  await page.goto(`${startupServer.origin}/?workflow=touch-keyboards&value=8&decimals=2&lower=1&upper=9`);
  await page.getByTestId("touch-keyboard-open").click(); const keyboard = page.getByTestId("WIN_Teclado_numerico");
  await expect(keyboard.getByTestId("BTN_menos")).toBeDisabled();
  await keyboard.getByTestId("BTN_zero").click(); await keyboard.getByTestId("BTN_confirmar").click();
  const info = page.getByTestId("WINDEVMESSAGEBOX"); await expect(info.getByTestId("LIB_INFO")).toHaveText("Valor fora dos limites (1 - 9)");
  await info.getByTestId("BTN_OK").click(); await expect(keyboard.getByTestId("EDT_input_manual")).toBeFocused();
  await keyboard.getByTestId("BTN_nove").click(); await keyboard.getByTestId("BTN_nove").click(); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("9.");
  await page.keyboard.press("Enter"); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("9");
});

test("actual system save rejects hybrid times without writes and source toolbar traverses known Tab order", async ({ page, startupServer }) => {
  await page.goto(`${startupServer.origin}/?workflow=menu`); await page.getByTestId("startup-development-open").click(); const menu = page.getByTestId("WIN_MENU");
  await expect(menu.getByTestId("BTN_Clientes")).toBeEnabled();
  const controls = await menu.locator(".startup-quick-bar button").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-testid")));
  expect(controls).toEqual(["BTN_movimentos_stock", "BTN_tempos", "BTN_Clientes", "BTN_Viaturas", "BTN_Ordens_reparacao", "BTN_Artigos", "BTN_material"]);
  await menu.getByText("Menu", { exact: true }).click(); await menu.getByTestId("OPT_Sistema").click(); const system = page.getByTestId("WIN_sistema"), time = system.getByTestId("EDT_encerrar_tempos_1");
  await time.fill("03:0000"); await system.getByTestId("BTN_Guardar").click(); await expect(time).toHaveAttribute("aria-invalid", "true"); await expect(time).toBeFocused();
  expect((await startupServer.database.query('SELECT "encerrar_tempos1" FROM app."sistema"')).rows[0].encerrar_tempos1).toBe("030000");
  await time.fill("23:59:59"); await system.getByTestId("BTN_Guardar").click(); await expect(system).toHaveCount(0);
  expect((await startupServer.database.query('SELECT "encerrar_tempos1" FROM app."sistema"')).rows[0].encerrar_tempos1).toBe("235959");
});


test("access touch keyboard responds to the source left-button event only", async ({ page, startupServer }) => {
  await page.goto(`${startupServer.origin}/?workflow=menu&modulo=t`); await page.getByTestId("startup-access-open").click();
  const password = page.getByTestId("WIN_Acesso").getByTestId("EDT_palavra_passe");
  await password.click({ button: "right" }); await expect(page.getByTestId("WIN_Teclado_Alfa")).toHaveCount(0);
  await password.click(); await expect(page.getByTestId("WIN_Teclado_Alfa")).toBeVisible();
  await page.getByTestId("WIN_Teclado_Alfa").getByTestId("BTN_cancelar").click(); await expect(password).toHaveValue("");
});


test("access retains source Tab order around its initial password focus", async ({ page, startupServer }) => {
  await page.goto(`${startupServer.origin}/?workflow=menu`); await page.getByTestId("startup-access-open").click();
  const access = page.getByTestId("WIN_Acesso"); await expect(access.getByTestId("EDT_palavra_passe")).toBeFocused();
  for (const name of ["BTN_Confirmar", "BTN_Cancelar", "BTN_NoName1", "EDT_utilizador", "EDT_palavra_passe"]) {
    await page.keyboard.press("Tab"); await expect(access.getByTestId(name)).toBeFocused();
  }
});
