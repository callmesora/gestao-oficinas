import { expect, test } from "@playwright/test";

test("workspace keeps instances independent through stacking, minimize, restore and close", async ({ page }) => {
  await page.goto("/?diagnostics=foundation");
  await page.getByTestId("workspace-launcher").click();
  await expect(page.getByTestId("workspace-open")).toBeVisible();
  await page.evaluate(() => {
    const state = window as unknown as { __workspaceNativeCalls: string[]; __TAURI_INTERNALS__: { invoke: (command: string) => Promise<unknown> } };
    state.__workspaceNativeCalls = [];
    state.__TAURI_INTERNALS__.invoke = async command => { state.__workspaceNativeCalls.push(command); throw new Error("Workspace child actions must remain in-app"); };
  });
  await page.getByTestId("workspace-open").click();
  const a = page.getByTestId("workspace-window-1"), b = page.getByTestId("workspace-window-2");
  await a.getByTestId("EDT_Descricao").fill("  Açores A  ");
  await a.getByTestId("EDT_Observacao").fill("A\nB");
  await page.getByTestId("workspace-open").click();
  await b.getByTestId("EDT_Descricao").fill("Oficina B");
  await expect(b).toHaveAttribute("data-active", "true");
  await page.getByTestId("workspace-window-1-task").focus();
  await page.keyboard.press("Enter");
  await expect(a).toHaveAttribute("data-active", "true");
  await expect(a.getByTestId("EDT_Observacao")).toBeFocused();
  await a.getByTestId("BTN_SYST_MINIMIZE").click();
  await expect(a).toBeHidden();
  await expect(b).toHaveAttribute("data-active", "true");
  await expect(b.getByTestId("EDT_Descricao")).toBeFocused();
  await page.getByTestId("workspace-window-1-task").click();
  await expect(a.getByTestId("EDT_Descricao")).toHaveValue("  Açores A  ");
  await expect(a.getByTestId("EDT_Observacao")).toHaveValue("A\nB");
  await expect(a.getByTestId("EDT_Observacao")).toBeFocused();
  await a.getByTestId("BTN_SYST_FERMER").click();
  await expect(a).toHaveCount(0);
  await expect(page.getByTestId("workspace-window-1-task")).toHaveCount(0);
  await expect(b.getByTestId("EDT_Descricao")).toHaveValue("Oficina B");
  await expect(b.getByTestId("EDT_Descricao")).toBeFocused();
  await page.getByTestId("workspace-open").click();
  await expect(page.getByTestId("workspace-window-3").getByTestId("EDT_Descricao")).toHaveValue("");
  await page.getByTestId("workspace-window-3").getByTestId("BTN_SYST_FERMER").click();
  await b.getByTestId("BTN_SYST_FERMER").click();
  await expect(page.getByTestId("workspace-open")).toBeFocused();
  expect(await page.evaluate(() => (window as unknown as { __workspaceNativeCalls: string[] }).__workspaceNativeCalls)).toEqual([]);
});

test("workspace title drag, maximize and restore keep local bounds and mounted input", async ({ page }) => {
  await page.goto("/?skin=workspace");
  await page.getByTestId("workspace-open").click();
  const window = page.getByTestId("workspace-window-1"), canvas = page.getByTestId("workspace-canvas");
  await window.getByTestId("EDT_Descricao").fill("Preservar");
  const original = (await window.boundingBox())!, area = (await canvas.boundingBox())!, title = (await window.getByTestId("RADTitle").boundingBox())!;
  await page.mouse.move(title.x + 20, title.y + 8);
  await page.mouse.down();
  await page.mouse.move(title.x - 50, title.y - 22, { steps: 4 });
  await page.mouse.up();
  const moved = (await window.boundingBox())!;
  expect(moved.x).toBeCloseTo(Math.max(area.x, original.x - 70));
  expect(moved.y).toBeCloseTo(Math.max(area.y, original.y - 30));
  await window.getByTestId("BTN_Syst_Maximize").click();
  await expect.poll(async () => (await window.boundingBox())!.width).toBe(await canvas.evaluate(element => element.clientWidth));
  expect((await window.boundingBox())!.x).toBeCloseTo(area.x);
  await expect(window.getByTestId("EDT_Descricao")).toHaveValue("Preservar");
  const wide = (await window.boundingBox())!, button = (await window.getByTestId("BTN_Validar").boundingBox())!;
  expect(wide.x + wide.width - button.x - button.width).toBeCloseTo(14);
  const editWidth = await window.getByTestId("EDT_Descricao").evaluate(element => element.parentElement!.getBoundingClientRect().width);
  expect(editWidth).toBeCloseTo(380 + wide.width - 500);
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect.poll(async () => (await window.boundingBox())!.width).toBe(await canvas.evaluate(element => element.clientWidth));
  await window.getByTestId("BTN_Syst_Maximize").click();
  const restored = (await window.boundingBox())!, resizedArea = (await canvas.boundingBox())!;
  expect(restored.width).toBe(500);
  expect((await window.getByTestId("EDT_Descricao").evaluate(element => element.parentElement!.getBoundingClientRect().width))).toBe(380);
  const restoredButton = (await window.getByTestId("BTN_Validar").boundingBox())!;
  expect(restoredButton.x - restored.x).toBe(406);
  expect(restored.x - resizedArea.x).toBeCloseTo(moved.x - area.x);
  expect(restored.y - resizedArea.y).toBeCloseTo(moved.y - area.y);
  await expect(window.getByTestId("EDT_Descricao")).toHaveValue("Preservar");
  await canvas.screenshot({ path: "ui-report/workspace.png" });
  const handle = (await window.getByTestId("RADTitle").boundingBox())!;
  await page.mouse.move(handle.x + 20, handle.y + 8);
  await page.mouse.down();
  await page.mouse.move(1100, handle.y + 8, { steps: 4 });
  await page.mouse.up();
  await page.setViewportSize({ width: 640, height: 768 });
  await expect.poll(async () => {
    const current = (await window.boundingBox())!, bounds = (await canvas.boundingBox())!;
    return current.x - bounds.x <= await canvas.evaluate(element => element.clientWidth) - 80 + 1;
  }).toBe(true);
});

test("workspace modal blocks background input and resumes only its owning instance", async ({ page }) => {
  await page.goto("/?skin=workspace");
  await page.getByTestId("workspace-open").click();
  await page.getByTestId("workspace-open").click();
  const a = page.getByTestId("workspace-window-1"), b = page.getByTestId("workspace-window-2");
  await b.getByTestId("BTN_Validar").click();
  const dialog = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press(i < 6 ? "Tab" : "Shift+Tab");
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(b.getByTestId("workspace-result")).toHaveText("2");
  await expect(a.getByTestId("workspace-result")).toHaveText("");
  await expect(b.getByTestId("BTN_Validar")).toBeFocused();
  await expect(b).toHaveAttribute("data-active", "true");
});

test("workspace manual resizing updates anchored controls and survives maximize/restore without losing input", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/?skin=workspace");
  await page.getByTestId("workspace-open").click();
  const window = page.getByTestId("workspace-window-1"), grip = page.getByTestId("workspace-window-1-resize");
  await window.getByTestId("EDT_Descricao").fill("  Preservar  ");
  const before = (await window.boundingBox())!, handle = (await grip.boundingBox())!;
  await page.mouse.move(handle.x + handle.width - 3, handle.y + handle.height - 3);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width + 93, handle.y + handle.height + 37, { steps: 4 });
  await page.mouse.up();
  await expect(window.getByTestId("workspace-window-1-frame")).toHaveCSS("width", "596px");
  await expect(window.getByTestId("workspace-window-1-frame")).toHaveCSS("height", "475px");
  const resized = (await window.boundingBox())!, button = (await window.getByTestId("BTN_Validar").boundingBox())!;
  expect(resized.x).toBe(before.x); expect(resized.y).toBe(before.y);
  expect(button.x - resized.x).toBe(502);
  expect(await window.getByTestId("EDT_Descricao").evaluate(element => element.parentElement!.getBoundingClientRect().width)).toBe(476);
  await grip.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+ArrowDown");
  await expect(window.getByTestId("workspace-window-1-frame")).toHaveCSS("width", "604px");
  await expect(window.getByTestId("workspace-window-1-frame")).toHaveCSS("height", "476px");
  await window.getByTestId("BTN_Syst_Maximize").click();
  await expect(grip).toHaveCount(0);
  await window.getByTestId("BTN_Syst_Maximize").click();
  await expect(window.getByTestId("workspace-window-1-frame")).toHaveCSS("width", "604px");
  await expect(window.getByTestId("workspace-window-1-frame")).toHaveCSS("height", "476px");
  await expect(window.getByTestId("EDT_Descricao")).toHaveValue("  Preservar  ");
  await window.screenshot({ path: "ui-report/workspace-resized.png" });
});

test("workspace north-west sizing preserves the opposite corner and enforces the source-base minimum", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/?skin=workspace");
  await page.getByTestId("workspace-open").click();
  const window = page.getByTestId("workspace-window-1"), corner = page.getByTestId("workspace-window-1-resize-nw");
  const original = (await window.boundingBox())!;
  let handle = (await corner.boundingBox())!;
  await page.mouse.move(handle.x + 2, handle.y + 2); await page.mouse.down();
  await page.mouse.move(handle.x - 38, handle.y - 18, { steps: 4 }); await page.mouse.up();
  const expanded = (await window.boundingBox())!;
  expect(expanded.width).toBe(540); expect(expanded.height).toBe(455);
  expect(expanded.x + expanded.width).toBe(original.x + original.width);
  expect(expanded.y + expanded.height).toBe(original.y + original.height);
  handle = (await corner.boundingBox())!;
  await page.mouse.move(handle.x + 2, handle.y + 2); await page.mouse.down();
  await page.mouse.move(handle.x + 102, handle.y + 102, { steps: 4 }); await page.mouse.up();
  const minimum = (await window.boundingBox())!;
  expect(minimum).toEqual(original);
});

test("workspace resize capability follows Resizable independently of the optional grip drawing", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/?skin=workspace");
  await page.getByTestId("workspace-open-fixed").click();
  await expect(page.getByTestId("workspace-window-1").locator(".wd-workspace-edge")).toHaveCount(0);
  await page.getByTestId("workspace-open-no-grip").click();
  const window = page.getByTestId("workspace-window-2"), edge = page.getByTestId("workspace-window-2-resize-e");
  await expect(window.locator(".wd-workspace-edge")).toHaveCount(8);
  await expect(page.getByTestId("workspace-window-2-resize")).not.toHaveClass(/wd-workspace-grip/);
  const handle = (await edge.boundingBox())!;
  await page.mouse.move(handle.x + 2, handle.y + 20); await page.mouse.down();
  await page.mouse.move(handle.x + 42, handle.y + 20, { steps: 4 }); await page.mouse.up();
  await expect(window.getByTestId("workspace-window-2-frame")).toHaveCSS("width", "540px");
});

test("saved geometry reopens normal bounds and maximized state without persisting control data", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/?skin=workspace");
  await page.getByTestId("workspace-open").click();
  const first = page.getByTestId("workspace-window-1"), canvas = page.getByTestId("workspace-canvas");
  await first.getByTestId("EDT_Descricao").fill("control data must not survive");
  await page.getByTestId("workspace-window-1-resize").focus();
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("Shift+ArrowDown");
  const title = (await first.getByTestId("RADTitle").boundingBox())!;
  await page.mouse.move(title.x + 20, title.y + 8); await page.mouse.down();
  await page.mouse.move(title.x - 20, title.y - 2, { steps: 4 }); await page.mouse.up();
  const before = (await first.boundingBox())!, area = (await canvas.boundingBox())!;
  await first.getByTestId("BTN_SYST_FERMER").click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("gestao-oficinas:window-geometry:v1:WIN_Form_Clientes")!) as Record<string, unknown>);
  expect(saved).toEqual({ version: 1, x: before.x - area.x, y: before.y - area.y, width: 508, height: 436, maximized: false });
  await page.getByTestId("workspace-open").click();
  const second = page.getByTestId("workspace-window-2");
  expect(await second.boundingBox()).toEqual(before);
  await expect(second.getByTestId("EDT_Descricao")).toHaveValue("");
  await second.getByTestId("BTN_Syst_Maximize").click();
  await second.getByTestId("BTN_SYST_FERMER").click();
  await page.getByTestId("workspace-open").click();
  const third = page.getByTestId("workspace-window-3");
  await expect(third.getByTestId("workspace-window-3-frame")).toHaveCSS("width", `${await canvas.evaluate(element => element.clientWidth)}px`);
  await third.getByTestId("BTN_Syst_Maximize").click();
  expect(await third.boundingBox()).toEqual(before);
});

test("real page reload saves open geometry and never reopens minimized or input state", async ({ page }) => {
  await page.goto("/?skin=workspace");
  await page.getByTestId("workspace-open").click();
  const first = page.getByTestId("workspace-window-1");
  await first.getByTestId("EDT_Descricao").fill("discard on reload");
  await page.getByTestId("workspace-window-1-resize").focus(); await page.keyboard.press("ArrowRight");
  await first.getByTestId("BTN_SYST_MINIMIZE").click();
  await page.reload();
  await page.getByTestId("workspace-open").click();
  await expect(first).toBeVisible();
  await expect(first.getByTestId("workspace-window-1-frame")).toHaveCSS("width", "508px");
  await expect(first.getByTestId("EDT_Descricao")).toHaveValue("");
});

test("saved geometry recovers offscreen settings and disabled persistence neither reads nor overwrites them", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/?skin=workspace");
  await page.evaluate(() => localStorage.setItem("gestao-oficinas:window-geometry:v1:WIN_Form_Clientes", JSON.stringify({ version: 1, x: 99999, y: 99999, width: 99999, height: 99999, maximized: false })));
  await page.getByTestId("workspace-open").click();
  const first = page.getByTestId("workspace-window-1"), canvas = page.getByTestId("workspace-canvas");
  const area = (await canvas.boundingBox())!, recovered = (await first.boundingBox())!;
  expect(recovered.x).toBe(area.x); expect(recovered.y).toBe(area.y);
  expect(recovered.width).toBe(await canvas.evaluate(element => element.clientWidth));
  expect(recovered.height).toBe(await canvas.evaluate(element => element.clientHeight));
  await first.getByTestId("BTN_SYST_FERMER").click();
  await page.evaluate(() => localStorage.setItem("gestao-oficinas:window-geometry:v1:WIN_Form_Clientes", "{"));
  await page.getByTestId("workspace-open").click();
  const second = page.getByTestId("workspace-window-2");
  await expect(second.getByTestId("workspace-window-2-frame")).toHaveCSS("width", "500px");
  await second.getByTestId("BTN_SYST_FERMER").click();
  const stored = JSON.stringify({ version: 1, x: 33, y: 21, width: 700, height: 500, maximized: false });
  await page.evaluate(value => localStorage.setItem("gestao-oficinas:window-geometry:v1:WIN_Form_Clientes", value), stored);
  await page.getByTestId("workspace-open-unsaved").click();
  const third = page.getByTestId("workspace-window-3");
  await expect(third.getByTestId("workspace-window-3-frame")).toHaveCSS("width", "500px");
  await third.getByTestId("BTN_SYST_FERMER").click();
  expect(await page.evaluate(() => localStorage.getItem("gestao-oficinas:window-geometry:v1:WIN_Form_Clientes"))).toBe(stored);
});

test("unavailable geometry storage never blocks window close and subsequent opening", async ({ page }) => {
  await page.goto("/?skin=workspace");
  await page.evaluate(() => {
    Object.defineProperty(Storage.prototype, "getItem", { value: () => { throw new DOMException("Blocked", "SecurityError"); } });
    Object.defineProperty(Storage.prototype, "setItem", { value: () => { throw new DOMException("Blocked", "SecurityError"); } });
  });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.getByTestId("workspace-open").click();
  await page.getByTestId("workspace-window-1").getByTestId("BTN_SYST_FERMER").click();
  await expect(page.getByTestId("workspace-window-1")).toHaveCount(0);
  await page.getByTestId("workspace-open").click();
  await expect(page.getByTestId("workspace-window-2")).toBeVisible();
  expect(errors).toEqual([]);
});

test("pagehide saves the top instance per layout and fixed-size windows ignore stored dimensions", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/?skin=workspace");
  await page.getByTestId("workspace-open").click();
  await page.getByTestId("workspace-window-1-resize").focus(); await page.keyboard.press("ArrowRight");
  await page.getByTestId("workspace-open").click();
  await page.getByTestId("workspace-window-2-resize").focus();
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight");
  await page.getByTestId("workspace-window-1-task").click();
  await expect(page.getByTestId("workspace-window-1")).toHaveAttribute("data-active", "true");
  await page.reload();
  await page.getByTestId("workspace-open").click();
  await expect(page.getByTestId("workspace-window-1-frame")).toHaveCSS("width", "508px");
  await page.getByTestId("workspace-window-1").getByTestId("BTN_SYST_FERMER").click();
  await page.getByTestId("workspace-open-fixed").click();
  await expect(page.getByTestId("workspace-window-2-frame")).toHaveCSS("width", "500px");
});
