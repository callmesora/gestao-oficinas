import { orderReportPriority, type OrderReportRequest, type ReportContext, type StatementGroup, type ReportId } from "../../../../packages/domain/src/reports";

export type ReportDocument = { reportId: ReportId; html: string; css: string; unresolved: string[] };
type Control = { name: string; x: number; y?: number; width: number; height: number; value: string | null; border?: string; title?: boolean; auto?: boolean };
const width = 175.9;
export function escapeReportText(value: string | null): string {
  return (value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
export function band(name: string, height: number, controls: Control[], kind = ""): string {
  return `<div data-band="${name}" class="band ${kind}" style="display:block;height:${height}mm">${controls.map(control => {
    const edges = control.border ?? "";
    const border = [["T", "top"], ["B", "bottom"], ["L", "left"], ["R", "right"]].filter(([edge]) => edges.includes(edge)).map(([, side]) => `border-${side}:0.1mm solid white`).join(";");
    return `<div data-control="${control.name}" class="control${control.title ? " title" : ""}${control.auto ? " auto" : ""}" style="display:block;left:${control.x}mm;top:${control.y ?? 0}mm;width:${control.width}mm;height:${control.height}mm;${border}">${escapeReportText(control.value)}</div>`;
  }).join("")}</div>`;
}
function start(context: ReportContext, title: { x: number; width: number; value: string }): string {
  return band("START_OF_DOCUMENT", 20, [
    { name: "STC_Empresa", x: 0, width: 60, height: 6.615, value: context.company },
    { name: "CONTROL58", x: 144.18, width: 31.72, height: 6.76, value: context.dateText, auto: true },
    { name: "DOCTITLE", x: title.x, y: 6.615, width: title.width, height: 9.789, value: title.value, title: true, auto: true },
  ], "document-start");
}
function end(count: number, statement: boolean): string {
  const y = statement ? 6.005 : 9.262;
  return band("END_OF_DOCUMENT", statement ? 12.909 : 15.349, [
    { name: statement ? "COUNTERSTATIC" : "COUNTERSTATIC1", x: 0, y, width: 30.271, height: 6.085, value: statement ? "" : "Número de linhas:", auto: true },
    { name: statement ? "COUNTER" : "COUNTER1", x: 30.271, y, width: 16.338, height: 6.088, value: String(count), auto: true },
    { name: statement ? "PoweredWx" : "PoweredWx1", x: 134.998, y: statement ? 6.005 : 9.791, width: 40.902, height: 5.556, value: "Golfinho Software, Lda" },
  ], "document-end");
}
const row = (content: string) => `<tr><td>${content}</td></tr>`;
export function pageHeaderCss(height: number, sourceWidth = 175.9): string {
  // Paged.js0.4.3 does not repeat this positioned-band thead reliably. Its running-element
  // margin box repeats the real source header; first page keeps document-start before header.
  return `@page { margin-top:${20 + height}mm; @top-left { content:element(reportHeader); vertical-align:bottom; width:${sourceWidth}mm; } }
@page:first { margin-top:20mm; @top-left { content:none; } }
.running-header { position:running(reportHeader); width:${sourceWidth}mm; height:${height}mm; }`;
}
// Source paper/margins and all controls are in the two report specs/raw .wde definitions.
// Orientation/typeface/alignment/clipping remain explicit ADR005 evaluation defaults/U-R09/U-R20.
export const baseCss = `
@page { size:215.9mm 279.4mm; margin:20mm 20mm 26.614mm 20mm;
 @bottom-right { content:counter(page) "/" counter(pages); font-family:ReportSans; font-size:9pt; vertical-align:top; padding-top:0; height:6.614mm; }
}
* { box-sizing:border-box; } body { margin:0; font-family:ReportSans; font-size:8pt; color:#000; }
.report { width:${width}mm; } .band { width:${width}mm; position:relative; break-inside:avoid; }
.control { position:absolute; padding:0.6mm 0.3mm; white-space:pre-wrap; overflow:hidden; overflow-wrap:anywhere; }
.control.auto { height:auto !important; min-height:inherit; } .title { border:0.1mm solid #314653; border-radius:3mm; background:white; font-size:16pt; font-weight:700; text-align:center; }
table { border-collapse:collapse; width:${width}mm; table-layout:fixed; } thead { display:table-row-group; } td,th { padding:0; border:0; font-weight:normal; text-align:left; }
tr { break-inside:avoid; } .page-header { background:#819fb4; } .detail { background:#d4e3ed; }
.document-start,.document-end { background:linear-gradient(#fafafa,#e1e1e1); } .group-header { break-after:avoid; } .group-footer { break-before:avoid; }
html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
`;
type OrderColumn = { key: keyof OrderReportRequest["source"]["rows"][number]; caption: string; x: number; width: number };
const orderColumns: OrderColumn[] = [
  { key: "COL_Numero", caption: "Número", x: 0, width: 13.602 },
  { key: "COL_Cliente", caption: "Cliente", x: 13.494, width: 21.275 },
  { key: "COL_marca_modelo", caption: "Marca e Modelo", x: 34.660, width: 21.805 },
  { key: "COL_Matricula", caption: "Matrícula", x: 56.465, width: 15.984 },
  { key: "COL_Recepcao_datahora", caption: "Data/Hora recepção", x: 72.449, width: 31.064 },
  { key: "COL_Recepcao_entrega_prevista", caption: "Data prevista para entrega", x: 103.513, width: 20.746 },
  { key: "COL_Reparacao_estado", caption: "Estado", x: 124.259, width: 20.481 },
  { key: "COL_Recepcao_prioridade", caption: "Prioridade", x: 144.740, width: 16.248 },
  { key: "COL_Reparacao_mecanico", caption: "Mecânico", x: 160.867, width: 14.925 },
];
export function orderReportDocument(input: OrderReportRequest): ReportDocument {
  const header = band("PAGE_HEADER", 10.850, orderColumns.map(column => ({ ...column, name: `STC_${column.key}`, height: 10.848, value: column.caption, border: "TBL" })), "page-header");
  const details = input.source.rows.map(source => row(band("BODY", 6.200, orderColumns.map(column => ({
    ...column, name: `ITEM_${column.key}`, height: 6.085, border: column.key === "COL_Reparacao_mecanico" ? "BLR" : "BL",
    value: column.key === "COL_Recepcao_prioridade" ? orderReportPriority(source[column.key]) : source[column.key],
  })), "detail"))).join("");
  return { reportId: input.reportId, css: baseCss + pageHeaderCss(10.850), unresolved: ["U-R20-01", "U-R20-02", "U-R20-03", "U-R20-07"],
    html: `<div class="running-header">${header}</div><article class="report">${start(input.context, { x: 52.045, width: 71.810, value: "Ordens de Reparação" })}<table><thead>${row(header)}</thead><tbody>${details}</tbody></table>${end(input.source.rows.length, false)}</article>` };
}
export function statementReportDocument(context: ReportContext, groups: readonly StatementGroup[]): ReportDocument {
  const columns = [
    { name: "DATA", x: 0, width: 21.010, caption: "Data" }, { name: "Numero", x: 20.902, width: 21.010, caption: "Número" },
    { name: "Descricao", x: 41.804, width: 70.752, caption: "Descrição" }, { name: "NoName", x: 112.556, width: 20.481, caption: "" },
    { name: "NoName1", x: 133.037, width: 20.217, caption: "" }, { name: "NoName2", x: 153.254, width: 22.863, caption: "" },
  ];
  const header = band("PAGE_HEADER", 6.090, columns.map(column => ({ ...column, name: `STC_${column.name}`, height: 6.085, value: column.caption, border: "TBL" })), "page-header");
  const body = groups.map(group => {
    const heading = band("BREAK_HEADER1", 7, [
      { name: "STC_artigo", x: 0, width: 120.494, height: 6.879, value: `${group.article} - ${group.description ?? ""}` },
      { name: "STC_total_anterior", x: 126.050, width: 49.898, height: 6.879, value: `Total Anterior: ${group.opening}` },
    ], "group-header");
    const lines = group.lines.map(line => row(band("BODY", 6.350, [line.data, line.numero, line.Descricao, line.entrance, line.exit, line.balance].map((value, index) => ({
      ...columns[index], name: `ITEM_${["DATA", "Numero", "Descricao", "entrada", "saida", "total"][index]}`, height: 6.350, border: "BL", value,
    })), "detail"))).join("");
    const footer = band("BREAK_FOOTER1", 12, [{ name: "STC_total_final", x: 125.942, width: 49.850, height: 6.879, value: `Total Final: ${group.closing}` }], "group-footer");
    return row(heading) + lines + row(footer);
  }).join("");
  return { reportId: "RPT_Extrato_artigos", css: baseCss + pageHeaderCss(6.090), unresolved: ["U-R09-01", "U-R09-02", "U-R09-03", "U-R09-06", "U-R09-07"],
    // No source title/three numeric-header literals recovered: do not print designer placeholders.
    html: `<div class="running-header">${header}</div><article class="report">${start(context, { x: 54.427, width: 67.046, value: "" })}<table><thead>${row(header)}</thead><tbody>${body}</tbody></table>${end(groups.reduce((count, group) => count + group.lines.length, 0), true)}</article>` };
}
