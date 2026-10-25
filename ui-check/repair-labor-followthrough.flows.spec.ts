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

test("SRC-2dea19d0f7 SRC-5eaf0ce88e source order arrows requery actual open labor at boundaries and after movement", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao"), laborTable = screen.getByTestId("TABLE_tempos_reparacao_ordem");
  await expect(laborTable.locator("tbody tr")).toHaveCount(0); await page.waitForLoadState("networkidle");
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (1,10,2,'20261025120000000','00000000000000000')`);
  await screen.getByTestId("BTN_anterior").click(); await expect(laborTable.getByRole("cell", { name: "ANA", exact: true })).toBeVisible();
  await expect(table.locator('tr[aria-selected="true"]')).toContainText("10");
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (2,10,10,'20261025120100000','00000000000000000')`);
  await screen.getByTestId("BTN_seguinte").click(); await expect(laborTable.locator("tbody tr")).toHaveCount(2);
  await expect(laborTable.getByRole("cell", { name: "BRUNO", exact: true })).toBeVisible();
  await repairDatabase.query(`INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico") VALUES (78,20,'BB-00-BB',2,'R',10);
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (3,20,10,'20261025120200000','00000000000000000')`);
  await screen.getByTestId("BTN_todos").click(); await expect(table.locator("tbody tr")).toHaveCount(2);
  await screen.getByTestId("BTN_seguinte").click(); await expect(table.locator('tr[aria-selected="true"]')).toContainText("20");
  await expect(laborTable.locator("tbody tr")).toHaveCount(1); await expect(laborTable).toContainText("BRUNO");
  await screen.getByTestId("BTN_anterior").click(); await expect(table.locator('tr[aria-selected="true"]')).toContainText("10");
  await expect(laborTable.locator("tbody tr")).toHaveCount(2);
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao" WHERE "fim"=$1', ["00000000000000000"])).rows[0].count).toBe(3);
});

test("SRC-c2c56c6161 actual labor initialization checks every source state and applies registration font12 bold", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin);
  const sourceStates = (await repairDatabase.query('SELECT count(*)::int AS count FROM app."estados_reparacao" WHERE "tipo" IN (2,3,4,5,6)')).rows[0].count;
  await expect(screen.getByTestId("TABLE_Estados_reparacao").getByRole("checkbox", { checked: true })).toHaveCount(sourceStates);
  const plate = screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "AA-00-AA", exact: true }).locator("span");
  await expect(plate).toHaveCSS("font-size", "12px"); await expect(plate).toHaveCSS("font-weight", "700");
});

test("SRC-0f2fcff124 actual material child return refreshes only materials and its save baseline, retaining opening descriptions and labor", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`UPDATE app."ordem_reparacao" SET "recepcao_datahora"='20261025120000000',"recepcao_entrega_prevista"='20261025',"recepcao_servico"='Recepção inicial',"recepcao_obs"='Observação inicial' WHERE "numero"=10;
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (1,10,2,'20261025120000000','20261025130000000');
    INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","artigo","descricao_artigo","quantidade","preco","data_hora","extra","lancado") VALUES (1,10,'A','Material inicial',2,1,'20261025120000000',false,false)`);
  await page.goto(`${repairServer.origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao"); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click(); await screen.getByTestId("BTN_Actualizar_Dados").click();
  await screen.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await screen.getByTestId("BTN_informacao").click(); const detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes");
  await expect(detail.getByTestId("TABLE_Tempos").locator("tbody tr")).toHaveCount(1);
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click(); await detail.getByTestId("BTN_Material").click();
  const child = page.getByTestId("WIN_Material_reparacao_form"); await expect(child.getByTestId("TABLE_material")).toContainText("Material inicial");
  await child.getByTestId("TABLE_material").getByRole("cell", { name: "Material inicial", exact: true }).click(); await child.getByTestId("BTN_Quantidade").click();
  const prompt = page.getByTestId("WIN_Inserir_quantidade_password"); await prompt.getByTestId("EDT_quantidade").fill("3,000"); await prompt.getByTestId("BTN_Confirmar").click();
  await repairDatabase.query(`UPDATE app."ordem_reparacao" SET "recepcao_servico"='Recepção concorrente',"reparacao_estado_historico"='Histórico concorrente' WHERE "numero"=10;
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (2,10,10,'20261025130000000','20261025140000000')`);
  await child.getByTestId("BTN_Sair").click(); await expect(child).toHaveCount(0);
  await expect(detail.getByTestId("TABLE_materiais")).toContainText("3.000");
  await detail.getByRole("tab", { name: "Descrições/Observações", exact: true }).click(); await expect(detail.getByTestId("EDT_servico_avaria")).toHaveValue("Recepção inicial");
  await detail.getByRole("tab", { name: "Histórico dos estados", exact: true }).click(); await expect(detail.getByTestId("EDT_historico_estado")).toHaveValue("Histórico original");
  await detail.getByRole("tab", { name: "Tempos", exact: true }).click(); await expect(detail.getByTestId("TABLE_Tempos").locator("tbody tr")).toHaveCount(1);
  await expect(detail.getByTestId("TABLE_Tempos")).toContainText("ANA");
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click(); await detail.getByRole("checkbox", { name: "Extra A", exact: true }).click();
  await detail.getByTestId("BTN_Sair").click(); await expect(detail).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "extra","quantidade"::text FROM app."material_reparacao" WHERE "artigo"=$1', ["A"])).rows[0]).toEqual({ extra: true, quantidade: "3.000" });
  expect((await repairDatabase.query('SELECT "recepcao_servico","reparacao_estado_historico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ recepcao_servico: "Recepção concorrente", reparacao_estado_historico: "Histórico concorrente" });
});

test("ADR012 actual labor query headers sort typed numbers and displayed priority, seek without filtering and reset source numeroASC", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_prioridade")
    VALUES (78,2,'BB-00-BB',2,'R',10,2),(79,9007199254740993,'AA-00-AA',1,'R',2,3)`);
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao");
  const numbers = () => table.locator("tbody tr").evaluateAll(rows => rows.map(row => row.querySelector("td")?.textContent));
  expect(await numbers()).toEqual(["2", "10", "9007199254740993"]);
  await table.getByTestId("COL_numero").getByRole("button").first().click();
  await expect(screen.getByTestId("BTN_todos")).toBeEnabled();
  await table.getByTestId("COL_numero").getByRole("button").first().click();
  await expect.poll(numbers).toEqual(["9007199254740993", "10", "2"]);
  await table.getByTestId("COL_prioridade").getByRole("button").first().click(); await expect.poll(numbers).toEqual(["2", "10", "9007199254740993"]);
  await table.getByTestId("COL_numero__search").click(); const search = table.locator(".wd-column-search-input");
  await search.fill("9007"); await expect(table.locator('tr[aria-selected="true"]')).toContainText("9007199254740993");
  await expect(table.locator("tbody tr")).toHaveCount(3); await search.fill("missing"); await page.waitForLoadState("networkidle");
  await expect(table.locator('tr[aria-selected="true"]')).toContainText("9007199254740993"); await search.press("Escape");
  await expect(screen).toBeVisible();
  await screen.getByTestId("LIST_mecanicos").selectOption("2"); await expect(table.locator("tbody tr")).toHaveCount(2);
  await table.getByTestId("COL_numero").getByRole("button").first().click(); await expect(screen.getByTestId("BTN_todos")).toBeEnabled(); await table.getByTestId("COL_numero").getByRole("button").first().click();
  await expect.poll(numbers).toEqual(["9007199254740993", "10"]);
  await screen.getByTestId("BTN_todos").click(); await expect.poll(numbers).toEqual(["2", "10", "9007199254740993"]);
});

test("ADR012 actual open-labor headers sort mixed raw date formats and seek mechanics without dropping rows", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES
    (1,10,2,'20261025120100','00000000000000000'),(2,10,10,'2026-10-25 12:00:00.001','00000000000000000')`);
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao_ordem");
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await table.getByTestId("COL_inicio").getByRole("button").first().click(); await expect(table.locator("tbody tr").first()).toContainText("BRUNO");
  await table.getByTestId("COL_inicio").getByRole("button").first().click(); await expect(table.locator("tbody tr").first()).toContainText("ANA");
  await table.getByTestId("COL_Mecanico__search").click(); await table.locator(".wd-column-search-input").fill("BRU");
  await expect(table.locator('tr[aria-selected="true"]')).toContainText("BRUNO"); await expect(table.locator("tbody tr")).toHaveCount(2);
  await table.locator(".wd-column-search-input").press("Enter"); await expect(table).toBeFocused();
});

test("ADR012 actual tipo3 memory headers sort and seek current choices then fresh reopening restores source tipo order", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"='R';
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo") VALUES (710,'A','Alfa',4),(711,'Z','Zulu',5)`);
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Tempos").click();
  const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await time.getByTestId("BTN_Iniciar").click();
  const password = page.getByTestId("WIN_Inserir_quantidade_password"); await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  const picker = page.getByTestId("WIN_Table_estado_reparacao_tipo3"), table = picker.getByTestId("TABLE_Estados_reparacao");
  await table.getByTestId("COL_Descricao").getByRole("button").first().click(); await expect(table.locator("tbody tr").first()).toContainText("Alfa");
  await table.getByTestId("COL_Descricao").getByRole("button").first().click(); await expect(table.locator("tbody tr").first()).toContainText("Zulu");
  await table.getByTestId("COL_Codigo__search").click(); await table.locator(".wd-column-search-input").fill("A");
  await expect(table.locator('tr[aria-selected="true"]')).toContainText("Alfa"); await expect(table.locator("tbody tr")).toHaveCount(4);
  await table.locator(".wd-column-search-input").press("Escape"); await picker.getByTestId("BTN_Cancelar").click();
  await time.getByTestId("BTN_Iniciar").click(); await expect(table.locator("tbody tr").first()).toContainText("Sem predefinição");
  await picker.getByTestId("BTN_Cancelar").click(); await time.getByTestId("BTN_Cancelar").click();
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(0);
});

test("ADR012 actual descriptions memory headers preserve material draft flags and sort exact numbers and mixed labor dates", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`UPDATE app."ordem_reparacao" SET "recepcao_datahora"='20261025120000000',"recepcao_entrega_prevista"='20261025' WHERE "numero"=10;
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES
      (1,10,2,'20261025120100','20261025130100'),(2,10,10,'2026-10-25 12:00:00.001','2026-10-25 13:00:00.001');
    INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","artigo","descricao_artigo","quantidade","preco","data_hora","extra","lancado") VALUES
      (1,10,'A','Artigo A',10,10,'20261025120000000',false,false),(2,10,'B','Artigo B',2,2,'20261025130000000',false,false)`);
  await page.goto(`${repairServer.origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao"); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click(); await screen.getByTestId("BTN_Actualizar_Dados").click();
  await screen.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click(); await screen.getByTestId("BTN_informacao").click();
  const detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes"), laborTable = detail.getByTestId("TABLE_Tempos"), materials = detail.getByTestId("TABLE_materiais");
  await expect(laborTable.locator("tbody tr")).toHaveCount(2);
  await laborTable.getByTestId("COL_Inicio").getByRole("button").first().click(); await expect(laborTable.locator("tbody tr").first()).toContainText("BRUNO");
  await laborTable.getByTestId("COL_Mecanico__search").click(); await laborTable.locator(".wd-column-search-input").fill("ANA");
  await expect(laborTable.locator('tr[aria-selected="true"]')).toContainText("ANA"); await laborTable.locator(".wd-column-search-input").press("Escape");
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click(); await detail.getByRole("checkbox", { name: "Extra A", exact: true }).click();
  await materials.getByTestId("COL_quant").getByRole("button").first().click(); await expect(materials.locator("tbody tr").first()).toContainText("Artigo B");
  await materials.getByTestId("COL_preco").getByRole("button").first().click(); await expect(materials.locator("tbody tr").first()).toContainText("Artigo B");
  await expect(detail.getByRole("checkbox", { name: "Extra A", exact: true })).toBeChecked();
  await materials.getByTestId("COL_desc_artigo__search").click(); await materials.locator(".wd-column-search-input").fill("Artigo A");
  await expect(materials.locator('tr[aria-selected="true"]')).toContainText("Artigo A"); await expect(materials.locator("tbody tr")).toHaveCount(2);
  await materials.locator(".wd-column-search-input").press("Escape"); await detail.getByTestId("BTN_Sair").click(); await expect(detail).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "artigo","extra" FROM app."material_reparacao" ORDER BY "artigo"')).rows).toEqual([{ artigo: "A", extra: true }, { artigo: "B", extra: false }]);
});
