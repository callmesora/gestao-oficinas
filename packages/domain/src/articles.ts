import { z } from "zod";

// Verified: artigos XDD/dossier. The price mask limits new entry, not storage precision.
// Raw price shape is checked here; grammar follows the source required/barcode checks.
export const articleValuesSchema = z.strictObject({
  Codigo: z.string().max(30),
  Descricao: z.string().max(100).nullable(),
  codbarras: z.string().max(30).nullable(),
  unidade: z.string().max(3).nullable(),
  preco: z.string().nullable(),
  inativo: z.boolean().nullable(),
});
export const articleIdentitySchema = z.strictObject({
  id: z.string().regex(/^[1-9][0-9]*(?![\s\S])/).max(19).refine(value => value.length < 19 || value <= "9223372036854775807"),
});
export const articleSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: articleValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: articleIdentitySchema.shape.id, values: articleValuesSchema }),
]);
export const articleListSchema = z.strictObject({
  mode: z.enum(["todos", "codigo", "descricao", "codigobarras"]),
  term: z.string(),
  active: z.boolean(),
  inactive: z.boolean(),
  sort: z.enum(["Codigo", "Descricao", "codbarras", "unidade", "preco", "inativo", "artigosID"]).optional(),
  descending: z.boolean().optional(),
}).refine(value => value.active || value.inactive);
export type ArticleValues = z.infer<typeof articleValuesSchema>;
export type ArticleSave = z.infer<typeof articleSaveSchema>;
export type ArticleList = z.infer<typeof articleListSchema>;
export type Article = Omit<ArticleValues, "Codigo"> & { Codigo: string | null; id: string; artigosID: string | null; stock: string | null };
export type ArticleListResult = { kind: "loaded"; articles: Article[] } | { kind: "invalid" | "failed" };
export type ArticleSaveResult = { kind: "saved"; article: Article } | { kind: "required" | "duplicate" | "barcodeDuplicate"; message: string } | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
export type ArticleDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" } | { kind: "associated"; message: string };

// Verified: WIN_Form_artigos.wdw:38–49; exact-empty checks, no trimming.
export function articleRequiredMessage(values: ArticleValues): string | null {
  if (values.Codigo === "") return "Indique um código";
  if (values.Descricao === "" || values.Descricao === null) return "Indique uma descrição";
  if (values.unidade === "" || values.unidade === null) return "Indique uma unidade";
  return null;
}
// Verified: WIN_Form_artigos.wdw:81/91 and source unique Codigo key.
export function articleDuplicateMessage(code: string): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}
// ADR-002/U-CAA44622-03: nullable finite plain decimal strings; no coercion or rounding.
export function isArticlePrice(value: string | null): boolean {
  return value === null || /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?![\s\S])/.test(value);
}
