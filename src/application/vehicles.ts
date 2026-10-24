import type { VehicleFilter, VehicleListResult, VehicleLookupResult, VehicleSave, VehicleSaveResult, VehicleDeleteResult } from "../../packages/domain/src/vehicles";

export interface VehicleRepository {
  list(filter: VehicleFilter): Promise<VehicleListResult>;
  lookup(registration: string): Promise<VehicleLookupResult>;
  save(command: VehicleSave): Promise<VehicleSaveResult>;
  checkDelete(registration: string): Promise<VehicleDeleteResult | { kind: "ready" }>;
  remove(registration: string): Promise<VehicleDeleteResult>;
}
