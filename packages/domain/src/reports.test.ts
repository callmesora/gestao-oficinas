import { expect, it } from "vitest";
import { movementWithin, orderReportPriority, reportRequestSchema, statementGroups, type StatementMovement } from "./reports";

const movement = (patch: Partial<StatementMovement> = {}): StatementMovement => ({ numero: "18446744073709551615", artigo: "A", descricao_artigo: "Óleo  ", quantidade: "0.1", Descricao: "Entrada", data: "20260201000000000", stock: 1, ...patch });
it("source inclusive history/current cutoffs retain their deliberate overlapping boundary and raw sentinels", () => {
  const row = movement();
  expect(movementWithin(row, "20000101000000", "20260201000000")).toBe(true);
  expect(movementWithin(row, "20260201000000", "20260201235959")).toBe(true);
  expect(movementWithin(movement({ data: "20260201235959001" }), "20260201000000", "20260201235959")).toBe(false);
  expect(movementWithin(movement({ data: null }), "", "20990101000000")).toBe(false);
  expect(movementWithin(movement({ data: "00000000000000000" }), "20000101000000", "20990101000000")).toBe(false);
});
it("source opening/running/footer arithmetic preserves duplicates, negative quantities and precision beyond Decimal default20", () => {
  const history = [movement({ quantidade: "999999999999999999999999999999.12345678901234567890" })];
  const current = [movement(), movement(), movement({ stock: 2, quantidade: "-0.2" }), movement({ artigo: "B", stock: 2, quantidade: "1" })];
  const result = statementGroups(current, history);
  expect(result.kind).toBe("built");
  if (result.kind !== "built") return;
  expect(result.groups.map(group => [group.article, group.opening, group.closing])).toEqual([
    ["A", "999999999999999999999999999999.1234567890123456789", "999999999999999999999999999999.5234567890123456789"], ["B", "0", "-1"],
  ]);
  expect(result.groups[0].lines).toHaveLength(3);
  expect(result.groups[0].lines[2]).toMatchObject({ numero: "18446744073709551615", entrance: "", exit: "-0.2", descricao_artigo: "Óleo  " });
});
it("source unknown-stock no-assignment retains control text, but NULL arithmetic never silently becomes zero", () => {
  const result = statementGroups([movement({ stock: 2, quantidade: "4" }), movement({ stock: 9, quantidade: null })], []);
  expect(result.kind === "built" && result.groups[0].lines[1]).toMatchObject({ entrance: "", exit: "4", balance: "-4" });
  expect(statementGroups([movement({ quantidade: null })], [])).toEqual({ kind: "unresolved", unresolved: ["U-R09-02: arithmetic quantity NULL/invalid"] });
  expect(statementGroups([], [movement({ quantidade: null })])).toEqual({ kind: "built", groups: [] });
});
it("priority event applies only its source1/2/3 cases and strict request input refuses arbitrary HTML/query contracts", () => {
  expect(["1", "2", "3", "9", "", null].map(orderReportPriority)).toEqual(["Normal", "Elevada", "Urgente", "9", "", null]);
  expect(reportRequestSchema.safeParse({ reportId: "RPT_Ordens_Reparacao", html: "<script>" }).success).toBe(false);
  expect(reportRequestSchema.safeParse({ reportId: "RPT_Extrato_artigos", context: { company: "", dateText: "" }, source: { kind: "query", from: "20260230000000", to: "", articleFrom: "A", articleTo: "Z", openingCutoff: "" } }).success).toBe(false);
});
