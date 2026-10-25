import type { ReportRequest, ReportRenderResult } from "../../packages/domain/src/reports";
import { isolatedWorkflowPost } from "./workflow-http";

/** The shared transport owns the current RAM business session or explicit isolated DEV session. */
export async function isolatedReportRenderer(): Promise<(input: ReportRequest) => Promise<ReportRenderResult>> {
  const post = await isolatedWorkflowPost("reports", "Report request failed");
  return input => post<ReportRenderResult>("render", input);
}
