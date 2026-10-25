import type { RepairOrderFormRepository } from "../application/repair-order-form";
import { isolatedWorkflowPost } from "./workflow-http";

export async function isolatedRepairOrderFormRepository(): Promise<RepairOrderFormRepository> {
  const post = await isolatedWorkflowPost("repair-orders", "Repair order form request failed");
  return {
    initialise: input => post("form-initialise", input),
    resolveVehicle: input => post("resolve-vehicle", input),
    lookupCustomer: input => post("lookup-customer", input),
    checkVehicleChange: input => post("check-vehicle-change", input),
    checkStateChange: input => post("check-state-change", input),
    prepareSave: input => post("prepare-save", input),
    save: input => post("save", input),
    remove: input => post("delete", input),
  };
}
