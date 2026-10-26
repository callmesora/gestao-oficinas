import { test as base, expect, type Locator } from "@playwright/test";
import type { Client } from "pg";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createServer } from "vite";
import { startIsolatedPostgres } from "../../apps/server/test-support/postgres";
import { migrate } from "../../apps/server/src/db/migrate";
import { createApp } from "../../apps/server/src/app";
import { developmentSessions } from "../../apps/server/src/development-sessions";
import { createReportRenderer } from "../../apps/server/src/reports/renderer";
import source from "./proof-fields-source.json" with { type: "json" };

type Property = { id: string; kind: string; x?: number; y?: number; width?: number; height?: number;
  input_type?: string; input_size?: number; state?: string; tab_order?: number | string;
  input_mask?: { PT?: string }; flags?: Record<string, boolean>; h_align?: string };
export type Unit = keyof typeof source;
export function sourceFields(unit: Unit) { return Object.entries(source[unit]) as [string, Property][]; }

/** Frozen dossier expectations, independent of generated target layouts. Every caller mounts its real production screen. */
export async function fieldContract(screen: Locator, unit: Unit, name: string, options: { readOnly?: boolean; hidden?: boolean; name?: string; geometry?: boolean; focusRedirect?: string } = {}) {
  const property = (source[unit] as Record<string, Property>)[name];
  if (!property) throw new Error(`No independent source expectation for ${unit}/${name}`);
  const field = screen.getByTestId(options.name ?? name), message = `${property.id} ${unit}/${name}`;
  const actual = await field.evaluate(element => {
    const input = element as HTMLInputElement | HTMLTextAreaElement;
    const wrapper = input.closest<HTMLElement>("[data-control-path]")!;
    return { tag: input.tagName, type: input.getAttribute("type"), readonly: input.readOnly, max: input.maxLength,
      required: input.required, tab: input.tabIndex, hidden: wrapper.hidden, value: input.value,
      x: parseFloat(wrapper.style.left), y: parseFloat(wrapper.style.top), width: parseFloat(wrapper.style.width), height: parseFloat(wrapper.style.height),
      align: getComputedStyle(input).textAlign, wrap: input instanceof HTMLTextAreaElement ? input.wrap : null,
      overflowX: getComputedStyle(input).overflowX, overflowY: getComputedStyle(input).overflowY,
      rich: input.isContentEditable, list: input.getAttribute("list"), markup: input.querySelectorAll("b,script,strong").length };
  });
  expect(actual.tag, message).toBe(property.flags?.Multiline ? "TEXTAREA" : "INPUT");
  if (actual.tag === "INPUT") expect(actual.type, message).toBe(property.flags?.Password ? "password" : "text");
  expect(actual.readonly, message).toBe(options.readOnly ?? property.state === "Read-only");
  expect(actual.max, message).toBe(property.input_type === "Text" && (property.input_size ?? 0) > 0 ? property.input_size : -1);
  expect(actual.tab, message).toBe(property.flags?.["TAB Key"] === false || String(property.tab_order) === "-1" ? -1 : 0);
  expect(actual.hidden, message).toBe(options.hidden ?? property.flags?.Visible === false);
  if (property.flags?.["Required input"] === false) expect(actual.required, message).toBe(false);
  expect(actual.rich, message).toBe(false); expect(actual.markup, message).toBe(0);
  if (property.flags?.["File assisted input"] === false) expect(actual.list, message).toBeNull();
  if (property.h_align) expect(actual.align, message).toBe(property.h_align === "Right" ? "right" : property.h_align === "Center" ? "center" : "left");
  if (actual.tag === "TEXTAREA") {
    expect(actual.wrap, message).toBe(property.flags?.["Horz. scrollbar"] ? "off" : "soft");
    expect(actual.overflowX, message).toBe(property.flags?.["Horz. scrollbar"] ? "scroll" : "hidden");
    expect(actual.overflowY, message).toBe(property.flags?.["Vert. scrollbar"] ? "scroll" : "auto");
  }
  if (options.geometry !== false) for (const key of ["x", "y", "width", "height"] as const) {
    if (property[key] !== undefined) expect(actual[key], `${message} ${key}`).toBe(property[key]);
  }
  if (!actual.hidden && property.flags?.["Automatic erase"] === true) {
    // Keep capture/focus atomic: a real asynchronous screen read can arrive between separate Playwright operations.
    // Source Exit lookups may transiently disable the next field; assert its steady state after those real reads complete.
    await expect.poll(async () => field.evaluate((element, redirect) => {
      const node = element as HTMLInputElement; if (node.disabled) return false;
      node.setSelectionRange(node.value.length, node.value.length);
      node.blur(); const before = node.value; node.focus();
      const focused = redirect ? document.activeElement?.getAttribute("data-testid") === redirect : document.activeElement === node;
      return focused && node.value === before && node.selectionStart === 0 && node.selectionEnd === before.length;
    }, options.focusRedirect), { message }).toBe(true);
  }
  return field;
}

/** Exercise actual native input events/RHF or controlled bindings; focus never writes and explicit zero stays visible. */
export async function textEntry(field: Locator, value: string, limit: number, automaticErase: boolean) {
  await field.fill(""); await field.pressSequentially(value);
  await expect(field).toHaveValue(limit > 0 ? value.slice(0, limit) : value);
  await expect(field).toBeFocused(); // End of automatic input is false; reaching max length cannot advance focus.
  const accepted = await field.inputValue();
  await field.evaluate(element => { const node = element as HTMLInputElement; node.setSelectionRange(node.value.length, node.value.length); });
  await field.evaluate(element => (element as HTMLElement).blur()); await field.focus();
  await expect(field).toHaveValue(accepted);
  if (automaticErase) {
    expect(await field.evaluate(element => { const node = element as HTMLInputElement; return [node.selectionStart, node.selectionEnd]; })).toEqual([0, accepted.length]);
    await field.pressSequentially("0"); await expect(field).toHaveValue("0");
  } else {
    expect(await field.evaluate(element => { const node = element as HTMLInputElement; return [node.selectionStart, node.selectionEnd]; })).toEqual([accepted.length, accepted.length]);
    await field.press("End"); await field.pressSequentially("0");
    await expect(field).toHaveValue(limit > 0 ? (accepted + "0").slice(0, limit) : accepted + "0");
  }
  await field.fill(""); await expect(field).toHaveValue("");
}

export async function readOnlyEntry(field: Locator, expected: string) {
  await expect(field).toHaveValue(expected); await field.focus();
  await field.pressSequentially("REPLACEMENT"); await field.press("Backspace");
  await expect(field).toHaveValue(expected);
}

export async function choiceContract(screen: Locator, unit: Unit, name: string) {
  const property = (source[unit] as Record<string, Property>)[name], field = screen.getByTestId(name);
  const actual = await field.evaluate(element => {
    const node = element as HTMLSelectElement, parent = node.closest<HTMLElement>("[data-control-path]")!;
    return { tag: node.tagName, tab: node.tabIndex, multiple: node.multiple, required: node.required,
      editable: node.isContentEditable, hidden: parent.hidden, x: parseFloat(parent.style.left), y: parseFloat(parent.style.top), width: parseFloat(parent.style.width), height: parseFloat(parent.style.height) };
  });
  expect(actual.tag, property.id).toBe("SELECT"); expect(actual.multiple, property.id).toBe(false);
  expect(actual.editable, property.id).toBe(false); expect(actual.required, property.id).toBe(false);
  expect(actual.hidden, property.id).toBe(false); expect(actual.tab, property.id).toBe(0);
  for (const key of ["x", "y", "width", "height"] as const) if (property[key] !== undefined) expect(actual[key], property.id).toBe(property[key]);
  return field;
}

export async function seedFields(database: Client) {
  await database.query(`TRUNCATE app."sistema",app."utilizadores",app."Clientes",app."Viaturas",app."mecanicos",app."estados_reparacao",app."ordem_reparacao",app."tempos_reparacao",app."material_reparacao",app."artigos",app."unidades",app."documentos",app."cab_stocks",app."lin_stocks",app."estados_descritivos" RESTART IDENTITY;
    INSERT INTO app."sistema" ("Tempo_ordem_reparacao","Tempo_materiais","Tempo_tempos","Data_inicio","encerrar_tempos1","encerrar_tempos2") VALUES (60,60,60,65535,'235958','235959');
    INSERT INTO app."utilizadores" ("utilizadoresID","Codigo","Descricao","palavra_passe") VALUES (1,1,'RECEPÇÃO','SYNTHETIC'),(2,2,'OUTRA RECEPÇÃO','SYNTHETIC');
    INSERT INTO app."Clientes" ("ClientesID","Codigo","Descricao","Telefone1","Telemovel") VALUES (1,1,'CLIENTE <b>literal</b>','210','910'),(2,2,'TERCEIRO',NULL,NULL);
    INSERT INTO app."Viaturas" ("ViaturasID","matricula","Cliente","marca","modelo","Ano","mes") VALUES (1,'AA-00-AA',1,'MARCA','MODELO',2024,2),(2,'BB-00-BB',2,'OUTRA','MODELO',2024,3);
    INSERT INTO app."mecanicos" ("mecanicosID","Codigo","Descricao","palavra_passe","inativo") VALUES (1,7,'ANA','Synthetic',false),(2,8,'BRUNO','Synthetic',false);
    INSERT INTO app."estados_reparacao" ("estados_reparacaoID","Codigo","Descricao","tipo","lancar_defa","lancar_material","confirmacao","pedir_data_entrega","pedir_data_pag") VALUES (1,'R','Reparação',3,true,true,false,false,false),(2,'N','Outro estado',3,false,true,false,false,false);
    INSERT INTO app."ordem_reparacao" ("ordem_reparacaoID","numero","matricula","recepcao_cliente","recepcao_terceiro","recepcao_util","reparacao_estado","reparacao_mecanico","recepcao_prioridade","recepcao_servico","recepcao_obs","reparacao_servico","reparacao_estado_historico","recepcao_datahora","recepcao_entrega_prevista","km_viatura","faturado","total_pago","data_pagamento","numero_fatura","recepacao_contatos")
      VALUES (1,10,'AA-00-AA',1,2,1,'R',7,1,'Serviço <b>literal</b>','Observação original','Trabalho','Histórico original','20240229120000000','20240301',100,true,1.25,'20240301','FT 1','210' || chr(13) || chr(10) || '910');
    INSERT INTO app."unidades" ("Codigo","Descricao") VALUES ('UN','Unidade');
    INSERT INTO app."artigos" ("artigosID","Codigo","Descricao","stock","preco","unidade","inativo") VALUES (1,'A','Artigo <b>literal</b>',10,1.25,'UN',false),(2,'B','Segundo',20,2.50,'UN',false);
    INSERT INTO app."material_reparacao" ("material_reparacaoID","numero","mecanico","artigo","descricao_artigo","quantidade","preco","data_hora","reparacao_estado","lancado","extra") VALUES (1,10,7,'A','Material original',2,1.25,'20240229123456000','R',false,false);
    INSERT INTO app."documentos" ("documentosID","Codigo","Descricao","stock","obriga_macanico") VALUES (1,'IN','Entrada',1,false),(2,'OUT','Saída',2,true);
    INSERT INTO app."cab_stocks" ("cab_stocksID","documento_codigo","documento_numero","data","Descricao","mecanico") VALUES (1,'IN',10,'20240301','Documento original',7);`);
}

type Server = { origin: string; database: Client };
export const test = base.extend<{ fieldsDatabase: Client }, { fieldsServer: Server }>({
  fieldsServer: [async ({ browserName }, use) => {
    if (browserName !== "chromium") throw new Error("Configured Chrome required");
    const engine = await startIsolatedPostgres();
    let database: Client | undefined, app: ReturnType<typeof createApp> | undefined, vite: Awaited<ReturnType<typeof createServer>> | undefined;
    try {
      database = await engine.database(); await migrate(database);
      const name = (await database.query<{ name: string }>("SELECT current_database() AS name")).rows[0].name, connect = () => engine.connect(name);
      const sessions = developmentSessions("unbound");
      app = createApp({ customerConnect: connect, vehicleConnect: connect, unitConnect: connect, descriptiveStateConnect: connect, terminalConnect: connect, postoConnect: connect, mechanicsConnect: connect, repairStateConnect: connect, documentTypeConnect: connect, articleConnect: connect, userConnect: connect, repairOrderConnect: connect, repairLaborConnect: connect, repairMaterialsConnect: connect, stockConnect: connect, startupConnect: connect, reportFilterConnect: connect, reportConnect: connect, reportRenderer: createReportRenderer(), development: sessions });
      await app.listen({ host: "127.0.0.1", port: 0 });
      const address = app.server.address(); if (!address || typeof address === "string") throw new Error("Fields API unavailable");
      vite = await createServer({ root: fileURLToPath(new URL("../../", import.meta.url)), cacheDir: resolve(engine.directory, "vite-proof-fields"), server: { host: "127.0.0.1", port: 0, proxy: { "/api": { target: `http://127.0.0.1:${address.port}` } } } });
      await vite.listen();
      const origin = vite.resolvedUrls?.local[0]?.replace(/\/$/, ""); if (!origin) throw new Error("Fields Vite unavailable");
      sessions.origin = origin; await use({ origin, database });
    } finally { try { await vite?.close(); } finally { try { await app?.close(); } finally { try { await database?.end(); } finally { await engine.stop(); } } } }
  }, { scope: "worker", timeout: 90000 }],
  fieldsDatabase: [async ({ fieldsServer }, use) => { await seedFields(fieldsServer.database); await use(fieldsServer.database); }, { auto: true }],
});
export { expect };
