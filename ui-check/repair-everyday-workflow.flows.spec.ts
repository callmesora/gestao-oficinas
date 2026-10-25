import type { Page } from "@playwright/test";
import { expect, test } from "./support/repair-orders";

async function orderList(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const list = page.getByTestId("WIN_Ordens_Reparacao"); await expect(list.getByTestId("repair-order-read-state")).toHaveText("ready");
  await list.getByTestId("BTN_Nenhum").click(); await list.getByTestId("BTN_Actualizar_Dados").click();
  return list;
}

test("SRC-385d90c6c0 SRC-39eeaad136 actual new repair proceeds through materials, work completion and invoice payment with source stock and history", async ({ page, repairServer, repairDatabase }) => {
  test.setTimeout(90000);
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao",app."artigos",app."unidades",app."utilizadores" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."mecanicos" SET "palavra_passe"='Synthetic';
    UPDATE app."estados_reparacao" SET "confirmacao"=false,"pedir_data_entrega"=false,"pedir_data_pag"=false;
    UPDATE app."estados_reparacao" SET "tipo"=2,"Descricao"='Aguarda trabalho',"lancar_material"=true WHERE "Codigo"='R';
    UPDATE app."estados_reparacao" SET "tipo"=3,"Descricao"='Em execução',"lancar_material"=true WHERE "Codigo"='N';
    UPDATE app."estados_reparacao" SET "tipo"=6,"Descricao"='Concluída',"lancar_material"=false WHERE "Codigo"='X';
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","lancar_material","confirmacao","pedir_data_entrega","pedir_data_pag") VALUES (700,'C','Entregue e paga',7,false,false,true,true);
    INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,1,'RECEPÇÃO','SYNTHETIC');
    INSERT INTO app."unidades" ("unidadesID","Codigo","Descricao") VALUES (1,'UN','Unidade');
    INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","codbarras","unidade","preco","stock","inativo") VALUES (1,'OIL','Óleo de revisão','BAR-OIL','UN',12.50,10,false)`);
  await page.clock.setFixedTime(new Date(2026, 9, 25, 10, 0, 0, 0));

  let list = await orderList(page, repairServer.origin); await list.getByTestId("BTN_Novo").click();
  const form = page.getByTestId("WIN_Ordens_Reparacao_Form"); await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready");
  await expect(form.getByTestId("EDT_Ordem_n")).toHaveValue("1");
  await form.getByTestId("EDT_matricula").fill("AA-00-AA"); await form.getByTestId("EDT_KM").click();
  await expect(form.getByTestId("EDT_Marca_Modelo")).toHaveValue("MERCEDES SPRINTER");
  await form.getByTestId("EDT_KM").fill("120000"); await form.getByTestId("COMBO_Recepcionado").selectOption({ label: "RECEPÇÃO" });
  await form.getByTestId("COMBO_mecanico").selectOption({ label: "ANA" });
  await form.getByTestId("COMBO_estado").selectOption({ label: "Aguarda trabalho" });
  await expect(form.getByTestId("BTN_Gravar")).toBeEnabled(); await form.getByTestId("EDT_servico_avaria").fill("Revisão e mudança de óleo");
  await form.getByTestId("BTN_Gravar").click(); await expect(form).toHaveCount(0);
  await expect(list.getByTestId("TABLE_QRY_select_ordens_reparacao")).toContainText("AA-00-AA");
  expect((await repairDatabase.query('SELECT "numero"::text,"reparacao_estado","reparacao_mecanico","recepcao_cliente"::text FROM app."ordem_reparacao"')).rows).toEqual([{ numero: "1", reparacao_estado: "R", reparacao_mecanico: 2, recepcao_cliente: "3" }]);

  await list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "1", exact: true }).click();
  await list.getByTestId("BTN_informacao").click(); const details = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes");
  await details.getByRole("tab", { name: "Materiais", exact: true }).click(); await details.getByTestId("BTN_Material").click();
  const material = page.getByTestId("WIN_Material_reparacao_form"); await expect(material.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA");
  await material.getByTestId("EDT_artigo").fill("BAR-OIL"); await material.getByTestId("EDT_quant").click();
  await expect(material.getByTestId("EDT_artigo")).toHaveValue("OIL"); await material.getByTestId("EDT_quant").fill("2,000");
  await material.getByTestId("BTN_Adicionar").click(); const password = page.getByTestId("WIN_Inserir_quantidade_password");
  await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  await expect(material.getByTestId("TABLE_material")).toContainText("Óleo de revisão");
  await material.getByTestId("BTN_Sair").click(); await expect(material).toHaveCount(0);
  await expect(details.getByTestId("TABLE_materiais")).toContainText("Óleo de revisão");
  await expect(details.getByTestId("STC_total_material")).toHaveText("Extras: 0.00    Total: 25.00    Total c/iva: 30.75");
  await details.getByTestId("BTN_Sair").click(); await expect(details).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=\'OIL\'')).rows[0].stock).toBe("8.000");

  await page.goto(`${repairServer.origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const labor = page.getByTestId("WIN_Tempos_Reparacao"); await labor.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "1", exact: true }).click();
  await labor.getByTestId("BTN_Tempos").click(); const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo");
  await expect(time.getByTestId("BTN_Iniciar")).toBeEnabled(); await time.getByTestId("BTN_Iniciar").click();
  await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  const type = page.getByTestId("WIN_Table_estado_reparacao_tipo3");
  await type.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Em execução", exact: true }).click();
  await type.getByTestId("BTN_selecionar").click(); await expect(time).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "numero"::text,"mecanico","inicio","fim","Inicio_reparacao_estado" FROM app."tempos_reparacao"')).rows).toEqual([{ numero: "1", mecanico: 2, inicio: "20261025100000000", fim: "00000000000000000", Inicio_reparacao_estado: "R" }]);

  await page.clock.setFixedTime(new Date(2026, 9, 25, 10, 30, 0, 0));
  await labor.getByTestId("BTN_Estado").click(); const state = page.getByTestId("WIN_Tempos_Reparacao_Estado");
  await state.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Concluída", exact: true }).click();
  await state.getByTestId("EDT_obs_servico").click(); const keyboard = page.getByTestId("WIN_Teclado_Alfa");
  await keyboard.getByTestId("BTN_apagar_tudo").click(); await page.keyboard.type("servi");
  await keyboard.getByTestId("BTN_c_cedilha").click(); await page.keyboard.type("o conclu");
  await keyboard.getByTestId("BTN_acento_agudo").click(); await keyboard.getByTestId("BTN_i").click(); await page.keyboard.type("do");
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("serviço concluído"); await keyboard.getByTestId("BTN_confirmar").click();
  await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "fim","fim_reparacao_estado" FROM app."tempos_reparacao"')).rows).toEqual([{ fim: "20261025103000000", fim_reparacao_estado: "X" }]);

  list = await orderList(page, repairServer.origin);
  await list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "1", exact: true }).click(); await list.getByTestId("BTN_Alterar").click();
  await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready");
  await form.getByTestId("COMBO_estado").selectOption({ label: "Entregue e paga" }); await expect(form.getByTestId("BTN_Gravar")).toBeEnabled();
  await form.getByTestId("CBOX_faturado").check(); await form.getByTestId("EDT_Nr_Fatura").fill("F2026/001"); await form.getByTestId("EDT_Total_Pago").fill("30,75");
  await form.getByTestId("BTN_Gravar").click(); const date = page.getByTestId("WIN_Data");
  for (const title of ["Data de entrega", "Data de pagamento"]) {
    await expect(date.getByTestId("STC_Data")).toHaveText(title); await date.getByTestId("EDT_Data").fill("25/10/2026"); await date.getByTestId("BTN_Confirmar").click();
  }
  await expect(form).toHaveCount(0);
  const saved = (await repairDatabase.query('SELECT "reparacao_estado","reparacao_mecanico","reparacao_servico","reparacao_estado_historico","faturado","numero_fatura","total_pago"::text,"recepcao_entrega_prevista","data_pagamento" FROM app."ordem_reparacao" WHERE "numero"=1')).rows[0];
  expect(saved).toEqual({ reparacao_estado: "C", reparacao_mecanico: 2, reparacao_servico: "serviço concluído", reparacao_estado_historico: "25/10/2026 10:30    Concluída\r\n", faturado: true, numero_fatura: "F2026/001", total_pago: "30.75", recepcao_entrega_prevista: "20261025", data_pagamento: "20261025" });
  expect((await repairDatabase.query('SELECT "artigo","quantidade"::text,"preco"::text FROM app."material_reparacao" WHERE "numero"=1')).rows).toEqual([{ artigo: "OIL", quantidade: "2.000", preco: "12.50" }]);
  expect((await repairDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=\'OIL\'')).rows[0].stock).toBe("8.000");
});
