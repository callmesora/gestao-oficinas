import { expect, it } from "vitest";
import { laborReportDispatch, materialReportDispatch, reportPickerRange, salesReportDispatch } from "./report-filters";

const context = { company: "", dateText: "25/10/2026" };
const material = { from: "20261001", to: "20261025", articleFrom: " A ", articleTo: "zzzzzzzzzz", description: "ação  ", vehicleFrom: "AA", vehicleTo: "ZZ", orders: true, stockOut: false };

it("SRC-9079af9bc2 selects all six document combinations and retains four/five caller arguments", () => {
  for (const [mode, suffix] of [["resumo", "Resumo"], ["descriminado", "Descriminado"]] as const) {
    for (const [orders, stockOut, report] of [[true, false, mode === "resumo" ? "ordens" : "Ordens"], [false, true, "Saidas"], [true, true, mode === "resumo" ? "ordem_saidas" : "ordens_saidas"]] as const) {
      const result = materialReportDispatch(mode, { ...material, orders, stockOut }, context);
      expect(result.kind).toBe("ready"); if (result.kind !== "ready") continue;
      expect(result.request.reportId).toBe(`RPT_Consumo_Material_${suffix}_${report}`);
      expect(result.positionalArguments).toEqual([" A ", "zzzzzzzzzz", "20261001000000", "20261025235959", ...(mode === "resumo" ? [] : ["ação  "])]);
      expect(result.request.source).toEqual({ kind: "query", parameters: { ParamDoArtigo: " A ", ParamAoArtigo: "zzzzzzzzzz", ParamDaData: "20261001000000", ParamAData: "20261025235959", ParamDescricao: mode === "resumo" ? null : "ação  " } });
    }
    expect(materialReportDispatch(mode, { ...material, orders: false, stockOut: false }, context)).toEqual({ kind: "no-report" });
  }
});
it("SRC-b160751af6 vehicle material calls ignore document checkboxes and put dates before article/vehicle bounds", () => {
  for (const mode of ["resumo_viatura", "descriminado_viatura"] as const) {
    const result = materialReportDispatch(mode, { ...material, orders: false, stockOut: false }, context);
    expect(result.kind).toBe("ready"); if (result.kind !== "ready") continue;
    expect(result.request.reportId).toBe(mode === "resumo_viatura" ? "RPT_Consumo_Material_Viatura_Resumo" : "RPT_Consumo_Material_Viatura_Descriminado");
    expect(result.positionalArguments).toEqual(["20261001000000", "20261025235959", " A ", "zzzzzzzzzz", "AA", "ZZ"]);
    expect(result.request.source).toEqual({ kind: "query", parameters: { ParamDaData: "20261001000000", ParamAData: "20261025235959", ParamDoArtigo: " A ", ParamAoArtigo: "zzzzzzzzzz", ParamDaViatura: "AA", ParamAViatura: "ZZ" } });
  }
});
it("WIN_Filtro_Mapas_Tempos.wdw:266-291 selects four report branches with exact numeric strings and source argument order", () => {
  const cases = [
    ["ordem_reparacao", "RPT_Tempos_Ordem_Reparacao", "ParamDaOrdem", "ParamAOrdem"],
    ["mecanico_descriminado", "RPT_Tempos_Ordem_Reparacao_Mecanico", "ParamDoMecanico", "ParamAoMecanico"],
    ["mecanico_resumo", "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo", "ParamDoMecanico", "ParamAoMecanico"],
    ["viatura", "RPT_Tempos_Ordem_Reparacao_viatura", "ParamDaViatura", "ParamAViatura"],
  ] as const;
  for (const [mode, id, lower, upper] of cases) {
    const rangeFrom = mode === "viatura" ? " AA " : "9007199254740993", rangeTo = mode === "viatura" ? "ZZ" : "18446744073709551615";
    const result = laborReportDispatch(mode, { from: "20261025", to: "20261001", rangeFrom, rangeTo }, context);
    expect(result.kind).toBe("ready"); if (result.kind !== "ready") continue;
    expect(result.request).toEqual({ reportId: id, context, source: { kind: "query", parameters: { [lower]: rangeFrom, [upper]: rangeTo, ParamDaData: "20261025000000", ParamAData: "20261001235959" } } });
    expect(result.positionalArguments).toEqual(mode === "viatura" ? ["20261025000000", "20261001235959", rangeFrom, rangeTo] : [rangeFrom, rangeTo, "20261025000000", "20261001235959"]);
  }
});
it("WIN_Mapa_Vendas.wdw:429-442 retains Date8, duplicate checked codes/order and the trailing semicolon", () => {
  const states = [{ id: "1", Codigo: "R", Descricao: null, checked: true }, { id: "2", Codigo: "N", Descricao: "Não", checked: false }, { id: "3", Codigo: "R", Descricao: "Outro", checked: true }];
  for (const mode of ["vendas", "recebimentos"] as const) {
    const result = salesReportDispatch(mode, { from: "20261001", to: "20261025", states }, context);
    expect(result.kind).toBe("ready"); if (result.kind !== "ready") continue;
    expect(result.request.reportId).toBe(mode === "vendas" ? "RPT_Ordens_Reparacao_DataEntrega" : "RPT_Ordens_Reparacao_DataPag");
    expect(result.positionalArguments).toEqual(["20261001", "20261025", "R;R;"]);
    expect(result.request.source).toEqual({ kind: "query", parameters: { ParamDaData: "20261001", ParamAData: "20261025", ParamEstados: ["R", "R"] } });
    const empty = salesReportDispatch(mode, { from: "20261001", to: "20261025", states: [] }, context);
    expect(empty.kind).toBe("ready"); if (empty.kind === "ready") expect(empty.request.source).toEqual({ kind: "query", parameters: { ParamDaData: "20261001", ParamAData: "20261025", ParamEstados: [] } });
  }
});
it("SRC-6c92aa7fbd/SRC-1c6b73c15d keeps the lower-picker copy behavior even when cancellation returns the origin", () => {
  expect(reportPickerRange("A", "Z", "A", true)).toEqual({ from: "A", to: "A" });
  expect(reportPickerRange("", "Z", "", true)).toEqual({ from: "", to: "Z" });
  expect(reportPickerRange("A", "Z", "B", false)).toEqual({ from: "A", to: "B" });
  expect(reportPickerRange("1", "9", "0", true, true)).toEqual({ from: "0", to: "9" });
  expect(reportPickerRange("1", "9", "7", true, true)).toEqual({ from: "7", to: "7" });
});
