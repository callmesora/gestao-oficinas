import { isolatedWorkflowPost } from "./workflow-http";
import type { PostoRepository } from "../application/postos";

export async function isolatedPostoRepository(): Promise<PostoRepository> {
  const post = await isolatedWorkflowPost("postos", "Posto request failed");
  return { list: input => post("list", input), save: command => post("save", command), remove: id => post("delete", { id }) };
}
