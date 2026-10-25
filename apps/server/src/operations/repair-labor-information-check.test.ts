import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { checkRepairLaborInformation } from "./repair-labor";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const numero = "9007199254740993";
beforeAll(async () => { server = await startIsolatedPostgres(); database = await server.database(); await migrate(database); const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => server.connect(name); }, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => { await database.query('TRUNCATE app."ordem_reparacao" RESTART IDENTITY; INSERT INTO app."ordem_reparacao" ("numero","recepcao_servico") VALUES (9007199254740993,\'Original\')'); });

it("SRC-09bc2d45fd SRC-6b343b3c1d ADR006 refuses an actual NOWAIT row conflict and allows the exact selected order after release", async () => {
  const blocker = await connect();
  try {
    await blocker.query("BEGIN"); await blocker.query('SELECT _row_id FROM app."ordem_reparacao" WHERE "numero"=$1 FOR UPDATE', [numero]);
    expect(await checkRepairLaborInformation(connect, { numero })).toEqual({ kind: "in_use" });
    expect(await checkRepairLaborInformation(connect, { numero: "9007199254740992" })).toEqual({ kind: "missing" });
  } finally { await blocker.query("ROLLBACK"); await blocker.end(); }
  expect(await checkRepairLaborInformation(connect, { numero })).toEqual({ kind: "ready" });
  expect((await database.query('SELECT "numero"::text,"recepcao_servico" FROM app."ordem_reparacao"')).rows).toEqual([{ numero, recepcao_servico: "Original" }]);
});

it("SRC-09bc2d45fd SRC-6b343b3c1d ADR006 releases its owned connection before a modal and makes no order write", async () => {
  const pids: number[] = [], observed: DatabaseConnection = async () => {
    const client = await connect(); pids.push((await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid); return client;
  };
  const before = (await database.query('SELECT to_jsonb(o) AS row FROM app."ordem_reparacao" o ORDER BY _row_id')).rows;
  expect(await checkRepairLaborInformation(observed, { numero })).toEqual({ kind: "ready" });
  expect((await database.query('SELECT to_jsonb(o) AS row FROM app."ordem_reparacao" o ORDER BY _row_id')).rows).toEqual(before);
  expect((await database.query('SELECT count(*)::int AS count FROM pg_stat_activity WHERE pid=ANY($1::int[])', [pids])).rows[0].count).toBe(0);
  await database.query("SET lock_timeout='500ms'");
  try { await database.query('UPDATE app."ordem_reparacao" SET "recepcao_servico"=$1 WHERE "numero"=$2', ["Concurrent after check", numero]); }
  finally { await database.query("RESET lock_timeout"); }
  expect((await database.query('SELECT "recepcao_servico" FROM app."ordem_reparacao"')).rows[0].recepcao_servico).toBe("Concurrent after check");
});

it("SRC-09bc2d45fd SRC-6b343b3c1d validates the immediate information boundary before connection and reports missing or unavailable safely", async () => {
  let connections = 0; const unavailable: DatabaseConnection = async () => { connections++; throw new Error("synthetic unavailable"); };
  for (const input of [{ numero: "-1" }, { numero: "10", lease: true }, { numero: 10 }]) expect(await checkRepairLaborInformation(unavailable, input)).toEqual({ kind: "invalid" });
  expect(connections).toBe(0); expect(await checkRepairLaborInformation(unavailable, { numero })).toEqual({ kind: "failed" }); expect(connections).toBe(1);
  await database.query('DELETE FROM app."ordem_reparacao" WHERE "numero"=$1', [numero]);
  expect(await checkRepairLaborInformation(connect, { numero })).toEqual({ kind: "missing" });
});
