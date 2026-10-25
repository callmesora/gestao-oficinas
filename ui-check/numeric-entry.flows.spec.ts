import { expect, test, type APIRequestContext } from "@playwright/test";

async function session(request: APIRequestContext) {
  const response = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  return { Authorization: `Bearer ${(await response.json()).token}` };
}

test("RULE-C286277B-011 customer live integer mask groups exact digits, edits caret, rejects invalid paste and persists", async ({ page, request }) => {
  const headers = await session(request), Codigo = String(Date.now() % 10000000000), Descricao = `Numeric ${Date.now()}`;
  await page.goto("/?workflow=customers"); await page.getByTestId("customers-open").click(); await page.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_Clientes"), code = form.getByTestId("EDT_Codigo");
  await expect(code).toHaveAttribute("inputmode", "numeric");
  await code.fill("1234"); await expect(code).toHaveValue("1 234");
  for (const [text, prevented] of [["12\n34", true], ["1e3", true], ["1 234", false]] as const) {
    expect(await code.evaluate((element, text) => {
      const clipboardData = new DataTransfer(); clipboardData.setData("text/plain", text);
      const paste = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData });
      (element as HTMLInputElement).select(); element.dispatchEvent(paste);
      return paste.defaultPrevented;
    }, text)).toBe(prevented);
    await expect(code).toHaveValue("1 234");
  }
  await code.fill("1e3"); await expect(code).toHaveValue("1 234");
  await code.fill("12345678901"); await expect(code).toHaveValue("1 234");
  await code.evaluate(element => (element as HTMLInputElement).setSelectionRange(2, 2)); await code.press("Backspace");
  await expect(code).toHaveValue("234");
  await code.fill("1234567"); await code.evaluate(element => (element as HTMLInputElement).setSelectionRange(2, 5)); await code.pressSequentially("9");
  await expect(code).toHaveValue("19 567");
  await form.getByTestId("EDT_Descricao").focus(); await code.focus();
  expect(await code.evaluate(element => { const input = element as HTMLInputElement; return [input.selectionStart, input.selectionEnd]; })).toEqual([0, 6]);
  await code.pressSequentially("42"); await expect(code).toHaveValue("42");
  await code.fill(""); await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText("Falta indicar o código"); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await code.fill(Codigo); await form.getByTestId("EDT_Descricao").fill(Descricao);
  await form.getByTestId("EDT_Codpostal").fill("001-23"); // A text field stays text.
  await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
  const result = await request.post("/api/customers/list", { headers, data: { mode: "codigo", term: Codigo } });
  expect((await result.json()).customers).toMatchObject([{ Codigo, Descricao, codpostal: "001-23" }]);
  await page.reload(); await page.getByTestId("customers-open").click();
  await expect(page.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: Descricao })).toBeVisible();
});

test("RULE-C9675195-013 vehicle masks reject malformed edits and retain API-bound overflow/NULL on unrelated save", async ({ page, request }) => {
  const headers = await session(request), Codigo = String(10000000000000000n + BigInt(Date.now())), registration = `N${Date.now()}`;
  expect((await (await request.post("/api/customers/save", { headers, data: { mode: "create", values: { Codigo, Descricao: registration, Morada1: "", Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "" } } })).json()).kind).toBe("saved");
  await page.goto("/?workflow=vehicles"); await page.getByTestId("vehicles-open").click(); await page.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_Viaturas"), year = form.getByTestId("EDT_Ano"), month = form.getByTestId("EDT_Mes");
  await form.getByTestId("EDT_Matricula").fill(registration); await form.getByTestId("COMBO_Codigo").selectOption(Codigo);
  await form.getByTestId("EDT_Marca").fill("Marca"); await form.getByTestId("EDT_Modelo").fill("Modelo");
  await year.fill("2026"); await year.fill("1e3"); await expect(year).toHaveValue("2026");
  await year.fill("65535"); await expect(year).toHaveValue("2026");
  await month.fill("10"); await month.fill("1.5"); await expect(month).toHaveValue("10");
  await month.fill("255"); await expect(month).toHaveValue("10");
  await year.fill(""); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
  let vehicle = (await (await request.post("/api/vehicles/lookup", { headers, data: { registration } })).json()).vehicle;
  expect(vehicle).toMatchObject({ Ano: 0, mes: 10, Cliente: Codigo });
  const values = { matricula: registration, Cliente: Codigo, marca: "Marca", modelo: "Modelo", Ano: 65535, mes: null };
  expect((await (await request.post("/api/vehicles/save", { headers, data: { mode: "update", originalRegistration: registration, values } })).json()).kind).toBe("saved");
  await page.getByTestId("BTN_matricula").click(); await page.getByTestId("EDT_termo_pesquisa").fill(registration);
  await expect(page.getByTestId("BTN_Modificar")).toBeEnabled(); await page.getByTestId("TABLE_Viaturas").getByRole("row").filter({ hasText: registration }).dblclick();
  await expect(year).toHaveValue("65535"); await expect(month).toHaveValue("0");
  await year.focus(); await month.focus(); await form.getByTestId("EDT_Modelo").fill("Bound preserved");
  await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
  vehicle = (await (await request.post("/api/vehicles/lookup", { headers, data: { registration } })).json()).vehicle;
  expect(vehicle).toMatchObject({ Ano: 65535, mes: null, modelo: "Bound preserved", Cliente: Codigo });
});

test("RULE-CDF1C34F-012 all terminal byte fields use source entry masks and preserve bound byte/NULL values", async ({ page, request }) => {
  const headers = await session(request), Codigo = "M" + (Date.now() % 1296).toString(36).padStart(2, "0");
  const positions = ["EDT_Posicao_Inicial_do_Codigo_de_Barras", "EDT_Posicao_Final_do_Codigo_de_Barras", "EDT_Posicao_Inicial_da_Quantidade", "EDT_Posicao_Final_da_Quantidade"];
  await page.goto("/?workflow=terminals"); await page.getByTestId("terminals-open").click(); await page.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_Terminais");
  await form.getByTestId("EDT_Codigo").fill(Codigo); await form.getByTestId("EDT_Descricao").fill("Numeric bytes");
  for (const name of positions) {
    const field = form.getByTestId(name); await expect(field).toHaveAttribute("inputmode", "numeric");
    await field.fill("99"); await field.fill("100"); await expect(field).toHaveValue("99");
    await field.fill("-1"); await expect(field).toHaveValue("99");
  }
  await form.getByTestId(positions[0]).fill("");
  let writes = 0; page.on("request", request => { if (request.url().endsWith("/api/terminals/save")) writes++; });
  await form.getByTestId("BTN_Validar").click(); await expect(form.getByTestId("terminal-form-diagnostic")).toHaveText("invalid_position");
  expect(writes).toBe(0);
  await form.getByTestId(positions[0]).fill("7"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
  let terminal = (await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.find((row: { Codigo: string }) => row.Codigo === Codigo);
  expect(terminal).toMatchObject({ Codigo, codbarras_inicio: 7, codbarras_fim: 99, quant_inicio: 99, quant_fim: 99 });
  const values = { Codigo, Descricao: "Bound bytes", codbarras_inicio: 255, codbarras_fim: null, quant_inicio: 128, quant_fim: 0, pasta_localizacao: null, nome_ficheiro: null };
  expect((await (await request.post("/api/terminals/save", { headers, data: { mode: "update", id: terminal.id, values } })).json()).kind).toBe("saved");
  const row = page.getByTestId("TABLE_Terminais").getByRole("row").filter({ has: page.getByRole("cell", { name: Codigo, exact: true }) });
  await row.click(); await page.getByTestId("BTN_Modificar").click(); await expect(form.getByTestId(positions[0])).toHaveValue("255");
  await form.getByTestId(positions[0]).focus(); await form.getByTestId(positions[1]).focus(); await form.getByTestId("EDT_Descricao").fill("Byte preservation");
  await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
  terminal = (await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.find((row: { Codigo: string }) => row.Codigo === Codigo);
  expect(terminal).toMatchObject({ ...values, Descricao: "Byte preservation" });
});
