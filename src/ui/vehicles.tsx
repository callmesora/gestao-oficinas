import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { Vehicle, VehicleFilter, VehicleListRow } from "../../packages/domain/src/vehicles";
import type { Customer } from "../../packages/domain/src/customers";
import type { VehicleRepository } from "../application/vehicles";
import type { CustomerRepository } from "../application/customers";
import { vehicleFormValues, type VehicleFormText } from "../application/vehicle-form";
import { isolatedVehicleRepository } from "../infrastructure/vehicles";
import { isolatedCustomerRepository } from "../infrastructure/customers";
import { CustomerPicker } from "./customers";
import listLayout from "./legacy/WIN_Table_Viaturas.layout.json";
import formLayout from "./legacy/WIN_Form_Viaturas.layout.json";
import { controlBox, controlOf, type LegacyColumn } from "./legacy/layout";
import { useAnchoredControl } from "./legacy/anchors";
import { WdButton, WdEdit } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

type Repositories = { vehicles: VehicleRepository; customers: CustomerRepository };
const fields = ["matricula", "marca", "modelo", "Ano", "mes"] as const;
const inputNames = { matricula: "EDT_Matricula", marca: "EDT_Marca", modelo: "EDT_Modelo", Ano: "EDT_Ano", mes: "EDT_Mes" };
const modes = ["todos", "matricula", "cliente", "marca_modelo"] as const;

function CustomerCombo({ customers, value, change, disabled }: { customers: Customer[]; value: string; change: (value: string) => void; disabled: boolean }) {
  const control = useAnchoredControl(controlOf(formLayout, "COMBO_Codigo"));
  const id = useId();
  const captionWidth = control.caption_width ?? 0;
  return <div className="wd-field" data-control-path={control.path} style={controlBox(control)}>
    <label htmlFor={id} style={{ width: captionWidth - 2 }}>{control.caption}</label>
    <select id={id} data-testid="COMBO_Codigo" className="wd-edit" value={value} disabled={disabled} onChange={event => change(event.target.value)}
      style={{ left: captionWidth, width: (control.width ?? 0) - captionWidth }}>
      <option value="" />
      {value && !customers.some(customer => customer.Codigo === value) && <option value={value} />}
      {customers.filter(customer => customer.Codigo !== null).map(customer => <option key={customer.id} value={customer.Codigo!}>{customer.Descricao ?? ""}</option>)}
    </select>
  </div>;
}

function VehicleForm({ repositories, vehicle, finish }: { repositories: Repositories; vehicle: Vehicle | null; finish: (saved: boolean) => void }) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]), [picker, setPicker] = useState(false);
  const { message } = useDialogs();
  const defaults: VehicleFormText = { matricula: vehicle?.matricula ?? "", Cliente: vehicle?.Cliente ?? "", marca: vehicle?.marca ?? "", modelo: vehicle?.modelo ?? "", Ano: String(vehicle?.Ano ?? 0), mes: String(vehicle?.mes ?? 0) };
  const { register, getValues, setValue, control, formState: { dirtyFields } } = useForm<VehicleFormText>({ defaultValues: defaults });
  const selectedCustomer = useWatch({ control, name: "Cliente" });
  useEffect(() => {
    let active = true;
    void repositories.customers.list({ mode: "todos", term: "" }).then(result => {
      if (active && result.kind === "loaded") setCustomers(result.customers);
      else if (active) setDiagnostic(result.kind);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repositories]);
  const close = (saved = false) => { if (!pending.current && !picker) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current || picker) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const draft = vehicleFormValues(getValues(), vehicle, dirtyFields);
      if (draft.kind === "required") { await message({ title: formLayout.window.title, text: draft.message, type: 0 }); return; }
      if (draft.kind === "invalid_numeric") { setDiagnostic(draft.kind); return; }
      const values = draft.values;
      const result = await repositories.vehicles.save(vehicle ? { mode: "update", originalRegistration: vehicle.matricula!, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formLayout.window.title, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const picked = async (code: string) => {
    setPicker(false);
    if (code === "") return;
    pending.current = true; setBusy(true);
    try {
      const result = await repositories.customers.list({ mode: "todos", term: "" });
      if (result.kind === "loaded") {
        setCustomers(result.customers);
        if (result.customers.some(customer => customer.Codigo === code)) setValue("Cliente", code, { shouldDirty: true });
        // UNRESOLVED U-C9675195-02: a vanished ListSeek result does not invent a replacement.
      } else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  return <WdModal ref={dialog} layout={formLayout} instance="vehicle-form-frame" testId="WIN_Form_Viaturas" restoreTestId="vehicle-form-restore"
    onClose={() => close()} onKeyDown={event => {
      // ADR-003 defaults; exact native Validate-key precedence retains the form U-*-01.
      if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); }
    }}>
      <div data-testid="SC_Form" style={{ display: "contents" }}>
        {fields.slice(0, 3).map(field => <WdEdit key={field} control={controlOf(formLayout, inputNames[field])} {...register(field)} disabled={busy} readOnly={field === "matricula" && vehicle !== null} />)}
        <CustomerCombo customers={customers} value={selectedCustomer} change={code => setValue("Cliente", code, { shouldDirty: true })} disabled={busy} />
        <WdButton control={controlOf(formLayout, "BTN_VISION")} disabled={busy} onClick={() => setPicker(true)} />
        {fields.slice(3).map(field => <WdEdit key={field} control={controlOf(formLayout, inputNames[field])} {...register(field)} disabled={busy} integerMask />)}
      </div>
      <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
      <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {picker && <CustomerPicker repository={repositories.customers} origin={getValues("Cliente")} finish={code => void picked(code)} />}
    {diagnostic && <output data-testid="vehicle-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

function VehicleList({ repositories, selecting = false, origin = "", selected }: { repositories: Repositories; selecting?: boolean; origin?: string; selected?: (registration: string) => void }) {
  const closeWindow = useWorkspaceClose(), { resource, message } = useDialogs();
  const [mode, setMode] = useState<VehicleFilter["mode"]>("todos"), [term, setTerm] = useState("");
  const [filter, setFilter] = useState<VehicleFilter>({ mode: "todos", term: "" }), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<VehicleListRow[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ filter: VehicleFilter; refresh: number } | null>(null);
  const [form, setForm] = useState<{ vehicle: Vehicle | null; prior: string } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const [busy, setBusy] = useState(false);
  const search = useRef<HTMLInputElement>(null), returned = useRef(origin), pending = useRef(false), reselect = useRef<string | null>(null);
  const callback = useRef(selected);
  useEffect(() => { callback.current = selected; }, [selected]);
  useEffect(() => () => { callback.current?.(returned.current); }, []);
  const table = controlOf(listLayout, "TABLE_Viaturas"), settings = useTableLayout(table, "WIN_Table_Viaturas/TABLE_Viaturas");
  useEffect(() => {
    let active = true;
    void repositories.vehicles.list(filter).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.vehicles); setLoaded({ filter, refresh }); setDiagnostic("");
      const prior = reselect.current; reselect.current = null;
      setSelection(previous => prior !== null ? result.vehicles.find(row => row.matricula === prior)?.id ?? null : result.vehicles.some(row => row.id === previous) ? previous : null);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repositories, filter, refresh]);
  const ready = loaded?.filter === filter && loaded?.refresh === refresh;
  const current = rows.find(row => row.id === selection);
  const choose = (row: VehicleListRow) => { if (row.matricula !== null) { returned.current = row.matricula; closeWindow(); } };
  const modify = async (row = current) => {
    if (!ready || !row || row.matricula === null || pending.current) return;
    pending.current = true; setBusy(true);
    try {
      const result = await repositories.vehicles.lookup(row.matricula);
      if (result.kind === "loaded") setForm({ vehicle: result.vehicle, prior: row.matricula });
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const remove = async () => {
    if (!ready || !current || current.matricula === null || pending.current) return;
    pending.current = true; setBusy(true);
    try {
      const registration = current.matricula;
      const check = await repositories.vehicles.checkDelete(registration);
      if (check.kind === "associated") { await message({ title: listLayout.window.title, text: check.message, type: 0 }); return; }
      if (check.kind !== "ready") { setDiagnostic(check.kind); return; }
      const answer = await resource({ title: listLayout.window.title, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (answer.result !== 1) return;
      const result = await repositories.vehicles.remove(registration);
      if (result.kind === "associated") await message({ title: listLayout.window.title, text: result.message, type: 0 });
      else if (result.kind === "deleted") setRefresh(value => value + 1);
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    const key = (column.name === "COL_Cliente" ? "Descricao" : column.name === "COL_Matricula" ? "matricula" : column.name === "COL_Marca" ? "marca" : column.name === "COL_Modelo" ? "modelo" : column.name === "COL_Mes" ? "mes" : "Ano") as NonNullable<VehicleFilter["sort"]>;
    setFilter(previous => ({ ...previous, sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  return <div data-testid="WIN_Table_Viaturas" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !form && !(event.target instanceof Element && event.target.closest("dialog"))) closeWindow();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={table} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings}
      cell={(row, column) => String(({ COL_Matricula: row.matricula, COL_Cliente: row.Descricao, COL_Marca: row.marca, COL_Modelo: row.modelo, COL_Ano: row.Ano, COL_Mes: row.mes } as Record<string, unknown>)[column.name] ?? "")}
      onActivate={id => { const row = rows.find(value => value.id === id); if (ready && !pending.current && row) { if (selecting) choose(row); else void modify(row); } }} />
    <WdEdit control={controlOf(listLayout, "EDT_termo_pesquisa")} disabled={busy} {...{ ref: search }} value={term} onChange={event => { setTerm(event.target.value); setFilter(previous => ({ ...previous, mode, term: event.target.value })); }} />
    {modes.map(value => <WdButton key={value} disabled={busy} control={controlOf(listLayout, `BTN_${value}`)} style={{ fontWeight: mode === value ? "bold" : "normal", textDecoration: mode === value ? "underline" : "none", color: mode === value ? "darkblue" : "black" }}
      onClick={() => { setMode(value); setTerm(""); if (value === "todos") setFilter(previous => ({ ...previous, mode: "todos", term: "" })); else setRefresh(previous => previous + 1); search.current?.focus(); }} />)}
    <WdButton control={controlOf(listLayout, "Btn_New")} disabled={!ready || busy} onClick={() => setForm({ vehicle: null, prior: current?.matricula ?? "" })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} disabled={!ready || busy} onClick={() => void modify()} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Fechar")} onClick={closeWindow} />
    <WdButton control={controlOf(listLayout, "BTN_selecionar")} hidden={!selecting} disabled={!ready || busy} onClick={() => { if (ready && !pending.current && current) choose(current); }} />
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} disabled title="MIG-13" />
    {form && <VehicleForm repositories={repositories} vehicle={form.vehicle} finish={saved => {
      const prior = form.prior, editing = form.vehicle !== null; setForm(null);
      if (saved || editing) { reselect.current = prior; setRefresh(value => value + 1); }
      else setSelection(rows.find(row => row.matricula === prior)?.id ?? null);
    }} />}
    {diagnostic && <output data-testid="vehicle-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

function VehicleLauncher({ repositories }: { repositories: Repositories }) {
  const { open } = useWorkspace(), origin = new URLSearchParams(location.search).get("origin") ?? "";
  const [returned, setReturned] = useState(origin);
  return <><button data-testid="vehicles-open" onClick={() => open({ layout: listLayout, content: <VehicleList repositories={repositories} /> })}>{listLayout.window.title}</button>
    <button data-testid="vehicles-select-open" onClick={() => open({ layout: listLayout, content: <VehicleList repositories={repositories} selecting origin={origin} selected={setReturned} /> })}>{controlOf(listLayout, "BTN_selecionar").caption}</button>
    <output data-testid="vehicle-return">{returned}</output></>;
}

export default function VehiclesWorkflow() {
  const [repositories, setRepositories] = useState<Repositories | null>(null), [failed, setFailed] = useState(false);
  useEffect(() => { let active = true; void Promise.all([isolatedVehicleRepository(), isolatedCustomerRepository()]).then(([vehicles, customers]) => { if (active) setRepositories({ vehicles, customers }); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repositories && <VehicleLauncher repositories={repositories} />}</WdWorkspace>
  </main></DialogProvider>;
}
