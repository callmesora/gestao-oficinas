import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import type { MechanicListRow, MechanicRecord, MechanicValues } from "../packages/domain/src/mechanics";

type Headers = { Authorization: string };
async function session(request: APIRequestContext): Promise<Headers> {
  const result = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(result.ok()).toBe(true); return { Authorization: `Bearer ${(await result.json()).token}` };
}
async function api<T>(request: APIRequestContext, headers: Headers, operation: string, data: unknown): Promise<T> {
  const result = await request.post(`/api/mechanics/${operation}`, { headers, data }); expect(result.ok()).toBe(true); return result.json() as Promise<T>;
}
async function rows(request: APIRequestContext, headers: Headers): Promise<MechanicListRow[]> {
  const result = await api<{ kind: string; mechanics: MechanicListRow[] }>(request, headers, "list", {}); expect(result.kind).toBe("loaded"); return result.mechanics;
}
async function read(request: APIRequestContext, headers: Headers, id: string): Promise<MechanicRecord> {
  const result = await api<{ kind: string; mechanic: MechanicRecord }>(request, headers, "read", { id }); expect(result.kind).toBe("loaded"); return result.mechanic;
}
async function seed(request: APIRequestContext, headers: Headers, values: MechanicValues): Promise<MechanicListRow> {
  const result = await api<{ kind: string; mechanic: MechanicListRow }>(request, headers, "save", { mode: "create", values }); expect(result.kind).toBe("saved"); return result.mechanic;
}
async function codes(request: APIRequestContext, headers: Headers, count: number, large = false): Promise<number[]> {
  const used = new Set((await rows(request, headers)).map(row => row.Codigo));
  const available = Array.from({ length: large ? 156 : 99 }, (_, index) => (large ? 255 : 99) - index).filter(code => !used.has(code));
  expect(available.length).toBeGreaterThanOrEqual(count); return available.slice(0, count);
}
async function cleanup(request: APIRequestContext, headers: Headers, ids: readonly string[]) {
  for (const id of ids) await request.post("/api/mechanics/delete", { headers, data: { id } });
}
const rowFor = (page: Page, table: Locator, value: string) => table.getByRole("row").filter({ has: page.getByRole("cell", { name: value, exact: true }) });
async function open(page: Page) {
  await page.goto("/?workflow=mechanics"); await page.getByTestId("mechanics-open").click(); await expect(page.getByTestId("WIN_Table_mecanicos").getByTestId("Btn_New")).toBeEnabled();
}
async function info(page: Page, message: string) {
  await expect(page.getByTestId("LIB_INFO")).toHaveText(message); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
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
const publicKeys = ["Codigo", "Descricao", "id", "inativo"];

test("SRC-97711eb5f6 actual mechanic form validates in order, preserves exact synthetic password, toggles the source checkbox and persists CRUD", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), marker = `Mec ${Date.now()} d'Água  `, secret = "aB'Ç 9 ";
  const owned: string[] = []; let writes = 0;
  page.on("request", item => { if (item.url().endsWith("/api/mechanics/save")) writes++; });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_mecanicos"), table = list.getByTestId("TABLE_mecanicos"), form = page.getByTestId("WIN_Form_mecanicos");
    await list.getByTestId("Btn_New").click(); await expect(form.getByTestId("EDT_Codigo")).toHaveValue("0");
    await form.getByTestId("EDT_Codigo").focus();
    for (const name of ["EDT_Descricao", "EDT_Palavra_passe", "CBOX_Inativo"]) { await page.keyboard.press("Tab"); await expect(form.getByTestId(name)).toBeFocused(); }
    await form.getByTestId("BTN_Validar").click(); await info(page, "Falta indicar o código");
    await form.getByTestId("EDT_Codigo").fill(String(code)); await form.getByTestId("EDT_Codigo").press("End"); await form.getByTestId("EDT_Codigo").press("9"); await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(code));
    await form.getByTestId("BTN_Validar").click(); await info(page, "Falta preencher a descrição");
    await expect(form.getByTestId("EDT_Descricao")).toHaveAttribute("maxlength", "100"); await form.getByTestId("EDT_Descricao").fill(marker);
    await form.getByTestId("BTN_Validar").click(); await info(page, "Falta indicar a palavra-passe"); expect(writes).toBe(0);
    const password = form.getByTestId("EDT_Palavra_passe"), eye = form.getByTestId("EDT_Palavra_passe__reveal"), inactive = form.getByTestId("CBOX_Inativo");
    await expect(password).toHaveAttribute("type", "password"); await expect(password).toHaveAttribute("maxlength", "15"); await password.fill(secret);
    await password.press("Home"); await password.press("Shift+ArrowRight");
    const selection = await password.evaluate(node => [(node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd]);
    await eye.click(); await expect(password).toHaveAttribute("type", "text"); await expect(password).toHaveValue(secret); await expect(password).toBeFocused();
    expect(await password.evaluate(node => [(node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd])).toEqual(selection);
    await eye.click(); await expect(password).toHaveAttribute("type", "password");
    await eye.focus(); await eye.press("Enter"); await expect(password).toHaveAttribute("type", "text"); await eye.focus(); await eye.press("Space"); await expect(password).toHaveAttribute("type", "password");
    await expect(form).toBeVisible(); expect(writes).toBe(0); await expect(inactive).not.toBeChecked(); await inactive.check();
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect(writes).toBe(1);
    const created = (await rows(request, headers)).find(row => row.Codigo === code)!; owned.push(created.id); expect(Object.keys(created).sort()).toEqual(publicKeys);
    expect(await read(request, headers, created.id)).toMatchObject({ Codigo: code, Descricao: marker, palavra_passe: secret, inativo: true });
    const row = rowFor(page, table, String(code)); await expect(row.getByRole("checkbox", { name: "Inativo" })).toHaveAttribute("aria-readonly", "true");
    await row.getByRole("checkbox").click(); expect((await read(request, headers, created.id)).inativo).toBe(true);
    const response = page.waitForResponse(value => value.url().endsWith("/api/mechanics/read")); await row.dblclick(); const selectedRead = await response;
    expect(selectedRead.headers()["cache-control"]).toBe("no-store"); expect(selectedRead.request().headers().authorization).toMatch(/^Bearer /);
    await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", ""); await expect(password).toHaveAttribute("type", "password"); await expect(password).toHaveValue(secret);
    await inactive.focus(); await inactive.press("Space"); await expect(inactive).not.toBeChecked(); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect((await read(request, headers, created.id)).inativo).toBe(false);
    await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Codigo").fill(String(code)); await form.getByTestId("EDT_Descricao").fill("Duplicate"); await password.fill("Synthetic"); await form.getByTestId("BTN_Validar").click();
    await info(page, `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`); await expect(form).toBeVisible(); await form.getByTestId("BTN_Cancelar").click();
    await page.reload(); await page.getByTestId("mechanics-open").click(); await expect(row).toContainText(marker); expect((await read(request, headers, created.id)).palavra_passe).toBe(secret);
    await row.click(); await list.getByTestId("BTN_Delete").click(); await page.getByTestId("WINDEVDIALOGBOX").getByRole("button", { name: "Não", exact: true }).click(); expect((await rows(request, headers)).some(item => item.id === created.id)).toBe(true);
    await list.getByTestId("BTN_Delete").click(); await page.getByTestId("WINDEVDIALOGBOX").getByRole("button", { name: "Sim", exact: true }).click(); await expect(row).toHaveCount(0); expect((await rows(request, headers)).some(item => item.id === created.id)).toBe(false);
  } finally { const extra = (await rows(request, headers)).filter(row => row.Descricao === marker).map(row => row.id); await cleanup(request, headers, [...new Set([...owned, ...extra])]); }
});

test("RULE-C17FCA03-010 imported-sized byte and NULL checkbox survive unrelated saves; real text assistance accepts exact values and leaves free entry", async ({ page, request }) => {
  const headers = await session(request), [large] = await codes(request, headers, 1, true), [suggestCode, newCode] = await codes(request, headers, 2), marker = `AssistM ${Date.now()} `, owned: string[] = [];
  const original = await seed(request, headers, { Codigo: large, Descricao: "Oversized byte", palavra_passe: "MixedCase  ", inativo: null }); owned.push(original.id);
  const suggested = marker + "d'Água  "; owned.push((await seed(request, headers, { Codigo: suggestCode, Descricao: suggested, palavra_passe: "Synthetic", inativo: false })).id);
  try {
    await open(page); const list = page.getByTestId("WIN_Table_mecanicos"), table = list.getByTestId("TABLE_mecanicos"), form = page.getByTestId("WIN_Form_mecanicos"), inactive = form.getByTestId("CBOX_Inativo");
    await rowFor(page, table, String(large)).click(); await list.getByTestId("BTN_Modificar").click(); await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(large)); await expect(inactive).not.toBeChecked();
    await form.getByTestId("EDT_Descricao").fill("Unrelated description"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect(await read(request, headers, original.id)).toMatchObject({ Codigo: large, inativo: null, palavra_passe: "MixedCase  " });
    await rowFor(page, table, String(large)).dblclick(); await inactive.focus(); await inactive.press("Space"); await expect(inactive).toBeChecked(); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect((await read(request, headers, original.id)).inativo).toBe(true);
    await rowFor(page, table, String(large)).dblclick(); await inactive.uncheck(); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect((await read(request, headers, original.id)).inativo).toBe(false);
    await list.getByTestId("Btn_New").click(); const description = form.getByTestId("EDT_Descricao"), popup = form.getByTestId("EDT_Descricao__suggestions");
    await form.getByTestId("EDT_Codigo").fill(String(newCode)); await description.fill(marker.toLowerCase()); await expect(popup.getByRole("option", { name: suggested, exact: true })).toBeVisible();
    await description.press("ArrowDown"); await description.press("Enter"); await expect(description).toHaveValue(suggested); await expect(form).toBeVisible(); await expect(popup).toHaveCount(0);
    await description.fill(marker.toLowerCase()); await expect(popup).toBeVisible(); await description.press("Escape"); await expect(form).toBeVisible(); await expect(popup).toHaveCount(0);
    const free = marker + "free text  "; await description.fill(free); await form.getByTestId("EDT_Palavra_passe").fill("NewCase");
    await expect(form.getByTestId("EDT_Codigo")).not.toHaveAttribute("aria-autocomplete"); await expect(form.getByTestId("EDT_Palavra_passe")).not.toHaveAttribute("aria-autocomplete");
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); const created = (await rows(request, headers)).find(row => row.Codigo === newCode)!; owned.push(created.id);
    expect(await read(request, headers, created.id)).toMatchObject({ Descricao: free, palavra_passe: "NewCase", inativo: false });
  } finally { const extra = (await rows(request, headers)).filter(row => row.Descricao?.startsWith(marker)).map(row => row.id); await cleanup(request, headers, [...new Set([...owned, ...extra])]); }
});

test("SRC-934dda9b58 selected authenticated read blocks competing operations; edit cancellation resets source inactive sort and new cancellation retains manual sort", async ({ page, request }) => {
  const headers = await session(request), [firstCode, secondCode] = await codes(request, headers, 2), owned: string[] = [];
  const original = await seed(request, headers, { Codigo: firstCode, Descricao: "Alpha mechanic", palavra_passe: "Synthetic", inativo: true }); owned.push(original.id);
  const other = await seed(request, headers, { Codigo: secondCode, Descricao: "Zeta mechanic", palavra_passe: "Other", inativo: false }); owned.push(other.id);
  const listInputs: unknown[] = []; page.on("request", item => { if (item.url().endsWith("/api/mechanics/list")) listInputs.push(item.postDataJSON()); });
  let release = () => {};
  try {
    await open(page); const list = page.getByTestId("WIN_Table_mecanicos"), table = list.getByTestId("TABLE_mecanicos"), form = page.getByTestId("WIN_Form_mecanicos");
    await table.getByTestId("COL_Descricao").getByRole("button").first().click(); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled();
    await rowFor(page, table, String(firstCode)).click();
    expect((await api<{ kind: string }>(request, headers, "save", { mode: "update", id: original.id, values: { Codigo: firstCode, Descricao: "Fresh selected description", palavra_passe: "Synthetic", inativo: true } })).kind).toBe("saved");
    const before = listInputs.length, gate = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/api/mechanics/read", async route => { const result = await route.fetch(); await gate; await route.fulfill({ response: result }); });
    await list.getByTestId("BTN_Modificar").click(); await expect(list.getByTestId("Btn_New")).toBeDisabled(); await expect(list.getByTestId("BTN_Delete")).toBeDisabled();
    await rowFor(page, table, String(secondCode)).dblclick(); await expect(form).toHaveCount(0); release(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Fresh selected description");
    expect(listInputs.length).toBe(before); await page.unroute("**/api/mechanics/read");
    await form.getByTestId("EDT_Descricao").fill("Cancelled"); await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled();
    expect(listInputs.at(-1)).toEqual({ sort: "inativo", descending: false });
    const positions = await table.locator("tbody tr").evaluateAll((elements, values) => values.map(value => elements.findIndex(row => row.querySelector("td")?.textContent === value)), [String(secondCode), String(firstCode)]);
    for (const position of positions) expect(position).toBeGreaterThanOrEqual(0);
    expect(positions[0]).toBeLessThan(positions[1]);
    expect((await read(request, headers, original.id)).Descricao).toBe("Fresh selected description");
    await table.getByTestId("COL_Codigo").getByRole("button").first().click(); await expect(list.getByTestId("Btn_New")).toBeEnabled(); const last = listInputs.at(-1), count = listInputs.length;
    await list.getByTestId("Btn_New").click(); await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0); expect(listInputs.length).toBe(count); expect(listInputs.at(-1)).toEqual(last);
  } finally { release(); await page.unroute("**/api/mechanics/read"); await cleanup(request, headers, owned); }
});

test("MIG-7H delayed selected read cannot open a form in a later workspace instance after its owner closes", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, { Codigo: code, Descricao: "Owned delayed read", palavra_passe: "Synthetic", inativo: false });
  let release = () => {};
  try {
    await open(page); const list = page.getByTestId("WIN_Table_mecanicos"), table = list.getByTestId("TABLE_mecanicos"), form = page.getByTestId("WIN_Form_mecanicos");
    const gate = new Promise<void>(resolve => { release = resolve; }); let captured = false;
    await page.route("**/api/mechanics/read", async route => { const result = await route.fetch(); captured = true; await gate; await route.fulfill({ response: result }); });
    await rowFor(page, table, String(code)).click(); await list.getByTestId("BTN_Modificar").click(); await expect.poll(() => captured).toBe(true);
    await page.getByTestId("workspace-window-1-frame").getByTestId("BTN_SYST_FERMER").click(); await expect(list).toHaveCount(0);
    await page.getByTestId("mechanics-open").click(); await expect(list.getByTestId("Btn_New")).toBeEnabled();
    const response = page.waitForResponse(value => value.url().endsWith("/api/mechanics/read")); release(); await (await response).finished();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(form).toHaveCount(0); await expect(list.getByTestId("Btn_New")).toBeEnabled();
  } finally { release(); await page.unroute("**/api/mechanics/read"); await cleanup(request, headers, [original.id]); }
});

test("SRC-5551fef826 SRC-df9e51fef3 DEV mechanic selector component hides maintenance, preserves numeric return and exact origin, and respects valid row bounds", async ({ page, request }) => {
  const headers = await session(request), [firstCode, secondCode] = await codes(request, headers, 2), owned: string[] = [];
  for (const [index, Codigo] of [firstCode, secondCode].entries()) owned.push((await seed(request, headers, { Codigo, Descricao: `Selector ${index}`, palavra_passe: "Synthetic", inativo: index === 1 })).id);
  let reads = 0; page.on("request", item => { if (item.url().endsWith("/api/mechanics/read")) reads++; });
  try {
    // This DEV component launcher is not evidence for the not-yet-ported repair-order callers.
    await page.goto("/?workflow=mechanics&selecting=1&origin=ORIGINAL"); await page.getByTestId("mechanics-select-open").click();
    const picker = page.getByTestId("mechanic-picker"), list = picker.getByTestId("WIN_Table_mecanicos"), table = picker.getByTestId("TABLE_mecanicos");
    await expect(picker.getByTestId("BTN_selecionar")).toBeFocused(); for (const id of ["Btn_New", "BTN_Modificar", "BTN_Delete", "BTN_Imprimir"]) await expect(picker.getByTestId(id)).toBeHidden();
    expect((await table.locator("tbody tr").first().boundingBox())!.height).toBe(30);
    const frame = (await page.getByTestId("mechanic-picker-frame").boundingBox())!, close = (await picker.getByTestId("BTN_Fechar").boundingBox())!;
    expect(close.y - frame.y).toBe(506); expect(close.height).toBe(38);
    const first = table.locator("tbody tr").first(), last = table.locator("tbody tr").last();
    await first.click(); await picker.getByTestId("BTN_anterior").click(); await expect(first).toHaveAttribute("aria-selected", "true");
    await picker.getByTestId("BTN_seguinte").click(); await expect(table.locator("tbody tr").nth(1)).toHaveAttribute("aria-selected", "true");
    await last.click(); await picker.getByTestId("BTN_seguinte").click(); await expect(last).toHaveAttribute("aria-selected", "true");
    await rowFor(page, table, String(firstCode)).dblclick(); await expect(picker).toHaveCount(0); await expect(page.getByTestId("mechanics-returned")).toHaveText(String(firstCode)); await expect(page.getByTestId("mechanics-returned-kind")).toHaveText("number"); expect(reads).toBe(0);
    await page.getByTestId("mechanics-select-open").click(); await picker.getByTestId("BTN_Fechar").click(); await expect(page.getByTestId("mechanics-returned")).toHaveText("ORIGINAL"); await expect(page.getByTestId("mechanics-returned-kind")).toHaveText("string");
    await page.getByTestId("mechanics-select-open").click(); await page.keyboard.press("Escape"); await expect(picker).toHaveCount(0); await expect(page.getByTestId("mechanics-returned")).toHaveText("ORIGINAL");
    await expect(list).toHaveCount(0);
  } finally { await cleanup(request, headers, owned); }
});

test("RULE-C44F7892-019 actual mechanic numeric/text/Boolean header seeks, saved columns, source scrolling and modal geometry retain their own keys", async ({ page, request }) => {
  const headers = await session(request), available = await codes(request, headers, 32, true), owned: string[] = [], marker = String(Date.now());
  try {
    for (const [index, Codigo] of available.entries()) owned.push((await seed(request, headers, { Codigo, Descricao: `${index === 31 ? "Z" : "A"}${marker} ` + "longo ".repeat(10), palavra_passe: "Synthetic", inativo: index === 31 })).id);
    await open(page); const list = page.getByTestId("WIN_Table_mecanicos"), table = list.getByTestId("TABLE_mecanicos"), form = page.getByTestId("WIN_Form_mecanicos"), count = (await rows(request, headers)).length;
    await expect(list.getByTestId("BTN_Imprimir")).toBeDisabled(); await expect(table.getByTestId("COL_MecanicosID")).toHaveCount(0);
    expect((await table.getByTestId("COL_inativo").boundingBox())!.width).toBe(63);
    await expect(table.locator("tbody tr").first().locator("td").nth(2)).toHaveCSS("text-align", "center");
    for (const [column, term] of [["COL_Codigo", String(available[31])], ["COL_Descricao", `Z${marker}`]]) {
      await rowFor(page, table, String(available[0])).click(); await table.getByTestId(`${column}__search`).click(); await table.getByRole("textbox").fill(term);
      await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText(String(available[31]));
      await table.getByRole("textbox").press("Escape"); await expect(list).toBeVisible();
    }
    await rowFor(page, table, String(available[0])).click(); await table.getByTestId("COL_inativo__search").click(); await table.getByRole("textbox").fill("1"); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled();
    await expect(table.locator('tr[aria-selected="true"]').getByRole("checkbox")).toHaveAttribute("aria-checked", "true"); await table.getByRole("textbox").press("Enter"); await expect(form).toHaveCount(0);
    await expect(table.locator("tbody tr")).toHaveCount(count); await expect(table).toHaveCSS("overflow-y", "scroll"); await expect(table).toHaveCSS("overflow-x", "auto"); await expect(table).toHaveCSS("touch-action", "none");
    expect(await table.evaluate(element => (element as HTMLElement).offsetWidth - element.clientWidth)).toBeGreaterThanOrEqual(16);
    expect(await table.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0);
    await table.evaluate(element => { element.scrollTop = 0; });
    await swipeTable(page, table); expect(await table.evaluate(element => element.scrollTop)).toBe(0);
    // Positive control on the same real overflowing consumer: native panning works when source gating is removed.
    await table.evaluate(element => { (element as HTMLElement).style.touchAction = "auto"; });
    await swipeTable(page, table); await expect.poll(() => table.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await table.evaluate(element => { (element as HTMLElement).style.touchAction = "none"; element.scrollTop = 7; }); expect(await table.evaluate(element => element.scrollTop)).toBe(7);
    const header = table.getByTestId("COL_Descricao"), width = (await header.boundingBox())!.width;
    await header.getByRole("separator").press("ArrowRight"); expect((await header.boundingBox())!.width).toBe(width + 8); await header.getByRole("button").first().press("Control+Shift+ArrowLeft");
    await table.getByTestId("COL_Codigo").click({ button: "right" }); await expect(table.getByRole("group", { name: "Colunas", exact: true }).getByRole("checkbox")).toHaveCount(3);
    await expect(table.getByText("Identifier of mecanicos", { exact: true })).toHaveCount(0); await table.getByRole("checkbox", { name: "Código", exact: true }).uncheck();
    await page.reload(); await page.getByTestId("mechanics-open").click(); await expect(table.getByTestId("COL_Codigo")).toHaveCount(0); await table.getByRole("button", { name: "Colunas", exact: true }).click();
    await table.getByRole("checkbox", { name: "Código", exact: true }).check(); expect((await header.boundingBox())!.width).toBe(width + 8); await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao");
    await table.getByRole("button", { name: "Repor", exact: true }).click(); expect((await header.boundingBox())!.width).toBe(width); await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Codigo");
    for (let index = 0; index < 40; index++) await header.getByRole("separator").press("ArrowLeft"); const target = rowFor(page, table, String(available[31])).locator("td").nth(1); await target.hover(); await expect(target).toHaveAttribute("title", `Z${marker} ` + "longo ".repeat(10));
    await table.getByRole("button", { name: "Colunas", exact: true }).click(); await table.getByRole("button", { name: "Repor", exact: true }).click();
    await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Descricao").fill("Geometry draft"); const frame = page.getByTestId("mechanic-form-frame"), initialWidth = (await frame.boundingBox())!.width;
    await page.getByTestId("mechanic-form-frame-resize-e").press("ArrowRight"); expect((await frame.boundingBox())!.width).toBe(initialWidth + 8);
    await form.getByTestId("CBOX_Inativo").check(); await form.getByTestId("EDT_Descricao").focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click(); await page.getByTestId("mechanic-form-restore").click();
    await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Geometry draft"); await expect(form.getByTestId("CBOX_Inativo")).toBeChecked(); await expect(form.getByTestId("EDT_Descricao")).toBeFocused();
    await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(list).toBeVisible(); await list.getByTestId("Btn_New").click(); expect((await frame.boundingBox())!.width).toBe(initialWidth + 8); await expect(form.getByTestId("CBOX_Inativo")).not.toBeChecked(); await form.getByTestId("BTN_Cancelar").click();
  } finally { await cleanup(request, headers, owned); }
});
