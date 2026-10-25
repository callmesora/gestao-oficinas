import { expect, test, type Locator, type Page } from "@playwright/test";

async function drag(page: Page, target: Locator, dx: number, dy: number) {
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 4 }); await page.mouse.up();
}
async function nativeModal(form: Locator) {
  expect(await form.evaluate(element => element instanceof HTMLDialogElement && element.matches(":modal"))).toBe(true);
  await expect(form.locator("[data-wd-window-interaction]").first()).toHaveClass(/react-draggable/);
}

test("actual nested vehicle/customer picker uses the shared interaction adapter while native dialogs retain focus, source frames and cancellation ownership", async ({ page }) => {
  await page.goto("/?workflow=vehicles"); await page.getByTestId("vehicles-open").click(); await page.getByTestId("Btn_New").click();
  const vehicle = page.getByTestId("WIN_Form_Viaturas"), picker = page.getByTestId("customer-picker"), customer = page.getByTestId("WIN_Form_Clientes");
  await nativeModal(vehicle); await vehicle.getByTestId("EDT_Modelo").fill("Owned draft");
  const vehicleBefore = await page.getByTestId("vehicle-form-frame").boundingBox();
  await vehicle.getByTestId("BTN_VISION").click(); await nativeModal(picker);
  await picker.getByTestId("Btn_New").click(); await nativeModal(customer);
  const frame = page.getByTestId("customer-form-frame"), start = (await frame.boundingBox())!;
  expect(start.width).toBe(500); expect(start.height).toBe(435);
  await customer.getByTestId("EDT_Descricao").fill("Nested retained");
  await drag(page, customer.getByTestId("RADTitle"), -36, -20);
  expect((await frame.boundingBox())!.x).toBe(start.x - 36); expect((await frame.boundingBox())!.y).toBe(start.y - 20);
  await drag(page, page.getByTestId("customer-form-frame-resize-se"), 48, 24);
  await expect(frame).toHaveCSS("width", "548px"); await expect(frame).toHaveCSS("height", "459px");
  await customer.getByTestId("EDT_Codigo").fill("0"); await customer.getByTestId("BTN_Validar").click();
  const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message.getByTestId("LIB_INFO")).toHaveText("Falta indicar o código");
  for (let index = 0; index < 5; index++) { await page.keyboard.press(index % 2 ? "Shift+Tab" : "Tab"); expect(await message.evaluate(element => element.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press("Escape"); await expect(message).toHaveCount(0); await expect(customer.getByTestId("EDT_Descricao")).toHaveValue("Nested retained");
  await page.keyboard.press("Escape"); await expect(customer).toHaveCount(0); await expect(picker).toBeVisible();
  await page.keyboard.press("Escape"); await expect(picker).toHaveCount(0); await expect(vehicle.getByTestId("EDT_Modelo")).toHaveValue("Owned draft");
  expect(await page.getByTestId("vehicle-form-frame").boundingBox()).toEqual(vehicleBefore);
  await vehicle.getByTestId("BTN_Cancelar").click(); await expect(vehicle).toHaveCount(0);
});

test("actual mechanic form retains mounted draft/focus and source resizing through nested Info, minimize/maximize, save and cancelled edit", async ({ page, request }) => {
  let writes = 0; page.on("request", request => { if (request.url().endsWith("/api/mechanics/save")) writes++; });
  await page.goto("/?workflow=mechanics"); await page.getByTestId("mechanics-open").click(); await page.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_mecanicos"), frame = page.getByTestId("mechanic-form-frame"); await nativeModal(form);
  await form.getByTestId("EDT_Descricao").fill("Adapter mechanic"); await form.getByTestId("BTN_Validar").click();
  const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message.getByTestId("LIB_INFO")).toHaveText("Falta indicar o código"); await page.keyboard.press("Escape");
  await form.getByTestId("EDT_Codigo").fill("93"); await expect(form.getByTestId("EDT_Codigo")).toHaveValue("93"); await form.getByTestId("EDT_Palavra_passe").fill("Case93");
  const before = (await frame.boundingBox())!; await drag(page, page.getByTestId("mechanic-form-frame-resize-nw"), -24, -16);
  expect((await frame.boundingBox())!.width).toBe(before.width + 24); expect((await frame.boundingBox())!.height).toBe(before.height + 16);
  expect((await frame.boundingBox())!.x + (await frame.boundingBox())!.width).toBe(before.x + before.width);
  await page.getByTestId("mechanic-form-frame-resize-e").press("Shift+ArrowRight"); await expect(frame).toHaveCSS("width", `${before.width + 25}px`);
  await form.getByTestId("EDT_Palavra_passe").focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(frame).toBeHidden();
  await page.getByTestId("mechanic-form-restore").click(); await expect(form.getByTestId("EDT_Palavra_passe")).toBeFocused(); await expect(form.getByTestId("EDT_Palavra_passe")).toHaveValue("Case93");
  await form.getByTestId("BTN_Syst_Maximize").click(); await expect(frame).toHaveCSS("width", "984px");
  const maximized = await frame.boundingBox(); await drag(page, form.getByTestId("RADTitle"), 40, 24); expect(await frame.boundingBox()).toEqual(maximized);
  await form.getByTestId("BTN_Syst_Maximize").click(); await expect(frame).toHaveCSS("width", `${before.width + 25}px`); expect(writes).toBe(0);
  await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect(writes).toBe(1);
  const row = page.getByTestId("TABLE_mecanicos").locator("tbody tr").filter({hasText:"Adapter mechanic"}); await expect(row).toHaveCount(1); await row.dblclick();
  await form.getByTestId("EDT_Descricao").fill("Cancelled edit"); await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(row).toContainText("Adapter mechanic"); expect(writes).toBe(1);
  const session = await request.post("/api/development/session", { headers: { Origin: new URL(page.url()).origin, "X-Isolated-Development": "1" } });
  expect(session.ok()).toBe(true); const headers = { Authorization: `Bearer ${(await session.json()).token}` };
  const listed = await request.post("/api/mechanics/list", { headers, data: {} }); expect(listed.ok()).toBe(true);
  const beforeCleanup = (await listed.json()).mechanics as { id: string; Codigo: number | null; Descricao: string | null }[];
  const owned = beforeCleanup.filter(item => item.Codigo === 93 && item.Descricao === "Adapter mechanic");
  expect(owned).toHaveLength(1);
  const removed = await request.post("/api/mechanics/delete", { headers, data: { id: owned[0].id } }); expect(await removed.json()).toEqual({ kind: "deleted" });
  const remaining = await request.post("/api/mechanics/list", { headers, data: {} }); expect(remaining.ok()).toBe(true);
  expect((await remaining.json()).mechanics.map((item: { id: string }) => item.id).sort())
    .toEqual(beforeCleanup.filter(item => item.id !== owned[0].id).map(item => item.id).sort());
});

test("a source-wide actual customer picker remains reachable by native host scrolling on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({width:640,height:600}); await page.goto("/?workflow=vehicles"); await page.getByTestId("vehicles-open").click(); await page.getByTestId("Btn_New").click();
  const vehicle = page.getByTestId("WIN_Form_Viaturas"); await vehicle.getByTestId("BTN_VISION").click();
  const picker = page.getByTestId("customer-picker"), frame = page.getByTestId("customer-picker-frame"); await nativeModal(picker);
  await expect(frame).toHaveCSS("width","800px"); await expect(frame).toHaveCSS("height","600px");
  expect(await picker.evaluate(element=>element.scrollWidth>element.clientWidth)).toBe(true);
  await picker.evaluate(element=>{element.scrollLeft=element.scrollWidth-element.clientWidth;element.scrollTop=element.scrollHeight-element.clientHeight;});
  const close = picker.getByTestId("BTN_Fechar"), button = (await close.boundingBox())!; expect(button.x).toBeGreaterThanOrEqual(0); expect(button.x+button.width).toBeLessThanOrEqual(640);
  await close.click(); await expect(picker).toHaveCount(0); await expect(vehicle).toBeVisible(); await vehicle.getByTestId("BTN_Cancelar").click();
});


test("actual customer modal retains saved fractional coordinates exactly on opening and cancellation", async ({ page }) => {
  await page.goto("/?workflow=customers");
  const stored = { version: 1, x: 12.5, y: 8.5, width: 500, height: 435, maximized: false };
  await page.evaluate(value => localStorage.setItem("gestao-oficinas:window-geometry:v1:WIN_Form_Clientes", JSON.stringify(value)), stored);
  await page.getByTestId("customers-open").click(); await page.getByTestId("Btn_New").click();
  expect(await page.getByTestId("customer-form-frame").boundingBox()).toEqual({ x: 12.5, y: 8.5, width: 500, height: 435 });
  await page.getByTestId("WIN_Form_Clientes").getByTestId("BTN_Cancelar").click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("gestao-oficinas:window-geometry:v1:WIN_Form_Clientes")!))).toEqual(stored);
});
