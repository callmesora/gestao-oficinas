import { test as base, expect } from "@playwright/test";
import type { Client } from "pg";
import { createServer as createPortServer } from "node:net";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../../apps/server/test-support/postgres";
import { createBusinessApp } from "../../apps/server/src/business-app";
import { readServiceConfiguration } from "../../apps/server/src/configuration";
import { createReportRenderer } from "../../apps/server/src/reports/renderer";

async function freePort() {
  const server = createPortServer();
  await new Promise<void>((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Functional menu port unavailable");
  await new Promise<void>((done, reject) => server.close(error => error ? reject(error) : done()));
  return address.port;
}
type FunctionalMenuServer = { origin: string; database: Client; setupToken: string };
/** Real authenticated business factory, report engine and disposable PG/API/Vite ports. */
export const test = base.extend<{ functionalMenuDatabase: Client }, { functionalMenuServer: FunctionalMenuServer }>({
  functionalMenuServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Configured Chrome required");
    const previousNodeEnvironment = process.env.NODE_ENV; process.env.NODE_ENV = "development";
    const engine = await startIsolatedPostgres();
    let database: Client | undefined, app: Awaited<ReturnType<typeof createBusinessApp>> | undefined, vite: Awaited<ReturnType<typeof createServer>> | undefined;
    try {
      database = await engine.database();
      const connection = new URL(`postgresql://127.0.0.1:${database.port}/${database.database}`);
      connection.username = database.user!; connection.password = database.password!;
      const port = await freePort(), origin = `http://127.0.0.1:${port}`, setupToken = "f".repeat(64), tokenFile = resolve(engine.directory, "synthetic-menu-operator-token");
      await writeFile(tokenFile, setupToken, { mode: 0o600 });
      const configuration = await readServiceConfiguration({ WORKSHOP_DATABASE_URL: connection.href, WORKSHOP_ALLOWED_ORIGINS: origin, WORKSHOP_SETUP_TOKEN_FILE: tokenFile });
      app = await createBusinessApp(configuration, createReportRenderer());
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address(); if (!address || typeof address === "string") throw new Error("Functional menu API unavailable");
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), cacheDir: resolve(engine.directory, "vite-functional-menu"),
        define: { "import.meta.env.VITE_WORKSHOP_API_BASE": JSON.stringify("") },
        server: { host: "127.0.0.1", port, strictPort: true, proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } });
      await vite.listen();
      await use({ origin, database, setupToken });
    } finally {
      try { await vite?.close(); }
      finally {
        try { await app?.close(); }
        finally {
          try { await database?.end(); }
          finally {
            try { await engine.stop(); }
            finally { if (previousNodeEnvironment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousNodeEnvironment; }
          }
        }
      }
    }
  }, { scope: "worker", timeout: 90_000 }],
  functionalMenuDatabase: [async ({ functionalMenuServer }, use) => {
    const database = functionalMenuServer.database;
    await database.query(`TRUNCATE auth.mechanic_credentials,auth.sessions,auth.credentials,app."utilizadores",app."Clientes",app."Viaturas",app."mecanicos",app."unidades",app."artigos",app."estados_reparacao",app."ordem_reparacao",app."material_reparacao",app."documentos",app."cab_stocks",app."lin_stocks",app."tempos_reparacao" RESTART IDENTITY; UPDATE auth.enrollment SET consumed=false;`);
    await database.query(`
        UPDATE app."sistema" SET "Tempo_tempos"=3600,"Tempo_materiais"=3600,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
        INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'CLIENTE MENU');
        INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ('AA-00-AA',1,'MARCA','MODELO');
        INSERT INTO app."mecanicos" ("Codigo","Descricao","inativo") VALUES (7,'MECÂNICO MENU',false);
        INSERT INTO app."unidades" ("Codigo","Descricao") VALUES ('UN','UNIDADE');
        INSERT INTO app."artigos" ("Codigo","Descricao","unidade","preco","stock","inativo") VALUES ('A','ARTIGO MENU A','UN',1.25,10,false),('B','ARTIGO MENU B','UN',4,8,false);
        INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo","pedir_data_entrega","pedir_data_pag","lancar_material") VALUES ('R','Em reparação',3,true,true,true);
        INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_mecanico","reparacao_estado","recepcao_datahora","recepcao_entrega_prevista","recepcao_prioridade","recepcao_servico","recepcao_obs","data_pagamento","total_pago")
          VALUES (10,'AA-00-AA',1,7,'R','20261025120000000','20261025',1,'SERVIÇO SELECIONADO DEZ','OBSERVAÇÃO SELECIONADA DEZ','20261025',12.34),
                 (20,'AA-00-AA',1,7,'R','20261025120000000','20261025',1,'SERVIÇO OUTRA ORDEM VINTE','OBSERVAÇÃO OUTRA ORDEM','20261025',99.99);
        INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","preco","mecanico","data_hora","reparacao_estado","extra","lancado")
          VALUES (10,'A','MATERIAL MENU A',2,1.25,7,'20261025120000000','R',false,false),(10,'B','MATERIAL MENU B',1.5,4,7,'20261025130000000','R',false,false);
        INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ('S','SAÍDA MENU',2);
        INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data","mecanico") VALUES ('S',1,'20261025120000000',7);
        INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('S',1,'A','ARTIGO MENU A',0.1);
        INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES (10,7,'20261025080000000','20261025093000000');
      `);
    await use(database);
  }, { auto: true }],
});
export { expect };
