import { expect, test } from "@playwright/test";

const consumers = [
  { route: "customers", open: "customers-open", list: "WIN_Table_Clientes", table: "TABLE_Clientes", form: "WIN_Form_Clientes", field: "EDT_Descricao", restore: "customer-form-restore" },
  { route: "vehicles", open: "vehicles-open", list: "WIN_Table_Viaturas", table: "TABLE_Viaturas", form: "WIN_Form_Viaturas", field: "EDT_Marca", restore: "vehicle-form-restore" },
  { route: "units", open: "units-open", list: "WIN_Table_unidades", table: "TABLE_unidades", form: "WIN_Form_unidades", field: "EDT_Descricao", restore: "unit-form-restore" },
  { route: "descriptive-states", open: "descriptive-states-open", list: "WIN_Table_estados_descritivos", table: "TABLE_estados_descritivos", form: "WIN_Form_estados_descritivos", field: "EDT_Descricao", restore: "descriptiveState-form-restore" },
  { route: "terminals", open: "terminals-open", list: "WIN_Table_Terminais", table: "TABLE_Terminais", form: "WIN_Form_Terminais", field: "EDT_Descricao", restore: "terminal-form-restore" },
] as const;

for (const consumer of consumers) {
  test(`${consumer.form} proposed chrome retains draft through minimize/maximize and closes the actual form`, async ({ page }) => {
    await page.goto(`/?workflow=${consumer.route}`); await page.getByTestId(consumer.open).click();
    const list = page.getByTestId(consumer.list), form = page.getByTestId(consumer.form);
    await list.getByTestId("Btn_New").click();
    const field = form.getByTestId(consumer.field), draft = `Unsaved ${consumer.route}`;
    await field.fill(draft); const initial = (await form.locator(".wd-frame").boundingBox())!;
    await form.getByTestId("BTN_Syst_Maximize").click();
    await expect.poll(async () => (await form.locator(".wd-frame").boundingBox())!.width).toBeGreaterThan(initial.width);
    await expect(field).toHaveValue(draft);
    await form.getByTestId("BTN_Syst_Maximize").click();
    await expect.poll(async () => (await form.locator(".wd-frame").boundingBox())!.width).toBe(initial.width);
    await field.focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click();
    await expect(field).toBeHidden(); await form.getByTestId(consumer.restore).click();
    await expect(field).toHaveValue(draft); await expect(field).toBeFocused();
    await form.getByTestId("BTN_SYST_FERMER").click(); await expect(form).toHaveCount(0);
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); await list.getByTestId("Btn_New").click();
    await expect(form.getByTestId(consumer.field)).toHaveValue("");
    await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0);
  });

  test(`${consumer.list} proposed chrome retains live table through minimize/maximize and closes its actual window`, async ({ page }) => {
    await page.goto(`/?workflow=${consumer.route}`); await page.getByTestId(consumer.open).click();
    const list = page.getByTestId(consumer.list), table = list.getByTestId(consumer.table);
    await expect(list.getByTestId("Btn_New")).toBeEnabled();
    const rows = await table.locator("tbody tr").allTextContents(), initialWidth = (await table.boundingBox())!.width;
    await page.getByTestId("BTN_Syst_Maximize").click();
    await expect.poll(async () => (await table.boundingBox())!.width).toBeGreaterThan(initialWidth);
    await page.getByTestId("BTN_Syst_Maximize").click();
    await expect.poll(async () => (await table.boundingBox())!.width).toBe(initialWidth);
    await page.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(table).toBeHidden();
    await page.getByTestId("workspace-tasks").getByRole("button").click(); await expect(table).toBeVisible();
    expect(await table.locator("tbody tr").allTextContents()).toEqual(rows);
    await page.getByTestId("BTN_SYST_FERMER").click(); await expect(list).toHaveCount(0);
    await page.getByTestId(consumer.open).click(); await expect(list.getByTestId("Btn_New")).toBeEnabled();
    await list.getByTestId("BTN_Fechar").click(); await expect(list).toHaveCount(0);
  });
}
