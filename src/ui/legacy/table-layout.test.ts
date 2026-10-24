import { expect, it } from "vitest";
import { reconcileTableLayout } from "./table-layout";
import { controlOf } from "./layout";
import source from "./WIN_Table_Clientes.layout.json";
const columns = controlOf(source, "TABLE_Clientes").columns!;
it("drops stale/hidden keys, appends new columns in source order and never mutates source", () => {
  const [code, description, address] = columns;
  const hidden = { ...address, flags: { ...address.flags, Visible: false } };
  const saved = { widths: { [code.path]: 91, stale: 99, [address.path]: 88 }, order: [description.path, "stale", code.path] };
  expect(reconcileTableLayout(saved, [code, description, hidden, ...columns.slice(3)])).toEqual({
    widths: { [code.path]: 91 }, order: [description.path, code.path, ...columns.slice(3).map(column => column.path)] });
  expect(code.width).toBe(80); expect(columns[0].path).toBe(code.path);
});
it("keeps fixed/non-movable source barriers when loading an older order", () => {
  const [a, b, c, d] = columns;
  for (const flags of [{ ...b.flags, Movable: false }, { ...b.flags, "Fixed left": true }]) {
    expect(reconcileTableLayout({ widths: {}, order: [d.path, c.path, b.path, a.path] }, [a, { ...b, flags }, c, d]).order)
      .toEqual([a.path, b.path, d.path, c.path]);
  }
});
