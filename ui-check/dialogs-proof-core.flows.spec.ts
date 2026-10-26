import { expect, test, type Locator, type Page } from "@playwright/test";
import type { MessageRequest } from "../src/ui/legacy/message-state";
import type { ResourceInput, ResourceRequest } from "../src/ui/legacy/resource-state";
type ProofDialogRequest = { kind: "message"; request: MessageRequest } | { kind: "resource"; request: ResourceRequest };

async function caller(page: Page, requests: ProofDialogRequest[]) {
  await page.goto("/?skin=controls");
  await page.evaluate(async payload => {
    const path = "/ui-check/support/proof-core-dialog-host.fixture.tsx";
    const host = await import(path); host.mount(payload);
  }, requests);
  await page.getByTestId("proof-core-open").click();
}
const result = (page: Page) => page.getByTestId("proof-core-results");
const resource = (input?: ResourceInput, overrides: Partial<ResourceRequest> = {}): ResourceRequest => ({
  title: "  Recurso d'Água & Açores  ", text: "  Corpo\nsegunda linha  ",
  buttons: [{ label: "&Aceitar", value: 41 }, { label: "&Não alterar", value: -7 }, { label: "&Voltar", value: 903 }],
  defaultIndex: 1, cancelIndex: 3, ...(input ? { input } : {}), ...overrides,
});

async function centered(dialog: Locator, selector: string, gap: number) {
  const client = (await dialog.locator(".wd-client").boundingBox())!;
  const boxes = await dialog.locator(selector).evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect(); return { x: box.x, y: box.y, width: box.width, height: box.height };
  }));
  expect(boxes.length).toBeGreaterThan(0);
  expect(boxes.every(box => box.y === boxes[0].y)).toBe(true);
  for (let index = 1; index < boxes.length; index++) expect(boxes[index].x - boxes[index - 1].x - boxes[index - 1].width).toBeCloseTo(gap, 1);
  expect(boxes[0].x - client.x).toBeCloseTo(client.x + client.width - boxes.at(-1)!.x - boxes.at(-1)!.width, 1);
  expect(boxes.at(-1)!.y + boxes.at(-1)!.height).toBeLessThanOrEqual(client.y + client.height);
}

const messageCases = [
  { type: 0, names: ["BTN_OK"], captions: ["OK"], values: [1], icon: "ICON_INFORMATION", close: 1 },
  { type: 1, names: ["BTN_OK"], captions: ["OK"], values: [1], icon: "ICON_ERREUR", close: 1 },
  { type: 2, names: ["BTN_OUI", "BTN_NON"], captions: ["Sim", "Não"], values: [6, 7], icon: "ICON_QUESTION", close: 7 },
  { type: 3, names: ["BTN_OUI", "BTN_NON", "BTN_ANNULER"], captions: ["Sim", "Não", "Cancelar"], values: [6, 7, 2], icon: "ICON_QUESTION", close: 2 },
  { type: 4, names: ["BTN_OK"], captions: ["OK"], values: [1], icon: "ICON_INFORMATION", close: 1 },
  { type: 5, names: ["BTN_OUI", "BTN_NON"], captions: ["OK", "Cancelar"], values: [1, 7], icon: "ICON_QUESTION", close: 7 },
] as const;
for (const source of messageCases) {
  test(`WINDEVMESSAGEBOX type${source.type} initializes every source icon button default and exact result through the mounted queue`, async ({ page }) => {
    const title = "  Título d'Água  ", text = "  Açores\nsegunda linha  ";
    for (let selected = 0; selected < source.names.length; selected++) {
      await caller(page, [{ kind: "message", request: { type: source.type, title, text, defaultButton: selected + 1 } }]);
      const dialog = page.getByTestId("WINDEVMESSAGEBOX");
      await expect(dialog).toHaveAttribute("aria-label", title);
      expect(await dialog.getByTestId("RADTitle").textContent()).toBe(title);
      expect(await dialog.getByTestId("LIB_INFO").textContent()).toBe(text);
      await expect(dialog.getByTestId(source.icon)).toBeVisible();
      expect(await dialog.locator(".wd-message-actions button").allTextContents()).toEqual([...source.captions]);
      await expect(dialog.getByTestId(source.names[selected])).toBeFocused();
      await expect(page.getByTestId("proof-core-settled")).toHaveText("0");
      await centered(dialog, ".wd-message-actions button", 6);
      const body = (await dialog.getByTestId("LIB_INFO").boundingBox())!, icon = (await dialog.getByTestId(source.icon).boundingBox())!;
      expect(icon.y + icon.height / 2).toBeCloseTo(body.y + body.height / 2, 1);
      await dialog.getByTestId(source.names[selected]).press("Enter");
      await expect(result(page)).toHaveText(JSON.stringify([source.values[selected]]));
      await expect(page.getByTestId("proof-core-settled")).toHaveText("1");
      await expect(page.getByTestId("proof-core-open")).toBeFocused();
    }
    for (const dismissal of ["escape", "chrome"] as const) {
      await caller(page, [{ kind: "message", request: { type: source.type, title, text, defaultButton: 3 } }]);
      if (dismissal === "escape") await page.keyboard.press("Escape");
      else await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_SYST_FERMER").click();
      await expect(result(page)).toHaveText(JSON.stringify([source.close]));
      await expect(page.getByTestId("proof-core-settled")).toHaveText("1");
    }
  });
}

test("WINDEVMESSAGEBOX fitted long text preserves multi-button bottom margin centering copy and its pending queue through chrome", async ({ page }) => {
  const text = "  Açores — texto que obriga a medir e quebrar a linha. ".repeat(65), title = "  Corpo medido  ";
  await caller(page, [{ kind: "message", request: { type: 3, title, text, defaultButton: 3 } }, { kind: "message", request: { type: 0, title: "seguinte", text: "seguinte" } }]);
  const dialog = page.getByTestId("WINDEVMESSAGEBOX"), frame = dialog.getByTestId("message-box-frame"), body = dialog.getByTestId("LIB_INFO");
  await expect.poll(async () => (await body.boundingBox())!.height).toBeGreaterThan(48);
  expect((await body.boundingBox())!.width).toBe(600);
  expect(await body.evaluate(node => node.scrollHeight - node.clientHeight)).toBeLessThanOrEqual(1);
  await centered(dialog, ".wd-message-actions button", 6);
  const initial = (await frame.boundingBox())!, bottom = (await dialog.getByTestId("BTN_ANNULER").boundingBox())!;
  // Literal source designer button y179/h24 against frame h217:14px below the button.
  expect(initial.y + initial.height - bottom.y - bottom.height).toBe(14);
  const copied = await dialog.evaluate(node => {
    const data = new DataTransfer(); node.dispatchEvent(new ClipboardEvent("copy", { clipboardData: data, bubbles: true, cancelable: true })); return data.getData("text/plain");
  });
  expect(copied).toBe(`---------------------------\r\n${title}\r\n---------------------------\r\n${text}`);
  const hidden = dialog.getByTestId("BTN_Copier_caché"); await expect(hidden).toHaveAttribute("tabindex", "-1");
  await expect(hidden).toHaveAttribute("aria-hidden", "true");
  const hiddenBox = (await hidden.boundingBox())!, clientBox = (await frame.locator(".wd-client").boundingBox())!;
  expect(hiddenBox.y + hiddenBox.height).toBeLessThan(clientBox.y);
  await expect(frame).toHaveCSS("overflow", "hidden");
  await expect(dialog.getByTestId("BTN_UMC")).toBeHidden();
  await dialog.getByTestId("BTN_Syst_Maximize").click(); await centered(dialog, ".wd-message-actions button", 6);
  expect((await frame.boundingBox())!.width).toBeGreaterThan(initial.width);
  await dialog.getByTestId("BTN_Syst_Maximize").click();
  expect((await frame.boundingBox())!.width).toBe(initial.width);
  await dialog.getByTestId("BTN_ANNULER").focus(); await dialog.getByTestId("BTN_SYST_MINIMIZE").click();
  await expect(frame).toBeHidden(); await expect(page.getByTestId("proof-core-settled")).toHaveText("0");
  await page.getByTestId("message-box-restore").click(); await expect(dialog.getByTestId("BTN_ANNULER")).toBeFocused();
  await dialog.getByTestId("BTN_NON").click(); await expect(dialog).toHaveAttribute("aria-label", "seguinte");
  await expect(page.getByTestId("proof-core-settled")).toHaveText("1"); await dialog.getByTestId("BTN_OK").click();
  await expect(result(page)).toHaveText("[7,1]");
});

test("WINDEVDIALOGBOX desktop button family preserves literal minimum gaps centering explicit Note values default focus and each dismissal", async ({ page }) => {
  for (const viewport of [{ width: 1024, height: 768 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    for (const action of ["BTN_1", "BTN_2", "BTN_3", "escape", "chrome"] as const) {
      const request = resource(undefined, { defaultIndex: 2 });
      await caller(page, [{ kind: "resource", request }]); const dialog = page.getByTestId("WINDEVDIALOGBOX");
      await expect(dialog.getByTestId("BTN_2")).toBeFocused();
      await expect(dialog).toHaveAttribute("aria-label", request.title); expect(await dialog.getByTestId("RADTitle").textContent()).toBe(request.title);
      expect(await dialog.getByTestId("LIB_INFO").textContent()).toBe(request.text);
      expect(await dialog.locator(".wd-resource-actions button").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-testid")))).toEqual(["BTN_1", "BTN_2", "BTN_3"]);
      expect(await dialog.locator(".wd-resource-actions button").allTextContents()).toEqual(["Aceitar", "Não alterar", "Voltar"]);
      await centered(dialog, ".wd-resource-actions button", 12);
      const widths = await dialog.locator(".wd-resource-actions button").evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().width));
      expect(widths.every(width => width >= 80)).toBe(true);
      expect(await dialog.locator('[data-testid^="BTN_MOBILE_"]').count()).toBe(0);
      if (action === "escape") await page.keyboard.press("Escape"); else if (action === "chrome") await dialog.getByTestId("BTN_SYST_FERMER").click(); else await dialog.getByTestId(action).click();
      const expected = action === "BTN_1" ? 41 : action === "BTN_2" ? -7 : action === "chrome" ? 3 : 903;
      await expect(result(page)).toHaveText(JSON.stringify([{ result: expected }]));
      await expect(page.getByTestId("proof-core-settled")).toHaveText("1");
    }
  }
});

test("WINDEVDIALOGBOX all32-bit icon branches use source precedence checked project images and explicit unsupported fallback", async ({ page }) => {
  for (const [flags, expected] of [[0x20, "ICON_Question"], [0x30, "ICON_ERREUR"], [0x40, "ICON_INFORMATION"], [0x60, "ICON_Question"], [0x70, "ICON_ERREUR"], [-1, "ICON_ERREUR"], [0x80000040, "ICON_INFORMATION"], [0x10, ""], [0x80000000, ""]] as const) {
    await caller(page, [{ kind: "resource", request: resource(undefined, { icon: { flags } }) }]);
    const dialog = page.getByTestId("WINDEVDIALOGBOX"), icon = dialog.getByTestId("ICONE");
    await expect(icon).toHaveAttribute("data-icon", expected);
    if (expected) { await expect(icon.locator(".wd-message-icon")).toBeVisible(); await expect(icon.locator(".wd-message-icon")).toHaveText(expected === "ICON_ERREUR" ? "×" : expected === "ICON_Question" ? "?" : "i"); }
    else await expect(icon).toBeEmpty();
    await dialog.getByTestId("BTN_1").click(); await expect(result(page)).toHaveText('[{"result":41}]');
  }
  await caller(page, [{ kind: "resource", request: resource(undefined, { icon: { flags: 0, image: "note.png" } }) }]);
  const icon = page.getByTestId("WINDEVDIALOGBOX").getByTestId("ICONE");
  await expect(icon).toHaveAttribute("data-icon", "custom");
  await expect(icon.locator("img")).toHaveAttribute("src", "/skin/note.png");
  await expect.poll(() => icon.locator("img").evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test("WINDEVDIALOGBOX real text password checkbox and four typed families initialize classify align adapt and return exact values", async ({ page }) => {
  const cases: { input: ResourceInput; display?: string; align?: string; edit?: string; expected: string | boolean | null }[] = [
    { input: { kind: "text", value: "  Açores  ", maxLength: 12, automaticErase: true, adaptWidth: true }, display: "  Açores  ", align: "start", edit: "d'Água", expected: "d'Água" },
    { input: { kind: "text", value: " segredo ", password: true, maxLength: 15 }, display: " segredo ", align: "start", expected: " segredo " },
    { input: { kind: "text", value: "9007199254740993.125", inputType: "numeric", inputMask: "+99999999999999999999,999", adaptWidth: true }, display: "9007199254740993,125", align: "right", expected: "9007199254740993.125" },
    { input: { kind: "text", value: "12.50", inputType: "currency", inputMask: "+999 999 999,99", adaptWidth: true }, display: "12,50", align: "right", edit: "999 999 999,99", expected: "999999999.99" },
    { input: { kind: "text", value: "20240229", inputType: "date", inputMask: "DD/MM/YYYY", returnFormat: "AAAAMMJJ", adaptWidth: true }, display: "29/02/2024", align: "right", edit: "01/03/2024", expected: "20240301" },
    { input: { kind: "text", value: "23595812", inputType: "time", inputMask: "HH:mm:SS,CC", returnFormat: "HHmmSSCC", adaptWidth: true }, display: "23:59:58,12", align: "right", edit: "00:00:00,01", expected: "00000001" },
    { input: { kind: "checkbox", value: null, label: "  Opção d'Água  " }, expected: null },
    { input: { kind: "checkbox", value: false, label: "  Opção d'Água  " }, expected: true },
  ];
  for (const source of cases) {
    const request = resource(source.input); await caller(page, [{ kind: "resource", request }]); const dialog = page.getByTestId("WINDEVDIALOGBOX");
    const field = dialog.getByTestId(source.input.kind === "text" ? "SAI_1" : "INT_1"); await expect(field).toBeFocused();
    if (source.input.kind === "text") {
      await expect(field).toHaveValue(source.display!); await expect(field).toHaveAttribute("type", source.input.password ? "password" : "text");
      expect(await field.evaluate(node => getComputedStyle(node).textAlign)).toBe(source.align);
      if (source.input.maxLength) await expect(field).toHaveAttribute("maxlength", String(source.input.maxLength));
      if (source.input.automaticErase) expect(await field.evaluate(node => [(node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd])).toEqual([0, source.display!.length]);
      if (source.input.adaptWidth) {
        const count = source.input.inputType && source.input.inputType !== "text" ? source.input.inputMask!.length : source.input.maxLength!;
        const measured = await field.evaluate((node, char) => {
          const span = document.createElement("span"); span.textContent = char; Object.assign(span.style, { position: "fixed", font: getComputedStyle(node.closest(".wd-frame")!).font, whiteSpace: "pre" }); document.body.append(span);
          const width = Math.ceil(span.getBoundingClientRect().width); span.remove(); return width;
        }, source.align === "right" ? "0" : "W");
        expect((await field.boundingBox())!.width).toBe(count * measured + 8);
      }
      if (source.edit !== undefined) await field.fill(source.edit);
    } else {
      expect(await field.locator("..").textContent()).toBe(source.input.label);
      await expect(field).not.toBeChecked(); if (source.expected === true) await field.press("Space");
    }
    await dialog.getByTestId("BTN_1").click(); await expect(result(page)).toHaveText(JSON.stringify([{ result: 41, input: source.expected }]));
  }
});

test("WINDEVDIALOGBOX invalid accepted dates and times retain focus while cancellation copies live partial input and chrome keeps original", async ({ page }) => {
  for (const [input, partial] of [
    [{ kind: "text", inputType: "date", value: "20240229", returnFormat: "YYYYMMDD" }, "31/02/2024"],
    [{ kind: "text", inputType: "time", value: "235959", returnFormat: "HHmmSS" }, "24:00:00"],
  ] as const) {
    for (const cancellation of ["button", "escape", "chrome"] as const) {
      await caller(page, [{ kind: "resource", request: resource(input) }]); const dialog = page.getByTestId("WINDEVDIALOGBOX"), field = dialog.getByTestId("SAI_1");
      await field.fill(partial); await dialog.getByTestId("BTN_1").click(); await expect(field).toHaveAttribute("aria-invalid", "true"); await expect(field).toBeFocused(); await expect(page.getByTestId("proof-core-settled")).toHaveText("0");
      if (cancellation === "button") await dialog.getByTestId("BTN_3").click(); else if (cancellation === "escape") await field.press("Escape"); else await dialog.getByTestId("BTN_SYST_FERMER").click();
      await expect(result(page)).toHaveText(JSON.stringify([{ result: cancellation === "chrome" ? 3 : 903, input: cancellation === "chrome" ? input.value : partial }]));
    }
  }
});

test("WINDEVDIALOGBOX typed untouched NULL opaque original deliberate blank CRLF and queued ownership survive mounted chrome", async ({ page }) => {
  for (const input of [
    { kind: "text", value: null, inputType: "numeric", inputMask: "+999,99" },
    { kind: "text", value: "opaque raw", inputType: "date", returnFormat: "unknown" },
  ] as const) {
    await caller(page, [{ kind: "resource", request: resource(input) }]); await page.getByTestId("WINDEVDIALOGBOX").getByTestId("BTN_1").click();
    await expect(result(page)).toHaveText(JSON.stringify([{ result: 41, input: input.value }]));
  }
  const original = "Um\r\nDois\r\nTrês";
  await caller(page, [{ kind: "resource", request: resource({ kind: "text", value: original }) }, { kind: "resource", request: resource({ kind: "text", value: "second original" }, { title: "segundo" }) }]);
  const dialog = page.getByTestId("WINDEVDIALOGBOX"), field = dialog.getByTestId("SAI_1"), frame = dialog.getByTestId("resource-box-frame");
  expect(await field.evaluate(node => node.tagName)).toBe("TEXTAREA"); await field.fill("Editado\ncom acentos Ç"); await field.press("Enter"); await expect(dialog).toBeVisible();
  await field.fill("Editado\ncom acentos Ç"); await field.focus();
  const before = (await frame.boundingBox())!; await dialog.getByTestId("BTN_Syst_Maximize").click(); await centered(dialog, ".wd-resource-actions button", 12);
  await expect(field).toHaveValue("Editado\ncom acentos Ç"); await dialog.getByTestId("BTN_Syst_Maximize").click(); expect((await frame.boundingBox())!.width).toBe(before.width);
  await dialog.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(frame).toBeHidden(); await expect(page.getByTestId("proof-core-settled")).toHaveText("0");
  await page.getByTestId("resource-box-restore").click(); await expect(field).toBeFocused();
  await dialog.getByTestId("BTN_1").click(); await expect(dialog).toHaveAttribute("aria-label", "segundo"); await expect(field).toHaveValue("second original");
  await field.fill(""); await dialog.getByTestId("BTN_1").click();
  await expect(result(page)).toHaveText(JSON.stringify([{ result: 41, input: "Editado\r\ncom acentos Ç" }, { result: 41, input: "" }]));
  await expect(page.getByTestId("proof-core-settled")).toHaveText("2"); await expect(page.getByTestId("proof-core-open")).toBeFocused();
});

test("WINDEVDIALOGBOX long title reaches viewport and4000desktop caps without changing request result", async ({ page }) => {
  for (const width of [700, 1300, 5000]) {
    await page.setViewportSize({ width, height: 1200 });
    await caller(page, [{ kind: "resource", request: resource(undefined, { title: "Título".repeat(400) }) }]);
    const dialog = page.getByTestId("WINDEVDIALOGBOX"), frame = dialog.getByTestId("resource-box-frame");
    await expect.poll(async () => (await frame.boundingBox())!.width).toBe(Math.min(width - 16, 4000));
    await centered(dialog, ".wd-resource-actions button", 12);
    await dialog.getByTestId("BTN_2").click(); await expect(result(page)).toHaveText('[{"result":-7}]');
  }
});

test("WINDEVDIALOGBOX nested calculator owns Tab and dismissal and changes its exact decimal parent only through Apply", async ({ page }) => {
  await caller(page, [{ kind: "resource", request: resource({ kind: "text", inputType: "numeric", inputMask: "+99999999999999999999,999", value: "9007199254740993.125", calculator: true }) }]);
  const dialog = page.getByTestId("WINDEVDIALOGBOX"), parent = dialog.getByTestId("SAI_1"), opener = dialog.getByTestId("SAI_1__calculator");
  await opener.click(); const calculator = page.getByTestId("target-calculator");
  await expect(calculator.getByTestId("calculator-value")).toHaveValue("9007199254740993.125");
  await calculator.getByTestId("calculator-key-+").click(); await calculator.getByTestId("calculator-key-1").click(); await calculator.getByTestId("calculator-key-=").click();
  await expect(calculator.getByTestId("calculator-value")).toHaveValue("9007199254740994.125"); await expect(parent).toHaveValue("9007199254740993,125");
  await calculator.getByTestId("calculator-cancel").focus(); await page.keyboard.press("Tab");
  const focusedOwner = await page.evaluate(() => document.activeElement?.closest("dialog")?.getAttribute("data-testid")); expect(focusedOwner).toBe("target-calculator");
  await page.getByTestId("proof-core-background").evaluate(node => (node as HTMLInputElement).focus()); expect(await page.evaluate(() => document.activeElement?.closest("dialog")?.getAttribute("data-testid"))).toBe("target-calculator");
  await page.keyboard.press("Escape"); await expect(calculator).toHaveCount(0); await expect(opener).toBeFocused(); await expect(parent).toHaveValue("9007199254740993,125");
  await expect(page.getByTestId("proof-core-settled")).toHaveText("0");
  await opener.click(); await calculator.getByTestId("calculator-key-+").click(); await calculator.getByTestId("calculator-key-1").click(); await calculator.getByTestId("calculator-apply").click();
  await expect(calculator).toHaveCount(0); await expect(opener).toBeFocused(); await expect(parent).toHaveValue("9007199254740994,125");
  await dialog.getByTestId("BTN_1").click(); await expect(result(page)).toHaveText('[{"result":41,"input":"9007199254740994.125"}]');
});
