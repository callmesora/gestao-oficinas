import { expect, test, type Locator, type Page } from "@playwright/test";
import scenario from "../docs/golden/GS-DATE-001/scenario.json" with { type: "json" };

type Value = string | null;
async function open(page: Page, value: Value = scenario.original, title = scenario.title) {
  const query = new URLSearchParams({ workflow: "date-prompt", title, ...(value === null ? { kind: "null" } : { value }) });
  await page.goto(`/?${query}`);
  await page.getByTestId("date-prompt-open").click();
  const form = page.getByTestId("WIN_Data");
  await expect(form).toBeVisible();
  return form;
}
async function result(page: Page, value: Value) {
  await expect(page.getByTestId("WIN_Data")).toHaveCount(0);
  expect(await page.getByTestId("date-prompt-returned").textContent()).toBe(value ?? "");
  await expect(page.getByTestId("date-prompt-returned-kind")).toHaveText(value === null ? "null" : "string");
}
async function noResult(page: Page) {
  await expect(page.getByTestId("WIN_Data")).toBeVisible();
  await expect(page.getByTestId("date-prompt-returned")).toHaveCount(0);
  await expect(page.getByTestId("WINDEVMESSAGEBOX")).toHaveCount(0);
}
async function fallback(page: Page) {
  // A separate manual-adapter test, never used to prove a real popup selection.
  await page.addInitScript(() => Object.defineProperty(HTMLInputElement.prototype, "showPicker", { configurable: true, value: undefined }));
}
async function leaveCalendar(form: Locator) {
  await form.getByTestId("EDT_Data__calendar-input").press("Escape");
  // An opaque browser popup may consume the first key itself. Parent cancellation still owns adapter mode.
  if (await form.getByTestId("EDT_Data__calendar-input").isVisible()) {
    await form.evaluate(element => element.dispatchEvent(new Event("cancel", { cancelable: true })));
  }
  await expect(form.getByTestId("EDT_Data__calendar-input")).toBeHidden();
  await expect(form.getByTestId("EDT_Data")).toBeFocused();
}

test("RULE-W16C5A7-1000 source-absent chrome mounts the actual Date dialog and exact runtime prompt", async ({ page }) => {
  const title = " Data d'Água  ", form = await open(page, scenario.original, title);
  expect(await form.getByTestId("STC_Data").textContent()).toBe(title);
  await expect(form.locator(".wd-chrome-button")).toHaveCount(0);
  for (const name of ["BTN_SYST_MINIMIZE", "BTN_Syst_Maximize", "BTN_SYST_FERMER", "BTN_Cancelar"]) await expect(form.getByTestId(name)).toHaveCount(0);
  await expect(form.getByTestId("BTN_Confirmar")).toHaveText("Confirmar");
  await form.getByTestId("BTN_Confirmar").click(); await result(page, scenario.original);
});

test("GS-DATE-001 SRC-f238b5fac8 SRC-11e5297e6b actual original and deliberate leap-date results remain distinct", async ({ page }) => {
  let form = await open(page);
  await expect(form.getByTestId("STC_Data")).toHaveText(scenario.title);
  await expect(form.getByTestId("EDT_Data")).toHaveValue("28/02/2024");
  await form.getByTestId("BTN_Confirmar").click(); await result(page, scenario.original);
  await page.getByTestId("date-prompt-open").click(); form = page.getByTestId("WIN_Data");
  await expect(form.getByTestId("EDT_Data")).toHaveValue("28/02/2024");
  await form.getByTestId("EDT_Data").fill(scenario.edit);
  await form.getByTestId("BTN_Confirmar").click(); await result(page, scenario.confirmed);
});

test("ADR-002 U-W16C5A7-05 untouched NULL empty zero and opaque source values survive actual Confirm losslessly", async ({ page }) => {
  for (const [value, display] of [[null, ""], ["", ""], ["00000000", "00/00/0000"], ["20230229", "20230229"], ["2024-02-28 13:14:15.016", "2024-02-28 13:14:15.016"], [" d'Água  ", " d'Água  "]] as const) {
    const form = await open(page, value);
    await expect(form.getByTestId("EDT_Data")).toHaveValue(display);
    await form.getByTestId("BTN_Confirmar").click(); await result(page, value);
  }
});

test("SRC-f238b5fac8 safe cancellation returns the exact original after edits including NULL and zero", async ({ page }) => {
  for (const value of [scenario.original, null, "", "00000000", "2024-02-28 13:14:15.016"]) {
    const form = await open(page, value);
    await form.getByTestId("EDT_Data").fill("31/12/2030");
    await page.keyboard.press("Escape"); await result(page, value);
  }
});

test("RULE-W16C5A7-1002 deliberate blank and zero dates are accepted without inventing Required input", async ({ page }) => {
  for (const [value, edit, returned] of [[null, "", ""], [scenario.original, "", ""], [scenario.original, "00/00/0000", "00000000"]] as const) {
    const form = await open(page, value), field = form.getByTestId("EDT_Data");
    // A real NULL→text→blank round trip is edited-empty. fill("") alone on blank NULL might emit no input.
    if (value === null) await field.fill("01/01/2000");
    await field.fill(edit); await form.getByTestId("BTN_Confirmar").click(); await result(page, returned);
  }
});

test("RULE-W16C5A7-1002 blocking invalid edited dates retains focus and source-supported style without Info", async ({ page }) => {
  const form = await open(page), field = form.getByTestId("EDT_Data");
  await expect(field).not.toHaveAttribute("required");
  for (const invalid of ["29/02/2023", "31/04/2024", "01/01/0000", "1/2/2024", " 29/02/2024", "20240229", "2024-02-29 00:00:00.000"]) {
    await field.fill(invalid); await form.getByTestId("BTN_Confirmar").click();
    await noResult(page); await expect(field).toBeFocused(); await expect(field).toHaveValue(invalid);
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveCSS("outline-style", "solid");
  }
  await field.fill("29/02/2024"); await expect(field).not.toHaveAttribute("aria-invalid");
  await form.getByTestId("BTN_Confirmar").click(); await result(page, "20240229");
});

test("RULE-W16C5A7-1002 source Tab1→Confirm2, automatic erase and Normal input Enter remain explicit target defaults", async ({ page }) => {
  const form = await open(page), field = form.getByTestId("EDT_Data"), confirm = form.getByTestId("BTN_Confirmar");
  await expect(field).toBeFocused(); await expect(field).toHaveAttribute("type", "text");
  expect(await field.evaluate(element => { const input = element as HTMLInputElement; return [input.selectionStart, input.selectionEnd]; })).toEqual([0, 10]);
  await field.press("Enter"); await noResult(page);
  await page.keyboard.press("Tab"); await expect(confirm).toBeFocused();
  await page.keyboard.press("Tab"); await expect(field).toBeFocused();
  await field.pressSequentially("29/02/2024"); await expect(field).toHaveValue("29/02/2024");
  await page.keyboard.press("Shift+Tab"); await expect(confirm).toBeFocused();
  await page.keyboard.press("Enter"); await result(page, "20240229");
});

test("ADR-003 calendar opening and dismissal retain raw NULL zero and opaque originals without marking an edit", async ({ page }) => {
  for (const value of [null, "00000000", "20230229", " d'Água  "]) {
    const form = await open(page, value), field = form.getByTestId("EDT_Data"), before = await field.inputValue();
    await field.press("Alt+ArrowDown");
    const adapter = form.getByTestId("EDT_Data__calendar-input");
    await expect(adapter).toBeVisible(); await expect(adapter).toBeFocused(); await expect(adapter).toHaveValue("");
    // Parent cancellation while adapter mode owns input first restores text and the mounted parent.
    await form.evaluate(element => element.dispatchEvent(new Event("cancel", { cancelable: true })));
    await noResult(page); await expect(adapter).toBeHidden(); await expect(field).toHaveValue(before);
    await field.focus(); await field.press("Escape"); await result(page, value);
  }
});

test("ADR-003 actual trusted native popup selects the adjacent leap day and emits a trusted value-changing event", async ({ page }) => {
  const form = await open(page), adapter = form.getByTestId("EDT_Data__calendar-input");
  expect(await adapter.evaluate(element => typeof (element as HTMLInputElement).showPicker)).toBe("function");
  await page.evaluate(() => {
    const recorded: { type: string; value: string; trusted: boolean }[] = [];
    (window as unknown as { dateNativeEvents: typeof recorded }).dateNativeEvents = recorded;
    for (const type of ["input", "change"]) document.addEventListener(type, event => {
      if (event.target instanceof HTMLInputElement && event.target.dataset.testid === "EDT_Data__calendar-input") {
        recorded.push({ type, value: event.target.value, trusted: event.isTrusted });
      }
    }, { passive: true });
  });
  await form.getByTestId("EDT_Data__calendar").click();
  await expect(adapter).toBeVisible(); await expect(adapter).toBeFocused();
  // No value assignment, fill, event dispatch or showPicker replacement stands in for this selection.
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
  await expect(adapter).toHaveValue("2024-02-29");
  const events = await page.evaluate(() => (window as unknown as { dateNativeEvents: { type: string; value: string; trusted: boolean }[] }).dateNativeEvents);
  expect(events.some(event => event.trusted && event.value === "2024-02-29")).toBe(true);
  expect(events.every(event => event.trusted)).toBe(true);
  await leaveCalendar(form); await expect(form.getByTestId("EDT_Data")).toHaveValue(scenario.edit);
  await form.getByTestId("BTN_Confirmar").click(); await result(page, scenario.confirmed);
});

test("ADR-003 native adapter without popup keeps the original under the same ArrowRight Enter negative-control keys", async ({ page }) => {
  await fallback(page);
  const form = await open(page), adapter = form.getByTestId("EDT_Data__calendar-input");
  await form.getByTestId("EDT_Data__calendar").click(); await expect(adapter).toBeFocused();
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
  await expect(adapter).toHaveValue("2024-02-28");
  await leaveCalendar(form); await expect(form.getByTestId("EDT_Data")).toHaveValue("28/02/2024");
  await form.getByTestId("BTN_Confirmar").click(); await result(page, scenario.original);
});

test("ADR-003 visible manual calendar fallback is usable when showPicker is absent and edited blank remains empty", async ({ page }) => {
  await fallback(page);
  let form = await open(page), adapter = form.getByTestId("EDT_Data__calendar-input");
  await form.getByTestId("EDT_Data__calendar").click(); await expect(adapter).toBeVisible();
  await expect(adapter).toHaveAttribute("type", "date"); await expect(adapter).toHaveAttribute("min", "0001-01-01"); await expect(adapter).toHaveAttribute("max", "9999-12-31");
  await adapter.fill("2032-02-29"); await leaveCalendar(form);
  await expect(form.getByTestId("EDT_Data")).toHaveValue("29/02/2032");
  await form.getByTestId("BTN_Confirmar").click(); await result(page, "20320229");
  await page.getByTestId("date-prompt-open").click(); form = page.getByTestId("WIN_Data"); adapter = form.getByTestId("EDT_Data__calendar-input");
  await form.getByTestId("EDT_Data__calendar").click(); await adapter.fill("");
  await form.getByTestId("BTN_Confirmar").click(); await result(page, "");
});

test("ADR-003 actual partial native segments remain edited-invalid across rerender, blur and adapter dismissal", async ({ page }) => {
  await fallback(page);
  const form = await open(page), adapter = form.getByTestId("EDT_Data__calendar-input"), field = form.getByTestId("EDT_Data");
  await form.getByTestId("EDT_Data__calendar").click(); await adapter.fill("");
  for (let index = 0; index < 4; index++) await adapter.press("ArrowLeft");
  await adapter.pressSequentially("02");
  expect(await adapter.evaluate(element => (element as HTMLInputElement).validity.badInput)).toBe(true);
  await expect(adapter).toHaveValue("");
  await form.getByTestId("BTN_Confirmar").click(); await noResult(page);
  await expect(adapter).toBeFocused(); await expect(adapter).toHaveAttribute("aria-invalid", "true");
  expect(await adapter.evaluate(element => (element as HTMLInputElement).validity.badInput)).toBe(true);
  await leaveCalendar(form);
  await form.getByTestId("BTN_Confirmar").click(); await noResult(page); await expect(adapter).toBeVisible(); await expect(adapter).toBeFocused();
  await leaveCalendar(form); await field.fill(scenario.edit);
  await form.getByTestId("BTN_Confirmar").click(); await result(page, scenario.confirmed);
});

test("ADR-002 actual NULL native partial edit dismissed before Confirm remains invalid and cancellation retains NULL", async ({ page }) => {
  await fallback(page);
  const form = await open(page, null), adapter = form.getByTestId("EDT_Data__calendar-input");
  await form.getByTestId("EDT_Data__calendar").click();
  for (let index = 0; index < 4; index++) await adapter.press("ArrowLeft");
  await adapter.pressSequentially("02");
  expect(await adapter.evaluate(element => (element as HTMLInputElement).validity.badInput)).toBe(true);
  await leaveCalendar(form);
  await form.getByTestId("BTN_Confirmar").click(); await noResult(page);
  await expect(adapter).toBeFocused(); await expect(adapter).toHaveAttribute("aria-invalid", "true");
  await leaveCalendar(form); await form.getByTestId("EDT_Data").press("Escape"); await result(page, null);
});

test("ADR-002 actual NULL native partial edit then keyboard clearing returns deliberate empty string", async ({ page }) => {
  await fallback(page);
  const form = await open(page, null), adapter = form.getByTestId("EDT_Data__calendar-input");
  await form.getByTestId("EDT_Data__calendar").click();
  for (let index = 0; index < 4; index++) await adapter.press("ArrowLeft");
  await adapter.pressSequentially("02");
  expect(await adapter.evaluate(element => (element as HTMLInputElement).validity.badInput)).toBe(true);
  // Typing can advance to the next segment; clear every actual segment with keyboard input.
  for (let index = 0; index < 4; index++) await adapter.press("ArrowLeft");
  for (let index = 0; index < 3; index++) { await adapter.press("Delete"); await adapter.press("ArrowRight"); }
  expect(await adapter.evaluate(element => (element as HTMLInputElement).validity.badInput)).toBe(false);
  await expect(adapter).toHaveValue("");
  await form.getByTestId("BTN_Confirmar").click(); await result(page, "");
});

test("RULE-W16C5A7-1002 actual native out-of-range input blocks Confirm until a deliberate valid text edit", async ({ page }) => {
  await fallback(page);
  const form = await open(page), adapter = form.getByTestId("EDT_Data__calendar-input");
  await form.getByTestId("EDT_Data__calendar").click(); await adapter.fill("10000-01-01");
  expect(await adapter.evaluate(element => (element as HTMLInputElement).validity.rangeOverflow)).toBe(true);
  await form.getByTestId("BTN_Confirmar").click(); await noResult(page); await expect(adapter).toBeFocused();
  await leaveCalendar(form); await form.getByTestId("EDT_Data").fill("01/01/0001");
  await form.getByTestId("BTN_Confirmar").click(); await result(page, "00010101");
});

test("RULE-W16C5A7-1004 source geometry Center caption and Right date stay fixed without drag resize or saved position", async ({ page }) => {
  const form = await open(page), frame = page.getByTestId("date-prompt-frame"), before = (await frame.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(before).toEqual({ x: (viewport.width - 199) / 2, y: (viewport.height - 173) / 2, width: 199, height: 173 });
  for (const [name, expected] of [["EDT_Data", { x: 49, y: 74, width: 100, height: 27 }], ["STC_Data", { x: 19, y: 36, width: 161, height: 28 }], ["BTN_Confirmar", { x: 42, y: 114, width: 114, height: 38 }]] as const) {
    const control = form.locator(`[data-control-path="${name}"]`), box = (await control.boundingBox())!;
    expect({ x: box.x - before.x, y: box.y - before.y, width: box.width, height: box.height }).toEqual(expected);
  }
  await expect(form.getByTestId("STC_Data")).toHaveCSS("text-align", "center"); await expect(form.getByTestId("STC_Data")).toHaveCSS("align-items", "center");
  await expect(form.getByTestId("EDT_Data")).toHaveCSS("text-align", "right");
  await expect(form.getByTestId("RADTitle")).toHaveText("");
  await expect(page.locator('[data-testid^="date-prompt-frame-resize-"]')).toHaveCount(0);
  const title = (await form.getByTestId("RADTitle").boundingBox())!;
  for (const start of [{ x: title.x + 10, y: title.y + 8 }, { x: before.x + 15, y: before.y + 65 }]) {
    await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(start.x + 25, start.y + 19, { steps: 3 }); await page.mouse.up();
    expect(await frame.boundingBox()).toEqual(before);
  }
  await form.getByTestId("EDT_Data").fill(scenario.edit); await page.keyboard.press("Escape"); await result(page, scenario.original);
  expect(await page.evaluate(() => localStorage.getItem("gestao-oficinas:window-geometry:v1:WIN_Data"))).toBeNull();
  await page.getByTestId("date-prompt-open").click(); expect(await frame.boundingBox()).toEqual(before);
  await expect(form.getByTestId("EDT_Data")).toHaveValue("28/02/2024");
});
