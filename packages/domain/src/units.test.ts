import { expect, it } from "vitest";
import { unitDuplicateMessage, unitRequiredMessage, unitSaveSchema } from "./units";

it("SRC-a5097f5947 requires only exact nonempty code and preserves text zero/spaces", () => {
  expect(unitRequiredMessage({ Codigo: "", Descricao: "Description" })).toBe("Falta indicar o código");
  for (const Codigo of ["0", " ", "UN"]) expect(unitRequiredMessage({ Codigo, Descricao: "" })).toBeNull();
  expect(unitRequiredMessage({ Codigo: "UN", Descricao: null })).toBeNull();
  expect(unitDuplicateMessage("UN")).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: UN");
});

it("SRC-a5097f5947 validates source field lengths and string internal identities", () => {
  expect(unitSaveSchema.safeParse({ mode: "update", id: "9007199254740993", values: { Codigo: "ABC", Descricao: "" } }).success).toBe(true);
  expect(unitSaveSchema.safeParse({ mode: "create", values: { Codigo: "ABCD", Descricao: "" } }).success).toBe(false);
  expect(unitSaveSchema.safeParse({ mode: "create", values: { Codigo: "A", Descricao: "x".repeat(51) } }).success).toBe(false);
});
