import { expect, it } from "vitest";
import layout from "./WINDEVMESSAGEBOX.layout.json";
import resource from "./WINDEVDIALOGBOX.layout.json";
import { messageGeometry, resourceButtonGeometry, resourceGeometry, type TextMeasure } from "./dialog-metrics";

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
