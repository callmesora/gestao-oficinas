import { isolatedWorkflowPost } from "./workflow-http";
import type { VehicleRepository } from "../application/vehicles";

export async function isolatedVehicleRepository(): Promise<VehicleRepository> {
  const post = await isolatedWorkflowPost("vehicles", "Vehicle request failed");
  return { list: filter => post("list", filter), lookup: registration => post("lookup", { registration }), save: command => post("save", command), checkDelete: registration => post("check-delete", { registration }), remove: registration => post("delete", { registration }) };
}
