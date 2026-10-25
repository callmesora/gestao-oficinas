import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";

async function session(request: APIRequestContext) {
  const response = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  return { Authorization: `Bearer ${(await response.json()).token}` };
}

async function savedLayout(page: Page, table: Locator, launcher: string, resizedColumn: string, movedColumn: string, originalFirst: string) {
  const header = table.getByTestId(resizedColumn), originalWidth = (await header.boundingBox())!.width;
  const caption = await header.getByRole("button").first().innerText();
  await header.getByRole("separator").press("ArrowRight");
  expect((await header.boundingBox())!.width).toBe(originalWidth + 8);
  await table.getByTestId(movedColumn).getByRole("button").first().press("Control+Shift+ArrowLeft");
  await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", movedColumn);
  await header.click({ button: "right" });
  await table.getByRole("checkbox", { name: caption, exact: true }).uncheck(); await expect(header).toHaveCount(0);
  await page.reload(); await page.getByTestId(launcher).click(); await expect(header).toHaveCount(0);
  await table.getByRole("button", { name: "Colunas", exact: true }).click();
  await table.getByRole("checkbox", { name: caption, exact: true }).check(); await expect(header).toBeVisible();
  expect((await header.boundingBox())!.width).toBe(originalWidth + 8);
  await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", movedColumn);
  await table.getByRole("button", { name: "Repor", exact: true }).click();
  await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", originalFirst);
  expect((await header.boundingBox())!.width).toBe(originalWidth);
}

async function swipeTable(page: Page, table: Locator) {
  const client = await page.context().newCDPSession(page), box = (await table.boundingBox())!;
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const point = { x: box.x + box.width / 2, y: box.y + box.height - 35, id: 0 };
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  for (let index = 1; index <= 8; index++) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...point, y: point.y - index * 20 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await client.detach();
}

test("RULE-C039C545-025 real vehicle header seek keeps effective filter, numeric cells, layout and source scrolling", async ({ page, request }) => {
  const headers = await session(request), marker = String(Date.now()).slice(-10), codes = [marker + "01", marker + "02"];
  const descriptions = [`Alpha ${marker}`, `Zeta ${marker} ` + "cliente longo ".repeat(5)];
  for (const [index, Codigo] of codes.entries()) expect((await (await request.post("/api/customers/save", { headers, data: { mode: "create", values: { Codigo, Descricao: descriptions[index], Morada1: "", Morada2: "", codpostal: "", Telefone1: "", Telemovel: "", observacao: "" } } })).json()).kind).toBe("saved");
  const registrations = Array.from({ length: 25 }, (_, index) => `H${marker}${String(index).padStart(2, "0")}`);
  for (const [index, matricula] of registrations.entries()) expect((await (await request.post("/api/vehicles/save", { headers, data: { mode: "create", values: { matricula, Cliente: codes[index === 24 ? 1 : 0], marca: "Marca", modelo: "Modelo", Ano: index === 24 ? 2099 : 2026, mes: index === 24 ? 9 : 2 } } })).json()).kind).toBe("saved");
  await page.goto("/?workflow=vehicles"); await page.getByTestId("vehicles-open").click();
  const list = page.getByTestId("WIN_Table_Viaturas"), table = list.getByTestId("TABLE_Viaturas");
  await list.getByTestId("BTN_matricula").click(); await list.getByTestId("EDT_termo_pesquisa").fill(marker);
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount(25);
  await list.getByTestId("BTN_cliente").click(); await expect(list.getByTestId("EDT_termo_pesquisa")).toHaveValue("");
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount(25);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/vehicles/list", async route => { const response = await route.fetch(); await gate; await route.fulfill({ response }); });
  await table.getByTestId("COL_Cliente__search").click(); await table.getByRole("textbox").fill(`Zeta ${marker}`);
  await expect(list.getByTestId("BTN_Modificar")).toBeDisabled(); await expect(list.getByTestId("Btn_New")).toBeDisabled();
  await table.locator("tbody tr").first().dblclick(); await expect(page.getByTestId("WIN_Form_Viaturas")).toHaveCount(0);
  await table.getByRole("textbox").press("Enter"); release(); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled();
  await page.unroute("**/api/vehicles/list");
  await expect(table.locator('tr[aria-selected="true"]')).toContainText(registrations[24]);
  await expect(table.locator("tbody tr")).toHaveCount(25); await expect(list.getByTestId("EDT_termo_pesquisa")).toHaveValue("");
  for (const [column, term] of [["COL_Ano", "2099"], ["COL_Mes", "9"]]) {
    await table.getByRole("row").filter({ has: page.getByRole("cell", { name: registrations[0], exact: true }) }).click();
    await expect(table.locator('tr[aria-selected="true"]')).toContainText(registrations[0]);
    await table.getByTestId(`${column}__search`).click(); await table.getByRole("textbox").fill(term);
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText(registrations[24]);
    await table.getByRole("textbox").press("Escape"); await expect(list).toBeVisible();
  }
  const selected = table.locator('tr[aria-selected="true"]');
  await selected.locator("td").nth(1).hover(); await expect(selected.locator("td").nth(1)).toHaveAttribute("title", descriptions[1]);
  await selected.locator("td").nth(5).hover(); await expect(selected.locator("td").nth(5)).not.toHaveAttribute("title");
  await expect(table).toHaveCSS("overflow-y", "scroll"); await expect(table).toHaveCSS("overflow-x", "auto");
  await table.evaluate(element => { element.scrollTop = 0; });
  await swipeTable(page, table); expect(await table.evaluate(element => element.scrollTop)).toBe(0);
  // Positive control: the same real overflowing table pans when source touch gating is removed.
  await table.evaluate(element => { (element as HTMLElement).style.touchAction = "auto"; });
  await swipeTable(page, table); await expect.poll(() => table.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await table.evaluate(element => { (element as HTMLElement).style.touchAction = "none"; });
  await table.evaluate(element => { element.scrollTop = 7; }); expect(await table.evaluate(element => element.scrollTop)).toBe(7);
  await list.getByTestId("BTN_matricula").click(); await list.getByTestId("EDT_termo_pesquisa").fill(`None${marker}`);
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount(0);
  expect(await table.evaluate(element => (element as HTMLElement).offsetWidth - element.clientWidth)).toBeGreaterThanOrEqual(16);
  await savedLayout(page, table, "vehicles-open", "COL_Marca", "COL_Cliente", "COL_Matricula");
  for (const registration of registrations) expect((await (await request.post("/api/vehicles/delete", { headers, data: { registration } })).json()).kind).toBe("deleted");
  const customers = (await (await request.post("/api/customers/list", { headers, data: { mode: "codigo", term: marker } })).json()).customers;
  for (const row of customers.filter((row: { Codigo: string }) => codes.includes(row.Codigo))) expect((await (await request.post("/api/customers/delete", { headers, data: { id: row.id } })).json()).kind).toBe("deleted");
});

test("RULE-CCB16084-014 real unit text-key seek retains rows, source-hidden ID, saved columns and pixel scrolling", async ({ page, request }) => {
  const headers = await session(request), marker = String(Date.now()), ids: string[] = [];
  for (let index = 0; index < 32; index++) {
    const saved = (await (await request.post("/api/units/save", { headers, data: { mode: "create", values: { Codigo: `P${index.toString(36).padStart(2, "0")}`, Descricao: index === 31 ? `Z${marker} ` + "longo ".repeat(5) : `A${marker} ${index}` } } })).json());
    expect(saved.kind).toBe("saved"); ids.push(saved.unit.id);
  }
  const loaded = (await (await request.post("/api/units/list", { headers, data: {} })).json()).units;
  await page.goto("/?workflow=units"); await page.getByTestId("units-open").click();
  const list = page.getByTestId("WIN_Table_unidades"), table = list.getByTestId("TABLE_unidades");
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount(loaded.length);
  await expect(table.getByTestId("COL_UnidadesID")).toHaveCount(0);
  await table.getByTestId("COL_Codigo__search").click(); await table.getByRole("textbox").fill("P0v");
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText("P0v");
  await table.getByRole("textbox").press("Enter"); await expect(page.getByTestId("WIN_Form_unidades")).toHaveCount(0);
  await table.getByRole("row").filter({ has: page.getByRole("cell", { name: "P00", exact: true }) }).click();
  await expect(table.locator('tr[aria-selected="true"]')).toContainText("P00");
  await table.getByTestId("COL_Descricao__search").click(); await table.getByRole("textbox").fill(`Z${marker}`);
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText("P0v");
  await table.getByRole("textbox").press("Escape"); await expect(list).toBeVisible(); await expect(table.locator("tbody tr")).toHaveCount(loaded.length);
  const description = table.locator('tr[aria-selected="true"] td').nth(1);
  await table.getByTestId("COL_Descricao").getByRole("separator").press("ArrowLeft");
  // Explicit user sizing creates a real truncated cell, rather than mocking its measured overflow.
  for (let index = 0; index < 40; index++) await table.getByTestId("COL_Descricao").getByRole("separator").press("ArrowLeft");
  await description.hover(); await expect(description).toHaveAttribute("title", loaded.find((row: { id: string }) => row.id === ids[31]).Descricao);
  await table.evaluate(element => { element.scrollTop = 7; }); expect(await table.evaluate(element => element.scrollTop)).toBe(7);
  await table.getByRole("button", { name: "Colunas", exact: true }).click();
  await expect(table.getByRole("checkbox")).toHaveCount(2); await expect(table.getByText("Identifier of unidades", { exact: true })).toHaveCount(0);
  await table.getByRole("button", { name: "Repor", exact: true }).click();
  await savedLayout(page, table, "units-open", "COL_Descricao", "COL_Descricao", "COL_Codigo");
  await expect(table.getByRole("columnheader")).toHaveCount(2);
  for (const id of ids) expect((await (await request.post("/api/units/delete", { headers, data: { id } })).json()).kind).toBe("deleted");
});

test("RULE-C33B299B-016 actual terminal header search and configuration use real records", async ({ page, request }) => {
  const headers = await session(request), marker = (Date.now() % 1296).toString(36).padStart(2, "0"), ids: string[] = [];
  for (const prefix of ["Q", "R"]) {
    const saved = (await (await request.post("/api/terminals/save", { headers, data: { mode: "create", values: { Codigo: prefix + marker, Descricao: `Header ${prefix}${marker}`, codbarras_inicio: 0, codbarras_fim: 0, quant_inicio: 0, quant_fim: 0, pasta_localizacao: "", nome_ficheiro: "" } } })).json());
    expect(saved.kind).toBe("saved"); ids.push(saved.terminal.id);
  }
  const count = (await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.length;
  await page.goto("/?workflow=terminals"); await page.getByTestId("terminals-open").click();
  const list = page.getByTestId("WIN_Table_Terminais"), table = list.getByTestId("TABLE_Terminais");
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled();
  await table.getByTestId("COL_Descricao__search").click(); await table.getByRole("textbox").fill(`Header R${marker}`);
  await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText(`R${marker}`);
  await table.getByRole("textbox").press("Enter"); await expect(page.getByTestId("WIN_Form_Terminais")).toHaveCount(0);
  await expect(table.locator("tbody tr")).toHaveCount(count);
  await savedLayout(page, table, "terminals-open", "COL_Descricao", "COL_Descricao", "COL_Codigo");
  for (const id of ids) expect((await (await request.post("/api/terminals/delete", { headers, data: { id } })).json()).kind).toBe("deleted");
});
