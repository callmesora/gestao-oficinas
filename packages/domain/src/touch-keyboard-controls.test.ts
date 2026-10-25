import { expect, it } from "vitest";
import { alphaKeyboardButtonForCode, alphaKeyboardButtonForKey, alphaKeyboardButtons, numericKeyboardButtonForCode, numericKeyboardButtonForKey, numericKeyboardButtons } from "./touch-keyboard-controls";
import { systemTimeDisplay, systemTimeEntry } from "./system-entry";

it("source manual codes route the actual distinct controls, including comma, accents and clear variants", () => {
  for (let code = 65; code <= 90; code++) expect(alphaKeyboardButtonForCode(code)).toBe(`BTN_${String.fromCharCode(code).toLowerCase()}`);
  for (let code = 97; code <= 122; code++) expect(alphaKeyboardButtonForCode(code)).toBe(`BTN_${String.fromCharCode(code)}`);
  for (let code = 48; code <= 57; code++) expect(alphaKeyboardButtonForCode(code)).toBe(`BTN_${String.fromCharCode(code)}`);
  for (const [code, button] of [[171, "BTN_acento_agudo"], [219, "BTN_euro"], [187, "BTN_a_cima"], [188, "BTN_o_cima"], [130, "BTN_c_cedilha"], [141, "BTN_c_cedilha"], [44, "BTN_ponto_virgula"], [8, "BTN_apagar_ultimo"], [13, "BTN_confirmar"], [27, "BTN_cancelar"]] as const) expect(alphaKeyboardButtonForCode(code)).toBe(button);
  expect(alphaKeyboardButtonForKey("´")).toBe("BTN_acento_agudo"); expect(alphaKeyboardButtonForKey("€")).toBe("BTN_euro");
  expect(alphaKeyboardButtonForKey("ArrowDown")).toBeNull(); expect(alphaKeyboardButtonForCode(0)).toBeNull();
  for (const key of ["C", "c", "Backspace"]) expect(numericKeyboardButtonForKey(key)).toBe("BTN_limpar");
  expect(numericKeyboardButtonForCode(13)).toBe("BTN_confirmar"); expect(numericKeyboardButtonForCode(27)).toBe("BTN_cancelar");
  expect(numericKeyboardButtonForKey(",")).toBeNull(); expect(numericKeyboardButtonForKey("Delete")).toBeNull();
});
it("each title write-seven omits SetFocus while every ordinary write carries the source continuation", () => {
  for (const buttons of [alphaKeyboardButtons, numericKeyboardButtons]) {
    expect(buttons.BTN_Caption).toEqual({ kind: "write", value: "7", returnFocus: false });
    for (const [name, action] of Object.entries(buttons)) if (name !== "BTN_Caption" && action.kind === "write") expect(action.returnFocus).toBe(true);
  }
  expect(alphaKeyboardButtons.BTN_virgula).toEqual({ kind: "write", value: ",", returnFocus: true });
});
it("system time entry accepts only complete supported forms while untouched display retains anomalous originals", () => {
  for (const text of ["000000", "235959", "00:00:00", "23:59:59", ""]) expect(systemTimeEntry(text)).toEqual({ kind: "valid", value: text.replaceAll(":", "") });
  for (const text of ["03:0000", "0300:00", "24:00:00", "03:60:00", "03:00:60", " 030000", "03:00", "3:00:00"]) expect(systemTimeEntry(text)).toEqual({ kind: "invalid" });
  expect(systemTimeDisplay("030000")).toBe("03:00:00"); expect(systemTimeDisplay(null)).toBe(""); expect(systemTimeDisplay("raw")).toBe("raw");
});
