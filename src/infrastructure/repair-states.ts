import { isolatedWorkflowPost } from "./workflow-http";
import type { RepairStateRepository } from "../application/repair-states";

export async function isolatedRepairStateRepository(): Promise<RepairStateRepository> {
  const post = await isolatedWorkflowPost("repair-states", "Repair state request failed");
  return { list: input => post("list", input), save: command => post("save", command), checkDelete: id => post("check-delete", { id }), remove: id => post("delete", { id }) };
}
