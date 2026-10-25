import { z } from "zod";

// Verified: utilizadores XDD/schema. The source 99 entry mask does not narrow an unsigned byte.
export const userValuesSchema = z.strictObject({
  Codigo: z.number().int().min(0).max(255).nullable(),
  Descricao: z.string().max(100).nullable(),
  palavra_passe: z.string().max(15).nullable(),
});
export const userIdentitySchema = z.strictObject({
  id: z.string().regex(/^[1-9][0-9]*(?![\s\S])/).max(19).refine(value => value.length < 19 || value <= "9223372036854775807"),
});
export const userSaveSchema = z.discriminatedUnion("mode", [
  z.strictObject({ mode: z.literal("create"), values: userValuesSchema }),
  z.strictObject({ mode: z.literal("update"), id: userIdentitySchema.shape.id, values: userValuesSchema, passwordUnchanged: z.boolean().optional() }),
]);
export const userListSchema = z.strictObject({ sort: z.enum(["Codigo", "Descricao"]).optional(), descending: z.boolean().optional() });
export type UserValues = z.infer<typeof userValuesSchema>;
export type UserSave = z.infer<typeof userSaveSchema>;
export type UserList = z.infer<typeof userListSchema>;
export type UserListRow = Omit<UserValues, "palavra_passe"> & { id: string };
export type UserRecord = UserListRow & { utilizadoresID: string | null; palavra_passe: string | null; credentialManaged?: boolean };
export type UserListResult = { kind: "loaded"; users: UserListRow[] } | { kind: "invalid" | "failed" };
export type UserReadResult = { kind: "loaded"; user: UserRecord } | { kind: "invalid" | "missing" | "failed" };
export type UserSaveResult = { kind: "saved"; user: UserListRow } | { kind: "required" | "duplicate"; message: string } | { kind: "invalid" | "missing" | "codeLocked" | "failed" };
export type UserDeleteResult = { kind: "deleted" | "invalid" | "missing" | "failed" };

// Verified text/order: legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:34–43.
// ADR-008/U03: numeric empty-string comparison uses the explicit NULL/zero required default.
export function userRequiredMessage(values: UserValues, passwordUnchanged = false): string | null {
  if (values.Codigo === null || values.Codigo === 0) return "Falta indicar o código";
  if (values.Descricao === null || values.Descricao === "") return "Falta indicar o nome";
  return !passwordUnchanged && (values.palavra_passe === null || values.palavra_passe === "") ? "Falta indicar a palavra-passe" : null;
}

// Verified: WIN_Form_utilizadores.wdw:54/64, numeric unique Codigo key.
export function userDuplicateMessage(code: number): string {
  return `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`;
}

// ADR-008 entry conversion default; untouched nullable imported bindings are preserved separately.
export function userCode(text: string): number | undefined {
  if (text === "") return 0;
  if (!/^[0-9]{1,3}(?![\s\S])/.test(text)) return undefined;
  const value = Number(text);
  return value <= 255 ? value : undefined;
}

// Verified unconditional Upper before ScreenToFile: WIN_Form_utilizadores.wdw:46–47.
// UNRESOLVED U-CE3323C9-03: pt-PT is the explicit ADR-008 locale default, not a runtime capture.
export function userUppercase(value: string): string {
  return value.toLocaleUpperCase("pt-PT");
}
