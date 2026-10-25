import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { prepareRepairLabor, readRepairLaborStateChoices, toggleRepairLabor } from "./repair-labor";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => { server = await startIsolatedPostgres(); database = await server.database(); await migrate(database); const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name; connect = () => server.connect(name); }, 60000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60000);
beforeEach(async () => { await database.query('TRUNCATE app."estados_reparacao",app."ordem_reparacao",app."tempos_reparacao",app."mecanicos" RESTART IDENTITY'); });

it("SRC-7810f8745a reads only current source tipo3/4/5 choices in type order without requiring an order", async () => {
  await database.query(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor","lancar_defa") VALUES
    (1,'F','Tipo cinco',5,255,true),(2,'X','Tipo quatro',4,NULL,NULL),(3,'R','Tipo três',3,0,false),
    (4,'E','Excluded two',2,0,false),(5,'Z','Excluded six',6,0,false),(6,'N','Excluded null',NULL,0,false)`);
  const read = await readRepairLaborStateChoices(connect, {}); expect(read.kind).toBe("loaded"); if (read.kind !== "loaded") throw new Error(read.kind);
  expect(read.choices.map(({ Codigo, Descricao, tipo, Cor, lancar_defa }) => ({ Codigo, Descricao, tipo, Cor, lancar_defa }))).toEqual([
    { Codigo: "R", Descricao: "Tipo três", tipo: 3, Cor: 0, lancar_defa: false },
    { Codigo: "X", Descricao: "Tipo quatro", tipo: 4, Cor: null, lancar_defa: null },
    { Codigo: "F", Descricao: "Tipo cinco", tipo: 5, Cor: 255, lancar_defa: true },
  ]);
  await database.query(`DELETE FROM app."estados_reparacao" WHERE "Codigo"='X'; UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"='R';
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo") VALUES (7,'LIVE','Fresh choice',3)`);
  const current = await readRepairLaborStateChoices(connect, {}); expect(current.kind).toBe("loaded"); if (current.kind !== "loaded") throw new Error(current.kind);
  expect(current.choices.map(row => row.Codigo)).toEqual(["LIVE", "F"]);
  expect((await database.query('SELECT count(*)::int AS count FROM app."ordem_reparacao"')).rows[0].count).toBe(0);
});

it("SRC-7810f8745a ADR006 fresh choice reads leave the protected prepared baseline intact and own no modal connection", async () => {
  await database.query(`INSERT INTO app."mecanicos" ("Codigo","palavra_passe") VALUES (2,'Synthetic');
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","tipo") VALUES (1,'E',2),(2,'R',3);
    INSERT INTO app."ordem_reparacao" ("numero","reparacao_estado","reparacao_mecanico") VALUES (10,'E',2)`);
  const proof = { mechanic: 2, password: "Synthetic" }, prepared = await prepareRepairLabor(connect, { numero: "10", proof });
  expect(prepared.kind).toBe("prepared"); if (prepared.kind !== "prepared") throw new Error(prepared.kind);
  await database.query('INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","tipo") VALUES (3,\'LIVE\',4)');
  const pids: number[] = [], observed: DatabaseConnection = async () => {
    const client = await connect(); pids.push((await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid); return client;
  };
  const result = await readRepairLaborStateChoices(observed, {}); expect(result.kind).toBe("loaded"); if (result.kind !== "loaded") throw new Error(result.kind);
  const selected = result.choices.find(row => row.Codigo === "LIVE")!; expect(selected).toBeDefined();
  expect((await database.query('SELECT count(*)::int AS count FROM pg_stat_activity WHERE pid=ANY($1::int[])', [pids])).rows[0].count).toBe(0);
  expect(await toggleRepairLabor(connect, { numero: "10", proof, baseline: prepared.baseline, now: "20261025120000000", closeOthers: [], state: selected.id })).toEqual({ kind: "stale" });
  expect((await database.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_estado).toBe("E");
  expect((await database.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(0);
});

it("SRC-7810f8745a refuses invented query arguments before connecting and returns typed unavailability", async () => {
  let connections = 0; const unavailable: DatabaseConnection = async () => { connections++; throw new Error("synthetic unavailable"); };
  for (const input of [null, undefined, [], { numero: "10" }, { types: [3, 4, 5] }]) expect(await readRepairLaborStateChoices(unavailable, input)).toEqual({ kind: "invalid" });
  expect(connections).toBe(0); expect(await readRepairLaborStateChoices(unavailable, {})).toEqual({ kind: "failed" }); expect(connections).toBe(1);
});
