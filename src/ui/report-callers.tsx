import type { ReportContext, ReportId } from "../../packages/domain/src/reports";
import { useReportPreview } from "./reports";

/** Company text remains blank until the evidenced parent supplies it; no invented business label. */
export function reportContext(company = ""): ReportContext {
  const date = new Date(), pad = (value: number) => String(value).padStart(2, "0");
  return { company, dateText: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` };
}

/** These source reports run their own embedded query, independently of the management list filter. */
export function useListReportPreview(reportId: Extract<ReportId, `RPT_List_${string}`>) {
  const reports = useReportPreview();
  return { busy: reports.busy, element: reports.element, preview: () => void reports.preview({ reportId, context: reportContext(), source: { kind: "embedded-query" } }) };
}
