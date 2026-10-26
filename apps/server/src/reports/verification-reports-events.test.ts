import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { familyReportDocument } from "./families";
import type { FamilyReportRequest } from "../../../../packages/domain/src/reports";

let server: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client;
const context = { company: "EVENT COMPANY", dateText: "25/10/2026" };
beforeAll(async () => { server = await startIsolatedPostgres(); database = await server.database(); await migrate(database); }, 60_000);
afterAll(async () => { await database?.end(); await server?.stop(); }, 60_000);
beforeEach(async () => {
  await database.query('TRUNCATE app."Clientes",app."Viaturas",app."mecanicos",app."ordem_reparacao",app."tempos_reparacao" RESTART IDENTITY');
});
function controls(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`data-control="${name}"[^>]*>([^<]*)</div>`, "g"))].map(match => match[1]);
}
async function document(reportId: FamilyReportRequest["reportId"], source: FamilyReportRequest["source"]) {
  const result = await familyReportDocument(database, { reportId, source, context });
  if (!("html" in result)) throw new Error(JSON.stringify(result));
  return result;
}
const times = ["20261025080000000", "20261025090000000", "20261025100000000"];
const variants = [
  { reportId: "RPT_Tempos_Ordem_Reparacao", range: { ParamDaOrdem: "10", ParamAOrdem: "12" } },
  { reportId: "RPT_Tempos_Ordem_Reparacao_Mecanico", range: { ParamDoMecanico: "7", ParamAoMecanico: "8" } },
  { reportId: "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo", range: { ParamDoMecanico: "7", ParamAoMecanico: "8" } },
  { reportId: "RPT_Tempos_Ordem_Reparacao_viatura", range: { ParamDaViatura: "AA", ParamAViatura: "BB" } },
] as const;
for (const { reportId, range } of variants) it(`${reportId} actual query events assign source group captions, reception dates, rounded row time and independent subtotals`, async () => {
  // Source references: R24:246-249,326-332,358-359,417,524-525;
  // R25:252,397-403,429-431,503-505,563-564; R26:188,263-269,287-288,338;
  // R27:194-195,266-267,342-348,366-367,425-427,477. Native grouping U items remain.
  await database.query(`INSERT INTO app."Viaturas" ("matricula","marca","modelo") VALUES ('AA','MARCA A','MODELO A'),('BB','MARCA B','MODELO B');
    INSERT INTO app."mecanicos" ("Codigo","Descricao") VALUES (7,'MECHANIC A'),(8,'MECHANIC B');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_datahora") VALUES (10,'AA','20261025080000000'),(11,'AA','20261025090000000'),(12,'BB','20261025100000000');
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","inicio","fim") VALUES
      (10,7,'20261025080000000','20261025094000000'),(10,7,'20261025100000000','20261025123500000'),
      (11,7,'20261025130000000','00000000000000000'),(12,8,'20261025120000000','20261025120000001')`);
  const source: FamilyReportRequest["source"] = { kind: "query", parameters: { ...range, ParamDaData: "20261025000000", ParamAData: "20261025235959" } };
  const result = await document(reportId, source);
  expect(controls(result.html, "STC_Empresa")).toEqual([context.company]);
  expect(controls(result.html, reportId.endsWith("viatura") ? "ITEM_Tempo" : "ITEM_tempo")).toEqual(["01:40", "02:35", "00:00", "00:01"]);
  if (reportId === "RPT_Tempos_Ordem_Reparacao") {
    expect(controls(result.html, "STC_numero")).toEqual(["10", "11", "12"]);
    expect(controls(result.html, "STC_matricula")).toEqual(["AA", "AA", "BB"]);
    expect(controls(result.html, "STC_marca_modelo")).toEqual(["MARCA A MODELO A", "MARCA A MODELO A", "MARCA B MODELO B"]);
    expect(controls(result.html, "DATA")).toEqual(times);
    expect(controls(result.html, "STC_total_horas")).toEqual(["04:15", "00:00", "00:01"]);
  } else {
    expect(controls(result.html, "STC_total_horas1")).toEqual(["04:15", "00:01"]);
    if (reportId.endsWith("viatura")) {
      expect(controls(result.html, "STC_matricula")).toEqual(["AA", "BB"]);
      expect(controls(result.html, "STC_marca_modelo")).toEqual(["MARCA A MODELO A", "MARCA B MODELO B"]);
      expect(controls(result.html, "STC_numero")).toEqual(["10", "11", "12"]);
      expect(controls(result.html, "DATA")).toEqual(times);
    } else expect(controls(result.html, reportId.endsWith("Resumo") ? "STC_mecanico" : "STC_NoName")).toEqual(["MECHANIC A", "MECHANIC B"]);
    if (!reportId.endsWith("Resumo")) expect(controls(result.html, "STC_total_horas")).toEqual(["04:15", "00:00", "00:01"]);
    if (reportId.endsWith("Mecanico")) expect(controls(result.html, "DATA")).toEqual(times);
  }
  // The next execution must not retain the prior row/group accumulators or captions.
  await database.query('DELETE FROM app."tempos_reparacao" WHERE "numero"<>12');
  const next = await document(reportId, source);
  expect(controls(next.html, reportId === "RPT_Tempos_Ordem_Reparacao" ? "STC_total_horas" : "STC_total_horas1")).toEqual(["00:01"]);
  expect(controls(next.html, "STC_Empresa")).toEqual([context.company]);
});

it("RPT_Servico_Avaria source reads assign only the requested order and independently found vehicle/reception customer", async () => {
  await database.query(`INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'VEHICLE OWNER'),(2,'RECEPTION CUSTOMER');
    INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ('AA',1,'MARCA','MODELO');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","recepcao_servico","recepcao_obs","recepacao_contatos") VALUES (10,'AA',2,'SOURCE SERVICE','SOURCE OBS','123\r\n456')`);
  const source: FamilyReportRequest["source"] = { kind: "programmatic", orderNumber: "10" };
  const first = await document("RPT_Servico_Avaria", source);
  expect(controls(first.html, "ITEM_Cliente")).toEqual(["RECEPTION CUSTOMER"]);
  expect(controls(first.html, "ITEM_marca_modelo")).toEqual(["MARCA  MODELO"]);
  expect(controls(first.html, "ITEM_matricula")).toEqual(["AA"]);
  expect(controls(first.html, "ITEM_Servico_Avaria")).toEqual(["SOURCE SERVICE"]);
  expect(controls(first.html, "ITEM_Observacao")).toEqual(["SOURCE OBS"]);
  expect(controls(first.html, "ITEM_Contactos")).toEqual(["123\r\n456"]);
  await database.query('DELETE FROM app."Viaturas"');
  const noVehicle = await document("RPT_Servico_Avaria", source);
  expect(controls(noVehicle.html, "ITEM_marca_modelo")).toEqual([""]);
  expect(controls(noVehicle.html, "ITEM_Cliente")).toEqual(["RECEPTION CUSTOMER"]);
  await database.query('DELETE FROM app."Clientes" WHERE "Codigo"=2');
  const noCustomer = await document("RPT_Servico_Avaria", source);
  expect(controls(noCustomer.html, "ITEM_Cliente")).toEqual([""]);
  expect(controls(noCustomer.html, "ITEM_Servico_Avaria")).toEqual(["SOURCE SERVICE"]);
  const noOrder = await document("RPT_Servico_Avaria", { kind: "programmatic", orderNumber: "99" });
  for (const control of ["ITEM_Cliente", "ITEM_marca_modelo", "ITEM_matricula", "ITEM_Servico_Avaria", "ITEM_Observacao", "ITEM_Contactos"]) expect(controls(noOrder.html, control)).toEqual([""]);
  expect(controls(noOrder.html, "STC_Empresa")).toEqual([context.company]);
});

it("RPT_Materiais source Open appends only found information using literal separators and never recalculates the caller total", async () => {
  await database.query(`INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'VEHICLE OWNER'),(2,'RECEPTION CUSTOMER');
    INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ('AA',1,'MARCA','MODELO');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente") VALUES (10,'AA',2)`);
  const source = { kind: "window-table", window: "WIN_Table_Tempos_materiais_Descricoes", table: "TABLE_materiais", orderNumber: "10", formattedTotal: "  € 1,234567  ", rows: [] } as const;
  const first = await document("RPT_Materiais", { ...source, rows: [] });
  expect(controls(first.html, "STC_informacao")).toEqual(["Nrº Ordem Reparação: 10\r\nMatrícula: AA   MARCA/MODELO\r\nCliente: RECEPTION CUSTOMER"]);
  await database.query('DELETE FROM app."Viaturas"');
  const noVehicle = await document("RPT_Materiais", { ...source, rows: [] });
  expect(controls(noVehicle.html, "STC_informacao")).toEqual(["Nrº Ordem Reparação: 10\r\nCliente: RECEPTION CUSTOMER"]);
  await database.query('DELETE FROM app."Clientes" WHERE "Codigo"=2');
  const noCustomer = await document("RPT_Materiais", { ...source, rows: [] });
  expect(controls(noCustomer.html, "STC_informacao")).toEqual(["Nrº Ordem Reparação: 10"]);
  const noOrder = await document("RPT_Materiais", { ...source, orderNumber: "99", rows: [] });
  expect(controls(noOrder.html, "STC_informacao")).toEqual([""]);
  for (const result of [first, noVehicle, noCustomer, noOrder]) {
    expect(controls(result.html, "STC_Total_material")).toEqual([source.formattedTotal]);
    expect(controls(result.html, "STC_Empresa")).toEqual([context.company]);
  }
});
