import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

test("skin frame delegates only to its own in-app instance and preserves minimized field state", async ({ page }) => {
  await page.goto("/?skin=controls");
  await page.evaluate(() => {
    const state = window as unknown as { __skinNativeCalls: string[]; __TAURI_INTERNALS__: { invoke: (command: string) => Promise<unknown> } };
    state.__skinNativeCalls = [];
    state.__TAURI_INTERNALS__.invoke = async command => { state.__skinNativeCalls.push(command); throw new Error("Skin frame must never invoke native window commands"); };
  });
  const a = page.getByTestId("skin-fixture-A"), b = page.getByTestId("skin-fixture-B");
  await a.getByTestId("EDT_Descricao").fill("  Açores  ");
  await expect(b.getByTestId("EDT_Descricao")).toHaveValue("");
  await expect(a.getByTestId("EDT_Codigo")).toHaveValue("18446744073709551615");
  await a.getByTestId("BTN_SYST_MINIMIZE").click();
  await expect(a.getByTestId("skin-frame-A")).toHaveCount(0);
  await expect(b.getByTestId("skin-frame-B")).toBeVisible();
  await a.getByTestId("skin-reopen").click();
  await expect(a.getByTestId("EDT_Descricao")).toHaveValue("  Açores  ");
  await a.getByTestId("BTN_Syst_Maximize").click();
  await expect(a.getByTestId("skin-frame-A")).toHaveCSS("width", "640px");
  await a.getByTestId("BTN_Syst_Maximize").click();
  await expect(a.getByTestId("skin-frame-A")).toHaveCSS("width", "500px");
  await a.getByTestId("BTN_SYST_FERMER").click();
  await expect(a.getByTestId("skin-frame-A")).toHaveCount(0);
  await expect(b.getByTestId("skin-frame-B")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __skinNativeCalls: string[] }).__skinNativeCalls)).toEqual([]);
});

test("skin button uses declared hover/pressed/focus/disabled images and real click handling", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-fixture-A"), button = fixture.getByTestId("BTN_Validar");
  await expect(button).toHaveText("Validar");
  await expect(fixture.getByTestId("BTN_Cancelar")).toHaveText("Cancelar");
  await button.hover();
  await expect(button).toHaveCSS("border-image-source", /MediaPlayer_Btn_anim\.1\.png/);
  await page.mouse.down();
  await expect(button).toHaveCSS("border-image-source", /MediaPlayer_Btn_anim\.2\.png/);
  await page.mouse.up();
  await expect(fixture.getByTestId("skin-clicks")).toHaveText("1");
  await page.mouse.move(0, 0);
  await button.focus(); await page.keyboard.press("Space");
  await expect(fixture.getByTestId("skin-clicks")).toHaveText("2");
  await expect(button).toHaveCSS("border-image-source", /MediaPlayer_Btn_anim\.3\.png/);
  await fixture.getByTestId("skin-disable").check();
  await expect(button).toBeDisabled();
  await expect(button).toHaveCSS("border-image-source", /MediaPlayer_Btn_anim\.4\.png/);
  await button.evaluate(element => (element as HTMLButtonElement).click());
  await expect(fixture.getByTestId("skin-clicks")).toHaveText("2");
});

test("skin geometry and label association follow the generated form inputs", async ({ page }) => {
  await page.goto("/?skin=controls");
  const frame = page.getByTestId("skin-frame-A");
  const bounds = await frame.boundingBox();
  if (!bounds) throw new Error("Frame missing");
  for (const [name, x, y, width, height] of [["BTN_Validar", 406, 31, 80, 24], ["BTN_SYST_FERMER", 450, 0, 44, 19]] as const) {
    const rect = await frame.getByTestId(name).boundingBox();
    expect(rect).toEqual({ x: bounds.x + x, y: bounds.y + y, width, height });
  }
  await frame.getByText("Descriçªo", { exact: true }).click();
  await expect(frame.getByTestId("EDT_Descricao")).toBeFocused();
  await frame.getByTestId("BTN_Validar").hover();
  await page.mouse.move(0, 0); await frame.getByTestId("EDT_Descricao").blur();
  const images = await frame.locator(".wd-button").evaluateAll(buttons => buttons.flatMap(button => {
    const style = getComputedStyle(button);
    return [0, 1, 2, 3, 4].flatMap(state => ["background", "icon"].map(kind => style.getPropertyValue(`--wd-${kind}-${state}`))).filter(Boolean);
  }));
  images.push(await frame.evaluate(element => getComputedStyle(element).getPropertyValue("--wd-frame")));
  const imageUrls: string[] = [];
  for (const css of new Set(images)) {
    const url = css.match(/url\("?([^")]+)"?\)/)?.[1];
    if (!url) throw new Error("Missing state image URL");
    imageUrls.push(url);
    const response = await page.request.get(url);
    expect(response.ok()).toBe(true); expect(response.headers()["content-type"]).toContain("image/png");
  }
  await page.evaluate(async urls => {
    await document.fonts.ready;
    await Promise.all(urls.map(async url => { const image = new Image(); image.src = url; await image.decode(); }));
  }, imageUrls);
  await frame.screenshot({ path: "ui-report/skin-frame.png" });
  const visual = await promisify(execFile)(process.execPath, ["scripts/py.mjs", "scripts/skin_visual_check.py", "ui-report/skin-frame.png"], { windowsHide: true });
  expect(JSON.parse(visual.stdout).passed).toBe(true);
});

test("caption mnemonics stay inside the focused frame and ignore hidden, disabled, AltGr and ambiguous targets", async ({ page }) => {
  await page.goto("/?skin=controls");
  const a = page.getByTestId("skin-fixture-A"), b = page.getByTestId("skin-fixture-B");
  await a.getByTestId("skin-mnemonics").check();
  await b.getByTestId("skin-mnemonics").check();
  await expect(a.getByTestId("BTN_Validar")).toHaveText("Validar & manter");
  await expect(a.getByTestId("BTN_Validar").locator("u")).toHaveText("V");
  await expect(a.getByTestId("skin-mnemonic-literal")).toHaveText("&Validar");
  await expect(a.getByTestId("skin-mnemonic-literal")).not.toHaveAttribute("data-wd-mnemonic");
  await a.getByTestId("EDT_Descricao").focus();
  await page.keyboard.press("Alt+v");
  await expect(a.getByTestId("skin-clicks")).toHaveText("1");
  await expect(b.getByTestId("skin-clicks")).toHaveText("0");
  await a.getByTestId("skin-disable").check();
  await a.getByTestId("EDT_Descricao").focus();
  await page.keyboard.press("Alt+v");
  await expect(a.getByTestId("skin-clicks")).toHaveText("1");
  await a.getByTestId("skin-disable").uncheck();
  await a.getByTestId("EDT_Descricao").focus();
  await page.keyboard.press("Control+Alt+v");
  await expect(a.getByTestId("skin-clicks")).toHaveText("1");
  await a.getByTestId("skin-mnemonic-duplicate").check();
  await a.getByTestId("EDT_Descricao").focus();
  await page.keyboard.press("Alt+v");
  await expect(a.getByTestId("skin-clicks")).toHaveText("1");
  await b.getByTestId("EDT_Descricao").focus();
  await page.keyboard.press("Alt+v");
  await expect(b.getByTestId("skin-clicks")).toHaveText("1");
});

test("source edit flags mask passwords, enforce entry length and exclude non-tab controls without truncating bound values", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-input-fixture"), input = fixture.getByTestId("EDT_Palavra_passe");
  await expect(input).toHaveAttribute("type", "password");
  await expect(input).toHaveAttribute("maxlength", "15");
  await fixture.getByTestId("skin-input-before").focus(); await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab"); await expect(fixture.getByTestId("skin-input-after")).toBeFocused();
  await expect(fixture.getByTestId("skin-input-no-tab")).toHaveAttribute("tabindex", "-1");
  await input.fill("A".repeat(15)); await input.press("End"); await input.press("B");
  await expect(input).toHaveValue("A".repeat(15));
  await fixture.getByTestId("skin-input-oversized").click();
  await expect(input).toHaveValue("X".repeat(20));
  await expect(page.getByTestId("skin-fixture-A").getByTestId("EDT_Codigo")).not.toHaveAttribute("maxlength");
});

test("automatic erase selects on entry without clearing value and caller focus selection remains authoritative", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-input-fixture"), input = fixture.getByTestId("EDT_Palavra_passe");
  await fixture.getByTestId("skin-input-before").focus();
  await input.click();
  expect(await input.evaluate(element => [(element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd])).toEqual([0, 5]);
  await expect(input).toHaveValue("teste");
  await input.press("Z"); await expect(input).toHaveValue("Z");
  await fixture.getByTestId("skin-input-oversized").click();
  await fixture.getByTestId("skin-input-selection-override").check();
  await input.click();
  expect(await input.evaluate(element => [(element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd])).toEqual([1, 3]);
  await expect(fixture.getByTestId("skin-input-focus-callback")).not.toHaveText("0");
  await fixture.getByTestId("skin-input-selection-override").uncheck();
  await fixture.getByTestId("skin-input-auto-erase").uncheck();
  await input.click();
  const range = await input.evaluate(element => [(element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd]);
  expect(range[0]).toBe(range[1]);
  await expect(input).toHaveValue("X".repeat(20));
});
