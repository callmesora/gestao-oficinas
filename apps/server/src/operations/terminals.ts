import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { terminalIdentitySchema, terminalListSchema, terminalSaveSchema, terminalFolderSchema, terminalRequiredMessage, terminalDuplicateMessage,
  type Terminal, type TerminalListResult, type TerminalSaveResult, type TerminalDeleteResult, type TerminalFolderResult } from "../../../../packages/domain/src/terminals";

const fields = ["Codigo", "Descricao", "codbarras_inicio", "codbarras_fim", "quant_inicio", "quant_fim", "pasta_localizacao", "nome_ficheiro"] as const;
const returning = `_row_id::text AS id,${fields.map(key => `"${key}"`).join(",")}`;

export async function listTerminals(connect: DatabaseConnection, input: unknown): Promise<TerminalListResult> {
  const parsed = terminalListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<Terminal>(`SELECT ${returning} FROM app."Terminais" ORDER BY "${parsed.data.sort ?? "Codigo"}" ${parsed.data.descending ? "DESC" : "ASC"},_row_id`);
    return { kind: "loaded", terminals: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

// SRC-1589c564c4: explicit current-buffer result, not merely a path lookup.
export async function prepareTerminalFolder(connect: DatabaseConnection, input: unknown): Promise<TerminalFolderResult> {
  const parsed = terminalFolderSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // ADR-016/U-CDF1C34F-02: generic prefix read; unmatched/greater-key/locale buffer outcomes remain unresolved.
    const result = await client.query<Terminal>(`SELECT ${returning} FROM app."Terminais" WHERE left("Codigo",length($1))=$1 ORDER BY "Codigo",_row_id LIMIT 1`, [parsed.data.code]);
    return { kind: "positioned", terminal: result.rows[0] ?? null };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveTerminal(connect: DatabaseConnection, input: unknown): Promise<TerminalSaveResult> {
  const parsed = terminalSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, required = terminalRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."Terminais" IN SHARE ROW EXCLUSIVE MODE');
    if (command.mode !== "create") {
      const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo" FROM app."Terminais" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (command.mode === "update" && existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
    }
    // ADR-016: normal unchanged imported duplicate keys remain individually editable.
    if (command.mode !== "update") {
      const duplicate = await client.query('SELECT 1 FROM app."Terminais" WHERE "Codigo"=$1 AND ($2::bigint IS NULL OR _row_id<>$2) LIMIT 1', [values.Codigo, command.mode === "create" ? null : command.id]);
      if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: terminalDuplicateMessage(values.Codigo) }; }
    }
    const parameters = fields.map(key => values[key]);
    const result = command.mode === "create"
      ? await client.query<Terminal>(`INSERT INTO app."Terminais" (${fields.map(key => `"${key}"`).join(",")}) VALUES (${fields.map((_, index) => `$${index + 1}`).join(",")}) RETURNING ${returning}`, parameters)
      : await client.query<Terminal>(`UPDATE app."Terminais" SET ${fields.map((key, index) => `"${key}"=$${index + 1}`).join(",")} WHERE _row_id=$9 RETURNING ${returning}`, [...parameters, command.id]);
    await client.query("COMMIT");
    return { kind: "saved", terminal: result.rows[0] };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-CDF1C34F-03: rollback, no invented error text or false success.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

export async function deleteTerminal(connect: DatabaseConnection, input: unknown): Promise<TerminalDeleteResult> {
  const parsed = terminalIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."Terminais" IN SHARE ROW EXCLUSIVE MODE');
    const result = await client.query('DELETE FROM app."Terminais" WHERE _row_id=$1', [parsed.data.id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    await client.query("COMMIT"); return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client); return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
