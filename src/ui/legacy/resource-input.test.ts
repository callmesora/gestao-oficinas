import { expect, it } from "vitest";
import { resourceInputDisplay, resourceInputValue } from "./resource-input";
import { calculatorOperation } from "./calculator";

it("keeps untouched NULL and opaque originals separate from deliberate blank and exact decimal edits", () => {
  const numeric = { kind: "text" as const, inputType: "numeric" as const, value: null, inputMask: "+999,99" };
  expect(resourceInputValue(numeric, "", false)).toEqual({ kind: "valid", value: null });
  expect(resourceInputValue(numeric, "", true)).toEqual({ kind: "valid", value: "" });
  expect(resourceInputValue(numeric, "-", true)).toEqual({ kind: "invalid" });
  const big = { ...numeric, value: "9007199254740993.12500", inputMask: "+99999999999999999999,99999" };
  expect(resourceInputDisplay(big)).toBe("9007199254740993,12500");
  expect(resourceInputValue(big, "9007199254740994,12500", true)).toEqual({ kind: "valid", value: "9007199254740994.12500" });
  const raw = { ...numeric, inputType: "date" as const, value: "legacy opaque", returnFormat: "unknown" };
  expect(resourceInputDisplay(raw)).toBe("legacy opaque");
  expect(resourceInputValue(raw, "  Açores  ", true)).toEqual({ kind: "valid", value: "  Açores  " });
});

it("uses Gregorian compact date and explicit 24-hour formats without workstation timezone conversion", () => {
  const date = { kind: "text" as const, inputType: "date" as const, value: "00000000", returnFormat: "AAAAMMJJ" };
  expect(resourceInputDisplay(date)).toBe("00/00/0000");
  expect(resourceInputValue(date, "00/00/0000", true)).toEqual({ kind: "valid", value: "00000000" });
  expect(resourceInputValue(date, "29/02/2027", true)).toEqual({ kind: "invalid" });
  expect(resourceInputValue(date, "29/02/2028", true)).toEqual({ kind: "valid", value: "20280229" });
  const time = { ...date, inputType: "time" as const, value: "23595999", returnFormat: "HHmmSSCC" };
  expect(resourceInputDisplay(time)).toBe("23:59:59,99");
  expect(resourceInputValue(time, "24:00:00,00", true)).toEqual({ kind: "invalid" });
  expect(resourceInputValue(time, "00:00:00,00", true)).toEqual({ kind: "valid", value: "00000000" });
  expect(resourceInputValue({ ...time, returnFormat: "HHmm" }, "10:30", true)).toEqual({ kind: "valid", value: "1030" });
});

it("performs elementary calculator operations without Number precision loss or non-finite results", () => {
  const wide = "9".repeat(96) + ".125";
  expect(calculatorOperation(wide, "+", "0")).toBe(wide);
  expect(calculatorOperation(wide, "+", "1")).toBe("1" + "0".repeat(96) + ".125");
  expect(calculatorOperation("9007199254740993.125", "+", "1")).toBe("9007199254740994.125");
  expect(calculatorOperation("0.1", "+", "0.2")).toBe("0.3");
  expect(calculatorOperation("1.25", "×", "2.4")).toBe("3");
  expect(calculatorOperation("2", "−", "3")).toBe("-1");
  expect(calculatorOperation("1", "÷", "0")).toBeNull();
  expect(calculatorOperation("1+2", "+", "3")).toBeNull();
  expect(calculatorOperation("1", "÷", "8")).toBe("0.125");
});
