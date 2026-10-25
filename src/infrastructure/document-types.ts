import { isolatedWorkflowPost } from "./workflow-http";
import type { DocumentTypeRepository } from "../application/document-types";

export async function isolatedDocumentTypeRepository(): Promise<DocumentTypeRepository> {
  const post = await isolatedWorkflowPost("document-types", "Document type request failed");
  return { list: input => post("list", input), save: command => post("save", command), checkDelete: id => post("check-delete", { id }), remove: id => post("delete", { id }) };
}
