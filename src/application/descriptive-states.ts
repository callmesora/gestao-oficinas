import type { DescriptiveStateList, DescriptiveStateListResult, DescriptiveStateSave, DescriptiveStateSaveResult, DescriptiveStateDeleteResult } from "../../packages/domain/src/descriptive-states";

export interface DescriptiveStateRepository {
  list(input: DescriptiveStateList): Promise<DescriptiveStateListResult>;
  save(command: DescriptiveStateSave): Promise<DescriptiveStateSaveResult>;
  remove(id: string): Promise<DescriptiveStateDeleteResult>;
}
