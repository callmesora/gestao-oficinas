import type { Locator, Page } from "@playwright/test";
import { test, expect, fieldContract, choiceContract, readOnlyEntry, sourceFields, textEntry } from "./support/proof-fields";

async function launch(page: Page, origin: string, route: string, button: string, unit: string) {
  await page.goto(`${origin}/?workflow=${route}`); await page.getByTestId(button).click();
  const screen = page.getByTestId(unit); await expect(screen).toHaveCount(1); return screen;
}
async function repairList(page: Page, origin: string) {
  const screen = await launch(page, origin, "repair-orders", "repair-orders-open", "WIN_Ordens_Reparacao");
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready"); return screen;
}
async function repairForm(page: Page, origin: string) {
  const list = await repairList(page, origin);
  await list.getByTestId("BTN_Nenhum").click(); await list.getByTestId("BTN_Actualizar_Dados").click();
  await list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click();
  await list.getByTestId("BTN_Alterar").click();
  const form = page.getByTestId("WIN_Ordens_Reparacao_Form");
  await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready"); return form;
}
async function filter(page: Page, origin: string, button: string, unit: string) {
  return launch(page, origin, "report-filters", button, unit);
}
async function rendered(page: Page, screen: Locator, button: string) {
  const response = page.waitForResponse(reply => reply.url().endsWith("/api/reports/render"));
  await screen.getByTestId(button).click(); const result = await response;
  expect(result.ok()).toBe(true); expect((await result.json()).kind).toBe("rendered");
  const request = result.request().postDataJSON();
  await page.locator("dialog.report-preview").getByRole("button", { name: "Fechar", exact: true }).click();
  return request;
}

test("proof fields system six source edits preserve masks, selection and exact protected database bindings", async ({ page, fieldsServer, fieldsDatabase }) => {
  await launch(page, fieldsServer.origin, "menu", "startup-development-open", "WIN_MENU");
  const menu = page.getByTestId("WIN_MENU"); await menu.getByText("Menu", { exact: true }).click(); await menu.getByTestId("OPT_Sistema").click();
  const screen = page.getByTestId("WIN_sistema"); await expect(screen.getByTestId("EDT_Atualizacao_materiais")).toHaveValue("60");
  for (const [name] of sourceFields("WIN_sistema")) await fieldContract(screen, "WIN_sistema", name);
  const traversal = ["EDT_Atualizacao_ordens_reparacao", "EDT_Atualizacao_materiais", "EDT_Atualizacao_tempos", "EDT_Data_inicio", "EDT_encerrar_tempos_1", "EDT_encerrar_tempos_2"];
  await screen.getByTestId(traversal[0]).focus();
  for (const name of traversal.slice(1)) { await page.keyboard.press("Tab"); await expect(screen.getByTestId(name)).toBeFocused(); }
  for (const [name, value] of Object.entries({ EDT_Atualizacao_ordens_reparacao: "9999999999", EDT_Atualizacao_materiais: "0", EDT_Atualizacao_tempos: "42", EDT_Data_inicio: "999", EDT_encerrar_tempos_1: "00:00:00", EDT_encerrar_tempos_2: "23:59:59" })) {
    await screen.getByTestId(name).fill(value); await expect(screen.getByTestId(name)).toHaveValue(value);
  }
  const integer = screen.getByTestId("EDT_Data_inicio"); await integer.pressSequentially("9x"); await expect(integer).toHaveValue("999");
  await screen.getByTestId("BTN_Guardar").click(); await expect(screen).toHaveCount(0);
  expect((await fieldsDatabase.query('SELECT "Tempo_ordem_reparacao"::text,"Tempo_materiais"::text,"Tempo_tempos"::text,"Data_inicio","encerrar_tempos1","encerrar_tempos2" FROM app."sistema"')).rows).toEqual([{ Tempo_ordem_reparacao: "9999999999", Tempo_materiais: "0", Tempo_tempos: "42", Data_inicio: 999, encerrar_tempos1: "000000", encerrar_tempos2: "235959" }]);
  await menu.getByText("Menu", { exact: true }).click(); await menu.getByTestId("OPT_Sistema").click();
  await expect(screen.getByTestId("EDT_Atualizacao_materiais")).toHaveValue("0");
  await expect(screen.getByTestId("EDT_encerrar_tempos_1")).toHaveValue("00:00:00");
});

test("proof fields access source password limit and readonly selected user reach actual protected comparison", async ({ page, fieldsServer }) => {
  const access = await launch(page, fieldsServer.origin, "menu", "startup-access-open", "WIN_Acesso");
  await access.getByTestId("BTN_NoName1").click(); await page.getByTestId("user-picker").getByRole("cell", { name: "RECEPÇÃO", exact: true }).dblclick();
  await readOnlyEntry(await fieldContract(access, "WIN_Acesso", "EDT_utilizador"), "RECEPÇÃO");
  const password = await fieldContract(access, "WIN_Acesso", "EDT_palavra_passe");
  await textEntry(password, "abcdefghijklmnopqrst", 15, true);
  await password.fill("synthetic"); const result = page.waitForResponse(reply => reply.url().endsWith("/api/startup/access"));
  await access.getByTestId("BTN_Confirmar").click(); await result;
  await expect(access).toHaveCount(0); await expect(page.getByTestId("WIN_MENU")).toBeVisible();
});

for (const original of ["20240229", "00000000", "", null] as const) {
  test(`proof fields date source contract keeps ${String(original)} distinct from explicit clear and cancellation`, async ({ page, fieldsServer }) => {
    const query = original === null ? "kind=null" : `value=${encodeURIComponent(original)}`;
    const form = await launch(page, fieldsServer.origin, `date-prompt&${query}`, "date-prompt-open", "WIN_Data");
    const input = await fieldContract(form, "WIN_Data", "EDT_Data");
    await expect(input).toHaveValue(original === "20240229" ? "29/02/2024" : original === "00000000" ? "00/00/0000" : "");
    await input.fill("31/12/2030"); await input.press("Escape");
    await expect(page.getByTestId("date-prompt-returned")).toHaveText(original ?? "");
    await expect(page.getByTestId("date-prompt-returned-kind")).toHaveText(original === null ? "null" : "string");
    await page.getByTestId("date-prompt-open").click(); await input.fill("01/01/2000"); await input.fill("");
    await form.getByTestId("BTN_Confirmar").click(); await expect(page.getByTestId("date-prompt-returned")).toHaveText("");
    await expect(page.getByTestId("date-prompt-returned-kind")).toHaveText("string");
  });
}

test("proof fields confirmation one-character text and source tab route reach actual challenge result", async ({ page, fieldsServer }) => {
  const screen = await launch(page, fieldsServer.origin, "repair-state-confirmation&state=Reparação", "repair-confirmation-open", "WIN_Mudar_Estado");
  const input = await fieldContract(screen, "WIN_Mudar_Estado", "EDT_Letra");
  await input.fill(""); await input.pressSequentially("ab"); await expect(input).toHaveValue("a");
  await input.press("Tab"); await expect(screen.getByTestId("BTN_Confirmar")).toBeFocused();
  await screen.getByTestId("BTN_Cancelar").click(); await expect(page.getByTestId("repair-confirmation-returned")).toHaveText("0");
});

for (const kind of ["alpha", "numeric"] as const) {
  test(`proof fields ${kind} keyboard source readonly display and offcanvas manual binding reach caller`, async ({ page, fieldsServer }) => {
    const unit = kind === "alpha" ? "WIN_Teclado_Alfa" : "WIN_Teclado_numerico";
    const keyboard = await launch(page, fieldsServer.origin, `touch-keyboards&kind=${kind}&value=12.5&maxLength=0`, "touch-keyboard-open", unit);
    // The alpha source display's active focus handler forwards keyboard entry to its offcanvas manual field.
    const display = await fieldContract(keyboard, unit, "EDT_Texto", { focusRedirect: kind === "alpha" ? "EDT_input_manual" : undefined });
    const manual = await fieldContract(keyboard, unit, "EDT_input_manual");
    expect(await display.evaluate(element => (element as HTMLInputElement).tabIndex)).toBe(-1);
    expect(await manual.evaluate(element => (element as HTMLInputElement).getBoundingClientRect().y)).toBeLessThan((await keyboard.locator(".wd-frame").boundingBox())!.y);
    await expect(manual).toBeFocused(); await page.keyboard.type(kind === "alpha" ? "ab" : "2");
    await expect(display).toHaveValue(kind === "alpha" ? "12.5ab" : "2.");
    await keyboard.getByTestId("BTN_confirmar").click(); await expect(page.getByTestId("touch-keyboard-returned")).toHaveText(kind === "alpha" ? "12.5ab" : "2");
  });
}

for (const mode of ["resumo", "descriminado", "resumo_viatura", "descriminado_viatura"] as const) {
  test(`proof fields material filter ${mode} source limits, zero, selection and dates reach actual report parameters`, async ({ page, fieldsServer }) => {
    test.setTimeout(60000);
    const screen = await filter(page, fieldsServer.origin, `report-filter-material-${mode}`, "WIN_Filtro_Mapas_Artigos");
    const byVehicle = mode.endsWith("viatura"), suffix = byVehicle ? "1" : mode === "descriminado" ? "2" : "";
    const names = [`EDT_Do_artigo${suffix}`, `EDT_Ao_artigo${suffix}`, `EDT_Da_data${byVehicle ? "1" : ""}`, `EDT_a_data${byVehicle ? "1" : ""}`];
    if (byVehicle) names.push("EDT_Da_viatura", "EDT_a_viatura");
    if (mode === "descriminado") names.push("EDT_Descriçªo");
    for (const name of names) {
      const field = await fieldContract(screen, "WIN_Filtro_Mapas_Artigos", name, { name: name === "EDT_Descriçªo" ? "EDT_Descrição" : name });
      if (name.includes("artigo") || name.includes("viatura") || name === "EDT_Descriçªo") await textEntry(field, "<b>literal</b>012345678901234567890123456789", name.includes("viatura") ? 15 : 30, false);
    }
    await screen.getByTestId(names[0]).fill("A"); await screen.getByTestId(names[1]).fill("B");
    await screen.getByTestId(names[2]).fill("29/02/2024"); await screen.getByTestId(names[3]).fill("01/03/2024");
    if (byVehicle) { await screen.getByTestId("EDT_Da_viatura").fill("AA-00-AA"); await screen.getByTestId("EDT_a_viatura").fill("BB-00-BB"); }
    else { await screen.getByTestId("CBOX_doc[1]").check(); await expect(screen.getByTestId("CBOX_doc[1]")).toBeChecked(); await expect(screen.getByTestId("CBOX_doc[2]")).not.toBeChecked(); }
    if (mode === "descriminado") await screen.getByTestId("EDT_Descrição").fill("literal");
    const payload = await rendered(page, screen, byVehicle ? "BTN_Visualizar_impressão1" : "BTN_Visualizar_impressão");
    expect(payload.source.parameters).toMatchObject({ ParamDaData: "20240229000000", ParamAData: "20240301235959", ParamDoArtigo: "A", ParamAoArtigo: "B" });
    if (byVehicle) expect(payload.source.parameters).toMatchObject({ ParamDaViatura: "AA-00-AA", ParamAViatura: "BB-00-BB" });
    if (mode === "descriminado") expect(payload.source.parameters.ParamDescricao).toBe("literal");
  });
}

for (const mode of ["ordem_reparacao", "mecanico_descriminado", "mecanico_resumo", "viatura"] as const) {
  test(`proof fields labor filter ${mode} source masks and controlled values reach actual report parameters`, async ({ page, fieldsServer }) => {
    test.setTimeout(60000);
    const screen = await filter(page, fieldsServer.origin, `report-filter-labor-${mode}`, "WIN_Filtro_Mapas_Tempos");
    const vehicle = mode === "viatura", mechanic = mode.startsWith("mecanico"), names = vehicle ? ["EDT_Da_viatura", "EDT_a_viatura"] : mechanic ? ["EDT_Do_mecanico", "EDT_Ao_mecanico"] : ["EDT_Da_ordem", "EDT_a_ordem"];
    for (const name of [...names, "EDT_Da_data", "EDT_a_data"]) await fieldContract(screen, "WIN_Filtro_Mapas_Tempos", name);
    for (const name of names) {
      const input = screen.getByTestId(name);
      if (vehicle) await textEntry(input, "abcdefghijklmnopq", 15, false);
      else { await input.fill(mechanic ? "99" : "9999999999"); await input.pressSequentially("9x"); await expect(input).toHaveValue(mechanic ? "99" : "9999999999"); await input.fill("0"); await expect(input).toHaveValue("0"); }
    }
    await screen.getByTestId(names[0]).fill(vehicle ? "AA-00-AA" : "7"); await screen.getByTestId(names[1]).fill(vehicle ? "BB-00-BB" : "8");
    await screen.getByTestId("EDT_Da_data").fill("29/02/2024"); await screen.getByTestId("EDT_a_data").fill("01/03/2024");
    const payload = await rendered(page, screen, "BTN_Visualizar_impressão");
    expect(payload.source.parameters).toMatchObject({ ParamDaData: "20240229000000", ParamAData: "20240301235959" });
    expect(Object.values(payload.source.parameters)).toContain(vehicle ? "AA-00-AA" : "7");
    expect(Object.values(payload.source.parameters)).toContain(vehicle ? "BB-00-BB" : "8");
  });
}

for (const mode of ["vendas", "recebimentos"] as const) {
  test(`proof fields ${mode} date range source contract dispatches both edited dates`, async ({ page, fieldsServer }) => {
    const screen = await filter(page, fieldsServer.origin, `report-filter-sales-${mode}`, "WIN_Mapa_Vendas");
    for (const name of ["EDT_Da_data", "EDT_A_data"]) await fieldContract(screen, "WIN_Mapa_Vendas", name);
    await screen.getByTestId("EDT_Da_data").fill("29/02/2024"); await screen.getByTestId("EDT_A_data").fill("01/03/2024");
    const payload = await rendered(page, screen, "BTN_Visualizar_impressão1");
    expect(payload.source.parameters).toMatchObject({ ParamDaData: "20240229", ParamAData: "20240301" });
  });
}

test("proof fields repair list source masks, dates, priority and mechanic draft feed one real refresh", async ({ page, fieldsServer }) => {
  const screen = await repairList(page, fieldsServer.origin);
  for (const [name, property] of sourceFields("WIN_Ordens_Reparacao")) if (property.kind === "Edit control") await fieldContract(screen, "WIN_Ordens_Reparacao", name);
  await textEntry(screen.getByTestId("EDT_matricula"), "abcdefghijklmnop", 15, true);
  const client = screen.getByTestId("EDT_cliente"); await client.fill("9999999999"); await client.pressSequentially("9x"); await expect(client).toHaveValue("9999999999"); await client.fill("0"); await expect(client).toHaveValue("0");
  for (const [name, value] of Object.entries({ EDT_data_entrada_inicio: "28/02/2024 00:00", EDT_data_entrada_fim: "01/03/2024 23:59", EDT_data_entrega_inicio: "28/02/2024", EDT_data_entrega_fim: "02/03/2024" })) await screen.getByTestId(name).fill(value);
  await choiceContract(screen, "WIN_Ordens_Reparacao", "COMBO_mecanico");
  await screen.getByTestId("EDT_matricula").fill("AA"); await screen.getByTestId("COMBO_mecanico").selectOption({ label: "ANA" });
  const radios = screen.getByTestId("RADIO_prioridade").getByRole("radio"); await expect(radios).toHaveText(["Todos", "Normal", "Elevada", "Urgente"]);
  for (const radio of await radios.all()) { await radio.click(); await expect(radio).toBeChecked(); }
  await screen.getByTestId("RADIO_prioridade").getByRole("radio", { name: "Normal", exact: true }).click();
  const response = page.waitForResponse(reply => reply.url().endsWith("/api/repair-orders/list")); await screen.getByTestId("BTN_Nenhum").click(); await screen.getByTestId("BTN_Actualizar_Dados").click();
  const result = await response; expect(result.request().postDataJSON()).toMatchObject({ customer: "0", mechanic: 7, priority: 1, registration: "AA", states: [] });
  expect((await result.json()).kind).toBe("loaded"); await expect(client).toHaveValue("0");
});

test("proof fields repair form twenty source consumers retain readonly values, text and selections through actual save", async ({ page, fieldsServer, fieldsDatabase }) => {
  const form = await repairForm(page, fieldsServer.origin);
  for (const [name, property] of sourceFields("WIN_Ordens_Reparacao_Form")) if (property.kind === "Edit control") await fieldContract(form, "WIN_Ordens_Reparacao_Form", name, { readOnly: name === "EDT_matricula" ? true : undefined });
  for (const [name, expected] of Object.entries({ EDT_Ordem_n: "10", EDT_matricula: "AA-00-AA", EDT_Cliente: "CLIENTE <b>literal</b>", EDT_Marca_Modelo: "MARCA MODELO", EDT_Terceiro: "2", EDT_Terceiro_Descricao: "TERCEIRO" })) await readOnlyEntry(form.getByTestId(name), expected);
  for (const name of ["EDT_Contactos", "EDT_servico_avaria", "EDT_observacao"]) {
    const field = form.getByTestId(name); await field.fill("Primeira\n<b>literal</b>\nÚltima"); await expect(field).toHaveValue("Primeira\n<b>literal</b>\nÚltima");
  }
  await form.getByTestId("EDT_KM").fill("9999999999"); await form.getByTestId("EDT_KM").pressSequentially("9x"); await expect(form.getByTestId("EDT_KM")).toHaveValue("9999999999");
  await textEntry(form.getByTestId("EDT_Nr_Fatura"), "FT".repeat(20), 0, true); await form.getByTestId("EDT_Nr_Fatura").fill("FT <literal>");
  await form.getByTestId("EDT_Total_Pago").fill("999999999,99"); await form.getByTestId("EDT_Total_Pago").pressSequentially("9x"); await expect(form.getByTestId("EDT_Total_Pago")).toHaveValue("999999999,99");
  for (const name of ["COMBO_estado", "COMBO_mecanico", "COMBO_Recepcionado", "COMBO_Prioridade"]) await choiceContract(form, "WIN_Ordens_Reparacao_Form", name);
  await form.getByTestId("COMBO_mecanico").selectOption({ label: "BRUNO" }); await form.getByTestId("COMBO_Recepcionado").selectOption({ label: "OUTRA RECEPÇÃO" }); await form.getByTestId("COMBO_Prioridade").selectOption({ label: "Urgente" });
  await form.getByTestId("EDT_data_hora_entrada").fill("29/02/2024 23:59"); await form.getByTestId("EDT_data_entrega").fill("02/03/2024"); await form.getByTestId("EDT_Data_pagamento").fill("03/03/2024");
  await form.getByTestId("BTN_Gravar").click(); await expect(form).toHaveCount(0);
  expect((await fieldsDatabase.query('SELECT "km_viatura"::text,"recepcao_prioridade","recepcao_util","reparacao_mecanico","numero_fatura","total_pago"::text,"recepcao_entrega_prevista","data_pagamento","recepcao_servico","recepcao_obs","recepacao_contatos" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0]).toMatchObject({ km_viatura: "9999999999", recepcao_prioridade: 3, recepcao_util: 2, reparacao_mecanico: 8, numero_fatura: "FT <literal>", total_pago: "999999999.99", recepcao_entrega_prevista: "20240302", data_pagamento: "20240303", recepcao_servico: "Primeira\r\n<b>literal</b>\r\nÚltima", recepcao_obs: "Primeira\r\n<b>literal</b>\r\nÚltima", recepacao_contatos: "Primeira\r\n<b>literal</b>\r\nÚltima" });
});

test("proof fields repair form explicit empty, zero and invoice checkbox remain distinct from untouched NULL", async ({ page, fieldsServer, fieldsDatabase }) => {
  await fieldsDatabase.query('UPDATE app."ordem_reparacao" SET "recepcao_obs"=NULL,"recepacao_contatos"=NULL,"numero_fatura"=NULL,"total_pago"=NULL,"faturado"=NULL');
  const form = await repairForm(page, fieldsServer.origin);
  await expect(form.getByTestId("EDT_observacao")).toHaveValue(""); await expect(form.getByTestId("EDT_Contactos")).toHaveValue(""); await expect(form.getByTestId("EDT_Total_Pago")).toHaveValue("");
  await form.getByTestId("EDT_observacao").fill("edited"); await form.getByTestId("EDT_observacao").fill("");
  await form.getByTestId("EDT_Total_Pago").fill("0,00"); await expect(form.getByTestId("EDT_Total_Pago")).toHaveValue("0,00");
  await expect(form.getByTestId("EDT_Nr_Fatura")).toBeVisible(); await form.getByTestId("CBOX_faturado").check(); await expect(form.getByTestId("EDT_Nr_Fatura")).toBeVisible();
  await form.getByTestId("EDT_Nr_Fatura").fill("0"); await form.getByTestId("CBOX_faturado").uncheck(); await expect(form.getByTestId("EDT_Nr_Fatura")).toBeHidden();
  await form.getByTestId("CBOX_faturado").check(); await expect(form.getByTestId("EDT_Nr_Fatura")).toHaveValue("0");
  await form.getByTestId("BTN_Gravar").click(); await expect(form).toHaveCount(0);
  expect((await fieldsDatabase.query('SELECT "recepcao_obs","recepacao_contatos","numero_fatura","total_pago"::text,"faturado" FROM app."ordem_reparacao"')).rows).toEqual([{ recepcao_obs: "", recepacao_contatos: null, numero_fatura: "0", total_pago: "0.00", faturado: true }]);
});

test("proof fields stock header source filters consume typed ranges, dates, description and selected document", async ({ page, fieldsServer }) => {
  const list = await launch(page, fieldsServer.origin, "stock", "stock-open", "WIN_Table_cab_stocks");
  await expect(list.getByTestId("BTN_novo")).toBeEnabled();
  for (const [name, property] of sourceFields("WIN_Table_cab_stocks")) if (property.kind === "Edit control") await fieldContract(list, "WIN_Table_cab_stocks", name);
  await choiceContract(list, "WIN_Table_cab_stocks", "COMBO_tipo_doc");
  await list.getByTestId("COMBO_tipo_doc").selectOption("IN");
  await list.getByTestId("EDT_Da_data").fill("29/02/2024"); await list.getByTestId("EDT_a_data").fill("02/03/2024");
  await list.getByTestId("EDT_Do_n").fill("0"); await expect(list.getByTestId("EDT_Do_n")).toHaveValue("1"); await list.getByTestId("EDT_Ao_n").fill("0"); await expect(list.getByTestId("EDT_Ao_n")).toHaveValue("9999999999");
  await list.getByTestId("EDT_descricao").fill("original"); await expect(list.getByTestId("TABLE_cab_stocks")).toContainText("Documento original");
  await list.getByTestId("EDT_descricao").fill("absent"); await expect(list.getByTestId("TABLE_cab_stocks").locator("tbody tr")).toHaveCount(0);
  await list.getByTestId("EDT_descricao").fill(""); await expect(list.getByTestId("TABLE_cab_stocks")).toContainText("Documento original");
});

test("proof fields stock editor source entry controls persist header, selected mechanic, exact decimal and literal description", async ({ page, fieldsServer, fieldsDatabase }) => {
  const list = await launch(page, fieldsServer.origin, "stock", "stock-open", "WIN_Table_cab_stocks"); await expect(list.getByTestId("BTN_novo")).toBeEnabled(); await list.getByTestId("BTN_novo").click();
  const form = page.getByTestId("WIN_Table_Lin_Stocks"); await expect(form.getByTestId("EDT_Numero")).not.toHaveValue("0");
  for (const [name, property] of sourceFields("WIN_Table_Lin_Stocks")) if (property.kind === "Edit control") await fieldContract(form, "WIN_Table_Lin_Stocks", name);
  await form.getByTestId("COMBO_tipo_doc").selectOption("OUT"); await form.getByTestId("COMBO_mecanico").selectOption("7");
  await choiceContract(form, "WIN_Table_Lin_Stocks", "COMBO_tipo_doc"); await choiceContract(form, "WIN_Table_Lin_Stocks", "COMBO_mecanico");
  // The source quantity Exit schedules focus on price; allow that real pending focus handoff to finish before editing the header.
  await form.getByTestId("EDT_preco").focus(); await expect(form.getByTestId("EDT_preco")).toBeFocused();
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await textEntry(form.getByTestId("EDT_descricao"), "D".repeat(120), 100, true); await form.getByTestId("EDT_descricao").fill("Header <literal>");
  await form.getByTestId("EDT_Data").fill("29/02/2024"); await form.getByTestId("EDT_codigo").fill("A"); await form.getByTestId("EDT_quant").focus();
  await expect(form.getByTestId("EDT_descricao_Artigo")).toHaveValue("Artigo <b>literal</b>");
  await form.getByTestId("EDT_quant").fill("999999,999"); await form.getByTestId("EDT_quant").pressSequentially("9x"); await expect(form.getByTestId("EDT_quant")).toHaveValue("999999,999");
  await form.getByTestId("EDT_quant").fill("1,125"); await form.getByTestId("EDT_preco").fill("2,50");
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await textEntry(form.getByTestId("EDT_descricao_Artigo"), "L".repeat(130), 100, true); await form.getByTestId("EDT_descricao_Artigo").fill("Linha <b>literal</b>");
  await form.getByTestId("BTN_Adicionar").click();
  await form.getByTestId("BTN_Confirmar").click(); await expect(form).toHaveCount(0);
  expect((await fieldsDatabase.query('SELECT "documento_codigo","Descricao","data","mecanico" FROM app."cab_stocks" WHERE "documento_codigo"=$1', ["OUT"])).rows).toEqual([{ documento_codigo: "OUT", Descricao: "Header <literal>", data: "20240229", mecanico: 7 }]);
  expect((await fieldsDatabase.query('SELECT "descricao_artigo","quantidade"::text,"preco"::text FROM app."lin_stocks"')).rows).toEqual([{ descricao_artigo: "Linha <b>literal</b>", quantidade: "1.125", preco: "2.50" }]);
});

test("proof fields statement four source inputs retain range and feed the actual report caller", async ({ page, fieldsServer }) => {
  const screen = await launch(page, fieldsServer.origin, "stock-statement", "stock-statement-open", "WIN_Extrato_Artigos");
  for (const [name] of sourceFields("WIN_Extrato_Artigos")) await fieldContract(screen, "WIN_Extrato_Artigos", name);
  for (const name of ["EDT_Do_artigo", "EDT_Ao_artigo"]) await textEntry(screen.getByTestId(name), "A".repeat(40), 30, false);
  await screen.getByTestId("EDT_Do_artigo").fill("A"); await screen.getByTestId("EDT_Ao_artigo").fill("B"); await screen.getByTestId("EDT_Da_data").fill("29/02/2024"); await screen.getByTestId("EDT_a_data").fill("01/03/2024");
  const request = await rendered(page, screen, "BTN_Visualizar_impressão"); expect(request).toMatchObject({ reportId: "RPT_Extrato_artigos" }); expect(request.source).toMatchObject({ kind: "query", articleFrom: "A", articleTo: "B", from: "20240229000000", to: "20240301235959" });
});
