import { expect, test } from "./support/repair-orders";

test("SRC-39eeaad136 actual other-order consent occurs once per raw open time and commits after both source prompts", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959'; UPDATE app."mecanicos" SET "palavra_passe"='Synthetic';
    UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico") VALUES
      (77,10,'AA-00-AA',1,'R',2),(78,20,'BB-00-BB',2,'R',2)`);
  await page.goto(`${repairServer.origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click(); const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click(); await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled();
  await screen.getByTestId("BTN_Tempos").click(); const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await expect(time.getByTestId("BTN_Iniciar")).toBeEnabled();
  // Two raw open times intentionally remain two source prompts for one real order.
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES
    (1,20,2,'20261025120000000','00000000000000000'),(2,20,2,'20261025130000000','00000000000000000')`);
  await time.getByTestId("BTN_Iniciar").click(); const password = page.getByTestId("WIN_Inserir_quantidade_password");
  await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  const prompt = page.getByTestId("WINDEVMESSAGEBOX");
  for (let index = 0; index < 2; index++) {
    await expect(prompt.getByTestId("LIB_INFO")).toHaveText("Terminar a reparação de BB-00-BB ?");
    await prompt.getByRole("button", { name: "Sim", exact: true }).click();
  }
  await expect(time).toHaveCount(0);
  const rows = (await repairDatabase.query('SELECT "numero"::text,"mecanico","fim","Inicio_reparacao_estado","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY "tempos_reparacaoID"')).rows;
  expect(rows).toHaveLength(3);
  for (const row of rows.slice(0, 2)) { expect(row).toMatchObject({ numero: "20", mecanico: 2, fim_reparacao_estado: "R" }); expect(row.fim).toMatch(/^[0-9]{17}$/); expect(row.fim).not.toBe("00000000000000000"); }
  expect(rows[2]).toMatchObject({ numero: "10", mecanico: 2, fim: "00000000000000000", Inicio_reparacao_estado: "R" });
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."ordem_reparacao" WHERE "numero"=20')).rows[0].count).toBe(1);
});
