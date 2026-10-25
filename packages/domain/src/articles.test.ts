import { expect, it } from "vitest";
import { articleDuplicateMessage, articleIdentitySchema, articleListSchema, articleRequiredMessage, articleSaveSchema, isArticlePrice,
  type Article, type ArticleValues } from "./articles";

const initial: ArticleValues = { Codigo: "A", Descricao: "Artigo", codbarras: "", unidade: "UN", preco: "0", inativo: false };

it("SRC-18a96799b6 requires exact code then description then unit without trimming", () => {
  expect(articleRequiredMessage({ ...initial, Codigo: "", Descricao: "", unidade: "", preco: "-" })).toBe("Indique um código");
  for (const Descricao of ["", null]) expect(articleRequiredMessage({ ...initial, Descricao, unidade: "" })).toBe("Indique uma descrição");
  for (const unidade of ["", null]) expect(articleRequiredMessage({ ...initial, unidade })).toBe("Indique uma unidade");
  expect(articleRequiredMessage({ ...initial, Codigo: " ", Descricao: " ", unidade: " ", codbarras: null, preco: null, inativo: null })).toBeNull();
  expect(articleDuplicateMessage("A'1 ")).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: A'1 ");
});

it("RULE-CAA44622-010 ADR-002 validates six bound shapes without stock or numeric-mask narrowing", () => {
  for (const preco of [null, "0", "-1234567890.123456789", "-", "", "NaN"]) {
    expect(articleSaveSchema.safeParse({ mode: "create", values: { ...initial, Codigo: "x".repeat(30), Descricao: "x".repeat(100), codbarras: "b".repeat(30), unidade: "XYZ", preco, inativo: null } }).success).toBe(true);
  }
  for (const values of [{ ...initial, Codigo: null }, { ...initial, Codigo: "x".repeat(31) }, { ...initial, Descricao: "x".repeat(101) }, { ...initial, codbarras: "x".repeat(31) }, { ...initial, unidade: "LONG" }, { ...initial, preco: 1.5 }, { ...initial, inativo: 0 }, { ...initial, stock: "0" }, { ...initial, artigosID: "1" }]) {
    expect(articleSaveSchema.safeParse({ mode: "create", values }).success).toBe(false);
  }
  expect(articleSaveSchema.safeParse({ mode: "create", values: initial, _source_row: "1" }).success).toBe(false);
  const imported: Article = { ...initial, id: "9007199254740993", artigosID: null, Codigo: null, stock: "-0.1234567890123456789" };
  expect(imported.Codigo).toBeNull();
  expect(articleSaveSchema.safeParse({ mode: "update", id: imported.id, values: { ...initial, Codigo: imported.Codigo } }).success).toBe(false);
});

it("ADR-002 U-CAA44622-03 accepts only nullable finite plain decimal price grammar after source guards", () => {
  for (const value of [null, "0", "-0", "+12", ".5", "-.5", "+0.01", "1.", "12345678901234567890.12345678901234567890"]) expect(isArticlePrice(value)).toBe(true);
  for (const value of ["", "+", "-", ".", "-.", "1,25", "1 000.00", "1e3", "NaN", "Infinity", "-Infinity", " 1", "1 ", "1\n", "1.2.3"]) expect(isArticlePrice(value)).toBe(false);
});

it("ADR-011 selected identities remain exact positive signed8 decimal strings", () => {
  for (const id of ["1", "9007199254740993", "9223372036854775807"]) expect(articleIdentitySchema.safeParse({ id }).success).toBe(true);
  for (const id of ["0", "01", "-1", "9223372036854775808", "1 OR 1=1", "1\n", 1]) expect(articleIdentitySchema.safeParse({ id }).success).toBe(false);
});

it("SRC-9efbe81830 RULE-C7738076-030 restricts filter and typed sort fields to source controls", () => {
  const filter = { mode: "todos", term: "", active: true, inactive: false };
  for (const mode of ["todos", "codigo", "descricao", "codigobarras"]) for (const sort of ["Codigo", "Descricao", "codbarras", "unidade", "preco", "inativo", "artigosID"]) {
    expect(articleListSchema.safeParse({ ...filter, mode, sort, descending: true }).success).toBe(true);
  }
  for (const input of [{ ...filter, active: false }, { ...filter, mode: "barcode" }, { ...filter, term: null }, { ...filter, sort: "stock" }, { ...filter, sort: 'preco";DROP TABLE artigos;--' }, { ...filter, descending: "false" }, { ...filter, extra: true }]) {
    expect(articleListSchema.safeParse(input).success).toBe(false);
  }
});
