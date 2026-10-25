import type { Page } from "@playwright/test";
import { test, expect } from "./support/repair-orders";

test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao",app."artigos" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"Tempo_materiais"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."mecanicos" SET "palavra_passe"='Synthetic';
    UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_prioridade","recepcao_servico","recepcao_obs","reparacao_servico","reparacao_estado_historico","recepcao_datahora","recepcao_entrega_prevista")
      VALUES (77,10,'AA-00-AA',1,'R',2,1,'Serviço original','Observação original','Trabalho','Histórico original','20240229120000000','20240301');
    INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","stock","preco") VALUES (1,'A','Artigo',10,1.25);
    INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","preco","data_hora","reparacao_estado","lancado","extra")
      VALUES (1,10,2,'A','Material original',2,1.25,'20240229123456000','R',FALSE,FALSE)`);
});

async function labor(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled(); return screen;
}

test("MIG10 actual repair Information tabs open the real material editor and commit stock and material flags", async ({ page, repairServer, repairDatabase }) => {
  await page.goto(`${repairServer.origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao"); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click(); await screen.getByTestId("BTN_Actualizar_Dados").click();
  await screen.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await screen.getByTestId("BTN_informacao").click(); const detail = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes");
  await expect(detail.getByRole("tab")).toHaveCount(4); await detail.getByRole("tab", { name: "Descrições/Observações", exact: true }).click();
  await expect(detail.getByTestId("EDT_servico_avaria")).toHaveValue("Serviço original");
  await detail.getByRole("tab", { name: "Histórico dos estados", exact: true }).click(); await expect(detail.getByTestId("EDT_historico_estado")).toHaveValue("Histórico original");
  await detail.getByRole("tab", { name: "Materiais", exact: true }).click(); await detail.getByTestId("BTN_Material").click();
  const material = page.getByTestId("WIN_Material_reparacao_form");
  await material.getByTestId("TABLE_material").getByRole("cell", { name: "Material original", exact: true }).click();
  await material.getByTestId("BTN_Quantidade").click(); const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await prompt.getByTestId("EDT_quantidade").fill("3,000"); await prompt.getByTestId("BTN_Confirmar").click();
  await material.getByTestId("BTN_Sair").click(); await expect(material).toHaveCount(0);
  await expect(detail.getByTestId("TABLE_materiais")).toContainText("3.000");
  await detail.getByRole("checkbox", { name: "Extra A", exact: true }).click(); await detail.getByTestId("BTN_Sair").click(); await expect(detail).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["A"])).rows[0].stock).toBe("9.000");
  expect((await repairDatabase.query('SELECT "extra" FROM app."material_reparacao"')).rows[0].extra).toBe(true);
});

test("MIG10 actual labor list information and state dialog save the selected state and history", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Informacao").click();
  const information = page.getByTestId("WIN_Tempos_Reparacao_Informacao"); await expect(information.getByTestId("EDT_observacao")).toHaveValue("Observação original");
  await information.getByTestId("BTN_Fechar").click(); await screen.getByTestId("BTN_Estado").click(); const state = page.getByTestId("WIN_Tempos_Reparacao_Estado");
  await expect(state.getByTestId("EDT_Data_Hora__calendar")).toHaveCount(0);
  await state.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Sem predefinição", exact: true }).click();
  await state.getByTestId("EDT_descricao").fill("Estado de teste"); await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  const row = (await repairDatabase.query('SELECT "reparacao_estado","reparacao_estado_historico" FROM app."ordem_reparacao"')).rows[0];
  expect(row.reparacao_estado).toBe("N"); expect(row.reparacao_estado_historico).toContain("Estado de teste");
});

test("MIG10 actual time password/state picker starts then stops labor using the source zero17 sentinel", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query('UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"=$1', ["R"]);
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Tempos").click();
  const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await time.getByTestId("BTN_Iniciar").click();
  const password = page.getByTestId("WIN_Inserir_quantidade_password"); await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  const picker = page.getByTestId("WIN_Table_estado_reparacao_tipo3"); await picker.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Sem predefinição", exact: true }).click();
  await picker.getByTestId("BTN_selecionar").click(); await expect(time).toHaveCount(0);
  const started = (await repairDatabase.query('SELECT "fim","Inicio_reparacao_estado" FROM app."tempos_reparacao"')).rows;
  expect(started).toEqual([{ fim: "00000000000000000", Inicio_reparacao_estado: "R" }]);
  await screen.getByTestId("BTN_Tempos").click(); await expect(time.getByTestId("BTN_Iniciar")).toHaveAccessibleName("Finalizar");
  await time.getByTestId("BTN_Iniciar").click(); await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click(); await expect(time).toHaveCount(0);
  const finished = (await repairDatabase.query('SELECT "fim","fim_reparacao_estado" FROM app."tempos_reparacao"')).rows[0];
  expect(finished.fim).toMatch(/^[0-9]{17}$/); expect(finished.fim).not.toBe("00000000000000000"); expect(finished.fim_reparacao_estado).toBe("N");
});

test("SRC-f19f71c51e SRC-877b8436df source Estado pointer callers await real alpha keyboards and preserve cancellation before saving", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Estado").click();
  const state = page.getByTestId("WIN_Tempos_Reparacao_Estado"), keyboard = page.getByTestId("WIN_Teclado_Alfa");
  await state.getByTestId("EDT_descricao").click(); await expect(keyboard).toBeVisible();
  await expect(keyboard.getByTestId("BTN_Caption")).toHaveText("Descrição"); await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("");
  await keyboard.getByTestId("BTN_a").click(); await keyboard.getByTestId("BTN_cancelar").click();
  await expect(keyboard).toHaveCount(0); await expect(state.getByTestId("EDT_descricao")).toHaveValue("");
  await state.getByTestId("EDT_descricao").click(); await keyboard.getByTestId("BTN_a").click(); await keyboard.getByTestId("BTN_confirmar").click();
  await expect(state.getByTestId("EDT_descricao")).toHaveValue("a");
  await state.getByTestId("EDT_obs_servico").click(); await expect(keyboard.getByTestId("BTN_Caption")).toHaveText("Serviço");
  await expect(keyboard.getByTestId("EDT_Texto")).toHaveValue("Trabalho");
  await keyboard.getByTestId("BTN_apagar_tudo").click(); await keyboard.getByTestId("BTN_s").click(); await page.keyboard.press("Escape");
  await expect(keyboard).toHaveCount(0); await expect(state.getByTestId("EDT_obs_servico")).toHaveValue("Trabalho");
  await state.getByTestId("EDT_obs_servico").click(); await keyboard.getByTestId("BTN_apagar_tudo").click(); await keyboard.getByTestId("BTN_s").click(); await keyboard.getByTestId("BTN_confirmar").click();
  await expect(state.getByTestId("EDT_obs_servico")).toHaveValue("s");
  expect((await repairDatabase.query('SELECT "reparacao_servico","reparacao_estado_obs" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ reparacao_servico: "Trabalho", reparacao_estado_obs: null });
  await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "reparacao_servico","reparacao_estado_obs","reparacao_estado_historico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toMatchObject({ reparacao_servico: "s", reparacao_estado_obs: "a", reparacao_estado_historico: expect.stringContaining("\r\na") });
});

test("SRC-6403344a20 source Estado initialization positions history at end and selects the actual current state", async ({ page, repairServer, repairDatabase }) => {
  const history = Array.from({ length: 80 }, (_, index) => `Histórico ${index}`).join("\r\n");
  await repairDatabase.query('UPDATE app."ordem_reparacao" SET "reparacao_estado_historico"=$1 WHERE "numero"=10', [history]);
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Estado").click();
  const state = page.getByTestId("WIN_Tempos_Reparacao_Estado"), control = state.getByTestId("EDT_historico");
  await expect(control).toHaveValue(history.replaceAll("\r\n", "\n"));
  await expect.poll(() => control.evaluate(element => { const field = element as HTMLTextAreaElement; return field.selectionStart === field.value.length && field.selectionEnd === field.value.length && field.scrollTop > 0; })).toBe(true);
  await expect(state.getByTestId("TABLE_Estados_reparacao").locator('tr[aria-selected="true"]')).toContainText("Em reparação");
  await expect(state.getByTestId("TABLE_Estados_reparacao").locator('tr[aria-selected="true"] .repair-labor-color')).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await state.getByTestId("BTN_Cancelar").click();
  expect((await repairDatabase.query('SELECT "reparacao_estado_historico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_estado_historico).toBe(history);
});

test("SRC-fafcfa6be8 source Estado return restores prior row index when the changed order leaves the actual filter", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`DELETE FROM app."estados_reparacao" WHERE "Codigo"='Z7';
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","Cor") VALUES (700,'Z7','Fechado fora do filtro',7,0);
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","reparacao_estado","reparacao_mecanico","recepcao_prioridade","reparacao_servico","reparacao_estado_historico")
      VALUES (80,20,'AA-00-AA',1,'R',2,1,'Serviço20',''),(81,30,'AA-00-AA',1,'R',2,1,'Serviço30',''),(82,40,'AA-00-AA',1,'R',2,1,'Serviço40','')`);
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao");
  await table.getByRole("cell", { name: "20", exact: true }).click(); await screen.getByTestId("BTN_Estado").click();
  const state = page.getByTestId("WIN_Tempos_Reparacao_Estado"); await state.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Fechado fora do filtro", exact: true }).click();
  await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  await expect(table.locator("tbody tr")).toHaveCount(3);
  await expect(table.locator('tr[aria-selected="true"]')).toHaveText(/30/);
  expect((await repairDatabase.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=20')).rows[0].reparacao_estado).toBe("Z7");
});

test("SRC-7810f8745a actual tipo3 picker queries live types3/4/5 on every opening and cancellation has no writes", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query('UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"=$1', ["R"]);
  await repairDatabase.query('DELETE FROM app."estados_reparacao" WHERE "Codigo"=ANY($1::text[])', [["F2", "F3", "F4", "F5", "F7", "L5"]]);
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Tempos").click();
  const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await expect(time.getByTestId("BTN_Iniciar")).toBeEnabled();
  await repairDatabase.query(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo") VALUES
    (710,'F2','Fresh tipo2',2),(711,'F3','Fresh tipo3',3),(712,'F4','Fresh tipo4',4),(713,'F5','Fresh tipo5',5),(714,'F7','Fresh tipo7',7)`);
  await time.getByTestId("BTN_Iniciar").click(); const password = page.getByTestId("WIN_Inserir_quantidade_password");
  await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  const picker = page.getByTestId("WIN_Table_estado_reparacao_tipo3"); await expect(picker).toBeVisible();
  for (const name of ["Fresh tipo3", "Fresh tipo4", "Fresh tipo5"]) await expect(picker.getByRole("cell", { name, exact: true })).toBeVisible();
  for (const name of ["Fresh tipo2", "Fresh tipo7"]) await expect(picker.getByRole("cell", { name, exact: true })).toHaveCount(0);
  await picker.getByTestId("BTN_Cancelar").click(); await expect(picker).toHaveCount(0); await expect(time).toBeVisible();
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(0);
  expect((await repairDatabase.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_estado).toBe("R");
  await repairDatabase.query(`INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo") VALUES (715,'L5','Late tipo5',5)`);
  await time.getByTestId("BTN_Iniciar").click(); await expect(picker.getByRole("cell", { name: "Late tipo5", exact: true })).toBeVisible();
  await picker.getByRole("cell", { name: "Late tipo5", exact: true }).click(); await picker.getByTestId("BTN_selecionar").click(); await expect(time).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_estado).toBe("L5");
  expect((await repairDatabase.query('SELECT "fim","Inicio_reparacao_estado" FROM app."tempos_reparacao"')).rows).toEqual([{ fim: "00000000000000000", Inicio_reparacao_estado: "R" }]);
});

test("ADR002 source Estado keyboard cancellation preserves NULL service while explicit blank confirmation writes empty", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query('UPDATE app."ordem_reparacao" SET "reparacao_servico"=NULL WHERE "numero"=10');
  const screen = await labor(page, repairServer.origin), state = page.getByTestId("WIN_Tempos_Reparacao_Estado"), keyboard = page.getByTestId("WIN_Teclado_Alfa");
  await screen.getByTestId("BTN_Estado").click(); await state.getByTestId("EDT_obs_servico").click();
  await keyboard.getByTestId("BTN_x").click(); await keyboard.getByTestId("BTN_cancelar").click(); await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "reparacao_servico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_servico).toBeNull();
  await screen.getByTestId("BTN_Estado").click(); await state.getByTestId("EDT_obs_servico").click();
  await keyboard.getByTestId("BTN_x").click(); await keyboard.getByTestId("BTN_apagar_tudo").click(); await keyboard.getByTestId("BTN_confirmar").click(); await state.getByTestId("BTN_Confirmar").click(); await expect(state).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "reparacao_servico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_servico).toBe("");
});

test("SRC-af35a2fb04 actual Information return retains its caller rows until the source Todos refresh", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin), table = screen.getByTestId("TABLE_tempos_reparacao");
  await expect(table).toContainText("Normal");
  let lists = 0; page.on("request", request => { if (new URL(request.url()).pathname === "/api/repair-labor/list") lists++; });
  await screen.getByTestId("BTN_Informacao").click();
  const info = page.getByTestId("WIN_Tempos_Reparacao_Informacao"); await expect(info.getByTestId("EDT_cliente")).toHaveValue("CLIENTE RECEPÇÃO");
  await repairDatabase.query('UPDATE app."ordem_reparacao" SET "recepcao_prioridade"=2 WHERE "numero"=10');
  await info.getByTestId("BTN_Fechar").click(); await expect(info).toHaveCount(0); await page.waitForLoadState("networkidle");
  await expect(table).toContainText("Normal"); expect(lists).toBe(0);
  await screen.getByTestId("BTN_todos").click(); await expect(table).toContainText("Elevada"); expect(lists).toBe(1);
});

test("ADR006 actual tipo3 modal releases database access and rejects changed prepared state choices atomically", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query('UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"=$1', ["R"]);
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Tempos").click();
  const time = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await time.getByTestId("BTN_Iniciar").click();
  const password = page.getByTestId("WIN_Inserir_quantidade_password"); await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  const picker = page.getByTestId("WIN_Table_estado_reparacao_tipo3"); await expect(picker).toBeVisible();
  await repairDatabase.query('UPDATE app."estados_reparacao" SET "Descricao"=$1 WHERE "Codigo"=$2', ["Concorrente", "N"]);
  await picker.getByRole("cell", { name: "Sem predefinição", exact: true }).click(); await picker.getByTestId("BTN_selecionar").click();
  await expect(time.getByTestId("repair-labor-time-diagnostic")).toHaveText("stale"); await expect(time).toBeVisible();
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(0);
  expect((await repairDatabase.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_estado).toBe("R");
  await time.getByTestId("BTN_Cancelar").click(); await expect(time).toHaveCount(0);
});

test("ADR006 actual Estado keyboard modal permits concurrent changes and stale save retains visible edits without partial history", async ({ page, repairServer, repairDatabase }) => {
  const screen = await labor(page, repairServer.origin); await screen.getByTestId("BTN_Estado").click();
  const state = page.getByTestId("WIN_Tempos_Reparacao_Estado"); await state.getByTestId("EDT_descricao").click();
  const keyboard = page.getByTestId("WIN_Teclado_Alfa"); await expect(keyboard).toBeVisible();
  await repairDatabase.query('UPDATE app."ordem_reparacao" SET "reparacao_estado_historico"=$1 WHERE "numero"=10', ["Histórico concorrente"]);
  await keyboard.getByTestId("BTN_a").click(); await keyboard.getByTestId("BTN_confirmar").click();
  await state.getByTestId("BTN_Confirmar").click(); await expect(state.getByTestId("repair-labor-state-diagnostic")).toHaveText("stale");
  await expect(state.getByTestId("EDT_descricao")).toHaveValue("a");
  expect((await repairDatabase.query('SELECT "reparacao_estado_historico","reparacao_estado_obs","reparacao_servico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ reparacao_estado_historico: "Histórico concorrente", reparacao_estado_obs: null, reparacao_servico: "Trabalho" });
  await state.getByTestId("BTN_Cancelar").click(); await expect(state).toHaveCount(0);
});
