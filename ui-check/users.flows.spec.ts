import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import type { UserListRow, UserRecord, UserValues } from "../packages/domain/src/users";

type Headers = { Authorization: string };
async function session(request: APIRequestContext): Promise<Headers> {
  const result = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(result.ok()).toBe(true); return { Authorization: `Bearer ${(await result.json()).token}` };
}
async function api<T>(request: APIRequestContext, headers: Headers, operation: string, data: unknown): Promise<T> {
  const result = await request.post(`/api/users/${operation}`, { headers, data }); expect(result.ok()).toBe(true); return result.json() as Promise<T>;
}
async function rows(request: APIRequestContext, headers: Headers): Promise<UserListRow[]> {
  const result = await api<{ kind: string; users: UserListRow[] }>(request, headers, "list", {}); expect(result.kind).toBe("loaded"); return result.users;
}
async function read(request: APIRequestContext, headers: Headers, id: string): Promise<UserRecord> {
  const result = await api<{ kind: string; user: UserRecord }>(request, headers, "read", { id }); expect(result.kind).toBe("loaded"); return result.user;
}
async function seed(request: APIRequestContext, headers: Headers, values: UserValues): Promise<UserListRow> {
  const result = await api<{ kind: string; user: UserListRow }>(request, headers, "save", { mode: "create", values }); expect(result.kind).toBe("saved"); return result.user;
}
async function codes(request: APIRequestContext, headers: Headers, count: number, large = false): Promise<number[]> {
  const used = new Set((await rows(request, headers)).map(row => row.Codigo));
  const available = Array.from({ length: large ? 156 : 99 }, (_, index) => (large ? 255 : 99) - index).filter(code => !used.has(code));
  expect(available.length).toBeGreaterThanOrEqual(count); return available.slice(0, count);
}
async function cleanup(request: APIRequestContext, headers: Headers, ids: readonly string[]) {
  for (const id of ids) await request.post("/api/users/delete", { headers, data: { id } });
}
const rowFor = (page: Page, table: Locator, value: string) => table.getByRole("row").filter({ has: page.getByRole("cell", { name: value, exact: true }) });
async function open(page: Page) {
  await page.goto("/?workflow=users"); await page.getByTestId("users-open").click(); await expect(page.getByTestId("WIN_Table_utilizadores").getByTestId("Btn_New")).toBeEnabled();
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
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))); await client.detach();
}
const publicKeys = ["Codigo", "Descricao", "id"];

test("SRC-7c866e13ff actual user RAD form validates in order, uppercases after guards and persists exact synthetic CRUD", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), marker = `User ${Date.now()} d'Água  `, secret = "aB'Ç 9 ", upper = "AB'Ç 9 ";
  const owned: string[] = []; let writes = 0;
  page.on("request", item => { if (item.url().endsWith("/api/users/save")) writes++; });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_utilizadores"), table = list.getByTestId("TABLE_utilizadores"), form = page.getByTestId("WIN_Form_utilizadores");
    await list.getByTestId("Btn_New").click(); const password = form.getByTestId("EDT_Palavra_passe"); await expect(form.getByTestId("EDT_Codigo")).toHaveValue("0");
    await form.getByTestId("EDT_Codigo").focus();
    for (const name of ["EDT_Descricao", "EDT_Palavra_passe", "BTN_Validar", "BTN_Cancelar"]) { await page.keyboard.press("Tab"); await expect(form.getByTestId(name)).toBeFocused(); }
    await form.getByTestId("BTN_Validar").click(); await info(page, "Falta indicar o código");
    await form.getByTestId("EDT_Codigo").fill(String(code)); await form.getByTestId("EDT_Codigo").press("End"); await form.getByTestId("EDT_Codigo").press("9"); await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(code));
    await password.fill(secret); await form.getByTestId("BTN_Validar").click(); await info(page, "Falta indicar o nome"); await expect(password).toHaveValue(secret);
    await expect(form.getByTestId("EDT_Descricao")).toHaveAttribute("maxlength", "100"); await form.getByTestId("EDT_Descricao").fill(marker); await password.fill("");
    await form.getByTestId("BTN_Validar").click(); await info(page, "Falta indicar a palavra-passe"); expect(writes).toBe(0);
    await password.fill(secret); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect(writes).toBe(1);
    const created = (await rows(request, headers)).find(row => row.Codigo === code)!; owned.push(created.id); expect(Object.keys(created).sort()).toEqual(publicKeys);
    expect(await read(request, headers, created.id)).toMatchObject({ Codigo: code, Descricao: marker, palavra_passe: upper });
    const row = rowFor(page, table, String(code)), response = page.waitForResponse(value => value.url().endsWith("/api/users/read")); await row.dblclick(); const selectedRead = await response;
    expect(selectedRead.headers()["cache-control"]).toBe("no-store"); expect(selectedRead.request().headers().authorization).toMatch(/^Bearer /);
    await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", ""); await expect(password).toHaveValue(upper); await form.getByTestId("EDT_Descricao").fill(marker + "revisto");
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); expect(await read(request, headers, created.id)).toMatchObject({ Descricao: marker + "revisto", palavra_passe: upper });
    await page.reload(); await page.getByTestId("users-open").click(); await expect(row).toContainText(marker + "revisto");
    await row.click(); await list.getByTestId("BTN_Delete").click(); const confirmation = page.getByTestId("WINDEVDIALOGBOX"); await expect(confirmation.getByRole("button", { name: "Não", exact: true })).toBeFocused(); await page.keyboard.press("Escape");
    expect((await rows(request, headers)).some(item => item.id === created.id)).toBe(true); await list.getByTestId("BTN_Delete").click(); await confirmation.getByRole("button", { name: "Não", exact: true }).click();
    expect((await rows(request, headers)).some(item => item.id === created.id)).toBe(true); await list.getByTestId("BTN_Delete").click(); await confirmation.getByRole("button", { name: "Sim", exact: true }).click(); await expect(row).toHaveCount(0);
    expect((await rows(request, headers)).some(item => item.id === created.id)).toBe(false);
  } finally { const extra = (await rows(request, headers)).filter(row => row.Descricao?.startsWith(marker)).map(row => row.id); await cleanup(request, headers, [...new Set([...owned, ...extra])]); }
});

test("SRC-7c866e13ff converted password draft is visible before a delayed duplicate refusal; expanded uppercase is invalid without truncation", async ({ page, request }) => {
  const headers = await session(request), [existingCode, newCode] = await codes(request, headers, 2), original = await seed(request, headers, { Codigo: existingCode, Descricao: "Synthetic existing", palavra_passe: "Stored" });
  let release = () => {}; const owned = [original.id];
  try {
    await open(page); const list = page.getByTestId("WIN_Table_utilizadores"), form = page.getByTestId("WIN_Form_utilizadores"), password = form.getByTestId("EDT_Palavra_passe");
    await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Codigo").fill(String(existingCode)); await form.getByTestId("EDT_Descricao").fill("Duplicate draft"); await password.fill("aB'ç  ");
    const gate = new Promise<void>(resolve => { release = resolve; }); let captured = false;
    await page.route("**/api/users/save", async route => { const response = await route.fetch(); captured = true; await gate; await route.fulfill({ response }); });
    await form.getByTestId("BTN_Validar").click(); await expect.poll(() => captured).toBe(true); await expect(password).toHaveValue("AB'Ç  "); await expect(form.getByTestId("BTN_Cancelar")).toBeDisabled();
    release(); await info(page, `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${existingCode}`); await expect(password).toHaveValue("AB'Ç  ");
    expect((await read(request, headers, original.id)).palavra_passe).toBe("STORED"); await page.unroute("**/api/users/save");
    await form.getByTestId("EDT_Codigo").fill(String(newCode)); await password.fill("ß".repeat(15)); const response = page.waitForResponse(value => value.url().endsWith("/api/users/save")); await form.getByTestId("BTN_Validar").click();
    expect((await (await response).json()).kind).toBe("invalid"); await expect(password).toHaveValue("SS".repeat(15)); await expect(form.getByTestId("user-form-diagnostic")).toHaveText("invalid");
    expect((await rows(request, headers)).some(row => row.Codigo === newCode)).toBe(false); await form.getByTestId("BTN_Cancelar").click();
  } finally { release(); await page.unroute("**/api/users/save"); await cleanup(request, headers, owned); }
});

test("RULE-CE3323C9-011 existing eye preserves selection, consumes pointer Enter Space, stays outside Tab and resets on reopen", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, { Codigo: code, Descricao: "Synthetic eye", palavra_passe: "ABC'Ç 9 " }); let writes = 0;
  page.on("request", item => { if (item.url().endsWith("/api/users/save")) writes++; });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_utilizadores"), row = rowFor(page, list.getByTestId("TABLE_utilizadores"), String(code)), form = page.getByTestId("WIN_Form_utilizadores"); await row.dblclick();
    const password = form.getByTestId("EDT_Palavra_passe"), eye = form.getByTestId("EDT_Palavra_passe__reveal"); await expect(password).toHaveAttribute("maxlength", "15"); await expect(password).toHaveAttribute("type", "password");
    await password.focus(); await password.press("Home"); await password.press("Shift+ArrowRight"); const selected = await password.evaluate(node => [(node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd]);
    await eye.click(); await expect(password).toHaveAttribute("type", "text"); await expect(password).toHaveValue("ABC'Ç 9 "); await expect(password).toBeFocused();
    expect(await password.evaluate(node => [(node as HTMLInputElement).selectionStart, (node as HTMLInputElement).selectionEnd])).toEqual(selected);
    await eye.click(); await expect(password).toHaveAttribute("type", "password"); await eye.focus(); await eye.press("Enter"); await expect(password).toHaveAttribute("type", "text"); await eye.focus(); await eye.press("Space"); await expect(password).toHaveAttribute("type", "password");
    await expect(form).toBeVisible(); expect(writes).toBe(0); await password.focus(); await password.press("Tab"); await expect(form.getByTestId("BTN_Validar")).toBeFocused();
    await eye.click(); await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0);
    await expect(list.getByTestId("Btn_New")).toBeEnabled();
    await row.dblclick(); await expect(password).toHaveAttribute("type", "password"); await form.getByTestId("BTN_Cancelar").click();
  } finally { await cleanup(request, headers, [original.id]); }
});

test("RULE-CE3323C9-011 byte255 survives mask99 and real Nome assistance accepts exact loaded text without changing password eligibility", async ({ page, request }) => {
  const headers = await session(request), [large] = await codes(request, headers, 1, true), [suggestCode, newCode] = await codes(request, headers, 2), marker = `AssistU ${Date.now()} `, owned: string[] = [];
  const original = await seed(request, headers, { Codigo: large, Descricao: "Oversized byte", palavra_passe: "MixedCase  " }); owned.push(original.id);
  const suggested = marker + "d'Água  "; owned.push((await seed(request, headers, { Codigo: suggestCode, Descricao: suggested, palavra_passe: "Synthetic" })).id);
  try {
    await open(page); const list = page.getByTestId("WIN_Table_utilizadores"), table = list.getByTestId("TABLE_utilizadores"), form = page.getByTestId("WIN_Form_utilizadores");
    await rowFor(page, table, String(large)).dblclick(); await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(large)); await form.getByTestId("EDT_Descricao").fill("Unrelated description"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect(await read(request, headers, original.id)).toMatchObject({ Codigo: large, palavra_passe: "MIXEDCASE  " });
    await list.getByTestId("Btn_New").click(); const description = form.getByTestId("EDT_Descricao"), popup = form.getByTestId("EDT_Descricao__suggestions"); await form.getByTestId("EDT_Codigo").fill(String(newCode)); await description.fill(marker.toLowerCase());
    await expect(popup.getByRole("option", { name: suggested, exact: true })).toBeVisible(); await description.press("ArrowDown"); await description.press("Enter"); await expect(description).toHaveValue(suggested); await expect(form).toBeVisible();
    await description.fill(marker.toLowerCase()); await expect(popup).toBeVisible(); await description.press("Escape"); await expect(popup).toHaveCount(0); await expect(form).toBeVisible();
    const free = marker + "free text  "; await description.fill(free); await form.getByTestId("EDT_Palavra_passe").fill(" "); await expect(form.getByTestId("EDT_Codigo")).not.toHaveAttribute("aria-autocomplete"); await expect(form.getByTestId("EDT_Palavra_passe")).not.toHaveAttribute("aria-autocomplete");
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); const created = (await rows(request, headers)).find(row => row.Codigo === newCode)!; owned.push(created.id); expect(await read(request, headers, created.id)).toMatchObject({ Descricao: free, palavra_passe: " " });
  } finally { const extra = (await rows(request, headers)).filter(row => row.Descricao?.startsWith(marker)).map(row => row.id); await cleanup(request, headers, [...new Set([...owned, ...extra])]); }
});

test("SRC-de66ef2034 selected authenticated read blocks competition, refreshes every edit return and preserves explicit sort without preliminary list refresh", async ({ page, request }) => {
  const headers = await session(request), [firstCode, secondCode] = await codes(request, headers, 2), owned: string[] = [];
  const original = await seed(request, headers, { Codigo: firstCode, Descricao: "Alpha user", palavra_passe: "Synthetic" }); owned.push(original.id);
  owned.push((await seed(request, headers, { Codigo: secondCode, Descricao: "Zeta user", palavra_passe: "Other" })).id);
  const listInputs: unknown[] = []; page.on("request", item => { if (item.url().endsWith("/api/users/list")) listInputs.push(item.postDataJSON()); }); let release = () => {};
  try {
    await open(page); const list = page.getByTestId("WIN_Table_utilizadores"), table = list.getByTestId("TABLE_utilizadores"), form = page.getByTestId("WIN_Form_utilizadores"); expect(listInputs[0]).toEqual({});
    await table.getByTestId("COL_Descricao").getByRole("button").first().click(); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, table, String(firstCode)).click();
    expect((await api<{ kind: string }>(request, headers, "save", { mode: "update", id: original.id, values: { Codigo: firstCode, Descricao: "Fresh selected name", palavra_passe: "Synthetic" } })).kind).toBe("saved");
    const before = listInputs.length, gate = new Promise<void>(resolve => { release = resolve; }); await page.route("**/api/users/read", async route => { const response = await route.fetch(); await gate; await route.fulfill({ response }); });
    await list.getByTestId("BTN_Modificar").click(); await expect(list.getByTestId("Btn_New")).toBeDisabled(); await expect(list.getByTestId("BTN_Delete")).toBeDisabled(); await rowFor(page, table, String(secondCode)).dblclick(); await expect(form).toHaveCount(0);
    release(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Fresh selected name"); expect(listInputs.length).toBe(before); await page.unroute("**/api/users/read");
    await form.getByTestId("EDT_Descricao").fill("Cancelled"); await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); expect(listInputs.length).toBe(before + 1); expect(listInputs.at(-1)).toEqual({ sort: "Descricao", descending: false });
    await expect(rowFor(page, table, String(firstCode))).toHaveAttribute("aria-selected", "true"); expect((await read(request, headers, original.id)).Descricao).toBe("Fresh selected name");
    const count = listInputs.length; await list.getByTestId("Btn_New").click(); await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0); expect(listInputs.length).toBe(count);
  } finally { release(); await page.unroute("**/api/users/read"); await cleanup(request, headers, owned); }
});

test("MIG-7L.1 delayed selected credential read cannot open a form in a later workspace instance after owner closes", async ({ page, request }) => {
  const headers = await session(request), [code] = await codes(request, headers, 1), original = await seed(request, headers, { Codigo: code, Descricao: "Owned delayed user read", palavra_passe: "Synthetic" }); let release = () => {};
  try {
    await open(page); const list = page.getByTestId("WIN_Table_utilizadores"), table = list.getByTestId("TABLE_utilizadores"), form = page.getByTestId("WIN_Form_utilizadores"), gate = new Promise<void>(resolve => { release = resolve; }); let captured = false;
    await page.route("**/api/users/read", async route => { const response = await route.fetch(); captured = true; await gate; await route.fulfill({ response }); });
    await rowFor(page, table, String(code)).click(); await list.getByTestId("BTN_Modificar").click(); await expect.poll(() => captured).toBe(true); await page.getByTestId("workspace-window-1-frame").getByTestId("BTN_SYST_FERMER").click(); await expect(list).toHaveCount(0);
    await page.getByTestId("users-open").click(); await expect(list.getByTestId("Btn_New")).toBeEnabled(); const response = page.waitForResponse(value => value.url().endsWith("/api/users/read")); release(); await (await response).finished();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))); await expect(form).toHaveCount(0); await expect(list.getByTestId("Btn_New")).toBeEnabled();
  } finally { release(); await page.unroute("**/api/users/read"); await cleanup(request, headers, [original.id]); }
});

test("SRC-c8c753cd4f SRC-427f3ed2cc DEV user selector hides maintenance, returns numeric code/exact origin, and uses literal valid row bounds", async ({ page, request }) => {
  const headers = await session(request), [firstCode, secondCode] = await codes(request, headers, 2), owned: string[] = []; for (const [index, Codigo] of [firstCode, secondCode].entries()) owned.push((await seed(request, headers, { Codigo, Descricao: `User selector ${index}`, palavra_passe: "Synthetic" })).id);
  let reads = 0; page.on("request", item => { if (item.url().endsWith("/api/users/read")) reads++; });
  try {
    // DEV component consumer only; actual access/repair/menu continuation remains its own stage.
    await page.goto("/?workflow=users&selecting=1&origin=ORIGINAL"); await page.getByTestId("users-select-open").click(); const picker = page.getByTestId("user-picker"), table = picker.getByTestId("TABLE_utilizadores");
    await expect(picker.getByTestId("BTN_selecionar")).toBeFocused(); for (const id of ["Btn_New", "BTN_Modificar", "BTN_Delete", "BTN_Imprimir"]) await expect(picker.getByTestId(id)).toBeHidden(); expect((await table.locator("tbody tr").first().boundingBox())!.height).toBe(30);
    const frame = (await page.getByTestId("user-picker-frame").boundingBox())!, close = (await picker.getByTestId("BTN_Fechar").boundingBox())!; expect(close.y - frame.y).toBe(506); expect(close.height).toBe(38);
    const first = table.locator("tbody tr").first(), last = table.locator("tbody tr").last(); await first.click(); await picker.getByTestId("BTN_anterior").click(); await expect(first).toHaveAttribute("aria-selected", "true"); await picker.getByTestId("BTN_seguinte").click(); await expect(table.locator("tbody tr").nth(1)).toHaveAttribute("aria-selected", "true");
    await last.click(); await picker.getByTestId("BTN_seguinte").click(); await expect(last).toHaveAttribute("aria-selected", "true"); await rowFor(page, table, String(firstCode)).dblclick(); await expect(picker).toHaveCount(0); await expect(page.getByTestId("users-returned")).toHaveText(String(firstCode)); await expect(page.getByTestId("users-returned-kind")).toHaveText("number"); expect(reads).toBe(0);
    await page.getByTestId("users-select-open").click(); await picker.getByTestId("BTN_Fechar").click(); await expect(page.getByTestId("users-returned")).toHaveText("ORIGINAL"); await expect(page.getByTestId("users-returned-kind")).toHaveText("string");
    await page.getByTestId("users-select-open").click(); await page.keyboard.press("Escape"); await expect(picker).toHaveCount(0); await expect(page.getByTestId("users-returned")).toHaveText("ORIGINAL");
  } finally { await cleanup(request, headers, owned); }
});

test("RULE-CD9683DC-017 real numeric/name seeks, source scrolling, saved column reset and modal geometry use independent consumer keys", async ({ page, request }) => {
  const headers = await session(request), available = await codes(request, headers, 32, true), owned: string[] = [], marker = String(Date.now());
  try {
    for (const [index, Codigo] of available.entries()) owned.push((await seed(request, headers, { Codigo, Descricao: `${index === 31 ? "Z" : "A"}${marker} ` + "longo ".repeat(10), palavra_passe: "Synthetic" })).id);
    await open(page); const list = page.getByTestId("WIN_Table_utilizadores"), table = list.getByTestId("TABLE_utilizadores"), form = page.getByTestId("WIN_Form_utilizadores"), count = (await rows(request, headers)).length;
    await expect(list.getByTestId("BTN_Imprimir")).toBeEnabled(); await expect(table.getByRole("columnheader")).toHaveCount(2); expect((await table.getByTestId("COL_Codigo").boundingBox())!.width).toBe(76); expect((await table.getByTestId("COL_Descricao").boundingBox())!.width).toBe(489); await expect(table.locator("tbody tr").first().locator("td").first()).toHaveCSS("text-align", "right");
    for (const [column, term] of [["COL_Codigo", String(available[31])], ["COL_Descricao", `Z${marker}`]]) { await rowFor(page, table, String(available[0])).click(); await table.getByTestId(`${column}__search`).click(); await table.getByRole("textbox").fill(term); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText(String(available[31])); await table.getByRole("textbox").press("Escape"); await expect(list).toBeVisible(); }
    await expect(table.locator("tbody tr")).toHaveCount(count); await expect(table).toHaveCSS("overflow-y", "scroll"); await expect(table).toHaveCSS("overflow-x", "auto"); await expect(table).toHaveCSS("touch-action", "none"); expect(await table.evaluate(element => (element as HTMLElement).offsetWidth - element.clientWidth)).toBeGreaterThanOrEqual(16); expect(await table.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0);
    await table.evaluate(element => { element.scrollTop = 0; }); await swipeTable(page, table); expect(await table.evaluate(element => element.scrollTop)).toBe(0);
    // Positive control on the same overflowing consumer: panning works when source gating is removed.
    await table.evaluate(element => { (element as HTMLElement).style.touchAction = "auto"; }); await swipeTable(page, table); await expect.poll(() => table.evaluate(element => element.scrollTop)).toBeGreaterThan(0); await table.evaluate(element => { (element as HTMLElement).style.touchAction = "none"; element.scrollTop = 7; }); expect(await table.evaluate(element => element.scrollTop)).toBe(7);
    const header = table.getByTestId("COL_Descricao"), width = (await header.boundingBox())!.width; await header.getByRole("separator").press("ArrowRight"); expect((await header.boundingBox())!.width).toBe(width + 8); await header.getByRole("button").first().press("Control+Shift+ArrowLeft");
    await table.getByTestId("COL_Codigo").click({ button: "right" }); await expect(table.getByRole("group", { name: "Colunas", exact: true }).getByRole("checkbox")).toHaveCount(2); await table.getByRole("checkbox", { name: "Código", exact: true }).uncheck();
    await page.reload(); await page.getByTestId("users-open").click(); await expect(table.getByTestId("COL_Codigo")).toHaveCount(0); await table.getByRole("button", { name: "Colunas", exact: true }).click(); await table.getByRole("checkbox", { name: "Código", exact: true }).check(); expect((await header.boundingBox())!.width).toBe(width + 8); await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao");
    await table.getByRole("button", { name: "Repor", exact: true }).click(); expect((await header.boundingBox())!.width).toBe(width); await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Codigo");
    for (let index = 0; index < 60; index++) await header.getByRole("separator").press("ArrowLeft"); const target = rowFor(page, table, String(available[31])).locator("td").nth(1); await target.hover(); await expect(target).toHaveAttribute("title", `Z${marker} ` + "longo ".repeat(10));
    await table.getByRole("button", { name: "Colunas", exact: true }).click(); await table.getByRole("button", { name: "Repor", exact: true }).click();
    await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Descricao").fill("Geometry draft"); const frame = page.getByTestId("user-form-frame"), initialWidth = (await frame.boundingBox())!.width; expect((await frame.boundingBox())!.height).toBe(135); await page.getByTestId("user-form-frame-resize-e").press("ArrowRight"); expect((await frame.boundingBox())!.width).toBe(initialWidth + 8);
    await form.getByTestId("EDT_Descricao").focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click(); await page.getByTestId("user-form-restore").click(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Geometry draft"); await expect(form.getByTestId("EDT_Descricao")).toBeFocused();
    await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(list).toBeVisible(); await list.getByTestId("Btn_New").click(); expect((await frame.boundingBox())!.width).toBe(initialWidth + 8); await expect(form.getByTestId("EDT_Descricao")).toHaveValue(""); await form.getByTestId("BTN_Cancelar").click();
  } finally { await cleanup(request, headers, owned); }
});
