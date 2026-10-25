import { test as base, expect } from "@playwright/test";
import type { Client } from "pg";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../../apps/server/test-support/postgres";
import { migrate } from "../../apps/server/src/db/migrate";
import { createApp } from "../../apps/server/src/app";
import { developmentSessions } from "../../apps/server/src/development-sessions";

type MaterialServer = { origin: string; database: Client };
export const test = base.extend<{ materialDatabase: Client }, { materialServer: MaterialServer }>({
  materialServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Materials checks require configured Chrome");
    const origin = "http://localhost:1433", engine = await startIsolatedPostgres();
    let database: Client | undefined, app: ReturnType<typeof createApp> | undefined, vite: Awaited<ReturnType<typeof createServer>> | undefined;
    let stopping: Promise<void> | undefined, stoppingData: Promise<void> | undefined;
    const stopData = () => stoppingData ??= (async () => { try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } } })();
    const stop = () => stopping ??= (async () => { try { await vite?.close(); } finally { await stopData(); } })();
    const onSignal = () => { void stop(); }; process.on("SIGINT", onSignal); process.on("SIGTERM", onSignal);
    try {
      database = await engine.database(); await migrate(database);
      const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name, connect = () => engine.connect(name);
      app = createApp({ repairMaterialsConnect: connect, stockConnect: connect, articleConnect: connect, unitConnect: connect, mechanicsConnect: connect, development: developmentSessions(origin) });
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address(); if (!address || typeof address === "string") throw new Error("Synthetic material API address unavailable");
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), cacheDir: resolve(engine.directory, "vite-materials"),
        plugins: [{ name: "materials-test-lifetime", closeServer: { async handler({ reason }) { if (reason === "close") await stopData(); } } }],
        server: { host: "localhost", port: 1433, strictPort: true, proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } });
      await vite.listen(); await use({ origin, database });
    } finally { process.off("SIGINT", onSignal); process.off("SIGTERM", onSignal); await stop(); }
  }, { scope: "worker", timeout: 90000 }],
  materialDatabase: [async ({ materialServer }, use) => {
    const database = materialServer.database;
    await database.query(`TRUNCATE app."ordem_reparacao",app."material_reparacao",app."artigos",app."mecanicos",app."estados_reparacao",app."Viaturas",app."sistema",app."unidades" RESTART IDENTITY;
      INSERT INTO app."sistema" ("Tempo_materiais") VALUES (60);
      INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES (9007199254740993,'AA-00-AA',7,'R');
      INSERT INTO app."Viaturas" ("matricula","marca","modelo") VALUES ('AA-00-AA','MARCA','MODELO');
      INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo","lancar_material") VALUES ('R','Reparação',2,TRUE);
      INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (1,7,'ANA','Synthetic',FALSE),(2,8,'INATIVO','Synthetic',TRUE);
      INSERT INTO app."unidades" ("Codigo","Descricao") VALUES ('UN','Unidade');
      INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","codbarras","unidade","preco","stock","inativo") VALUES (1,'A','Artigo','BAR','UN',1.25,10,FALSE),(2,'B','Outro','BAR-B','UN',2.50,20,FALSE);
      INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","preco","data_hora","reparacao_estado","lancado","extra") VALUES (9007199254740993,9007199254740993,7,'A','Original',2,1.25,'20240229123456987','OLD',FALSE,TRUE)`);
    await use(database);
  }, { auto: true }],
});
export { expect };
