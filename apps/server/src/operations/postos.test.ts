import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import type { PostoValues } from "../../../../packages/domain/src/postos";
import { deletePosto, listPostos, savePosto } from "./postos";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const initial: PostoValues = { Codigo: 255, Descricao: "d'Água  ", terminal: "???" };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);

it("SRC-78dffe2a53 validates code then description before acquiring a connection or writing", async () => {
  let connections = 0;
  const observedConnect = async () => { connections += 1; return connect(); };
  for (const Codigo of [0, null]) expect(await savePosto(observedConnect, { mode: "create", values: { ...initial, Codigo, Descricao: "" } })).toEqual({ kind: "required", message: "Indique um código" });
  for (const Descricao of ["", null]) expect(await savePosto(observedConnect, { mode: "create", values: { ...initial, Descricao } })).toEqual({ kind: "required", message: "Indique uma descrição" });
  for (const values of [{ ...initial, Codigo: 256 }, { ...initial, Codigo: "1" }, { ...initial, Descricao: "x".repeat(51) }, { ...initial, terminal: "ABCD" }, { ...initial, teste: "forbidden" }]) expect(await savePosto(observedConnect, { mode: "create", values })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0);
  expect((await database.query('SELECT count(*)::text AS n FROM app."postos"')).rows[0].n).toBe("0");
});

it("SRC-78dffe2a53 SRC-591960029c persists byte255, optional orphan terminal, code changes and hidden field exactly", async () => {
  const saved = await savePosto(connect, { mode: "create", values: initial });
  if (saved.kind !== "saved") throw new Error("Posto setup failed");
  expect(saved.posto).toEqual({ ...initial, id: expect.any(String), teste: "" });
  await database.query('UPDATE app."postos" SET "teste"=$1 WHERE _row_id=$2', ["hidden d'Água  ", saved.posto.id]);
  const edited = await savePosto(connect, { mode: "update", id: saved.posto.id, values: { ...initial, Descricao: "  ", terminal: null } });
  expect(edited).toEqual({ kind: "saved", posto: { ...saved.posto, Descricao: "  ", terminal: null, teste: "hidden d'Água  " } });
  const changed = await savePosto(connect, { mode: "update", id: saved.posto.id, values: { Codigo: 254, Descricao: "After numeric key change", terminal: "" } });
  expect(changed).toEqual({ kind: "saved", posto: { ...saved.posto, Codigo: 254, Descricao: "After numeric key change", terminal: "", teste: "hidden d'Água  " } });
  const rows = await database.query('SELECT "Codigo","Descricao","terminal","teste" FROM app."postos" WHERE _row_id=$1', [saved.posto.id]);
  expect(rows.rows).toEqual([{ Codigo: 254, Descricao: "After numeric key change", terminal: "", teste: "hidden d'Água  " }]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."Terminais"')).rows[0].n).toBe("0");
});

it("SRC-591960029c lists original NULLs and preserves hidden NULL while correcting an imported row", async () => {
  const imported = await database.query<{ id: string }>('INSERT INTO app."postos" ("Codigo","Descricao","terminal","teste") VALUES (NULL,NULL,NULL,NULL) RETURNING _row_id::text AS id');
  const list = await listPostos(connect, { sort: "Descricao", descending: true });
  if (list.kind !== "loaded") throw new Error("Posto list failed");
  expect(list.postos.find(row => row.id === imported.rows[0].id)).toEqual({ id: imported.rows[0].id, Codigo: null, Descricao: null, terminal: null, teste: null });
  const values = { Codigo: 1, Descricao: "x');DROP TABLE postos;--", terminal: "'" };
  expect(await savePosto(connect, { mode: "update", id: imported.rows[0].id, values })).toEqual({ kind: "saved", posto: { ...values, id: imported.rows[0].id, teste: null } });
  expect((await database.query('SELECT "Descricao","terminal","teste" FROM app."postos" WHERE _row_id=$1', [imported.rows[0].id])).rows).toEqual([{ Descricao: values.Descricao, terminal: "'", teste: null }]);
  expect(await listPostos(connect, { sort: 'Codigo";DROP TABLE postos;--' })).toEqual({ kind: "invalid" });
  expect(await deletePosto(connect, { id: "1 OR 1=1" })).toEqual({ kind: "invalid" });
});

it("ADR-016 SRC-78dffe2a53 serializes create/create and selected-id update/update numeric duplicates", async () => {
  const creates = await Promise.all([1, 2].map(() => savePosto(connect, { mode: "create", values: { ...initial, Codigo: 200 } })));
  expect(creates.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  expect(creates.find(result => result.kind === "duplicate")).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 200" });
  const first = await savePosto(connect, { mode: "create", values: { ...initial, Codigo: 201 } });
  const second = await savePosto(connect, { mode: "create", values: { ...initial, Codigo: 202 } });
  if (first.kind !== "saved" || second.kind !== "saved") throw new Error("Posto race setup failed");
  const updates = await Promise.all([first, second].map(result => savePosto(connect, { mode: "update", id: result.posto.id, values: { ...initial, Codigo: 203 } })));
  expect(updates.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."postos" WHERE "Codigo"=203')).rows[0].n).toBe("1");
  const remaining = await database.query<{ Codigo: number }>('SELECT "Codigo" FROM app."postos" WHERE _row_id=ANY($1::bigint[]) ORDER BY "Codigo"', [[first.posto.id, second.posto.id]]);
  expect(remaining.rows).toHaveLength(2);
  expect(remaining.rows.filter(row => row.Codigo === 201 || row.Codigo === 202)).toHaveLength(1);
});

it("ADR-016 SRC-78dffe2a53 serializes create/update collisions and excludes the selected row itself", async () => {
  const saved = await savePosto(connect, { mode: "create", values: { ...initial, Codigo: 210 } });
  if (saved.kind !== "saved") throw new Error("Posto race setup failed");
  const values = { ...initial, Codigo: 211 };
  const race = await Promise.all([savePosto(connect, { mode: "create", values }), savePosto(connect, { mode: "update", id: saved.posto.id, values })]);
  expect(race.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."postos" WHERE "Codigo"=211')).rows[0].n).toBe("1");
  const selected = await database.query<{ Codigo: number }>('SELECT "Codigo" FROM app."postos" WHERE _row_id=$1', [saved.posto.id]);
  expect(await savePosto(connect, { mode: "update", id: saved.posto.id, values: { ...initial, Codigo: selected.rows[0].Codigo, Descricao: "Same key remains editable" } })).toMatchObject({ kind: "saved", posto: { id: saved.posto.id, Descricao: "Same key remains editable" } });
});

it("SRC-55285e57c4 deletes only the selected row without requiring terminal existence or adding a relationship guard", async () => {
  const first = await savePosto(connect, { mode: "create", values: { ...initial, Codigo: 220, terminal: "ORP" } });
  const second = await savePosto(connect, { mode: "create", values: { ...initial, Codigo: 221, terminal: "ORP" } });
  if (first.kind !== "saved" || second.kind !== "saved") throw new Error("Posto delete setup failed");
  expect(await deletePosto(connect, { id: first.posto.id })).toEqual({ kind: "deleted" });
  expect(await deletePosto(connect, { id: first.posto.id })).toEqual({ kind: "missing" });
  expect(await savePosto(connect, { mode: "update", id: first.posto.id, values: { ...initial, Codigo: 220 } })).toEqual({ kind: "missing" });
  expect((await database.query('SELECT "Codigo","terminal" FROM app."postos" WHERE _row_id=$1', [second.posto.id])).rows).toEqual([{ Codigo: 221, terminal: "ORP" }]);
});

it("ADR-016 actual PostgreSQL trigger failures roll back create, update, delete and dependent effects", async () => {
  const saved = await savePosto(connect, { mode: "create", values: { ...initial, Codigo: 230 } });
  if (saved.kind !== "saved") throw new Error("Posto rollback setup failed");
  await database.query('CREATE TABLE public.posto_effects (operation text)');
  await database.query(`CREATE FUNCTION public.reject_posto() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.posto_effects VALUES (TG_OP); RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_posto BEFORE INSERT OR UPDATE OR DELETE ON app."postos" FOR EACH ROW EXECUTE FUNCTION public.reject_posto()');
  try {
    expect(await savePosto(connect, { mode: "create", values: { ...initial, Codigo: 231 } })).toEqual({ kind: "failed" });
    expect(await savePosto(connect, { mode: "update", id: saved.posto.id, values: { ...initial, Codigo: 232 } })).toEqual({ kind: "failed" });
    expect(await deletePosto(connect, { id: saved.posto.id })).toEqual({ kind: "failed" });
  } finally { await database.query('DROP TRIGGER reject_posto ON app."postos"'); }
  expect((await database.query('SELECT "Codigo","Descricao","terminal","teste" FROM app."postos" WHERE _row_id=$1', [saved.posto.id])).rows).toEqual([{ ...initial, Codigo: 230, teste: "" }]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."postos" WHERE "Codigo" IN (231,232)')).rows[0].n).toBe("0");
  expect((await database.query('SELECT count(*)::text AS n FROM public.posto_effects')).rows[0].n).toBe("0");
});

it("ADR-016 connection refusal and a terminated real backend return typed failures without writes", async () => {
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_postos_database");
  expect(await listPostos(unavailable, {})).toEqual({ kind: "failed" });
  expect(await savePosto(unavailable, { mode: "create", values: { ...initial, Codigo: 240 } })).toEqual({ kind: "failed" });
  expect(await deletePosto(unavailable, { id: "1" })).toEqual({ kind: "failed" });
  const terminated: DatabaseConnection = async () => {
    const client = await connect();
    client.on("error", () => undefined);
    const pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    await database.query("SELECT pg_terminate_backend($1)", [pid]);
    return client;
  };
  expect(await listPostos(terminated, {})).toEqual({ kind: "failed" });
  expect(await savePosto(terminated, { mode: "create", values: { ...initial, Codigo: 241 } })).toEqual({ kind: "failed" });
  expect(await deletePosto(terminated, { id: "1" })).toEqual({ kind: "failed" });
  expect((await database.query('SELECT count(*)::text AS n FROM app."postos" WHERE "Codigo" IN (240,241)')).rows[0].n).toBe("0");
});

it("ADR-004 actual Postos routes deny anonymous requests and persist authenticated list/save/delete", async () => {
  const denied = createApp({ postoConnect: connect });
  for (const action of ["list", "save", "delete"]) expect((await denied.inject({ method: "POST", url: `/api/postos/${action}`, payload: {} })).statusCode).toBe(401);
  await denied.close();
  const app = createApp({ postoConnect: connect, authenticate: async () => ({ userId: "synthetic-postos" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/postos/save", payload: { mode: "create", values: { ...initial, Codigo: 250 } } })).json();
    expect(saved.kind).toBe("saved");
    expect((await app.inject({ method: "POST", url: "/api/postos/list", payload: { sort: "Codigo", descending: true } })).json().postos.some((row: { id: string; Codigo: number }) => row.id === saved.posto.id && row.Codigo === 250)).toBe(true);
    expect((await app.inject({ method: "POST", url: "/api/postos/delete", payload: { id: saved.posto.id } })).json()).toEqual({ kind: "deleted" });
    expect((await database.query('SELECT count(*)::text AS n FROM app."postos" WHERE _row_id=$1', [saved.posto.id])).rows[0].n).toBe("0");
  } finally { await app.close(); }
});

it("GS-POSTOS-001 actual API code change/duplicate and preserved hidden value match spec-derived export", async () => {
  const app = createApp({ postoConnect: connect, authenticate: async () => ({ userId: "synthetic-postos-golden" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/postos/save", payload: { mode: "create", values: { Codigo: 77, Descricao: "Initial", terminal: null } } })).json();
    expect(saved.kind).toBe("saved");
    await database.query('UPDATE app."postos" SET "teste"=$1 WHERE _row_id=$2', ["kept  ", saved.posto.id]);
    const values = { Codigo: 78, Descricao: "Final d'Água  ", terminal: "X01" };
    expect((await app.inject({ method: "POST", url: "/api/postos/save", payload: { mode: "update", id: saved.posto.id, values } })).json()).toMatchObject({ kind: "saved", posto: { ...values, teste: "kept  " } });
    expect((await app.inject({ method: "POST", url: "/api/postos/save", payload: { mode: "create", values } })).json().kind).toBe("duplicate");
    const exported = await database.query('SELECT "Codigo","Descricao","terminal","teste" FROM app."postos" WHERE _row_id=$1', [saved.posto.id]);
    const target = resolve(server.directory, "posto-golden"); await mkdir(target);
    const columns = ["Codigo", "Descricao", "terminal", "teste"], csv = (value: unknown) => '"' + String(value).replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "postos.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(key => csv(row[key])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-POSTOS-001/compare.json", "--legacy", "docs/golden/GS-POSTOS-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});
