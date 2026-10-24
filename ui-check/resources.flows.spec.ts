import { expect, test } from "@playwright/test";

test("resource icon flags use the source branches and custom images load from the checked inventory", async ({ page }) => {
  await page.goto("/?skin=controls");
  for (const [flags, expected] of [["32", "ICON_Question"], ["48", "ICON_ERREUR"], ["64", "ICON_INFORMATION"], ["0", "custom"]]) {
    await page.getByTestId("skin-resource-icon").selectOption(flags);
    await page.getByTestId("skin-resource-open").click();
    const dialog = page.getByTestId("WINDEVDIALOGBOX"), icon = dialog.getByTestId("ICONE");
    await expect(icon).toBeVisible();
    await expect(icon).toHaveAttribute("data-icon", expected);
    if (expected === "custom") {
      const img = icon.locator("img");
      await expect(img).toHaveAttribute("src", "/skin/note.png");
      await expect.poll(async () => img.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const response = await page.request.get("/skin/note.png");
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toContain("image/png");
    } else await expect(icon).toHaveText(expected === "ICON_ERREUR" ? "×" : expected === "ICON_Question" ? "?" : "i");
    await dialog.getByTestId("BTN_2").click();
  }
});

test("resource text and multiline input expand without covering the source buttons", async ({ page }) => {
  await page.goto("/?skin=controls");
  await page.getByTestId("skin-resource-long-text").click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX"), text = dialog.getByTestId("LIB_INFO"), input = dialog.getByTestId("SAI_1");
  await expect.poll(async () => (await text.boundingBox())!.height).toBeGreaterThan(44);
  await expect.poll(async () => (await input.boundingBox())!.height).toBeGreaterThan(22);
  expect(await input.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
  const field = (await input.boundingBox())!, button = (await dialog.getByTestId("BTN_1").boundingBox())!, frame = (await dialog.boundingBox())!;
  expect(button.y).toBeGreaterThanOrEqual(field.y + field.height);
  expect(button.y + button.height).toBeLessThanOrEqual(frame.y + frame.height);
  await expect(input).toBeFocused();
  await dialog.screenshot({ path: "ui-report/resource-long.png" });
  await dialog.getByTestId("BTN_1").click();
  const result = JSON.parse((await page.getByTestId("skin-message-result").textContent())!) as { input: string };
  expect(result.input).toBe("Um\r\nDois\r\nTrês\r\nQuatro\r\nCinco\r\nSeis");
});

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

test("resource text sizing expands initial multiline width and adapts a limited edit to measured W", async ({ page }) => {
  await page.goto("/?skin=controls");
  await page.getByTestId("skin-resource-sized").click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX"), field = dialog.getByTestId("SAI_1");
  const expected = await field.evaluate(element => {
    const probe = document.createElement("span");
    probe.style.font = getComputedStyle(element).font;
    probe.style.display = "inline-block";
    probe.textContent = "W";
    document.body.append(probe);
    const width = Math.ceil(probe.getBoundingClientRect().width);
    probe.remove();
    return 5 * width + 8;
  });
  await expect.poll(async () => (await field.boundingBox())!.width).toBe(expected);
  await expect(field).toHaveAttribute("maxlength", "5");
  await field.fill("12345");
  await field.press("End");
  await field.press("6");
  await expect(field).toHaveValue("12345");
  await dialog.getByTestId("BTN_1").click();
  await expect(page.getByTestId("skin-message-result")).toHaveText(JSON.stringify({ result: 1, input: "12345" }));
  await page.getByTestId("skin-resource-wide").click();
  await expect.poll(async () => (await dialog.boundingBox())!.width).toBeGreaterThan(550);
  await expect.poll(async () => field.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1);
  const box = (await field.boundingBox())!, frame = (await dialog.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(frame.x + frame.width);
  await expect(field).toHaveValue("W".repeat(55) + "\nFim");
  await dialog.getByTestId("BTN_1").click();
  const result = JSON.parse((await page.getByTestId("skin-message-result").textContent())!) as { input: string };
  expect(result.input).toBe("W".repeat(55) + "\r\nFim");
});

test("resource mnemonic uses its real button result and input without triggering a background frame", async ({ page }) => {
  await page.goto("/?skin=controls");
  const a = page.getByTestId("skin-fixture-A");
  await a.getByTestId("skin-mnemonics").check();
  await page.getByTestId("skin-resource-mnemonic").click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX");
  await expect(dialog.getByTestId("BTN_1")).toHaveText("Validar");
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press(i < 6 ? "Tab" : "Shift+Tab");
    expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await dialog.getByTestId("SAI_1").fill("  Açores  ");
  await page.keyboard.press("Alt+v");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("skin-message-result")).toHaveText(JSON.stringify({ result: 11, input: "  Açores  " }));
  await expect(a.getByTestId("skin-clicks")).toHaveText("0");
  await page.getByTestId("skin-resource-mnemonic").click();
  await page.keyboard.press("Alt+c");
  await expect(page.getByTestId("skin-message-result")).toHaveText(JSON.stringify({ result: 27, input: "original" }));
});
