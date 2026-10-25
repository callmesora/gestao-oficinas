import { isolatedWorkflowPost } from "./workflow-http";
import type { UnitRepository } from "../application/units";

export async function isolatedUnitRepository(): Promise<UnitRepository> {
  const post = await isolatedWorkflowPost("units", "Unit request failed");
  return { list: input => post("list", input), save: command => post("save", command), checkDelete: id => post("check-delete", { id }), remove: id => post("delete", { id }) };
}
