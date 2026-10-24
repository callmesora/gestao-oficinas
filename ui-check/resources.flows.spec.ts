import { expect, test } from "@playwright/test";

test("resource button grows to its caption and reserves the source gap", async ({ page }) => {
  await page.goto("/?skin=controls");
  await page.getByTestId("skin-resource-long").click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX");
  await expect.poll(async () => (await dialog.getByTestId("BTN_1").boundingBox())!.width).toBeGreaterThan(80);
  const first = (await dialog.getByTestId("BTN_1").boundingBox())!, second = (await dialog.getByTestId("BTN_2").boundingBox())!;
  expect(second.x - first.x - first.width).toBeCloseTo(12);
  await dialog.getByTestId("BTN_2").click();
  await expect(page.getByTestId("skin-message-result")).toHaveText(JSON.stringify({ result: 2 }));
});

test("resource click and Escape return explicit button values and current untrimmed input", async ({ page }) => {
  await page.goto("/?skin=controls");
  const result = page.getByTestId("skin-message-result");
  await page.getByTestId("skin-resource-open").click();
  let dialog = page.getByTestId("WINDEVDIALOGBOX");
  await expect(dialog.getByTestId("SAI_1")).toBeFocused();
  await dialog.getByTestId("SAI_1").fill("  Açores  ");
  await dialog.getByTestId("SAI_1").press("Enter");
  await expect(result).toHaveText(JSON.stringify({ result: 11, input: "  Açores  " }));
  await page.getByTestId("skin-resource-open").click();
  dialog = page.getByTestId("WINDEVDIALOGBOX");
  await dialog.getByTestId("SAI_1").fill("  Cancelado  ");
  await page.keyboard.press("Escape");
  await expect(result).toHaveText(JSON.stringify({ result: 27, input: "  Cancelado  " }));
});

test("resource close retains the raw cancel index and original input; checkbox and multiline use real controls", async ({ page }) => {
  await page.goto("/?skin=controls");
  const result = page.getByTestId("skin-message-result");
  await page.getByTestId("skin-resource-open").click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX");
  await dialog.getByTestId("SAI_1").fill("Changed");
  await dialog.getByTestId("BTN_SYST_FERMER").click();
  await expect(result).toHaveText(JSON.stringify({ result: 2, input: "  original  " }));
  await page.getByTestId("skin-resource-checkbox").click();
  await page.getByTestId("INT_1").check();
  await page.getByTestId("BTN_1").click();
  await expect(result).toHaveText(JSON.stringify({ result: 1, input: true }));
  await page.getByTestId("skin-resource-multiline").click();
  const text = page.getByTestId("SAI_1");
  await expect(text).toHaveValue("A\nB");
  await text.fill("  A\nB  ");
  await expect(text).toHaveValue("  A\nB  ");
  await text.press("Enter");
  await expect(page.getByTestId("WINDEVDIALOGBOX")).toBeVisible();
  await page.getByTestId("BTN_1").click();
  const value = JSON.parse((await result.textContent())!) as { result: number; input: string };
  expect(value.result).toBe(1);
  expect(value.input).toBe("  A\r\nB  \r\n");
});
