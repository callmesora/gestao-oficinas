import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/repair-orders";

const formId = "WIN_Ordens_Reparacao_Form";
const post = (page: Page, action: string) => page.waitForResponse(response => response.request().method() === "POST" && response.url().endsWith(`/api/repair-orders/${action}`));
const mainTable = "TABLE_QRY_select_ordens_reparacao";

// Every row is synthetic and written only to this test's disposable PostgreSQL database.
test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao",app."utilizadores" RESTART IDENTITY;
    INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,1,'RECEPÇÃO','SYNTHETIC-ONLY'),(2,2,'SEGUNDO','OTHER-SYNTHETIC');
    UPDATE app."Clientes" SET "Telefone1"=' 210  ',"Telemovel"=' 910 ' WHERE "Codigo"=3;
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","km_viatura","recepcao_util","recepcao_datahora","recepcao_cliente","recepcao_terceiro","recepacao_contatos","recepcao_servico","recepcao_obs","recepcao_entrega_prevista","recepcao_prioridade","reparacao_mecanico","reparacao_estado","faturado","total_pago","numero_fatura","data_pagamento","Estados_reparacaoID","reparacao_estado_obs","reparacao_servico","reparacao_estado_data","reparacao_estado_historico","totaL_mao_obra","total_pecas","total_desconto","total_reparacao") VALUES
    (77,10,'AA-00-AA',9007199254740993,1,'2024-02-29 12:34:56.789',1,2,E'  guardado\\r\\ncontacto  ',E'Serviço\\r\\noriginal  ',NULL,'20240301',1,2,'R',NULL,NULL,' NF original ',NULL,9007199254740993,'obs estado','trabalho','data opaca','histórico',1.125,2.0001,-0.25,2.8751),
    (78,11,'BB-00-BB',50,1,'20240229120000000',2,1,'contacto','Outro serviço','obs','20240301',2,10,'X',false,0,'','',0,'','','','',0,0,0,0)`);
});

async function openList(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-orders`);
  await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao");
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click();
  const read = post(page, "list"); await screen.getByTestId("BTN_Actualizar_Dados").click(); await read;
  await expect(screen.getByTestId(mainTable).locator("tbody tr")).toHaveCount(2);
  return screen;
}
async function edit(page: Page, screen: Locator, numero = "10") {
  await screen.getByTestId(mainTable).getByRole("row").filter({ has: page.getByRole("cell", { name: numero, exact: true }) }).click();
  await screen.getByTestId("BTN_Alterar").click();
  const form = page.getByTestId(formId);
  await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready");
  return form;
}
async function info(page: Page, text: string) {
  const message = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(message.getByTestId("LIB_INFO")).toHaveText(text);
  return message;
}
async function selectState(page: Page, form: Locator, label: string, confirmPrefix?: string) {
  const response = post(page, "check-state-change");
  await form.getByTestId("COMBO_estado").selectOption({ label }); await response;
  if (confirmPrefix !== undefined) {
    const confirmation = page.getByTestId("WIN_Mudar_Estado");
    await expect(confirmation).toBeVisible(); await confirmation.getByTestId("EDT_Letra").fill(confirmPrefix);
    await confirmation.getByTestId("BTN_Confirmar").click(); await expect(confirmation).toHaveCount(0);
  }
  await expect(form.getByTestId("BTN_Gravar")).toBeEnabled();
}

test("SRC-d0b8d7715c SRC-107f49bb66 actual repair caller awaits invalid-prefix Info then accepts the unchanged valid letter and saves state", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen), combo = form.getByTestId("COMBO_estado");
  await combo.press("Alt+ArrowDown"); await combo.press("Escape");
  const checked = post(page, "check-state-change"); await combo.selectOption({ label: "Concluído" }); await checked;
  const confirmation = page.getByTestId("WIN_Mudar_Estado"); await expect(confirmation.getByTestId("STC_Titulo")).toHaveText("Mudar estado da reparação para 'Concluído'?");
  await confirmation.getByTestId("EDT_Letra").fill("z"); await confirmation.getByTestId("BTN_Confirmar").click();
  const message = await info(page, "Verifique o carater de validação"); await expect(confirmation.getByTestId("BTN_Confirmar")).toBeDisabled();
  await message.getByTestId("BTN_OK").click(); await expect(confirmation.getByTestId("EDT_Letra")).toHaveValue("z");
  await confirmation.getByTestId("EDT_Letra").fill("c"); await confirmation.getByTestId("BTN_Confirmar").click(); await expect(confirmation).toHaveCount(0);
  await expect(combo.locator("option:checked")).toHaveText("Concluído");
  expect((await repairDatabase.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_estado).toBe("R");
  await form.getByTestId("BTN_Gravar").click(); const date = page.getByTestId("WIN_Data"); await expect(date.getByTestId("STC_Data")).toHaveText("Data de pagamento");
  await date.getByTestId("EDT_Data").press("Escape"); await expect(form).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "reparacao_estado","data_pagamento" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ reparacao_estado: "X", data_pagamento: null });
});

test("SRC-f238b5fac8 actual repair delivery and payment Date cancellation restores each original after edits and continues the same save", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen);
  await selectState(page, form, "Sem predefinição", "s");
  await form.getByTestId("BTN_Gravar").click(); const date = page.getByTestId("WIN_Data");
  await expect(date.getByTestId("STC_Data")).toHaveText("Data de entrega"); await expect(date.getByTestId("EDT_Data")).toHaveValue("01/03/2024");
  await date.getByTestId("EDT_Data").fill("31/12/2030"); await date.getByTestId("EDT_Data").press("Escape");
  await expect(date.getByTestId("STC_Data")).toHaveText("Data de pagamento"); await expect(date.getByTestId("EDT_Data")).toHaveValue("");
  await expect(form.getByTestId("EDT_data_entrega")).toHaveValue("01/03/2024");
  await date.getByTestId("EDT_Data").fill("29/02/2028"); await date.getByTestId("EDT_Data").press("Escape"); await expect(form).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "reparacao_estado","recepcao_entrega_prevista","data_pagamento" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ reparacao_estado: "N", recepcao_entrega_prevista: "20240301", data_pagamento: null });
});

test("SRC-3b91d48432 SRC-e3d1e3ce67 SRC-3318d47225 actual byte picker cancellation preserves origins and invoice toggle preserves its value", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen);
  await form.getByTestId("BTN_VISION2").click(); const mechanic = page.getByTestId("mechanic-picker");
  await expect(mechanic.getByTestId("TABLE_mecanicos")).toContainText("ANA");
  await mechanic.getByTestId("TABLE_mecanicos").getByRole("cell", { name: "BRUNO", exact: true }).click();
  await expect(mechanic.getByTestId("TABLE_mecanicos").locator('tr[aria-selected="true"]')).toContainText("BRUNO");
  await mechanic.getByTestId("BTN_Fechar").click(); await expect(mechanic).toHaveCount(0);
  await expect(form.getByTestId("COMBO_mecanico").locator("option:checked")).toHaveText("ANA");
  await form.getByTestId("BTN_VISION3").click(); const user = page.getByTestId("user-picker");
  await expect(user.getByTestId("TABLE_utilizadores")).toContainText("RECEPÇÃO");
  await user.getByTestId("TABLE_utilizadores").getByRole("cell", { name: "SEGUNDO", exact: true }).click();
  await expect(user.getByTestId("TABLE_utilizadores").locator('tr[aria-selected="true"]')).toContainText("SEGUNDO");
  await user.getByTestId("BTN_Fechar").click(); await expect(user).toHaveCount(0);
  await expect(form.getByTestId("COMBO_Recepcionado").locator("option:checked")).toHaveText("RECEPÇÃO");
  await form.getByTestId("CBOX_faturado").check(); await form.getByTestId("CBOX_faturado").uncheck(); await expect(form.getByTestId("EDT_Nr_Fatura")).toBeHidden();
  await form.getByTestId("CBOX_faturado").check(); await expect(form.getByTestId("EDT_Nr_Fatura")).toBeVisible(); await expect(form.getByTestId("EDT_Nr_Fatura")).toHaveValue(" NF original ");
  expect((await repairDatabase.query('SELECT "reparacao_mecanico","recepcao_util","faturado","numero_fatura" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ reparacao_mecanico: 2, recepcao_util: 1, faturado: null, numero_fatura: " NF original " });
});
