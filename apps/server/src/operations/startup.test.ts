import { beforeAll, afterAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { createApp } from "../app";
import { checkStartupAccess, initialiseStartup, readSystem, saveSystem } from "./startup";
import { systemDefaults } from "../../../../packages/domain/src/startup";
let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => { engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database); const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => engine.connect(name); }, 60000);
afterAll(async () => { await database?.end(); await engine?.stop(); }, 60000);
beforeEach(async () => { await database.query('TRUNCATE app."sistema",app."utilizadores" RESTART IDENTITY'); });

it("SRC-e0dfacbe65 creates only safe source system defaults once and never invents a bootstrap credential", async () => {
  const results = await Promise.all([initialiseStartup(connect, {}), initialiseStartup(connect, {})]);
  for (const result of results) expect(result).toEqual({ kind: "ready", system: { id: "1", ...systemDefaults }, bootstrapRequired: true });
  expect((await database.query('SELECT count(*)::text AS n FROM app."sistema"')).rows[0].n).toBe("1");
  expect((await database.query('SELECT count(*)::text AS n FROM app."utilizadores"')).rows[0].n).toBe("0");
});
it("SRC-9890c46def SRC-d9a33f8b29 rereads first and saves exact six values while retaining other rows/NULL/raw time", async () => {
  const values = { Tempo_ordem_reparacao: "18446744073709551615", Tempo_materiais: null, Tempo_tempos: "0", Data_inicio: -2147483648, encerrar_tempos1: null, encerrar_tempos2: "opaque time  " };
  expect(await readSystem(connect, {})).toEqual({ kind: "loaded", system: null });
  const saved = await saveSystem(connect, values); expect(saved).toEqual({ kind: "saved", system: { id: "1", ...values } });
  await database.query('INSERT INTO app."sistema" ("Data_inicio") VALUES (8)');
  const next = { ...values, Data_inicio: 7, encerrar_tempos1: "000000" };
  expect(await saveSystem(connect, next)).toEqual({ kind: "saved", system: { id: "1", ...next } });
  expect((await database.query('SELECT "Data_inicio" FROM app."sistema" ORDER BY _row_id')).rows).toEqual([{ Data_inicio: 7 }, { Data_inicio: 8 }]);
  expect(await readSystem(connect, {})).toEqual({ kind: "loaded", system: { id: "1", ...next } });
});
it("SRC-7891e7fd29 compares selected uppercase input with exact stored synthetic credential and returns public identity only", async () => {
  await database.query('INSERT INTO app."utilizadores" ("Codigo","Descricao","palavra_passe") VALUES (2,$1,$2),(3,$3,$4),(4,NULL,NULL)', [" Synthetic  ", "P'ASS  ", "Lowercase synthetic", "lower"]);
  const result = await checkStartupAccess(connect, { code: 2, password: "p'ass  " });
  expect(result).toEqual({ kind: "continuar", user: { id: "1", Codigo: 2, Descricao: " Synthetic  " } });
  expect(JSON.stringify(result)).not.toContain("palavra_passe");
  for (const command of [{ code: 2, password: "p'ass" }, { code: 3, password: "lower" }, { code: 4, password: "" }]) expect(await checkStartupAccess(connect, command)).toEqual({ kind: "incorrect", message: "Utilizador e/ou palavra-passe incorreto(s)" });
  expect(await checkStartupAccess(connect, { code: 0, password: "" })).toEqual({ kind: "missing" });
});
it("ADR004 source access/system operations deny anonymous direct API calls and never create a production session", async () => {
  const anonymous = createApp({ startupConnect: connect });
  for (const operation of ["initialise", "access", "system-read", "system-save"]) { const response = await anonymous.inject({ method: "POST", url: `/api/startup/${operation}`, payload: {} }); expect(response.statusCode).toBe(401); expect(response.headers["cache-control"]).toBe("no-store"); }
  await anonymous.close();
  const authenticated = createApp({ startupConnect: connect, authenticate: async () => ({ userId: "synthetic-session" }) });
  const response = await authenticated.inject({ method: "POST", url: "/api/startup/initialise", payload: {} }); expect(response.statusCode).toBe(200); expect(response.json().kind).toBe("ready");
  expect(response.json()).not.toHaveProperty("token"); await authenticated.close();
});
it("SRC-d9a33f8b29 U03 rollback retains prior settings and invalid boundaries acquire no connection", async () => {
  await saveSystem(connect, systemDefaults);
  await database.query(`CREATE FUNCTION public.startup_refuse() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic'; END $$; CREATE TRIGGER startup_refuse BEFORE UPDATE ON app."sistema" FOR EACH ROW EXECUTE FUNCTION public.startup_refuse()`);
  try { expect(await saveSystem(connect, { ...systemDefaults, Tempo_tempos: "99" })).toEqual({ kind: "failed" }); expect(await readSystem(connect, {})).toEqual({ kind: "loaded", system: { id: "1", ...systemDefaults } }); }
  finally { await database.query('DROP TRIGGER startup_refuse ON app."sistema"; DROP FUNCTION public.startup_refuse()'); }
  const unreachable = async (): Promise<Client> => { throw new Error("must not connect"); };
  expect(await saveSystem(unreachable, { ...systemDefaults, Tempo_tempos: "18446744073709551616" })).toEqual({ kind: "invalid" });
  expect(await checkStartupAccess(unreachable, { code: 1, password: "x", authenticated: true })).toEqual({ kind: "invalid" });
});
