import { expect, test, type Locator, type Page } from "@playwright/test";

async function drag(page: Page, target: Locator, dx: number, dy: number) {
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 4 }); await page.mouse.up();
}

const forms = [
  { route: "customers", launcher: "customers-open", name: "WIN_Form_Clientes", frame: "customer-form-frame", restore: "customer-form-restore", field: "EDT_Descricao", width: 500, height: 435 },
  { route: "vehicles", launcher: "vehicles-open", name: "WIN_Form_Viaturas", frame: "vehicle-form-frame", restore: "vehicle-form-restore", field: "EDT_Modelo", width: 500, height: 230 },
  { route: "units", launcher: "units-open", name: "WIN_Form_unidades", frame: "unit-form-frame", restore: "unit-form-restore", field: "EDT_Descricao", width: 500, height: 104 },
  { route: "descriptive-states", launcher: "descriptive-states-open", name: "WIN_Form_estados_descritivos", frame: "descriptiveState-form-frame", restore: "descriptiveState-form-restore", field: "EDT_Descricao", width: 500, height: 104 },
  { route: "terminals", launcher: "terminals-open", name: "WIN_Form_Terminais", frame: "terminal-form-frame", restore: "terminal-form-restore", field: "EDT_Descricao", width: 500, height: 297 },
];

for (const spec of forms) test(`MIG-7C2 ${spec.name} real modal retains drafts and source anchors through sizing, minimize and saved geometry`, async ({ page }) => {
  await page.goto(`/?workflow=${spec.route}`); await page.getByTestId(spec.launcher).click(); await page.getByTestId("Btn_New").click();
  const modal = page.getByTestId(spec.name), frame = page.getByTestId(spec.frame), field = modal.getByTestId(spec.field);
  const title = await modal.getByTestId("RADTitle").textContent();
  await expect(modal).toHaveAccessibleName(title!);
  await field.fill(`Draft ${spec.route}`);
  const originalField = (await field.boundingBox())!, originalButton = (await modal.getByTestId("BTN_Validar").boundingBox())!;
  await drag(page, page.getByTestId(`${spec.frame}-resize-se`), 64, 32);
  await expect(frame).toHaveCSS("width", `${spec.width + 64}px`); await expect(frame).toHaveCSS("height", `${spec.height + 32}px`);
  expect((await field.boundingBox())!.width).toBe(originalField.width + 64);
  expect((await modal.getByTestId("BTN_Validar").boundingBox())!.x).toBe(originalButton.x + 64);
  await page.getByTestId(`${spec.frame}-resize-se`).focus(); await page.keyboard.press("Shift+ArrowRight");
  await expect(frame).toHaveCSS("width", `${spec.width + 65}px`);
  await field.focus(); await modal.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(frame).toBeHidden();
  await expect(page.getByTestId(spec.restore)).toHaveText(title!);
  await page.getByTestId(spec.restore).click(); await expect(field).toHaveValue(`Draft ${spec.route}`); await expect(field).toBeFocused();
  await modal.getByTestId("BTN_Syst_Maximize").click(); await expect(frame).toHaveCSS("width", "984px");
  const owner = (await page.getByTestId("workspace-window-1-frame").boundingBox())!;
  await drag(page, modal.getByTestId("RADTitle"), 24, 16);
  expect(await page.getByTestId("workspace-window-1-frame").boundingBox()).toEqual(owner);
  await modal.getByTestId("BTN_Syst_Maximize").click(); await expect(frame).toHaveCSS("width", `${spec.width + 65}px`);
  const before = (await frame.boundingBox())!;
  await drag(page, modal.getByTestId("RADTitle"), -24, -16);
  expect((await frame.boundingBox())!.x).toBe(before.x - 24);
  expect((await frame.boundingBox())!.y).toBe(before.y - 16);
  await modal.getByTestId("BTN_Cancelar").click(); await expect(modal).toHaveCount(0);
  await page.getByTestId("Btn_New").click();
  await expect(frame).toHaveCSS("width", `${spec.width + 65}px`); await expect(frame).toHaveCSS("height", `${spec.height + 32}px`);
  expect((await frame.boundingBox())!.x).toBe(before.x - 24); expect((await frame.boundingBox())!.y).toBe(before.y - 16);
  await expect(field).toHaveValue("");
  const stored = await page.evaluate(name => JSON.parse(localStorage.getItem(`gestao-oficinas:window-geometry:v1:${encodeURIComponent(name)}`)!), spec.name);
  expect(Object.keys(stored).sort()).toEqual(["height", "maximized", "version", "width", "x", "y"]);
  await modal.getByTestId("BTN_Syst_Maximize").click(); await page.reload();
  await page.getByTestId(spec.launcher).click(); await page.getByTestId("Btn_New").click();
  await expect(frame).toHaveCSS("width", "984px"); await expect(field).toHaveValue("");
  await modal.getByTestId("BTN_Syst_Maximize").click(); await expect(frame).toHaveCSS("width", `${spec.width + 65}px`);
  await modal.getByTestId("BTN_Cancelar").click();
});

test("MIG-7C2 actual vehicle/customer dialogs keep their keys, geometry, draft and caller ownership", async ({ page }) => {
  await page.goto("/?workflow=vehicles"); await page.getByTestId("vehicles-open").click(); await page.getByTestId("Btn_New").click();
  const vehicle = page.getByTestId("WIN_Form_Viaturas"), picker = page.getByTestId("customer-picker"), customer = page.getByTestId("WIN_Form_Clientes");
  await vehicle.getByTestId("EDT_Matricula").focus();
  for (const next of ["EDT_Marca", "EDT_Modelo", "COMBO_Codigo", "BTN_VISION", "EDT_Ano", "EDT_Mes"]) {
    await page.keyboard.press("Tab"); await expect(vehicle.getByTestId(next)).toBeFocused();
  }
  await vehicle.getByTestId("EDT_Modelo").fill("Vehicle retained"); await vehicle.getByTestId("BTN_VISION").click();
  await drag(page, page.getByTestId("customer-picker-frame-resize-se"), 48, 24);
  await expect(page.getByTestId("customer-picker-frame")).toHaveCSS("width", "848px");
  await picker.getByTestId("Btn_New").click(); await expect(customer.getByTestId("EDT_Descricao")).toBeFocused();
  await customer.getByTestId("EDT_Codigo").fill("0"); await customer.getByTestId("BTN_Validar").click();
  const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message.getByTestId("LIB_INFO")).toHaveText("Falta indicar o código");
  await page.keyboard.press("Escape"); await expect(message).toHaveCount(0);
  await expect(customer).toBeVisible(); await expect(picker).toBeVisible(); await expect(vehicle).toBeVisible();
  await page.keyboard.press("Escape"); await expect(customer).toHaveCount(0); await expect(picker).toBeVisible();
  await picker.getByTestId("BTN_Fechar").click(); await expect(picker).toHaveCount(0);
  await expect(vehicle.getByTestId("EDT_Modelo")).toHaveValue("Vehicle retained");
  await vehicle.getByTestId("BTN_VISION").click(); await expect(page.getByTestId("customer-picker-frame")).toHaveCSS("width", "848px");
  await page.keyboard.press("Escape"); await expect(picker).toHaveCount(0); await expect(vehicle).toBeVisible();
  await vehicle.getByTestId("BTN_Cancelar").click();
});

test("MIG-7C2 malformed/unavailable geometry falls back and source minimum stops north/west sizing", async ({ page }) => {
  await page.goto("/?workflow=units");
  await page.evaluate(() => {
    localStorage.setItem("gestao-oficinas:window-geometry:v1:WIN_Form_unidades", '{"version":1,"width":-1}');
  });
  await page.getByTestId("units-open").click(); await page.getByTestId("Btn_New").click();
  const frame = page.getByTestId("unit-form-frame"), modal = page.getByTestId("WIN_Form_unidades");
  await expect(frame).toHaveCSS("width", "500px"); await expect(frame).toHaveCSS("height", "104px");
  await drag(page, page.getByTestId("unit-form-frame-resize-se"), 64, 24);
  const before = (await frame.boundingBox())!;
  await drag(page, page.getByTestId("unit-form-frame-resize-nw"), 200, 200);
  await expect(frame).toHaveCSS("width", "500px"); await expect(frame).toHaveCSS("height", "104px");
  const after = (await frame.boundingBox())!;
  expect(after.x + after.width).toBe(before.x + before.width); expect(after.y + after.height).toBe(before.y + before.height);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("blocked storage"); }; });
  await modal.getByTestId("BTN_Cancelar").click(); await expect(modal).toHaveCount(0);
  await page.getByTestId("Btn_New").click(); await expect(frame).toHaveCSS("width", "500px");
});

for (const spec of [
  { route: "descriptive-states", launcher: "descriptive-states-select-open", picker: "descriptive-state-picker", frame: "descriptive-state-picker-frame", result: "descriptive-states-returned" },
  { route: "terminals", launcher: "terminals-select-open", picker: "terminal-picker", frame: "terminal-picker-frame", result: "terminals-returned" },
]) test(`MIG-7C2 ${spec.picker} sizes independently and returns its actual cancellation origin`, async ({ page }) => {
  await page.goto(`/?workflow=${spec.route}&selecting=1&origin=ORIGINAL`); await page.getByTestId(spec.launcher).click();
  const picker = page.getByTestId(spec.picker), frame = page.getByTestId(spec.frame);
  const width = (await frame.boundingBox())!.width;
  await drag(page, page.getByTestId(`${spec.frame}-resize-se`), 32, 16);
  await expect(frame).toHaveCSS("width", `${width + 32}px`);
  await picker.getByTestId("BTN_Fechar").click(); await expect(picker).toHaveCount(0);
  await expect(page.getByTestId(spec.result)).toHaveText("ORIGINAL");
  await page.getByTestId(spec.launcher).click(); await expect(frame).toHaveCSS("width", `${width + 32}px`);
  await picker.getByTestId("BTN_SYST_FERMER").click(); await expect(page.getByTestId(spec.result)).toHaveText("ORIGINAL");
});
