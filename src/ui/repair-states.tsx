import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { repairStateTypeLabel, type RepairState, type RepairStateList, type RepairStateValues } from "../../packages/domain/src/repair-states";
import type { RepairStateRepository } from "../application/repair-states";
import { isolatedRepairStateRepository } from "../infrastructure/repair-states";
import { selectRepairStateColor, type RepairStateColorChooser } from "../infrastructure/repair-state-color";
import sourceListLayout from "./legacy/WIN_Table_estados_reparacao.layout.json";
import sourceFormLayout from "./legacy/WIN_Form_estados_reparacao.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton } from "./legacy/wd";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

// JPG-backed labels; generated source metadata remains immutable (ADR-003/U01).
const formCaptions: Record<string, string> = { RADTitle: "Estados Reparação", EDT_Descricao: "Descrição",
  CBOX_NoName1: "Selecionar por defeito", CBOX_NoName2: "Permite lançar material", CBOX_NoName3: "Pedir confirmação na mudança do estado",
  CBOX_NoName4: "Pedir data de entrega", CBOX_NoName5: "Pedir data de pagamento" };
const formLayout = { ...sourceFormLayout, controls: sourceFormLayout.controls.map(control => formCaptions[control.name] ? { ...control, caption: formCaptions[control.name] } : control) };
const listLayout = { ...sourceListLayout, controls: sourceListLayout.controls.map(control => control.name === "RADTitle" ? { ...control, caption: "Tabela de Estados de Reparação" } : control) };
const tableSource = controlOf(listLayout, "TABLE_estados_reparacao");
const table = { ...tableSource, columns: tableSource.columns?.map(column => column.name === "COL_Descricao" ? { ...column, title: "Descrição" } : column) };
const formTitle = controlOf(formLayout, "RADTitle").caption!;
const listTitle = controlOf(listLayout, "RADTitle").caption!;
const columnKeys: Record<string, NonNullable<RepairStateList["sort"]>> = { COL_Codigo: "Codigo", COL_Descricao: "Descricao", COL_Tipo: "tipo" };
const radioOptions = ["Recepção", "Aguardar início reparação", "Em reparação", "Teste", "Lavagem", "Reparação suspensa", "Reparação finalizada", "Orçamento"].map((label, index) => ({ label, value: index + 1 }));
const flagBindings = [["CBOX_NoName1", "lancar_defa"], ["CBOX_NoName2", "lancar_material"], ["CBOX_NoName3", "confirmacao"], ["CBOX_NoName4", "pedir_data_entrega"], ["CBOX_NoName5", "pedir_data_pag"]] as const;
type Flags = Pick<RepairStateValues, typeof flagBindings[number][1]>;

/** WINDEV RGB stores red in the low byte. Unknown/special colors keep raw storage (ADR-003/U03). */
function colorPreview(color: number | null): string {
  if (color === null || color < 0 || color > 0xffffff) return "#ffffff";
  return `rgb(${color % 256}, ${Math.floor(color / 256) % 256}, ${Math.floor(color / 65536) % 256})`;
}
function numericColor(text: string): number | undefined {
  if (text === "") return 0; // ADR-003/U03 numeric-empty default, not recovered runtime coercion.
  if (!/^\d+$/.test(text)) return undefined;
  const value = Number(text);
  return Number.isSafeInteger(value) && value <= 4294967295 ? value : undefined;
}

function RepairStateForm({ repository, repairState, descriptions, chooser, finish }: {
  repository: RepairStateRepository; repairState: RepairState | null; descriptions: readonly string[];
  chooser: RepairStateColorChooser; finish: (saved: boolean) => void;
}) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false), chooserOwner = useRef(0);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [tipo, setTipo] = useState<number | null>(() => repairState ? repairState.tipo : 1);
  const [flags, setFlags] = useState<Flags>(() => ({ lancar_defa: repairState ? repairState.lancar_defa : false, lancar_material: repairState ? repairState.lancar_material : false,
    confirmacao: repairState ? repairState.confirmacao : false, pedir_data_entrega: repairState ? repairState.pedir_data_entrega : false, pedir_data_pag: repairState ? repairState.pedir_data_pag : false }));
  const [color, setColor] = useState<{ text: string; raw: number | null | undefined }>(() => ({ text: String(repairState?.Cor ?? (repairState ? "" : 0)), raw: repairState ? repairState.Cor : 0 }));
  const [preview, setPreview] = useState(() => repairState ? colorPreview(repairState.Cor) : "#ffffff");
  const { register, getValues, setValue, formState: { dirtyFields } } = useForm<{ Codigo: string; Descricao: string }>({ defaultValues: { Codigo: repairState?.Codigo ?? "", Descricao: repairState?.Descricao ?? "" } });
  const { message } = useDialogs();
  useEffect(() => () => { chooserOwner.current++; }, []);
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const chooseColor = async () => {
    if (pending.current) return;
    if (color.raw === undefined) { setDiagnostic("invalid_color"); return; }
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++chooserOwner.current;
    try {
      const result = await chooser(color.raw);
      if (owner !== chooserOwner.current) return;
      // Source237–240 ignores SelectColor's Boolean: cancellation also assigns input AND preview.
      setColor({ text: String(result.color ?? ""), raw: result.color }); setPreview(colorPreview(result.color));
    } catch { if (owner === chooserOwner.current) setDiagnostic("native_color"); }
    finally { if (owner === chooserOwner.current) { pending.current = false; setBusy(false); } }
  };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues();
      if (text.Codigo === "") { await message({ title: formTitle, text: "Falta indicar o código", type: 0 }); return; }
      if (color.raw === undefined) { setDiagnostic("invalid_color"); return; }
      const values: RepairStateValues = { Codigo: text.Codigo, Descricao: repairState && !dirtyFields.Descricao ? repairState.Descricao : text.Descricao, tipo, Cor: color.raw, ...flags };
      const result = await repository.save(repairState ? { mode: "update", id: repairState.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formTitle, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-CE554DEA-03: developer-only diagnostics, no invented legacy failure text.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const bindings: WdRadBinding[] = [
    { name: "EDT_Codigo", kind: "edit", props: { ...register("Codigo"), readOnly: repairState !== null, disabled: busy } },
    { name: "EDT_Descricao", kind: "edit", props: { ...register("Descricao"), disabled: busy, suggestions: descriptions, onSuggestion: value => setValue("Descricao", value, { shouldDirty: true }) } },
    { name: "STC_Tipo", kind: "caption" },
    { name: "RADIO_NoName1", kind: "radio", props: { label: "Tipo", options: radioOptions, value: tipo, onChange: setTipo, disabled: busy } },
    { name: "EDT_Cor", kind: "edit", props: { value: color.text, onChange: event => setColor({ text: event.currentTarget.value, raw: numericColor(event.currentTarget.value) }), integerMask: true, disabled: busy } },
    { name: "SHA_cor", kind: "shape", props: { backgroundColor: preview } },
    { name: "BTN_VISION", kind: "button", props: { disabled: busy, onClick: () => void chooseColor() } },
    ...flagBindings.map(([name, key]): WdRadBinding => ({ name, kind: "checkbox", props: { checked: flags[key], onChange: value => setFlags(previous => ({ ...previous, [key]: value })), disabled: busy } })),
  ];
  return <WdModal ref={dialog} layout={formLayout} instance="repair-state-form-frame" testId="WIN_Form_estados_reparacao" restoreTestId="repair-state-form-restore"
    onClose={() => close()} onKeyDown={event => { if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); } }}>
    <div data-testid="SC_Form" style={{ display: "contents" }}><WdRadControls layout={formLayout} bindings={bindings} /></div>
    <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
    <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {diagnostic && <output data-testid="repair-state-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function RepairStateListScreen({ repository, selecting = false, chooser = selectRepairStateColor, finish }: {
  repository: RepairStateRepository; selecting?: boolean; chooser?: RepairStateColorChooser; finish?: (code?: string) => void;
}) {
  const close = useWorkspaceClose(finish ? () => finish() : undefined), { resource, message } = useDialogs();
  const [query, setQuery] = useState<RepairStateList>({}), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<RepairState[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ query: RepairStateList; refresh: number } | null>(null);
  const [form, setForm] = useState<{ repairState: RepairState | null } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), [busy, setBusy] = useState(false), readOwner = useRef(0);
  const columnSearch = useRef<{ key: NonNullable<RepairStateList["sort"]>; term: string } | null>(null);
  const settings = useTableLayout(table, "WIN_Table_estados_reparacao/TABLE_estados_reparacao");
  useEffect(() => () => { readOwner.current++; }, []);
  useEffect(() => {
    let active = true;
    void repository.list(query).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.repairStates); setLoaded({ query, refresh }); setDiagnostic("");
      const sought = columnSearch.current;
      const match = sought && result.repairStates.find(row => (sought.key === "tipo" ? repairStateTypeLabel(row.tipo) : String(row[sought.key] ?? "")).toLocaleLowerCase("pt-PT").startsWith(sought.term.toLocaleLowerCase("pt-PT")));
      columnSearch.current = null;
      // UNRESOLVED U-CEBED898-02: preserve explicit selection without guessing initial/delete fallback.
      setSelection(previous => match ? match.id : result.repairStates.some(row => row.id === previous) ? previous : null);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, query, refresh]);
  const ready = loaded?.query === query && loaded?.refresh === refresh;
  const current = rows.find(row => row.id === selection);
  const remove = async () => {
    if (!ready || !current || pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++readOwner.current;
    try {
      const check = await repository.checkDelete(current.id);
      if (owner !== readOwner.current) return;
      if (check.kind === "associated") { await message({ title: listTitle, text: check.message, type: 0 }); return; }
      if (check.kind !== "ready") { setDiagnostic(check.kind); return; }
      const answer = await resource({ title: listTitle, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (owner !== readOwner.current || answer.result !== 1) return;
      const result = await repository.remove(current.id);
      if (owner !== readOwner.current) return;
      if (result.kind === "associated") await message({ title: listTitle, text: result.message, type: 0 });
      else if (result.kind === "deleted") setRefresh(value => value + 1); else setDiagnostic(result.kind);
    } catch { if (owner === readOwner.current) setDiagnostic("transport"); }
    finally { if (owner === readOwner.current) { pending.current = false; setBusy(false); } }
  };
  const modify = async (id: string) => {
    if (!ready || pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++readOwner.current;
    try {
      // Source260 refreshes before opening and source265 refreshes after ANY form result.
      const result = await repository.list(query);
      if (owner !== readOwner.current) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.repairStates);
      const record = result.repairStates.find(row => row.id === id);
      if (record) setForm({ repairState: record });
    } catch { if (owner === readOwner.current) setDiagnostic("transport"); }
    finally { if (owner === readOwner.current) { pending.current = false; setBusy(false); } }
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    columnSearch.current = null; const key = columnKeys[column.name];
    if (key) setQuery(previous => ({ sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  const choose = (row: RepairState) => { if (row.Codigo !== null) finish?.(row.Codigo); };
  return <div data-testid="WIN_Table_estados_reparacao" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !pending.current && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={table} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && !pending.current && row) { if (selecting) choose(row); else void modify(row.id); } }}
      onColumnSearch={(column, term) => { if (pending.current) return; const key = columnKeys[column.name]; if (!key) return; columnSearch.current = term ? { key, term } : null; if (term) setQuery({ sort: key, descending: false }); }}
      cell={(row, column) => column.name === "COL_Codigo" ? row.Codigo ?? "" : column.name === "COL_Descricao" ? row.Descricao ?? "" : column.name === "COL_Tipo" ? repairStateTypeLabel(row.tipo) : ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} disabled={!ready || busy} onClick={() => setForm({ repairState: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} disabled={!ready || busy} onClick={() => { if (current) void modify(current.id); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} disabled title="MIG-13" />
    <WdButton control={controlOf(listLayout, "BTN_Fechar")} disabled={busy} onClick={close} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_selecionar"), visible: selecting }} disabled={!ready || busy} onClick={() => { if (current) choose(current); }} />
    {form && <RepairStateForm repository={repository} repairState={form.repairState} chooser={chooser} descriptions={rows.flatMap(row => row.Descricao === null ? [] : [row.Descricao])}
      finish={saved => { const editing = form.repairState !== null; setForm(null); if (saved || editing) setRefresh(value => value + 1); }} />}
    {diagnostic && <output data-testid="repair-state-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

export function RepairStatePicker({ repository, origin, chooser, finish }: { repository: RepairStateRepository; origin: string; chooser?: RepairStateColorChooser; finish: (code: string) => void }) {
  const dialog = useRef<WdModalHandle>(null);
  const close = (code: string = origin) => { dialog.current?.close(); finish(code); };
  return <WdModal ref={dialog} layout={listLayout} instance="repair-state-picker-frame" testId="repair-state-picker" restoreTestId="repair-state-picker-restore" onClose={() => close()}>
    <RepairStateListScreen repository={repository} selecting chooser={chooser} finish={close} />
  </WdModal>;
}
function RepairStateLauncher({ repository, chooser }: { repository: RepairStateRepository; chooser: RepairStateColorChooser }) {
  const { open } = useWorkspace();
  return <span data-testid="repair-states-launcher"><button data-testid="repair-states-open" onClick={() => open({ layout: listLayout, content: <RepairStateListScreen repository={repository} chooser={chooser} /> })}>{controlOf(listLayout, "RADTitle").caption}</button></span>;
}
export default function RepairStatesWorkflow({ chooser = selectRepairStateColor }: { chooser?: RepairStateColorChooser }) {
  const [repository, setRepository] = useState<RepairStateRepository | null>(null), [failed, setFailed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false), [returned, setReturned] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search), directSelector = params.get("selecting") === "1";
  useEffect(() => { let active = true; void isolatedRepairStateRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && (directSelector ? <button data-testid="repair-states-select-open" onClick={() => setPickerOpen(true)}>{controlOf(listLayout, "RADTitle").caption}</button> : <RepairStateLauncher repository={repository} chooser={chooser} />)}
      {repository && pickerOpen && <RepairStatePicker repository={repository} origin={params.get("origin") ?? ""} chooser={chooser} finish={code => { setReturned(code); setPickerOpen(false); }} />}
    </WdWorkspace>
    {returned !== null && <output data-testid="repair-states-returned">{returned}</output>}
  </main></DialogProvider>;
}
