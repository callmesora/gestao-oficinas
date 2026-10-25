import type { SalesReportMode, SalesReportStatesResult } from "../../packages/domain/src/report-filters";

export interface ReportFilterRepository {
  states(input: { mode: SalesReportMode }): Promise<SalesReportStatesResult>;
}
