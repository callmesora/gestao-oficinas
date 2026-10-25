import StockWorkflow from "./stock";
import { useStockReportPreview } from "./reports";
import { reportContext } from "./report-callers";

export default function StockReportsWorkflow({ mode = "documents" }: {
  mode?: "documents" | "inventory" | "rebuild" | "scanner" | "statement";
}) {
  const reports = useStockReportPreview(reportContext());
  return <><StockWorkflow mode={mode} onPreview={reports.onPreview} />{reports.element}</>;
}
