import { isolatedWorkflowPost } from "./workflow-http";
import type { TerminalRepository } from "../application/terminals";
export async function isolatedTerminalRepository(): Promise<TerminalRepository> {
  const post = await isolatedWorkflowPost("terminals", "Terminal request failed");
  return { list: input => post("list", input), save: command => post("save", command), remove: id => post("delete", { id }), prepareFolder: code => post("prepare-folder", { code }) };
}
