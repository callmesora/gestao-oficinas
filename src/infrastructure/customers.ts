import type { CustomerRepository } from "../application/customers";

export async function isolatedCustomerRepository(): Promise<CustomerRepository> {
  const response = await fetch("/api/development/session", { method: "POST", headers: { "X-Isolated-Development": "1" } });
  if (!response.ok) throw new Error("Isolated workflow server unavailable");
  const { token } = await response.json() as { token: string };
  async function post<T>(operation: string, body: unknown): Promise<T> {
    const result = await fetch(`/api/customers/${operation}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!result.ok) throw new Error("Customer request failed");
    return result.json() as Promise<T>;
  }
  return { list: filter => post("list", filter), save: command => post("save", command), remove: id => post("delete", { id }), checkDelete: id => post("check-delete", { id }) };
}
