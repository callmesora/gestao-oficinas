import type { APIRequestContext, Page } from "@playwright/test";
import { expect, test } from "./support/authentication";
const password = "Synthetic42";
async function seed(request: APIRequestContext, server: { origin: string; setupToken: string }) {
  const result = await request.post(`${server.origin}/api/auth/enroll`, { data: { code: 1, password, token: server.setupToken } }); expect(result.status()).toBe(200); const reply = await result.json(); expect(reply.kind).toBe("continuar"); return reply.session.token as string;
}
async function selectUser(page: Page, name = "Administrador") {
  const access = page.getByTestId("WIN_Acesso"); await access.getByTestId("BTN_NoName1").click(); await page.getByTestId("user-picker").getByRole("cell", { name, exact: true }).dblclick(); await expect(access.getByTestId("EDT_utilizador")).toHaveValue(name); await expect(access.getByTestId("EDT_palavra_passe")).toBeFocused();
}
async function login(page: Page, name = "Administrador", secret = password) { await selectUser(page, name); const access = page.getByTestId("WIN_Acesso"); await access.getByTestId("EDT_palavra_passe").fill(secret); await access.getByTestId("BTN_Confirmar").click(); await expect(page.getByTestId("WIN_MENU")).toBeVisible(); }
async function userMenu(page: Page) { const menu = page.getByTestId("WIN_MENU"); await menu.getByText("Tabelas", { exact: true }).click(); await menu.getByTestId("OPT_Utilizadores").click(); return page.getByTestId("WIN_Table_utilizadores"); }

test("ADR004 default business entry enrolls once, opens actual customer CRUD and source defaults, then revokes logout without DEV sessions", async ({ page, request, authenticationServer, authenticationDatabase }) => {
  const seen: string[] = []; page.on("request", item => { if (item.url().includes("/api/")) seen.push(new URL(item.url()).pathname); });
  await page.goto(authenticationServer.origin); const setup = page.getByTestId("authentication-enrollment"); await expect(setup).toBeVisible(); await expect(setup.getByLabel("Utilizador de configuração")).toHaveValue("Administrador");
  await setup.getByLabel("Código de configuração").fill(authenticationServer.setupToken); await setup.getByLabel("Nova palavra-passe").fill(password); const created = page.waitForResponse(item => item.url().endsWith("/api/auth/enroll")); await setup.getByTestId("enrollment-confirm").click(); const reply = await (await created).json();
  const menu = page.getByTestId("WIN_MENU"); await expect(menu).toBeVisible(); expect(seen.filter(path => path === "/api/auth/status")).toHaveLength(1); await expect(page.getByTestId("startup-development-open")).toHaveCount(0);
  await menu.getByTestId("BTN_Clientes").click(); const list = page.getByTestId("WIN_Table_Clientes"); await list.getByTestId("Btn_New").click(); const form = page.getByTestId("WIN_Form_Clientes"); await form.getByTestId("EDT_Codigo").fill("771"); await form.getByTestId("EDT_Descricao").fill("Authenticated customer"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); await expect(list.getByRole("cell", { name: "Authenticated customer", exact: true })).toBeVisible();
  expect((await authenticationDatabase.query('SELECT "Descricao" FROM app."Clientes" WHERE "Codigo"=771')).rows).toEqual([{ Descricao: "Authenticated customer" }]); expect((await authenticationDatabase.query('SELECT "Tempo_materiais"::text,"Data_inicio","encerrar_tempos1" FROM app."sistema"')).rows).toEqual([{ Tempo_materiais: "15", Data_inicio: 7, encerrar_tempos1: "030000" }]);
  const storage = await page.evaluate(() => [...Object.values(localStorage), ...Object.values(sessionStorage)]); expect(storage.some(value => value.includes(reply.session.token))).toBe(false);
  await page.getByTestId("business-logout").click(); await expect(page.getByTestId("WIN_Acesso")).toBeVisible(); await expect(list).toHaveCount(0); expect((await authenticationDatabase.query('SELECT count(*)::text AS count FROM auth.sessions')).rows[0].count).toBe("0");
  const denied = await request.post(`${authenticationServer.origin}/api/customers/list`, { data: {} }); expect(denied.status()).toBe(401); expect(seen).not.toContain("/api/development/session");
});

test("SRC-7891e7fd29 production access requires actual selected public user, exact wrong-password message, Upper and login after browser restart", async ({ page, request, authenticationServer }) => {
  await seed(request, authenticationServer); await page.goto(authenticationServer.origin); const access = page.getByTestId("WIN_Acesso"); await expect(access).toBeVisible(); await access.getByTestId("EDT_palavra_passe").fill(password); await access.getByTestId("BTN_Confirmar").click(); await expect(access).toBeVisible(); await expect(page.getByTestId("WIN_MENU")).toHaveCount(0);
  const publicReply = page.waitForResponse(item => item.url().endsWith("/api/auth/users")); await selectUser(page); expect((await (await publicReply).json()).users).toEqual([{ Codigo: 1, Descricao: "Administrador" }]);
  await access.getByTestId("EDT_palavra_passe").fill("wrong"); await access.getByTestId("BTN_Confirmar").click(); const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message.getByTestId("LIB_INFO")).toHaveText("Utilizador e/ou palavra-passe incorreto(s)"); await message.getByTestId("BTN_OK").click(); await expect(access.getByTestId("EDT_palavra_passe")).toHaveValue("WRONG");
  await access.getByTestId("EDT_palavra_passe").fill("synthetic42"); await access.getByTestId("BTN_Confirmar").click(); await expect(page.getByTestId("WIN_MENU")).toBeVisible(); await page.reload(); await expect(access).toBeVisible(); await expect(page.getByTestId("WIN_MENU")).toHaveCount(0); await access.getByTestId("BTN_Cancelar").click(); await expect(page.getByTestId("startup-terminated")).toBeVisible();
});

test("ADR004 existing imported account enrollment uses actual selected-user picker and only explicitly resets that account", async ({ page, authenticationServer, authenticationDatabase }) => {
  await authenticationDatabase.query('INSERT INTO app."utilizadores" ("Codigo","Descricao","palavra_passe") VALUES (7,$1,$2),(8,$3,$4)', ["Selected imported", "OLD-SYNTHETIC", "Other imported", "OTHER-SYNTH"]);
  await page.goto(authenticationServer.origin); const setup = page.getByTestId("authentication-enrollment"); await setup.getByTestId("enrollment-user-picker").click(); await page.getByTestId("user-picker").getByRole("cell", { name: "Selected imported", exact: true }).dblclick(); await expect(setup.getByLabel("Utilizador de configuração")).toHaveValue("Selected imported"); await setup.getByLabel("Código de configuração").fill(authenticationServer.setupToken); await setup.getByLabel("Nova palavra-passe").fill(password); await setup.getByTestId("enrollment-confirm").click(); await expect(page.getByTestId("WIN_MENU")).toBeVisible();
  expect((await authenticationDatabase.query('SELECT "Codigo","palavra_passe" IS NULL AS cleared FROM app."utilizadores" ORDER BY "Codigo"')).rows).toEqual([{ Codigo: 7, cleared: true }, { Codigo: 8, cleared: false }]); await expect(page.getByTestId("business-session-user")).toHaveText("Selected imported");
});

test("ADR004 actual user editor keeps blank managed password unchanged, then self-reset revokes the real session and requires the new password", async ({ page, request, authenticationServer, authenticationDatabase }) => {
  await seed(request, authenticationServer); await page.goto(authenticationServer.origin); const loginReply = page.waitForResponse(item => item.url().endsWith("/api/auth/login")); await login(page); const oldToken = (await (await loginReply).json()).session.token;
  const list = await userMenu(page), form = page.getByTestId("WIN_Form_utilizadores"); await list.getByRole("cell", { name: "Administrador", exact: true }).dblclick(); const secret = form.getByTestId("EDT_Palavra_passe"); await expect(secret).toHaveValue(""); await expect(secret).toHaveAttribute("placeholder", "Manter palavra-passe atual"); await form.getByTestId("EDT_Descricao").fill("Renamed user"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); await expect(list.getByRole("cell", { name: "Renamed user", exact: true })).toBeVisible(); await expect(page.getByTestId("WIN_MENU")).toBeVisible();
  await list.getByRole("cell", { name: "Renamed user", exact: true }).dblclick(); await secret.fill("Replacement42"); await form.getByTestId("BTN_Validar").click(); const access = page.getByTestId("WIN_Acesso"); await expect(access).toBeVisible(); await expect(list).toHaveCount(0); await expect((await request.post(`${authenticationServer.origin}/api/auth/session`, { headers: { Authorization: `Bearer ${oldToken}` }, data: {} })).json()).resolves.toEqual({ kind: "unauthenticated" });
  await selectUser(page, "Renamed user"); await access.getByTestId("EDT_palavra_passe").fill(password); await access.getByTestId("BTN_Confirmar").click(); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await access.getByTestId("EDT_palavra_passe").fill("replacement42"); await access.getByTestId("BTN_Confirmar").click(); await expect(page.getByTestId("WIN_MENU")).toBeVisible(); expect((await authenticationDatabase.query('SELECT "palavra_passe" FROM app."utilizadores"')).rows[0].palavra_passe).toBeNull();
});

test("ADR004 external revocation on an actual protected customer request clears all business windows and returns to access", async ({ page, request, authenticationServer, authenticationDatabase }) => {
  await seed(request, authenticationServer); await page.goto(authenticationServer.origin); await login(page); await authenticationDatabase.query('DELETE FROM auth.sessions'); await page.getByTestId("WIN_MENU").getByTestId("BTN_Clientes").click(); await expect(page.getByTestId("WIN_Acesso")).toBeVisible(); await expect(page.getByTestId("WIN_Table_Clientes")).toHaveCount(0); await expect(page.getByTestId("startup-diagnostic")).toHaveText("A sessão terminou. Volte a indicar o utilizador e a palavra-passe.");
});

for (const [query, expected] of [["artigos=1", "articles"], ["modulo=t&artigos=1", "labor"], ["modulo=m&artigos=1", "materials"]] as const) test(`SRC-a4579f6e05 production startup honors source ${expected} presentation after authenticated access`, async ({ page, request, authenticationServer }) => {
  await seed(request, authenticationServer); await page.goto(`${authenticationServer.origin}/?${query}`);
  if (expected === "articles") { await login(page); const menu = page.getByTestId("WIN_MENU"); await expect(menu.locator("nav")).toHaveCount(0); await expect(menu.getByTestId("BTN_Clientes")).toHaveCount(0); await expect(menu.getByTestId("BTN_Artigos")).toBeVisible(); await expect(menu.getByTestId("BTN_movimentos_stock")).toBeVisible(); }
  else { await selectUser(page); const access = page.getByTestId("WIN_Acesso"); await access.getByTestId("EDT_palavra_passe").fill(password); await access.getByTestId("BTN_Confirmar").click(); await expect(expected === "labor" ? page.getByTestId("WIN_Tempos_Reparacao") : page.getByRole("region", { name: "Materiais de Reparação", exact: true })).toBeVisible(); await page.getByTestId("workspace-window-1").getByTestId("BTN_SYST_FERMER").click(); await expect(page.getByTestId("startup-terminated")).toBeVisible(); }
});

test("captured production material module reaches actual article touch search without reading the browser query again", async ({ page, request, authenticationServer, authenticationDatabase }) => {
  await seed(request, authenticationServer);
  await authenticationDatabase.query(`INSERT INTO app."sistema" ("Tempo_materiais") VALUES (60);
    INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'CAPTURED CLIENT');
    INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ('CAPTURED',1,'MARCA','MODELO');
    INSERT INTO app."mecanicos" ("Codigo","Descricao","inativo") VALUES (2,'CAPTURED MECHANIC',false);
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo","lancar_material") VALUES ('R','Reparação',3,true);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico") VALUES (10,'CAPTURED',1,'R',2);
    INSERT INTO app."artigos" ("Codigo","Descricao","preco","stock","inativo") VALUES ('A','CAPTURED ARTICLE',1,10,false)`);
  await page.goto(`${authenticationServer.origin}/?modulo=m`);
  await expect(page.getByTestId("WIN_Acesso")).toBeVisible();
  await page.evaluate(() => history.replaceState(null, "", "/"));
  await selectUser(page); const access = page.getByTestId("WIN_Acesso");
  await access.getByTestId("EDT_palavra_passe").fill(password); await access.getByTestId("BTN_Confirmar").click();
  const list = page.getByRole("region", { name: "Materiais de Reparação", exact: true }); await expect(list).toBeVisible();
  await list.getByRole("cell", { name: "10", exact: true }).click(); await list.getByTestId("BTN_Material").click();
  const material = page.getByTestId("WIN_Material_reparacao_form"); await expect(material.getByTestId("BTN_NoName2")).toBeEnabled();
  await material.getByTestId("BTN_NoName2").click(); const picker = page.getByTestId("article-picker");
  await picker.getByTestId("EDT_termo_pesquisa").click(); const keyboard = page.getByTestId("WIN_Teclado_Alfa");
  await expect(keyboard).toBeVisible(); await keyboard.getByTestId("BTN_c").click(); await keyboard.getByTestId("BTN_confirmar").click();
  await expect(picker.getByTestId("EDT_termo_pesquisa")).toHaveValue("c");
});
