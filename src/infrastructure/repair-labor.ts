import { isolatedWorkflowPost } from "./workflow-http";
import type { RepairLaborRepository } from "../application/repair-labor";

export async function isolatedRepairLaborRepository(): Promise<RepairLaborRepository> {
  const post = await isolatedWorkflowPost("repair-labor", "Repair labor request failed");
  return { initialise: input => post("initialise", input), list: input => post("list", input), read: input => post("read", input), authenticate: input => post("authenticate", input), prepare: input => post("prepare", input), toggle: input => post("toggle", input), state: input => post("state", input), tick: input => post("tick", input), saveMaterials: input => post("save-materials", input) };
}
