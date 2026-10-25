import { useListReportPreview } from "./report-callers";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { mechanicCode, mechanicRequiredMessage, type MechanicListRow, type MechanicRecord, type MechanicList, type MechanicValues } from "../../packages/domain/src/mechanics";
import type { MechanicRepository } from "../application/mechanics";
import { isolatedMechanicRepository } from "../infrastructure/mechanics";
import listLayout from "./legacy/WIN_Table_mecanicos.layout.json";
import formLayout from "./legacy/WIN_Form_mecanicos.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton, WdCheckbox, WdCheckMark, WdEdit } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

// Scoped JPG-backed captions follow ADR-003/U01; column widths come from the generated dossier metadata.
const captions: Record<string, string> = { EDT_Descricao: "Descrição", CBOX_Inativo: "Inativo" };
const displayedFormLayout = { ...formLayout, controls: formLayout.controls.map(control => captions[control.name] ? { ...control, caption: captions[control.name] } : control) };
const tableSource = controlOf(listLayout, "TABLE_mecanicos");
const displayedTable = { ...tableSource, columns: tableSource.columns?.map(column => column.name === "COL_Descricao" ? { ...column, title: "Descrição" } : column) };
const formTitle = controlOf(formLayout, "RADTitle").caption!;
const columnKeys: Record<string, NonNullable<MechanicList["sort"]>> = { COL_Codigo: "Codigo", COL_Descricao: "Descricao", COL_inativo: "inativo" };
const searchValue = (row: MechanicListRow, key: NonNullable<MechanicList["sort"]>) => key === "inativo" ? row.inativo === null ? "" : row.inativo ? "1" : "0" : String(row[key] ?? "");
export type MechanicSelection = number | string;

function MechanicForm({ repository, mechanic, descriptions, finish }: { repository: MechanicRepository; mechanic: MechanicRecord | null; descriptions: readonly string[]; finish: (saved: boolean) => void }) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [inactive, setInactive] = useState<boolean | null>(() => mechanic ? mechanic.inativo : false);
  const { message } = useDialogs();
  const { register, getValues, setValue, formState: { dirtyFields } } = useForm<{ Codigo: string; Descricao: string; palavra_passe: string }>({
    defaultValues: { Codigo: mechanic ? String(mechanic.Codigo ?? "") : "0", Descricao: mechanic?.Descricao ?? "", palavra_passe: mechanic?.palavra_passe ?? "" },
  });
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues(), code = mechanic && !dirtyFields.Codigo ? mechanic.Codigo : mechanicCode(text.Codigo);
      if (code === undefined) { setDiagnostic("invalid_code"); return; }
      const values: MechanicValues = { Codigo: code, Descricao: mechanic && !dirtyFields.Descricao ? mechanic.Descricao : text.Descricao, palavra_passe: mechanic && !dirtyFields.palavra_passe ? mechanic.palavra_passe : text.palavra_passe, inativo: inactive };
      const required = mechanicRequiredMessage(values);
      if (required) { await message({ title: formTitle, text: required, type: 0 }); return; }
      const result = await repository.save(mechanic ? { mode: "update", id: mechanic.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formTitle, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-C17FCA03-03: developer diagnostic only, never credential values or invented failure text.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  return <WdModal ref={dialog} layout={displayedFormLayout} instance="mechanic-form-frame" testId="WIN_Form_mecanicos" restoreTestId="mechanic-form-restore"
    onClose={() => close()} onKeyDown={event => {
      if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); }
    }}>
    <div data-testid="SC_Form" style={{ display: "contents" }}>
      <WdEdit control={controlOf(formLayout, "EDT_Codigo")} {...register("Codigo")} integerMask readOnly={mechanic !== null} disabled={busy} />
      <WdEdit control={controlOf(displayedFormLayout, "EDT_Descricao")} {...register("Descricao")} disabled={busy} suggestions={descriptions} onSuggestion={value => setValue("Descricao", value, { shouldDirty: true })} />
      <WdEdit control={controlOf(formLayout, "EDT_Palavra_passe")} {...register("palavra_passe")} passwordReveal disabled={busy} />
      <WdCheckbox control={controlOf(displayedFormLayout, "CBOX_Inativo")} checked={inactive} onChange={setInactive} disabled={busy} />
    </div>
    <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
    <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {diagnostic && <output data-testid="mechanic-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function MechanicListScreen({ repository, selecting = false, finish }: { repository: MechanicRepository; selecting?: boolean; finish?: (code?: number) => void }) {
  const report = useListReportPreview("RPT_List_mecanicos");
  const close = useWorkspaceClose(finish ? () => finish() : undefined), { resource } = useDialogs();
  const [query, setQuery] = useState<MechanicList>({ sort: "inativo", descending: false }), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<MechanicListRow[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ query: MechanicList; refresh: number } | null>(null);
  const [form, setForm] = useState<{ mechanic: MechanicRecord | null } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), [busy, setBusy] = useState(false), readOwner = useRef(0);
  const columnSearch = useRef<{ key: NonNullable<MechanicList["sort"]>; term: string } | null>(null);
  const settings = useTableLayout(displayedTable, "WIN_Table_mecanicos/TABLE_mecanicos");
  useEffect(() => () => { readOwner.current++; }, []);
  useEffect(() => {
    let active = true;
    void repository.list(query).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.mechanics); setLoaded({ query, refresh }); setDiagnostic("");
      // UNRESOLVED U-C44F7892-02: preserve explicit selection, with no guessed fallback or NULL/tie order claim.
      const sought = columnSearch.current;
      const match = sought && result.mechanics.find(row => searchValue(row, sought.key).toLocaleLowerCase("pt-PT").startsWith(sought.term.toLocaleLowerCase("pt-PT")));
      columnSearch.current = null;
      setSelection(previous => match ? match.id : result.mechanics.some(row => row.id === previous) ? previous : null);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, query, refresh]);
  const ready = loaded?.query === query && loaded?.refresh === refresh;
  const focused = useRef(false), screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selecting && ready && !focused.current) { screen.current?.querySelector<HTMLButtonElement>('[data-testid="BTN_selecionar"]')?.focus(); focused.current = true; }
  }, [selecting, ready]);
  const current = rows.find(row => row.id === selection);
  const sourceRefresh = () => { columnSearch.current = null; setQuery({ sort: "inativo", descending: false }); setRefresh(value => value + 1); };
  const remove = async () => {
    if (!ready || !current || pending.current || selecting) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const answer = await resource({ title: listLayout.window.title, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (answer.result !== 1) return;
      const result = await repository.remove(current.id);
      if (result.kind === "deleted") sourceRefresh(); else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const modify = async (id: string) => {
    if (!ready || pending.current || selecting) return;
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++readOwner.current;
    try {
      // Source253–261 has no preliminary full-list refresh. Only selected authenticated FileToScreen is read.
      const result = await repository.read({ id });
      if (owner !== readOwner.current) return;
      if (result.kind === "loaded") setForm({ mechanic: result.mechanic }); else setDiagnostic(result.kind);
    } catch { if (owner === readOwner.current) setDiagnostic("transport"); }
    finally { if (owner === readOwner.current) { pending.current = false; setBusy(false); } }
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    columnSearch.current = null;
    const key = columnKeys[column.name];
    if (key) setQuery(previous => ({ sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  const choose = (row: MechanicListRow) => { if (row.Codigo !== null) finish?.(row.Codigo); };
  const move = (direction: -1 | 1) => {
    if (!ready || pending.current) return;
    const index = rows.findIndex(row => row.id === selection);
    const currentIndex = index < 0 ? -1 : index + 1;
    const requested = direction === 1 ? currentIndex < rows.length ? currentIndex + 1 : null : currentIndex > 1 ? currentIndex - 1 : null;
    if (requested === null) return;
    // UNRESOLVED U-C44F7892-02: source next requests0 from no selection; unrepresentable native effects stay unpinned.
    if (requested >= 1 && requested <= rows.length) setSelection(rows[requested - 1].id);
  };
  return <div ref={screen} data-testid="WIN_Table_mecanicos" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !pending.current && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={displayedTable} rows={rows} rowHeight={selecting ? 30 : undefined} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && !pending.current && row) { if (selecting) choose(row); else void modify(row.id); } }}
      onColumnSearch={(column, term) => {
        if (pending.current) return;
        const key = columnKeys[column.name]; if (!key) return;
        columnSearch.current = term ? { key, term } : null;
        if (term) setQuery({ sort: key, descending: false });
      }}
      cell={(row, column) => column.name === "COL_Codigo" ? String(row.Codigo ?? "") : column.name === "COL_Descricao" ? row.Descricao ?? "" : column.name === "COL_inativo" ? <span role="checkbox" aria-label="Inativo" aria-readonly="true" aria-checked={row.inativo === true}><WdCheckMark checked={row.inativo} /></span> : ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} hidden={selecting} disabled={!ready || busy} onClick={() => setForm({ mechanic: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} hidden={selecting} disabled={!ready || busy} onClick={() => { if (current) void modify(current.id); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} hidden={selecting} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} hidden={selecting} disabled={report.busy} onClick={report.preview} />
    {report.element}
    <WdButton control={{ ...controlOf(listLayout, "BTN_Fechar"), ...(selecting ? { y: 506, height: 38 } : {}) }} disabled={busy} onClick={close} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_selecionar"), visible: selecting }} disabled={!ready || busy} onClick={() => { if (current) choose(current); }} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_anterior"), visible: selecting }} disabled={!ready || busy} onClick={() => move(-1)} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_seguinte"), visible: selecting }} disabled={!ready || busy} onClick={() => move(1)} />
    {form && <MechanicForm repository={repository} mechanic={form.mechanic} descriptions={rows.flatMap(row => row.Descricao === null ? [] : [row.Descricao])} finish={saved => { const editing = form.mechanic !== null; setForm(null); if (saved || editing) sourceRefresh(); }} />}
    {diagnostic && <output data-testid="mechanic-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

export function MechanicPicker({ repository, origin, finish }: { repository: MechanicRepository; origin: MechanicSelection; finish: (code: MechanicSelection) => void }) {
  const dialog = useRef<WdModalHandle>(null);
  const close = (code: MechanicSelection = origin) => { dialog.current?.close(); finish(code); };
  return <WdModal ref={dialog} layout={listLayout} instance="mechanic-picker-frame" testId="mechanic-picker" restoreTestId="mechanic-picker-restore" onClose={() => close()}>
    <MechanicListScreen repository={repository} selecting finish={close} />
  </WdModal>;
}
function MechanicLauncher({ repository }: { repository: MechanicRepository }) {
  const { open } = useWorkspace();
  return <button data-testid="mechanics-open" onClick={() => open({ layout: listLayout, content: <MechanicListScreen repository={repository} /> })}>{listLayout.window.title}</button>;
}
export default function MechanicsWorkflow() {
  const [repository, setRepository] = useState<MechanicRepository | null>(null), [failed, setFailed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false), [returned, setReturned] = useState<MechanicSelection | null>(null);
  const params = new URLSearchParams(window.location.search), directSelector = params.get("selecting") === "1";
  useEffect(() => { let active = true; void isolatedMechanicRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && (directSelector ? <button data-testid="mechanics-select-open" onClick={() => setPickerOpen(true)}>{listLayout.window.title}</button> : <MechanicLauncher repository={repository} />)}
      {repository && pickerOpen && <MechanicPicker repository={repository} origin={params.get("origin") ?? ""} finish={code => { setReturned(code); setPickerOpen(false); }} />}
    </WdWorkspace>
    {returned !== null && <><output data-testid="mechanics-returned">{returned}</output><output data-testid="mechanics-returned-kind">{typeof returned}</output></>}
  </main></DialogProvider>;
}
