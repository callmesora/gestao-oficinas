import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import { checkVehicleDelete, deleteVehicle, listVehicles, lookupVehicle, saveVehicle } from "./vehicles";
import type { VehicleValues } from "../../../../packages/domain/src/vehicles";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const values: VehicleValues = { matricula: "aa-01-aa", Cliente: "9007199254740993", marca: "D'Água  ", modelo: "Modelo", Ano: 0, mes: 0 };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
  await database.query('INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao") VALUES (1,$1,$2)', [values.Cliente, "Cliente d'Água"]);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);

it("MIG-7C vehicle API allocates the final signed source ID and refuses exhaustion without writing", async () => {
  const app = createApp({ vehicleConnect: connect, authenticate: async () => ({ userId: "synthetic-boundary" }) });
  const sentinel = await database.query<{ id: string }>('INSERT INTO app."Viaturas" ("ViaturasID","matricula") VALUES (9223372036854775806,$1) RETURNING _row_id::text AS id', ["BOUND-SENTINEL"]);
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/vehicles/save", payload: { mode: "create", values: { ...values, matricula: "BOUND-LAST" } } })).json();
    expect(saved).toMatchObject({ kind: "saved", vehicles: [{ ViaturasID: "9223372036854775807", matricula: "BOUND-LAST" }] });
    const before = (await database.query('SELECT _row_id::text,"ViaturasID"::text,"matricula" FROM app."Viaturas" ORDER BY _row_id')).rows;
    expect((await app.inject({ method: "POST", url: "/api/vehicles/save", payload: { mode: "create", values: { ...values, matricula: "BOUND-FAIL" } } })).json()).toEqual({ kind: "failed" });
    expect((await database.query('SELECT _row_id::text,"ViaturasID"::text,"matricula" FROM app."Viaturas" ORDER BY _row_id')).rows).toEqual(before);
  } finally {
    await database.query('DELETE FROM app."Viaturas" WHERE _row_id=$1 OR "matricula" IN ($2,$3)', [sentinel.rows[0].id, "BOUND-LAST", "BOUND-FAIL"]);
    await app.close();
  }
});

it("GS-VEHICLES-001 real API create/edit/duplicate export matches the spec-derived golden projection", async () => {
  const app = createApp({ vehicleConnect: connect, authenticate: async () => ({ userId: "synthetic-golden" }) });
  try {
    const initial = { ...values, matricula: "golden-01", marca: "Marca", modelo: "Inicial" };
    expect((await app.inject({ method: "POST", url: "/api/vehicles/save", payload: { mode: "create", values: initial } })).json().kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/vehicles/save", payload: { mode: "update", originalRegistration: "GOLDEN-01", values: { ...initial, matricula: "GOLDEN-01", modelo: "Final" } } })).json().kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/vehicles/save", payload: { mode: "create", values: initial } })).json().kind).toBe("duplicate");
    const columns = ["matricula", "Cliente", "marca", "modelo", "Ano", "mes"];
    const exported = await database.query<Record<string, string>>('SELECT "matricula","Cliente"::text,"marca","modelo","Ano"::text,"mes"::text FROM app."Viaturas" WHERE "matricula"=$1', ["GOLDEN-01"]);
    const target = resolve(server.directory, "vehicle-golden"); await mkdir(target);
    const csv = (value: string) => '"' + value.replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "Viaturas.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(column => csv(row[column])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-VEHICLES-001/compare.json", "--legacy", "docs/golden/GS-VEHICLES-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

it("SRC-0c045cf25e saves uppercase registration and exact fields, rejects duplicate and keeps edit registration locked", async () => {
  const saved = await saveVehicle(connect, { mode: "create", values });
  expect(saved.kind).toBe("saved");
  if (saved.kind !== "saved") throw new Error("Vehicle setup failed");
  expect(saved.vehicles).toHaveLength(1);
  expect(saved.vehicles[0]).toMatchObject({ ...values, matricula: "AA-01-AA" });
  expect((await saveVehicle(connect, { mode: "create", values })).kind).toBe("duplicate");
  expect(await saveVehicle(connect, { mode: "update", originalRegistration: "AA-01-AA", values })).toEqual({ kind: "registrationLocked" });
  expect(await saveVehicle(connect, { mode: "update", originalRegistration: "AA-01-AA", values: { ...values, matricula: "AA-01-AA", modelo: "Final", Ano: 65535, mes: 255 } })).toMatchObject({ kind: "saved", vehicles: [{ ...saved.vehicles[0], modelo: "Final", Ano: 65535, mes: 255 }] });
});

it("SRC-725ba0d1e9 lookup retains orphan records while SRC-1b24326708 list inner join omits them", async () => {
  await database.query('INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ($1,999,$2,NULL)', ["ORPHAN", "Original  "]);
  expect(await lookupVehicle(connect, { registration: "ORPHAN" })).toMatchObject({ kind: "loaded", vehicle: { matricula: "ORPHAN", Cliente: "999", marca: "Original  ", modelo: null } });
  const list = await listVehicles(connect, { mode: "todos", term: "" });
  expect(list.kind).toBe("loaded");
  if (list.kind !== "loaded") throw new Error("List failed");
  expect(new Set(list.vehicles.map(row => row.matricula))).toEqual(new Set(["AA-01-AA", "GOLDEN-01"]));
  for (const [mode, term] of [["matricula", "AA-01"], ["cliente", "d'Água"], ["marca_modelo", "D'Água"], ["marca_modelo", "Final"]]) {
    const filtered = await listVehicles(connect, { mode, term });
    expect(filtered.kind).toBe("loaded");
    if (filtered.kind !== "loaded") throw new Error("Filter failed");
    expect(new Set(filtered.vehicles.map(row => row.matricula))).toEqual(new Set(mode === "cliente" || term === "Final" ? ["AA-01-AA", "GOLDEN-01"] : ["AA-01-AA"]));
  }
  expect(await listVehicles(connect, { mode: "matricula", term: "' OR 1=1 --" })).toEqual({ kind: "loaded", vehicles: [] });
});

it("ADR-010 preserves duplicate predicate scope for source SQL edit/delete and unbound values", async () => {
  await database.query('INSERT INTO app."Viaturas" ("matricula","Cliente","ViaturasID") VALUES ($1,$2,100),($1,$2,101)', ["DUP", values.Cliente]);
  const changed = await saveVehicle(connect, { mode: "update", originalRegistration: "DUP", values: { ...values, matricula: "DUP", modelo: "Both" } });
  expect(changed.kind).toBe("saved");
  if (changed.kind !== "saved") throw new Error("Edit failed");
  expect(changed.vehicles).toHaveLength(2);
  expect(new Set(changed.vehicles.map(row => row.ViaturasID))).toEqual(new Set(["100", "101"]));
  expect(changed.vehicles.every(row => row.modelo === "Both")).toBe(true);
  expect(await deleteVehicle(connect, { registration: "DUP" })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT count(*)::text AS count FROM app."Viaturas" WHERE "matricula"=$1', ["DUP"])).rows[0].count).toBe("0");
});

it("SRC-626e614259 rechecks repair orders after preconfirmation and preserves protected vehicle", async () => {
  await saveVehicle(connect, { mode: "create", values: { ...values, matricula: "PROTECTED" } });
  expect(await checkVehicleDelete(connect, { registration: "PROTECTED" })).toEqual({ kind: "ready" });
  await database.query('INSERT INTO app."ordem_reparacao" ("matricula") VALUES ($1)', ["PROTECTED"]);
  const associated = { kind: "associated", message: "Viatura usada em ordens de reparação, não pode ser eliminada" };
  expect(await checkVehicleDelete(connect, { registration: "PROTECTED" })).toEqual(associated);
  expect(await deleteVehicle(connect, { registration: "PROTECTED" })).toEqual(associated);
  expect((await lookupVehicle(connect, { registration: "PROTECTED" })).kind).toBe("loaded");
});

it("ADR-010 rolls back real database failure and serializes competing registration creates", async () => {
  const results = await Promise.all([1, 2].map(() => saveVehicle(connect, { mode: "create", values: { ...values, matricula: "RACE" } })));
  expect(results.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  await database.query(`CREATE FUNCTION public.reject_vehicle() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_vehicle BEFORE INSERT ON app."Viaturas" FOR EACH ROW EXECUTE FUNCTION public.reject_vehicle()');
  try { expect(await saveVehicle(connect, { mode: "create", values: { ...values, matricula: "ROLLBACK" } })).toEqual({ kind: "failed" }); }
  finally { await database.query('DROP TRIGGER reject_vehicle ON app."Viaturas"'); }
  expect(await lookupVehicle(connect, { registration: "ROLLBACK" })).toEqual({ kind: "missing" });
  expect(await saveVehicle(connect, { mode: "create", values: { ...values, matricula: "" } })).toEqual({ kind: "required", message: "Falta indicar a matrícula" });
});

it("ADR-004 vehicle HTTP routes deny anonymous access and exercise authenticated real database operations", async () => {
  const denied = createApp({ vehicleConnect: connect });
  for (const action of ["list", "lookup", "save", "delete", "check-delete"]) {
    expect((await denied.inject({ method: "POST", url: `/api/vehicles/${action}`, payload: {} })).statusCode).toBe(401);
  }
  await denied.close();
  const app = createApp({ vehicleConnect: connect, authenticate: async () => ({ userId: "synthetic-test" }) });
  try {
    const result = await app.inject({ method: "POST", url: "/api/vehicles/save", payload: { mode: "create", values: { ...values, matricula: "API" } } });
    expect(result.json().kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/vehicles/lookup", payload: { registration: "API" } })).json()).toMatchObject({ kind: "loaded", vehicle: { matricula: "API" } });
    expect((await app.inject({ method: "POST", url: "/api/vehicles/delete", payload: { registration: "API" } })).json()).toEqual({ kind: "deleted" });
  } finally { await app.close(); }
});
