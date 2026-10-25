import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import type { Unit, UnitList, UnitValues } from "../../packages/domain/src/units";
import type { UnitRepository } from "../application/units";
import { isolatedUnitRepository } from "../infrastructure/units";
import listLayout from "./legacy/WIN_Table_unidades.layout.json";
import formLayout from "./legacy/WIN_Form_unidades.layout.json";
import { controlOf, type LegacyColumn } from "./legacy/layout";
import { WdButton, WdEdit } from "./legacy/wd";
import { WdTable } from "./legacy/table";
import { useTableLayout } from "./legacy/table-layout";
import { DialogProvider, useDialogs } from "./legacy/dialogs";
import { WdWorkspace, useWorkspace, useWorkspaceClose } from "./legacy/workspace";
import { WdModal, type WdModalHandle } from "./legacy/modal";

const formTitle = controlOf(formLayout, "RADTitle").caption!;
const unitColumnKeys: Record<string, NonNullable<UnitList["sort"]>> = { COL_Codigo: "Codigo", COL_Descricao: "Descricao" };

function UnitForm({ repository, unit, finish }: { repository: UnitRepository; unit: Unit | null; finish: (saved: boolean) => void }) {
  const dialog = useRef<WdModalHandle>(null), pending = useRef(false);
  const [busy, setBusy] = useState(false), [diagnostic, setDiagnostic] = useState("");
  const { message } = useDialogs();
  const { register, getValues, formState: { dirtyFields } } = useForm<{ Codigo: string; Descricao: string }>({ defaultValues: { Codigo: unit?.Codigo ?? "", Descricao: unit?.Descricao ?? "" } });
  const close = (saved = false) => { if (!pending.current) { dialog.current?.close(); finish(saved); } };
  const save = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setDiagnostic("");
    try {
      const text = getValues();
      const values: UnitValues = { Codigo: text.Codigo, Descricao: unit && !dirtyFields.Descricao ? unit.Descricao : text.Descricao };
      const result = await repository.save(unit ? { mode: "update", id: unit.id, values } : { mode: "create", values });
      if (result.kind === "saved") { pending.current = false; close(true); }
      else if (result.kind === "required" || result.kind === "duplicate") await message({ title: formTitle, text: result.message, type: result.kind === "duplicate" ? 1 : 0 });
      // UNRESOLVED U-C77806F9-03: developer diagnostic only; no invented legacy failure text.
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  return <WdModal ref={dialog} layout={formLayout} instance="unit-form-frame" testId="WIN_Form_unidades" restoreTestId="unit-form-restore"
    onClose={() => close()} onKeyDown={event => {
      // ADR-003 defaults; exact native Validate-key precedence retains the form U-*-01.
      if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); void save(); }
    }}>
      <div data-testid="SC_Form" style={{ display: "contents" }}>
        <WdEdit control={controlOf(formLayout, "EDT_Codigo")} {...register("Codigo")} readOnly={unit !== null} disabled={busy} />
        <WdEdit control={controlOf(formLayout, "EDT_Descricao")} {...register("Descricao")} disabled={busy} />
      </div>
      <WdButton control={controlOf(formLayout, "BTN_Validar")} disabled={busy} onClick={() => void save()} />
      <WdButton control={controlOf(formLayout, "BTN_Cancelar")} disabled={busy} onClick={() => close()} />
    {diagnostic && <output data-testid="unit-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

function UnitListScreen({ repository }: { repository: UnitRepository }) {
  const close = useWorkspaceClose(), { resource, message } = useDialogs();
  const [query, setQuery] = useState<UnitList>({}), [refresh, setRefresh] = useState(0);
  const [rows, setRows] = useState<Unit[]>([]), [selection, setSelection] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ query: UnitList; refresh: number } | null>(null);
  const [form, setForm] = useState<{ unit: Unit | null } | null>(null), [diagnostic, setDiagnostic] = useState("");
  const pending = useRef(false), [busy, setBusy] = useState(false);
  const columnSearch = useRef<{ key: NonNullable<UnitList["sort"]>; term: string } | null>(null);
  const table = controlOf(listLayout, "TABLE_unidades"), settings = useTableLayout(table, "WIN_Table_unidades/TABLE_unidades");
  useEffect(() => {
    let active = true;
    void repository.list(query).then(result => {
      if (!active) return;
      if (result.kind !== "loaded") { setDiagnostic(result.kind); return; }
      setRows(result.units); setLoaded({ query, refresh }); setDiagnostic("");
      // UNRESOLVED U-CCB16084-02: preserve an explicit existing selection; no guessed fallback row.
      const sought = columnSearch.current;
      const match = sought && result.units.find(row => String(row[sought.key] ?? "").toLocaleLowerCase("pt-PT").startsWith(sought.term.toLocaleLowerCase("pt-PT")));
      columnSearch.current = null;
      setSelection(previous => match ? match.id : result.units.some(row => row.id === previous) ? previous : null);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repository, query, refresh]);
  const ready = loaded?.query === query && loaded?.refresh === refresh;
  const current = rows.find(row => row.id === selection);
  const remove = async () => {
    if (!ready || !current || pending.current) return;
    pending.current = true; setBusy(true);
    try {
      const check = await repository.checkDelete(current.id);
      if (check.kind === "associated") { await message({ title: listLayout.window.title, text: check.message, type: 0 }); return; }
      if (check.kind !== "ready") { setDiagnostic(check.kind); return; }
      const answer = await resource({ title: listLayout.window.title, text: "Deseja apagar o registo?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, destructive: true, safeIndex: 2 });
      if (answer.result !== 1) return;
      const result = await repository.remove(current.id);
      if (result.kind === "associated") await message({ title: listLayout.window.title, text: result.message, type: 0 });
      else if (result.kind === "deleted") setRefresh(value => value + 1);
      else setDiagnostic(result.kind);
    } catch { setDiagnostic("transport"); }
    finally { pending.current = false; setBusy(false); }
  };
  const sort = (column: LegacyColumn) => {
    if (pending.current) return;
    columnSearch.current = null;
    const key = unitColumnKeys[column.name];
    if (!key) return;
    setQuery(previous => ({ sort: key, descending: previous.sort === key ? !previous.descending : false }));
  };
  return <div data-testid="WIN_Table_unidades" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onKeyDown={event => {
    if (event.key === "Escape" && !form && !(event.target instanceof Element && event.target.closest("dialog"))) close();
  }}><div style={{ display: "contents", pointerEvents: "auto" }}>
    <WdTable control={table} rows={rows} rowId={row => row.id} selectedId={selection} onSelect={id => { if (!pending.current) setSelection(id); }} onSort={sort} {...settings} configureColumns designerOptions onResetColumns={settings.resetLayout}
      onColumnSearch={(column, term) => {
        if (pending.current) return;
        const key = unitColumnKeys[column.name];
        if (!key) return;
        columnSearch.current = term ? { key, term } : null;
        if (term) setQuery({ sort: key, descending: false });
      }}
      cell={(row, column) => column.name === "COL_Codigo" ? row.Codigo ?? "" : column.name === "COL_Descricao" ? row.Descricao ?? "" : row.unidadesID ?? ""} />
    <WdButton control={controlOf(listLayout, "Btn_New")} disabled={!ready || busy} onClick={() => setForm({ unit: null })} />
    <WdButton control={controlOf(listLayout, "BTN_Modificar")} disabled={!ready || busy} onClick={() => { if (current) setForm({ unit: current }); }} />
    <WdButton control={controlOf(listLayout, "BTN_Delete")} disabled={!ready || busy} onClick={() => void remove()} />
    <WdButton control={controlOf(listLayout, "BTN_Fechar")} onClick={close} />
    <WdButton control={controlOf(listLayout, "BTN_Imprimir")} disabled title="MIG-13" />
    {form && <UnitForm repository={repository} unit={form.unit} finish={saved => { const editing = form.unit !== null; setForm(null); if (saved || editing) setRefresh(value => value + 1); }} />}
    {diagnostic && <output data-testid="unit-list-diagnostic">{diagnostic}</output>}
  </div></div>;
}

function UnitLauncher({ repository }: { repository: UnitRepository }) {
  const { open } = useWorkspace();
  return <button data-testid="units-open" onClick={() => open({ layout: listLayout, content: <UnitListScreen repository={repository} /> })}>{listLayout.window.title}</button>;
}

export default function UnitsWorkflow() {
  const [repository, setRepository] = useState<UnitRepository | null>(null), [failed, setFailed] = useState(false);
  useEffect(() => { let active = true; void isolatedUnitRepository().then(value => { if (active) setRepository(value); }).catch(() => { if (active) setFailed(true); }); return () => { active = false; }; }, []);
  return <DialogProvider><main className="workspace-fixture customer-workflow" style={{ "--customer-workspace-height": `${listLayout.window.size.height}px` } as CSSProperties}>
    <aside data-testid="workflow-environment">Desenvolvimento isolado — API e PostgreSQL reais. {failed && "dev:workflows indisponível"}</aside>
    <WdWorkspace>{repository && <UnitLauncher repository={repository} />}</WdWorkspace>
  </main></DialogProvider>;
}
