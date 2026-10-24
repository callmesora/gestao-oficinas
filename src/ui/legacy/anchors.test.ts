import { expect, it } from "vitest";
import { anchoredControl } from "./anchors";
import { controlOf } from "./layout";
import form from "./WIN_Form_Clientes.layout.json";

it("applies generated right/width flags under the ADR-003 rate default without changing source geometry", () => {
  const button = controlOf(form, "BTN_Validar"), edit = controlOf(form, "EDT_Descricao");
  expect(anchoredControl(button, { width: 140, height: 45 })).toMatchObject({ x: 546, y: 31, width: 80, height: 24 });
  expect(anchoredControl(edit, { width: 140, height: 45 })).toMatchObject({ x: 14, y: 62, width: 520, height: 25 });
  expect(button.x).toBe(406);
  expect(edit.width).toBe(380);
});

it("uses explicit per-axis percentages for combined anchors and derives every resize from the source base", () => {
  const control = { ...controlOf(form, "EDT_Descricao"), anchoring: "Right and bottom, height and width",
    anchorRates: { right: 50, bottom: 25, width: 50, height: 75 } };
  expect(anchoredControl(control, { width: 200, height: 80 })).toMatchObject({ x: 114, y: 82, width: 480, height: 85 });
  expect(anchoredControl(control, { width: 0, height: 0 })).toEqual(control);
  expect(() => anchoredControl({ ...control, anchorRates: { width: NaN } }, { width: 1, height: 1 })).toThrow("Invalid anchor rate");
});

it("uses the documented stretch priority for encoded combined rates and preserves missing flags", () => {
  const control = { ...controlOf(form, "EDT_Descricao"), anchoring: "Right and bottom, height and width" };
  expect(anchoredControl(control, { width: 200, height: 80 })).toMatchObject({ x: 14, y: 62, width: 580, height: 105 });
  const fixed = { ...control, anchoring: undefined };
  expect(anchoredControl(fixed, { width: 200, height: 80 })).toEqual(fixed);
  const disabled = { ...fixed, anchoring: "<None>", anchorRates: { right: 50, bottom: 50, width: 50, height: 50 } };
  expect(anchoredControl(disabled, { width: 200, height: 80 })).toEqual(disabled);
});
