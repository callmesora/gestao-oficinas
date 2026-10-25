import type { Page } from "@playwright/test";
import { test, expect } from "./support/repair-materials";

async function open(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-materials`);
  await page.getByTestId("repair-materials-open").click();
  await page.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "9007199254740993", exact: true }).click();
  await page.getByTestId("BTN_Material").click();
  const form = page.getByTestId("WIN_Material_reparacao_form");
  await expect(form.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA");
  return form;
}

test("SRC-eb5a859599 actual modal quantity edit stays in memory then Sair commits10+2-3=9 with preserved identity", async ({ page, materialServer, materialDatabase }) => {
  const form = await open(page, materialServer.origin);
  await expect(form.getByTestId("EDT_quant")).toHaveValue("1,000");
  await expect(form.getByTestId("BTN_Leitor")).toBeEnabled();
  await form.getByTestId("TABLE_material").getByRole("cell", { name: "Original", exact: true }).click();
  await form.getByTestId("BTN_Quantidade").click();
  const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await expect(prompt.getByTestId("EDT_quantidade")).toHaveValue("2,000");
  await prompt.getByTestId("EDT_quantidade").fill("3,000"); await prompt.getByTestId("BTN_Confirmar").click();
  expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock).toBe("10");
  await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
  expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock).toBe("9.000");
  expect((await materialDatabase.query('SELECT "material_reparacaoID"::text,"quantidade"::text,"extra","reparacao_estado" FROM app."material_reparacao"')).rows).toEqual([{ material_reparacaoID: "9007199254740993", quantidade: "3.000", extra: true, reparacao_estado: "R" }]);
});

test("SRC-24e17a93a6 barcode-first entry authenticates the actual mechanic and re-reads current price before Add", async ({ page, materialServer, materialDatabase }) => {
  const form = await open(page, materialServer.origin);
  await form.getByTestId("EDT_artigo").fill("BAR-B"); await form.getByTestId("EDT_quant").click();
  await expect(form.getByTestId("EDT_artigo")).toHaveValue("B"); await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Outro");
  await materialDatabase.query('UPDATE app."artigos" SET "preco"=3.75 WHERE "Codigo"=$1', ["B"]);
  await form.getByTestId("BTN_Adicionar").click();
  const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await expect(prompt.getByTestId("EDT_password")).toHaveAttribute("type", "password");
  await prompt.getByTestId("EDT_password").fill("Synthetic"); await prompt.getByTestId("BTN_Confirmar").click();
  await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(2);
  await expect(form.getByTestId("TABLE_material")).toContainText("3,750");
  await expect(form.getByTestId("EDT_artigo")).toHaveValue(""); await expect(form.getByTestId("EDT_quant")).toHaveValue("1,000");
  expect((await materialDatabase.query('SELECT count(*)::text AS count FROM app."material_reparacao"')).rows[0].count).toBe("1");
  await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
  expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["B"])).rows[0].stock).toBe("19.000");
});

test("SRC-f7457e6a1c/SRC-f6ac86e246 cancelled prompt retains quantity; Cancelar resets only the editor", async ({ page, materialServer }) => {
  const form = await open(page, materialServer.origin);
  await form.getByTestId("TABLE_material").getByRole("cell", { name: "Original", exact: true }).click();
  await form.getByTestId("BTN_Quantidade").click(); const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await prompt.getByTestId("EDT_quantidade").fill("9"); await prompt.getByTestId("BTN_Cancelar").click();
  await expect(form.getByTestId("TABLE_material")).toContainText("2,000");
  await form.getByTestId("EDT_quant").fill("4"); await form.getByTestId("BTN_Cancelar").click();
  await expect(form.getByTestId("EDT_quant")).toHaveValue("1,000"); await expect(form).toBeVisible();
  await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(1);
});

test("SRC-199720cd56/SRC-f7457e6a1c launched lines show the exact guard before any edit/delete dialog", async ({ page, materialServer, materialDatabase }) => {
  await materialDatabase.query('UPDATE app."material_reparacao" SET "lancado"=TRUE');
  const form = await open(page, materialServer.origin);
  await form.getByTestId("TABLE_material").getByRole("cell", { name: "Original", exact: true }).click();
  await form.getByTestId("BTN_Quantidade").click();
  await expect(page.getByTestId("WINDEVMESSAGEBOX")).toContainText("Artigo já lançado, não pode ser alterado");
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await form.getByTestId("BTN_Eliminar").click();
  await expect(page.getByTestId("WINDEVMESSAGEBOX")).toContainText("Artigo já lançado, não pode ser eliminado");
  await expect(page.getByTestId("WIN_Inserir_quantidade_password")).toHaveCount(0);
});

test("SRC-eb5a859599 concurrent material changes keep the form and draft visible without overwriting current data", async ({ page, materialServer, materialDatabase }) => {
  const form = await open(page, materialServer.origin);
  await materialDatabase.query('UPDATE app."material_reparacao" SET "quantidade"=7');
  await form.getByTestId("BTN_Sair").click();
  await expect(form.getByTestId("repair-material-form-diagnostic")).toHaveText("stale");
  await expect(form).toBeVisible();
  expect((await materialDatabase.query('SELECT "quantidade"::text FROM app."material_reparacao"')).rows[0].quantidade).toBe("7");
  expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock).toBe("10");
});
