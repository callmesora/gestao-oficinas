import { describe, expect, it } from "vitest";
import { decimalMaskDisplay, decimalMaskEdit, decimalMaskOf, decimalMaskValue } from "./decimal-entry";
import { integerMaskDeletionRange } from "./numeric-entry";

const price = decimalMaskOf("+999 999 999,99")!;
const stock = decimalMaskOf("999 999 999,999")!;

describe("source decimal-mask strings", () => {
  it("opts into the actual signed price and readonly stock masks without guessing unsupported masks", () => {
    expect(price).toMatchObject({ integer: { capacity: 9 }, fractionCapacity: 2, signed: true, groupSize: 3 });
    expect(stock).toMatchObject({ integer: { capacity: 9 }, fractionCapacity: 3, signed: false });
    expect(decimalMaskOf("999,99")).toMatchObject({ groupSize: null, fractionCapacity: 2 });
    for (const source of [undefined, "", "0", "999", "999.99", "-999,99", " 999,99", "99 999,99", "+999,99\n"]) expect(decimalMaskOf(source), source).toBeNull();
  });

  it("displays exact canonical digits with minimum fractions, grouping and no forced plus", () => {
    expect(decimalMaskDisplay(price, "0")).toBe("0,00");
    expect(decimalMaskDisplay(stock, "0")).toBe("0,000");
    expect(decimalMaskDisplay(price, "123456789.2")).toBe("123 456 789,20");
    expect(decimalMaskDisplay(price, "+001234.2000")).toBe("+001 234,2000");
    expect(decimalMaskDisplay(price, "-0.0000012300")).toBe("-0,0000012300");
    expect(decimalMaskDisplay(stock, "-9007199254740993123.12345678901234567890")).toBe("-9 007 199 254 740 993 123,12345678901234567890");
    expect(decimalMaskDisplay(price, null)).toBe("");
    for (const value of ["", "NaN", "1e3", "opaque"]) expect(decimalMaskDisplay(price, value)).toBe(value);
  });

  it("preserves live sign/comma/blank drafts and maps selections without padding", () => {
    for (const value of ["", "+", "-", ",", "+,", "-,", "1,", ",5", "-,5", "001,20"]) {
      expect(decimalMaskEdit(price, "0,00", value)?.value, value).toBe(value);
    }
    expect(decimalMaskEdit(price, "", "1234,5", 2, 6)).toEqual({ value: "1 234,5", start: 3, end: 7 });
    expect(decimalMaskEdit(price, "", "-1234,50", 1, 4)).toEqual({ value: "-1 234,50", start: 1, end: 5 });
    expect(decimalMaskEdit(price, "0,00", "")).toEqual({ value: "", start: 0, end: 0 });
  });

  it("rejects each whole malformed edit/paste instead of stripping bad characters", () => {
    for (const value of ["12\n34", "1.2", "1,2,3", "1e3", "1x2", "NaN", "Infinity", "12-3", "１２", "١٢", "1\u00a0234", "1,2 3"]) {
      expect(decimalMaskEdit(price, "12,30", value), value).toBeNull();
      expect(decimalMaskValue(price, value), value).toBeUndefined();
    }
    expect(decimalMaskEdit(decimalMaskOf("999,99")!, "12", "1 2")).toBeNull();
  });

  it("rejects trailing newline/CRLF in raw numeric pastes and preserves malformed display values", () => {
    for (const ending of ["\n", "\r", "\r\n", "\u2028", "\u2029"]) {
      const draft = `1,20${ending}`, canonical = `1.20${ending}`;
      expect(decimalMaskEdit(price, "12,30", draft)).toBeNull();
      expect(decimalMaskValue(price, draft)).toBeUndefined();
      expect(decimalMaskDisplay(price, canonical)).toBe(canonical);
      expect(decimalMaskOf(`+999 999 999,99${ending}`)).toBeNull();
    }
  });

  it("limits new integer/fraction entry without narrowing imported precision or range", () => {
    expect(decimalMaskEdit(price, "", "999999999,99")?.value).toBe("999 999 999,99");
    expect(decimalMaskEdit(price, "12,30", "1000000000,00")).toBeNull();
    expect(decimalMaskEdit(price, "12,30", "12,345")).toBeNull();
    const original = "9 007 199 254 740 993,123456";
    expect(decimalMaskEdit(price, original, original)?.value).toBe(original);
    expect(decimalMaskEdit(price, original, "9 007 199 254 740 994,123456")).toBeNull();
    expect(decimalMaskEdit(price, original, "9 007 199 254 740 993,12345")?.value).toBe("9 007 199 254 740 993,12345");
    expect(decimalMaskEdit(price, original, "12,3")?.value).toBe("12,3");
    expect(decimalMaskValue(price, original)).toBe("9007199254740993.123456");
  });

  it("reuses grouping deletion ranges while retaining the comma and fractional digits", () => {
    const previous = "12 345,67";
    const backwards = integerMaskDeletionRange(previous, 3, 3, true)!;
    expect(decimalMaskEdit(price, previous, previous.slice(0, backwards.start) + previous.slice(backwards.end), backwards.start))
      .toEqual({ value: "1 345,67", start: 1, end: 1 });
    const forwards = integerMaskDeletionRange(previous, 2, 2, false)!;
    expect(decimalMaskEdit(price, previous, previous.slice(0, forwards.start) + previous.slice(forwards.end), forwards.start))
      .toEqual({ value: "1 245,67", start: 3, end: 3 });
  });

  it("converts digit-bearing localized drafts exactly and refuses silent empty-to-zero", () => {
    expect(decimalMaskValue(price, "-001 234,5600")).toBe("-001234.5600");
    expect(decimalMaskValue(price, "+,5")).toBe("+0.5");
    expect(decimalMaskValue(price, "-,5")).toBe("-0.5");
    expect(decimalMaskValue(price, "1,")).toBe("1");
    for (const draft of ["", " ", "+", "-", ",", "+,", "-,"]) expect(decimalMaskValue(price, draft), draft).toBeUndefined();
  });
});
