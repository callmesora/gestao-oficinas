import { describe, expect, it } from "vitest";
import { repairLaborMemorySort } from "./repair-labor-table";

describe("actual labor memory-table value representation", () => {
  it("RULE-WBBC9D9-1029 ADR012 keeps current draft identities/edits and sorts decimal quantities beyond safe Number precision", () => {
    const rows = [{ id: "large", value: "9007199254740993.0001", extra: true }, { id: "small", value: "9007199254740993.0000", extra: false }, { id: "ten", value: "10", extra: true }, { id: "two", value: "2", extra: false }];
    const sorted = repairLaborMemorySort(rows, row => ({ kind: "number", value: row.value }));
    expect(sorted.map(row => row.id)).toEqual(["two", "ten", "small", "large"]); expect(sorted.at(-1)).toBe(rows[0]);
    expect(rows.map(row => row.id)).toEqual(["large", "small", "ten", "two"]);
  });
  it("RULE-WBBC9D9-1023 ADR012 sorts mixed compact/spaced dates chronologically without changing their raw values", () => {
    const rows = ["20261025120100000", "2026-10-25 12:00:00.001", "20261025120000", "20261025120000000"];
    expect(repairLaborMemorySort(rows, value => ({ kind: "date", value }))).toEqual([rows[2], rows[3], rows[1], rows[0]]);
    expect(repairLaborMemorySort(rows, value => ({ kind: "date", value }), true)).toEqual([rows[0], rows[1], rows[2], rows[3]]);
  });
});
