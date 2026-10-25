import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import { reassignReceptionCustomers } from "./startup-utilities";
let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: () => Promise<Client>;
beforeAll(async () => { engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database); const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => engine.connect(name); }, 60000);
afterAll(async () => { await database?.end(); await engine?.stop(); }, 60000);
beforeEach(async () => { await database.query('TRUNCATE app."ordem_reparacao",app."Viaturas",app."Clientes",app."estados_reparacao",app."mecanicos" RESTART IDENTITY'); });
async function common() { await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,$1),(2,$2)', ["Old customer", "Other existing"]); await database.query('INSERT INTO app."estados_reparacao" ("Codigo") VALUES ($1)', ["OPEN"]); }
async function vehicle(registration: string, customer: string | null) { await database.query('INSERT INTO app."Viaturas" ("matricula","Cliente") VALUES ($1,$2)', [registration, customer]); }
async function order(number: string | null, registration: string | null, customer = "1", state = "OPEN", mechanic: number | null = null, third: string | null = null) { await database.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_terceiro") VALUES ($1,$2,$3,$4,$5,$6)', [number, registration, customer, state, mechanic, third]); }
async function customers() { return (await database.query('SELECT "numero"::text,"recepcao_cliente"::text FROM app."ordem_reparacao" ORDER BY _row_id')).rows; }
it("SRC-1d228089f7 preserves exact mandatory joins, optional mechanic/third-party and writes current vehicle owner even without a new customer row", async () => {
  await common(); await vehicle("OWNED", "18446744073709551615"); await vehicle("NO-STATE", "77"); await vehicle("NO-OLD-CUSTOMER", "78");
  await order("9007199254740993", "OWNED", "1", "OPEN", 199, "999"); await order("2", "MISSING-VEHICLE"); await order("3", "NO-STATE", "1", "MISSING"); await order("4", "NO-OLD-CUSTOMER", "999"); await order("5", null);
  expect(await reassignReceptionCustomers(connect, {})).toEqual({ kind: "completed" }); expect(await customers()).toEqual([{ numero: "9007199254740993", recepcao_cliente: "18446744073709551615" }, { numero: "2", recepcao_cliente: "1" }, { numero: "3", recepcao_cliente: "1" }, { numero: "4", recepcao_cliente: "999" }, { numero: "5", recepcao_cliente: "1" }]);
});
it("SRC-1d228089f7 retains duplicate query rows and source numero descending update sequence", async () => {
  await common(); await vehicle("DUP", "2"); await vehicle("DUP", "2"); await order("1", "DUP"); await order("9007199254740993", "DUP");
  await database.query('CREATE TABLE public.utility_trace(position bigint GENERATED ALWAYS AS IDENTITY,numero numeric(20,0)); CREATE FUNCTION public.utility_trace_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.utility_trace(numero) VALUES (NEW."numero"); RETURN NEW; END $$; CREATE TRIGGER utility_trace BEFORE UPDATE ON app."ordem_reparacao" FOR EACH ROW EXECUTE FUNCTION public.utility_trace_write()');
  try { expect(await reassignReceptionCustomers(connect, {})).toEqual({ kind: "completed" }); expect((await database.query('SELECT numero::text FROM public.utility_trace ORDER BY position')).rows).toEqual([{ numero: "9007199254740993" }, { numero: "9007199254740993" }, { numero: "1" }, { numero: "1" }]); }
  finally { await database.query('DROP TRIGGER utility_trace ON app."ordem_reparacao"; DROP FUNCTION public.utility_trace_write(); DROP TABLE public.utility_trace'); }
});
it("SRC-1d228089f7 U03 preflight refuses conflicting/NULL vehicle owners and NULL eligible numbers before any earlier order is written", async () => {
  await common(); await vehicle("SAFE", "2"); await vehicle("AMBIGUOUS", "2"); await vehicle("AMBIGUOUS", "3"); await order("100", "SAFE"); await order("1", "AMBIGUOUS");
  const before = await customers(); expect(await reassignReceptionCustomers(connect, {})).toEqual({ kind: "unresolved" }); expect(await customers()).toEqual(before);
  await database.query('DELETE FROM app."ordem_reparacao" WHERE "numero"=1'); await vehicle("NULL-OWNER", null); await order("1", "NULL-OWNER"); const nullOwner = await customers(); expect(await reassignReceptionCustomers(connect, {})).toEqual({ kind: "unresolved" }); expect(await customers()).toEqual(nullOwner);
  await database.query('DELETE FROM app."ordem_reparacao" WHERE "numero"=1'); await order(null, "SAFE"); const nullNumber = await customers(); expect(await reassignReceptionCustomers(connect, {})).toEqual({ kind: "unresolved" }); expect(await customers()).toEqual(nullNumber);
});
it("SRC-1d228089f7 ADR006 target rollback retains every earlier row when a later update fails; source partial-write edges stay U03", async () => {
  await common(); await vehicle("SAFE", "2"); await order("100", "SAFE"); await order("1", "SAFE");
  await database.query('CREATE FUNCTION public.utility_refuse() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."numero"=1 THEN RAISE EXCEPTION \'synthetic\'; END IF; RETURN NEW; END $$; CREATE TRIGGER utility_refuse BEFORE UPDATE ON app."ordem_reparacao" FOR EACH ROW EXECUTE FUNCTION public.utility_refuse()');
  try { const before = await customers(); expect(await reassignReceptionCustomers(connect, {})).toEqual({ kind: "failed" }); expect(await customers()).toEqual(before); }
  finally { await database.query('DROP TRIGGER utility_refuse ON app."ordem_reparacao"; DROP FUNCTION public.utility_refuse()'); }
});
it("SRC-1d228089f7 empty eligible traversal still completes; invalid input acquires no database", async () => {
  expect(await reassignReceptionCustomers(connect, {})).toEqual({ kind: "completed" }); let called = false; expect(await reassignReceptionCustomers(async () => { called = true; throw new Error(); }, { allOrders: true })).toEqual({ kind: "invalid" }); expect(called).toBe(false);
});

it("ADR004 SRC-1d228089f7 actual utility API denies direct anonymous calls before database acquisition", async () => {
  let called = false; const app = createApp({ startupConnect: async () => { called = true; return connect(); } });
  try { const reply = await app.inject({ method: "POST", url: "/api/startup/reassign-customers", payload: {} }); expect(reply.statusCode).toBe(401); expect(reply.json()).toEqual({ kind: "unauthenticated" }); expect(called).toBe(false); }
  finally { await app.close(); }
});
