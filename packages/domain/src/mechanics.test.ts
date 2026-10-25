import { expect, it } from "vitest";
import { mechanicCode, mechanicDuplicateMessage, mechanicIdentitySchema, mechanicListSchema, mechanicRequiredMessage, mechanicSaveSchema } from "./mechanics";

it("SRC-97711eb5f6 ADR-008 requires code, description and password in source order without case or space conversion", () => {
  for (const Codigo of [0, null]) expect(mechanicRequiredMessage({ Codigo, Descricao: "", palavra_passe: "", inativo: false })).toBe("Falta indicar o código");
  for (const Descricao of ["", null]) expect(mechanicRequiredMessage({ Codigo: 1, Descricao, palavra_passe: "", inativo: null })).toBe("Falta preencher a descrição");
  for (const palavra_passe of ["", null]) expect(mechanicRequiredMessage({ Codigo: 1, Descricao: "Mechanic", palavra_passe, inativo: false })).toBe("Falta indicar a palavra-passe");
  for (const palavra_passe of ["mixedCase", " "]) expect(mechanicRequiredMessage({ Codigo: 255, Descricao: "  ", palavra_passe, inativo: null })).toBeNull();
  expect(mechanicDuplicateMessage(255)).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 255");
});

it("RULE-C17FCA03-010 validates byte255, text lengths, exact nullable Boolean and four bound values only", () => {
  const values = { Codigo: 255, Descricao: "Á".repeat(100), palavra_passe: "mIxEd ".repeat(2) + "123", inativo: false };
  expect(mechanicSaveSchema.safeParse({ mode: "create", values }).success).toBe(true);
  expect(mechanicSaveSchema.safeParse({ mode: "update", id: "9007199254740993", values: { Codigo: null, Descricao: null, palavra_passe: null, inativo: null } }).success).toBe(true);
  for (const Codigo of [-1, 256, 1.5, NaN, Infinity, "1"]) expect(mechanicSaveSchema.safeParse({ mode: "create", values: { ...values, Codigo } }).success).toBe(false);
  for (const inativo of [0, 1, "false", "true"]) expect(mechanicSaveSchema.safeParse({ mode: "create", values: { ...values, inativo } }).success).toBe(false);
  for (const patch of [{ Descricao: "x".repeat(101) }, { palavra_passe: "x".repeat(16) }, { mecanicosID: "1" }, { extra: "unbound" }]) expect(mechanicSaveSchema.safeParse({ mode: "create", values: { ...values, ...patch } }).success).toBe(false);
});

it("SRC-d4e3c89519 bounds internal identities and limits list keys to public source columns", () => {
  expect(mechanicIdentitySchema.safeParse({ id: "9223372036854775807" }).success).toBe(true);
  for (const id of ["0", "-1", "01", "1.5", "9223372036854775808", "x' OR 1=1--", 1]) expect(mechanicIdentitySchema.safeParse({ id }).success).toBe(false);
  expect(mechanicListSchema.safeParse({ sort: "inativo", descending: false }).success).toBe(true);
  for (const input of [{ sort: "mecanicosID" }, { sort: "palavra_passe" }, { sort: 'Codigo";DROP TABLE mecanicos;--' }, { descending: "true" }, { activeOnly: true }]) expect(mechanicListSchema.safeParse(input).success).toBe(false);
});

it("RULE-C17FCA03-010 ADR-008 converts numeric drafts explicitly and preserves the full stored byte range", () => {
  expect(mechanicCode("")).toBe(0);
  expect(mechanicCode("0")).toBe(0);
  expect(mechanicCode("01")).toBe(1);
  expect(mechanicCode("255")).toBe(255);
  for (const text of ["256", "0001", "1.5", "-1", "+1", "1e2", " 1", "1 ", "NaN", "1\n2"]) expect(mechanicCode(text)).toBeUndefined();
});
