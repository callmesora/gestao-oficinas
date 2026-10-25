import { afterAll, beforeAll, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { createApp } from "../app";
import { listSalesReportStates } from "./report-filters";
import { salesReportDispatch } from "../../../../packages/domain/src/report-filters";
import { familyReportDocument } from "../reports/families";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  server = await startIsolatedPostgres(); database = await server.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => server.connect(name);
  await database.query(`INSERT INTO app."estados_reparacao" ("Codigo","Descricao","pedir_data_entrega","pedir_data_pag") VALUES ('E','Entrega',true,false),('P','Pagamento',false,true),('B','Ambos',true,true),('B','Duplicado',true,true),(NULL,NULL,true,false),('N','Nenhum',false,false),('X','Desconhecido',NULL,NULL)`);
}, 60_000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60_000);

it("WIN_Mapa_Vendas.wdw:337-348 loads only the actual mode flag, retaining duplicate and NULL source rows", async () => {
  const delivery = await listSalesReportStates(connect, { mode: "vendas" }), payment = await listSalesReportStates(connect, { mode: "recebimentos" });
  expect(delivery.kind).toBe("loaded"); expect(payment.kind).toBe("loaded");
  if (delivery.kind !== "loaded" || payment.kind !== "loaded") return;
  expect(delivery.states.map(row => row.Codigo).sort()).toEqual(["E", "B", "B", null].sort());
  expect(payment.states.map(row => row.Codigo).sort()).toEqual(["P", "B", "B"].sort());
  expect(delivery.states.every(row => row.checked)).toBe(true);
  expect(new Set(delivery.states.map(row => row.id)).size).toBe(4);
  expect(await listSalesReportStates(connect, { mode: "vendas", filter: "broad" })).toEqual({ kind: "invalid" });
});
it("report-filter state read requires authentication and valid configuration; the API caches no private rows", async () => {
  const app = createApp({ reportFilterConnect: connect, authenticate: async request => request.headers.authorization === "Bearer filter-test" ? { userId: "synthetic" } : null });
  try {
    expect((await app.inject({ method: "POST", url: "/api/report-filters/states", payload: { mode: "vendas" } })).statusCode).toBe(401);
    const response = await app.inject({ method: "POST", url: "/api/report-filters/states", headers: { authorization: "Bearer filter-test" }, payload: { mode: "recebimentos" } });
    expect(response.statusCode).toBe(200); expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.json()).toMatchObject({ kind: "loaded", states: expect.arrayContaining([expect.objectContaining({ Codigo: "P", checked: true })]) });
  } finally { await app.close(); }
});
it("WIN_Mapa_Vendas empty live checkbox selection reaches the actual report query as an empty predicate", async () => {
  await database.query(`INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'CLIENTE');
    INSERT INTO app."Viaturas" ("matricula","Cliente") VALUES ('AA',1);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_estado","recepcao_entrega_prevista","data_pagamento","total_pago") VALUES (1,'AA',1,'E','20261025','20261025',12.3456)`);
  const dispatch = salesReportDispatch("vendas", { from: "20261001", to: "20261031", states: [] }, { company: "", dateText: "25/10/2026" });
  if (dispatch.kind !== "ready") throw new Error("Caller did not dispatch");
  const empty = await familyReportDocument(database, dispatch.request);
  expect("html" in empty).toBe(true); if (!("html" in empty)) return;
  expect(empty.html).not.toContain('data-band="BODY"');
  const selected = salesReportDispatch("vendas", { from: "20261001", to: "20261031", states: [{ id: "1", Codigo: "E", Descricao: "Entrega", checked: true }] }, { company: "", dateText: "25/10/2026" });
  if (selected.kind !== "ready") throw new Error("Selected caller did not dispatch");
  const populated = await familyReportDocument(database, selected.request);
  expect("html" in populated).toBe(true); if ("html" in populated) expect(populated.html).toContain('data-band="BODY"');
});
