import { expect, it } from "vitest";
import { userCode, userDuplicateMessage, userIdentitySchema, userListSchema, userRequiredMessage, userSaveSchema, userUppercase } from "./users";

it("SRC-7c866e13ff requires code, name and password in exact source order without trimming", () => {
  for (const Codigo of [0, null]) expect(userRequiredMessage({ Codigo, Descricao: "", palavra_passe: "" })).toBe("Falta indicar o código");
  for (const Descricao of ["", null]) expect(userRequiredMessage({ Codigo: 1, Descricao, palavra_passe: "" })).toBe("Falta indicar o nome");
  for (const palavra_passe of ["", null]) expect(userRequiredMessage({ Codigo: 1, Descricao: "Synthetic", palavra_passe })).toBe("Falta indicar a palavra-passe");
  for (const palavra_passe of ["mixedCase", " "]) expect(userRequiredMessage({ Codigo: 255, Descricao: "  ", palavra_passe })).toBeNull();
});

it("SRC-7c866e13ff preserves the exact three-line numeric code duplicate message", () => {
  expect(userDuplicateMessage(255)).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 255");
});

it("RULE-CE3323C9-011 validates the full byte and exact three nullable bound fields only", () => {
  const values = { Codigo: 255, Descricao: "Á".repeat(100), palavra_passe: "mIxEd ".repeat(2) + "123" };
  expect(userSaveSchema.safeParse({ mode: "create", values }).success).toBe(true);
  expect(userSaveSchema.safeParse({ mode: "update", id: "9007199254740993", values: { Codigo: null, Descricao: null, palavra_passe: null } }).success).toBe(true);
  for (const Codigo of [-1, 256, 1.5, NaN, Infinity, "1"]) expect(userSaveSchema.safeParse({ mode: "create", values: { ...values, Codigo } }).success).toBe(false);
  for (const patch of [{ Descricao: "x".repeat(101) }, { palavra_passe: "x".repeat(16) }, { utilizadoresID: "1" }, { Nome: "unbound" }, { inativo: false }]) expect(userSaveSchema.safeParse({ mode: "create", values: { ...values, ...patch } }).success).toBe(false);
  for (const command of [{ mode: "create", id: "1", values }, { mode: "update", values }, { mode: "create", values, extra: true }]) expect(userSaveSchema.safeParse(command).success).toBe(false);
});

it("SRC-91e30fc7fd bounds selected identities and whitelists only the two visible list columns", () => {
  expect(userIdentitySchema.safeParse({ id: "9223372036854775807" }).success).toBe(true);
  for (const id of ["0", "-1", "01", "1.5", "9223372036854775808", "1\n", "1 OR 1=1", 1]) expect(userIdentitySchema.safeParse({ id }).success).toBe(false);
  expect(userListSchema.safeParse({ sort: "Codigo", descending: false }).success).toBe(true);
  expect(userListSchema.safeParse({ sort: "Descricao", descending: true }).success).toBe(true);
  for (const input of [{ sort: "utilizadoresID" }, { sort: "palavra_passe" }, { sort: 'Codigo";DROP TABLE utilizadores;--' }, { descending: "true" }, { activeOnly: true }]) expect(userListSchema.safeParse(input).success).toBe(false);
  expect(userIdentitySchema.safeParse({ id: "1", Codigo: 1 }).success).toBe(false);
});

it("RULE-CE3323C9-011 ADR-008 converts numeric drafts explicitly without narrowing byte255 to mask99", () => {
  expect(userCode("")).toBe(0);
  expect(userCode("0")).toBe(0);
  expect(userCode("01")).toBe(1);
  expect(userCode("255")).toBe(255);
  for (const text of ["256", "0001", "1.5", "-1", "+1", "1e2", " 1", "1 ", "NaN", "1\n", "1\n2"]) expect(userCode(text)).toBeUndefined();
});

it("SRC-7c866e13ff ADR-008 uses the explicit pt-PT uppercase default unconditionally and retains exact spaces", () => {
  expect(userUppercase("mIxEd'PaSs  ")).toBe("MIXED'PASS  ");
  expect(userUppercase("UPPER CASE  ")).toBe("UPPER CASE  ");
  expect(userUppercase("áéíóúç  ")).toBe("ÁÉÍÓÚÇ  ");
  expect(userUppercase("  ")).toBe("  ");
  expect(userUppercase("ß".repeat(8))).toBe("SS".repeat(8));
});
