import Decimal from "decimal.js";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { nextStockLine, parseScannerText, type StockLine, type StockListRow, type StockDocumentType, type StockMechanic, type StockReadResult, type StockArticle, type ScannerRow, type ScannerResult, type StockList } from "../../packages/domain/src/stock";
import { dateEntryInitial, dateEntryResult, dateEntryDisplay } from "../../packages/domain/src/date-entry";
import type { StockRepository } from "../application/stock";
import type { ArticleRepository } from "../application/articles";
import type { DocumentTypeRepository } from "../application/document-types";
import type { MechanicRepository } from "../application/mechanics";
import { isolatedStockRepository } from "../infrastructure/stock";
import { isolatedArticleRepository } from "../infrastructure/articles";
import { isolatedDocumentTypeRepository } from "../infrastructure/document-types";
import { isolatedMechanicRepository } from "../infrastructure/mechanics";
import { ArticlePicker, ArticleListScreen } from "./articles";
import { DocumentTypePicker } from "./document-types";
import { MechanicPicker } from "./mechanics";
import listSource from "./legacy/WIN_Table_cab_stocks.layout.json";
import lineSource from "./legacy/WIN_Table_Lin_Stocks.layout.json";
import inventorySource from "./legacy/WIN_Inventario.layout.json";
import rebuildSource from "./legacy/WIN_Reconstrucao_Stocks.layout.json";
import inventoryRebuildSource from "./legacy/WIN_Inventario_Reconstrucao.layout.json";
import scannerLayout from "./legacy/WIN_Leitor_cod_barras.layout.json";
import unknownLayout from "./legacy/WIN_Leitor_cod_barras_desconhecidos.layout.json";
import statementSource from "./legacy/WIN_Extrato_Artigos.layout.json";
import articleLayout from "./legacy/WIN_Table_artigos.layout.json";
import { WdButton } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { controlOf, type LegacyLayout, type LegacyColumn } from "./legacy/layout";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdWorkspace, useWorkspace } from "./legacy/workspace";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { decimalMaskOf, decimalMaskDisplay, decimalMaskValue } from "./legacy/decimal-entry";

// JPG-backed source text, retaining original geometry/assets. Missing kind is local presentation only (U01).
function captions(layout: LegacyLayout, replacements: Record<string, string>, title?: string): LegacyLayout {
  return { ...layout, window: { ...layout.window, ...(title ? { title } : {}) }, controls: layout.controls.map(c => ({ ...c, ...(replacements[c.name] ? { caption: replacements[c.name], ...(c.kind === "control" ? { kind: c.name.startsWith("BTN_") ? "Button" : "Caption" } : {}) } : {}), ...(c.columns ? { columns: c.columns.map(column => replacements[column.name] ? { ...column, title: replacements[column.name] } : column) } : {}) })) };
}
const listLayout = captions(listSource, { STC_Descricao: "Descrição", EDT_Do_n: "Do nº", EDT_Ao_n: "Ao nº", COL_Numero: "Número", COL_descricao: "Descrição" });
const lineLayout = captions(lineSource, { STC_Descricao: "Descrição", STC_Número: "Número", STC_Descrição_do_Artigo: "Descrição do Artigo", COL_Descricao: "Descrição do artigo" });
const inventoryLayout = captions(inventorySource, { RADTitle: "Inventário", COL_Descricao: "Descrição" }, "Inventário");
const rebuildLayout = captions(rebuildSource, { RADTitle: "Reconstrução de Stocks" }, "Reconstrução de Stocks");
const inventoryRebuildLayout = captions(inventoryRebuildSource, { RADTitle: "Reconstrução de Stocks", BTN_Reconstruir1: "Não", STC_reconstrucao_stocks: "É aconselhada a reconstrução dos stocks.\r\nPretende fazê-lo agora?" }, "Reconstrução de Stocks");
const statementLayout = captions(statementSource, { BTN_Visualizar_impressão: "Visualizar impressão" });
const qtyMask = decimalMaskOf(controlOf(lineLayout, "EDT_quant").input_mask)!;
const priceMask = decimalMaskOf(controlOf(lineLayout, "EDT_preco").input_mask)!;
const today = () => { const now = new Date(); return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`; };
type Services = { stock: StockRepository; articles: ArticleRepository; documents: DocumentTypeRepository; mechanics: MechanicRepository };
export type StockReportPreview = (input: { reportId: "RPT_inventario" | "RPT_Extrato_artigos"; from?: string | null; to?: string | null; articleFrom?: string; articleTo?: string }) => void;
const rowIdentity = (row: StockListRow) => `${row.id}:${row.documentId}`;
function staticCaptions(layout: LegacyLayout): WdRadBinding[] { return layout.controls.filter(c => c.kind === "Caption" && c.name !== "RADTitle").map(c => ({ name: c.name, kind: "caption" })); }

function StockTable<T>({ layout, name, rows, id, cell, selection, select, activate, sort, value }: { layout: LegacyLayout; name: string; rows: T[]; id: (row: T) => string; cell: (row: T, column: LegacyColumn) => ReactNode; selection: string | null; select: (id: string) => void; activate?: (id: string) => void; sort?: (column: LegacyColumn) => void; value?: (row: T, column: LegacyColumn) => string | number | null }) {
  const table = controlOf(layout, name), settings = useTableLayout(table, `${layout.window.name}/${name}`);
  const [sorting, setSorting] = useState<{ column: LegacyColumn; descending: boolean } | null>(null);
  const cellValue = (row: T, column: LegacyColumn) => { const displayed = cell(row, column); return value ? value(row, column) : typeof displayed === "string" || typeof displayed === "number" ? displayed : null; };
  const displayedRows = useMemo(() => {
    if (sort || !sorting) return rows;
    const { column, descending } = sorting;
    const raw = (row: T) => { const content = cell(row, column); return value ? value(row, column) : typeof content === "string" || typeof content === "number" ? content : null; };
    return [...rows].sort((a, b) => {
      const x = raw(a), y = raw(b);
      if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
      const numeric = (column as LegacyColumn & { input_type?: string }).input_type === "Numeric" && /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(String(x)) && /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(String(y));
      const compared = numeric ? new Decimal(x).comparedTo(y) : String(x).toLocaleLowerCase("pt-PT").localeCompare(String(y).toLocaleLowerCase("pt-PT"), "pt-PT");
      return compared * (descending ? -1 : 1);
    });
  }, [rows, sorting, sort, cell, value]);
  return <WdTable control={table} rows={displayedRows} rowId={id} cell={cell} selectedId={selection} onSelect={select} onActivate={activate} onSort={sort ?? (column => setSorting(previous => ({ column, descending: previous?.column.name === column.name ? !previous.descending : false })))}
    designerOptions configureColumns {...settings} onResetColumns={settings.resetLayout}
    onColumnSearch={(column, term) => { if (term !== "") { const hit = displayedRows.find(row => String(cellValue(row, column) ?? "").toLocaleLowerCase("pt-PT").startsWith(term.toLocaleLowerCase("pt-PT"))); if (hit) select(id(hit)); } }} />;
}

export function StockDocumentDialog({ services, documents: initialDocuments, mechanics: initialMechanics, loaded, finish }: { services: Services; documents: StockDocumentType[]; mechanics: StockMechanic[]; loaded: Extract<StockReadResult, { kind: "loaded" }> | null; finish: () => void }) {
  const { stock } = services, dialog = useRef<WdModalHandle>(null), pending = useRef(false), active = useRef(true), nextOwner = useRef(0), lookupOwner = useRef(0), lookupTask = useRef<Promise<void> | null>(null);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [documents, setDocuments] = useState(initialDocuments), [mechanics, setMechanics] = useState(initialMechanics);
  const [document, setDocument] = useState(loaded?.header.documento_codigo ?? documents[0]?.Codigo ?? "");
  const [number, setNumber] = useState(loaded?.header.documento_numero ?? "0"), [description, setDescription] = useState<string | null>(loaded ? loaded.header.Descricao : "");
  const [mechanic, setMechanic] = useState<string | null>(loaded ? loaded.header.mecanico : null), [date, setDate] = useState(() => dateEntryInitial(loaded ? loaded.header.data : today()));
  const [lines, setLines] = useState<StockLine[]>(loaded?.lines ?? []), [selection, setSelection] = useState<string | null>(null);
  const [cellDrafts, setCellDrafts] = useState<Record<string, string>>({});
  const [picker, setPicker] = useState<"article" | "document" | "mechanic" | "createArticle" | null>(null);
  const { register, getValues, setValue, reset } = useForm({ defaultValues: { code: "", description: "", quantity: "1,000", price: "0,00" } });
  const { resource, message } = useDialogs();
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    if (loaded) return;
    const owner = ++nextOwner.current;
    void stock.next(document).then(result => { if (!active.current || owner !== nextOwner.current) return; if (result.kind === "loaded") setNumber(result.number); else setDiagnostic(result.kind); }).catch(() => { if (active.current && owner === nextOwner.current) setDiagnostic("transport"); });
  }, [document, stock, loaded]);
  const focus = (name: string) => window.requestAnimationFrame(() => window.document.querySelector<HTMLInputElement>(`[data-testid="WIN_Table_Lin_Stocks"] [data-testid="${name}"]`)?.focus());
  useEffect(() => { focus("EDT_codigo"); }, []);
  const close = () => { if (!pending.current) { dialog.current?.close(); finish(); } };
  const confirmCancel = async () => { if (pending.current) return; const result = await resource({ text: "Confirma o cancelamento das alterações?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], title: lineLayout.window.title ?? "", defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 }); if (active.current && result.result === 1) close(); };
  const lookup = async (code: string, barcode = true, focusQuantity = true) => {
    if (code === "") return;
    const owner = ++lookupOwner.current;
    try {
      const result = await stock.lookup(code, barcode);
      if (!active.current || owner !== lookupOwner.current) return;
      if (result.kind === "found") { setValue("code", result.article.Codigo ?? ""); setValue("description", result.article.Descricao ?? ""); setValue("price", decimalMaskDisplay(priceMask, result.article.preco)); if (focusQuantity) focus("EDT_quant"); }
      else if (result.kind === "missing") { await message({ title: lineLayout.window.title ?? "", text: "Artigo não existente", type: 0 }); if (!active.current || owner !== lookupOwner.current) return; setValue("code", ""); setValue("description", ""); setValue("price", "0,00"); focus("EDT_codigo"); }
      else setDiagnostic(result.kind);
    } catch { if (active.current && owner === lookupOwner.current) setDiagnostic("transport"); }
  };
  const add = () => {
    if (!active.current) return;
    const draft = getValues(); if (draft.code === "" || busy) return;
    lookupOwner.current++;
    setLines(current => [...current, { linha: nextStockLine(current), artigo: draft.code, descricao_artigo: draft.description, quantidade: decimalMaskValue(qtyMask, draft.quantity) ?? draft.quantity, preco: decimalMaskValue(priceMask, draft.price) ?? draft.price }]);
    reset({ code: "", description: "", quantity: "1,000", price: "0,00" }); focus("EDT_codigo");
  };
  const remove = async () => {
    if (selection === null || busy) return;
    const result = await resource({ text: "Confirma a eliminação da linha?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], title: lineLayout.window.title ?? "", defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
    if (active.current && result.result === 1) { setLines(current => current.filter((_, index) => String(index) !== selection)); setCellDrafts({}); setSelection(null); }
  };
  const save = async () => {
    if (pending.current) return;
    const dateResult = dateEntryResult(date); if (dateResult.kind !== "valid") { focus("EDT_Data"); return; }
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const edited = lines.map((row, index) => ({ ...row,
        quantidade: `${index}:quantidade` in cellDrafts ? decimalMaskValue(qtyMask, cellDrafts[`${index}:quantidade`]) ?? cellDrafts[`${index}:quantidade`] : row.quantidade,
        preco: `${index}:preco` in cellDrafts ? decimalMaskValue(priceMask, cellDrafts[`${index}:preco`]) ?? cellDrafts[`${index}:preco`] : row.preco }));
      const result = await stock.save({ mode: loaded ? "update" : "create", ...(loaded ? { id: loaded.header.id, baseline: loaded.baseline } : {}), document, number, description, date: dateResult.value, mechanic, lines: edited });
      if (!active.current) return;
      if (result.kind === "saved") { pending.current = false; close(); }
      else if (result.kind === "empty") await message({ title: lineLayout.window.title ?? "", text: result.message, type: 0 });
      else setDiagnostic(result.kind);
    } catch { if (active.current) setDiagnostic("transport"); } finally { pending.current = false; if (active.current) setBusy(false); }
  };
  const refreshPicker = async (kind: "document" | "mechanic", code: string) => {
    setPicker(null);
    try {
      if (kind === "document") {
        const result = await services.documents.list({}); if (!active.current) return;
        if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
        setDocuments(result.documentTypes); setDocument(code);
      } else {
        const result = await services.mechanics.list({}); if (!active.current) return;
        if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
        setMechanics(result.mechanics.map(row => ({ Codigo: row.Codigo === null ? null : String(row.Codigo), Descricao: row.Descricao }))); setMechanic(code);
      }
    } catch { if (active.current) setDiagnostic("transport"); }
  };
  const visibleMechanic = documents.find(d => d.Codigo === document)?.obriga_macanico !== false;
  const liveLayout = { ...lineLayout, controls: lineLayout.controls.map(c => ["COMBO_mecanico", "BTN_VISION2", "STC_Mecanico"].includes(c.name) ? { ...c, visible: visibleMechanic, flags: { ...c.flags, Visible: visibleMechanic } } : c) };
  const codeInput = register("code");
  const bindings: WdRadBinding[] = [...staticCaptions(liveLayout),
    { name: "COMBO_tipo_doc", kind: "combo", props: { options: documents.map(d => ({ value: d.Codigo ?? "", label: d.Descricao ?? "" })), value: document, onChange: setDocument, disabled: busy || !!loaded, allowNoSelection: true } },
    { name: "EDT_Numero", kind: "edit", props: { value: number, readOnly: true } },
    { name: "EDT_Data", kind: "date", props: { draft: date, onChange: setDate, disabled: busy || !!loaded, invalid: dateEntryResult(date).kind === "invalid" } },
    { name: "EDT_descricao", kind: "edit", props: { value: description ?? "", onChange: e => setDescription(e.currentTarget.value), disabled: busy } },
    { name: "COMBO_mecanico", kind: "combo", props: { options: mechanics.map(m => ({ value: m.Codigo ?? "", label: m.Descricao ?? "" })), value: mechanic ?? "", onChange: setMechanic, disabled: busy, allowNoSelection: true } },
    { name: "EDT_codigo", kind: "edit", props: { ...codeInput, onChange: e => { lookupOwner.current++; void codeInput.onChange(e); }, onBlur: e => { void codeInput.onBlur(e); lookupTask.current = lookup(e.currentTarget.value); }, disabled: busy } },
    { name: "EDT_descricao_Artigo", kind: "edit", props: { ...register("description"), disabled: busy } },
    { name: "EDT_quant", kind: "edit", props: { ...register("quantity"), decimalMask: true, disabled: busy, onBlur: () => focus("EDT_preco") } },
    { name: "EDT_preco", kind: "edit", props: { ...register("price"), decimalMask: true, disabled: busy } },
    { name: "BTN_VISION", kind: "button", props: { disabled: busy || !!loaded, onClick: () => setPicker("document") } },
    { name: "BTN_VISION2", kind: "button", props: { disabled: busy, onClick: () => setPicker("mechanic") } },
    { name: "BTN_NoName1", kind: "button", props: { disabled: busy, onClick: () => setPicker("article") } },
    { name: "BTN_Artigos", kind: "button", props: { disabled: busy, onClick: () => setPicker("createArticle") } },
    { name: "BTN_Adicionar", kind: "button", props: { disabled: busy, onClick: () => { void (async () => { await lookupTask.current; add(); })(); } } },
    { name: "BTN_Adicionar1", kind: "button", props: { disabled: busy, onClick: () => void remove() } },
    { name: "BTN_Confirmar", kind: "button", props: { disabled: busy, onClick: () => void save() } },
    { name: "BTN_Cancelar", kind: "button", props: { disabled: busy, onClick: () => void confirmCancel() } },
  ];
  return <WdModal ref={dialog} layout={liveLayout} instance="stock-document" testId="WIN_Table_Lin_Stocks" restoreTestId="stock-document-restore" onClose={() => void confirmCancel()}>
    <WdRadControls layout={liveLayout} bindings={bindings} />
    <StockTable layout={liveLayout} name="TABLE_lin_Stocks" rows={lines.map((row, index) => ({ ...row, index }))} id={row => String(row.index)} selection={selection} select={setSelection}
      value={(row, column) => {
        if (column.name === "COL_Quant") return `${row.index}:quantidade` in cellDrafts ? decimalMaskValue(qtyMask, cellDrafts[`${row.index}:quantidade`]) ?? cellDrafts[`${row.index}:quantidade`] : row.quantidade;
        if (column.name === "COL_Preco") return `${row.index}:preco` in cellDrafts ? decimalMaskValue(priceMask, cellDrafts[`${row.index}:preco`]) ?? cellDrafts[`${row.index}:preco`] : row.preco;
        return column.name === "COL_Codigo" ? row.artigo : column.name === "COL_Descricao" ? row.descricao_artigo : row.linha;
      }}
      cell={(row, column) => {
        const field = column.name === "COL_Quant" ? "quantidade" : column.name === "COL_Preco" ? "preco" : null;
        if (!field) return column.name === "COL_Codigo" ? row.artigo : column.name === "COL_Descricao" ? row.descricao_artigo : row.linha;
        const key = `${row.index}:${field}`, mask = field === "quantidade" ? qtyMask : priceMask;
        return <input className="wd-edit" style={{ position: "static", width: "100%", textAlign: "right", border: 0, background: "transparent" }} aria-label={column.title ?? column.name} data-testid={`${column.name}-${row.index}`} value={cellDrafts[key] ?? decimalMaskDisplay(mask, row[field])} disabled={busy} onChange={e => { const value = e.currentTarget.value; setCellDrafts(old => ({ ...old, [key]: value })); }} />;
      }} />
    {picker === "article" && <ArticlePicker launchMode={new URLSearchParams(window.location.search).get("modulo") ?? undefined} repository={services.articles} origin={getValues("code")} finish={code => { setPicker(null); setValue("code", code); void lookup(code, false, false); focus("EDT_codigo"); }} />}
    {picker === "document" && <DocumentTypePicker repository={services.documents} origin={document} finish={code => void refreshPicker("document", code)} />}
    {picker === "mechanic" && <MechanicPicker repository={services.mechanics} origin={mechanic === null ? 0 : Number(mechanic)} finish={code => void refreshPicker("mechanic", String(code))} />}
    {picker === "createArticle" && <StockArticleWindow repository={services.articles} finish={() => setPicker(null)} />}
    {diagnostic && <output data-testid="stock-document-diagnostic">{diagnostic}</output>}
  </WdModal>;
}
function StockArticleWindow({ repository, finish }: { repository: ArticleRepository; finish: () => void }) {
  const ref = useRef<WdModalHandle>(null); const close = () => { ref.current?.close(); finish(); };
  return <WdModal ref={ref} layout={articleLayout} instance="stock-articles" testId="stock-articles" restoreTestId="stock-articles-restore" onClose={close}><ArticleListScreen repository={repository} finish={close} /></WdModal>;
}

export function StockListScreen({ services }: { services: Services }) {
  const { message } = useDialogs();
  const [query, setQuery] = useState<StockList>({ from: "1", to: "9999999999" }), [refresh, setRefresh] = useState(0);
  const [loadedQuery, setLoadedQuery] = useState<StockList | null>(null), [data, setData] = useState<{ rows: StockListRow[]; documents: StockDocumentType[]; mechanics: StockMechanic[] }>({ rows: [], documents: [], mechanics: [] });
  const [selection, setSelection] = useState<string | null>(null), [diagnostic, setDiagnostic] = useState(""), [busy, setBusy] = useState(false);
  const [dates, setDates] = useState(() => [dateEntryInitial(today()), dateEntryInitial(today())]);
  const [editor, setEditor] = useState<{ loaded: Extract<StockReadResult, { kind: "loaded" }> | null } | null>(null), [picker, setPicker] = useState(false);
  const owner = useRef(0), active = useRef(true), pending = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    const request = ++owner.current;
    void services.stock.list(query).then(result => { if (!active.current || request !== owner.current) return; if (result.kind === "loaded") { setData(result); setLoadedQuery(query); setSelection(old => result.rows.some(row => rowIdentity(row) === old) ? old : null); setDiagnostic(""); } else setDiagnostic(result.kind); }).catch(() => { if (active.current && request === owner.current) setDiagnostic("transport"); });
  }, [services, query, refresh]);
  const ready = loadedQuery === query;
  const current = data.rows.find(row => rowIdentity(row) === selection);
  const edit = async (id = current?.id) => { if (!id || !ready || pending.current) return; pending.current = true; setBusy(true); try { const result = await services.stock.read(id); if (active.current) { if (result.kind === "loaded") setEditor({ loaded: result }); else setDiagnostic(result.kind); } } catch { if (active.current) setDiagnostic("transport"); } finally { pending.current = false; if (active.current) setBusy(false); } };
  const remove = async () => {
    if (!current || !ready || pending.current) return;
    pending.current = true; setBusy(true);
    try { if (await message({ title: listLayout.window.title ?? "", text: "Eliminar Documento?", type: 2, destructive: true }) === 6 && active.current) { const result = await services.stock.remove(current.id); if (active.current) { if (result.kind === "deleted") setRefresh(v => v + 1); else setDiagnostic(result.kind); } } }
    catch { if (active.current) setDiagnostic("transport"); } finally { pending.current = false; if (active.current) setBusy(false); }
  };
  const bindings: WdRadBinding[] = [...staticCaptions(listLayout),
    { name: "COMBO_tipo_doc", kind: "combo", props: { options: data.documents.map(d => ({ value: d.Codigo ?? "", label: d.Descricao ?? "" })), value: query.document ?? "", allowNoSelection: true, onChange: document => setQuery(q => ({ ...q, document })) } },
    ...(["EDT_Do_n", "EDT_Ao_n"] as const).map((name, index): WdRadBinding => ({ name, kind: "edit", props: { value: (index ? query.to : query.from) ?? "", integerMask: true, onChange: e => { const value = e.currentTarget.value; setQuery(q => ({ ...q, [index ? "to" : "from"]: value === "" || /^0+$/.test(value) ? index ? "9999999999" : "1" : value })); } } })),
    ...(["EDT_Da_data", "EDT_a_data"] as const).map((name, index): WdRadBinding => ({ name, kind: "date", props: { draft: dates[index], onChange: draft => { setDates(old => old.map((d, i) => i === index ? draft : d)); setRefresh(v => v + 1); } } })),
    { name: "EDT_descricao", kind: "edit", props: { value: query.description ?? "", onChange: e => { const description = e.currentTarget.value; setQuery(q => ({ ...q, description })); } } },
    { name: "BTN_VISION", kind: "button", props: { onClick: () => setPicker(true) } },
    { name: "BTN_novo", kind: "button", props: { disabled: busy || !ready, onClick: () => { if (ready) setEditor({ loaded: null }); } } },
    { name: "BTN_alterar", kind: "button", props: { disabled: busy || !ready, onClick: () => void edit() } },
    { name: "BTN_Eliminar", kind: "button", props: { disabled: busy || !ready, onClick: () => void remove() } },
  ];
  return <div data-testid="WIN_Table_cab_stocks"><WdRadControls layout={listLayout} bindings={bindings} />
    <StockTable layout={listLayout} name="TABLE_cab_stocks" rows={data.rows} id={rowIdentity} selection={selection} select={setSelection} activate={id => void edit(data.rows.find(row => rowIdentity(row) === id)?.id)}
      sort={c => { const sort = ({ COL_Tipo_doc: "document", COL_Numero: "number", COL_data: "date", COL_descricao: "description" } as const)[c.name as "COL_Tipo_doc"]; if (sort) setQuery(q => ({ ...q, sort, descending: q.sort === sort ? !q.descending : false })); }}
      cell={(row, column) => column.name === "COL_Tipo_doc" ? row.documentDescription : column.name === "COL_Numero" ? row.documento_numero : column.name === "COL_data" ? dateEntryDisplay(row.data) : column.name === "COL_descricao" ? row.Descricao : row.documento_codigo} />
    {editor && <StockDocumentDialog services={services} documents={data.documents} mechanics={data.mechanics} loaded={editor.loaded} finish={() => { setEditor(null); setRefresh(v => v + 1); }} />}
    {picker && <DocumentTypePicker repository={services.documents} origin={query.document ?? ""} finish={document => { setPicker(false); setQuery(q => ({ ...q, document })); }} />}
    {diagnostic && <output data-testid="stock-list-diagnostic">{diagnostic}</output>}
  </div>;
}

export function StockReconstructionDialog({ repository, inventory = false, finish }: { repository: StockRepository; inventory?: boolean; finish: () => void }) {
  const layout = inventory ? inventoryRebuildLayout : rebuildLayout, dialog = useRef<WdModalHandle>(null), pending = useRef(false), active = useRef(true);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState(""); const { message } = useDialogs();
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const close = () => { if (!pending.current) { dialog.current?.close(); finish(); } };
  const rebuild = async () => {
    if (pending.current) return; pending.current = true; setBusy(true); setDiagnostic("");
    try { const result = await repository.rebuild(); if (!active.current) return;
      if (result.kind === "rebuilt") { await message({ title: layout.window.title ?? "", text: "Reconstrução terminada", type: 0 }); if (active.current) { pending.current = false; close(); } }
      else setDiagnostic(result.kind);
    } catch { if (active.current) setDiagnostic("transport"); } finally { pending.current = false; if (active.current) setBusy(false); }
  };
  const bindings: WdRadBinding[] = [...staticCaptions(layout), { name: "BTN_Reconstruir", kind: "button", props: { disabled: busy, onClick: () => void rebuild() } },
    ...(inventory ? [{ name: "BTN_Reconstruir1", kind: "button" as const, props: { disabled: busy, onClick: () => close() } }] : [])];
  return <WdModal ref={dialog} layout={layout} instance={layout.window.name} testId={layout.window.name} restoreTestId={`${layout.window.name}-restore`} onClose={close}>
    <WdRadControls layout={layout} bindings={bindings} />{diagnostic && <output data-testid="stock-rebuild-diagnostic">{diagnostic}</output>}
  </WdModal>;
}
export function StockInventoryDialog({ repository, finish, onPreview }: { repository: StockRepository; finish: () => void; onPreview?: StockReportPreview }) {
  const dialog = useRef<WdModalHandle>(null), [rows, setRows] = useState<StockArticle[]>([]), [selection, setSelection] = useState<string | null>(null), [diagnostic, setDiagnostic] = useState("");
  useEffect(() => { let active = true; void repository.inventory().then(result => { if (!active) return; if (result.kind === "loaded") setRows(result.articles); else setDiagnostic(result.kind); }).catch(() => { if (active) setDiagnostic("transport"); }); return () => { active = false; }; }, [repository]);
  const close = () => { dialog.current?.close(); finish(); };
  return <WdModal ref={dialog} layout={inventoryLayout} instance="stock-inventory" testId="WIN_Inventario" restoreTestId="stock-inventory-restore" onClose={close}>
    <StockTable layout={inventoryLayout} name="TABLE_Artigos" rows={rows} id={r => r.id} selection={selection} select={setSelection} cell={(row, column) => column.name === "COL_Codigo" ? row.Codigo : column.name === "COL_Descricao" ? row.Descricao : row.stock} />
    <WdButton control={controlOf(inventoryLayout, "BTN_Imprimir")} disabled={!onPreview} title={onPreview ? undefined : "MIG-13"} onClick={() => onPreview?.({ reportId: "RPT_inventario" })} />
    <WdButton control={controlOf(inventoryLayout, "BTN_Sair")} onClick={close} />
    {diagnostic && <output data-testid="stock-inventory-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function StockUnknownScannerDialog({ rows, finish }: { rows: ScannerRow[]; finish: () => void }) {
  const dialog = useRef<WdModalHandle>(null), [selection, setSelection] = useState<string | null>(null);
  const close = () => { dialog.current?.close(); finish(); };
  return <WdModal ref={dialog} layout={unknownLayout} instance="stock-scanner-unknown" testId="WIN_Leitor_cod_barras_desconhecidos" restoreTestId="stock-scanner-unknown-restore" onClose={close}>
    <WdRadControls layout={unknownLayout} bindings={[...staticCaptions(unknownLayout), { name: "BTN_Confirmar", kind: "button", props: { onClick: close } }]} />
    <StockTable layout={unknownLayout} name="TABLE_Leitura" rows={rows.map((row, index) => ({ ...row, index }))} id={r => String(r.index)} selection={selection} select={setSelection} cell={(row, column) => column.name === "COL_cod_barras" ? row.barcode : row.quantity} />
  </WdModal>;
}
export function StockScannerDialog({ repository, sourceText, finish }: { repository: StockRepository; sourceText: string; finish: (result: Extract<ScannerResult, { kind: "partitioned" }> | "fechou") => void }) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false), active = useRef(true), [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [rows, setRows] = useState<ScannerRow[]>([]), [ready, setReady] = useState(false), [selection, setSelection] = useState<string | null>(null);
  const { message } = useDialogs();
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => { let current = true;
    void repository.scannerConfig().then(result => {
      if (!current || !active.current) return;
      if (result.kind === "loaded") { try { setRows(parseScannerText(sourceText, result.config)); setReady(true); } catch { setDiagnostic("unresolved"); } }
      else setDiagnostic(result.kind);
    }).catch(() => { if (current && active.current) setDiagnostic("transport"); });
    return () => { current = false; };
  }, [repository, sourceText]);
  const close = (result: Extract<ScannerResult, { kind: "partitioned" }> | "fechou" = "fechou") => { if (!pending.current) { dialog.current?.close(); finish(result); } };
  const confirm = async () => { if (!ready || pending.current) return; pending.current = true; setBusy(true); try { const result = await repository.scannerPartition(rows); if (active.current) { if (result.kind === "partitioned") { pending.current = false; close(result); } else setDiagnostic(result.kind); } } catch { if (active.current) { setDiagnostic("transport"); await message({ title: scannerLayout.window.title, text: "A leitura do ficheiro falhou, verifique o caminho", type: 0 }); } } finally { pending.current = false; if (active.current) setBusy(false); } };
  return <WdModal ref={dialog} layout={scannerLayout} instance="stock-scanner" testId="WIN_Leitor_cod_barras" restoreTestId="stock-scanner-restore" onClose={() => close()}>
    <WdRadControls layout={scannerLayout} bindings={[...staticCaptions(scannerLayout), { name: "BTN_Confirmar", kind: "button", props: { disabled: busy || !ready, onClick: () => void confirm() } }, { name: "BTN_Cancelar", kind: "button", props: { disabled: busy, onClick: () => close() } }]} />
    <StockTable layout={scannerLayout} name="TABLE_Leitura" rows={rows.map((row, index) => ({ ...row, index }))} id={r => String(r.index)} selection={selection} select={setSelection} cell={(row, column) => column.name === "COL_cod_barras" ? row.barcode : row.quantity} />
    {diagnostic && <output data-testid="stock-scanner-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function StockStatementDialog({ services, onPreview, finish }: { services: Services; onPreview?: StockReportPreview; finish: () => void }) {
  const dialog = useRef<WdModalHandle>(null), [from, setFrom] = useState(() => dateEntryInitial(today())), [to, setTo] = useState(() => dateEntryInitial(today()));
  const [articleFrom, setArticleFrom] = useState(""), [articleTo, setArticleTo] = useState("zzzzzzzzzz"), [picker, setPicker] = useState<"from" | "to" | null>(null);
  const close = () => { dialog.current?.close(); finish(); };
  const preview = () => { const a = dateEntryResult(from), b = dateEntryResult(to); if (a.kind !== "valid" || b.kind !== "valid") return;
    onPreview?.({ reportId: "RPT_Extrato_artigos", from: a.value === null ? null : a.value + "000000", to: b.value === null ? null : b.value + "235959", articleFrom, articleTo });
  };
  const bindings: WdRadBinding[] = [
    { name: "EDT_Da_data", kind: "date", props: { draft: from, onChange: setFrom, invalid: dateEntryResult(from).kind === "invalid" } },
    { name: "EDT_a_data", kind: "date", props: { draft: to, onChange: setTo, invalid: dateEntryResult(to).kind === "invalid" } },
    { name: "EDT_Do_artigo", kind: "edit", props: { value: articleFrom, onChange: e => setArticleFrom(e.currentTarget.value) } },
    { name: "EDT_Ao_artigo", kind: "edit", props: { value: articleTo, onChange: e => setArticleTo(e.currentTarget.value) } },
    { name: "BTN_VISION4", kind: "button", props: { onClick: () => setPicker("from") } },
    { name: "BTN_VISION3", kind: "button", props: { onClick: () => setPicker("to") } },
    { name: "BTN_Visualizar_impressão", kind: "button", props: { disabled: !onPreview, title: onPreview ? undefined : "MIG-13", onClick: preview } },
  ];
  return <WdModal ref={dialog} layout={statementLayout} instance="stock-statement" testId="WIN_Extrato_Artigos" restoreTestId="stock-statement-restore" onClose={close}>
    <WdRadControls layout={statementLayout} bindings={bindings} />
    {picker && <ArticlePicker launchMode={new URLSearchParams(window.location.search).get("modulo") ?? undefined} repository={services.articles} origin={picker === "from" ? articleFrom : articleTo} finish={code => { if (picker === "from") { setArticleFrom(code); if (code !== "") setArticleTo(code); } else setArticleTo(code); setPicker(null); }} />}
  </WdModal>;
}

function StockLaunchers({ services, mode, onPreview }: { services: Services; mode: "documents" | "inventory" | "rebuild" | "scanner" | "statement"; onPreview?: StockReportPreview }) {
  const { open } = useWorkspace(), [dialog, setDialog] = useState<"inventoryPrompt" | "inventory" | "rebuild" | "statement" | null>(null);
  const [sourceText, setSourceText] = useState<string | null>(null), [partition, setPartition] = useState<Extract<ScannerResult, { kind: "partitioned" }> | null>(null), [unknown, setUnknown] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const { message } = useDialogs();
  return <>
    {mode === "documents" && <button data-testid="stock-open" onClick={() => open({ layout: listLayout, content: <StockListScreen services={services} /> })}>Movimentos de Stocks</button>}
    {mode === "inventory" && <button data-testid="inventory-open" onClick={() => setDialog("inventoryPrompt")}>Inventário</button>}
    {mode === "rebuild" && <button data-testid="stock-rebuild-open" onClick={() => setDialog("rebuild")}>Reconstrução de Stocks</button>}
    {mode === "statement" && <button data-testid="stock-statement-open" onClick={() => setDialog("statement")}>Extrato de Artigos</button>}
    {mode === "scanner" && <label>Ficheiro do leitor <input type="file" data-testid="stock-scanner-file" onChange={event => {
      const file = event.currentTarget.files?.[0]; if (!file) return;
      // U-WAFCFDF-01/05: explicit selected UTF-8 file bridge; configured native path/device remains open.
      void file.arrayBuffer().then(bytes => new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes)).then(text => { setPartition(null); setSourceText(text); }).catch(() => { setDiagnostic("file"); void message({ title: scannerLayout.window.title, text: "A leitura do ficheiro falhou, verifique o caminho", type: 0 }); });
    }} /></label>}
    {dialog === "inventoryPrompt" && <StockReconstructionDialog repository={services.stock} inventory finish={() => setDialog("inventory")} />}
    {dialog === "inventory" && <StockInventoryDialog repository={services.stock} finish={() => setDialog(null)} onPreview={onPreview} />}
    {dialog === "rebuild" && <StockReconstructionDialog repository={services.stock} finish={() => setDialog(null)} />}
    {dialog === "statement" && <StockStatementDialog services={services} onPreview={onPreview} finish={() => setDialog(null)} />}
    {sourceText !== null && <StockScannerDialog repository={services.stock} sourceText={sourceText} finish={result => { setSourceText(null); if (result !== "fechou") { setPartition(result); setUnknown(result.unknown.length > 0); } }} />}
    {unknown && partition && <StockUnknownScannerDialog rows={partition.unknown} finish={() => setUnknown(false)} />}
    {partition && <output data-testid="stock-scanner-returned">{JSON.stringify(partition)}</output>}
    {diagnostic && <output data-testid="stock-launcher-diagnostic">{diagnostic}</output>}
  </>;
}
export default function StockWorkflow({ mode = "documents", onPreview }: { mode?: "documents" | "inventory" | "rebuild" | "scanner" | "statement"; onPreview?: StockReportPreview }) {
  const [services, setServices] = useState<Services | null>(null), [diagnostic, setDiagnostic] = useState("");
  useEffect(() => { let active = true; void Promise.all([isolatedStockRepository(), isolatedArticleRepository(), isolatedDocumentTypeRepository(), isolatedMechanicRepository()]).then(([stock, articles, documents, mechanics]) => { if (active) setServices({ stock, articles, documents, mechanics }); }).catch(() => { if (active) setDiagnostic("transport"); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": "650px" } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais.</aside>
    <WdWorkspace>{services && <StockLaunchers services={services} mode={mode} onPreview={onPreview} />}</WdWorkspace>
    {diagnostic && <output data-testid="stock-workflow-diagnostic">{diagnostic}</output>}
  </main></DialogProvider>;
}
