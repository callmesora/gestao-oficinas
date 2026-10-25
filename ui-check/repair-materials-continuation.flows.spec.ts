import type { Page } from "@playwright/test";
import { test, expect } from "./support/repair-materials";

async function list(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-materials`);
  await page.getByTestId("repair-materials-open").click();
  await expect(page.getByTestId("TABLE_ordens_reparacao").locator("tbody tr")).toHaveCount(1);
}
async function open(page: Page, origin: string) {
  const reads: string[] = [];
  const observeRead = (request: { url(): string }) => { if (new URL(request.url()).pathname === "/api/repair-materials/read") reads.push(request.url()); };
  page.on("request", observeRead);
  await list(page, origin);
  await page.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "9007199254740993", exact: true }).click();
  await page.getByTestId("BTN_Material").click();
  const form = page.getByTestId("WIN_Material_reparacao_form");
  await expect(form.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA");
  // Actual StrictMode mount must own one read, not two competing NOWAIT writers.
  expect(reads).toHaveLength(1); page.off("request", observeRead); return form;
}
async function chooseMechanic(page: Page, description: string) {
  await page.getByTestId("WIN_Material_reparacao_form").getByTestId("BTN_NoName1").click();
  const picker = page.getByTestId("WIN_Table_mecanicos");
  await picker.getByTestId("TABLE_mecanicos").getByRole("cell", { name: description, exact: true }).click();
  await picker.getByTestId("BTN_selecionar").click();
}

test("SRC-08f76d0b2c actual mechanic picker handles inactive, wrong and cancelled passwords; same actor refresh still checks current inactivity", async ({ page, materialServer, materialDatabase }) => {
  const form = await open(page, materialServer.origin);
  await chooseMechanic(page, "INATIVO"); await expect(page.getByTestId("LIB_INFO")).toHaveText("Mecânico inativo");
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await expect(page.getByTestId("WIN_Inserir_quantidade_password")).toHaveCount(0);
  await chooseMechanic(page, "ANA"); let prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await prompt.getByTestId("EDT_password").fill("wrong"); await prompt.getByTestId("BTN_Confirmar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText("Palavra-passe incorreta"); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await chooseMechanic(page, "ANA"); prompt = page.getByTestId("WIN_Inserir_quantidade_password"); await prompt.getByTestId("BTN_Cancelar").click();
  await expect(form.getByTestId("EDT_mecanico")).toHaveValue("ANA");
  await chooseMechanic(page, "ANA"); prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await prompt.getByTestId("EDT_password").fill("Synthetic"); await prompt.getByTestId("BTN_Confirmar").click();
  await materialDatabase.query('UPDATE app."mecanicos" SET "Descricao"=$1 WHERE "Codigo"=7', ["RENOMEADA"]);
  await chooseMechanic(page, "RENOMEADA"); await expect(form.getByTestId("EDT_mecanico")).toHaveValue("RENOMEADA");
  await expect(page.getByTestId("WIN_Inserir_quantidade_password")).toHaveCount(0);
  await materialDatabase.query('UPDATE app."mecanicos" SET "inativo"=TRUE WHERE "Codigo"=7');
  await chooseMechanic(page, "RENOMEADA"); await expect(page.getByTestId("LIB_INFO")).toHaveText("Mecânico inativo");
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  expect((await materialDatabase.query('SELECT count(*)::text AS count FROM app."material_reparacao"')).rows[0].count).toBe("1");
});

test("SRC-89e26eed26 SRC-d38bb48866 SRC-0f727cefd6 SRC-ca66909c26 SRC-199720cd56 actual navigation, price, description and both delete branches preserve drafts until Sair", async ({ page, materialServer, materialDatabase }) => {
  await materialDatabase.query('INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","preco","data_hora","lancado") VALUES (2,9007199254740993,7,$1,$2,10,10,$3,FALSE)', ["B", "Second", "20240301120000000"]);
  const form = await open(page, materialServer.origin), table = form.getByTestId("TABLE_material");
  await table.getByRole("cell", { name: "Original", exact: true }).click();
  await form.getByTestId("BTN_anterior").click(); await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("Original");
  await form.getByTestId("BTN_seguinte").click(); await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("Second");
  await form.getByTestId("BTN_seguinte").click(); await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("Second");
  await form.getByTestId("BTN_Preço").click(); let prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await expect(prompt.getByTestId("RADTitle")).toHaveText("Alterar preço"); await prompt.getByTestId("EDT_quantidade").fill("4,75"); await prompt.getByTestId("BTN_Confirmar").click();
  await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("4,750");
  await form.getByTestId("BTN_Descricao").click(); prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await expect(prompt.getByTestId("RADTitle")).toHaveText("Alterar descrição"); await prompt.getByTestId("EDT_descricao").fill("Changed"); await prompt.getByTestId("BTN_Confirmar").click();
  await expect(table).toContainText("Changed");
  await form.getByTestId("BTN_anterior").click(); await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("Original");
  await form.getByTestId("BTN_Eliminar").click(); let confirm = page.getByTestId("WINDEVDIALOGBOX");
  await expect(confirm).toContainText("Deseja apagar o registo?"); await confirm.getByRole("button", { name: "Não", exact: true }).click();
  await expect(table.locator("tbody tr")).toHaveCount(2); await form.getByTestId("BTN_Eliminar").click(); confirm = page.getByTestId("WINDEVDIALOGBOX"); await confirm.getByRole("button", { name: "Sim", exact: true }).click();
  await expect(table.locator("tbody tr")).toHaveCount(1);
  expect((await materialDatabase.query('SELECT "preco"::text,"descricao_artigo" FROM app."material_reparacao" WHERE "artigo"=$1', ["B"])).rows).toEqual([{ preco: "10", descricao_artigo: "Second" }]);
  // Source title close explicitly executes Sair.
  await form.getByTestId("BTN_SYST_FERMER").click(); await expect(form).toHaveCount(0);
  expect((await materialDatabase.query('SELECT "artigo","preco"::text,"descricao_artigo" FROM app."material_reparacao"')).rows).toEqual([{ artigo: "B", preco: "4.75", descricao_artigo: "Changed" }]);
  expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock).toBe("12");
});

test("material/order real headers sort exact quantities and large numbers, search selects; actual mechanic and Todos filters return their source sets", async ({ page, materialServer, materialDatabase }) => {
  await materialDatabase.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES (9007199254740992,$1,8,$2)', ["AA-00-AA", "R"]);
  await materialDatabase.query('INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","preco","data_hora","lancado") VALUES (2,9007199254740993,7,$1,$2,10,10,$3,FALSE)', ["B", "Ten", "20240301120000000"]);
  await page.goto(`${materialServer.origin}/?workflow=repair-materials`); await page.getByTestId("repair-materials-open").click();
  const table = page.getByTestId("TABLE_ordens_reparacao"); await expect(table.locator("tbody tr")).toHaveCount(2);
  await table.getByTestId("COL_Numero").locator(".wd-searchable-caption").click();
  await expect(table.locator("tbody tr").first()).toContainText("9007199254740992");
  await table.getByTestId("COL_Numero").locator(".wd-searchable-caption").click();
  await expect(table.locator("tbody tr").first()).toContainText("9007199254740993");
  await page.getByTestId("LIST_mecanicos").selectOption("8"); await expect(table.locator("tbody tr")).toHaveCount(1); await expect(table).toContainText("9007199254740992");
  await expect(page.getByTestId("STC_filtro_atual")).toHaveText("INATIVO"); await page.getByTestId("BTN_anterior1").click(); await expect(table).toContainText("9007199254740993");
  await page.getByTestId("BTN_seguinte1").click(); await expect(table).toContainText("9007199254740992");
  await page.getByTestId("BTN_todos").click(); await expect(table.locator("tbody tr")).toHaveCount(2); await expect(page.getByTestId("STC_filtro_atual")).toHaveText("Todos"); await expect(page.getByTestId("LIST_mecanicos")).toHaveValue("8");
  await page.getByTestId("BTN_seguinte1").click(); await expect(table.locator("tbody tr")).toHaveCount(1); await expect(table).toContainText("9007199254740992");
  await page.getByTestId("BTN_todos").click(); await expect(table.locator("tbody tr")).toHaveCount(2);
  await table.getByTestId("COL_Numero__search").click(); await table.getByRole("textbox", { name: /Pesquisar/ }).fill("9007199254740993");
  await page.keyboard.press("Enter"); await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("9007199254740993");
  await page.getByTestId("BTN_Material").click(); const form = page.getByTestId("WIN_Material_reparacao_form");
  await expect(form.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA");
  const materials = form.getByTestId("TABLE_material");
  await materials.getByTestId("COL_quant").locator(".wd-searchable-caption").click(); await expect(materials.locator("tbody tr").first()).toContainText("Original");
  await materials.getByTestId("COL_quant").locator(".wd-searchable-caption").click(); await expect(materials.locator("tbody tr").first()).toContainText("Ten");
  await materials.getByTestId("COL_descricao_artigo__search").click(); await form.getByRole("textbox", { name: "Pesquisar Artigo" }).fill("Original"); await page.keyboard.press("Enter");
  await expect(form.getByTestId("TABLE_material").locator('tbody tr[aria-selected="true"]')).toContainText("Original");
});

test("SRC-5b7c9d17d1 actual launch refuses a concurrent order writer before material editing and succeeds after release", async ({ page, materialServer, materialDatabase }) => {
  await list(page, materialServer.origin); await page.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "9007199254740993", exact: true }).click();
  await materialDatabase.query("BEGIN");
  try {
    await materialDatabase.query('SELECT _row_id FROM app."ordem_reparacao" FOR UPDATE'); await page.getByTestId("BTN_Material").click();
    await expect(page.getByTestId("LIB_INFO")).toHaveText("Ordem de reparação em uso por outro utilizador"); await expect(page.getByTestId("WIN_Material_reparacao_form").getByTestId("TABLE_material")).toHaveCount(0);
    await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await expect(page.getByTestId("WIN_Material_reparacao_form")).toHaveCount(0);
  } finally { await materialDatabase.query("ROLLBACK"); }
  await page.getByTestId("BTN_Material").click(); await expect(page.getByTestId("WIN_Material_reparacao_form").getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(1);
});
