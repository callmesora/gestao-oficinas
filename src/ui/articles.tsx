import { useListReportPreview } from "./report-callers";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm, useWatch } from "react-hook-form";
import { articleRequiredMessage, type Article, type ArticleList, type ArticleValues } from "../../packages/domain/src/articles";
import type { Unit } from "../../packages/domain/src/units";
import type { ArticleRepository } from "../application/articles";
import { selectAfterTableRead } from "../application/table-selection";
import { isolatedArticleRepository } from "../infrastructure/articles";
import sourceListLayout from "./legacy/WIN_Table_artigos.layout.json";
import sourceFormLayout from "./legacy/WIN_Form_artigos.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton, WdCheckbox, WdCheckMark, WdEdit } from "./legacy/wd";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { decimalMaskDisplay, decimalMaskOf, decimalMaskValue } from "./legacy/decimal-entry";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

// Only captions evidenced by the JPG differ from the generated source metadata (ADR-003/U01).
const formCaptions: Record<string, string> = { EDT_Descricao: "Descrição", CBOX_Inativo: "Inativo" };
const listCaptions: Record<string, string> = { BTN_descricao: "Pesquisar por descrição", CBOX_ativo: "Ativo", CBOX_inativo: "Inativo" };
const formLayout = { ...sourceFormLayout, controls: sourceFormLayout.controls.map(control => formCaptions[control.name] ? { ...control, caption: formCaptions[control.name] } : control) };
const listLayout = { ...sourceListLayout, controls: sourceListLayout.controls.map(control => listCaptions[control.name] ? { ...control, caption: listCaptions[control.name] } : control) };
const tableSource = controlOf(listLayout, "TABLE_artigos");
const table = { ...tableSource, columns: tableSource.columns?.map(column => column.name === "COL_Descricao" ? { ...column, title: "Descrição" } : column) };
const priceMask = decimalMaskOf(controlOf(formLayout, "EDT_Preco").input_mask)!;
const stockMask = decimalMaskOf(controlOf(formLayout, "EDT_Preco1").input_mask)!;
const columnKeys: Record<string, NonNullable<ArticleList["sort"]>> = { COL_Codigo: "Codigo", COL_Descricao: "Descricao", COL_Codbarras: "codbarras", COL_Unidade: "unidade", COL_Preco: "preco", COL_Inativo: "inativo" };
const modes = ["todos", "codigo", "descricao", "codigobarras"] as const;
const searchValue = (row: Article, key: NonNullable<ArticleList["sort"]>) => key === "inativo" ? row.inativo === null ? "" : row.inativo ? "1" : "0" : String(row[key] ?? "");
type FormText = { Codigo: string; Descricao: string; codbarras: string; unidade: string; preco: string };

function ArticleForm({ repository, article, descriptions, finish }: {
  repository: ArticleRepository; article: Article | null; descriptions: readonly string[]; finish: (saved: boolean) => void;
}) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false), priceEdited = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [units, setUnits] = useState<Unit[]>([]), [inactive, setInactive] = useState<boolean | null>(() => article ? article.inativo : false);
  const { register, control, getValues, setValue, formState: { dirtyFields } } = useForm<FormText>({ defaultValues: {
    Codigo: article?.Codigo ?? "", Descricao: article?.Descricao ?? "", codbarras: article?.codbarras ?? "", unidade: article?.unidade ?? "", preco: decimalMaskDisplay(priceMask, article ? article.preco : "0"),
  } });
  const unit = useWatch({ control, name: "unidade" }), { message } = useDialogs();
  useEffect(() => {
    let active = true;
    void repository.units().then(result => { if (active) { if (result.kind === "loaded") setUnits(result.units); else setDiagnostic(result.kind); } })
      .catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository]);
  const unitCodes = [...new Set(units.flatMap(value => value.Codigo === null || value.Codigo === "" ? [] : [value.Codigo]))];
  const unitOptions = [{ value: "", label: "" }, ...(unit !== "" && !unitCodes.includes(unit) ? [{ value: unit, label: unit }] : []), ...unitCodes.map(value => ({ value, label: value }))];
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues();
      const values: ArticleValues = {
        Codigo: text.Codigo,
        Descricao: article && !dirtyFields.Descricao ? article.Descricao : text.Descricao,
        codbarras: article && !dirtyFields.codbarras ? article.codbarras : text.codbarras,
        unidade: article && !dirtyFields.unidade ? article.unidade : text.unidade,
        // Invalid drafts still reach the server AFTER its source barcode check (ADR-002/011).
        preco: article && !priceEdited.current ? article.preco : decimalMaskValue(priceMask, text.preco) ?? text.preco,
        inativo: inactive,
      };
      const required = articleRequiredMessage(values);
      if (required) { await message({ title: formLayout.window.title, text: required, type: 0 }); return; }
      const result = await repository.save(article ? { mode: "update", id: article.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate" || result.kind === "barcodeDuplicate") await message({ title: formLayout.window.title, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-CAA44622-03: developer diagnostic only; no invented legacy failure message.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const priceInput = register("preco");
  const bindings: WdRadBinding[] = [
    { name: "EDT_Codigo", kind: "edit", props: { ...register("Codigo"), readOnly: article !== null, disabled: busy } },
    { name: "EDT_Descricao", kind: "edit", props: { ...register("Descricao"), disabled: busy, suggestions: descriptions, onSuggestion: value => setValue("Descricao", value, { shouldDirty: true }) } },
    { name: "EDT_Codbaras", kind: "edit", props: { ...register("codbarras"), disabled: busy } },
    { name: "COMBO_Unidade", kind: "combo", props: { options: unitOptions, value: unit, onChange: value => setValue("unidade", value, { shouldDirty: true }), disabled: busy } },
    { name: "EDT_Preco", kind: "edit", props: { ...priceInput, onChange: event => { priceEdited.current = true; void priceInput.onChange(event); }, decimalMask: true, disabled: busy } },
    { name: "CBOX_Inativo", kind: "checkbox", props: { checked: inactive, onChange: setInactive, disabled: busy } },
    { name: "EDT_Preco1", kind: "edit", props: { value: decimalMaskDisplay(stockMask, article ? article.stock : "0"), readOnly: true, disabled: busy } },
  ];
  return <WdModal ref={dialog} layout={formLayout} instance="article-form-frame" testId="WIN_Form_artigos" restoreTestId="article-form-restore" onClose={() => close()}
    onKeyDown={event => { if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); } }}>
    <div data-testid="SC_Form" style={{ display: "contents" }}><WdRadControls layout={formLayout} bindings={bindings} /></div>
    <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
    <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {diagnostic && <output data-testid="article-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function ArticleListScreen({ repository, selecting = false, finish }: { repository: ArticleRepository; selecting?: boolean; finish?: (code?: string) => void }) {
  const report = useListReportPreview("RPT_List_artigos");
  const close = useWorkspaceClose(finish ? () => finish() : undefined), { resource, message } = useDialogs();
  const [mode, setMode] = useState<ArticleList["mode"]>("todos"), [term, setTerm] = useState(""), [active, setActive] = useState(true), [inactive, setInactive] = useState(false);
  const [query, setQuery] = useState<ArticleList>({ mode: "todos", term: "", active: true, inactive: false }), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<Article[]>([]), [selection, setSelection] = useState<string | null>(null), [diagnostic, setDiagnostic] = useState("");
  const [loaded, setLoaded] = useState<{ query: ArticleList; refresh: number } | null>(null), [form, setForm] = useState<{ article: Article | null } | null>(null);
  const [busy, setBusy] = useState(false), pending = useRef(false), readOwner = useRef(0), search = useRef<HTMLInputElement>(null);
  const columnSearch = useRef<{ key: NonNullable<ArticleList["sort"]>; term: string } | null>(null), focused = useRef(false), screen = useRef<HTMLDivElement>(null);
  const settings = useTableLayout(table, "WIN_Table_artigos/TABLE_artigos");
  useEffect(() => () => { readOwner.current++; }, []);
  useEffect(() => {
    let currentRead = true;
    void repository.list(query).then(result => {
      if (!currentRead) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.articles); setLoaded({ query, refresh }); setDiagnostic("");
      const sought = columnSearch.current; columnSearch.current = null;
      // UNRESOLVED U-C7738076-02: no invented initial/empty/delete fallback selection.
      setSelection(previous => selectAfterTableRead(result.articles, previous, sought ? { term: sought.term, value: row => searchValue(row, sought.key) } : undefined));
    }).catch(() => { if (currentRead) setDiagnostic("transport"); });
    return () => { currentRead = false; };
  }, [repository, query, refresh]);
  const ready = loaded?.query === query && loaded?.refresh === refresh, current = rows.find(row => row.id === selection);
  useEffect(() => { if (selecting && ready && !focused.current) { screen.current?.querySelector<HTMLButtonElement>('[data-testid="BTN_selecionar"]')?.focus(); focused.current = true; } }, [selecting, ready]);
  const modify = (row: Article) => { if (ready && !pending.current && !selecting) setForm({ article: row }); };
  const remove = async () => {
    if (!ready || !current || pending.current || selecting) return;
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++readOwner.current;
    try {
      const check = await repository.checkDelete(current.id);
      if (owner !== readOwner.current) return;
      if (check.kind === "associated") { await message({ title: listLayout.window.title, text: check.message, type: 0 }); return; }
      if (check.kind !== "ready") { setDiagnostic(check.kind); return; }
      const answer = await resource({ title: listLayout.window.title, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (owner !== readOwner.current || answer.result !== 1) return;
      const result = await repository.remove(current.id);
      if (owner !== readOwner.current) return;
      if (result.kind === "associated") await message({ title: listLayout.window.title, text: result.message, type: 0 });
      else if (result.kind === "deleted") setRefresh(value => value + 1); else setDiagnostic(result.kind);
    } catch { if (owner === readOwner.current) setDiagnostic("transport"); }
    finally { if (owner === readOwner.current) { pending.current = false; setBusy(false); } }
  };
  const applyChange = (nextTerm: string, nextActive = active, nextInactive = inactive) => {
    columnSearch.current = null; setTerm(nextTerm); setActive(nextActive); setInactive(nextInactive);
    setQuery(previous => ({ ...previous, mode, term: nextTerm, active: nextActive, inactive: nextInactive }));
  };
  const sort = (column: LegacyColumn) => { if (!pending.current) { columnSearch.current = null; const key = columnKeys[column.name]; if (key) setQuery(previous => ({ ...previous, sort: key, descending: previous.sort === key ? !previous.descending : false })); } };
  const choose = (row: Article) => { if (row.Codigo !== null) finish?.(row.Codigo); };
  const move = (direction: -1 | 1) => {
    if (!ready || pending.current) return;
    const index = rows.findIndex(row => row.id === selection), currentIndex = index < 0 ? -1 : index + 1;
    const requested = direction === 1 ? currentIndex < rows.length ? currentIndex + 1 : null : currentIndex > 1 ? currentIndex - 1 : null;
    // UNRESOLVED U-C7738076-02: literal source next may request0; native invalid-index effect remains open.
    if (requested !== null && requested >= 1 && requested <= rows.length) setSelection(rows[requested - 1].id);
  };
  const modeButton = (value: typeof modes[number]) => <WdButton key={value} control={controlOf(listLayout, `BTN_${value}`)} disabled={busy} style={{ fontWeight: mode === value ? "bold" : "normal", textDecoration: mode === value ? "underline" : "none", color: mode === value ? "darkblue" : "black" }} onClick={() => {
    columnSearch.current = null; setMode(value); setTerm("");
    // Source mode clicks deactivate ALL filters without changing the visible checkboxes.
    setQuery(previous => ({ ...previous, mode: value, term: "", active: true, inactive: true })); search.current?.focus();
  }} />;
  return <div ref={screen} data-testid="WIN_Table_artigos" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => { if (event.key === "Escape" && !pending.current && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close(); }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={table} rows={rows} rowHeight={selecting ? 30 : undefined} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && !pending.current && row) { if (selecting) choose(row); else modify(row); } }}
      onColumnSearch={(column, value) => { if (pending.current) return; const key = columnKeys[column.name]; if (!key) return; columnSearch.current = value ? { key, term: value } : null; if (value) setQuery(previous => ({ ...previous, sort: key, descending: false })); }}
      cell={(row, column) => column.name === "COL_Codigo" ? row.Codigo ?? "" : column.name === "COL_Descricao" ? row.Descricao ?? "" : column.name === "COL_Codbarras" ? row.codbarras ?? "" : column.name === "COL_Unidade" ? row.unidade ?? "" : column.name === "COL_Preco" ? decimalMaskDisplay(priceMask, row.preco) : column.name === "COL_Inativo" ? <span role="checkbox" aria-label="Inativo" aria-readonly="true" aria-checked={row.inativo === true}><WdCheckMark checked={row.inativo} /></span> : ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} hidden={selecting} disabled={!ready || busy} onClick={() => setForm({ article: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} hidden={selecting} disabled={!ready || busy} onClick={() => { if (current) modify(current); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} hidden={selecting} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} hidden={selecting} disabled={report.busy} onClick={report.preview} />
    {report.element}
    <WdButton control={{ ...controlOf(listLayout, "BTN_Fechar"), ...(selecting ? { y: 503, height: 38 } : {}) }} disabled={busy} onClick={close} />
    {modeButton("todos")}
    <WdEdit control={controlOf(listLayout, "EDT_termo_pesquisa")} ref={search} disabled={busy} value={term} onChange={event => applyChange(event.currentTarget.value)} />
    {modes.slice(1).map(modeButton)}
    <WdButton control={{ ...controlOf(listLayout, "BTN_selecionar"), visible: selecting }} disabled={!ready || busy} onClick={() => { if (current) choose(current); }} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_anterior"), visible: selecting }} disabled={!ready || busy} onClick={() => move(-1)} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_seguinte"), visible: selecting }} disabled={!ready || busy} onClick={() => move(1)} />
    <WdCheckbox control={controlOf(listLayout, "CBOX_ativo")} checked={active} disabled={busy} onChange={value => applyChange(term, value, value ? inactive : true)} />
    <WdCheckbox control={controlOf(listLayout, "CBOX_inativo")} checked={inactive} disabled={busy} onChange={value => applyChange(term, value ? active : true, value)} />
    {form && <ArticleForm repository={repository} article={form.article} descriptions={rows.flatMap(row => row.Descricao === null ? [] : [row.Descricao])} finish={saved => { const editing = form.article !== null; setForm(null); if (saved || editing) setRefresh(value => value + 1); }} />}
    {diagnostic && <output data-testid="article-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

export function ArticlePicker({ repository, origin, finish }: { repository: ArticleRepository; origin: string; finish: (code: string) => void }) {
  const dialog = useRef<WdModalHandle>(null), close = (code: string = origin) => { dialog.current?.close(); finish(code); };
  return <WdModal ref={dialog} layout={listLayout} instance="article-picker-frame" testId="article-picker" restoreTestId="article-picker-restore" onClose={() => close()}><ArticleListScreen repository={repository} selecting finish={close} /></WdModal>;
}
function ArticleLauncher({ repository }: { repository: ArticleRepository }) {
  const { open } = useWorkspace();
  return <button data-testid="articles-open" onClick={() => open({ layout: listLayout, content: <ArticleListScreen repository={repository} /> })}>{listLayout.window.title}</button>;
}
export default function ArticlesWorkflow() {
  const [repository, setRepository] = useState<ArticleRepository | null>(null), [failed, setFailed] = useState(false), [pickerOpen, setPickerOpen] = useState(false), [returned, setReturned] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search), directSelector = params.get("selecting") === "1";
  useEffect(() => { let active = true; void isolatedArticleRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && (directSelector ? <button data-testid="articles-select-open" onClick={() => setPickerOpen(true)}>{listLayout.window.title}</button> : <ArticleLauncher repository={repository} />)}
      {repository && pickerOpen && <ArticlePicker repository={repository} origin={params.get("origin") ?? ""} finish={code => { setReturned(code); setPickerOpen(false); }} />}
    </WdWorkspace>
    {returned !== null && <output data-testid="articles-returned">{returned}</output>}
  </main></DialogProvider>;
}
