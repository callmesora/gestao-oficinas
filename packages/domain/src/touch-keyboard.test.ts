import { expect, it } from "vitest";
import { alphaKeyboardInitial, alphaKeyboardKey, alphaKeyboardWrite, numericKeyboardInitial, numericKeyboardKey, numericKeyboardResult, numericKeyboardWrite, type NumericKeyboardOptions } from "./touch-keyboard";
import { startupLaunchMode } from "./startup";

it("SRC-ca4828ceb2 SRC-251b6fea58 preserves append, three caps states, one-shot shift and source accent omissions", () => {
  let state = alphaKeyboardInitial("  Original  ");
  state = alphaKeyboardWrite(state, "A"); expect(state.text).toBe("  Original  a");
  state = alphaKeyboardWrite(state, "CAPS"); state = alphaKeyboardWrite(state, "´");
  state = alphaKeyboardWrite(state, "E"); expect(state).toEqual({ text: "  Original  aÉ", caps: 1, accent: "" });
  state = alphaKeyboardWrite(alphaKeyboardWrite(state, "CAPS"), "CAPS");
  state = alphaKeyboardWrite(alphaKeyboardWrite(state, "~"), "O"); expect(state.text).toBe("  Original  aÉO"); expect(state.caps).toBe(3);
  state = alphaKeyboardWrite(alphaKeyboardWrite(state, "~"), "A"); expect(state.text).toBe("  Original  aÉOÃ");
  state = alphaKeyboardWrite(state, "APAGAR_ULTIMO"); expect(state.text).toBe("  Original  aÉO");
  expect(alphaKeyboardWrite(state, "APAGAR_TUDO").text).toBe("");
});
it("SRC-9efdb82f68 U05 retains oversized original, limits new typing, folder-disabled characters and physical source dispatch", () => {
  const state = alphaKeyboardInitial("oversized");
  expect(alphaKeyboardWrite(state, "A", { maxLength: 3 }).text).toBe("oversized");
  expect(alphaKeyboardWrite(state, "/", { password: "nomepasta" })).toEqual(state);
  expect(alphaKeyboardKey(",")).toBe(";"); expect(alphaKeyboardKey("Backspace")).toBe("APAGAR_ULTIMO");
  expect(alphaKeyboardKey("^")).toBe("/\\"); expect(alphaKeyboardKey("a")).toBe("A"); expect(alphaKeyboardKey("ArrowLeft")).toBeNull();
});
const options: NumericKeyboardOptions = { title: "Quantidade", value: "9007199254740993.125", decimals: 3, lower: "-99999999999999999", upper: "99999999999999999" };
it("SRC-cbb939b412 SRC-d4c076708a retains exact large decimals, first replacement, precision and clear-all Backspace", () => {
  let state = numericKeyboardInitial(options); expect(state.text.trim()).toBe(options.value);
  expect(numericKeyboardResult(state, options)).toEqual({ kind: "accepted", value: options.value });
  for (const key of ["2", ".", "1", "2", "3", "4"]) state = numericKeyboardWrite(state, key, options);
  expect(state.text).toBe("2.123");
  state = numericKeyboardWrite(state, "-", options); expect(state.text).toBe("-2.123");
  expect(numericKeyboardKey("Backspace")).toBe("C");
  state = numericKeyboardWrite(state, "C", options); expect(state).toEqual({ text: "0.", first: false, fractional: false });
});
it("SRC-d4c076708a SRC-0c715c00ca enforces inclusive per-key bounds and source first-clear behavior before refusal", () => {
  const bounded = { ...options, value: "8", decimals: 2, lower: "1", upper: "9" };
  let state = numericKeyboardInitial(bounded);
  state = numericKeyboardWrite(state, "0", bounded); expect(state.text).toBe("0.");
  expect(numericKeyboardResult(state, bounded)).toEqual({ kind: "outside", message: "Valor fora dos limites (1 - 9)" });
  state = numericKeyboardWrite(state, "9", bounded); expect(state.text).toBe("9.");
  expect(numericKeyboardWrite(state, "9", bounded).text).toBe("9.");
  expect(numericKeyboardResult(state, bounded)).toEqual({ kind: "accepted", value: "9" });
});
it("SRC-b6a81add98 preserves exact launch flags and modulo precedence", () => {
  expect(startupLaunchMode({ modulo: null, artigos: null })).toBe("menu");
  expect(startupLaunchMode({ modulo: "T", artigos: "01" })).toBe("menu");
  expect(startupLaunchMode({ modulo: "", artigos: "1" })).toBe("articles");
  expect(startupLaunchMode({ modulo: "t", artigos: "1" })).toBe("labor");
  expect(startupLaunchMode({ modulo: "m", artigos: null })).toBe("materials");
});
