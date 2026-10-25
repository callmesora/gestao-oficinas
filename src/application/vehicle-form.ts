import { vehicleRequiredMessage, type Vehicle, type VehicleValues } from "../../packages/domain/src/vehicles";

export type VehicleFormText = { matricula: string; Cliente: string; marca: string; modelo: string; Ano: string; mes: string };

function unsignedDraft(text: string, maximum: number): number | undefined {
  if (/[^0-9]/.test(text)) return undefined;
  // ADR-003/U-C9675195-01/03: retain the existing explicit empty-to-zero default.
  const value = text === "" ? 0 : Number(text);
  return Number.isSafeInteger(value) && value <= maximum ? value : undefined;
}

/** WIN_Form_Viaturas.wdw:34–51 ordered required checks, then explicit ScreenToFile values. */
export function vehicleFormValues(text: VehicleFormText, vehicle: Vehicle | null, dirty: Partial<Record<keyof VehicleFormText, boolean>>) {
  const values: VehicleValues = {
    // Existing source SQL keeps its original codigo even after uppercasing the readonly display.
    matricula: vehicle ? vehicle.matricula ?? "" : text.matricula, Cliente: vehicle && !dirty.Cliente ? vehicle.Cliente : text.Cliente || "0",
    marca: vehicle && !dirty.marca ? vehicle.marca : text.marca,
    modelo: vehicle && !dirty.modelo ? vehicle.modelo : text.modelo,
    Ano: vehicle && !dirty.Ano ? vehicle.Ano : 0, mes: vehicle && !dirty.mes ? vehicle.mes : 0,
  };
  const required = vehicleRequiredMessage(values);
  if (required) return { kind: "required" as const, message: required };
  for (const [field, maximum] of [["Ano", 65535], ["mes", 255]] as const) {
    if (vehicle && !dirty[field]) continue;
    const value = unsignedDraft(text[field], maximum);
    // Reject before JSON serialization: NaN would otherwise silently become allowed NULL.
    if (value === undefined) return { kind: "invalid_numeric" as const };
    values[field] = value;
  }
  return { kind: "values" as const, values };
}
