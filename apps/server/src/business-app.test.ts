import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { migrate } from "./db/migrate";
import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { createBusinessApp } from "./business-app";
import { readServiceConfiguration, type ServiceConfiguration } from "./configuration";
import { startIsolatedPostgres } from "../test-support/postgres";
let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, configuration: ServiceConfiguration, app: Awaited<ReturnType<typeof createBusinessApp>>;
beforeAll(async () => {
  engine = await startIsolatedPostgres(); database = await engine.database();
  const url = new URL(`postgresql://127.0.0.1:${database.port}/${database.database}`); url.username = database.user!; url.password = database.password!;
  configuration = { ...await readServiceConfiguration({ WORKSHOP_DATABASE_URL: url.href, WORKSHOP_ALLOWED_ORIGINS: "http://127.0.0.1:1435" }), setupToken: "a".repeat(64) };
  app = await createBusinessApp(configuration);
}, 60000);
afterAll(async () => { await app?.close(); await database?.end(); await engine?.stop(); }, 60000);
it("ADR004 actual persistent factory migrates fresh database, authenticates real CRUD/defaults and preserves token/account across service restart", async () => {
  expect((await database.query('SELECT "Tempo_materiais"::text,"Data_inicio","encerrar_tempos1" FROM app."sistema"')).rows).toEqual([{ Tempo_materiais: "15", Data_inicio: 7, encerrar_tempos1: "030000" }]);
  expect((await database.query('SELECT count(*)::text AS count FROM app."utilizadores"')).rows[0].count).toBe("0");
  expect((await database.query('SELECT count(*)::text AS count FROM auth.credentials')).rows[0].count).toBe("0");
  expect((await app.inject({ method: "POST", url: "/api/startup/initialise", payload: {} })).statusCode).toBe(401);
  expect((await app.inject({ method: "POST", url: "/api/development/session", payload: {} })).statusCode).toBe(404);
  const enrolled = await app.inject({ method: "POST", url: "/api/auth/enroll", payload: { code: 1, password: "Synthetic42", token: configuration.setupToken } }); expect(enrolled.json().kind).toBe("continuar"); const token = enrolled.json().session.token, headers = { Authorization: `Bearer ${token}` };
  const initialized = await app.inject({ method: "POST", url: "/api/startup/initialise", headers, payload: {} }); expect(initialized.json()).toMatchObject({ kind: "ready", system: { Tempo_materiais: "15", Data_inicio: 7, encerrar_tempos1: "030000" }, bootstrapRequired: false });
  const saved = await app.inject({ method: "POST", url: "/api/customers/save", headers, payload: { mode: "create", values: { Codigo: "861", Descricao: "Persistent business customer", Morada1: "", Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "" } } }); expect(saved.json().kind).toBe("saved");
  expect((await database.query('SELECT "Descricao" FROM app."Clientes" WHERE "Codigo"=861')).rows).toEqual([{ Descricao: "Persistent business customer" }]);
  await app.close(); app = await createBusinessApp(configuration);
  expect((await app.inject({ method: "POST", url: "/api/auth/session", headers, payload: {} })).json().kind).toBe("authenticated");
  const listed = await app.inject({ method: "POST", url: "/api/customers/list", headers, payload: { mode: "codigo", term: "861" } }); expect(listed.json().customers).toMatchObject([{ Codigo: "861", Descricao: "Persistent business customer" }]);
  expect((await app.inject({ method: "POST", url: "/api/report-filters/states", headers, payload: { mode: "vendas" } })).json().kind).toBe("loaded");
  // Legacy plaintext compare remains DEV-only even after a real production session exists.
  expect((await app.inject({ method: "POST", url: "/api/startup/access", headers, payload: { code: 1, password: "Synthetic42" } })).json()).toEqual({ kind: "invalid" });
});
it("ADR004 actual loopback browser CORS preflight is exact and unknown origins cannot obtain public setup metadata", async () => {
  const allowed = await app.inject({ method: "OPTIONS", url: "/api/auth/status", headers: { origin: "http://127.0.0.1:1435", "access-control-request-method": "POST", "access-control-request-headers": "content-type,authorization" } }); expect(allowed.statusCode).toBe(204); expect(allowed.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:1435"); expect(allowed.headers["access-control-allow-origin"]).not.toBe("*");
  const denied = await app.inject({ method: "POST", url: "/api/auth/status", headers: { origin: "http://untrusted.invalid" }, payload: {} }); expect(denied.statusCode).toBe(403); expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
});

it("ADR004 migration0002 upgrades the actual previous release schema without adopting or altering copied credentials/business rows", async () => {
  const previous = await engine.database();
  try {
    const sql = await readFile(new URL("../migrations/0001_legacy_values.sql", import.meta.url), "utf8"), hash = createHash("sha256").update(sql).digest("hex");
    await previous.query(sql); await previous.query("CREATE TABLE public.schema_migrations(name text PRIMARY KEY,sha256 text NOT NULL,applied_at timestamptz NOT NULL DEFAULT clock_timestamp())"); await previous.query("INSERT INTO public.schema_migrations(name,sha256) VALUES($1,$2)", ["0001_legacy_values.sql", hash]);
    await previous.query('INSERT INTO app."utilizadores" ("Codigo","Descricao","palavra_passe") VALUES (9,$1,$2)', ["Previous release synthetic", "OLD-SYNTHETIC"]);
    await migrate(previous); await migrate(previous);
    expect((await previous.query('SELECT "Codigo","Descricao","palavra_passe" FROM app."utilizadores"')).rows).toEqual([{ Codigo: 9, Descricao: "Previous release synthetic", palavra_passe: "OLD-SYNTHETIC" }]);
    expect((await previous.query("SELECT count(*)::text AS count FROM auth.credentials")).rows[0].count).toBe("0"); expect((await previous.query("SELECT consumed FROM auth.enrollment")).rows).toEqual([{ consumed: false }]);
    expect((await previous.query("SELECT sha256 FROM public.schema_migrations WHERE name='0001_legacy_values.sql'")).rows).toEqual([{ sha256: hash }]); expect((await previous.query("SELECT count(*)::text AS count FROM public.schema_migrations")).rows[0].count).toBe("2");
  } finally { await previous.end(); }
});
