import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/repair-orders";

test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."mecanicos" SET "palavra_passe"='Synthetic';
    UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_servico")
      VALUES (77,10,'AA-00-AA',1,'R',2,'Recepção original')`);
});
async function labor(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled(); return screen;
}
async function choose(page: Page, time: Locator, description: string) {
  await time.getByTestId("BTN_NoName1").click(); const picker = page.getByTestId("mechanic-picker");
  await picker.getByTestId("TABLE_mecanicos").getByRole("cell", { name: description, exact: true }).click();
  await picker.getByTestId("BTN_selecionar").click(); await expect(picker).toHaveCount(0);
}

test("SRC-a6d0145e4a actual Time initialization reads the current mechanic name instead of the opening parent cache", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin);
  await repairDatabase.query(`UPDATE app."mecanicos" SET "Descricao"='ANA atual' WHERE "Codigo"=2`);
  await screen.getByTestId("BTN_Tempos").click(); const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo");
  await expect(time.getByTestId("EDT_mecanico")).toHaveValue("ANA atual");
  await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Iniciar");
  await time.getByTestId("BTN_Cancelar").click(); await expect(time).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "Descricao" FROM app."mecanicos" WHERE "Codigo"=2')).rows[0].Descricao).toBe("ANA atual");
});

test("SRC-c0cc54232e actual Time picker and password cancellation requery the original mechanic latest labor caption without changing its identity or writing", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Tempos").click();
  const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Iniciar");
  await time.getByTestId("BTN_NoName1").click(); const picker = page.getByTestId("mechanic-picker"); await expect(picker.getByTestId("TABLE_mecanicos")).toContainText("ANA");
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (1,10,2,'20261025120000000','00000000000000000')`);
  await picker.getByTestId("BTN_Fechar").click(); await expect(picker).toHaveCount(0);
  await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Finalizar"); await expect(time.getByTestId("EDT_mecanico")).toHaveValue("ANA");
  await choose(page, time, "BRUNO"); const password = page.getByTestId("WIN_Inserir_quantidade_password"); await expect(password).toBeVisible();
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (2,10,2,'20261025130000000','20261025140000000');
    UPDATE app."Viaturas" SET "marca"='MARCA concorrente' WHERE "matricula"='AA-00-AA'`);
  await password.getByTestId("BTN_Cancelar").click(); await expect(password).toHaveCount(0);
  await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Iniciar"); await expect(time.getByTestId("EDT_mecanico")).toHaveValue("ANA");
  await expect(time.getByTestId("EDT_matricula_marca_modelo")).toHaveValue("AA-00-AA\nMERCEDES SPRINTER");
  await time.getByTestId("BTN_Cancelar").click();
  expect((await repairDatabase.query('SELECT "mecanico","fim" FROM app."tempos_reparacao" ORDER BY "tempos_reparacaoID"')).rows).toEqual([{ mecanico: 2, fim: "00000000000000000" }, { mecanico: 2, fim: "20261025140000000" }]);
});

test("SRC-c0cc54232e actual authenticated mechanic re-selection refreshes its current name and caption without another password while incorrect password returns before caption refresh", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin);
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (1,10,2,'20261025120000000','00000000000000000')`);
  await screen.getByTestId("BTN_Tempos").click(); const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Finalizar");
  await choose(page, time, "ANA"); const password = page.getByTestId("WIN_Inserir_quantidade_password");
  await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click(); await expect(password).toHaveCount(0); await expect(time.getByTestId("BTN_NoName1")).toBeEnabled();
  await repairDatabase.query(`UPDATE app."mecanicos" SET "Descricao"='ANA renovada' WHERE "Codigo"=2;
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (2,10,2,'20261025130000000','20261025140000000')`);
  await choose(page, time, "ANA renovada"); await expect(time.getByTestId("EDT_mecanico")).toHaveValue("ANA renovada");
  await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Iniciar"); await expect(password).toHaveCount(0);
  await choose(page, time, "BRUNO"); await password.getByTestId("EDT_password").fill("incorrect");
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (3,10,2,'20261025150000000','00000000000000000')`);
  await password.getByTestId("BTN_Confirmar").click(); const info = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(info.getByTestId("LIB_INFO")).toHaveText("Palavra-passe incorreta"); await expect(time.getByTestId("BTN_NoName1")).toBeDisabled();
  await info.getByTestId("BTN_OK").click(); await expect(time.getByTestId("BTN_NoName1")).toBeEnabled();
  await expect(time.getByTestId("EDT_mecanico")).toHaveValue("ANA renovada"); await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Iniciar");
  await time.getByTestId("BTN_Cancelar").click(); expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(3);
});
