import { expect, it } from "vitest";
import { createWindowGeometryStore } from "./window-geometry";

const geometry = { x: 40, y: 20, width: 600, height: 480, maximized: true };
const key = "gestao-oficinas:window-geometry:v1:Clientes%20%26%20Oficinas";

it("round-trips versioned geometry while whitelisting fields and separating layout keys", () => {
  const values = new Map<string, string>();
  const store = createWindowGeometryStore({ getItem: name => values.get(name) ?? null, setItem: (name, value) => { values.set(name, value); } });
  const withContent = { ...geometry, content: "must not be persisted" };
  expect(store.save("Clientes & Oficinas", withContent)).toBe(true);
  expect(JSON.parse(values.get(key)!)).toEqual({ version: 1, ...geometry });
  expect(store.load("Clientes & Oficinas")).toEqual(geometry);
  expect(store.load("Other")).toBeNull();
  expect(store.save("Clientes & Oficinas", { ...geometry, width: NaN })).toBe(false);
  expect(JSON.parse(values.get(key)!)).toEqual({ version: 1, ...geometry });
});

it("rejects corrupt, incompatible and non-finite saved settings without overwriting them", () => {
  const invalid = ["{", "null", JSON.stringify(geometry), JSON.stringify({ version: 2, ...geometry }),
    JSON.stringify({ version: 1, ...geometry, x: -1 }), JSON.stringify({ version: 1, ...geometry, width: 0 }),
    JSON.stringify({ version: 1, ...geometry, y: "20" }), JSON.stringify({ version: 1, ...geometry, maximized: 1 }),
    '{"version":1,"x":0,"y":0,"width":1e999,"height":480,"maximized":false}'];
  for (const value of invalid) {
    let writes = 0;
    const store = createWindowGeometryStore({ getItem: () => value, setItem: () => { writes++; } });
    expect(store.load("Any")).toBeNull();
    expect(writes).toBe(0);
  }
});

it("treats unavailable storage as a non-blocking settings failure", () => {
  const store = createWindowGeometryStore({ getItem: () => { throw new Error("Blocked"); }, setItem: () => { throw new Error("Quota"); } });
  expect(store.load("Any")).toBeNull();
  expect(store.save("Any", geometry)).toBe(false);
});
