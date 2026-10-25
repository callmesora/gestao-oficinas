import { expect, it } from "vitest";
import layout from "./WINDEVMESSAGEBOX.layout.json";
import resource from "./WINDEVDIALOGBOX.layout.json";
import { messageGeometry, resourceButtonGeometry, resourceGeometry, resourceTextInputGeometry, type TextMeasure } from "./dialog-metrics";

const measure: TextMeasure = (text, width) => ({ width: Math.min(text.length * 10, width ?? Infinity), height: Math.max(1, Math.ceil(text.length * 10 / (width ?? Infinity))) * 14 });

it("ports message width cap, icon minimum, button minimum and resized bottom anchoring", () => {
  expect(messageGeometry(layout, "", 1, measure)).toMatchObject({ width: 108, height: 123, textWidth: 10, textHeight: 48, buttonY: 85 });
  expect(messageGeometry(layout, "", 3, measure)).toMatchObject({ width: 272, total: 252 });
  expect(messageGeometry(layout, "X".repeat(200), 1, measure)).toMatchObject({ width: 698, textWidth: 600, textHeight: 56, height: 131 });
});

it("sizes each resource button from its caption, reserves gaps and caps the desktop frame", () => {
  const fit = resourceButtonGeometry(["A", "Longer caption"], "Teste", measure, 1024);
  expect(fit.widths).toEqual([80, 164]);
  expect(fit.total).toBe(256);
  expect(fit.width).toBe(400);
  expect(resourceButtonGeometry(["X".repeat(200)], "", measure, 1024).width).toBe(1008);
});

it("bounds source resource fitting to ten passes and reserves measured input height", () => {
  const long = resourceGeometry(resource, "X".repeat(200), "", ["A"], measure, 1024);
  expect(long.passes).toBe(10);
  expect(long.width).toBe(536);
  expect(long.textHeight).toBe(90);
  const short = resourceGeometry(resource, "Valor", "", ["A"], measure, 1024);
  const input = resourceGeometry(resource, "Valor", "", ["A"], measure, 1024, { width: 181, height: 60 });
  expect(input.height - short.height).toBe(66);
  expect(input.inputHeight).toBe(60);
  expect(input.inputY).toBe(31 + input.textHeight - 6);
  expect(input.inputWidth + input.bodyX + 16).toBe(input.width);
});

it("sizes multiline text before frame fitting and applies character-width adaptation afterwards", () => {
  const base = { width: 181, height: 22 };
  const measured: TextMeasure = (text, width) => {
    const lines = text.split("\r\n");
    return { width: Math.min(Math.max(...lines.map(line => line.length * 10)), width ?? Infinity), height: lines.length * 14 };
  };
  const wide = resourceTextInputGeometry({ value: "W".repeat(55) + "\r\nFim" }, base, measured, 6, true);
  expect(wide).toEqual({ width: 550, height: 34, adaptedWidth: undefined });
  const fit = resourceGeometry(resource, "Texto", "", ["A"], measured, 1024, wide);
  expect(fit.width).toBeGreaterThanOrEqual(550 + 10 + resource.window.size.width - resource.controls.find(control => control.name === "LIB_INFO")!.width!);
  const limited = resourceTextInputGeometry({ value: "ABC", maxLength: 5, adaptWidth: true }, base, measured, 6, false);
  expect(limited).toEqual({ width: 181, height: 22, adaptedWidth: 58 });
  expect(resourceGeometry(resource, "Texto", "", ["A"], measured, 1024, limited).inputWidth).toBe(58);
  for (const maxLength of [0, undefined]) {
    const unlimited = resourceTextInputGeometry({ value: "ABC", maxLength, adaptWidth: true }, base, measured, 6, false);
    const result = resourceGeometry(resource, "Texto", "", ["A"], measured, 1024, unlimited);
    expect(result.inputWidth + result.bodyX + 16).toBe(result.width);
  }
});


it("typed resource input reserves mask digits using zero width instead of the text maximum", () => {
  const measure = (text: string) => ({ width: text === "W" ? 11 : text === "0" ? 6 : text.length * 7, height: 14 });
  const geometry = resourceTextInputGeometry({ value: "1,25", inputType: "currency", inputMask: "999,99", maxLength: 1, adaptWidth: true }, { width: 181, height: 22 }, measure, 6, false);
  expect(geometry.adaptedWidth).toBe(44);
});
