import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { RepairDateAnswer, RepairFormInitialiseResult, RepairFormMeta, RepairFormPrepareInput, RepairFormRaw, RepairFormResolved, RepairFormSaveInput, RepairFormTarget, RepairOrderWrite18 } from "../../packages/domain/src/repair-order-form";
import { repairFormContactText, repairFormInitialValues } from "../../packages/domain/src/repair-order-form";
import { dateEntryInitial, dateEntryResult, type DateEntryDraft } from "../../packages/domain/src/date-entry";
import { dateTimeEntryInitial, dateTimeEntryResult, type DateTimeEntryDraft } from "../../packages/domain/src/date-time";
import type { RepairOrderFormRepository } from "../application/repair-order-form";
import type { CustomerRepository } from "../application/customers";
import type { VehicleRepository } from "../application/vehicles";
import type { MechanicRepository } from "../application/mechanics";
import type { UserRepository } from "../application/users";
import { CustomerPicker } from "./customers";
import { MechanicPicker } from "./mechanics";
import { UserPicker } from "./users";
import { VehicleEditor, VehiclePicker } from "./vehicles";
import { DatePromptDialog } from "./date-prompt";
import { RepairStateConfirmationDialog } from "./repair-state-confirmation";
import sourceLayout from "./legacy/WIN_Ordens_Reparacao_Form.layout.json";
import { controlOf, type LegacyLayout } from "./legacy/layout";
import { WdModal, type WdModalHandle } from "./legacy/modal";
import { WdRadControls, type WdRadBinding } from "./legacy/rad-controls";
import type { WdDateEditHandle } from "./legacy/date";
import { decimalMaskDisplay, decimalMaskOf, decimalMaskValue } from "./legacy/decimal-entry";
import { useDialogs } from "./legacy/dialogs";
import "./repair-order-form.css";

const title = "Ordem de reparação";
// JPG-backed presentation overlays; source identities, flags and geometry stay generated.
const captions: Record<string, string> = { RADTitle: title, BTN_informacao: "Informação", CBOX_faturado: "Faturado", STC_Observação: "Observação", EDT_Ordem_n: "Ordem nº", EDT_Nr_Fatura: "Nº Fatura" };
const layout: LegacyLayout = { ...sourceLayout, controls: sourceLayout.controls.map(control => control.path === "STC_Observação"
  // Source694 semantic identity and dossier Caption/Left/Top at the same19,324,100,20 geometry.
  ? { ...control, kind: "Caption", caption: captions[control.name], h_align: "Left", v_align: "Top" }
  : captions[control.name] ? { ...control, caption: captions[control.name] } : control) };
const totalMask = decimalMaskOf(controlOf(layout, "EDT_Total_Pago").input_mask)!;
type Loaded = Extract<RepairFormInitialiseResult, { kind: "loaded" }>;
export type RepairOrderFormRepositories = { form: RepairOrderFormRepository; customers: CustomerRepository; vehicles: VehicleRepository; mechanics: MechanicRepository; users: UserRepository };
type FormText = Pick<RepairOrderWrite18, "matricula" | "km_viatura" | "recepacao_contatos" | "recepcao_servico" | "recepcao_obs" | "numero_fatura" | "total_pago"> extends infer T ? { [K in keyof T]: string } : never;
type TextName = keyof FormText;
type DateName = "recepcao_datahora" | "recepcao_entrega_prevista" | "data_pagamento";
type Dates = { recepcao_datahora: DateTimeEntryDraft; recepcao_entrega_prevista: DateEntryDraft; data_pagamento: DateEntryDraft };
type Child = { kind: "vehicle"; origin: string; finish: (value: string) => void }
  | { kind: "vehicleEditor"; registration: string; finish: (saved: boolean) => void }
  | { kind: "customer"; origin: string; finish: (value: string) => void }
  | { kind: "mechanic"; origin: number | string; finish: (value: number | string) => void }
  | { kind: "user"; origin: number | string; finish: (value: number | string) => void }
  | { kind: "date"; title: string; value: RepairFormRaw; finish: (value: RepairFormRaw) => void }
  | { kind: "state"; description: RepairFormRaw; finish: (value: 0 | 1) => void };

/** Read the workstation clock once; imported dates never enter the JS Date constructor. */
function workstationClock() {
  const now = new Date(), part = (value: number) => String(value).padStart(2, "0");
  const day = String(now.getFullYear()).padStart(4, "0") + part(now.getMonth() + 1) + part(now.getDate());
  return { day, entry: day + part(now.getHours()) + part(now.getMinutes()) + part(now.getSeconds()) };
}
function startingValues(initial: Loaded, clock: ReturnType<typeof workstationClock>): RepairOrderWrite18 {
  const order = initial.order;
  if (order) return { numero: order.numero ?? "", matricula: order.matricula, km_viatura: order.km_viatura, recepcao_util: order.recepcao_util,
    recepcao_datahora: order.recepcao_datahora, recepcao_cliente: "0", recepcao_terceiro: order.recepcao_terceiro,
    recepacao_contatos: order.recepacao_contatos, recepcao_servico: order.recepcao_servico, recepcao_obs: order.recepcao_obs,
    recepcao_entrega_prevista: order.recepcao_entrega_prevista, recepcao_prioridade: order.recepcao_prioridade,
    reparacao_mecanico: order.reparacao_mecanico, reparacao_estado: order.reparacao_estado, faturado: order.faturado,
    total_pago: order.total_pago, numero_fatura: order.numero_fatura, data_pagamento: order.data_pagamento };
  const fresh = repairFormInitialValues(initial.nextNumero ?? "", clock.entry);
  if (!fresh) throw new Error("Repair form initialization values invalid");
  return fresh;
}
function sourceMeta(initial: Loaded, values: RepairOrderWrite18): RepairFormMeta {
  const index = initial.order ? initial.states.findIndex(state => state.Codigo === values.reparacao_estado) : -1;
  return { state: { index: index + 1 || -1, value: index < 0 ? "-1" : String(index + 1), storedValue: values.reparacao_estado },
    mechanicEmpty: !initial.order || !initial.mechanics.some(row => row.Codigo === values.reparacao_mecanico),
    receptionistEmpty: !initial.order || !initial.receptionists.some(row => row.Codigo === values.recepcao_util) };
}
const windowsMemo = (value: string) => value.replace(/\r\n|\r|\n/g, "\r\n");

export function RepairOrderFormDialog({ repositories, target, finish }: { repositories: RepairOrderFormRepositories; target: RepairFormTarget; finish: (saved: boolean) => void }) {
  const [clock] = useState(workstationClock), [initial, setInitial] = useState<Loaded | null>(null), [diagnostic, setDiagnostic] = useState("");
  const dialog = useRef<WdModalHandle>(null);
  useEffect(() => {
    let active = true;
    void repositories.form.initialise({ target }).then(result => {
      if (!active) return;
      if (result.kind === "loaded") setInitial(result); else setDiagnostic(result.kind);
    }).catch(() => { if (active) setDiagnostic("transport"); });
    return () => { active = false; };
  }, [repositories.form, target]);
  if (initial) return <RepairOrderEditor repositories={repositories} target={target} initial={initial} clock={clock} finish={finish} />;
  return <WdModal ref={dialog} layout={layout} instance="repair-order-form-frame" testId="WIN_Ordens_Reparacao_Form" restoreTestId="repair-order-form-restore"
    onClose={() => { dialog.current?.close(); finish(false); }}>
    <output data-testid="repair-order-form-read-state" hidden>initialising</output>
    {diagnostic && <output className="repair-order-form-diagnostic" data-testid="repair-order-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}

function RepairOrderEditor({ repositories, target, initial, clock, finish }: {
  repositories: RepairOrderFormRepositories; target: RepairFormTarget; initial: Loaded; clock: ReturnType<typeof workstationClock>; finish: (saved: boolean) => void;
}) {
  const dialog = useRef<WdModalHandle>(null), alive = useRef(true), lifetime = useRef(0), queue = useRef(Promise.resolve()), actionPending = useRef(false), exitCount = useRef(0);
  const [values] = useState(() => startingValues(initial, clock)), raw = useRef(values), edited = useRef(new Set<TextName>());
  const [rawValues, setRawValues] = useState(values);
  const writeRaw = (next: RepairOrderWrite18) => { raw.current = next; setRawValues(next); };
  const [mechanics, setMechanics] = useState(initial.mechanics), [receptionists, setReceptionists] = useState(initial.receptionists);
  const [meta, setMeta] = useState(() => sourceMeta(initial, values)), metaRef = useRef(meta), cachedState = useRef<RepairFormRaw>("");
  const [dates, setDates] = useState<Dates>(() => ({ recepcao_datahora: dateTimeEntryInitial(values.recepcao_datahora), recepcao_entrega_prevista: dateEntryInitial(values.recepcao_entrega_prevista), data_pagamento: dateEntryInitial(values.data_pagamento) }));
  const datesRef = useRef(dates), dateInputs = useRef<Partial<Record<DateName, WdDateEditHandle | null>>>({});
  const [child, setChild] = useState<Child | null>(null), childRef = useRef<Child | null>(null);
  const [busy, setBusy] = useState(false), [resolving, setResolving] = useState(false), [initialising, setInitialising] = useState(true), [diagnostic, setDiagnostic] = useState("");
  const [display, setDisplay] = useState({ customer: "", model: "", third: "" }), [invoiceVisible, setInvoiceVisible] = useState(true);
  const [faturado, setFaturado] = useState(values.faturado), [invalidDate, setInvalidDate] = useState<DateName | null>(null);
  const { message, resource } = useDialogs();
  const { register, getValues, setValue } = useForm<FormText>({ defaultValues: {
    matricula: values.matricula ?? "", km_viatura: values.km_viatura ?? "", recepacao_contatos: values.recepacao_contatos ?? "",
    recepcao_servico: values.recepcao_servico ?? "", recepcao_obs: values.recepcao_obs ?? "", numero_fatura: values.numero_fatura ?? "", total_pago: decimalMaskDisplay(totalMask, values.total_pago),
  } });
  useEffect(() => {
    alive.current = true;
    const owner = lifetime.current;
    return () => { alive.current = false; lifetime.current = owner + 1; };
  }, []);
  const diagnosticOf = (kind: string) => { if (alive.current) setDiagnostic(kind); };
  const updateMeta = (next: RepairFormMeta) => { metaRef.current = next; setMeta(next); };
  const writeText = (name: TextName, value: RepairFormRaw) => {
    writeRaw({ ...raw.current, [name]: value }); edited.current.delete(name);
    setValue(name, name === "total_pago" ? decimalMaskDisplay(totalMask, value) : value ?? "");
  };
  const writeDate = (name: DateName, value: RepairFormRaw) => {
    writeRaw({ ...raw.current, [name]: value });
    const next = { ...datesRef.current, [name]: name === "recepcao_datahora" ? dateTimeEntryInitial(value) : dateEntryInitial(value) };
    datesRef.current = next; setDates(next); setInvalidDate(null);
  };
  const showChild = (next: Child) => { childRef.current = next; setChild(next); };
  const finishChild = <T,>(value: T, continuation: (value: T) => void) => {
    childRef.current = null; setChild(null); if (alive.current) continuation(value);
  };
  const close = (saved = false) => {
    if (actionPending.current || childRef.current) return;
    alive.current = false; dialog.current?.close(); finish(saved);
  };
  const info = async (text: string) => { if (alive.current) await message({ title, text, type: 0 }); };
  const yesNo = async (text: string) => alive.current && await message({ title, text, type: 2, defaultButton: 2 }) === 6;
  const createVehicle = async (registration: string) => {
    writeText("matricula", registration);
    await new Promise<boolean>(resolve => showChild({ kind: "vehicleEditor", registration, finish: resolve }));
  };
  const offerVehicle = async (): Promise<boolean> => {
    const answer = await resource({ title, text: "Matrícula não existente, criar agora?", buttons: [{ label: "Sim", value: 1 }, { label: "Não", value: 2 }], defaultIndex: 2, cancelIndex: 2, safeIndex: 2 });
    if (!alive.current || answer.result !== 1) return false;
    await createVehicle((getValues("matricula") ?? "").toLocaleUpperCase("pt-PT"));
    return alive.current;
  };
  const resolveVehicle = async (event: "plate" | "model" | "picker"): Promise<void> => {
    if (getValues("matricula") === "") return;
    let result = await repositories.form.resolveVehicle({ registration: getValues("matricula") });
    if (!alive.current) return;
    if (result.kind === "missing") {
      if (!await offerVehicle()) return;
      result = await repositories.form.resolveVehicle({ registration: getValues("matricula") });
      if (!alive.current) return;
      if (result.kind === "missing") { await info("Criação de matrícula cancelada"); return; }
    }
    if (result.kind !== "loaded") { diagnosticOf(result.kind); return; }
    writeRaw({ ...raw.current, recepcao_cliente: result.vehicle.Cliente });
    const { customer, vehicle } = result;
    if (event !== "model") setDisplay(prior => ({ ...prior, model: vehicle.marca === null || vehicle.modelo === null ? "" : `${vehicle.marca} ${vehicle.modelo}` }));
    if (customer) {
      setDisplay(prior => ({ ...prior, customer: customer.Descricao ?? "" }));
      writeText("recepacao_contatos", repairFormContactText(customer.Telefone1, customer.Telemovel));
    } else if (event === "picker") {
      setDisplay(prior => ({ ...prior, customer: "" })); writeText("recepacao_contatos", "");
    }
    writeText("matricula", getValues("matricula").toLocaleUpperCase("pt-PT"));
  };
  const enqueue = (kind: "exit" | "action", task: () => Promise<void>) => {
    if (!alive.current || (kind === "action" && actionPending.current)) return;
    if (kind === "action") { actionPending.current = true; setBusy(true); }
    else { exitCount.current++; setResolving(true); }
    const owner = lifetime.current;
    queue.current = queue.current.then(async () => { if (alive.current && owner === lifetime.current) { setDiagnostic(""); await task(); } })
      .catch(() => diagnosticOf("transport"))
      .finally(() => {
        if (kind === "action") { actionPending.current = false; if (alive.current) setBusy(false); }
        else { exitCount.current--; if (alive.current) setResolving(exitCount.current > 0); }
      });
  };
  useEffect(() => {
    alive.current = true;
    // Source1439 executes the actual Exit even when the registration text was not edited.
    enqueue("exit", async () => {
      if (initial.order) {
        await resolveVehicle("plate");
        if (!alive.current) return;
        writeText("recepacao_contatos", initial.order.recepacao_contatos);
        const customer = await repositories.form.lookupCustomer({ code: initial.order.recepcao_terceiro });
        if (!alive.current) return;
        if (customer.kind === "loaded") setDisplay(prior => ({ ...prior, third: customer.customer.Descricao ?? "" }));
        else if (customer.kind !== "missing") diagnosticOf(customer.kind);
      }
      if (alive.current) setInitialising(false);
    });
    // The initialization event belongs to this mounted form instance, not rerenders of its draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentValues = (): RepairOrderWrite18 | null => {
    const text = getValues(), next = { ...raw.current };
    for (const field of edited.current) {
      const value = text[field];
      next[field] = field === "total_pago" ? decimalMaskValue(totalMask, value) ?? value
        : field === "recepacao_contatos" || field === "recepcao_servico" || field === "recepcao_obs" ? windowsMemo(value) : value;
    }
    for (const name of ["recepcao_datahora", "recepcao_entrega_prevista", "data_pagamento"] as const) {
      const result = name === "recepcao_datahora" ? dateTimeEntryResult(datesRef.current[name]) : dateEntryResult(datesRef.current[name]);
      const input = dateInputs.current[name];
      if (result.kind !== "valid" || input?.isCalendarValid() === false) {
        setInvalidDate(name); if (input?.isCalendarValid() === false) input.validateCalendar(); else input?.focus(); return null;
      }
      next[name] = result.value;
    }
    return next;
  };
  const applyResolved = (resolved: RepairFormResolved) => {
    writeText("matricula", resolved.registration);
    if (resolved.customer) {
      const description = resolved.customer.Descricao;
      setDisplay(prior => ({ ...prior, customer: description ?? "" }));
    }
  };
  const save = async () => {
    const current = currentValues(); if (!current) return;
    let input: RepairFormPrepareInput = { target, values: current, formMeta: metaRef.current, workstationDay: workstationClock().day };
    let result = await repositories.form.prepareSave(input);
    if (!alive.current) return;
    // Each source prerequisite may suspend once; a stale/refused continuation requires fresh Gravar.
    if (result.kind === "needs-confirmation") {
      if (!await yesNo("Data de entrada diferente da data do computador.\r\nDeseja continuar?")) return;
      input = { ...input, differentDayConsent: result.consent };
      result = await repositories.form.prepareSave(input); if (!alive.current) return;
    }
    if (result.kind === "needs-vehicle") {
      if (!await offerVehicle()) return;
      input = { ...input, values: { ...input.values, matricula: getValues("matricula") } };
      result = await repositories.form.prepareSave(input); if (!alive.current) return;
      if (result.kind === "needs-vehicle") { await info("Criação de matrícula cancelada"); return; }
    }
    if ("resolved" in result) applyResolved(result.resolved);
    if (result.kind !== "ready" && result.kind !== "needs-dates") {
      if ("message" in result) await info(result.message); else diagnosticOf(result.kind); return;
    }
    // Source975–1011 only changes display/uppercase here; captured client, contacts and model survive.
    applyResolved({ registration: result.prepared.registration, customer: result.customer });
    const answers: RepairDateAnswer[] = [];
    if (result.kind === "needs-dates") {
      for (const request of result.requests) {
        const value = await new Promise<RepairFormRaw>(resolve => showChild({ kind: "date", title: request.title, value: request.original, finish: resolve }));
        if (!alive.current) return;
        answers.push({ field: request.field, value });
        writeDate(request.field === "delivery" ? "recepcao_entrega_prevista" : "data_pagamento", value);
      }
    }
    // Keep prepared.input pre-Date values even when a later prompt deliberately returns blank/zero.
    let command: RepairFormSaveInput = { prepared: result.prepared, dateAnswers: answers };
    let saved = await repositories.form.save(command); if (!alive.current) return;
    if (saved.kind === "needs-confirmation") {
      if (!await yesNo("Mecânico está inativo quer continuar?")) return;
      command = { ...command, inactiveMechanicConsent: saved.consent };
      saved = await repositories.form.save(command); if (!alive.current) return;
    }
    if ("resolved" in saved) applyResolved(saved.resolved);
    if (saved.kind === "saved") { actionPending.current = false; close(true); }
    else if ("message" in saved) await info(saved.message);
    else diagnosticOf(saved.kind);
  };
  const vehiclePicker = async () => {
    if (target.mode === "update") {
      const check = await repositories.form.checkVehicleChange({ numero: raw.current.numero });
      if (!alive.current) return;
      if (check.kind === "needs-confirmation") { if (!await yesNo(check.messages.join("\r\n"))) return; }
      else if (check.kind !== "ready") { diagnosticOf(check.kind); return; }
    }
    const registration = await new Promise<string>(resolve => showChild({ kind: "vehicle", origin: getValues("matricula"), finish: resolve }));
    if (!alive.current) return;
    writeText("matricula", registration); await resolveVehicle("picker");
  };
  const restoreState = () => {
    const index = initial.states.findIndex(row => row.Codigo === cachedState.current);
    writeRaw({ ...raw.current, reparacao_estado: cachedState.current });
    updateMeta({ ...metaRef.current, state: { index: index < 0 ? -1 : index + 1, value: index < 0 ? "" : String(index + 1), storedValue: cachedState.current } });
  };
  const stateChange = async (hiddenVision = false) => {
    const check = await repositories.form.checkStateChange({ numero: raw.current.numero, stateCode: raw.current.reparacao_estado });
    if (!alive.current) return;
    if (check.kind === "working") { if (!hiddenVision) restoreState(); await info(check.message); }
    else if (check.kind === "needs-confirmation") {
      const confirmed = hiddenVision ? await yesNo(`Mudar estado de reparação para '${check.description ?? ""}'?`)
        : await new Promise<0 | 1>(resolve => showChild({ kind: "state", description: check.description, finish: resolve })) === 1;
      if (alive.current && !confirmed) restoreState();
    } else if (check.kind !== "ready") diagnosticOf(check.kind);
  };
  const bytePicker = async (kind: "mechanic" | "user") => {
    const name = kind === "mechanic" ? "reparacao_mecanico" : "recepcao_util";
    const value = await new Promise<number | string>(resolve => showChild({ kind, origin: raw.current[name] ?? "", finish: resolve }));
    if (!alive.current) return;
    const code = typeof value === "number" ? value : value === "" ? null : Number(value);
    if (code !== null && (!Number.isInteger(code) || code < 0 || code > 255)) { diagnosticOf("invalid"); return; }
    writeRaw({ ...raw.current, [name]: code });
    let rows: readonly { Codigo: number | null }[] = kind === "mechanic" ? mechanics : receptionists;
    try {
      // ADR-003/U03: refresh the actual file-bound public options after the real picker closes.
      // This target adaptation allows a concurrently added chosen code without a fabricated option.
      if (kind === "mechanic") {
        const result = await repositories.mechanics.list({ sort: "Codigo", descending: false });
        if (!alive.current) return;
        if (result.kind === "loaded") { rows = result.mechanics; setMechanics(result.mechanics); }
        else diagnosticOf(result.kind);
      } else {
        const result = await repositories.users.list({ sort: "Codigo", descending: false });
        if (!alive.current) return;
        if (result.kind === "loaded") { rows = result.users; setReceptionists(result.users); }
        else diagnosticOf(result.kind);
      }
    } catch { if (!alive.current) return; diagnosticOf("transport"); }
    updateMeta({ ...metaRef.current, [kind === "mechanic" ? "mechanicEmpty" : "receptionistEmpty"]: !rows.some(row => row.Codigo === code) });
  };
  const thirdPicker = async () => {
    const code = await new Promise<string>(resolve => showChild({ kind: "customer", origin: raw.current.recepcao_terceiro ?? "", finish: resolve }));
    if (!alive.current) return;
    writeRaw({ ...raw.current, recepcao_terceiro: code });
    const result = await repositories.form.lookupCustomer({ code }); if (!alive.current) return;
    if (result.kind === "loaded") setDisplay(prior => ({ ...prior, third: result.customer.Descricao ?? "" }));
    else if (result.kind !== "missing") diagnosticOf(result.kind);
  };

  const disabled = initialising || busy || resolving, actionDisabled = initialising || busy;
  const plateInput = register("matricula"), kmInput = register("km_viatura"), contactsInput = register("recepacao_contatos"), serviceInput = register("recepcao_servico"), observationInput = register("recepcao_obs"), invoiceInput = register("numero_fatura"), totalInput = register("total_pago");
  const changeDate = (name: DateName, draft: DateEntryDraft | DateTimeEntryDraft) => {
    const next = { ...datesRef.current, [name]: draft }; datesRef.current = next; setDates(next); setInvalidDate(null);
  };
  const stateValue = meta.state.index < 1 ? "" : String(meta.state.index);
  const mechanicIndex = meta.mechanicEmpty ? -1 : mechanics.findIndex(row => row.Codigo === rawValues.reparacao_mecanico);
  const receptionistIndex = meta.receptionistEmpty ? -1 : receptionists.findIndex(row => row.Codigo === rawValues.recepcao_util);
  const bindings: WdRadBinding[] = [
    { name: "STC_Estado", kind: "caption" }, { name: "STC_Serviço_Avaria", kind: "caption" }, { name: "STC_Observação", kind: "caption" },
    { name: "EDT_Ordem_n", kind: "edit", props: { value: rawValues.numero, readOnly: true, integerMask: true, disabled } },
    { name: "EDT_data_hora_entrada", kind: "dateTime", props: { draft: dates.recepcao_datahora, disabled, invalid: invalidDate === "recepcao_datahora", ref: handle => { dateInputs.current.recepcao_datahora = handle; }, onChange: next => changeDate("recepcao_datahora", next) } },
    { name: "EDT_data_entrega", kind: "date", props: { draft: dates.recepcao_entrega_prevista, disabled, invalid: invalidDate === "recepcao_entrega_prevista", ref: handle => { dateInputs.current.recepcao_entrega_prevista = handle; }, onChange: next => changeDate("recepcao_entrega_prevista", next) } },
    { name: "EDT_KM", kind: "edit", props: { ...kmInput, disabled, onChange: event => { edited.current.add("km_viatura"); void kmInput.onChange(event); }, integerMask: true } },
    { name: "BTN_Gravar", kind: "button", props: { disabled: actionDisabled, onClick: () => enqueue("action", save) } },
    { name: "BTN_VISION1", kind: "button", props: { disabled: actionDisabled, onClick: () => enqueue("action", vehiclePicker) } },
    { name: "EDT_matricula", kind: "edit", props: { ...plateInput, disabled, onChange: event => { edited.current.add("matricula"); void plateInput.onChange(event); }, readOnly: target.mode === "update", onBlur: event => { void plateInput.onBlur(event); enqueue("exit", () => resolveVehicle("plate")); } } },
    { name: "EDT_Cliente", kind: "edit", props: { value: display.customer, readOnly: true, disabled } },
    { name: "BTN_Cancelar", kind: "button", props: { disabled: actionDisabled, onClick: () => enqueue("action", async () => { if (await yesNo("Cancelar ordem de reparação?")) { actionPending.current = false; close(); } }) } },
    { name: "EDT_Marca_Modelo", kind: "edit", props: { value: display.model, readOnly: true, disabled, onBlur: () => enqueue("exit", () => resolveVehicle("model")) } },
    { name: "EDT_Terceiro", kind: "edit", props: { value: rawValues.recepcao_terceiro ?? "", readOnly: true, disabled, integerMask: true } },
    { name: "BTN_VISION4", kind: "button", props: { disabled: actionDisabled, onClick: () => enqueue("action", thirdPicker) } },
    { name: "EDT_Terceiro_Descricao", kind: "edit", props: { value: display.third, readOnly: true, disabled } },
    { name: "EDT_Contactos", kind: "memo", props: { ...contactsInput, disabled, onChange: event => { edited.current.add("recepacao_contatos"); void contactsInput.onChange(event); } } },
    { name: "COMBO_estado", kind: "combo", props: { options: initial.states.map((row, index) => ({ value: String(index + 1), label: row.Descricao ?? "" })), value: stateValue, disabled, allowNoSelection: true,
      onOpenIntent: () => { cachedState.current = metaRef.current.state.storedValue; },
      onChange: value => { const index = Number(value) - 1, selected = initial.states[index]; if (!selected) return; writeRaw({ ...raw.current, reparacao_estado: selected.Codigo }); updateMeta({ ...metaRef.current, state: { index: index + 1, value, storedValue: selected.Codigo } }); enqueue("action", () => stateChange()); } } },
    { name: "BTN_VISION", kind: "button", props: { disabled: actionDisabled, onClick: () => enqueue("action", () => stateChange(true)) } },
    { name: "EDT_servico_avaria", kind: "memo", props: { ...serviceInput, disabled, onChange: event => { edited.current.add("recepcao_servico"); void serviceInput.onChange(event); } } },
    { name: "EDT_observacao", kind: "memo", props: { ...observationInput, disabled, onChange: event => { edited.current.add("recepcao_obs"); void observationInput.onChange(event); } } },
    { name: "COMBO_mecanico", kind: "combo", props: { options: mechanics.map((row, index) => ({ value: String(index + 1), label: row.Descricao ?? "" })), value: mechanicIndex < 0 ? "" : String(mechanicIndex + 1), disabled, allowNoSelection: true, onChange: value => { const row = mechanics[Number(value) - 1]; if (row) { writeRaw({ ...raw.current, reparacao_mecanico: row.Codigo }); updateMeta({ ...metaRef.current, mechanicEmpty: false }); } } } },
    { name: "COMBO_Recepcionado", kind: "combo", props: { options: receptionists.map((row, index) => ({ value: String(index + 1), label: row.Descricao ?? "" })), value: receptionistIndex < 0 ? "" : String(receptionistIndex + 1), disabled, allowNoSelection: true, onChange: value => { const row = receptionists[Number(value) - 1]; if (row) { writeRaw({ ...raw.current, recepcao_util: row.Codigo }); updateMeta({ ...metaRef.current, receptionistEmpty: false }); } } } },
    { name: "BTN_VISION2", kind: "button", props: { disabled: actionDisabled, onClick: () => enqueue("action", () => bytePicker("mechanic")) } },
    { name: "BTN_VISION3", kind: "button", props: { disabled: actionDisabled, onClick: () => enqueue("action", () => bytePicker("user")) } },
    { name: "COMBO_Prioridade", kind: "combo", props: { options: ["Normal", "Elevada", "Urgente"].map((label, index) => ({ value: String(index + 1), label })), value: String(rawValues.recepcao_prioridade ?? ""), allowNoSelection: true, disabled, onChange: value => { writeRaw({ ...raw.current, recepcao_prioridade: Number(value) }); updateMeta({ ...metaRef.current }); } } },
    { name: "BTN_informacao", kind: "button", props: { disabled: true, title: "MIG-10" } },
    { name: "CBOX_faturado", kind: "checkbox", props: { checked: faturado, disabled, onChange: value => { writeRaw({ ...raw.current, faturado: value }); setFaturado(value); setInvoiceVisible(value); } } },
    { name: "EDT_Nr_Fatura", kind: "edit", props: { ...invoiceInput, disabled, onChange: event => { edited.current.add("numero_fatura"); void invoiceInput.onChange(event); }, hidden: !invoiceVisible } },
    { name: "EDT_Total_Pago", kind: "edit", props: { ...totalInput, disabled, onChange: event => { edited.current.add("total_pago"); void totalInput.onChange(event); }, decimalMask: true } },
    { name: "EDT_Data_pagamento", kind: "date", props: { draft: dates.data_pagamento, disabled, invalid: invalidDate === "data_pagamento", ref: handle => { dateInputs.current.data_pagamento = handle; }, onChange: next => changeDate("data_pagamento", next) } },
  ];
  return <WdModal ref={dialog} layout={layout} instance="repair-order-form-frame" testId="WIN_Ordens_Reparacao_Form" restoreTestId="repair-order-form-restore" onClose={() => close()}>
    <output data-testid="repair-order-form-read-state" hidden>{initialising ? "initialising" : "ready"}</output>
    <WdRadControls layout={layout} bindings={bindings} />
    {child?.kind === "vehicle" && <VehiclePicker repositories={repositories} origin={child.origin} finish={value => finishChild(value, child.finish)} />}
    {child?.kind === "vehicleEditor" && <VehicleEditor repositories={repositories} initialRegistration={child.registration} finish={value => finishChild(value, child.finish)} />}
    {child?.kind === "customer" && <CustomerPicker repository={repositories.customers} origin={child.origin} finish={value => finishChild(value, child.finish)} />}
    {child?.kind === "mechanic" && <MechanicPicker repository={repositories.mechanics} origin={child.origin} finish={value => finishChild(value, child.finish)} />}
    {child?.kind === "user" && <UserPicker repository={repositories.users} origin={child.origin} finish={value => finishChild(value, child.finish)} />}
    {child?.kind === "date" && <DatePromptDialog title={child.title} value={child.value} finish={value => finishChild(value, child.finish)} />}
    {child?.kind === "state" && <RepairStateConfirmationDialog state={child.description} finish={value => finishChild(value, child.finish)} />}
    {diagnostic && <output className="repair-order-form-diagnostic" data-testid="repair-order-form-diagnostic">{diagnostic}</output>}
  </WdModal>;
}
