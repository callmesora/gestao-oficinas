import { z } from "zod";

// Verified: documentos XDD/dossier. Radio choices do not narrow the stored unsigned byte.
export const documentTypeValuesSchema = z.strictObject({
  Codigo: z.string().max(3),
  Descricao: z.string().max(50).nullable(),
  stock: z.number().int().min(0).max(255).nullable(),
  obriga_macanico: z.boolean().nullable(),
});
export const documentTypeIdentitySchema = z.strictObject({
  id: z.string().regex(/^[1-9][0-9]*$/).max(19).refine(value => value.length < 19 || value <= "9223372036854775807"),
});
export const documentTypeSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: documentTypeValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: documentTypeIdentitySchema.shape.id, values: documentTypeValuesSchema }),
]);
export const documentTypeListSchema = z.strictObject({ sort: z.enum(["Codigo", "Descricao", "stock", "obriga_macanico", "documentosID"]).optional(), descending: z.boolean().optional() });
export type DocumentTypeValues = z.infer<typeof documentTypeValuesSchema>;
export type DocumentTypeSave = z.infer<typeof documentTypeSaveSchema>;
export type DocumentTypeList = z.infer<typeof documentTypeListSchema>;
export type DocumentType = Omit<DocumentTypeValues, "Codigo"> & { Codigo: string | null; id: string; documentosID: string | null };
export type DocumentTypeListResult = { kind: "loaded"; documentTypes: DocumentType[] } | { kind: "invalid" | "failed" };
export type DocumentTypeSaveResult = { kind: "saved"; documentType: DocumentType } | { kind: "required" | "duplicate"; message: string } | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
export type DocumentTypeDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" } | { kind: "associated"; message: string };

// Verified: WIN_Form_documentos.wdw:38–41; no description/mechanic requirement or trimming.
export function documentTypeRequiredMessage(values: DocumentTypeValues): string | null {
  return values.Codigo === "" ? "Falta indicar o código" : null;
}
// Verified: WIN_Form_documentos.wdw:49/59 and the source unique Codigo key.
export function documentTypeDuplicateMessage(code: string): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}
// Verified: WIN_Table_documentos.wdw:167–172.
export function documentTypeStockLabel(stock: number | null): string {
  switch (stock) {
    case 1: return "Entrada";
    case 2: return "Saída";
    // ADR-012/U-CFEE768B-02: raw unknown/NULL display/search fallback is a reversible target default.
    default: return stock === null ? "" : String(stock);
  }
}
