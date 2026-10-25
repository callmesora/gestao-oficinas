import { expect, it } from "vitest";
import { descriptiveStateDuplicateMessage, descriptiveStateRequiredMessage, descriptiveStateSaveSchema } from "./descriptive-states";

it("SRC-0a8d1af823 requires only exact nonempty code and preserves text zero/spaces", () => {
  expect(descriptiveStateRequiredMessage({ Codigo: "", Descricao: "Description" })).toBe("Falta indicar o código");
  for (const Codigo of ["0", " ", "UN"]) expect(descriptiveStateRequiredMessage({ Codigo, Descricao: "" })).toBeNull();
  expect(descriptiveStateRequiredMessage({ Codigo: "UN", Descricao: null })).toBeNull();
  expect(descriptiveStateDuplicateMessage("UN")).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: UN");
});

it("SRC-0a8d1af823 validates source field lengths and string internal identities", () => {
  expect(descriptiveStateSaveSchema.safeParse({ mode: "update", id: "9007199254740993", values: { Codigo: "ABC", Descricao: "" } }).success).toBe(true);
  expect(descriptiveStateSaveSchema.safeParse({ mode: "create", values: { Codigo: "ABCD", Descricao: "" } }).success).toBe(false);
  expect(descriptiveStateSaveSchema.safeParse({ mode: "create", values: { Codigo: "A", Descricao: "x".repeat(101) } }).success).toBe(false);
});
