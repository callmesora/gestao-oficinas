import { expect, test } from "@playwright/test";

test("typed resource dates, times and exact decimals use their real awaited result", async ({ page }) => {
  await page.goto("/?skin=controls");
  const type = page.getByTestId("skin-resource-type"), open = page.getByTestId("skin-resource-typed"), result = page.getByTestId("skin-message-result");
  await open.click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX"), field = dialog.getByTestId("SAI_1");
  await expect(field).toHaveValue("9007199254740993,125");
  await dialog.getByTestId("BTN_1").click();
  await expect(result).toHaveText(JSON.stringify({ result: 1, input: "9007199254740993.125" }));
  await open.click(); await field.fill("9007199254740994,125"); await field.press("Enter");
  await expect(result).toHaveText(JSON.stringify({ result: 1, input: "9007199254740994.125" }));
  await type.selectOption("date"); await open.click();
  await expect(field).toHaveValue("25/10/2026");
  await field.fill("31/02/2026"); await dialog.getByTestId("BTN_1").click();
  await expect(field).toHaveAttribute("aria-invalid", "true"); await expect(field).toBeFocused();
  await field.fill("29/02/2028"); await field.press("Enter");
  await expect(result).toHaveText(JSON.stringify({ result: 1, input: "20280229" }));
  await type.selectOption("time"); await open.click(); await expect(field).toHaveValue("23:59:58,12");
  await field.fill("24:00:00,00"); await field.press("Enter"); await expect(field).toHaveAttribute("aria-invalid", "true");
  await field.fill("00:00:00,00"); await field.press("Enter"); await expect(result).toHaveText(JSON.stringify({ result: 1, input: "00000000" }));
  await type.selectOption("raw"); await open.click(); await expect(field).toHaveValue("original opaque");
  await field.fill("  Açores  "); await field.press("Enter"); await expect(result).toHaveText(JSON.stringify({ result: 1, input: "  Açores  " }));
});

test("typed resource NULL, deliberate clearing and source cancel-copy stay distinct", async ({ page }) => {
  await page.goto("/?skin=controls");
  const type = page.getByTestId("skin-resource-type"), open = page.getByTestId("skin-resource-typed"), result = page.getByTestId("skin-message-result");
  await type.selectOption("null"); await open.click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX"), field = dialog.getByTestId("SAI_1");
  await field.press("Enter"); await expect(result).toHaveText(JSON.stringify({ result: 1, input: null }));
  await open.click(); await field.fill("1"); await field.fill(""); await field.press("Enter");
  await expect(result).toHaveText(JSON.stringify({ result: 1, input: "" }));
  await type.selectOption("date"); await open.click(); await field.fill("partial"); await page.keyboard.press("Escape");
  await expect(result).toHaveText(JSON.stringify({ result: 2, input: "partial" }));
  await open.click(); await field.fill("partial"); await dialog.getByTestId("BTN_SYST_FERMER").click();
  await expect(result).toHaveText(JSON.stringify({ result: 2, input: "20261025" }));
  await type.selectOption("checkboxNull"); await open.click(); await dialog.getByTestId("BTN_1").click();
  await expect(result).toHaveText(JSON.stringify({ result: 1, input: null }));
  await open.click(); await dialog.getByTestId("INT_1").check(); await dialog.getByTestId("INT_1").uncheck(); await dialog.getByTestId("BTN_1").click();
  await expect(result).toHaveText(JSON.stringify({ result: 1, input: false }));
});

test("calculator retains parent input until Apply, uses exact decimals and keeps division errors local", async ({ page }) => {
  await page.goto("/?skin=controls"); await page.getByTestId("skin-resource-typed").click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX"), field = dialog.getByTestId("SAI_1");
  await dialog.getByTestId("SAI_1__calculator").click();
  const calc = page.getByTestId("target-calculator"), value = calc.getByTestId("calculator-value");
  await expect(value).toHaveValue("9007199254740993.125");
  await value.press("+"); await value.press("1"); await value.press("Enter");
  await expect(value).toHaveValue("9007199254740994.125");
  await calc.getByTestId("calculator-cancel").click(); await expect(field).toHaveValue("9007199254740993,125");
  await expect(dialog.getByTestId("SAI_1__calculator")).toBeFocused();
  await dialog.getByTestId("SAI_1__calculator").click();
  await value.press("+"); await value.press("1"); await calc.getByTestId("calculator-apply").click();
  await expect(field).toHaveValue("9007199254740994,125");
  await dialog.getByTestId("SAI_1__calculator").click();
  await value.press("/"); await value.press("0"); await value.press("Enter"); await expect(value).toHaveAttribute("aria-invalid", "true");
  await expect(calc).toBeVisible(); await page.keyboard.press("Escape"); await expect(field).toHaveValue("9007199254740994,125");
  await dialog.getByTestId("BTN_1").click();
  await expect(page.getByTestId("skin-message-result")).toHaveText(JSON.stringify({ result: 1, input: "9007199254740994.125" }));
  await page.getByTestId("skin-resource-type").selectOption("wideNumeric"); await page.getByTestId("skin-resource-typed").click();
  const wide = "9".repeat(96) + ",125";
  await expect(field).toHaveValue(wide); await dialog.getByTestId("SAI_1__calculator").click();
  await calc.getByTestId("calculator-apply").click(); await expect(field).toHaveValue(wide);
  await dialog.getByTestId("SAI_1__calculator").click(); await value.press("+"); await value.press("1");
  await calc.getByTestId("calculator-apply").click(); await expect(field).toHaveValue("1" + "0".repeat(96) + ",125");
  await dialog.getByTestId("BTN_1").click();
  await expect(page.getByTestId("skin-message-result")).toHaveText(JSON.stringify({ result: 1, input: "1" + "0".repeat(96) + ".125" }));
});

test("native modal Tab order handles positive indices, radio groups and nested focus restoration", async ({ page }) => {
  await page.goto("/?skin=controls"); await page.getByTestId("focus-open").click();
  const dialog = page.getByTestId("focus-dialog");
  await dialog.getByTestId("focus-show-runtime").focus(); await page.keyboard.press("Tab");
  await expect(dialog.getByTestId("focus-first")).toBeFocused();
  await page.keyboard.press("Tab"); await expect(dialog.getByTestId("focus-third")).toBeFocused();
  await page.keyboard.press("Tab"); await expect(dialog.getByTestId("focus-radio-b")).toBeFocused();
  await page.keyboard.press("Tab"); await expect(dialog.getByTestId("focus-nested-open")).toBeFocused();
  await page.keyboard.press("Enter"); const nested = page.getByTestId("focus-child");
  await nested.getByTestId("focus-child-close").focus(); await page.keyboard.press("Tab");
  expect(await nested.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await nested.getByTestId("focus-child-close").click();
  await expect(dialog.getByTestId("focus-nested-open")).toBeFocused();
  await dialog.getByTestId("focus-first").focus(); await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByTestId("focus-show-runtime")).toBeFocused();
  await dialog.getByTestId("focus-show-runtime").click(); await expect(dialog.getByTestId("focus-runtime-visible")).toBeVisible();
  await dialog.getByTestId("focus-last").click(); await expect(page.getByTestId("focus-open")).toBeFocused();
});

test("actual stock statement returns focus to the first invalid date before report continuation", async ({ page }) => {
  await page.goto("/?workflow=stock-statement"); await page.getByTestId("stock-statement-open").click();
  const dialog = page.getByTestId("WIN_Extrato_Artigos"), from = dialog.getByTestId("EDT_Da_data"), to = dialog.getByTestId("EDT_a_data");
  const preview = dialog.getByTestId("BTN_Visualizar_impressão"); await expect(preview).toBeEnabled();
  await from.fill("31/02/2026"); await to.fill("31/02/2026"); await preview.click();
  await expect(from).toBeFocused(); await expect(from).toHaveAttribute("aria-invalid", "true");
  await from.fill("25/10/2026"); await preview.click(); await expect(to).toBeFocused();
  await expect(to).toHaveValue("31/02/2026"); await expect(dialog).toBeVisible();
  await dialog.getByTestId("BTN_SYST_FERMER").click(); await expect(dialog).toHaveCount(0);
});
