import { expect, test } from "./support/startup";

test("MIG12 development menu opens actual customer list once, restores minimized state and edits real system settings", async ({ page, startupServer }) => {
  await page.goto(`${startupServer.origin}/?workflow=menu`);
  await page.getByTestId("startup-development-open").click();
  const menu = page.getByTestId("WIN_MENU");
  await menu.getByTestId("BTN_Clientes").click();
  const screen = page.getByTestId("WIN_Table_Clientes"); await expect(screen).toBeVisible();
  const frame = page.getByTestId("workspace-window-1");
  await menu.getByTestId("BTN_Clientes").click(); await expect(page.locator(".wd-workspace-window")).toHaveCount(1);
  await frame.getByRole("button", { name: "Minimizar", exact: true }).click(); await expect(frame).toBeHidden();
  await menu.getByTestId("BTN_Clientes").click(); await expect(frame).toBeVisible(); await expect(page.locator(".wd-workspace-window")).toHaveCount(1);
  await menu.getByText("Menu", { exact: true }).click(); await menu.getByTestId("OPT_Sistema").click();
  const system = page.getByTestId("WIN_sistema"); await expect(system.getByTestId("EDT_Atualizacao_materiais")).toHaveValue("15");
  await system.getByTestId("EDT_Atualizacao_materiais").fill("30");
  await system.getByTestId("EDT_encerrar_tempos_1").fill("04:05:06");
  await system.getByTestId("BTN_Guardar").click(); await expect(system).toHaveCount(0);
  expect((await startupServer.database.query('SELECT "Tempo_materiais"::text,"encerrar_tempos1" FROM app."sistema"')).rows).toEqual([{ Tempo_materiais: "30", encerrar_tempos1: "040506" }]);
  await startupServer.database.query('UPDATE app."sistema" SET "Tempo_materiais"=9007199254740993');
  await menu.getByText("Menu", { exact: true }).click();
  await menu.getByTestId("OPT_Sistema").click(); await expect(system.getByTestId("EDT_Atualizacao_materiais")).toHaveValue("9007199254740993");
  await system.getByTestId("EDT_Data_inicio").fill("8"); await system.getByTestId("BTN_Guardar").click(); await expect(system).toHaveCount(0);
  expect((await startupServer.database.query('SELECT "Tempo_materiais"::text FROM app."sistema"')).rows[0].Tempo_materiais).toBe("9007199254740993");
});

test("SRC-7891e7fd29 access uses actual public user picker, source uppercase and protected compare; cancel ends shell", async ({ page, startupServer, startupDatabase }) => {
  await startupDatabase.query('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,2,$1,$2)', ["Synthetic access user", "SYNTHETIC"]);
  await page.goto(`${startupServer.origin}/?workflow=menu`); await page.getByTestId("startup-access-open").click();
  const access = page.getByTestId("WIN_Acesso"); await access.getByTestId("BTN_NoName1").click();
  const picker = page.getByTestId("user-picker"); await picker.getByRole("cell", { name: "Synthetic access user", exact: true }).dblclick(); await expect(picker).toHaveCount(0);
  await expect(access.getByTestId("EDT_utilizador")).toHaveValue("Synthetic access user");
  await access.getByTestId("EDT_palavra_passe").fill("wrong"); await access.getByTestId("BTN_Confirmar").click();
  const info = page.getByTestId("WINDEVMESSAGEBOX"); await expect(info.getByTestId("LIB_INFO")).toHaveText("Utilizador e/ou palavra-passe incorreto(s)"); await info.getByTestId("BTN_OK").click();
  await expect(access.getByTestId("EDT_palavra_passe")).toHaveValue("WRONG");
  await access.getByTestId("EDT_palavra_passe").fill("synthetic"); await access.getByTestId("BTN_Confirmar").click();
  await expect(access).toHaveCount(0); await expect(page.getByTestId("WIN_MENU")).toBeVisible();
  await page.goto(`${startupServer.origin}/?workflow=menu`); await page.getByTestId("startup-access-open").click(); await page.getByTestId("WIN_Acesso").getByTestId("BTN_Cancelar").click();
  await expect(page.getByTestId("startup-terminated")).toBeVisible();
});

test("SRC-c9144a3e08 actual touch keyboard obeys caps/accent/physical mapping and returns original on cancel", async ({ page, startupServer }) => {
  await page.goto(`${startupServer.origin}/?workflow=menu&modulo=t`); await page.getByTestId("startup-access-open").click();
  const access = page.getByTestId("WIN_Acesso"), password = access.getByTestId("EDT_palavra_passe");
  await password.click(); const keyboard = page.getByTestId("WIN_Teclado_Alfa"); await expect(keyboard).toBeVisible();
  await keyboard.getByTestId("BTN_CapsLock").click(); await keyboard.getByTestId("BTN_acento_agudo").click(); await keyboard.getByTestId("BTN_a").click();
  await page.keyboard.type("b,"); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("Áb;");
  await page.screenshot({ path: test.info().outputPath("alpha-keyboard.png") });
  await keyboard.getByTestId("BTN_confirmar").click(); await expect(password).toHaveValue("Áb;");
  await password.click(); await keyboard.getByTestId("BTN_apagar_tudo").click(); await keyboard.getByTestId("BTN_cancelar").click(); await expect(password).toHaveValue("Áb;");
});

test("SRC-d4c076708a numeric keyboard uses real touch and physical keys, exact return, source Backspace clear and cancel original", async ({ page, startupServer }) => {
  await page.goto(`${startupServer.origin}/?workflow=touch-keyboards&value=9007199254740993.125`);
  await page.getByTestId("touch-keyboard-open").click(); const keyboard = page.getByTestId("WIN_Teclado_numerico");
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("9007199254740993.125");
  await keyboard.getByTestId("BTN_confirmar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("9007199254740993.125");
  await page.getByTestId("touch-keyboard-open").click(); await keyboard.getByTestId("BTN_dois").click(); await page.keyboard.type(".1234");
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("2.123");
  await page.screenshot({ path: test.info().outputPath("numeric-keyboard.png") });
  await page.keyboard.press("Backspace"); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("0.");
  await keyboard.getByTestId("BTN_cancelar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("9007199254740993.125");
});
