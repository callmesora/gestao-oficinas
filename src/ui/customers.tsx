import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import type { Customer, CustomerFilter, CustomerValues } from "../../packages/domain/src/customers";
import type { CustomerRepository } from "../application/customers";
import { isolatedCustomerRepository } from "../infrastructure/customers";
import listLayout from "./legacy/WIN_Table_Clientes.layout.json";
import formLayout from "./legacy/WIN_Form_Clientes.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton, WdEdit, WdMemo } from "./legacy/wd";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";

const fields = ["Codigo", "Descricao", "Morada1", "Morada2", "codpostal", "Telefone1", "Telemovel", "observacao"] as const;
const controls = ["EDT_Codigo", "EDT_Descricao", "EDT_Morada1", "EDT_Morada2", "EDT_Codpostal", "EDT_Telefone1", "EDT_Telemovel", "EDT_Observacao"];
const modes = ["todos", "codigo", "descricao", "morada", "codigopostal", "telefone"] as const;
type FormText = Record<typeof fields[number], string>;
const codeText = (value: string | null) => value?.replace(/\B(?=(\d{3})+(?!\d))/g, " ") ?? "0";

function CustomerForm({ repository, customer, nextCode, finish }: { repository: CustomerRepository; customer: Customer | null; nextCode: string; finish: (saved: boolean) => void }) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const { message } = useDialogs();
  const defaults = Object.fromEntries(fields.map(field => [field, field === "Codigo" ? codeText(customer ? customer.Codigo : nextCode) : customer?.[field] ?? ""])) as FormText;
  const { register, getValues, setFocus, formState: { dirtyFields } } = useForm<FormText>({ defaultValues: defaults });
  useEffect(() => {
    // Verified new-mode focus: WIN_Form_Clientes.wdw:481. Edit focus remains U-C286277B-01.
    if (!customer) setFocus("Descricao");
  }, [customer, setFocus]);
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues();
      const codeInput = text.Codigo.replaceAll(" ", "") || "0";
      const code = /^[0-9]+$/.test(codeInput) ? String(BigInt(codeInput)) : codeInput;
      const values = Object.fromEntries(fields.map(field => [field, field === "Codigo" ? code
        : customer && !dirtyFields[field] ? customer[field]
        : field === "observacao" ? text[field].replace(/\r\n|\r|\n/g, "\r\n") : text[field]])) as CustomerValues;
      const result = await repository.save(customer ? { mode: "update", id: customer.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formLayout.window.title!, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-C286277B-03: diagnostic kind is developer output, no invented legacy error text.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  return <WdModal ref={dialog} layout={formLayout} instance="customer-form-frame" testId="WIN_Form_Clientes" restoreTestId="customer-form-restore"
    onClose={() => close()} onKeyDown={event => {
      if (event.key === "Enter" && !(event.target instanceof HTMLTextAreaElement) && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); }
    }}>
        <div data-testid="SC_Form" style={{ display: "contents" }}>
          {fields.map((field, index) => field === "observacao" ?
            <WdMemo key={field} control={controlOf(formLayout, controls[index])} {...register(field)} disabled={busy} /> :
            <WdEdit key={field} control={controlOf(formLayout, controls[index])} {...register(field)} readOnly={field === "Codigo" && !!customer} disabled={busy} integerMask={field === "Codigo"} />)}
        </div>
        <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
        <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {diagnostic && <output data-testid="customer-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

function CustomerList({ repository, selecting = false, origin = "", selected, closeOverride }: { repository: CustomerRepository; selecting?: boolean; origin?: string; selected?: (code: string) => void; closeOverride?: (code: string) => void }) {
  const returned = useRef(origin);
  const closeWindow = useWorkspaceClose(closeOverride ? () => closeOverride(returned.current) : undefined), { resource, message } = useDialogs();
  const [filter, setFilter] = useState<CustomerFilter>({ mode: "todos", term: "" });
  const [rows, setRows] = useState<Customer[]>([]), [selection, setSelection] = useState<string | null>(null), [nextCode, setNextCode] = useState("1");
  const [form, setForm] = useState<{ customer: Customer | null } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const search = useRef<HTMLInputElement | null>(null), request = useRef(0), mutation = useRef(false);
  const [refresh, setRefresh] = useState(0);
  const columnSearch = useRef<{ key: keyof CustomerValues; term: string } | null>(null);
  const [loaded, setLoaded] = useState<{ filter: CustomerFilter; refresh: number } | null>(null);
  // Source ReturnedValue starts as origem, including closure through the system chrome.
  useEffect(() => () => { selected?.(returned.current); }, [selected]);
  const tableControl = controlOf(listLayout, "TABLE_Clientes"), tableSettings = useTableLayout(tableControl, "WIN_Table_Clientes/TABLE_Clientes");
  useEffect(() => {
    const sequence = ++request.current; let active = true;
    void repository.list(filter).then(result => {
      if (!active || sequence !== request.current) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.customers); setNextCode(result.nextCode); setDiagnostic(""); setLoaded({ filter, refresh });
      // UNRESOLVED U-CC16AB27-02: retain an existing selection; no guessed first/after-delete selection.
      // ADR-012/009: seek within the actual filtered, server-sorted result; never remove rows.
      const sought = columnSearch.current;
      const match = sought && result.customers.find(row => row[sought.key]?.toLocaleLowerCase("pt-PT").startsWith(sought.term.toLocaleLowerCase("pt-PT")));
      columnSearch.current = null;
      setSelection(previous => match ? match.id : result.customers.some(row => row.id === previous) ? previous : null);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, filter, refresh]);
  const current = rows.find(row => row.id === selection) ?? null;
  const ready = loaded?.filter === filter && loaded?.refresh === refresh;
  const choose = (row: Customer) => { if (row.Codigo !== null) { returned.current = row.Codigo; closeWindow(); } };
  const remove = async () => {
    if (!ready || !current || mutation.current) return;
    mutation.current = true;
    try {
      // Source checks before confirmation; final transaction checks again against concurrent changes.
      const check = await repository.checkDelete(current.id);
      if (check.kind === "associated") { await message({ title: listLayout.window.title!, text: check.message, type: 0 }); return; }
      if (check.kind !== "ready") { setDiagnostic(check.kind); return; }
      const answer = await resource({ title: listLayout.window.title!, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (answer.result !== 1) return;
      const result = await repository.remove(current.id);
      if (result.kind === "associated") await message({ title: listLayout.window.title!, text: result.message, type: 0 });
      else if (result.kind !== "deleted") setDiagnostic(result.kind);
      else setRefresh(value => value + 1);
    } catch { setDiagnostic("transport"); }
    finally { mutation.current = false; }
  };
  const sort = (column: LegacyColumn) => {
    columnSearch.current = null;
    const key = (column.name === "COL_Codpostal" ? "codpostal" : column.name.slice(4)) as NonNullable<CustomerFilter["sort"]>;
    setFilter(previous => ({ ...previous, sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  return <div data-testid="WIN_Table_Clientes" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !form && !(event.target instanceof Element && event.target.closest("dialog"))) closeWindow();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={tableControl} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={setSelection}
      cell={(row, column) => { const key = (column.name === "COL_Codpostal" ? "codpostal" : column.name.slice(4)) as keyof CustomerValues; return key === "Codigo" ? codeText(row.Codigo) : row[key] ?? ""; }}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && row) { if (selecting) choose(row); else setForm({ customer: row }); } }} onSort={sort} {...tableSettings} configureColumns designerOptions onResetColumns={tableSettings.resetLayout}
      onColumnSearch={(column, term) => {
        const key = (column.name === "COL_Codpostal" ? "codpostal" : column.name.slice(4)) as NonNullable<CustomerFilter["sort"]>;
        columnSearch.current = term ? { key, term } : null;
        if (term) setFilter(previous => ({ ...previous, sort: key, descending: false }));
      }} />
    <WdEdit control={controlOf(listLayout, "EDT_termo_pesquisa")} value={filter.term} {...{ ref: search }} onChange={event => { columnSearch.current = null; setFilter(previous => ({ ...previous, term: event.target.value })); }} />
    {modes.map(mode => <WdButton key={mode} control={controlOf(listLayout, `BTN_${mode}`)} style={{ fontWeight: filter.mode === mode ? "bold" : "normal", textDecoration: filter.mode === mode ? "underline" : "none", color: filter.mode === mode ? "darkblue" : "black" }}
      onClick={() => { columnSearch.current = null; setFilter({ mode, term: "" }); search.current?.focus(); }} />)}
    <WdMemo control={controlOf(listLayout, "EDT_Observacao")} value={current?.observacao ?? ""} readOnly />
    <WdButton control={controlOf(listLayout, "Btn_New")} disabled={!ready} onClick={() => setForm({ customer: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} disabled={!ready} onClick={() => { if (ready && current) setForm({ customer: current }); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} disabled={!ready} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Fechar")} onClick={closeWindow} />
    <WdButton control={controlOf(listLayout, "BTN_selecionar")} disabled={!ready} hidden={!selecting} onClick={() => { if (ready && current) choose(current); }} />
    {/* SRC-4883adab32: report remains assigned to MIG-13, visibly unavailable, never a no-op. */}
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} disabled title="MIG-13" />
    {form && <CustomerForm repository={repository} customer={form.customer} nextCode={nextCode} finish={saved => { const editing = form.customer !== null; setForm(null); if (saved || editing) setRefresh(value => value + 1); }} />}
    {diagnostic && <output data-testid="customer-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

// SRC-a29b466a64: Open(WIN_Table_Clientes,true,COMBO_Codigo) blocks its real vehicle caller.
export function CustomerPicker({ repository, origin, finish }: { repository: CustomerRepository; origin: string; finish: (code: string) => void }) {
  const dialog = useRef<WdModalHandle>(null);
  const close = (code = origin) => { dialog.current?.close(); finish(code); };
  return <WdModal ref={dialog} layout={listLayout} instance="customer-picker-frame" testId="customer-picker" restoreTestId="customer-picker-restore" onClose={() => close()}>
        <CustomerList repository={repository} selecting origin={origin} closeOverride={close} />
  </WdModal>;
}

function CustomerLauncher({ repository }: { repository: CustomerRepository }) {
  const { open } = useWorkspace();
  const origin = new URLSearchParams(location.search).get("origin") ?? "";
  const [returned, setReturned] = useState(origin);
  return <>
    <button data-testid="customers-open" onClick={() => open({ layout: listLayout, content: <CustomerList repository={repository} /> })}>{listLayout.window.title}</button>
    <button data-testid="customers-select-open" onClick={() => open({ layout: listLayout, content: <CustomerList repository={repository} selecting origin={origin} selected={setReturned} /> })}>{controlOf(listLayout, "BTN_selecionar").caption}</button>
    <output data-testid="customer-return">{returned}</output>
  </>;
}

export default function CustomersWorkflow() {
  const [repository, setRepository] = useState<CustomerRepository | null>(null), [failed, setFailed] = useState(false);
  useEffect(() => { let active = true; void isolatedCustomerRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && <CustomerLauncher repository={repository} />}</WdWorkspace>
  </main></DialogProvider>;
}
