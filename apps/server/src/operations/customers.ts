import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { z } from "zod";
import { customerDuplicateMessage, customerRequiredMessage, customerSaveSchema, customerFilterSchema, type Customer, type CustomerSaveResult, type CustomerListResult } from "../../../../packages/domain/src/customers";

const returning = `_row_id::text AS id, "ClientesID"::text, "Codigo"::text, "Descricao", "Morada1", "Morada2", "codpostal", "Telefone1", "Telemovel", "observacao"`;

export async function listCustomers(connect: DatabaseConnection, input: unknown): Promise<CustomerListResult> {
  const parsed = customerFilterSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const filter = parsed.data;
  // Verified mode/field map: WIN_Table_Clientes.wdw:608–633. ADR-009/U-CC16AB27-02 locale default.
  const fields = { todos: [], codigo: ["Codigo"], descricao: ["Descricao"], morada: ["Morada1", "Morada2"], codigopostal: ["codpostal"], telefone: ["Telefone1", "Telemovel"] }[filter.mode];
  const expressions = filter.term === "" ? [] : fields.map(field => `strpos(lower(COALESCE("${field}"::text,'')),lower($1))>0`);
  const where = expressions.length ? `WHERE (${expressions.join(" OR ")})` : "";
  const order = filter.sort ? `"${filter.sort}" ${filter.descending ? "DESC" : "ASC"},_row_id` : '"ClientesID",_row_id';
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<Customer>(`SELECT ${returning} FROM app."Clientes" ${where} ORDER BY ${order}`, expressions.length ? [filter.term] : []);
    // Source FOR EACH respects the active file filter; no code reservation occurs here.
    const maximum = result.rows.reduce((max, row) => row.Codigo !== null && BigInt(row.Codigo) > max ? BigInt(row.Codigo) : max, 0n);
    return { kind: "loaded", customers: result.rows, nextCode: String(maximum + 1n) };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveCustomer(connect: DatabaseConnection, input: unknown): Promise<CustomerSaveResult> {
  const parsed = customerSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values;
  const required = customerRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    let result;
    const parameters = [values.Codigo, values.Descricao, values.Morada1, values.Morada2, values.codpostal, values.Telefone1, values.Telemovel, values.observacao];
    if (command.mode === "create") {
      // ADR-008: serialize legacy automatic identifier allocation, not editable code suggestions.
      await client.query('LOCK TABLE app."Clientes" IN SHARE ROW EXCLUSIVE MODE');
      result = await client.query<Customer>(`INSERT INTO app."Clientes" ("ClientesID", "Codigo", "Descricao", "Morada1", "Morada2", "codpostal", "Telefone1", "Telemovel", "observacao")
        SELECT GREATEST(COALESCE(MAX("ClientesID"),0),0)+1,$1,$2,$3,$4,$5,$6,$7,$8 FROM app."Clientes"
        HAVING GREATEST(COALESCE(MAX("ClientesID"),0),0)<9223372036854775807 RETURNING ${returning}`, parameters);
      // Verified signed sourceCode 24 range; ADR-002/011: fail without wrapping or reusing IDs.
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      const existing = await client.query<{ Codigo: string | null }>('SELECT "Codigo"::text FROM app."Clientes" WHERE _row_id=$1 FOR UPDATE', [command.id]);
      if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
      if (existing.rows[0].Codigo !== values.Codigo) { await client.query("ROLLBACK"); return { kind: "codeLocked" }; }
      result = await client.query<Customer>(`UPDATE app."Clientes" SET "Codigo"=$1,"Descricao"=$2,"Morada1"=$3,"Morada2"=$4,"codpostal"=$5,"Telefone1"=$6,"Telemovel"=$7,"observacao"=$8 WHERE _row_id=$9 RETURNING ${returning}`, [...parameters, command.id]);
    }
    await client.query("COMMIT");
    return { kind: "saved", customer: result.rows[0] };
  } catch (error) {
    await rollbackAfterFailure(client);
    if (error && typeof error === "object" && "code" in error && error.code === "23505" && "constraint" in error && error.constraint === "ix_4f4b84259e533b8d") {
      return { kind: "duplicate", message: customerDuplicateMessage(values.Codigo) };
    }
    // UNRESOLVED U-C286277B-03: no invented failure message or false persisted-success result.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

const customerIdentitySchema = z.strictObject({ id: z.string().regex(/^[1-9][0-9]*$/).max(19) });
export type CustomerDeleteResult = { kind: "deleted" | "missing" | "invalid" | "failed" } | { kind: "associated"; message: string };

export async function checkCustomerDelete(connect: DatabaseConnection, input: unknown): Promise<CustomerDeleteResult | { kind: "ready" }> {
  const parsed = customerIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<{ associated: boolean }>(`SELECT EXISTS(SELECT 1 FROM app."Viaturas" v WHERE v."Cliente"=c."Codigo") AS associated FROM app."Clientes" c WHERE c._row_id=$1`, [parsed.data.id]);
    if (!result.rowCount) return { kind: "missing" };
    return result.rows[0].associated ? { kind: "associated", message: "Cliente com viaturas associadas, não pode ser eliminado" } : { kind: "ready" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function deleteCustomer(connect: DatabaseConnection, input: unknown): Promise<CustomerDeleteResult> {
  const parsed = customerIdentitySchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    // ADR-008: prevent a vehicle link from arriving between the check and delete.
    await client.query('LOCK TABLE app."Clientes", app."Viaturas" IN SHARE ROW EXCLUSIVE MODE');
    const customer = await client.query<{ Codigo: string | null }>('SELECT "Codigo"::text FROM app."Clientes" WHERE _row_id=$1', [parsed.data.id]);
    if (!customer.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const vehicles = await client.query('SELECT 1 FROM app."Viaturas" WHERE "Cliente"=$1 LIMIT 1', [customer.rows[0].Codigo]);
    if (vehicles.rowCount) {
      await client.query("ROLLBACK");
      // Verified: WIN_Table_Clientes.wdw:365–370.
      return { kind: "associated", message: "Cliente com viaturas associadas, não pode ser eliminado" };
    }
    await client.query('DELETE FROM app."Clientes" WHERE _row_id=$1', [parsed.data.id]);
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-CC16AB27-03: database error presentation is not recovered.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
