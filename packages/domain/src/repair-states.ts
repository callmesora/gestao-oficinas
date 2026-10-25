import { z } from "zod";

// Verified: estados_reparacao XDD/dossier; input masks never narrow stored byte/unsigned32 values.
export const repairStateValuesSchema = z.strictObject({
  Codigo: z.string().max(3),
  Descricao: z.string().max(50).nullable(),
  tipo: z.number().int().min(0).max(255).nullable(),
  Cor: z.number().int().min(0).max(4294967295).nullable(),
  lancar_defa: z.boolean().nullable(),
  lancar_material: z.boolean().nullable(),
  confirmacao: z.boolean().nullable(),
  pedir_data_entrega: z.boolean().nullable(),
  pedir_data_pag: z.boolean().nullable(),
});
export const repairStateIdentitySchema = z.strictObject({
  id: z.string().regex(/^[1-9][0-9]*$/).max(19).refine(value => value.length < 19 || value <= "9223372036854775807"),
});
export const repairStateSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: repairStateValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: repairStateIdentitySchema.shape.id, values: repairStateValuesSchema }),
]);
export const repairStateListSchema = z.strictObject({ sort: z.enum(["Codigo", "Descricao", "tipo", "estados_reparacaoID"]).optional(), descending: z.boolean().optional() });
export type RepairStateValues = z.infer<typeof repairStateValuesSchema>;
export type RepairStateSave = z.infer<typeof repairStateSaveSchema>;
export type RepairStateList = z.infer<typeof repairStateListSchema>;
export type RepairState = Omit<RepairStateValues, "Codigo"> & { Codigo: string | null; id: string; estados_reparacaoID: string | null };
export type RepairStateListResult = { kind: "loaded"; repairStates: RepairState[] } | { kind: "invalid" | "failed" };
export type RepairStateSaveResult = { kind: "saved"; repairState: RepairState } | { kind: "required" | "duplicate"; message: string } | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
export type RepairStateDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" } | { kind: "associated"; message: string };

// Verified: WIN_Form_estados_reparacao.wdw:38–41; optional description, exact nonempty text code.
export function repairStateRequiredMessage(values: RepairStateValues): string | null {
  return values.Codigo === "" ? "Falta indicar o código" : null;
}
// Verified: WIN_Form_estados_reparacao.wdw:49/59 and unique source Codigo key.
export function repairStateDuplicateMessage(code: string): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}

// Verified: WIN_Table_estados_reparacao.wdw:129–146; preserve its spelling separately from form options.
export function repairStateTypeLabel(tipo: number | null): string {
  switch (tipo) {
    case 1: return "Recepçao";
    case 2: return "Aguardar início reparação";
    case 3: return "Em reparação";
    case 4: return "Teste";
    case 5: return "Lavagem";
    case 6: return "Reparação suspensa";
    case 7: return "Reparação finalizada";
    case 8: return "Orçamento";
    // ADR-012/U02: raw unknown/NULL fallback is a reversible target display/search default.
    default: return tipo === null ? "" : String(tipo);
  }
}
