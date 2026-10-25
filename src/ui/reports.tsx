import { useEffect, useRef, useState } from "react";
import { familyReportIds, type FamilyReportRequest, type ReportId, type ReportRequest, type ReportRenderResult, type ReportContext } from "../../packages/domain/src/reports";
import { isolatedReportRenderer } from "../infrastructure/reports";
import "./reports.css";

export type RenderReport = (request: ReportRequest) => Promise<ReportRenderResult>;
export function useReportPreview() {
  const [result, setResult] = useState<ReportRenderResult | null>(null), [busy, setBusy] = useState(false);
  const renderer = useRef<Promise<RenderReport> | null>(null), owner = useRef(0);
  useEffect(() => () => { owner.current++; }, []);
  const preview = async (request: ReportRequest) => {
    const current = ++owner.current; setBusy(true);
    try {
      const render = await (renderer.current ??= isolatedReportRenderer()), next = await render(request);
      if (owner.current === current) setResult(next);
    } catch { if (owner.current === current) setResult({ kind: "failed" }); }
    finally { if (owner.current === current) setBusy(false); }
  };
  return { preview, busy, element: result?.kind === "rendered" ? <ReportPreview result={result} close={() => setResult(null)} /> : result ? <output data-testid="report-diagnostic">{result.kind}</output> : null };
}
export type StockReportInput = { reportId: "RPT_inventario" | "RPT_Extrato_artigos"; from?: string | null; to?: string | null; articleFrom?: string; articleTo?: string };
/** Shared caller adapter; stock window retains its source Date8→day-bound preparation. */
export function useStockReportPreview(context: ReportContext) {
  const reports = useReportPreview();
  return { ...reports, onPreview(input: StockReportInput) {
    if (input.reportId === "RPT_inventario") void reports.preview({ reportId: input.reportId, context, source: { kind: "file" } });
    else if (typeof input.from === "string" && typeof input.to === "string" && typeof input.articleFrom === "string" && typeof input.articleTo === "string") {
      void reports.preview({ reportId: input.reportId, context, source: { kind: "query", from: input.from, to: input.to, openingCutoff: input.from, articleFrom: input.articleFrom, articleTo: input.articleTo } });
    }
  } };
}
/** Initial preview displays the exact paginated HTML used for its PDF. No print-device claim. */
export function ReportPreview({ result, close }: { result: Extract<ReportRenderResult, { kind: "rendered" }>; close: () => void }) {
  const pdfLink = useRef<HTMLAnchorElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const bytes = Uint8Array.from(atob(result.pdfBase64), character => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    if (pdfLink.current) pdfLink.current.href = url;
    return () => URL.revokeObjectURL(url);
  }, [result.pdfBase64]);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="report-preview" onCancel={event => { event.preventDefault(); close(); }}>
    <div className="report-preview-toolbar"><span>{result.reportId} · {result.pageCount}</span><a ref={pdfLink} download={`${result.reportId}.pdf`}>PDF</a><button onClick={close}>Fechar</button></div>
    <iframe title={result.reportId} sandbox="" srcDoc={result.html} />
  </dialog>;
}

/** Development defaults are explicit filter inputs; live-table reports must come from their real caller. */
function developmentSource(reportId: ReportId): ReportRequest["source"] {
  if (reportId.startsWith("RPT_List_")) return { kind: "embedded-query" };
  if (reportId === "RPT_inventario") return { kind: "file" };
  if (reportId === "RPT_Servico_Avaria") return { kind: "programmatic", orderNumber: "0" };
  if (reportId === "RPT_Extrato_artigos") return { kind: "query", from: "20000101000000", to: "20991231235959", articleFrom: "", articleTo: "ZZZZZZZZZZZZ", openingCutoff: "20000101000000" };
  let parameters: Extract<FamilyReportRequest["source"], { kind: "query" }>["parameters"];
  if (reportId.startsWith("RPT_Consumo_")) parameters = { ParamDaData: "20000101000000", ParamAData: "20991231235959", ParamDoArtigo: "", ParamAoArtigo: "ZZZZZZZZZZZZ", ...(reportId.includes("Viatura") ? { ParamDaViatura: "", ParamAViatura: "ZZZZZZZZZZZZ" } : { ParamDescricao: "" }) };
  else if (reportId.startsWith("RPT_Ordens_")) parameters = { ParamDaData: "20000101", ParamAData: "20991231", ParamEstados: null };
  else parameters = { ParamDaData: "20000101000000", ParamAData: "20991231235959", ...(reportId.endsWith("viatura") ? { ParamDaViatura: "", ParamAViatura: "ZZZZZZZZZZZZ" } : reportId === "RPT_Tempos_Ordem_Reparacao" ? { ParamDaOrdem: "0", ParamAOrdem: "18446744073709551615" } : { ParamDoMecanico: "0", ParamAoMecanico: "255" }) };
  return { kind: "query", parameters };
}
export default function ReportsWorkflow() {
  const reports = useReportPreview();
  const [reportId, setReportId] = useState<ReportId>("RPT_Extrato_artigos");
  const [source, setSource] = useState<ReportRequest["source"]>(() => developmentSource("RPT_Extrato_artigos"));
  const [company, setCompany] = useState("");
  const fields = source.kind === "query" && "parameters" in source ? source.parameters : source.kind === "query" ? Object.fromEntries(Object.entries(source).filter(([key]) => key !== "kind")) : source.kind === "programmatic" ? { orderNumber: source.orderNumber } : {};
  return <main className="report-development"><aside>Desenvolvimento isolado — relatórios iniciais. Impressão nativa e comparação WINDEV pendentes.</aside>
    <form onSubmit={event => { event.preventDefault(); if (reports.busy) return; const today = new Date();
      const dateText = [String(today.getDate()).padStart(2, "0"), String(today.getMonth() + 1).padStart(2, "0"), String(today.getFullYear())].join("/");
      void reports.preview({ reportId, context: { company, dateText }, source } as ReportRequest);
    }}><h1>Relatórios</h1>
      <label>Relatório<select value={reportId} onChange={event => { const id = event.currentTarget.value as ReportId; setReportId(id); setSource(developmentSource(id)); }}>
        {["RPT_Ordens_Reparacao", "RPT_Extrato_artigos", ...familyReportIds].map(id => <option key={id} value={id} disabled={id === "RPT_Ordens_Reparacao" || id === "RPT_Materiais"}>{id}</option>)}
      </select></label>
      <label>STC_Empresa<input value={company} onChange={event => setCompany(event.currentTarget.value)} /></label>
      {Object.entries(fields).map(([key, value]) => <label key={key}>{key}<input disabled={value === null} value={Array.isArray(value) ? value.join(";") : value ?? ""} onChange={event => {
        const text = event.currentTarget.value;
        setSource(previous => previous.kind === "query" && "parameters" in previous ? { ...previous, parameters: { ...previous.parameters, [key]: key === "ParamEstados" ? text.split(";") : text } } : { ...previous, [key]: text });
      }} />{source.kind === "query" && "parameters" in source && <span><input type="checkbox" aria-label={`${key} NULL`} checked={value === null} onChange={event => {
        const cleared = event.currentTarget.checked;
        setSource(previous => previous.kind === "query" && "parameters" in previous ? { ...previous, parameters: { ...previous.parameters, [key]: cleared ? null : key === "ParamEstados" ? [] : "" } } : previous);
      }} />NULL</span>}</label>)}
      <button disabled={reports.busy}>Pré-visualizar</button>
    </form>{reports.element}
  </main>;
}
