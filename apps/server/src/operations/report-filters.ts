import { salesReportStatesSchema, type SalesReportStatesResult, type SalesReportState } from "../../../../packages/domain/src/report-filters";
import { connectOperationClient, closeOperationClient, type DatabaseConnection } from "../db/connection";

/** Verified WIN_Mapa_Vendas.wdw:337-348. No deduplication, active/type restriction or persistence. */
export async function listSalesReportStates(connect: DatabaseConnection, input: unknown): Promise<SalesReportStatesResult> {
  const parsed = salesReportStatesSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const flag = parsed.data.mode === "vendas" ? "pedir_data_entrega" : "pedir_data_pag";
    // UNRESOLVED U-W7DB489-03: source SQL has no ORDER BY; internal row order is a stable target fallback.
    const result = await client.query<Omit<SalesReportState, "checked">>(`SELECT _row_id::text AS id,"Codigo","Descricao" FROM app."estados_reparacao" WHERE "${flag}"=true ORDER BY _row_id`);
    return { kind: "loaded", states: result.rows.map(row => ({ ...row, checked: true })) };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}
