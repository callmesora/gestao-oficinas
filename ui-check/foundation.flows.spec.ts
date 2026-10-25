import { expect, test } from "@playwright/test";

test("foundation preview is visible and checks metadata via the UI command adapter", async ({ page }) => {
  await page.goto("/?diagnostics=foundation");
  await expect(page.getByTestId("foundation-preview")).toBeVisible();
  await page.getByTestId("foundation-inspect").click();
  await expect(page.getByTestId("foundation-info")).toHaveText("0.1.0 · browser-preview");
  await page.screenshot({ path: "ui-report/foundation-preview.png" });
});


test("foundation diagnostic exposes failure and can retry with keyboard activation", async ({ page }) => {
  await page.goto("/?diagnostics=foundation");
  await expect(page.getByTestId("foundation-preview")).toBeVisible();
  await page.evaluate(() => {
    const bridge = (window as unknown as { __TAURI_INTERNALS__: { invoke: (command: string, args?: unknown) => Promise<unknown> } }).__TAURI_INTERNALS__;
    const original = bridge.invoke;
    let first = true;
    bridge.invoke = async (command, args) => {
      if (first) { first = false; throw new Error("simulated native failure"); }
      return original(command, args);
    };
  });
  const button = page.getByTestId("foundation-inspect");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toHaveText("Não foi possível verificar o ambiente. Tente novamente.");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByTestId("foundation-info")).toHaveText("0.1.0 · browser-preview");
});
