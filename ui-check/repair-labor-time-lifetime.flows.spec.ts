import { expect, test } from "./support/repair-orders";

test("SRC-5c0c820a2e SRC-a6d0145e4a actual Time captures selected-labor mechanic at Open while a real pending parent refresh clears its selection", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959'; UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico") VALUES (77,10,'AA-00-AA',1,'R',2)`);
  await page.goto(`${repairServer.origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click(); const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click(); await expect(screen.getByTestId("BTN_todos")).toBeEnabled();
  // Insert after source startup's old-labor closure, then use its real explicit refresh.
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (1,10,10,'20261025120000000','00000000000000000')`);
  await screen.getByTestId("BTN_todos").click(); const children = screen.getByTestId("TABLE_tempos_reparacao_ordem");
  await children.getByRole("cell", { name: "BRUNO", exact: true }).click(); await expect(children.locator('tr[aria-selected="true"]')).toContainText("BRUNO");
  let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; }); let pending = false, holdNext = true;
  await page.route("**/api/repair-labor/read", async route => {
    if (!holdNext) { await route.continue(); return; }
    holdNext = false; const response = await route.fetch(); pending = true; await gate; await route.fulfill({ response });
  });
  try {
    await screen.getByTestId("BTN_todos").click(); await expect.poll(() => pending).toBe(true); await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled();
    await screen.getByTestId("BTN_Tempos").click(); const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo");
    await expect(time.getByTestId("EDT_mecanico")).toHaveValue("BRUNO"); await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Finalizar");
    release(); await expect(children.locator('tr[aria-selected="true"]')).toHaveCount(0);
    // Settle the actual parent response and any effect-driven follow-on requests.
    await page.waitForLoadState("networkidle");
    await expect(time.getByTestId("EDT_mecanico")).toHaveValue("BRUNO"); await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Finalizar");
    await time.getByTestId("BTN_Cancelar").click(); await expect(time).toHaveCount(0);
    expect((await repairDatabase.query('SELECT "mecanico","fim" FROM app."tempos_reparacao"')).rows).toEqual([{ mecanico: 10, fim: "00000000000000000" }]);
    expect((await repairDatabase.query('SELECT "reparacao_mecanico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_mecanico).toBe(2);
  } finally { release(); await page.unroute("**/api/repair-labor/read"); }
});
