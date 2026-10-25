import type { Page } from "@playwright/test";
import { expect, test } from "./support/repair-orders";

test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao" RESTART IDENTITY;
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","recepcao_datahora","recepcao_entrega_prevista","reparacao_estado","reparacao_mecanico","recepcao_servico")
      VALUES (77,10,'AA-00-AA',1,'20261025120000000','20261025','R',2,'Recepção inicial');
    INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","artigo","descricao_artigo","quantidade","preco","data_hora","extra","lancado")
      VALUES (1,10,'A','Material inicial',2,1,'20261025120000000',false,false)`);
});
async function details(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const list = page.getByTestId("WIN_Ordens_Reparacao"); await expect(list.getByTestId("repair-order-read-state")).toHaveText("ready");
  await list.getByTestId("BTN_Nenhum").click(); await list.getByTestId("BTN_Actualizar_Dados").click();
  await list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await list.getByTestId("BTN_informacao").click(); const detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes");
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click(); await expect(detail.getByTestId("TABLE_materiais")).toContainText("Material inicial");
  return detail;
}
const materialCheck = (page: Page) => page.waitForResponse(response => response.request().method() === "POST" && response.url().endsWith("/api/repair-labor/check-materials"));

test("SRC-0f2fcff124 actual details Material checks the current order state and awaits exact false-flag Info before opening", async ({ page, repairServer, repairDatabase }) => {
  const detail = await details(page, repairServer.origin);
  await detail.getByRole("checkbox", { name: "Extra A", exact: true }).click();
  // The opening order/state was R/true. Re-read the actual current state before Open.
  await repairDatabase.query(`UPDATE app."ordem_reparacao" SET "reparacao_estado"='X' WHERE "numero"=10`);
  await detail.getByTestId("BTN_Material").click(); const info = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(info.getByTestId("LIB_INFO")).toHaveText("Não pode ser inserido material nesta ordem de reparação");
  await expect(detail.getByTestId("BTN_Material")).toBeDisabled(); await expect(page.getByTestId("WIN_Material_reparacao_form")).toHaveCount(0);
  await info.getByTestId("BTN_OK").click(); await expect(detail.getByTestId("BTN_Material")).toBeEnabled();
  await expect(detail.getByRole("checkbox", { name: "Extra A", exact: true })).toBeChecked();
  expect((await repairDatabase.query('SELECT "extra","quantidade"::text FROM app."material_reparacao" WHERE "artigo"=$1', ["A"])).rows[0]).toEqual({ extra: false, quantidade: "2" });
  await repairDatabase.query(`UPDATE app."estados_reparacao" SET "lancar_material"=true WHERE "Codigo"='X'`);
  const checked = materialCheck(page); await detail.getByTestId("BTN_Material").click(); expect((await (await checked).json()).kind).toBe("ready");
  const child = page.getByTestId("WIN_Material_reparacao_form"); await expect(child.getByTestId("TABLE_material")).toContainText("Material inicial");
  await child.getByTestId("BTN_Sair").click(); await expect(child).toHaveCount(0); await expect(detail.getByTestId("BTN_Material")).toBeEnabled();
});

test("SRC-0f2fcff124 ADR002 actual details Material keeps NULL distinct from false and opens true or NULL states without normalizing stored flags", async ({ page, repairServer, repairDatabase }) => {
  const detail = await details(page, repairServer.origin);
  for (const flag of [null, true]) {
    await repairDatabase.query('UPDATE app."estados_reparacao" SET "lancar_material"=$1 WHERE "Codigo"=$2', [flag, "R"]);
    const checked = materialCheck(page); await detail.getByTestId("BTN_Material").click(); expect((await (await checked).json()).kind).toBe("ready");
    const child = page.getByTestId("WIN_Material_reparacao_form"); await expect(child.getByTestId("TABLE_material")).toContainText("Material inicial");
    await child.getByTestId("BTN_Sair").click(); await expect(child).toHaveCount(0); await expect(detail.getByTestId("BTN_Material")).toBeEnabled();
    expect((await repairDatabase.query('SELECT "lancar_material" FROM app."estados_reparacao" WHERE "Codigo"=$1', ["R"])).rows[0].lancar_material).toBe(flag);
  }
});

test("SRC-0f2fcff124 ADR006 actual details Material refuses a competing order row lock then opens after release without retaining a connection through the modal", async ({ page, repairServer, repairDatabase }) => {
  const detail = await details(page, repairServer.origin);
  await repairDatabase.query('BEGIN');
  try {
    await repairDatabase.query('SELECT _row_id FROM app."ordem_reparacao" WHERE "numero"=10 FOR UPDATE');
    await detail.getByTestId("BTN_Material").click(); const info = page.getByTestId("WINDEVMESSAGEBOX");
    await expect(info.getByTestId("LIB_INFO")).toHaveText("Ordem de reparação em uso por outro utilizador");
    await expect(page.getByTestId("WIN_Material_reparacao_form")).toHaveCount(0); await info.getByTestId("BTN_OK").click();
  } finally { await repairDatabase.query('ROLLBACK'); }
  const checked = materialCheck(page); await detail.getByTestId("BTN_Material").click(); expect((await (await checked).json()).kind).toBe("ready");
  const child = page.getByTestId("WIN_Material_reparacao_form"); await expect(child.getByTestId("TABLE_material")).toContainText("Material inicial");
  await repairDatabase.query(`SET lock_timeout='500ms'; UPDATE app."ordem_reparacao" SET "recepcao_servico"='Concorrente' WHERE "numero"=10; RESET lock_timeout`);
  await child.getByTestId("BTN_Sair").click(); await expect(child).toHaveCount(0); await expect(detail.getByTestId("BTN_Material")).toBeEnabled();
  await detail.getByRole("tab", { name: "Descrições/Observações", exact: true }).click(); await expect(detail.getByTestId("EDT_servico_avaria")).toHaveValue("Recepção inicial");
  expect((await repairDatabase.query('SELECT "recepcao_servico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].recepcao_servico).toBe("Concorrente");
});
