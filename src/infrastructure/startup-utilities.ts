import type { StartupUtilityRepository } from "../application/startup-utilities";
import { isolatedWorkflowPost } from "./workflow-http";
export async function isolatedStartupUtilityRepository(): Promise<StartupUtilityRepository> {
  const post = await isolatedWorkflowPost("startup", "Startup utility request failed");
  return { reassignReceptionCustomers: () => post("reassign-customers", {}) };
}
