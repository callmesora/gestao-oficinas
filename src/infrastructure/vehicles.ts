import type { VehicleRepository } from "../application/vehicles";

export async function isolatedVehicleRepository(): Promise<VehicleRepository> {
  const response = await fetch("/api/development/session", { method: "POST", headers: { "X-Isolated-Development": "1" } });
  if (!response.ok) throw new Error("Isolated workflow server unavailable");
  const { token } = await response.json() as { token: string };
  async function post<T>(operation: string, body: unknown): Promise<T> {
    const result = await fetch(`/api/vehicles/${operation}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!result.ok) throw new Error("Vehicle request failed");
    return result.json() as Promise<T>;
  }
  return { list: filter => post("list", filter), lookup: registration => post("lookup", { registration }), save: command => post("save", command), checkDelete: registration => post("check-delete", { registration }), remove: registration => post("delete", { registration }) };
}
