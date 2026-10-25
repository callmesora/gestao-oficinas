import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/repair-orders";

test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."mecanicos" SET "palavra_passe"='Synthetic'; UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico") VALUES (77,10,'AA-00-AA',1,'R',2)`);
});
async function labor(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click(); const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click(); await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled(); return screen;
}
async function time(page: Page, screen: Locator) {
  await screen.getByTestId("BTN_Tempos").click(); const dialog = page.getByTestId("WIN_Tempos_Reparacao_Tempo");
  await expect(dialog.getByTestId("BTN_NoName1")).toBeEnabled(); return dialog;
}

test("SRC-2d9efea86e SRC-c0cc54232e actual Time cancelled picker reads latest source labor without a mechanic join or a surviving order", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin), dialog = await time(page, screen); await expect(dialog.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Iniciar");
  await dialog.getByTestId("BTN_NoName1").click(); const picker = page.getByTestId("mechanic-picker"); await expect(picker.getByTestId("TABLE_mecanicos")).toContainText("ANA");
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES
    (9007199254740992,10,2,'20261025120000000','20261025125959000'),(9007199254740993,10,2,'20261025130000000','00000000000000000'),(9,10,10,'20261025140000000','20261025150000000');
    DELETE FROM app."mecanicos" WHERE "Codigo"=2; DELETE FROM app."ordem_reparacao" WHERE "numero"=10`);
  await picker.getByTestId("BTN_Fechar").click(); await expect(picker).toHaveCount(0);
  await expect(dialog.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Finalizar"); await expect(dialog.getByTestId("EDT_mecanico")).toHaveValue("ANA");
  await expect(dialog.getByTestId("EDT_matricula_marca_modelo")).toHaveValue("AA-00-AA\nMERCEDES SPRINTER");
  await dialog.getByTestId("BTN_Cancelar").click(); await expect(dialog).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "tempos_reparacaoID"::text,"mecanico","fim" FROM app."tempos_reparacao" WHERE "mecanico"=2 ORDER BY "tempos_reparacaoID"')).rows).toEqual([
    { tempos_reparacaoID: "9007199254740992", mecanico: 2, fim: "20261025125959000" }, { tempos_reparacaoID: "9007199254740993", mecanico: 2, fim: "00000000000000000" },
  ]);
});

test("SRC-2d9efea86e actual Time chosen mechanic uses its own latest source ID above2to53 and completes that labor without reassigning the order", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin);
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES
    (9007199254740992,10,10,'20261025120000000','20261025125959000'),(9007199254740993,10,10,'20261025130000000','00000000000000000')`);
  const dialog = await time(page, screen); await expect(dialog.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Iniciar");
  await dialog.getByTestId("BTN_NoName1").click(); const picker = page.getByTestId("mechanic-picker");
  await picker.getByTestId("TABLE_mecanicos").getByRole("cell", { name: "BRUNO", exact: true }).click(); await picker.getByTestId("BTN_selecionar").click();
  const password = page.getByTestId("WIN_Inserir_quantidade_password"); await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  await expect(dialog.getByTestId("EDT_mecanico")).toHaveValue("BRUNO"); await expect(dialog.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Finalizar");
  await dialog.getByTestId("BTN_Iniciar").click(); await expect(dialog).toHaveCount(0);
  const rows = (await repairDatabase.query('SELECT "tempos_reparacaoID"::text,"mecanico","fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY "tempos_reparacaoID"')).rows;
  expect(rows[0]).toMatchObject({ tempos_reparacaoID: "9007199254740992", mecanico: 10, fim: "20261025125959000" });
  expect(rows[1]).toMatchObject({ tempos_reparacaoID: "9007199254740993", mecanico: 10, fim_reparacao_estado: "R" }); expect(rows[1].fim).toMatch(/^[0-9]{17}$/); expect(rows[1].fim).not.toBe("00000000000000000");
  expect((await repairDatabase.query('SELECT "reparacao_mecanico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_mecanico).toBe(2);
});
