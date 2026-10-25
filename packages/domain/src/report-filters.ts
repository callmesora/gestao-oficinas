import { z } from "zod";
import { dateCalendarValue } from "./date-entry";
import { isDateOnlyBound } from "./date-time";
import type { FamilyReportRequest, ReportContext } from "./reports";

export const materialReportModes = ["resumo", "descriminado", "resumo_viatura", "descriminado_viatura"] as const;
export const laborReportModes = ["ordem_reparacao", "mecanico_descriminado", "mecanico_resumo", "viatura"] as const;
export const salesReportModeSchema = z.enum(["vendas", "recebimentos"]);
export const salesReportStatesSchema = z.strictObject({ mode: salesReportModeSchema });
export type MaterialReportMode = typeof materialReportModes[number];
export type LaborReportMode = typeof laborReportModes[number];
export type SalesReportMode = z.infer<typeof salesReportModeSchema>;
export type SalesReportState = { id: string; Codigo: string | null; Descricao: string | null; checked: boolean };
export type SalesReportStatesResult = { kind: "loaded"; states: SalesReportState[] } | { kind: "invalid" | "failed" };
export type ReportFilterDispatch = { kind: "ready"; request: FamilyReportRequest; positionalArguments: (string | null)[] }
  | { kind: "no-report" | "invalid-date" | "invalid-number" | "unresolved" };

// Verified WIN_Filtro_Mapas_Artigos.wdw:1060-1081 / WIN_Filtro_Mapas_Tempos.wdw:673-691.
export const materialReportTitles: Record<MaterialReportMode, string> = {
  resumo: "Consumo Material (Resumo)", descriminado: "Consumo Material (Descriminado)",
  resumo_viatura: "Consumo Material (Resumo por viatura)", descriminado_viatura: "Consumo Material (Descriminado por viatura)",
};
export const laborReportTitles: Record<LaborReportMode, string> = {
  ordem_reparacao: "Tempos por ordem reparação (Descriminado)", mecanico_descriminado: "Tempos por mecânico (Descriminado)",
  mecanico_resumo: "Tempos por mecânico (Resumo)", viatura: "Tempos por viatura (Descriminado)",
};

/** Verified: WIN_Filtro_Mapas_Artigos.wdw:160-325 / WIN_Filtro_Mapas_Tempos.wdw:151-245.
 * A cancelled picker returns its origin; the caller STILL copies a nonempty lower result to the upper field. */
export function reportPickerRange(from: string, to: string, selected: string, lower: boolean, numeric = false) {
  return lower ? { from: selected, to: selected !== "" && (!numeric || !/^0+$/.test(selected)) ? selected : to } : { from, to: selected };
}

function dayBounds(from: string | null, to: string | null): [string, string] | null {
  // UNRESOLVED U-WCD4890-05 / U-WA6D3FA-05: no evidence for blank/zero Date→DateTime coercion.
  if (!dateCalendarValue(from) || !dateCalendarValue(to)) return null;
  return [`${from}000000`, `${to}235959`];
}

/** Verified: WIN_Filtro_Mapas_Artigos.wdw:348-434; exact branch and source positional order. */
export function materialReportDispatch(mode: MaterialReportMode, input: {
  from: string | null; to: string | null; articleFrom: string; articleTo: string; description: string;
  orders: boolean; stockOut: boolean; vehicleFrom: string; vehicleTo: string;
}, context: ReportContext): ReportFilterDispatch {
  const vehicle = mode.endsWith("viatura");
  if (!vehicle && !input.orders && !input.stockOut) return { kind: "no-report" };
  const dates = dayBounds(input.from, input.to);
  if (!dates) return { kind: "unresolved" };
  const [from, to] = dates;
  if (vehicle) return { kind: "ready", request: { reportId: mode === "resumo_viatura" ? "RPT_Consumo_Material_Viatura_Resumo" : "RPT_Consumo_Material_Viatura_Descriminado", context,
    source: { kind: "query", parameters: { ParamDaData: from, ParamAData: to, ParamDoArtigo: input.articleFrom, ParamAoArtigo: input.articleTo, ParamDaViatura: input.vehicleFrom, ParamAViatura: input.vehicleTo } } },
    positionalArguments: [from, to, input.articleFrom, input.articleTo, input.vehicleFrom, input.vehicleTo] };
  const summary = mode === "resumo";
  const reportId = summary
    ? input.orders ? input.stockOut ? "RPT_Consumo_Material_Resumo_ordem_saidas" : "RPT_Consumo_Material_Resumo_ordens" : "RPT_Consumo_Material_Resumo_Saidas"
    : input.orders ? input.stockOut ? "RPT_Consumo_Material_Descriminado_ordens_saidas" : "RPT_Consumo_Material_Descriminado_Ordens" : "RPT_Consumo_Material_Descriminado_Saidas";
  // U-WCD4890-05: summary caller has FOUR arguments; null explicitly retains the omitted description parameter.
  return { kind: "ready", request: { reportId, context, source: { kind: "query", parameters: {
    ParamDoArtigo: input.articleFrom, ParamAoArtigo: input.articleTo, ParamDaData: from, ParamAData: to, ParamDescricao: summary ? null : input.description,
  } } }, positionalArguments: [input.articleFrom, input.articleTo, from, to, ...(summary ? [] : [input.description])] };
}

/** Verified: WIN_Filtro_Mapas_Tempos.wdw:266-291. Exact integer text never passes through Number. */
export function laborReportDispatch(mode: LaborReportMode, input: {
  from: string | null; to: string | null; rangeFrom: string; rangeTo: string;
}, context: ReportContext): ReportFilterDispatch {
  const dates = dayBounds(input.from, input.to);
  if (!dates) return { kind: "unresolved" };
  const vehicle = mode === "viatura";
  // UNRESOLVED U-WA6D3FA-05: reject malformed numeric edits instead of guessing native numeric coercion.
  if (!vehicle && ![input.rangeFrom, input.rangeTo].every(value => /^[0-9]+$/.test(value) && BigInt(value) <= 18446744073709551615n)) return { kind: "invalid-number" };
  const [from, to] = dates;
  const reportId = mode === "ordem_reparacao" ? "RPT_Tempos_Ordem_Reparacao" : mode === "viatura" ? "RPT_Tempos_Ordem_Reparacao_viatura"
    : mode === "mecanico_resumo" ? "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo" : "RPT_Tempos_Ordem_Reparacao_Mecanico";
  const range: Record<string, string> = vehicle ? { ParamDaViatura: input.rangeFrom, ParamAViatura: input.rangeTo } : mode === "ordem_reparacao" ? { ParamDaOrdem: input.rangeFrom, ParamAOrdem: input.rangeTo } : { ParamDoMecanico: input.rangeFrom, ParamAoMecanico: input.rangeTo };
  return { kind: "ready", request: { reportId, context, source: { kind: "query", parameters: { ...range, ParamDaData: from, ParamAData: to } } },
    positionalArguments: vehicle ? [from, to, input.rangeFrom, input.rangeTo] : [input.rangeFrom, input.rangeTo, from, to] };
}

/** Verified: WIN_Mapa_Vendas.wdw:429-442. Date8 values and trailing semicolon are caller evidence.
 * Empty selection stays an empty array, never becomes a disabled/unrestricted state predicate. */
export function salesReportDispatch(mode: SalesReportMode, input: { from: string | null; to: string | null; states: readonly SalesReportState[] }, context: ReportContext): ReportFilterDispatch {
  if (input.from === null || input.to === null || !isDateOnlyBound(input.from) || !isDateOnlyBound(input.to)) return { kind: "invalid-date" };
  const selected = input.states.filter(row => row.checked);
  // U-W7DB489-05: source NULL→string concatenation is unknown; preserve row and refuse lossy serialization.
  if (selected.some(row => row.Codigo === null)) return { kind: "unresolved" };
  const codes = selected.map(row => row.Codigo!);
  return { kind: "ready", request: { reportId: mode === "vendas" ? "RPT_Ordens_Reparacao_DataEntrega" : "RPT_Ordens_Reparacao_DataPag", context,
    source: { kind: "query", parameters: { ParamDaData: input.from, ParamAData: input.to, ParamEstados: codes } } },
    positionalArguments: [input.from, input.to, codes.map(code => `${code};`).join("")] };
}
