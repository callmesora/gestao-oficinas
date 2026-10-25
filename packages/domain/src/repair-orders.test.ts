import { expect, it } from "vitest";
import { repairOrderDefaultsSchema, repairOrderInitialFilters, repairOrderListSchema, repairOrderPriorityLabel, repairOrderSelect, repairOrderTimerMilliseconds, repairOrderWithinBounds, type RepairOrderList } from "./repair-orders";

const bounds: RepairOrderList = { entryStart: "20240228000000", entryEnd: "20240229235959", deliveryStart: "20240228", deliveryEnd: "20240307", priority: 0, mechanic: 0, customer: "", registration: "", states: [] };

it("SRC-9b6239c2c7 builds source four defaults across leap/month/year boundaries from an injected day", () => {
  expect(repairOrderInitialFilters("20240301", 2)).toEqual({ ...bounds, entryStart: "20240228000000", entryEnd: "20240301235959", deliveryStart: "20240228", deliveryEnd: "20240308" });
  expect(repairOrderInitialFilters("20240101", 1)).toEqual({ ...bounds, entryStart: "20231231000000", entryEnd: "20240101235959", deliveryStart: "20231231", deliveryEnd: "20240108" });
  expect(repairOrderInitialFilters("20240229", null)).toEqual({ ...bounds, entryStart: "20240229000000", deliveryStart: "20240229" });
  for (const [today, days] of [["20230229", 1], ["00010101", 1], ["99991225", 0], ["20240301", -1], ["20240301", 65536], ["20240301", 1.5]] as const) expect(repairOrderInitialFilters(today, days)).toBeNull();
});

it("SRC-9b6239c2c7 converts exact unsigned64 seconds into milliseconds without timer overflow", () => {
  expect(repairOrderTimerMilliseconds("1")).toBe("1000");
  expect(repairOrderTimerMilliseconds("2147484")).toBe("2147484000");
  expect(repairOrderTimerMilliseconds("9007199254740993")).toBe("9007199254740993000");
  expect(repairOrderTimerMilliseconds("18446744073709551615")).toBe("18446744073709551615000");
  for (const value of [null, "0", "", "01", "-1", "1.5", "1e3", "18446744073709551616", " 1", "1\n"]) expect(repairOrderTimerMilliseconds(value)).toBeNull();
});

it("SRC-a2f17b1885 retains explicit first/last/prior-number selection and exact large keys", () => {
  const rows = [{ id: "joined-a", numero: "9007199254740993" }, { id: "joined-b", numero: "9007199254740993" }, { id: "joined-c", numero: "2" }];
  expect(repairOrderSelect(rows, "2", true)).toBe("joined-a");
  expect(repairOrderSelect(rows, "0", false)).toBe("joined-a");
  expect(repairOrderSelect(rows, null, false)).toBe("joined-a");
  expect(repairOrderSelect(rows, "9007199254740993", false)).toBe("joined-a");
  expect(repairOrderSelect(rows, "2", false)).toBe("joined-c");
  expect(repairOrderSelect(rows, "9007199254740992", false)).toBe("joined-c");
  expect(repairOrderSelect([], "2", false)).toBeNull();
});

it("SRC-a2f17b1885 compares all four bounds inclusively while retaining source hidden precision", () => {
  expect(repairOrderWithinBounds({ recepcao_datahora: "20240228000000000", recepcao_entrega_prevista: "20240228" }, bounds)).toBe(true);
  expect(repairOrderWithinBounds({ recepcao_datahora: "2024-02-29 23:59:59.000", recepcao_entrega_prevista: "2024-03-07" }, bounds)).toBe(true);
  for (const row of [
    { recepcao_datahora: "20240227235959999", recepcao_entrega_prevista: "20240228" },
    { recepcao_datahora: "20240229235959001", recepcao_entrega_prevista: "20240307" },
    { recepcao_datahora: "20240228000000000", recepcao_entrega_prevista: "20240227" },
    { recepcao_datahora: "20240228000000000", recepcao_entrega_prevista: "20240308" },
  ]) expect(repairOrderWithinBounds(row, bounds)).toBe(false);
});

it("ADR-002 comparison defaults preserve SQL NULL, empty, zero and opaque storage distinctions", () => {
  const empty = { ...bounds, entryStart: "", entryEnd: "", deliveryStart: "", deliveryEnd: "" };
  expect(repairOrderWithinBounds({ recepcao_datahora: "", recepcao_entrega_prevista: "" }, empty)).toBe(true);
  expect(repairOrderWithinBounds({ recepcao_datahora: null, recepcao_entrega_prevista: "" }, empty)).toBe(false);
  expect(repairOrderWithinBounds({ recepcao_datahora: "", recepcao_entrega_prevista: null }, empty)).toBe(false);
  expect(repairOrderWithinBounds({ recepcao_datahora: "00000000000000000", recepcao_entrega_prevista: "00000000" }, { ...bounds, entryStart: "00000000000000", entryEnd: "00000000000000", deliveryStart: "00000000", deliveryEnd: "00000000" })).toBe(true);
  // Explicit U05 target fallback is lexical and never repairs an anomalous stored value.
  expect(repairOrderWithinBounds({ recepcao_datahora: "20240228120000?", recepcao_entrega_prevista: "20240229" }, bounds)).toBe(true);
});

it("service schemas reject unknown fields, malformed bounds and lossy identifiers before I/O", () => {
  expect(repairOrderListSchema.safeParse({ ...bounds, customer: "18446744073709551615", states: ["R", null, "X' ", "opaque imported key"] }).success).toBe(true);
  expect(repairOrderListSchema.safeParse({ ...bounds, registration: "programmatic picker value longer than fifteen" }).success).toBe(true);
  for (const patch of [{ entryStart: "opaque" }, { entryEnd: "20240230235959" }, { deliveryEnd: "2024-02-30" }, { deliveryStart: null }, { customer: "18446744073709551616" }, { customer: "1\n" }, { customer: 1 }, { mechanic: 256 }, { priority: 4 }, { states: [1] }, { registration: 1 }, { sort: "numero;--" }, { rows: [] }]) expect(repairOrderListSchema.safeParse({ ...bounds, ...patch }).success).toBe(false);
  expect(repairOrderDefaultsSchema.safeParse({ states: [{ Codigo: null, checked: null }, { Codigo: "opaque imported key", checked: true }] }).success).toBe(true);
  for (const input of [{ states: [{ Codigo: "R", checked: 1 }] }, { states: [{ Codigo: "R", checked: true, Descricao: "stale" }] }, { states: [], secret: true }]) expect(repairOrderDefaultsSchema.safeParse(input).success).toBe(false);
});

it("SRC-390dd6c737 displays exact source priority labels without normalizing unknown stored bytes", () => {
  expect([1, 2, 3, 0, 255, null].map(repairOrderPriorityLabel)).toEqual(["Normal", "Elevada", "Urgente", "0", "255", ""]);
});
