import { expect, test } from "@playwright/test";

// Each case opens its real repository-backed consumer. No component replacement or IPC mock.
const consumers = [
  { route: "customers", list: "WIN_Table_Clientes", table: "TABLE_Clientes", form: "WIN_Form_Clientes", field: "EDT_Descricao", restore: "customer-form-restore" },
  { route: "vehicles", list: "WIN_Table_Viaturas", table: "TABLE_Viaturas", form: "WIN_Form_Viaturas", field: "EDT_Marca", restore: "vehicle-form-restore" },
  { route: "units", list: "WIN_Table_unidades", table: "TABLE_unidades", form: "WIN_Form_unidades", field: "EDT_Descricao", restore: "unit-form-restore" },
  { route: "descriptive-states", list: "WIN_Table_estados_descritivos", table: "TABLE_estados_descritivos", form: "WIN_Form_estados_descritivos", field: "EDT_Descricao", restore: "descriptiveState-form-restore" },
  { route: "terminals", list: "WIN_Table_Terminais", table: "TABLE_Terminais", form: "WIN_Form_Terminais", field: "EDT_Descricao", restore: "terminal-form-restore" },
  { route: "postos", list: "WIN_Table_postos", table: "TABLE_postos", form: "WIN_Form_postos", field: "EDT_Descricao", restore: "posto-form-restore" },
  { route: "mechanics", list: "WIN_Table_mecanicos", table: "TABLE_mecanicos", form: "WIN_Form_mecanicos", field: "EDT_Descricao", restore: "mechanic-form-restore" },
  { route: "repair-states", list: "WIN_Table_estados_reparacao", table: "TABLE_estados_reparacao", form: "WIN_Form_estados_reparacao", field: "EDT_Descricao", restore: "repair-state-form-restore" },
  { route: "document-types", list: "WIN_Table_documentos", table: "TABLE_documentos", form: "WIN_Form_documentos", field: "EDT_Descricao", restore: "document-type-form-restore" },
  { route: "articles", list: "WIN_Table_artigos", table: "TABLE_artigos", form: "WIN_Form_artigos", field: "EDT_Descricao", restore: "article-form-restore" },
  { route: "users", list: "WIN_Table_utilizadores", table: "TABLE_utilizadores", form: "WIN_Form_utilizadores", field: "EDT_Descricao", restore: "user-form-restore" },
] as const;

for (const consumer of consumers) {
  test(`${consumer.form} source proposed chrome preserves mounted draft and exact focus, closes and cancels without a save`, async ({ page }) => {
    let writes = 0;
    page.on("request", request => { if (new URL(request.url()).pathname === `/api/${consumer.route}/save`) writes++; });
    await page.goto(`/?workflow=${consumer.route}`); await page.getByTestId(`${consumer.route}-open`).click();
    const list = page.getByTestId(consumer.list), form = page.getByTestId(consumer.form);
    await list.getByTestId("Btn_New").click();
    const field = form.getByTestId(consumer.field), draft = `  d'Água ${consumer.route}  `;
    await field.fill(draft); const initial = (await form.locator(".wd-frame").boundingBox())!;
    await form.getByTestId("BTN_Syst_Maximize").click();
    await expect.poll(async () => (await form.locator(".wd-frame").boundingBox())!.width).toBeGreaterThan(initial.width);
    await expect(field).toHaveValue(draft); await form.getByTestId("BTN_Syst_Maximize").click();
    await expect.poll(async () => (await form.locator(".wd-frame").boundingBox())!.width).toBe(initial.width);
    await field.focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(field).toBeHidden();
    await page.getByTestId(consumer.restore).click(); await expect(field).toHaveValue(draft); await expect(field).toBeFocused();
    await form.getByTestId("BTN_SYST_FERMER").click(); await expect(form).toHaveCount(0);
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); await list.getByTestId("Btn_New").click(); await expect(field).toHaveValue("");
    await field.fill(draft); await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0);
    await list.getByTestId("Btn_New").click(); await expect(field).toHaveValue("");
    await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0); expect(writes).toBe(0);
  });

  test(`${consumer.list} source proposed chrome restores the actual table and both close controls release its window`, async ({ page }) => {
    await page.goto(`/?workflow=${consumer.route}`); await page.getByTestId(`${consumer.route}-open`).click();
    const list = page.getByTestId(consumer.list), table = list.getByTestId(consumer.table);
    await expect(list.getByTestId("Btn_New")).toBeEnabled();
    const width = (await table.boundingBox())!.width;
    await page.getByTestId("BTN_Syst_Maximize").click(); await expect.poll(async () => (await table.boundingBox())!.width).toBeGreaterThan(width);
    await page.getByTestId("BTN_Syst_Maximize").click(); await expect.poll(async () => (await table.boundingBox())!.width).toBe(width);
    await page.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(table).toBeHidden();
    await page.getByTestId("workspace-tasks").getByRole("button").click(); await expect(table).toBeVisible(); await expect(list.getByTestId("Btn_New")).toBeEnabled();
    await page.getByTestId("BTN_SYST_FERMER").click(); await expect(list).toHaveCount(0);
    await page.getByTestId(`${consumer.route}-open`).click(); await expect(list.getByTestId("Btn_New")).toBeEnabled();
    await list.getByTestId("BTN_Fechar").click(); await expect(list).toHaveCount(0);
    await page.getByTestId(`${consumer.route}-open`).click(); await expect(list.getByTestId("Btn_New")).toBeEnabled();
  });
}
