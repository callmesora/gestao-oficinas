import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { terminalPosition, terminalRequiredMessage, type Terminal, type TerminalList, type TerminalValues } from "../../packages/domain/src/terminals";
import type { TerminalRepository } from "../application/terminals";
import { selectTerminalFolder } from "../infrastructure/terminal-folder";
import { isolatedTerminalRepository } from "../infrastructure/terminals";
import listLayout from "./legacy/WIN_Table_Terminais.layout.json";
import formLayout from "./legacy/WIN_Form_Terminais.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton, WdEdit } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

// Inferred from designer JPG; ADR-016 leaves generated source metadata unchanged.
const captions: Record<string, string> = { EDT_Descricao: "Descrição", EDT_Posicao_Inicial_do_Codigo_de_Barras: "Posição Inicial do Código de Barras", EDT_Posicao_Final_do_Codigo_de_Barras: "Posição Final do Código de Barras", EDT_Posicao_Inicial_da_Quantidade: "Posição Inicial da Quantidade", EDT_Posicao_Final_da_Quantidade: "Posição Final da Quantidade", EDT_Localizacao_da_pasta: "Localização da pasta" };
const displayedFormLayout = { ...formLayout, controls: formLayout.controls.map(control => ({ ...control, ...(captions[control.name] ? { caption: captions[control.name] } : {}) })) };
const formTitle = formLayout.window.title;
const fieldControls = { Codigo: "EDT_Codigo", Descricao: "EDT_Descricao", codbarras_inicio: "EDT_Posicao_Inicial_do_Codigo_de_Barras", codbarras_fim: "EDT_Posicao_Final_do_Codigo_de_Barras", quant_inicio: "EDT_Posicao_Inicial_da_Quantidade", quant_fim: "EDT_Posicao_Final_da_Quantidade", pasta_localizacao: "EDT_Localizacao_da_pasta", nome_ficheiro: "EDT_Nome_do_ficheiro" } as const;
const positionFields = ["codbarras_inicio", "codbarras_fim", "quant_inicio", "quant_fim"] as const;
type FormText = Record<keyof TerminalValues, string>;

function TerminalForm({ repository, terminal, codes, finish }: { repository: TerminalRepository; terminal: Terminal | null; codes: readonly string[]; finish: (saved: boolean) => void }) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const { message } = useDialogs();
  const buffer = useRef(terminal), afterSeek = useRef(false);
  const defaults = Object.fromEntries(Object.keys(fieldControls).map(key => [key, terminal ? String(terminal[key as keyof TerminalValues] ?? "") : positionFields.includes(key as typeof positionFields[number]) ? "0" : ""])) as FormText;
  const { register, getValues, setValue, formState: { dirtyFields } } = useForm<FormText>({ defaultValues: defaults });
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues();
      const values = { Codigo: text.Codigo, Descricao: text.Descricao, pasta_localizacao: text.pasta_localizacao, nome_ficheiro: text.nome_ficheiro } as TerminalValues;
      const required = terminalRequiredMessage(values);
      if (required) { await message({ title: formTitle, text: required, type: 0 }); return; }
      for (const key of ["Descricao", "pasta_localizacao", "nome_ficheiro"] as const) if (terminal && !dirtyFields[key]) values[key] = terminal[key];
      for (const key of positionFields) {
        if (terminal && !dirtyFields[key]) values[key] = terminal[key];
        else {
          const value = terminalPosition(text[key]);
          if (value === undefined) { setDiagnostic("invalid_position"); return; }
          values[key] = value;
        }
      }
      const record = buffer.current;
      const result = await repository.save(record ? { mode: afterSeek.current ? "after-folder-seek" : "update", id: record.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formTitle, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-CDF1C34F-03: developer diagnostic only; no invented legacy failure text.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const chooseFolder = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const positioned = await repository.prepareFolder(getValues().Codigo);
      if (positioned.kind !== "positioned") { setDiagnostic(positioned.kind); return; }
      if (positioned.terminal) { buffer.current = positioned.terminal; afterSeek.current = true; }
      const selected = await selectTerminalFolder(buffer.current?.pasta_localizacao ?? "");
      setValue("pasta_localizacao", selected, { shouldDirty: true });
    } catch (error) { setDiagnostic(error instanceof Error && error.message === "native_only" ? "native_only" : "folder_failed"); }
    finally { pending.current = false; setBusy(false); }
  };
  return <WdModal ref={dialog} layout={displayedFormLayout} instance="terminal-form-frame" testId="WIN_Form_Terminais" restoreTestId="terminal-form-restore"
    onClose={() => close()} onKeyDown={event => {
      // ADR-003 defaults; exact native Validate-key precedence retains the form U-*-01.
      if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); }
    }}>
      <div data-testid="SC_Form" style={{ display: "contents" }}>
        {(Object.keys(fieldControls) as (keyof TerminalValues)[]).map(key => <WdEdit key={key} control={controlOf(displayedFormLayout, fieldControls[key])} {...register(key)} readOnly={key === "pasta_localizacao" || (key === "Codigo" && terminal !== null)} disabled={busy} integerMask={positionFields.includes(key as typeof positionFields[number])}
          suggestions={key === "Codigo" ? codes : undefined} onSuggestion={key === "Codigo" ? value => setValue("Codigo", value, { shouldDirty: true }) : undefined} />)}
        <WdButton control={controlOf(formLayout, "BTN_procurar_pasta")} disabled={busy} onClick={() => void chooseFolder()} />
      </div>
      <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
      <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {diagnostic && <output data-testid="terminal-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function TerminalListScreen({ repository, selecting = false, finish }: { repository: TerminalRepository; selecting?: boolean; finish?: (code?: string) => void }) {
  const close = useWorkspaceClose(finish ? () => finish() : undefined), { resource } = useDialogs();
  const [query, setQuery] = useState<TerminalList>({}), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<Terminal[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ query: TerminalList; refresh: number } | null>(null);
  const [form, setForm] = useState<{ terminal: Terminal | null } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), [busy, setBusy] = useState(false);
  const tableSource = controlOf(listLayout, "TABLE_Terminais");
  const table = { ...tableSource, columns: tableSource.columns?.map(column => column.name === "COL_Descricao" ? { ...column, title: "Descrição" } : column) };
  const columnSearch = useRef<{ key: NonNullable<TerminalList["sort"]>; term: string } | null>(null);
  const settings = useTableLayout(table, "WIN_Table_Terminais/TABLE_Terminais");
  useEffect(() => {
    let active = true;
    void repository.list(query).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.terminals); setLoaded({ query, refresh }); setDiagnostic("");
      // UNRESOLVED U-C33B299B-02: preserve an explicit existing selection; no guessed fallback row.
      const sought = columnSearch.current;
      const match = sought && result.terminals.find(row => row[sought.key]?.toLocaleLowerCase("pt-PT").startsWith(sought.term.toLocaleLowerCase("pt-PT")));
      columnSearch.current = null;
      setSelection(previous => match ? match.id : result.terminals.some(row => row.id === previous) ? previous : null);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, query, refresh]);
  const ready = loaded?.query === query && loaded?.refresh === refresh;
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
  const modify = async (id: string) => {
    if (!ready || pending.current) return;
    pending.current = true; setBusy(true);
    try {
      const result = await repository.list(query);
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.terminals);
      const record = result.terminals.find(row => row.id === id);
      if (record) setForm({ terminal: record });
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    columnSearch.current = null;
    const key = column.name.slice(4) as NonNullable<TerminalList["sort"]>;
    setQuery(previous => ({ sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  const choose = (row: Terminal) => { if (row.Codigo !== null) finish?.(row.Codigo); };
  return <div data-testid="WIN_Table_Terminais" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={table} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && !pending.current && row) { if (selecting) choose(row); else void modify(row.id); } }}
      onColumnSearch={(column, term) => {
        if (pending.current) return;
        const key = column.name.slice(4) as NonNullable<TerminalList["sort"]>;
        columnSearch.current = term ? { key, term } : null;
        if (term) setQuery({ sort: key, descending: false });
      }}
      cell={(row, column) => column.name === "COL_Codigo" ? row.Codigo ?? "" : column.name === "COL_Descricao" ? row.Descricao ?? "" : ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} disabled={!ready || busy} onClick={() => setForm({ terminal: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} disabled={!ready || busy} onClick={() => { if (current) void modify(current.id); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Fechar")} onClick={close} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_selecionar"), visible: selecting }} disabled={!ready || busy} onClick={() => { if (current) choose(current); }} />
    {form && <TerminalForm repository={repository} terminal={form.terminal} codes={rows.flatMap(row => row.Codigo === null ? [] : [row.Codigo])} finish={saved => { const editing = form.terminal !== null; setForm(null); if (saved || editing) setRefresh(value => value + 1); }} />}
    {diagnostic && <output data-testid="terminal-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

// WIN_Form_postos.wdw:239 consumes the actual Codigo result when its real workflow is ported.
export function TerminalPicker({ repository, origin, finish }: { repository: TerminalRepository; origin: string; finish: (code: string) => void }) {
  const dialog = useRef<WdModalHandle>(null);
  const close = (code = origin) => { dialog.current?.close(); finish(code); };
  return <WdModal ref={dialog} layout={listLayout} instance="terminal-picker-frame" testId="terminal-picker" restoreTestId="terminal-picker-restore" onClose={() => close()}>
      <TerminalListScreen repository={repository} selecting finish={close} />
  </WdModal>;
}

function TerminalLauncher({ repository }: { repository: TerminalRepository }) {
  const { open } = useWorkspace();
  return <button data-testid="terminals-open" onClick={() => open({ layout: listLayout, content: <TerminalListScreen repository={repository} /> })}>{listLayout.window.title}</button>;
}

export default function TerminalsWorkflow() {
  const [repository, setRepository] = useState<TerminalRepository | null>(null), [failed, setFailed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false), [returned, setReturned] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search), directSelector = params.get("selecting") === "1";
  useEffect(() => { let active = true; void isolatedTerminalRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && (directSelector ? <button data-testid="terminals-select-open" onClick={() => setPickerOpen(true)}>{listLayout.window.title}</button> : <TerminalLauncher repository={repository} />)}
      {repository && pickerOpen && <TerminalPicker repository={repository} origin={params.get("origin") ?? ""} finish={value => { setReturned(value); setPickerOpen(false); }} />}
    </WdWorkspace>
    {returned !== null && <output data-testid="terminals-returned">{returned}</output>}
  </main></DialogProvider>;
}
