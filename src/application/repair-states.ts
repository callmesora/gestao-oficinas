import type { RepairStateList, RepairStateListResult, RepairStateSave, RepairStateSaveResult, RepairStateDeleteResult } from "../../packages/domain/src/repair-states";

export interface RepairStateRepository {
  list(input: RepairStateList): Promise<RepairStateListResult>;
  save(command: RepairStateSave): Promise<RepairStateSaveResult>;
  checkDelete(id: string): Promise<RepairStateDeleteResult | { kind: "ready" }>;
  remove(id: string): Promise<RepairStateDeleteResult>;
}
