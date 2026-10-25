import { expect, test, type Locator, type Page } from "@playwright/test";
import scenario from "../docs/golden/GS-STATE-CONFIRM-001/scenario.json" with { type: "json" };

const resultId = "repair-confirmation-returned";
async function open(page: Page, state = scenario.state) {
  await page.goto(`/?workflow=repair-state-confirmation&state=${encodeURIComponent(state)}`);
  await page.getByTestId("repair-confirmation-open").click();
  await expect(page.getByTestId("WIN_Mudar_Estado")).toBeVisible();
  return page.getByTestId("WIN_Mudar_Estado");
}
async function result(page: Page, value: number) {
  await expect(page.getByTestId("WIN_Mudar_Estado")).toHaveCount(0);
  await expect(page.getByTestId(resultId)).toHaveText(String(value));
  await expect(page.getByTestId("repair-confirmation-returned-kind")).toHaveText("number");
}
async function refused(page: Page, form: Locator, letter: string) {
  await form.getByTestId("EDT_Letra").fill(letter);
  await form.getByTestId("BTN_Confirmar").click();
  const message = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(message.getByTestId("LIB_INFO")).toHaveText(scenario.message);
  await expect(message.getByTestId("RADTitle")).toHaveText("");
  await expect(form).toBeVisible(); await expect(form.getByTestId("EDT_Letra")).toHaveValue(letter);
  await expect(page.getByTestId(resultId)).toHaveCount(0);
  return message;
}

test("GS-STATE-CONFIRM-001 SRC-deff9a0792 SRC-107f49bb66 exact prompt, awaited refusal, confirm1 and cancel0 are actual numeric UI returns", async ({ page }) => {
  const form = await open(page);
  await expect(form.getByTestId("STC_Titulo")).toHaveText(scenario.prompt);
  const message = await refused(page, form, scenario.refusedLetter);
  await message.getByTestId("BTN_OK").click(); await expect(message).toHaveCount(0);
  await expect(form.getByTestId("EDT_Letra")).toHaveValue(scenario.refusedLetter);
  await form.getByTestId("EDT_Letra").fill(scenario.acceptedLetter);
  await form.getByTestId("BTN_Confirmar").click(); await result(page, scenario.confirmResult);
  await page.getByTestId("repair-confirmation-open").click();
  await expect(form.getByTestId("EDT_Letra")).toHaveValue("");
  await form.getByTestId("BTN_Cancelar").click(); await result(page, scenario.cancelResult);
});

test("SRC-107f49bb66 actual leading comparison preserves accents, spaces and quoted state without changing the letter", async ({ page }) => {
  for (const [state, wrong, accepted] of [["Á espera", "a", "á"], [" Em Reparação  ", "e", " "], ["d'Água  ", "Á", "D"]]) {
    const form = await open(page, state);
    expect(await form.getByTestId("STC_Titulo").textContent()).toBe(`Mudar estado da reparação para '${state}'?`);
    const message = await refused(page, form, wrong);
    await message.getByTestId("BTN_OK").click();
    await expect(form.getByTestId("EDT_Letra")).toHaveValue(wrong);
    await form.getByTestId("EDT_Letra").fill(accepted);
    await expect(form.getByTestId("EDT_Letra")).toHaveValue(accepted);
    await form.getByTestId("BTN_Confirmar").click(); await result(page, 1);
  }
});

test("RULE-W20AB1F-005 ADR-006 conservative empty-prefix and empty-state defaults refuse through the source Info", async ({ page }) => {
  for (const [state, letter] of [[scenario.state, ""], ["", ""], ["", "e"]]) {
    const form = await open(page, state), message = await refused(page, form, letter);
    await page.keyboard.press("Escape"); await expect(message).toHaveCount(0);
    await expect(form.getByTestId("EDT_Letra")).toHaveValue(letter);
    await form.getByTestId("BTN_Cancelar").click(); await result(page, 0);
  }
  // These are the explicit assumed safe defaults, not captured native empty-prefix outcomes.
});

test("RULE-W20AB1F-1003 source letter focus, Tab2→3→4, Text1 and automatic erase retain Normal-button Enter behavior", async ({ page }) => {
  const form = await open(page), letter = form.getByTestId("EDT_Letra");
  await expect(letter).toBeFocused(); await expect(letter).toHaveAttribute("maxlength", "1");
  await expect(letter).toHaveAttribute("type", "text"); await expect(letter).not.toHaveAttribute("aria-autocomplete");
  await letter.pressSequentially("ER"); await expect(letter).toHaveValue("E");
  await letter.press("Enter"); await expect(form).toBeVisible(); await expect(page.getByTestId(resultId)).toHaveCount(0);
  await expect(page.getByTestId("WINDEVMESSAGEBOX")).toHaveCount(0);
  await page.keyboard.press("Tab"); await expect(form.getByTestId("BTN_Confirmar")).toBeFocused();
  await page.keyboard.press("Tab"); await expect(form.getByTestId("BTN_Cancelar")).toBeFocused();
  await page.keyboard.press("Tab"); await expect(letter).toBeFocused();
  expect(await letter.evaluate(element => { const input = element as HTMLInputElement; return [input.selectionStart, input.selectionEnd]; })).toEqual([0, 1]);
  await letter.pressSequentially("r"); await expect(letter).toHaveValue("r");
  await letter.fill("e"); await page.keyboard.press("Shift+Tab"); await expect(form.getByTestId("BTN_Cancelar")).toBeFocused();
  await page.keyboard.press("Shift+Tab"); await expect(form.getByTestId("BTN_Confirmar")).toBeFocused();
  await page.keyboard.press("Enter"); await result(page, 1);
});

test("SRC-550b8c0090 cancellation, custom close and Escape preserve numeric result0 even with a matching draft", async ({ page }) => {
  for (const close of ["cancel", "chrome", "escape"]) {
    const form = await open(page); await form.getByTestId("EDT_Letra").fill("E");
    if (close === "cancel") { await form.getByTestId("BTN_Cancelar").focus(); await page.keyboard.press("Enter"); }
    else if (close === "chrome") await form.getByTestId("BTN_SYST_FERMER").click();
    else await page.keyboard.press("Escape");
    await result(page, 0);
  }
});

test("SRC-107f49bb66 nested Info owns keys, guards parent actions and retains the original draft until dismissed", async ({ page }) => {
  const form = await open(page), letter = form.getByTestId("EDT_Letra");
  let message = await refused(page, form, "R");
  await expect(letter).toBeDisabled(); await expect(form.getByTestId("BTN_Confirmar")).toBeDisabled(); await expect(form.getByTestId("BTN_Cancelar")).toBeDisabled();
  await expect(message.getByTestId("BTN_OK")).toBeFocused();
  // Directly dispatching the blocked parent's chrome additionally proves the pending close guard.
  await form.getByTestId("BTN_SYST_FERMER").dispatchEvent("click");
  await expect(form).toBeVisible(); await expect(message).toBeVisible(); await expect(page.getByTestId(resultId)).toHaveCount(0);
  await page.keyboard.press("e"); await expect(letter).toHaveValue("R");
  await page.keyboard.press("Tab"); await expect(message.locator(":focus")).toHaveCount(1);
  await page.keyboard.press("Shift+Tab"); await expect(message.getByTestId("BTN_OK")).toBeFocused();
  await page.keyboard.press("Enter"); await expect(message).toHaveCount(0);
  await expect(form).toBeVisible(); await expect(letter).toBeEnabled(); await expect(letter).toHaveValue("R");
  await expect(page.getByTestId(resultId)).toHaveCount(0);
  message = await refused(page, form, "r");
  await page.keyboard.press("Escape"); await expect(message).toHaveCount(0); await expect(form).toBeVisible();
  await expect(letter).toHaveValue("r"); await expect(page.getByTestId(resultId)).toHaveCount(0);
  message = await refused(page, form, "R");
  await message.getByTestId("BTN_SYST_FERMER").click(); await expect(message).toHaveCount(0);
  await expect(form).toBeVisible(); await expect(letter).toHaveValue("R");
  await letter.fill("e"); await form.getByTestId("BTN_Confirmar").click(); await result(page, 1);
});

test("RULE-W20AB1F-1003 actual source letter Center is consumed by WdEdit", async ({ page }) => {
  const form = await open(page);
  await expect(form.getByTestId("EDT_Letra")).toHaveCSS("text-align", "center");
  const frame = (await page.getByTestId("repair-confirmation-frame").boundingBox())!;
  const field = (await form.locator('[data-control-path="EDT_Letra"]').boundingBox())!;
  expect({ x: field.x - frame.x, y: field.y - frame.y, width: field.width, height: field.height }).toEqual({ x: 140, y: 85, width: 23, height: 27 });
});

test("RULE-W20AB1F-1005 actual dynamic caption consumes source horizontal and vertical Center without changing geometry", async ({ page }) => {
  const form = await open(page), caption = form.getByTestId("STC_Titulo");
  await expect(caption).toHaveText(scenario.prompt);
  await expect(caption).toHaveCSS("text-align", "center"); await expect(caption).toHaveCSS("align-items", "center");
  const frame = (await page.getByTestId("repair-confirmation-frame").boundingBox())!, box = (await caption.boundingBox())!;
  expect({ x: box.x - frame.x, y: box.y - frame.y, width: box.width, height: box.height }).toEqual({ x: 31, y: 39, width: 240, height: 37 });
  await expect(form.getByTestId("RADTitle")).toHaveText("");
});

test("SRC-63a9d89884 SRC-493ec73822 actual custom minimize/maximize preserve mounted draft and restore focus without resize or saved geometry", async ({ page }) => {
  const form = await open(page), frame = page.getByTestId("repair-confirmation-frame"), letter = form.getByTestId("EDT_Letra");
  const initial = (await frame.boundingBox())!;
  expect(initial.width).toBe(302); expect(initial.height).toBe(186);
  const viewport = page.viewportSize()!;
  expect(initial.x).toBe((viewport.width - 302) / 2); expect(initial.y).toBe((viewport.height - 186) / 2);
  await expect(page.locator('[data-testid^="repair-confirmation-frame-resize-"]')).toHaveCount(0);
  await letter.fill("R"); await letter.focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click();
  await expect(frame).toBeHidden(); await page.getByTestId("repair-confirmation-restore").click();
  await expect(letter).toBeFocused(); await expect(letter).toHaveValue("R");
  await form.getByTestId("BTN_Syst_Maximize").click();
  expect((await frame.boundingBox())!.width).toBe(viewport.width - 40); expect((await frame.boundingBox())!.height).toBe(viewport.height - 40);
  await expect(letter).toHaveValue("R"); await form.getByTestId("BTN_Syst_Maximize").click();
  expect(await frame.boundingBox()).toEqual(initial);
  const title = (await form.getByTestId("RADTitle").boundingBox())!;
  await page.mouse.move(title.x + 40, title.y + title.height / 2); await page.mouse.down();
  await page.mouse.move(title.x + 64, title.y + title.height / 2 + 16, { steps: 3 }); await page.mouse.up();
  const moved = (await frame.boundingBox())!; expect(moved.x).toBe(initial.x + 24); expect(moved.y).toBe(initial.y + 16);
  await form.getByTestId("BTN_Cancelar").click(); await result(page, 0);
  expect(await page.evaluate(() => localStorage.getItem("gestao-oficinas:window-geometry:v1:WIN_Mudar_Estado"))).toBeNull();
  await page.getByTestId("repair-confirmation-open").click(); expect(await frame.boundingBox()).toEqual(initial);
  await expect(letter).toHaveValue(""); await page.keyboard.press("Escape"); await result(page, 0);
});
