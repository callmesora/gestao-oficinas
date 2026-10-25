import { isolatedWorkflowPost } from "./workflow-http";
import type { CustomerRepository } from "../application/customers";

export async function isolatedCustomerRepository(): Promise<CustomerRepository> {
  const post = await isolatedWorkflowPost("customers", "Customer request failed");
  return { list: filter => post("list", filter), save: command => post("save", command), remove: id => post("delete", { id }), checkDelete: id => post("check-delete", { id }) };
}
