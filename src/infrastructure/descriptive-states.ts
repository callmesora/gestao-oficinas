import { isolatedWorkflowPost } from "./workflow-http";
import type { DescriptiveStateRepository } from "../application/descriptive-states";

export async function isolatedDescriptiveStateRepository(): Promise<DescriptiveStateRepository> {
  const post = await isolatedWorkflowPost("descriptive-states", "DescriptiveState request failed");
  return { list: input => post("list", input), save: command => post("save", command), remove: id => post("delete", { id }) };
}
