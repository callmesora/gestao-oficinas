import { z } from "zod";

// Verified: mecanicos schema; the numeric 99 entry mask does not narrow the stored unsigned byte.
export const mechanicValuesSchema = z.strictObject({
  Codigo: z.number().int().min(0).max(255).nullable(),
  Descricao: z.string().max(100).nullable(),
  palavra_passe: z.string().max(15).nullable(),
  inativo: z.boolean().nullable(),
});
export const mechanicIdentitySchema = z.strictObject({
  id: z.string().regex(/^[1-9][0-9]*$/).max(19).refine(value => value.length < 19 || value <= "9223372036854775807"),
});
export const mechanicSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: mechanicValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: mechanicIdentitySchema.shape.id, values: mechanicValuesSchema }),
]);
export const mechanicListSchema = z.strictObject({ sort: z.enum(["Codigo", "Descricao", "inativo"]).optional(), descending: z.boolean().optional() });
export type MechanicValues = z.infer<typeof mechanicValuesSchema>;
export type MechanicSave = z.infer<typeof mechanicSaveSchema>;
export type MechanicList = z.infer<typeof mechanicListSchema>;
export type MechanicListRow = Omit<MechanicValues, "palavra_passe"> & { id: string };
export type MechanicRecord = MechanicListRow & { mecanicosID: string | null; palavra_passe: string | null };
export type MechanicListResult = { kind: "loaded"; mechanics: MechanicListRow[] } | { kind: "invalid" | "failed" };
export type MechanicReadResult = { kind: "loaded"; mechanic: MechanicRecord } | { kind: "invalid" | "missing" | "failed" };
export type MechanicSaveResult = { kind: "saved"; mechanic: MechanicListRow } | { kind: "required" | "duplicate"; message: string } | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
export type MechanicDeleteResult = { kind: "deleted" | "invalid" | "missing" | "failed" };

// Verified text/order: legacy/GestaoOficinas_TesteIA/WIN_Form_mecanicos.wdw:38–49.
// ADR-008: numeric empty-string comparison uses the explicit assumed zero/NULL required default.
export function mechanicRequiredMessage(values: MechanicValues): string | null {
  if (values.Codigo === null || values.Codigo === 0) return "Falta indicar o código";
  if (values.Descricao === null || values.Descricao === "") return "Falta preencher a descrição";
  return values.palavra_passe === null || values.palavra_passe === "" ? "Falta indicar a palavra-passe" : null;
}

// Verified: WIN_Form_mecanicos.wdw:57/67; numeric unique Codigo key.
export function mechanicDuplicateMessage(code: number): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}

// ADR-008 entry conversion default; preserve untouched nullable imported bindings outside this conversion.
export function mechanicCode(text: string): number | undefined {
  if (text === "") return 0;
  if (!/^[0-9]{1,3}$/.test(text)) return undefined;
  const value = Number(text);
  return value <= 255 ? value : undefined;
}
