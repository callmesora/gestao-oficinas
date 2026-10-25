import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  // Only synthetic rows in this newly created scratch database.
  await database.query('TRUNCATE app."Clientes",app."unidades",app."estados_descritivos",app."estados_reparacao",app."documentos" RESTART IDENTITY');
});

const resources = [
  { table: "Clientes", field: "ClientesID", resource: "customers", rows: "customers", input: { mode: "todos", term: "" } },
  { table: "unidades", field: "unidadesID", resource: "units", rows: "units", input: {} },
  { table: "estados_descritivos", field: "estados_descritivosID", resource: "descriptive-states", rows: "descriptiveStates", input: {} },
  { table: "estados_reparacao", field: "estados_reparacaoID", resource: "repair-states", rows: "repairStates", input: {} },
  { table: "documentos", field: "documentosID", resource: "document-types", rows: "documentTypes", input: {} },
] as const;
const numeric = ["-10", "-2", "2", "10", "9007199254740992", "9007199254740993"];

function app() {
  return createApp({ customerConnect: connect, unitConnect: connect, descriptiveStateConnect: connect, repairStateConnect: connect, documentTypeConnect: connect, authenticate: async () => ({ userId: "synthetic-typed-order" }) });
}

it.each(resources)("ADR-002 ADR-011 $resource orders source numeric identities before lossless string transport", async ({ table, field, resource, rows, input }) => {
  // Hardcoded audited table/field names only. Reverse insertion makes row identity an independent tie-breaker.
  for (const value of [...numeric].reverse()) await database.query(`INSERT INTO app."${table}" ("${field}") VALUES ($1)`, [value]);
  await database.query(`INSERT INTO app."${table}" ("${field}") VALUES (NULL)`);
  const before = (await database.query(`SELECT to_jsonb(t) AS row FROM app."${table}" t ORDER BY _row_id`)).rows;
  const api = app();
  try {
    // Clientes' public whitelist has no automatic-ID sort; its default still browses ClientesID.
    const sorts = resource === "customers" ? [undefined] : [undefined, field];
    for (const sort of sorts) for (const descending of [false, true]) {
      const response = await api.inject({ method: "POST", url: `/api/${resource}/list`, payload: { ...input, ...(sort ? { sort } : {}), descending } });
      expect(response.statusCode).toBe(200); const result = response.json(); expect(result.kind).toBe("loaded");
      const records = result[rows] as Record<string, string | null>[];
      // NULL/tie placement remains a U02 default, not a legacy order claim.
      const expected = resource === "customers" || !descending ? numeric : [...numeric].reverse();
      expect(records.filter(row => row[field] !== null).map(row => row[field])).toEqual(expected);
      expect(records.filter(row => row[field] === null)).toHaveLength(1);
      expect(records.every(row => typeof row.id === "string")).toBe(true);
    }
    expect((await database.query(`SELECT to_jsonb(t) AS row FROM app."${table}" t ORDER BY _row_id`)).rows).toEqual(before);
  } finally { await api.close(); }
});

it("ADR-002 customer numeric code sorting retains exact unsigned64 strings and filter/max semantics", async () => {
  const codes = ["2", "10", "9007199254740992", "9007199254740993", "18446744073709551615"];
  for (const value of [...codes].reverse()) await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES ($1,$2)', [value, "typed-order"]);
  await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (NULL,$1)', ["typed-order"]);
  const api = app();
  try {
    for (const descending of [false, true]) {
      const response = await api.inject({ method: "POST", url: "/api/customers/list", payload: { mode: "descricao", term: "typed-order", sort: "Codigo", descending } });
      expect(response.statusCode).toBe(200); const result = response.json(); expect(result.kind).toBe("loaded");
      const records = result.customers as { Codigo: string | null }[];
      expect(records.filter(row => row.Codigo !== null).map(row => row.Codigo)).toEqual(descending ? [...codes].reverse() : codes);
      expect(records.filter(row => row.Codigo === null)).toHaveLength(1); expect(result.nextCode).toBe("18446744073709551616");
    }
    const filtered = await api.inject({ method: "POST", url: "/api/customers/list", payload: { mode: "codigo", term: "900719925474099", sort: "Codigo" } });
    expect(filtered.json().customers.map((row: { Codigo: string }) => row.Codigo)).toEqual(["9007199254740992", "9007199254740993"]);
    expect(filtered.json().nextCode).toBe("9007199254740994");
  } finally { await api.close(); }
});
