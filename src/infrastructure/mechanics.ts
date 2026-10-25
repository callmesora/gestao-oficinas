import { isolatedWorkflowPost } from "./workflow-http";
import type { MechanicRepository } from "../application/mechanics";

export async function isolatedMechanicRepository(): Promise<MechanicRepository> {
  const post = await isolatedWorkflowPost("mechanics", "Mechanic request failed");
  return { list: input => post("list", input), read: input => post("read", input), save: command => post("save", command), remove: id => post("delete", { id }) };
}
