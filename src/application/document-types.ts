import type { DocumentTypeList, DocumentTypeListResult, DocumentTypeSave, DocumentTypeSaveResult, DocumentTypeDeleteResult } from "../../packages/domain/src/document-types";

export interface DocumentTypeRepository {
  list(input: DocumentTypeList): Promise<DocumentTypeListResult>;
  save(command: DocumentTypeSave): Promise<DocumentTypeSaveResult>;
  checkDelete(id: string): Promise<DocumentTypeDeleteResult | { kind: "ready" }>;
  remove(id: string): Promise<DocumentTypeDeleteResult>;
}
