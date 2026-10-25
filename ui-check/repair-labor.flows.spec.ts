import type { Page } from "@playwright/test";
import { test, expect } from "./support/repair-orders";

test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao",app."artigos" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"Tempo_materiais"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."mecanicos" SET "palavra_passe"='Synthetic';
    UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_prioridade","recepcao_servico","recepcao_obs","reparacao_servico","reparacao_estado_historico","recepcao_datahora","recepcao_entrega_prevista")
      VALUES (77,10,'AA-00-AA',1,'R',2,1,'Serviço original','Observação original','Trabalho','Histórico original','20240229120000000','20240301');
    INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","stock","preco") VALUES (1,'A','Artigo',10,1.25);
    INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","preco","data_hora","reparacao_estado","lancado","extra")
      VALUES (1,10,2,'A','Material original',2,1.25,'20240229123456000','R',FALSE,FALSE)`);
});

async function labor(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled(); return screen;
}

test("MIG10 actual repair Information tabs open the real material editor and commit stock and material flags", async ({ page, repairServer, repairDatabase }) => {
  await page.goto(`${repairServer.origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao"); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click(); await screen.getByTestId("BTN_Actualizar_Dados").click();
  await screen.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await screen.getByTestId("BTN_informacao").click(); const detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes");
  await expect(detail.getByRole("tab")).toHaveCount(4); await detail.getByRole("tab", { name: "Descrições/Observações", exact: true }).click();
  await expect(detail.getByTestId("EDT_servico_avaria")).toHaveValue("Serviço original");
  await detail.getByRole("tab", { name: "Histórico dos estados", exact: true }).click(); await expect(detail.getByTestId("EDT_historico_estado")).toHaveValue("Histórico original");
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click(); await detail.getByTestId("BTN_Material").click();
  const material = page.getByTestId("WIN_Material_reparacao_form");
  await material.getByTestId("TABLE_material").getByRole("cell", { name: "Material original", exact: true }).click();
  await material.getByTestId("BTN_Quantidade").click(); const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await prompt.getByTestId("EDT_quantidade").fill("3,000"); await prompt.getByTestId("BTN_Confirmar").click();
  await material.getByTestId("BTN_Sair").click(); await expect(material).toHaveCount(0);
  await expect(detail.getByTestId("TABLE_materiais")).toContainText("3.000");
  await detail.getByRole("checkbox", { name: "Extra A", exact: true }).click(); await detail.getByTestId("BTN_Sair").click(); await expect(detail).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock).toBe("9.000");
  expect((await repairDatabase.query('SELECT "extra" FROM app."material_reparacao"')).rows[0].extra).toBe(true);
});

test("MIG10 actual labor list information and state dialog save the selected state and history", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Informacao").click();
  const information = page.getByTestId("WIN_Tempos_Reparacao_Informacao"); await expect(information.getByTestId("EDT_observacao")).toHaveValue("Observação original");
  await information.getByTestId("BTN_Fechar").click(); await screen.getByTestId("BTN_Estado").click(); const state = page.getByTestId("WIN_Tempos_Reparacao_Estado");
  await expect(state.getByTestId("EDT_Data_Hora__calendar")).toHaveCount(0);
  await state.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Sem predefinição", exact: true }).click();
  await state.getByTestId("EDT_descricao").fill("Estado de teste"); await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  const row = (await repairDatabase.query('SELECT "reparacao_estado","reparacao_estado_historico" FROM app."ordem_reparacao"')).rows[0];
  expect(row.reparacao_estado).toBe("N"); expect(row.reparacao_estado_historico).toContain("Estado de teste");
});

test("MIG10 actual time password/state picker starts then stops labor using the source zero17 sentinel", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query('UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"=$1', ["R"]);
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Tempos").click();
  const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await time.getByTestId("BTN_Iniciar").click();
  const password = page.getByTestId("WIN_Inserir_quantidade_password"); await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  const picker = page.getByTestId("WIN_Table_estado_reparacao_tipo3"); await picker.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Sem predefinição", exact: true }).click();
  await picker.getByTestId("BTN_selecionar").click(); await expect(time).toHaveCount(0);
  const started = (await repairDatabase.query('SELECT "fim","Inicio_reparacao_estado" FROM app."tempos_reparacao"')).rows;
  expect(started).toEqual([{ fim: "00000000000000000", Inicio_reparacao_estado: "R" }]);
  await screen.getByTestId("BTN_Tempos").click(); await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Finalizar");
  await time.getByTestId("BTN_Iniciar").click(); await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click(); await expect(time).toHaveCount(0);
  const finished = (await repairDatabase.query('SELECT "fim","fim_reparacao_estado" FROM app."tempos_reparacao"')).rows[0];
  expect(finished.fim).toMatch(/^[0-9]{17}$/); expect(finished.fim).not.toBe("00000000000000000"); expect(finished.fim_reparacao_estado).toBe("N");
});
