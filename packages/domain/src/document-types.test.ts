import { expect, it } from "vitest";
import { documentTypeDuplicateMessage, documentTypeIdentitySchema, documentTypeListSchema, documentTypeRequiredMessage, documentTypeSaveSchema, documentTypeStockLabel,
  type DocumentType, type DocumentTypeValues } from "./document-types";

const initial: DocumentTypeValues = { Codigo: "A", Descricao: "", stock: 1, obriga_macanico: false };

it("SRC-3c9d2e15a6 requires only exact nonempty code without trimming or a mechanic/description rule", () => {
  expect(documentTypeRequiredMessage({ ...initial, Codigo: "" })).toBe("Falta indicar o código");
  for (const Codigo of ["0", " ", "a' "]) for (const Descricao of ["", null, "d'Água  "]) {
    expect(documentTypeRequiredMessage({ ...initial, Codigo, Descricao, obriga_macanico: true })).toBeNull();
  }
  expect(documentTypeDuplicateMessage("a' ")).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: a' ");
});

it("RULE-C5CA4D83-011 ADR-011 accepts the source byte and nullable flag independently of radio choices", () => {
  for (const stock of [0, 1, 2, 255, null]) for (const obriga_macanico of [false, true, null]) {
    expect(documentTypeSaveSchema.safeParse({ mode: "create", values: { Codigo: "ABC", Descricao: "x".repeat(50), stock, obriga_macanico } }).success).toBe(true);
  }
  for (const values of [{ ...initial, Codigo: null }, { ...initial, Codigo: "ABCD" }, { ...initial, Descricao: "x".repeat(51) }, { ...initial, stock: -1 }, { ...initial, stock: 256 }, { ...initial, stock: 1.5 }, { ...initial, stock: "1" }, { ...initial, obriga_macanico: 1 }, { ...initial, obriga_macanico: "false" }, { ...initial, obriga_mecanico: false }, { ...initial, documentosID: "1" }]) {
    expect(documentTypeSaveSchema.safeParse({ mode: "create", values }).success).toBe(false);
  }
  expect(documentTypeSaveSchema.safeParse({ mode: "create", values: initial, _source_row: "1" }).success).toBe(false);
  expect(documentTypeSaveSchema.safeParse({ mode: "update", id: "1", values: initial, provenance: "changed" }).success).toBe(false);
  const imported: DocumentType = { id: "9007199254740993", documentosID: null, Codigo: null, Descricao: null, stock: null, obriga_macanico: null };
  expect(imported.Codigo).toBeNull();
  expect(documentTypeSaveSchema.safeParse({ mode: "update", id: imported.id, values: { Codigo: imported.Codigo, Descricao: imported.Descricao, stock: imported.stock, obriga_macanico: imported.obriga_macanico } }).success).toBe(false);
});

it("ADR-002 ADR-011 selected identity stays an exact positive signed8 decimal string", () => {
  for (const id of ["1", "9007199254740993", "9223372036854775807"]) expect(documentTypeIdentitySchema.safeParse({ id }).success).toBe(true);
  for (const id of ["0", "01", "-1", "1 OR 1=1", "9223372036854775808", "99999999999999999999", 1]) expect(documentTypeIdentitySchema.safeParse({ id }).success).toBe(false);
});

it("SRC-cb37887d33 displays the exact stock labels with explicit ADR-012 raw fallback", () => {
  expect([1, 2].map(documentTypeStockLabel)).toEqual(["Entrada", "Saída"]);
  expect([null, 0, 255].map(documentTypeStockLabel)).toEqual(["", "0", "255"]);
});

it("RULE-CFEE768B-021 whitelists the four visible sort keys and source browse identity", () => {
  for (const sort of ["Codigo", "Descricao", "stock", "obriga_macanico", "documentosID"]) expect(documentTypeListSchema.safeParse({ sort, descending: true }).success).toBe(true);
  for (const input of [{ sort: "_row_id" }, { sort: 'Codigo";DROP TABLE documentos;--' }, { mode: "active" }, { sort: "stock", descending: "true" }]) expect(documentTypeListSchema.safeParse(input).success).toBe(false);
});
