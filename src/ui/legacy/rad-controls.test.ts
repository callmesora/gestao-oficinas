import { expect, it } from "vitest";
import { resolveRadBindings } from "./rad-controls";
import repair from "./WIN_Form_estados_reparacao.layout.json";
import order from "./WIN_Ordens_Reparacao.layout.json";

it("renders only explicitly bound source controls in caller order without fabricating geometry or actions", () => {
  const result = resolveRadBindings(repair, [{ name: "EDT_Cor", kind: "edit", props: { value: "4294967295" } }, { name: "EDT_Codigo", kind: "edit", props: { readOnly: true } }]);
  expect(result.map(item => item.control.path)).toEqual(["SC_Form.EDT_Cor", "SC_Form.EDT_Codigo"]);
  expect(result[0].control).toBe(repair.controls.find(item => item.name === "EDT_Cor"));
  expect(result[0].binding).toMatchObject({ props: { value: "4294967295" } });
  expect(result[1].binding).toMatchObject({ props: { readOnly: true } });
});

it("rejects stale, ambiguous, repeated and unsupported bindings before a misleading screen can render", () => {
  expect(() => resolveRadBindings(repair, [{ name: "missing", kind: "caption" }])).toThrow("unambiguous qualified path");
  expect(() => resolveRadBindings(order, [{ name: "SHA_cor", kind: "shape", props: { backgroundColor: "white" } }])).toThrow("qualified path");
  expect(() => resolveRadBindings(repair, [{ name: "EDT_Codigo", kind: "edit", props: {} }, { name: "SC_Form.EDT_Codigo", kind: "edit", props: {} }])).toThrow("bound twice");
  expect(() => resolveRadBindings(repair, [{ name: "EDT_Codigo", kind: "checkbox", props: { checked: false, onChange: () => {} } }])).toThrow("kind mismatch");
  expect(() => resolveRadBindings(repair, [{ name: "SC_Form", kind: "caption" }])).toThrow("kind mismatch");
});
