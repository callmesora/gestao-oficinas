import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { CustomerConnection } from "./customers";
import { checkUnitDelete, deleteUnit, listUnits, saveUnit } from "./units";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: CustomerConnection;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);

it("SRC-a5097f5947 validates before writes, accepts blank description/text zero and retains immutable code", async () => {
  expect(await saveUnit(connect, { mode: "create", values: { Codigo: "", Descricao: "" } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  expect((await database.query('SELECT count(*)::text AS count FROM app."unidades"')).rows[0].count).toBe("0");
  const saved = await saveUnit(connect, { mode: "create", values: { Codigo: "0", Descricao: "" } });
  expect(saved.kind).toBe("saved"); if (saved.kind !== "saved") throw new Error("Unit setup failed");
  expect(saved.unit).toMatchObject({ Codigo: "0", Descricao: "" });
  expect(await saveUnit(connect, { mode: "update", id: saved.unit.id, values: { Codigo: "X", Descricao: "Changed" } })).toEqual({ kind: "codeLocked" });
  const edited = await saveUnit(connect, { mode: "update", id: saved.unit.id, values: { Codigo: "0", Descricao: "d'Água  " } });
  expect(edited).toEqual({ kind: "saved", unit: { ...saved.unit, Descricao: "d'Água  " } });
  expect(await saveUnit(connect, { mode: "create", values: { Codigo: "0", Descricao: null } })).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 0" });
});

it("ADR-011 serializes exact duplicate creation and preserves duplicate imported identities during edit/delete", async () => {
  const race = await Promise.all([1, 2].map(() => saveUnit(connect, { mode: "create", values: { Codigo: "R", Descricao: null } })));
  expect(race.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  const imported = await database.query<{ id: string }>('INSERT INTO app."unidades" ("unidadesID","Codigo","Descricao") VALUES (9007199254740993,$1,NULL),(9007199254740994,$1,$2) RETURNING _row_id::text AS id', ["DUP", "Original  "]);
  expect(await saveUnit(connect, { mode: "update", id: imported.rows[0].id, values: { Codigo: "DUP", Descricao: "Changed" } })).toMatchObject({ kind: "saved", unit: { unidadesID: "9007199254740993", Descricao: "Changed" } });
  expect(await deleteUnit(connect, { id: imported.rows[0].id })).toEqual({ kind: "deleted" });
  const remaining = await database.query('SELECT "unidadesID"::text,"Descricao" FROM app."unidades" WHERE "Codigo"=$1', ["DUP"]);
  expect(remaining.rows).toEqual([{ unidadesID: "9007199254740994", Descricao: "Original  " }]);
});

it("SRC-226f5f62f3 rechecks articles after preconfirmation and retains protected unit", async () => {
  const saved = await saveUnit(connect, { mode: "create", values: { Codigo: "USE", Descricao: "" } });
  if (saved.kind !== "saved") throw new Error("Unit setup failed");
  expect(await checkUnitDelete(connect, { id: saved.unit.id })).toEqual({ kind: "ready" });
  await database.query('INSERT INTO app."artigos" ("unidade") VALUES ($1)', ["USE"]);
  const expected = { kind: "associated", message: "Unidade usada em artigos, não pode ser eliminada" };
  expect(await checkUnitDelete(connect, { id: saved.unit.id })).toEqual(expected);
  expect(await deleteUnit(connect, { id: saved.unit.id })).toEqual(expected);
  expect((await database.query('SELECT count(*)::text AS count FROM app."unidades" WHERE _row_id=$1', [saved.unit.id])).rows[0].count).toBe("1");
});

it("ADR-011 actual database failure rolls back and mapped list sorting retains exact nullable text", async () => {
  await database.query(`CREATE FUNCTION public.reject_unit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_unit BEFORE INSERT ON app."unidades" FOR EACH ROW EXECUTE FUNCTION public.reject_unit()');
  try { expect(await saveUnit(connect, { mode: "create", values: { Codigo: "ERR", Descricao: "" } })).toEqual({ kind: "failed" }); }
  finally { await database.query('DROP TRIGGER reject_unit ON app."unidades"'); }
  expect((await database.query('SELECT count(*)::text AS count FROM app."unidades" WHERE "Codigo"=$1', ["ERR"])).rows[0].count).toBe("0");
  const list = await listUnits(connect, {});
  expect(list.kind).toBe("loaded"); if (list.kind !== "loaded") throw new Error("List failed");
  expect(list.units.find(row => row.Codigo === "R")?.Descricao).toBeNull();
  expect(list.units.find(row => row.Codigo === "0")?.Descricao).toBe("d'Água  ");
  expect(await listUnits(connect, { sort: 'Codigo";DROP TABLE unidades;--' })).toEqual({ kind: "invalid" });
});

it("ADR-004 unit routes deny anonymous calls and actual authenticated API saves and deletes", async () => {
  const denied = createApp({ unitConnect: connect });
  for (const action of ["list", "save", "delete", "check-delete"]) expect((await denied.inject({ method: "POST", url: `/api/units/${action}`, payload: {} })).statusCode).toBe(401);
  await denied.close();
  const app = createApp({ unitConnect: connect, authenticate: async () => ({ userId: "synthetic-test" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/units/save", payload: { mode: "create", values: { Codigo: "API", Descricao: "" } } })).json();
    expect(saved.kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/units/list", payload: {} })).json().units.some((row: { Codigo: string }) => row.Codigo === "API")).toBe(true);
    expect((await app.inject({ method: "POST", url: "/api/units/delete", payload: { id: saved.unit.id } })).json()).toEqual({ kind: "deleted" });
  } finally { await app.close(); }
});

it("GS-UNITS-001 real API create/edit/duplicate matches spec-derived export", async () => {
  const app = createApp({ unitConnect: connect, authenticate: async () => ({ userId: "synthetic-golden" }) });
  try {
    const initial = { Codigo: "GLD", Descricao: "" };
    const saved = (await app.inject({ method: "POST", url: "/api/units/save", payload: { mode: "create", values: initial } })).json();
    expect(saved.kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/units/save", payload: { mode: "update", id: saved.unit.id, values: { ...initial, Descricao: "Final" } } })).json().kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/units/save", payload: { mode: "create", values: { ...initial, Descricao: "Duplicate" } } })).json().kind).toBe("duplicate");
    const exported = await database.query<{ Codigo: string; Descricao: string }>('SELECT "Codigo","Descricao" FROM app."unidades" WHERE _row_id=$1', [saved.unit.id]);
    const target = resolve(server.directory, "unit-golden"); await mkdir(target);
    const csv = (value: string) => '"' + value.replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "unidades.csv"), "Codigo,Descricao\n" + exported.rows.map(row => [row.Codigo, row.Descricao].map(csv).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-UNITS-001/compare.json", "--legacy", "docs/golden/GS-UNITS-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

it("ADR-002 SRC-a5097f5947 refuses exhausted signed 8-byte automatic identifiers without writing", async () => {
  const maximum = await database.query<{ id: string }>('INSERT INTO app."unidades" ("unidadesID","Codigo") VALUES (9223372036854775807,$1) RETURNING _row_id::text AS id', ["TOP"]);
  try {
    expect(await saveUnit(connect, { mode: "create", values: { Codigo: "MAX", Descricao: "" } })).toEqual({ kind: "failed" });
    expect((await database.query('SELECT count(*)::text AS count FROM app."unidades" WHERE "Codigo"=$1', ["MAX"])).rows[0].count).toBe("0");
  } finally { await database.query('DELETE FROM app."unidades" WHERE _row_id=$1', [maximum.rows[0].id]); }
});
