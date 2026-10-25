import { z } from "zod";

// Verified schema: Terminais unsigned one-byte position fields, not material quantities.
const position = z.number().int().min(0).max(255).nullable();
export const terminalValuesSchema = z.strictObject({
  Codigo: z.string().max(3), Descricao: z.string().max(30).nullable(),
  codbarras_inicio: position, codbarras_fim: position, quant_inicio: position, quant_fim: position,
  pasta_localizacao: z.string().max(200).nullable(), nome_ficheiro: z.string().max(50).nullable(),
});
export const terminalIdentitySchema = z.strictObject({ id: z.string().regex(/^[1-9][0-9]*$/).max(19) });
export const terminalSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: terminalValuesSchema }),
  z.strictObject({ mode: z.enum(["update", "after-folder-seek"]), id: terminalIdentitySchema.shape.id, values: terminalValuesSchema }),
]);
export const terminalListSchema = z.strictObject({ sort: z.enum(["Codigo", "Descricao"]).optional(), descending: z.boolean().optional() });
export const terminalFolderSchema = z.strictObject({ code: z.string().max(3) });
export type TerminalValues = z.infer<typeof terminalValuesSchema>;
export type TerminalSave = z.infer<typeof terminalSaveSchema>;
export type TerminalList = z.infer<typeof terminalListSchema>;
export type Terminal = Omit<TerminalValues, "Codigo"> & { Codigo: string | null; id: string };
export type TerminalListResult = { kind: "loaded"; terminals: Terminal[] } | { kind: "invalid" | "failed" };
export type TerminalSaveResult = { kind: "saved"; terminal: Terminal } | { kind: "required" | "duplicate"; message: string } | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
export type TerminalDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" };
export type TerminalFolderResult = { kind: "positioned"; terminal: Terminal | null } | { kind: "invalid" | "failed" };

// Verified: legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:38–45, ordered checks.
export function terminalRequiredMessage(values: TerminalValues): string | null {
  if (values.Codigo === "") return "Indique um código";
  return values.Descricao === "" || values.Descricao === null ? "Indique uma descrição" : null;
}
// Verified source: same form lines53/63; exact-key matching default is ADR-016.
export function terminalDuplicateMessage(code: string): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}
// Assumed explicit entry default ADR-016/U-CDF1C34F-01; no source numeric wrap/empty coercion claim.
export function terminalPosition(text: string): number | undefined {
  if (!/^[0-9]{1,3}$/.test(text)) return undefined;
  const value = Number(text);
  return value <= 255 ? value : undefined;
}
