import { expect, test } from "@playwright/test";

test("SRC-49ee2912c4 actual numeric physical dispatch uses every digit C c Backspace point minus Enter and Escape", async ({ page }) => {
  await page.goto("/?workflow=touch-keyboards&value=12.500"); await page.getByTestId("touch-keyboard-open").click();
  const keyboard = page.getByTestId("WIN_Teclado_numerico"), text = keyboard.getByTestId("EDT_Texto"), manual = keyboard.getByTestId("EDT_input_manual"); await expect(manual).toBeFocused();
  for (const digit of "0123456789") {
    await page.keyboard.type("C"); await expect(text).toHaveValue("0."); await page.keyboard.type(digit); await expect(text).toHaveValue(`${digit}.`); await expect(manual).toBeFocused();
    await page.keyboard.type("c"); await expect(text).toHaveValue("0.");
  }
  await page.keyboard.type("10"); await expect(text).toHaveValue("10."); await page.keyboard.type("C");
  await page.keyboard.type("2.1234"); await expect(text).toHaveValue("2.123");
  await page.keyboard.type("-"); await expect(text).toHaveValue("-2.123"); await page.keyboard.type("-"); await expect(text).toHaveValue("2.123");
  await page.keyboard.press("Backspace"); await expect(text).toHaveValue("0."); await page.keyboard.type("4.125"); await page.keyboard.press("Enter");
  await expect(keyboard).toHaveCount(0); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("4.125");
  await page.getByTestId("touch-keyboard-open").click(); await page.keyboard.type("9"); await page.keyboard.press("Escape"); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("12.500");
});

test("SRC-0c715c00ca source numeric bounds Info retains pending keyboard then accepts inclusive edge", async ({ page }) => {
  await page.goto("/?workflow=touch-keyboards&value=8&decimals=2&lower=1&upper=9"); await page.getByTestId("touch-keyboard-open").click();
  const keyboard = page.getByTestId("WIN_Teclado_numerico"); await expect(keyboard.getByTestId("BTN_menos")).toBeDisabled();
  await keyboard.getByTestId("BTN_zero").click(); await keyboard.getByTestId("BTN_confirmar").click();
  const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message.getByTestId("LIB_INFO")).toHaveText("Valor fora dos limites (1 - 9)"); await expect(page.getByTestId("touch-keyboard-returned")).toHaveCount(0);
  await message.getByTestId("BTN_OK").click(); await expect(keyboard.getByTestId("EDT_input_manual")).toBeFocused();
  await keyboard.getByTestId("BTN_nove").click(); await keyboard.getByTestId("BTN_nove").click(); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("9.");
  await keyboard.getByTestId("BTN_confirmar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText("9");
});

test("SRC-864e1ee8bf actual third message button returns source IDCANCEL and resumes queued caller", async ({ page }) => {
  await page.goto("/?skin=controls"); await page.getByTestId("skin-message-queue").click();
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); const message = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(message).toHaveAttribute("aria-label", "Segundo"); await message.getByTestId("BTN_ANNULER").click();
  await expect(message).toHaveCount(0); await expect(page.getByTestId("skin-message-result")).toHaveText("1,2");
});

test("WINDEVMESSAGEBOX actual button source IDs distinguish ordinary Yes6 No7 Cancel2 and OKCancel Yes1", async ({ page }) => {
  await page.goto("/?skin=controls");
  for (const [button, value] of [["BTN_OUI", 6], ["BTN_NON", 7], ["BTN_ANNULER", 2]] as const) {
    await page.getByTestId("skin-message-queue").click(); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
    const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message).toHaveAttribute("aria-label", "Segundo"); await message.getByTestId(button).click();
    await expect(message).toHaveCount(0); await expect(page.getByTestId("skin-message-result")).toHaveText(`1,${value}`);
  }
  await page.getByTestId("skin-message-open").click(); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OUI").click(); await expect(page.getByTestId("skin-message-result")).toHaveText("1");
  await page.getByTestId("skin-message-open").click(); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_NON").click(); await expect(page.getByTestId("skin-message-result")).toHaveText("7");
});
