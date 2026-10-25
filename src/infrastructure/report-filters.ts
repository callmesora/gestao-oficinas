import type { ReportFilterRepository } from "../application/report-filters";
import { isolatedWorkflowPost } from "./workflow-http";

/** The shared transport owns the current RAM business session or explicit isolated DEV session. */
export async function isolatedReportFilterRepository(): Promise<ReportFilterRepository> {
  const post = await isolatedWorkflowPost("report-filters", "Report filter request failed");
  return { states: input => post("states", input) };
}
