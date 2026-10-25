import { describe, expect, it } from "vitest";
import { integerMaskDeletionRange, integerMaskDigits, integerMaskDisplay, integerMaskEdit, integerMaskOf } from "./numeric-entry";

const customer = integerMaskOf("999 999")!;
const bytePosition = integerMaskOf("99")!;

describe("source integer-mask entry", () => {
  it("counts only source 9 slots and opts out of unsupported text/decimal masks", () => {
    expect(customer.capacity).toBe(6);
    expect(integerMaskOf("9999")?.capacity).toBe(4);
    expect(bytePosition.capacity).toBe(2);
    for (const source of [undefined, "", "0", "999.99", "+999", "AAAA", " 99", "99\n"]) expect(integerMaskOf(source)).toBeNull();
  });

  it("renders the source grouping without number coercion or losing leading zeroes", () => {
    expect(integerMaskDisplay(customer, "123456")).toBe("123 456");
    expect(integerMaskDisplay(customer, "1234")).toBe("1 234");
    expect(integerMaskDisplay(customer, "001234")).toBe("001 234");
    expect(integerMaskDisplay(customer, "0")).toBe("0");
    expect(integerMaskDisplay(customer, "")).toBe("");
    const large = integerMaskOf("9999999999999999999")!;
    expect(integerMaskEdit(large, "", "9007199254740993123")?.value).toBe("9007199254740993123");
  });

  it("preserves loaded oversized and unsupported originals rather than repair them", () => {
    for (const value of ["9007199254740993", "1234567", "12x3", "-2"]) expect(integerMaskDisplay(customer, value)).toBe(value);
    expect(integerMaskDisplay(bytePosition, "255")).toBe("255");
    expect(integerMaskEdit(bytePosition, "255", "255")?.value).toBe("255");
  });

  it("rejects whole malformed edits and pastes, including locale and non-ASCII digits", () => {
    for (const value of ["1x2", "-12", "+12", "1.2", "1,2", "1e2", "１２", "١٢", "12\n", "1\u00a0234"]) {
      expect(integerMaskEdit(customer, "12", value), value).toBeNull();
      expect(integerMaskDigits(customer, value), value).toBeUndefined();
    }
    expect(integerMaskEdit(bytePosition, "12", "1 2")).toBeNull();
    expect(integerMaskEdit(customer, "12", "1 234")?.value).toBe("1 234");
    expect(integerMaskDigits(customer, "001 234")).toBe("001234");
  });

  it("enforces source digit capacity independently from storage byte bounds", () => {
    expect(integerMaskEdit(customer, "123 456", "1 234 567")).toBeNull();
    expect(integerMaskEdit(bytePosition, "25", "255")).toBeNull();
    expect(integerMaskEdit(bytePosition, "", "99")?.value).toBe("99");
    expect(integerMaskEdit(integerMaskOf("9999")!, "", "9999")?.value).toBe("9999");
  });

  it("allows an oversized imported value to stay unchanged or become strictly shorter", () => {
    expect(integerMaskEdit(bytePosition, "255", "256")).toBeNull();
    expect(integerMaskEdit(bytePosition, "255", "2550")).toBeNull();
    expect(integerMaskEdit(bytePosition, "1255", "255")?.value).toBe("255");
    expect(integerMaskEdit(bytePosition, "255", "25")?.value).toBe("25");
    expect(integerMaskEdit(bytePosition, "255", "")?.value).toBe("");
  });

  it("keeps blank drafts blank and maps an insertion/selection by digit position", () => {
    expect(integerMaskEdit(customer, "0", "")).toEqual({ value: "", start: 0, end: 0 });
    expect(integerMaskEdit(customer, "123", "1234")).toEqual({ value: "1 234", start: 5, end: 5 });
    expect(integerMaskEdit(customer, "", "1234", 2, 3)).toEqual({ value: "1 234", start: 3, end: 4 });
    expect(integerMaskEdit(customer, "12 345", "125", 2)).toEqual({ value: "125", start: 2, end: 2 });
  });

  it("makes Backspace/Delete around the grouping separator remove the adjacent digit", () => {
    const previous = "12 345";
    const backwards = integerMaskDeletionRange(previous, 3, 3, true)!;
    expect(backwards).toEqual({ start: 1, end: 3 });
    expect(integerMaskEdit(customer, previous, previous.slice(0, backwards.start) + previous.slice(backwards.end), backwards.start))
      .toEqual({ value: "1 345", start: 1, end: 1 });
    const forwards = integerMaskDeletionRange(previous, 2, 2, false)!;
    expect(forwards).toEqual({ start: 2, end: 4 });
    expect(integerMaskEdit(customer, previous, previous.slice(0, forwards.start) + previous.slice(forwards.end), forwards.start))
      .toEqual({ value: "1 245", start: 3, end: 3 });
    expect(integerMaskDeletionRange(previous, 1, 4, true)).toBeNull();
    expect(integerMaskDeletionRange(previous, 1, 1, false)).toBeNull();
  });
});
