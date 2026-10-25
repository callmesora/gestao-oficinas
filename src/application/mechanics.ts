import type { MechanicList, MechanicListResult, MechanicReadResult, MechanicSave, MechanicSaveResult, MechanicDeleteResult } from "../../packages/domain/src/mechanics";

export interface MechanicRepository {
  list(input: MechanicList): Promise<MechanicListResult>;
  read(input: { id: string }): Promise<MechanicReadResult>;
  save(command: MechanicSave): Promise<MechanicSaveResult>;
  remove(id: string): Promise<MechanicDeleteResult>;
}
