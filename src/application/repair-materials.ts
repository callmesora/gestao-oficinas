import type { RepairMaterialProof, RepairMaterialsArticleResult, RepairMaterialsListResult, RepairMaterialsMechanicResult, RepairMaterialsReadResult, RepairMaterialsSave, RepairMaterialsSaveResult } from "../../packages/domain/src/repair-materials";

export interface RepairMaterialsRepository {
  list(input: { restricted: boolean; mechanic?: number | null }): Promise<RepairMaterialsListResult>;
  read(input: { orderId: string } | { numero: string }): Promise<RepairMaterialsReadResult>;
  article(input: { value: string; barcodeFirst: boolean }): Promise<RepairMaterialsArticleResult>;
  authenticate(input: RepairMaterialProof): Promise<RepairMaterialsMechanicResult>;
  save(command: RepairMaterialsSave): Promise<RepairMaterialsSaveResult>;
}
