import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import { deleteDescriptiveState, listDescriptiveStates, saveDescriptiveState } from "./descriptive-states";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);

it("SRC-0a8d1af823 validates before writes, accepts blank description/text zero and retains immutable code", async () => {
  expect(await saveDescriptiveState(connect, { mode: "create", values: { Codigo: "", Descricao: "" } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  expect((await database.query('SELECT count(*)::text AS count FROM app."estados_descritivos"')).rows[0].count).toBe("0");
  const saved = await saveDescriptiveState(connect, { mode: "create", values: { Codigo: "0", Descricao: "" } });
  expect(saved.kind).toBe("saved"); if (saved.kind !== "saved") throw new Error("DescriptiveState setup failed");
  expect(saved.descriptiveState).toMatchObject({ Codigo: "0", Descricao: "" });
  expect(await saveDescriptiveState(connect, { mode: "update", id: saved.descriptiveState.id, values: { Codigo: "X", Descricao: "Changed" } })).toEqual({ kind: "codeLocked" });
  const edited = await saveDescriptiveState(connect, { mode: "update", id: saved.descriptiveState.id, values: { Codigo: "0", Descricao: "d'Água  " } });
  expect(edited).toEqual({ kind: "saved", descriptiveState: { ...saved.descriptiveState, Descricao: "d'Água  " } });
  expect(await saveDescriptiveState(connect, { mode: "create", values: { Codigo: "0", Descricao: null } })).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 0" });
});

it("ADR-015 serializes exact duplicate creation and preserves duplicate imported identities during edit/delete", async () => {
  const race = await Promise.all([1, 2].map(() => saveDescriptiveState(connect, { mode: "create", values: { Codigo: "R", Descricao: null } })));
  expect(race.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  const imported = await database.query<{ id: string }>('INSERT INTO app."estados_descritivos" ("estados_descritivosID","Codigo","Descricao") VALUES (9007199254740993,$1,NULL),(9007199254740994,$1,$2) RETURNING _row_id::text AS id', ["DUP", "Original  "]);
  expect(await saveDescriptiveState(connect, { mode: "update", id: imported.rows[0].id, values: { Codigo: "DUP", Descricao: "Changed" } })).toMatchObject({ kind: "saved", descriptiveState: { estados_descritivosID: "9007199254740993", Descricao: "Changed" } });
  expect(await deleteDescriptiveState(connect, { id: imported.rows[0].id })).toEqual({ kind: "deleted" });
  const remaining = await database.query('SELECT "estados_descritivosID"::text,"Descricao" FROM app."estados_descritivos" WHERE "Codigo"=$1', ["DUP"]);
  expect(remaining.rows).toEqual([{ estados_descritivosID: "9007199254740994", Descricao: "Original  " }]);
});

it("ADR-015 actual database failure rolls back and mapped list sorting retains exact nullable text", async () => {
  await database.query(`CREATE FUNCTION public.reject_descriptiveState() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_descriptiveState BEFORE INSERT ON app."estados_descritivos" FOR EACH ROW EXECUTE FUNCTION public.reject_descriptiveState()');
  try { expect(await saveDescriptiveState(connect, { mode: "create", values: { Codigo: "ERR", Descricao: "" } })).toEqual({ kind: "failed" }); }
  finally { await database.query('DROP TRIGGER reject_descriptiveState ON app."estados_descritivos"'); }
  expect((await database.query('SELECT count(*)::text AS count FROM app."estados_descritivos" WHERE "Codigo"=$1', ["ERR"])).rows[0].count).toBe("0");
  const list = await listDescriptiveStates(connect, {});
  expect(list.kind).toBe("loaded"); if (list.kind !== "loaded") throw new Error("List failed");
  expect(list.descriptiveStates.find(row => row.Codigo === "R")?.Descricao).toBeNull();
  expect(list.descriptiveStates.find(row => row.Codigo === "0")?.Descricao).toBe("d'Água  ");
  expect(await listDescriptiveStates(connect, { sort: 'Codigo";DROP TABLE estados_descritivos;--' })).toEqual({ kind: "invalid" });
});

it("ADR-004 descriptiveState routes deny anonymous calls and actual authenticated API saves and deletes", async () => {
  const denied = createApp({ descriptiveStateConnect: connect });
  for (const action of ["list", "save", "delete"]) expect((await denied.inject({ method: "POST", url: `/api/descriptive-states/${action}`, payload: {} })).statusCode).toBe(401);
  await denied.close();
  const app = createApp({ descriptiveStateConnect: connect, authenticate: async () => ({ userId: "synthetic-test" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/descriptive-states/save", payload: { mode: "create", values: { Codigo: "API", Descricao: "" } } })).json();
    expect(saved.kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/descriptive-states/list", payload: {} })).json().descriptiveStates.some((row: { Codigo: string }) => row.Codigo === "API")).toBe(true);
    expect((await app.inject({ method: "POST", url: "/api/descriptive-states/delete", payload: { id: saved.descriptiveState.id } })).json()).toEqual({ kind: "deleted" });
  } finally { await app.close(); }
});

it("GS-DESCRIPTIVE-STATES-001 real API create/edit/duplicate matches spec-derived export", async () => {
  const app = createApp({ descriptiveStateConnect: connect, authenticate: async () => ({ userId: "synthetic-golden" }) });
  try {
    const initial = { Codigo: "GLD", Descricao: "" };
    const saved = (await app.inject({ method: "POST", url: "/api/descriptive-states/save", payload: { mode: "create", values: initial } })).json();
    expect(saved.kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/descriptive-states/save", payload: { mode: "update", id: saved.descriptiveState.id, values: { ...initial, Descricao: "Final" } } })).json().kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/descriptive-states/save", payload: { mode: "create", values: { ...initial, Descricao: "Duplicate" } } })).json().kind).toBe("duplicate");
    const exported = await database.query<{ Codigo: string; Descricao: string }>('SELECT "Codigo","Descricao" FROM app."estados_descritivos" WHERE _row_id=$1', [saved.descriptiveState.id]);
    const target = resolve(server.directory, "descriptiveState-golden"); await mkdir(target);
    const csv = (value: string) => '"' + value.replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "estados_descritivos.csv"), "Codigo,Descricao\n" + exported.rows.map(row => [row.Codigo, row.Descricao].map(csv).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-DESCRIPTIVE-STATES-001/compare.json", "--legacy", "docs/golden/GS-DESCRIPTIVE-STATES-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

it("ADR-002 SRC-0a8d1af823 refuses exhausted signed 8-byte automatic identifiers without writing", async () => {
  const maximum = await database.query<{ id: string }>('INSERT INTO app."estados_descritivos" ("estados_descritivosID","Codigo") VALUES (9223372036854775807,$1) RETURNING _row_id::text AS id', ["TOP"]);
  try {
    expect(await saveDescriptiveState(connect, { mode: "create", values: { Codigo: "MAX", Descricao: "" } })).toEqual({ kind: "failed" });
    expect((await database.query('SELECT count(*)::text AS count FROM app."estados_descritivos" WHERE "Codigo"=$1', ["MAX"])).rows[0].count).toBe("0");
  } finally { await database.query('DELETE FROM app."estados_descritivos" WHERE _row_id=$1', [maximum.rows[0].id]); }
});
