import type { Page } from "@playwright/test";
import { test, expect } from "./support/repair-orders";

test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."mecanicos" SET "palavra_passe"='Synthetic';
    UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_prioridade","reparacao_servico","reparacao_estado_historico")
      VALUES (77,10,'AA-00-AA',1,'R',2,1,'Trabalho','Histórico original')`);
});

async function labor(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled(); return screen;
}

test("SRC-fafcfa6be8 actual Estado caller refuses cached type2, then refreshes and restores the valid row after cancellation", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query('UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"=$1', ["R"]);
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao");
  await screen.getByTestId("BTN_Estado").click(); const message = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(message.getByTestId("LIB_INFO")).toHaveText("A reparação está a espera do início");
  await expect(page.getByTestId("WIN_Tempos_Reparacao_Estado")).toHaveCount(0); await message.getByTestId("BTN_OK").click();
  await repairDatabase.query('UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"=$1', ["R"]);
  await screen.getByTestId("BTN_todos").click(); await expect(screen.getByTestId("BTN_Estado")).toBeEnabled();
  await screen.getByTestId("BTN_Estado").click(); const state = page.getByTestId("WIN_Tempos_Reparacao_Estado");
  await expect(state.getByTestId("EDT_obs_servico")).toHaveValue("Trabalho");
  await repairDatabase.query('UPDATE app."ordem_reparacao" SET "recepcao_prioridade"=2 WHERE "numero"=10');
  await state.getByTestId("BTN_Cancelar").click(); await expect(state).toHaveCount(0);
  await expect(table.locator('tr[aria-selected="true"]')).toContainText("10"); await expect(table).toContainText("Elevada");
  expect((await repairDatabase.query('SELECT "reparacao_estado","reparacao_servico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ reparacao_estado: "R", reparacao_servico: "Trabalho" });
});

test("SRC-fafcfa6be8 actual Estado return reapplies selected mechanic and restores saved index plus its real labor child query", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor") VALUES (700,'Z7','Fechado fora do filtro',7,0);
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_prioridade","reparacao_servico","reparacao_estado_historico") VALUES
      (80,20,'AA-00-AA',1,'R',2,1,'Serviço20',''),(81,30,'AA-00-AA',1,'R',2,1,'Serviço30',''),(82,40,'BB-00-BB',2,'R',10,1,'Serviço40','');
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (1,30,10,'20261025120000000','00000000000000000')`);
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao");
  await screen.getByTestId("LIST_mecanicos").selectOption("2"); await expect(table.locator("tbody tr")).toHaveCount(3);
  await table.getByRole("cell", { name: "20", exact: true }).click(); await screen.getByTestId("BTN_Estado").click();
  const state = page.getByTestId("WIN_Tempos_Reparacao_Estado"); await state.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Fechado fora do filtro", exact: true }).click();
  await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  await expect(table.locator("tbody tr")).toHaveCount(2); await expect(table.locator('tr[aria-selected="true"]')).toContainText("30");
  await expect(screen.getByTestId("STC_filtro_atual")).toHaveText("ANA"); await expect(screen.getByTestId("LIST_mecanicos")).toHaveValue("2");
  await expect(screen.getByTestId("TABLE_tempos_reparacao_ordem")).toContainText("BRUNO");
  expect((await repairDatabase.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=20')).rows[0].reparacao_estado).toBe("Z7");
});
