import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { executeExtractedQuery, type ExtractedQueryName } from "./extracted-queries";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => engine.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await engine?.stop(); }, 60000);
beforeEach(async () => {
  await database.query('TRUNCATE app."lin_stocks",app."cab_stocks",app."documentos",app."material_reparacao",app."tempos_reparacao",app."ordem_reparacao",app."artigos",app."mecanicos",app."estados_reparacao",app."Clientes",app."Viaturas" RESTART IDENTITY');
});
const from = "20261025000000000", to = "20261025235959999";
const dates = { ParamDaData: from, ParamAData: to };
const articleRange = { ParamDoArtigo: "A", ParamAoArtigo: "A" };
async function read(query: ExtractedQueryName, parameters: Record<string, unknown> = {}) {
  const result = await executeExtractedQuery(connect, { query, parameters });
  expect(result.kind).toBe("loaded"); if (result.kind !== "loaded") throw new Error(result.kind);
  return result.rows;
}
function orderParameters(numero = "9007199254740993") {
  return { ParamNumero: numero, ParamMatricula: "AA", ParamKM: "18446744073709551615", ParamRecepcao_util: "255", ParamRecepcao_data_hora: "20261025120000123",
    ParamRecepcao_cliente: "9007199254740994", ParamRecepcao_Terceiro: null, ParamRecepcao_contactos: " Contacto\r\n2 ", ParamRecepcao_servico: "Serviço ' ", ParamRecepcao_obs: null,
    ParamRecepcao_entrega: "00000000", ParamRecepcao_prioridade: "3", ParamReparacao_mecanico: "2", ParamReparacao_estado: "R", ParamReparacao_estado_obs: " Estado ",
    ParamReparacao_servico: "Trabalho", ParamReparacao_estado_data: "", ParamReparacao_estado_historico: " Hist\r\n2 ", ParamTotal_mao_obra: "1.00000000000000000001",
    ParamTotal_pecas: "-2.00000000000000000002", ParamTotal_desconto: ".03", ParamTotal_reparacao: "-1.00000000000000000001", ParamFaturado: true,
    ParamTotal_pago: "123456789123456789.123456789", ParamNumero_fatura: " Fat ' ", ParamDataPagamento: null };
}
async function seed() {
  await database.query(`INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao","Morada1","Morada2","codpostal","Telefone1","Telemovel","observacao") VALUES
    (91,1,'Recepção','Rua1',NULL,'0000',' 123 ','456',' Obs '),(92,2,'Dono','Rua2','Andar','1000','222','333',NULL);
    INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (1,2,'Linha','Synthetic secret',true),(2,3,'Atribuído',NULL,false);
    INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo","Ano","mes") VALUES ('AA',2,'MARCA','MODELO',2026,10),('BB',2,'B','B',2026,10);
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","lancar_material","Cor") VALUES (1,'R','Reparação',3,true,255),(2,'X','Fechado',6,false,0);
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_datahora","recepcao_entrega_prevista","data_pagamento","total_pago") VALUES
      (1,10,'AA',1,'R',3,'20261025100000000','20261025','20261025',1.23),(2,2,'BB',1,'X',2,'2026-10-25 09:00:00.000','2026-10-26','20261026',2.34);
    INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","codbarras","unidade","preco","stock","inativo") VALUES (1,'A','Artigo A','Barcode','UN',1.234567890123456789,99,false);
    INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","data_hora","reparacao_estado","preco","lancado") VALUES
      (1,10,2,'A','Linha material',1.000000000000000001,'20261025120000000','R',3.14,false);
    INSERT INTO app."documentos" ("documentosID","Codigo","Descricao","stock","obriga_macanico") VALUES (1,'D1','Saída',2,true),(2,'D2','Entrada',1,false);
    INSERT INTO app."cab_stocks" ("cab_stocksID","documento_codigo","documento_numero","Descricao","data","mecanico","DocumentosID","MecanicosID") VALUES
      (1,'D1',7,'Header1','20261025110000000',2,1,1),(2,'D2',7,'Header2','20261025100000000',3,2,2);
    INSERT INTO app."lin_stocks" ("lin_stocksID","documento_codigo","documento_numero","linha","artigo","descricao_artigo","quantidade","preco","Documento_codigodocumento_numero") VALUES
      (1,'D1',7,9007199254740993,'A','Filtro documentário',2,5,decode('0001ff','hex'))`);
}

it("rejects unknown query names, arbitrary SQL and incomplete/extra/invalid parameters before connecting", async () => {
  let calls = 0; const unavailable: DatabaseConnection = async () => { calls++; throw new Error("synthetic"); };
  for (const input of [null, { query: "SELECT 1", parameters: {} }, { query: "__proto__", parameters: {} }, { query: "QRY_select_cliente_codigo", parameters: {} },
    { query: "QRY_select_cliente_codigo", parameters: { ParamCodigo_Cliente: "1 OR TRUE" } }, { query: "QRY_select_cab_stocks", parameters: {}, sql: "DELETE" },
    { query: "QRY_select_lin_stocks", parameters: { ParamNumero: "1", ParamDoc: "D1", ParamLinha: "2" } }]) {
    expect(await executeExtractedQuery(unavailable, input)).toEqual({ kind: "invalid" });
  }
  expect(calls).toBe(0);
  expect(await executeExtractedQuery(unavailable, { query: "QRY_select_cab_stocks", parameters: {} })).toEqual({ kind: "failed" });
});

it("inserts every source26 field losslessly without creating material/time rows", async () => {
  expect(await executeExtractedQuery(connect, { query: "QRY_insert_ordens_reparacao", parameters: orderParameters() })).toEqual({ kind: "written", affected: "1" });
  expect((await database.query('SELECT "numero"::text,"matricula","recepcao_datahora","recepcao_entrega_prevista","recepcao_prioridade","reparacao_mecanico","reparacao_estado","km_viatura"::text,"recepcao_util","recepcao_cliente"::text,"recepcao_terceiro","recepacao_contatos","recepcao_servico","recepcao_obs","reparacao_estado_obs","reparacao_servico","reparacao_estado_data","reparacao_estado_historico","totaL_mao_obra"::text,"total_pecas"::text,"total_desconto"::text,"total_reparacao"::text,"faturado","total_pago"::text,"numero_fatura","data_pagamento" FROM app."ordem_reparacao"')).rows[0])
    .toEqual({ numero: "9007199254740993", matricula: "AA", recepcao_datahora: "20261025120000123", recepcao_entrega_prevista: "00000000", recepcao_prioridade: 3, reparacao_mecanico: 2, reparacao_estado: "R", km_viatura: "18446744073709551615", recepcao_util: 255, recepcao_cliente: "9007199254740994", recepcao_terceiro: null,
      recepacao_contatos: " Contacto\r\n2 ", recepcao_servico: "Serviço ' ", recepcao_obs: null, reparacao_estado_obs: " Estado ", reparacao_servico: "Trabalho", reparacao_estado_data: "",
      reparacao_estado_historico: " Hist\r\n2 ", totaL_mao_obra: "1.00000000000000000001", total_pecas: "-2.00000000000000000002", total_desconto: "0.03", total_reparacao: "-1.00000000000000000001",
      faturado: true, total_pago: "123456789123456789.123456789", numero_fatura: " Fat ' ", data_pagamento: null });
  expect((await database.query('SELECT (SELECT COUNT(*) FROM app."material_reparacao")::text AS materials,(SELECT COUNT(*) FROM app."tempos_reparacao")::text AS labor')).rows[0]).toEqual({ materials: "0", labor: "0" });
});

it("full26-field update selects old numero and renames without a child cascade; a collision rolls back", async () => {
  await executeExtractedQuery(connect, { query: "QRY_insert_ordens_reparacao", parameters: orderParameters() });
  await database.query(`INSERT INTO app."material_reparacao" ("numero","artigo") VALUES (9007199254740993,'A'); INSERT INTO app."tempos_reparacao" ("numero") VALUES (9007199254740993)`);
  const changed = { ...orderParameters("9007199254740994"), ParamNumero_antigo: "9007199254740993", ParamReparacao_servico: "UPDATED", ParamTotal_mao_obra: "9.876543210987654321", ParamReparacao_estado_historico: null };
  expect(await executeExtractedQuery(connect, { query: "QRY_update_ordens_reparacao", parameters: changed })).toEqual({ kind: "written", affected: "1" });
  expect((await database.query('SELECT "numero"::text,"reparacao_servico","totaL_mao_obra"::text,"reparacao_estado_historico" FROM app."ordem_reparacao"')).rows[0])
    .toEqual({ numero: "9007199254740994", reparacao_servico: "UPDATED", totaL_mao_obra: "9.876543210987654321", reparacao_estado_historico: null });
  expect((await database.query('SELECT "numero"::text FROM app."material_reparacao" UNION ALL SELECT "numero"::text FROM app."tempos_reparacao"')).rows)
    .toEqual([{ numero: "9007199254740993" }, { numero: "9007199254740993" }]);
  await executeExtractedQuery(connect, { query: "QRY_insert_ordens_reparacao", parameters: orderParameters("7") });
  expect(await executeExtractedQuery(connect, { query: "QRY_update_ordens_reparacao", parameters: { ...changed, ParamNumero: "7", ParamNumero_antigo: "9007199254740994" } })).toEqual({ kind: "failed" });
  expect((await database.query('SELECT "reparacao_servico" FROM app."ordem_reparacao" WHERE "numero"=9007199254740994')).rows[0].reparacao_servico).toBe("UPDATED");
});

it("nine-field material insert keeps its source values and never adjusts article stock", async () => {
  await seed();
  expect(await executeExtractedQuery(connect, { query: "QRY_insert_material_reparacao", parameters: {
    ParamNumero: "9007199254740993", ParamMecanico: "2", ParamArtigo: "A", ParamDescricaoArtigo: " Exact ' ", ParamQuantidade: "-2.123456789123456789", ParamDataHora: "", ParamReparacaoEstado: null, ParamPreco: "123456789123456789.1", ParamLancado: true,
  } })).toEqual({ kind: "written", affected: "1" });
  expect((await database.query('SELECT "numero"::text,"quantidade"::text,"preco"::text,"descricao_artigo","reparacao_estado","data_hora","lancado" FROM app."material_reparacao" WHERE "numero"=9007199254740993')).rows[0])
    .toEqual({ numero: "9007199254740993", quantidade: "-2.123456789123456789", preco: "123456789123456789.1", descricao_artigo: " Exact ' ", reparacao_estado: null, data_hora: "", lancado: true });
  expect((await database.query('SELECT "stock"::text FROM app."artigos"')).rows[0].stock).toBe("99");
});

it("exact business-code customer/mechanic reads return all original fields, with raw credential server-internal only", async () => {
  await seed();
  expect(await read("QRY_select_cliente_codigo", { ParamCodigo_Cliente: "91" })).toEqual([]);
  expect(await read("QRY_select_cliente_codigo", { ParamCodigo_Cliente: "1" })).toEqual([{ Codigo: "1", Descricao: "Recepção", Morada1: "Rua1", Morada2: null, codpostal: "0000", Telefone1: " 123 ", Telemovel: "456", observacao: " Obs " }]);
  expect(await read("QRY_select_mecanicos_codigo", { ParamCodigo: "2" })).toEqual([{ Codigo: "2", Descricao: "Linha", palavra_passe: "Synthetic secret", inativo: true }]);
  expect(await read("QRY_select_mecanicos_codigo", { ParamCodigo: null })).toEqual([]);
});

it("stock headers expose source direction/requirement and line lookup keeps both keys and original binary composite", async () => {
  await seed();
  const headers = await read("QRY_select_cab_stocks");
  expect(headers.find(row => row.documento_codigo === "D1")).toMatchObject({ documento_numero: "7", documentosID: "1", mecanicosID: "1", documentosID_do: "1", stock: "2", obriga_macanico: true });
  expect(await read("QRY_select_lin_stocks", { ParamNumero: "7", ParamDoc: "D1" })).toEqual([{ lin_stocksID: "1", documento_codigo: "D1", documento_numero: "7", linha: "9007199254740993", artigo: "A", descricao_artigo: "Filtro documentário", quantidade: "2", preco: "5", documento_codigodocumento_numero: { encoding: "base64", data: "AAH/" } }]);
  expect(await read("QRY_select_lin_stocks", { ParamNumero: "7", ParamDoc: "D2" })).toEqual([]);
});

it("stock/material ledger branches preserve both header keys, source reception date and UNION ALL duplicates", async () => {
  await seed();
  const parameters = { ...dates, ...articleRange };
  const stocks = await read("QRY_select_cab_lin_stocks", parameters), materials = await read("QRY_select_material_ordem_Reparacao", parameters);
  expect(stocks).toEqual([{ numero: "7", artigo: "A", descricao_artigo: "Filtro documentário", quantidade: "2", Descricao: "Saída", data: "20261025110000000", stock: "2" }]);
  expect(materials).toEqual([{ numero: "10", artigo: "A", descricao_artigo: "Linha material", quantidade: "1.000000000000000001", Descricao: "Ordem de reparaçªo", data: "20261025100000000", stock: "2" }]);
  await database.query('INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","artigo","descricao_artigo","quantidade","data_hora") VALUES (2,10,\'A\',\'Linha material\',1.000000000000000001,\'20990101000000000\')');
  for (const query of ["QRY_union_extrato_artigos", "QRY_union_extrato_artigos_calcular_total"] as const) {
    const rows = await read(query, parameters);
    expect(rows.map(row => [row.numero, row.data, row.quantidade])).toEqual([["10", "20261025100000000", "1.000000000000000001"], ["10", "20261025100000000", "1.000000000000000001"], ["7", "20261025110000000", "2"]]);
  }
  expect((await read("QRY_select_material_reparacao", { ParamNumero: "10" })).map(row => row.data_hora)).toEqual(["20261025120000000", "20990101000000000"]);
});

it("consumption branches keep the intentional number-only header join and distinct mechanic and description filters", async () => {
  await seed();
  const parameters = { ...articleRange, ...dates, ParamDescricao: "Filtro%" };
  const exits = await read("QRY_union_lin_stocks", parameters);
  expect(exits).toHaveLength(2); expect(exits.map(row => row.Descricao_me).sort()).toEqual(["Atribuído", "Linha"]);
  const orders = await read("QRY_union_material_reparacao", { ...articleRange, ...dates });
  expect(orders).toHaveLength(1); expect(orders[0]).toMatchObject({ documento_numero: "10", Descricao_me: "Atribuído", codbarras: "Barcode", preco: "1.234567890123456789", inativo: false });
  const union = await read("QRY_Union_lin_stocks_material_reparacao", { ...parameters, ParamDescricao: "NO MATCH" });
  expect(union).toEqual(orders);
  const vehicle = await read("QRY_select_consumo_material_viatura", { ...articleRange, ...dates, ParamDaViatura: "AA", ParamAViatura: "AA" });
  expect(vehicle).toHaveLength(1); expect(vehicle[0]).toMatchObject({ Descricao_me: "Linha", mecanico: "2", reparacao_mecanico: "3", matricula_Vi: "AA", Codigo_me: "2" });
  await database.query('DELETE FROM app."artigos"');
  expect(await read("QRY_select_consumo_material_viatura", { ...articleRange, ...dates, ParamDaViatura: "AA", ParamAViatura: "AA" })).toEqual([]);
});

it("order queries retain mandatory reception-customer joins, arbitrary source types/material flag and typed numero order", async () => {
  await seed();
  await database.query('INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_estado") VALUES (99,\'AA\',999,\'R\')');
  const general = await read("QRY_select_ordens_reparacao"); expect(general.map(row => row.numero)).toEqual(["10", "2"]);
  expect(general[0]).toMatchObject({ Cliente: "2", Codigo_Cliente: "1", Descricao_Cliente: "Recepção", Descricao_Terceiro: null });
  expect((await read("QRY_select_ordens_reparacao_matricula", { ParamTipo: ["6"], ParamLancarMat: false })).map(row => row.numero)).toEqual(["2"]);
  expect((await read("QRY_select_ordens_reparacao_matricula", { ParamTipo: ["3"], ParamLancarMat: true })).map(row => row.numero)).toEqual(["10", "99"]);
  expect((await read("QRY_select_ordens_reparacao_tempos")).map(row => row.numero)).toEqual(["2", "10", "99"]);
});

it("delivery/payment queries use vehicle-owner customer and inclusive date/state parameters with source ordering", async () => {
  await seed(); const parameters = { ParamDaData: "20261025", ParamAData: "20261026", ParamEstados: ["R", "X"] };
  const delivery = await read("QRY_select_ordens_reparacao_data_entrega", parameters);
  expect(delivery.map(row => row.numero)).toEqual(["2", "10"]); expect(delivery.every(row => row.Cliente === "Dono")).toBe(true);
  const payment = await read("QRY_select_ordens_reparacao_data_pag", parameters);
  expect(payment.map(row => row.numero).sort()).toEqual(["10", "2"]); expect(payment.every(row => row.Cliente === "Dono")).toBe(true);
  expect(await read("QRY_select_ordens_reparacao_data_pag", { ...parameters, ParamEstados: [] })).toEqual([]);
  expect(await read("QRY_select_ordens_reparacao_data_pag", { ParamDaData: null, ParamAData: null, ParamEstados: null })).toHaveLength(2);
});

it("open-labor query preserves exact zero17 plus mechanic join and labor reports retain their distinct range/order contracts", async () => {
  await seed();
  await database.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES
    (1,10,2,'20261025120000000','00000000000000000'),(2,10,2,'20261025110000000',''),(3,10,2,'20261025100000000',NULL),(4,10,99,'20261025120000000','00000000000000000'),
    (5,2,2,'20261025120000000','20261025130000000')`);
  expect(await read("QRY_select_tempos_reparacao_ordem", { ParamNumero: "10" })).toEqual([{ numero: "10", mecanico: "2", inicio: "20261025120000000", fim: "00000000000000000", Codigo: "2", Descricao: "Linha" }]);
  const order = await read("QRY_tempos_ordem_reparacao", { ...dates, ParamDaOrdem: "2", ParamAOrdem: "10" });
  expect(order.map(row => row.numero)).toEqual(["2", "10", "10", "10"]);
  const vehicle = await read("QRY_tempos_ordem_reparacao_matricula", { ...dates, ParamDaViatura: "AA", ParamAViatura: "BB" });
  expect(vehicle.map(row => row.matricula)).toEqual(["AA", "AA", "AA", "BB"]);
  const mechanic = await read("QRY_tempos_ordem_reparacao_mecanico", { ...dates, ParamDoMecanico: "2", ParamAoMecanico: "2" });
  expect(mechanic.map(row => row.numero)).toEqual(["2", "10", "10", "10"]);
});

it("fixed read operations release their actual database connection", async () => {
  const pids: number[] = [], observed: DatabaseConnection = async () => {
    const client = await connect(); pids.push((await client.query<{ pid: number }>("SELECT pg_backend_pid() AS pid")).rows[0].pid); return client;
  };
  expect(await executeExtractedQuery(observed, { query: "QRY_select_cab_stocks", parameters: {} })).toEqual({ kind: "loaded", rows: [] });
  expect((await database.query('SELECT COUNT(*)::int AS count FROM pg_stat_activity WHERE pid=ANY($1::int[])', [pids])).rows[0].count).toBe(0);
});
