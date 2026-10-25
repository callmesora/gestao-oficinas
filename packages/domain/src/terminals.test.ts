import { expect, it } from "vitest";
import { terminalDuplicateMessage, terminalPosition, terminalRequiredMessage, terminalSaveSchema, type TerminalValues } from "./terminals";
const values: TerminalValues = { Codigo: "", Descricao: "", codbarras_inicio: 0, codbarras_fim: 0, quant_inicio: 0, quant_fim: 0, pasta_localizacao: "", nome_ficheiro: "" };
it("SRC-f62ee211d1 keeps ordered exact required checks and original duplicate text", () => {
  expect(terminalRequiredMessage(values)).toBe("Indique um código");
  expect(terminalRequiredMessage({ ...values, Codigo: "0" })).toBe("Indique uma descrição");
  expect(terminalRequiredMessage({ ...values, Codigo: " ", Descricao: " " })).toBeNull();
  expect(terminalDuplicateMessage("A")).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: A");
});
it("RULE-CDF1C34F-012 validates actual unsigned-byte positions and source string limits", () => {
  expect(terminalSaveSchema.safeParse({ mode: "update", id: "9007199254740993", values: { ...values, Codigo: "ABC", Descricao: "x".repeat(30), quant_fim: 255 } }).success).toBe(true);
  for (const quant_fim of [-1, 256, 1.5, "2"]) expect(terminalSaveSchema.safeParse({ mode: "create", values: { ...values, quant_fim } }).success).toBe(false);
  for (const patch of [{ Codigo: "ABCD" }, { Descricao: "x".repeat(31) }, { pasta_localizacao: "x".repeat(201) }, { nome_ficheiro: "x".repeat(51) }]) expect(terminalSaveSchema.safeParse({ mode: "create", values: { ...values, ...patch } }).success).toBe(false);
});
it("ADR-016 RULE-CDF1C34F-012 converts explicit position text without wrap, rounding or hidden empty coercion", () => {
  expect(terminalPosition("0")).toBe(0); expect(terminalPosition("255")).toBe(255);
  for (const text of ["", "256", "-1", "1.5", " 1", "1e2"]) expect(terminalPosition(text)).toBeUndefined();
});
