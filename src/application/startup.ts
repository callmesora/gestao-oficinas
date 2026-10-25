import type { AccessCommand, AccessResult, StartupResult, SystemReadResult, SystemSaveResult, SystemValues } from "../../packages/domain/src/startup";
export interface StartupRepository {
  initialise(): Promise<StartupResult>;
  access(command: AccessCommand): Promise<AccessResult>;
  readSystem(): Promise<SystemReadResult>;
  saveSystem(values: SystemValues): Promise<SystemSaveResult>;
}
