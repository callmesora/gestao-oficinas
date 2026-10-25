import { z } from "zod";

// Verified: Viaturas schema; ADR-002 keeps unsigned 8-byte identifiers exact.
const unsigned64 = z.string().refine(value => /^(0|[1-9][0-9]{0,19})$/.test(value) && BigInt(value) <= 18446744073709551615n);
export const vehicleValuesSchema = z.strictObject({
  matricula: z.string().max(15), Cliente: unsigned64.nullable(),
  marca: z.string().max(50).nullable(), modelo: z.string().max(50).nullable(),
  Ano: z.number().int().min(0).max(65535).nullable(), mes: z.number().int().min(0).max(255).nullable(),
});
export const vehicleSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: vehicleValuesSchema }),
  z.strictObject({ mode: z.literal("update"), originalRegistration: z.string().max(15), values: vehicleValuesSchema }),
]);
export const vehicleFilterSchema = z.strictObject({
  mode: z.enum(["todos", "matricula", "cliente", "marca_modelo"]), term: z.string(),
  sort: z.enum(["matricula", "Descricao", "marca", "modelo", "Ano", "mes"]).optional(),
  descending: z.boolean().optional(),
});
export type VehicleValues = z.infer<typeof vehicleValuesSchema>;
export type VehicleSave = z.infer<typeof vehicleSaveSchema>;
export type VehicleFilter = z.infer<typeof vehicleFilterSchema>;
export type Vehicle = Omit<VehicleValues, "matricula"> & { matricula: string | null; id: string; ViaturasID: string | null };
export type VehicleListRow = Vehicle & { Descricao: string | null };
export type VehicleListResult = { kind: "loaded"; vehicles: VehicleListRow[] } | { kind: "invalid" | "failed" };
export type VehicleLookupResult = { kind: "loaded"; vehicle: Vehicle } | { kind: "missing" | "invalid" | "failed" };
export type VehicleSaveResult = { kind: "saved"; vehicles: Vehicle[] }
  | { kind: "required" | "duplicate"; message: string }
  | { kind: "invalid" | "missing" | "registrationLocked" | "failed" };
export type VehicleDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" }
  | { kind: "associated"; message: string };

// Verified: WIN_Form_Viaturas.wdw:34–51; preserve order and exact empty comparison.
export function vehicleRequiredMessage(values: VehicleValues): string | null {
  if (values.matricula === "") return "Falta indicar a matrícula";
  if (values.Cliente === null || values.Cliente === "0") return "Falta indicar o cliente";
  if (values.marca === "" || values.marca === null) return "Falta indicar a marca";
  if (values.modelo === "" || values.modelo === null) return "Falta indicar o modelo";
  return null;
}

// Verified source message shape: WIN_Form_Viaturas.wdw:57–61; schema item matricula.
export function vehicleDuplicateMessage(registration: string): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: matricula\nValor do campo duplicado: ${registration}`;
}

// WIN_Form_Viaturas.wdw:50; existing ADR-010 pt-PT target locale default.
export function vehicleUppercase(registration: string): string {
  return registration.toLocaleUpperCase("pt-PT");
}
