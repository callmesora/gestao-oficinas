import { z } from "zod";

export const descriptiveStateValuesSchema = z.strictObject({ Codigo: z.string().max(3), Descricao: z.string().max(100).nullable() });
export const descriptiveStateIdentitySchema = z.strictObject({ id: z.string().regex(/^[1-9][0-9]*$/).max(19) });
export const descriptiveStateSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: descriptiveStateValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: descriptiveStateIdentitySchema.shape.id, values: descriptiveStateValuesSchema }),
]);
export const descriptiveStateListSchema = z.strictObject({ sort: z.enum(["Codigo", "Descricao", "estados_descritivosID"]).optional(), descending: z.boolean().optional() });
export type DescriptiveStateValues = z.infer<typeof descriptiveStateValuesSchema>;
export type DescriptiveStateSave = z.infer<typeof descriptiveStateSaveSchema>;
export type DescriptiveStateList = z.infer<typeof descriptiveStateListSchema>;
export type DescriptiveState = Omit<DescriptiveStateValues, "Codigo"> & { Codigo: string | null; id: string; estados_descritivosID: string | null };
export type DescriptiveStateListResult = { kind: "loaded"; descriptiveStates: DescriptiveState[] } | { kind: "invalid" | "failed" };
export type DescriptiveStateSaveResult = { kind: "saved"; descriptiveState: DescriptiveState } | { kind: "required" | "duplicate"; message: string } | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
export type DescriptiveStateDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" };

// Verified: legacy/GestaoOficinas_TesteIA/WIN_Form_estados_descritivos.wdw:38–41; description is not required, no trim or numeric conversion.
export function descriptiveStateRequiredMessage(values: DescriptiveStateValues): string | null {
  return values.Codigo === "" ? "Falta indicar o código" : null;
}

// Verified: legacy/GestaoOficinas_TesteIA/WIN_Form_estados_descritivos.wdw:49/59 and schema unique Codigo key.
export function descriptiveStateDuplicateMessage(code: string): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}
