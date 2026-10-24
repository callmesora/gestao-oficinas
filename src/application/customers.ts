import type { CustomerFilter, CustomerListResult, CustomerSave, CustomerSaveResult } from "../../packages/domain/src/customers";

export type CustomerDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" } | { kind: "associated"; message: string };
export interface CustomerRepository {
  list(filter: CustomerFilter): Promise<CustomerListResult>;
  save(command: CustomerSave): Promise<CustomerSaveResult>;
  remove(id: string): Promise<CustomerDeleteResult>;
  checkDelete(id: string): Promise<CustomerDeleteResult | { kind: "ready" }>;
}
