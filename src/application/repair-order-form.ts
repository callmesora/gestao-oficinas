import type { RepairDeleteResult, RepairFormCustomerResult, RepairFormInitialiseResult, RepairFormPrepareInput, RepairFormPrepareResult, RepairFormRaw, RepairFormSaveInput, RepairFormSaveResult, RepairFormTarget, RepairFormVehicleResult, RepairStateChangeInput, RepairStateChangeResult, RepairVehicleChangeResult } from "../../packages/domain/src/repair-order-form";

export interface RepairOrderFormRepository {
  initialise(input: { target: RepairFormTarget }): Promise<RepairFormInitialiseResult>;
  resolveVehicle(input: { registration: RepairFormRaw }): Promise<RepairFormVehicleResult>;
  lookupCustomer(input: { code: RepairFormRaw }): Promise<RepairFormCustomerResult>;
  checkVehicleChange(input: { numero: string }): Promise<RepairVehicleChangeResult>;
  checkStateChange(input: RepairStateChangeInput): Promise<RepairStateChangeResult>;
  prepareSave(input: RepairFormPrepareInput): Promise<RepairFormPrepareResult>;
  save(input: RepairFormSaveInput): Promise<RepairFormSaveResult>;
  remove(input: { numero: string }): Promise<RepairDeleteResult>;
}
