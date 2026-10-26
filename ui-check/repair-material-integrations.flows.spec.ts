import type { Page } from "@playwright/test";
import type { Client } from "pg";
import { test, expect } from "./support/repair-materials";

async function open(page: Page, origin: string, modulo?: string) {
  await page.goto(`${origin}/?workflow=repair-materials${modulo ? `&modulo=${modulo}` : ""}`);
  await page.getByTestId("repair-materials-open").click();
  await page.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "9007199254740993", exact: true }).click();
  await page.getByTestId("BTN_Material").click();
  const form = page.getByTestId("WIN_Material_reparacao_form");
  await expect(form.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA");
  return form;
}
async function scannerConfig(database: Client) {
  const terminal = await database.query<{ id: string }>('INSERT INTO app."Terminais" ("Codigo","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim") VALUES ($1,1,6,7,4) RETURNING _row_id::text AS id', ["KBS"]);
  const posto = await database.query<{ id: string }>('INSERT INTO app."postos" ("Codigo","terminal") VALUES (1,$1) RETURNING _row_id::text AS id', ["KBS"]);
  return async () => { await database.query('DELETE FROM app."postos" WHERE _row_id=$1', [posto.rows[0].id]); await database.query('DELETE FROM app."Terminais" WHERE _row_id=$1', [terminal.rows[0].id]); };
}
async function passwordKeyboard(page: Page) {
  const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await prompt.getByTestId("EDT_password").click();
  const keyboard = page.getByTestId("WIN_Teclado_Alfa");
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveAttribute("type", "password");
  // Source caps2 uppercases one character, then returns to lowercase.
  await keyboard.getByTestId("BTN_CapsLock").click(); await page.keyboard.type("Synthetic"); await page.keyboard.press("Enter");
  await expect(prompt).toBeVisible(); await expect(prompt.getByTestId("EDT_password")).toHaveValue("Synthetic");
  await prompt.getByTestId("BTN_Confirmar").click();
}
const content = "BAR-B 2.25\r\nWHAT  1.00\r\n\r\nBAR   9.99";

test("source material caller carries module m into the actual article picker and awaits its search keyboard result", async ({ page, materialServer, materialDatabase }) => {
  const form = await open(page, materialServer.origin, "m");
  await form.getByTestId("BTN_NoName2").click();
  const picker = page.getByTestId("article-picker"), search = picker.getByTestId("EDT_termo_pesquisa");
  await picker.getByTestId("BTN_codigo").click(); await search.click();
  const keyboard = page.getByTestId("WIN_Teclado_Alfa"); await expect(keyboard).toBeVisible();
  await keyboard.getByTestId("BTN_CapsLock").click(); await keyboard.getByTestId("BTN_b").click();
  await keyboard.getByTestId("BTN_confirmar").click(); await expect(search).toHaveValue("B");
  const row = picker.getByTestId("TABLE_artigos").locator("tbody tr").filter({ has: page.getByRole("cell", { name: "B", exact: true }) });
  await expect(row).toHaveCount(1); await row.dblclick(); await expect(picker).toHaveCount(0);
  await expect(form.getByTestId("EDT_artigo")).toHaveValue("B");
  await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Outro");
  await form.getByTestId("EDT_quant").fill("2,750");
  await form.getByTestId("EDT_artigo_descricao").fill("Descrição temporária");
  await form.getByTestId("BTN_NoName2").click();
  const otherRow = picker.getByTestId("TABLE_artigos").locator("tbody tr").filter({ has: page.getByRole("cell", { name: "A", exact: true }) });
  await otherRow.click(); await expect(otherRow).toHaveAttribute("aria-selected", "true");
  await materialDatabase.query('UPDATE app."artigos" SET "Descricao"=$1 WHERE "Codigo"=$2', ["Outro atualizado", "B"]);
  // Source930–959 returns the opening origin on Close; it does not preselect that row.
  // The nonempty B return therefore rereads B even though A is now selected.
  await picker.getByTestId("BTN_Fechar").click(); await expect(picker).toHaveCount(0);
  await expect(form.getByTestId("EDT_artigo")).toHaveValue("B");
  await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Outro atualizado");
  await expect(form.getByTestId("EDT_quant")).toHaveValue("2,750");
  await form.getByTestId("EDT_artigo").fill("");
  await form.getByTestId("EDT_artigo_descricao").fill("Descrição sem código");
  await form.getByTestId("BTN_NoName2").click(); await otherRow.click();
  await expect(otherRow).toHaveAttribute("aria-selected", "true");
  // An empty opening origin returns empty and skips every caller assignment/read.
  await picker.getByTestId("BTN_Fechar").click(); await expect(picker).toHaveCount(0);
  await expect(form.getByTestId("EDT_artigo")).toHaveValue("");
  await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Descrição sem código");
  await expect(form.getByTestId("EDT_quant")).toHaveValue("2,750");
  await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(1);
  await expect(form.getByTestId("TABLE_material")).toContainText("Original");
  expect((await materialDatabase.query('SELECT "artigo","descricao_artigo","quantidade"::text,"preco"::text FROM app."material_reparacao"')).rows).toEqual([{ artigo: "A", descricao_artigo: "Original", quantidade: "2", preco: "1.25" }]);
});

test("SRC-517e7660ea SRC-a5152a0572 active prompt mouse actions await actual numeric/alpha keyboards; commented material handlers stay inert", async ({ page, materialServer, materialDatabase }) => {
  const form = await open(page, materialServer.origin), errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await form.getByTestId("EDT_quant").click(); await expect(page.getByTestId("WIN_Teclado_numerico")).toHaveCount(0);
  await form.getByTestId("EDT_artigo").click(); await expect(page.getByTestId("WIN_Teclado_Alfa")).toHaveCount(0);
  await form.getByTestId("TABLE_material").getByRole("cell", { name: "Original", exact: true }).click(); await form.getByTestId("BTN_Quantidade").click();
  let prompt = page.getByTestId("WIN_Inserir_quantidade_password"); await prompt.getByTestId("EDT_quantidade").click();
  let keyboard = page.getByTestId("WIN_Teclado_numerico"); await expect(keyboard).toBeVisible(); await page.keyboard.press("3"); await page.keyboard.press("Enter");
  await expect(prompt).toBeVisible(); await expect(prompt.getByTestId("EDT_quantidade")).toHaveValue("3,000"); await prompt.getByTestId("BTN_Confirmar").click();
  await form.getByTestId("BTN_Preço").click(); prompt = page.getByTestId("WIN_Inserir_quantidade_password"); await prompt.getByTestId("EDT_quantidade").click(); keyboard = page.getByTestId("WIN_Teclado_numerico");
  await expect(keyboard.getByTestId("BTN_Caption")).toHaveText("Quantidade"); await page.keyboard.press("9"); await keyboard.getByTestId("BTN_cancelar").click(); await expect(prompt.getByTestId("EDT_quantidade")).toHaveValue("1,25"); await prompt.getByTestId("BTN_Cancelar").click();
  await form.getByTestId("BTN_Descricao").click(); prompt = page.getByTestId("WIN_Inserir_quantidade_password"); await prompt.getByTestId("EDT_descricao").click(); keyboard = page.getByTestId("WIN_Teclado_Alfa");
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("Original");
  await keyboard.getByTestId("BTN_apagar_tudo").click(); await page.keyboard.type("discarded");
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("discarded");
  await keyboard.getByTestId("BTN_cancelar").click(); await expect(keyboard).toHaveCount(0);
  await expect(prompt.getByTestId("EDT_descricao")).toHaveValue("Original");
  await prompt.getByTestId("EDT_descricao").click(); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("Original");
  await expect(keyboard.getByTestId("BTN_Caption")).toHaveText("Descricao"); await keyboard.getByTestId("BTN_apagar_tudo").click(); await page.keyboard.type("keyboard"); await page.keyboard.press("Enter");
  await expect(prompt).toBeVisible(); await expect(prompt.getByTestId("EDT_descricao")).toHaveValue("keyboard"); await prompt.getByTestId("BTN_Confirmar").click();
  expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock).toBe("10");
  await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
  expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock).toBe("9.000");
  expect((await materialDatabase.query('SELECT "descricao_artigo" FROM app."material_reparacao" WHERE "artigo"=$1', ["A"])).rows[0].descricao_artigo).toBe("keyboard"); expect(errors).toEqual([]);
});

test("SRC-2011a97eec SRC-88600ec880 real scanner authenticates through the password keyboard, appends known rows, shows unknowns and persists only on Sair", async ({ page, materialServer, materialDatabase }) => {
  const cleanup = await scannerConfig(materialDatabase);
  try {
    const form = await open(page, materialServer.origin);
    await expect(form.getByTestId("BTN_Leitor")).toBeEnabled(); await form.getByTestId("BTN_Leitor").click();
    await expect(page.getByTestId("repair-material-scanner-file")).toHaveCount(0); await passwordKeyboard(page);
    await page.getByTestId("repair-material-scanner-upload").setInputFiles({ name: "reader.txt", mimeType: "text/plain", buffer: Buffer.from(content) });
    const scanner = page.getByTestId("WIN_Leitor_cod_barras"); await expect(scanner.getByTestId("TABLE_Leitura").locator("tbody tr")).toHaveCount(2); await scanner.getByTestId("BTN_Confirmar").click();
    const unknown = page.getByTestId("WIN_Leitor_cod_barras_desconhecidos"); await expect(unknown).toContainText("WHAT"); await unknown.getByTestId("BTN_Confirmar").click();
    const table = form.getByTestId("TABLE_material"); await expect(table.locator("tbody tr")).toHaveCount(2); await expect(table).toContainText("Outro"); await expect(table).toContainText("2,250");
    expect((await materialDatabase.query('SELECT count(*)::text AS count FROM app."material_reparacao"')).rows[0].count).toBe("1");
    expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["B"])).rows[0].stock).toBe("20");
    await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
    expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["B"])).rows[0].stock).toBe("17.75");
    expect((await materialDatabase.query('SELECT "mecanico","quantidade"::text,"preco"::text,"lancado" FROM app."material_reparacao" WHERE "artigo"=$1', ["B"])).rows).toEqual([{ mecanico: 7, quantidade: "2.25", preco: "2.50", lancado: false }]);
  } finally { await cleanup(); }
});

test("SRC-88600ec880 keyboard/file/reader cancellation and fatal UTF8 refusal retain the material draft and authenticated actor", async ({ page, materialServer, materialDatabase }) => {
  const cleanup = await scannerConfig(materialDatabase);
  try {
    const form = await open(page, materialServer.origin); await form.getByTestId("BTN_Leitor").click(); let prompt = page.getByTestId("WIN_Inserir_quantidade_password");
    await prompt.getByTestId("EDT_password").click(); const keyboard = page.getByTestId("WIN_Teclado_Alfa"); await page.keyboard.type("discarded"); await keyboard.getByTestId("BTN_cancelar").click(); await expect(prompt.getByTestId("EDT_password")).toHaveValue(""); await prompt.getByTestId("BTN_Confirmar").click();
    await expect(page.getByTestId("repair-material-scanner-file")).toHaveCount(0); await form.getByTestId("BTN_Leitor").click(); await passwordKeyboard(page);
    await page.getByTestId("repair-material-scanner-upload").setInputFiles({ name: "invalid.txt", mimeType: "text/plain", buffer: Buffer.from([0xff, 0xfe]) });
    await expect(page.getByTestId("LIB_INFO")).toHaveText("A leitura do ficheiro falhou, verifique o caminho"); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); await expect(page.getByTestId("repair-material-scanner-file")).toHaveCount(0);
    await form.getByTestId("BTN_Leitor").click(); prompt = page.getByTestId("WIN_Inserir_quantidade_password"); await expect(prompt).toHaveCount(0); await page.getByTestId("repair-material-scanner-file").getByRole("button", { name: "Cancelar", exact: true }).click();
    await form.getByTestId("BTN_Leitor").click(); await page.getByTestId("repair-material-scanner-upload").setInputFiles({ name: "reader.txt", mimeType: "text/plain", buffer: Buffer.from(content) });
    await expect(page.getByTestId("WIN_Leitor_cod_barras").getByTestId("BTN_Confirmar")).toBeEnabled(); await page.getByTestId("WIN_Leitor_cod_barras").getByTestId("BTN_Cancelar").click();
    await expect(page.getByTestId("WIN_Leitor_cod_barras_desconhecidos")).toHaveCount(0); await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(1);
    expect((await materialDatabase.query('SELECT count(*)::text AS count FROM app."material_reparacao"')).rows[0].count).toBe("1");
    await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0); expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["B"])).rows[0].stock).toBe("20");
  } finally { await cleanup(); }
});
