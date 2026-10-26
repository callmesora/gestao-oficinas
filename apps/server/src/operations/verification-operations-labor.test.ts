import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { createApp } from "../app";
import type { RepairLaborReadResult } from "../../../../packages/domain/src/repair-labor";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, app: ReturnType<typeof createApp>;
const open = "00000000000000000", when = "20261026123456789", now = "20261026123500001";
beforeAll(async () => { engine = await startIsolatedPostgres(); }, 60000);
beforeEach(async () => {
  database = await engine.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  app = createApp({ repairLaborConnect: () => engine.connect(name), authenticate: async request => request.headers.authorization === "Bearer synthetic-operations-labor" ? { userId: "synthetic-operations-labor" } : null });
  await database.query(`INSERT INTO app."mecanicos" ("Codigo","Descricao") VALUES (7,'Mecânico');
    INSERT INTO app."Viaturas" ("matricula","marca","modelo") VALUES ('AA','Marca','Modelo');
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo") VALUES ('R','Reparação',3),('S3','Estado3',3),('S4','Estado4',4),('S5','Estado5',5),('S6','Estado6',6),('S7','Estado7',7);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_estado","reparacao_estado_historico","reparacao_servico") VALUES (10,'AA','R','Antigo','Original');
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES
      (1,10,7,'20261026100000000','00000000000000000'),(2,10,7,'20261026110000000','00000000000000000'),
      (3,10,7,'20261026110000000',''),(4,10,7,'20261026110000000',NULL),(5,20,7,'20261026110000000','00000000000000000')`);
});
afterEach(async () => { await app?.close(); await database?.end(); });
afterAll(async () => { await engine?.stop(); }, 60000);
async function post(action: string, payload: unknown) {
  const response = await app.inject({ method: "POST", url: `/api/repair-labor/${action}`, headers: { authorization: "Bearer synthetic-operations-labor", "content-type": "application/json" }, payload: JSON.stringify(payload) });
  expect(response.statusCode).toBe(200); return response.json();
}
async function command(type: number) {
  const loaded = await post("read", { numero: "10" }) as Extract<RepairLaborReadResult, { kind: "loaded" }>;
  expect(loaded.kind).toBe("loaded");
  return { numero: "10", baseline: loaded.baseline, stateId: loaded.choices.find(row => row.Codigo === `S${type}`)!.id, when, description: " Descrição d'água ", service: "Serviço\r\n2", now };
}
it.each([3, 4, 5, 6, 7])("verification operations state tipo%s updates exact cached history and closes only own literal zero17 rows for6or7", async type => {
  expect(await post("state", await command(type))).toEqual({ kind: "saved" });
  expect((await database.query('SELECT "reparacao_estado","reparacao_estado_data","reparacao_estado_obs","reparacao_estado_historico","reparacao_servico" FROM app."ordem_reparacao"')).rows).toEqual([{
    reparacao_estado: `S${type}`, reparacao_estado_data: when, reparacao_estado_obs: " Descrição d'água ", reparacao_servico: "Serviço\r\n2",
    reparacao_estado_historico: `Antigo\r\n\r\n26/10/2026 12:34    Estado${type}\r\n Descrição d'água `,
  }]);
  expect((await database.query('SELECT "fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual([
    { fim: type >= 6 ? now : open, fim_reparacao_estado: type >= 6 ? `S${type}` : null }, { fim: type >= 6 ? now : open, fim_reparacao_estado: type >= 6 ? `S${type}` : null },
    { fim: "", fim_reparacao_estado: null }, { fim: null, fim_reparacao_estado: null }, { fim: open, fim_reparacao_estado: null },
  ]);
});
it("verification operations failed state closure rolls back earlier history service state and every changed labor row", async () => {
  const input = await command(7);
  const snapshot = async () => (await database.query(`SELECT jsonb_build_object('orders',(SELECT jsonb_agg(to_jsonb(o)) FROM app."ordem_reparacao" o),'labor',(SELECT jsonb_agg(to_jsonb(t) ORDER BY _row_id) FROM app."tempos_reparacao" t)) AS state`)).rows[0].state;
  const before = await snapshot();
  await database.query(`CREATE FUNCTION app.verification_operations_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."tempos_reparacaoID"=2 THEN RAISE EXCEPTION 'synthetic'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER verification_operations_failure AFTER UPDATE ON app."tempos_reparacao" FOR EACH ROW EXECUTE FUNCTION app.verification_operations_failure()`);
  expect(await post("state", input)).toEqual({ kind: "failed" }); expect(await snapshot()).toEqual(before);
  await database.query('DROP TRIGGER verification_operations_failure ON app."tempos_reparacao"; DROP FUNCTION app.verification_operations_failure()');
  expect(await post("state", input)).toEqual({ kind: "saved" });
});
