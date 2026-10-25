import { z } from "zod";

const identity = z.string().regex(/^[1-9][0-9]*(?![\s\S])/).max(19).refine(value => value.length < 19 || value.length === 19 && value <= "9223372036854775807");
const unsigned64 = z.string().regex(/^[0-9]+(?![\s\S])/).max(20).refine(value => value.length < 20 || value.length === 20 && value <= "18446744073709551615");
// ADR-002: the source masks constrain deliberate entry; imported values stay lossless.
const decimal = z.string().regex(/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?![\s\S])/).nullable();
const mechanicCode = z.number().int().min(0).max(255).nullable();
export const repairMaterialLineSchema = z.strictObject({
  id: identity.nullable(), data_hora: z.string().nullable(), mecanico: mechanicCode,
  artigo: z.string().nullable(), descricao_artigo: z.string().nullable(),
  quantidade: decimal, preco: decimal, lancado: z.boolean().nullable(),
});
export const repairMaterialsReadSchema = z.union([z.strictObject({ orderId: identity }), z.strictObject({ numero: unsigned64 })]);
export const repairMaterialsListSchema = z.strictObject({ restricted: z.boolean(), mechanic: mechanicCode.optional() });
export const repairMaterialsArticleSchema = z.strictObject({ value: z.string(), barcodeFirst: z.boolean() });
export const repairMaterialsMechanicSchema = z.strictObject({ code: mechanicCode, password: z.string() });
export const repairMaterialsSaveSchema = z.strictObject({
  orderId: identity, numero: unsigned64, baseline: z.string(), state: z.string().nullable(),
  rows: z.array(repairMaterialLineSchema), proofs: z.array(repairMaterialsMechanicSchema),
});
export type RepairMaterialLine = z.infer<typeof repairMaterialLineSchema> & { mechanicDescription?: string | null };
export type RepairMaterialsSave = z.infer<typeof repairMaterialsSaveSchema>;
export type RepairMaterialProof = z.infer<typeof repairMaterialsMechanicSchema>;
export type RepairMaterialsOrder = { id: string; orderId: string; numero: string | null; matricula: string | null; marcamodelo: string | null; reparacao_mecanico: number | null };
export type RepairMaterialsMechanic = { Codigo: number | null; Descricao: string | null; inativo: boolean | null };
export type RepairMaterialsListResult = { kind: "loaded"; orders: RepairMaterialsOrder[]; mechanics: RepairMaterialsMechanic[]; timer: string | null } | { kind: "invalid" | "failed" };
export type RepairMaterialsDocument = { orderId: string; numero: string; matricula: string | null; marcamodelo: string | null; state: string | null; mechanic: RepairMaterialsMechanic | null; baseline: string; rows: RepairMaterialLine[] };
export type RepairMaterialsReadResult = { kind: "loaded"; document: RepairMaterialsDocument } | { kind: "invalid" | "missing" | "failed" | "inUse" };
export type RepairMaterialsArticle = { Codigo: string | null; Descricao: string | null; preco: string | null };
export type RepairMaterialsArticleResult = { kind: "loaded"; article: RepairMaterialsArticle } | { kind: "invalid" | "missing" | "failed" };
export type RepairMaterialsMechanicResult = { kind: "authenticated" | "cancelled"; mechanic: RepairMaterialsMechanic } | { kind: "inactive" | "incorrect" | "missing" | "invalid" | "failed" };
export type RepairMaterialsSaveResult = { kind: "saved" } | { kind: "invalid" | "missing" | "failed" | "stale" | "inUse" | "launched" | "inactive" | "incorrect" };

/** Verified WIN_Material_reparacao_form.wdw:971–979/1003–1012/1088–1127. */
export function repairMaterialEditMessage(launched: boolean | null, deleting = false): string | null {
  return launched === true ? deleting ? "Artigo já lançado, não pode ser eliminado" : "Artigo já lançado, não pode ser alterado" : null;
}
