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
import type { ArticleList, ArticleValues } from "../../../../packages/domain/src/articles";
import { checkArticleDelete, deleteArticle, listArticles, saveArticle } from "./articles";
import { deleteUnit } from "./units";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const initial: ArticleValues = { Codigo: "A", Descricao: "Artigo", codbarras: "", unidade: "UN", preco: "0", inativo: false };
const all: ArticleList = { mode: "todos", term: "", active: true, inactive: true };
const materialAssociated = { kind: "associated", message: "Artigo usado em ordens de reparação, não pode ser eliminado" };
const stockAssociated = { kind: "associated", message: "Artigo usado em documentos, não pode ser eliminado" };
const barcodeDuplicate = { kind: "barcodeDuplicate", message: "Código de barras já associado a outro artigo" };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  // All rows belong to this test's fresh scratch database; originals are never imported.
  await database.query('TRUNCATE app."artigos",app."unidades",app."material_reparacao",app."lin_stocks",app."cab_stocks" RESTART IDENTITY');
});

async function create(values: ArticleValues = initial) {
  const result = await saveArticle(connect, { mode: "create", values });
  if (result.kind !== "saved") throw new Error("Synthetic article setup failed");
  return result.article;
}
async function snapshot() {
  return (await database.query('SELECT to_jsonb(a)::text AS row FROM app."artigos" a ORDER BY _row_id')).rows;
}
async function awaitState(probe: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) { if (await probe()) return; await delay(10); }
  throw new Error(message);
}
async function isBlocked(pid: number | undefined, locktype = "relation") {
  return pid !== undefined && (await database.query<{ blocked: boolean }>('SELECT EXISTS(SELECT 1 FROM pg_locks WHERE pid=$1 AND locktype=$2 AND NOT granted) AS blocked', [pid, locktype])).rows[0].blocked;
}

it("SRC-18a96799b6 validates strict shape and source required order before database acquisition", async () => {
  let connections = 0;
  const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  expect(await saveArticle(observed, { mode: "create", values: { ...initial, Codigo: "", Descricao: "", unidade: "", preco: "-" } })).toEqual({ kind: "required", message: "Indique um código" });
  expect(await saveArticle(observed, { mode: "create", values: { ...initial, Descricao: null, unidade: "", preco: "-" } })).toEqual({ kind: "required", message: "Indique uma descrição" });
  expect(await saveArticle(observed, { mode: "create", values: { ...initial, unidade: null, preco: "-" } })).toEqual({ kind: "required", message: "Indique uma unidade" });
  for (const values of [{ ...initial, Codigo: null }, { ...initial, Codigo: "x".repeat(31) }, { ...initial, Descricao: "x".repeat(101) }, { ...initial, codbarras: "x".repeat(31) }, { ...initial, unidade: "LONG" }, { ...initial, preco: 1.5 }, { ...initial, inativo: 1 }, { ...initial, stock: "123" }, { ...initial, artigosID: "1" }]) expect(await saveArticle(observed, { mode: "create", values })).toEqual({ kind: "invalid" });
  expect(await saveArticle(observed, { mode: "create", values: initial, _source_row: "1" })).toEqual({ kind: "invalid" });
  expect(await saveArticle(observed, { mode: "update", id: "9223372036854775808", values: initial })).toEqual({ kind: "invalid" });
  expect(await listArticles(observed, { ...all, sort: 'preco";DROP TABLE artigos;--' })).toEqual({ kind: "invalid" });
  expect(await listArticles(observed, { ...all, active: false, inactive: false })).toEqual({ kind: "invalid" });
  expect(await checkArticleDelete(observed, { id: "1 OR 1=1" })).toEqual({ kind: "invalid" });
  expect(await deleteArticle(observed, { id: 1 })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0); expect(await snapshot()).toEqual([]);
});

it("SRC-18a96799b6 preserves quotes/spaces, immutable code, exact decimals and source nonempty orphan units", async () => {
  const values: ArticleValues = { Codigo: "a' ", Descricao: "Filtro d'Água  ", codbarras: "B'1 ", unidade: "X' ", preco: "-1234567890.1234567890123456789", inativo: true };
  const saved = await create(values);
  expect(saved).toEqual({ ...values, id: "1", artigosID: "1", stock: "0" });
  expect(await saveArticle(connect, { mode: "update", id: saved.id, values: { ...values, Codigo: "A" } })).toEqual({ kind: "codeLocked" });
  const changed = { ...values, Descricao: "x');DROP TABLE artigos;--", codbarras: null, preco: null, inativo: null };
  expect(await saveArticle(connect, { mode: "update", id: saved.id, values: changed })).toEqual({ kind: "saved", article: { ...saved, ...changed } });
  expect(await saveArticle(connect, { mode: "create", values: changed })).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: a' " });
  expect(await create({ ...initial, Codigo: " ", Descricao: " ", unidade: " " })).toMatchObject({ Codigo: " ", Descricao: " ", unidade: " " });
  expect((await database.query('SELECT * FROM app."unidades"')).rows).toEqual([]);
  expect((await database.query('SELECT * FROM app."cab_stocks"')).rows).toEqual([]);
  expect((await database.query('SELECT * FROM app."lin_stocks"')).rows).toEqual([]);
});

it("SRC-18a96799b6 checks barcode before code duplicates and malformed numeric drafts without any write", async () => {
  await create({ ...initial, codbarras: "B'1" }); const before = await snapshot();
  for (const preco of ["0", "-", "NaN"]) expect(await saveArticle(connect, { mode: "create", values: { ...initial, codbarras: "B'1", preco } })).toEqual(barcodeDuplicate);
  expect(await saveArticle(connect, { mode: "create", values: { ...initial, preco: "-" } })).toEqual({ kind: "invalid" });
  expect(await saveArticle(connect, { mode: "create", values: initial })).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: A" });
  for (const preco of ["", "+", "-", ".", "-.", "1,25", "1 000.00", "1e3", "NaN", "Infinity", "1\n"]) expect(await saveArticle(connect, { mode: "create", values: { ...initial, Codigo: "BAD", preco } })).toEqual({ kind: "invalid" });
  expect(await snapshot()).toEqual(before);
  for (const [preco, canonical] of [[".5", "0.5"], ["1.", "1"], ["+2", "2"], ["-0.0000000000000000001", "-0.0000000000000000001"]] as const) {
    const saved = await create({ ...initial, Codigo: preco, preco });
    expect(saved.preco).toBe(canonical);
  }
});

it("SRC-18a96799b6 update barcode predicate excludes all same-code and NULL-code anomalies", async () => {
  const selected = await create({ ...initial, Codigo: "DUP", codbarras: "SAME" });
  await database.query('INSERT INTO app."artigos" ("artigosID","Codigo","codbarras") VALUES (2,$1,$2),(3,NULL,$2)', ["DUP", "SAME"]);
  expect(await saveArticle(connect, { mode: "update", id: selected.id, values: { ...initial, Codigo: "DUP", codbarras: "SAME" } })).toMatchObject({ kind: "saved", article: { id: selected.id, codbarras: "SAME" } });
  const before = await snapshot();
  expect(await saveArticle(connect, { mode: "create", values: { ...initial, Codigo: "NEW", codbarras: "SAME" } })).toEqual(barcodeDuplicate);
  expect(await snapshot()).toEqual(before);
  await database.query('INSERT INTO app."artigos" ("artigosID","Codigo","codbarras") VALUES (4,$1,$2)', ["OTHER", "SAME"]);
  expect(await saveArticle(connect, { mode: "update", id: selected.id, values: { ...initial, Codigo: "DUP", codbarras: "SAME", preco: "-" } })).toEqual(barcodeDuplicate);
  expect(await saveArticle(connect, { mode: "update", id: selected.id, values: { ...initial, Codigo: "DUP", codbarras: "", preco: "1" } })).toMatchObject({ kind: "saved", article: { codbarras: "" } });
});

it("ADR-002 ADR-011 preserves imported NULLs, selected/source large identities, provenance and readonly stock", async () => {
  const runId = "00000000-0000-4000-8000-000000000020";
  await database.query('INSERT INTO import_audit.runs (id,source_sha256,mapping_version) VALUES ($1,$2,1)', [runId, "c".repeat(64)]);
  await database.query('INSERT INTO app."artigos" (_row_id,_import_id,_source_row,"artigosID","Codigo","Descricao","codbarras","unidade","preco","inativo","stock") OVERRIDING SYSTEM VALUE VALUES (9007199254740993,$1,42,9007199254740994,$2,$3,NULL,$4,NULL,NULL,-1234567890.1234567890123456789),(9007199254740994,NULL,NULL,9007199254740995,$2,$5,NULL,$4,1.234567890123456789,NULL,NULL),(9007199254740995,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL)', [runId, "DUP", "Imported  ", "OLD", "Untouched  "]);
  const list = await listArticles(connect, all);
  if (list.kind !== "loaded") throw new Error("Synthetic imported article list failed");
  expect(list.articles.find(row => row.id === "9007199254740993")).toEqual({ id: "9007199254740993", artigosID: "9007199254740994", Codigo: "DUP", Descricao: "Imported  ", codbarras: null, unidade: "OLD", preco: null, inativo: null, stock: "-1234567890.1234567890123456789" });
  expect(list.articles.find(row => row.id === "9007199254740994")?.preco).toBe("1.234567890123456789");
  expect(list.articles.find(row => row.id === "9007199254740995")).toEqual({ id: "9007199254740995", artigosID: null, Codigo: null, Descricao: null, codbarras: null, unidade: null, preco: null, inativo: null, stock: null });
  const values: ArticleValues = { Codigo: "DUP", Descricao: "Changed  ", codbarras: null, unidade: "OLD", preco: null, inativo: null };
  expect(await saveArticle(connect, { mode: "update", id: "9007199254740993", values })).toEqual({ kind: "saved", article: { ...values, id: "9007199254740993", artigosID: "9007199254740994", stock: "-1234567890.1234567890123456789" } });
  expect((await database.query('SELECT "artigosID"::text,_import_id::text,_source_row::text FROM app."artigos" WHERE _row_id=9007199254740993')).rows).toEqual([{ artigosID: "9007199254740994", _import_id: runId, _source_row: "42" }]);
  expect(await deleteArticle(connect, { id: "9007199254740993" })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "artigosID"::text,"Descricao","preco"::text,"stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["DUP"])).rows).toEqual([{ artigosID: "9007199254740995", Descricao: "Untouched  ", preco: "1.234567890123456789", stock: null }]);
});

it("SRC-9efbe81830 applies literal field/active filters while todos and both flags retain all source rows", async () => {
  const active = await create({ ...initial, Codigo: "A'1", Descricao: "Alpha %_", codbarras: "BAR'1", inativo: false });
  const inactive = await create({ ...initial, Codigo: "B", Descricao: "Beta", codbarras: "BAR2", inativo: true });
  const unknown = await create({ ...initial, Codigo: "N", Descricao: "Alpha", codbarras: null, inativo: null });
  for (const [input, expected] of [
    [{ ...all, active: true, inactive: false }, [active.id]],
    [{ ...all, active: false, inactive: true }, [inactive.id]],
    [{ ...all, term: "IGNORED" }, [active.id, inactive.id, unknown.id]],
    [{ ...all, mode: "codigo", term: "a'" }, [active.id]],
    [{ ...all, mode: "descricao", term: "ALPHA" }, [active.id, unknown.id]],
    [{ ...all, mode: "descricao", term: "%_" }, [active.id]],
    [{ ...all, mode: "codigobarras", term: "R'1" }, [active.id]],
    [{ ...all, mode: "codigobarras", term: "" }, [active.id, inactive.id, unknown.id]],
    [{ ...all, mode: "descricao", term: "Alpha", active: false, inactive: true }, []],
  ] as const) {
    const result = await listArticles(connect, input);
    if (result.kind !== "loaded") throw new Error("Synthetic filtered article list failed");
    expect(result.articles.map(row => row.id)).toEqual(expected);
  }
});

it("RULE-C7738076-030 ADR-012 sorts numeric source prices/IDs before lossless string transport", async () => {
  await database.query('INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","codbarras","unidade","preco","inativo") VALUES (10,$1,$2,$3,$4,10,TRUE),(2,$5,$6,$7,$8,2,FALSE),(9007199254740993,$9,$10,$11,$12,2.000000000000000001,FALSE)', ["Z", "Alpha", "B", "UN", "A", "Zulu", "C", "CX", "M", "Middle", "A", "KG"]);
  for (const [sort, expected] of [["artigosID", ["2", "10", "9007199254740993"]], ["preco", ["2", "9007199254740993", "10"]], ["Codigo", ["2", "9007199254740993", "10"]], ["Descricao", ["10", "9007199254740993", "2"]], ["codbarras", ["9007199254740993", "10", "2"]], ["unidade", ["2", "9007199254740993", "10"]]] as const) {
    for (const descending of [false, true]) {
      const result = await listArticles(connect, { ...all, sort, descending });
      if (result.kind !== "loaded") throw new Error("Synthetic sorted article list failed");
      expect(result.articles.map(row => row.artigosID)).toEqual(descending ? [...expected].reverse() : expected);
      expect(result.articles.find(row => row.artigosID === "9007199254740993")?.preco).toBe("2.000000000000000001");
    }
  }
  const byInactive = await listArticles(connect, { ...all, sort: "inativo" });
  if (byInactive.kind !== "loaded") throw new Error("Synthetic Boolean sorted list failed");
  expect(byInactive.articles.map(row => row.inativo)).toEqual([false, false, true]);
  const browse = await listArticles(connect, all);
  if (browse.kind !== "loaded") throw new Error("Synthetic default browse failed");
  expect(browse.articles.map(row => row.artigosID)).toEqual(["2", "10", "9007199254740993"]);
});

it("ADR-011 serializes source automatic allocation, exact duplicate creates and barcode collisions", async () => {
  await database.query('INSERT INTO app."artigos" ("artigosID","Codigo") VALUES (9007199254740993,$1)', ["OLD"]);
  const different = await Promise.all(["N1", "N2"].map(Codigo => saveArticle(connect, { mode: "create", values: { ...initial, Codigo } })));
  expect(different.map(result => result.kind)).toEqual(["saved", "saved"]);
  const ids = different.map(result => { if (result.kind !== "saved") throw new Error("Concurrent article allocation failed"); return result.article.artigosID; });
  expect(new Set(ids)).toEqual(new Set(["9007199254740994", "9007199254740995"]));
  const duplicate = await Promise.all([1, 2].map(() => saveArticle(connect, { mode: "create", values: { ...initial, Codigo: "DUP" } })));
  expect(duplicate.map(result => result.kind).sort()).toEqual(["duplicate", "saved"]);
  const barcode = await Promise.all(["BC1", "BC2"].map(Codigo => saveArticle(connect, { mode: "create", values: { ...initial, Codigo, codbarras: "SAME" } })));
  expect(barcode.map(result => result.kind).sort()).toEqual(["barcodeDuplicate", "saved"]);
  expect((await database.query('SELECT count(*)::text AS n FROM app."artigos" WHERE "Codigo"=$1', ["DUP"])).rows[0].n).toBe("1");
  expect((await database.query('SELECT count(*)::text AS n FROM app."artigos" WHERE "codbarras"=$1', ["SAME"])).rows[0].n).toBe("1");
});

it("ADR-002 ADR-011 updates current stock after waiting for an actual external quantity write", async () => {
  const saved = await create(), writer = await connect();
  let pid: number | undefined, pending: ReturnType<typeof saveArticle> | undefined;
  try {
    await writer.query("BEGIN"); await writer.query('UPDATE app."artigos" SET "stock"=-1234567890.1234567890123456789 WHERE _row_id=$1', [saved.id]);
    const observed: DatabaseConnection = async () => { const client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
    pending = saveArticle(observed, { mode: "update", id: saved.id, values: { ...initial, Descricao: "Changed" } });
    await awaitState(() => isBlocked(pid), "Article update never waited for the actual stock writer");
    await writer.query("COMMIT");
    expect(await pending).toEqual({ kind: "saved", article: { ...saved, Descricao: "Changed", stock: "-1234567890.1234567890123456789" } });
    expect((await database.query('SELECT "stock"::text FROM app."artigos" WHERE _row_id=$1', [saved.id])).rows[0].stock).toBe("-1234567890.1234567890123456789");
  } finally {
    await writer.query("ROLLBACK");
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await pending; await writer.end();
  }
}, 30000);

it("ADR-011 article-first concurrent unit deletion waits then observes the committed article link", async () => {
  const unit = (await database.query<{ id: string }>('INSERT INTO app."unidades" ("unidadesID","Codigo") VALUES (1,$1) RETURNING _row_id::text AS id', ["UN"])).rows[0];
  const gateKey = 732001; let savePid: number | undefined, deletePid: number | undefined;
  let saving: ReturnType<typeof saveArticle> | undefined, deleting: ReturnType<typeof deleteUnit> | undefined;
  await database.query(`CREATE FUNCTION public.article_unit_gate() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM pg_advisory_xact_lock(${gateKey}::bigint); RETURN NULL; END $$`);
  await database.query('CREATE TRIGGER article_unit_gate AFTER INSERT ON app."artigos" FOR EACH ROW EXECUTE FUNCTION public.article_unit_gate()');
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gateKey]);
  try {
    saving = saveArticle(async () => { const client = await connect(); savePid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; }, { mode: "create", values: initial });
    await awaitState(() => isBlocked(savePid, "advisory"), "Article save never reached its real AFTER-insert barrier");
    deleting = deleteUnit(async () => { const client = await connect(); deletePid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; }, { id: unit.id });
    await awaitState(() => isBlocked(deletePid), "Unit deletion did not wait for the article save's unit lock");
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]);
    expect(await saving).toMatchObject({ kind: "saved", article: { unidade: "UN" } });
    expect(await deleting).toEqual({ kind: "associated", message: "Unidade usada em artigos, não pode ser eliminada" });
    expect((await database.query('SELECT count(*)::text AS n FROM app."unidades" WHERE _row_id=$1', [unit.id])).rows[0].n).toBe("1");
  } finally {
    for (const pid of [savePid, deletePid]) if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]); await saving; await deleting;
    await database.query('DROP TRIGGER article_unit_gate ON app."artigos"');
  }
}, 30000);

it("ADR-011 unit-delete-first concurrency preserves the source absence of a unit-existence save guard", async () => {
  const unit = (await database.query<{ id: string }>('INSERT INTO app."unidades" ("unidadesID","Codigo") VALUES (1,$1) RETURNING _row_id::text AS id', ["UN"])).rows[0];
  const gateKey = 732002; let savePid: number | undefined, deletePid: number | undefined;
  let saving: ReturnType<typeof saveArticle> | undefined, deleting: ReturnType<typeof deleteUnit> | undefined;
  await database.query(`CREATE FUNCTION public.unit_article_gate() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM pg_advisory_xact_lock(${gateKey}::bigint); RETURN NULL; END $$`);
  await database.query('CREATE TRIGGER unit_article_gate AFTER DELETE ON app."unidades" FOR EACH ROW EXECUTE FUNCTION public.unit_article_gate()');
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gateKey]);
  try {
    deleting = deleteUnit(async () => { const client = await connect(); deletePid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; }, { id: unit.id });
    await awaitState(() => isBlocked(deletePid, "advisory"), "Unit deletion never reached its real AFTER-delete barrier");
    saving = saveArticle(async () => { const client = await connect(); savePid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; }, { mode: "create", values: initial });
    await awaitState(() => isBlocked(savePid), "Article save did not wait for unit deletion's table lock");
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]);
    expect(await deleting).toEqual({ kind: "deleted" });
    expect(await saving).toMatchObject({ kind: "saved", article: { unidade: "UN" } });
    expect((await database.query('SELECT * FROM app."unidades"')).rows).toEqual([]);
  } finally {
    for (const pid of [savePid, deletePid]) if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]); await deleting; await saving;
    await database.query('DROP TRIGGER unit_article_gate ON app."unidades"');
  }
}, 30000);

it("SRC-1ad16daf34 protects material before stock lines regardless of quantities, dates or automatic IDs", async () => {
  const saved = await create({ ...initial, Codigo: "A'1" });
  expect(await checkArticleDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  await database.query('INSERT INTO app."material_reparacao" ("artigo","quantidade") VALUES ($1,0)', ["A'1"]);
  await database.query('INSERT INTO app."lin_stocks" ("artigo","quantidade") VALUES ($1,-99)', ["A'1"]);
  const before = await snapshot();
  expect(await checkArticleDelete(connect, { id: saved.id })).toEqual(materialAssociated);
  expect(await deleteArticle(connect, { id: saved.id })).toEqual(materialAssociated);
  expect(await snapshot()).toEqual(before);
  await database.query('DELETE FROM app."material_reparacao"');
  expect(await checkArticleDelete(connect, { id: saved.id })).toEqual(stockAssociated);
  expect(await deleteArticle(connect, { id: saved.id })).toEqual(stockAssociated);
  await database.query('DELETE FROM app."lin_stocks"');
  await database.query('INSERT INTO app."cab_stocks" ("documento_codigo") VALUES ($1)', ["A'1"]);
  expect(await checkArticleDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  expect(await deleteArticle(connect, { id: saved.id })).toEqual({ kind: "deleted" });
  expect((await database.query('SELECT "documento_codigo" FROM app."cab_stocks"')).rows).toEqual([{ documento_codigo: "A'1" }]);
  expect(await deleteArticle(connect, { id: saved.id })).toEqual({ kind: "missing" });
  expect(await checkArticleDelete(connect, { id: saved.id })).toEqual({ kind: "missing" });
  expect(await saveArticle(connect, { mode: "update", id: saved.id, values: { ...initial, Codigo: "A'1" } })).toEqual({ kind: "missing" });
});

it.each(["material_reparacao", "lin_stocks"] as const)("SRC-1ad16daf34 rechecks a concurrent %s insertion after its actual table lock wait", async table => {
  const saved = await create(), writer = await connect();
  expect(await checkArticleDelete(connect, { id: saved.id })).toEqual({ kind: "ready" });
  let pid: number | undefined, pending: ReturnType<typeof deleteArticle> | undefined;
  try {
    await writer.query("BEGIN");
    await writer.query(`INSERT INTO app."${table}" ("artigo","quantidade") VALUES ($1,0)`, [initial.Codigo]);
    pending = deleteArticle(async () => { const client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; }, { id: saved.id });
    await awaitState(() => isBlocked(pid), "Article deletion never waited for the actual movement writer");
    await writer.query("COMMIT"); expect(await pending).toEqual(table === "material_reparacao" ? materialAssociated : stockAssociated);
    expect(await listArticles(connect, all)).toEqual({ kind: "loaded", articles: [saved] });
  } finally {
    await writer.query("ROLLBACK");
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await pending; await writer.end();
  }
}, 30000);

it("ADR-008 actual AFTER trigger exceptions roll back article insert/update/delete and dependent audit effects", async () => {
  const saved = await create(), before = await snapshot();
  await database.query('CREATE TABLE public.article_effects (operation text)');
  await database.query(`CREATE FUNCTION public.reject_article() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.article_effects VALUES (TG_OP); RAISE EXCEPTION 'synthetic failure'; END $$`);
  await database.query('CREATE TRIGGER reject_article AFTER INSERT OR UPDATE OR DELETE ON app."artigos" FOR EACH ROW EXECUTE FUNCTION public.reject_article()');
  try {
    expect(await saveArticle(connect, { mode: "create", values: { ...initial, Codigo: "ERR" } })).toEqual({ kind: "failed" });
    expect(await saveArticle(connect, { mode: "update", id: saved.id, values: { ...initial, Descricao: "Changed", preco: "12.3456789", inativo: true } })).toEqual({ kind: "failed" });
    expect(await deleteArticle(connect, { id: saved.id })).toEqual({ kind: "failed" });
  } finally { await database.query('DROP TRIGGER reject_article ON app."artigos"'); }
  expect(await snapshot()).toEqual(before); expect((await database.query('SELECT * FROM public.article_effects')).rows).toEqual([]);
});

it("ADR-008 actual authenticated API disconnect AFTER insert rolls back business/audit effects and returns typed failed", async () => {
  const before = await snapshot(), gateKey = 732003;
  let client: Client | undefined, pid: number | undefined, done = false, pending: Promise<unknown> | undefined;
  const observed: DatabaseConnection = async () => { client = await connect(); pid = (await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid; return client; };
  const app = createApp({ articleConnect: observed, authenticate: async () => ({ userId: "synthetic-article-loss" }) });
  await database.query('CREATE TABLE public.article_loss_effects (operation text)');
  await database.query(`CREATE FUNCTION public.article_after_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.article_loss_effects VALUES (TG_OP); PERFORM pg_advisory_xact_lock(${gateKey}::bigint); RETURN NULL; END $$`);
  await database.query('CREATE TRIGGER article_loss_gate AFTER INSERT ON app."artigos" FOR EACH ROW EXECUTE FUNCTION public.article_after_write()');
  await database.query("SELECT pg_advisory_lock($1::bigint)", [gateKey]);
  try {
    pending = app.inject({ method: "POST", url: "/api/articles/save", payload: { mode: "create", values: initial } }).then(reply => { done = true; return { statusCode: reply.statusCode, body: reply.json() }; }, () => { done = true; return { kind: "rejected" }; });
    await awaitState(async () => {
      if (done) throw new Error("Article API completed before the real AFTER-write barrier");
      return isBlocked(pid, "advisory");
    }, "Article API never reached the real AFTER-write barrier");
    await database.query("SELECT pg_terminate_backend($1)", [pid]); await awaitState(async () => done, "Disconnected article API did not settle");
    expect(await pending).toEqual({ statusCode: 200, body: { kind: "failed" } });
    expect(await snapshot()).toEqual(before); expect((await database.query('SELECT * FROM public.article_loss_effects')).rows).toEqual([]);
  } finally {
    if (pid !== undefined) await database.query("SELECT pg_terminate_backend($1) WHERE EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid=$1)", [pid]);
    await database.query("SELECT pg_advisory_unlock($1::bigint)", [gateKey]); await pending; await client?.end();
    await database.query('DROP TRIGGER article_loss_gate ON app."artigos"'); await app.close();
  }
}, 30000);

it("ADR-008 all article operations retain typed failure for refused databases and ended clients", async () => {
  const unavailable: DatabaseConnection = () => server.connect("synthetic_missing_articles_database");
  const ended: DatabaseConnection = async () => { const client = await connect(); await client.end(); return client; };
  for (const connection of [unavailable, ended]) {
    expect(await listArticles(connection, all)).toEqual({ kind: "failed" });
    expect(await saveArticle(connection, { mode: "create", values: initial })).toEqual({ kind: "failed" });
    expect(await checkArticleDelete(connection, { id: "1" })).toEqual({ kind: "failed" });
    expect(await deleteArticle(connection, { id: "1" })).toEqual({ kind: "failed" });
  }
  expect(await snapshot()).toEqual([]);
});

it("ADR-004 real article routes authenticate before acquisition and persist all four operations", async () => {
  let connections = 0;
  const observed: DatabaseConnection = async () => { connections += 1; return connect(); };
  const denied = createApp({ articleConnect: observed });
  try { for (const action of ["list", "save", "check-delete", "delete"]) expect((await denied.inject({ method: "POST", url: `/api/articles/${action}`, payload: {} })).statusCode).toBe(401); }
  finally { await denied.close(); }
  expect(connections).toBe(0);
  const unavailable = createApp({ authenticate: async () => ({ userId: "synthetic" }) });
  try { for (const action of ["list", "save", "check-delete", "delete"]) expect((await unavailable.inject({ method: "POST", url: `/api/articles/${action}`, payload: {} })).statusCode).toBe(503); }
  finally { await unavailable.close(); }
  const app = createApp({ articleConnect: observed, authenticate: async () => ({ userId: "synthetic" }) });
  try {
    const beforeInvalid = connections;
    for (const payload of [{ mode: "create", values: { ...initial, stock: "0" } }, { mode: "create", values: { ...initial, Codigo: null } }, { mode: "create", values: { ...initial, artigosID: "1" } }, { mode: "update", id: "9223372036854775808", values: initial }]) expect((await app.inject({ method: "POST", url: "/api/articles/save", payload })).json()).toEqual({ kind: "invalid" });
    expect((await app.inject({ method: "POST", url: "/api/articles/delete", payload: { id: "1 OR 1=1" } })).json()).toEqual({ kind: "invalid" });
    expect(connections).toBe(beforeInvalid);
    const saved = (await app.inject({ method: "POST", url: "/api/articles/save", payload: { mode: "create", values: initial } })).json();
    expect(saved).toEqual({ kind: "saved", article: { ...initial, id: "1", artigosID: "1", stock: "0" } });
    expect((await app.inject({ method: "POST", url: "/api/articles/list", payload: all })).json()).toEqual({ kind: "loaded", articles: [saved.article] });
    expect((await app.inject({ method: "POST", url: "/api/articles/save", payload: { mode: "update", id: saved.article.id, values: { ...initial, preco: "10.125", inativo: true } } })).json()).toEqual({ kind: "saved", article: { ...saved.article, preco: "10.125", inativo: true } });
    expect((await app.inject({ method: "POST", url: "/api/articles/check-delete", payload: { id: saved.article.id } })).json()).toEqual({ kind: "ready" });
    expect((await app.inject({ method: "POST", url: "/api/articles/delete", payload: { id: saved.article.id } })).json()).toEqual({ kind: "deleted" });
  } finally { await app.close(); }
});

it("GS-ARTICLES-001 real API replay matches all eight spec-derived fields without rounding", async () => {
  await database.query('INSERT INTO app."unidades" ("unidadesID","Codigo","Descricao") VALUES (1,$1,$2),(2,$3,$4)', ["UN", "Unidade", "CX", "Caixa"]);
  const app = createApp({ articleConnect: connect, authenticate: async () => ({ userId: "synthetic-article-golden" }) });
  try {
    const values: ArticleValues = { Codigo: "A'1", Descricao: "Filtro d'Água  ", codbarras: "BAR'1", unidade: "UN", preco: "12.3456789", inativo: false };
    const saved = (await app.inject({ method: "POST", url: "/api/articles/save", payload: { mode: "create", values } })).json();
    expect(saved).toEqual({ kind: "saved", article: { ...values, id: "1", artigosID: "1", stock: "0" } });
    const changed = { ...values, Descricao: "Filtro revisto  ", codbarras: "BAR'2", unidade: "CX", preco: "-10.125", inativo: true };
    expect((await app.inject({ method: "POST", url: "/api/articles/save", payload: { mode: "update", id: saved.article.id, values: changed } })).json()).toEqual({ kind: "saved", article: { ...changed, id: "1", artigosID: "1", stock: "0" } });
    expect((await app.inject({ method: "POST", url: "/api/articles/save", payload: { mode: "create", values: changed } })).json()).toEqual(barcodeDuplicate);
    expect((await app.inject({ method: "POST", url: "/api/articles/save", payload: { mode: "create", values: { ...changed, codbarras: "" } } })).json()).toEqual({ kind: "duplicate", message: "Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: A'1" });
    const exported = await database.query('SELECT "artigosID"::text,"Codigo","Descricao","codbarras","unidade","preco"::text,"inativo","stock"::text FROM app."artigos" WHERE _row_id=$1', [saved.article.id]);
    const target = resolve(server.directory, "article-golden"); await mkdir(target);
    const columns = ["artigosID", "Codigo", "Descricao", "codbarras", "unidade", "preco", "inativo", "stock"], csv = (value: unknown) => '"' + String(value).replaceAll('"', '""') + '"';
    await writeFile(resolve(target, "artigos.csv"), columns.join(",") + "\n" + exported.rows.map(row => columns.map(key => csv(row[key])).join(",")).join("\n") + "\n");
    const compared = await promisify(execFile)(process.env.PYTHON ?? resolve(".venv/Scripts/python.exe"), ["scripts/compare_exports.py", "--config", "docs/golden/GS-ARTICLES-001/compare.json", "--legacy", "docs/golden/GS-ARTICLES-001/after", "--target", target]);
    expect(compared.stderr).toBe("");
  } finally { await app.close(); }
});

it("ADR-002 ADR-011 allocates the final signed8 source identifier then refuses exhaustion without mutation", async () => {
  await database.query('INSERT INTO app."artigos" ("artigosID","Codigo") VALUES (9223372036854775806,$1)', ["TOP"]);
  const last = await create({ ...initial, Codigo: "END" }); expect(last.artigosID).toBe("9223372036854775807");
  const before = await snapshot();
  expect(await saveArticle(connect, { mode: "create", values: { ...initial, Codigo: "MAX" } })).toEqual({ kind: "failed" });
  expect(await snapshot()).toEqual(before);
});
