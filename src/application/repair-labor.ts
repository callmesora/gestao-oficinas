import type { RepairLaborAuthenticateResult, RepairLaborInitialiseResult, RepairLaborList, RepairLaborListResult, RepairLaborMaterialSave, RepairLaborMaterialCheckResult, RepairLaborPrepareResult, RepairLaborProof, RepairLaborReadResult, RepairLaborState, RepairLaborTick, RepairLaborToggle, RepairLaborWriteResult } from "../../packages/domain/src/repair-labor";

export interface RepairLaborRepository {
  initialise(input: { now: string }): Promise<RepairLaborInitialiseResult>;
  list(input: RepairLaborList): Promise<RepairLaborListResult>;
  read(input: { numero: string }): Promise<RepairLaborReadResult>;
  checkMaterials(input: { numero: string }): Promise<RepairLaborMaterialCheckResult>;
  authenticate(input: RepairLaborProof): Promise<RepairLaborAuthenticateResult>;
  prepare(input: { numero: string; proof: RepairLaborProof }): Promise<RepairLaborPrepareResult>;
  toggle(input: RepairLaborToggle): Promise<RepairLaborWriteResult>;
  state(input: RepairLaborState): Promise<RepairLaborWriteResult>;
  tick(input: RepairLaborTick): Promise<RepairLaborWriteResult>;
  saveMaterials(input: RepairLaborMaterialSave): Promise<RepairLaborWriteResult>;
}
