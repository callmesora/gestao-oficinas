import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import type { Article, ArticleList, ArticleValues } from "../packages/domain/src/articles";
import type { Unit } from "../packages/domain/src/units";

type Headers = { Authorization: string };
const all: ArticleList = { mode: "todos", term: "", active: true, inactive: true };
let serial = 0;
const code = () => `UIA-${Date.now().toString(36)}-${++serial}`;
const values = (Codigo: string, extra: Partial<ArticleValues> = {}): ArticleValues => ({ Codigo, Descricao: "Synthetic article", codbarras: "", unidade: "UN", preco: "0", inativo: false, ...extra });
async function session(request: APIRequestContext): Promise<Headers> {
  const response = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(response.ok()).toBe(true); return { Authorization: `Bearer ${(await response.json()).token}` };
}
async function api<T>(request: APIRequestContext, headers: Headers, operation: string, data: unknown): Promise<T> {
  const response = await request.post(`/api/articles/${operation}`, { headers, data }); expect(response.ok()).toBe(true); return response.json() as Promise<T>;
}
async function rows(request: APIRequestContext, headers: Headers, input: ArticleList = all): Promise<Article[]> {
  const result = await api<{ kind: string; articles: Article[] }>(request, headers, "list", input); expect(result.kind).toBe("loaded"); return result.articles;
}
async function seed(request: APIRequestContext, headers: Headers, input: ArticleValues): Promise<Article> {
  const result = await api<{ kind: string; article: Article }>(request, headers, "save", { mode: "create", values: input }); expect(result.kind).toBe("saved"); return result.article;
}
async function unit(request: APIRequestContext, headers: Headers, suffix: number): Promise<Unit> {
  const response = await request.post("/api/units/list", { headers, data: {} }); expect(response.ok()).toBe(true);
  const used = new Set(((await response.json()).units as Unit[]).map(item => item.Codigo));
  const Codigo = Array.from({ length: 1296 }, (_, index) => `A${((index + suffix) % 1296).toString(36).padStart(2, "0")}`).find(value => !used.has(value)); expect(Codigo).toBeDefined();
  const saved = await request.post("/api/units/save", { headers, data: { mode: "create", values: { Codigo, Descricao: "Different display label" } } }); expect(saved.ok()).toBe(true);
  const result = await saved.json(); expect(result.kind).toBe("saved"); return result.unit as Unit;
}
async function cleanup(request: APIRequestContext, headers: Headers, articleIds: readonly string[], unitIds: readonly string[] = []) {
  for (const id of articleIds) await request.post("/api/articles/delete", { headers, data: { id } });
  for (const id of unitIds) await request.post("/api/units/delete", { headers, data: { id } });
}
const rowFor = (page: Page, table: Locator, value: string) => table.getByRole("row").filter({ has: page.getByRole("cell", { name: value.trim(), exact: true }) });
async function open(page: Page) { await page.goto("/?workflow=articles"); await page.getByTestId("articles-open").click(); await expect(page.getByTestId("WIN_Table_artigos").getByTestId("Btn_New")).toBeEnabled(); }
async function info(page: Page, text: string) { const dialog = page.getByTestId("WINDEVMESSAGEBOX"); await expect(dialog.getByTestId("RADTitle")).toHaveText("Artigos"); await expect(dialog.getByTestId("LIB_INFO")).toHaveText(text); await dialog.getByTestId("BTN_OK").click(); }
async function swipeTable(page: Page, table: Locator) {
  const client = await page.context().newCDPSession(page), box = (await table.boundingBox())!;
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const point = { x: box.x + box.width / 2, y: box.y + box.height - 35, id: 0 };
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  for (let index = 1; index <= 8; index++) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ ...point, y: point.y - index * 20 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))); await client.detach();
}

test("SRC-18a96799b6 actual Artigos RAD CRUD retains source required order, unit codes, decimal drafts and readonly stock", async ({ page, request }) => {
  const headers = await session(request), lookup = await unit(request, headers, 190), lowerLookup = await unit(request, headers, 180), owned: string[] = [], exact = `${code()}' `;
  const writes: { values: Record<string, unknown> }[] = [];
  page.on("request", item => { if (item.url().endsWith("/api/articles/save")) writes.push(item.postDataJSON()); });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), table = list.getByTestId("TABLE_artigos"), form = page.getByTestId("WIN_Form_artigos");
    await expect(list.getByTestId("BTN_descricao")).toHaveText("Pesquisar por descrição"); await expect(list.getByTestId("CBOX_ativo")).toHaveAccessibleName("Ativo"); await expect(list.getByTestId("CBOX_inativo")).toHaveAccessibleName("Inativo");
    await list.getByTestId("Btn_New").click(); await expect(form.getByText("Descrição", { exact: true })).toBeVisible(); await expect(form.getByTestId("CBOX_Inativo")).toHaveAccessibleName("Inativo"); await expect(form.getByTestId("EDT_Preco")).toHaveValue("0,00"); await expect(form.getByTestId("EDT_Preco1")).toHaveValue("0,000"); await expect(form.getByTestId("EDT_Preco1")).toHaveAttribute("readonly", "");
    await expect(form.getByTestId("COMBO_Unidade")).toHaveValue(""); await expect(form.getByTestId("COMBO_Unidade").locator(`option[value="${lookup.Codigo}"]`)).toHaveText(lookup.Codigo!);
    const optionCodes = await form.getByTestId("COMBO_Unidade").locator("option").allTextContents(); expect(lowerLookup.Codigo! < lookup.Codigo!).toBe(true); expect(optionCodes.indexOf(lowerLookup.Codigo!)).toBeLessThan(optionCodes.indexOf(lookup.Codigo!));
    await form.getByTestId("EDT_Codigo").focus();
    for (const name of ["EDT_Descricao", "EDT_Codbaras", "COMBO_Unidade", "EDT_Preco", "CBOX_Inativo", "EDT_Preco1", "BTN_Validar"]) { await page.keyboard.press("Tab"); await expect(form.getByTestId(name)).toBeFocused(); }
    await form.getByTestId("BTN_Validar").click(); await info(page, "Indique um código"); await form.getByTestId("EDT_Codigo").fill(exact);
    await form.getByTestId("BTN_Validar").click(); await info(page, "Indique uma descrição"); await form.getByTestId("EDT_Descricao").fill("Óleo d'Água  ");
    await form.getByTestId("BTN_Validar").click(); await info(page, "Indique uma unidade"); expect(writes.length).toBe(0);
    await form.getByTestId("COMBO_Unidade").selectOption(lookup.Codigo!); await form.getByTestId("COMBO_Unidade").press("Enter"); await expect(form).toBeVisible(); await form.getByTestId("COMBO_Unidade").press("Escape"); await expect(form).toBeVisible(); await expect(form.getByTestId("COMBO_Unidade")).toHaveValue(lookup.Codigo!); expect(writes.length).toBe(0);
    await form.getByTestId("EDT_Preco").fill("-12,34"); await form.getByTestId("EDT_Codbaras").fill("B'  "); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    const created = (await rows(request, headers)).find(item => item.Codigo === exact)!; expect(created).toBeDefined(); owned.push(created.id);
    expect(created).toMatchObject({ Codigo: exact, Descricao: "Óleo d'Água  ", codbarras: "B'  ", unidade: lookup.Codigo, preco: "-12.34", stock: "0", inativo: false }); expect(writes[0].values).not.toHaveProperty("stock");
    const row = rowFor(page, table, exact); await expect(row).toContainText("-12,34"); await row.dblclick(); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", ""); await form.getByTestId("EDT_Descricao").fill("Changed only  "); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect((await rows(request, headers)).find(item => item.id === created.id)).toMatchObject({ artigosID: created.artigosID, Codigo: exact, Descricao: "Changed only  ", preco: "-12.34", stock: "0" });
    await page.reload(); await page.getByTestId("articles-open").click(); await expect(row).toContainText("Changed only"); await row.click(); await list.getByTestId("BTN_Delete").click();
    const confirm = page.getByTestId("WINDEVDIALOGBOX"); await expect(confirm.getByTestId("RADTitle")).toHaveText("Tabela de artigos"); await expect(confirm.getByTestId("LIB_INFO")).toHaveText("Deseja apagar o registo?"); await expect(confirm.getByRole("button", { name: "Não", exact: true })).toBeFocused(); await page.keyboard.press("Escape"); await expect(row).toBeVisible();
    await list.getByTestId("BTN_Delete").click(); await confirm.getByRole("button", { name: "Sim", exact: true }).click(); await expect(row).toHaveCount(0); expect((await rows(request, headers)).some(item => item.id === created.id)).toBe(false);
  } finally { await cleanup(request, headers, owned, [lookup.id, lowerLookup.id]); }
});

test("SRC-9efbe81830 source mode reset clears effective filters without changing visible flags, and real changes reapply them", async ({ page, request }) => {
  const headers = await session(request), marker = code(), owned: string[] = [];
  try {
    const seeded = [];
    for (const [index, inativo] of [false, true, null].entries()) { const item = await seed(request, headers, values(`${marker}-${index}`, { Descricao: `${marker} d'Água %_`, codbarras: `${marker}'%_${index}`, inativo })); seeded.push(item); owned.push(item.id); }
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), table = list.getByTestId("TABLE_artigos"), search = list.getByTestId("EDT_termo_pesquisa");
    await list.getByTestId("BTN_todos").focus(); for (const name of ["EDT_termo_pesquisa", "BTN_codigo", "BTN_descricao", "BTN_codigobarras", "CBOX_ativo", "CBOX_inativo"]) { await page.keyboard.press("Tab"); await expect(list.getByTestId(name)).toBeFocused(); }
    await expect(rowFor(page, table, seeded[0].Codigo!)).toBeVisible(); for (const item of seeded.slice(1)) await expect(rowFor(page, table, item.Codigo!)).toHaveCount(0);
    await list.getByTestId("BTN_codigo").click(); await expect(search).toBeFocused(); await expect(list.getByTestId("CBOX_ativo")).toBeChecked(); await expect(list.getByTestId("CBOX_inativo")).not.toBeChecked(); for (const item of seeded) await expect(rowFor(page, table, item.Codigo!)).toBeVisible();
    await search.fill(marker); await expect(rowFor(page, table, seeded[0].Codigo!)).toBeVisible(); for (const item of seeded.slice(1)) await expect(rowFor(page, table, item.Codigo!)).toHaveCount(0);
    await list.getByTestId("CBOX_inativo").check(); for (const item of seeded) await expect(rowFor(page, table, item.Codigo!)).toBeVisible(); await list.getByTestId("CBOX_ativo").uncheck(); await expect(rowFor(page, table, seeded[1].Codigo!)).toBeVisible(); for (const item of [seeded[0], seeded[2]]) await expect(rowFor(page, table, item.Codigo!)).toHaveCount(0);
    await list.getByTestId("CBOX_inativo").uncheck(); await expect(list.getByTestId("CBOX_ativo")).toBeChecked(); await expect(rowFor(page, table, seeded[0].Codigo!)).toBeVisible(); await expect(rowFor(page, table, seeded[1].Codigo!)).toHaveCount(0);
    await list.getByTestId("BTN_descricao").click(); await expect(search).toHaveValue(""); for (const item of seeded) await expect(rowFor(page, table, item.Codigo!)).toBeVisible(); await search.fill(`${marker} d'Água %_`); await expect(rowFor(page, table, seeded[0].Codigo!)).toBeVisible(); await expect(rowFor(page, table, seeded[1].Codigo!)).toHaveCount(0);
    await list.getByTestId("BTN_codigobarras").click(); await search.fill(`${marker}'%_`); await expect(rowFor(page, table, seeded[0].Codigo!)).toBeVisible(); await expect(rowFor(page, table, seeded[1].Codigo!)).toHaveCount(0);
    await list.getByTestId("BTN_todos").click(); for (const item of seeded) await expect(rowFor(page, table, item.Codigo!)).toBeVisible(); await search.fill("this term is ignored in todos"); await expect(rowFor(page, table, seeded[0].Codigo!)).toBeVisible(); await expect(rowFor(page, table, seeded[1].Codigo!)).toHaveCount(0);
    await expect(list.getByTestId("BTN_todos")).toHaveCSS("font-weight", "700"); await expect(list.getByTestId("BTN_todos")).toHaveCSS("text-decoration-line", "underline");
  } finally { await cleanup(request, headers, owned); }
});

test("SRC-361896d316 cached edit opens immediately, refreshes every edit result, and delayed units preserve orphan/drafts", async ({ page, request }) => {
  const headers = await session(request), lookup = await unit(request, headers, 350), original = await seed(request, headers, values(code(), { unidade: "Z' ", preco: "1.23456789", codbarras: null }));
  const inputs: ArticleList[] = [], unitInputs: unknown[] = [];
  page.on("request", item => { if (item.url().endsWith("/api/articles/list")) inputs.push(item.postDataJSON()); if (item.url().endsWith("/api/units/list")) unitInputs.push(item.postDataJSON()); });
  let release = () => {}; let entered = () => {}; const requested = new Promise<void>(resolve => { entered = resolve; }), held = new Promise<void>(resolve => { release = resolve; });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), form = page.getByTestId("WIN_Form_artigos"), table = list.getByTestId("TABLE_artigos");
    await table.getByTestId("COL_Descricao").getByRole("button").first().click(); await expect(list.getByTestId("Btn_New")).toBeEnabled(); const initial = inputs.length, query = inputs.at(-1);
    await list.getByTestId("Btn_New").click(); await form.getByTestId("BTN_Cancelar").click(); await expect(list.getByTestId("Btn_New")).toBeEnabled(); expect(inputs.length).toBe(initial);
    const changed = await api<{ kind: string }>(request, headers, "save", { mode: "update", id: original.id, values: values(original.Codigo!, { unidade: "Z' ", preco: "2.34567891", Descricao: "External change" }) }); expect(changed.kind).toBe("saved");
    await page.route("**/api/units/list", async route => { const actual = await route.fetch(); entered(); await held; await route.fulfill({ response: actual }); });
    await rowFor(page, table, original.Codigo!).dblclick(); await requested; await expect(form.getByTestId("EDT_Descricao")).toHaveValue(original.Descricao!); await expect(form.getByTestId("EDT_Preco")).toHaveValue("1,23456789"); expect(inputs.length).toBe(initial);
    await expect(form.getByTestId("COMBO_Unidade")).toHaveValue("Z' "); await expect(form.getByTestId("COMBO_Unidade").locator("option:checked")).toHaveText("Z' "); await form.getByTestId("EDT_Descricao").fill("Draft survives unit options"); await form.getByTestId("EDT_Preco").fill("3,14");
    release(); await expect(form.getByTestId("COMBO_Unidade").locator(`option[value="${lookup.Codigo}"]`)).toHaveText(lookup.Codigo!); await expect(form.getByTestId("COMBO_Unidade")).toHaveValue("Z' "); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Draft survives unit options"); await expect(form.getByTestId("EDT_Preco")).toHaveValue("3,14"); expect(unitInputs.at(-1)).toEqual({ sort: "Codigo", descending: false });
    await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(list.getByTestId("Btn_New")).toBeEnabled(); expect(inputs.length).toBe(initial + 1); expect(inputs.at(-1)).toEqual(query); await expect(rowFor(page, table, original.Codigo!)).toContainText("External change");
    await rowFor(page, table, original.Codigo!).dblclick(); await expect(form.getByTestId("EDT_Preco")).toHaveValue("2,34567891"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); await expect(list.getByTestId("Btn_New")).toBeEnabled(); expect(inputs.length).toBe(initial + 2);
  } finally { release(); await page.unroute("**/api/units/list"); await cleanup(request, headers, [original.id], [lookup.id]); }
});

test("RULE-CAA44622-DOMAIN untouched NULL/oversized high precision price, barcode and flag survive unrelated edits", async ({ page, request }) => {
  const headers = await session(request), owned: string[] = [], cases = [null, "-12345678901234567890.12345678901234567890"];
  try {
    for (const preco of cases) owned.push((await seed(request, headers, values(code(), { preco, codbarras: null, inativo: null, unidade: "Z' " }))).id);
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), form = page.getByTestId("WIN_Form_artigos"), table = list.getByTestId("TABLE_artigos"); await list.getByTestId("BTN_todos").click();
    for (const [index, id] of owned.entries()) {
      const item = (await rows(request, headers)).find(row => row.id === id)!; await expect(list.getByTestId("Btn_New")).toBeEnabled(); await rowFor(page, table, item.Codigo!).dblclick(); await expect(form.getByTestId("CBOX_Inativo")).not.toBeChecked();
      const price = form.getByTestId("EDT_Preco"); await expect(price).toHaveValue(index === 0 ? "" : "-12 345 678 901 234 567 890,12345678901234567890"); await price.focus();
      if (index === 0) { await price.pressSequentially("x"); await expect(price).toHaveValue(""); }
      await form.getByTestId("EDT_Descricao").focus(); await form.getByTestId("EDT_Descricao").fill(`Unrelated edit ${index}`); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
      const saved = (await rows(request, headers)).find(row => row.id === id)!; expect(saved).toMatchObject({ preco: cases[index], codbarras: null, inativo: null, stock: "0", unidade: "Z' " });
    }
  } finally { await cleanup(request, headers, owned); }
});

test("ADR-003 accepted price change from NULL through digits back to blank remains invalid after source barcode priority", async ({ page, request }) => {
  const headers = await session(request), owned: string[] = [], sent: { values: ArticleValues }[] = [];
  page.on("request", item => { if (item.url().endsWith("/api/articles/save")) sent.push(item.postDataJSON()); });
  try {
    const original = await seed(request, headers, values(code(), { preco: null, codbarras: null })); owned.push(original.id);
    const other = await seed(request, headers, values(code(), { codbarras: code() })); owned.push(other.id);
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), form = page.getByTestId("WIN_Form_artigos");
    await rowFor(page, list.getByTestId("TABLE_artigos"), original.Codigo!).dblclick();
    await expect(form.getByTestId("EDT_Preco")).toHaveValue(""); await form.getByTestId("EDT_Preco").fill("1,2"); await form.getByTestId("EDT_Preco").fill("");
    await form.getByTestId("EDT_Codbaras").fill(other.codbarras!); await form.getByTestId("BTN_Validar").click(); await info(page, "Código de barras já associado a outro artigo");
    expect(sent.at(-1)?.values.preco).toBe(""); expect((await rows(request, headers)).find(item => item.id === original.id)).toEqual(original);
    await form.getByTestId("EDT_Codbaras").fill(""); await form.getByTestId("BTN_Validar").click();
    await expect(form.getByTestId("article-form-diagnostic")).toHaveText("invalid"); await expect(form).toBeVisible();
    expect(sent).toHaveLength(2); expect(sent.at(-1)?.values.preco).toBe(""); expect((await rows(request, headers)).find(item => item.id === original.id)).toEqual(original);
    await form.getByTestId("BTN_Cancelar").click();
  } finally { await cleanup(request, headers, owned); }
});

test("SRC-18a96799b6 barcode Info precedes numeric rejection and code-duplicate Error through the real save API", async ({ page, request }) => {
  const headers = await session(request), original = await seed(request, headers, values(code(), { codbarras: `${code()}' ` })); let writes = 0;
  page.on("request", item => { if (item.url().endsWith("/api/articles/save")) writes++; });
  try {
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), form = page.getByTestId("WIN_Form_artigos"); await list.getByTestId("Btn_New").click();
    await form.getByTestId("EDT_Preco").fill(""); await form.getByTestId("EDT_Codbaras").fill(original.codbarras!); await form.getByTestId("BTN_Validar").click(); await info(page, "Indique um código"); expect(writes).toBe(0);
    await form.getByTestId("EDT_Codigo").fill(original.Codigo!); await form.getByTestId("EDT_Descricao").fill("Duplicate pending"); await form.getByTestId("BTN_Validar").click(); await info(page, "Indique uma unidade"); expect(writes).toBe(0);
    // A loaded orphan is allowed by the API; the new UI deliberately starts blank, so create a real unit for this choice.
    const lookup = await unit(request, headers, 500);
    try {
      await form.getByTestId("BTN_Cancelar").click(); await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Codigo").fill(original.Codigo!); await form.getByTestId("EDT_Descricao").fill("Duplicate pending"); await form.getByTestId("COMBO_Unidade").selectOption(lookup.Codigo!); await form.getByTestId("EDT_Preco").fill(""); await form.getByTestId("EDT_Codbaras").fill(original.codbarras!);
      await form.getByTestId("BTN_Validar").click(); await info(page, "Código de barras já associado a outro artigo"); expect(writes).toBe(1); await expect(form).toBeVisible(); await expect(form.getByTestId("article-form-diagnostic")).toHaveCount(0);
      await form.getByTestId("EDT_Codbaras").fill(""); await form.getByTestId("BTN_Validar").click(); await expect(form.getByTestId("article-form-diagnostic")).toHaveText("invalid"); expect(writes).toBe(2); await expect(form).toBeVisible();
      await form.getByTestId("EDT_Preco").fill("0,00"); await form.getByTestId("BTN_Validar").click(); await info(page, `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${original.Codigo}`); expect(writes).toBe(3); await expect(form.getByTestId("BTN_Validar")).toBeEnabled(); await form.getByTestId("BTN_Cancelar").click();
      expect((await rows(request, headers)).filter(item => item.Codigo === original.Codigo)).toHaveLength(1);
    } finally { await cleanup(request, headers, [], [lookup.id]); }
  } finally { await cleanup(request, headers, [original.id]); }
});

test("RULE-CAA44622-010 actual decimal beforeinput, raw paste rejection, caret/ref and readonly stock preserve whole edits", async ({ page, request }) => {
  const headers = await session(request), lookup = await unit(request, headers, 700), owned: string[] = [], createdCode = code();
  try {
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), form = page.getByTestId("WIN_Form_artigos"); await list.getByTestId("Btn_New").click();
    const price = form.getByTestId("EDT_Preco"); await price.fill("1234,56"); await expect(price).toHaveValue("1 234,56"); await price.evaluate(element => (element as HTMLInputElement).setSelectionRange(2, 2)); await price.press("Backspace"); await expect(price).toHaveValue("234,56");
    await price.fill("1,"); await price.pressSequentially("2"); await expect(price).toHaveValue("1,2"); await price.pressSequentially("3"); await expect(price).toHaveValue("1,23"); await price.pressSequentially("4"); await expect(price).toHaveValue("1,23");
    const rejectedPaste = await price.evaluate(element => { const input = element as HTMLInputElement; input.setSelectionRange(1, 3); const data = new DataTransfer(); data.setData("text", "2\n3"); return input.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true })); });
    expect(rejectedPaste).toBe(false); await expect(price).toHaveValue("1,23"); expect(await price.evaluate(element => [(element as HTMLInputElement).selectionStart, (element as HTMLInputElement).selectionEnd])).toEqual([1, 3]);
    const acceptedPaste = await price.evaluate(element => { const data = new DataTransfer(); data.setData("text", ",2"); return element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true })); }); expect(acceptedPaste).toBe(true);
    await price.fill("999999999,99"); await price.pressSequentially("9"); await expect(price).toHaveValue("999 999 999,99"); await price.fill("-12,30"); await price.pressSequentially("x"); await expect(price).toHaveValue("-12,30");
    await form.getByTestId("EDT_Preco1").focus(); await page.keyboard.press("7"); await expect(form.getByTestId("EDT_Preco1")).toHaveValue("0,000");
    await form.getByTestId("EDT_Codigo").fill(createdCode); await form.getByTestId("EDT_Descricao").fill("Actual masked save"); await form.getByTestId("COMBO_Unidade").selectOption(lookup.Codigo!); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0); const saved = (await rows(request, headers)).find(item => item.Codigo === createdCode)!; owned.push(saved.id); expect(saved.preco).toBe("-12.30"); expect(saved.stock).toBe("0");
  } finally { await cleanup(request, headers, owned, [lookup.id]); }
});

test("SRC-931f8b27a0 source Artigos selector hides maintenance and preserves exact string return/origin, row geometry and bounds", async ({ page, request }) => {
  const headers = await session(request), exact = `${code()}' `, origin = " 0' ", owned: string[] = [];
  try {
    owned.push((await seed(request, headers, values(exact))).id); owned.push((await seed(request, headers, values(code()))).id);
    await page.goto(`/?workflow=articles&selecting=1&origin=${encodeURIComponent(origin)}`); await page.getByTestId("articles-select-open").click(); const picker = page.getByTestId("article-picker"), table = picker.getByTestId("TABLE_artigos"); await expect(picker.getByTestId("BTN_selecionar")).toBeFocused();
    for (const name of ["Btn_New", "BTN_Modificar", "BTN_Delete", "BTN_Imprimir"]) await expect(picker.getByTestId(name)).toBeHidden(); for (const name of ["BTN_anterior", "BTN_seguinte", "BTN_selecionar"]) await expect(picker.getByTestId(name)).toBeVisible();
    expect((await table.locator("tbody tr").first().boundingBox())!.height).toBe(30); const frame = (await page.getByTestId("article-picker-frame").boundingBox())!, close = (await picker.getByTestId("BTN_Fechar").boundingBox())!; expect(close.y - frame.y).toBe(503); expect(close.height).toBe(38);
    const first = table.locator("tbody tr").first(), last = table.locator("tbody tr").last(); await first.click(); await picker.getByTestId("BTN_anterior").click(); await expect(first).toHaveAttribute("aria-selected", "true"); await picker.getByTestId("BTN_seguinte").click(); await expect(table.locator("tbody tr").nth(1)).toHaveAttribute("aria-selected", "true"); await last.click(); await picker.getByTestId("BTN_seguinte").click(); await expect(last).toHaveAttribute("aria-selected", "true");
    await rowFor(page, table, exact).dblclick(); await expect(picker).toHaveCount(0); expect(await page.getByTestId("articles-returned").textContent()).toBe(exact);
    await page.getByTestId("articles-select-open").click(); await picker.getByTestId("BTN_Fechar").click(); expect(await page.getByTestId("articles-returned").textContent()).toBe(origin); await page.getByTestId("articles-select-open").click(); await page.keyboard.press("Escape"); await expect(picker).toHaveCount(0); expect(await page.getByTestId("articles-returned").textContent()).toBe(origin);
    // DEV component evidence only; actual stock/material callers retain their distinct continuation obligations.
  } finally { await cleanup(request, headers, owned); }
});

test("RULE-C7738076-030 actual typed price header sort/seek, saved six columns, Center and source no-touch options", async ({ page, request }) => {
  const headers = await session(request), owned: string[] = [], marker = code();
  try {
    for (let index = 0; index < 32; index++) owned.push((await seed(request, headers, values(`${marker}-${index}`, { Descricao: `${marker} longo `.repeat(3).slice(0, 100), preco: index === 0 ? "2" : index === 1 ? "10" : "100", inativo: false }))).id);
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), table = list.getByTestId("TABLE_artigos"); await list.getByTestId("BTN_codigo").click(); await list.getByTestId("EDT_termo_pesquisa").fill(marker); await expect(table.locator("tbody tr")).toHaveCount(32);
    for (const [name, width] of [["COL_Codigo", 89], ["COL_Descricao", 170], ["COL_Codbarras", 148], ["COL_Unidade", 109], ["COL_Preco", 92], ["COL_Inativo", 49]] as const) expect((await table.getByTestId(name).boundingBox())!.width).toBe(width); await expect(table.getByTestId("COL_ArtigosID")).toHaveCount(0);
    const narrowHeader = table.getByTestId("COL_Inativo"), caption = narrowHeader.getByRole("button", { name: "Inativo", exact: true }), magnifier = narrowHeader.getByTestId("COL_Inativo__search");
    expect(await caption.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true); await expect(caption).toHaveCSS("overflow-x", "hidden");
    await expect(caption).toHaveAccessibleName("Inativo"); expect((await caption.boundingBox())!.x + (await caption.boundingBox())!.width).toBeLessThanOrEqual((await magnifier.boundingBox())!.x);
    await caption.hover(); await expect(caption).toHaveAttribute("title", "Inativo");
    await table.getByTestId("COL_Preco").getByRole("button").first().click(); await expect(table.locator("tbody tr").first()).toContainText(`${marker}-0`); await expect(table.locator("tbody tr").nth(1)).toContainText(`${marker}-1`);
    await table.getByTestId("COL_Preco__search").click(); await table.getByRole("textbox").fill("10"); await expect(table.locator('tr[aria-selected="true"]')).toContainText(`${marker}-1`); await table.getByRole("textbox").press("Enter"); await expect(page.getByTestId("WIN_Form_artigos")).toHaveCount(0); await expect(table.locator("tbody tr")).toHaveCount(32);
    await magnifier.click(); await table.getByRole("textbox").fill("0"); await expect(table.locator('tr[aria-selected="true"]')).toContainText(`${marker}-0`); await table.getByRole("textbox").press("Enter"); await expect(table.locator("tbody tr")).toHaveCount(32);
    await expect(table.locator("tbody tr").first().locator("td").nth(4)).toHaveCSS("text-align", "right"); const checkboxCell = table.locator("tbody tr").first().locator("td").nth(5); await expect(checkboxCell).toHaveCSS("text-align", "center"); await expect(checkboxCell.getByRole("checkbox")).toHaveAttribute("aria-readonly", "true");
    await expect(table).toHaveCSS("overflow-y", "scroll"); await expect(table).toHaveCSS("overflow-x", "auto"); await expect(table).toHaveCSS("touch-action", "none"); expect(await table.evaluate(element => element.scrollWidth - element.clientWidth)).toBe(0); await swipeTable(page, table); expect(await table.evaluate(element => element.scrollTop)).toBe(0); await table.evaluate(element => { (element as HTMLElement).style.touchAction = "auto"; }); await swipeTable(page, table); await expect.poll(() => table.evaluate(element => element.scrollTop)).toBeGreaterThan(0); await table.evaluate(element => { (element as HTMLElement).style.touchAction = "none"; element.scrollTop = 0; });
    const description = table.getByTestId("COL_Descricao"); await description.getByRole("separator").press("ArrowRight"); await description.getByRole("button").first().press("Control+Shift+ArrowLeft"); await table.getByRole("button", { name: "Colunas", exact: true }).click(); await expect(table.getByRole("group", { name: "Colunas", exact: true }).getByRole("checkbox")).toHaveCount(6); await table.getByRole("checkbox", { name: "Código", exact: true }).uncheck();
    await page.reload(); await page.getByTestId("articles-open").click(); await expect(table.getByTestId("COL_Codigo")).toHaveCount(0); await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao"); expect((await description.boundingBox())!.width).toBe(178); await table.getByRole("button", { name: "Colunas", exact: true }).click(); await table.getByRole("checkbox", { name: "Código", exact: true }).check(); await table.getByRole("button", { name: "Repor", exact: true }).click(); expect((await description.boundingBox())!.width).toBe(170);
  } finally { await cleanup(request, headers, owned); }
});
test("RULE-CAA44622-010 real description assistance and mounted modal preserve exact accepted/free text drafts", async ({ page, request }) => {
  const headers = await session(request), original = await seed(request, headers, values(code(), { Descricao: `${code()} d'Água  ` }));
  try {
    await open(page); const list = page.getByTestId("WIN_Table_artigos"), form = page.getByTestId("WIN_Form_artigos"); await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Descricao").fill(original.Descricao!.slice(0, 8)); await expect(form.getByTestId("EDT_Descricao__suggestions")).toBeVisible(); await form.getByTestId("EDT_Descricao").press("ArrowDown"); await form.getByTestId("EDT_Descricao").press("Enter"); await expect(form).toBeVisible(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue(original.Descricao!);
    await form.getByTestId("EDT_Codbaras").fill(original.Descricao!.slice(0, 8)); await expect(form.getByTestId("EDT_Codbaras__suggestions")).toHaveCount(0); await form.getByTestId("EDT_Descricao").fill("Unmatched free text  "); await form.getByTestId("EDT_Preco").fill("1,");
    await form.getByRole("button", { name: "Minimizar", exact: true }).click(); await page.getByTestId("article-form-restore").click(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Unmatched free text  "); await expect(form.getByTestId("EDT_Preco")).toHaveValue("1,"); await form.getByTestId("BTN_Cancelar").click();
  } finally { await cleanup(request, headers, [original.id]); }
});
