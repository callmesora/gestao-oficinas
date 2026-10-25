import { expect, it } from "vitest";
import { repairStateDuplicateMessage, repairStateIdentitySchema, repairStateRequiredMessage, repairStateSaveSchema, repairStateTypeLabel, type RepairStateValues } from "./repair-states";

const initial: RepairStateValues = { Codigo: "A", Descricao: "", tipo: 1, Cor: 0, lancar_defa: false, lancar_material: false, confirmacao: false, pedir_data_entrega: false, pedir_data_pag: false };

it("SRC-01a3c75d73 requires only exact nonempty code and retains optional NULL/empty description", () => {
  expect(repairStateRequiredMessage({ ...initial, Codigo: "" })).toBe("Falta indicar o código");
  for (const Codigo of ["0", " ", "a' "]) for (const Descricao of ["", null, "d'Água  "]) expect(repairStateRequiredMessage({ ...initial, Codigo, Descricao })).toBeNull();
  expect(repairStateDuplicateMessage("a' ")).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: a' ");
});

it("ADR-011 source byte/unsigned32/null ranges remain independent from entry masks and radio options", () => {
  for (const tipo of [0, 1, 8, 255, null]) for (const Cor of [0, 16777215, 2147483648, 4294967295, null]) {
    expect(repairStateSaveSchema.safeParse({ mode: "create", values: { ...initial, Codigo: "ABC", Descricao: "x".repeat(50), tipo, Cor, lancar_defa: null, lancar_material: null, confirmacao: null, pedir_data_entrega: null, pedir_data_pag: null } }).success).toBe(true);
  }
  for (const values of [{ ...initial, Codigo: "ABCD" }, { ...initial, Descricao: "x".repeat(51) }, { ...initial, tipo: -1 }, { ...initial, tipo: 256 }, { ...initial, tipo: 1.5 }, { ...initial, Cor: -1 }, { ...initial, Cor: 4294967296 }, { ...initial, Cor: 1.5 }, { ...initial, Cor: "1" }, { ...initial, lancar_material: 1 }, { ...initial, confirmacao: "false" }, { ...initial, estados_reparacaoID: "2" }]) expect(repairStateSaveSchema.safeParse({ mode: "create", values }).success).toBe(false);
  expect(repairStateSaveSchema.safeParse({ mode: "create", estados_reparacaoID: "1", values: initial }).success).toBe(false);
  expect(repairStateSaveSchema.safeParse({ mode: "update", id: "1", values: initial, provenance: "changed" }).success).toBe(false);
});

it("ADR-002 selected identity stays an exact positive signed8 decimal string", () => {
  for (const id of ["1", "9007199254740993", "9223372036854775807"]) expect(repairStateIdentitySchema.safeParse({ id }).success).toBe(true);
  for (const id of ["0", "01", "-1", "1 OR 1=1", "9223372036854775808", "99999999999999999999", 1]) expect(repairStateIdentitySchema.safeParse({ id }).success).toBe(false);
});

it("SRC-3d2d856e80 displays all eight exact source labels including list Recepçao", () => {
  expect(Array.from({ length: 8 }, (_, i) => repairStateTypeLabel(i + 1))).toEqual(["Recepçao", "Aguardar início reparação", "Em reparação", "Teste", "Lavagem", "Reparação suspensa", "Reparação finalizada", "Orçamento"]);
  // ADR-012 accepted display fallback, not a native runtime observation.
  expect([null, 0, 255].map(repairStateTypeLabel)).toEqual(["", "0", "255"]);
});
