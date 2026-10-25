import { expect, it } from "vitest";
import type { Vehicle } from "../../packages/domain/src/vehicles";
import { vehicleFormValues } from "./vehicle-form";

const text = { matricula: "AB-01-CD", Cliente: "9007199254740993", marca: "Marca  ", modelo: "Modelo", Ano: "2026", mes: "10" };

it("RULE-C9675195-013 malformed and overflowing year/month never produce nullable JSON writes", () => {
  for (const [field, invalid] of [["Ano", "1e3"], ["Ano", "-1"], ["Ano", "65536"], ["Ano", "9".repeat(400)], ["mes", "1.5"], ["mes", "abc"], ["mes", "256"], ["mes", " 1"], ["mes", "1\n"]]) {
    expect(vehicleFormValues({ ...text, [field]: invalid }, null, {})).toEqual({ kind: "invalid_numeric" });
  }
  const boundary = vehicleFormValues({ ...text, Ano: "65535", mes: "255" }, null, {});
  expect(boundary).toMatchObject({ kind: "values", values: { Ano: 65535, mes: 255, Cliente: text.Cliente, marca: "Marca  " } });
  expect(JSON.parse(JSON.stringify(boundary))).toEqual(boundary);
  expect(vehicleFormValues({ ...text, Ano: "", mes: "" }, null, {})).toMatchObject({ kind: "values", values: { Ano: 0, mes: 0 } });
});

it("SRC-0c045cf25e required messages precede later numeric draft failures", () => {
  const draft = { ...text, matricula: "", Cliente: "", marca: "", modelo: "", Ano: "invalid", mes: "invalid" };
  for (const [field, message] of [["matricula", "Falta indicar a matrícula"], ["Cliente", "Falta indicar o cliente"], ["marca", "Falta indicar a marca"], ["modelo", "Falta indicar o modelo"]] as const) {
    expect(vehicleFormValues(draft, null, {})).toEqual({ kind: "required", message });
    draft[field] = text[field];
  }
  expect(vehicleFormValues(draft, null, {})).toEqual({ kind: "invalid_numeric" });
});

it("RULE-C9675195-013 untouched oversized bound values, NULLs and exact identifiers survive unrelated edits", () => {
  const vehicle: Vehicle = { ...text, id: "9007199254740995", ViaturasID: "9007199254740996", Ano: 65535, mes: null };
  expect(vehicleFormValues({ ...text, Ano: "65535", mes: "0", modelo: "Edited" }, vehicle, { modelo: true }))
    .toMatchObject({ kind: "values", values: { Ano: 65535, mes: null, marca: "Marca  ", Cliente: "9007199254740993", modelo: "Edited" } });
  expect(vehicleFormValues(text, { ...vehicle, marca: null }, {})).toEqual({ kind: "required", message: "Falta indicar a marca" });
});

it("SRC-0c045cf25e readonly uppercase display never changes the original edit registration predicate", () => {
  const vehicle: Vehicle = { ...text, matricula: "ab-01-cd", id: "42", ViaturasID: "43", Ano: 2026, mes: 10 };
  expect(vehicleFormValues({ ...text, matricula: "AB-01-CD" }, vehicle, { matricula: true }))
    .toMatchObject({ kind: "values", values: { matricula: "ab-01-cd" } });
});
