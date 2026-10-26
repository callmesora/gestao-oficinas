import { expect, test } from "./support/repair-orders";

test("SRC-ed637cd256 actual Estado captures SysDateTime after its real initialization read and persists that date through Confirm", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","reparacao_estado_historico","reparacao_servico")
      VALUES (77,10,'AA-00-AA',1,'R',2,'','Serviço original')`);
  // Only the workstation clock changes; requests and source records remain real.
  await page.clock.setFixedTime(new Date(2026, 9, 25, 23, 59, 50, 123));
  await page.goto(`${repairServer.origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await page.waitForLoadState("networkidle");
  await expect(screen.getByTestId("BTN_Estado")).toBeEnabled();
  let initialized = false, releaseInitialRead: () => void = () => {};
  let readFetched: () => void = () => {};
  const held = new Promise<void>(resolve => { releaseInitialRead = resolve; });
  const fetched = new Promise<void>(resolve => { readFetched = resolve; });
  await page.route("**/api/repair-labor/read", async route => {
    const response = await route.fetch(); expect((await response.json()).kind).toBe("loaded");
    readFetched(); await held;
    await page.clock.setFixedTime(new Date(2026, 9, 26, 0, 1, 2, 345)); initialized = true;
    await route.fulfill({ response });
  });
  await screen.getByTestId("BTN_Estado").click(); const state = page.getByTestId("WIN_Tempos_Reparacao_Estado");
  await fetched;
  try {
    for (const name of ["EDT_Data_Hora", "EDT_descricao", "EDT_obs_servico", "BTN_NoName1", "BTN_Confirmar"]) await expect(state.getByTestId(name)).toBeDisabled();
  } finally { releaseInitialRead(); }
  await expect(state.getByTestId("EDT_Data_Hora")).toHaveValue("26/10/2026 00:01"); expect(initialized).toBe(true);
  await expect(state.getByTestId("EDT_obs_servico")).toHaveValue("Serviço original");
  await page.unroute("**/api/repair-labor/read");
  await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  const saved = (await repairDatabase.query('SELECT "reparacao_estado_data","reparacao_estado_historico","reparacao_servico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0];
  expect(saved).toEqual({ reparacao_estado_data: "20261026000102345", reparacao_estado_historico: "26/10/2026 00:01    Em reparação\r\n", reparacao_servico: "Serviço original" });
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(0);
});
