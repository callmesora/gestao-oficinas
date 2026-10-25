import { useReportPreview } from "./reports";
import { reportContext } from "./report-callers";
import { repairOrderReportSnapshot } from "../application/reports";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { repairOrderInitialFilters, repairOrderPriorityLabel, repairOrderSelect, repairOrderTimerMilliseconds, type RepairOrderList, type RepairOrderListRow, type RepairOrderStateFilter } from "../../packages/domain/src/repair-orders";
import { dateEntryDisplay, dateEntryInitial, dateEntryResult, type DateEntryDraft } from "../../packages/domain/src/date-entry";
import { dateTimeEntryDisplay, dateTimeEntryInitial, dateTimeEntryResult, isDateOnlyBound, isDateTimeBound, type DateTimeEntryDraft } from "../../packages/domain/src/date-time";
import type { RepairOrderRepository } from "../application/repair-orders";
import type { CustomerRepository } from "../application/customers";
import type { VehicleRepository } from "../application/vehicles";
import type { MechanicRepository } from "../application/mechanics";
import type { UserRepository } from "../application/users";
import type { RepairOrderFormRepository } from "../application/repair-order-form";
import type { RepairFormTarget } from "../../packages/domain/src/repair-order-form";
import { isolatedRepairOrderRepository } from "../infrastructure/repair-orders";
import { isolatedCustomerRepository } from "../infrastructure/customers";
import { isolatedVehicleRepository } from "../infrastructure/vehicles";
import { isolatedMechanicRepository } from "../infrastructure/mechanics";
import { isolatedUserRepository } from "../infrastructure/users";
import { isolatedRepairOrderFormRepository } from "../infrastructure/repair-order-form";
import { selectAfterTableRead } from "../application/table-selection";
import sourceLayout from "./legacy/WIN_Ordens_Reparacao.layout.json";
import { controlOf, type LegacyColumn, type LegacyLayout } from "./legacy/layout";
import type { WdDateEditHandle } from "./legacy/date";
import { WdCheckMark } from "./legacy/wd";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { CustomerPicker } from "./customers";
import { VehiclePicker } from "./vehicles";
import { MechanicPicker } from "./mechanics";
import { RepairOrderFormDialog } from "./repair-order-form";
import type { RepairLaborRepository } from "../application/repair-labor";
import type { RepairMaterialsRepository } from "../application/repair-materials";
import type { ArticleRepository } from "../application/articles";
import { isolatedRepairLaborRepository } from "../infrastructure/repair-labor";
import { isolatedRepairMaterialsRepository } from "../infrastructure/repair-materials";
import { isolatedArticleRepository } from "../infrastructure/articles";
import { RepairDetailsDialog } from "./repair-details";
import "./repair-orders.css";

// JPG/dossier-backed display overlay; generated identities/geometry remain unchanged (ADR-003/U01).
const captions: Record<string, string> = { RADTitle: "Ordens de Reparação", BTN_Actualizar_Dados: "Actualizar Dados", BTN_informacao: "Informação", STC_Estado_de_Reparação: "Estado de Reparação" };
const layout: LegacyLayout = { ...sourceLayout, controls: sourceLayout.controls.map(control => control.name === "STC_Estado_de_Reparação"
  ? { ...control, kind: "Caption", caption: captions[control.name], h_align: "Left", v_align: "Top" }
  : captions[control.name] ? { ...control, caption: captions[control.name] } : control) };
const orderSource = controlOf(layout, "TABLE_QRY_select_ordens_reparacao");
const orderTable = { ...orderSource, columns: orderSource.columns?.map(column => ({ ...column, title: ({ COL_Numero: "Número", COL_Recepcao_datahora: "Data/Hora recepção" } as Record<string, string>)[column.name] ?? column.title })) };
const stateTable = controlOf(layout, "TABLE_Estados_reparacao");
const priorityOptions = ["Todos", "Normal", "Elevada", "Urgente"].map((label, value) => ({ label, value }));
const dateNames = ["EDT_data_entrada_inicio", "EDT_data_entrada_fim", "EDT_data_entrega_inicio", "EDT_data_entrega_fim"] as const;
type DateName = typeof dateNames[number];
type Dates = { EDT_data_entrada_inicio: DateTimeEntryDraft; EDT_data_entrada_fim: DateTimeEntryDraft; EDT_data_entrega_inicio: DateEntryDraft; EDT_data_entrega_fim: DateEntryDraft };
type StateDraft = RepairOrderStateFilter & { checked: boolean | null };
type Initial = Extract<Awaited<ReturnType<RepairOrderRepository["initialise"]>>, { kind: "loaded" }>;
type Draft = Dates & { priority: number; mechanic: number; customer: string; registration: string; states: StateDraft[] };
type Repositories = { labor: RepairLaborRepository; materials: RepairMaterialsRepository; articles: ArticleRepository; orders: RepairOrderRepository; form: RepairOrderFormRepository; customers: CustomerRepository; vehicles: VehicleRepository; mechanics: MechanicRepository; users: UserRepository };
const columnKeys: Record<string, NonNullable<RepairOrderList["sort"]>> = { COL_Numero: "numero", COL_Matricula: "matricula", COL_Cliente: "Descricao_Cliente", COL_Terceiro: "Descricao_Terceiro", COL_marca_modelo: "marcamodelo", COL_Recepcao_datahora: "recepcao_datahora", COL_Recepcao_entrega_prevista: "recepcao_entrega_prevista", COL_Reparacao_estado: "Descricao", COL_Recepcao_prioridade: "recepcao_prioridade", COL_Reparacao_mecanico: "Descricao_me", COL_Cor: "Cor" };
function displayed(row: RepairOrderListRow, key: NonNullable<RepairOrderList["sort"]>): string {
  if (key === "recepcao_datahora") return dateTimeEntryDisplay(row.recepcao_datahora);
  if (key === "recepcao_entrega_prevista") return dateEntryDisplay(row.recepcao_entrega_prevista);
  if (key === "recepcao_prioridade") return repairOrderPriorityLabel(row.recepcao_prioridade);
  return String(row[key] ?? "");
}
/** Only workstation clock acquisition uses Date; legacy text never passes through it. */
function workstationDay() {
  const now = new Date();
  return String(now.getFullYear()).padStart(4, "0") + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
}
function initialDraft(query: RepairOrderList, states: RepairOrderStateFilter[]): Draft {
  return { priority: query.priority, mechanic: query.mechanic, customer: query.customer, registration: query.registration,
    EDT_data_entrada_inicio: dateTimeEntryInitial(query.entryStart), EDT_data_entrada_fim: dateTimeEntryInitial(query.entryEnd),
    EDT_data_entrega_inicio: dateEntryInitial(query.deliveryStart), EDT_data_entrega_fim: dateEntryInitial(query.deliveryEnd),
    states: states.map(state => ({ ...state, checked: state.lancar_defa })) };
}
function colorPreview(color: number | null): string {
  if (color === null || color < 0 || color > 0xffffff) return "#ffffff";
  return `rgb(${color % 256}, ${Math.floor(color / 256) % 256}, ${Math.floor(color / 65536) % 256})`;
}
function CellColor({ table, color }: { table: typeof stateTable; color: number | null }) {
  const shape = controlOf(layout, `${table.path}.COL_imagem.SHA_cor`);
  if (shape.kind !== "Shape" || shape.width == null || shape.height == null) throw new Error(`Cell shape unresolved: ${shape.path}`);
  return <span className="repair-order-color-cell"><span data-testid={shape.name} data-control-path={shape.path} style={{ left: shape.x - table.x, top: shape.y - table.y, width: shape.width, height: shape.height, backgroundColor: colorPreview(color) }} /></span>;
}

function RadButton({ name, ...props }: { name: string; disabled: boolean; onClick: () => void }) {
  return <WdRadControls layout={layout} bindings={[{ name, kind: "button", props }]} />;
}
function RadDate({ name, draft, invalid, disabled, inputRef, onChange }: { name: DateName; draft: DateEntryDraft | DateTimeEntryDraft; invalid: boolean; disabled: boolean;
  inputRef: (handle: WdDateEditHandle | null) => void; onChange: (draft: DateEntryDraft | DateTimeEntryDraft) => void }) {
  return <WdRadControls layout={layout} bindings={[{ name, kind: name.startsWith("EDT_data_entrada") ? "dateTime" : "date", props: { draft, invalid, disabled, ref: inputRef, onChange } }]} />;
}

export function RepairOrderListScreen({ repositories }: { repositories: Repositories }) {
  const reports = useReportPreview();
  const [reportReady, setReportReady] = useState(false);
  const close = useWorkspaceClose(), { message, resource } = useDialogs();
  const [draft, setDraft] = useState<Draft | null>(null), [initial, setInitial] = useState<Initial | null>(null);
  const [rows, setRows] = useState<RepairOrderListRow[]>([]), [selection, setSelection] = useState<string | null>(null), [stateSelection, setStateSelection] = useState<string | null>(null);
  const [reading, setReading] = useState(false), [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [invalidDate, setInvalidDate] = useState<DateName | null>(null), [picker, setPicker] = useState<"customer" | "vehicle" | "mechanic" | null>(null);
  const [details, setDetails] = useState<{ numero: string; resolve: () => void } | null>(null);
  const information = (numero: string) => new Promise<void>(resolve => setDetails({ numero, resolve }));
  const [editor, setEditor] = useState<{ target: RepairFormTarget; lifetime: number } | null>(null);
  const latest = useRef(draft), currentRows = useRef(rows), selected = useRef(selection), messageRef = useRef(message);
  const owner = useRef(0), lifetime = useRef(0), inFlight = useRef(false), mutating = useRef(false), pickerActive = useRef(false);
  const activeQuery = useRef<RepairOrderList | null>(null), headerQuery = useRef<RepairOrderList | null>(null);
  const dateInputs = useRef<Partial<Record<DateName, WdDateEditHandle | null>>>({});
  const plateInput = useRef<HTMLInputElement>(null);
  const orderSettings = useTableLayout(orderTable, "WIN_Ordens_Reparacao/TABLE_QRY_select_ordens_reparacao");
  const stateSettings = useTableLayout(stateTable, "WIN_Ordens_Reparacao/TABLE_Estados_reparacao");
  useLayoutEffect(() => { latest.current = draft; currentRows.current = rows; selected.current = selection; messageRef.current = message; }, [draft, rows, selection, message]);
  const read = useCallback(async (query: RepairOrderList, entry = false, header?: { key: NonNullable<RepairOrderList["sort"]>; term?: string }) => {
    const request = ++owner.current, previous = selected.current, previousNumero = currentRows.current.find(row => row.id === previous)?.numero ?? "0";
    inFlight.current = true; setReading(true); setDiagnostic("");
    try {
      const result = await repositories.orders.list(query);
      if (request !== owner.current) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.orders); activeQuery.current = query; setReportReady(true);
      setSelection(header ? selectAfterTableRead(result.orders, previous, header.term ? { term: header.term, value: row => displayed(row, header.key) } : undefined) : repairOrderSelect(result.orders, previousNumero, entry));
      if (!header && plateInput.current) plateInput.current.setSelectionRange(plateInput.current.value.length, plateInput.current.value.length);
    } catch { if (request === owner.current) setDiagnostic("transport"); }
    finally { if (request === owner.current) { inFlight.current = false; setReading(false); } }
  }, [repositories.orders]);
  const queryFromDraft = useCallback((value: Draft, focus: boolean): RepairOrderList | null => {
    const values: string[] = [];
    for (const name of dateNames) {
      const input = dateInputs.current[name];
      const result = name === "EDT_data_entrada_inicio" || name === "EDT_data_entrada_fim" ? dateTimeEntryResult(value[name]) : dateEntryResult(value[name]);
      const supported = result.kind === "valid" && typeof result.value === "string" && (name.startsWith("EDT_data_entrada") ? isDateTimeBound(result.value) : isDateOnlyBound(result.value));
      if (!input?.isCalendarValid() || !supported) {
        if (focus) { setInvalidDate(name); if (input?.isCalendarValid()) input.focus(); else input?.validateCalendar(); }
        return null;
      }
      values.push(result.value as string);
    }
    return { entryStart: values[0], entryEnd: values[1], deliveryStart: values[2], deliveryEnd: values[3], priority: value.priority, mechanic: value.mechanic,
      customer: value.customer.replaceAll(" ", ""), registration: value.registration.toLocaleUpperCase("pt-PT"), states: value.states.filter(state => state.checked === true).map(state => state.Codigo) };
  }, []);
  const refresh = useCallback((focus = true, value = latest.current) => {
    if (!value || mutating.current) return;
    const query = queryFromDraft(value, focus);
    if (!query) return;
    setDraft(previous => previous ? { ...previous, registration: query.registration } : previous);
    headerQuery.current = null;
    void read(query);
  }, [queryFromDraft, read]);
  const invalidate = useCallback(() => { lifetime.current++; owner.current++; }, []);
  useEffect(() => {
    const alive = ++lifetime.current; let stopTimer: (() => void) | undefined;
    void (async () => {
      try {
        const result = await repositories.orders.initialise();
        if (alive !== lifetime.current) return;
        if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
        const milliseconds = repairOrderTimerMilliseconds(result.settings.Tempo_ordem_reparacao);
        if (milliseconds === null) {
          await messageRef.current({ title: "Ordens de Reparação", text: "Erro ao criar temporizador de atualização", type: 1 });
          if (alive !== lifetime.current) return;
        }
        const query = repairOrderInitialFilters(workstationDay(), result.settings.Data_inicio);
        if (!query) { setDiagnostic("invalid_clock"); return; }
        const value = initialDraft(query, result.states);
        query.states = value.states.filter(state => state.checked === true).map(state => state.Codigo);
        setInitial(result); setDraft(value); setStateSelection(result.states[0]?.id ?? null);
        await read(query, true);
        if (alive !== lifetime.current || milliseconds === null) return;
        const duration = BigInt(milliseconds); let timeout: ReturnType<typeof setTimeout>;
        const schedule = (remaining: bigint) => {
          const chunk = remaining > 2147483647n ? 2147483647n : remaining;
          timeout = setTimeout(() => {
            if (alive !== lifetime.current) return;
            if (remaining > chunk) schedule(remaining - chunk);
            else { if (!inFlight.current && !mutating.current && !pickerActive.current) refresh(false); schedule(duration); }
          }, Number(chunk));
        };
        schedule(duration); stopTimer = () => clearTimeout(timeout);
      } catch { if (alive === lifetime.current) setDiagnostic("transport"); }
    })();
    return () => { invalidate(); stopTimer?.(); };
  }, [repositories.orders, read, refresh, invalidate]);
  const defaults = async (save: boolean) => {
    const value = latest.current;
    if (!value || mutating.current) return;
    mutating.current = true; setBusy(true); const alive = lifetime.current;
    try {
      if (save) {
        const result = await repositories.orders.saveDefaults({ states: value.states.map(state => ({ Codigo: state.Codigo, checked: state.checked })) });
        if (alive !== lifetime.current) return;
        if (result.kind !== "saved") { setDiagnostic(result.kind); return; }
        mutating.current = false; refresh(true, value);
      } else {
        const result = await repositories.orders.initialise();
        if (alive !== lifetime.current) return;
        if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
        const code = value.states.find(state => state.id === stateSelection)?.Codigo;
        const next = { ...value, states: result.states.map(state => ({ ...state, checked: state.lancar_defa })) };
        setInitial(result); setDraft(next); setStateSelection(result.states.find(state => state.Codigo === code)?.id ?? null);
        mutating.current = false; refresh(true, next);
      }
    } catch { if (alive === lifetime.current) setDiagnostic("transport"); }
    finally { if (alive === lifetime.current) { mutating.current = false; setBusy(false); } }
  };
  const patch = (change: Partial<Draft>) => setDraft(previous => previous ? { ...previous, ...change } : previous);
  const edit = (mode: "create" | "update") => {
    if (mutating.current || inFlight.current || !latest.current) return;
    const numero = currentRows.current.find(row => row.id === selected.current)?.numero;
    if (mode === "update" && numero == null) return;
    mutating.current = true; pickerActive.current = true; setBusy(true); setDiagnostic("");
    setEditor({ target: mode === "create" ? { mode } : { mode, originalNumero: numero! }, lifetime: lifetime.current });
  };
  const finishEditor = () => {
    if (!editor || editor.lifetime !== lifetime.current) return;
    setEditor(null); pickerActive.current = false; mutating.current = false; setBusy(false);
    // SRC-385d90c6c0 / SRC-21d283fcfc: refresh after every actual return, including cancellation.
    refresh();
  };
  const remove = async () => {
    const numero = currentRows.current.find(row => row.id === selected.current)?.numero;
    if (numero == null || mutating.current || inFlight.current) return;
    const alive = lifetime.current;
    mutating.current = true; setBusy(true); setDiagnostic("");
    try {
      const answer = await resource({ title: captions.RADTitle, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (alive !== lifetime.current || answer.result !== 1) return;
      const result = await repositories.form.remove({ numero });
      if (alive !== lifetime.current) return;
      if (result.kind === "deleted" || result.kind === "missing") {
        mutating.current = false; refresh();
      } else setDiagnostic(result.kind);
    } catch { if (alive === lifetime.current) setDiagnostic("transport"); }
    finally { if (alive === lifetime.current) { mutating.current = false; setBusy(false); } }
  };
  const setDate = (name: DateName, value: DateEntryDraft | DateTimeEntryDraft) => { setInvalidDate(null); patch({ [name]: value }); };
  const openPicker = (kind: NonNullable<typeof picker>) => { if (!draft || busy) return; pickerActive.current = true; setPicker(kind); };
  const finishPicker = (change: Partial<Draft>) => { pickerActive.current = false; setPicker(null); patch(change); };
  const toggleState = (id: string) => {
    if (busy || !draft) return;
    setStateSelection(id); patch({ states: draft.states.map(state => state.id === id ? { ...state, checked: state.checked !== true } : state) });
  };
  const rad = (binding: WdRadBinding) => <WdRadControls key={binding.name} layout={layout} bindings={[binding]} />;
  const sort = (column: LegacyColumn, term?: string) => {
    if (busy) return;
    const query = headerQuery.current ?? activeQuery.current, key = columnKeys[column.name];
    if (!query || !key) return;
    const next = { ...query, sort: key, descending: term !== undefined ? false : query.sort === key ? !query.descending : false };
    headerQuery.current = next;
    void read(next, false, { key, term });
  };
  return <div data-testid="WIN_Ordens_Reparacao" className="repair-orders-screen" onKeyDown={event => {
    if (event.key === "Escape" && !busy && !picker && !(event.target instanceof Element && event.target.closest("dialog"))) close();
    if (event.key === " " && event.target instanceof HTMLElement && event.target.dataset.testid === stateTable.name && stateSelection) {
      event.preventDefault(); toggleState(stateSelection);
    }
  }}><div className="repair-orders-content">
    <WdRadControls layout={layout} bindings={layout.controls.filter(control => control.kind === "Caption" && control.name !== "RADTitle").map(control => ({ name: control.path, kind: "caption" }))} />
    <RadButton name="BTN_VISION3" disabled={busy || !draft} onClick={() => patch({ registration: "" })} />
    <RadButton name="BTN_Todos1" disabled={busy || !draft} onClick={() => void defaults(false)} />
    <RadButton name="BTN_Todos" disabled={busy || !draft} onClick={() => { if (draft) patch({ states: draft.states.map(state => ({ ...state, checked: true })) }); }} />
    <RadButton name="BTN_Nenhum" disabled={busy || !draft} onClick={() => { if (draft) patch({ states: draft.states.map(state => ({ ...state, checked: false })) }); }} />
    <RadDate disabled={busy || !draft} name="EDT_data_entrega_inicio" draft={draft?.EDT_data_entrega_inicio ?? dateEntryInitial("")} invalid={invalidDate === "EDT_data_entrega_inicio"} inputRef={handle => { dateInputs.current.EDT_data_entrega_inicio = handle; }} onChange={next => setDate("EDT_data_entrega_inicio", next)} />
    <RadButton name="BTN_Actualizar_Dados" disabled={busy || !draft} onClick={() => refresh()} />
    <RadDate disabled={busy || !draft} name="EDT_data_entrada_inicio" draft={draft?.EDT_data_entrada_inicio ?? dateEntryInitial("")} invalid={invalidDate === "EDT_data_entrada_inicio"} inputRef={handle => { dateInputs.current.EDT_data_entrada_inicio = handle; }} onChange={next => setDate("EDT_data_entrada_inicio", next)} />
    <WdTable control={stateTable} rows={draft?.states ?? []} rowId={row => row.id} selectedId={stateSelection} onSelect={id => { if (!busy) setStateSelection(id); }} showHeaders={false}
      {...stateSettings} configureColumns designerOptions onResetColumns={stateSettings.resetLayout}
      cell={(row, column) => column.name === "COL_checkbox" ? <button type="button" role="checkbox" aria-label={`Selecionar estado ${row.Codigo ?? ""}`} aria-checked={row.checked === true} disabled={busy} className="repair-state-checkbox" tabIndex={-1}
        onClick={() => toggleState(row.id)}><WdCheckMark checked={row.checked} /></button>
        : column.name === "COL_imagem" ? <CellColor table={stateTable} color={row.Cor} /> : column.name === "COL_Descricao" ? row.Descricao ?? "" : ""} />
    {rad({ name: "RADIO_prioridade", kind: "radio", props: { label: "Prioridade", options: priorityOptions, value: draft?.priority ?? 0, onChange: priority => patch({ priority }), disabled: busy } })}
    <RadButton name="BTN_VISION1" disabled={busy || !draft} onClick={() => openPicker("vehicle")} />
    {rad({ name: "EDT_matricula", kind: "edit", props: { ref: plateInput, value: draft?.registration ?? "", onChange: event => patch({ registration: event.currentTarget.value }), disabled: busy } })}
    <RadDate disabled={busy || !draft} name="EDT_data_entrega_fim" draft={draft?.EDT_data_entrega_fim ?? dateEntryInitial("")} invalid={invalidDate === "EDT_data_entrega_fim"} inputRef={handle => { dateInputs.current.EDT_data_entrega_fim = handle; }} onChange={next => setDate("EDT_data_entrega_fim", next)} /><RadDate disabled={busy || !draft} name="EDT_data_entrada_fim" draft={draft?.EDT_data_entrada_fim ?? dateEntryInitial("")} invalid={invalidDate === "EDT_data_entrada_fim"} inputRef={handle => { dateInputs.current.EDT_data_entrada_fim = handle; }} onChange={next => setDate("EDT_data_entrada_fim", next)} />
    <RadButton name="BTN_VISION2" disabled={busy || !draft} onClick={() => patch({ mechanic: initial?.mechanics.find(mechanic => mechanic.Codigo !== null)?.Codigo ?? 0 })} />
    <RadButton name="BTN_VISION5" disabled={busy || !draft} onClick={() => patch({ customer: "" })} />
    {rad({ name: "COMBO_mecanico", kind: "combo", props: { value: String(draft?.mechanic ?? 0), options: initial?.mechanics.flatMap(mechanic => mechanic.Codigo === null ? [] : [{ value: String(mechanic.Codigo), label: mechanic.Descricao ?? "" }]) ?? [], allowNoSelection: true, onChange: value => patch({ mechanic: Number(value) }), disabled: busy } })}
    <RadButton name="BTN_VISION4" disabled={busy || !draft} onClick={() => openPicker("customer")} /><RadButton name="BTN_VISION" disabled={busy || !draft} onClick={() => openPicker("mechanic")} />
    {rad({ name: "EDT_cliente", kind: "edit", props: { value: draft?.customer ?? "", integerMask: true, onChange: event => patch({ customer: event.currentTarget.value }), disabled: busy } })}
    <RadButton name="BTN_Gravar" disabled={busy || !draft} onClick={() => void defaults(true)} />
    <WdTable control={orderTable} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!busy && !reading) setSelection(id); }} rowHeight={30}
      {...orderSettings} configureColumns designerOptions onResetColumns={orderSettings.resetLayout} onSort={column => sort(column)} onColumnSearch={(column, term) => { if (term) sort(column, term); }}
      cell={(row, column) => column.name === "COL_imagem" ? <CellColor table={orderTable} color={row.Cor} /> : column.name === "COL_Matricula" ? <span style={{ fontSize: 12, fontWeight: "bold" }}>{row.matricula ?? ""}</span> : columnKeys[column.name] ? displayed(row, columnKeys[column.name]) : ""} />
    <RadButton name="BTN_Novo" disabled={busy || reading || !draft} onClick={() => edit("create")} />
    <RadButton name="BTN_Alterar" disabled={busy || reading || !rows.some(row => row.id === selection && row.numero !== null)} onClick={() => edit("update")} />
    <RadButton name="BTN_Eliminar" disabled={busy || reading || !rows.some(row => row.id === selection && row.numero !== null)} onClick={() => void remove()} />
    <RadButton name="BTN_informacao" disabled={busy || reading || details !== null || !rows.some(row => row.id === selection && row.numero !== null)} onClick={() => { const numero = rows.find(row => row.id === selection)?.numero; if (numero !== null && numero !== undefined) void information(numero); }} />
    <RadButton name="BTN_Imprimir" disabled={busy || reading || reports.busy || !reportReady} onClick={() => { if (activeQuery.current) void reports.preview(repairOrderReportSnapshot(currentRows.current, activeQuery.current, reportContext())); }} />
    {reports.element}
    {editor && <RepairOrderFormDialog repositories={repositories} target={editor.target} finish={finishEditor} onInformation={information} />}
    {details && <RepairDetailsDialog repositories={repositories} numero={details.numero} finish={() => { setDetails(null); details.resolve(); }} />}
    {picker === "customer" && draft && <CustomerPicker repository={repositories.customers} origin={draft.customer.replaceAll(" ", "")} finish={customer => finishPicker({ customer })} />}
    {picker === "vehicle" && draft && <VehiclePicker repositories={repositories} origin={draft.registration} finish={registration => finishPicker({ registration })} />}
    {picker === "mechanic" && draft && <MechanicPicker repository={repositories.mechanics} origin={draft.mechanic} finish={mechanic => finishPicker({ mechanic: typeof mechanic === "number" ? mechanic : Number(mechanic) })} />}
    {diagnostic && <output data-testid="repair-order-diagnostic">{diagnostic}</output>}
    <output hidden data-testid="repair-order-selected">{rows.find(row => row.id === selection)?.numero ?? ""}</output>
    <output hidden data-testid="repair-order-read-state">{reading ? "reading" : draft ? "ready" : "initialising"}</output>
  </div></div>;
}
function RepairOrderLauncher({ repositories }: { repositories: Repositories }) {
  const { open } = useWorkspace();
  return <button data-testid="repair-orders-open" onClick={() => open({ layout, content: <RepairOrderListScreen repositories={repositories} /> })}>{controlOf(layout, "RADTitle").caption}</button>;
}
export default function RepairOrdersWorkflow() {
  const [repositories, setRepositories] = useState<Repositories | null>(null), [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([isolatedRepairOrderRepository(), isolatedCustomerRepository(), isolatedVehicleRepository(), isolatedMechanicRepository(), isolatedRepairOrderFormRepository(), isolatedUserRepository(), isolatedRepairLaborRepository(), isolatedRepairMaterialsRepository(), isolatedArticleRepository()]).then(([orders, customers, vehicles, mechanics, form, users, labor, materials, articles]) => {
      if (active) setRepositories({ orders, customers, vehicles, mechanics, form, users, labor, materials, articles });
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${layout.window.size!.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repositories && <RepairOrderLauncher repositories={repositories} />}</WdWorkspace>
  </main></DialogProvider>;
}
