import { isolatedWorkflowPost } from "./workflow-http";
import type { RepairOrderRepository } from "../application/repair-orders";

export async function isolatedRepairOrderRepository(): Promise<RepairOrderRepository> {
  const post = await isolatedWorkflowPost("repair-orders", "Repair order request failed");
  return { initialise: () => post("initialise", {}), list: input => post("list", input), saveDefaults: command => post("save-defaults", command) };
}
