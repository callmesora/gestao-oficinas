import type { DatabaseConnection } from "../db/connection";
import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { deleteCustomer, saveCustomer } from "./customers";
import { createApp } from "../app";
import { developmentSessions } from "../development-sessions";
import type { CustomerValues } from "../../../../packages/domain/src/customers";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const values: CustomerValues = { Codigo: "9007199254740993", Descricao: "Oficina d'Água  ", Morada1: null, Morada2: "", codpostal: "0123-001", Telefone1: "0012", Telemovel: "", observacao: "linha 1\r\nlinha 2 " };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);

it("MIG-7C customer API allocates the final signed source ID and refuses exhaustion without writing", async () => {
  const app = createApp({ customerConnect: connect, authenticate: async () => ({ userId: "synthetic-boundary" }) });
  const sentinel = await database.query<{ id: string }>('INSERT INTO app."Clientes" ("ClientesID","Codigo") VALUES (9223372036854775806,990001) RETURNING _row_id::text AS id');
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/customers/save", payload: { mode: "create", values: { ...values, Codigo: "990002" } } })).json();
    expect(saved).toMatchObject({ kind: "saved", customer: { ClientesID: "9223372036854775807", Codigo: "990002" } });
    const before = (await database.query('SELECT _row_id::text,"ClientesID"::text,"Codigo"::text FROM app."Clientes" ORDER BY _row_id')).rows;
    expect((await app.inject({ method: "POST", url: "/api/customers/save", payload: { mode: "create", values: { ...values, Codigo: "990003" } } })).json()).toEqual({ kind: "failed" });
    expect((await database.query('SELECT _row_id::text,"ClientesID"::text,"Codigo"::text FROM app."Clientes" ORDER BY _row_id')).rows).toEqual(before);
  } finally {
    await database.query('DELETE FROM app."Clientes" WHERE _row_id=$1 OR "Codigo" IN (990002,990003)', [sentinel.rows[0].id]);
    await app.close();
  }
});

it("GS-CUSTOMERS-001 real API create/edit/duplicate matches the spec-derived export without normalization", async () => {
  const app = createApp({ customerConnect: connect, development: developmentSessions("http://localhost:1431") });
  try {
    const session = await app.inject({ method: "POST", url: "/api/development/session", headers: { origin: "http://localhost:1431", "x-isolated-development": "1" } });
    const headers = { authorization: `Bearer ${session.json().token}` };
    const initial = { Codigo: "812", Descricao: "Golden inicial", Morada1: "M1", Morada2: "M2", codpostal: "1234", Telefone1: "0012", Telemovel: "0034", observacao: "Nota" };
    const created = (await app.inject({ method: "POST", url: "/api/customers/save", headers, payload: { mode: "create", values: initial } })).json();
    expect(created.kind).toBe("saved");
    const edited = await app.inject({ method: "POST", url: "/api/customers/save", headers, payload: { mode: "update", id: created.customer.id, values: { ...initial, Descricao: "Golden final" } } });
    expect(edited.json().kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/customers/save", headers, payload: { mode: "create", values: initial } })).json().kind).toBe("duplicate");
    const columns = ["Codigo", "Descricao", "Morada1", "Morada2", "codpostal", "Telefone1", "Telemovel", "observacao"];
    const exported = await database.query<Record<string, string>>(`SELECT "Codigo"::text,"Descricao","Morada1","Morada2","codpostal","Telefone1","Telemovel","observacao" FROM app."Clientes" WHERE "Codigo"=812`);
    const target = resolve(server.directory, "customer-golden"); await mkdir(target);
    const csv = (value: string) => '"' + value.replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "Clientes.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(column => csv(row[column])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-CUSTOMERS-001/compare.json", "--legacy", "docs/golden/GS-CUSTOMERS-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

it("SRC-51085948c6 real PostgreSQL saves exact fields, rejects duplicate, edits and preserves source identity", async () => {
  const created = await saveCustomer(connect, { mode: "create", values });
  expect(created.kind).toBe("saved"); if (created.kind !== "saved") throw new Error("Customer creation failed");
  expect(created.customer).toMatchObject(values);
  const duplicate = await saveCustomer(connect, { mode: "create", values });
  expect(duplicate).toEqual({ kind: "duplicate", message: `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${values.Codigo}` });
  const changed = await saveCustomer(connect, { mode: "update", id: created.customer.id, values: { ...values, Descricao: "Nova descrição" } });
  expect(changed).toEqual({ kind: "saved", customer: { ...created.customer, Descricao: "Nova descrição" } });
  expect(await saveCustomer(connect, { mode: "update", id: created.customer.id, values: { ...values, Codigo: "2" } })).toEqual({ kind: "codeLocked" });
  const persisted = await database.query('SELECT "Codigo"::text,"Descricao","Morada1","Morada2","observacao" FROM app."Clientes" WHERE _row_id=$1', [created.customer.id]);
  expect(persisted.rows).toEqual([{ Codigo: values.Codigo, Descricao: "Nova descrição", Morada1: null, Morada2: "", observacao: values.observacao }]);
});

it("SRC-51085948c6 validates before writing and database failure rolls back", async () => {
  const before = (await database.query('SELECT count(*)::text AS count FROM app."Clientes"')).rows;
  expect(await saveCustomer(connect, { mode: "create", values: { ...values, Codigo: "0", Descricao: "" } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  expect(await saveCustomer(connect, { mode: "create", values: { ...values, Codigo: "2", Descricao: "" } })).toEqual({ kind: "required", message: "Falta indicar a descrição" });
  expect(await saveCustomer(connect, { mode: "create", values: { ...values, Codigo: "18446744073709551616" } })).toEqual({ kind: "invalid" });
  // Trigger the actual database statement failure, not a mocked repository exception.
  await database.query(`CREATE FUNCTION public.reject_customer() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic write failure'; END $$`);
  await database.query('CREATE TRIGGER reject_customer BEFORE INSERT ON app."Clientes" FOR EACH ROW EXECUTE FUNCTION public.reject_customer()');
  try { expect(await saveCustomer(connect, { mode: "create", values: { ...values, Codigo: "3" } })).toEqual({ kind: "failed" }); }
  finally { await database.query('DROP TRIGGER reject_customer ON app."Clientes"'); }
  expect((await database.query('SELECT count(*)::text AS count FROM app."Clientes"')).rows).toEqual(before);
});

it("ADR-008 concurrent creates allocate distinct automatic identifiers in real transactions", async () => {
  const results = await Promise.all(["41", "42"].map(Codigo => saveCustomer(connect, { mode: "create", values: { ...values, Codigo } })));
  expect(results.every(result => result.kind === "saved")).toBe(true);
  const ids = results.flatMap(result => result.kind === "saved" ? [result.customer.ClientesID] : []);
  expect(new Set(ids).size).toBe(2);
});

it("ADR-004 customer API denies unauthenticated calls before touching the database", async () => {
  const app = createApp({ customerConnect: connect });
  try {
    const result = await app.inject({ method: "POST", url: "/api/customers/save", payload: { mode: "create", values: { ...values, Codigo: "99" } } });
    expect(result.statusCode).toBe(401);
    expect((await database.query('SELECT count(*)::text AS count FROM app."Clientes" WHERE "Codigo"=99')).rows[0].count).toBe("0");
  } finally { await app.close(); }
});

it("SRC-0bb0e89335 real PostgreSQL rejects deletion with vehicles and deletes only the selected unlinked customer", async () => {
  const results = [];
  for (const Codigo of ["61", "62"]) results.push(await saveCustomer(connect, { mode: "create", values: { ...values, Codigo } }));
  const linked = results[0], unlinked = results[1];
  if (linked.kind !== "saved" || unlinked.kind !== "saved") throw new Error("Customer setup failed");
  await database.query('INSERT INTO app."Viaturas" ("matricula","Cliente") VALUES ($1,$2)', ["SYNTHETIC-61", "61"]);
  expect(await deleteCustomer(connect, { id: linked.customer.id })).toEqual({ kind: "associated", message: "Cliente com viaturas associadas, não pode ser eliminado" });
  expect(await deleteCustomer(connect, { id: unlinked.customer.id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "Codigo"::text FROM app."Clientes" WHERE "Codigo" IN (61,62)')).rows).toEqual([{ Codigo: "61" }]);
  const app = createApp({ customerConnect: connect });
  try { expect((await app.inject({ method: "POST", url: "/api/customers/delete", payload: { id: linked.customer.id } })).statusCode).toBe(401); }
  finally { await app.close(); }
});

it("SRC-284e9feb26 real session/API supports mapped search fields and active-filter suggestions without SQL interpolation", async () => {
  const app = createApp({ customerConnect: connect, development: developmentSessions("http://localhost:1431") });
  try {
    expect((await app.inject({ method: "POST", url: "/api/development/session", headers: { origin: "https://untrusted.invalid", "x-isolated-development": "1" } })).statusCode).toBe(403);
    expect((await app.inject({ method: "POST", url: "/api/customers/list", payload: { mode: "todos", term: "" } })).statusCode).toBe(401);
    const session = await app.inject({ method: "POST", url: "/api/development/session", headers: { origin: "http://localhost:1431", "x-isolated-development": "1" } });
    const headers = { authorization: `Bearer ${session.json().token}` };
    const customerValues = { ...values, Codigo: "701", Descricao: "SYNTHETIC_SEARCH", Morada1: "ROAD_SEARCH", Morada2: "SECOND_SEARCH", codpostal: "POST_SEARCH", Telefone1: "PHONE_SEARCH", Telemovel: "MOBILE_SEARCH" };
    const saved = await app.inject({ method: "POST", url: "/api/customers/save", headers, payload: { mode: "create", values: customerValues } });
    expect(saved.json().kind).toBe("saved");
    for (const [mode, term] of [["codigo", "701"], ["descricao", "SYNTHETIC_SEARCH"], ["morada", "ROAD_SEARCH"], ["morada", "SECOND_SEARCH"], ["codigopostal", "POST_SEARCH"], ["telefone", "PHONE_SEARCH"], ["telefone", "MOBILE_SEARCH"]]) {
      const read = await app.inject({ method: "POST", url: "/api/customers/list", headers, payload: { mode, term } });
      expect(read.json()).toMatchObject({ kind: "loaded", customers: [{ Codigo: "701", Descricao: "SYNTHETIC_SEARCH" }], nextCode: "702" });
    }
    const quoted = await app.inject({ method: "POST", url: "/api/customers/list", headers, payload: { mode: "descricao", term: "' OR 1=1 --" } });
    expect(quoted.json()).toEqual({ kind: "loaded", customers: [], nextCode: "1" });
    for (const filter of [{ mode: "todos", term: "does not filter" }, { mode: "descricao", term: "" }]) {
      const read = await app.inject({ method: "POST", url: "/api/customers/list", headers, payload: filter });
      expect(read.json().customers.some((row: { Codigo: string }) => row.Codigo === "701")).toBe(true);
    }
  } finally { await app.close(); }
});
