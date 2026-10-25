import type { Client } from "pg";
import Decimal from "decimal.js";
import { dateOnlyComparisonKey, dateTimeComparisonKey, isDateOnlyBound, isDateTimeBound } from "../../../../packages/domain/src/date-time";
import { laborDuration, laborDurationDisplay, laborSumHours, OPEN_LABOR_FINISH } from "../../../../packages/domain/src/repair-labor-time";
import type { FamilyReportRequest, ReportRenderResult } from "../../../../packages/domain/src/reports";
import { flatReportDocument, fixedReportDocument, sourceBand, reportValue, type ReportValues } from "./fixed-layout";
import type { ReportDocument } from "./templates";

type FamilyResult = ReportDocument | Exclude<ReportRenderResult, { kind: "rendered" }>;
type Parameters = Record<string, string | null | string[]>;
const masterSources = {
  RPT_List_Clientes: { file: "Clientes", order: "ClientesID", fields: ["Codigo", "Descricao", "Morada1", "Morada2", "codpostal", "Telefone1", "Telemovel", "observacao"] },
  RPT_List_artigos: { file: "artigos", order: "artigosID", fields: ["Codigo", "Descricao", "codbarras", "unidade", "preco", "inativo"] },
  RPT_List_documentos: { file: "documentos", order: "documentosID", fields: ["Codigo", "Descricao", "stock", "obriga_macanico"] },
  RPT_List_estados_descritivos: { file: "estados_descritivos", order: "estados_descritivosID", fields: ["Codigo", "Descricao"] },
  RPT_List_estados_reparacao: { file: "estados_reparacao", order: "estados_reparacaoID", fields: ["Codigo", "Descricao", "tipo"] },
  RPT_List_mecanicos: { file: "mecanicos", order: "Codigo", fields: ["Codigo", "Descricao"] },
  RPT_List_unidades: { file: "unidades", order: "unidadesID", fields: ["Codigo", "Descricao"] },
  RPT_List_utilizadores: { file: "utilizadores", order: "utilizadoresID", fields: ["Codigo", "Descricao"] },
} as const;
function records(rows: Record<string, unknown>[]): ReportValues[] {
  return rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value === null ? null : typeof value === "boolean" ? value ? "1" : "0" : String(value)])));
}
async function query(client: Client, sql: string, parameters: unknown[] = []): Promise<ReportValues[]> {
  return records((await client.query(sql, parameters)).rows);
}
function parametersValid(parameters: Parameters, allowed: string[]): boolean {
  return Object.keys(parameters).every(key => allowed.includes(key)) && allowed.every(key => Object.hasOwn(parameters, key))
    && Object.entries(parameters).every(([key, value]) => key === "ParamEstados" ? value === null || Array.isArray(value) : value === null || typeof value === "string");
}
function bound(parameters: Parameters, key: string): string | null { const value = parameters[key]; return typeof value === "string" ? value : null; }
function datePredicate(value: string | null, from: string | null, to: string | null, dateOnly = false): boolean {
  // HFSQL explicit NULL disables this BETWEEN condition, retaining other predicates.
  if (from === null || to === null) return true;
  const key = dateOnly ? dateOnlyComparisonKey : dateTimeComparisonKey, raw = key(value);
  return raw !== null && raw >= key(from)! && raw <= key(to)!;
}
function validDates(parameters: Parameters, only = false): boolean {
  return ["ParamDaData", "ParamAData"].every(key => parameters[key] === null || typeof parameters[key] === "string" && (only ? isDateOnlyBound(parameters[key]) : isDateTimeBound(parameters[key])));
}
function exactSum(values: (string | null)[]): string | null {
  if (values.some(value => value === null || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value))) return null;
  const sizes = values.map(value => value!.replace(/^[+-]/, "").split("."));
  const Exact = Decimal.clone({ precision: sizes.reduce((max, parts) => Math.max(max, parts[0].length), 1) + sizes.reduce((max, parts) => Math.max(max, parts[1]?.length ?? 0), 0) + String(values.length + 1).length + 2, toExpNeg: -1_000_000, toExpPos: 1_000_000 });
  return values.reduce((sum, value) => sum.plus(value!), new Exact(0)).toFixed();
}
/** ADR002: source Date/DateTime ordering precedes lossless text transport, without rewriting values. */
function compareDates(left: string | null, right: string | null, dateOnly = false, descending = false): number {
  const key = dateOnly ? dateOnlyComparisonKey : dateTimeComparisonKey, first = key(left), last = key(right);
  // Retain the existing explicit NULLS LAST default, independent of source direction.
  if (first === null || last === null) return first === last ? 0 : first === null ? 1 : -1;
  const order = first < last ? -1 : first > last ? 1 : 0;
  return descending ? -order : order;
}
function sortedWithinGroups(rows: ReportValues[], group: string, date: string): ReportValues[] {
  const order = new Map<string | null, number>();
  for (const row of rows) if (!order.has(reportValue(row, group))) order.set(reportValue(row, group), order.size);
  return rows.sort((a, b) => order.get(reportValue(a, group))! - order.get(reportValue(b, group))!
    || compareDates(reportValue(a, date), reportValue(b, date)));
}

/** Explicit source consumption shapes: source joins differ deliberately between document/order branches. */
async function consumption(client: Client, request: FamilyReportRequest, params: Parameters): Promise<FamilyResult> {
  const vehicle = request.reportId.includes("Viatura");
  const allowed = vehicle ? ["ParamDaData", "ParamAData", "ParamDoArtigo", "ParamAoArtigo", "ParamDaViatura", "ParamAViatura"] : ["ParamDoArtigo", "ParamAoArtigo", "ParamDaData", "ParamAData", "ParamDescricao"];
  // Orders-only caller passes an extra description argument although its query has no such predicate.
  if (!parametersValid(params, allowed) || !validDates(params)) return { kind: "invalid" };
  const articleFrom = bound(params, "ParamDoArtigo"), articleTo = bound(params, "ParamAoArtigo");
  const articleWhere = articleFrom === null || articleTo === null ? "TRUE" : 'm."artigo" BETWEEN $1 AND $2';
  let rows: ReportValues[];
  if (vehicle) {
    rows = await query(client, `SELECT m."numero",m."data_hora",m."mecanico",m."artigo",m."descricao_artigo",m."quantidade",a."Codigo",a."Descricao",a."unidade",a."preco",o."numero" AS numero_or,o."matricula",o."recepcao_datahora",v."marca",v."modelo",e."Descricao" AS "Descricao_me"
      FROM app."material_reparacao" m INNER JOIN app."artigos" a ON a."Codigo"=m."artigo" INNER JOIN app."ordem_reparacao" o ON m."numero"=o."numero"
      INNER JOIN app."mecanicos" e ON m."mecanico"=e."Codigo" INNER JOIN app."Viaturas" v ON o."matricula"=v."matricula"
      WHERE ${articleWhere} AND ($3::text IS NULL OR $4::text IS NULL OR o."matricula" BETWEEN $3 AND $4)
      ORDER BY o."matricula",o."recepcao_datahora",m._row_id,a._row_id,o._row_id,e._row_id,v._row_id`, [articleFrom, articleTo, bound(params, "ParamDaViatura"), bound(params, "ParamAViatura")]);
    rows = sortedWithinGroups(rows.filter(row => datePredicate(row.data_hora, bound(params, "ParamDaData"), bound(params, "ParamAData"))), "matricula", "recepcao_datahora");
  } else {
    const stockBranch = `SELECT l."documento_numero",c."data",l."artigo",l."quantidade",a."Codigo" AS "Codigo_artigo",a."Descricao",a."unidade",d."Descricao" AS descricao_doc,'' AS matricula,e."Descricao" AS "Descricao_me",0 AS branch,l._row_id AS row_id
      FROM app."lin_stocks" l INNER JOIN app."documentos" d ON l."documento_codigo"=d."Codigo"
      INNER JOIN app."cab_stocks" c ON c."documento_numero"=l."documento_numero"
      INNER JOIN app."artigos" a ON l."artigo"=a."Codigo" LEFT JOIN app."mecanicos" e ON c."mecanico"=e."Codigo"
      WHERE d."stock"=2 AND ($1::text IS NULL OR $2::text IS NULL OR l."artigo" BETWEEN $1 AND $2)
      AND ($3::text IS NULL OR l."descricao_artigo" LIKE '%'||$3||'%')`;
    const orderBranch = `SELECT m."numero" AS documento_numero,m."data_hora" AS data,m."artigo",m."quantidade",a."Codigo" AS "Codigo_artigo",a."Descricao",a."unidade",'Ordem de reparaçªo' AS descricao_doc,o."matricula",e."Descricao" AS "Descricao_me",1 AS branch,m._row_id AS row_id
      FROM app."material_reparacao" m INNER JOIN app."artigos" a ON m."artigo"=a."Codigo" INNER JOIN app."ordem_reparacao" o ON o."numero"=m."numero"
      INNER JOIN app."mecanicos" e ON o."reparacao_mecanico"=e."Codigo"
      WHERE ($1::text IS NULL OR $2::text IS NULL OR m."artigo" BETWEEN $1 AND $2)`;
    const combined = request.reportId.endsWith("ordens_saidas") || request.reportId.endsWith("ordem_saidas");
    const ordersOnly = request.reportId.endsWith("Ordens") || request.reportId.endsWith("ordens");
    const sql = combined ? `${stockBranch} UNION ALL ${orderBranch}` : ordersOnly ? orderBranch : stockBranch;
    // Orders-only SQL has no $3: do not invent a description filter or extra bind.
    rows = await query(client, `${sql} ORDER BY artigo ASC,data ASC,branch,row_id`, ordersOnly ? [articleFrom, articleTo] : [articleFrom, articleTo, bound(params, "ParamDescricao")]);
    rows = sortedWithinGroups(rows.filter(row => datePredicate(row.data, bound(params, "ParamDaData"), bound(params, "ParamAData"))), "artigo", "data");
  }
  const body: string[] = [], values: ReportValues = {};
  if (request.reportId === "RPT_Consumo_Material_Resumo_ordem_saidas") {
    let groups = 0;
    for (let index = 0; index < rows.length;) {
      let end = index + 1; while (end < rows.length && rows[end].artigo === rows[index].artigo) end++;
      const group = rows.slice(index, end), total = exactSum(group.map(row => row.quantidade));
      if (total === null) return { kind: "unresolved", unresolved: ["U-R05-02: NULL quantity"] };
      body.push(sourceBand(request.reportId, "BREAK_HEADER1", group[0]), ...group.map(row => sourceBand(request.reportId, "BODY", row)), sourceBand(request.reportId, "BREAK_FOOTER1", { ...group.at(-1), ITEM_Soma: total }));
      groups++; index = end;
    }
    values.COUNTER = String(groups);
  } else {
    let previous: string | null | undefined;
    for (const row of rows) {
      if (vehicle && previous !== row.matricula) {
        if (previous !== undefined) body.push(sourceBand(request.reportId, "BREAK_FOOTER1", {}));
        body.push(sourceBand(request.reportId, "BREAK_HEADER1", { STC_matricula: row.matricula, STC_marca_modelo: `${row.marca ?? ""} ${row.modelo ?? ""}` })); previous = row.matricula;
      }
      body.push(sourceBand(request.reportId, "BODY", row));
    }
    if (vehicle && rows.length) body.push(sourceBand(request.reportId, "BREAK_FOOTER1", {}));
    if (request.reportId.includes("Descriminado") && !vehicle) {
      const total = exactSum(rows.map(row => row.quantidade));
      if (total === null) return { kind: "unresolved", unresolved: ["U-report: NULL quantity"] };
      values.STC_total = total;
    }
  }
  return fixedReportDocument(request.reportId, request.context, body, rows.length, values);
}

export async function familyReportDocument(client: Client, request: FamilyReportRequest): Promise<FamilyResult> {
  const source = masterSources[request.reportId as keyof typeof masterSources];
  if (source) {
    const rows = await query(client, `SELECT ${source.fields.map(field => `s."${field}"::text AS "${field}"`).join(",")} FROM app."${source.file}" s ORDER BY s."${source.order}" ASC NULLS LAST,s._row_id`);
    const document = flatReportDocument(request.reportId, request.context, rows);
    document.unresolved.push(`assumed: docs/evidence-report.md/${request.reportId}/embedded-query proposal`);
    return document;
  }
  if (request.reportId === "RPT_List_Viaturas") {
    const rows = await query(client, 'SELECT v."matricula",v."Cliente",v."marca",v."modelo",v."Ano",v."mes",c."Codigo",c."Descricao" FROM app."Viaturas" v INNER JOIN app."Clientes" c ON v."Cliente"=c."Codigo" ORDER BY v."matricula" ASC NULLS LAST,v._row_id,c._row_id');
    const document = flatReportDocument(request.reportId, request.context, rows); document.unresolved.push("assumed: docs/evidence-report.md/RPT_List_Viaturas/embedded-query proposal"); return document;
  }
  if (request.reportId === "RPT_inventario") return flatReportDocument(request.reportId, request.context,
    await query(client, 'SELECT "Codigo","Descricao","stock"::text FROM app."artigos" ORDER BY _row_id'));
  if (request.reportId === "RPT_Servico_Avaria" && request.source.kind === "programmatic" || request.reportId === "RPT_Materiais" && request.source.kind === "window-table") {
    const order = (await query(client, 'SELECT "numero","matricula","recepcao_cliente","recepcao_servico","recepcao_obs","recepacao_contatos" FROM app."ordem_reparacao" WHERE "numero"=$1 ORDER BY _row_id LIMIT 1', [request.source.orderNumber]))[0];
    const vehicle = order ? (await query(client, 'SELECT "marca","modelo" FROM app."Viaturas" WHERE "matricula"=$1 ORDER BY _row_id LIMIT 1', [order.matricula]))[0] : undefined;
    const customer = order ? (await query(client, 'SELECT "Descricao" FROM app."Clientes" WHERE "Codigo"=$1 ORDER BY _row_id LIMIT 1', [order.recepcao_cliente]))[0] : undefined;
    if (request.source.kind === "programmatic") return flatReportDocument(request.reportId, request.context, [{ item_matricula: order?.matricula ?? null,
      ITEM_Marca_Modelo: vehicle ? `${vehicle.marca ?? ""}  ${vehicle.modelo ?? ""}` : null, item_servico_avaria: order?.recepcao_servico ?? null, item_observacao: order?.recepcao_obs ?? null, item_contactos: order?.recepacao_contatos ?? null, item_cliente: customer?.Descricao ?? null }]);
    const information = order ? `Nrº Ordem Reparação: ${order.numero}` + (vehicle ? `\r\nMatrícula: ${order.matricula}   ${vehicle.marca ?? ""}/${vehicle.modelo ?? ""}` : "") + (customer ? `\r\nCliente: ${customer.Descricao ?? ""}` : "") : "";
    return flatReportDocument(request.reportId, request.context, request.source.rows, { STC_informacao: information, STC_Total_material: request.source.formattedTotal });
  }
  if (request.source.kind !== "query") return { kind: "invalid" };
  const params = request.source.parameters;
  if (request.reportId.startsWith("RPT_Consumo_")) return consumption(client, request, params);
  if (request.reportId === "RPT_Ordens_Reparacao_DataEntrega" || request.reportId === "RPT_Ordens_Reparacao_DataPag") {
    if (!parametersValid(params, ["ParamDaData", "ParamAData", "ParamEstados"]) || !validDates(params, true)) return { kind: "invalid" };
    const delivery = request.reportId === "RPT_Ordens_Reparacao_DataEntrega", field = delivery ? "recepcao_entrega_prevista" : "data_pagamento";
    let rows = await query(client, `SELECT o."numero",o."matricula",o."recepcao_datahora",o."${field}",o."total_pago",c."Descricao" AS "Cliente",s."Descricao" AS "Estado",(v."marca"||' ')||v."modelo" AS marcamodelo
      FROM app."ordem_reparacao" o INNER JOIN app."Viaturas" v ON v."matricula"=o."matricula" INNER JOIN app."Clientes" c ON c."Codigo"=v."Cliente"
      INNER JOIN app."estados_reparacao" s ON o."reparacao_estado"=s."Codigo" WHERE ($1::text[] IS NULL OR o."reparacao_estado"=ANY($1::text[]))${delivery ? ` ORDER BY o."${field}" DESC NULLS LAST,o._row_id,v._row_id,c._row_id,s._row_id` : ""}`, [params.ParamEstados]);
    rows = rows.filter(row => datePredicate(row[field], bound(params, "ParamDaData"), bound(params, "ParamAData"), true));
    // Only delivery has this source ORDER BY. Payment deliberately retains its unsorted query path.
    if (delivery) rows.sort((left, right) => compareDates(left[field], right[field], true, true));
    const total = exactSum(rows.map(row => row.total_pago));
    if (total === null) return { kind: "unresolved", unresolved: ["U-report: NULL automatic sum"] };
    return flatReportDocument(request.reportId, request.context, rows, { CALC_Total_pago: total });
  }
  return laborReport(client, request, params);
}

async function laborReport(client: Client, request: FamilyReportRequest, params: Parameters): Promise<FamilyResult> {
  const vehicle = request.reportId.endsWith("viatura"), order = request.reportId === "RPT_Tempos_Ordem_Reparacao", summary = request.reportId.endsWith("Resumo");
  const range = vehicle ? ["ParamDaViatura", "ParamAViatura"] : order ? ["ParamDaOrdem", "ParamAOrdem"] : ["ParamDoMecanico", "ParamAoMecanico"];
  if (!parametersValid(params, [...range, "ParamDaData", "ParamAData"]) || !validDates(params)) return { kind: "invalid" };
  const field = vehicle ? 'o."matricula"' : order ? 'o."numero"' : 'm."Codigo"';
  let rows = await query(client, `SELECT o."numero",o."matricula",o."recepcao_datahora",v."marca",v."modelo",t."mecanico",t."inicio",t."fim",m."Descricao"
    FROM app."ordem_reparacao" o INNER JOIN app."tempos_reparacao" t ON o."numero"=t."numero" INNER JOIN app."Viaturas" v ON o."matricula"=v."matricula" INNER JOIN app."mecanicos" m ON t."mecanico"=m."Codigo"
    WHERE ($1::${vehicle ? "text" : "numeric"} IS NULL OR $2::${vehicle ? "text" : "numeric"} IS NULL OR ${field} BETWEEN $1 AND $2)
    ORDER BY ${vehicle ? 'o."matricula",o."numero"' : order ? 'o."numero"' : 't."mecanico",o."recepcao_datahora"'},o._row_id,t._row_id,v._row_id,m._row_id`, [params[range[0]], params[range[1]]]);
  rows = rows.filter(row => datePredicate(row.inicio, bound(params, "ParamDaData"), bound(params, "ParamAData")));
  // QRY_tempos_ordem_reparacao_mecanico sorts reception datetime within each typed mechanic key.
  if (!vehicle && !order) rows = sortedWithinGroups(rows, "mecanico", "recepcao_datahora");
  const body: string[] = [], groupKey = vehicle ? "matricula" : order ? "numero" : "mecanico";
  for (let index = 0; index < rows.length;) {
    let end = index + 1; while (end < rows.length && rows[end][groupKey] === rows[index][groupKey]) end++;
    const outer = rows.slice(index, end), first = outer[0], outerHeader = order ? "BREAK_HEADER3" : "BREAK_HEADER1";
    body.push(sourceBand(request.reportId, outerHeader, { STC_numero: first.numero, DATA: first.recepcao_datahora, STC_matricula: first.matricula,
      STC_marca_modelo: `${first.marca ?? ""} ${first.modelo ?? ""}`, STC_NoName: first.Descricao, STC_mecanico: first.Descricao }));
    const outerTotals: string[] = [];
    for (let innerIndex = 0; innerIndex < outer.length;) {
      let innerEnd = innerIndex + 1; while (innerEnd < outer.length && (order || summary || outer[innerEnd].numero === outer[innerIndex].numero)) innerEnd++;
      const inner = outer.slice(innerIndex, innerEnd), times: string[] = [];
      if (!order && !summary) body.push(sourceBand(request.reportId, "BREAK_HEADER2", { STC_numero: inner[0].numero, DATA: inner[0].recepcao_datahora }));
      for (const row of inner) {
        const duration = laborDuration(row.inicio, row.fim);
        if (row.fim !== OPEN_LABOR_FINISH && duration === null) return { kind: "unresolved", unresolved: ["U-report: NULL/opaque labor datetime"] };
        const time = row.fim === OPEN_LABOR_FINISH ? "00:00" : laborDurationDisplay(duration); times.push(time);
        body.push(sourceBand(request.reportId, "BODY", { ...row, ITEM_tempo: time, ITEM_Tempo: time }));
      }
      if (!summary) body.push(sourceBand(request.reportId, order ? "BREAK_FOOTER3" : "BREAK_FOOTER2", { STC_total_horas: laborSumHours(times), DATA: inner.at(-1)?.recepcao_datahora ?? null }));
      outerTotals.push(laborSumHours(times));
      innerIndex = innerEnd;
    }
    if (!order) body.push(sourceBand(request.reportId, "BREAK_FOOTER1", { STC_total_horas1: laborSumHours(outerTotals) }));
    index = end;
  }
  return fixedReportDocument(request.reportId, request.context, body, rows.length);
}
