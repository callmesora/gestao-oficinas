import { expect, it } from "vitest";
import { customerRequiredMessage, customerDuplicateMessage, customerSaveSchema, type CustomerValues } from "./customers";

const values: CustomerValues = { Codigo: "0", Descricao: "", Morada1: "", Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "" };
it("SRC-51085948c6 validates code before description and preserves space-only descriptions", () => {
  expect(customerRequiredMessage(values)).toBe("Falta indicar o código");
  expect(customerRequiredMessage({ ...values, Codigo: "1" })).toBe("Falta indicar a descrição");
  expect(customerRequiredMessage({ ...values, Codigo: "1", Descricao: null })).toBe("Falta indicar a descrição");
  expect(customerRequiredMessage({ ...values, Codigo: "1", Descricao: " " })).toBeNull();
});
it("SRC-51085948c6 retains exact duplicate text and large unsigned code", () => {
  expect(customerDuplicateMessage("9007199254740993")).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 9007199254740993");
  expect(customerSaveSchema.safeParse({ mode: "create", values: { ...values, Codigo: "18446744073709551615" } }).success).toBe(true);
  expect(customerSaveSchema.safeParse({ mode: "create", values: { ...values, Codigo: "18446744073709551616" } }).success).toBe(false);
  for (const Codigo of ["", "bad", "1e3", "-1", "1.5"]) {
    expect(customerSaveSchema.safeParse({ mode: "create", values: { ...values, Codigo } }).success).toBe(false);
  }
});
