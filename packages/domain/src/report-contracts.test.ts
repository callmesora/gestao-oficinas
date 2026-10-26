import { expect, it } from "vitest";
import { reportIntegerBound } from "./report-contracts";
import { reportRequestSchema } from "./reports";

const context = { company: "", dateText: "" };
const mechanic = { ParamDoMecanico: "0", ParamAoMecanico: "18446744073709551615", ParamDaData: "20261025000000", ParamAData: "20261025235959" };
const valid = (reportId: string, parameters: unknown) => reportRequestSchema.safeParse({ reportId, context, source: { kind: "query", parameters } }).success;

it("RULE-R24/25/26-022 exact numeric read bounds reject SQL casts/coercions without narrowing the source caller's range", () => {
  expect(reportIntegerBound("00018446744073709551615")).toBe(true);
  for (const value of ["18446744073709551616", "-1", "0.1", "1e2", "", " 1", "1;SELECT", "9".repeat(5000)]) expect(reportIntegerBound(value), value.slice(0, 30)).toBe(false);
  for (const reportId of ["RPT_Tempos_Ordem_Reparacao_Mecanico", "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo"]) {
    expect(valid(reportId, mechanic)).toBe(true);
    expect(valid(reportId, { ...mechanic, ParamDoMecanico: null })).toBe(true);
    expect(valid(reportId, { ...mechanic, ParamDoMecanico: "1.5" })).toBe(false);
    const missing: Record<string, unknown> = { ...mechanic }; delete missing.ParamAData;
    expect(valid(reportId, missing)).toBe(false);
    expect(valid(reportId, { ...mechanic, sql: "SELECT *" })).toBe(false);
    expect(valid(reportId, { ...mechanic, ParamAData: "20260230000000" })).toBe(false);
  }
});

it("RULE-R01-024 four query predicates retain the fifth caller argument and explicit NULL differs from missing", () => {
  const reportId = "RPT_Consumo_Material_Descriminado_Ordens", parameters = { ParamDoArtigo: "", ParamAoArtigo: "", ParamDaData: null, ParamAData: null, ParamDescricao: "unused %_" };
  expect(valid(reportId, parameters)).toBe(true);
  expect(valid(reportId, { ...parameters, ParamDescricao: null })).toBe(true);
  const missing: Record<string, unknown> = { ...parameters }; delete missing.ParamDescricao;
  expect(valid(reportId, missing)).toBe(false);
  expect(valid(reportId, { ...parameters, ParamDoArtigo: ["A"] })).toBe(false);
});

it("RULE-R21/22-022 explicit NULL, empty state selection and literal empty date survive as distinct inputs", () => {
  for (const reportId of ["RPT_Ordens_Reparacao_DataEntrega", "RPT_Ordens_Reparacao_DataPag"]) {
    for (const ParamEstados of [null, [], [""], ["R", "S"]]) expect(valid(reportId, { ParamDaData: "", ParamAData: "", ParamEstados })).toBe(true);
    expect(valid(reportId, { ParamDaData: null, ParamAData: null, ParamEstados: null })).toBe(true);
    expect(valid(reportId, { ParamDaData: "20261025", ParamAData: "20261025", ParamEstados: "R;" })).toBe(false);
    expect(valid(reportId, { ParamDaData: "20261025000000", ParamAData: "20261025", ParamEstados: [] })).toBe(false);
  }
});

it("RULE-R10..28 data source contracts reject substituting live tables, embedded queries, files and programmatic order reads", () => {
  for (const [reportId, source] of [["RPT_List_Clientes", { kind: "file" }], ["RPT_inventario", { kind: "embedded-query" }], ["RPT_Servico_Avaria", { kind: "programmatic", orderNumber: "1' OR TRUE" }], ["RPT_Materiais", { kind: "query", parameters: {} }]]) expect(reportRequestSchema.safeParse({ reportId, context, source }).success).toBe(false);
});
