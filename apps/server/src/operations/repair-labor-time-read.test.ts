import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { readRepairLabor, readRepairLaborTime } from "./repair-labor";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => { server = await startIsolatedPostgres(); database = await server.database(); await migrate(database); const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => server.connect(name); }, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => { await database.query('TRUNCATE app."tempos_reparacao",app."ordem_reparacao",app."mecanicos" RESTART IDENTITY'); });

it("SRC-2d9efea86e reads exact numero AND mechanic without joins and orders lossless source IDs above2to53 without an open-only predicate", async () => {
  await database.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim","Inicio_reparacao_estado","fim_reparacao_estado") VALUES
    (9007199254740993,10,2,'20261025130000000','00000000000000000','R',''),
    (9007199254740992,10,2,'2026-10-25 12:00:00.001','20261025125959000','X','F'),
    (1,10,2,NULL,NULL,NULL,NULL),(7,11,2,'other number','other number',NULL,NULL),(8,10,10,'other mechanic','other mechanic',NULL,NULL),(9,10,NULL,'null mechanic','null mechanic',NULL,NULL)`);
  const result = await readRepairLaborTime(connect, { numero: "10", mechanic: 2 });
  expect(result.kind).toBe("loaded"); if (result.kind !== "loaded") throw new Error(result.kind);
  expect(result.labor.map(row => row.tempos_reparacaoID)).toEqual(["1", "9007199254740992", "9007199254740993"]);
  expect(result.labor.map(({ numero, mecanico, inicio, fim, Inicio_reparacao_estado, fim_reparacao_estado }) => ({ numero, mecanico, inicio, fim, Inicio_reparacao_estado, fim_reparacao_estado }))).toEqual([
    { numero: "10", mecanico: 2, inicio: null, fim: null, Inicio_reparacao_estado: null, fim_reparacao_estado: null },
    { numero: "10", mecanico: 2, inicio: "2026-10-25 12:00:00.001", fim: "20261025125959000", Inicio_reparacao_estado: "X", fim_reparacao_estado: "F" },
    { numero: "10", mecanico: 2, inicio: "20261025130000000", fim: "00000000000000000", Inicio_reparacao_estado: "R", fim_reparacao_estado: "" },
  ]);
  expect(await readRepairLaborTime(connect, { numero: "10", mechanic: 0 })).toEqual({ kind: "loaded", labor: [] });
  expect(await readRepairLaborTime(connect, { numero: "0", mechanic: 2 })).toEqual({ kind: "loaded", labor: [] });
});

it("SRC-2d9efea86e leaves the details mechanic INNER JOIN unchanged while Time retains labor after its mechanic and order disappear", async () => {
  await database.query(`INSERT INTO app."ordem_reparacao" ("numero","reparacao_mecanico") VALUES (10,2);
    INSERT INTO app."mecanicos" ("Codigo","Descricao") VALUES (2,'Original'),(10,'Other');
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (1,10,2,'20261025120000000','00000000000000000'),(2,10,10,'20261025130000000','20261025140000000');
    DELETE FROM app."mecanicos" WHERE "Codigo"=2`);
  const details = await readRepairLabor(connect, { numero: "10" });
  expect(details.kind).toBe("loaded"); if (details.kind !== "loaded") throw new Error(details.kind);
  expect(details.labor.map(row => row.mecanico)).toEqual([10]);
  const before = await readRepairLaborTime(connect, { numero: "10", mechanic: 2 }); expect(before.kind).toBe("loaded");
  if (before.kind !== "loaded") throw new Error(before.kind); expect(before.labor).toHaveLength(1); expect(before.labor[0].fim).toBe("00000000000000000");
  await database.query('DELETE FROM app."ordem_reparacao" WHERE "numero"=10');
  expect(await readRepairLaborTime(connect, { numero: "10", mechanic: 2 })).toEqual(before);
  expect(await readRepairLabor(connect, { numero: "10" })).toEqual({ kind: "missing" });
});

it("SRC-2d9efea86e validates exact primitive query parameters before a connection and returns a typed unavailable read", async () => {
  let connections = 0; const unavailable: DatabaseConnection = async () => { connections++; throw new Error("synthetic unavailable"); };
  for (const input of [{ numero: "-1", mechanic: 2 }, { numero: "10", mechanic: 256 }, { numero: "10", mechanic: null }, { numero: "10" }, { numero: "10", mechanic: 2, join: true }]) expect(await readRepairLaborTime(unavailable, input)).toEqual({ kind: "invalid" });
  expect(connections).toBe(0); expect(await readRepairLaborTime(unavailable, { numero: "10", mechanic: 2 })).toEqual({ kind: "failed" }); expect(connections).toBe(1);
});
