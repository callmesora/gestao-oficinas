import { expect, it } from "vitest";
import {
  dateOnlyComparisonKey, dateTimeCalendarChange, dateTimeCalendarValue, dateTimeComparisonKey,
  dateTimeEntryChange, dateTimeEntryDisplay, dateTimeEntryInitial, dateTimeEntryResult,
  isDateOnlyBound, isDateTimeBound, shiftCalendarDate,
} from "./date-time";

it("RULE-W53605A-1021/1022 ADR-002 displays minutes but preserves every untouched original exactly", () => {
  for (const [original, display] of [
    [null, ""], ["", ""], ["00000000000000", "00/00/0000 00:00"], ["00000000000000000", "00/00/0000 00:00"],
    ["20240229235959", "29/02/2024 23:59"], ["20240229235959123", "29/02/2024 23:59"],
    ["2024-02-29 23:59:59.123", "29/02/2024 23:59"], ["00010101000000", "01/01/0001 00:00"],
    ["99991231235959999", "31/12/9999 23:59"], ["20240230235959000", "20240230235959000"],
    ["20240229246000", "20240229246000"], ["2024-02-29T23:59:59.123Z", "2024-02-29T23:59:59.123Z"],
    [" original d'Água  ", " original d'Água  "],
  ] as const) {
    const initial = dateTimeEntryInitial(original);
    expect(dateTimeEntryDisplay(original)).toBe(display);
    expect(initial).toEqual({ original, text: display, edited: false });
    expect(dateTimeEntryResult(initial)).toEqual({ kind: "valid", value: original });
  }
});

it("RULE-W53605A-005 ADR-002 deliberate minute edits retain original representation and hidden seconds/milliseconds", () => {
  for (const [original, expected] of [
    ["20240228235959", "20240301123459"], ["20240228235959123", "20240301123459123"],
    ["2024-02-28 23:59:59.987", "2024-03-01 12:34:59.987"],
    [null, "20240301123400"], ["", "20240301123400"], ["opaque", "20240301123400"],
    ["00000000000000000", "20240301123400"],
  ] as const) {
    const initial = dateTimeEntryInitial(original), edited = dateTimeEntryChange(initial, "01/03/2024 12:34");
    expect(dateTimeEntryResult(edited)).toEqual({ kind: "valid", value: expected });
    expect(edited.original).toBe(original);
    expect(initial.edited).toBe(false);
  }
});

it("RULE-W53605A-005 ADR-002 accepted edits latch through NULL to digits to blank and retain original for cancellation", () => {
  const initial = dateTimeEntryInitial(null);
  const digits = dateTimeEntryChange(initial, "29/02/2024 12:34");
  expect(dateTimeEntryResult(dateTimeEntryChange(digits, ""))).toEqual({ kind: "valid", value: "" });
  expect(initial).toEqual({ original: null, text: "", edited: false });
  for (const original of [null, "", "00000000000000", "20240229235959123", "opaque"]) {
    expect(dateTimeEntryResult(dateTimeEntryChange(dateTimeEntryInitial(original), ""))).toEqual({ kind: "valid", value: "" });
    expect(dateTimeEntryResult(dateTimeEntryChange(dateTimeEntryInitial(original), "00/00/0000 00:00")))
      .toEqual({ kind: "valid", value: "00000000000000" });
  }
  const opaque = dateTimeEntryInitial("29/02/1900 12:00");
  expect(dateTimeEntryResult(dateTimeEntryChange(dateTimeEntryChange(opaque, "29/02/2000 12:00"), opaque.text)))
    .toEqual({ kind: "invalid" });
});

it("RULE-W53605A-005 ADR-002 validates edited Gregorian dates and clock fields without trimming or autocorrection", () => {
  for (const [text, expected] of [
    ["01/01/0001 00:00", "00010101000000"], ["31/12/9999 23:59", "99991231235900"],
    ["29/02/2000 12:34", "20000229123400"], ["29/02/2400 01:02", "24000229010200"],
    ["28/02/1900 12:00", "19000228120000"], ["28/02/2100 12:00", "21000228120000"],
  ]) expect(dateTimeEntryResult(dateTimeEntryChange(dateTimeEntryInitial(null), text))).toEqual({ kind: "valid", value: expected });
  for (const text of [
    "29/02/1900 12:34", "29/02/2100 12:34", "29/02/2023 12:34", "31/04/2024 12:34", "01/01/0000 12:34",
    "29/02/2024 24:00", "29/02/2024 12:60", "29/02/2024 12:34:56", "29/02/2024 1:34", "29/02/2024 12:3",
    "29/2/2024 12:34", " 29/02/2024 12:34", "29/02/2024 12:34 ", "29/02/2024 12:34\n", "20240229123400",
    "2024-02-29 12:34:56.123", "２９/０２/２０２４ １２:３４", "00/00/0000 12:34", "29/02/2024 ",
  ]) {
    const draft = dateTimeEntryChange(dateTimeEntryInitial("20240228235959"), text);
    expect(draft.text).toBe(text);
    expect(dateTimeEntryResult(draft)).toEqual({ kind: "invalid" });
  }
});

it("RULE-W53605A-1021/1022 ADR-003 calendar changes only the date and retains source end59 and imported precision", () => {
  for (const [original, expected] of [
    ["20240228235959", "20240229235959"], ["20240228235959123", "20240229235959123"],
    ["2024-02-28 23:59:59.987", "2024-02-29 23:59:59.987"],
  ]) {
    const initial = dateTimeEntryInitial(original);
    expect(dateTimeCalendarValue(initial)).toBe("2024-02-28");
    const chosen = dateTimeCalendarChange(initial, "2024-02-29");
    expect(chosen.text).toBe("29/02/2024 23:59");
    expect(chosen.edited).toBe(true);
    expect(dateTimeEntryResult(chosen)).toEqual({ kind: "valid", value: expected });
    expect(chosen.original).toBe(original);
  }
  const edited = dateTimeEntryChange(dateTimeEntryInitial("20240228235959123"), "01/03/2024 10:11");
  expect(dateTimeCalendarValue(edited)).toBe("2024-03-01");
  expect(dateTimeEntryResult(dateTimeCalendarChange(edited, "2000-02-29"))).toEqual({ kind: "valid", value: "20000229101159123" });
});

it("RULE-W53605A-005 ADR-003 invalid current time is retained visibly after calendar selection without invented midnight", () => {
  for (const text of ["29/02/2024 24:00", "29/02/2024 12:", "29/02/1900 12:34", "opaque", ""]) {
    const draft = dateTimeEntryChange(dateTimeEntryInitial("20240228235959123"), text);
    expect(dateTimeCalendarValue(draft)).toBe("");
    const chosen = dateTimeCalendarChange(draft, "2024-03-01");
    expect(chosen).toEqual({ original: draft.original, text, edited: true });
    expect(dateTimeEntryResult(chosen)).toEqual(text === "" ? { kind: "valid", value: "" } : { kind: "invalid" });
  }
  for (const original of [null, "", "00000000000000", "opaque"]) {
    const chosen = dateTimeCalendarChange(dateTimeEntryInitial(original), "2024-03-01");
    expect(chosen.text).toBe(dateTimeEntryDisplay(original));
    expect(chosen.edited).toBe(true);
  }
});

it("RULE-W53605A-1021/1022 ADR-003 clearing a calendar is a deliberate empty edit while opening alone remains untouched", () => {
  for (const original of [null, "", "00000000000000000", "20240228235959123", "2024-02-28 23:59:59.987", "opaque"]) {
    const initial = dateTimeEntryInitial(original);
    dateTimeCalendarValue(initial);
    expect(dateTimeEntryResult(initial)).toEqual({ kind: "valid", value: original });
    expect(dateTimeEntryResult(dateTimeCalendarChange(initial, ""))).toEqual({ kind: "valid", value: "" });
  }
});

it("SRC-a2f17b1885 ADR-002 datetime comparison matches14/17/spaced23 with inclusive seconds and millisecond boundaries", () => {
  expect(dateTimeComparisonKey("20240229235959")).toBe("20240229235959000");
  expect(dateTimeComparisonKey("20240229235959123")).toBe("20240229235959123");
  expect(dateTimeComparisonKey("2024-02-29 23:59:59.123")).toBe("20240229235959123");
  const end = dateTimeComparisonKey("20240229235959")!;
  expect(dateTimeComparisonKey("2024-02-29 23:59:59.000")! <= end).toBe(true);
  expect(dateTimeComparisonKey("20240229235959001")! <= end).toBe(false);
  const start = dateTimeComparisonKey("20240229000000")!;
  expect(dateTimeComparisonKey("2024-02-29 00:00:00.000")! >= start).toBe(true);
  expect(dateTimeComparisonKey("20240228235959999")! >= start).toBe(false);
  expect(dateTimeComparisonKey("20240301000000000")! > end).toBe(true);
});

it("RULE-W53605A-005 ADR-002 comparison preserves SQL NULL, empty and raw anomalies while recognizing only valid bounds", () => {
  expect(dateTimeComparisonKey(null)).toBeNull();
  expect(dateTimeComparisonKey("")).toBe("");
  for (const zero of ["00000000000000", "00000000000000000"]) {
    expect(dateTimeComparisonKey(zero)).toBe("00000000000000000");
    expect(isDateTimeBound(zero)).toBe(true);
  }
  for (const valid of ["", "00010101000000", "20000229235959999", "9999-12-31 23:59:59.999"]) expect(isDateTimeBound(valid)).toBe(true);
  for (const raw of ["20240230235959", "19000229120000000", "20240229240000", "20240229235960", "00000101000000", "2024-02-29 23:59:59.123\n", " 20240229235959", "2024-02-29T23:59:59.123", "20240229", "opaque"]) {
    expect(dateTimeComparisonKey(raw)).toBe(raw);
    expect(isDateTimeBound(raw)).toBe(false);
  }
});

it("SRC-a2f17b1885 ADR-002 delivery comparison recognizes Date8/ISOdate only without taking datetime prefixes", () => {
  expect(dateOnlyComparisonKey(null)).toBeNull();
  for (const [value, expected] of [["", ""], ["00000000", "00000000"], ["20240229", "20240229"], ["2024-02-29", "20240229"], ["0001-01-01", "00010101"], ["9999-12-31", "99991231"]]) {
    expect(dateOnlyComparisonKey(value)).toBe(expected);
    expect(isDateOnlyBound(value)).toBe(true);
  }
  for (const raw of ["1900-02-29", "20240230", "00000101", "20240229123456", "2024-02-29 12:34:56.123", "2024-02-29\n", "2024-2-29", "2024-02-29 ", "opaque"]) {
    expect(dateOnlyComparisonKey(raw)).toBe(raw);
    expect(isDateOnlyBound(raw)).toBe(false);
  }
});

it("SRC-9b6239c2c7 ADR-002 injected Gregorian day shifts cross leap centuries/months/year boundaries without timezone coercion", () => {
  for (const [initial, days, expected] of [
    ["20240228", 1, "20240229"], ["20240229", 1, "20240301"], ["20240301", -1, "20240229"],
    ["19000228", 1, "19000301"], ["20000228", 1, "20000229"], ["21000301", -1, "21000228"],
    ["20241231", 1, "20250101"], ["20240101", -1, "20231231"], ["20241025", 7, "20241101"],
    ["20241025", -365, "20231026"], ["00010101", 0, "00010101"], ["99991231", 0, "99991231"],
    ["00010101", 3652058, "99991231"], ["99991231", -3652058, "00010101"],
  ] as const) {
    expect(shiftCalendarDate(initial, days)).toBe(expected);
    expect(shiftCalendarDate(expected, -days)).toBe(initial);
  }
});

it("RULE-W53605A-005 ADR-002 day shifting rejects invalid sources/overflow/noninteger deltas rather than clamping", () => {
  for (const initial of ["", "00000000", "00000101", "19000229", "20240230", "2024-02-29", "20240229000000", "20240229\n"]) expect(shiftCalendarDate(initial, 1)).toBeNull();
  expect(shiftCalendarDate("00010101", -1)).toBeNull();
  expect(shiftCalendarDate("99991231", 1)).toBeNull();
  for (const delta of [0.1, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1]) expect(shiftCalendarDate("20240229", delta)).toBeNull();
});
