import type { RepairOrderDefaults, RepairOrderDefaultsResult, RepairOrderInitialiseResult, RepairOrderList, RepairOrderListResult } from "../../packages/domain/src/repair-orders";

export interface RepairOrderRepository {
  initialise(): Promise<RepairOrderInitialiseResult>;
  list(input: RepairOrderList): Promise<RepairOrderListResult>;
  saveDefaults(command: RepairOrderDefaults): Promise<RepairOrderDefaultsResult>;
}
