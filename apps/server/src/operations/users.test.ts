import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { DatabaseConnection } from "../db/connection";
import type { UserValues } from "../../../../packages/domain/src/users";
import { deleteUser, listUsers, readUser, saveUser } from "./users";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
// Synthetic credentials only. This suite never imports original business records or bootstrap values.
const initial: UserValues = { Codigo: 255, Descricao: "Synthetic d'Água  ", palavra_passe: "mIxEd'PaSs  " };
const publicKeys = ["Codigo", "Descricao", "id"];
const gateKey = 731421;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
  await database.query('CREATE TABLE public.user_effects (operation text)');
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  // Only the newly created synthetic scratch database, never an imported/original database.
  await database.query('TRUNCATE app."utilizadores",app."ordem_reparacao",public.user_effects RESTART IDENTITY');
});

it("SRC-7c866e13ff ADR-008 validates required fields in order, then uppercase expansion, before acquisition", async () => {
  let connections = 0;
  const observedConnect = async () => { connections += 1; return connect(); };
  for (const Codigo of [0, null]) expect(await saveUser(observedConnect, { mode: "create", values: { ...initial, Codigo, Descricao: "", palavra_passe: "" } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  for (const Descricao of ["", null]) expect(await saveUser(observedConnect, { mode: "create", values: { ...initial, Descricao, palavra_passe: "" } })).toEqual({ kind: "required", message: "Falta indicar o nome" });
  for (const palavra_passe of ["", null]) expect(await saveUser(observedConnect, { mode: "create", values: { ...initial, palavra_passe } })).toEqual({ kind: "required", message: "Falta indicar a palavra-passe" });
  // The raw eight-character input is valid, but its transformed sixteen-character value is not.
  expect(await saveUser(observedConnect, { mode: "create", values: { ...initial, Codigo: 0, palavra_passe: "ß".repeat(8) } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  expect(await saveUser(observedConnect, { mode: "create", values: { ...initial, Descricao: "", palavra_passe: "ß".repeat(8) } })).toEqual({ kind: "required", message: "Falta indicar o nome" });
  expect(await saveUser(observedConnect, { mode: "create", values: { ...initial, palavra_passe: "ß".repeat(8) } })).toEqual({ kind: "invalid" });
  for (const values of [{ ...initial, Codigo: 256 }, { ...initial, Codigo: "1" }, { ...initial, Descricao: "x".repeat(101) }, { ...initial, palavra_passe: "x".repeat(16) }, { ...initial, utilizadoresID: "1" }, { ...initial, inativo: false }]) expect(await saveUser(observedConnect, { mode: "create", values })).toEqual({ kind: "invalid" });
  expect(await saveUser(observedConnect, { mode: "create", id: "1", values: initial })).toEqual({ kind: "invalid" });
  for (const input of [{ id: "0" }, { id: "9007199254740993", extra: true }, { id: "1\n" }, { id: 1 }]) {
    expect(await readUser(observedConnect, input)).toEqual({ kind: "invalid" });
    expect(await deleteUser(observedConnect, input)).toEqual({ kind: "invalid" });
  }
  for (const input of [{ sort: "palavra_passe" }, { sort: "utilizadoresID" }, { sort: 'Codigo";DROP TABLE utilizadores;--' }, { descending: "true" }, { filter: "new" }]) expect(await listUsers(observedConnect, input)).toEqual({ kind: "invalid" });
  expect(connections).toBe(0);
  expect((await database.query('SELECT count(*)::text AS n FROM app."utilizadores"')).rows[0].n).toBe("0");
});

it("SRC-7c866e13ff SRC-61091b21bb saves exact names/byte255 and only selected reads return synthetic credentials", async () => {
  const saved = await saveUser(connect, { mode: "create", values: initial });
  if (saved.kind !== "saved") throw new Error("User setup failed");
  expect(saved.user).toEqual({ id: expect.any(String), Codigo: 255, Descricao: initial.Descricao });
  expect(Object.keys(saved.user).sort()).toEqual(publicKeys);
  expect(await readUser(connect, { id: saved.user.id })).toEqual({ kind: "loaded", user: { ...saved.user, utilizadoresID: "1", palavra_passe: "MIXED'PASS  " } });
  expect(await saveUser(connect, { mode: "update", id: saved.user.id, values: { ...initial, Codigo: 254, palavra_passe: "Changed" } })).toEqual({ kind: "codeLocked" });
  expect((await database.query('SELECT "Codigo","palavra_passe" FROM app."utilizadores" WHERE _row_id=$1', [saved.user.id])).rows).toEqual([{ Codigo: 255, palavra_passe: "MIXED'PASS  " }]);
  for (const palavra_passe of ["lowerCASE ", "UPPER CASE  ", "  "]) {
    const values = { ...initial, Descricao: "  ", palavra_passe };
    expect(await saveUser(connect, { mode: "update", id: saved.user.id, values })).toEqual({ kind: "saved", user: { ...saved.user, Descricao: "  " } });
    expect(await readUser(connect, { id: saved.user.id })).toEqual({ kind: "loaded", user: { ...saved.user, Descricao: "  ", utilizadoresID: "1", palavra_passe: palavra_passe.toLocaleUpperCase("pt-PT") } });
  }
});

it("SRC-7c866e13ff unconditionally uppercases an untouched loaded synthetic password", async () => {
  const row = await database.query<{ id: string }>('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (42,3,$1,$2) RETURNING _row_id::text AS id', ["Imported synthetic", "untouchedCase  "]);
  const read = await readUser(connect, { id: row.rows[0].id });
  if (read.kind !== "loaded") throw new Error("User selected read setup failed");
  expect(read.user.palavra_passe).toBe("untouchedCase  ");
  const values = { Codigo: read.user.Codigo, Descricao: "Only name changed", palavra_passe: read.user.palavra_passe };
  expect(await saveUser(connect, { mode: "update", id: read.user.id, values })).toEqual({ kind: "saved", user: { id: read.user.id, Codigo: 3, Descricao: values.Descricao } });
  expect(await readUser(connect, { id: read.user.id })).toEqual({ kind: "loaded", user: { id: read.user.id, Codigo: 3, Descricao: values.Descricao, utilizadoresID: "42", palavra_passe: "UNTOUCHEDCASE  " } });
});

it("SRC-91e30fc7fd preserves NULL anomalies, selected large identity and current source/provenance values", async () => {
  const runId = "00000000-0000-4000-8000-000000000021";
  await database.query('INSERT INTO import_audit.runs (id,source_sha256,mapping_version) VALUES ($1,$2,1)', [runId, "b".repeat(64)]);
  const id = "9007199254740993";
  await database.query('INSERT INTO app."utilizadores" (_row_id,_import_id,_source_row,"utilizadoresID","Codigo","Descricao","palavra_passe") OVERRIDING SYSTEM VALUE VALUES ($1,$2,42,9007199254740995,2,NULL,NULL)', [id, runId]);
  const anomalies = await database.query<{ id: string; Codigo: number | null }>('INSERT INTO app."utilizadores" ("Codigo","Descricao","palavra_passe") VALUES (NULL,NULL,NULL),(0,NULL,NULL) RETURNING _row_id::text AS id,"Codigo"');
  const before = await snapshot();
  const list = await listUsers(connect, {});
  if (list.kind !== "loaded") throw new Error("User list failed");
  expect(list.users.find(row => row.id === id)).toEqual({ id, Codigo: 2, Descricao: null });
  for (const anomaly of anomalies.rows) {
    expect(list.users.find(row => row.id === anomaly.id)).toEqual({ ...anomaly, Descricao: null });
    expect(await readUser(connect, { id: anomaly.id })).toEqual({ kind: "loaded", user: { ...anomaly, Descricao: null, utilizadoresID: null, palavra_passe: null } });
    expect(await saveUser(connect, { mode: "update", id: anomaly.id, values: { Codigo: anomaly.Codigo, Descricao: "Changed", palavra_passe: "Changed" } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  }
  for (const row of list.users) expect(Object.keys(row).sort()).toEqual(publicKeys);
  expect(await readUser(connect, { id })).toEqual({ kind: "loaded", user: { id, Codigo: 2, Descricao: null, utilizadoresID: "9007199254740995", palavra_passe: null } });
  expect(await snapshot()).toEqual(before);
  // An external writer can change unbound values after FileToScreen; save must preserve the current values.
  await database.query('UPDATE app."utilizadores" SET "utilizadoresID"=9007199254740997,_source_row=43 WHERE _row_id=$1', [id]);
  const values = { Codigo: 2, Descricao: "x');DROP TABLE utilizadores;--  ", palavra_passe: "a'Bc  " };
  expect(await saveUser(connect, { mode: "update", id, values })).toEqual({ kind: "saved", user: { id, Codigo: 2, Descricao: values.Descricao } });
  expect((await database.query('SELECT _row_id::text,"utilizadoresID"::text,"Codigo","Descricao","palavra_passe",_import_id::text,_source_row::text FROM app."utilizadores" WHERE _row_id=$1', [id])).rows).toEqual([{ _row_id: id, utilizadoresID: "9007199254740997", Codigo: 2, Descricao: values.Descricao, palavra_passe: "A'BC  ", _import_id: runId, _source_row: "43" }]);
});

it("RULE-CD9683DC-017 ADR-012 browses typed source identities before public transport and whitelists visible sorts", async () => {
  const sourceIds = ["-10", "-2", "2", "10", "9007199254740992", "9007199254740993"];
  const expected: string[] = [];
  for (const [index, sourceId] of [...sourceIds].reverse().entries()) {
    const inserted = await database.query<{ id: string }>('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao") VALUES ($1,$2,$3) RETURNING _row_id::text AS id', [sourceId, index + 1, `Synthetic ${index}`]);
    expected.unshift(inserted.rows[0].id);
  }
  const nullId = (await database.query<{ id: string }>('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao") VALUES (NULL,NULL,NULL) RETURNING _row_id::text AS id')).rows[0].id;
  const before = await snapshot();
  for (const descending of [false, true]) {
    const list = await listUsers(connect, { descending });
    if (list.kind !== "loaded") throw new Error("Typed user browse failed");
    // NULL/tie placement remains a U02 default; assert only the known numeric source order.
    expect(list.users.filter(row => row.id !== nullId).map(row => row.id)).toEqual(expected);
    expect(list.users.filter(row => row.id === nullId)).toEqual([{ id: nullId, Codigo: null, Descricao: null }]);
  }
  expect(await snapshot()).toEqual(before);
  await database.query('TRUNCATE app."utilizadores" RESTART IDENTITY');
  await database.query('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao") VALUES (1,10,$1),(2,2,$2)', ["A name", "Z name"]);
  for (const [input, codes] of [[{ sort: "Codigo" }, [2, 10]], [{ sort: "Codigo", descending: true }, [10, 2]], [{ sort: "Descricao" }, [10, 2]], [{ sort: "Descricao", descending: true }, [2, 10]]] as const) {
    const list = await listUsers(connect, input);
    if (list.kind !== "loaded") throw new Error("User sorting read failed");
    expect(list.users.map(row => row.Codigo)).toEqual(codes);
  }
});

it("ADR-004 public user list succeeds when PostgreSQL denies password acquisition", async () => {
  await database.query('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,1,$1,$2)', ["Public synthetic", "NeverPublic"]);
  await database.query('CREATE ROLE users_public_projection');
  await database.query('GRANT USAGE ON SCHEMA app TO users_public_projection');
  await database.query('GRANT SELECT (_row_id,"utilizadoresID","Codigo","Descricao") ON app."utilizadores" TO users_public_projection');
  const restricted: DatabaseConnection = async () => { const client = await connect(); await client.query('SET ROLE users_public_projection'); return client; };
  expect(await listUsers(restricted, {})).toEqual({ kind: "loaded", users: [{ id: "1", Codigo: 1, Descricao: "Public synthetic" }] });
  expect(await readUser(restricted, { id: "1" })).toEqual({ kind: "failed" });
  expect((await database.query('SELECT has_column_privilege(\'users_public_projection\',\'app.utilizadores\',\'palavra_passe\',\'SELECT\') AS allowed')).rows[0].allowed).toBe(false);
});

it("SRC-7c866e13ff ADR-008 serializes automatic source allocation and exact competing-code duplicate responses", async () => {
  await database.query('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo") VALUES (9007199254740993,1)');
  const different = await Promise.all([20, 21].map(Codigo => saveUser(connect, { mode: "create", values: { ...initial, Codigo } })));
  expect(different.map(result => result.kind)).toEqual(["saved", "saved"]);
  const ids = different.map(result => { if (result.kind !== "saved") throw new Error("User allocation failed"); return result.user.id; });
  const allocated = await database.query<{ utilizadoresID: string }>('SELECT "utilizadoresID"::text FROM app."utilizadores" WHERE _row_id=ANY($1::bigint[])', [ids]);
  expect(new Set(allocated.rows.map(row => row.utilizadoresID))).toEqual(new Set(["9007199254740994", "9007199254740995"]));
  const same = await Promise.all([1, 2].map(() => saveUser(connect, { mode: "create", values: { ...initial, Codigo: 22 } })));
  expect(same.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  expect(same.find(result => result.kind === "duplicate")).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 22" });
  expect((await database.query('SELECT count(*)::text AS n FROM app."utilizadores" WHERE "Codigo"=22')).rows[0].n).toBe("1");
});

it("SRC-91e30fc7fd ADR-008 allocates after negative/NULL sources without altering those imported identities", async () => {
  await database.query('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo") VALUES (-2,1),(NULL,2)');
  const saved = await saveUser(connect, { mode: "create", values: { ...initial, Codigo: 3 } });
  if (saved.kind !== "saved") throw new Error("User zero-baseline allocation failed");
  expect(await readUser(connect, { id: saved.user.id })).toMatchObject({ kind: "loaded", user: { utilizadoresID: "1" } });
  expect((await database.query('SELECT "utilizadoresID"::text,"Codigo" FROM app."utilizadores" WHERE "Codigo" IN (1,2) ORDER BY "Codigo"')).rows).toEqual([{ utilizadoresID: "-2", Codigo: 1 }, { utilizadoresID: null, Codigo: 2 }]);
});

it("SRC-91e30fc7fd ADR-008 allocates the final signed source identifier and refuses exhaustion without writes", async () => {
  await database.query('INSERT INTO app."utilizadores" ("utilizadoresID","Codigo") VALUES (9223372036854775806,90)');
  const last = await saveUser(connect, { mode: "create", values: { ...initial, Codigo: 91 } });
  if (last.kind !== "saved") throw new Error("User maximum allocation failed");
  expect(await readUser(connect, { id: last.user.id })).toMatchObject({ kind: "loaded", user: { utilizadoresID: "9223372036854775807" } });
  const before = await snapshot();
  expect(await saveUser(connect, { mode: "create", values: { ...initial, Codigo: 92 } })).toEqual({ kind: "failed" });
  expect(await snapshot()).toEqual(before);
});

it("SRC-68776c0653 deletes the sole selected user despite repair references without changing those references", async () => {
  const saved = await saveUser(connect, { mode: "create", values: { ...initial, Codigo: 30 } });
  if (saved.kind !== "saved") throw new Error("User delete setup failed");
  const related = await database.query<{ id: string }>('INSERT INTO app."ordem_reparacao" ("recepcao_util") VALUES (30) RETURNING _row_id::text AS id');
  expect(await deleteUser(connect, { id: saved.user.id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "recepcao_util" FROM app."ordem_reparacao" WHERE _row_id=$1', [related.rows[0].id])).rows).toEqual([{ recepcao_util: 30 }]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."utilizadores"')).rows[0].n).toBe("0");
  expect(await readUser(connect, { id: saved.user.id })).toEqual({ kind: "missing" });
  expect(await deleteUser(connect, { id: saved.user.id })).toEqual({ kind: "missing" });
  expect(await saveUser(connect, { mode: "update", id: saved.user.id, values: { ...initial, Codigo: 30 } })).toEqual({ kind: "missing" });
});

it("SRC-7c866e13ff ADR-008 actual AFTER-write trigger refusals roll back insert/update/delete and dependent effects", async () => {
  const saved = await saveUser(connect, { mode: "create", values: { ...initial, Codigo: 40 } });
  if (saved.kind !== "saved") throw new Error("User rollback setup failed");
  const before = await snapshot();
  await database.query(`CREATE FUNCTION public.reject_user() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.user_effects VALUES (TG_OP); RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_user AFTER INSERT OR UPDATE OR DELETE ON app."utilizadores" FOR EACH ROW EXECUTE FUNCTION public.reject_user()');
  try {
    expect(await saveUser(connect, { mode: "create", values: { ...initial, Codigo: 41 } })).toEqual({ kind: "failed" });
    expect(await saveUser(connect, { mode: "update", id: saved.user.id, values: { ...initial, Codigo: 40, palavra_passe: "Changed" } })).toEqual({ kind: "failed" });
    expect(await deleteUser(connect, { id: saved.user.id })).toEqual({ kind: "failed" });
  } finally { await database.query('DROP TRIGGER reject_user ON app."utilizadores"'); }
  expect(await snapshot()).toEqual(before);
});

it.each(["INSERT", "UPDATE", "DELETE"] as const)("ADR-004 ADR-008 actual authenticated user API %s backend loss after the write stays failed and rolls back", async event => {
  const saved = await saveUser(connect, { mode: "create", values: { ...initial, Codigo: 40 } });
  if (saved.kind !== "saved") throw new Error("User disconnect setup failed");
  const before = await snapshot();
  let client: Client | undefined, pid: number | undefined, done = false;
  const observed: DatabaseConnection = async () => {
    client = await connect();
    // No test error listener: production connectOperationClient must own the actual emitted error.
    pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid;
    return client;
  };
  const app = createApp({ userConnect: observed, authenticate: async () => ({ userId: "synthetic-user-lifecycle" }) });
  await database.query(`CREATE OR REPLACE FUNCTION public.gate_user() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    INSERT INTO public.user_effects VALUES (TG_OP);
    PERFORM pg_advisory_xact_lock(${gateKey}::bigint);
    RETURN NULL;
  END $$`);
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gateKey]);
  await database.query(`CREATE TRIGGER gate_user AFTER ${event} ON app."utilizadores" FOR EACH ROW EXECUTE FUNCTION public.gate_user()`);
  let pending: Promise<{ statusCode: number; body: unknown }> | undefined, response: { statusCode: number; body: unknown } | undefined;
  try {
    const action = event === "DELETE" ? "delete" : "save";
    const payload = event === "DELETE" ? { id: saved.user.id } : event === "INSERT" ? { mode: "create", values: { ...initial, Codigo: 41 } } : { mode: "update", id: saved.user.id, values: { ...initial, Codigo: 40, palavra_passe: "Changed" } };
    pending = app.inject({ method: "POST", url: `/api/users/${action}`, payload }).then(reply => { done = true; return { statusCode: reply.statusCode, body: reply.json() }; });
    await awaitState(async () => {
      if (done) throw new Error("User operation completed before the real AFTER-write barrier");
      if (pid === undefined) return false;
      return (await database.query<{ blocked: boolean }>("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype='advisory' AND NOT granted) AS blocked", [pid])).rows[0].blocked;
    }, "User operation did not reach its real AFTER-write advisory barrier");
    await database.query("SELECT pg_terminate_backend($1)", [pid]);
    await awaitState(async () => done, "Disconnected user API request did not settle");
    response = await pending;
  } finally {
    if (pid !== undefined && !done) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]);
    await client?.end();
    await database.query('DROP TRIGGER gate_user ON app."utilizadores"');
    await app.close();
  }
  expect(await snapshot()).toEqual(before);
  expect(response).toEqual({ statusCode: 200, body: { kind: "failed" } });
}, 30000);

it("ADR-008 refused connections and already-ended actual clients remain typed failures for all four operations", async () => {
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_user_database");
  const ended: DatabaseConnection = async () => { const client = await connect(); await client.end(); return client; };
  const before = await snapshot();
  for (const connection of [unavailable, ended]) {
    expect(await listUsers(connection, {})).toEqual({ kind: "failed" });
    expect(await readUser(connection, { id: "1" })).toEqual({ kind: "failed" });
    expect(await saveUser(connection, { mode: "create", values: initial })).toEqual({ kind: "failed" });
    expect(await deleteUser(connection, { id: "1" })).toEqual({ kind: "failed" });
  }
  expect(await snapshot()).toEqual(before);
});

it("ADR-004 actual routes deny anonymous access and only selected authenticated reads expose synthetic credentials with no-store", async () => {
  let acquisitions = 0;
  const observed: DatabaseConnection = async () => { acquisitions += 1; return connect(); };
  const denied = createApp({ userConnect: observed });
  try {
    for (const action of ["list", "read", "save", "delete"]) expect((await denied.inject({ method: "POST", url: `/api/users/${action}`, payload: {} })).statusCode).toBe(401);
    expect(acquisitions).toBe(0);
  } finally { await denied.close(); }
  const app = createApp({ userConnect: connect, authenticate: async () => ({ userId: "synthetic-users" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/users/save", payload: { mode: "create", values: { ...initial, Codigo: 60 } } })).json();
    expect(saved.kind).toBe("saved");
    expect(Object.keys(saved.user).sort()).toEqual(publicKeys);
    const list = (await app.inject({ method: "POST", url: "/api/users/list", payload: {} })).json();
    expect(list).toEqual({ kind: "loaded", users: [saved.user] });
    expect(Object.keys(list.users[0]).sort()).toEqual(publicKeys);
    const read = await app.inject({ method: "POST", url: "/api/users/read", payload: { id: saved.user.id } });
    expect(read.headers["cache-control"]).toBe("no-store");
    expect(read.json()).toEqual({ kind: "loaded", user: { ...saved.user, utilizadoresID: "1", palavra_passe: "MIXED'PASS  " } });
    expect((await app.inject({ method: "POST", url: "/api/users/read", payload: { id: "9223372036854775807" } })).headers["cache-control"]).toBe("no-store");
    expect((await app.inject({ method: "POST", url: "/api/users/delete", payload: { id: saved.user.id } })).json()).toEqual({ kind: "deleted" });
    expect((await database.query('SELECT count(*)::text AS n FROM app."utilizadores"')).rows[0].n).toBe("0");
  } finally { await app.close(); }
});

it("GS-USERS-001 actual API uppercase/edit/duplicate matches a spec-derived public export without credentials", async () => {
  const app = createApp({ userConnect: connect, authenticate: async () => ({ userId: "synthetic-user-golden" }) });
  try {
    const saved = (await app.inject({ method: "POST", url: "/api/users/save", payload: { mode: "create", values: { ...initial, Codigo: 77, Descricao: "Initial" } } })).json();
    expect(saved.kind).toBe("saved");
    const read = (await app.inject({ method: "POST", url: "/api/users/read", payload: { id: saved.user.id } })).json();
    expect(read.user.palavra_passe).toBe("MIXED'PASS  ");
    expect(read.user.utilizadoresID).toBe("1");
    const values = { ...initial, Codigo: 77, Descricao: "Final d'Água  ", palavra_passe: "changedCASE  " };
    const edited = (await app.inject({ method: "POST", url: "/api/users/save", payload: { mode: "update", id: saved.user.id, values } })).json();
    expect(edited).toEqual({ kind: "saved", user: { id: saved.user.id, Codigo: 77, Descricao: values.Descricao } });
    expect((await app.inject({ method: "POST", url: "/api/users/save", payload: { mode: "create", values } })).json()).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: 77" });
    expect((await database.query('SELECT "utilizadoresID"::text,"palavra_passe" FROM app."utilizadores" WHERE _row_id=$1', [saved.user.id])).rows).toEqual([{ utilizadoresID: "1", palavra_passe: "CHANGEDCASE  " }]);
    const exported = await database.query('SELECT "Codigo","Descricao" FROM app."utilizadores" WHERE _row_id=$1', [saved.user.id]);
    const target = resolve(server.directory, "user-golden"); await mkdir(target);
    const columns = ["Codigo", "Descricao"], csv = (value: unknown) => '"' + String(value).replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "utilizadores.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(key => csv(row[key])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-USERS-001/compare.json", "--legacy", "docs/golden/GS-USERS-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

async function snapshot() {
  return {
    users: (await database.query('SELECT to_jsonb(t)::text AS row FROM app."utilizadores" t ORDER BY _row_id')).rows,
    repairs: (await database.query('SELECT to_jsonb(t)::text AS row FROM app."ordem_reparacao" t ORDER BY _row_id')).rows,
    effects: (await database.query('SELECT * FROM public.user_effects')).rows,
  };
}

async function awaitState(probe: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) { if (await probe()) return; await delay(10); }
  throw new Error(message);
}
