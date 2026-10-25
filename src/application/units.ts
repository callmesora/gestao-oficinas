import type { UnitList, UnitListResult, UnitSave, UnitSaveResult, UnitDeleteResult } from "../../packages/domain/src/units";

export interface UnitRepository {
  list(input: UnitList): Promise<UnitListResult>;
  save(command: UnitSave): Promise<UnitSaveResult>;
  checkDelete(id: string): Promise<UnitDeleteResult | { kind: "ready" }>;
  remove(id: string): Promise<UnitDeleteResult>;
}
