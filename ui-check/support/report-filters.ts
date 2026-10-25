import { test as base, expect } from "@playwright/test";
import type { Client } from "pg";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../../apps/server/test-support/postgres";
import { migrate } from "../../apps/server/src/db/migrate";
import { createApp } from "../../apps/server/src/app";
import { developmentSessions } from "../../apps/server/src/development-sessions";
import { createReportRenderer } from "../../apps/server/src/reports/renderer";

type ReportFiltersServer = { origin: string; database: Client };
/** Actual source reads/pickers/report engine; PostgreSQL, API and Vite each use their own disposable/random endpoint. */
export const test = base.extend<{ reportFilterDatabase: Client }, { reportFiltersServer: ReportFiltersServer }>({
  reportFiltersServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Report PDF requires Chromium");
    const engine = await startIsolatedPostgres();
    let database: Client | undefined, app: ReturnType<typeof createApp> | undefined, vite: Awaited<ReturnType<typeof createServer>> | undefined;
    try {
      database = await engine.database(); await migrate(database);
      const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name, connect = () => engine.connect(name);
      const sessions = developmentSessions("");
      app = createApp({ articleConnect: connect, unitConnect: connect, mechanicsConnect: connect, vehicleConnect: connect, customerConnect: connect,
        reportFilterConnect: connect, reportConnect: connect, reportRenderer: createReportRenderer(), development: sessions });
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address(); if (!address || typeof address === "string") throw new Error("Report API address unavailable");
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), cacheDir: resolve(engine.directory, "vite-report-filters"),
        server: { host: "127.0.0.1", port: 0, strictPort: true, proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } });
      await vite.listen();
      const web = vite.httpServer?.address(); if (!web || typeof web === "string") throw new Error("Report Vite address unavailable");
      sessions.origin = `http://127.0.0.1:${web.port}`;
      await use({ origin: sessions.origin, database });
    } finally { try { await vite?.close(); } finally { try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } } } }
  }, { scope: "worker", timeout: 90_000 }],
  reportFilterDatabase: [async ({ reportFiltersServer }, use) => {
    const database = reportFiltersServer.database;
    await database.query(`TRUNCATE app."artigos",app."unidades",app."mecanicos",app."Viaturas",app."Clientes",app."estados_reparacao",app."ordem_reparacao",app."material_reparacao",app."cab_stocks",app."lin_stocks",app."documentos",app."tempos_reparacao" RESTART IDENTITY;
      INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'CLIENTE FILTROS');
      INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo","Ano","mes") VALUES ('AA-00-AA',1,'MARCA','MODELO',2024,1);
      INSERT INTO app."mecanicos" ("Codigo","Descricao","inativo") VALUES (7,'MECÂNICO FILTROS',false);
      INSERT INTO app."unidades" ("Codigo","Descricao") VALUES ('UN','UNIDADE');
      INSERT INTO app."artigos" ("Codigo","Descricao","unidade","preco","stock","inativo") VALUES ('A','ARTIGO FILTROS','UN',0.1234567890123456789,1,false);
      INSERT INTO app."estados_reparacao" ("Codigo","Descricao","pedir_data_entrega","pedir_data_pag") VALUES ('E','Só entrega',true,false),('P','Só pagamento',false,true),('B','Ambos',true,true);
      INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_mecanico","reparacao_estado","recepcao_datahora","recepcao_entrega_prevista","data_pagamento","total_pago") VALUES (1,'AA-00-AA',1,7,'E','20261025120000000','20261025','20261025',12.3456),(2,'AA-00-AA',1,7,'P','20261025120000000','20261025','20261025',3.1415);
      INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","mecanico","data_hora") VALUES (1,'A','ARTIGO FILTROS',0.25,7,'20261025120000000');
      INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ('S','SAÍDA',2);
      INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data","mecanico") VALUES ('S',1,'20261025120000000',7);
      INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('S',1,'A','ARTIGO FILTROS',0.1);
      INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES (1,7,'20261025080000000','20261025093000000')`);
    await use(database);
  }, { auto: true }],
});
export { expect };
