import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { mechanicIdentitySchema, mechanicListSchema, mechanicSaveSchema, mechanicRequiredMessage, mechanicDuplicateMessage,
  type MechanicListRow, type MechanicRecord, type MechanicListResult, type MechanicReadResult, type MechanicSaveResult, type MechanicDeleteResult } from "../../../../packages/domain/src/mechanics";

// ADR-008/004: public projections never include credentials or the hidden automatic source identifier.
const publicFields = '_row_id::text AS id,"Codigo","Descricao","inativo"';
const recordFields = `${publicFields},"mecanicosID"::text,"palavra_passe"`;

export async function listMechanics(connect: DatabaseConnection, input: unknown): Promise<MechanicListResult> {
  const parsed = mechanicListSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // ADR-012: source explicitly sorts inactive; NULL placement/internal-id ties remain target defaults under U02.
    const result = await client.query<MechanicListRow>(`SELECT ${publicFields} FROM app."mecanicos" ORDER BY "${parsed.data.sort ?? "inativo"}" ${parsed.data.descending ? "DESC" : "ASC"} NULLS LAST,_row_id`);
    return { kind: "loaded", mechanics: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function readMechanic(connect: DatabaseConnection, input: unknown): Promise<MechanicReadResult> {
  const parsed = mechanicIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<MechanicRecord>(`SELECT ${recordFields} FROM app."mecanicos" WHERE _row_id=$1`, [parsed.data.id]);
    return result.rowCount ? { kind: "loaded", mechanic: result.rows[0] } : { kind: "missing" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveMechanic(connect: DatabaseConnection, input: unknown): Promise<MechanicSaveResult> {
  const parsed = mechanicSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values, required = mechanicRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."mecanicos" IN SHARE ROW EXCLUSIVE MODE');
    let result;
    if (command.mode === "create") {
      const duplicate = await client.query('SELECT 1 FROM app."mecanicos" WHERE "Codigo"=$1 LIMIT 1', [values.Codigo]);
      if (duplicate.rowCount) { await client.query("ROLLBACK"); return { kind: "duplicate", message: mechanicDuplicateMessage(values.Codigo!) }; }
      // SourceCode24 automatic identifiers are signed eight-byte values despite the wider NUMERIC column.
      result = await client.query<MechanicListRow>(`INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo")
        SELECT GREATEST(COALESCE(MAX("mecanicosID"),0),0)+1,$1,$2,$3,$4 FROM app."mecanicos"
        HAVING GREATEST(COALESCE(MAX("mecanicosID"),0),0)<9223372036854775807 RETURNING ${publicFields}`, [values.Codigo, values.Descricao, values.palavra_passe, values.inativo]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const existing = await client.query<{ Codigo: number | null }>('SELECT "Codigo" FROM app."mecanicos" WHERE _row_id=$1', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      result = await client.query<MechanicListRow>(`UPDATE app."mecanicos" SET "Descricao"=$1,"palavra_passe"=$2,"inativo"=$3 WHERE _row_id=$4 RETURNING ${publicFields}`, [values.Descricao, values.palavra_passe, values.inativo, command.id]);
    }
    await client.query("COMMIT");
    return { kind: "saved", mechanic: result.rows[0] };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-C17FCA03-03: explicit rollback/typed failure, no invented message or false success.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

export async function deleteMechanic(connect: DatabaseConnection, input: unknown): Promise<MechanicDeleteResult> {
  const parsed = mechanicIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."mecanicos" IN SHARE ROW EXCLUSIVE MODE');
    // Verified WIN_Table_mecanicos.wdw:286–297 has no relationship guard.
    const result = await client.query('DELETE FROM app."mecanicos" WHERE _row_id=$1', [parsed.data.id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client);
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
