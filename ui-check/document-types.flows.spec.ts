import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import type { DocumentType, DocumentTypeValues } from "../packages/domain/src/document-types";

type Headers = { Authorization: string };
async function session(request: APIRequestContext): Promise<Headers> {
  const result = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(result.ok()).toBe(true); return { Authorization: `Bearer ${(await result.json()).token}` };
}
async function api<T>(request: APIRequestContext, headers: Headers, operation: string, data: unknown): Promise<T> {
  const result = await request.post(`/api/document-types/${operation}`, { headers, data }); expect(result.ok()).toBe(true); return result.json() as Promise<T>;
}
async function rows(request: APIRequestContext, headers: Headers): Promise<DocumentType[]> {
  const result = await api<{ kind: string; documentTypes: DocumentType[] }>(request, headers, "list", {}); expect(result.kind).toBe("loaded"); return result.documentTypes;
}
async function codes(request: APIRequestContext, headers: Headers, count: number): Promise<string[]> {
  const used = new Set((await rows(request, headers)).map(row => row.Codigo));
  const available = Array.from({ length: 1296 }, (_, index) => "D" + index.toString(36).padStart(2, "0")).filter(code => !used.has(code));
  expect(available.length).toBeGreaterThanOrEqual(count); return available.slice(0, count);
}
const values = (Codigo: string, overrides: Partial<DocumentTypeValues> = {}): DocumentTypeValues => ({ Codigo, Descricao: "Synthetic document type", stock: 1, obriga_macanico: false, ...overrides });
async function seed(request: APIRequestContext, headers: Headers, values: DocumentTypeValues): Promise<DocumentType> {
  const result = await api<{ kind: string; documentType: DocumentType }>(request, headers, "save", { mode: "create", values }); expect(result.kind).toBe("saved"); return result.documentType;
}
async function cleanup(request: APIRequestContext, headers: Headers, ids: readonly string[]) { for (const id of ids) await request.post("/api/document-types/delete", { headers, data: { id } }); }
const rowFor = (page: Page, table: Locator, value: string) => table.getByRole("row").filter({ has: page.getByRole("cell", { name: value, exact: true }) });
async function open(page: Page) { await page.goto("/?workflow=document-types"); await page.getByTestId("document-types-open").click(); await expect(page.getByTestId("WIN_Table_documentos").getByTestId("Btn_New")).toBeEnabled(); }
async function info(page: Page, text: string) { await expect(page.getByTestId("LIB_INFO")).toHaveText(text); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); }
async function swipeTable(page: Page, table: Locator) {
  const client = await page.context().newCDPSession(page), box = (await table.boundingBox())!;
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const point = { x: box.x + box.width / 2, y: box.y + box.height - 35, id: 0 };
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  for (let index = 1; index <= 8; index++) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...point, y: point.y - index * 20 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))); await client.detach();
}

test("SRC-3c9d2e15a6 SRC-2ce08638c5 actual Documentos RAD form preserves exact captions, checkbox-before-radio keys and persistent CRUD", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), owned: string[] = []; let writes = 0;
  page.on("request", item => { if (item.url().endsWith("/api/document-types/save")) writes++; });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_documentos"), table = list.getByTestId("TABLE_documentos"), form = page.getByTestId("WIN_Form_documentos");
    await expect(page.getByTestId("workspace-window-1-frame").getByTestId("RADTitle")).toHaveText("Tabela de Documentos"); await expect(list.getByTestId("BTN_Imprimir")).toBeEnabled();
    await list.getByTestId("Btn_New").click(); await expect(form.getByTestId("RADTitle")).toHaveText("Documentos"); await expect(form.getByText("Codigo", { exact: true })).toBeVisible(); await expect(form.getByText("Descrição", { exact: true })).toBeVisible(); await expect(form.getByTestId("STC_Stock")).toHaveText("Stock");
    const group = form.getByTestId("RADIO_NoName1"), checkbox = form.getByTestId("CBOX_Obriga_macanico"); await expect(group.getByRole("radio")).toHaveText(["Entrada", "Saída"]); await expect(group.getByRole("radio", { name: "Entrada", exact: true })).toHaveAttribute("aria-checked", "true"); await expect(checkbox).not.toBeChecked(); await expect(checkbox).toHaveAccessibleName("Obriga a identificar mecânico");
    await form.getByTestId("EDT_Codigo").focus(); await page.keyboard.press("Tab"); await expect(form.getByTestId("EDT_Descricao")).toBeFocused(); await page.keyboard.press("Tab"); await expect(checkbox).toBeFocused(); await page.keyboard.press("Tab"); await expect(group.getByRole("radio", { name: "Entrada", exact: true })).toBeFocused();
    await page.keyboard.press("ArrowDown"); await expect(group.getByRole("radio", { name: "Saída", exact: true })).toBeFocused(); await page.keyboard.press("Enter"); await page.keyboard.press("Space"); expect(writes).toBe(0); await expect(form).toBeVisible(); await page.keyboard.press("Tab"); await expect(form.getByTestId("BTN_Validar")).toBeFocused();
    await form.getByTestId("BTN_Validar").click(); await info(page, "Falta indicar o código"); expect(writes).toBe(0);
    await form.getByTestId("EDT_Codigo").fill(code); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("maxlength", "3"); await expect(form.getByTestId("EDT_Descricao")).toHaveAttribute("maxlength", "50"); await checkbox.check(); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    const created = (await rows(request, headers)).find(row => row.Codigo === code)!; owned.push(created.id); expect(created).toMatchObject({ Codigo: code, Descricao: "", stock: 2, obriga_macanico: true });
    const row = rowFor(page, table, code); await expect(row).toContainText("Saída"); await expect(row.getByRole("checkbox")).toHaveAttribute("aria-readonly", "true"); await row.getByRole("checkbox").click(); expect((await rows(request, headers)).find(row => row.id === created.id)?.obriga_macanico).toBe(true);
    await row.dblclick(); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", ""); await form.getByTestId("EDT_Descricao").fill("d'Água  "); await group.getByRole("radio", { name: "Entrada", exact: true }).click(); await checkbox.focus(); await checkbox.press("Space"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    const saved = (await rows(request, headers)).find(row => row.id === created.id)!; expect(saved).toMatchObject({ documentosID: created.documentosID, Descricao: "d'Água  ", stock: 1, obriga_macanico: false });
    await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Codigo").fill(code); await form.getByTestId("BTN_Validar").click(); await info(page, `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`); await expect(form).toBeVisible(); await form.getByTestId("BTN_Cancelar").click();
    await page.reload(); await page.getByTestId("document-types-open").click(); await expect(row).toContainText("d'Água  "); await expect(row).toContainText("Entrada");
    await row.click(); await list.getByTestId("BTN_Delete").click(); const confirm = page.getByTestId("WINDEVDIALOGBOX"); await expect(confirm.getByTestId("RADTitle")).toHaveText("Tabela de Documentos"); await expect(confirm.getByTestId("LIB_INFO")).toHaveText("Deseja apagar o registo?"); await expect(confirm.getByRole("button", { name: "Não", exact: true })).toBeFocused(); await confirm.getByRole("button", { name: "Não", exact: true }).click(); await expect(row).toBeVisible();
    await list.getByTestId("BTN_Delete").click(); await confirm.getByRole("button", { name: "Sim", exact: true }).click(); await expect(row).toHaveCount(0); expect((await rows(request, headers)).some(row => row.id === created.id)).toBe(false);
  } finally { await cleanup(request, headers, owned); }
});

test("RULE-C5CA4D83-DOMAIN actual new defaults and untouched NULL, zero and out-of-option stock survive unrelated saves", async ({ page, request }) => {
  const headers = await session(request), available = await codes(request, headers, 4), owned: string[] = [], cases = [null, 0, 255];
  try {
    for (const [index, stock] of cases.entries()) owned.push((await seed(request, headers, values(available[index], { stock, Descricao: null, obriga_macanico: null }))).id);
    await open(page); const list = page.getByTestId("WIN_Table_documentos"), table = list.getByTestId("TABLE_documentos"), form = page.getByTestId("WIN_Form_documentos");
    await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Codigo").fill(available[3]); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); const created = (await rows(request, headers)).find(row => row.Codigo === available[3])!; owned.push(created.id); expect(created).toMatchObject({ stock: 1, obriga_macanico: false, Descricao: "" });
    for (const [index, stock] of cases.entries()) {
      await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, table, available[index]).dblclick(); await expect(form.getByTestId("RADIO_NoName1").getByRole("radio", { checked: true })).toHaveCount(0); await expect(form.getByTestId("CBOX_Obriga_macanico")).not.toBeChecked();
      // Saving unchanged preserves optional NULL description as well as unknown radio/checkbox storage.
      await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect((await rows(request, headers)).find(row => row.id === owned[index])).toMatchObject({ stock, Descricao: null, obriga_macanico: null });
      await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, table, available[index]).dblclick(); await form.getByTestId("EDT_Descricao").fill(`Untouched stock ${index}`); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect((await rows(request, headers)).find(row => row.id === owned[index])).toMatchObject({ stock, Descricao: `Untouched stock ${index}`, obriga_macanico: null });
    }
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, table, available[0]).dblclick(); await form.getByRole("radio", { name: "Saída", exact: true }).click(); await form.getByTestId("CBOX_Obriga_macanico").check(); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect((await rows(request, headers)).find(row => row.id === owned[0])).toMatchObject({ stock: 2, obriga_macanico: true });
  } finally { await cleanup(request, headers, owned); }
});

test("SRC-3d9a9e304c source edit opens current row immediately and refreshes after every return; new cancel has no refresh", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, values(code)); const inputs: unknown[] = [];
  page.on("request", item => { if (item.url().endsWith("/api/document-types/list")) inputs.push(item.postDataJSON()); });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_documentos"), form = page.getByTestId("WIN_Form_documentos"), table = list.getByTestId("TABLE_documentos");
    await table.getByTestId("COL_Descricao").getByRole("button").first().click(); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); const initial = inputs.length, sorted = inputs.at(-1);
    await list.getByTestId("Btn_New").click(); await form.getByTestId("BTN_Cancelar").click(); await expect(list.getByTestId("Btn_New")).toBeEnabled(); expect(inputs.length).toBe(initial);
    expect((await api<{ kind: string }>(request, headers, "save", { mode: "update", id: original.id, values: values(code, { Descricao: "External change before current-row edit", stock: 2 }) })).kind).toBe("saved");
    await rowFor(page, table, code).click(); await list.getByTestId("BTN_Modificar").click(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue(original.Descricao!); await expect(form.getByRole("radio", { name: "Entrada", exact: true })).toHaveAttribute("aria-checked", "true"); expect(inputs.length).toBe(initial);
    await form.getByTestId("EDT_Descricao").fill("Cancelled draft"); await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); expect(inputs.length).toBe(initial + 1); expect(inputs.at(-1)).toEqual(sorted); await expect(rowFor(page, table, code)).toContainText("External change before current-row edit");
    await rowFor(page, table, code).dblclick(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("External change before current-row edit"); expect(inputs.length).toBe(initial + 1); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); expect(inputs.length).toBe(initial + 2);
  } finally { await cleanup(request, headers, [original.id]); }
});

test("SRC-e017fec224 SRC-fac9bff440 real Documentos selector hides maintenance, retains geometry, exact string return/origin and valid row bounds", async ({ page, request }) => {
  const headers = await session(request), [ordinary] = await codes(request, headers, 1), exact = `${ordinary.slice(-1)}' `, origin = " 0' ", owned: string[] = [];
  try {
    expect((await rows(request, headers)).some(row => row.Codigo === exact)).toBe(false); owned.push((await seed(request, headers, values(exact))).id); owned.push((await seed(request, headers, values(ordinary))).id);
    await page.goto(`/?workflow=document-types&selecting=1&origin=${encodeURIComponent(origin)}`); await page.getByTestId("document-types-select-open").click();
    const picker = page.getByTestId("document-type-picker"), table = picker.getByTestId("TABLE_documentos"); await expect(picker.getByTestId("BTN_selecionar")).toBeFocused();
    for (const id of ["Btn_New", "BTN_Modificar", "BTN_Delete", "BTN_Imprimir"]) await expect(picker.getByTestId(id)).toBeHidden(); for (const id of ["BTN_anterior", "BTN_seguinte", "BTN_selecionar"]) await expect(picker.getByTestId(id)).toBeVisible();
    expect((await table.locator("tbody tr").first().boundingBox())!.height).toBe(30); await expect(table.locator("tbody tr")).toHaveCount((await rows(request, headers)).length);
    const frame = (await page.getByTestId("document-type-picker-frame").boundingBox())!, close = (await picker.getByTestId("BTN_Fechar").boundingBox())!; expect(close.y - frame.y).toBe(503); expect(close.height).toBe(38);
    const first = table.locator("tbody tr").first(), last = table.locator("tbody tr").last(); await first.click(); await picker.getByTestId("BTN_anterior").click(); await expect(first).toHaveAttribute("aria-selected", "true"); await picker.getByTestId("BTN_seguinte").click(); await expect(table.locator("tbody tr").nth(1)).toHaveAttribute("aria-selected", "true"); await last.click(); await picker.getByTestId("BTN_seguinte").click(); await expect(last).toHaveAttribute("aria-selected", "true");
    await rowFor(page, table, exact.trim()).dblclick(); await expect(picker).toHaveCount(0); expect(await page.getByTestId("document-types-returned").textContent()).toBe(exact);
    await page.getByTestId("document-types-select-open").click(); await picker.getByTestId("BTN_Fechar").click(); expect(await page.getByTestId("document-types-returned").textContent()).toBe(origin);
    await page.getByTestId("document-types-select-open").click(); await page.keyboard.press("Escape"); await expect(picker).toHaveCount(0); expect(await page.getByTestId("document-types-returned").textContent()).toBe(origin);
    // This DEV launcher does not implement the stock callers' unconditional continuation (MIG-11).
  } finally { await cleanup(request, headers, owned); }
});

test("RULE-CFEE768B-021 actual stock/Boolean header seeks and saved columns consume102px Center and source scroll/touch options", async ({ page, request }) => {
  const headers = await session(request), available = await codes(request, headers, 32), owned: string[] = [], marker = String(Date.now());
  try {
    for (const [index, code] of available.entries()) owned.push((await seed(request, headers, values(code, { stock: index === 31 ? 2 : 1, obriga_macanico: index === 31, Descricao: `${index === 31 ? "Z" : "A"}${marker} ` + "longo ".repeat(5) }))).id);
    await open(page); const list = page.getByTestId("WIN_Table_documentos"), table = list.getByTestId("TABLE_documentos"), count = (await rows(request, headers)).length;
    for (const [column, width] of [["COL_Codigo", 79], ["COL_Descricao", 244], ["COL_Stock", 93], ["COL_Obriga_macanico", 102]] as const) expect((await table.getByTestId(column).boundingBox())!.width).toBe(width);
    await expect(table.getByTestId("COL_DocumentosID")).toHaveCount(0); const centeredCell = table.locator("tbody tr").first().locator("td").nth(3); await expect(centeredCell).toHaveCSS("text-align", "center"); const cellBox = (await centeredCell.boundingBox())!, markBox = (await centeredCell.locator(".wd-check-mark").boundingBox())!; expect(Math.abs((cellBox.x + cellBox.width / 2) - (markBox.x + markBox.width / 2))).toBeLessThanOrEqual(1);
    for (const [column, term] of [["COL_Codigo", available[31]], ["COL_Descricao", `Z${marker}`]]) { await rowFor(page, table, available[0]).click(); await table.getByTestId(`${column}__search`).click(); await table.getByRole("textbox").fill(term); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText(available[31]); await table.getByRole("textbox").press("Escape"); await expect(list).toBeVisible(); }
    for (const [column, term, expected] of [["COL_Stock", "Saí", "Saída"], ["COL_Stock", "Entra", "Entrada"], ["COL_Obriga_macanico", "1", null], ["COL_Obriga_macanico", "0", null]]) { await table.getByTestId(`${column}__search`).click(); await table.getByRole("textbox").fill(term!); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); const selected = table.locator('tr[aria-selected="true"]'); if (expected) await expect(selected).toContainText(expected); else await expect(selected.getByRole("checkbox")).toHaveAttribute("aria-checked", term === "1" ? "true" : "false"); await table.getByRole("textbox").press("Enter"); await expect(page.getByTestId("WIN_Form_documentos")).toHaveCount(0); }
    await expect(table.locator("tbody tr")).toHaveCount(count); await expect(table).toHaveCSS("overflow-y", "scroll"); await expect(table).toHaveCSS("overflow-x", "auto"); await expect(table).toHaveCSS("touch-action", "none"); expect(await table.evaluate(element => (element as HTMLElement).offsetWidth - element.clientWidth)).toBeGreaterThanOrEqual(16); expect(await table.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0);
    await table.evaluate(element => { element.scrollTop = 0; }); await swipeTable(page, table); expect(await table.evaluate(element => element.scrollTop)).toBe(0); await table.evaluate(element => { (element as HTMLElement).style.touchAction = "auto"; }); await swipeTable(page, table); await expect.poll(() => table.evaluate(element => element.scrollTop)).toBeGreaterThan(0); await table.evaluate(element => { (element as HTMLElement).style.touchAction = "none"; element.scrollTop = 7; }); expect(await table.evaluate(element => element.scrollTop)).toBe(7);
    const header = table.getByTestId("COL_Descricao"), width = (await header.boundingBox())!.width; await header.getByRole("separator").press("ArrowRight"); expect((await header.boundingBox())!.width).toBe(width + 8); await header.getByRole("button").first().press("Control+Shift+ArrowLeft"); await table.getByTestId("COL_Codigo").click({ button: "right" }); await expect(table.getByRole("group", { name: "Colunas", exact: true }).getByRole("checkbox")).toHaveCount(4); await expect(table.getByText("Identifier of documentos", { exact: true })).toHaveCount(0); await table.getByRole("checkbox", { name: "Código", exact: true }).uncheck();
    await page.reload(); await page.getByTestId("document-types-open").click(); await expect(table.getByTestId("COL_Codigo")).toHaveCount(0); await table.getByRole("button", { name: "Colunas", exact: true }).click(); await table.getByRole("checkbox", { name: "Código", exact: true }).check(); expect((await header.boundingBox())!.width).toBe(width + 8); await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao"); await table.getByRole("button", { name: "Repor", exact: true }).click(); expect((await header.boundingBox())!.width).toBe(width);
  } finally { await cleanup(request, headers, owned); }
});

test("RULE-C5CA4D83-011 actual source geometry, eligible description assistance and mounted checkbox/radio drafts survive minimize", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, values(code, { Descricao: "Suggest document d'Água  " }));
  try {
    await open(page); const list = page.getByTestId("WIN_Table_documentos"), form = page.getByTestId("WIN_Form_documentos"); await list.getByTestId("Btn_New").click(); const frame = page.getByTestId("document-type-form-frame"), initial = (await frame.boundingBox())!; expect(initial.width).toBe(500); expect(initial.height).toBe(208);
    for (const [name, x, y, width, height] of [["EDT_Codigo", 14, 31, 94, 25], ["EDT_Descricao", 14, 62, 300, 25], ["CBOX_Obriga_macanico", 14, 168, 203, 26], ["RADIO_NoName1", 31, 118, 100, 44]] as const) { const box = (await form.locator(`[data-control-path="SC_Form.${name}"]`).boundingBox())!; expect({ x: box.x - initial.x, y: box.y - initial.y, width: box.width, height: box.height }).toEqual({ x, y, width, height }); }
    await form.getByTestId("EDT_Codigo").fill(code.slice(0, 1)); await expect(form.getByTestId("EDT_Codigo__suggestions")).toHaveCount(0); await expect(form.getByTestId("EDT_Codigo")).not.toHaveAttribute("aria-autocomplete"); const description = form.getByTestId("EDT_Descricao"); await description.fill("Suggest"); await description.press("ArrowDown"); await description.press("Enter"); await expect(description).toHaveValue("Suggest document d'Água  "); await expect(form).toBeVisible(); await description.fill("Suggest"); await description.press("Escape"); await expect(form).toBeVisible(); await expect(form.getByTestId("EDT_Descricao__suggestions")).toHaveCount(0); await description.fill("Free document draft  ");
    await page.getByTestId("document-type-form-frame-resize-e").press("ArrowRight"); expect((await frame.boundingBox())!.width).toBe(initial.width + 8); await form.getByRole("radio", { name: "Saída", exact: true }).click(); await form.getByTestId("CBOX_Obriga_macanico").check(); await description.focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click(); await page.getByTestId("document-type-form-restore").click(); await expect(description).toBeFocused(); await expect(description).toHaveValue("Free document draft  "); await expect(form.getByRole("radio", { name: "Saída", exact: true })).toHaveAttribute("aria-checked", "true"); await expect(form.getByTestId("CBOX_Obriga_macanico")).toBeChecked();
    await form.getByTestId("BTN_Cancelar").click(); await list.getByTestId("Btn_New").click(); expect((await frame.boundingBox())!.width).toBe(initial.width + 8); await expect(form.getByTestId("CBOX_Obriga_macanico")).not.toBeChecked(); await expect(form.getByRole("radio", { name: "Entrada", exact: true })).toHaveAttribute("aria-checked", "true"); await page.keyboard.press("Escape"); await expect(form).toHaveCount(0);
  } finally { await cleanup(request, headers, [original.id]); }
});
