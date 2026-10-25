import { z } from "zod";

export const unitValuesSchema = z.strictObject({ Codigo: z.string().max(3), Descricao: z.string().max(50).nullable() });
export const unitIdentitySchema = z.strictObject({ id: z.string().regex(/^[1-9][0-9]*$/).max(19) });
export const unitSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: unitValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: unitIdentitySchema.shape.id, values: unitValuesSchema }),
]);
export const unitListSchema = z.strictObject({ sort: z.enum(["Codigo", "Descricao", "unidadesID"]).optional(), descending: z.boolean().optional() });
export type UnitValues = z.infer<typeof unitValuesSchema>;
export type UnitSave = z.infer<typeof unitSaveSchema>;
export type UnitList = z.infer<typeof unitListSchema>;
export type Unit = Omit<UnitValues, "Codigo"> & { Codigo: string | null; id: string; unidadesID: string | null };
export type UnitListResult = { kind: "loaded"; units: Unit[] } | { kind: "invalid" | "failed" };
export type UnitSaveResult = { kind: "saved"; unit: Unit } | { kind: "required" | "duplicate"; message: string } | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
export type UnitDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" } | { kind: "associated"; message: string };

// Verified: WIN_Form_unidades.wdw:34–38; description is not required, no trim or numeric conversion.
export function unitRequiredMessage(values: UnitValues): string | null {
  return values.Codigo === "" ? "Falta indicar o código" : null;
}

// Verified: WIN_Form_unidades.wdw:45/55 and schema unique Codigo key.
export function unitDuplicateMessage(code: string): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}
