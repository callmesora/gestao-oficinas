import { expect, it } from "vitest";
import {
  dateCalendarText, dateCalendarValue, dateEntryChange, dateEntryDisplay, dateEntryInitial, dateEntryResult,
} from "./date-entry";

it("RULE-W16C5A7-1002 ADR-002 separates compact return, pt-PT display and the zero-date sentinel", () => {
  for (const [value, display] of [
    ["20240229", "29/02/2024"], ["00010101", "01/01/0001"], ["99991231", "31/12/9999"],
    ["00000000", "00/00/0000"], ["", ""], [null, ""],
  ] as const) {
    expect(dateEntryDisplay(value)).toBe(display);
    expect(dateEntryInitial(value)).toEqual({ original: value, text: display, edited: false });
  }
});

it("SRC-f238b5fac8 ADR-002 untouched Confirm preserves exact NULL, empty, zero and opaque original values", () => {
  for (const original of [null, "", "00000000", "20240229", "20240230", "00000101", " 20240229 ", "2024-02-29 12:34:56.789", "legacy d'Água  "]) {
    expect(dateEntryResult(dateEntryInitial(original))).toEqual({ kind: "valid", value: original });
  }
  for (const opaque of ["20240230", "00000101", " 20240229 ", "2024-02-29 12:34:56.789", "legacy d'Água  "]) {
    expect(dateEntryDisplay(opaque)).toBe(opaque);
  }
});

it("SRC-f238b5fac8 ADR-002 accepted edits keep the exact original available for cancel without mutating prior drafts", () => {
  const initial = dateEntryInitial("  original\n");
  const edited = dateEntryChange(initial, "29/02/2000");
  expect(initial).toEqual({ original: "  original\n", text: "  original\n", edited: false });
  expect(edited).toEqual({ original: "  original\n", text: "29/02/2000", edited: true });
  expect(dateEntryResult(edited)).toEqual({ kind: "valid", value: "20000229" });
});

it("RULE-W16C5A7-005 ADR-002 NULL to digits to blank latches accepted-edit lifetime and returns empty instead of NULL", () => {
  const initial = dateEntryInitial(null);
  const digits = dateEntryChange(initial, "29/02/2024");
  const blank = dateEntryChange(digits, "");
  expect(blank).toEqual({ original: null, text: "", edited: true });
  expect(dateEntryResult(blank)).toEqual({ kind: "valid", value: "" });
  const opaque = dateEntryInitial("31/02/2024");
  const returned = dateEntryChange(dateEntryChange(opaque, "29/02/2024"), opaque.text);
  expect(returned.edited).toBe(true);
  expect(dateEntryResult(returned)).toEqual({ kind: "invalid" });
});

it("SRC-11e5297e6b RULE-W16C5A7-1002 deliberately blank and zero are distinct allowed results without a required rule", () => {
  for (const original of [null, "", "00000000", "20240229", "opaque"]) {
    expect(dateEntryResult(dateEntryChange(dateEntryInitial(original), ""))).toEqual({ kind: "valid", value: "" });
    expect(dateEntryResult(dateEntryChange(dateEntryInitial(original), "00/00/0000"))).toEqual({ kind: "valid", value: "00000000" });
  }
});

it("RULE-W16C5A7-005 ADR-002 edited Gregorian dates handle leap centuries and the full explicit year range", () => {
  for (const [text, compact] of [
    ["01/01/0001", "00010101"], ["31/12/9999", "99991231"], ["29/02/2000", "20000229"],
    ["29/02/2400", "24000229"], ["29/02/2024", "20240229"], ["28/02/1900", "19000228"],
    ["28/02/2100", "21000228"], ["30/04/2024", "20240430"], ["31/01/2024", "20240131"],
  ]) {
    expect(dateEntryResult(dateEntryChange(dateEntryInitial(null), text))).toEqual({ kind: "valid", value: compact });
  }
  for (const text of ["29/02/1900", "29/02/2100", "29/02/2023", "30/02/2000", "31/04/2024", "31/06/2024", "31/09/2024", "31/11/2024", "00/01/2024", "32/01/2024", "01/00/2024", "01/13/2024", "01/01/0000", "00/00/2024"]) {
    expect(dateEntryResult(dateEntryChange(dateEntryInitial("20240228"), text))).toEqual({ kind: "invalid" });
  }
});

it("RULE-W16C5A7-005 ADR-002 editing never trims, guesses format, coerces digits or autocorrects an invalid value", () => {
  for (const text of [" 29/02/2024", "29/02/2024 ", "29/02/2024\n", "29/2/2024", "9/02/2024", "29/02/024", "01/01/10000", "20240229", "2024-02-29", "29.02.2024", "29/02/+024", "２９/０２/２０２４", "\t", "0", "00000000", "31/02/2024"]) {
    const changed = dateEntryChange(dateEntryInitial("20240228"), text);
    expect(changed.text).toBe(text);
    expect(dateEntryResult(changed)).toEqual({ kind: "invalid" });
  }
});

it("RULE-W16C5A7-1002 ADR-003 calendar value adapter accepts only valid nonzero compact dates", () => {
  for (const [value, iso] of [["00010101", "0001-01-01"], ["20000229", "2000-02-29"], ["20240229", "2024-02-29"], ["99991231", "9999-12-31"]]) {
    expect(dateCalendarValue(value)).toBe(iso);
  }
  for (const value of [null, "", "00000000", "19000229", "21000229", "20240230", "00000101", "20241301", "20240100", "20240229\n", " 20240229", "2024-02-29", "20240229123456", "opaque"]) {
    expect(dateCalendarValue(value)).toBe("");
  }
});

it("RULE-W16C5A7-1002 ADR-003 calendar text adapter validates ISO dates before producing a deliberate local edit", () => {
  expect(dateCalendarText("")).toBe("");
  for (const [iso, text, compact] of [
    ["0001-01-01", "01/01/0001", "00010101"], ["2000-02-29", "29/02/2000", "20000229"],
    ["2024-02-29", "29/02/2024", "20240229"], ["9999-12-31", "31/12/9999", "99991231"],
  ]) {
    expect(dateCalendarText(iso)).toBe(text);
    expect(dateEntryResult(dateEntryChange(dateEntryInitial(null), text))).toEqual({ kind: "valid", value: compact });
  }
  for (const iso of ["0000-00-00", "0000-01-01", "1900-02-29", "2100-02-29", "2000-02-30", "2024-04-31", "2024-13-01", "2024-01-00", "10000-01-01", "2024-2-29", "20240229", "29/02/2024", " 2024-02-29", "2024-02-29 ", "2024-02-29\n", "2024-02-29T00:00:00Z", "２０２４-０２-２９"]) {
    expect(dateCalendarText(iso)).toBeNull();
  }
});
