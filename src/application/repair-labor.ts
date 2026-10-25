import type { RepairLaborAuthenticateResult, RepairLaborInformationCheckResult, RepairLaborInitialiseResult, RepairLaborList, RepairLaborListResult, RepairLaborMaterialSave, RepairLaborMaterialCheckResult, RepairLaborPrepareResult, RepairLaborProof, RepairLaborReadResult, RepairLaborState, RepairLaborStateChoicesResult, RepairLaborTick, RepairLaborTimeReadResult, RepairLaborToggle, RepairLaborWriteResult } from "../../packages/domain/src/repair-labor";

export interface RepairLaborRepository {
  initialise(input: { now: string }): Promise<RepairLaborInitialiseResult>;
  list(input: RepairLaborList): Promise<RepairLaborListResult>;
  read(input: { numero: string }): Promise<RepairLaborReadResult>;
  readTime(input: { numero: string; mechanic: number }): Promise<RepairLaborTimeReadResult>;
  readStateChoices(): Promise<RepairLaborStateChoicesResult>;
  checkInformation(input: { numero: string }): Promise<RepairLaborInformationCheckResult>;
  checkMaterials(input: { numero: string }): Promise<RepairLaborMaterialCheckResult>;
  authenticate(input: RepairLaborProof): Promise<RepairLaborAuthenticateResult>;
  prepare(input: { numero: string; proof: RepairLaborProof }): Promise<RepairLaborPrepareResult>;
  toggle(input: RepairLaborToggle): Promise<RepairLaborWriteResult>;
  state(input: RepairLaborState): Promise<RepairLaborWriteResult>;
  tick(input: RepairLaborTick): Promise<RepairLaborWriteResult>;
  saveMaterials(input: RepairLaborMaterialSave): Promise<RepairLaborWriteResult>;
}
