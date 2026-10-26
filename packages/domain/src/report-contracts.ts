import { isDateOnlyBound, isDateTimeBound } from "./date-time";

type ParameterKind = "text" | "date" | "datetime" | "uint64" | "states";
type Parameters = Record<string, string | null | string[]>;
const article = { ParamDoArtigo: "text", ParamAoArtigo: "text", ParamDaData: "datetime", ParamAData: "datetime", ParamDescricao: "text" } as const;
const vehicleConsumption = { ParamDaData: "datetime", ParamAData: "datetime", ParamDoArtigo: "text", ParamAoArtigo: "text", ParamDaViatura: "text", ParamAViatura: "text" } as const;
const sales = { ParamDaData: "date", ParamAData: "date", ParamEstados: "states" } as const;
const mechanic = { ParamDoMecanico: "uint64", ParamAoMecanico: "uint64", ParamDaData: "datetime", ParamAData: "datetime" } as const;

/** Source caller signatures in docs/mapping/reports.md and the individual report specs.
 * ADR005: every preview initializes its entire contract; NULL omits a predicate,
 * whereas an empty string is its literal bound. No inherited query-buffer state.
 * Orders-only's fifth description argument is retained but never becomes a SQL filter.
 */
const queryContracts: Record<string, Readonly<Record<string, ParameterKind>>> = {
  RPT_Consumo_Material_Descriminado_Ordens: article,
  RPT_Consumo_Material_Descriminado_Saidas: article,
  RPT_Consumo_Material_Descriminado_ordens_saidas: article,
  RPT_Consumo_Material_Resumo_Saidas: article,
  RPT_Consumo_Material_Resumo_ordem_saidas: article,
  RPT_Consumo_Material_Resumo_ordens: article,
  RPT_Consumo_Material_Viatura_Descriminado: vehicleConsumption,
  RPT_Consumo_Material_Viatura_Resumo: vehicleConsumption,
  RPT_Ordens_Reparacao_DataEntrega: sales,
  RPT_Ordens_Reparacao_DataPag: sales,
  RPT_Tempos_Ordem_Reparacao: { ParamDaOrdem: "uint64", ParamAOrdem: "uint64", ParamDaData: "datetime", ParamAData: "datetime" },
  RPT_Tempos_Ordem_Reparacao_Mecanico: mechanic,
  RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo: mechanic,
  RPT_Tempos_Ordem_Reparacao_viatura: { ParamDaData: "datetime", ParamAData: "datetime", ParamDaViatura: "text", ParamAViatura: "text" },
};

/** ADR005 read predicates retain the caller's broad uint64 range, including mechanic
 * upper bounds beyond its byte storage. Validate without converting/rounding the text.
 */
export function reportIntegerBound(value: string): boolean {
  if (!/^[0-9]+$/.test(value)) return false;
  const digits = value.replace(/^0+/, "") || "0";
  return digits.length < 20 || digits.length === 20 && digits <= "18446744073709551615";
}

/** RULE-R01..R28 data-contract defaults: validate before opening a database connection. */
export function reportParametersValid(reportId: string, parameters: Parameters): boolean {
  const contract = queryContracts[reportId];
  if (!contract || Object.keys(parameters).length !== Object.keys(contract).length) return false;
  return Object.entries(contract).every(([name, kind]) => {
    if (!Object.hasOwn(parameters, name)) return false;
    const value = parameters[name];
    if (value === null) return true;
    if (kind === "states") return Array.isArray(value) && value.every(code => typeof code === "string");
    if (typeof value !== "string") return false;
    return kind === "date" ? isDateOnlyBound(value) : kind === "datetime" ? isDateTimeBound(value) : kind === "uint64" ? reportIntegerBound(value) : true;
  });
}
