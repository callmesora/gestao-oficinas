import type { Page, Locator } from "@playwright/test";
import { test, expect, fieldContract, sourceFields, readOnlyEntry, textEntry, type Unit } from "./support/proof-fields";

async function labor(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click();
  const screen = page.getByTestId("WIN_Tempos_Reparacao"); await expect(screen.getByTestId("LIST_mecanicos")).toBeEnabled();
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click(); return screen;
}
async function material(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-materials`); await page.getByTestId("repair-materials-open").click();
  const list = page.locator('[data-layout="WIN_Material_Reparacao"]');
  await list.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click(); await list.getByTestId("BTN_Material").click();
  const form = page.getByTestId("WIN_Material_reparacao_form"); await expect(form.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA"); return { list, form };
}
async function listContract(screen: Locator, unit: Unit) {
  const [name, source] = sourceFields(unit).find(([, item]) => item.kind === "List Box")!;
  const list = screen.getByTestId(name); await expect(list).toBeEnabled();
  const actual = await list.evaluate(element => { const select = element as HTMLSelectElement; return { tag: select.tagName, multiple: select.multiple, disabled: select.disabled, tab: select.tabIndex, x: parseFloat(select.style.left), y: parseFloat(select.style.top), width: parseFloat(select.style.width), height: parseFloat(select.style.height) }; });
  expect(actual).toEqual({ tag: "SELECT", multiple: false, disabled: false, tab: 0, x: source.x, y: source.y, width: source.width, height: source.height });
  await expect(list.locator("option")).toHaveText(["ZULU", "ALFA"]);
  expect(await list.locator("option").evaluateAll(options => options.map(option => (option as HTMLOptionElement).value))).toEqual(["7", "8"]);
  return list;
}

for (const module of ["labor", "materials"] as const) {
  test(`proof fields ${module} mechanic file list keeps source single selection, description and stored code`, async ({ page, fieldsServer, fieldsDatabase }) => {
    await fieldsDatabase.query('UPDATE app."mecanicos" SET "Descricao"=CASE "Codigo" WHEN 7 THEN $1 ELSE $2 END', ["ZULU", "ALFA"]);
    await page.goto(`${fieldsServer.origin}/?workflow=repair-${module}`); await page.getByTestId(`repair-${module}-open`).click();
    const unit = module === "labor" ? "WIN_Tempos_Reparacao" : "WIN_Material_Reparacao", screen = module === "materials" ? page.locator('[data-layout="WIN_Material_Reparacao"]') : page.getByTestId(unit);
    await expect(screen.getByTestId("LIST_mecanicos").locator("option")).toHaveCount(2);
    const list = await listContract(screen, unit);
    const endpoint = module === "labor" ? "/api/repair-labor/list" : "/api/repair-materials/list";
    const chosen = page.waitForResponse(reply => reply.url().endsWith(endpoint)); await list.selectOption("8");
    const result = await chosen; expect((await result.json()).kind).toBe("loaded"); expect(result.request().postDataJSON()).toMatchObject({ mechanic: 8 });
    await expect(list).toHaveValue("8"); expect(await list.locator("option:checked").count()).toBe(1);
    const restored = page.waitForResponse(reply => reply.url().endsWith(endpoint)); await screen.getByTestId("BTN_todos").click(); await restored;
    await expect(screen.getByTestId(module === "labor" ? "TABLE_tempos_reparacao" : "TABLE_ordens_reparacao")).toContainText("AA-00-AA");
  });
}

test("proof fields labor information four source readonly consumers retain actual text, line breaks and customer binding", async ({ page, fieldsServer, fieldsDatabase }) => {
  const screen = await labor(page, fieldsServer.origin); await screen.getByTestId("BTN_Informacao").click();
  const form = page.getByTestId("WIN_Tempos_Reparacao_Informacao");
  await expect(form.getByTestId("EDT_cliente")).toHaveValue("CLIENTE <b>literal</b>");
  const values = { EDT_cliente: "CLIENTE <b>literal</b>", EDT_contactos: "210\n910", EDT_observacao: "Observação original", EDT_servico_avaria: "Serviço <b>literal</b>" };
  for (const [name, value] of Object.entries(values)) await readOnlyEntry(await fieldContract(form, "WIN_Tempos_Reparacao_Informacao", name), value);
  await form.getByTestId("EDT_servico_avaria").focus();
  for (const name of ["EDT_observacao", "EDT_cliente", "EDT_contactos"]) { await page.keyboard.press("Tab"); await expect(form.getByTestId(name)).toBeFocused(); }
  const frame = form.locator(".wd-frame").first(), before = (await frame.boundingBox())!;
  await form.getByTestId("BTN_Syst_Maximize").click();
  const after = (await frame.boundingBox())!, delta = after.width - before.width;
  for (const [name, property] of sourceFields("WIN_Tempos_Reparacao_Informacao")) {
    const wrapper = form.getByTestId(name).locator("..");
    expect(await wrapper.evaluate(element => parseFloat((element as HTMLElement).style.width))).toBe(property.width! + delta);
    await expect(form.getByTestId(name)).toHaveValue(values[name as keyof typeof values]);
  }
  await form.getByTestId("BTN_Syst_Maximize").click(); await form.getByTestId("BTN_Fechar").click();
  expect((await fieldsDatabase.query('SELECT "recepcao_servico","recepcao_obs","recepacao_contatos" FROM app."ordem_reparacao"')).rows).toEqual([{ recepcao_servico: "Serviço <b>literal</b>", recepcao_obs: "Observação original", recepacao_contatos: "210\r\n910" }]);
});

test("proof fields labor state five source consumers bind datetime, readonly history and edited descriptions to database", async ({ page, fieldsServer, fieldsDatabase }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 26, 10, 11, 12, 345));
  const screen = await labor(page, fieldsServer.origin); await screen.getByTestId("BTN_Estado").click();
  const form = page.getByTestId("WIN_Tempos_Reparacao_Estado"); await expect(form.getByTestId("BTN_Confirmar")).toBeEnabled();
  for (const [name] of sourceFields("WIN_Tempos_Reparacao_Estado")) await fieldContract(form, "WIN_Tempos_Reparacao_Estado", name);
  await readOnlyEntry(form.getByTestId("EDT_historico"), "Histórico original");
  await readOnlyEntry(form.getByTestId("EDT_matricula_marca_modelo"), "AA-00-AA      MARCA MODELO");
  await form.getByTestId("EDT_Data_Hora").fill("29/02/2024 23:59"); await form.getByTestId("EDT_descricao").fill("Descrição <b>literal</b>"); await form.getByTestId("EDT_obs_servico").fill("Primeira\nÚltima");
  await form.getByTestId("TABLE_Estados_reparacao").getByRole("cell", { name: "Outro estado", exact: true }).click();
  await form.getByTestId("BTN_Confirmar").click(); await expect(form).toHaveCount(0);
  expect((await fieldsDatabase.query('SELECT "reparacao_estado","reparacao_estado_obs","reparacao_servico","reparacao_estado_historico","reparacao_estado_data" FROM app."ordem_reparacao"')).rows[0]).toMatchObject({ reparacao_estado: "N", reparacao_estado_obs: "Descrição <b>literal</b>", reparacao_servico: "Primeira\nÚltima", reparacao_estado_data: "20240229235912345", reparacao_estado_historico: expect.stringContaining("Descrição <b>literal</b>") });
});

test("proof fields labor time two source readonly consumers follow current selected mechanic and preserve physical input", async ({ page, fieldsServer }) => {
  const screen = await labor(page, fieldsServer.origin); await screen.getByTestId("LIST_mecanicos").selectOption("7");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell", { name: "10", exact: true }).click(); await screen.getByTestId("BTN_Tempos").click();
  const form = page.getByTestId("WIN_Tempos_Reparacao_Tempo"); await expect(form.getByTestId("EDT_mecanico")).toHaveValue("ANA");
  await readOnlyEntry(await fieldContract(form, "WIN_Tempos_Reparacao_Tempo", "EDT_mecanico"), "ANA");
  await readOnlyEntry(await fieldContract(form, "WIN_Tempos_Reparacao_Tempo", "EDT_matricula_marca_modelo"), "AA-00-AA\nMARCA MODELO");
  await form.getByTestId("BTN_NoName1").click(); await page.getByTestId("mechanic-picker").getByRole("cell", { name: "BRUNO", exact: true }).dblclick();
  const password = page.getByTestId("WIN_Inserir_quantidade_password"); await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
  await expect(form.getByTestId("EDT_mecanico")).toHaveValue("BRUNO"); await expect(form.getByTestId("EDT_matricula_marca_modelo")).toHaveValue("AA-00-AA\nMARCA MODELO");
});

test("proof fields repair details tab pages expose all three source readonly values without resetting their data", async ({ page, fieldsServer }) => {
  await page.goto(`${fieldsServer.origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click(); const list = page.getByTestId("WIN_Ordens_Reparacao");
  await expect(list.getByTestId("repair-order-read-state")).toHaveText("ready"); await list.getByTestId("BTN_Nenhum").click(); await list.getByTestId("BTN_Actualizar_Dados").click();
  await list.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell", { name: "10", exact: true }).click(); await list.getByTestId("BTN_informacao").click();
  const form = page.getByTestId("WIN_Table_Tempos_materiais_Descricoes"), tabs = form.getByRole("tab"); await expect(tabs).toHaveText(["Tempos", "Materiais", "Descrições/Observações", "Histórico dos estados"]);
  const control = form.getByTestId("TAB_principal"); expect(await control.evaluate(element => { const node = element as HTMLElement; return [node.style.left, node.style.top, node.style.width, node.style.height]; })).toEqual(["19px", "36px", "596px", "435px"]);
  await form.getByRole("tab", { name: "Descrições/Observações", exact: true }).click();
  await readOnlyEntry(await fieldContract(form, "WIN_Table_Tempos_materiais_Descricoes", "EDT_servico_avaria"), "Serviço <b>literal</b>");
  await readOnlyEntry(await fieldContract(form, "WIN_Table_Tempos_materiais_Descricoes", "EDT_observacao"), "Observação original");
  await form.getByRole("tab", { name: "Histórico dos estados", exact: true }).click();
  await readOnlyEntry(await fieldContract(form, "WIN_Table_Tempos_materiais_Descricoes", "EDT_historico_estado"), "Histórico original");
  for (const tab of await tabs.all()) { await tab.click(); await expect(tab).toHaveAttribute("aria-selected", "true"); expect(await tabs.evaluateAll(nodes => nodes.filter(node => node.getAttribute("aria-selected") === "true").length)).toBe(1); }
  await form.getByRole("tab", { name: "Descrições/Observações", exact: true }).click(); await expect(form.getByTestId("EDT_servico_avaria")).toHaveValue("Serviço <b>literal</b>");
});

test("proof fields material editor six source field bindings retain readonly identity, text limits and exact quantity draft", async ({ page, fieldsServer, fieldsDatabase }) => {
  const { form } = await material(page, fieldsServer.origin);
  for (const [name] of sourceFields("WIN_Material_reparacao_form")) await fieldContract(form, "WIN_Material_reparacao_form", name);
  for (const [name, value] of Object.entries({ EDT_matricula: "AA-00-AA", EDT_marca_modelo: "MARCA MODELO", EDT_mecanico: "ANA" })) await readOnlyEntry(form.getByTestId(name), value);
  await form.getByTestId("EDT_artigo").fill("A"); await form.getByTestId("EDT_quant").focus(); await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Artigo <b>literal</b>");
  await textEntry(form.getByTestId("EDT_artigo_descricao"), "D".repeat(120), 100, true); await form.getByTestId("EDT_artigo_descricao").fill("Edited literal");
  await form.getByTestId("EDT_quant").fill("999 999,999"); await form.getByTestId("EDT_quant").pressSequentially("9x"); await expect(form.getByTestId("EDT_quant")).toHaveValue("999 999,999");
  await form.getByTestId("EDT_quant").fill("0,000"); await expect(form.getByTestId("EDT_quant")).toHaveValue("0,000");
  expect((await fieldsDatabase.query('SELECT "quantidade"::text FROM app."material_reparacao"')).rows).toEqual([{ quantidade: "2" }]);
});

test("proof fields material password source contract limits actual credential input and returns authenticated actor", async ({ page, fieldsServer }) => {
  const { form } = await material(page, fieldsServer.origin); await form.getByTestId("EDT_artigo").fill("B"); await form.getByTestId("EDT_quant").focus(); await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Segundo");
  await form.getByTestId("BTN_Adicionar").click(); const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  const input = await fieldContract(prompt, "WIN_Inserir_quantidade_password", "EDT_password"); await textEntry(input, "abcdefghijklmnopqrst", 15, true);
  await input.fill("Synthetic"); await prompt.getByTestId("BTN_Confirmar").click(); await expect(prompt).toHaveCount(0); await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(2);
});

test("proof fields material quantity and description prompts retain source input semantics and caller-adjusted geometry", async ({ page, fieldsServer, fieldsDatabase }) => {
  const { form } = await material(page, fieldsServer.origin);
  await form.getByTestId("TABLE_material").getByRole("cell", { name: "Material original", exact: true }).click();
  await form.getByTestId("BTN_Quantidade").click(); const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  const quantity = await fieldContract(prompt, "WIN_Inserir_quantidade_password", "EDT_quantidade");
  await quantity.fill("999999,999"); await quantity.pressSequentially("9x"); await expect(quantity).toHaveValue("999999,999");
  await quantity.fill("0,000"); await expect(quantity).toHaveValue("0,000"); await prompt.getByTestId("BTN_Cancelar").click();
  await expect(form.getByTestId("TABLE_material")).toContainText("2,000");
  await form.getByTestId("BTN_Descricao").click();
  const description = await fieldContract(prompt, "WIN_Inserir_quantidade_password", "EDT_descricao", { geometry: false });
  // Source description caller adds200 to the initial317px field; this does not prove the raw MoneySystemMask interpretation.
  expect(await description.locator("..").evaluate(element => (element as HTMLElement).style.width)).toBe("517px");
  await textEntry(description, "<b>literal</b>".repeat(20), 0, true);
  await description.fill("0"); await prompt.getByTestId("BTN_Confirmar").click(); await expect(prompt).toHaveCount(0);
  await expect(form.getByTestId("TABLE_material")).toContainText("0");
  expect((await fieldsDatabase.query('SELECT "descricao_artigo","quantidade"::text FROM app."material_reparacao"')).rows).toEqual([{ descricao_artigo: "Material original", quantidade: "2" }]);
  await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
  expect((await fieldsDatabase.query('SELECT "descricao_artigo","quantidade"=2 AS quantity_intact FROM app."material_reparacao"')).rows).toEqual([{ descricao_artigo: "0", quantity_intact: true }]);
});
