import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { documentTypeIdentitySchema, documentTypeListSchema, documentTypeSaveSchema, documentTypeRequiredMessage, documentTypeDuplicateMessage,
  type DocumentType, type DocumentTypeListResult, type DocumentTypeSaveResult, type DocumentTypeDeleteResult } from "../../../../packages/domain/src/document-types";

const returning = `_row_id::text AS id,"documentosID"::text,"Codigo","Descricao","stock","obriga_macanico"`;
const associatedMessage = "Tipo de documento associado a documentos, não pode ser eliminado";
// ADR-012: source row display supplies these labels; no raw input becomes a SQL identifier.
const stockDisplay = `CASE "stock" WHEN 1 THEN 'Entrada' WHEN 2 THEN 'Saída' ELSE COALESCE("stock"::text,'') END`;

export async function listDocumentTypes(connect: DatabaseConnection, input: unknown): Promise<DocumentTypeListResult> {
  const parsed = documentTypeListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const sort = parsed.data.sort === "stock" ? stockDisplay : `d."${parsed.data.sort ?? "documentosID"}"`;
    const result = await client.query<DocumentType>(`SELECT ${returning} FROM app."documentos" d ORDER BY ${sort} ${parsed.data.descending ? "DESC" : "ASC"} NULLS LAST,d._row_id`);
    return { kind: "loaded", documentTypes: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveDocumentType(connect: DatabaseConnection, input: unknown): Promise<DocumentTypeSaveResult> {
  const parsed = documentTypeSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, required = documentTypeRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-011: serialize exact-key creation/allocation without repairing imported anomalies.
    await client.query('LOCK TABLE app."documentos" IN SHARE ROW EXCLUSIVE MODE');
    const bindings = [values.Descricao, values.stock, values.obriga_macanico];
    let result;
    if (command.mode === "create") {
      const duplicate = await client.query('SELECT 1 FROM app."documentos" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo]);
      if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: documentTypeDuplicateMessage(values.Codigo) }; }
      result = await client.query<DocumentType>(`INSERT INTO app."documentos" ("documentosID","Codigo","Descricao","stock","obriga_macanico")
        SELECT GREATEST(COALESCE(MAX("documentosID"),0),0)+1,$4,$1,$2,$3 FROM app."documentos"
        HAVING GREATEST(COALESCE(MAX("documentosID"),0),0)<9223372036854775807 RETURNING ${returning}`, [...bindings, values.Codigo]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."documentos" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      result = await client.query<DocumentType>(`UPDATE app."documentos" SET "Descricao"=$1,"stock"=$2,"obriga_macanico"=$3 WHERE _row_id=$4 RETURNING ${returning}`, [...bindings, command.id]);
    }
    await client.query("COMMIT");
    return { kind: "saved", documentType: result.rows[0] };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-C5CA4D83-03: rollback/typed failure replaces ambiguous source success fallthrough.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

export async function checkDocumentTypeDelete(connect: DatabaseConnection, input: unknown): Promise<DocumentTypeDeleteResult | { kind: "ready" }> {
  const parsed = documentTypeIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<{ associated: boolean }>(`SELECT EXISTS(SELECT 1 FROM app."cab_stocks" c WHERE c."documento_codigo"=d."Codigo") AS associated FROM app."documentos" d WHERE d._row_id=$1`, [parsed.data.id]);
    if (!result.rowCount) return { kind: "missing" };
    return result.rows[0].associated ? { kind: "associated", message: associatedMessage } : { kind: "ready" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function deleteDocumentType(connect: DatabaseConnection, input: unknown): Promise<DocumentTypeDeleteResult> {
  const parsed = documentTypeIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-011: future stock writes honor this documentos-before-cab_stocks order.
    await client.query('LOCK TABLE app."documentos",app."cab_stocks" IN SHARE ROW EXCLUSIVE MODE');
    const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."documentos" WHERE _row_id=$1', [parsed.data.id]);
    if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const headers = await client.query('SELECT 1 FROM app."cab_stocks" WHERE "documento_codigo"=$1 LIMIT 1', [existing.rows[0].Codigo]);
    if (headers.rowCount) { await client.query("ROLLBACK"); return { kind: "associated", message: associatedMessage }; }
    await client.query('DELETE FROM app."documentos" WHERE _row_id=$1', [parsed.data.id]);
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-CFEE768B-03: no invented failure dialog or success after a failed transaction.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
