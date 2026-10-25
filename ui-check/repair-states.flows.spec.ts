import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import type { RepairState, RepairStateValues } from "../packages/domain/src/repair-states";

type Headers = { Authorization: string };
async function session(request: APIRequestContext): Promise<Headers> {
  const result = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(result.ok()).toBe(true); return { Authorization: `Bearer ${(await result.json()).token}` };
}
async function api<T>(request: APIRequestContext, headers: Headers, operation: string, data: unknown): Promise<T> {
  const result = await request.post(`/api/repair-states/${operation}`, { headers, data }); expect(result.ok()).toBe(true); return result.json() as Promise<T>;
}
async function rows(request: APIRequestContext, headers: Headers): Promise<RepairState[]> {
  const result = await api<{ kind: string; repairStates: RepairState[] }>(request, headers, "list", {}); expect(result.kind).toBe("loaded"); return result.repairStates;
}
async function codes(request: APIRequestContext, headers: Headers, count: number): Promise<string[]> {
  const used = new Set((await rows(request, headers)).map(row => row.Codigo));
  const available = Array.from({ length: 1296 }, (_, index) => "Z" + index.toString(36).padStart(2, "0")).filter(code => !used.has(code));
  expect(available.length).toBeGreaterThanOrEqual(count); return available.slice(0, count);
}
const values = (Codigo: string, overrides: Partial<RepairStateValues> = {}): RepairStateValues => ({ Codigo, Descricao: "Synthetic repair state", tipo: 1, Cor: 0, lancar_defa: false, lancar_material: false, confirmacao: false, pedir_data_entrega: false, pedir_data_pag: false, ...overrides });
async function seed(request: APIRequestContext, headers: Headers, values: RepairStateValues): Promise<RepairState> {
  const result = await api<{ kind: string; repairState: RepairState }>(request, headers, "save", { mode: "create", values }); expect(result.kind).toBe("saved"); return result.repairState;
}
async function cleanup(request: APIRequestContext, headers: Headers, ids: readonly string[]) { for (const id of ids) await request.post("/api/repair-states/delete", { headers, data: { id } }); }
const rowFor = (page: Page, table: Locator, value: string) => table.getByRole("row").filter({ has: page.getByRole("cell", { name: value, exact: true }) });
async function open(page: Page) { await page.goto("/?workflow=repair-states"); await page.getByTestId("repair-states-open").click(); await expect(page.getByTestId("WIN_Table_estados_reparacao").getByTestId("Btn_New")).toBeEnabled(); }
async function info(page: Page, text: string) { await expect(page.getByTestId("LIB_INFO")).toHaveText(text); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click(); }

/** External chooser seam only: adapter validation and actual form/API/PostgreSQL remain in the path. */
async function colorSeam(page: Page, selected?: number) {
  await page.evaluate(selected => {
    const state = window as unknown as { isTauri: boolean; __repairColorCalls: (number | null)[]; __TAURI_INTERNALS__: { invoke: (command: string, args?: { request?: { color: number | null } }) => Promise<unknown> } };
    state.isTauri = true; state.__repairColorCalls = [];
    const original = state.__TAURI_INTERNALS__.invoke;
    state.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (command !== "select_repair_state_color") return original(command, args);
      const color = args!.request!.color; state.__repairColorCalls.push(color);
      return selected === undefined ? { kind: "cancelled", color } : { kind: "selected", color: selected };
    };
  }, selected);
}
async function colorCalls(page: Page) { return page.evaluate(() => (window as unknown as { __repairColorCalls: (number | null)[] }).__repairColorCalls); }
async function swipeTable(page: Page, table: Locator) {
  const client = await page.context().newCDPSession(page), box = (await table.boundingBox())!;
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const point = { x: box.x + box.width / 2, y: box.y + box.height - 35, id: 0 };
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  for (let index = 1; index <= 8; index++) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...point, y: point.y - index * 20 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))); await client.detach();
}
const checkboxCaptions = ["Selecionar por defeito", "Permite lançar material", "Pedir confirmação na mudança do estado", "Pedir data de entrega", "Pedir data de pagamento"];
const optionCaptions = ["Recepção", "Aguardar início reparação", "Em reparação", "Teste", "Lavagem", "Reparação suspensa", "Reparação finalizada", "Orçamento"];

test("SRC-01a3c75d73 SRC-a1521d6320 actual metadata-rendered repair form uses exact captions, local radio keys and nullable flags through persistent CRUD", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), owned: string[] = []; let writes = 0;
  page.on("request", item => { if (item.url().endsWith("/api/repair-states/save")) writes++; });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_estados_reparacao"), table = list.getByTestId("TABLE_estados_reparacao"), form = page.getByTestId("WIN_Form_estados_reparacao");
    await expect(page.getByTestId("workspace-window-1-frame").getByTestId("RADTitle")).toHaveText("Tabela de Estados de Reparação");
    await list.getByTestId("Btn_New").click(); await expect(form.getByTestId("RADTitle")).toHaveText("Estados Reparação"); await expect(form.getByText("Descrição", { exact: true })).toBeVisible();
    const group = form.getByTestId("RADIO_NoName1"); await expect(group.getByRole("radio")).toHaveText(optionCaptions); await expect(group.getByRole("radio", { name: "Recepção", exact: true })).toHaveAttribute("aria-checked", "true");
    // Checked radio asset is144×12 with12px cells; checkbox13px geometry cuts into its neighbour.
    const uncheckedMark = group.getByRole("radio", { name: "Teste", exact: true }).locator(".wd-radio-mark");
    await expect(uncheckedMark).toHaveCSS("width", "12px"); await expect(uncheckedMark).toHaveCSS("height", "12px");
    await expect(uncheckedMark).toHaveCSS("background-position-x", "-12px");
    for (const caption of checkboxCaptions) await expect(form.getByRole("checkbox", { name: caption, exact: true })).not.toBeChecked();
    await form.getByTestId("EDT_Codigo").focus(); await page.keyboard.press("Tab"); await expect(form.getByTestId("EDT_Descricao")).toBeFocused(); await page.keyboard.press("Tab"); await expect(group.getByRole("radio", { name: "Recepção", exact: true })).toBeFocused();
    await page.keyboard.press("ArrowDown"); await expect(group.getByRole("radio", { name: optionCaptions[1], exact: true })).toHaveAttribute("aria-checked", "true"); await expect(group.getByRole("radio", { name: optionCaptions[1], exact: true })).toBeFocused();
    await page.keyboard.press("Enter"); await page.keyboard.press("Space"); expect(writes).toBe(0); await expect(form).toBeVisible();
    await page.keyboard.press("Tab"); await expect(form.getByTestId("EDT_Cor")).toBeFocused(); await page.keyboard.press("Tab"); await expect(form.getByTestId("BTN_VISION")).toBeFocused();
    for (let index = 1; index <= 5; index++) { await page.keyboard.press("Tab"); await expect(form.getByTestId(`CBOX_NoName${index}`)).toBeFocused(); }
    await form.getByTestId("BTN_Validar").click(); await info(page, "Falta indicar o código"); expect(writes).toBe(0);
    await form.getByTestId("EDT_Codigo").fill(code); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("maxlength", "3"); await expect(form.getByTestId("EDT_Descricao")).toHaveAttribute("maxlength", "50");
    await form.getByTestId("CBOX_NoName2").check(); await form.getByTestId("CBOX_NoName4").focus(); await page.keyboard.press("Space");
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    const created = (await rows(request, headers)).find(row => row.Codigo === code)!; owned.push(created.id);
    expect(created).toMatchObject({ Codigo: code, Descricao: "", tipo: 2, Cor: 0, lancar_defa: false, lancar_material: true, confirmacao: false, pedir_data_entrega: true, pedir_data_pag: false });
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, table, code).dblclick(); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
    await expect(group.getByRole("radio", { name: optionCaptions[1], exact: true })).toHaveAttribute("aria-checked", "true");
    await form.getByTestId("EDT_Descricao").fill("d'Água  "); await group.getByRole("radio", { name: "Orçamento", exact: true }).click(); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    await page.reload(); await page.getByTestId("repair-states-open").click(); await expect(rowFor(page, table, code)).toContainText("d'Água  "); await expect(rowFor(page, table, code)).toContainText("Orçamento");
    const saved = (await rows(request, headers)).find(row => row.id === created.id)!; expect(saved).toMatchObject({ estados_reparacaoID: created.estados_reparacaoID, Descricao: "d'Água  ", tipo: 8 });
    await rowFor(page, table, code).click(); await list.getByTestId("BTN_Delete").click(); const confirm = page.getByTestId("WINDEVDIALOGBOX"); await expect(confirm.getByTestId("RADTitle")).toHaveText("Tabela de Estados de Reparação"); await expect(confirm.getByTestId("LIB_INFO")).toHaveText("Deseja apagar o registo?"); await confirm.getByRole("button", { name: "Não", exact: true }).click(); await expect(rowFor(page, table, code)).toBeVisible();
    await list.getByTestId("BTN_Delete").click(); await confirm.getByRole("button", { name: "Sim", exact: true }).click(); await expect(rowFor(page, table, code)).toHaveCount(0); expect((await rows(request, headers)).some(row => row.id === created.id)).toBe(false);
  } finally { await cleanup(request, headers, owned); }
});

test("SRC-899177adfa actual chooser caller retains separate white/manual/selected/cancelled preview and WINDEV RGB through real save", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), owned: string[] = [];
  try {
    await open(page); await colorSeam(page); const list = page.getByTestId("WIN_Table_estados_reparacao"), form = page.getByTestId("WIN_Form_estados_reparacao"), preview = form.getByTestId("SHA_cor"), cor = form.getByTestId("EDT_Cor");
    await list.getByTestId("Btn_New").click(); await expect(preview).toHaveCSS("background-color", "rgb(255, 255, 255)"); await expect(cor).toHaveValue("0");
    await form.getByTestId("BTN_VISION").click(); await expect(preview).toHaveCSS("background-color", "rgb(0, 0, 0)"); expect(await colorCalls(page)).toEqual([0]);
    await cor.fill("255"); await expect(preview).toHaveCSS("background-color", "rgb(0, 0, 0)"); await form.getByTestId("BTN_VISION").click(); await expect(preview).toHaveCSS("background-color", "rgb(255, 0, 0)"); expect(await colorCalls(page)).toEqual([0, 255]);
    await colorSeam(page, 0x563412); await form.getByTestId("BTN_VISION").click(); await expect(cor).toHaveValue(String(0x563412)); await expect(preview).toHaveCSS("background-color", "rgb(18, 52, 86)"); expect(await colorCalls(page)).toEqual([255]);
    await cor.fill("999999999"); await cor.press("End"); await cor.press("9"); await expect(cor).toHaveValue("999999999"); await cor.fill("12"); await cor.press("ControlOrMeta+A"); await cor.press("a"); await expect(cor).toHaveValue("12"); await expect(preview).toHaveCSS("background-color", "rgb(18, 52, 86)");
    await form.getByTestId("EDT_Codigo").fill(code); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); const created = (await rows(request, headers)).find(row => row.Codigo === code)!; owned.push(created.id); expect(created.Cor).toBe(12);
    const table = list.getByTestId("TABLE_estados_reparacao"); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, table, code).dblclick(); await expect(preview).toHaveCSS("background-color", "rgb(12, 0, 0)"); await form.getByTestId("BTN_Cancelar").click();
  } finally { await cleanup(request, headers, owned); }
});

test("RULE-CE554DEA-011 source-bound NULL, zero and out-of-option radio plus uint32 colors survive cancellation and unrelated edits", async ({ page, request }) => {
  const headers = await session(request), available = await codes(request, headers, 3), owned: string[] = [];
  const cases = [{ tipo: null, Cor: null }, { tipo: 0, Cor: 4294967295 }, { tipo: 255, Cor: 4278190335 }];
  try {
    for (const [index, edge] of cases.entries()) owned.push((await seed(request, headers, values(available[index], { ...edge, Descricao: null, lancar_defa: null, lancar_material: null, confirmacao: null, pedir_data_entrega: null, pedir_data_pag: null }))).id);
    await open(page); await colorSeam(page); const list = page.getByTestId("WIN_Table_estados_reparacao"), form = page.getByTestId("WIN_Form_estados_reparacao"), table = list.getByTestId("TABLE_estados_reparacao");
    for (const [index, edge] of cases.entries()) {
      await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, table, available[index]).dblclick();
      await expect(form.getByTestId("RADIO_NoName1").getByRole("radio", { checked: true })).toHaveCount(0); await expect(form.getByTestId("EDT_Cor")).toHaveValue(String(edge.Cor ?? "")); await expect(form.getByTestId("SHA_cor")).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await form.getByTestId("EDT_Cor").focus(); await form.getByTestId("EDT_Codigo").focus(); await expect(form.getByTestId("EDT_Cor")).toHaveValue(String(edge.Cor ?? ""));
      await form.getByTestId("BTN_VISION").click(); await expect(form.getByTestId("BTN_VISION")).toBeEnabled(); await expect(form.getByTestId("EDT_Cor")).toHaveValue(String(edge.Cor ?? ""));
      await form.getByTestId("EDT_Descricao").fill(`Untouched edge ${index}`); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
      const saved = (await rows(request, headers)).find(row => row.id === owned[index])!;
      expect(saved).toMatchObject({ ...edge, lancar_defa: null, lancar_material: null, confirmacao: null, pedir_data_entrega: null, pedir_data_pag: null, Descricao: `Untouched edge ${index}` });
    }
    expect(await colorCalls(page)).toEqual(cases.map(edge => edge.Cor));
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, table, available[0]).dblclick(); const first = form.getByRole("radio", { name: "Recepção", exact: true }); await first.focus(); await first.press("Space"); await form.getByTestId("CBOX_NoName1").check(); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect((await rows(request, headers)).find(row => row.id === owned[0])).toMatchObject({ tipo: 1, Cor: null, lancar_defa: true, lancar_material: null });
  } finally { await cleanup(request, headers, owned); }
});

test("SRC-c662b89f30 actual list refreshes before edit and after cancellation, while new cancellation adds no refresh", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, values(code)); let reads = 0;
  page.on("request", item => { if (item.url().endsWith("/api/repair-states/list")) reads++; });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_estados_reparacao"), form = page.getByTestId("WIN_Form_estados_reparacao"), table = list.getByTestId("TABLE_estados_reparacao"); const initial = reads;
    await list.getByTestId("Btn_New").click(); await form.getByTestId("BTN_Cancelar").click(); await expect(list.getByTestId("Btn_New")).toBeEnabled(); expect(reads).toBe(initial);
    expect((await api<{ kind: string }>(request, headers, "save", { mode: "update", id: original.id, values: values(code, { Descricao: "Changed before actual edit", tipo: 5 }) })).kind).toBe("saved");
    await rowFor(page, table, code).click(); await list.getByTestId("BTN_Modificar").click(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Changed before actual edit"); expect(reads).toBe(initial + 1); await expect(form.getByRole("radio", { name: "Lavagem", exact: true })).toHaveAttribute("aria-checked", "true");
    await form.getByTestId("EDT_Descricao").fill("Cancelled draft"); await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); expect(reads).toBe(initial + 2); await expect(rowFor(page, table, code)).toContainText("Changed before actual edit");
    expect((await rows(request, headers)).find(row => row.id === original.id)?.Descricao).toBe("Changed before actual edit");
  } finally { await cleanup(request, headers, [original.id]); }
});

test("SRC-c662b89f30 detached real pre-edit response cannot open a form in a closed/reopened list", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, values(code)); let release = () => {};
  try {
    await open(page); const list = page.getByTestId("WIN_Table_estados_reparacao"), table = list.getByTestId("TABLE_estados_reparacao"), form = page.getByTestId("WIN_Form_estados_reparacao"); const gate = new Promise<void>(resolve => { release = resolve; }); let captured = false;
    await page.route("**/api/repair-states/list", async route => { const result = await route.fetch(); captured = true; await gate; await route.fulfill({ response: result }); });
    await rowFor(page, table, code).click(); await list.getByTestId("BTN_Modificar").click(); await expect.poll(() => captured).toBe(true);
    await page.getByTestId("workspace-window-1-frame").getByTestId("BTN_SYST_FERMER").click(); await expect(list).toHaveCount(0);
    const response = page.waitForResponse(value => value.url().endsWith("/api/repair-states/list")); release(); await (await response).finished(); await page.unroute("**/api/repair-states/list");
    await page.getByTestId("repair-states-open").click(); await expect(list.getByTestId("Btn_New")).toBeEnabled(); await expect(form).toHaveCount(0);
  } finally { release(); await page.unroute("**/api/repair-states/list"); await cleanup(request, headers, [original.id]); }
});

test("SRC-d7c408a29d SRC-dee1d17856 ordinary selector retains real maintenance, no type filter, Codigo return and exact cancellation origin", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, values(code, { tipo: 8 }));
  try {
    await page.goto("/?workflow=repair-states&selecting=1&origin=ORIGINAL"); await page.getByTestId("repair-states-select-open").click(); const picker = page.getByTestId("repair-state-picker"), list = picker.getByTestId("WIN_Table_estados_reparacao"), table = picker.getByTestId("TABLE_estados_reparacao"), form = page.getByTestId("WIN_Form_estados_reparacao");
    await expect(list.getByTestId("Btn_New")).toBeEnabled(); for (const id of ["Btn_New", "BTN_Modificar", "BTN_Delete", "BTN_Imprimir", "BTN_selecionar"]) await expect(list.getByTestId(id)).toBeVisible(); await expect(list.getByTestId("BTN_Imprimir")).toBeEnabled();
    await expect(list.getByTestId("BTN_anterior")).toHaveCount(0); await expect(list.getByTestId("BTN_seguinte")).toHaveCount(0); expect((await table.locator("tbody tr").first().boundingBox())!.height).toBe(19); await expect(table.locator("tbody tr")).toHaveCount((await rows(request, headers)).length);
    await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Codigo").fill(code); await form.getByTestId("BTN_Validar").click(); await info(page, `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`); await form.getByTestId("BTN_Cancelar").click(); await expect(picker).toBeVisible();
    await rowFor(page, table, code).dblclick(); await expect(picker).toHaveCount(0); await expect(page.getByTestId("repair-states-returned")).toHaveText(code);
    await page.getByTestId("repair-states-select-open").click(); await picker.getByTestId("BTN_Fechar").click(); await expect(page.getByTestId("repair-states-returned")).toHaveText("ORIGINAL");
    await page.getByTestId("repair-states-select-open").click(); await page.keyboard.press("Escape"); await expect(picker).toHaveCount(0); await expect(page.getByTestId("repair-states-returned")).toHaveText("ORIGINAL");
  } finally { await cleanup(request, headers, [original.id]); }
});

test("RULE-CEBED898-016 actual last Tipo magnifier searches displayed labels, preserves rows, column config and source touch/scroll behavior", async ({ page, request }) => {
  const headers = await session(request), available = await codes(request, headers, 32), owned: string[] = [], marker = String(Date.now());
  try {
    for (const [index, code] of available.entries()) owned.push((await seed(request, headers, values(code, { tipo: index === 31 ? 8 : 1, Descricao: `${index === 31 ? "Z" : "A"}${marker} ` + "longo ".repeat(5) }))).id);
    await open(page); const list = page.getByTestId("WIN_Table_estados_reparacao"), table = list.getByTestId("TABLE_estados_reparacao"), count = (await rows(request, headers)).length;
    for (const [column, term] of [["COL_Codigo", available[31]], ["COL_Descricao", `Z${marker}`], ["COL_Tipo", "Orçam"]]) {
      await rowFor(page, table, available[0]).click(); await table.getByTestId(`${column}__search`).click(); await table.getByRole("textbox").fill(term); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText(available[31]); await table.getByRole("textbox").press("Enter"); await expect(page.getByTestId("WIN_Form_estados_reparacao")).toHaveCount(0);
    }
    await expect(table.locator("tbody tr")).toHaveCount(count); await expect(rowFor(page, table, available[0])).toContainText("Recepçao"); await expect(table).toHaveCSS("overflow-y", "scroll"); await expect(table).toHaveCSS("overflow-x", "auto"); await expect(table).toHaveCSS("touch-action", "none"); expect(await table.evaluate(element => (element as HTMLElement).offsetWidth - element.clientWidth)).toBeGreaterThanOrEqual(16);
    expect(await table.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0); await table.evaluate(element => { element.scrollTop = 0; }); await swipeTable(page, table); expect(await table.evaluate(element => element.scrollTop)).toBe(0);
    await table.evaluate(element => { (element as HTMLElement).style.touchAction = "auto"; }); await swipeTable(page, table); await expect.poll(() => table.evaluate(element => element.scrollTop)).toBeGreaterThan(0); await table.evaluate(element => { (element as HTMLElement).style.touchAction = "none"; element.scrollTop = 7; }); expect(await table.evaluate(element => element.scrollTop)).toBe(7);
    const header = table.getByTestId("COL_Descricao"), width = (await header.boundingBox())!.width; await header.getByRole("separator").press("ArrowRight"); expect((await header.boundingBox())!.width).toBe(width + 8); await header.getByRole("button").first().press("Control+Shift+ArrowLeft");
    await table.getByTestId("COL_Codigo").click({ button: "right" }); await table.getByRole("checkbox", { name: "Código", exact: true }).uncheck(); await page.reload(); await page.getByTestId("repair-states-open").click(); await expect(table.getByTestId("COL_Codigo")).toHaveCount(0); await table.getByRole("button", { name: "Colunas", exact: true }).click(); await table.getByRole("checkbox", { name: "Código", exact: true }).check(); expect((await header.boundingBox())!.width).toBe(width + 8); await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao"); await table.getByRole("button", { name: "Repor", exact: true }).click(); expect((await header.boundingBox())!.width).toBe(width);
  } finally { await cleanup(request, headers, owned); }
});

test("RULE-CE554DEA-011 actual form retains source geometry, real description assistance and mounted radio/checkbox drafts across minimize", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, values(code, { Descricao: "Suggest repair d'Água" }));
  try {
    await open(page); const list = page.getByTestId("WIN_Table_estados_reparacao"), form = page.getByTestId("WIN_Form_estados_reparacao"); await list.getByTestId("Btn_New").click();
    await form.getByTestId("EDT_Codigo").fill(code.slice(0, 1)); await expect(form.getByTestId("EDT_Codigo__suggestions")).toHaveCount(0); await form.getByTestId("EDT_Descricao").fill("Suggest"); await form.getByRole("option", { name: "Suggest repair d'Água", exact: true }).click(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Suggest repair d'Água");
    const frame = page.getByTestId("repair-state-form-frame"), width = (await frame.boundingBox())!.width; await page.getByTestId("repair-state-form-frame-resize-e").press("ArrowRight"); expect((await frame.boundingBox())!.width).toBe(width + 8); await form.getByRole("radio", { name: "Teste", exact: true }).click(); await form.getByTestId("CBOX_NoName3").check(); await form.getByTestId("EDT_Descricao").focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click(); await page.getByTestId("repair-state-form-restore").click(); await expect(form.getByTestId("EDT_Descricao")).toBeFocused(); await expect(form.getByRole("radio", { name: "Teste", exact: true })).toHaveAttribute("aria-checked", "true"); await expect(form.getByTestId("CBOX_NoName3")).toBeChecked(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Suggest repair d'Água");
    await form.getByTestId("BTN_Cancelar").click(); await expect(list).toBeVisible(); await list.getByTestId("Btn_New").click(); expect((await frame.boundingBox())!.width).toBe(width + 8); await expect(form.getByTestId("CBOX_NoName3")).not.toBeChecked(); await expect(form.getByRole("radio", { name: "Recepção", exact: true })).toHaveAttribute("aria-checked", "true"); await page.keyboard.press("Escape"); await expect(form).toHaveCount(0);
  } finally { await cleanup(request, headers, [original.id]); }
});
