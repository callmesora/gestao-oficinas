import { test, expect } from "./support/repair-materials";

for (const delayed of [false, true]) test(`stock proof material caller reader chrome returns fechou and retains its actual draft${delayed ? " after a late genuine config response" : " before confirmation"}`, async ({ page, materialServer, materialDatabase }) => {
  const terminal = (await materialDatabase.query<{ id: string }>('INSERT INTO app."Terminais" ("Codigo","codbarras_inicio","codbarras_fim","quant_inicio","quant_fim") VALUES (\'P01\',1,6,7,4) RETURNING _row_id::text AS id')).rows[0];
  const posto = (await materialDatabase.query<{ id: string }>('INSERT INTO app."postos" ("Codigo","terminal") VALUES (1,\'P01\') RETURNING _row_id::text AS id')).rows[0];
  let partitions = 0, release!: () => void;
  const gate = new Promise<void>(done => { release = done; }); const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (request.url().endsWith("/api/stock/scanner-partition")) partitions++; });
  const before = (await materialDatabase.query('SELECT to_jsonb(m) AS row FROM app."material_reparacao" m ORDER BY _row_id')).rows;
  try {
    await page.goto(`${materialServer.origin}/?workflow=repair-materials`); await page.getByTestId("repair-materials-open").click();
    await page.getByTestId("TABLE_ordens_reparacao").getByRole("cell", { name: "9007199254740993", exact: true }).click(); await page.getByTestId("BTN_Material").click();
    const form = page.getByTestId("WIN_Material_reparacao_form"), table = form.getByTestId("TABLE_material"); await expect(table.locator("tbody tr")).toHaveCount(1);
    await form.getByTestId("EDT_quant").fill("9,125"); await form.getByTestId("EDT_artigo_descricao").fill("Unsaved input Ω  "); const memory = await table.innerText();
    let configFetched = false;
    if (delayed) await page.route("**/api/stock/scanner-config", async route => { const response = await route.fetch(); configFetched = true; await gate; await route.fulfill({ response }); });
    await form.getByTestId("BTN_Leitor").click(); const prompt = page.getByTestId("WIN_Inserir_quantidade_password"); await prompt.getByTestId("EDT_password").fill("Synthetic"); await prompt.getByTestId("BTN_Confirmar").click();
    await page.getByTestId("repair-material-scanner-upload").setInputFiles({ name: "proof-reader.txt", mimeType: "text/plain", buffer: Buffer.from("BAR-B 2.25\r\nWHAT  1.00\r\n") });
    const reader = page.locator('dialog[data-testid="WIN_Leitor_cod_barras"]'); await expect(reader).toBeVisible();
    if (delayed) { await expect.poll(() => configFetched).toBe(true); await expect(reader.getByTestId("BTN_Confirmar")).toBeDisabled(); }
    else await expect(reader.getByTestId("TABLE_Leitura").locator("tbody tr")).toHaveCount(2);
    await reader.getByTestId("BTN_SYST_FERMER").click(); await expect(reader).toHaveCount(0); await expect(form.getByTestId("BTN_Leitor")).toBeEnabled();
    await expect(form.getByTestId("repair-material-form-diagnostic")).toHaveCount(0);
    if (delayed) { const completed = page.waitForResponse(response => response.url().endsWith("/api/stock/scanner-config")); release(); await (await completed).finished(); await page.unroute("**/api/stock/scanner-config"); }
    expect(partitions).toBe(0); expect(await table.innerText()).toBe(memory); await expect(form.getByTestId("EDT_quant")).toHaveValue("9,125"); await expect(form.getByTestId("EDT_artigo_descricao")).toHaveValue("Unsaved input Ω  ");
    await expect(page.getByTestId("WIN_Leitor_cod_barras_desconhecidos")).toHaveCount(0); expect((await materialDatabase.query('SELECT to_jsonb(m) AS row FROM app."material_reparacao" m ORDER BY _row_id')).rows).toEqual(before);
    // The same authenticated caller can reopen and accept the actual result;
    // closing the unknown reader resumes it without undoing appended known rows.
    await form.getByTestId("BTN_Leitor").click(); await expect(prompt).toHaveCount(0);
    await page.getByTestId("repair-material-scanner-upload").setInputFiles({ name: "proof-reader.txt", mimeType: "text/plain", buffer: Buffer.from("BAR-B 2.25\r\nWHAT  1.00\r\n") });
    await expect(reader.getByTestId("BTN_Confirmar")).toBeEnabled(); await reader.getByTestId("BTN_Confirmar").click();
    const unknown = page.locator('dialog[data-testid="WIN_Leitor_cod_barras_desconhecidos"]'); await expect(unknown).toContainText("WHAT"); await unknown.getByTestId("BTN_SYST_FERMER").click();
    await expect(unknown).toHaveCount(0); await expect(table.locator("tbody tr")).toHaveCount(2); await expect(table).toContainText("Outro"); expect(partitions).toBe(1);
    expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=\'B\'')).rows[0].stock).toBe("20");
    await form.getByTestId("BTN_Sair").click(); await expect(form).toHaveCount(0);
    expect((await materialDatabase.query('SELECT "quantidade"::text,"preco"::text,"mecanico" FROM app."material_reparacao" WHERE "artigo"=\'B\'')).rows).toEqual([{ quantidade: "2.25", preco: "2.50", mecanico: 7 }]);
    expect((await materialDatabase.query('SELECT "stock"::text FROM app."artigos" WHERE "Codigo"=\'B\'')).rows[0].stock).toBe("17.75"); expect(errors).toEqual([]);
  } finally { release(); await page.unroute("**/api/stock/scanner-config"); await materialDatabase.query('DELETE FROM app."postos" WHERE _row_id=$1', [posto.id]); await materialDatabase.query('DELETE FROM app."Terminais" WHERE _row_id=$1', [terminal.id]); }
});
