import { z } from "zod";
import Decimal from "decimal.js";
import { dateTimeComparisonKey, isDateTimeBound } from "./date-time";
import { repairOrderListSchema } from "./repair-orders";
import { reportIntegerBound, reportParametersValid } from "./report-contracts";

const text = z.string().nullable();
export const reportContextSchema = z.strictObject({ company: z.string(), dateText: z.string() });
export const orderReportRowSchema = z.strictObject({
  COL_Numero: text, COL_Cliente: text, COL_marca_modelo: text, COL_Matricula: text,
  COL_Recepcao_datahora: text, COL_Recepcao_entrega_prevista: text, COL_Reparacao_estado: text,
  COL_Recepcao_prioridade: text, COL_Reparacao_mecanico: text,
});
export const orderReportSchema = z.strictObject({
  reportId: z.literal("RPT_Ordens_Reparacao"), context: reportContextSchema,
  source: z.strictObject({ kind: z.literal("window-table"), window: z.literal("WIN_Ordens_Reparacao"),
    table: z.literal("TABLE_QRY_select_ordens_reparacao"), filter: repairOrderListSchema,
    rows: z.array(orderReportRowSchema),
  }),
});
export const articleStatementSchema = z.strictObject({
  reportId: z.literal("RPT_Extrato_artigos"), context: reportContextSchema,
  // WIN_Extrato_Artigos.wdw:412-422: caller order and separate print argument retained.
  source: z.strictObject({ kind: z.literal("query"), from: z.string().refine(isDateTimeBound), to: z.string().refine(isDateTimeBound),
    articleFrom: z.string(), articleTo: z.string(), openingCutoff: z.string().refine(isDateTimeBound) }),
});
export const familyReportIds = [
  "RPT_List_Clientes", "RPT_List_Viaturas", "RPT_List_artigos", "RPT_List_documentos", "RPT_List_estados_descritivos", "RPT_List_estados_reparacao", "RPT_List_mecanicos", "RPT_List_unidades", "RPT_List_utilizadores", "RPT_inventario",
  "RPT_Consumo_Material_Descriminado_Ordens", "RPT_Consumo_Material_Descriminado_Saidas", "RPT_Consumo_Material_Descriminado_ordens_saidas", "RPT_Consumo_Material_Resumo_Saidas", "RPT_Consumo_Material_Resumo_ordem_saidas", "RPT_Consumo_Material_Resumo_ordens", "RPT_Consumo_Material_Viatura_Descriminado", "RPT_Consumo_Material_Viatura_Resumo",
  "RPT_Ordens_Reparacao_DataEntrega", "RPT_Ordens_Reparacao_DataPag", "RPT_Tempos_Ordem_Reparacao", "RPT_Tempos_Ordem_Reparacao_Mecanico", "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo", "RPT_Tempos_Ordem_Reparacao_viatura", "RPT_Materiais", "RPT_Servico_Avaria",
] as const;
const familySourceSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("embedded-query") }), z.strictObject({ kind: z.literal("file") }),
  z.strictObject({ kind: z.literal("query"), parameters: z.record(z.string(), z.union([text, z.array(z.string())])) }),
  z.strictObject({ kind: z.literal("window-table"), window: z.literal("WIN_Table_Tempos_materiais_Descricoes"), table: z.literal("TABLE_materiais"),
    rows: z.array(z.record(z.string(), text)), orderNumber: z.string().refine(reportIntegerBound), formattedTotal: z.string() }),
  z.strictObject({ kind: z.literal("programmatic"), orderNumber: z.string().refine(reportIntegerBound) }),
]);
export const familyReportSchema = z.strictObject({ reportId: z.enum(familyReportIds), context: reportContextSchema, source: familySourceSchema }).refine(input => {
  const expected = input.reportId.startsWith("RPT_List_") ? "embedded-query" : input.reportId === "RPT_inventario" ? "file" : input.reportId === "RPT_Materiais" ? "window-table" : input.reportId === "RPT_Servico_Avaria" ? "programmatic" : "query";
  return input.source.kind === expected && (input.source.kind !== "query" || reportParametersValid(input.reportId, input.source.parameters));
});
export const reportRequestSchema = z.discriminatedUnion("reportId", [orderReportSchema, articleStatementSchema, familyReportSchema]);
export type FamilyReportRequest = z.infer<typeof familyReportSchema>;
export type ReportId = "RPT_Ordens_Reparacao" | "RPT_Extrato_artigos" | typeof familyReportIds[number];
export type ReportRequest = z.infer<typeof reportRequestSchema>;
export type OrderReportRequest = z.infer<typeof orderReportSchema>;
export type ArticleStatementRequest = z.infer<typeof articleStatementSchema>;
export type OrderReportRow = z.infer<typeof orderReportRowSchema>;
export type ReportContext = z.infer<typeof reportContextSchema>;
export type StatementMovement = { numero: string | null; artigo: string; descricao_artigo: string | null;
  quantidade: string | null; Descricao: string | null; data: string | null; stock: number | null };
export type StatementLine = StatementMovement & { entrance: string; exit: string; balance: string };
export type StatementGroup = { article: string; description: string | null; opening: string; lines: StatementLine[]; closing: string };
export type ReportRenderResult = { kind: "rendered"; reportId: ReportRequest["reportId"]; html: string; pdfBase64: string; pageCount: number; unresolved: string[] }
  | { kind: "invalid" | "failed" | "unavailable" } | { kind: "unresolved"; unresolved: string[] };

/** Source report BODY:362-369 has no fallback assignment; keep the bound value. */
export function orderReportPriority(value: string | null): string | null {
  return value === "1" ? "Normal" : value === "2" ? "Elevada" : value === "3" ? "Urgente" : value;
}

/** Same lossless comparison projection as the real repair-list consumer (ADR002/005). */
export function movementWithin(row: StatementMovement, from: string, to: string): boolean {
  const value = dateTimeComparisonKey(row.data);
  return value !== null && value >= dateTimeComparisonKey(from)! && value <= dateTimeComparisonKey(to)!;
}

/** RPT_Extrato_artigos.wde:263-278,419-429,473. Inputs are already in source query order.
 * Article breaks are an explicit ADR005 inference, not recovered designer metadata.
 * Unknown stock retains entrance/exit controls; NULL quantity on an arithmetic branch is unresolved.
 */
export function statementGroups(current: readonly StatementMovement[], historical: readonly StatementMovement[]):
  { kind: "built"; groups: StatementGroup[] } | { kind: "unresolved"; unresolved: string[] } {
  const activeArticles = new Set(current.map(row => row.artigo));
  // The legacy historical query runs only when a current article's break header prints.
  const amounts = [...current, ...historical.filter(row => activeArticles.has(row.artigo))].filter(row => row.stock === 1 || row.stock === 2).map(row => row.quantidade);
  if (amounts.some(value => value === null || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value))) {
    return { kind: "unresolved", unresolved: ["U-R09-02: arithmetic quantity NULL/invalid"] };
  }
  // Decimal's default precision20 would round large imported quantities. Size from every operand.
  const sizes = amounts.map(value => value!.replace(/^[+-]/, "").split("."));
  const precision = sizes.reduce((max, parts) => Math.max(max, parts[0].length), 1)
    + sizes.reduce((max, parts) => Math.max(max, parts[1]?.length ?? 0), 0) + String(amounts.length + 1).length + 2;
  const Exact = Decimal.clone({ precision, toExpNeg: -1_000_000, toExpPos: 1_000_000 });
  const groups: StatementGroup[] = [];
  let entrance = "", exit = "";
  for (const row of current) {
    let group = groups.at(-1);
    if (!group || group.article !== row.artigo) {
      let opening = new Exact(0);
      for (const prior of historical) if (prior.artigo === row.artigo) {
        if (prior.stock === 1) opening = opening.plus(prior.quantidade!);
        else if (prior.stock === 2) opening = opening.minus(prior.quantidade!);
      }
      group = { article: row.artigo, description: row.descricao_artigo, opening: opening.toFixed(), lines: [], closing: opening.toFixed() };
      groups.push(group);
    }
    let balance = new Exact(group.closing);
    if (row.stock === 1) { entrance = row.quantidade!; exit = ""; balance = balance.plus(row.quantidade!); }
    else if (row.stock === 2) { entrance = ""; exit = row.quantidade!; balance = balance.minus(row.quantidade!); }
    group.closing = balance.toFixed();
    group.lines.push({ ...row, entrance, exit, balance: group.closing });
  }
  return { kind: "built", groups };
}
