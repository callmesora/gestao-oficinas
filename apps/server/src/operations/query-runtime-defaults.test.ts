import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { listCustomers } from "./customers";
import { listVehicles, lookupVehicle, saveVehicle, checkVehicleDelete, deleteVehicle } from "./vehicles";
import { listArticles } from "./articles";
import { executeExtractedQuery, extractedQueryNames } from "./extracted-queries";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => engine.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await engine?.stop(); }, 60000);
beforeEach(async () => {
  await database.query('TRUNCATE app."Clientes",app."Viaturas",app."artigos",app."ordem_reparacao",app."material_reparacao",app."mecanicos",app."estados_reparacao",app."cab_stocks",app."lin_stocks",app."documentos",app."tempos_reparacao" RESTART IDENTITY');
});

it("RULE-T01-001 RULE-T02-001 RULE-T04-001 source substrings use the same Unicode lowercase default and preserve raw text", async () => {
  await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao","Morada1","Morada2") VALUES (1,$1,NULL,$2),(2,NULL,NULL,NULL)', ["  AÇORES ÁGUA İẞ  ", "A_100%"]);
  await database.query('INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ($1,1,$2,NULL)', ["AB-ÁÇ", "AÇORES ÁGUA İẞ"]);
  await database.query('INSERT INTO app."artigos" ("Codigo","Descricao","codbarras","inativo") VALUES ($1,$2,$3,false)', ["ÁÇ-100", "  AÇORES ÁGUA İẞ  ", "A_100%"]);
  for (const term of ["açores", "água", "i̇ß", "  açores"]) {
    expect(await listCustomers(connect, { mode: "descricao", term })).toMatchObject({ kind: "loaded", customers: [{ Codigo: "1", Descricao: "  AÇORES ÁGUA İẞ  " }] });
    expect(await listArticles(connect, { mode: "descricao", term, active: true, inactive: true })).toMatchObject({ kind: "loaded", articles: [{ Codigo: "ÁÇ-100" }] });
  }
  expect(await listVehicles(connect, { mode: "marca_modelo", term: "açores" })).toMatchObject({ kind: "loaded", vehicles: [{ matricula: "AB-ÁÇ", marca: "AÇORES ÁGUA İẞ", modelo: null }] });
  expect(await listVehicles(connect, { mode: "cliente", term: "água" })).toMatchObject({ kind: "loaded", vehicles: [{ matricula: "AB-ÁÇ" }] });
  expect(await listVehicles(connect, { mode: "matricula", term: "áç" })).toMatchObject({ kind: "loaded", vehicles: [{ matricula: "AB-ÁÇ" }] });
  expect(await listArticles(connect, { mode: "codigo", term: "áç", active: true, inactive: true })).toMatchObject({ kind: "loaded", articles: [{ Codigo: "ÁÇ-100" }] });
  // Source substring search is literal; neither wildcard interpretation nor accent folding is added.
  expect(await listCustomers(connect, { mode: "morada", term: "_100%" })).toMatchObject({ kind: "loaded", customers: [{ Codigo: "1" }] });
  expect(await listArticles(connect, { mode: "codigobarras", term: "_100%", active: true, inactive: true })).toMatchObject({ kind: "loaded", articles: [{ Codigo: "ÁÇ-100" }] });
  expect(await listCustomers(connect, { mode: "descricao", term: "acores" })).toMatchObject({ kind: "loaded", customers: [] });
  expect(await listArticles(connect, { mode: "descricao", term: "acores", active: true, inactive: true })).toMatchObject({ kind: "loaded", articles: [] });
  expect(await lookupVehicle(connect, { registration: "ab-áç" })).toEqual({ kind: "missing" });
  expect((await database.query('SELECT "Descricao","Morada1","Morada2" FROM app."Clientes" WHERE "Codigo"=1')).rows[0]).toEqual({ Descricao: "  AÇORES ÁGUA İẞ  ", Morada1: null, Morada2: "A_100%" });
});

it("RULE-T02-001 exact original oversized vehicle identity remains usable for lookup, edit and guarded deletion", async () => {
  const registration = "  imported-REGISTRATION-ÁÇ  ";
  await database.query('INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo") VALUES (1,$1,1,$2,$3)', [registration, "Marca", "Modelo"]);
  const loaded = await lookupVehicle(connect, { registration });
  expect(loaded).toMatchObject({ kind: "loaded", vehicle: { matricula: registration } });
  expect(await saveVehicle(connect, { mode: "update", originalRegistration: registration, values: { matricula: registration, Cliente: "1", marca: "Editada", modelo: "Modelo", Ano: 0, mes: null } })).toMatchObject({ kind: "saved", vehicles: [{ matricula: registration, marca: "Editada" }] });
  expect(await saveVehicle(connect, { mode: "create", values: { matricula: registration, Cliente: "1", marca: "Outra", modelo: "Modelo", Ano: 0, mes: null } })).toEqual({ kind: "invalid" });
  await database.query('INSERT INTO app."ordem_reparacao" ("numero","matricula") VALUES (1,$1)', [registration]);
  expect(await checkVehicleDelete(connect, { registration })).toMatchObject({ kind: "associated" });
  expect(await deleteVehicle(connect, { registration })).toMatchObject({ kind: "associated" });
  await database.query('DELETE FROM app."ordem_reparacao"');
  expect(await deleteVehicle(connect, { registration })).toEqual({ kind: "deleted" });
  expect(await lookupVehicle(connect, { registration })).toEqual({ kind: "missing" });
});

it("query U03/U04 defaults accept declared omitted reads, isolate empty results and still reject incomplete writes", async () => {
  const reads = extractedQueryNames.filter(name => !name.startsWith("QRY_insert_") && !name.startsWith("QRY_update_"));
  for (const query of reads) expect(await executeExtractedQuery(connect, { query, parameters: {} })).toEqual({ kind: "loaded", rows: [] });
  for (const query of ["QRY_insert_material_reparacao", "QRY_insert_ordens_reparacao", "QRY_update_ordens_reparacao"]) {
    expect(await executeExtractedQuery(connect, { query, parameters: {} })).toEqual({ kind: "invalid" });
  }
  await database.query('INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,$1)', ["Prior result"]);
  expect(await executeExtractedQuery(connect, { query: "QRY_select_cliente_codigo", parameters: { ParamCodigo_Cliente: "1" } })).toMatchObject({ kind: "loaded", rows: [{ Codigo: "1", Descricao: "Prior result" }] });
  expect(await executeExtractedQuery(connect, { query: "QRY_select_cliente_codigo", parameters: {} })).toEqual({ kind: "loaded", rows: [] });
  expect(await executeExtractedQuery(connect, { query: "QRY_select_cliente_codigo", parameters: { ParamCodigo_Cliente: null } })).toEqual({ kind: "loaded", rows: [] });
  expect(await executeExtractedQuery(connect, { query: "QRY_select_cliente_codigo", parameters: { ParamCodigo_Cliente: "0" } })).toEqual({ kind: "loaded", rows: [] });
  expect(await executeExtractedQuery(connect, { query: "QRY_select_cliente_codigo", parameters: { unexpected: null } })).toEqual({ kind: "invalid" });
});

it("query U03 range/list NULL defaults preserve explicit empty lists and one-sided omitted ranges", async () => {
  await database.query(`INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'Owner');
    INSERT INTO app."Viaturas" ("matricula","Cliente") VALUES ('AA',1);
    INSERT INTO app."estados_reparacao" ("Codigo") VALUES ('R');
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_estado","recepcao_entrega_prevista") VALUES (1,'AA','R','20261025')`);
  const query = "QRY_select_ordens_reparacao_data_entrega";
  const omitted = await executeExtractedQuery(connect, { query, parameters: { ParamDaData: "20990101" } });
  expect(omitted).toMatchObject({ kind: "loaded", rows: [{ numero: "1" }] });
  expect(await executeExtractedQuery(connect, { query, parameters: { ParamDaData: "20990101", ParamAData: null, ParamEstados: null } })).toEqual(omitted);
  expect(await executeExtractedQuery(connect, { query, parameters: { ParamEstados: [] } })).toEqual({ kind: "loaded", rows: [] });
});
