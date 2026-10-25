import { test as base, expect } from "@playwright/test";
import type { Client } from "pg";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../../apps/server/test-support/postgres";
import { migrate } from "../../apps/server/src/db/migrate";
import { createApp } from "../../apps/server/src/app";
import { developmentSessions } from "../../apps/server/src/development-sessions";

type RepairServer = { origin: string; database: Client };
type TestFixtures = { repairDatabase: Client };
type WorkerFixtures = { repairServer: RepairServer };

export type SyntheticOrder = {
  numero: string; matricula: string | null; recepcao_cliente: string | null; recepcao_terceiro: string | null;
  recepcao_datahora: string | null; recepcao_entrega_prevista: string | null; reparacao_estado: string | null;
  recepcao_prioridade: number | null; reparacao_mecanico: number | null;
};

/** ADR-009: only the dedicated disposable test database is seeded; there is no seed HTTP operation. */
export async function insertSyntheticOrder(database: Client, patch: Partial<SyntheticOrder> & Pick<SyntheticOrder, "numero">) {
  const values: SyntheticOrder = { matricula: "AA-00-AA", recepcao_cliente: "1", recepcao_terceiro: "2",
    recepcao_datahora: "20240229120000000", recepcao_entrega_prevista: "20240301", reparacao_estado: "R",
    recepcao_prioridade: 1, reparacao_mecanico: 2, ...patch };
  const columns = Object.keys(values);
  await database.query(`INSERT INTO app."ordem_reparacao" (${columns.map(column => `"${column}"`).join(",")}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(",")})`, Object.values(values));
}

async function seed(database: Client) {
  await database.query(`TRUNCATE app."ordem_reparacao",app."Clientes",app."Viaturas",app."estados_reparacao",app."mecanicos",app."sistema" RESTART IDENTITY;
    INSERT INTO app."sistema" ("Data_inicio","Tempo_ordem_reparacao") VALUES (65535,60);
    INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao") VALUES
      (1,1,'CLIENTE RECEPÇÃO'),(2,2,'TERCEIRO'),(3,3,'CLIENTE DA VIATURA');
    INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo","Ano","mes") VALUES
      (1,'AA-00-AA',3,'MERCEDES','SPRINTER',2024,2),(2,'BB-00-BB',2,'FORD','TRANSIT',2024,3),(3,'DELETE-ME',1,'SEM','ORDENS',2024,1);
    INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","inativo") VALUES (1,2,'ANA',false),(2,10,'BRUNO',true);
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor","lancar_defa","lancar_material","confirmacao","pedir_data_entrega","pedir_data_pag") VALUES
      (1,'R','Em reparação',1,255,true,true,false,true,false),
      (2,'X','Concluído',2,65280,false,false,true,false,true),
      (3,'N','Sem predefinição',3,NULL,NULL,true,true,true,true),
      (4,NULL,'Sem código',4,16777215,NULL,false,false,false,false)`);
  for (const values of [
    { numero: "2", recepcao_datahora: "20240228000000000", recepcao_entrega_prevista: "20240228" },
    { numero: "10", matricula: "BB-00-BB", recepcao_cliente: "2", recepcao_terceiro: "1", reparacao_estado: "X", recepcao_prioridade: 2, reparacao_mecanico: 10, recepcao_datahora: "20240301235959000", recepcao_entrega_prevista: "20240308" },
    { numero: "11", recepcao_prioridade: 3, reparacao_mecanico: 10, recepcao_datahora: "2024-03-01 23:59:59.000", recepcao_entrega_prevista: "2024-03-08" },
    { numero: "12", recepcao_datahora: "20240301235959001", recepcao_entrega_prevista: "20240308" },
    { numero: "13", recepcao_datahora: "20240227235959999", recepcao_entrega_prevista: "20240301" },
    { numero: "14", recepcao_entrega_prevista: "20240227" },
    { numero: "15", reparacao_estado: "X", recepcao_entrega_prevista: "20240309" },
    { numero: "16", recepcao_datahora: null }, { numero: "17", recepcao_entrega_prevista: null },
    { numero: "18", recepcao_datahora: "", recepcao_entrega_prevista: "" },
    { numero: "19", recepcao_datahora: "00000000000000000", recepcao_entrega_prevista: "00000000" },
    { numero: "20", recepcao_datahora: "20240229120000?" },
    { numero: "21", recepcao_cliente: "999" }, { numero: "22", matricula: "ORPHAN" }, { numero: "23", reparacao_estado: "ORPHAN" },
    { numero: "9007199254740992" }, { numero: "9007199254740993" },
    { numero: "18446744073709551615", matricula: "BB-00-BB", reparacao_estado: "X", recepcao_prioridade: 2, reparacao_mecanico: 10, recepcao_cliente: "2", recepcao_terceiro: "1" },
  ]) await insertSyntheticOrder(database, values);
}

/** Real protected API + ordinary Vite proxy, separate from the unchanged common1431 runner. */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  repairServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("This source-calendar check requires the configured Chrome browser");
    const origin = "http://localhost:1432", engine = await startIsolatedPostgres();
    let database: Client | undefined, app: ReturnType<typeof createApp> | undefined;
    let vite: Awaited<ReturnType<typeof createServer>> | undefined, stopped: Promise<void> | undefined;
    let dataStopped: Promise<void> | undefined;
    const stopData = () => dataStopped ??= (async () => {
      try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } }
    })();
    const stop = () => stopped ??= (async () => {
      try { await vite?.close(); } finally { await stopData(); }
    })();
    const onSignal = () => { void stop(); };
    process.on("SIGINT", onSignal); process.on("SIGTERM", onSignal);
    try {
      database = await engine.database(); await migrate(database);
      const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
      const connect = () => engine.connect(name);
      const options = { repairOrderConnect: connect, customerConnect: connect, vehicleConnect: connect,
        mechanicsConnect: connect, userConnect: connect, development: developmentSessions(origin) };
      app = createApp(options); await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address();
      if (!address || typeof address === "string") throw new Error("Repair test API address unavailable");
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), cacheDir: resolve(engine.directory, "vite-repair"),
        plugins: [{ name: "repair-test-data-lifetime", closeServer: { async handler({ reason }) {
          if (reason === "close") await stopData();
        } } }],
        server: { host: "localhost", port: 1432, strictPort: true, proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } });
      await vite.listen();
      await use({ origin, database });
    } finally { process.off("SIGINT", onSignal); process.off("SIGTERM", onSignal); await stop(); }
  }, { scope: "worker", timeout: 90000 }],
  repairDatabase: [async ({ repairServer }, use) => {
    await seed(repairServer.database);
    await use(repairServer.database);
  }, { auto: true }],
});

export { expect };
