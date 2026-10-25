import { useListReportPreview } from "./report-callers";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import type { DescriptiveState, DescriptiveStateList, DescriptiveStateValues } from "../../packages/domain/src/descriptive-states";
import type { DescriptiveStateRepository } from "../application/descriptive-states";
import { isolatedDescriptiveStateRepository } from "../infrastructure/descriptive-states";
import listLayout from "./legacy/WIN_Table_estados_descritivos.layout.json";
import formLayout from "./legacy/WIN_Form_estados_descritivos.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton, WdEdit } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

// Inferred from designer JPGs, ADR-015; generated metadata stays unchanged.
const displayedFormLayout = { ...formLayout, controls: formLayout.controls.map(control => control.name === "EDT_Descricao" ? { ...control, caption: "Descrição" } : control) };
const formTitle = controlOf(formLayout, "RADTitle").caption!;

function DescriptiveStateForm({ repository, descriptiveState, descriptions, finish }: { repository: DescriptiveStateRepository; descriptiveState: DescriptiveState | null; descriptions: readonly string[]; finish: (saved: boolean) => void }) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const { message } = useDialogs();
  const { register, getValues, setValue, formState: { dirtyFields } } = useForm<{ Codigo: string; Descricao: string }>({ defaultValues: { Codigo: descriptiveState?.Codigo ?? "", Descricao: descriptiveState?.Descricao ?? "" } });
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues();
      const values: DescriptiveStateValues = { Codigo: text.Codigo, Descricao: descriptiveState && !dirtyFields.Descricao ? descriptiveState.Descricao : text.Descricao };
      const result = await repository.save(descriptiveState ? { mode: "update", id: descriptiveState.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formTitle, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-CB7C31CC-03: developer diagnostic only; no invented legacy failure text.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  return <WdModal ref={dialog} layout={displayedFormLayout} instance="descriptiveState-form-frame" testId="WIN_Form_estados_descritivos" restoreTestId="descriptiveState-form-restore"
    onClose={() => close()} onKeyDown={event => {
      // ADR-003 defaults; exact native Validate-key precedence retains the form U-*-01.
      if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); }
    }}>
      <div data-testid="SC_Form" style={{ display: "contents" }}>
        <WdEdit control={controlOf(formLayout, "EDT_Codigo")} {...register("Codigo")} readOnly={descriptiveState !== null} disabled={busy} />
        <WdEdit control={controlOf(displayedFormLayout, "EDT_Descricao")} {...register("Descricao")} disabled={busy} suggestions={descriptions} onSuggestion={value => setValue("Descricao", value, { shouldDirty: true })} />
      </div>
      <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
      <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {diagnostic && <output data-testid="descriptiveState-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function DescriptiveStateListScreen({ repository, selecting = false, finish }: { repository: DescriptiveStateRepository; selecting?: boolean; finish?: (description?: string) => void }) {
  const report = useListReportPreview("RPT_List_estados_descritivos");
  const close = useWorkspaceClose(finish ? () => finish() : undefined), { resource } = useDialogs();
  const [query, setQuery] = useState<DescriptiveStateList>({}), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<DescriptiveState[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ query: DescriptiveStateList; refresh: number } | null>(null);
  const [form, setForm] = useState<{ descriptiveState: DescriptiveState | null } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), [busy, setBusy] = useState(false);
  const tableSource = controlOf(listLayout, "TABLE_estados_descritivos");
  const table = { ...tableSource, columns: tableSource.columns?.map(column => column.name === "COL_Descricao" ? { ...column, title: "Descrição" } : column) };
  const columnSearch = useRef<{ key: NonNullable<DescriptiveStateList["sort"]>; term: string } | null>(null);
  const settings = useTableLayout(table, "WIN_Table_estados_descritivos/TABLE_estados_descritivos");
  useEffect(() => {
    let active = true;
    void repository.list(query).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.descriptiveStates); setLoaded({ query, refresh }); setDiagnostic("");
      // UNRESOLVED U-CC5618D6-02: preserve an explicit existing selection; no guessed fallback row.
      const sought = columnSearch.current;
      const match = sought && result.descriptiveStates.find(row => row[sought.key]?.toLocaleLowerCase("pt-PT").startsWith(sought.term.toLocaleLowerCase("pt-PT")));
      columnSearch.current = null;
      setSelection(previous => match ? match.id : result.descriptiveStates.some(row => row.id === previous) ? previous : null);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, query, refresh]);
  const ready = loaded?.query === query && loaded?.refresh === refresh;
  const focused = useRef(false), screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selecting && ready && !focused.current) { screen.current?.querySelector<HTMLButtonElement>('[data-testid="BTN_selecionar"]')?.focus(); focused.current = true; }
  }, [selecting, ready]);
  const current = rows.find(row => row.id === selection);
  const remove = async () => {
    if (!ready || !current || pending.current) return;
    pending.current = true; setBusy(true);
    try {
      const answer = await resource({ title: listLayout.window.title, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (answer.result !== 1) return;
      const result = await repository.remove(current.id);
      if (result.kind === "deleted") setRefresh(value => value + 1);
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    columnSearch.current = null;
    const key = (column.name === "COL_Estados_descritivosID" ? "estados_descritivosID" : column.name.slice(4)) as NonNullable<DescriptiveStateList["sort"]>;
    setQuery(previous => ({ sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  const choose = (row: DescriptiveState) => { if (row.Descricao !== null) finish?.(row.Descricao); };
  const move = (direction: -1 | 1) => {
    if (!ready || pending.current) return;
    const index = rows.findIndex(row => row.id === selection);
    const currentIndex = index < 0 ? -1 : index + 1;
    const requested = direction === 1 ? currentIndex < rows.length ? currentIndex + 1 : null : currentIndex > 1 ? currentIndex - 1 : null;
    if (requested === null) return;
    // UNRESOLVED U-CC5618D6-02: source next requests0 from no selection; native effects stay unpinned.
    if (requested >= 1 && requested <= rows.length) setSelection(rows[requested - 1].id);
  };
  return <div ref={screen} data-testid="WIN_Table_estados_descritivos" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={table} rowHeight={selecting ? 30 : undefined} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && !pending.current && row) { if (selecting) choose(row); else setForm({ descriptiveState: row }); } }}
      onColumnSearch={(column, term) => {
        if (pending.current) return;
        const key = (column.name === "COL_Estados_descritivosID" ? "estados_descritivosID" : column.name.slice(4)) as NonNullable<DescriptiveStateList["sort"]>;
        columnSearch.current = term ? { key, term } : null;
        if (term) setQuery({ sort: key, descending: false });
      }}
      cell={(row, column) => column.name === "COL_Codigo" ? row.Codigo ?? "" : column.name === "COL_Descricao" ? row.Descricao ?? "" : row.estados_descritivosID ?? ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} hidden={selecting} disabled={!ready || busy} onClick={() => setForm({ descriptiveState: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} hidden={selecting} disabled={!ready || busy} onClick={() => { if (current) setForm({ descriptiveState: current }); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} hidden={selecting} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_Fechar"), ...(selecting ? { y: 506, height: 38 } : {}) }} onClick={close} />
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} hidden={selecting} disabled={report.busy} onClick={report.preview} />
    {report.element}
    <WdButton control={{ ...controlOf(listLayout, "BTN_selecionar"), visible: selecting }} disabled={!ready || busy} onClick={() => { if (current) choose(current); }} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_seguinte"), visible: selecting }} disabled={!ready || busy} onClick={() => move(1)} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_anterior"), visible: selecting }} disabled={!ready || busy} onClick={() => move(-1)} />
    {form && <DescriptiveStateForm repository={repository} descriptiveState={form.descriptiveState} descriptions={rows.flatMap(row => row.Descricao === null ? [] : [row.Descricao])} finish={saved => { const editing = form.descriptiveState !== null; setForm(null); if (saved || editing) setRefresh(value => value + 1); }} />}
    {diagnostic && <output data-testid="descriptiveState-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

// WIN_Tempos_Reparacao_Estado.wdw:416 consumes this description result when its real workflow is ported.
export function DescriptiveStatePicker({ repository, origin, finish }: { repository: DescriptiveStateRepository; origin: string; finish: (description: string) => void }) {
  const dialog = useRef<WdModalHandle>(null);
  const close = (description = origin) => { dialog.current?.close(); finish(description); };
  return <WdModal ref={dialog} layout={listLayout} instance="descriptive-state-picker-frame" testId="descriptive-state-picker" restoreTestId="descriptive-state-picker-restore" onClose={() => close()}>
      <DescriptiveStateListScreen repository={repository} selecting finish={close} />
  </WdModal>;
}

function DescriptiveStateLauncher({ repository }: { repository: DescriptiveStateRepository }) {
  const { open } = useWorkspace();
  return <button data-testid="descriptive-states-open" onClick={() => open({ layout: listLayout, content: <DescriptiveStateListScreen repository={repository} /> })}>{listLayout.window.title}</button>;
}

export default function DescriptiveStatesWorkflow() {
  const [repository, setRepository] = useState<DescriptiveStateRepository | null>(null), [failed, setFailed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false), [returned, setReturned] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search), directSelector = params.get("selecting") === "1";
  useEffect(() => { let active = true; void isolatedDescriptiveStateRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && (directSelector ? <button data-testid="descriptive-states-select-open" onClick={() => setPickerOpen(true)}>{listLayout.window.title}</button> : <DescriptiveStateLauncher repository={repository} />)}
      {repository && pickerOpen && <DescriptiveStatePicker repository={repository} origin={params.get("origin") ?? ""} finish={value => { setReturned(value); setPickerOpen(false); }} />}
    </WdWorkspace>
    {returned !== null && <output data-testid="descriptive-states-returned">{returned}</output>}
  </main></DialogProvider>;
}
