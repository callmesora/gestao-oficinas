import type { OrderReportRequest, ReportContext } from "../../packages/domain/src/reports";
import type { RepairOrderList, RepairOrderListRow } from "../../packages/domain/src/repair-orders";
import { dateEntryDisplay } from "../../packages/domain/src/date-entry";
import { dateTimeEntryDisplay } from "../../packages/domain/src/date-time";

/** RPT_Ordens_Reparacao consumes the ACTUAL caller rows/current order, with inherited visible dates.
 * Keep the filter that produced those rows, not a changed/unsubmitted filter draft (ADR005).
 */
export function repairOrderReportSnapshot(rows: readonly RepairOrderListRow[], filter: RepairOrderList, context: ReportContext): OrderReportRequest {
  return { reportId: "RPT_Ordens_Reparacao", context: { ...context }, source: {
    kind: "window-table", window: "WIN_Ordens_Reparacao", table: "TABLE_QRY_select_ordens_reparacao",
    filter: { ...filter, states: [...filter.states] }, rows: rows.map(row => ({
      COL_Numero: row.numero, COL_Cliente: row.Descricao_Cliente, COL_marca_modelo: row.marcamodelo,
      COL_Matricula: row.matricula, COL_Recepcao_datahora: dateTimeEntryDisplay(row.recepcao_datahora),
      COL_Recepcao_entrega_prevista: dateEntryDisplay(row.recepcao_entrega_prevista), COL_Reparacao_estado: row.Descricao,
      COL_Recepcao_prioridade: row.recepcao_prioridade === null ? null : String(row.recepcao_prioridade), COL_Reparacao_mecanico: row.Descricao_me,
    })),
  } };
}
