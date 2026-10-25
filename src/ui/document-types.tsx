import { useListReportPreview } from "./report-callers";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { documentTypeRequiredMessage, documentTypeStockLabel, type DocumentType, type DocumentTypeList, type DocumentTypeValues } from "../../packages/domain/src/document-types";
import type { DocumentTypeRepository } from "../application/document-types";
import { selectAfterTableRead } from "../application/table-selection";
import { isolatedDocumentTypeRepository } from "../infrastructure/document-types";
import listLayout from "./legacy/WIN_Table_documentos.layout.json";
import sourceFormLayout from "./legacy/WIN_Form_documentos.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton, WdCheckMark } from "./legacy/wd";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

// JPG-backed captions/options (ADR-003/U01); generated geometry and flags stay authoritative.
const formCaptions: Record<string, string> = { EDT_Descricao: "Descrição", CBOX_Obriga_macanico: "Obriga a identificar mecânico" };
const formLayout = { ...sourceFormLayout, controls: sourceFormLayout.controls.map(control => formCaptions[control.name] ? { ...control, caption: formCaptions[control.name] } : control) };
const tableSource = controlOf(listLayout, "TABLE_documentos");
const table = { ...tableSource, columns: tableSource.columns?.map(column => column.name === "COL_Descricao" ? { ...column, title: "Descrição" } : column) };
const formTitle = formLayout.window.title, listTitle = listLayout.window.title;
const columnKeys: Record<string, NonNullable<DocumentTypeList["sort"]>> = { COL_Codigo: "Codigo", COL_Descricao: "Descricao", COL_Stock: "stock", COL_Obriga_macanico: "obriga_macanico" };
const radioOptions = [{ value: 1, label: "Entrada" }, { value: 2, label: "Saída" }];
const searchValue = (row: DocumentType, key: NonNullable<DocumentTypeList["sort"]>) => key === "stock" ? documentTypeStockLabel(row.stock) : key === "obriga_macanico" ? row.obriga_macanico === null ? "" : row.obriga_macanico ? "1" : "0" : String(row[key] ?? "");

function DocumentTypeForm({ repository, documentType, descriptions, finish }: {
  repository: DocumentTypeRepository; documentType: DocumentType | null; descriptions: readonly string[]; finish: (saved: boolean) => void;
}) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false), descriptionEdited = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [stock, setStock] = useState<number | null>(() => documentType ? documentType.stock : 1);
  const [mechanic, setMechanic] = useState<boolean | null>(() => documentType ? documentType.obriga_macanico : false);
  const { register, getValues, setValue } = useForm<{ Codigo: string; Descricao: string }>({ defaultValues: { Codigo: documentType?.Codigo ?? "", Descricao: documentType?.Descricao ?? "" } });
  const { message } = useDialogs();
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues();
      const values: DocumentTypeValues = { Codigo: text.Codigo, Descricao: documentType && !descriptionEdited.current ? documentType.Descricao : text.Descricao, stock, obriga_macanico: mechanic };
      const required = documentTypeRequiredMessage(values);
      if (required) { await message({ title: formTitle, text: required, type: 0 }); return; }
      const result = await repository.save(documentType ? { mode: "update", id: documentType.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formTitle, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-C5CA4D83-03: developer-only diagnostic; no invented legacy error text.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  // Source SC_Form Tab3 checkbox precedes Tab4 radio, despite its lower visual position.
  const descriptionInput = register("Descricao");
  const bindings: WdRadBinding[] = [
    { name: "EDT_Codigo", kind: "edit", props: { ...register("Codigo"), readOnly: documentType !== null, disabled: busy } },
    // ADR-002: retain untouched NULL, but never undo an accepted text→blank edit or suggestion.
    { name: "EDT_Descricao", kind: "edit", props: { ...descriptionInput, onChange: event => { descriptionEdited.current = true; void descriptionInput.onChange(event); }, disabled: busy, suggestions: descriptions, onSuggestion: value => { descriptionEdited.current = true; setValue("Descricao", value, { shouldDirty: true }); } } },
    { name: "CBOX_Obriga_macanico", kind: "checkbox", props: { checked: mechanic, onChange: setMechanic, disabled: busy } },
    { name: "STC_Stock", kind: "caption" },
    { name: "RADIO_NoName1", kind: "radio", props: { label: "Stock", options: radioOptions, value: stock, onChange: setStock, disabled: busy } },
  ];
  return <WdModal ref={dialog} layout={formLayout} instance="document-type-form-frame" testId="WIN_Form_documentos" restoreTestId="document-type-form-restore"
    onClose={() => close()} onKeyDown={event => { if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); } }}>
    <div data-testid="SC_Form" style={{ display: "contents" }}><WdRadControls layout={formLayout} bindings={bindings} /></div>
    <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
    <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {diagnostic && <output data-testid="document-type-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function DocumentTypeListScreen({ repository, selecting = false, finish }: {
  repository: DocumentTypeRepository; selecting?: boolean; finish?: (code?: string) => void;
}) {
  const report = useListReportPreview("RPT_List_documentos");
  const close = useWorkspaceClose(finish ? () => finish() : undefined), { resource, message } = useDialogs();
  const [query, setQuery] = useState<DocumentTypeList>({}), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<DocumentType[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ query: DocumentTypeList; refresh: number } | null>(null);
  const [form, setForm] = useState<{ documentType: DocumentType | null } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), [busy, setBusy] = useState(false), readOwner = useRef(0);
  const columnSearch = useRef<{ key: NonNullable<DocumentTypeList["sort"]>; term: string } | null>(null);
  const settings = useTableLayout(table, "WIN_Table_documentos/TABLE_documentos");
  useEffect(() => () => { readOwner.current++; }, []);
  useEffect(() => {
    let active = true;
    void repository.list(query).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.documentTypes); setLoaded({ query, refresh }); setDiagnostic("");
      const sought = columnSearch.current;
      columnSearch.current = null;
      // UNRESOLVED U-CFEE768B-02: preserve explicit selection without inventing initial/delete fallback.
      setSelection(previous => selectAfterTableRead(result.documentTypes, previous, sought ? { term: sought.term, value: row => searchValue(row, sought.key) } : undefined));
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
    if (!ready || !current || pending.current || selecting) return;
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
  const modify = (row: DocumentType) => {
    if (!ready || pending.current || selecting) return;
    // WIN_Table_documentos274–281 opens the current row without a preliminary read.
    setForm({ documentType: row });
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    columnSearch.current = null; const key = columnKeys[column.name];
    if (key) setQuery(previous => ({ sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  const choose = (row: DocumentType) => { if (row.Codigo !== null) finish?.(row.Codigo); };
  const move = (direction: -1 | 1) => {
    if (!ready || pending.current) return;
    const index = rows.findIndex(row => row.id === selection), currentIndex = index < 0 ? -1 : index + 1;
    const requested = direction === 1 ? currentIndex < rows.length ? currentIndex + 1 : null : currentIndex > 1 ? currentIndex - 1 : null;
    if (requested === null) return;
    // UNRESOLVED U-CFEE768B-02: literal source next may request0; native invalid-index effects remain open.
    if (requested >= 1 && requested <= rows.length) setSelection(rows[requested - 1].id);
  };
  return <div ref={screen} data-testid="WIN_Table_documentos" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !pending.current && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={table} rows={rows} rowHeight={selecting ? 30 : undefined} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && !pending.current && row) { if (selecting) choose(row); else modify(row); } }}
      onColumnSearch={(column, term) => { if (pending.current) return; const key = columnKeys[column.name]; if (!key) return; columnSearch.current = term ? { key, term } : null; if (term) setQuery({ sort: key, descending: false }); }}
      cell={(row, column) => column.name === "COL_Codigo" ? row.Codigo ?? "" : column.name === "COL_Descricao" ? row.Descricao ?? "" : column.name === "COL_Stock" ? documentTypeStockLabel(row.stock) : column.name === "COL_Obriga_macanico" ? <span role="checkbox" aria-label="Obriga mecânico" aria-readonly="true" aria-checked={row.obriga_macanico === true}><WdCheckMark checked={row.obriga_macanico} /></span> : ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} hidden={selecting} disabled={!ready || busy} onClick={() => setForm({ documentType: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} hidden={selecting} disabled={!ready || busy} onClick={() => { if (current) modify(current); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} hidden={selecting} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} hidden={selecting} disabled={report.busy} onClick={report.preview} />
    {report.element}
    <WdButton control={{ ...controlOf(listLayout, "BTN_Fechar"), ...(selecting ? { y: 503, height: 38 } : {}) }} disabled={busy} onClick={close} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_selecionar"), visible: selecting }} disabled={!ready || busy} onClick={() => { if (current) choose(current); }} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_seguinte"), visible: selecting }} disabled={!ready || busy} onClick={() => move(1)} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_anterior"), visible: selecting }} disabled={!ready || busy} onClick={() => move(-1)} />
    {form && <DocumentTypeForm repository={repository} documentType={form.documentType} descriptions={rows.flatMap(row => row.Descricao === null ? [] : [row.Descricao])}
      finish={saved => { const editing = form.documentType !== null; setForm(null); if (saved || editing) setRefresh(value => value + 1); }} />}
    {diagnostic && <output data-testid="document-type-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

export function DocumentTypePicker({ repository, origin, finish }: { repository: DocumentTypeRepository; origin: string; finish: (code: string) => void }) {
  const dialog = useRef<WdModalHandle>(null);
  const close = (code: string = origin) => { dialog.current?.close(); finish(code); };
  return <WdModal ref={dialog} layout={listLayout} instance="document-type-picker-frame" testId="document-type-picker" restoreTestId="document-type-picker-restore" onClose={() => close()}>
    <DocumentTypeListScreen repository={repository} selecting finish={close} />
  </WdModal>;
}
function DocumentTypeLauncher({ repository }: { repository: DocumentTypeRepository }) {
  const { open } = useWorkspace();
  return <button data-testid="document-types-open" onClick={() => open({ layout: listLayout, content: <DocumentTypeListScreen repository={repository} /> })}>{listTitle}</button>;
}
export default function DocumentTypesWorkflow() {
  const [repository, setRepository] = useState<DocumentTypeRepository | null>(null), [failed, setFailed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false), [returned, setReturned] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search), directSelector = params.get("selecting") === "1";
  useEffect(() => { let active = true; void isolatedDocumentTypeRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && (directSelector ? <button data-testid="document-types-select-open" onClick={() => setPickerOpen(true)}>{listTitle}</button> : <DocumentTypeLauncher repository={repository} />)}
      {repository && pickerOpen && <DocumentTypePicker repository={repository} origin={params.get("origin") ?? ""} finish={code => { setReturned(code); setPickerOpen(false); }} />}
    </WdWorkspace>
    {returned !== null && <output data-testid="document-types-returned">{returned}</output>}
  </main></DialogProvider>;
}
