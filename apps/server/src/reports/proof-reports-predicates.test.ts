import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import { familyReportDocument } from "./families";
import type { FamilyReportRequest } from "../../../../packages/domain/src/reports";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client;
const context = { company: "PROOF REPORT Ω  ", dateText: "26/10/2026" };
beforeAll(async () => { engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database); }, 60_000);
afterAll(async () => { await database?.end(); await engine?.stop(); }, 60_000);
beforeEach(async () => {
  await database.query(`TRUNCATE app."artigos",app."mecanicos",app."Viaturas",app."Clientes",app."documentos",app."cab_stocks",app."lin_stocks",app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao",app."estados_reparacao" RESTART IDENTITY;
    INSERT INTO app."artigos" ("Codigo","Descricao","stock") VALUES ('A','MASTER A',-1),('B','MASTER B',NULL);
    INSERT INTO app."mecanicos" ("Codigo","Descricao") VALUES (7,'MECHANIC');
    INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'VEHICLE OWNER'),(2,'CAPTURED CUSTOMER');
    INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ('AA',1,'MARCA','MODELO');
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao") VALUES ('R','READY');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_mecanico","reparacao_estado","recepcao_entrega_prevista","data_pagamento","total_pago") VALUES (1,'AA',2,7,'R','20261026','20261026',0.1),(2,'AA',2,7,'R','20261025','20261025',0.2),(3,'AA',2,7,'R',NULL,NULL,0.3);
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","mecanico","data_hora") VALUES (1,'A','MATERIAL A',0.1,7,'20261026120000000'),(2,'B','MATERIAL B',0.2,7,'20261025120000000'),(3,'A','MATERIAL NO DATE',0.3,7,NULL);
    INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES ('S','SAÍDA',2);
    INSERT INTO app."cab_stocks" ("documento_codigo","documento_numero","data","mecanico") VALUES ('S',1,'20261026120000000',7),('S',2,'20261025120000000',7),('S',3,NULL,7);
    INSERT INTO app."lin_stocks" ("documento_codigo","documento_numero","artigo","descricao_artigo","quantidade") VALUES ('S',1,'A','STOCK A',1),('S',2,'B','STOCK B',2),('S',3,'A','STOCK NO DATE',3)`);
});
function controls(html: string, name: string): string[] { return [...html.matchAll(new RegExp(`data-control="${name}"[^>]*>([^<]*)</div>`, "g"))].map(match => match[1]); }
async function document(reportId: FamilyReportRequest["reportId"], parameters: Record<string, string | null | string[]>) {
  const result = await familyReportDocument(database, { reportId, context, source: { kind: "query", parameters } }); expect("html" in result, JSON.stringify(result)).toBe(true); if (!("html" in result)) throw new Error(result.kind); return result;
}
const variants = [
  { reportId: "RPT_Consumo_Material_Descriminado_Ordens", narrow: ["0.1"], noDate: ["0.1", "0.3"] },
  { reportId: "RPT_Consumo_Material_Resumo_ordens", narrow: ["0.1"], noDate: ["0.1", "0.3"] },
  { reportId: "RPT_Consumo_Material_Descriminado_Saidas", narrow: ["1"], noDate: ["1", "3"] },
  { reportId: "RPT_Consumo_Material_Resumo_Saidas", narrow: ["1"], noDate: ["1", "3"] },
  { reportId: "RPT_Consumo_Material_Descriminado_ordens_saidas", narrow: ["1", "0.1"], noDate: ["1", "0.1", "3", "0.3"] },
  { reportId: "RPT_Consumo_Material_Resumo_ordem_saidas", narrow: ["1", "0.1"], noDate: ["1", "0.1", "3", "0.3"] },
  { reportId: "RPT_Consumo_Material_Viatura_Descriminado", narrow: ["0.1"], noDate: ["0.1", "0.3"] },
  { reportId: "RPT_Consumo_Material_Viatura_Resumo", narrow: ["0.1"], noDate: ["0.1", "0.3"] },
] as const;
it.each(variants)("reports proof $reportId distinguishes one-sided NULL omission from literal empty bounds and never inherits prior predicates", async ({ reportId, narrow, noDate }) => {
  const parameters = { ParamDoArtigo: "A", ParamAoArtigo: "A", ParamDaData: "20261026000000", ParamAData: "20261026235959", ...(reportId.includes("Viatura") ? { ParamDaViatura: "AA", ParamAViatura: "AA" } : { ParamDescricao: null }) };
  expect(controls((await document(reportId, parameters)).html, "ITEM_Quantidade")).toEqual(narrow);
  const noMatch = await document(reportId, { ...parameters, ParamDoArtigo: "B", ParamAoArtigo: "B" }); expect(controls(noMatch.html, "ITEM_Quantidade")).toEqual([]);
  // A single NULL disables the paired BETWEEN; the other predicates remain live.
  expect(controls((await document(reportId, { ...parameters, ParamDoArtigo: null, ParamAoArtigo: "B" })).html, "ITEM_Quantidade")).toEqual(narrow);
  expect(controls((await document(reportId, { ...parameters, ParamDaData: null })).html, "ITEM_Quantidade")).toEqual(noDate);
  expect(controls((await document(reportId, { ...parameters, ParamAData: null })).html, "ITEM_Quantidade")).toEqual(noDate);
  expect(controls((await document(reportId, { ...parameters, ParamDoArtigo: "", ParamAoArtigo: "" })).html, "ITEM_Quantidade")).toEqual([]);
  expect(controls((await document(reportId, parameters)).html, "ITEM_Quantidade")).toEqual(narrow);
});
it.each(["RPT_Ordens_Reparacao_DataEntrega", "RPT_Ordens_Reparacao_DataPag"] as const)("reports proof %s distinguishes empty selected states and NULL date omission while retaining customer source and exact total", async reportId => {
  const source = { ParamDaData: "20261026", ParamAData: "20261026", ParamEstados: ["R"] };
  const first = await document(reportId, source); expect(controls(first.html, "ITEM_Numero")).toEqual(["1"]); expect(controls(first.html, "ITEM_Cliente")).toEqual(["VEHICLE OWNER"]); expect(controls(first.html, "CALC_Total_pago")).toEqual(["0.1"]);
  const empty = await document(reportId, { ...source, ParamEstados: [] }); expect(controls(empty.html, "ITEM_Numero")).toEqual([]); expect(controls(empty.html, "CALC_Total_pago")).toEqual(["0"]);
  const noDate = await document(reportId, { ...source, ParamDaData: null }); expect(new Set(controls(noDate.html, "ITEM_Numero"))).toEqual(new Set(["1", "2", "3"])); expect(controls(noDate.html, "CALC_Total_pago")).toEqual(["0.6"]);
  const literal = await document(reportId, { ...source, ParamDaData: "", ParamAData: "" }); expect(controls(literal.html, "ITEM_Numero")).toEqual([]);
  expect(controls((await document(reportId, source)).html, "CALC_Total_pago")).toEqual(["0.1"]);
});
it("reports proof description wildcards stay in stock branches while the fifth orders argument never invents a filter", async () => {
  const source = { ParamDoArtigo: null, ParamAoArtigo: null, ParamDaData: null, ParamAData: null, ParamDescricao: "STOCK _" };
  expect(controls((await document("RPT_Consumo_Material_Descriminado_Saidas", source)).html, "ITEM_Quantidade")).toEqual(["1", "3", "2"]);
  expect(controls((await document("RPT_Consumo_Material_Descriminado_Saidas", { ...source, ParamDescricao: "' OR true --" })).html, "ITEM_Quantidade")).toEqual([]);
  const orders = await document("RPT_Consumo_Material_Descriminado_Ordens", { ...source, ParamDescricao: "' OR true --" }); expect(controls(orders.html, "ITEM_Quantidade")).toEqual(["0.1", "0.3", "0.2"]); expect(controls(orders.html, "STC_total")).toEqual(["0.6"]);
});
it("reports proof duplicate joined stock documents keep UNION ALL multiplicity and per-article source sums", async () => {
  await database.query('INSERT INTO app."documentos" ("Codigo","Descricao","stock") VALUES (\'S\',\'SECOND MATCH\',2)');
  const result = await document("RPT_Consumo_Material_Resumo_ordem_saidas", { ParamDoArtigo: null, ParamAoArtigo: null, ParamDaData: null, ParamAData: null, ParamDescricao: null });
  expect(controls(result.html, "ITEM_Quantidade")).toEqual(["1", "1", "0.1", "3", "3", "0.3", "2", "2", "0.2"]);
  expect(controls(result.html, "ITEM_Soma")).toEqual(["8.4", "4.2"]); expect(controls(result.html, "COUNTER")).toEqual(["2"]);
});
it("reports proof file inventory keeps inactive duplicate and NULL article rows in source traversal and changes no stored quantity", async () => {
  await database.query('INSERT INTO app."artigos" ("Codigo","Descricao","stock","inativo") VALUES (\'A\',\'DUPLICATE INACTIVE\',-999.1234567890123456789,true),(NULL,NULL,NULL,NULL)');
  const before = (await database.query('SELECT _row_id::text,"Codigo","stock"::text,"inativo" FROM app."artigos" ORDER BY _row_id')).rows;
  const result = await familyReportDocument(database, { reportId: "RPT_inventario", context, source: { kind: "file" } }); if (!("html" in result)) throw new Error(result.kind);
  expect(controls(result.html, "ITEM_Codigo")).toEqual(["A", "B", "A", ""]); expect(controls(result.html, "ITEM_Stock")).toEqual(["-1", "", "-999.1234567890123456789", ""]); expect(controls(result.html, "COUNTER")).toEqual(["4"]);
  expect((await database.query('SELECT _row_id::text,"Codigo","stock"::text,"inativo" FROM app."artigos" ORDER BY _row_id')).rows).toEqual(before);
});
