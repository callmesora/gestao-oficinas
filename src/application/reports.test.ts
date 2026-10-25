import { expect, it } from "vitest";
import { repairOrderReportSnapshot } from "./reports";
import type { RepairOrderList, RepairOrderListRow } from "../../packages/domain/src/repair-orders";

it("freezes the displayed caller rows/order/effective filter without re-reading or normalizing source IDs/text", () => {
  const filter: RepairOrderList = { entryStart: "", entryEnd: "", deliveryStart: "", deliveryEnd: "", priority: 2, mechanic: 0, customer: "", registration: "AA", states: ["R"], sort: "numero", descending: false };
  const row: RepairOrderListRow = { id: "1", orderId: "1", numero: "18446744073709551615", matricula: "AA-00-AA", Descricao_Cliente: "AÇÃO  ", Descricao_Terceiro: null, marcamodelo: "M M", recepcao_datahora: "00000000000000000", recepcao_entrega_prevista: null, Descricao: "Reparação", recepcao_prioridade: 2, Descricao_me: null, Cor: null };
  const request = repairOrderReportSnapshot([row, { ...row, numero: "2" }], filter, { company: "Oficina", dateText: "25/10/2026" });
  row.numero = "3"; filter.states.push("X");
  expect(request.source.rows.map(value => value.COL_Numero)).toEqual(["18446744073709551615", "2"]);
  expect(request.source.filter.states).toEqual(["R"]);
  expect(request.source.rows[0]).toMatchObject({ COL_Cliente: "AÇÃO  ", COL_Recepcao_datahora: "00/00/0000 00:00", COL_Recepcao_prioridade: "2", COL_Reparacao_mecanico: null });
});
