import { isolatedWorkflowPost } from "./workflow-http";
import type { UserRepository } from "../application/users";

export async function isolatedUserRepository(): Promise<UserRepository> {
  const post = await isolatedWorkflowPost("users", "User request failed");
  return { list: input => post("list", input), read: input => post("read", input), save: command => post("save", command), remove: id => post("delete", { id }) };
}
