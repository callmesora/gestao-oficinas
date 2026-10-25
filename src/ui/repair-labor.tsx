import { useReportPreview } from "./reports";
import { reportContext } from "./report-callers";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEventHandler } from "react";
import Decimal from "decimal.js";
import type { RepairLaborDetail, RepairLaborMaterial, RepairLaborOrder, RepairLaborOrderSort, RepairLaborPlan, RepairLaborProof, RepairLaborReadResult, RepairLaborRow } from "../../packages/domain/src/repair-labor";
import { repairLaborMemorySort, type RepairLaborTableValue } from "../../packages/domain/src/repair-labor-table";
import { OPEN_LABOR_FINISH, laborDuration, laborDurationDisplay, laborSumHours } from "../../packages/domain/src/repair-labor-time";
import { repairOrderPriorityLabel, repairOrderTimerMilliseconds, type RepairOrderMechanic, type RepairOrderStateFilter } from "../../packages/domain/src/repair-orders";
import { dateTimeEntryDisplay, dateTimeEntryInitial, dateTimeEntryResult } from "../../packages/domain/src/date-time";
import type { RepairLaborRepository } from "../application/repair-labor";
import { selectAfterTableRead } from "../application/table-selection";
import type { MechanicRepository } from "../application/mechanics";
import type { DescriptiveStateRepository } from "../application/descriptive-states";
import { isolatedRepairLaborRepository } from "../infrastructure/repair-labor";
import { isolatedMechanicRepository } from "../infrastructure/mechanics";
import { isolatedDescriptiveStateRepository } from "../infrastructure/descriptive-states";
import { MechanicPicker } from "./mechanics";
import { DescriptiveStatePicker } from "./descriptive-states";
import { RepairMaterialPrompt } from "./repair-materials-prompt";
import { TouchKeyboardDialog, type TouchKeyboardRequest } from "./touch-keyboard";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { WdCheckMark, WdEdit, WdMemo } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { controlBox, controlOf, type LegacyColumn, type LegacyLayout } from "./legacy/layout";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdDateTimeEdit } from "./legacy/date-time";
import type { WdDateEditHandle } from "./legacy/date";
import sourceList from "./legacy/WIN_Tempos_Reparacao.layout.json";
import sourceState from "./legacy/WIN_Tempos_Reparacao_Estado.layout.json";
import sourceInfo from "./legacy/WIN_Tempos_Reparacao_Informacao.layout.json";
import timeLayout from "./legacy/WIN_Tempos_Reparacao_Tempo.layout.json";
import sourceDescriptions from "./legacy/WIN_Table_Tempos_materiais_Descricoes.layout.json";
import sourcePicker from "./legacy/WIN_Table_estado_reparacao_tipo3.layout.json";
import "./repair-labor.css";

/** Clock adapter only. Imported values never pass through JavaScript Date. */
export function repairLaborWorkstationClock(): string {
  const now = new Date();
  return String(now.getFullYear()).padStart(4, "0") + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0")
    + String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0") + String(now.getSeconds()).padStart(2, "0") + String(now.getMilliseconds()).padStart(3, "0");
}
function captions(source: LegacyLayout, title: string, overrides: Record<string, string> = {}): LegacyLayout {
  return { ...source, window: { ...source.window, title }, controls: source.controls.map(control => control.name === "RADTitle" ? { ...control, caption: title } : overrides[control.name] !== undefined ? { ...control, caption: overrides[control.name] } : control) };
}
const listLayout = captions(sourceList, "Tempos de Reparação", { BTN_Informacao: "Informação" });
const stateLayout = captions(sourceState, "Estado", { STC_descricao: "Descrição" });
// Primary source/dossier aliases have identical unique geometry, as in the existing repair form overlay.
const infoLayout = { ...captions(sourceInfo, "Informações"), controls: captions(sourceInfo, "Informações").controls.map(control => control.name === "STC_Observação" ? { ...control, kind: "Caption", caption: "Observação", h_align: "Left", v_align: "Center" } : control) };
const descriptionsLayout = { ...captions(sourceDescriptions, "Tempos, materiais e observações da ordem de reparação"), controls: captions(sourceDescriptions, "Tempos, materiais e observações da ordem de reparação").controls.map(control => ({ ...control,
  // Source summary/JPG TABLE_Tempos top66; generated page-relative controls top42 need the24px tab header.
  ...(control.path.startsWith("TAB_principal.") ? { y: control.y + 24 } : {}), ...(control.name === "STC_Observação" ? { kind: "Caption", caption: "Observação", h_align: "Left", v_align: "Center" } : {}) })) };
const pickerLayout = captions(sourcePicker, "Escolha o tipo de reparação a ser efetuada");
type Repositories = { labor: RepairLaborRepository; mechanics: MechanicRepository; descriptions: DescriptiveStateRepository };
type Loaded = Extract<RepairLaborReadResult, { kind: "loaded" }>;
function sourceColor(value: number | null) { return value === null || value < 0 || value > 0xffffff ? "#ffffff" : `rgb(${value % 256},${Math.floor(value / 256) % 256},${Math.floor(value / 65536) % 256})`; }
function ColorCell({ value }: { value: number | null }) { return <span className="repair-labor-color" style={{ backgroundColor: sourceColor(value) }} />; }
function Buttons({ layout, actions }: { layout: LegacyLayout; actions: Record<string, { onClick?: () => void; disabled?: boolean; caption?: string }> }) {
  const adjusted = { ...layout, controls: layout.controls.map(control => { const action = actions[control.path] ?? actions[control.name]; return action?.caption === undefined ? control : { ...control, caption: action.caption }; }) };
  return <WdRadControls layout={adjusted} bindings={Object.entries(actions).map(([name, action]): WdRadBinding => ({ name, kind: "button", props: { disabled: action.disabled, onClick: action.onClick } }))} />;
}
function Captions({ layout, exclude = [] }: { layout: LegacyLayout; exclude?: string[] }) {
  return <WdRadControls layout={layout} bindings={layout.controls.filter(control => control.kind === "Caption" && control.name !== "RADTitle" && !exclude.includes(control.name)).map(control => ({ name: control.path, kind: "caption" }))} />;
}
function move<T extends { id: string }>(rows: T[], current: string | null, delta: number) {
  const source = current === null ? -1 : rows.findIndex(row => row.id === current) + 1;
  const requested = delta > 0 && source < rows.length ? source + 1 : delta < 0 && source > 1 ? source - 1 : source;
  // U02: source -1→0 has no representable HTML row. Retain selection without claiming runtime behavior.
  return requested >= 1 && requested <= rows.length ? rows[requested - 1].id : current;
}
function memo(layout: LegacyLayout, name: string, value: string | null, onChange?: (value: string) => void, disabled = false,
  props: { onPointerDown?: PointerEventHandler<HTMLInputElement | HTMLTextAreaElement> } = {}) {
  const control = controlOf(layout, name);
  return control.flags?.Multiline === true ? <WdMemo key={name} control={control} value={value ?? ""} disabled={disabled} onChange={event => onChange?.(event.currentTarget.value)} {...props} />
    : <WdEdit key={name} control={control} value={value ?? ""} disabled={disabled} onChange={event => onChange?.(event.currentTarget.value)} {...props} />;
}
function useMemoryHeaders<Row extends { id: string }>(rows: Row[], setRows: (rows: Row[]) => void, selection: string | null, setSelection: (id: string | null) => void,
  value: (row: Row, column: LegacyColumn) => RepairLaborTableValue, disabled = false) {
  const previous = useRef<{ column: string; descending: boolean } | null>(null);
  const sort = (column: LegacyColumn, term?: string) => {
    if (disabled) return;
    const descending = term === undefined && previous.current?.column === column.path ? !previous.current.descending : false;
    const sorted = repairLaborMemorySort(rows, row => value(row, column), descending);
    previous.current = { column: column.path, descending }; setRows(sorted);
    if (term !== undefined) setSelection(selectAfterTableRead(sorted, selection, { term, value: row => { const field = value(row, column); return field.kind === "date" ? dateTimeEntryDisplay(field.value) : field.value ?? ""; } }));
  };
  return { onSort: (column: LegacyColumn) => sort(column), onColumnSearch: (column: LegacyColumn, term: string) => { if (term) sort(column, term); } };
}
function laborValue(row: RepairLaborRow, column: LegacyColumn): RepairLaborTableValue {
  if (column.name === "COL_Mecanico") return { kind: "text", value: row.Descricao };
  if (column.name === "COL_Total") return { kind: "text", value: laborDurationDisplay(laborDuration(row.inicio, row.fim)) };
  return { kind: "date", value: column.name === "COL_Fim" ? row.fim : row.inicio };
}
function materialValue(row: RepairLaborMaterial, column: LegacyColumn): RepairLaborTableValue {
  if (column.name === "COL_datahora") return { kind: "date", value: row.data_hora };
  if (column.name === "COL_quant" || column.name === "COL_preco") return { kind: "number", value: column.name === "COL_quant" ? row.quantidade : row.preco };
  return { kind: "text", value: column.name === "COL_cod_art" ? row.artigo : row.descricao_artigo };
}
function useRead(repository: RepairLaborRepository, numero: string, accept?: (value: Loaded) => void) {
  const [loaded, setLoaded] = useState<Loaded | null>(null), [diagnostic, setDiagnostic] = useState("");
  const sequence = useRef(0), acceptRef = useRef(accept);
  useLayoutEffect(() => { acceptRef.current = accept; }, [accept]);
  const read = useCallback(async () => {
    const request = ++sequence.current;
    try { const result = await repository.read({ numero }); if (request !== sequence.current) return; if (result.kind === "loaded") { setLoaded(result); setDiagnostic(""); acceptRef.current?.(result); } else setDiagnostic(result.kind); }
    catch { if (request === sequence.current) setDiagnostic("transport"); }
  }, [repository, numero]);
  useEffect(() => { const counter = sequence; void Promise.resolve().then(read); return () => { counter.current++; }; }, [read]);
  return { loaded, diagnostic, setDiagnostic, read };
}

export function RepairLaborInformationDialog({ repository, numero, finish, print }: { repository: RepairLaborRepository; numero: string; finish: () => void; print?: (numero: string) => void }) {
  const modal = useRef<WdModalHandle>(null), { loaded, diagnostic } = useRead(repository, numero);
  const close = () => { modal.current?.close(); finish(); };
  return <WdModal ref={modal} layout={infoLayout} instance="repair-labor-info" testId="WIN_Tempos_Reparacao_Informacao" restoreTestId="repair-labor-info-restore" onClose={close}>
    <Captions layout={infoLayout} />
    {memo(infoLayout, "EDT_servico_avaria", loaded?.order.recepcao_servico ?? "")}{memo(infoLayout, "EDT_observacao", loaded?.order.recepcao_obs ?? "")}
    {memo(infoLayout, "EDT_cliente", loaded?.order.cliente ?? "")}{memo(infoLayout, "EDT_contactos", loaded?.order.recepacao_contatos ?? "")}
    <Buttons layout={infoLayout} actions={{ BTN_Fechar: { onClick: close }, BTN_Imprimir1: { disabled: !print || !loaded, onClick: () => print?.(numero) } }} />
    {diagnostic && <output data-testid="repair-labor-info-diagnostic">{diagnostic}</output>}
  </WdModal>;
}
export function RepairLaborStatePicker({ choices, finish }: { choices: RepairOrderStateFilter[]; finish: (state: RepairOrderStateFilter | null) => void }) {
  const modal = useRef<WdModalHandle>(null), [selection, setSelection] = useState<string | null>(null);
  const table = controlOf(pickerLayout, "TABLE_Estados_reparacao"), settings = useTableLayout(table, "WIN_Table_estado_reparacao_tipo3/TABLE_Estados_reparacao");
  const [rows, setRows] = useState(() => choices.filter(row => row.tipo === 3 || row.tipo === 4 || row.tipo === 5));
  const headers = useMemoryHeaders(rows, setRows, selection, setSelection, (row, column) => ({ kind: "text", value: column.name === "COL_Codigo" ? row.Codigo : row.Descricao }));
  const close = (value: RepairOrderStateFilter | null) => { modal.current?.close(); finish(value); };
  return <WdModal ref={modal} layout={pickerLayout} instance="repair-labor-state-picker" testId="WIN_Table_estado_reparacao_tipo3" restoreTestId="repair-labor-state-picker-restore" onClose={() => close(null)}>
    <WdTable control={table} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={setSelection} {...settings} {...headers} designerOptions configureColumns onResetColumns={settings.resetLayout}
      cell={(row, column) => column.name === "COL_Codigo" ? row.Codigo : row.Descricao} />
    <Buttons layout={pickerLayout} actions={{ BTN_selecionar: { onClick: () => close(rows.find(row => row.id === selection) ?? null) }, BTN_Cancelar: { onClick: () => close(null) }, BTN_anterior: { onClick: () => setSelection(move(rows, selection, -1)) }, BTN_seguinte: { onClick: () => setSelection(move(rows, selection, 1)) } }} />
  </WdModal>;
}
export function RepairLaborStateDialog({ repository, descriptiveRepository, numero, finish }: { repository: RepairLaborRepository; descriptiveRepository?: DescriptiveStateRepository; numero: string; finish: () => void }) {
  const modal = useRef<WdModalHandle>(null), calendar = useRef<WdDateEditHandle>(null), history = useRef<HTMLDivElement>(null), pending = useRef(false), lifetime = useRef(0);
  const [description, setDescription] = useState(""), [service, setService] = useState<string | null>(""), [when, setWhen] = useState(() => dateTimeEntryInitial(repairLaborWorkstationClock()));
  const [selection, setSelection] = useState<string | null>(null), [busy, setBusy] = useState(false), [picker, setPicker] = useState(false), [invalid, setInvalid] = useState(false);
  const [keyboard, setKeyboard] = useState<{ field: "description" | "service"; request: TouchKeyboardRequest } | null>(null);
  const { loaded, diagnostic, setDiagnostic } = useRead(repository, numero, value => { setService(value.order.reparacao_servico); setSelection(value.choices.find(state => state.Codigo !== null && state.Codigo === value.order.reparacao_estado)?.id ?? null); });
  const table = controlOf(stateLayout, "TABLE_Estados_reparacao"), settings = useTableLayout(table, "WIN_Tempos_Reparacao_Estado/TABLE_Estados_reparacao");
  useEffect(() => { const counter = lifetime; counter.current++; return () => { counter.current++; }; }, []);
  useLayoutEffect(() => {
    const field = history.current?.querySelector("textarea");
    if (!loaded || !field) return;
    field.setSelectionRange(field.value.length, field.value.length); field.scrollTop = field.scrollHeight;
  }, [loaded]);
  const close = () => { if (pending.current || picker || keyboard) return; lifetime.current++; modal.current?.close(); finish(); };
  const openKeyboard = (field: "description" | "service"): PointerEventHandler<HTMLInputElement | HTMLTextAreaElement> => event => {
    if (event.button !== 0 || busy || !loaded || picker || keyboard) return;
    const control = controlOf(stateLayout, field === "description" ? "EDT_descricao" : "EDT_obs_servico");
    setKeyboard({ field, request: { kind: "alpha", options: { title: field === "description" ? "Descrição" : "Serviço", inputMask: control.input_mask, maxLength: control.input_size, value: (field === "description" ? description : service) ?? "", password: false } } });
  };
  const save = async () => {
    if (pending.current || !loaded) return;
    const value = dateTimeEntryResult(when);
    if (!calendar.current?.validateCalendar() || value.kind !== "valid") { setInvalid(true); return; }
    pending.current = true; setBusy(true); const alive = lifetime.current;
    try {
      const result = await repository.state({ numero, baseline: loaded.baseline, stateId: selection, when: value.value, description, service, now: repairLaborWorkstationClock() });
      if (alive !== lifetime.current) return;
      if (result.kind === "saved") { pending.current = false; close(); } else setDiagnostic(result.kind);
    } catch { if (alive === lifetime.current) setDiagnostic("transport"); }
    finally { if (alive === lifetime.current) { pending.current = false; setBusy(false); } }
  };
  return <WdModal ref={modal} layout={stateLayout} instance="repair-labor-state" testId="WIN_Tempos_Reparacao_Estado" restoreTestId="repair-labor-state-restore" onClose={close}>
    <Captions layout={stateLayout} />
    {memo(stateLayout, "EDT_matricula_marca_modelo", loaded ? `${loaded.order.matricula ?? ""}      ${loaded.order.marcamodelo ?? ""}` : "")}
    <WdTable control={table} rows={loaded?.choices ?? []} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!busy) setSelection(id); }} {...settings} designerOptions configureColumns onResetColumns={settings.resetLayout} showHeaders={false}
      cell={(row, column) => column.name === "COL_imagem" ? <ColorCell value={row.Cor} /> : column.name === "COL_Descricao" ? row.Descricao : ""} />
    <WdDateTimeEdit ref={calendar} control={controlOf(stateLayout, "EDT_Data_Hora")} draft={when} onChange={value => { setWhen(value); setInvalid(false); }} invalid={invalid} disabled={busy} />
    {memo(stateLayout, "EDT_descricao", description, setDescription, busy, { onPointerDown: openKeyboard("description") })}
    <div ref={history}><WdMemo control={controlOf(stateLayout, "EDT_historico")} value={loaded?.order.reparacao_estado_historico ?? ""} /></div>
    {memo(stateLayout, "EDT_obs_servico", service, setService, busy, { onPointerDown: openKeyboard("service") })}
    <Buttons layout={stateLayout} actions={{ BTN_Confirmar: { disabled: busy || !loaded, onClick: () => void save() }, BTN_Cancelar: { disabled: busy, onClick: close }, BTN_NoName1: { disabled: busy || !descriptiveRepository, onClick: () => setPicker(true) }, BTN_anterior: { disabled: busy, onClick: () => setSelection(move(loaded?.choices ?? [], selection, -1)) }, BTN_seguinte: { disabled: busy, onClick: () => setSelection(move(loaded?.choices ?? [], selection, 1)) } }} />
    {picker && descriptiveRepository && <DescriptiveStatePicker repository={descriptiveRepository} origin="" finish={value => { setDescription(value); setPicker(false); }} />}
    {keyboard && <TouchKeyboardDialog request={keyboard.request} finish={(value, outcome) => {
      if (outcome.confirmed && outcome.edited) { if (keyboard.field === "description") setDescription(value); else setService(value); }
      setKeyboard(null);
    }} />}
    {diagnostic && <output data-testid="repair-labor-state-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function RepairLaborTimeDialog({ repository, mechanicRepository, numero, mechanic, mechanics, finish }: { repository: RepairLaborRepository; mechanicRepository?: MechanicRepository; numero: string; mechanic: number; mechanics: RepairOrderMechanic[]; finish: () => void }) {
  const modal = useRef<WdModalHandle>(null), pending = useRef(false), alive = useRef(true), proof = useRef<RepairLaborProof | null>(null);
  const { loaded, diagnostic, setDiagnostic } = useRead(repository, numero), { message } = useDialogs();
  const [activeMechanic, setActiveMechanic] = useState(mechanic), [activeName, setActiveName] = useState(() => mechanics.find(row => row.Codigo === mechanic)?.Descricao ?? ""), [busy, setBusy] = useState(false), [mechanicPicker, setMechanicPicker] = useState(false), [password, setPassword] = useState<number | null>(null), [statePicker, setStatePicker] = useState(false);
  const [stateChoices, setStateChoices] = useState<RepairOrderStateFilter[]>([]);
  const passwordResult = useRef<((value: string | null) => void) | null>(null), stateResult = useRef<((value: RepairOrderStateFilter | null) => void) | null>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; proof.current = null; passwordResult.current?.(null); stateResult.current?.(null); }; }, []);
  const close = () => { if (pending.current || password !== null || mechanicPicker || statePicker) return; proof.current = null; modal.current?.close(); finish(); };
  const askPassword = (code: number) => new Promise<string | null>(resolve => { passwordResult.current = resolve; setPassword(code); });
  const askState = async () => {
    // This source window runs its own query on every Open; keep the prepared write baseline unchanged.
    const current = await repository.read({ numero });
    if (!alive.current) return null;
    if (current.kind !== "loaded") { setDiagnostic(current.kind); return null; }
    setStateChoices(current.choices);
    return new Promise<RepairOrderStateFilter | null>(resolve => { stateResult.current = resolve; setStatePicker(true); });
  };
  const authenticate = async (code: number, required: boolean) => {
    if (proof.current?.mechanic === code) return proof.current;
    const entered = await askPassword(code); if (!alive.current) return null;
    if ((entered === null || entered === "") && !required) return null;
    const candidate = { mechanic: code, password: entered ?? "" }, result = await repository.authenticate(candidate);
    if (!alive.current) return null;
    if (result.kind !== "authenticated") {
      if (result.kind === "denied") await message({ title: "Tempo", text: "Palavra-passe incorreta", type: 0 }); else setDiagnostic(result.kind);
      return null;
    }
    proof.current = candidate; setActiveMechanic(code); setActiveName(result.mechanic.Descricao ?? ""); return candidate;
  };
  const chooseMechanic = async (code: number) => {
    if (pending.current) return; pending.current = true; setBusy(true);
    try { await authenticate(code, false); } catch { if (alive.current) setDiagnostic("transport"); }
    finally { if (alive.current) { pending.current = false; setBusy(false); } }
  };
  const toggle = async () => {
    if (pending.current || !loaded) return; pending.current = true; setBusy(true);
    try {
      const selectedProof = proof.current ?? await authenticate(activeMechanic, true); if (!selectedProof || !alive.current) return;
      const prepared = await repository.prepare({ numero, proof: selectedProof }); if (!alive.current) return;
      if (prepared.kind !== "prepared") { setDiagnostic(prepared.kind); return; }
      const plan: RepairLaborPlan = prepared, closeOthers: string[] = [];
      for (const other of plan.others) {
        const response = await message({ title: "Tempo", text: `Terminar a reparação de ${other.matricula ?? ""} ?`, type: 2, defaultButton: 2 });
        if (!alive.current) return; if (response === 6) closeOthers.push(other.numero);
      }
      const state = !plan.finish && !plan.stateAllowed ? await askState() : null;
      if (!alive.current || (!plan.finish && !plan.stateAllowed && state === null)) return;
      const result = await repository.toggle({ numero, proof: selectedProof, baseline: plan.baseline, now: repairLaborWorkstationClock(), closeOthers, state: state?.id ?? null });
      if (!alive.current) return;
      if (result.kind === "saved") { pending.current = false; close(); } else setDiagnostic(result.kind);
    } catch { if (alive.current) setDiagnostic("transport"); }
    finally { if (alive.current) { pending.current = false; setBusy(false); } }
  };
  // Caption uses latest source-ID, not the displayed open-row query's current selection.
  const currentLabor = loaded?.labor.filter(row => row.mecanico === activeMechanic).sort((left, right) => {
    if (left.tempos_reparacaoID === null) return right.tempos_reparacaoID === null ? 0 : 1;
    if (right.tempos_reparacaoID === null) return -1;
    const a = BigInt(left.tempos_reparacaoID), b = BigInt(right.tempos_reparacaoID); return a < b ? -1 : a > b ? 1 : 0;
  }).at(-1);
  const caption = currentLabor?.fim === OPEN_LABOR_FINISH ? "Finalizar" : "Iniciar";
  return <WdModal ref={modal} layout={timeLayout} instance="repair-labor-time" testId="WIN_Tempos_Reparacao_Tempo" restoreTestId="repair-labor-time-restore" onClose={close}>
    {memo(timeLayout, "EDT_matricula_marca_modelo", loaded ? `${loaded.order.matricula ?? ""}\r\n${loaded.order.marcamodelo ?? ""}` : "")}
    {memo(timeLayout, "EDT_mecanico", activeName)}
    <Buttons layout={timeLayout} actions={{ BTN_Iniciar: { caption, disabled: busy || !loaded, onClick: () => void toggle() }, BTN_Cancelar: { disabled: busy, onClick: close }, BTN_NoName1: { disabled: busy || !mechanicRepository, onClick: () => setMechanicPicker(true) } }} />
    {mechanicPicker && mechanicRepository && <MechanicPicker repository={mechanicRepository} origin="" finish={value => { setMechanicPicker(false); if (value !== "") void chooseMechanic(Number(value)); }} />}
    {password !== null && <RepairMaterialPrompt mode="password" value="" finish={value => { setPassword(null); const resolve = passwordResult.current; passwordResult.current = null; resolve?.(value); }} />}
    {statePicker && <RepairLaborStatePicker choices={stateChoices} finish={value => { setStatePicker(false); const resolve = stateResult.current; stateResult.current = null; resolve?.(value); }} />}
    {diagnostic && <output data-testid="repair-labor-time-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

const Exact = Decimal.clone({ precision: 80 });
function materialTotals(rows: RepairLaborMaterial[]): string | null {
  let total = new Exact(0), extra = new Exact(0);
  for (const row of rows) {
    if (row.preco === null || row.quantidade === null || row.extra === null || !/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(row.preco) || !/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(row.quantidade)) return null;
    const line = new Exact(row.preco).times(row.quantidade);
    if (row.extra) extra = extra.plus(line); else total = total.plus(line);
  }
  return `Extras: ${extra.toFixed(2, Decimal.ROUND_HALF_UP)}    Total: ${total.toFixed(2, Decimal.ROUND_HALF_UP)}    Total c/iva: ${total.times("1.23").toFixed(2, Decimal.ROUND_HALF_UP)}`;
}
export function RepairDescriptionsDialog({ repository, numero, finish, onMaterial, printMaterials, printService }: {
  repository: RepairLaborRepository; numero: string; finish: () => void; onMaterial?: (order: RepairLaborDetail) => Promise<void>;
  printMaterials?: (numero: string, total: string, rows: readonly RepairLaborMaterial[]) => void; printService?: (numero: string) => void;
}) {
  const modal = useRef<WdModalHandle>(null), pending = useRef(false), alive = useRef(true);
  const { message } = useDialogs();
  const [page, setPage] = useState(0), [rows, setRows] = useState<RepairLaborMaterial[]>([]), [busy, setBusy] = useState(false);
  const [laborRows, setLaborRows] = useState<RepairLaborRow[]>([]);
  const [materialBaseline, setMaterialBaseline] = useState<string | null>(null);
  const { loaded, diagnostic, setDiagnostic } = useRead(repository, numero, value => { setRows(value.materials); setMaterialBaseline(value.materialBaseline); setLaborRows(value.labor); });
  const [selection, setSelection] = useState<string | null>(null), [laborSelection, setLaborSelection] = useState<string | null>(null), [price, setPrice] = useState<string | null>(null);
  const materialHeaders = useMemoryHeaders(rows, setRows, selection, setSelection, materialValue, busy), laborHeaders = useMemoryHeaders(laborRows, setLaborRows, laborSelection, setLaborSelection, laborValue, busy);
  const materialTable = controlOf(descriptionsLayout, "TAB_principal.TABLE_materiais"), laborTable = controlOf(descriptionsLayout, "TAB_principal.TABLE_Tempos");
  const materialSettings = useTableLayout(materialTable, "WIN_Table_Tempos_materiais_Descricoes/TAB_principal.TABLE_materiais"), laborSettings = useTableLayout(laborTable, "WIN_Table_Tempos_materiais_Descricoes/TAB_principal.TABLE_Tempos");
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  // System close explicitly does not execute BTN_Sair's writes.
  const close = () => { if (pending.current || price !== null) return; modal.current?.close(); finish(); };
  const save = async () => {
    if (pending.current || !loaded || materialBaseline === null) return; pending.current = true; setBusy(true);
    try {
      const result = await repository.saveMaterials({ numero, baseline: materialBaseline, rows: rows.map(({ id, preco, extra, lancado }) => ({ id, preco, extra, lancado })) });
      if (!alive.current) return;
      if (result.kind === "saved") { pending.current = false; close(); } else setDiagnostic(result.kind);
    } catch { if (alive.current) setDiagnostic("transport"); }
    finally { if (alive.current) { pending.current = false; setBusy(false); } }
  };
  const material = async () => {
    if (pending.current || !loaded || !onMaterial) return; pending.current = true; setBusy(true);
    try {
      const check = await repository.checkMaterials({ numero });
      if (!alive.current) return;
      if (check.kind === "blocked" || check.kind === "in_use") {
        await message({ title: "", text: check.kind === "blocked" ? check.message : "Ordem de reparação em uso por outro utilizador", type: 0 });
        return;
      }
      if (check.kind !== "ready" && check.kind !== "skip") { setDiagnostic(check.kind); return; }
      // Source missing-state path skips Open, then still reloads only the material table.
      if (check.kind === "ready") await onMaterial(check.order);
      if (!alive.current) return;
      const result = await repository.read({ numero });
      if (!alive.current) return;
      // Source721–767 reloads only material rows/totals, retaining its opening descriptions and labor.
      if (result.kind === "loaded") { setRows(result.materials); setMaterialBaseline(result.materialBaseline); setDiagnostic(""); }
      else setDiagnostic(result.kind);
    } catch { if (alive.current) setDiagnostic("transport"); }
    finally { if (alive.current) { pending.current = false; setBusy(false); } }
  };
  const patch = (id: string, change: Partial<RepairLaborMaterial>) => setRows(previous => previous.map(row => row.id === id ? { ...row, ...change } : row));
  const total = materialTotals(rows);
  const durations = loaded?.labor.map(row => laborDurationDisplay(laborDuration(row.inicio, row.fim))) ?? [];
  const materialCell = (row: RepairLaborMaterial, column: LegacyColumn) => {
    if (column.name === "COL_extra" || column.name === "COL_lancado") {
      const field = column.name === "COL_extra" ? "extra" : "lancado";
      return <button className="repair-labor-check" type="button" role="checkbox" aria-label={`${column.title ?? field} ${row.artigo ?? ""}`} aria-checked={row[field] === true} disabled={busy} tabIndex={-1} onClick={() => patch(row.id, { [field]: row[field] !== true })}><WdCheckMark checked={row[field]} /></button>;
    }
    if (column.name === "COL_preco") return <button className="repair-labor-price" type="button" disabled={busy} tabIndex={-1} onClick={() => setPrice(row.id)}>{row.preco ?? ""}</button>;
    const keys: Record<string, keyof RepairLaborMaterial> = { COL_datahora: "data_hora", COL_cod_art: "artigo", COL_desc_artigo: "descricao_artigo", COL_quant: "quantidade" };
    return column.name === "COL_datahora" ? dateTimeEntryDisplay(row.data_hora) : String(row[keys[column.name]] ?? "");
  };
  const pageNames = ["Tempos", "Materiais", "Descrições/Observações", "Histórico dos estados"];
  return <WdModal ref={modal} layout={descriptionsLayout} instance="repair-descriptions" testId="WIN_Table_Tempos_materiais_Descricoes" restoreTestId="repair-descriptions-restore" onClose={close}>
    <div className="repair-labor-tabs" style={controlBox(controlOf(descriptionsLayout, "TAB_principal"))} data-testid="TAB_principal" role="tablist">
      {pageNames.map((name, index) => <button type="button" key={name} role="tab" aria-selected={page === index} disabled={busy} onClick={() => setPage(index)}>{name}</button>)}
    </div>
    <div hidden={page !== 0}>
      <WdTable control={laborTable} rows={laborRows} rowId={row => row.id} selectedId={laborSelection} onSelect={setLaborSelection} {...laborSettings} {...laborHeaders} designerOptions configureColumns onResetColumns={laborSettings.resetLayout}
        cell={(row, column) => column.name === "COL_Mecanico" ? row.Descricao : column.name === "COL_Inicio" ? dateTimeEntryDisplay(row.inicio) : column.name === "COL_Fim" ? dateTimeEntryDisplay(row.fim) : laborDurationDisplay(laborDuration(row.inicio, row.fim))} />
      <WdRadControls layout={descriptionsLayout} bindings={[{ name: "TAB_principal.STC_total", kind: "caption", props: { text: `Total: ${laborSumHours(durations)}` } }]} />
    </div>
    <div hidden={page !== 1}>
      <WdTable control={materialTable} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={setSelection} {...materialSettings} {...materialHeaders} designerOptions configureColumns onResetColumns={materialSettings.resetLayout} cell={materialCell} />
      <WdRadControls layout={descriptionsLayout} bindings={[{ name: "TAB_principal.STC_total_material", kind: "caption", props: { text: total ?? "" } }]} />
      <Buttons layout={descriptionsLayout} actions={{ "TAB_principal.BTN_Material": { disabled: busy || !loaded || !onMaterial, onClick: () => void material() }, "TAB_principal.BTN_Imprimir": { disabled: !printMaterials || total === null, onClick: () => { if (total !== null) printMaterials?.(numero, total, rows); } } }} />
    </div>
    <div hidden={page !== 2}>
      <WdRadControls layout={descriptionsLayout} bindings={[{ name: "TAB_principal.STC_Serviço_Avaria", kind: "caption" }, { name: "TAB_principal.STC_Observação", kind: "caption" }]} />
      {memo(descriptionsLayout, "TAB_principal.EDT_servico_avaria", loaded?.order.recepcao_servico ?? "")}{memo(descriptionsLayout, "TAB_principal.EDT_observacao", loaded?.order.recepcao_obs ?? "")}
      <Buttons layout={descriptionsLayout} actions={{ "TAB_principal.BTN_listagem": { disabled: !printService, onClick: () => printService?.(numero) } }} />
    </div>
    <div hidden={page !== 3}>
      <WdRadControls layout={descriptionsLayout} bindings={[{ name: "TAB_principal.STC_Histórico_dos_estados", kind: "caption" }]} />{memo(descriptionsLayout, "TAB_principal.EDT_historico_estado", loaded?.order.reparacao_estado_historico ?? "")}
    </div>
    <WdRadControls layout={descriptionsLayout} bindings={[{ name: "STC_matricula", kind: "caption", props: { text: loaded?.order.matricula ?? "" } }]} />
    <Buttons layout={descriptionsLayout} actions={{ BTN_Sair: { disabled: busy || !loaded, onClick: () => void save() } }} />
    {price !== null && <RepairMaterialPrompt mode="preco" value={rows.find(row => row.id === price)?.preco ?? null} finish={value => { patch(price, { preco: value }); setPrice(null); }} />}
    {diagnostic && <output data-testid="repair-descriptions-diagnostic">{diagnostic}</output>}
    {total === null && loaded && page === 1 && <output data-testid="repair-descriptions-total-diagnostic">unsupported</output>}
    {/* The source touch-keyboard click paths remain U05; normal text entry stays available. */}
  </WdModal>;
}

function laborOrderCell(row: RepairLaborOrder, column: LegacyColumn) {
  const keys: Record<string, keyof RepairLaborOrder> = { COL_numero: "numero", COL_mecanico: "Descricao_me", COL_matricula: "matricula", COL_marca_modelo: "marcamodelo", COL_estado: "Descricao" };
  if (column.name === "COL_imagem") return <ColorCell value={row.Cor} />;
  if (column.name === "COL_prioridade") return repairOrderPriorityLabel(row.recepcao_prioridade);
  if (column.name === "COL_matricula") return <span className="repair-labor-registration">{row.matricula ?? ""}</span>;
  return String(row[keys[column.name]] ?? "");
}
const orderColumnKeys: Record<string, RepairLaborOrderSort> = { COL_numero: "numero", COL_mecanico: "Descricao_me", COL_matricula: "matricula", COL_marca_modelo: "marcamodelo", COL_prioridade: "recepcao_prioridade", COL_estado: "Descricao", COL_mecanico_codigo: "reparacao_mecanico", COL_estado_codigo: "reparacao_estado" };
function orderHeaderText(row: RepairLaborOrder, key: RepairLaborOrderSort) { return key === "recepcao_prioridade" ? repairOrderPriorityLabel(row.recepcao_prioridade) : String(row[key] ?? ""); }
type OrderHeader = { key: RepairLaborOrderSort; descending: boolean; term?: string };
export function RepairLaborScreen({ repositories }: { repositories: Repositories }) {
  const reports = useReportPreview();
  const { message } = useDialogs(), close = useWorkspaceClose();
  // React StrictMode replays effects; the source startup closure must run once per window instance.
  const initialise = useRef<ReturnType<RepairLaborRepository["initialise"]> | null>(null);
  const [initial, setInitial] = useState<Extract<Awaited<ReturnType<RepairLaborRepository["initialise"]>>, { kind: "loaded" }> | null>(null);
  const [orders, setOrders] = useState<RepairLaborOrder[]>([]), [selection, setSelection] = useState<string | null>(null), [states, setStates] = useState<(RepairOrderStateFilter & { checked: boolean })[]>([]);
  const [stateSelection, setStateSelection] = useState<string | null>(null), [mechanic, setMechanic] = useState<number | null>(null), [labor, setLabor] = useState<RepairLaborRow[]>([]), [laborSelection, setLaborSelection] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(""), [busy, setBusy] = useState(false), [child, setChild] = useState<"time" | "state" | "info" | null>(null);
  const [laborRefresh, setLaborRefresh] = useState(0);
  const laborHeaders = useMemoryHeaders(labor, setLabor, laborSelection, setLaborSelection, laborValue, busy);
  const orderTable = controlOf(listLayout, "TABLE_tempos_reparacao"), stateTable = controlOf(listLayout, "TABLE_Estados_reparacao"), laborTable = controlOf(listLayout, "TABLE_tempos_reparacao_ordem");
  const orderSettings = useTableLayout(orderTable, "WIN_Tempos_Reparacao/TABLE_tempos_reparacao"), stateSettings = useTableLayout(stateTable, "WIN_Tempos_Reparacao/TABLE_Estados_reparacao"), laborSettings = useTableLayout(laborTable, "WIN_Tempos_Reparacao/TABLE_tempos_reparacao_ordem");
  const latest = useRef({ orders, selection, states, mechanic, child }), request = useRef(0), childRequest = useRef(0), lifetime = useRef(0), inFlight = useRef(false), messageRef = useRef(message);
  const stateReturnIndex = useRef<number | null>(null), mechanicPointer = useRef<string | null>(null);
  const orderHeader = useRef<OrderHeader | null>(null);
  useLayoutEffect(() => { latest.current = { orders, selection, states, mechanic, child }; messageRef.current = message; }, [orders, selection, states, mechanic, child, message]);
  const read = useCallback(async (nextMechanic = latest.current.mechanic, nextStates = latest.current.states, tick = false, restoreIndex: number | null = null, header?: OrderHeader) => {
    if (inFlight.current) return;
    const owner = ++request.current, alive = lifetime.current; inFlight.current = true; setBusy(true);
    try {
      const before = latest.current, number = before.orders.find(row => row.id === before.selection)?.numero;
      if (tick) {
        const closed = await repositories.labor.tick({ now: repairLaborWorkstationClock(), visible: before.orders.map(row => ({ numero: row.numero, mechanic: row.reparacao_mecanico, state: row.reparacao_estado })) });
        if (owner !== request.current || alive !== lifetime.current) return;
        if (closed.kind !== "saved") { setDiagnostic(closed.kind); return; }
      }
      orderHeader.current = header ?? null;
      const result = await repositories.labor.list({ mechanic: nextMechanic, states: nextStates.filter(row => row.checked).map(row => row.Codigo), ...(header ? { sort: header.key, descending: header.descending } : {}) });
      if (owner !== request.current || alive !== lifetime.current) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setOrders(result.orders);
      setSelection(header ? selectAfterTableRead(result.orders, before.selection, header.term !== undefined ? { term: header.term, value: row => orderHeaderText(row, header.key) } : undefined)
        : restoreIndex !== null ? result.orders[restoreIndex]?.id ?? null : result.orders.find(row => row.numero === number)?.id ?? result.orders.at(-1)?.id ?? null); setDiagnostic("");
    } catch { if (owner === request.current && alive === lifetime.current) setDiagnostic("transport"); }
    finally { if (owner === request.current && alive === lifetime.current) { inFlight.current = false; setBusy(false); } }
  }, [repositories.labor]);
  useEffect(() => {
    const lifecycle = lifetime, reads = request, childReads = childRequest;
    const alive = ++lifecycle.current; let timer: ReturnType<typeof setTimeout> | undefined;
    void (async () => {
      try {
        const result = await (initialise.current ??= repositories.labor.initialise({ now: repairLaborWorkstationClock() })); if (alive !== lifetime.current) return;
        if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
        const nextStates = result.states.map(row => ({ ...row, checked: true }));
        setInitial(result); setStates(nextStates); setStateSelection(nextStates[0]?.id ?? null); await read(null, nextStates);
        const milliseconds = repairOrderTimerMilliseconds(result.settings.Tempo_tempos);
        if (milliseconds === null) { await messageRef.current({ title: "Tempos de Reparação", text: "Erro ao criar timer de atualização", type: 1 }); return; }
        const interval = BigInt(milliseconds);
        const schedule = (remaining: bigint) => {
          if (alive !== lifetime.current) return;
          const chunk = remaining > 2147483647n ? 2147483647n : remaining;
          timer = setTimeout(() => { if (remaining > chunk) schedule(remaining - chunk); else { if (!latest.current.child && !inFlight.current) void read(undefined, undefined, true); schedule(interval); } }, Number(chunk));
        };
        schedule(interval);
      } catch { if (alive === lifetime.current) setDiagnostic("transport"); }
    })();
    return () => { lifecycle.current++; reads.current++; childReads.current++; inFlight.current = false; if (timer) clearTimeout(timer); };
  }, [repositories.labor, read]);
  const selected = orders.find(row => row.id === selection);
  useEffect(() => {
    const counter = childRequest, owner = ++counter.current;
    if (!selected?.numero) return;
    void repositories.labor.read({ numero: selected.numero }).then(result => { if (owner !== childRequest.current) return; if (result.kind === "loaded") { setLabor(result.labor.filter(row => row.fim === OPEN_LABOR_FINISH)); setLaborSelection(null); } else setDiagnostic(result.kind); }).catch(() => { if (owner === childRequest.current) setDiagnostic("transport"); });
    return () => { counter.current++; };
  }, [repositories.labor, selected?.numero, orders, laborRefresh]);
  const navigateOrder = (delta: number) => { setSelection(move(orders, selection, delta)); setLaborRefresh(value => value + 1); };
  const toggleState = (id: string) => { if (inFlight.current) return; const next = states.map(row => row.id === id ? { ...row, checked: !row.checked } : row); setStates(next); setStateSelection(id); void read(mechanic, next); };
  const open = async (kind: NonNullable<typeof child>) => {
    if (busy || !selected?.numero) return;
    if (kind === "state" && selected.tipo === 2) { await message({ title: "Tempos de Reparação", text: "A reparação está a espera do início", type: 0 }); return; }
    stateReturnIndex.current = kind === "state" ? orders.findIndex(row => row.id === selection) : null;
    setChild(kind);
  };
  const finishChild = () => { const kind = latest.current.child, restore = stateReturnIndex.current; stateReturnIndex.current = null; setChild(null); if (kind !== "info") void read(undefined, undefined, false, kind === "state" ? restore : null); };
  const sortOrders = (column: LegacyColumn, term?: string) => {
    const key = orderColumnKeys[column.name]; if (busy || !key) return;
    const descending = term === undefined && orderHeader.current?.key === key ? !orderHeader.current.descending : false;
    void read(undefined, undefined, false, null, { key, descending, term });
  };
  const list = controlOf(listLayout, "LIST_mecanicos"), selectedLabor = labor.find(row => row.id === laborSelection);
  return <div data-testid="WIN_Tempos_Reparacao" className="repair-labor-screen" onKeyDown={event => {
    if (event.key === "Escape" && !busy && !child && !(event.target instanceof Element && event.target.closest("dialog"))) close();
    if (event.key === " " && event.target instanceof HTMLElement && event.target.dataset.testid === stateTable.name && stateSelection) { event.preventDefault(); toggleState(stateSelection); }
  }}>
    <Captions layout={listLayout} exclude={["STC_filtro_atual"]} />
    <div data-testid="STC_Tempos_de_Reparação" style={controlBox(controlOf(listLayout, "STC_Tempos_de_Reparação"))}>Tempos de Reparação</div>
    <WdRadControls layout={listLayout} bindings={[{ name: "STC_filtro_atual", kind: "caption", props: { text: mechanic === null ? "Todos" : initial?.mechanics.find(row => row.Codigo === mechanic)?.Descricao ?? "" } }]} />
    <select size={8} data-testid="LIST_mecanicos" aria-label="Mecânicos" className="repair-labor-mechanics" style={controlBox(list)} value={mechanic === null ? "" : String(mechanic)} disabled={busy} onChange={event => { const value = Number(event.currentTarget.value); setMechanic(value); void read(value); }}
      onMouseDown={event => { mechanicPointer.current = event.button === 0 ? event.currentTarget.value : null; }}
      onMouseUp={event => {
        const before = mechanicPointer.current; mechanicPointer.current = null;
        // Source294–331 runs on release even when the current option emits no change.
        // A changed option keeps the existing onChange read, including keyboard selection.
        if (event.button !== 0 || busy || before === null || before === "" || event.currentTarget.value !== before) return;
        const value = Number(before); setMechanic(value); void read(value);
      }}>
      {initial?.mechanics.filter(row => row.Codigo !== null).map(row => <option key={row.id} value={String(row.Codigo)}>{row.Descricao ?? ""}</option>)}
    </select>
    <div style={{ display: "contents" }} onClick={event => {
      // Source753–792 applies the current filter for any plain left-clicked state row.
      // Checkbox clicks already refresh using their changed draft; keep double-click routing intact.
      if (!busy && event.button === 0 && event.target instanceof Element && event.target.closest("tbody tr") && !event.target.closest('[role="checkbox"]')) void read();
    }}>
    <WdTable control={stateTable} rows={states} rowId={row => row.id} selectedId={stateSelection} onSelect={setStateSelection} {...stateSettings} designerOptions configureColumns onResetColumns={stateSettings.resetLayout} showHeaders={false}
      cell={(row, column) => column.name === "COL_checkbox" ? <button type="button" className="repair-labor-check" role="checkbox" aria-label={`Selecionar estado ${row.Codigo ?? ""}`} aria-checked={row.checked} tabIndex={-1} disabled={busy} onClick={() => toggleState(row.id)}><WdCheckMark checked={row.checked} /></button> : column.name === "COL_imagem" ? <ColorCell value={row.Cor} /> : column.name === "COL_Descricao" ? row.Descricao : ""} />
    </div>
    <WdTable control={orderTable} rows={orders} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!busy) setSelection(id); }} {...orderSettings} onSort={column => sortOrders(column)} onColumnSearch={(column, term) => { if (term) sortOrders(column, term); }} designerOptions configureColumns onResetColumns={orderSettings.resetLayout} cell={laborOrderCell} />
    <WdTable control={laborTable} rows={selected?.numero ? labor : []} rowId={row => row.id} selectedId={laborSelection} onSelect={setLaborSelection} {...laborSettings} {...laborHeaders} designerOptions configureColumns onResetColumns={laborSettings.resetLayout} cell={(row, column) => column.name === "COL_Mecanico" ? row.Descricao : dateTimeEntryDisplay(row.inicio)} />
    <Buttons layout={listLayout} actions={{ BTN_Fechar: { disabled: busy, onClick: close }, BTN_todos: { disabled: busy, onClick: () => { setMechanic(null); void read(null); } }, BTN_Estado: { disabled: busy || !selected?.numero, onClick: () => void open("state") }, BTN_Informacao: { disabled: busy || !selected?.numero, onClick: () => void open("info") }, BTN_Tempos: { disabled: busy || !selected?.numero, onClick: () => void open("time") }, BTN_anterior: { disabled: busy, onClick: () => navigateOrder(-1) }, BTN_seguinte: { disabled: busy, onClick: () => navigateOrder(1) }, BTN_anterior1: { disabled: busy, onClick: () => setStateSelection(move(states, stateSelection, -1)) }, BTN_seguinte1: { disabled: busy, onClick: () => setStateSelection(move(states, stateSelection, 1)) }, BTN_anterior2: { disabled: busy, onClick: () => setLaborSelection(move(labor, laborSelection, -1)) }, BTN_seguinte2: { disabled: busy, onClick: () => setLaborSelection(move(labor, laborSelection, 1)) } }} />
    {selected?.numero && child === "info" && <RepairLaborInformationDialog repository={repositories.labor} numero={selected.numero} finish={finishChild} print={numero => { void reports.preview({ reportId: "RPT_Servico_Avaria", context: reportContext(), source: { kind: "programmatic", orderNumber: numero } }); }} />}
    {selected?.numero && child === "state" && <RepairLaborStateDialog repository={repositories.labor} descriptiveRepository={repositories.descriptions} numero={selected.numero} finish={finishChild} />}
    {selected?.numero && child === "time" && <RepairLaborTimeDialog repository={repositories.labor} mechanicRepository={repositories.mechanics} numero={selected.numero} mechanic={selectedLabor?.mecanico ?? selected.reparacao_mecanico ?? 0} mechanics={initial?.mechanics ?? []} finish={finishChild} />}
    {reports.element}
    {diagnostic && <output data-testid="repair-labor-diagnostic">{diagnostic}</output>}
  </div>;
}
function RepairLaborLauncher({ repositories }: { repositories: Repositories }) {
  const { open } = useWorkspace();
  return <button data-testid="repair-labor-open" onClick={() => open({ layout: listLayout, content: <RepairLaborScreen repositories={repositories} /> })}>Tempos de Reparação</button>;
}
export default function RepairLaborWorkflow() {
  const [repositories, setRepositories] = useState<Repositories | null>(null), [failed, setFailed] = useState(false);
  useEffect(() => { let active = true; void Promise.all([isolatedRepairLaborRepository(), isolatedMechanicRepository(), isolatedDescriptiveStateRepository()]).then(([labor, mechanics, descriptions]) => { if (active) setRepositories({ labor, mechanics, descriptions }); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": "600px" } as CSSProperties}><aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside><WdWorkspace>{repositories && <RepairLaborLauncher repositories={repositories} />}</WdWorkspace></main></DialogProvider>;
}
