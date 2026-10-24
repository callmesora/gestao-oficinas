import { expect, test } from "@playwright/test";

test("workspace keeps instances independent through stacking, minimize, restore and close", async ({ page }) => {
  await page.goto("/");
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
