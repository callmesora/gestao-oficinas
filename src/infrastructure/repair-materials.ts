import { isolatedWorkflowPost } from "./workflow-http";
import type { RepairMaterialsRepository } from "../application/repair-materials";

export async function isolatedRepairMaterialsRepository(): Promise<RepairMaterialsRepository> {
  const post = await isolatedWorkflowPost("repair-materials", "Repair materials request failed");
  return { list: input => post("list", input), read: input => post("read", input), article: input => post("article", input),
    authenticate: input => post("authenticate", input), save: input => post("save", input) };
}
