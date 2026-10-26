import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./support/repair-orders";
import chromeSource from "./support/proof-repair-chrome";
import {sourceSimpleControls} from "./support/proof-repair-properties";

// Frozen literal coordinates from the cited dossier/source, compared to the actual mounted consumers.
// Neither expected geometry nor expected draft values are read from production layout metadata at runtime.
test.beforeEach(async ({ repairDatabase }) => {
  await repairDatabase.query(`TRUNCATE app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao",app."utilizadores" RESTART IDENTITY;
    UPDATE app."sistema" SET "Tempo_tempos"=60,"Tempo_materiais"=60,"encerrar_tempos1"='235958',"encerrar_tempos2"='235959';
    UPDATE app."mecanicos" SET "palavra_passe"='Synthetic'; UPDATE app."estados_reparacao" SET "tipo"=3 WHERE "Codigo"='R';
    INSERT INTO app."utilizadores" ("Codigo","Descricao") VALUES (1,'RECEPÇÃO');
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","km_viatura","recepcao_util","recepcao_cliente","recepcao_terceiro","reparacao_estado","reparacao_mecanico","recepcao_prioridade","recepcao_servico","recepcao_obs","reparacao_servico","reparacao_estado_historico","recepcao_datahora","recepcao_entrega_prevista")
      VALUES (77,10,'AA-00-AA',100,1,1,2,'R',2,1,'Serviço original','Observação original','Trabalho original','Histórico original','20240229120000000','20240301')`);
});

async function orders(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const screen=page.getByTestId("WIN_Ordens_Reparacao"); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await screen.getByTestId("BTN_Nenhum").click(); await screen.getByTestId("BTN_Actualizar_Dados").click();
  await screen.getByTestId("TABLE_QRY_select_ordens_reparacao").getByRole("cell",{name:"10",exact:true}).click(); return screen;
}
async function labor(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-labor`); await page.getByTestId("repair-labor-open").click(); const screen=page.getByTestId("WIN_Tempos_Reparacao");
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell",{name:"10",exact:true}).click(); await expect(screen.getByTestId("BTN_Tempos")).toBeEnabled(); return screen;
}
const targets=[
  {unit:"WIN_Ordens_Reparacao",kind:"list",focus:"EDT_matricula",restore:""},
  {unit:"WIN_Ordens_Reparacao_Form",kind:"form",focus:"EDT_servico_avaria",restore:"repair-order-form-restore"},
  {unit:"WIN_Table_Tempos_materiais_Descricoes",kind:"details",focus:"BTN_Sair",restore:"repair-descriptions-restore"},
  {unit:"WIN_Tempos_Reparacao",kind:"labor",focus:"BTN_Tempos",restore:""},
  {unit:"WIN_Tempos_Reparacao_Estado",kind:"state",focus:"EDT_descricao",restore:"repair-labor-state-restore"},
  {unit:"WIN_Tempos_Reparacao_Informacao",kind:"information",focus:"EDT_cliente",restore:"repair-labor-info-restore"},
  {unit:"WIN_Tempos_Reparacao_Tempo",kind:"time",focus:"EDT_mecanico",restore:"repair-labor-time-restore"},
  {unit:"WIN_Table_estado_reparacao_tipo3",kind:"picker",focus:"BTN_selecionar",restore:"repair-labor-state-picker-restore"},
] as const;

type Target = typeof targets[number];
async function open(page: Page, origin: string, target: Target) {
  let parent: Locator|undefined;
  if (["list","form","details"].includes(target.kind)) {
    parent=await orders(page,origin);
    if(target.kind==="form") { await parent.getByTestId("BTN_Alterar").click(); await expect(page.getByTestId(target.unit).getByTestId("repair-order-form-read-state")).toHaveText("ready"); }
    if(target.kind==="details") { await parent.getByTestId("BTN_informacao").click(); await expect(page.getByTestId(target.unit).getByRole("tab")).toHaveCount(4); await expect(page.getByTestId(target.unit).getByTestId("BTN_Sair")).toBeEnabled(); }
  } else {
    parent=await labor(page,origin);
    if(target.kind==="state") await parent.getByTestId("BTN_Estado").click();
    if(target.kind==="information") await parent.getByTestId("BTN_Informacao").click();
    if(target.kind==="time" || target.kind==="picker") { await parent.getByTestId("BTN_Tempos").click(); await expect(page.getByTestId("WIN_Tempos_Reparacao_Tempo").getByTestId("BTN_Iniciar")).toBeEnabled(); }
    if(target.kind==="picker") {
      await page.getByTestId("WIN_Tempos_Reparacao_Tempo").getByTestId("BTN_Iniciar").click(); const password=page.getByTestId("WIN_Inserir_quantidade_password");
      await password.getByTestId("EDT_password").fill("Synthetic"); await password.getByTestId("BTN_Confirmar").click();
    }
  }
  const frame=page.locator(`[data-layout="${target.unit}"]`), screen=target.kind==="list" || target.kind==="labor" ? frame : page.getByTestId(target.unit);
  await expect(frame).toBeVisible();
  if(target.kind==="information") await expect(screen.getByTestId("EDT_cliente")).toHaveValue("CLIENTE RECEPÇÃO");
  if(target.kind==="state") await expect(screen.getByTestId("EDT_obs_servico")).toHaveValue("Trabalho original");
  return {screen,frame,parent};
}
async function mountedValues(screen: Locator) {
  return screen.locator("input,textarea,select").evaluateAll(elements=>elements.map(element=>{
    const input=element as HTMLInputElement; return [input.dataset.testid,input.value,input.checked,input.readOnly];
  }));
}

for(const target of targets) test(`proof repair ${target.unit} actual chrome retains mounted state on minimize and maximize then returns only its own caller`,async({page,repairServer,repairDatabase})=>{
  if(target.kind==="picker") await repairDatabase.query('UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"=\'R\'');
  await page.setViewportSize({width:1400,height:1000});
  const {screen,frame,parent}=await open(page,repairServer.origin,target), source=chromeSource[target.unit], initial=(await frame.boundingBox())!;
  const focus=screen.getByTestId(target.focus);
  if(target.kind==="form" || target.kind==="state") await focus.fill("retained draft ç  ");
  await focus.focus(); const values=await mountedValues(screen), selection=await screen.locator('tr[aria-selected="true"]').allTextContents();
  for(const name of ["BTN_SYST_MINIMIZE","BTN_Syst_Maximize","BTN_SYST_FERMER"] as const) {
    const button=screen.getByTestId(name), box=(await button.boundingBox())!, expected=source[name];
    await expect(button).toBeVisible(); await expect(button).toBeEnabled(); await expect(button).toHaveAttribute("tabindex","-1"); await expect(button).toHaveAttribute("type","button");
    expect({x:box.x-initial.x,y:box.y-initial.y,width:box.width,height:box.height}).toEqual(expected);
  }
  const group=screen.getByTestId("SCSystemButtons"), groupBox=(await group.boundingBox())!;
  expect({x:groupBox.x-initial.x,y:groupBox.y-initial.y,width:groupBox.width,height:groupBox.height}).toEqual(source.SCSystemButtons); await expect(group).toBeVisible();
  await screen.getByTestId("BTN_SYST_MINIMIZE").click(); await expect(frame).toBeHidden();
  if(target.restore) await page.getByTestId(target.restore).click();
  else await page.getByTestId("workspace-tasks").getByRole("button").click();
  await expect(frame).toBeVisible(); await expect(focus).toBeFocused(); expect(await mountedValues(screen)).toEqual(values); expect(await screen.locator('tr[aria-selected="true"]').allTextContents()).toEqual(selection);
  await screen.getByTestId("BTN_Syst_Maximize").click(); const maximized=(await frame.boundingBox())!;
  expect(maximized.width).toBeGreaterThan(initial.width); expect(maximized.height).toBeGreaterThanOrEqual(initial.height);
  expect(await mountedValues(screen)).toEqual(values);
  await screen.getByTestId("BTN_Syst_Maximize").click(); await page.evaluate(()=>window.scrollTo(0,0)); const restored=(await frame.boundingBox())!; expect({width:restored.width,height:restored.height}).toEqual({width:initial.width,height:initial.height}); expect(await mountedValues(screen)).toEqual(values);
  const before=(await repairDatabase.query('SELECT to_jsonb(o)::text AS row FROM app."ordem_reparacao" o')).rows;
  await screen.getByTestId("BTN_SYST_FERMER").click(); await expect(frame).toHaveCount(0);
  if(target.kind!=="list" && target.kind!=="labor") await expect(parent!).toBeVisible();
  if(target.kind==="picker") { await expect(page.getByTestId("WIN_Tempos_Reparacao_Tempo")).toBeVisible(); await expect(page.getByTestId("WIN_Tempos_Reparacao_Tempo").getByTestId("BTN_Iniciar")).toBeEnabled(); }
  expect((await repairDatabase.query('SELECT to_jsonb(o)::text AS row FROM app."ordem_reparacao" o')).rows).toEqual(before);
  expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."tempos_reparacao"')).rows[0].count).toBe(0);
});

for(const priority of [1,2,3]) test(`proof repair form priority${priority} restores source option and persists the exact selected byte`,async({page,repairServer,repairDatabase})=>{
  await repairDatabase.query('UPDATE app."ordem_reparacao" SET "recepcao_prioridade"=$1',[priority]);
  const parent=await orders(page,repairServer.origin); await parent.getByTestId("BTN_Alterar").click(); const form=page.getByTestId("WIN_Ordens_Reparacao_Form");
  await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready"); const combo=form.getByTestId("COMBO_Prioridade");
  expect(await combo.locator("option").allTextContents()).toEqual(["Normal","Elevada","Urgente"]); await expect(combo.locator("option:checked")).toHaveText(["Normal","Elevada","Urgente"][priority-1]);
  const chosen=priority===3?1:priority+1; await combo.selectOption(String(chosen));
  await form.getByTestId("BTN_Gravar").click(); const date=page.getByTestId("WIN_Data"); await expect(date).toBeVisible(); await date.getByTestId("EDT_Data").press("Escape"); await expect(form).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "recepcao_prioridade" FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].recepcao_prioridade).toBe(chosen);
});

for(const target of targets) test(`proof repair ${target.unit} actual simple control bundles preserve source captions flags geometry assets and resizing anchors`,async({page,repairServer,repairDatabase})=>{
  await page.setViewportSize({width:1400,height:1000});
  if(target.kind==="picker") await repairDatabase.query('UPDATE app."estados_reparacao" SET "tipo"=2 WHERE "Codigo"=\'R\'');
  const {screen,frame}=await open(page,repairServer.origin,target),initial=(await frame.boundingBox())!;
  await sourceSimpleControls(screen,target.unit);
  await screen.getByTestId("BTN_Syst_Maximize").click();const expanded=(await frame.boundingBox())!;
  await sourceSimpleControls(screen,target.unit,{width:expanded.width-initial.width,height:expanded.height-initial.height});
  await screen.getByTestId("BTN_Syst_Maximize").click();await sourceSimpleControls(screen,target.unit);
});

test("proof repair new form initializes priority1 state minus1 and both byte file combos empty before any edit",async({page,repairServer})=>{
  const parent=await orders(page,repairServer.origin);await parent.getByTestId("BTN_Novo").click();const form=page.getByTestId("WIN_Ordens_Reparacao_Form");await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready");
  await expect(form.getByTestId("COMBO_Prioridade").locator("option:checked")).toHaveText("Normal");
  for(const name of ["COMBO_estado","COMBO_mecanico","COMBO_Recepcionado"]) expect(await form.getByTestId(name).evaluate(element=>(element as HTMLSelectElement).selectedIndex),name).toBe(-1);
  await expect(form.getByTestId("COMBO_estado")).toHaveValue("");await expect(form.getByTestId("EDT_KM")).toHaveValue("0");
  await form.getByTestId("BTN_SYST_FERMER").click();await expect(form).toHaveCount(0);await expect(parent).toBeVisible();
});

for(const returned of ["cancel-origin","selected-code"] as const) test(`proof repair third-party ${returned} missing reseek assigns actual returned code and retains the previous description`,async({page,repairServer,repairDatabase})=>{
  const parent=await orders(page,repairServer.origin);await parent.getByTestId("BTN_Alterar").click();const form=page.getByTestId("WIN_Ordens_Reparacao_Form");await expect(form.getByTestId("repair-order-form-read-state")).toHaveText("ready");
  await expect(form.getByTestId("EDT_Terceiro_Descricao")).toHaveValue("TERCEIRO");await form.getByTestId("BTN_VISION4").click();const picker=page.getByTestId("customer-picker");await expect(picker.getByTestId("BTN_selecionar")).toBeEnabled();
  const code=returned==="cancel-origin"?"2":"1";await repairDatabase.query('DELETE FROM app."Clientes" WHERE "Codigo"=$1',[code]);
  if(returned==="cancel-origin") await picker.getByTestId("BTN_Fechar").click();
  else await picker.getByTestId("TABLE_Clientes").getByRole("row").filter({hasText:"CLIENTE RECEPÇÃO"}).dblclick();
  await expect(picker).toHaveCount(0);await expect(form.getByTestId("EDT_Terceiro")).toHaveValue(code);await expect(form.getByTestId("EDT_Terceiro_Descricao")).toHaveValue("TERCEIRO");
  await form.getByTestId("BTN_Gravar").click();const date=page.getByTestId("WIN_Data");await expect(date).toBeVisible();await date.getByTestId("EDT_Data").press("Escape");await expect(form).toHaveCount(0);
  expect((await repairDatabase.query('SELECT "recepcao_terceiro"::text FROM app."ordem_reparacao" WHERE "numero"=10')).rows[0].recepcao_terceiro).toBe(code);
});

test("proof repair labor startup composes first settings prior-day closure and an exact oversized window-owned timer",async({page,repairServer,repairDatabase})=>{
  await page.clock.install({time:new Date("2026-10-26T12:00:00.000Z")});
  await repairDatabase.query(`UPDATE app."sistema" SET "Tempo_tempos"=2147484,"encerrar_tempos2"='180001';
    INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_estado","reparacao_mecanico") VALUES (20,'AA-00-AA','R',2);
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim","Inicio_reparacao_estado") VALUES (1,20,2,'20261025102345123','00000000000000000','START-STATE'),(2,10,2,'20261026110000000','00000000000000000','TODAY')`);
  let ticks=0;page.on("request",request=>{if(new URL(request.url()).pathname==="/api/repair-labor/tick")ticks++;});const screen=await labor(page,repairServer.origin);
  expect((await repairDatabase.query('SELECT "numero"::text,"fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual([{numero:"20",fim:"20261025180001000",fim_reparacao_estado:"START-STATE"},{numero:"10",fim:"00000000000000000",fim_reparacao_estado:null}]);
  await page.clock.fastForward(2147483647);expect(ticks).toBe(0);await page.clock.fastForward(352);expect(ticks).toBe(0);
  const tick=page.waitForResponse(response=>response.url().endsWith("/api/repair-labor/tick"));await page.clock.fastForward(1);expect((await tick).ok()).toBe(true);await expect(screen.getByTestId("BTN_todos")).toBeEnabled();expect(ticks).toBe(1);
  await repairDatabase.query('UPDATE app."sistema" SET "Tempo_tempos"=1');await screen.getByTestId("BTN_todos").click();await expect(screen.getByTestId("BTN_todos")).toBeEnabled();await page.clock.fastForward(1000);expect(ticks).toBe(1);
  await screen.getByTestId("BTN_Fechar").click();await page.clock.fastForward(2147484000);expect(ticks).toBe(1);
});

for(const interval of [null,"0"] as const) test(`proof repair labor startup ${interval===null?"NULL":"zero"} interval awaits exact Error after real initial orders are loaded`,async({page,repairServer,repairDatabase})=>{
  await repairDatabase.query('UPDATE app."sistema" SET "Tempo_tempos"=$1',[interval]);
  await page.goto(`${repairServer.origin}/?workflow=repair-labor`);await page.getByTestId("repair-labor-open").click();const message=page.getByTestId("WINDEVMESSAGEBOX");
  await expect(message.getByTestId("LIB_INFO")).toHaveText("Erro ao criar timer de atualização");await expect(page.getByTestId("WIN_Tempos_Reparacao").getByTestId("TABLE_tempos_reparacao")).toContainText("10");
  await message.getByTestId("BTN_OK").click();await expect(page.getByTestId("WIN_Tempos_Reparacao").getByTestId("BTN_todos")).toBeEnabled();
});

test("proof repair actual labor timer closes current mechanic open work with visible state and restores checked filter selected order and child read",async({page,repairServer,repairDatabase})=>{
  await page.clock.install({time:new Date("2026-10-26T11:59:59.000Z")});await repairDatabase.query('UPDATE app."sistema" SET "Tempo_tempos"=1,"encerrar_tempos1"=\'120000\',"encerrar_tempos2"=\'180000\'');
  const screen=await labor(page,repairServer.origin);await repairDatabase.query(`INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_estado","reparacao_mecanico") VALUES (20,'AA-00-AA','X',2),(30,'AA-00-AA','R',10);
    INSERT INTO app."tempos_reparacao" ("tempos_reparacaoID","numero","mecanico","inicio","fim") VALUES (1,10,2,'20261026110000000','00000000000000000'),(2,20,2,'20261026110000000','00000000000000000'),(3,30,10,'20261026110000000','00000000000000000')`);
  await screen.getByTestId("BTN_todos").click();await expect(screen.getByTestId("BTN_todos")).toBeEnabled();await screen.getByTestId("LIST_mecanicos").selectOption("2");await expect(screen.getByTestId("STC_filtro_atual")).toHaveText("ANA");
  await screen.getByRole("checkbox",{name:"Selecionar estado X",exact:true}).click();await expect(screen.getByTestId("TABLE_tempos_reparacao").locator("tbody tr")).toHaveCount(1);
  await screen.getByTestId("TABLE_tempos_reparacao").getByRole("cell",{name:"10",exact:true}).click();const children=screen.getByTestId("TABLE_tempos_reparacao_ordem");await expect(children.locator("tbody tr")).toHaveCount(1);
  const tick=page.waitForResponse(response=>response.url().endsWith("/api/repair-labor/tick")), child=page.waitForResponse(response=>response.url().endsWith("/api/repair-labor/read"));await page.clock.fastForward(1000);expect((await tick).ok()).toBe(true);await child;
  await expect(screen.getByTestId("TABLE_tempos_reparacao").locator('tr[aria-selected="true"]')).toContainText("10");await expect(children.locator("tbody tr")).toHaveCount(0);
  await expect(screen.getByTestId("LIST_mecanicos")).toHaveValue("2");await expect(screen.getByTestId("STC_filtro_atual")).toHaveText("ANA");await expect(screen.getByRole("checkbox",{name:"Selecionar estado X",exact:true})).toHaveAttribute("aria-checked","false");
  expect((await repairDatabase.query('SELECT "numero"::text,"fim","fim_reparacao_estado" FROM app."tempos_reparacao" ORDER BY _row_id')).rows).toEqual([{numero:"10",fim:"20261026120000000",fim_reparacao_estado:"R"},{numero:"20",fim:"20261026120000000",fim_reparacao_estado:"R"},{numero:"30",fim:"00000000000000000",fim_reparacao_estado:null}]);
});

test("proof repair labor close disposes its actual pending refresh and timer before an independent reopened instance reads current rows",async({page,repairServer,repairDatabase})=>{
  await page.clock.install({time:new Date("2026-10-26T10:00:00.000Z")});await repairDatabase.query('UPDATE app."sistema" SET "Tempo_tempos"=1');
  let screen=await labor(page,repairServer.origin),release!:()=>void,fetched!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;}),actual=new Promise<void>(resolve=>{fetched=resolve;});let hold=true,ticks=0;
  page.on("request",request=>{if(new URL(request.url()).pathname==="/api/repair-labor/tick")ticks++;});
  await page.route("**/api/repair-labor/list",async route=>{if(!hold){await route.continue();return;}hold=false;const response=await route.fetch();fetched();await gate;await route.fulfill({response});});
  try{
    await page.clock.fastForward(1000);await actual;await screen.locator('..').getByTestId("BTN_SYST_FERMER").click();await expect(screen).toHaveCount(0);const stopped=ticks;await page.clock.fastForward(3000);expect(ticks).toBe(stopped);
    await repairDatabase.query(`INSERT INTO app."ordem_reparacao" ("numero","matricula","reparacao_estado","reparacao_mecanico") VALUES (20,'AA-00-AA','R',2)`);
    await page.getByTestId("repair-labor-open").click();screen=page.getByTestId("WIN_Tempos_Reparacao");await expect(screen.getByTestId("TABLE_tempos_reparacao").locator("tbody tr")).toHaveCount(2);
    release();await page.waitForLoadState("networkidle");await expect(screen.getByTestId("TABLE_tempos_reparacao").locator("tbody tr")).toHaveCount(2);
    await expect(screen.getByTestId("BTN_Fechar")).toBeEnabled();await screen.getByTestId("BTN_Fechar").click();const final=ticks;await page.clock.fastForward(3000);expect(ticks).toBe(final);
  }finally{release();await page.unroute("**/api/repair-labor/list");}
});
