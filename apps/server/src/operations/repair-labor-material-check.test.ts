import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { checkRepairLaborMaterials, readRepairLabor } from "./repair-labor";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
const numero = "9007199254740993", blocked = { kind: "blocked", message: "Não pode ser inserido material nesta ordem de reparação" };
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => server.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => {
  await database.query(`TRUNCATE app."ordem_reparacao",app."estados_reparacao" RESTART IDENTITY;
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","lancar_material") VALUES (1,'R',true),(2,'X',false);
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","reparacao_estado","recepcao_servico") VALUES (77,9007199254740993,'R','Original')`);
});

it("SRC-0f2fcff124 rereads the actual current order state and explicit false flag instead of trusting opening details", async () => {
  const opening = await readRepairLabor(connect, { numero }); expect(opening.kind).toBe("loaded");
  await database.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=$1 WHERE "numero"=$2', ["X", numero]);
  expect(await checkRepairLaborMaterials(connect, { numero })).toEqual(blocked);
  await database.query('UPDATE app."estados_reparacao" SET "lancar_material"=true WHERE "Codigo"=$1', ["X"]);
  const result = await checkRepairLaborMaterials(connect, { numero });
  expect(result.kind).toBe("ready"); if (result.kind !== "ready") throw new Error(result.kind);
  expect(result.order).toMatchObject({ id: "1", numero, reparacao_estado: "X", recepcao_servico: "Original" });
  expect((await database.query('SELECT "reparacao_estado" FROM app."ordem_reparacao"')).rows[0]).toEqual({ reparacao_estado: "X" });
});

it("SRC-0f2fcff124 ADR002 keeps NULL distinct from false and retains each raw state flag", async () => {
  for (const flag of [null, true, false]) {
    await database.query('UPDATE app."estados_reparacao" SET "lancar_material"=$1 WHERE "Codigo"=$2', [flag, "R"]);
    const result = await checkRepairLaborMaterials(connect, { numero });
    expect(result.kind).toBe(flag === false ? "blocked" : "ready");
    expect((await database.query('SELECT "lancar_material" FROM app."estados_reparacao" WHERE "Codigo"=$1', ["R"])).rows[0].lancar_material).toBe(flag);
  }
});

it("SRC-0f2fcff124 skips Open when the source state query has no row and does not fabricate an order", async () => {
  await database.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=$1', ["ORPHAN"]);
  expect(await checkRepairLaborMaterials(connect, { numero })).toEqual({ kind: "skip" });
  await database.query('UPDATE app."ordem_reparacao" SET "reparacao_estado"=NULL');
  expect(await checkRepairLaborMaterials(connect, { numero })).toEqual({ kind: "skip" });
  expect(await checkRepairLaborMaterials(connect, { numero: "1" })).toEqual({ kind: "missing" });
});

it("SRC-0f2fcff124 ADR006 classifies competing row locks and closes every successful check before a modal may open", async () => {
  const blocker = await connect();
  try {
    await blocker.query("BEGIN"); await blocker.query('SELECT _row_id FROM app."ordem_reparacao" WHERE "numero"=$1 FOR UPDATE', [numero]);
    expect(await checkRepairLaborMaterials(connect, { numero })).toEqual({ kind: "in_use" });
  } finally { await blocker.query("ROLLBACK"); await blocker.end(); }
  const pids: number[] = [];
  const observed: DatabaseConnection = async () => {
    const client = await connect(); pids.push((await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid); return client;
  };
  expect((await checkRepairLaborMaterials(observed, { numero })).kind).toBe("ready");
  await database.query("SET lock_timeout='500ms'");
  try { await database.query('UPDATE app."ordem_reparacao" SET "recepcao_servico"=$1 WHERE "numero"=$2', ["Concurrent after check", numero]); }
  finally { await database.query("RESET lock_timeout"); }
  expect((await database.query('SELECT "recepcao_servico" FROM app."ordem_reparacao"')).rows[0].recepcao_servico).toBe("Concurrent after check");
  expect((await database.query('SELECT count(*)::int AS count FROM pg_stat_activity WHERE pid=ANY($1::int[])', [pids])).rows[0].count).toBe(0);
  await database.query('UPDATE app."estados_reparacao" SET "lancar_material"=false');
  expect(await checkRepairLaborMaterials(observed, { numero })).toEqual(blocked);
  expect((await database.query('SELECT count(*)::int AS count FROM pg_stat_activity WHERE pid=ANY($1::int[])', [pids])).rows[0].count).toBe(0);
});

it("SRC-0f2fcff124 validates the material-check boundary before connection and owns connection failure", async () => {
  let connections = 0;
  const unavailable: DatabaseConnection = async () => { connections++; throw new Error("synthetic unavailable"); };
  expect(await checkRepairLaborMaterials(unavailable, { numero: "-1" })).toEqual({ kind: "invalid" });
  expect(await checkRepairLaborMaterials(unavailable, { numero, launch: true })).toEqual({ kind: "invalid" });
  expect(connections).toBe(0);
  expect(await checkRepairLaborMaterials(unavailable, { numero })).toEqual({ kind: "failed" }); expect(connections).toBe(1);
});
