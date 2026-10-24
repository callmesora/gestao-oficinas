import { expect, test } from "@playwright/test";

test("message copy event uses the exact source envelope and leaves the dialog/result pending", async ({ page }) => {
  await page.goto("/?skin=controls");
  await page.getByTestId("skin-message-open").click();
  const dialog = page.getByTestId("WINDEVMESSAGEBOX");
  const copy = await dialog.evaluate(element => {
    const data = new DataTransfer();
    const event = new ClipboardEvent("copy", { clipboardData: data, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return { prevented: event.defaultPrevented, text: data.getData("text/plain") };
  });
  expect(copy).toEqual({ prevented: true, text: "---------------------------\r\nTeste\r\n---------------------------\r\n  Açores\nSegunda linha  " });
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId("skin-message-result")).toHaveText("a aguardar");
  await expect(dialog.getByTestId("BTN_Copier_caché")).toHaveCount(1);
});

test("long message expands from source geometry, wraps at the source cap and keeps its button inside", async ({ page }) => {
  await page.goto("/?skin=controls");
  await page.getByTestId("skin-message-long").click();
  const dialog = page.getByTestId("WINDEVMESSAGEBOX"), body = dialog.getByTestId("LIB_INFO");
  await expect.poll(async () => (await body.boundingBox())!.height).toBeGreaterThan(48);
  expect((await body.boundingBox())!.width).toBeLessThanOrEqual(600);
  const overflow = await body.evaluate(element => element.scrollHeight - element.clientHeight);
  expect(overflow).toBeLessThanOrEqual(1);
  const frame = (await dialog.boundingBox())!, button = (await dialog.getByTestId("BTN_OK").boundingBox())!;
  expect(button.y + button.height).toBeLessThanOrEqual(frame.y + frame.height);
  await dialog.getByTestId("BTN_OK").click();
  await expect(page.getByTestId("skin-message-result")).toHaveText("1");
});

test("awaited OKCancel retains source result 7, blocks background focus and restores its trigger", async ({ page }) => {
  await page.goto("/?skin=controls");
  const trigger = page.getByTestId("skin-message-open");
  await trigger.click();
  const dialog = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId("BTN_OUI")).toHaveText("OK");
  await expect(dialog.getByTestId("BTN_NON")).toHaveText("Cancelar");
  await expect(dialog.getByTestId("BTN_NON")).toBeFocused();
  await expect(dialog.getByTestId("LIB_INFO")).toHaveText("  Açores\nSegunda linha  ");
  await page.getByTestId("skin-fixture-A").getByTestId("EDT_Descricao").evaluate(element => (element as HTMLInputElement).focus());
  await expect(dialog.getByTestId("BTN_NON")).toBeFocused();
  await dialog.getByTestId("BTN_NON").press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId("skin-message-result")).toHaveText("7");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OUI").click();
  await expect(page.getByTestId("skin-message-result")).toHaveText("1");
  await trigger.click();
  // Q-12 default dismissal; native routing remains U-W36869F-02, not verified parity.
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("WINDEVMESSAGEBOX")).toHaveCount(0);
  await expect(page.getByTestId("skin-message-result")).toHaveText("7");
  await expect(trigger).toBeFocused();
});

test("queued messages await their own result and safe close resumes the second caller", async ({ page }) => {
  await page.goto("/?skin=controls");
  await page.getByTestId("skin-message-queue").click();
  await expect(page.getByTestId("WINDEVMESSAGEBOX")).toHaveAttribute("aria-label", "Primeiro");
  await page.getByTestId("BTN_OK").click();
  const next = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(next).toHaveAttribute("aria-label", "Segundo");
  await expect(next.getByTestId("BTN_ANNULER")).toBeFocused();
  await next.getByTestId("BTN_SYST_FERMER").click();
  await expect(page.getByTestId("skin-message-result")).toHaveText("1,2");
});
