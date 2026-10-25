import type { ReportRequest, ReportRenderResult } from "../../packages/domain/src/reports";

/** Development-only session bootstrap matches the real workflow adapters; no anonymous report API. */
export async function isolatedReportRenderer(): Promise<(input: ReportRequest) => Promise<ReportRenderResult>> {
  const session = await fetch("/api/development/session", { method: "POST", headers: { "X-Isolated-Development": "1" } });
  if (!session.ok) throw new Error("Isolated report server unavailable");
  const { token } = await session.json() as { token: string };
  return async input => {
    const result = await fetch("/api/reports/render", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(input) });
    if (!result.ok) throw new Error("Report request failed");
    return result.json() as Promise<ReportRenderResult>;
  };
}
