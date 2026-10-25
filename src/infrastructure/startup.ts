import { isolatedWorkflowPost } from "./workflow-http";
import type { StartupRepository } from "../application/startup";
export async function isolatedStartupRepository(): Promise<StartupRepository> {
  const post = await isolatedWorkflowPost("startup", "Startup request failed");
  return { initialise: () => post("initialise", {}), access: command => post("access", command), readSystem: () => post("system-read", {}), saveSystem: values => post("system-save", values) };
}
