import type { APIRequestContext, Page } from "@playwright/test";
import { expect, test } from "./support/authentication";
async function enter(page: Page, request: APIRequestContext, server: { origin: string; setupToken: string }) {
  const reply = await request.post(`${server.origin}/api/auth/enroll`, { data: { code: 1, password: "Synthetic42", token: server.setupToken } }); expect((await reply.json()).kind).toBe("continuar");
  await page.goto(server.origin); const access = page.getByTestId("WIN_Acesso"); await access.getByTestId("BTN_NoName1").click(); await page.getByTestId("user-picker").getByRole("cell", { name: "Administrador", exact: true }).dblclick(); await expect(access.getByTestId("EDT_palavra_passe")).toBeFocused(); await access.getByTestId("EDT_palavra_passe").fill("synthetic42"); await access.getByTestId("BTN_Confirmar").click(); await expect(page.getByTestId("WIN_MENU")).toBeVisible();
}
async function utility(page: Page) { const menu = page.getByTestId("WIN_MENU"); await menu.getByText("Utilitários", { exact: true }).click(); return menu.getByTestId("OPT_Clientes_Reparação"); }

test("SRC-1d228089f7 actual authenticated menu utility persists exact eligible customer reassignment once and displays source Terminado", async ({ page, request, authenticationServer, authenticationDatabase }) => {
  await authenticationDatabase.query('TRUNCATE app."ordem_reparacao",app."Viaturas",app."estados_reparacao" RESTART IDENTITY');
  await enter(page, request, authenticationServer);
  await authenticationDatabase.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,$1)', ["Old customer"]); await authenticationDatabase.query('INSERT INTO app."estados_reparacao" ("Codigo") VALUES ($1)', ["OPEN"]);
  await authenticationDatabase.query('INSERT INTO app."Viaturas" ("matricula","Cliente") VALUES ($1,18446744073709551615),($2,9)', ["MATCH", "HIDDEN"]);
  await authenticationDatabase.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_terceiro") VALUES (9007199254740993,$1,1,$2,199,999),(2,$3,1,$4,NULL,NULL)', ["MATCH", "OPEN", "HIDDEN", "MISSING"]);
  let release!: () => void, writes = 0; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/startup/reassign-customers", async route => { const response = await route.fetch(); writes++; await gate; await route.fulfill({ response }); });
  try { const action = await utility(page); await action.click(); await expect.poll(() => writes).toBe(1); await expect(action).toBeDisabled(); await expect(page.getByTestId("WIN_MENU").getByTestId("BTN_Clientes")).toBeDisabled(); release(); const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message.getByTestId("LIB_INFO")).toHaveText("Terminado"); await message.getByTestId("BTN_OK").click(); await expect(action).toBeEnabled();
    expect((await authenticationDatabase.query('SELECT "numero"::text,"recepcao_cliente"::text FROM app."ordem_reparacao" ORDER BY "numero" DESC')).rows).toEqual([{ numero: "9007199254740993", recepcao_cliente: "18446744073709551615" }, { numero: "2", recepcao_cliente: "1" }]); expect(writes).toBe(1);
  } finally { release(); await page.unroute("**/api/startup/reassign-customers"); }
});

test("SRC-1d228089f7 U03 actual utility refuses ambiguous owner before any write and never displays source success", async ({ page, request, authenticationServer, authenticationDatabase }) => {
  await authenticationDatabase.query('TRUNCATE app."ordem_reparacao",app."Viaturas",app."estados_reparacao" RESTART IDENTITY'); await enter(page, request, authenticationServer);
  await authenticationDatabase.query('INSERT INTO app."Clientes" ("Codigo") VALUES (1)'); await authenticationDatabase.query('INSERT INTO app."estados_reparacao" ("Codigo") VALUES ($1)', ["OPEN"]); await authenticationDatabase.query('INSERT INTO app."Viaturas" ("matricula","Cliente") VALUES ($1,2),($1,3)', ["AMBIGUOUS"]); await authenticationDatabase.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_estado") VALUES (1,$1,1,$2)', ["AMBIGUOUS", "OPEN"]);
  await (await utility(page)).click(); await expect(page.getByTestId("menu-action-diagnostic")).toHaveText("unresolved"); await expect(page.getByTestId("WINDEVMESSAGEBOX")).toHaveCount(0); expect((await authenticationDatabase.query('SELECT "recepcao_cliente"::text FROM app."ordem_reparacao"')).rows).toEqual([{ recepcao_cliente: "1" }]);
});

test("SRC-beeaf5ae4b actual authenticated Mapas inventory continues after No and successful reconstruction with persisted stock", async ({ page, request, authenticationServer, authenticationDatabase }) => {
  await authenticationDatabase.query('TRUNCATE app."artigos",app."documentos",app."cab_stocks",app."lin_stocks",app."material_reparacao" RESTART IDENTITY'); await enter(page, request, authenticationServer);
  await authenticationDatabase.query('INSERT INTO app."artigos" ("Codigo","Descricao","stock") VALUES ($1,$2,999.000)', ["MENU-INV", "Menu inventory"]); await authenticationDatabase.query('INSERT INTO app."documentos" ("Codigo","stock") VALUES ($1,1)', ["MENU-IN"]); await authenticationDatabase.query('INSERT INTO app."lin_stocks" ("artigo","documento_codigo","quantidade") VALUES ($1,$2,3.000)', ["MENU-INV", "MENU-IN"]);
  const menu = page.getByTestId("WIN_MENU"), action = menu.getByTestId("OPT_Inventário1"), prompt = page.getByRole("dialog", { name: "Reconstrução de Stocks", exact: true }), inventory = page.getByTestId("WIN_Inventario"); await menu.getByText("Mapas", { exact: true }).click(); await action.click(); await expect(prompt).toBeVisible(); await prompt.getByTestId("BTN_Reconstruir1").click(); await expect(prompt).toHaveCount(0); const row = inventory.getByRole("row").filter({ has: page.getByRole("cell", { name: "MENU-INV", exact: true }) }); await expect(row).toContainText("999,000"); await inventory.getByTestId("BTN_Sair").click();
  if (!await action.isVisible()) await menu.getByText("Mapas", { exact: true }).click(); await action.click(); await prompt.getByTestId("BTN_Reconstruir").click(); const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message.getByTestId("LIB_INFO")).toHaveText("Reconstrução terminada"); await message.getByTestId("BTN_OK").click(); await expect(prompt).toHaveCount(0); await expect(row).toContainText("3,000"); expect((await authenticationDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["MENU-INV"])).rows).toEqual([{ stock: "3.000" }]);
});
