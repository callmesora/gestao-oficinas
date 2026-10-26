import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/repair-materials";
import {sourceSimpleControls} from "./support/proof-repair-properties";

const promptId = "WIN_Inserir_quantidade_password";
async function list(page: Page, origin: string, restricted = false, count = 1) {
  await page.goto(`${origin}/?workflow=repair-materials${restricted ? "&restricted=1" : ""}`);
  await page.getByTestId("repair-materials-open").click();
  const screen = page.locator('[data-layout="WIN_Material_Reparacao"]');
  await expect(screen.getByTestId("TABLE_ordens_reparacao").locator("tbody tr")).toHaveCount(count);
  return screen;
}
async function editor(page: Page, origin: string) {
  const screen = await list(page, origin);
  await screen.getByTestId("TABLE_ordens_reparacao").locator("tbody tr").click();
  await screen.getByTestId("BTN_Material").click();
  const form = page.getByTestId("WIN_Material_reparacao_form");
  await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(1);
  await form.getByTestId("TABLE_material").locator("tbody tr").click(); return form;
}
async function font(control: Locator) { return control.evaluate(element => parseFloat(getComputedStyle(element).fontSize)); }
async function relativeBox(control: Locator, frame: Locator) {
  const a = (await control.boundingBox())!, b = (await frame.boundingBox())!;
  return { x: a.x - b.x, y: a.y - b.y, width: a.width, height: a.height };
}

test("proof repair material initialization executes every unrestricted1..8 and restricted2/3/5 branch with true material flags", async ({ page, materialServer, materialDatabase }) => {
  await materialDatabase.query(`TRUNCATE app."ordem_reparacao",app."estados_reparacao" RESTART IDENTITY;
    INSERT INTO app."estados_reparacao" ("Codigo","tipo","lancar_material") SELECT 'T'||n,n,TRUE FROM generate_series(1,8) n;
    INSERT INTO app."estados_reparacao" ("Codigo","tipo","lancar_material") VALUES ('FALSE',2,FALSE),('NULL',3,NULL);
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") SELECT n,'AA-00-AA',7,'T'||n FROM generate_series(1,8) n;
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES (20,'AA-00-AA',7,'FALSE'),(21,'AA-00-AA',7,'NULL')`);
  const all = await list(page, materialServer.origin, false, 8);
  expect(await all.getByTestId("TABLE_ordens_reparacao").locator('tbody tr td:first-child').allTextContents()).toEqual(["1","2","3","4","5","6","7","8"]);
  await all.getByTestId("BTN_Fechar").click(); await expect(all).toHaveCount(0);
  const restricted = await list(page, materialServer.origin, true, 3);
  expect(await restricted.getByTestId("TABLE_ordens_reparacao").locator('tbody tr td:first-child').allTextContents()).toEqual(["2","3","5"]);
});

test("proof repair material order arrows stop at both boundaries and actual Fechar closes only its mounted list", async ({ page, materialServer, materialDatabase }) => {
  await materialDatabase.query(`INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES (9007199254740994,'AA-00-AA',7,'R'),(9007199254740995,'AA-00-AA',7,'R')`);
  const screen = await list(page, materialServer.origin, false, 3), table = screen.getByTestId("TABLE_ordens_reparacao"), selected = table.locator('tbody tr[aria-selected="true"]');
  await table.locator('tbody tr').first().click();
  await screen.getByTestId("BTN_anterior").click(); await expect(selected).toContainText("9007199254740993");
  await screen.getByTestId("BTN_seguinte").click(); await expect(selected).toContainText("9007199254740994");
  await screen.getByTestId("BTN_seguinte").click(); await expect(selected).toContainText("9007199254740995");
  await screen.getByTestId("BTN_seguinte").click(); await expect(selected).toContainText("9007199254740995");
  await screen.getByTestId("BTN_anterior").click(); await expect(selected).toContainText("9007199254740994");
  const registration = selected.getByText("AA-00-AA", { exact: true });
  await expect(registration).toHaveCSS("font-size", "12px"); await expect(registration).toHaveCSS("font-weight", "700");
  await screen.getByTestId("BTN_Fechar").click(); await expect(screen).toHaveCount(0);
  await expect(page.getByTestId("repair-materials-open")).toBeVisible();
});

for (const mode of ["quantidade", "preco", "descricao", "password"] as const) test(`proof repair ${mode} prompt has complete runtime initialization and a real keyboard return`, async ({ page, materialServer, materialDatabase }) => {
  const form = await editor(page, materialServer.origin);
  const options = {
    quantidade: { button: "BTN_Quantidade", name: "EDT_quantidade", title: "Alterar quantidade", caption: "Quantidade", initial: "2,000", width: 370, fieldWidth: 317, cancelX: 255 },
    preco: { button: "BTN_Preço", name: "EDT_quantidade", title: "Alterar preço", caption: "Preç", initial: "1,25", width: 370, fieldWidth: 317, cancelX: 255 },
    descricao: { button: "BTN_Descricao", name: "EDT_descricao", title: "Alterar descrição", caption: "Descrição", initial: "Original", width: 570, fieldWidth: 517, cancelX: 455 },
    password: { button: "BTN_Leitor", name: "EDT_password", title: "Inserir palavra-passe", caption: "Palavra-passe", initial: "", width: 370, fieldWidth: 317, cancelX: 255 },
  }[mode];
  await form.getByTestId(options.button).click(); const prompt = page.getByTestId(promptId), frame = page.getByTestId(`repair-material-${mode}-prompt`), field = prompt.getByTestId(options.name);
  await expect(prompt.getByTestId("RADTitle")).toHaveText(options.title); await expect(field).toHaveAccessibleName(options.caption); await expect(field).toHaveValue(options.initial);
  for (const other of ["EDT_quantidade", "EDT_password", "EDT_descricao"].filter(value => value !== options.name)) await expect(prompt.getByTestId(other)).toBeHidden();
  expect((await frame.boundingBox())!.width).toBe(options.width); expect(await relativeBox(field.locator(".."), frame)).toEqual({ x: 26, y: 45, width: options.fieldWidth, height: 38 });
  expect((await relativeBox(prompt.getByTestId("BTN_Cancelar"), frame)).x).toBe(options.cancelX);
  if (mode === "quantidade" || mode === "preco") {
    await expect(field).toHaveAttribute("inputmode", "decimal");
    await field.fill(mode === "preco" ? "1234567890,12" : "123456,123");
    await expect(field).toHaveValue(mode === "preco" ? "1234567890,12" : "123456,123");
    await field.fill(mode === "preco" ? "4,12" : "4,125"); await field.click(); const keyboard = page.getByTestId("WIN_Teclado_numerico");
    await expect(keyboard.getByTestId("BTN_Caption")).toHaveText("Quantidade");
    await keyboard.getByTestId("BTN_limpar").click(); await keyboard.getByTestId("BTN_quatro").click(); await keyboard.getByTestId("BTN_ponto").click(); await keyboard.getByTestId("BTN_um").click(); await keyboard.getByTestId("BTN_dois").click(); await keyboard.getByTestId("BTN_cinco").click();
    await keyboard.getByTestId("BTN_confirmar").click(); await expect(field).toHaveValue("4,125");
    await prompt.getByTestId("BTN_Confirmar").click();
  } else {
    await expect(field).toHaveAttribute("type", mode === "password" ? "password" : "text");
    if (mode === "password") await expect(field).toHaveAttribute("maxlength", "15");
    await field.click(); const keyboard = page.getByTestId("WIN_Teclado_Alfa");
    await expect(keyboard.getByTestId("BTN_Caption")).toHaveText(mode === "password" ? "Palavra-passe" : "Descricao");
    await keyboard.getByTestId("BTN_apagar_tudo").click();
    if (mode === "password") { await keyboard.getByTestId("BTN_CapsLock").click(); await keyboard.getByTestId("BTN_s").click(); for (const letter of "ynthetic") await keyboard.getByTestId(`BTN_${letter}`).click(); }
    else await keyboard.getByTestId("BTN_x").click();
    await keyboard.getByTestId("BTN_confirmar").click(); await expect(field).toHaveValue(mode === "password" ? "Synthetic" : "x");
    await prompt.getByTestId("BTN_Confirmar").click();
  }
  await expect(prompt).toHaveCount(0);
  if (mode === "password") { const bridge = page.getByTestId("repair-material-scanner-file"); await expect(bridge).toBeVisible(); await bridge.getByRole("button", { name: "Cancelar", exact: true }).click(); }
  else {
    await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
    const saved = (await materialDatabase.query('SELECT "quantidade"::text,"preco"::text,"descricao_artigo" FROM app."material_reparacao"')).rows[0];
    expect(saved).toEqual(mode === "quantidade" ? { quantidade: "4.125", preco: "1.25", descricao_artigo: "Original" } : mode === "preco" ? { quantidade: "2", preco: "4.125", descricao_artigo: "Original" } : { quantidade: "2", preco: "1.25", descricao_artigo: "x" });
  }
});

test("proof repair material Exit tries barcode then code and awaits missing Info before clearing both actual fields", async ({ page, materialServer }) => {
  const form = await editor(page, materialServer.origin);
  await form.getByTestId("EDT_artigo_descricao").fill("draft retained during lookup");
  await form.getByTestId("EDT_artigo").fill("NONEXISTENT' --"); await form.getByTestId("EDT_quant").focus();
  const message = page.getByTestId("WINDEVMESSAGEBOX"); await expect(message.getByTestId("LIB_INFO")).toHaveText("Artigo não existente");
  await expect(form.getByTestId("EDT_artigo")).toHaveValue("NONEXISTENT' --");
  await message.getByTestId("BTN_OK").click(); await expect(form.getByTestId("EDT_artigo")).toHaveValue(""); await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("");
  await form.getByTestId("EDT_artigo").fill("BAR"); await form.getByTestId("EDT_quant").focus();
  await expect(form.getByTestId("EDT_artigo")).toHaveValue("A"); await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Artigo");
  await form.getByTestId("EDT_artigo").fill("B"); await form.getByTestId("EDT_quant").focus();
  await expect(form.getByTestId("EDT_artigo")).toHaveValue("B"); await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Outro");
});

test("proof repair material complete source scaling covers every20 named control and all5 fixed opening columns", async ({ page, materialServer }) => {
  await page.setViewportSize({ width: 1400, height: 1000 }); const form = await editor(page, materialServer.origin);
  await expect(form.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA"); await expect(form.getByTestId("EDT_marca_modelo")).toHaveValue("MARCA MODELO"); await expect(form.getByTestId("EDT_mecanico")).toHaveValue("ANA"); await expect(form.getByTestId("EDT_quant")).toHaveValue("1,000");
  const scaled = ["STC_Artigo","STC_Mecanico","STC_Quant","STC_Viatura","EDT_matricula","EDT_marca_modelo","EDT_mecanico","EDT_quant","EDT_artigo","EDT_artigo_descricao","BTN_NoName1","BTN_NoName2","BTN_Sair","BTN_Adicionar","BTN_Cancelar","BTN_Eliminar","BTN_seguinte","BTN_anterior","BTN_Leitor","BTN_Quantidade"];
  const columns = ["COL_data_hora","COL_mecanico_descricao","COL_descricao_artigo","COL_quant","COL_preco"];
  const excluded = ["BTN_Preço","BTN_Descricao"];
  const before = new Map(await Promise.all([...scaled,...columns,...excluded].map(async name => [name, await font(form.getByTestId(name))] as const)));
  const row = form.getByTestId("TABLE_material").locator("tbody tr").first(), height = (await row.boundingBox())!.height;
  await page.getByTestId("repair-material-form-frame-resize-e").press("ArrowRight");
  for (const name of scaled) expect(await font(form.getByTestId(name)),name).toBeCloseTo(before.get(name)! * 808 / 800,3);
  for (const name of [...columns,...excluded]) expect(await font(form.getByTestId(name)),name).toBe(before.get(name));
  await page.getByTestId("repair-material-form-frame-resize-s").press("ArrowDown");
  expect((await row.boundingBox())!.height).toBeCloseTo(height * 608 / 600, 1);
  await page.getByTestId("repair-material-form-frame-resize-e").press("ArrowRight");
  for (const name of scaled) expect(await font(form.getByTestId(name)),name).toBeCloseTo(before.get(name)! * 816 / 800,3);
  for (const name of [...columns,...excluded]) expect(await font(form.getByTestId(name)),name).toBe(before.get(name));
});

for (const interval of [null,"0"] as const) test(`proof repair material ${interval === null ? "NULL" : "zero"} timer shows exact Error and keeps usable list`, async ({ page, materialServer, materialDatabase }) => {
  await materialDatabase.query('UPDATE app."sistema" SET "Tempo_materiais"=$1',[interval]);
  await list(page,materialServer.origin); const message = page.getByTestId("WINDEVMESSAGEBOX");
  await expect(message.getByTestId("LIB_INFO")).toHaveText("Erro ao criar timer de atualização"); await message.getByTestId("BTN_OK").click();
  await expect(page.locator('[data-layout="WIN_Material_Reparacao"]').getByTestId("BTN_Material")).toBeEnabled();
});

test("proof repair material timer chunks oversized exact integers and retains captured interval after settings change", async ({ page, materialServer, materialDatabase }) => {
  await page.clock.install(); await materialDatabase.query('UPDATE app."sistema" SET "Tempo_materiais"=2147484');
  let reads = 0; page.on("request", request => { if (new URL(request.url()).pathname === "/api/repair-materials/list") reads++; });
  const screen = await list(page,materialServer.origin); const initialReads=reads;
  await page.clock.fastForward(2147483647); expect(reads).toBe(initialReads);
  await page.clock.fastForward(352); expect(reads).toBe(initialReads);
  const refreshed=page.waitForResponse(response=>response.url().endsWith("/api/repair-materials/list"));
  await page.clock.fastForward(1); await refreshed; expect(reads).toBe(initialReads+1);
  await materialDatabase.query('UPDATE app."sistema" SET "Tempo_materiais"=1');
  await screen.getByTestId("BTN_todos").click(); await page.waitForLoadState("networkidle"); const afterManual=reads;
  await page.clock.fastForward(1000); expect(reads).toBe(afterManual);
});

for (const mode of ["quantidade","preco","descricao","password"] as const) test(`proof repair ${mode} custom close returns the incoming default through the real material caller`,async({page,materialServer,materialDatabase})=>{
  const form=await editor(page,materialServer.origin), button={quantidade:"BTN_Quantidade",preco:"BTN_Preço",descricao:"BTN_Descricao",password:"BTN_Leitor"}[mode];
  await form.getByTestId(button).click(); const prompt=page.getByTestId(promptId), field=prompt.getByTestId(mode==="password"?"EDT_password":mode==="descricao"?"EDT_descricao":"EDT_quantidade");
  await field.fill(mode==="password"?"incorrect":mode==="descricao"?"discarded edit":"7,00");
  await prompt.getByTestId("BTN_SYST_FERMER").click(); await expect(prompt).toHaveCount(0); await expect(form).toBeVisible();
  await expect(form.getByTestId("TABLE_material")).toContainText("Original"); await expect(page.getByTestId("repair-material-scanner-file")).toHaveCount(0);
  await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
  expect((await materialDatabase.query('SELECT "quantidade"::text,"preco"::text,"descricao_artigo" FROM app."material_reparacao"')).rows).toEqual([{quantidade:"2",preco:"1.25",descricao_artigo:"Original"}]);
  expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=\'A\'')).rows[0].stock).toBe("10");
});

for(const kind of ["list","form","prompt"] as const) test(`proof repair material ${kind} chrome retains its mounted draft and selection and restores normal dimensions`,async({page,materialServer,materialDatabase})=>{
  await page.setViewportSize({width:1400,height:1000});
  let screen:Locator,frame:Locator;
  if(kind==="list") { screen=await list(page,materialServer.origin); frame=screen; await screen.getByTestId("TABLE_ordens_reparacao").locator("tbody tr").click(); }
  else { const form=await editor(page,materialServer.origin); if(kind==="prompt") { await form.getByTestId("BTN_Quantidade").click(); screen=page.getByTestId(promptId); frame=page.getByTestId("repair-material-quantidade-prompt"); await screen.getByTestId("EDT_quantidade").fill("7,125"); }
    else {screen=form;frame=page.getByTestId("repair-material-form-frame");await screen.getByTestId("EDT_artigo_descricao").fill("draft preserved");} }
  const field=kind==="prompt"?screen.getByTestId("EDT_quantidade"):kind==="form"?screen.getByTestId("EDT_artigo_descricao"):screen.getByTestId("LIST_mecanicos");
  await field.focus(); const initial=(await frame.boundingBox())!,value=await field.inputValue(), selected=await screen.locator('tr[aria-selected="true"]').allTextContents();
  await screen.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(frame).toBeHidden();
  if(kind==="list") await page.getByTestId("workspace-tasks").getByRole("button").click(); else await page.getByTestId(kind==="form"?"repair-material-form-restore":"repair-material-prompt-restore").click();
  await expect(frame).toBeVisible();await expect(field).toBeFocused();await expect(field).toHaveValue(value);expect(await screen.locator('tr[aria-selected="true"]').allTextContents()).toEqual(selected);
  await screen.getByTestId("BTN_Syst_Maximize").click();expect((await frame.boundingBox())!.width).toBeGreaterThan(initial.width);await expect(field).toHaveValue(value);
  await screen.getByTestId("BTN_Syst_Maximize").click();const normal=(await frame.boundingBox())!;expect([normal.width,normal.height]).toEqual([initial.width,initial.height]);await expect(field).toHaveValue(value);
  await screen.getByTestId("BTN_SYST_FERMER").click();await expect(frame).toHaveCount(0);
  if(kind==="prompt") await expect(page.getByTestId("WIN_Material_reparacao_form")).toBeVisible();
  expect((await materialDatabase.query('SELECT "quantidade"::text,"preco"::text,"descricao_artigo" FROM app."material_reparacao"')).rows).toEqual([{quantidade:"2",preco:"1.25",descricao_artigo:"Original"}]);
});

for(const kind of ["list","form","prompt"] as const) test(`proof repair material ${kind} actual simple control bundles preserve complete source geometry captions assets and anchors`,async({page,materialServer})=>{
  await page.setViewportSize({width:1400,height:1000});
  let screen:Locator,frame:Locator;const unit=kind==="list"?"WIN_Material_Reparacao":kind==="form"?"WIN_Material_reparacao_form":"WIN_Inserir_quantidade_password";
  if(kind==="list") {screen=await list(page,materialServer.origin);frame=screen;}else {const form=await editor(page,materialServer.origin);if(kind==="prompt"){await form.getByTestId("BTN_Quantidade").click();screen=page.getByTestId(promptId);frame=page.getByTestId("repair-material-quantidade-prompt");}else{screen=form;frame=page.getByTestId("repair-material-form-frame");}}
  const initial=(await frame.boundingBox())!;await sourceSimpleControls(screen,unit);
  await screen.getByTestId("BTN_Syst_Maximize").click();const expanded=(await frame.boundingBox())!;await sourceSimpleControls(screen,unit,{width:expanded.width-initial.width,height:expanded.height-initial.height});
  await screen.getByTestId("BTN_Syst_Maximize").click();await sourceSimpleControls(screen,unit);
});

test("proof repair material close disposes a pending timer read and reopened window owns its own current rows and timer",async({page,materialServer,materialDatabase})=>{
  await page.clock.install();await materialDatabase.query('UPDATE app."sistema" SET "Tempo_materiais"=1');
  let screen=await list(page,materialServer.origin),release!:()=>void,fetched!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;}),actual=new Promise<void>(resolve=>{fetched=resolve;});let hold=true,reads=0;
  page.on("request",request=>{if(new URL(request.url()).pathname==="/api/repair-materials/list")reads++;});
  await page.route("**/api/repair-materials/list",async route=>{if(!hold){await route.continue();return;}hold=false;const response=await route.fetch();fetched();await gate;await route.fulfill({response});});
  try{
    await page.clock.fastForward(1000);await actual;await screen.getByTestId("BTN_Fechar").click();await expect(screen).toHaveCount(0);const afterClose=reads;
    await page.clock.fastForward(3000);expect(reads).toBe(afterClose);
    await materialDatabase.query(`INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_mecanico","reparacao_estado") VALUES (9007199254740994,'AA-00-AA',7,'R')`);
    await page.getByTestId("repair-materials-open").click();screen=page.locator('[data-layout="WIN_Material_Reparacao"]');await expect(screen.getByTestId("TABLE_ordens_reparacao").locator("tbody tr")).toHaveCount(2);
    release();await page.waitForLoadState("networkidle");await expect(screen.getByTestId("TABLE_ordens_reparacao").locator("tbody tr")).toHaveCount(2);
    const current=reads,next=page.waitForResponse(response=>response.url().endsWith("/api/repair-materials/list"));await page.clock.fastForward(1000);await next;expect(reads).toBe(current+1);
    await screen.getByTestId("BTN_SYST_FERMER").click();const final=reads;await page.clock.fastForward(3000);expect(reads).toBe(final);
  }finally{release();await page.unroute("**/api/repair-materials/list");}
});
