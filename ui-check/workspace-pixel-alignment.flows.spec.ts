import { expect, test } from "@playwright/test";

const cases = [
  { name: "WIN_Table_estados_descritivos", launcher: "descriptive-states", width: 625 },
  { name: "WIN_Table_mecanicos", launcher: "mechanics", width: 711 },
  { name: "WIN_Table_documentos", launcher: "document-types", width: 663 },
] as const;

for (const { name, launcher, width } of cases) test(`${name}: default center paints on whole pixels and preserves saved x`, async ({ page }) => {
  await page.goto("/?diagnostics=foundation");
  await page.getByTestId(`${launcher}-launcher`).click();
  await page.getByTestId(`${launcher}-open`).click();
  const window = page.getByTestId("workspace-window-1");
  await expect(page.getByTestId(name).first()).toBeVisible();
  const area = (await page.getByTestId("workspace-canvas").boundingBox())!;
  const initial = (await window.boundingBox())!;
  expect(initial.width).toBe(width); expect(initial.height).toBe(600);
  expect(initial.x - area.x).toBe(Math.round(initial.x - area.x));
  expect(initial.y - area.y).toBe(Math.round(initial.y - area.y));
  await window.getByTestId("BTN_SYST_FERMER").click();
  await page.evaluate(({ name, width }) => localStorage.setItem(`gestao-oficinas:window-geometry:v1:${name}`,
    JSON.stringify({ version: 1, x: 12.5, y: 0, width, height: 600, maximized: false })), { name, width });
  await page.getByTestId(`${launcher}-open`).click();
  const restored = (await page.getByTestId("workspace-window-2").boundingBox())!;
  expect(restored.x - area.x).toBe(12.5); expect(restored.y - area.y).toBe(0);
  expect(restored.width).toBe(width); expect(restored.height).toBe(600);
});


test("workspace retains existing fractional saved x and y within the source bounds", async ({ page }) => {
  await page.goto("/?skin=workspace");
  await page.evaluate(() => localStorage.setItem("gestao-oficinas:window-geometry:v1:WIN_Form_Clientes",
    JSON.stringify({ version: 1, x: 12.5, y: 8.5, width: 500, height: 435, maximized: false })));
  await page.getByTestId("workspace-open").click();
  const area = (await page.getByTestId("workspace-canvas").boundingBox())!;
  const restored = (await page.getByTestId("workspace-window-1").boundingBox())!;
  expect(restored.x - area.x).toBe(12.5); expect(restored.y - area.y).toBe(8.5);
  expect(restored.width).toBe(500); expect(restored.height).toBe(435);
});
