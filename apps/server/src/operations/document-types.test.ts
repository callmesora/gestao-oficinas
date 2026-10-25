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
import type { DocumentTypeValues } from "../../../../packages/domain/src/document-types";
import { checkDocumentTypeDelete, deleteDocumentType, listDocumentTypes, saveDocumentType } from "./document-types";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const initial: DocumentTypeValues = { Codigo: "A", Descricao: "", stock: 1, obriga_macanico: false };
const associated = { kind: "associated", message: "Tipo de documento associado a documentos, não pode ser eliminado" };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  // Only this newly created scratch database; no original records are imported.
  await database.query('TRUNCATE app."documentos",app."cab_stocks",app."lin_stocks" RESTART IDENTITY');
});

async function create(values: DocumentTypeValues = initial) {
  const result = await saveDocumentType(connect, { mode: "create", values });
  if (result.kind !== "saved") throw new Error("Synthetic document-type setup failed");
  return result.documentType;
}
async function snapshot() {
  return (await database.query('SELECT to_jsonb(d) AS row FROM app."documentos" d ORDER BY _row_id')).rows;
}
async function awaitState(probe: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) { if (await probe()) return; await delay(10); }
  throw new Error(message);
}

it("SRC-3c9d2e15a6 validates required/strict source fields before acquiring a database client", async () => {
  let connections = 0;
  const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  expect(await saveDocumentType(observed, { mode: "create", values: { ...initial, Codigo: "" } })).toEqual({ kind: "required", message: "Falta indicar o código" });
  for (const values of [{ ...initial, Codigo: null }, { ...initial, Codigo: "LONG" }, { ...initial, Descricao: "x".repeat(51) }, { ...initial, stock: 256 }, { ...initial, stock: "1" }, { ...initial, obriga_macanico: 1 }, { ...initial, obriga_mecanico: false }, { ...initial, documentosID: "1" }]) expect(await saveDocumentType(observed, { mode: "create", values })).toEqual({ kind: "invalid" });
  expect(await saveDocumentType(observed, { mode: "create", values: initial, _source_row: "1" })).toEqual({ kind: "invalid" });
  expect(await saveDocumentType(observed, { mode: "update", id: "9223372036854775808", values: initial })).toEqual({ kind: "invalid" });
  expect(await listDocumentTypes(observed, { sort: 'Codigo";DROP TABLE documentos;--' })).toEqual({ kind: "invalid" });
  expect(await checkDocumentTypeDelete(observed, { id: "1 OR 1=1" })).toEqual({ kind: "invalid" });
  expect(await deleteDocumentType(observed, { id: 1 })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0); expect(await snapshot()).toEqual([]);
});

it("SRC-3c9d2e15a6 preserves exact text, optional description and immutable code without stock side effects", async () => {
  const values: DocumentTypeValues = { Codigo: "a' ", Descricao: "d'Água  ", stock: 255, obriga_macanico: true };
  const saved = await create(values);
  expect(saved).toEqual({ ...values, id: "1", documentosID: "1" });
  expect(await saveDocumentType(connect, { mode: "update", id: saved.id, values: { ...values, Codigo: "A" } })).toEqual({ kind: "codeLocked" });
  expect(await saveDocumentType(connect, { mode: "update", id: saved.id, values: { ...values, Descricao: null, stock: 0, obriga_macanico: null } })).toEqual({ kind: "saved", documentType: { ...saved, Descricao: null, stock: 0, obriga_macanico: null } });
  expect(await saveDocumentType(connect, { mode: "create", values })).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: a' " });
  for (const Codigo of ["A' ", " ", "0"]) expect(await saveDocumentType(connect, { mode: "create", values: { ...initial, Codigo, Descricao: null } })).toMatchObject({ kind: "saved", documentType: { Codigo, Descricao: null } });
  expect((await database.query('SELECT * FROM app."cab_stocks"')).rows).toEqual([]);
  expect((await database.query('SELECT * FROM app."lin_stocks"')).rows).toEqual([]);
});

it("ADR-002 ADR-011 preserves imported NULLs, duplicate codes, large selected/source identities and provenance", async () => {
  const runId = "00000000-0000-4000-8000-000000000017";
  await database.query('INSERT INTO import_audit.runs (id,source_sha256,mapping_version) VALUES ($1,$2,1)', [runId, "b".repeat(64)]);
  const imported = await database.query<{ id: string }>('INSERT INTO app."documentos" (_row_id,_import_id,_source_row,"documentosID","Codigo","Descricao","stock","obriga_macanico") OVERRIDING SYSTEM VALUE VALUES (9007199254740993,$1,42,9007199254740994,$2,NULL,255,NULL),(9007199254740994,NULL,NULL,9007199254740995,$2,$3,NULL,NULL),(9007199254740995,NULL,NULL,NULL,NULL,NULL,NULL,NULL) RETURNING _row_id::text AS id', [runId, "DUP", "Untouched  "]);
  const list = await listDocumentTypes(connect, {});
  if (list.kind !== "loaded") throw new Error("Synthetic list failed");
  expect(list.documentTypes.find(row => row.id === imported.rows[0].id)).toEqual({ Codigo: "DUP", Descricao: null, stock: 255, obriga_macanico: null, id: "9007199254740993", documentosID: "9007199254740994" });
  expect(list.documentTypes.find(row => row.id === imported.rows[2].id)).toEqual({ id: "9007199254740995", documentosID: null, Codigo: null, Descricao: null, stock: null, obriga_macanico: null });
  const values: DocumentTypeValues = { Codigo: "DUP", Descricao: "x');DROP TABLE documentos;--", stock: 255, obriga_macanico: null };
  expect(await saveDocumentType(connect, { mode: "update", id: imported.rows[0].id, values })).toEqual({ kind: "saved", documentType: { ...values, id: "9007199254740993", documentosID: "9007199254740994" } });
  expect((await database.query('SELECT "documentosID"::text,_import_id::text,_source_row::text FROM app."documentos" WHERE _row_id=$1', [imported.rows[0].id])).rows).toEqual([{ documentosID: "9007199254740994", _import_id: runId, _source_row: "42" }]);
  expect(await deleteDocumentType(connect, { id: imported.rows[0].id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "documentosID"::text,"Descricao","stock","obriga_macanico" FROM app."documentos" WHERE "Codigo"=$1', ["DUP"])).rows).toEqual([{ documentosID: "9007199254740995", Descricao: "Untouched  ", stock: null, obriga_macanico: null }]);
});

it("SRC-cb37887d33 RULE-CFEE768B-021 sorts displayed Stock and all visible fields without changing backing values", async () => {
  const one = await create({ ...initial, Codigo: "Z", Descricao: "Alpha", stock: 1, obriga_macanico: true });
  const two = await create({ ...initial, Codigo: "A", Descricao: "Zulu", stock: 2, obriga_macanico: false });
  for (const [input, expected] of [[{}, [one.id, two.id]], [{ sort: "Codigo" }, [two.id, one.id]], [{ sort: "Descricao" }, [one.id, two.id]], [{ sort: "stock" }, [one.id, two.id]], [{ sort: "stock", descending: true }, [two.id, one.id]], [{ sort: "obriga_macanico" }, [two.id, one.id]], [{ sort: "obriga_macanico", descending: true }, [one.id, two.id]]] as const) {
    const result = await listDocumentTypes(connect, input);
    if (result.kind !== "loaded") throw new Error("Synthetic sorted list failed");
    expect(result.documentTypes.map(row => row.id)).toEqual(expected);
    expect(result.documentTypes.find(row => row.id === one.id)?.stock).toBe(1);
  }
  await create({ ...initial, Codigo: "RAW", stock: 255 });
  const raw = await listDocumentTypes(connect, { sort: "stock" });
  if (raw.kind !== "loaded") throw new Error("Synthetic fallback list failed");
  // Explicit ADR-012 fallback: "255" precedes Entrada/Saída, unlike raw byte ordering.
  expect(raw.documentTypes.map(row => row.stock)).toEqual([255, 1, 2]);
  expect(await listDocumentTypes(connect, { sort: "_row_id" })).toEqual({ kind: "invalid" });
  expect(await listDocumentTypes(connect, { mode: "active" })).toEqual({ kind: "invalid" });
});

it("ADR-011 serializes concurrent allocation and exact duplicate creates", async () => {
  await database.query('INSERT INTO app."documentos" ("documentosID","Codigo") VALUES (9007199254740993,$1)', ["OLD"]);
  const different = await Promise.all(["N1", "N2"].map(Codigo => saveDocumentType(connect, { mode: "create", values: { ...initial, Codigo } })));
  expect(different.map(result => result.kind)).toEqual(["saved", "saved"]);
  const ids = different.map(result => { if (result.kind !== "saved") throw new Error("Concurrent allocation failed"); return result.documentType.documentosID; });
  expect(new Set(ids)).toEqual(new Set(["9007199254740994", "9007199254740995"]));
  const same = await Promise.all([1, 2].map(() => saveDocumentType(connect, { mode: "create", values: { ...initial, Codigo: "RAC" } })));
  expect(same.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."documentos" WHERE "Codigo"=$1', ["RAC"])).rows[0].n).toBe("1");
});

it("SRC-76449c8749 protects the exact text-code header link after precheck despite zero automatic IDs", async () => {
  const saved = await create({ ...initial, Codigo: "U'1" });
  expect(await checkDocumentTypeDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  const header = await database.query<{ id: string }>('INSERT INTO app."cab_stocks" ("documento_codigo","DocumentosID") VALUES ($1,0) RETURNING _row_id::text AS id', ["U'1"]);
  expect(await checkDocumentTypeDelete(connect, { id: saved.id })).toEqual(associated);
  expect(await deleteDocumentType(connect, { id: saved.id })).toEqual(associated);
  expect((await database.query('SELECT "documento_codigo","DocumentosID"::text FROM app."cab_stocks" WHERE _row_id=$1', [header.rows[0].id])).rows).toEqual([{ documento_codigo: "U'1", DocumentosID: "0" }]);
  expect(await listDocumentTypes(connect, {})).toEqual({ kind: "loaded", documentTypes: [saved] });
});

it("ADR-011 actual concurrent header insertion is observed after the protected delete waits for its table lock", async () => {
  const saved = await create({ ...initial, Codigo: "RAC" }), writer = await connect();
  expect(await checkDocumentTypeDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  let pid: number | undefined, pending: Promise<unknown> | undefined;
  try {
    await writer.query("BEGIN"); await writer.query('INSERT INTO app."cab_stocks" ("documento_codigo") VALUES ($1)', ["RAC"]);
    const observed: DatabaseConnection = async () => { const client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
    pending = deleteDocumentType(observed, { id: saved.id });
    await awaitState(async () => pid !== undefined && (await database.query<{ blocked: boolean }>("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype='relation' AND NOT granted) AS blocked", [pid])).rows[0].blocked, "Delete never waited for the actual stock-header writer");
    await writer.query("COMMIT"); expect(await pending).toEqual(associated);
    expect((await database.query('SELECT count(*)::text AS n FROM app."documentos" WHERE _row_id=$1', [saved.id])).rows[0].n).toBe("1");
  } finally {
    await writer.query("ROLLBACK");
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await pending; await writer.end();
  }
}, 30000);

it("SRC-76449c8749 deletes only the selected record without inventing header-ID or stock-line guards", async () => {
  const saved = await create({ ...initial, Codigo: "DEL" });
  await database.query('INSERT INTO app."cab_stocks" ("documento_codigo","DocumentosID") VALUES ($1,$2)', ["OTHER", saved.documentosID]);
  await database.query('INSERT INTO app."lin_stocks" ("documento_codigo") VALUES ($1)', ["DEL"]);
  expect(await checkDocumentTypeDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  expect(await deleteDocumentType(connect, { id: saved.id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "documento_codigo","DocumentosID"::text FROM app."cab_stocks"')).rows).toEqual([{ documento_codigo: "OTHER", DocumentosID: saved.documentosID }]);
  expect((await database.query('SELECT "documento_codigo" FROM app."lin_stocks"')).rows).toEqual([{ documento_codigo: "DEL" }]);
  expect(await deleteDocumentType(connect, { id: saved.id })).toEqual({ kind: "missing" });
  expect(await checkDocumentTypeDelete(connect, { id: saved.id })).toEqual({ kind: "missing" });
  expect(await saveDocumentType(connect, { mode: "update", id: saved.id, values: { ...initial, Codigo: "DEL" } })).toEqual({ kind: "missing" });
});

it("ADR-008 actual trigger exceptions roll back insert/update/delete and dependent effects", async () => {
  const saved = await create(), before = await snapshot();
  await database.query('CREATE TABLE public.document_type_effects (operation text)');
  await database.query(`CREATE FUNCTION public.reject_document_type() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.document_type_effects VALUES (TG_OP); RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_document_type AFTER INSERT OR UPDATE OR DELETE ON app."documentos" FOR EACH ROW EXECUTE FUNCTION public.reject_document_type()');
  try {
    expect(await saveDocumentType(connect, { mode: "create", values: { ...initial, Codigo: "ERR" } })).toEqual({ kind: "failed" });
    expect(await saveDocumentType(connect, { mode: "update", id: saved.id, values: { ...initial, Descricao: "Changed", stock: 2, obriga_macanico: true } })).toEqual({ kind: "failed" });
    expect(await deleteDocumentType(connect, { id: saved.id })).toEqual({ kind: "failed" });
  } finally { await database.query('DROP TRIGGER reject_document_type ON app."documentos"'); }
  expect(await snapshot()).toEqual(before);
  expect((await database.query('SELECT * FROM public.document_type_effects')).rows).toEqual([]);
});

it("ADR-008 actual API disconnect AFTER insert rolls back business/audit effects and returns typed failed", async () => {
  const before = await snapshot(), gateKey = 731617;
  let client: Client | undefined, pid: number | undefined, done = false, pending: Promise<unknown> | undefined;
  const observed: DatabaseConnection = async () => { client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
  const app = createApp({ documentTypeConnect: observed, authenticate: async () => ({ userId: "synthetic-document-type-loss" }) });
  await database.query('CREATE TABLE public.document_type_loss_effects (operation text)');
  await database.query(`CREATE FUNCTION public.document_type_after_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.document_type_loss_effects VALUES (TG_OP); PERFORM pg_advisory_xact_lock(${gateKey}::bigint); RETURN NULL; END $$`);
  await database.query('CREATE TRIGGER document_type_loss_gate AFTER INSERT ON app."documentos" FOR EACH ROW EXECUTE FUNCTION public.document_type_after_write()');
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gateKey]);
  try {
    pending = app.inject({ method: "POST", url: "/api/document-types/save", payload: { mode: "create", values: initial } }).then(reply => { done = true; return { statusCode: reply.statusCode, body: reply.json() }; }, () => { done = true; return { kind: "rejected" }; });
    await awaitState(async () => {
      if (done) throw new Error("API completed before the real AFTER-write lock barrier");
      return pid !== undefined && (await database.query<{ blocked: boolean }>("SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype='advisory' AND NOT granted) AS blocked", [pid])).rows[0].blocked;
    }, "API never reached the actual AFTER-write lock barrier");
    await database.query("SELECT pg_terminate_backend($1)", [pid]); await awaitState(async () => done, "Disconnected API did not settle");
    expect(await pending).toEqual({ statusCode: 200, body: { kind: "failed" } });
    expect(await snapshot()).toEqual(before); expect((await database.query('SELECT * FROM public.document_type_loss_effects')).rows).toEqual([]);
  } finally {
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]); await pending; await client?.end();
    await database.query('DROP TRIGGER document_type_loss_gate ON app."documentos"'); await app.close();
  }
}, 30000);

it("ADR-008 all four operations retain typed failure for refused databases and ended clients", async () => {
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_document_types_database");
  const ended: DatabaseConnection = async () => { const client = await connect(); await client.end(); return client; };
  for (const connection of [unavailable, ended]) {
    expect(await listDocumentTypes(connection, {})).toEqual({ kind: "failed" });
    expect(await saveDocumentType(connection, { mode: "create", values: initial })).toEqual({ kind: "failed" });
    expect(await checkDocumentTypeDelete(connection, { id: "1" })).toEqual({ kind: "failed" });
    expect(await deleteDocumentType(connection, { id: "1" })).toEqual({ kind: "failed" });
  }
  expect(await snapshot()).toEqual([]);
});

it("ADR-004 actual document-type routes authenticate before database acquisition and persist all four operations", async () => {
  let connections = 0;
  const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  const denied = createApp({ documentTypeConnect: observed });
  try { for (const action of ["list", "save", "check-delete", "delete"]) expect((await denied.inject({ method: "POST", url: `/api/document-types/${action}`, payload: {} })).statusCode).toBe(401); }
  finally { await denied.close(); }
  expect(connections).toBe(0);
  const unavailable = createApp({ authenticate: async () => ({ userId: "synthetic" }) });
  try { for (const action of ["list", "save", "check-delete", "delete"]) expect((await unavailable.inject({ method: "POST", url: `/api/document-types/${action}`, payload: {} })).statusCode).toBe(503); }
  finally { await unavailable.close(); }
  const app = createApp({ documentTypeConnect: observed, authenticate: async () => ({ userId: "synthetic" }) });
  try {
    const beforeInvalid = connections;
    for (const payload of [{ mode: "create", values: { ...initial, stock: 256 } }, { mode: "create", values: { ...initial, Codigo: null } }, { mode: "create", values: { ...initial, documentosID: "1" } }, { mode: "update", id: "9223372036854775808", values: initial }]) expect((await app.inject({ method: "POST", url: "/api/document-types/save", payload })).json()).toEqual({ kind: "invalid" });
    expect((await app.inject({ method: "POST", url: "/api/document-types/delete", payload: { id: "1 OR 1=1" } })).json()).toEqual({ kind: "invalid" }); expect(connections).toBe(beforeInvalid);
    const saved = (await app.inject({ method: "POST", url: "/api/document-types/save", payload: { mode: "create", values: initial } })).json();
    expect(saved).toMatchObject({ kind: "saved", documentType: initial });
    expect((await app.inject({ method: "POST", url: "/api/document-types/list", payload: {} })).json()).toEqual({ kind: "loaded", documentTypes: [saved.documentType] });
    expect((await app.inject({ method: "POST", url: "/api/document-types/check-delete", payload: { id: saved.documentType.id } })).json()).toEqual({ kind: "ready" });
    expect((await app.inject({ method: "POST", url: "/api/document-types/delete", payload: { id: saved.documentType.id } })).json()).toEqual({ kind: "deleted" });
  } finally { await app.close(); }
});

it("GS-DOCUMENT-TYPES-001 real API replay matches all four spec-derived values with exact code/description text", async () => {
  const app = createApp({ documentTypeConnect: connect, authenticate: async () => ({ userId: "synthetic-document-type-golden" }) });
  try {
    const values: DocumentTypeValues = { Codigo: "D'1", Descricao: "", stock: 1, obriga_macanico: true };
    const saved = (await app.inject({ method: "POST", url: "/api/document-types/save", payload: { mode: "create", values } })).json();
    expect(saved).toMatchObject({ kind: "saved", documentType: values });
    const changed = { ...values, Descricao: "Saída d'Água  ", stock: 2, obriga_macanico: false };
    expect((await app.inject({ method: "POST", url: "/api/document-types/save", payload: { mode: "update", id: saved.documentType.id, values: changed } })).json()).toEqual({ kind: "saved", documentType: { ...changed, id: saved.documentType.id, documentosID: saved.documentType.documentosID } });
    expect((await app.inject({ method: "POST", url: "/api/document-types/save", payload: { mode: "create", values: changed } })).json().kind).toBe("duplicate");
    const exported = await database.query('SELECT "Codigo","Descricao","stock","obriga_macanico" FROM app."documentos" WHERE _row_id=$1', [saved.documentType.id]);
    const target = resolve(server.directory, "document-type-golden"); await mkdir(target);
    const columns = ["Codigo", "Descricao", "stock", "obriga_macanico"], csv = (value: unknown) => '"' + String(value).replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "documentos.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(key => csv(row[key])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-DOCUMENT-TYPES-001/compare.json", "--legacy", "docs/golden/GS-DOCUMENT-TYPES-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

it("ADR-002 ADR-011 allocates the final signed8 identifier and refuses exhausted allocation without mutation", async () => {
  await database.query('INSERT INTO app."documentos" ("documentosID","Codigo") VALUES (9223372036854775806,$1)', ["TOP"]);
  const last = await create({ ...initial, Codigo: "END" }); expect(last.documentosID).toBe("9223372036854775807");
  const before = await snapshot();
  expect(await saveDocumentType(connect, { mode: "create", values: { ...initial, Codigo: "MAX" } })).toEqual({ kind: "failed" });
  expect(await snapshot()).toEqual(before);
});
