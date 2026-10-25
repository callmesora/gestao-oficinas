import { expect, test } from "./support/repair-orders";

test("SRC-7810f8745a actual tipo3 query opens current choices independently of an order removed after prepare and cancellation writes no labor", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."mecanicos" SET "palavra_passe"='Synthetic'; UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico") VALUES (77,10,'AA-00-AA',1,'R',2)`);
  await page.goto(`${repairServer.origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao"); await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled(); await screen.getByTestId("BTN_Tempos").click();
  const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await expect(time.getByTestId("BTN_Iniciar")).toBeEnabled();
  let prepared = false;
  await page.route("**/api/repair-labor/prepare", async route => {
    // Forward the real authenticated request. Only delay delivery of its real response.
    const response = await route.fetch(); const body = await response.json(); expect(body.kind).toBe("prepared");
    await repairDatabase.query(`DELETE FROM app."ordem_reparacao" WHERE "numero"=10;
      INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo") VALUES (710,'LIVE','Escolha atual independente',4)`);
    prepared = true; await route.fulfill({ response });
  });
  await time.getByTestId("BTN_Iniciar").click(); const password = page.getByTestId("WIN_Inserir_quantidade_password");
  await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  const picker = page.getByTestId("WIN_Table_estado_reparacao_tipo3");
  await expect(picker.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Escolha atual independente", exact: true })).toBeVisible(); expect(prepared).toBe(true);
  await expect(picker.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Sem predefinição", exact: true })).toBeVisible();
  await picker.getByTestId("BTN_Cancelar").click(); await expect(picker).toHaveCount(0); await expect(time.getByTestId("BTN_Cancelar")).toBeEnabled();
  await expect(time.getByTestId("EDT_matricula_marca_modelo")).toHaveValue("AA-00-AA\nMERCEDES SPRINTER");
  await time.getByTestId("BTN_Cancelar").click(); await expect(time).toHaveCount(0);
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].count).toBe(0);
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(0);
});
