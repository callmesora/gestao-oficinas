import type { UnitRepository } from "../application/units";

export async function isolatedUnitRepository(): Promise<UnitRepository> {
  const response = await fetch("/api/development/session", { method: "POST", headers: { "X-Isolated-Development": "1" } });
  if (!response.ok) throw new Error("Isolated workflow server unavailable");
  const { token } = await response.json() as { token: string };
  async function post<T>(operation: string, body: unknown): Promise<T> {
    const result = await fetch(`/api/units/${operation}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!result.ok) throw new Error("Unit request failed");
    return result.json() as Promise<T>;
  }
  return { list: input => post("list", input), save: command => post("save", command), checkDelete: id => post("check-delete", { id }), remove: id => post("delete", { id }) };
}
