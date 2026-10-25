import { expect, it } from "vitest";
import { postoCode, postoDuplicateMessage, postoIdentitySchema, postoListSchema, postoRequiredMessage, postoSaveSchema } from "./postos";

it("SRC-78dffe2a53 requires positive code before exact nonempty description without trimming", () => {
  for (const Codigo of [0, null]) expect(postoRequiredMessage({ Codigo, Descricao: "", terminal: null })).toBe("Indique um código");
  for (const Descricao of ["", null]) expect(postoRequiredMessage({ Codigo: 1, Descricao, terminal: "" })).toBe("Indique uma descrição");
  expect(postoRequiredMessage({ Codigo: 255, Descricao: "  ", terminal: "???" })).toBeNull();
  expect(postoDuplicateMessage(255)).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 255");
});

it("SRC-78dffe2a53 validates stored byte/text ranges and permits code-changing selected-id updates", () => {
  const values = { Codigo: 255, Descricao: "Á".repeat(50), terminal: "XYZ" };
  expect(postoSaveSchema.safeParse({ mode: "update", id: "9007199254740993", values }).success).toBe(true);
  expect(postoSaveSchema.safeParse({ mode: "create", values: { Codigo: null, Descricao: null, terminal: null } }).success).toBe(true);
  for (const Codigo of [-1, 256, 1.5, Infinity, NaN, "1"]) expect(postoSaveSchema.safeParse({ mode: "create", values: { ...values, Codigo } }).success).toBe(false);
  expect(postoSaveSchema.safeParse({ mode: "create", values: { ...values, Descricao: "x".repeat(51) } }).success).toBe(false);
  expect(postoSaveSchema.safeParse({ mode: "create", values: { ...values, terminal: "ABCD" } }).success).toBe(false);
  expect(postoSaveSchema.safeParse({ mode: "create", values: { ...values, teste: "not bound" } }).success).toBe(false);
});

it("SRC-591960029c keeps internal identity strings bounded and list keys explicit", () => {
  expect(postoIdentitySchema.safeParse({ id: "9223372036854775807" }).success).toBe(true);
  for (const id of ["0", "-1", "01", "1.5", "9223372036854775808", "x' OR 1=1--", 1]) expect(postoIdentitySchema.safeParse({ id }).success).toBe(false);
  expect(postoListSchema.safeParse({ sort: "Descricao", descending: true }).success).toBe(true);
  for (const input of [{ sort: "terminal" }, { sort: 'Codigo"; DROP TABLE postos;--' }, { descending: "true" }, { filter: "invented" }]) expect(postoListSchema.safeParse(input).success).toBe(false);
});

it("RULE-CD4F0FE3-011 ADR-016 converts code drafts explicitly without widening invalid text or truncating 255", () => {
  expect(postoCode("")).toBe(0);
  expect(postoCode("0")).toBe(0);
  expect(postoCode("01")).toBe(1);
  expect(postoCode("255")).toBe(255);
  for (const text of ["256", "0001", "1.5", "-1", "+1", "1e2", " 1", "1 ", "NaN", "1\n2"]) expect(postoCode(text)).toBeUndefined();
});
