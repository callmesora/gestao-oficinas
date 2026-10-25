/** ADR-004 production sessions remain in RAM. Explicit DEV routes retain ADR-009 bootstrap. */
export type WorkflowResource = "customers" | "vehicles" | "units" | "descriptive-states" | "terminals" | "postos" | "mechanics" | "repair-states" | "document-types" | "articles" | "users" | "repair-orders" | "repair-materials" | "repair-labor" | "stock" | "startup" | "reports" | "report-filters";
export const SESSION_EXPIRED_EVENT = "workshop-session-expired";
let business: { base: string; token: string | null } | null = null;
/** Only explicit loopback HTTP or HTTPS origins are accepted; credentials and URL paths are rejected. */
export function validatedApiBase(value: string): string {
  if (value === "") return "";
  const url = new URL(value);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash || (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "127.0.0.1"))) throw new Error("Invalid workshop API configuration");
  return url.origin;
}
export function configureBusinessTransport(base: string) { business = { base: validatedApiBase(base), token: null }; }
export function setBusinessSession(token: string) { if (!business || !/^[a-f0-9]{64}$/.test(token)) throw new Error("Invalid workshop session"); business.token = token; }
export function clearBusinessSession() { if (business) business.token = null; }
export async function authenticationPost<T>(operation: string, body: unknown): Promise<T> {
  if (!business) throw new Error("Workshop transport unavailable");
  const token = business.token;
  const result = await fetch(`${business.base}/api/auth/${operation}`, { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  if (!result.ok) throw new Error("Workshop authentication unavailable");
  return result.json() as Promise<T>;
}
export async function isolatedWorkflowPost(resource: WorkflowResource, failureMessage: string) {
  if (business) return async function post<T>(operation: string, body: unknown): Promise<T> {
    if (!business?.token) throw new Error("Workshop session required");
    const session = business, token = session.token;
    const result = await fetch(`${session.base}/api/${resource}/${operation}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (result.status === 401 && business === session && session.token === token) { session.token = null; window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT)); }
    if (!result.ok) throw new Error(failureMessage);
    return result.json() as Promise<T>;
  };
  const response = await fetch("/api/development/session", { method: "POST", headers: { "X-Isolated-Development": "1" } });
  if (!response.ok) throw new Error("Isolated workflow server unavailable");
  const { token } = await response.json() as { token: string };
  return async function post<T>(operation: string, body: unknown): Promise<T> {
    const result = await fetch(`/api/${resource}/${operation}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    if (!result.ok) throw new Error(failureMessage);
    return result.json() as Promise<T>;
  };
}
