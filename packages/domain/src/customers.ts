import { z } from "zod";

// Verified: schema Clientes.Codigo is unsigned 8 bytes; ADR-002 transports exact strings.
const unsigned64 = z.string().refine(value => /^(0|[1-9][0-9]{0,19})$/.test(value) && BigInt(value) <= 18446744073709551615n);
const nullableText = z.string().nullable();
export const customerValuesSchema = z.strictObject({
  Codigo: unsigned64, Descricao: nullableText, Morada1: nullableText, Morada2: nullableText,
  codpostal: nullableText, Telefone1: nullableText, Telemovel: nullableText, observacao: nullableText,
});
export const customerSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: customerValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: z.string().regex(/^[1-9][0-9]*$/).max(19), values: customerValuesSchema }),
]);
export type CustomerValues = z.infer<typeof customerValuesSchema>;
export type CustomerSave = z.infer<typeof customerSaveSchema>;
export type Customer = Omit<CustomerValues, "Codigo"> & { Codigo: string | null; id: string; ClientesID: string | null };
export const customerFilterSchema = z.strictObject({
  mode: z.enum(["todos", "codigo", "descricao", "morada", "codigopostal", "telefone"]), term: z.string(),
  sort: z.enum(["Codigo", "Descricao", "Morada1", "Morada2", "codpostal", "Telefone1", "Telemovel"]).optional(),
  descending: z.boolean().optional(),
});
export type CustomerFilter = z.infer<typeof customerFilterSchema>;
export type CustomerListResult = { kind: "loaded"; customers: Customer[]; nextCode: string } | { kind: "invalid" | "failed" };

// Verified: WIN_Form_Clientes.wdw:38–45. No trim: spaces are not the empty string.
export function customerRequiredMessage(values: CustomerValues): string | null {
  if (values.Codigo === "0") return "Falta indicar o código";
  // Nullable imported text is displayed as an empty edit; it cannot bypass mandatory control validation.
  if (values.Descricao === "" || values.Descricao === null) return "Falta indicar a descrição";
  return null;
}

// Verified: WIN_Form_Clientes.wdw:54/64; newline separates Error arguments.
export function customerDuplicateMessage(value: string): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${value}`;
}

export type CustomerSaveResult =
  | { kind: "saved"; customer: Customer }
  | { kind: "required" | "duplicate"; message: string }
  | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
