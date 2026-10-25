import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/startup";

test.beforeEach(async ({ startupDatabase }) => {
  await startupDatabase.query(`TRUNCATE app."ordem_reparacao",app."material_reparacao",app."artigos",app."mecanicos",app."estados_reparacao",app."Viaturas",app."sistema" RESTART IDENTITY;
    INSERT INTO app."sistema" ("Tempo_materiais") VALUES (60);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES (1,'AA-00-AA',7,'R');
    INSERT INTO app."Viaturas" ("matricula","marca","modelo") VALUES ('AA-00-AA','MARCA','MODELO');
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo","lancar_material") VALUES ('R','Reparação',2,TRUE);
    INSERT INTO app."mecanicos" ("Codigo","Descricao","palavra_passe","inativo") VALUES (7,'ANA','Synthetic',FALSE);
    INSERT INTO app."artigos" ("Codigo","Descricao","preco","stock","inativo") VALUES ('A','Artigo',1.25,10,FALSE);
    INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","preco","data_hora","reparacao_estado","lancado") VALUES (1,1,7,'A',NULL,2,1.25,'20240229123456987','R',FALSE)`);
});
async function list(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-materials`); await page.getByTestId("repair-materials-open").click();
  await expect(page.getByTestId("TABLE_ordens_reparacao").locator("tbody tr")).toHaveCount(1);
}
async function open(page: Page, origin: string) {
  await list(page, origin); await page.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "1", exact: true }).click();
  await page.getByTestId("BTN_Material").click(); const form = page.getByTestId("WIN_Material_reparacao_form");
  await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(1); return form;
}
async function font(node: Locator) { return node.evaluate(element => parseFloat(getComputedStyle(element).fontSize)); }

test("material description keyboard distinguishes deliberate NULL-to-empty editing from cancellation through the real save", async ({ page, startupServer, startupDatabase }) => {
  const form = await open(page, startupServer.origin); await form.getByTestId("TABLE_material").locator("tbody tr").click();
  await form.getByTestId("BTN_Descricao").click(); let prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await prompt.getByTestId("EDT_descricao").click(); const keyboard = page.getByTestId("WIN_Teclado_Alfa");
  await keyboard.getByTestId("BTN_a").click(); await keyboard.getByTestId("BTN_apagar_tudo").click(); await keyboard.getByTestId("BTN_cancelar").click();
  await prompt.getByTestId("BTN_Confirmar").click(); await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
  expect((await startupDatabase.query('SELECT "descricao_artigo" FROM app."material_reparacao"')).rows[0].descricao_artigo).toBeNull();
  const reopened = await open(page, startupServer.origin); await reopened.getByTestId("TABLE_material").locator("tbody tr").click(); await reopened.getByTestId("BTN_Descricao").click();
  prompt = page.getByTestId("WIN_Inserir_quantidade_password"); await prompt.getByTestId("EDT_descricao").click();
  await keyboard.getByTestId("BTN_a").click(); await keyboard.getByTestId("BTN_apagar_tudo").click(); await keyboard.getByTestId("BTN_confirmar").click();
  await prompt.getByTestId("BTN_Confirmar").click(); await reopened.getByTestId("BTN_Sair").click(); await expect(reopened).toHaveCount(0);
  expect((await startupDatabase.query('SELECT "descricao_artigo" FROM app."material_reparacao"')).rows[0].descricao_artigo).toBe("");
});

test("source repeated Todos and repeated mechanic activation each requery actual current orders", async ({ page, startupServer, startupDatabase }) => {
  await list(page, startupServer.origin);
  await startupDatabase.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES (2,\'AA-00-AA\',7,\'R\')');
  await page.getByTestId("BTN_todos").click(); await expect(page.getByTestId("TABLE_ordens_reparacao").locator("tbody tr")).toHaveCount(2);
  const mechanics = page.getByTestId("LIST_mecanicos"); await mechanics.getByRole("option", { name: "ANA", exact: true }).click();
  await expect(page.getByTestId("STC_filtro_atual")).toHaveText("ANA");
  await startupDatabase.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES (3,\'AA-00-AA\',7,\'R\')');
  await mechanics.getByRole("option", { name: "ANA", exact: true }).click(); await expect(page.getByTestId("TABLE_ordens_reparacao").locator("tbody tr")).toHaveCount(3);
  await expect(mechanics).toHaveAttribute("data-control-path", "LIST_mecanicos"); await expect(mechanics).toHaveAttribute("tabindex", "0");
  await page.getByTestId("BTN_Material").focus(); await page.keyboard.press("Tab"); await expect(mechanics).toBeFocused();
});

test("material resize scales only named control fonts and row heights, retaining initialization-only table fonts", async ({ page, startupServer }) => {
  await page.setViewportSize({ width: 1300, height: 950 }); const form = await open(page, startupServer.origin);
  const scaled = form.getByTestId("BTN_Quantidade"), unscaled = form.getByTestId("BTN_Preço"), cell = form.locator(".material-opening-column-font").first();
  const before = { scaled: await font(scaled), unscaled: await font(unscaled), column: await font(cell), height: await form.getByTestId("TABLE_material").locator("tbody td").first().evaluate(element => element.getBoundingClientRect().height) };
  await page.getByTestId("repair-material-form-frame-resize-e").press("ArrowRight");
  expect(await font(scaled)).toBeCloseTo(before.scaled * 808 / 800, 3); expect(await font(unscaled)).toBe(before.unscaled); expect(await font(cell)).toBe(before.column);
  await page.getByTestId("repair-material-form-frame-resize-s").press("ArrowDown");
  expect(await form.getByTestId("TABLE_material").locator("tbody td").first().evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(before.height);
  await form.getByTestId("EDT_marca_modelo").focus(); await page.keyboard.press("Tab"); await expect(form.getByTestId("BTN_Sair")).toBeFocused();
});


test("material refresh retains the interval captured at entry after system settings change", async ({ page, startupServer, startupDatabase }) => {
  await startupDatabase.query('UPDATE app."sistema" SET "Tempo_materiais"=1');
  let reads = 0; page.on("request", request => { if (new URL(request.url()).pathname === "/api/repair-materials/list") reads++; });
  await list(page, startupServer.origin); await startupDatabase.query('UPDATE app."sistema" SET "Tempo_materiais"=100');
  await page.getByTestId("BTN_todos").click(); const afterManualRefresh = reads;
  await expect.poll(() => reads, { timeout: 3500 }).toBeGreaterThan(afterManualRefresh);
});
