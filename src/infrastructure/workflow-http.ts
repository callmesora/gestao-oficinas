/** ADR-009: each isolated repository bootstraps its own expiring development session. */
export async function isolatedWorkflowPost(resource: "customers" | "vehicles" | "units" | "descriptive-states" | "terminals" | "postos" | "mechanics" | "repair-states" | "document-types" | "articles", failureMessage: string) {
  const response = await fetch("/api/development/session", { method: "POST", headers: { "X-Isolated-Development": "1" } });
  if (!response.ok) throw new Error("Isolated workflow server unavailable");
  const { token } = await response.json() as { token: string };
  return async function post<T>(operation: string, body: unknown): Promise<T> {
    const result = await fetch(`/api/${resource}/${operation}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!result.ok) throw new Error(failureMessage);
    return result.json() as Promise<T>;
  };
}
