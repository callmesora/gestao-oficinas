import { connectOperationClient, closeOperationClient, rollbackAfterFailure, type DatabaseConnection } from "../db/connection";
import { reportRequestSchema, movementWithin, statementGroups, type ArticleStatementRequest, type StatementMovement, type ReportRenderResult } from "../../../../packages/domain/src/reports";
import { dateTimeComparisonKey } from "../../../../packages/domain/src/date-time";
import type { ReportRenderer } from "../reports/renderer";
import { orderReportDocument, statementReportDocument, type ReportDocument } from "../reports/templates";
import { familyReportDocument } from "../reports/families";

/** dossier: QRY_union_extrato_artigos/sql, QRY_union_extrato_artigos_calcular_total/sql.
 * Joins include BOTH document code and number; UNION ALL retains duplicates and order-material
 * uses reception datetime, not material datetime. No master-file joins or deduplication added.
 * The dossier's uncertain constant spelling is retained verbatim under U-R09-06.
 */
const statementSql = `SELECT l."documento_numero"::text AS numero,l."artigo",l."descricao_artigo",l."quantidade"::text,
 d."Descricao",c."data",d."stock",0 AS branch,l._row_id AS line_id,c._row_id AS header_id,d._row_id AS type_id
 FROM app."lin_stocks" l INNER JOIN app."cab_stocks" c ON c."documento_codigo"=l."documento_codigo" AND c."documento_numero"=l."documento_numero"
 INNER JOIN app."documentos" d ON d."Codigo"=c."documento_codigo"
 WHERE l."artigo" BETWEEN $1 AND $2
 UNION ALL
 SELECT m."numero"::text,m."artigo",m."descricao_artigo",m."quantidade"::text,
 'Ordem de reparaçªo',o."recepcao_datahora",2,1,m._row_id,o._row_id,0::bigint
 FROM app."material_reparacao" m INNER JOIN app."ordem_reparacao" o ON m."numero"=o."numero"
 WHERE m."artigo" BETWEEN $1 AND $2
 ORDER BY artigo ASC, data ASC, branch,line_id,header_id,type_id`;

export async function renderReport(connect: DatabaseConnection | undefined, renderer: ReportRenderer, input: unknown, configuredCompany?: string): Promise<ReportRenderResult> {
  const parsed = reportRequestSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  // My_GestaoOficinas.wdp697 / every report Open: use the initialized project global.
  // ADR005 keeps caller dates/live rows intact and never mutates the submitted context.
  const request = configuredCompany === undefined ? parsed.data : { ...parsed.data, context: { ...parsed.data.context, company: configuredCompany } };
  // A table-sourced report consumes ONLY the explicit live-table snapshot. No DB read substitutes it.
  if (request.reportId === "RPT_Ordens_Reparacao") return renderDocument(renderer, orderReportDocument(request));
  if (!connect) return { kind: "unavailable" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  let document: ReportDocument | Exclude<ReportRenderResult, { kind: "rendered" }>;
  try {
    // ADR005 target default: source Open lookups and result rows share one immutable
    // database snapshot, even when another user edits between the individual reads.
    // No database client/transaction survives into pagination or an OS output dialog.
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    document = request.reportId === "RPT_Extrato_artigos" ? await statementDocument(client, request) : await familyReportDocument(client, request);
    await client.query("COMMIT");
  } catch { await rollbackAfterFailure(client); return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
  return "html" in document ? renderDocument(renderer, document) : document;
}

async function renderDocument(renderer: ReportRenderer, document: ReportDocument): Promise<ReportRenderResult> {
  try { return await renderer(document); } catch { return { kind: "failed" }; }
}

async function statementDocument(client: Client, request: ArticleStatementRequest): Promise<ReportDocument | Exclude<ReportRenderResult, { kind: "rendered" }>> {
  const result = await client.query<StatementMovement>(statementSql, [request.source.articleFrom, request.source.articleTo]);
  // Same pure representation-aware datetime comparison as ADR002's real repair list.
  // Applying date predicates after parameterized source joins preserves multiplicity.
  const current = result.rows.filter(row => movementWithin(row, request.source.from, request.source.to));
  const articleOrder = new Map<string, number>();
  for (const row of current) if (!articleOrder.has(row.artigo)) articleOrder.set(row.artigo, articleOrder.size);
  current.sort((left, right) => articleOrder.get(left.artigo)! - articleOrder.get(right.artigo)!
    || (dateTimeComparisonKey(left.data)! < dateTimeComparisonKey(right.data)! ? -1 : dateTimeComparisonKey(left.data)! > dateTimeComparisonKey(right.data)! ? 1 : 0));
  const historical = result.rows.filter(row => movementWithin(row, "20000101000000", request.source.openingCutoff));
  const groups = statementGroups(current, historical);
  if (groups.kind !== "built") return groups;
  return statementReportDocument(request.context, groups.groups);
}
import type { Client } from "pg";
