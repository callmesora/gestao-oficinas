import type { Page } from "@playwright/test";
import { test, expect } from "./support/repair-orders";

test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_prioridade","reparacao_servico","reparacao_estado_historico","recepcao_datahora","recepcao_entrega_prevista")
      VALUES (77,10,'AA-00-AA',1,'R',2,1,'Trabalho','Histórico original','20261025120000000','20261025')`);
});

async function descriptions(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao");
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click(); await screen.getByTestId("BTN_Actualizar_Dados").click();
  await screen.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await screen.getByTestId("BTN_informacao").click();
  const detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes");
  await expect(detail.getByTestId("BTN_Sair")).toBeEnabled(); return detail;
}

test("source material save replays the actual sorted memory rows before closing", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","artigo","descricao_artigo","quantidade","preco","data_hora","extra","lancado") VALUES
    (1,10,'DUP','Original low',1,2,'20261025120000000',false,false),(2,10,'DUP','Original high',1,3,'20261025120000000',false,false)`);
  const detail = await descriptions(page, repairServer.origin);
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click();
  const material = detail.getByTestId("TABLE_materiais");
  await material.locator("tbody tr").filter({ hasText: "Original low" }).getByRole("checkbox", { name: "Extra DUP", exact: true }).click();
  await material.getByTestId("COL_preco").getByRole("button").first().click();
  await material.getByTestId("COL_preco").getByRole("button").first().click();
  await expect(material.locator("tbody tr").first()).toContainText("Original high");
  await expect(detail.getByTestId("STC_total_material")).toHaveText("Extras: 2.00    Total: 3.00    Total c/iva: 3.69");
  await detail.getByTestId("BTN_Sair").click(); await expect(detail).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "preco"::text,"extra" FROM app."material_reparacao" ORDER BY _row_id')).rows)
    .toEqual([{ preco: "2", extra: true }, { preco: "2", extra: true }]);
});

test("descriptions tab keyboard changes the actual mounted source page and retains material drafts", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","artigo","descricao_artigo","quantidade","preco","data_hora","extra","lancado") VALUES
    (1,10,'A','Material A',2,3,'20261025120000000',false,false)`);
  const detail = await descriptions(page, repairServer.origin), times = detail.getByRole("tab", { name: "Tempos", exact: true });
  await times.focus(); await page.keyboard.press("ArrowRight");
  const materials = detail.getByRole("tab", { name: "Materiais", exact: true });
  await expect(materials).toBeFocused(); await expect(materials).toHaveAttribute("aria-selected", "true");
  await detail.getByRole("checkbox", { name: "Extra A", exact: true }).click();
  await materials.focus(); await page.keyboard.press("End");
  await expect(detail.getByRole("tab", { name: "Histórico dos estados", exact: true })).toBeFocused();
  await expect(detail.getByTestId("EDT_historico_estado")).toHaveValue("Histórico original");
  await page.keyboard.press("Home"); await expect(times).toBeFocused();
  await page.keyboard.press("ArrowRight"); await expect(detail.getByRole("checkbox", { name: "Extra A", exact: true })).toBeChecked();
  expect(await detail.getByRole("tab").evaluateAll(tabs => tabs.filter(tab => tab.getAttribute("tabindex") === "0").length)).toBe(1);
  // The safe chrome close deliberately does not run Sair writes.
  await detail.getByTestId("BTN_SYST_FERMER").click();
  expect((await repairDatabase.query('SELECT "extra" FROM app."material_reparacao"')).rows[0].extra).toBe(false);
});

test("labor state colors retain their actual qualified source shape and dimensions", async ({ page, repairServer }) => {
  await page.goto(`${repairServer.origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  const color = screen.getByTestId("TABLE_tempos_reparacao").getByTestId("SHA_cor");
  await expect(color).toHaveAttribute("data-control-path", "TABLE_tempos_reparacao.COL_imagem.SHA_cor");
  await expect(color).toHaveCSS("width", "18px"); await expect(color).toHaveCSS("height", "18px");
  await expect(color).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await screen.getByTestId("BTN_Estado").click();
  const state = page.getByTestId("WIN_Tempos_Reparacao_Estado");
  const selected = state.getByTestId("TABLE_Estados_reparacao").locator('tr[aria-selected="true"]').getByTestId("SHA_cor");
  await expect(selected).toHaveAttribute("data-control-path", "TABLE_Estados_reparacao.COL_imagem.SHA_cor");
  await expect(selected).toHaveCSS("width", "18px"); await expect(selected).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await state.getByTestId("BTN_Cancelar").click();
});
