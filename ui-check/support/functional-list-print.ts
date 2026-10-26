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

type ListPrintServer = { origin: string; database: Client };
/** The real menu/list/report paths share one disposable DB; all three endpoints are ephemeral. */
export const test = base.extend<{ listPrintDatabase: Client }, { listPrintServer: ListPrintServer }>({
  listPrintServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Report PDF requires Chromium");
    const engine = await startIsolatedPostgres();
    const previousNodeEnv = process.env.NODE_ENV; process.env.NODE_ENV = "development";
    let database: Client | undefined, app: ReturnType<typeof createApp> | undefined, vite: Awaited<ReturnType<typeof createServer>> | undefined;
    try {
      database = await engine.database(); await migrate(database);
      const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name, connect = () => engine.connect(name);
      const sessions = developmentSessions("");
      app = createApp({ customerConnect: connect, vehicleConnect: connect, unitConnect: connect, descriptiveStateConnect: connect,
        terminalConnect: connect, postoConnect: connect, mechanicsConnect: connect, repairStateConnect: connect, documentTypeConnect: connect,
        articleConnect: connect, userConnect: connect, repairOrderConnect: connect, repairMaterialsConnect: connect, repairLaborConnect: connect,
        startupConnect: connect, stockConnect: connect, reportFilterConnect: connect, reportConnect: connect,
        reportRenderer: createReportRenderer(), reportCompany: "OFICINA TESTE LISTAS", development: sessions });
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address(); if (!address || typeof address === "string") throw new Error("List report API address unavailable");
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), cacheDir: resolve(engine.directory, "vite-list-print"),
        server: { host: "127.0.0.1", port: 0, strictPort: true, proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } });
      await vite.listen();
      const web = vite.httpServer?.address(); if (!web || typeof web === "string") throw new Error("List report Vite address unavailable");
      sessions.origin = `http://127.0.0.1:${web.port}`;
      await use({ origin: sessions.origin, database });
    } finally {
      try { try { await vite?.close(); } finally { try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } } } }
      finally { if (previousNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousNodeEnv; }
    }
  }, { scope: "worker", timeout: 90_000 }],
  listPrintDatabase: [async ({ listPrintServer }, use) => {
    const database = listPrintServer.database;
    await database.query(`TRUNCATE app."Clientes",app."Viaturas",app."unidades",app."estados_descritivos",app."mecanicos",app."estados_reparacao",app."documentos",app."artigos",app."utilizadores",app."sistema",app."tempos_reparacao" RESTART IDENTITY;
      INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (101,'CLIENTE AÇÃO'),(102,'CLIENTE SEGUNDO');
      INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo","Ano","mes") VALUES (1,'AA-00-AA',101,'MARCA A','VIATURA AÇÃO',2020,1),(2,'BB-00-BB',102,'MARCA B','VIATURA SEGUNDA',2021,2);
      INSERT INTO app."unidades" ("unidadesID","Codigo","Descricao") VALUES (1,'UN','UNIDADE AÇÃO'),(2,'LT','UNIDADE SEGUNDA');
      INSERT INTO app."estados_descritivos" ("estados_descritivosID","Codigo","Descricao") VALUES (1,'DA','DESCRITIVO AÇÃO'),(2,'DB','DESCRITIVO SEGUNDO');
      INSERT INTO app."mecanicos" ("Codigo","Descricao","palavra_passe","inativo") VALUES (7,'MECÂNICO AÇÃO','never-print-mechanic-secret',false),(8,'MECÂNICO SEGUNDO','never-print-mechanic-secret',true);
      INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo") VALUES (1,'R','REPARAÇÃO AÇÃO',3),(2,'S','REPARAÇÃO SEGUNDA',4);
      INSERT INTO app."documentos" ("documentosID","Codigo","Descricao","stock","obriga_macanico") VALUES (1,'E','DOCUMENTO AÇÃO',1,false),(2,'S','DOCUMENTO SEGUNDO',2,true);
      INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","codbarras","unidade","preco","stock","inativo") VALUES (1,'A','ARTIGO AÇÃO','BAR-A','UN',99.99,-1.25,false),(2,'B','ARTIGO SEGUNDO','BAR-B','LT',88.88,0,true);
      INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,71,'UTILIZADOR AÇÃO','never-print-user-secret'),(2,72,'UTILIZADOR SEGUNDO','never-print-user-secret')`);
    await use(database);
  }, { auto: true }],
});
export { expect };
