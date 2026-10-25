import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { userCode, userRequiredMessage, userUppercase, type UserListRow, type UserRecord, type UserList, type UserValues } from "../../packages/domain/src/users";
import type { UserRepository } from "../application/users";
import { selectAfterTableRead } from "../application/table-selection";
import { isolatedUserRepository } from "../infrastructure/users";
import listLayout from "./legacy/WIN_Table_utilizadores.layout.json";
import formLayout from "./legacy/WIN_Form_utilizadores.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton } from "./legacy/wd";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

const table = controlOf(listLayout, "TABLE_utilizadores"), formTitle = controlOf(formLayout, "RADTitle").caption!;
const columnKeys: Record<string, NonNullable<UserList["sort"]>> = { COL_Codigo: "Codigo", COL_Descricao: "Descricao" };
const searchValue = (row: UserListRow, key: NonNullable<UserList["sort"]>) => String(row[key] ?? "");
export type UserSelection = number | string;

function UserForm({ repository, user, descriptions, finish }: { repository: UserRepository; user: UserRecord | null; descriptions: readonly string[]; finish: (saved: boolean) => void }) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const { message } = useDialogs();
  const { register, getValues, setValue, formState: { dirtyFields } } = useForm<{ Codigo: string; Descricao: string; palavra_passe: string }>({
    defaultValues: { Codigo: user ? String(user.Codigo ?? "") : "0", Descricao: user?.Descricao ?? "", palavra_passe: user?.palavra_passe ?? "" },
  });
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues(), code = user && !dirtyFields.Codigo ? user.Codigo : userCode(text.Codigo);
      if (code === undefined) { setDiagnostic("invalid_code"); return; }
      const values: UserValues = { Codigo: code, Descricao: user && !dirtyFields.Descricao ? user.Descricao : text.Descricao, palavra_passe: user && !dirtyFields.palavra_passe ? user.palavra_passe : text.palavra_passe };
      const required = userRequiredMessage(values);
      if (required) { await message({ title: formTitle, text: required, type: 0 }); return; }
      // WIN_Form_utilizadores34–47: conversion is unconditional after all required guards,
      // including an untouched loaded value. Keep the transformed draft after refusal.
      values.palavra_passe = userUppercase(values.palavra_passe!);
      setValue("palavra_passe", values.palavra_passe, { shouldDirty: true });
      const result = await repository.save(user ? { mode: "update", id: user.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formTitle, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-CE3323C9-03: developer diagnostic only; no credential values/new error text.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const fieldBindings: WdRadBinding[] = [
    { name: "EDT_Codigo", kind: "edit", props: { ...register("Codigo"), integerMask: true, readOnly: user !== null, disabled: busy } },
    { name: "EDT_Descricao", kind: "edit", props: { ...register("Descricao"), disabled: busy, suggestions: descriptions, onSuggestion: value => setValue("Descricao", value, { shouldDirty: true }) } },
    { name: "EDT_Palavra_passe", kind: "edit", props: { ...register("palavra_passe"), passwordReveal: true, disabled: busy } },
  ];
  const buttonBindings: WdRadBinding[] = [
    { name: "BTN_Validar", kind: "button", props: { disabled: busy, onClick: () => void save() } },
    { name: "BTN_Cancelar", kind: "button", props: { disabled: busy, onClick: () => close() } },
  ];
  return <WdModal ref={dialog} layout={formLayout} instance="user-form-frame" testId="WIN_Form_utilizadores" restoreTestId="user-form-restore"
    onClose={() => close()} onKeyDown={event => { if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); } }}>
    <div data-testid="SC_Form" style={{ display: "contents" }}><WdRadControls layout={formLayout} bindings={fieldBindings} /></div>
    <WdRadControls layout={formLayout} bindings={buttonBindings} />
    {diagnostic && <output data-testid="user-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

export function UserListScreen({ repository, selecting = false, finish }: { repository: UserRepository; selecting?: boolean; finish?: (code?: number) => void }) {
  const close = useWorkspaceClose(finish ? () => finish() : undefined), { resource } = useDialogs();
  const [query, setQuery] = useState<UserList>({}), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<UserListRow[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ query: UserList; refresh: number } | null>(null);
  const [form, setForm] = useState<{ user: UserRecord | null } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), [busy, setBusy] = useState(false), readOwner = useRef(0);
  const columnSearch = useRef<{ key: NonNullable<UserList["sort"]>; term: string } | null>(null);
  const settings = useTableLayout(table, "WIN_Table_utilizadores/TABLE_utilizadores");
  useEffect(() => () => { readOwner.current++; }, []);
  useEffect(() => {
    let active = true;
    void repository.list(query).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.users); setLoaded({ query, refresh }); setDiagnostic("");
      const sought = columnSearch.current; columnSearch.current = null;
      // UNRESOLVED U-CD9683DC-02: preserve explicit identity; no guessed initial/delete fallback.
      setSelection(previous => selectAfterTableRead(result.users, previous, sought ? { term: sought.term, value: row => searchValue(row, sought.key) } : undefined));
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, query, refresh]);
  const ready = loaded?.query === query && loaded?.refresh === refresh;
  const focused = useRef(false), screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selecting && ready && !focused.current) { screen.current?.querySelector<HTMLButtonElement>('[data-testid="BTN_selecionar"]')?.focus(); focused.current = true; }
  }, [selecting, ready]);
  const current = rows.find(row => row.id === selection);
  const sourceRefresh = () => { columnSearch.current = null; setRefresh(value => value + 1); };
  const remove = async () => {
    if (!ready || !current || pending.current || selecting) return;
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++readOwner.current;
    try {
      const answer = await resource({ title: listLayout.window.title, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (owner !== readOwner.current || answer.result !== 1) return;
      const result = await repository.remove(current.id);
      if (owner !== readOwner.current) return;
      if (result.kind === "deleted") sourceRefresh(); else setDiagnostic(result.kind);
    } catch { if (owner === readOwner.current) setDiagnostic("transport"); }
    finally { if (owner === readOwner.current) { pending.current = false; setBusy(false); } }
  };
  const modify = async (id: string) => {
    if (!ready || pending.current || selecting) return;
    pending.current = true; setBusy(true); setDiagnostic(""); const owner = ++readOwner.current;
    try {
      // Source216–222 has no preliminary list refresh. ADR004 narrowly reads the selected credential.
      const result = await repository.read({ id });
      if (owner !== readOwner.current) return;
      if (result.kind === "loaded") setForm({ user: result.user }); else setDiagnostic(result.kind);
    } catch { if (owner === readOwner.current) setDiagnostic("transport"); }
    finally { if (owner === readOwner.current) { pending.current = false; setBusy(false); } }
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    columnSearch.current = null; const key = columnKeys[column.name];
    if (key) setQuery(previous => ({ sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  const choose = (row: UserListRow) => { if (row.Codigo !== null) finish?.(row.Codigo); };
  const move = (direction: -1 | 1) => {
    if (!ready || pending.current) return;
    const index = rows.findIndex(row => row.id === selection), currentIndex = index < 0 ? -1 : index + 1;
    const requested = direction === 1 ? currentIndex < rows.length ? currentIndex + 1 : null : currentIndex > 1 ? currentIndex - 1 : null;
    if (requested === null) return;
    // UNRESOLVED U-CD9683DC-02: literal source next requests0 from no selection; native effect remains open.
    if (requested >= 1 && requested <= rows.length) setSelection(rows[requested - 1].id);
  };
  return <div ref={screen} data-testid="WIN_Table_utilizadores" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !pending.current && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={table} rows={rows} rowHeight={selecting ? 30 : undefined} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && !pending.current && row) { if (selecting) choose(row); else void modify(row.id); } }}
      onColumnSearch={(column, term) => { if (pending.current) return; const key = columnKeys[column.name]; if (!key) return; columnSearch.current = term ? { key, term } : null; if (term) setQuery({ sort: key, descending: false }); }}
      cell={(row, column) => column.name === "COL_Codigo" ? String(row.Codigo ?? "") : column.name === "COL_Descricao" ? row.Descricao ?? "" : ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} hidden={selecting} disabled={!ready || busy} onClick={() => setForm({ user: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} hidden={selecting} disabled={!ready || busy} onClick={() => { if (current) void modify(current.id); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} hidden={selecting} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} hidden={selecting} disabled title="MIG-13" />
    <WdButton control={{ ...controlOf(listLayout, "BTN_Fechar"), ...(selecting ? { y: 506, height: 38 } : {}) }} disabled={busy} onClick={close} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_selecionar"), visible: selecting }} disabled={!ready || busy} onClick={() => { if (current) choose(current); }} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_seguinte"), visible: selecting }} disabled={!ready || busy} onClick={() => move(1)} />
    <WdButton control={{ ...controlOf(listLayout, "BTN_anterior"), visible: selecting }} disabled={!ready || busy} onClick={() => move(-1)} />
    {form && <UserForm repository={repository} user={form.user} descriptions={rows.flatMap(row => row.Descricao === null ? [] : [row.Descricao])} finish={saved => { const editing = form.user !== null; setForm(null); if (saved || editing) sourceRefresh(); }} />}
    {diagnostic && <output data-testid="user-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

export function UserPicker({ repository, origin, finish }: { repository: UserRepository; origin: UserSelection; finish: (code: UserSelection) => void }) {
  const dialog = useRef<WdModalHandle>(null);
  const close = (code: UserSelection = origin) => { dialog.current?.close(); finish(code); };
  return <WdModal ref={dialog} layout={listLayout} instance="user-picker-frame" testId="user-picker" restoreTestId="user-picker-restore" onClose={() => close()}>
    <UserListScreen repository={repository} selecting finish={close} />
  </WdModal>;
}
function UserLauncher({ repository }: { repository: UserRepository }) {
  const { open } = useWorkspace();
  return <button data-testid="users-open" onClick={() => open({ layout: listLayout, content: <UserListScreen repository={repository} /> })}>{listLayout.window.title}</button>;
}
export default function UsersWorkflow() {
  const [repository, setRepository] = useState<UserRepository | null>(null), [failed, setFailed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false), [returned, setReturned] = useState<UserSelection | null>(null);
  const params = new URLSearchParams(window.location.search), directSelector = params.get("selecting") === "1";
  useEffect(() => { let active = true; void isolatedUserRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && (directSelector ? <button data-testid="users-select-open" onClick={() => setPickerOpen(true)}>{listLayout.window.title}</button> : <UserLauncher repository={repository} />)}
      {repository && pickerOpen && <UserPicker repository={repository} origin={params.get("origin") ?? ""} finish={code => { setReturned(code); setPickerOpen(false); }} />}
    </WdWorkspace>
    {returned !== null && <><output data-testid="users-returned">{returned}</output><output data-testid="users-returned-kind">{typeof returned}</output></>}
  </main></DialogProvider>;
}
