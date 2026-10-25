import type { StockRepository } from "../application/stock";
import { isolatedWorkflowPost } from "./workflow-http";
export async function isolatedStockRepository(): Promise<StockRepository> {
  const post = await isolatedWorkflowPost("stock", "Stock request failed");
  return { list: input => post("list", input), read: id => post("read", { id }), next: document => post("next", { document }), lookup: (code, barcode = true) => post("lookup", { code, barcode }), save: command => post("save", command), remove: id => post("delete", { id }), inventory: () => post("inventory", {}), rebuild: () => post("rebuild", {}), scannerConfig: () => post("scanner-config", {}), scannerPartition: rows => post("scanner-partition", { rows }) };
}
