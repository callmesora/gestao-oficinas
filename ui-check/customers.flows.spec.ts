import { expect, test } from "@playwright/test";

test("SRC-51085948c6 real customer form validates, saves, edits, cancels and persists through the API", async ({ page, request }) => {
  await page.goto("/?workflow=customers");
  await page.getByTestId("customers-open").click();
  await page.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_Clientes");
  await expect(form.getByTestId("EDT_Descricao")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(form).toHaveCount(0);
  await expect(page.getByTestId("WIN_Table_Clientes")).toBeVisible();
  await page.getByTestId("Btn_New").click();
  await form.getByTestId("EDT_Codigo").fill("0");
  await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText("Falta indicar o código");
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  const code = String(Date.now());
  const description = `Cliente sintético d'Água ${code}`, edited = `Cliente sintético editado ${code}`;
  await form.getByTestId("EDT_Codigo").fill(code);
  await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText("Falta indicar a descrição");
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await form.getByTestId("EDT_Descricao").fill(description);
  await form.getByTestId("EDT_Observacao").fill("Primeira linha\nSegunda linha");
  await form.getByTestId("BTN_Validar").click();
  await expect(form).toHaveCount(0);
  const row = page.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: description });
  await row.click();
  await expect(page.getByTestId("EDT_Observacao")).toHaveValue("Primeira linha\nSegunda linha");
  let releaseRead!: () => void;
  const gate = new Promise<void>(resolve => { releaseRead = resolve; });
  await page.route("**/api/customers/list", async route => {
    const response = await route.fetch();
    await gate; await route.fulfill({ response });
  });
  await page.getByTestId("BTN_codigo").click();
  await expect(page.getByTestId("BTN_Modificar")).toBeDisabled();
  await expect(page.getByTestId("BTN_Delete")).toBeDisabled();
  releaseRead();
  await expect(page.getByTestId("BTN_Modificar")).toBeEnabled();
  await page.unroute("**/api/customers/list");
  await page.getByTestId("BTN_Modificar").click();
  await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
  await form.getByTestId("EDT_Descricao").fill("Alteração cancelada");
  await form.getByTestId("BTN_Cancelar").click();
  await expect(row).toBeVisible();
  await expect(page.getByTestId("BTN_Modificar")).toBeEnabled();
  await row.dblclick();
  await form.getByTestId("EDT_Descricao").fill(edited);
  await form.getByTestId("BTN_Validar").click();
  await expect(form).toHaveCount(0);
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json();
  const data = await request.post("/api/customers/list", { headers: { Authorization: `Bearer ${token}` }, data: { mode: "codigo", term: code } });
  expect((await data.json()).customers).toMatchObject([{ Codigo: code, Descricao: edited, observacao: "Primeira linha\r\nSegunda linha" }]);
  await page.reload(); await page.getByTestId("customers-open").click();
  await expect(page.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: edited })).toBeVisible();
});

test("SRC-0bb0e89335 real delete dialog cancels safely and explicit Sim removes the persisted customer", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json(), headers = { Authorization: `Bearer ${token}` };
  const Codigo = String(Date.now());
  const result = await request.post("/api/customers/save", { headers, data: { mode: "create", values: { Codigo, Descricao: "Cliente sintético eliminar", Morada1: "", Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "" } } });
  expect((await result.json()).kind).toBe("saved");
  await page.goto("/?workflow=customers"); await page.getByTestId("customers-open").click();
  const row = page.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: "Cliente sintético eliminar" });
  await row.click(); await page.getByTestId("BTN_Delete").click();
  const dialog = page.getByTestId("WINDEVDIALOGBOX");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Não", exact: true }).click();
  await expect(row).toBeVisible();
  await page.getByTestId("BTN_Delete").click();
  await dialog.getByRole("button", { name: "Sim", exact: true }).click();
  await expect(row).toHaveCount(0);
  const data = await request.post("/api/customers/list", { headers, data: { mode: "codigo", term: Codigo } });
  expect((await data.json()).customers).toEqual([]);
});

test("SRC-284e9feb26 real list search modes reset/focus and duplicate save keeps the form open", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json(), headers = { Authorization: `Bearer ${token}` };
  const Codigo = String(Date.now()), description = `Pesquisa ${Codigo}`;
  const values = { Codigo, Descricao: description, Morada1: `Rua ${Codigo}`, Morada2: `Lugar ${Codigo}`, codpostal: `CP ${Codigo}`, Telefone1: `Tel ${Codigo}`, Telemovel: `Mov ${Codigo}`, observacao: "Nota de pesquisa" };
  expect((await (await request.post("/api/customers/save", { headers, data: { mode: "create", values } })).json()).kind).toBe("saved");
  await page.goto("/?workflow=customers"); await page.getByTestId("customers-open").click();
  for (const [mode, term] of [["codigo", Codigo], ["descricao", description], ["morada", values.Morada2], ["codigopostal", values.codpostal], ["telefone", values.Telemovel]]) {
    await page.getByTestId(`BTN_${mode}`).click();
    const search = page.getByTestId("EDT_termo_pesquisa");
    await expect(search).toHaveValue(""); await expect(search).toBeFocused();
    await search.fill(term);
    await expect(page.getByTestId("BTN_Modificar")).toBeEnabled();
    await expect(page.getByTestId("TABLE_Clientes").getByRole("row")).toHaveCount(2);
    await expect(page.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: description })).toBeVisible();
  }
  await page.getByTestId("BTN_todos").click();
  await expect(page.getByTestId("EDT_termo_pesquisa")).toHaveValue("");
  await page.getByTestId("Btn_New").click();
  const form = page.getByTestId("WIN_Form_Clientes");
  await form.getByTestId("EDT_Codigo").fill(Codigo); await form.getByTestId("EDT_Descricao").fill("Duplicado sintético");
  await form.getByTestId("BTN_Validar").click();
  await expect(page.getByTestId("LIB_INFO")).toHaveText(`Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${Codigo}`);
  await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
  await expect(form).toBeVisible(); await form.getByTestId("BTN_Cancelar").click();
  const read = await request.post("/api/customers/list", { headers, data: { mode: "codigo", term: Codigo } });
  expect((await read.json()).customers).toMatchObject([{ Codigo, Descricao: description }]);
});

test("SRC-0e07efbaa4 selection mode returns the selected real code and Fechar retains caller origin", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const { token } = await session.json(), Codigo = String(Date.now()), Descricao = `Selecionar ${Codigo}`;
  const response = await request.post("/api/customers/save", { headers: { Authorization: `Bearer ${token}` }, data: { mode: "create", values: { Codigo, Descricao, Morada1: "", Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "" } } });
  expect((await response.json()).kind).toBe("saved");
  await page.goto("/?workflow=customers&origin=41");
  await page.getByTestId("customers-select-open").click();
  await page.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: Descricao }).dblclick();
  await expect(page.getByTestId("WIN_Table_Clientes")).toHaveCount(0);
  await expect(page.getByTestId("customer-return")).toHaveText(Codigo);
  await page.getByTestId("customers-select-open").click();
  await page.getByTestId("BTN_SYST_FERMER").click();
  await expect(page.getByTestId("customer-return")).toHaveText("41");
  await page.getByTestId("customers-select-open").click();
  await page.getByTestId("BTN_Fechar").click();
  await expect(page.getByTestId("customer-return")).toHaveText("41");
});


test("RULE-CC16AB27-028 header prefix search selects real filtered data without filtering rows or activating the form", async ({ page, request }) => {
  const session = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  const headers = { Authorization: `Bearer ${(await session.json()).token}` }, marker = String(Date.now());
  const codes = [marker + "1", marker + "2"];
  for (const [index, Codigo] of codes.entries()) {
    const saved = await request.post("/api/customers/save", { headers, data: { mode: "create", values: { Codigo, Descricao: `Header ${marker} ${index}`, Morada1: index ? `Zeta ${marker}` : `Alpha ${marker}`, Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: `Observation ${marker} ${index}` } } });
    expect((await saved.json()).kind).toBe("saved");
  }
  await page.goto("/?workflow=customers&origin=41"); await page.getByTestId("customers-select-open").click();
  await page.getByTestId("BTN_descricao").click(); await page.getByTestId("EDT_termo_pesquisa").fill(`Header ${marker}`);
  await expect(page.getByTestId("BTN_Modificar")).toBeEnabled();
  const table = page.getByTestId("TABLE_Clientes");
  await expect(table.getByRole("row")).toHaveCount(3);
  await table.getByTestId("COL_Morada1__search").click();
  const search = table.getByRole("textbox", { name: "Pesquisar Morada 1", exact: true });
  await expect(search).toBeFocused();
  let releaseRead!: () => void;
  const gate = new Promise<void>(resolve => { releaseRead = resolve; });
  await page.route("**/api/customers/list", async route => {
    const response = await route.fetch(); // Delay only the real API/database response, never replace its rows.
    await gate; await route.fulfill({ response });
  });
  await search.fill(`Zeta ${marker}`);
  await expect(page.getByTestId("BTN_selecionar")).toBeDisabled();
  await search.press("Enter");
  await expect(page.getByTestId("WIN_Form_Clientes")).toHaveCount(0);
  releaseRead();
  await expect(page.getByTestId("BTN_selecionar")).toBeEnabled();
  await page.unroute("**/api/customers/list");
  await expect(table.locator('tr[aria-selected="true"]')).toContainText(codes[1].replace(/\B(?=(\d{3})+(?!\d))/g, " "));
  await expect(page.getByTestId("EDT_Observacao")).toHaveValue(`Observation ${marker} 1`);
  await expect(table.getByRole("row")).toHaveCount(3);
  await expect(table.locator("tbody tr").first()).toContainText(`Alpha ${marker}`);
  await expect(page.getByTestId("EDT_termo_pesquisa")).toHaveValue(`Header ${marker}`);
  await expect(page.getByTestId("WIN_Form_Clientes")).toHaveCount(0);
  await expect(table).toBeFocused();
  await table.getByTestId("COL_Descricao__search").click();
  await table.getByRole("textbox").press("Escape");
  await expect(page.getByTestId("WIN_Table_Clientes")).toBeVisible();
  await page.getByTestId("BTN_selecionar").click();
  await expect(page.getByTestId("customer-return")).toHaveText(codes[1]);
});

test("RULE-CC16AB27-028 real customer column visibility reload preserves widths and order and can restore the column", async ({ page }) => {
  await page.goto("/?workflow=customers"); await page.getByTestId("customers-open").click();
  const table = page.getByTestId("TABLE_Clientes"), phone = table.getByTestId("COL_Telefone1");
  const original = (await phone.boundingBox())!.width;
  await phone.getByRole("separator").press("ArrowRight");
  const resized = (await phone.boundingBox())!.width; expect(resized).toBe(original + 8);
  await table.getByTestId("COL_Descricao").getByRole("button").first().press("Control+Shift+ArrowLeft");
  await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao");
  await table.getByTestId("TABLE_Clientes__columns").click();
  await table.getByRole("checkbox", { name: "Telefone", exact: true }).uncheck();
  await expect(phone).toHaveCount(0);
  await page.reload(); await page.getByTestId("customers-open").click();
  await expect(phone).toHaveCount(0);
  await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao");
  await table.getByTestId("TABLE_Clientes__columns").click();
  await expect(table.getByRole("checkbox", { name: "Telefone", exact: true })).not.toBeChecked();
  await table.getByRole("checkbox", { name: "Telefone", exact: true }).check();
  await expect(phone).toBeVisible(); expect((await phone.boundingBox())!.width).toBe(resized);
  await table.getByRole("checkbox", { name: "Telefone", exact: true }).press("Escape");
  await expect(table.getByRole("group", { name: "Colunas", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("WIN_Table_Clientes")).toBeVisible();
  await table.getByTestId("TABLE_Clientes__columns").click();
  await table.getByRole("button", { name: "Repor", exact: true }).click();
  await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Codigo");
  expect((await phone.boundingBox())!.width).toBe(original);
  await page.reload(); await page.getByTestId("customers-open").click();
  await expect(table.getByRole("columnheader")).toHaveCount(7);
  await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Codigo");
  expect((await phone.boundingBox())!.width).toBe(original);
});
