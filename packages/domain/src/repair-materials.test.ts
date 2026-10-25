import { describe, expect, it } from "vitest";
import { repairMaterialEditMessage, repairMaterialsSaveSchema } from "./repair-materials";

describe("repair materials source rules", () => {
  it("SRC-f7457e6a1c/SRC-199720cd56/SRC-0f727cefd6/SRC-ca66909c26 launched rows refuse edits and deletion", () => {
    expect(repairMaterialEditMessage(true)).toBe("Artigo já lançado, não pode ser alterado");
    expect(repairMaterialEditMessage(true, true)).toBe("Artigo já lançado, não pode ser eliminado");
    expect(repairMaterialEditMessage(false)).toBeNull();
    expect(repairMaterialEditMessage(null, true)).toBeNull();
  });
  it("SRC-eb5a859599 preserves decimal precision, unsigned order IDs, NULL and raw dates without coercion", () => {
    const command = { orderId: "1", numero: "18446744073709551615", baseline: "revision", state: null, proofs: [], rows: [{ id: null,
      data_hora: "00000000000000000", mecanico: null, artigo: "á  ", descricao_artigo: null, quantidade: "-0.000000000000001", preco: null, lancado: null }] };
    expect(repairMaterialsSaveSchema.parse(command)).toEqual(command);
    expect(repairMaterialsSaveSchema.safeParse({ ...command, rows: [{ ...command.rows[0], quantidade: "NaN" }] }).success).toBe(false);
  });
});
