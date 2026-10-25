import sourceLayouts from "./layouts.json" with { type: "json" };
import type { ReportContext, ReportId } from "../../../../packages/domain/src/reports";
import { band, intrinsicBand, reportBodyCss, pageHeaderCss, type ReportDocument } from "./templates";

export type ReportValues = Record<string, string | null>;
type SourceControl = { name: string; kind: string; x: number; y: number; width: number; height: number; visible: boolean; auto: boolean; divisible: boolean; item?: string; literal?: string; preset?: string; calculation?: string; border?: string };
type SourceBand = { name: string; width: number; height: number; controls: SourceControl[] };
type SourceLayout = { sourceSpec: string; paper: string; sourceKind: string; sourceName: string; unresolved: string[]; bands: SourceBand[] };
export const reportLayouts: Record<ReportId, SourceLayout> = sourceLayouts;
export function reportValue(values: ReportValues, item: string): string | null {
  const leaf = item.split(".").at(-1)!.toLocaleLowerCase("en-US");
  const entry = Object.entries(values).find(([name]) => name.toLocaleLowerCase("en-US") === leaf);
  return entry?.[1] ?? null;
}
export function sourceBand(reportId: ReportId, name: string, values: ReportValues): string {
  const layout = reportLayouts[reportId], source = layout.bands.find(item => item.name === name);
  if (!source) return "";
  const renderBand = reportId === "RPT_Servico_Avaria" && name === "BODY" || reportId === "RPT_Materiais" && ["START_OF_DOCUMENT", "END_OF_DOCUMENT"].includes(name) ? intrinsicBand : band;
  return renderBand(name, source.height, source.controls.filter(control => control.visible).map(control => {
    const assigned = Object.keys(values).find(key => key.toLocaleLowerCase("en-US") === control.name.toLocaleLowerCase("en-US"));
    return { ...control, value: assigned ? values[assigned] : control.item ? reportValue(values, control.item) : control.literal ?? "", title: control.name === "DOCTITLE" };
  }), name === "BODY" ? "detail" : name === "PAGE_HEADER" ? "page-header" : name === "START_OF_DOCUMENT" ? "document-start" : name === "END_OF_DOCUMENT" ? "document-end" : name.startsWith("BREAK_HEADER") ? "group-header" : "group-footer");
}
/** Only band assembly/geometry is shared; queries, grouping, event formulas stay explicit consumers. */
export function fixedReportDocument(reportId: ReportId, context: ReportContext, body: string[], count: number, values: ReportValues = {}): ReportDocument {
  const layout = reportLayouts[reportId], sourceWidth = layout.bands[0].width;
  const headerBand = layout.bands.find(item => item.name === "PAGE_HEADER"), footerBand = layout.bands.find(item => item.name === "PAGE_FOOTER");
  const all: ReportValues = { ...values, STC_Empresa: context.company, CONTROL58: context.dateText };
  for (const control of layout.bands.flatMap(item => item.controls)) if (control.calculation?.startsWith("Counter") && !Object.hasOwn(all, control.name)) all[control.name] = String(count);
  const header = sourceBand(reportId, "PAGE_HEADER", all), row = (html: string) => `<tr><td>${html}</td></tr>`;
  const paper = layout.paper === "A4" ? "210mm 297mm" : layout.paper === "A5" ? "148mm 210mm" : "215.9mm 279.4mm";
  const pageHeight = (layout.paper === "A4" ? 297 : layout.paper === "A5" ? 210 : 279.4) - 40 - (headerBand?.height ?? 0) - (footerBand?.height ?? 0);
  const intrinsic = reportId === "RPT_Servico_Avaria" || reportId === "RPT_Materiais";
  const pageNumber = footerBand?.controls.find(control => control.visible && control.preset === "[PAGENUM]/[NBPAGES]");
  // Declare only the source footer. Paged.js0.4.3 leaks content:none to later margin
  // boxes, so cancelling another template's footer would also hide this running header.
  const footerCss = pageNumber ? `@page{@bottom-left{content:counter(page) "/" counter(pages);font-family:ReportSans;font-size:9pt;vertical-align:top;margin-left:${pageNumber.x}mm;width:${pageNumber.width}mm;height:${pageNumber.height}mm;padding:0;}}` : "";
  const css = reportBodyCss + (headerBand ? pageHeaderCss(headerBand.height, sourceWidth) : "") + footerCss
    // Paged.js0.4.3 atpage.onAtPage replaces the whole margin map on a later partial
    // declaration. Keep every side here, including the source repeated-header reservation.
    + `@page{size:${paper};margin:${20 + (headerBand?.height ?? 0)}mm 20mm ${20 + (footerBand?.height ?? 0)}mm 20mm;}.report,.band,table{width:${sourceWidth}mm;}.running-header{width:${sourceWidth}mm;}`;
  return { reportId, unresolved: [...layout.unresolved], css,
    html: `${headerBand ? `<div class="running-header">${header}</div>` : ""}<article class="report"${intrinsic ? ` data-report-page-height="${pageHeight}" data-report-overflow="${reportId === "RPT_Servico_Avaria" ? "U-R23-01" : "U-R19-01"}"` : ""}>${sourceBand(reportId, "START_OF_DOCUMENT", all)}<table>${headerBand ? `<thead>${row(header)}</thead>` : ""}<tbody>${body.map(row).join("")}</tbody></table>${sourceBand(reportId, "END_OF_DOCUMENT", all)}</article>` };
}
export function flatReportDocument(reportId: ReportId, context: ReportContext, rows: ReportValues[], values: ReportValues = {}): ReportDocument {
  return fixedReportDocument(reportId, context, rows.map(row => sourceBand(reportId, "BODY", row)), rows.length, values);
}
