import { expect, it } from "vitest";
import { vehicleDuplicateMessage, vehicleRequiredMessage, vehicleSaveSchema, type VehicleValues } from "./vehicles";

const values: VehicleValues = { matricula: "", Cliente: "0", marca: "", modelo: "", Ano: 0, mes: 0 };

it("SRC-0c045cf25e checks registration, customer, make and model in source order", () => {
  expect(vehicleRequiredMessage(values)).toBe("Falta indicar a matrícula");
  expect(vehicleRequiredMessage({ ...values, matricula: "AA" })).toBe("Falta indicar o cliente");
  expect(vehicleRequiredMessage({ ...values, matricula: "AA", Cliente: "1" })).toBe("Falta indicar a marca");
  expect(vehicleRequiredMessage({ ...values, matricula: "AA", Cliente: "1", marca: "X" })).toBe("Falta indicar o modelo");
  expect(vehicleRequiredMessage({ ...values, matricula: " ", Cliente: "1", marca: " ", modelo: " " })).toBeNull();
});

it("SRC-0c045cf25e retains schema ranges including zero and exact large customer IDs", () => {
  const command = { mode: "create", values: { ...values, Cliente: "18446744073709551615", Ano: 65535, mes: 255 } };
  expect(vehicleSaveSchema.safeParse(command).success).toBe(true);
  expect(vehicleSaveSchema.safeParse({ ...command, values: { ...command.values, Cliente: "18446744073709551616" } }).success).toBe(false);
  for (const invalid of [{ Ano: -1 }, { Ano: 65536 }, { mes: 256 }, { mes: 1.5 }]) {
    expect(vehicleSaveSchema.safeParse({ ...command, values: { ...command.values, ...invalid } }).success).toBe(false);
  }
  expect(vehicleDuplicateMessage("AA-00-AA")).toBe("Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: matricula\nValor do campo duplicado: AA-00-AA");
});
