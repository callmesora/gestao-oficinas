import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { postoCode, postoRequiredMessage, type Posto, type PostoList, type PostoValues } from "../../packages/domain/src/postos";
import type { PostoRepository } from "../application/postos";
import type { TerminalRepository } from "../application/terminals";
import { TerminalFileContext } from "../application/terminal-file-context";
import { isolatedPostoRepository } from "../infrastructure/postos";
import { isolatedTerminalRepository } from "../infrastructure/terminals";
import listLayout from "./legacy/WIN_Table_postos.layout.json";
import formLayout from "./legacy/WIN_Form_postos.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton, WdEdit } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { TerminalLauncher, TerminalPicker } from "./terminals";

// JPG-backed presentation inference (ADR-016); generated source evidence stays unchanged.
const displayedFormLayout = { ...formLayout, controls: formLayout.controls.map(control => control.name === "EDT_Descricao" ? { ...control, caption: "Descrição" } : control) };
const table = controlOf(listLayout, "TABLE_postos");
const displayedTable = { ...table, columns: table.columns?.map(column => column.name === "COL_Descricao" ? { ...column, title: "Descrição" } : column) };
const formTitle = controlOf(formLayout, "RADTitle").caption!;
const postoColumnKeys: Record<string, NonNullable<PostoList["sort"]>> = { COL_Codigo: "Codigo", COL_Descricao: "Descricao" };
type FormOpening = { posto: Posto | null; codeEditableAtOpen: boolean };

function PostoForm({ repository, terminalRepository, fileContext, opening, finish }: {
  repository: PostoRepository; terminalRepository: TerminalRepository; fileContext: TerminalFileContext;
  opening: FormOpening; finish: (saved: boolean) => void;
}) {
  const { posto, codeEditableAtOpen } = opening;
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [picker, setPicker] = useState<{ origin: string } | null>(null);
  const { message } = useDialogs();
  const { register, getValues, setValue, formState: { dirtyFields } } = useForm<{ Codigo: string; Descricao: string; terminal: string }>({
    defaultValues: { Codigo: posto ? String(posto.Codigo ?? "") : "0", Descricao: posto?.Descricao ?? "", terminal: posto?.terminal ?? "" },
  });
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues(), code = posto && !dirtyFields.Codigo ? posto.Codigo : postoCode(text.Codigo);
      if (code === undefined) { setDiagnostic("invalid_code"); return; }
      const values: PostoValues = { Codigo: code, Descricao: posto && !dirtyFields.Descricao ? posto.Descricao : text.Descricao, terminal: posto && !dirtyFields.terminal ? posto.terminal : text.terminal };
      const required = postoRequiredMessage(values);
      if (required) { await message({ title: formTitle, text: required, type: 0 }); return; }
      const result = await repository.save(posto ? { mode: "update", id: posto.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formTitle, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-CD4F0FE3-03: developer diagnostic only; no invented legacy failure message.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const chooseTerminal = () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setPicker({ origin: getValues().terminal });
  };
  return <WdModal ref={dialog} layout={displayedFormLayout} instance="posto-form-frame" testId="WIN_Form_postos" restoreTestId="posto-form-restore"
    onClose={() => close()} onKeyDown={event => {
      // ADR-003 Validate-key default; exact native precedence retains U-CD4F0FE3-01.
      if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); }
    }}>
    <div data-testid="SC_Form" style={{ display: "contents" }}>
      <WdEdit control={controlOf(formLayout, "EDT_Codigo")} {...register("Codigo")} integerMask readOnly={!codeEditableAtOpen} disabled={busy} />
      <WdEdit control={controlOf(displayedFormLayout, "EDT_Descricao")} {...register("Descricao")} disabled={busy} />
      <WdEdit control={controlOf(formLayout, "EDT_Terminal")} {...register("terminal")} readOnly disabled={busy} />
      <WdButton control={controlOf(formLayout, "BTN_NoName1")} disabled={busy} onClick={chooseTerminal} />
    </div>
    <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
    <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {picker && <TerminalPicker repository={terminalRepository} fileContext={fileContext} origin={picker.origin} finish={code => {
      setValue("terminal", code, { shouldDirty: true }); setPicker(null); pending.current = false; setBusy(false);
    }} />}
    {diagnostic && <output data-testid="posto-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function PostoListScreen({ repository, terminalRepository, fileContext }: { repository: PostoRepository; terminalRepository: TerminalRepository; fileContext: TerminalFileContext }) {
  const close = useWorkspaceClose(), { resource } = useDialogs();
  const [query, setQuery] = useState<PostoList>({}), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<Posto[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ query: PostoList; refresh: number } | null>(null);
  const [form, setForm] = useState<FormOpening | null>(null), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), [busy, setBusy] = useState(false), readOwner = useRef(0);
  const columnSearch = useRef<{ key: NonNullable<PostoList["sort"]>; term: string } | null>(null);
  const settings = useTableLayout(displayedTable, "WIN_Table_postos/TABLE_postos");
  useEffect(() => () => { readOwner.current++; }, []);
  useEffect(() => {
    let active = true;
    void repository.list(query).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.postos); setLoaded({ query, refresh }); setDiagnostic("");
      // UNRESOLVED U-CF0B8FA5-02: retain explicit selection; no guessed fallback after a vanished record.
      const sought = columnSearch.current;
      const match = sought && result.postos.find(row => String(row[sought.key] ?? "").toLocaleLowerCase("pt-PT").startsWith(sought.term.toLocaleLowerCase("pt-PT")));
      columnSearch.current = null;
      setSelection(previous => match ? match.id : result.postos.some(row => row.id === previous) ? previous : null);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, query, refresh]);
  const ready = loaded?.query === query && loaded?.refresh === refresh;
  const current = rows.find(row => row.id === selection);
  const remove = async () => {
    if (!ready || !current || pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++readOwner.current;
    try {
      const answer = await resource({ title: listLayout.window.title, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (owner !== readOwner.current || answer.result !== 1) return;
      const result = await repository.remove(current.id);
      if (owner !== readOwner.current) return;
      if (result.kind === "deleted") setRefresh(value => value + 1);
      else setDiagnostic(result.kind);
    } catch { if (owner === readOwner.current) setDiagnostic("transport"); }
    finally { if (owner === readOwner.current) { pending.current = false; setBusy(false); } }
  };
  const modify = async (id: string) => {
    if (!ready || pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++readOwner.current;
    try {
      // WIN_Table_postos.wdw:191–194: actual refresh before positioning/opening, then after any result.
      const result = await repository.list(query);
      if (owner !== readOwner.current) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.postos);
      const record = result.postos.find(row => row.id === id);
      if (record) setForm({ posto: record, codeEditableAtOpen: fileContext.snapshot().kind === "new" });
    } catch { if (owner === readOwner.current) setDiagnostic("transport"); }
    finally { if (owner === readOwner.current) { pending.current = false; setBusy(false); } }
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    columnSearch.current = null;
    const key = postoColumnKeys[column.name];
    if (key) setQuery(previous => ({ sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  return <div data-testid="WIN_Table_postos" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !pending.current && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={displayedTable} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onColumnSearch={(column, term) => {
        if (pending.current) return;
        const key = postoColumnKeys[column.name];
        if (!key) return;
        columnSearch.current = term ? { key, term } : null;
        if (term) setQuery({ sort: key, descending: false });
      }}
      cell={(row, column) => column.name === "COL_Codigo" ? String(row.Codigo ?? "") : column.name === "COL_Descricao" ? row.Descricao ?? "" : ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} disabled={!ready || busy} onClick={() => setForm({ posto: null, codeEditableAtOpen: fileContext.snapshot().kind === "new" })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} disabled={!ready || busy} onClick={() => { if (current) void modify(current.id); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Fechar")} disabled={busy} onClick={close} />
    {form && <PostoForm repository={repository} terminalRepository={terminalRepository} fileContext={fileContext} opening={form} finish={saved => {
      const editing = form.posto !== null; setForm(null); if (saved || editing) setRefresh(value => value + 1);
    }} />}
    {diagnostic && <output data-testid="posto-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

function PostoLauncher({ repository, terminalRepository, fileContext }: { repository: PostoRepository; terminalRepository: TerminalRepository; fileContext: TerminalFileContext }) {
  const { open } = useWorkspace();
  return <button data-testid="postos-open" onClick={() => open({ layout: listLayout, content: <PostoListScreen repository={repository} terminalRepository={terminalRepository} fileContext={fileContext} /> })}>{listLayout.window.title}</button>;
}

export default function PostosWorkflow() {
  const [repositories, setRepositories] = useState<{ posto: PostoRepository; terminal: TerminalRepository } | null>(null), [failed, setFailed] = useState(false);
  const [fileContext] = useState(() => new TerminalFileContext());
  useEffect(() => {
    let active = true;
    void Promise.all([isolatedPostoRepository(), isolatedTerminalRepository()]).then(([posto, terminal]) => { if (active) setRepositories({ posto, terminal }); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repositories && <>
      <PostoLauncher repository={repositories.posto} terminalRepository={repositories.terminal} fileContext={fileContext} />
      <TerminalLauncher repository={repositories.terminal} fileContext={fileContext} />
    </>}</WdWorkspace>
  </main></DialogProvider>;
}
