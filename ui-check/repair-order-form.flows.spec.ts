import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/repair-orders";

const formId = "WIN_Ordens_Reparacao_Form";
const post = (page: Page, action: string) => page.waitForResponse(response => response.request().method() === "POST" && response.url().endsWith(`/api/repair-orders/${action}`));
const mainTable = "TABLE_QRY_select_ordens_reparacao";

// Every row is synthetic and written only to this test's disposable PostgreSQL database.
test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."material_reparacao",app."tempos_reparacao",app."utilizadores" RESTART IDENTITY;
    INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,1,'RECEPÇÃO','SYNTHETIC-ONLY'),(2,2,'SEGUNDO','OTHER-SYNTHETIC');
    UPDATE app."Clientes" SET "Telefone1"=' 210  ',"Telemovel"=' 910 ' WHERE "Codigo"=3;
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","km_viatura","recepcao_util","recepcao_datahora","recepcao_cliente","recepcao_terceiro","recepacao_contatos","recepcao_servico","recepcao_obs","recepcao_entrega_prevista","recepcao_prioridade","reparacao_mecanico","reparacao_estado","faturado","total_pago","numero_fatura","data_pagamento","Estados_reparacaoID","reparacao_estado_obs","reparacao_servico","reparacao_estado_data","reparacao_estado_historico","totaL_mao_obra","total_pecas","total_desconto","total_reparacao") VALUES
    (77,10,'AA-00-AA',9007199254740993,1,'2024-02-29 12:34:56.789',1,2,E'  guardado\\r\\ncontacto  ',E'Serviço\\r\\noriginal  ',NULL,'20240301',1,2,'R',NULL,NULL,' NF original ',NULL,9007199254740993,'obs estado','trabalho','data opaca','histórico',1.125,2.0001,-0.25,2.8751),
    (78,11,'BB-00-BB',50,1,'20240229120000000',2,1,'contacto','Outro serviço','obs','20240301',2,10,'X',false,0,'','',0,'','','','',0,0,0,0)`);
});

async function openList(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-orders`);
  await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao");
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click();
  const read = post(page, "list"); await screen.getByTestId("BTN_Actualizar_Dados").click(); await read;
  await expect(screen.getByTestId(mainTable).locator("tbody tr")).toHaveCount(2);
  return screen;
}
async function edit(page: Page, screen: Locator, numero = "10") {
  await screen.getByTestId(mainTable).getByRole("row").filter({ has: page.getByRole("cell", { name: numero, exact: true }) }).click();
  await screen.getByTestId("BTN_Alterar").click();
  const form = page.getByTestId(formId);
  await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready");
  return form;
}
async function newForm(page: Page, screen: Locator) {
  await screen.getByTestId("BTN_Novo").click();
  const form = page.getByTestId(formId); await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready");
  return form;
}
async function info(page: Page, text: string) {
  const message = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(message.getByTestId("LIB_INFO")).toHaveText(text);
  return message;
}
async function selectState(page: Page, form: Locator, label: string, confirmPrefix?: string) {
  const response = post(page, "check-state-change");
  await form.getByTestId("COMBO_estado").selectOption({ label }); await response;
  if (confirmPrefix !== undefined) {
    const confirmation = page.getByTestId("WIN_Mudar_Estado");
    await expect(confirmation).toBeVisible(); await confirmation.getByTestId("EDT_Letra").fill(confirmPrefix);
    await confirmation.getByTestId("BTN_Confirmar").click(); await expect(confirmation).toHaveCount(0);
  }
  await expect(form.getByTestId("BTN_Gravar")).toBeEnabled();
}
async function fillNew(page: Page, form: Locator, registration = "DELETE-ME") {
  const resolved = post(page, "resolve-vehicle"); await form.getByTestId("EDT_matricula").fill(registration);
  await form.getByTestId("EDT_KM").click(); await resolved;
  await form.getByTestId("EDT_KM").fill("100");
  await form.getByTestId("COMBO_Recepcionado").selectOption({ label: "RECEPÇÃO" });
  await selectState(page, form, "Em reparação");
}

// Exact source control names/geometry are shared RAD bindings; browser checks are not native acceptance.
test("MIG-8.2 actual RAD form preserves raw edit values, invoice visibility, source Normal buttons and initial state", async ({ page, repairServer }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen);
  await expect(form.getByTestId("RADTitle")).toHaveText("Ordem de reparação");
  await expect(form.getByTestId("BTN_informacao")).toHaveAccessibleName("Informação");
  await expect(form.getByTestId("CBOX_faturado")).toHaveAccessibleName("Faturado");
  await expect(form.getByTestId("STC_Observação")).toHaveText("Observação");
  await expect(form.getByTestId("EDT_Ordem_n")).toHaveAccessibleName("Ordem nº");
  await expect(form.getByTestId("EDT_Nr_Fatura")).toHaveAccessibleName("Nº Fatura");
  await expect(form.getByTestId("EDT_Ordem_n")).toHaveValue("10");
  await expect(form.getByTestId("EDT_Ordem_n")).toHaveAttribute("readonly", "");
  await expect(form.getByTestId("EDT_KM")).toHaveValue("9007199254740993");
  await expect(form.getByTestId("EDT_Cliente")).toHaveValue("CLIENTE DA VIATURA");
  await expect(form.getByTestId("EDT_Contactos")).toHaveValue("  guardado\ncontacto  ");
  await expect(form.getByTestId("EDT_servico_avaria")).toHaveValue("Serviço\noriginal  ");
  await expect(form.getByTestId("EDT_observacao")).toHaveValue("");
  await expect(form.getByTestId("EDT_Total_Pago")).toHaveValue("");
  await expect(form.getByTestId("CBOX_faturado")).not.toBeChecked();
  await expect(form.getByTestId("EDT_Nr_Fatura")).toBeVisible();
  await expect(form.getByTestId("EDT_Nr_Fatura")).toHaveValue(" NF original ");
  await form.getByTestId("CBOX_faturado").check(); await form.getByTestId("CBOX_faturado").uncheck();
  await expect(form.getByTestId("EDT_Nr_Fatura")).toBeHidden();
  await form.getByTestId("CBOX_faturado").check(); await expect(form.getByTestId("EDT_Nr_Fatura")).toHaveValue(" NF original ");
  await expect(form.getByTestId("BTN_VISION")).toBeHidden(); await expect(form.getByTestId("BTN_informacao")).toBeEnabled();
  const frame = (await page.getByTestId("repair-order-form-frame").boundingBox())!;
  expect([frame.width, frame.height]).toEqual([800, 600]);
  for (const [name, tag] of [["EDT_Contactos", "TEXTAREA"], ["EDT_servico_avaria", "TEXTAREA"], ["EDT_observacao", "TEXTAREA"]]) expect(await form.getByTestId(name).evaluate(element => element.tagName)).toBe(tag);
  let prepares = 0; page.on("request", request => { if (request.url().endsWith("/api/repair-orders/prepare-save")) prepares++; });
  await form.getByTestId("EDT_KM").press("Enter"); expect(prepares).toBe(0); await expect(form).toBeVisible();
});

test("SRC-55e462b0d2 edit saves captured customer and current omitted fields, preserving untouched raw dates, NULLs and memos", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen);
  await repairDatabase.query(`UPDATE app."Viaturas" SET "Cliente"=1 WHERE "matricula"='AA-00-AA';
    UPDATE app."ordem_reparacao" SET "reparacao_estado_obs"='CURRENT obs',"reparacao_servico"='CURRENT trabalho',"reparacao_estado_data"='CURRENT data',"reparacao_estado_historico"='CURRENT histórico',"totaL_mao_obra"=999.125,"total_pecas"=-9.25,"total_desconto"=0.00001,"total_reparacao"=989.87501 WHERE "numero"=10`);
  const current = (await repairDatabase.query('SELECT to_jsonb(o) AS row FROM app."ordem_reparacao" o WHERE "numero"=10')).rows[0].row;
  await form.getByTestId("BTN_Gravar").click();
  const date = page.getByTestId("WIN_Data"); await expect(date.getByTestId("STC_Data")).toHaveText("Data de entrega");
  await date.getByTestId("EDT_Data").press("Escape");
  await expect(form).toHaveCount(0); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  const saved = (await repairDatabase.query('SELECT to_jsonb(o) AS row FROM app."ordem_reparacao" o WHERE "numero"=10')).rows[0].row;
  expect(saved).toEqual({ ...current, recepcao_cliente: 3 });
  expect(saved.recepcao_datahora).toBe("2024-02-29 12:34:56.789");
  expect(saved.recepacao_contatos).toBe("  guardado\r\ncontacto  ");
  expect(saved.recepcao_obs).toBeNull(); expect(saved.faturado).toBeNull(); expect(saved.total_pago).toBeNull();
});

test("SRC-55e462b0d2 ordered Date dialogs allow blank/zero, retain edits after inactive refusal and resume the same prepared save", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen);
  await selectState(page, form, "Sem predefinição", "s");
  await form.getByTestId("COMBO_mecanico").selectOption({ label: "BRUNO" });
  await form.getByTestId("BTN_Gravar").click();
  let date = page.getByTestId("WIN_Data"); await expect(date.getByTestId("STC_Data")).toHaveText("Data de entrega");
  await date.getByTestId("EDT_Data").fill(""); await date.getByTestId("BTN_Confirmar").click();
  date = page.getByTestId("WIN_Data"); await expect(date.getByTestId("STC_Data")).toHaveText("Data de pagamento");
  await date.getByTestId("EDT_Data").fill("00/00/0000");
  const saving = post(page, "save"); await date.getByTestId("BTN_Confirmar").click();
  const response = await saving; expect(response.ok(), JSON.stringify(await response.json())).toBe(true);
  const message = await info(page, "Mecânico está inativo quer continuar?");
  await expect(form.getByTestId("EDT_data_entrega")).toHaveValue("");
  await expect(form.getByTestId("EDT_Data_pagamento")).toHaveValue("00/00/0000");
  let repeats = 0; page.on("request", request => { if (request.url().endsWith("/api/repair-orders/prepare-save")) repeats++; });
  await message.getByTestId("BTN_OUI").click(); await expect(form).toHaveCount(0);
  expect(repeats).toBe(0);
  expect((await repairDatabase.query('SELECT "recepcao_entrega_prevista","data_pagamento","reparacao_mecanico" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ recepcao_entrega_prevista: "", data_pagamento: "00000000", reparacao_mecanico: 10 });
});

test("SRC-77db2a5b94 Cancelar waits for No/Yes and both actual modal returns refresh the real parent", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), before = (await repairDatabase.query('SELECT to_jsonb(o)::text AS row FROM app."ordem_reparacao" o ORDER BY _row_id')).rows;
  let form = await edit(page, screen); await form.getByTestId("EDT_servico_avaria").fill("DON'T WRITE");
  await form.getByTestId("BTN_Cancelar").click(); const message = await info(page, "Cancelar ordem de reparação?");
  await message.getByTestId("BTN_NON").click(); await expect(form).toBeVisible();
  const refreshed = post(page, "list"); await form.getByTestId("BTN_Cancelar").click(); await (await info(page, "Cancelar ordem de reparação?")).getByTestId("BTN_OUI").click(); await refreshed;
  await expect(form).toHaveCount(0);
  form = await newForm(page, screen); const newReturnRead = post(page, "list");
  await form.getByTestId("BTN_SYST_FERMER").click(); await newReturnRead; await expect(form).toHaveCount(0);
  expect((await repairDatabase.query('SELECT to_jsonb(o)::text AS row FROM app."ordem_reparacao" o ORDER BY _row_id')).rows).toEqual(before);
});

for (const field of ["EDT_matricula", "EDT_Marca_Modelo"]) test(`ADR-003 one real Gravar pointer click queues behind a delayed unchanged ${field} Exit`, async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen);
  await form.getByTestId(field).focus();
  let release!: () => void, fetched!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), actualFetched = new Promise<void>(resolve => { fetched = resolve; });
  let prepares = 0; page.on("request", request => { if (request.url().endsWith("/api/repair-orders/prepare-save")) prepares++; });
  await page.route("**/api/repair-orders/resolve-vehicle", async route => { const response = await route.fetch(); expect((await response.json()).kind).toBe("loaded"); fetched(); await gate; await route.fulfill({ response }); });
  try {
    await form.getByTestId("BTN_Gravar").click(); await actualFetched;
    expect(prepares).toBe(0); await expect(page.getByTestId("WIN_Data")).toHaveCount(0);
    release(); const date = page.getByTestId("WIN_Data"); await expect(date).toBeVisible(); expect(prepares).toBe(1);
    await date.getByTestId("EDT_Data").press("Escape"); await expect(form).toHaveCount(0);
    expect((await repairDatabase.query('SELECT "recepacao_contatos" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].recepacao_contatos).toBe(" 210  \r\n 910 ");
  } finally { release(); await page.unroute("**/api/repair-orders/resolve-vehicle"); }
});

test("SRC-385d90c6c0 new order uses the genuine form, dates and allocated number then refreshes its caller", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await newForm(page, screen);
  await expect(form.getByTestId("EDT_Ordem_n")).toHaveValue("12");
  expect(await form.getByTestId("COMBO_mecanico").evaluate(element => (element as HTMLSelectElement).selectedIndex)).toBe(-1);
  expect(await form.getByTestId("COMBO_Recepcionado").evaluate(element => (element as HTMLSelectElement).selectedIndex)).toBe(-1);
  await fillNew(page, form); await form.getByTestId("EDT_servico_avaria").fill("Novo serviço\nsegunda linha");
  await form.getByTestId("BTN_Gravar").click(); const date = page.getByTestId("WIN_Data"); await expect(date).toBeVisible();
  await date.getByTestId("BTN_Confirmar").click(); await expect(form).toHaveCount(0);
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await expect(screen.getByTestId(mainTable)).toContainText("DELETE-ME");
  const saved = (await repairDatabase.query('SELECT "numero"::text,"matricula","km_viatura"::text,"recepcao_cliente"::text,"recepcao_servico","recepcao_prioridade","reparacao_mecanico" FROM app."ordem_reparacao" WHERE "numero"=12')).rows[0];
  expect(saved).toEqual({ numero: "12", matricula: "DELETE-ME", km_viatura: "100", recepcao_cliente: "1", recepcao_servico: "Novo serviço\r\nsegunda linha", recepcao_prioridade: 1, reparacao_mecanico: 0 });
});

test("SRC-eb9499fa91 real delete cancels safely then removes only matching order/material/labor without touching stock", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`INSERT INTO app."material_reparacao" ("numero","artigo","quantidade") VALUES (10,'A',2),(11,'B',3);
    INSERT INTO app."tempos_reparacao" ("numero","mecanico","fim") VALUES (10,2,''),(11,10,'00000000000000000');
    INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","stock") VALUES (999,'DELETE-PROOF','Synthetic',-2.125)`);
  const screen = await openList(page, repairServer.origin);
  await screen.getByTestId(mainTable).getByRole("row").filter({ has: page.getByRole("cell", { name: "10", exact: true }) }).click();
  await screen.getByTestId("BTN_Eliminar").click(); const confirmation = page.getByTestId("WINDEVDIALOGBOX");
  await expect(confirmation).toContainText("Deseja apagar o registo?");
  await expect(confirmation.getByTestId("RADTitle")).toHaveText("Ordens de Reparação"); await page.keyboard.press("Escape");
  expect((await repairDatabase.query('SELECT count(*)::int AS n FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].n).toBe(1);
  const read = post(page, "list"); await screen.getByTestId("BTN_Eliminar").click(); await confirmation.getByRole("button", { name: "Sim", exact: true }).click(); await read;
  for (const table of ["ordem_reparacao", "material_reparacao", "tempos_reparacao"]) {
    expect((await repairDatabase.query(`SELECT "numero"::text FROM app."${table}" ORDER BY "numero"`)).rows).toEqual([{ numero: "11" }]);
  }
  expect((await repairDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["DELETE-PROOF"])).rows[0].stock).toBe("-2.125");
});

test("SRC-55e462b0d2 actual required messages preserve entry→delivery→KM→receptionist→unselected-state order", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await newForm(page, screen);
  const entry = await form.getByTestId("EDT_data_hora_entrada").inputValue(), delivery = await form.getByTestId("EDT_data_entrega").inputValue();
  const refused = async (text: string) => { await form.getByTestId("BTN_Gravar").click(); await (await info(page, text)).getByTestId("BTN_OK").click(); await expect(form.getByTestId("BTN_Gravar")).toBeEnabled(); };
  await form.getByTestId("EDT_data_hora_entrada").fill(""); await refused("Indique a data de entrada");
  await form.getByTestId("EDT_data_hora_entrada").fill(entry); await form.getByTestId("EDT_data_entrega").fill(""); await refused("Indique a data de entrega");
  await form.getByTestId("EDT_data_entrega").fill(delivery); await refused("Indique os km da viatura");
  await form.getByTestId("EDT_KM").fill("100"); await refused("Indique o recepcionista");
  await form.getByTestId("COMBO_Recepcionado").selectOption({ label: "RECEPÇÃO" }); await refused("Indique o estado de reparação");
  expect((await repairDatabase.query('SELECT count(*)::int AS n FROM app."ordem_reparacao"')).rows[0].n).toBe(2);
});

test("SRC-d0b8d7715c real state opening cache restores before working Info, only empty fim blocks and actual confirmation cancellation restores", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen), combo = form.getByTestId("COMBO_estado");
  await repairDatabase.query('INSERT INTO app."tempos_reparacao" ("numero","mecanico","fim") VALUES (10,2,$1)', [""]);
  // Actual native opening intent captures current StoredValue; cancellation keeps the parent mounted.
  await combo.press("Alt+ArrowDown"); await combo.press("Escape");
  const check = post(page, "check-state-change"); await combo.selectOption({ label: "Concluído" }); await check;
  const working = await info(page, "Ordem de reparação tem mecânico a trabalhar na viatura");
  await expect(combo.locator("option:checked")).toHaveText("Em reparação"); await working.getByTestId("BTN_OK").click();
  await repairDatabase.query('UPDATE app."tempos_reparacao" SET "fim"=$1 WHERE "numero"=10', ["00000000000000000"]);
  const checked = post(page, "check-state-change"); await combo.selectOption({ label: "Concluído" }); await checked;
  const confirmation = page.getByTestId("WIN_Mudar_Estado"); await expect(confirmation).toBeVisible();
  await expect(confirmation.getByTestId("STC_Titulo")).toHaveText("Mudar estado da reparação para 'Concluído'?");
  await confirmation.getByTestId("BTN_Cancelar").click(); await expect(combo.locator("option:checked")).toHaveText("Em reparação");
  expect((await repairDatabase.query('SELECT "reparacao_estado" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].reparacao_estado).toBe("R");
});

test("SRC-55e462b0d2 refusal keeps earlier reread customer display while captured client and contacts stay unchanged", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await newForm(page, screen);
  await fillNew(page, form, "AA-00-AA");
  await expect(form.getByTestId("EDT_Cliente")).toHaveValue("CLIENTE DA VIATURA");
  await repairDatabase.query('UPDATE app."Clientes" SET "Descricao"=$1 WHERE "Codigo"=3', ["DESCRIÇÃO ATUAL"]);
  await form.getByTestId("BTN_Gravar").click(); const refusal = await info(page, "Viatura já em reparação");
  await expect(form.getByTestId("EDT_Cliente")).toHaveValue("DESCRIÇÃO ATUAL");
  await expect(form.getByTestId("EDT_Contactos")).toHaveValue(" 210  \n 910 ");
  await refusal.getByTestId("BTN_OK").click();
  expect((await repairDatabase.query('SELECT count(*)::int AS n FROM app."ordem_reparacao"')).rows[0].n).toBe(2);
});

test("MIG-8.2 actual byte pickers resolve newly-created current codes without selecting a fabricated or stale option", async ({ page, repairServer, repairDatabase }) => {
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen);
  await repairDatabase.query(`INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","inativo") VALUES (3,33,'CURRENT MECÂNICO',false);
    INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (3,33,'CURRENT RECEPÇÃO','SYNTHETIC')`);
  await form.getByTestId("BTN_VISION2").click(); const mechanic = page.getByTestId("mechanic-picker");
  await expect(mechanic.getByTestId("BTN_selecionar")).toBeEnabled();
  await mechanic.getByTestId("TABLE_mecanicos").getByRole("row").filter({ hasText: "CURRENT MECÂNICO" }).dblclick();
  await expect(form.getByTestId("COMBO_mecanico").locator("option:checked")).toHaveText("CURRENT MECÂNICO");
  await form.getByTestId("BTN_VISION3").click(); const user = page.getByTestId("user-picker");
  await expect(user.getByTestId("BTN_selecionar")).toBeEnabled();
  await user.getByTestId("TABLE_utilizadores").getByRole("row").filter({ hasText: "CURRENT RECEPÇÃO" }).dblclick();
  await expect(form.getByTestId("COMBO_Recepcionado").locator("option:checked")).toHaveText("CURRENT RECEPÇÃO");
  await form.getByTestId("BTN_Gravar").click(); const date = page.getByTestId("WIN_Data"); await expect(date).toBeVisible();
  await date.getByTestId("EDT_Data").press("Escape"); await expect(form).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "reparacao_mecanico","recepcao_util" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ reparacao_mecanico: 33, recepcao_util: 33 });
});

test("SRC-55e462b0d2 actual save-time vehicle creation rereads the new vehicle without replacing captured customer or contacts", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query(`INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo","Ano","mes") VALUES (4,'CREATE-ME',3,'ORIGINAL','ORIGINAL',2024,1)`);
  const screen = await openList(page, repairServer.origin), form = await newForm(page, screen);
  await fillNew(page, form, "CREATE-ME");
  await expect(form.getByTestId("EDT_Cliente")).toHaveValue("CLIENTE DA VIATURA");
  await repairDatabase.query('DELETE FROM app."Viaturas" WHERE "matricula"=$1', ["CREATE-ME"]);
  await form.getByTestId("BTN_Gravar").click(); const offer = page.getByTestId("WINDEVDIALOGBOX");
  await expect(offer).toContainText("Matrícula não existente, criar agora?");
  await offer.getByRole("button", { name: "Sim", exact: true }).click();
  const vehicle = page.getByTestId("WIN_Form_Viaturas");
  await expect(vehicle.getByTestId("EDT_Matricula")).toHaveValue("CREATE-ME");
  await vehicle.getByTestId("EDT_Marca").fill("NEW MAKE"); await vehicle.getByTestId("EDT_Modelo").fill("NEW MODEL");
  await vehicle.getByTestId("COMBO_Codigo").selectOption("1"); await vehicle.getByTestId("BTN_Validar").click();
  await expect(vehicle).toHaveCount(0);
  const date = page.getByTestId("WIN_Data"); await expect(date).toBeVisible();
  await expect(form.getByTestId("EDT_Cliente")).toHaveValue("CLIENTE RECEPÇÃO");
  await expect(form.getByTestId("EDT_Marca_Modelo")).toHaveValue("ORIGINAL ORIGINAL");
  await date.getByTestId("BTN_Confirmar").click(); await expect(form).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "recepcao_cliente"::text,"recepacao_contatos" FROM app."ordem_reparacao" WHERE "numero"=12')).rows[0]).toEqual({ recepcao_cliente: "3", recepacao_contatos: " 210  \r\n 910 " });
  expect((await repairDatabase.query('SELECT "Cliente"::text FROM app."Viaturas" WHERE "matricula"=$1', ["CREATE-ME"])).rows[0].Cliente).toBe("1");
});

test("SRC-b0064a0577 SRC-11d401c5a4 actual vehicle warning/selection and third-party cancel use real current data", async ({ page, repairServer, repairDatabase }) => {
  await repairDatabase.query('INSERT INTO app."material_reparacao" ("numero") VALUES (10)');
  const screen = await openList(page, repairServer.origin), form = await edit(page, screen);
  await form.getByTestId("BTN_VISION1").click();
  const warning = await info(page, "Ordem de reparação já tem movimentos de material e/ou tempos.\r\nTem a certeza que pretende alterar a matrícula?");
  await warning.getByTestId("BTN_NON").click(); await expect(page.getByTestId("vehicle-picker")).toHaveCount(0);
  await form.getByTestId("BTN_VISION1").click(); await (await info(page, "Ordem de reparação já tem movimentos de material e/ou tempos.\r\nTem a certeza que pretende alterar a matrícula?")).getByTestId("BTN_OUI").click();
  const picker = page.getByTestId("vehicle-picker"); await expect(picker.getByTestId("BTN_selecionar")).toBeEnabled();
  await picker.getByTestId("TABLE_Viaturas").getByRole("row").filter({ hasText: "BB-00-BB" }).dblclick();
  await expect(form.getByTestId("EDT_matricula")).toHaveValue("BB-00-BB");
  await expect(form.getByTestId("EDT_Marca_Modelo")).toHaveValue("FORD TRANSIT");
  await expect(form.getByTestId("EDT_Cliente")).toHaveValue("TERCEIRO"); await expect(form.getByTestId("EDT_Contactos")).toHaveValue("");
  await form.getByTestId("BTN_VISION4").click(); const customer = page.getByTestId("customer-picker");
  await expect(customer.getByTestId("BTN_selecionar")).toBeEnabled();
  await customer.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: "CLIENTE RECEPÇÃO" }).dblclick();
  await expect(form.getByTestId("EDT_Terceiro")).toHaveValue("1"); await expect(form.getByTestId("EDT_Terceiro_Descricao")).toHaveValue("CLIENTE RECEPÇÃO");
  await repairDatabase.query('UPDATE app."Clientes" SET "Descricao"=$1 WHERE "Codigo"=1', ["CURRENT THIRD"]);
  await form.getByTestId("BTN_VISION4").click(); await expect(customer.getByTestId("BTN_selecionar")).toBeEnabled();
  await customer.getByTestId("BTN_Fechar").click();
  await expect(form.getByTestId("EDT_Terceiro")).toHaveValue("1"); await expect(form.getByTestId("EDT_Terceiro_Descricao")).toHaveValue("CURRENT THIRD");
  expect((await repairDatabase.query('SELECT "matricula","recepcao_terceiro"::text FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toEqual({ matricula: "AA-00-AA", recepcao_terceiro: "2" });
});
