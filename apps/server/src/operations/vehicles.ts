import { z } from "zod";
import { connectOperationClient, rollbackAfterFailure, closeOperationClient, type DatabaseConnection } from "../db/connection";
import { vehicleFilterSchema, vehicleSaveSchema, vehicleRequiredMessage, vehicleDuplicateMessage, vehicleUppercase,
  type Vehicle, type VehicleListRow, type VehicleListResult, type VehicleLookupResult,
  type VehicleSaveResult, type VehicleDeleteResult } from "../../../../packages/domain/src/vehicles";

const returning = `_row_id::text AS id,"ViaturasID"::text,"matricula","Cliente"::text,"marca","modelo","Ano","mes"`;
// ADR002: an original imported key is an exact identity, not a new-entry mask.
const registrationSchema = z.strictObject({ registration: z.string() });
const associatedMessage = "Viatura usada em ordens de reparação, não pode ser eliminada";

export async function listVehicles(connect: DatabaseConnection, input: unknown): Promise<VehicleListResult> {
  const parsed = vehicleFilterSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const filter = parsed.data;
  // Verified: dossier QRY_select_viaturas/sql; literal comparison default ADR-010.
  const fields = { todos: [], matricula: ['v."matricula"'], cliente: ['c."Descricao"'], marca_modelo: ['v."marca"', 'v."modelo"'] }[filter.mode];
  const expressions = filter.term === "" ? [] : fields.map(field => `strpos(lower(COALESCE(${field},'') COLLATE "pg_unicode_fast"),lower($1::text COLLATE "pg_unicode_fast"))>0`);
  const where = expressions.length ? `WHERE (${expressions.join(" OR ")})` : "";
  const sort = filter.sort === "Descricao" ? 'c."Descricao"' : `v."${filter.sort ?? "matricula"}"`;
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<VehicleListRow>(`SELECT v._row_id::text AS id,v."ViaturasID"::text,v."matricula",v."Cliente"::text,v."marca",v."modelo",v."Ano",v."mes",c."Descricao"
      FROM app."Viaturas" v INNER JOIN app."Clientes" c ON v."Cliente"=c."Codigo" ${where}
      ORDER BY ${sort} ${filter.descending ? "DESC" : "ASC"},v._row_id`, expressions.length ? [filter.term] : []);
    return { kind: "loaded", vehicles: result.rows };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function lookupVehicle(connect: DatabaseConnection, input: unknown): Promise<VehicleLookupResult> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    // Source HReadFirst has no defined duplicate ordering; deterministic interim tie per ADR-010.
    const result = await client.query<Vehicle>(`SELECT ${returning} FROM app."Viaturas" WHERE "matricula"=$1 ORDER BY _row_id LIMIT 1`, [parsed.data.registration]);
    return result.rowCount ? { kind: "loaded", vehicle: result.rows[0] } : { kind: "missing" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function saveVehicle(connect: DatabaseConnection, input: unknown): Promise<VehicleSaveResult> {
  const parsed = vehicleSaveSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const command = parsed.data, values = command.values;
  const required = vehicleRequiredMessage(values);
  if (required) return { kind: "required", message: required };
  if (command.mode === "update" && values.matricula !== command.originalRegistration) return { kind: "registrationLocked" };
  const registration = vehicleUppercase(values.matricula);
  if (command.mode === "create" && registration.length > 15) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."Clientes",app."Viaturas" IN SHARE ROW EXCLUSIVE MODE');
    let result;
    const parameters = [values.Cliente, values.marca, values.modelo, values.Ano, values.mes];
    if (command.mode === "create") {
      const duplicate = await client.query('SELECT 1 FROM app."Viaturas" WHERE "matricula"=$1 LIMIT 1', [registration]);
      if (duplicate.rowCount) {
        await client.query("ROLLBACK");
        return { kind: "duplicate", message: vehicleDuplicateMessage(registration) };
      }
      result = await client.query<Vehicle>(`INSERT INTO app."Viaturas" ("ViaturasID","Cliente","marca","modelo","Ano","mes","matricula")
        SELECT GREATEST(COALESCE(MAX("ViaturasID"),0),0)+1,$1,$2,$3,$4,$5,$6 FROM app."Viaturas"
        HAVING GREATEST(COALESCE(MAX("ViaturasID"),0),0)<9223372036854775807 RETURNING ${returning}`, [...parameters, registration]);
      // Verified signed sourceCode 24 range; ADR-002/011: fail without wrapping or reusing IDs.
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "failed" }; }
    } else {
      // Verified: source updates all matching original registrations, not one internal row.
      result = await client.query<Vehicle>(`UPDATE app."Viaturas" SET "Cliente"=$1,"marca"=$2,"modelo"=$3,"Ano"=$4,"mes"=$5 WHERE "matricula"=$6 RETURNING ${returning}`, [...parameters, command.originalRegistration]);
      if (!result.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    }
    await client.query("COMMIT");
    return { kind: "saved", vehicles: result.rows };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-C9675195-03: failure presentation; never claim unchecked persisted success.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}

export async function checkVehicleDelete(connect: DatabaseConnection, input: unknown): Promise<VehicleDeleteResult | { kind: "ready" }> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    const result = await client.query<{ associated: boolean }>(`SELECT EXISTS(SELECT 1 FROM app."ordem_reparacao" r WHERE r."matricula"=v."matricula") AS associated FROM app."Viaturas" v WHERE v."matricula"=$1 LIMIT 1`, [parsed.data.registration]);
    if (!result.rowCount) return { kind: "missing" };
    return result.rows[0].associated ? { kind: "associated", message: associatedMessage } : { kind: "ready" };
  } catch { return { kind: "failed" }; }
  finally { await closeOperationClient(client); }
}

export async function deleteVehicle(connect: DatabaseConnection, input: unknown): Promise<VehicleDeleteResult> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { kind: "invalid" };
  const client = await connectOperationClient(connect);
  if (!client) return { kind: "failed" };
  try {
    await client.query("BEGIN");
    await client.query('LOCK TABLE app."Clientes",app."Viaturas",app."ordem_reparacao" IN SHARE ROW EXCLUSIVE MODE');
    const existing = await client.query('SELECT 1 FROM app."Viaturas" WHERE "matricula"=$1 LIMIT 1', [parsed.data.registration]);
    if (!existing.rowCount) { await client.query("ROLLBACK"); return { kind: "missing" }; }
    const associated = await client.query('SELECT 1 FROM app."ordem_reparacao" WHERE "matricula"=$1 LIMIT 1', [parsed.data.registration]);
    if (associated.rowCount) { await client.query("ROLLBACK"); return { kind: "associated", message: associatedMessage }; }
    await client.query('DELETE FROM app."Viaturas" WHERE "matricula"=$1', [parsed.data.registration]);
    await client.query("COMMIT");
    return { kind: "deleted" };
  } catch {
    await rollbackAfterFailure(client);
    // UNRESOLVED U-C039C545-03: no invented failure dialog.
    return { kind: "failed" };
  } finally { await closeOperationClient(client); }
}
