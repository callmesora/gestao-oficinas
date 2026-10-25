import { expect, it } from "vitest";
import { createTableLayoutStore } from "./table-layout";

const layout = { widths: { "TABLE.COL": 88 }, order: ["TABLE.COL"] };
const key = "gestao-oficinas:table-layout:v1:WIN%2FTABLE";
it("round-trips layout-only fields using a scoped/versioned key and rejects invalid writes", () => {
  const values = new Map<string, string>();
  const store = createTableLayoutStore({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
  const withRows = { ...layout, rows: ["not settings"] };
  expect(store.save("WIN/TABLE", withRows)).toBe(true);
  expect(JSON.parse(values.get(key)!)).toEqual({ version: 1, ...layout });
  expect(store.load("WIN/TABLE")).toEqual(layout);
  const withVisibility = { ...layout, hidden: ["TABLE.OTHER"], selectedId: "not settings", rows: ["not settings"] };
  expect(store.save("WIN/TABLE", withVisibility)).toBe(true);
  expect(store.load("WIN/TABLE")).toEqual({ ...layout, hidden: ["TABLE.OTHER"] });
  expect(JSON.parse(values.get(key)!)).toEqual({ version: 1, ...layout, hidden: ["TABLE.OTHER"] });
  expect(store.load("OTHER/TABLE")).toBeNull();
  expect(store.save("WIN/TABLE", { ...layout, widths: { "TABLE.COL": NaN } })).toBe(false);
  expect(JSON.parse(values.get(key)!)).toEqual({ version: 1, ...layout, hidden: ["TABLE.OTHER"] });
});
it("rejects malformed/versioned/duplicate configuration without writing on read", () => {
  const cases = ["{", "null", JSON.stringify({ ...layout, version: 2 }), JSON.stringify({ ...layout, version: 1, widths: [] }),
    JSON.stringify({ ...layout, version: 1, widths: { "TABLE.COL": -1 } }), JSON.stringify({ ...layout, version: 1, order: ["TABLE.COL", "TABLE.COL"] }),
    JSON.stringify({ ...layout, version: 1, hidden: ["TABLE.COL", "TABLE.COL"] }), JSON.stringify({ ...layout, version: 1, hidden: "TABLE.COL" })];
  for (const value of cases) {
    let writes = 0;
    const store = createTableLayoutStore({ getItem: () => value, setItem: () => { writes++; } });
    expect(store.load("WIN/TABLE")).toBeNull(); expect(writes).toBe(0);
  }
});
it("falls back when storage is blocked or full", () => {
  const store = createTableLayoutStore({ getItem: () => { throw new Error("Blocked"); }, setItem: () => { throw new Error("Full"); } });
  expect(store.load("WIN/TABLE")).toBeNull(); expect(store.save("WIN/TABLE", layout)).toBe(false);
});
