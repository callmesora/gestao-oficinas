import { z } from "zod";

// Verified schema: postos.Codigo is an unsigned byte; the form's 99 entry mask is not its stored range.
export const postoValuesSchema = z.strictObject({
  Codigo: z.number().int().min(0).max(255).nullable(),
  Descricao: z.string().max(50).nullable(),
  terminal: z.string().max(3).nullable(),
});
export const postoIdentitySchema = z.strictObject({
  id: z.string().regex(/^[1-9][0-9]*$/).max(19).refine(value => value.length < 19 || value <= "9223372036854775807"),
});
export const postoSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: postoValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: postoIdentitySchema.shape.id, values: postoValuesSchema }),
]);
export const postoListSchema = z.strictObject({ sort: z.enum(["Codigo", "Descricao"]).optional(), descending: z.boolean().optional() });
export type PostoValues = z.infer<typeof postoValuesSchema>;
export type PostoSave = z.infer<typeof postoSaveSchema>;
export type PostoList = z.infer<typeof postoListSchema>;
export type Posto = PostoValues & { id: string; teste: string | null };
export type PostoListResult = { kind: "loaded"; postos: Posto[] } | { kind: "invalid" | "failed" };
export type PostoSaveResult = { kind: "saved"; posto: Posto } | { kind: "required" | "duplicate"; message: string } | { kind: "invalid" | "missing" | "failed" };
export type PostoDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" };

// Verified order/text: legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:38–45.
// ADR-016: nullable required values take the same safe required path; no silent text trimming.
export function postoRequiredMessage(values: PostoValues): string | null {
  if (values.Codigo === null || values.Codigo <= 0) return "Indique um código";
  return values.Descricao === "" || values.Descricao === null ? "Indique uma descrição" : null;
}

// Verified: WIN_Form_postos.wdw:53/63 and the numeric unique Codigo schema key.
export function postoDuplicateMessage(code: number): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}

// Assumed explicit entry default ADR-016; preserve untouched nullable bindings outside this conversion.
export function postoCode(text: string): number | undefined {
  if (text === "") return 0;
  if (!/^[0-9]{1,3}$/.test(text)) return undefined;
  const value = Number(text);
  return value <= 255 ? value : undefined;
}
