import type { ReportFilterRepository } from "../application/report-filters";

/** ADR-009: isolated development session, same protected read contract used by the real caller. */
export async function isolatedReportFilterRepository(): Promise<ReportFilterRepository> {
  const session = await fetch("/api/development/session", { method: "POST", headers: { "X-Isolated-Development": "1" } });
  if (!session.ok) throw new Error("Isolated report filters unavailable");
  const { token } = await session.json() as { token: string };
  return { states: async input => {
    const result = await fetch("/api/report-filters/states", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(input) });
    if (!result.ok) throw new Error("Report filter request failed");
    return result.json();
  } };
}
