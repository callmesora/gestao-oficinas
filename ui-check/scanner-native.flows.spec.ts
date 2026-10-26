import type { Page } from "@playwright/test";
import type { Client } from "pg";
import { test, expect } from "./support/repair-materials";

const content = "BAR-B 2.25\r\nWHAT  1.00\r\n\r\nBAR   9.99";
const identity = { terminalCode: "N01", sourceFolder: "C:\\Synthetic scanner d'água", sourceFilename: "reader.txt" };
interface NativeState {
  isTauri: boolean;
  __scannerCalls: unknown[];
  __scannerText: string;
  __scannerMode: "ready" | "deferred" | "failed";
  __scannerFailure: string;
  __finishScanner: (value: unknown) => void;
  __TAURI_INTERNALS__: { invoke: (command: string, payload?: unknown) => Promise<unknown> };
}
async function provision(database: Client) {
  const terminal = await database.query<{ id: string }>('INSERT INTO app."Terminais" ("Codigo","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim","pasta_localizacao","nome_ficheiro") VALUES ($1,1,6,7,4,$2,$3) RETURNING _row_id::text AS id', [identity.terminalCode, identity.sourceFolder, identity.sourceFilename]);
  const posto = await database.query<{ id: string }>('INSERT INTO app."postos" ("Codigo","terminal") VALUES (1,$1) RETURNING _row_id::text AS id', [identity.terminalCode]);
  return async () => { await database.query('DELETE FROM app."postos" WHERE _row_id=$1', [posto.rows[0].id]); await database.query('DELETE FROM app."Terminais" WHERE _row_id=$1', [terminal.rows[0].id]); };
}
async function nativeBoundary(page: Page) {
  // Native IPC only is simulated. Config/partition, authentication, materials and
  // persistence are actual API/PostgreSQL paths. This is not OS/device acceptance.
  await page.evaluate(text => {
    const state = window as unknown as NativeState;
    state.isTauri = true; state.__scannerCalls = []; state.__scannerText = text; state.__scannerMode = "ready"; state.__scannerFailure = "scanner_file_unavailable";
    const original = state.__TAURI_INTERNALS__.invoke;
    state.__TAURI_INTERNALS__.invoke = (command, payload) => {
      if (command !== "read_terminal_scanner_file") return original(command, payload);
      state.__scannerCalls.push({ command, payload });
      if (state.__scannerMode === "failed") return Promise.reject(new Error(state.__scannerFailure));
      if (state.__scannerMode === "deferred") return new Promise(resolve => { state.__finishScanner = resolve; });
      return Promise.resolve({ text: state.__scannerText });
    };
  }, content);
}
async function openMaterial(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-materials`); await nativeBoundary(page);
  await page.getByTestId("repair-materials-open").click();
  await page.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "9007199254740993", exact: true }).click(); await page.getByTestId("BTN_Material").click();
  const form = page.getByTestId("WIN_Material_reparacao_form"); await expect(form.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA");
  return form;
}
async function authenticate(page: Page) {
  const prompt = page.getByTestId("WIN_Inserir_quantidade_password");
  await expect(prompt).toBeVisible(); await prompt.getByTestId("EDT_password").fill("Synthetic"); await prompt.getByTestId("BTN_Confirmar").click();
}

test("configured scanner caller reads the real terminal identity once per launch, drops cancelled late reads, then partitions and displays unknowns", async ({ page, materialServer, materialDatabase }) => {
  const cleanup = await provision(materialDatabase); let partitions = 0;
  page.on("request", request => { if (request.url().endsWith("/api/stock/scanner-partition")) partitions++; });
  try {
    await page.addInitScript(() => { (window as unknown as { isTauri: boolean }).isTauri = true; });
    await page.goto(`${materialServer.origin}/?workflow=stock-scanner`); await nativeBoundary(page);
    await page.evaluate(() => { (window as unknown as NativeState).__scannerMode = "deferred"; });
    let releaseConfig!: () => void, configFetched = false;
    const gate = new Promise<void>(resolve => { releaseConfig = resolve; });
    await page.route("**/api/stock/scanner-config", async route => {
      const response = await route.fetch(); configFetched = true;
      await gate; await route.fulfill({ response });
    });
    // Cancel before the genuine config response arrives. Its continuation must
    // never open a native read after its owner has gone away.
    await page.getByTestId("stock-scanner-open").click();
    await expect.poll(() => configFetched).toBe(true);
    await page.getByTestId("WIN_Leitor_cod_barras").getByTestId("BTN_Cancelar").click();
    await expect(page.getByTestId("WIN_Leitor_cod_barras")).toHaveCount(0);
    const lateConfig = page.waitForResponse(response => response.url().endsWith("/api/stock/scanner-config"));
    releaseConfig(); await (await lateConfig).finished(); await page.unroute("**/api/stock/scanner-config");
    await page.getByTestId("stock-scanner-open").click();
    const scanner = page.getByTestId("WIN_Leitor_cod_barras");
    await expect.poll(() => page.evaluate(() => (window as unknown as NativeState).__scannerCalls.length)).toBe(1);
    await expect(scanner.getByTestId("BTN_Confirmar")).toBeDisabled(); await scanner.getByTestId("BTN_Cancelar").click(); await expect(scanner).toHaveCount(0);
    await page.evaluate(text => (window as unknown as NativeState).__finishScanner({ text }), content);
    await expect(page.getByTestId("stock-scanner-returned")).toHaveCount(0); expect(partitions).toBe(0);
    await page.evaluate(() => { (window as unknown as NativeState).__scannerMode = "ready"; });
    await page.getByTestId("stock-scanner-open").click(); await expect(scanner.getByTestId("TABLE_Leitura").locator("tbody tr")).toHaveCount(2);
    await scanner.getByTestId("BTN_Confirmar").click(); const unknown = page.getByTestId("WIN_Leitor_cod_barras_desconhecidos");
    await expect(unknown.getByTestId("TABLE_Leitura").locator("tbody tr")).toHaveCount(1); await expect(unknown).toContainText("WHAT"); await expect(unknown).toContainText("1,000");
    await unknown.getByTestId("BTN_Confirmar").click(); await expect(unknown).toHaveCount(0);
    const result = JSON.parse(await page.getByTestId("stock-scanner-returned").innerText());
    expect(result).toEqual({ kind: "partitioned", known: [{ barcode: "BAR-B", quantity: "2.25", code: "B", description: "Outro", price: "2.50" }], unknown: [{ barcode: "WHAT", quantity: "1.00" }] });
    expect(await page.evaluate(() => (window as unknown as NativeState).__scannerCalls)).toEqual(Array.from({ length: 2 }, () => ({ command: "read_terminal_scanner_file", payload: { request: identity } })));
    expect(partitions).toBe(1); expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["B"])).rows[0].stock).toBe("20");
    await expect(page.getByTestId("stock-scanner-file")).toHaveCount(0);
  } finally { await cleanup(); }
});

test("actual material scanner awaits authentication and configured native input, appends known rows, shows unknowns and saves only on Sair", async ({ page, materialServer, materialDatabase }) => {
  const cleanup = await provision(materialDatabase);
  try {
    const form = await openMaterial(page, materialServer.origin); await form.getByTestId("BTN_Leitor").click();
    expect(await page.evaluate(() => (window as unknown as NativeState).__scannerCalls)).toEqual([]);
    await authenticate(page); const scanner = page.getByTestId("WIN_Leitor_cod_barras");
    await expect(scanner.getByTestId("TABLE_Leitura").locator("tbody tr")).toHaveCount(2); await scanner.getByTestId("BTN_Confirmar").click();
    const unknown = page.getByTestId("WIN_Leitor_cod_barras_desconhecidos"); await expect(unknown).toContainText("WHAT"); await unknown.getByTestId("BTN_Confirmar").click();
    await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(2); await expect(form.getByTestId("TABLE_material")).toContainText("Outro"); await expect(form.getByTestId("TABLE_material")).toContainText("2,250");
    expect(await page.evaluate(() => (window as unknown as NativeState).__scannerCalls)).toEqual([{ command: "read_terminal_scanner_file", payload: { request: identity } }]);
    await expect(page.getByTestId("repair-material-scanner-file")).toHaveCount(0);
    expect((await materialDatabase.query('SELECT count(*)::text AS count FROM app."material_reparacao"')).rows[0].count).toBe("1");
    expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["B"])).rows[0].stock).toBe("20");
    await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
    expect((await materialDatabase.query('SELECT "mecanico","quantidade"::text,"preco"::text,"lancado" FROM app."material_reparacao" WHERE "artigo"=$1', ["B"])).rows).toEqual([{ mecanico: 7, quantidade: "2.25", preco: "2.50", lancado: false }]);
    expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["B"])).rows[0].stock).toBe("17.75");
  } finally { await cleanup(); }
});

test("actual material caller awaits file-failure Info then returns fechou; retries and reader cancellation preserve its draft and actor", async ({ page, materialServer, materialDatabase }) => {
  const cleanup = await provision(materialDatabase);
  try {
    const form = await openMaterial(page, materialServer.origin); await page.evaluate(() => { (window as unknown as NativeState).__scannerMode = "failed"; });
    await form.getByTestId("BTN_Leitor").click(); await authenticate(page);
    for (const failure of ["scanner_file_unavailable", "scanner_file_encoding", "scanner_file_read_failed"]) {
      if (failure !== "scanner_file_unavailable") {
        await page.evaluate(value => { (window as unknown as NativeState).__scannerFailure = value; }, failure); await form.getByTestId("BTN_Leitor").click();
      }
      await expect(page.getByTestId("LIB_INFO")).toHaveText("A leitura do ficheiro falhou, verifique o caminho");
      await expect(page.getByTestId("WIN_Leitor_cod_barras")).toBeVisible(); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
      await expect(page.getByTestId("WIN_Leitor_cod_barras")).toHaveCount(0); await expect(form.getByTestId("BTN_Leitor")).toBeEnabled();
      await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(1);
    }
    await page.evaluate(() => { (window as unknown as NativeState).__scannerMode = "ready"; }); await form.getByTestId("BTN_Leitor").click();
    const scanner = page.getByTestId("WIN_Leitor_cod_barras"); await expect(scanner.getByTestId("BTN_Confirmar")).toBeEnabled(); await scanner.getByTestId("BTN_Cancelar").click();
    await expect(scanner).toHaveCount(0); await expect(page.getByTestId("WIN_Leitor_cod_barras_desconhecidos")).toHaveCount(0);
    await expect(page.getByTestId("WIN_Inserir_quantidade_password")).toHaveCount(0); await expect(form.getByTestId("TABLE_material").locator("tbody tr")).toHaveCount(1);
    expect((await materialDatabase.query('SELECT count(*)::text AS count FROM app."material_reparacao"')).rows[0].count).toBe("1");
    await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
    expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=$1', ["B"])).rows[0].stock).toBe("20");
  } finally { await cleanup(); }
});
