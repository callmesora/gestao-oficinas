import { expect, it } from "vitest";
import { documentTypeStockLabel } from "../../packages/domain/src/document-types";
import { repairStateTypeLabel } from "../../packages/domain/src/repair-states";
import { selectAfterTableRead } from "./table-selection";

it("ADR-012 selects the first displayed prefix in returned order without sorting or changing exact identities", () => {
  const rows = Object.freeze([
    Object.freeze({ id: "9007199254740993", text: "Saída final  " }),
    Object.freeze({ id: "2", text: "Saída anterior" }),
    Object.freeze({ id: "3", text: "Entrada" }),
  ]);
  expect(selectAfterTableRead(rows, "3", { term: "SAÍ", value: row => row.text })).toBe("9007199254740993");
  expect(selectAfterTableRead([...rows].reverse(), "3", { term: "SAÍ", value: row => row.text })).toBe("2");
  expect(rows.map(row => row.id)).toEqual(["9007199254740993", "2", "3"]);
});

it("ADR-012 blank or unmatched text retains only an existing exact prior identity, with no initial/delete fallback", () => {
  const rows = [{ id: "1", text: "First" }, { id: "9007199254740993", text: "Second" }];
  for (const previous of [null, "missing", "9007199254740992"]) {
    expect(selectAfterTableRead(rows, previous)).toBeNull();
    expect(selectAfterTableRead(rows, previous, { term: "", value: row => row.text })).toBeNull();
    expect(selectAfterTableRead(rows, previous, { term: "absent", value: row => row.text })).toBeNull();
  }
  expect(selectAfterTableRead(rows, "9007199254740993")).toBe("9007199254740993");
  expect(selectAfterTableRead(rows, "9007199254740993", { term: "", value: row => row.text })).toBe("9007199254740993");
  expect(selectAfterTableRead(rows, "9007199254740993", { term: "absent", value: row => row.text })).toBe("9007199254740993");
  expect(selectAfterTableRead([], "9007199254740993")).toBeNull();
});

it("ADR-012 lowercases only for comparison, preserving spaces, accents and distinct duplicate display values", () => {
  const rows = [{ id: "1", text: " Saída  " }, { id: "2", text: "Saída" }, { id: "3", text: "Saída" }];
  expect(selectAfterTableRead(rows, null, { term: " SAÍ", value: row => row.text })).toBe("1");
  expect(selectAfterTableRead(rows, null, { term: "saí", value: row => row.text })).toBe("2");
  expect(selectAfterTableRead(rows, null, { term: "sai", value: row => row.text })).toBeNull();
  expect(selectAfterTableRead(rows, "3", { term: "Saída   ", value: row => row.text })).toBe("3");
  expect(selectAfterTableRead(rows, null, { term: " ", value: row => row.text })).toBe("1");
});

it("ADR-012 keeps repair-type, stock-byte and nullable Boolean interpretation in the explicit caller", () => {
  const rows = [
    { id: "1", tipo: 8, stock: 2, mechanic: true },
    { id: "2", tipo: 255, stock: 255, mechanic: false },
    { id: "3", tipo: null, stock: null, mechanic: null },
  ];
  expect(selectAfterTableRead(rows, null, { term: "Orçam", value: row => repairStateTypeLabel(row.tipo) })).toBe("1");
  expect(selectAfterTableRead(rows, null, { term: "Saí", value: row => documentTypeStockLabel(row.stock) })).toBe("1");
  expect(selectAfterTableRead(rows, null, { term: "255", value: row => documentTypeStockLabel(row.stock) })).toBe("2");
  const booleanValue = (row: typeof rows[number]) => row.mechanic === null ? "" : row.mechanic ? "1" : "0";
  expect(selectAfterTableRead(rows, null, { term: "1", value: booleanValue })).toBe("1");
  expect(selectAfterTableRead(rows, null, { term: "0", value: booleanValue })).toBe("2");
  expect(selectAfterTableRead(rows, "3", { term: "", value: booleanValue })).toBe("3");
});
