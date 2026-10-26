import { test, expect } from "./support/verification-operations";
import type { Client } from "pg";

test.setTimeout(90000);
async function seed(database: Client) {
  await database.query(`INSERT INTO app."sistema" ("Tempo_tempos","encerrar_tempos1","encerrar_tempos2") VALUES (3600,'235958','235959');
    INSERT INTO app."Clientes" ("Codigo","Descricao") VALUES (1,'Cliente da recepção'),(2,'Cliente da viatura');
    INSERT INTO app."Viaturas" ("matricula","Cliente","marca","modelo") VALUES ('AA-00-AA',2,'Marca','Modelo');
    INSERT INTO app."mecanicos" ("Codigo","Descricao","inativo","palavra_passe") VALUES (7,'ANA',false,'Synthetic'),(8,'BRUNO',false,'Synthetic');
    INSERT INTO app."estados_reparacao" ("Codigo","Descricao","tipo","Cor","lancar_material") VALUES
      ('A','Tipo um',1,0,true),('B','Tipo dois',2,0,true),('R','Tipo três',3,255,true),('S','Tipo quatro',4,65280,true),
      ('T','Tipo cinco',5,16711680,true),('U','Tipo seis',6,0,true),('V','Tipo sete',7,0,true),('W','Tipo oito',8,0,true);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","recepcao_cliente","reparacao_mecanico","reparacao_estado","recepcao_prioridade","recepcao_servico","recepcao_obs","recepacao_contatos","reparacao_servico","reparacao_estado_historico") VALUES
      (10,'AA-00-AA',1,7,'R',1,'Serviço Ω','Observação ação',' 210  ','Trabalho','Histórico'),
      (20,'AA-00-AA',1,7,'S',2,'Segundo','','','',''),(30,'AA-00-AA',1,8,'T',3,'Terceiro','','','','');
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim","Inicio_reparacao_estado") VALUES
      (1,10,7,'20261026100000000','00000000000000000','R'),(2,10,8,'20261026103000000','00000000000000000','R'),
      (3,10,7,'20261026110000000','','R'),(4,10,7,'20261026111000000',NULL,'R'),(5,10,99,'20261026112000000','00000000000000000','R');
    INSERT INTO app."estados_descritivos" ("Codigo","Descricao") VALUES ('D','Descrição do catálogo')`);
}

test("verification operations labor source state and open-time navigation keep valid first and last boundaries without list refresh", async ({ page, operations }) => {
  await seed(operations.database); await page.clock.install({ time: new Date(2026, 9, 26, 12, 0, 0) });
  await page.goto(`${operations.origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao"), states = screen.getByTestId("TABLE_Estados_reparacao"), orders = screen.getByTestId("TABLE_tempos_reparacao");
  await expect(orders.locator("tbody tr")).toHaveCount(3); await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled();
  await expect(states.locator("tbody tr")).toHaveCount(5);
  expect(await states.locator("tbody tr").allTextContents()).toEqual(["Tipo dois2", "Tipo três3", "Tipo quatro4", "Tipo cinco5", "Tipo seis6"]);
  const selectedState = states.locator('tbody tr[aria-selected="true"]');
  await expect(selectedState).toContainText("Tipo dois");
  let listReads = 0; page.on("request", request => { if (new URL(request.url()).pathname === "/api/repair-labor/list") listReads++; });
  await screen.getByTestId("BTN_anterior1").click(); await expect(selectedState).toContainText("Tipo dois");
  await screen.getByTestId("BTN_seguinte1").click(); await expect(selectedState).toContainText("Tipo três");
  for (let index = 0; index < 4; index++) await screen.getByTestId("BTN_seguinte1").click();
  await expect(selectedState).toContainText("Tipo seis"); await screen.getByTestId("BTN_anterior1").click(); await expect(selectedState).toContainText("Tipo cinco");
  expect(listReads).toBe(0);
  for (const [label, color] of [["Tipo três", "rgb(255, 0, 0)"], ["Tipo quatro", "rgb(0, 255, 0)"], ["Tipo cinco", "rgb(0, 0, 255)"]]) {
    const shape = states.getByRole("row").filter({ hasText: label }).getByTestId("SHA_cor");
    await expect(shape).toHaveCSS("background-color", color); await expect(shape).toHaveCSS("width", "18px"); await expect(shape).toHaveCSS("height", "18px");
  }
  for (const [numero, label] of [["10", "Normal"], ["20", "Elevada"], ["30", "Urgente"]]) {
    await expect(orders.getByRole("row").filter({ has: page.getByRole("cell", { name: numero, exact: true }) })).toContainText(label);
  }
  await orders.getByRole("cell", { name: "10", exact: true }).click();
  const labor = screen.getByTestId("TABLE_tempos_reparacao_ordem"); await expect(labor.locator("tbody tr")).toHaveCount(2);
  await expect(labor).toContainText("ANA"); await expect(labor).toContainText("BRUNO");
  await labor.getByRole("cell", { name: "ANA", exact: true }).click(); const selectedLabor = labor.locator('tbody tr[aria-selected="true"]');
  await screen.getByTestId("BTN_anterior2").click(); await expect(selectedLabor).toContainText("ANA");
  await screen.getByTestId("BTN_seguinte2").click(); await expect(selectedLabor).toContainText("BRUNO");
  await screen.getByTestId("BTN_seguinte2").click(); await expect(selectedLabor).toContainText("BRUNO");
  await screen.getByTestId("BTN_anterior2").click(); await expect(selectedLabor).toContainText("ANA"); expect(listReads).toBe(0);
  await screen.getByTestId("BTN_Informacao").click(); const info = page.getByTestId("WIN_Tempos_Reparacao_Informacao");
  await expect(info.getByTestId("EDT_servico_avaria")).toHaveValue("Serviço Ω"); await expect(info.getByTestId("EDT_observacao")).toHaveValue("Observação ação");
  await expect(info.getByTestId("EDT_contactos")).toHaveValue(" 210  "); await expect(info.getByTestId("EDT_cliente")).toHaveValue("Cliente da recepção");
  await info.getByTestId("BTN_SYST_FERMER").click(); await expect(info).toHaveCount(0); await expect(screen).toBeVisible(); expect(listReads).toBe(0);
  await screen.getByTestId("BTN_Fechar").click(); await expect(screen).toHaveCount(0);
});

test("verification operations labor state real type set navigation descriptive picker and cancellation retain the source draft without writes", async ({ page, operations }) => {
  await seed(operations.database); await page.clock.install({ time: new Date(2026, 9, 26, 12, 0, 0) });
  await page.goto(`${operations.origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao"); await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await screen.getByTestId("BTN_Estado").click(); const state = page.getByTestId("WIN_Tempos_Reparacao_Estado"), table = state.getByTestId("TABLE_Estados_reparacao");
  await expect(table.locator("tbody tr")).toHaveCount(5);
  expect(await table.locator("tbody tr").allTextContents()).toEqual(["Tipo três", "Tipo quatro", "Tipo cinco", "Tipo seis", "Tipo sete"]);
  const selected = table.locator('tbody tr[aria-selected="true"]'); await expect(selected).toContainText("Tipo três");
  await state.getByTestId("BTN_anterior").click(); await expect(selected).toContainText("Tipo três");
  await state.getByTestId("BTN_seguinte").click(); await expect(selected).toContainText("Tipo quatro");
  for (let index = 0; index < 4; index++) await state.getByTestId("BTN_seguinte").click(); await expect(selected).toContainText("Tipo sete");
  await state.getByTestId("BTN_anterior").click(); await expect(selected).toContainText("Tipo seis");
  await state.getByTestId("BTN_NoName1").click(); const picker = page.getByTestId("descriptive-state-picker");
  await picker.getByRole("cell", { name: "Descrição do catálogo", exact: true }).click(); await picker.getByTestId("BTN_selecionar").click();
  await expect(state.getByTestId("EDT_descricao")).toHaveValue("Descrição do catálogo");
  await state.getByTestId("BTN_NoName1").click(); await expect(picker.getByTestId("BTN_selecionar")).toBeEnabled(); await picker.getByTestId("BTN_Fechar").click();
  // Source416 passes an empty origin on every opening, so cancel assigns empty text.
  await expect(state.getByTestId("EDT_descricao")).toHaveValue(""); await state.getByTestId("BTN_Cancelar").click(); await expect(state).toHaveCount(0);
  expect((await operations.database.query('SELECT "reparacao_estado","reparacao_estado_historico","reparacao_servico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows).toEqual([{ reparacao_estado: "R", reparacao_estado_historico: "Histórico", reparacao_servico: "Trabalho" }]);
});

test("verification operations details exact material VAT totals follow draft edits and row exit while chrome close discards every draft", async ({ page, operations }) => {
  const { database, origin } = operations; await seed(database);
  await database.query(`UPDATE app."sistema" SET "Data_inicio"=365,"Tempo_ordem_reparacao"=3600;
    UPDATE app."ordem_reparacao" SET "recepcao_datahora"='20261026120000000',"recepcao_entrega_prevista"='20261026';
    DELETE FROM app."tempos_reparacao";
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES
      (1,10,7,'20261026120000000','20261026130000000'),(2,10,8,'20261026120000000','20261026120000001'),(3,10,99,'20261026120000000','20261026140000000');
    INSERT INTO app."material_reparacao" ("numero","artigo","descricao_artigo","quantidade","preco","data_hora","extra","lancado") VALUES
      (10,'A','Decimal A',0.1,0.2,'20261026120000000',false,false),(10,'B','Decimal B',2.5,1.99,'20261026130000000',true,false),(10,'C','Decimal C',-1,3,'20261026110000000',false,false)`);
  await page.clock.install({ time: new Date(2026, 9, 26, 12, 0, 0) });
  await page.goto(`${origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const list = page.getByTestId("WIN_Ordens_Reparacao"); await expect(list.getByTestId("repair-order-read-state")).toHaveText("ready");
  await expect(list.getByTestId("repair-order-selected")).toHaveText("30");
  const orderRow = list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("row").filter({ has: page.getByRole("cell", { name: "10", exact: true }) });
  await expect(orderRow.getByRole("cell", { name: "AA-00-AA", exact: true }).locator("span")).toHaveCSS("font-size", "12px");
  await expect(orderRow.getByRole("cell", { name: "AA-00-AA", exact: true }).locator("span")).toHaveCSS("font-weight", "700");
  await expect(orderRow.locator("td").first()).toHaveCSS("height", "30px");
  let orderReads = 0; page.on("request", request => { if (new URL(request.url()).pathname === "/api/repair-orders/list") orderReads++; });
  const stateChoice = list.getByRole("checkbox", { name: "Selecionar estado S", exact: true }); await stateChoice.click();
  await list.getByTestId("BTN_Todos").click(); await expect(stateChoice.locator("xpath=ancestor::tr")).toHaveAttribute("aria-selected", "true");
  await list.getByTestId("BTN_Nenhum").click(); await expect(stateChoice.locator("xpath=ancestor::tr")).toHaveAttribute("aria-selected", "true");
  await list.getByTestId("EDT_matricula").fill("CLEAR"); await list.getByTestId("EDT_cliente").fill("123");
  await list.getByTestId("BTN_VISION3").click(); await list.getByTestId("BTN_VISION5").click();
  await expect(list.getByTestId("EDT_matricula")).toHaveValue(""); await expect(list.getByTestId("EDT_cliente")).toHaveValue("");
  expect(orderReads).toBe(0);
  await list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click(); await list.getByTestId("BTN_informacao").click();
  const detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes"); await expect(detail.getByTestId("TABLE_Tempos").locator("tbody tr")).toHaveCount(2);
  await expect(detail.getByTestId("STC_total")).toHaveText("Total: 01:01"); await expect(detail.getByTestId("STC_matricula")).toHaveText("AA-00-AA");
  await detail.getByRole("tab", { name: "Descrições/Observações", exact: true }).click();
  await expect(detail.getByTestId("EDT_servico_avaria")).toHaveValue("Serviço Ω"); await expect(detail.getByTestId("EDT_observacao")).toHaveValue("Observação ação");
  await detail.getByRole("tab", { name: "Histórico dos estados", exact: true }).click(); await expect(detail.getByTestId("EDT_historico_estado")).toHaveValue("Histórico");
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click(); const table = detail.getByTestId("TABLE_materiais"), total = detail.getByTestId("STC_total_material");
  await expect(table.locator("tbody tr")).toHaveCount(3); expect(await table.locator("tbody tr td:nth-child(2)").allTextContents()).toEqual(["Decimal C", "Decimal A", "Decimal B"]);
  await expect(total).toHaveText("Extras: 4.98    Total: -2.98    Total c/iva: -3.67");
  await detail.getByRole("checkbox", { name: "Extra A", exact: true }).click(); await expect(total).toHaveText("Extras: 5.00    Total: -3.00    Total c/iva: -3.69");
  await table.getByRole("cell", { name: "Decimal C", exact: true }).click(); await expect(total).toHaveText("Extras: 5.00    Total: -3.00    Total c/iva: -3.69");
  await table.getByRole("button", { name: "1.99", exact: true }).click(); const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await prompt.getByTestId("EDT_quantidade").fill("2,01"); await prompt.getByTestId("BTN_Confirmar").click();
  await expect(total).toHaveText("Extras: 5.05    Total: -3.00    Total c/iva: -3.69");
  expect((await database.query('SELECT "preco"::text,"extra" FROM app."material_reparacao" ORDER BY "artigo"')).rows).toEqual([{ preco: "0.2", extra: false }, { preco: "1.99", extra: true }, { preco: "3", extra: false }]);
  await detail.getByTestId("BTN_SYST_FERMER").click(); await expect(detail).toHaveCount(0);
  expect((await database.query('SELECT "preco"::text,"extra" FROM app."material_reparacao" ORDER BY "artigo"')).rows).toEqual([{ preco: "0.2", extra: false }, { preco: "1.99", extra: true }, { preco: "3", extra: false }]);
  await database.query(`UPDATE app."material_reparacao" SET "preco"=NULL WHERE "artigo"='A'`);
  await list.getByTestId("BTN_informacao").click(); await detail.getByRole("tab", { name: "Materiais", exact: true }).click();
  await expect(detail.getByTestId("repair-descriptions-total-diagnostic")).toHaveText("unsupported"); await expect(total).toHaveText("");
});
