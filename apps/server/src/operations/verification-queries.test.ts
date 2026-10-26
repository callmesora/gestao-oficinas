import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import type { Client } from "pg";
import { startIsolatedPostgres } from "../../test-support/postgres";
import { migrate } from "../db/migrate";
import type { DatabaseConnection } from "../db/connection";
import { listVehicles, lookupVehicle } from "./vehicles";
import { initialiseRepairOrderForm } from "./repair-order-form";

let engine: Awaited<ReturnType<typeof startIsolatedPostgres>>, database: Client, connect: DatabaseConnection;
beforeAll(async () => {
  engine = await startIsolatedPostgres(); database = await engine.database(); await migrate(database);
  const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name;
  connect = () => engine.connect(name);
}, 60000);
afterAll(async () => { await database?.end(); await engine?.stop(); }, 60000);
beforeEach(async () => {
  await database.query('TRUNCATE app."Viaturas",app."Clientes",app."ordem_reparacao" RESTART IDENTITY');
});

// Independent source-derived oracles: docs/mapping/QRY_select_viatura_matricula.md,
// QRY_select_viaturas.md and QRY_select_ordens_reparacao_numero.md. Extra internal IDs
// belong to the accepted repository DTO; they must not replace the source business key.
it("SRC-725ba0d1e9 exact vehicle seek preserves all six raw fields without requiring a customer", async () => {
  await database.query(`INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo","Ano","mes")
    VALUES (71,'Raw '' Á ',9007199254740993,' Marca  ',NULL,0,0), (72,'RAW '' Á ',5,'Other','Model',2026,10)`);
  const result = await lookupVehicle(connect, { registration: "Raw ' Á " });
  expect(result.kind).toBe("loaded");
  if (result.kind !== "loaded") throw new Error("Synthetic vehicle not loaded");
  expect(result.vehicle).toEqual({ id: expect.any(String), ViaturasID: "71", matricula: "Raw ' Á ", Cliente: "9007199254740993", marca: " Marca  ", modelo: null, Ano: 0, mes: 0 });
  expect(await lookupVehicle(connect, { registration: "Raw ' Á" })).toEqual({ kind: "missing" });
  const other = await lookupVehicle(connect, { registration: "RAW ' Á " });
  expect(other).toMatchObject({ kind: "loaded", vehicle: { ViaturasID: "72", Cliente: "5", marca: "Other", modelo: "Model", Ano: 2026, mes: 10 } });
});

it("SRC-1b24326708 vehicle list retains business-code inner-join multiplicity and registration ordering", async () => {
  await database.query(`INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao") VALUES
    (99,9007199254740993,'Owner A'),(100,3,'Owner B'),(101,2,NULL);
    INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo","Ano","mes") VALUES
    (1,'ZZ',9007199254740993,'M',NULL,0,0),(2,'AA',2,NULL,'N',2026,10),(3,'ORPHAN',99,'Absent',NULL,0,0),(4,'ZZ',3,'M',NULL,0,0)`);
  const result = await listVehicles(connect, { mode: "todos", term: "" });
  expect(result.kind).toBe("loaded");
  if (result.kind !== "loaded") throw new Error("Synthetic list not loaded");
  expect(result.vehicles.map(row => row.matricula)).toEqual(["AA", "ZZ", "ZZ"]);
  expect(result.vehicles[0]).toEqual({ id: expect.any(String), ViaturasID: "2", matricula: "AA", Cliente: "2", marca: null, modelo: "N", Ano: 2026, mes: 10, Descricao: null });
  expect(result.vehicles.slice(1).map(row => Object.fromEntries(Object.entries(row).filter(([field]) => field !== "id")))
    .sort((a, b) => String(a.Descricao).localeCompare(String(b.Descricao))))
    .toEqual([
      { ViaturasID: "1", matricula: "ZZ", Cliente: "9007199254740993", marca: "M", modelo: null, Ano: 0, mes: 0, Descricao: "Owner A" },
      { ViaturasID: "4", matricula: "ZZ", Cliente: "3", marca: "M", modelo: null, Ano: 0, mes: 0, Descricao: "Owner B" },
    ]);
});

it("SRC-3d8ab890ac exact order seek returns every raw source field and isolates consecutive reads", async () => {
  const expected = {
    ordem_reparacaoID: "9007199254740993", numero: "9007199254740994", matricula: "NO VEHICLE", km_viatura: "18446744073709551615",
    recepcao_util: 255, recepcao_datahora: "2024-02-29 12:34:56.789", recepacao_contatos: " Contact\r\n ", recepcao_servico: " Service ' ",
    recepcao_obs: null, recepcao_entrega_prevista: "00000000", recepcao_prioridade: 2, reparacao_mecanico: 254,
    reparacao_estado: "NO STATE", reparacao_estado_obs: " State obs ", reparacao_servico: "Work", reparacao_estado_data: "",
    reparacao_estado_historico: " History\r\n ", totaL_mao_obra: "1.000000000000000001", total_pecas: "-2.000000000000000002",
    total_desconto: "0.000000000000000003", total_reparacao: "-1.000000000000000001", faturado: null, total_pago: "123456789123456789.123456789",
    Estados_reparacaoID: "9007199254740995", numero_fatura: " Invoice ", recepcao_cliente: "9007199254740996", data_pagamento: null, recepcao_terceiro: "9007199254740997",
  };
  const columns = Object.keys(expected);
  const stored = await database.query<{ id: string }>(`INSERT INTO app."ordem_reparacao" (${columns.map(field => `"${field}"`).join(",")})
    VALUES (${columns.map((_, index) => `$${index + 1}`).join(",")}) RETURNING _row_id::text AS id`, Object.values(expected));
  const result = await initialiseRepairOrderForm(connect, { target: { mode: "update", originalNumero: expected.numero } });
  expect(result.kind).toBe("loaded");
  if (result.kind !== "loaded") throw new Error("Synthetic order not loaded");
  expect(result.order).toEqual({ id: stored.rows[0].id, ...expected });
  expect(result.nextNumero).toBeNull();
  expect(await initialiseRepairOrderForm(connect, { target: { mode: "update", originalNumero: "3" } })).toEqual({ kind: "missing" });
  const repeated = await initialiseRepairOrderForm(connect, { target: { mode: "update", originalNumero: expected.numero } });
  expect(repeated).toMatchObject({ kind: "loaded", order: { id: stored.rows[0].id, ...expected } });
});
