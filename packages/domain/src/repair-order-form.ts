import { z } from "zod";
import { dateCalendarValue } from "./date-entry";
import { dateTimeComparisonKey, isDateTimeBound } from "./date-time";

export type RepairFormRaw = string | null;
export type RepairFormByte = number | null;
export type RepairFormTarget = { mode: "create" } | { mode: "update"; originalNumero: string };

// SRC-55e462b0d2: exactly eighteen assigned parameters; unassigned fields never enter this command.
export type RepairOrderWrite18 = {
  numero: string; matricula: RepairFormRaw; km_viatura: RepairFormRaw; recepcao_util: RepairFormByte;
  recepcao_datahora: RepairFormRaw; recepcao_cliente: RepairFormRaw; recepcao_terceiro: RepairFormRaw;
  recepacao_contatos: RepairFormRaw; recepcao_servico: RepairFormRaw; recepcao_obs: RepairFormRaw;
  recepcao_entrega_prevista: RepairFormRaw; recepcao_prioridade: RepairFormByte; reparacao_mecanico: RepairFormByte;
  reparacao_estado: RepairFormRaw; faturado: boolean | null; total_pago: RepairFormRaw;
  numero_fatura: RepairFormRaw; data_pagamento: RepairFormRaw;
};
export type RepairOrderRecord28 = Omit<RepairOrderWrite18, "numero"> & {
  id: string; numero: RepairFormRaw; ordem_reparacaoID: RepairFormRaw; Estados_reparacaoID: RepairFormRaw;
  reparacao_estado_obs: RepairFormRaw; reparacao_servico: RepairFormRaw; reparacao_estado_data: RepairFormRaw;
  reparacao_estado_historico: RepairFormRaw; totaL_mao_obra: RepairFormRaw; total_pecas: RepairFormRaw;
  total_desconto: RepairFormRaw; total_reparacao: RepairFormRaw;
};
export type RepairFormMeta = {
  state: { index: number; value: string; storedValue: RepairFormRaw };
  mechanicEmpty: boolean; receptionistEmpty: boolean;
};
export type RepairFormStateOption = {
  id: string; Codigo: RepairFormRaw; Descricao: RepairFormRaw; tipo: RepairFormByte;
  confirmacao: boolean | null; pedir_data_entrega: boolean | null; pedir_data_pag: boolean | null;
};
export type RepairFormMechanicOption = { id: string; Codigo: RepairFormByte; Descricao: RepairFormRaw; inativo: boolean | null };
export type RepairFormReceptionistOption = { id: string; Codigo: RepairFormByte; Descricao: RepairFormRaw };
export type RepairFormInitialiseResult = {
  kind: "loaded"; order: RepairOrderRecord28 | null; nextNumero: string | null;
  states: RepairFormStateOption[]; mechanics: RepairFormMechanicOption[]; receptionists: RepairFormReceptionistOption[];
} | { kind: "invalid" | "missing" | "exhausted" | "failed" };
export type RepairFormVehicle = { id: string; matricula: RepairFormRaw; Cliente: RepairFormRaw; marca: RepairFormRaw; modelo: RepairFormRaw };
export type RepairFormCustomer = { Codigo: RepairFormRaw; Descricao: RepairFormRaw; Telefone1: RepairFormRaw; Telemovel: RepairFormRaw };
export type RepairFormVehicleResult = { kind: "loaded"; vehicle: RepairFormVehicle; customer: RepairFormCustomer | null } | { kind: "missing" | "invalid" | "failed" };
export type RepairFormCustomerResult = { kind: "loaded"; customer: RepairFormCustomer } | { kind: "missing" | "invalid" | "failed" };
export type RepairVehicleChangeResult = { kind: "ready" } | { kind: "needs-confirmation"; reason: "movements"; messages: [string, string] } | { kind: "invalid" | "failed" };
export type RepairStateChangeInput = { numero: string; stateCode: RepairFormRaw };
export type RepairStateChangeResult = { kind: "ready" } | { kind: "working"; message: string } | { kind: "needs-confirmation"; description: RepairFormRaw } | { kind: "invalid" | "failed" };

export type DifferentDayConsent = { entryValue: RepairFormRaw; workstationDay: string };
export type RepairFormPrepareInput = {
  target: RepairFormTarget; values: RepairOrderWrite18; formMeta: RepairFormMeta;
  workstationDay: string; differentDayConsent?: DifferentDayConsent;
};
export type RepairFormContext = {
  lookupRegistration: string; vehicleId: string; stateId: string | null;
  deliveryRequested: boolean; paymentRequested: boolean;
};
export type RepairFormPrepared = { input: RepairFormPrepareInput; context: RepairFormContext; registration: string };
export type RepairDateRequest = { field: "delivery" | "payment"; title: "Data de entrega" | "Data de pagamento"; original: RepairFormRaw };
export type RepairDateAnswer = { field: "delivery" | "payment"; value: RepairFormRaw };
export type RepairFormRequiredField = "entry" | "delivery" | "km" | "stateEmpty" | "receptionist" | "stateUnselected";
export type RepairFormResolved = { registration: string; customer: { Descricao: RepairFormRaw } | null };
export type RepairFormInfo = { kind: "required"; field: RepairFormRequiredField; message: string }
  | { kind: "activeOrder"; message: string; resolved: RepairFormResolved }
  | { kind: "mechanicRequired"; message: string; resolved: RepairFormResolved } | { kind: "inactiveMechanic"; message: string };
export type RepairFormPrepareResult = RepairFormInfo
  | { kind: "needs-confirmation"; reason: "different-entry-day"; consent: DifferentDayConsent }
  | { kind: "needs-vehicle"; registration: RepairFormRaw }
  | { kind: "needs-dates"; prepared: RepairFormPrepared; requests: RepairDateRequest[]; customer: { Descricao: RepairFormRaw } | null }
  | { kind: "ready"; prepared: RepairFormPrepared; customer: { Descricao: RepairFormRaw } | null }
  | { kind: "invalid" | "missing" | "failed" };
export type InactiveMechanicConsent = { id: string; code: number };
export type RepairFormSaveInput = { prepared: RepairFormPrepared; dateAnswers: RepairDateAnswer[]; inactiveMechanicConsent?: InactiveMechanicConsent };
export type RepairFormSaveResult = RepairFormInfo
  | { kind: "needs-confirmation"; reason: "inactive-mechanic"; consent: InactiveMechanicConsent }
  | { kind: "saved"; orders: RepairOrderRecord28[] }
  | { kind: "invalid" | "missing" | "duplicate" | "exhausted" | "stale" | "failed" };
export type RepairDeleteResult = { kind: "deleted" | "invalid" | "missing" | "failed" };

export const repairFormMessages = {
  entry: "Indique a data de entrada", delivery: "Indique a data de entrega", km: "Indique os km da viatura",
  stateEmpty: "Indique o estado", receptionist: "Indique o recepcionista", stateUnselected: "Indique o estado de reparação",
  activeOrder: "Viatura já em reparação", mechanicRequired: "Este estado de reparação requer um mecânico",
  inactiveMechanic: "Mecânico inativo", working: "Ordem de reparação tem mecânico a trabalhar na viatura",
} as const;

const raw = z.string().nullable(), byte = z.number().int().min(0).max(255).nullable();
const isUnsigned64 = (value: string) => /^(?:0|[1-9][0-9]{0,19})/.exec(value)?.[0] === value && BigInt(value) <= 18446744073709551615n;
const unsigned64 = z.string().refine(isUnsigned64);
const identity = z.string().refine(value => /^(?:[1-9][0-9]{0,18})/.exec(value)?.[0] === value && BigInt(value) <= 9223372036854775807n);
const day = z.string().refine(value => dateCalendarValue(value) !== "");
const target = z.discriminatedUnion("mode", [z.strictObject({ mode: z.literal("create") }), z.strictObject({ mode: z.literal("update"), originalNumero: unsigned64 })]);
export const repairFormWriteSchema = z.strictObject({
  numero: unsigned64, matricula: raw, km_viatura: raw, recepcao_util: byte, recepcao_datahora: raw,
  recepcao_cliente: raw, recepcao_terceiro: raw, recepacao_contatos: raw, recepcao_servico: raw,
  recepcao_obs: raw, recepcao_entrega_prevista: raw, recepcao_prioridade: byte, reparacao_mecanico: byte,
  reparacao_estado: raw, faturado: z.boolean().nullable(), total_pago: raw, numero_fatura: raw, data_pagamento: raw,
});
const meta = z.strictObject({ state: z.strictObject({ index: z.number().int().min(-1), value: z.string(), storedValue: raw }), mechanicEmpty: z.boolean(), receptionistEmpty: z.boolean() });
const differentDayConsent = z.strictObject({ entryValue: raw, workstationDay: day });
export const repairFormPrepareSchema = z.strictObject({ target, values: repairFormWriteSchema, formMeta: meta, workstationDay: day, differentDayConsent: differentDayConsent.optional() })
  .refine(input => input.values.reparacao_estado === input.formMeta.state.storedValue
    && (input.target.mode === "create" || input.values.numero === input.target.originalNumero));
const context = z.strictObject({ lookupRegistration: z.string(), vehicleId: identity, stateId: identity.nullable(), deliveryRequested: z.boolean(), paymentRequested: z.boolean() });
export const repairFormSaveSchema = z.strictObject({
  prepared: z.strictObject({ input: repairFormPrepareSchema, context, registration: z.string() })
    .refine(prepared => prepared.context.lookupRegistration === (prepared.input.values.matricula ?? "")
      && prepared.registration === (prepared.input.values.matricula ?? "").toLocaleUpperCase("pt-PT")),
  dateAnswers: z.array(z.strictObject({ field: z.enum(["delivery", "payment"]), value: raw })),
  inactiveMechanicConsent: z.strictObject({ id: identity, code: z.number().int().min(0).max(255) }).optional(),
});
export const repairFormInitialiseSchema = z.strictObject({ target });
export const repairFormVehicleSchema = z.strictObject({ registration: raw });
export const repairFormCustomerLookupSchema = z.strictObject({ code: raw.refine(value => value === null || value === "" || isUnsigned64(value)) });
export const repairFormNumberSchema = z.strictObject({ numero: unsigned64 });
export const repairFormStateChangeSchema = z.strictObject({ numero: unsigned64, stateCode: raw });

/** SRC-55e462b0d2 / ADR-002/006: required checks precede all read/confirmation/date-prompt work. */
export function repairFormRequiredInfo(input: Pick<RepairFormPrepareInput, "values" | "formMeta">): Extract<RepairFormInfo, { kind: "required" }> | null {
  const { values, formMeta } = input;
  const zeroOrBlank = (value: RepairFormRaw) => value === null || value === "" || /^0+$/.test(value);
  const field: RepairFormRequiredField | null = zeroOrBlank(values.recepcao_datahora) ? "entry"
    : zeroOrBlank(values.recepcao_entrega_prevista) ? "delivery" : zeroOrBlank(values.km_viatura) ? "km"
      : formMeta.state.value === "" ? "stateEmpty" : formMeta.receptionistEmpty ? "receptionist"
        : formMeta.state.index === -1 ? "stateUnselected" : null;
  return field ? { kind: "required", field, message: repairFormMessages[field] } : null;
}

/** SRC-b2e6eeadd9 / ADR-002/006: the UI injects the local Return14 timestamp once. */
export function repairFormInitialValues(numero: string, localCompact14: string): RepairOrderWrite18 | null {
  if (!isUnsigned64(numero) || localCompact14.length !== 14 || !isDateTimeBound(localCompact14) || localCompact14 === "0".repeat(14)) return null;
  return { numero, matricula: "", km_viatura: "0", recepcao_util: 0, recepcao_datahora: localCompact14,
    recepcao_cliente: "0", recepcao_terceiro: "0", recepacao_contatos: "", recepcao_servico: "", recepcao_obs: "",
    recepcao_entrega_prevista: localCompact14.slice(0, 8), recepcao_prioridade: 1, reparacao_mecanico: 0,
    reparacao_estado: "", faturado: false, total_pago: "0", numero_fatura: "", data_pagamento: "" };
}

/** SRC-f349dfb841 / ADR-006 U05: ASCII spaces affect emptiness only; original phones remain exact. */
export function repairFormContactText(phone: RepairFormRaw, mobile: RepairFormRaw): string {
  const present = (value: RepairFormRaw) => value !== null && value.replaceAll(" ", "") !== "";
  return present(phone) ? present(mobile) ? `${phone}\r\n${mobile}` : phone! : present(mobile) ? mobile! : "";
}

export function repairFormNeedsDifferentDay(input: RepairFormPrepareInput): boolean {
  if (input.target.mode !== "create") return false;
  const entry = input.values.recepcao_datahora;
  const matchesDay = entry !== null && isDateTimeBound(entry) && dateTimeComparisonKey(entry)?.slice(0, 8) === input.workstationDay;
  return !matchesDay && !(input.differentDayConsent?.entryValue === entry && input.differentDayConsent.workstationDay === input.workstationDay);
}

/** Source1033-1038 order is delivery before payment. */
export function repairFormDateRequests(prepared: RepairFormPrepared): RepairDateRequest[] {
  const requests: RepairDateRequest[] = [];
  if (prepared.context.deliveryRequested) requests.push({ field: "delivery", title: "Data de entrega", original: prepared.input.values.recepcao_entrega_prevista });
  if (prepared.context.paymentRequested) requests.push({ field: "payment", title: "Data de pagamento", original: prepared.input.values.data_pagamento });
  return requests;
}

/** ADR-006: client context is not proof; server separately repeats current checks before applying answers. */
export function repairFormApplyDateAnswers(prepared: RepairFormPrepared, answers: readonly RepairDateAnswer[]): { kind: "valid"; values: RepairOrderWrite18 } | { kind: "invalid" } {
  const requests = repairFormDateRequests(prepared);
  if (answers.length !== requests.length) return { kind: "invalid" };
  const values = { ...prepared.input.values, matricula: prepared.registration };
  for (let index = 0; index < requests.length; index += 1) {
    const request = requests[index], answer = answers[index];
    if (answer.field !== request.field || (answer.value !== request.original && answer.value !== "" && answer.value !== "00000000"
      && (answer.value === null || dateCalendarValue(answer.value) === ""))) return { kind: "invalid" };
    if (answer.field === "delivery") values.recepcao_entrega_prevista = answer.value;
    else values.data_pagamento = answer.value;
  }
  return { kind: "valid", values };
}

/** Shape and source checks remain separate so native-invalid drafts cannot replace an earlier source Info. */
export function repairFormNumericValuesValid(values: RepairOrderWrite18): boolean {
  const identifier = (value: RepairFormRaw) => value === null || isUnsigned64(value);
  const decimal = values.total_pago;
  return identifier(values.km_viatura) && identifier(values.recepcao_cliente) && identifier(values.recepcao_terceiro)
    && (decimal === null || /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)/.exec(decimal)?.[0] === decimal);
}
