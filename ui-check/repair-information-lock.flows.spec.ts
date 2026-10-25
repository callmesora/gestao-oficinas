import { expect, test } from "./support/repair-orders";

for (const caller of ["list", "form"] as const) {
  test(`${caller === "list" ? "SRC-09bc2d45fd" : "SRC-6b343b3c1d"} actual ${caller} Informação refuses a competing order row lock then opens after release without a modal connection`, async ({ page, repairServer, repairDatabase }) => {
    await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao" RESTART IDENTITY;
      INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","recepcao_datahora","recepcao_entrega_prevista","reparacao_estado","reparacao_mecanico","recepcao_servico")
        VALUES (77,10,'AA-00-AA',1,'20261025120000000','20261025','R',2,'Recepção atual')`);
    await page.goto(`${repairServer.origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
    const list = page.getByTestId("WIN_Ordens_Reparacao"); await expect(list.getByTestId("repair-order-read-state")).toHaveText("ready");
    await list.getByTestId("BTN_Nenhum").click(); await list.getByTestId("BTN_Actualizar_Dados").click();
    await list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
    const form = page.getByTestId("WIN_Ordens_Reparacao_Form");
    if (caller === "form") { await list.getByTestId("BTN_Alterar").click(); await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready"); }
    const owner = caller === "form" ? form : list, detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes");
    await repairDatabase.query('BEGIN');
    try {
      await repairDatabase.query('SELECT _row_id FROM app."ordem_reparacao" WHERE "numero"=10 FOR UPDATE');
      await owner.getByTestId("BTN_informacao").click(); const refusal = page.getByTestId("WINDEVMESSAGEBOX");
      await expect(refusal.getByTestId("LIB_INFO")).toHaveText("Ordem de reparação em uso por outro utilizador");
      await expect(detail).toHaveCount(0); await refusal.getByTestId("BTN_OK").click();
    } finally { await repairDatabase.query('ROLLBACK'); }
    await expect(owner.getByTestId("BTN_informacao")).toBeEnabled(); await owner.getByTestId("BTN_informacao").click();
    await detail.getByRole("tab", { name: "Descrições/Observações", exact: true }).click();
    await expect(detail.getByTestId("EDT_servico_avaria")).toHaveValue("Recepção atual");
    // The immediate check must finish before this real modal; no lease or long transaction is inferred.
    await repairDatabase.query(`SET lock_timeout='500ms'; UPDATE app."ordem_reparacao" SET "reparacao_estado_obs"='Concorrente' WHERE "numero"=10; RESET lock_timeout`);
    await detail.getByTestId("BTN_SYST_FERMER").click(); await expect(detail).toHaveCount(0);
    if (caller === "form") { await expect(form).toBeVisible(); await form.getByTestId("BTN_SYST_FERMER").click(); await expect(form).toHaveCount(0); }
    expect((await repairDatabase.query('SELECT "recepcao_servico","reparacao_estado_obs" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ recepcao_servico: "Recepção atual", reparacao_estado_obs: "Concorrente" });
    expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(0);
  });
}
