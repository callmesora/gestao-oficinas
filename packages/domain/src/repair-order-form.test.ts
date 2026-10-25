import { expect, it } from "vitest";
import { repairFormInitialValues, repairFormRequiredInfo, repairFormNeedsDifferentDay, repairFormContactText,
  repairFormDateRequests, repairFormApplyDateAnswers, repairFormNumericValuesValid, repairFormPrepareSchema,
  repairFormSaveSchema, repairFormNumberSchema, type RepairFormPrepareInput, type RepairFormPrepared } from "./repair-order-form";

function input(): RepairFormPrepareInput {
  return { target: { mode: "create" }, values: { ...repairFormInitialValues("9007199254740993", "20240229123456")!,
    matricula: "a'1", km_viatura: "1", reparacao_estado: "P", reparacao_mecanico: 2, recepcao_util: 1 },
  formMeta: { state: { index: 1, value: "1", storedValue: "P" }, mechanicEmpty: false, receptionistEmpty: false }, workstationDay: "20240229" };
}
function prepared(): RepairFormPrepared {
  return { input: input(), registration: "A'1", context: { lookupRegistration: "a'1", vehicleId: "1", stateId: "2", deliveryRequested: true, paymentRequested: true } };
}

it("SRC-b2e6eeadd9 creates local injected clock defaults without rounding the unreserved number", () => {
  const values = repairFormInitialValues("18446744073709551615", "20240229235959")!;
  expect(values).toEqual({ numero: "18446744073709551615", matricula: "", km_viatura: "0", recepcao_util: 0,
    recepcao_datahora: "20240229235959", recepcao_cliente: "0", recepcao_terceiro: "0", recepacao_contatos: "",
    recepcao_servico: "", recepcao_obs: "", recepcao_entrega_prevista: "20240229", recepcao_prioridade: 1,
    reparacao_mecanico: 0, reparacao_estado: "", faturado: false, total_pago: "0", numero_fatura: "", data_pagamento: "" });
  for (const [number, clock] of [["18446744073709551616", "20240229123456"], ["1\n", "20240229123456"], ["1", "20230229123456"], ["1", "20240229123456000"], ["1", "00000000000000"]]) expect(repairFormInitialValues(number, clock)).toBeNull();
});

it("SRC-55e462b0d2 preserves the six required checks before confirmation and Date prompts", () => {
  const command = input(); command.values.recepcao_datahora = null; command.values.recepcao_entrega_prevista = ""; command.values.km_viatura = "0";
  command.formMeta = { state: { index: -1, value: "", storedValue: "P" }, receptionistEmpty: true, mechanicEmpty: true };
  expect(repairFormRequiredInfo(command)?.field).toBe("entry"); command.values.recepcao_datahora = "20240229123456";
  expect(repairFormRequiredInfo(command)?.field).toBe("delivery"); command.values.recepcao_entrega_prevista = "20240301";
  expect(repairFormRequiredInfo(command)?.field).toBe("km"); command.values.km_viatura = "1";
  expect(repairFormRequiredInfo(command)?.field).toBe("stateEmpty"); command.formMeta.state.value = "-1";
  expect(repairFormRequiredInfo(command)?.field).toBe("receptionist"); command.formMeta.receptionistEmpty = false;
  expect(repairFormRequiredInfo(command)?.field).toBe("stateUnselected"); command.formMeta.state.index = 0;
  expect(repairFormRequiredInfo(command)).toBeNull();
  for (const km of [null, "", "0", "00000"]) expect(repairFormRequiredInfo({ ...command, values: { ...command.values, km_viatura: km } })?.field).toBe("km");
});

it("ADR-006 retains selected code0 and NULL keys independently from source control emptiness/index", () => {
  const command = input(); command.values.reparacao_estado = null; command.values.recepcao_util = 0; command.values.reparacao_mecanico = 0;
  command.formMeta = { state: { index: 0, value: "1", storedValue: null }, receptionistEmpty: false, mechanicEmpty: false };
  expect(repairFormPrepareSchema.safeParse(command).success).toBe(true); expect(repairFormRequiredInfo(command)).toBeNull();
  expect(repairFormPrepareSchema.safeParse({ ...command, formMeta: { ...command.formMeta, state: { ...command.formMeta.state, storedValue: "other" } } }).success).toBe(false);
});

it("SRC-f349dfb841 / U05 checks ASCII-space emptiness while retaining phone text and CRLF", () => {
  expect(repairFormContactText(" 123  ", "  456 ")).toBe(" 123  \r\n  456 ");
  expect(repairFormContactText("   ", "456 ")).toBe("456 "); expect(repairFormContactText(null, " ")).toBe("");
  expect(repairFormContactText("\t", null)).toBe("\t"); expect(repairFormContactText(null, "\u00a0")).toBe("\u00a0");
});

it("SRC-55e462b0d2 binds different-day consent to the exact preprompt entry and workstation day", () => {
  const command = input(); expect(repairFormNeedsDifferentDay(command)).toBe(false);
  command.values.recepcao_datahora = "20240228123456001"; expect(repairFormNeedsDifferentDay(command)).toBe(true);
  command.differentDayConsent = { entryValue: command.values.recepcao_datahora, workstationDay: "20240229" };
  expect(repairFormNeedsDifferentDay(command)).toBe(false);
  command.values.recepcao_datahora = "20240228123456002"; expect(repairFormNeedsDifferentDay(command)).toBe(true);
  command.target = { mode: "update", originalNumero: command.values.numero }; expect(repairFormNeedsDifferentDay(command)).toBe(false);
});

it("SRC-55e462b0d2 requests delivery then payment and lets cancelled/raw or deliberate empty/zero answers continue", () => {
  const value = prepared(); value.input.values.data_pagamento = null;
  expect(repairFormDateRequests(value)).toEqual([{ field: "delivery", title: "Data de entrega", original: "20240229" }, { field: "payment", title: "Data de pagamento", original: null }]);
  const result = repairFormApplyDateAnswers(value, [{ field: "delivery", value: "" }, { field: "payment", value: null }]);
  expect(result).toEqual({ kind: "valid", values: { ...value.input.values, matricula: "A'1", recepcao_entrega_prevista: "" } });
  // The preprompt snapshot remains valid for the inactive-mechanic continuation, despite the accepted empty delivery.
  expect(repairFormRequiredInfo(value.input)).toBeNull(); expect(value.input.values.recepcao_entrega_prevista).toBe("20240229");
  expect(repairFormApplyDateAnswers(value, [{ field: "delivery", value: "00000000" }, { field: "payment", value: "20240301" }]).kind).toBe("valid");
});

it("ADR-006 rejects extra/reordered/changed opaque Date answers, preserving unchanged opaque and NULL originals", () => {
  const value = prepared(); value.input.values.recepcao_entrega_prevista = "opaque  "; value.input.values.data_pagamento = null;
  expect(repairFormApplyDateAnswers(value, [{ field: "delivery", value: "opaque  " }, { field: "payment", value: null }]).kind).toBe("valid");
  for (const answers of [[], [{ field: "payment", value: "" }, { field: "delivery", value: "" }], [{ field: "delivery", value: null }, { field: "payment", value: null }], [{ field: "delivery", value: "20240230" }, { field: "payment", value: null }], [{ field: "delivery", value: "opaque" }, { field: "payment", value: null }]] as const) expect(repairFormApplyDateAnswers(value, answers).kind).toBe("invalid");
});

it("ADR-006 binds prepared registration to the raw preprompt lookup and exact Upper expansion", () => {
  const value = prepared(); value.input.values.matricula = "ß".repeat(15); value.context.lookupRegistration = value.input.values.matricula; value.registration = "SS".repeat(15);
  expect(repairFormSaveSchema.safeParse({ prepared: value, dateAnswers: [] }).success).toBe(true);
  expect(repairFormSaveSchema.safeParse({ prepared: { ...value, registration: "forged" }, dateAnswers: [] }).success).toBe(false);
  expect(repairFormSaveSchema.safeParse({ prepared: { ...value, context: { ...value.context, lookupRegistration: "changed" } }, dateAnswers: [] }).success).toBe(false);
});

it("ADR-002 validates exact unsigned64/decimal drafts without numeric rounding or silent NULL/zero", () => {
  const values = input().values;
  expect(repairFormNumericValuesValid({ ...values, km_viatura: "18446744073709551615", recepcao_cliente: null, recepcao_terceiro: "9007199254740993", total_pago: "-1234567890123456789.123456789" })).toBe(true);
  expect(repairFormNumericValuesValid({ ...values, total_pago: null })).toBe(true);
  for (const total_pago of ["", " ", "-", ".", "1e5", "NaN", "Infinity", "1\n"]) expect(repairFormNumericValuesValid({ ...values, total_pago })).toBe(false);
  for (const km_viatura of ["1\n", "18446744073709551616", "-1", "1.5"]) expect(repairFormNumericValuesValid({ ...values, km_viatura })).toBe(false);
  for (const numero of ["1\n", "18446744073709551616", "01"]) expect(repairFormNumberSchema.safeParse({ numero }).success).toBe(false);
});
