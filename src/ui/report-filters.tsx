import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { dateEntryInitial, dateEntryResult } from "../../packages/domain/src/date-entry";
import { materialReportDispatch, laborReportDispatch, salesReportDispatch, reportPickerRange, materialReportModes, laborReportModes,
  materialReportTitles, laborReportTitles, type MaterialReportMode, type LaborReportMode, type SalesReportMode, type SalesReportState, type ReportFilterDispatch } from "../../packages/domain/src/report-filters";
import type { FamilyReportRequest, ReportContext } from "../../packages/domain/src/reports";
import type { ArticleRepository } from "../application/articles";
import type { MechanicRepository } from "../application/mechanics";
import type { VehicleRepository } from "../application/vehicles";
import type { CustomerRepository } from "../application/customers";
import type { ReportFilterRepository } from "../application/report-filters";
import { isolatedArticleRepository } from "../infrastructure/articles";
import { isolatedMechanicRepository } from "../infrastructure/mechanics";
import { isolatedVehicleRepository } from "../infrastructure/vehicles";
import { isolatedCustomerRepository } from "../infrastructure/customers";
import { isolatedReportFilterRepository } from "../infrastructure/report-filters";
import { ArticlePicker } from "./articles";
import { MechanicPicker } from "./mechanics";
import { VehiclePicker } from "./vehicles";
import { useReportPreview } from "./reports";
import { materialReportFilterLayout, laborReportFilterLayout, salesReportFilterLayout } from "./report-filters-layouts";
import { controlOf, type LegacyControl, type LegacyLayout } from "./legacy/layout";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { WdDateEdit, type WdDateEditHandle } from "./legacy/date";
import { WdButton, WdCheckbox, WdCheckMark } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { DialogProvider } from "./legacy/dialogs";
import "./report-filters.css";

export type ReportFilterPreview = (request: FamilyReportRequest) => Promise<void> | void;
export type ReportFilterRepositories = { articles: ArticleRepository; mechanics: MechanicRepository; vehicles: VehicleRepository; customers: CustomerRepository; reports: ReportFilterRepository };
type CallerProps = { context: ReportContext; today: string; onPreview: ReportFilterPreview };

function useFilterDates(today: string) {
  const [from, setFrom] = useState(() => dateEntryInitial(today)), [to, setTo] = useState(() => dateEntryInitial(today));
  const fromRef = useRef<WdDateEditHandle>(null), toRef = useRef<WdDateEditHandle>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  return { from, to, invalid,
    bindFrom: (handle: WdDateEditHandle | null) => { fromRef.current = handle; }, bindTo: (handle: WdDateEditHandle | null) => { toRef.current = handle; },
    setFrom: (draft: typeof from) => { setFrom(draft); setInvalid(null); }, setTo: (draft: typeof to) => { setTo(draft); setInvalid(null); },
    read: () => {
      if (fromRef.current?.validateCalendar() === false) return null;
      const first = dateEntryResult(from);
      if (first.kind !== "valid") { setInvalid("from"); fromRef.current?.focus(); return null; }
      if (toRef.current?.validateCalendar() === false) return null;
      const last = dateEntryResult(to);
      if (last.kind !== "valid") { setInvalid("to"); toRef.current?.focus(); return null; }
      setInvalid(null); return { from: first.value, to: last.value };
    },
  };
}
function DateFields({ dates: { from, to, setFrom, setTo, bindFrom, bindTo, invalid }, layout, fromName, toName, disabled }: { dates: ReturnType<typeof useFilterDates>; layout: LegacyLayout; fromName: string; toName: string; disabled: boolean }) {
  return <><WdDateEdit control={controlOf(layout, fromName)} draft={from} onChange={setFrom} ref={bindFrom} invalid={invalid === "from"} disabled={disabled} />
    <WdDateEdit control={controlOf(layout, toName)} draft={to} onChange={setTo} ref={bindTo} invalid={invalid === "to"} disabled={disabled} /></>;
}
function useCaller(onPreview: ReportFilterPreview) {
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const owner = useRef(0), pending = useRef(false);
  useEffect(() => () => { owner.current++; }, []);
  return { busy, diagnostic, run: async (dispatch: ReportFilterDispatch) => {
    if (pending.current) return;
    if (dispatch.kind === "no-report") { setDiagnostic(""); return; }
    if (dispatch.kind !== "ready") { setDiagnostic(dispatch.kind); return; }
    pending.current = true; setBusy(true); setDiagnostic(""); const current = ++owner.current;
    try { await onPreview(dispatch.request); }
    catch { if (owner.current === current) setDiagnostic("transport"); }
    finally { if (owner.current === current) { pending.current = false; setBusy(false); } }
  } };
}
function FilterBody({ name, busy, children }: { name: string; busy: boolean; children: ReactNode }) {
  const close = useWorkspaceClose();
  return <div data-testid={name} className="report-filter-body" onKeyDown={event => {
    // U-WCD4890-02/U-WA6D3FA-02/U-W7DB489-02: same reversible workspace close default as existing lists.
    if (event.key === "Escape" && !busy && !event.defaultPrevented && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div className="report-filter-controls">{children}</div></div>;
}

/** WIN_Filtro_Mapas_Artigos: immutable caller mode controls source plane; no duplicated hidden inputs. */
export function MaterialReportFilter({ mode, repositories, context, today, onPreview }: CallerProps & { mode: MaterialReportMode; repositories: Pick<ReportFilterRepositories, "articles" | "vehicles" | "customers"> }) {
  const layout = materialReportFilterLayout(mode), dates = useFilterDates(today), caller = useCaller(onPreview);
  const [article, setArticle] = useState({ from: "", to: "zzzzzzzzzz" }), [vehicle, setVehicle] = useState({ from: "", to: "" });
  const [description, setDescription] = useState(""), [orders, setOrders] = useState(false), [stockOut, setStockOut] = useState(false);
  const [picker, setPicker] = useState<{ kind: "article" | "vehicle"; lower: boolean; origin: string } | null>(null);
  const byVehicle = mode.endsWith("viatura"), detailed = mode === "descriminado", articleSuffix = byVehicle ? "1" : detailed ? "2" : "";
  const lowerButton = byVehicle ? "BTN_VISION4" : detailed ? "BTN_VISION8" : "BTN_VISION6", upperButton = byVehicle ? "BTN_VISION3" : detailed ? "BTN_VISION7" : "BTN_VISION5";
  const previewName = byVehicle ? "BTN_Visualizar_impressão1" : "BTN_Visualizar_impressão";
  const bindings: WdRadBinding[] = [
    { name: `EDT_Do_artigo${articleSuffix}`, kind: "edit", props: { value: article.from, disabled: caller.busy, onChange: event => { const from = event.currentTarget.value; setArticle(previous => ({ ...previous, from })); } } },
    { name: lowerButton, kind: "button", props: { disabled: caller.busy, onClick: () => setPicker({ kind: "article", lower: true, origin: article.from }) } },
    { name: `EDT_Ao_artigo${articleSuffix}`, kind: "edit", props: { value: article.to, disabled: caller.busy, onChange: event => { const to = event.currentTarget.value; setArticle(previous => ({ ...previous, to })); } } },
    { name: upperButton, kind: "button", props: { disabled: caller.busy, onClick: () => setPicker({ kind: "article", lower: false, origin: article.to }) } },
    ...(detailed ? [{ name: "EDT_Descrição", kind: "edit", props: { value: description, disabled: caller.busy, onChange: event => setDescription(event.currentTarget.value) } } satisfies WdRadBinding] : []),
    ...(byVehicle ? [
      { name: "EDT_Da_viatura", kind: "edit", props: { value: vehicle.from, disabled: caller.busy, onChange: event => { const from = event.currentTarget.value; setVehicle(previous => ({ ...previous, from })); } } },
      { name: "BTN_VISION1", kind: "button", props: { disabled: caller.busy, onClick: () => setPicker({ kind: "vehicle", lower: true, origin: vehicle.from }) } },
      { name: "EDT_a_viatura", kind: "edit", props: { value: vehicle.to, disabled: caller.busy, onChange: event => { const to = event.currentTarget.value; setVehicle(previous => ({ ...previous, to })); } } },
      { name: "BTN_VISION2", kind: "button", props: { disabled: caller.busy, onClick: () => setPicker({ kind: "vehicle", lower: false, origin: vehicle.to }) } },
    ] satisfies WdRadBinding[] : []),
  ];
  const option = (index: number, caption: string): LegacyControl => { const source = controlOf(layout, "CBOX_doc");
    return { ...source, name: `CBOX_doc[${index}]`, path: `CBOX_doc[${index}]`, caption, y: source.y + (index - 1) * 26, height: 26 }; };
  return <FilterBody name="WIN_Filtro_Mapas_Artigos" busy={caller.busy}>
    <DateFields dates={dates} layout={layout} fromName={`EDT_Da_data${byVehicle ? "1" : ""}`} toName={`EDT_a_data${byVehicle ? "1" : ""}`} disabled={caller.busy} />
    <WdRadControls layout={layout} bindings={bindings} />
    {!byVehicle && <div data-testid="CBOX_doc"><WdCheckbox control={option(1, "Ordens Reparação")} checked={orders} onChange={setOrders} disabled={caller.busy} />
      <WdCheckbox control={option(2, "Movimentos Stocks Saída")} checked={stockOut} onChange={setStockOut} disabled={caller.busy} /></div>}
    <WdButton control={controlOf(layout, previewName)} disabled={caller.busy} onClick={() => {
      const range = dates.read(); if (!range) return;
      void caller.run(materialReportDispatch(mode, { ...range, articleFrom: article.from, articleTo: article.to, description, orders, stockOut, vehicleFrom: vehicle.from, vehicleTo: vehicle.to }, context));
    }} />
    {picker?.kind === "article" && <ArticlePicker launchMode={new URLSearchParams(window.location.search).get("modulo") ?? undefined} repository={repositories.articles} origin={picker.origin} finish={selected => { setArticle(previous => reportPickerRange(previous.from, previous.to, selected, picker.lower)); setPicker(null); }} />}
    {picker?.kind === "vehicle" && <VehiclePicker repositories={repositories} origin={picker.origin} finish={selected => { setVehicle(previous => reportPickerRange(previous.from, previous.to, selected, picker.lower)); setPicker(null); }} />}
    {caller.diagnostic && <output data-testid="report-filter-diagnostic">{caller.diagnostic}</output>}
  </FilterBody>;
}

/** WIN_Filtro_Mapas_Tempos.wdw:673-691: order range 1..9999999999, no implicit open-ended vehicle range. */
export function LaborReportFilter({ mode, repositories, context, today, onPreview }: CallerProps & { mode: LaborReportMode; repositories: Pick<ReportFilterRepositories, "mechanics" | "vehicles" | "customers"> }) {
  const layout = laborReportFilterLayout(mode), dates = useFilterDates(today), caller = useCaller(onPreview);
  // U-WA6D3FA-01: zero is the reversible numeric control default; only order values have explicit source assignments.
  const [range, setRange] = useState(() => mode === "ordem_reparacao" ? { from: "1", to: "9999999999" } : mode === "viatura" ? { from: "", to: "" } : { from: "0", to: "0" });
  const [picker, setPicker] = useState<{ lower: boolean; origin: string } | null>(null);
  const vehicle = mode === "viatura", mechanic = mode.startsWith("mecanico"), fromName = vehicle ? "EDT_Da_viatura" : mechanic ? "EDT_Do_mecanico" : "EDT_Da_ordem", toName = vehicle ? "EDT_a_viatura" : mechanic ? "EDT_Ao_mecanico" : "EDT_a_ordem";
  const bindings: WdRadBinding[] = [
    { name: fromName, kind: "edit", props: { value: range.from, disabled: caller.busy, integerMask: !vehicle, onChange: event => { const from = event.currentTarget.value; setRange(previous => ({ ...previous, from })); } } },
    ...(vehicle || mechanic ? [{ name: vehicle ? "BTN_VISION1" : "BTN_VISION4", kind: "button", props: { disabled: caller.busy, onClick: () => setPicker({ lower: true, origin: range.from }) } } satisfies WdRadBinding] : []),
    { name: toName, kind: "edit", props: { value: range.to, disabled: caller.busy, integerMask: !vehicle, onChange: event => { const to = event.currentTarget.value; setRange(previous => ({ ...previous, to })); } } },
    ...(vehicle || mechanic ? [{ name: vehicle ? "BTN_VISION2" : "BTN_VISION3", kind: "button", props: { disabled: caller.busy, onClick: () => setPicker({ lower: false, origin: range.to }) } } satisfies WdRadBinding] : []),
  ];
  return <FilterBody name="WIN_Filtro_Mapas_Tempos" busy={caller.busy}>
    <DateFields dates={dates} layout={layout} fromName="EDT_Da_data" toName="EDT_a_data" disabled={caller.busy} />
    <WdRadControls layout={layout} bindings={bindings} />
    <WdButton control={controlOf(layout, "BTN_Visualizar_impressão")} disabled={caller.busy} onClick={() => {
      const datesValue = dates.read(); if (datesValue) void caller.run(laborReportDispatch(mode, { ...datesValue, rangeFrom: range.from, rangeTo: range.to }, context));
    }} />
    {picker && (vehicle ? <VehiclePicker repositories={repositories} origin={picker.origin} finish={selected => { setRange(previous => reportPickerRange(previous.from, previous.to, selected, picker.lower)); setPicker(null); }} />
      : <MechanicPicker repository={repositories.mechanics} origin={picker.origin} finish={selected => { setRange(previous => reportPickerRange(previous.from, previous.to, String(selected), picker.lower, true)); setPicker(null); }} />)}
    {caller.diagnostic && <output data-testid="report-filter-diagnostic">{caller.diagnostic}</output>}
  </FilterBody>;
}

/** WIN_Mapa_Vendas: query rows copied once into the caller's local checked table, not a global state filter. */
export function SalesReportFilter({ mode, repository, context, today, onPreview }: CallerProps & { mode: SalesReportMode; repository: ReportFilterRepository }) {
  const layout = salesReportFilterLayout(mode), table = controlOf(layout, "TABLE_Estados"), dates = useFilterDates(today), caller = useCaller(onPreview);
  const [rows, setRows] = useState<SalesReportState[]>([]), [loaded, setLoaded] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [selection, setSelection] = useState<string | null>(null), [sort, setSort] = useState({ key: "", descending: false });
  const settings = useTableLayout(table, "WIN_Mapa_Vendas/TABLE_Estados");
  useEffect(() => { let active = true;
    void repository.states({ mode }).then(result => { if (!active) return; if (result.kind !== "loaded") { setDiagnostic(result.kind); return; } setRows(result.states); setLoaded(true); setDiagnostic(""); }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [mode, repository]);
  const toggle = (id: string) => { if (!caller.busy) setRows(previous => previous.map(row => row.id === id ? { ...row, checked: !row.checked } : row)); };
  return <FilterBody name="WIN_Mapa_Vendas" busy={caller.busy}>
    <DateFields dates={dates} layout={layout} fromName="EDT_Da_data" toName="EDT_A_data" disabled={caller.busy} />
    <WdRadControls layout={layout} bindings={[{ name: "STC_Titulo_Tabela", kind: "caption" }]} />
    <div onKeyDown={event => { if (event.key === " " && event.target instanceof Element && event.target.getAttribute("data-testid") === "TABLE_Estados" && selection) { event.preventDefault(); toggle(selection); } }}>
      <WdTable control={table} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={setSelection} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
        onSort={column => {
          if (caller.busy) return;
          const descending = sort.key === column.name ? !sort.descending : false;
          setSort({ key: column.name, descending });
          const value = (row: SalesReportState) => column.name === "COL_checkbox" ? row.checked ? "1" : "0" : row.Descricao ?? "";
          setRows(previous => [...previous].sort((a, b) => value(a).localeCompare(value(b), "pt-PT") * (descending ? -1 : 1)));
        }}
        onColumnSearch={(column, term) => { if (!term || caller.busy) return; const found = rows.find(row => (column.name === "COL_checkbox" ? row.checked ? "1" : "0" : row.Descricao ?? "").toLocaleLowerCase("pt-PT").startsWith(term.toLocaleLowerCase("pt-PT"))); if (found) setSelection(found.id); }}
        cell={(row, column) => column.name === "COL_checkbox" ? <button className="report-filter-cell-check" type="button" role="checkbox" aria-checked={row.checked} aria-label={row.Descricao ?? row.Codigo ?? ""}
          data-testid={`TABLE_Estados.COL_checkbox:${row.id}`} disabled={caller.busy} onClick={event => { event.stopPropagation(); setSelection(row.id); toggle(row.id); }}><WdCheckMark checked={row.checked} /></button>
          : column.name === "COL_codigo" ? row.Codigo ?? "" : row.Descricao ?? ""} />
    </div>
    <WdButton control={controlOf(layout, "BTN_Visualizar_impressão1")} disabled={!loaded || caller.busy} onClick={() => {
      const datesValue = dates.read(); if (datesValue) void caller.run(salesReportDispatch(mode, { ...datesValue, states: rows }, context));
    }} />
    {(diagnostic || caller.diagnostic) && <output data-testid="report-filter-diagnostic">{diagnostic || caller.diagnostic}</output>}
  </FilterBody>;
}

function ReportFilterLaunchers({ repositories, today, context, onPreview }: CallerProps & { repositories: ReportFilterRepositories }) {
  const { open } = useWorkspace();
  return <nav data-testid="report-filters-launcher">
    {materialReportModes.map(mode => <button key={mode} data-testid={`report-filter-material-${mode}`} onClick={() => open({ layout: materialReportFilterLayout(mode), content: <MaterialReportFilter mode={mode} repositories={repositories} context={context} today={today} onPreview={onPreview} /> })}>{materialReportTitles[mode]}</button>)}
    {laborReportModes.map(mode => <button key={mode} data-testid={`report-filter-labor-${mode}`} onClick={() => open({ layout: laborReportFilterLayout(mode), content: <LaborReportFilter mode={mode} repositories={repositories} context={context} today={today} onPreview={onPreview} /> })}>{laborReportTitles[mode]}</button>)}
    {(["vendas", "recebimentos"] as const).map(mode => <button key={mode} data-testid={`report-filter-sales-${mode}`} onClick={() => open({ layout: salesReportFilterLayout(mode), content: <SalesReportFilter mode={mode} repository={repositories.reports} context={context} today={today} onPreview={onPreview} /> })}>{mode === "vendas" ? "Mapa de Vendas" : "Mapa de Recebimentos"}</button>)}
  </nav>;
}
/** Development entry only; exported screens/layout factories also open from the actual menu workspace. */
export default function ReportFiltersWorkflow() {
  const [repositories, setRepositories] = useState<ReportFilterRepositories | null>(null), [failed, setFailed] = useState(false), reports = useReportPreview();
  const [today] = useState(() => { const date = new Date(); return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`; });
  useEffect(() => { let active = true;
    void Promise.all([isolatedArticleRepository(), isolatedMechanicRepository(), isolatedVehicleRepository(), isolatedCustomerRepository(), isolatedReportFilterRepository()]).then(([articles, mechanics, vehicles, customers, filters]) => { if (active) setRepositories({ articles, mechanics, vehicles, customers, reports: filters }); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": "540px" } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repositories && <ReportFilterLaunchers repositories={repositories} today={today} context={{ company: "", dateText: `${today.slice(6, 8)}/${today.slice(4, 6)}/${today.slice(0, 4)}` }} onPreview={reports.preview} />}</WdWorkspace>
    {reports.element}
  </main></DialogProvider>;
}
