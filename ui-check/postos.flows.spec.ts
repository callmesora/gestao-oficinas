import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";

type Headers = { Authorization: string };
type Posto = { id: string; Codigo: number | null; Descricao: string | null; terminal: string | null; teste: string | null };
type Terminal = { id: string; Codigo: string; Descricao: string; codbarras_inicio: number; codbarras_fim: number; quant_inicio: number; quant_fim: number; pasta_localizacao: string; nome_ficheiro: string };

async function session(request: APIRequestContext): Promise<Headers> {
  const response = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  return { Authorization: `Bearer ${(await response.json()).token}` };
}
async function postos(request: APIRequestContext, headers: Headers): Promise<Posto[]> {
  const result = await (await request.post("/api/postos/list", { headers, data: {} })).json(); expect(result.kind).toBe("loaded"); return result.postos;
}
async function freeCodes(request: APIRequestContext, headers: Headers, count: number, large = false) {
  const taken = new Set((await postos(request, headers)).map(row => row.Codigo));
  const candidates = Array.from({ length: large ? 156 : 99 }, (_, index) => (large ? 255 - index : 99 - index)).filter(code => !taken.has(code));
  expect(candidates.length).toBeGreaterThanOrEqual(count); return candidates.slice(0, count);
}
async function seedPosto(request: APIRequestContext, headers: Headers, Codigo: number, Descricao: string, terminal: string | null = null): Promise<Posto> {
  const result = await (await request.post("/api/postos/save", { headers, data: { mode: "create", values: { Codigo, Descricao, terminal } } })).json();
  expect(result.kind).toBe("saved"); return result.posto;
}
async function seedTerminal(request: APIRequestContext, headers: Headers, Descricao: string): Promise<Terminal> {
  const existing = await (await request.post("/api/terminals/list", { headers, data: {} })).json();
  const used = new Set(existing.terminals.map((row: Terminal) => row.Codigo));
  const Codigo = Array.from({ length: 1296 }, (_, index) => `W${index.toString(36).padStart(2, "0")}`).find(code => !used.has(code))!;
  const result = await (await request.post("/api/terminals/save", { headers, data: { mode: "create", values: { Codigo, Descricao, codbarras_inicio: 0, codbarras_fim: 0, quant_inicio: 0, quant_fim: 0, pasta_localizacao: "", nome_ficheiro: "" } } })).json();
  expect(result.kind).toBe("saved"); return result.terminal;
}
async function removeOwned(request: APIRequestContext, headers: Headers, postoIds: string[], terminalIds: string[] = []) {
  for (const id of postoIds) await request.post("/api/postos/delete", { headers, data: { id } });
  for (const id of terminalIds) await request.post("/api/terminals/delete", { headers, data: { id } });
}
const rowFor = (page: Page, table: Locator, value: string) => table.getByRole("row").filter({ has: page.getByRole("cell", { name: value, exact: true }) });
async function openPostos(page: Page) {
  await page.goto("/?workflow=postos"); await page.getByTestId("postos-open").click();
  await expect(page.getByTestId("WIN_Table_postos").getByTestId("Btn_New")).toBeEnabled();
}
async function actualTerminalReset(page: Page) {
  await page.getByTestId("terminals-open").click();
  const list = page.getByTestId("WIN_Table_Terminais");
  await list.getByTestId("Btn_New").click(); await page.getByTestId("WIN_Form_Terminais").getByTestId("BTN_Cancelar").click();
  await list.getByTestId("BTN_Fechar").click(); await expect(list).toHaveCount(0);
}
async function dismissInfo(page: Page, text: string) {
  await expect(page.getByTestId("LIB_INFO")).toHaveText(text); await page.getByTestId("WINDEVMESSAGEBOX").getByTestId("BTN_OK").click();
}

test("SRC-7bae671f3d SRC-c312a25e20 actual terminal reset/selection freezes Postos entry permission and real nested CRUD returns Codigo", async ({ page, request }) => {
  const headers = await session(request), [code, otherCode] = await freeCodes(request, headers, 2), owned: string[] = [], terminalIds: string[] = [];
  const marker = `Posto ${Date.now()}`, terminal = await seedTerminal(request, headers, "Original terminal"); terminalIds.push(terminal.id);
  const usedTerminalCodes = new Set((await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.map((row: Terminal) => row.Codigo));
  const nestedCode = Array.from({ length: 1296 }, (_, index) => `N${index.toString(36).padStart(2, "0")}`).find(value => !usedTerminalCodes.has(value))!;
  let saves = 0; const savedPayloads: { values: Record<string, unknown> }[] = [];
  page.on("request", item => { if (item.url().endsWith("/api/postos/save")) { saves++; savedPayloads.push(item.postDataJSON()); } });
  try {
    await openPostos(page);
    const list = page.getByTestId("WIN_Table_postos"), form = page.getByTestId("WIN_Form_postos");
    await list.getByTestId("Btn_New").click();
    await expect(form.getByTestId("EDT_Codigo")).toHaveValue("0"); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
    await form.getByTestId("BTN_Validar").click(); await dismissInfo(page, "Indique um código"); expect(saves).toBe(0);
    // The real picker resets Terminais, but cannot change this already-open Postos form's captured guard.
    await form.getByTestId("BTN_NoName1").click();
    const picker = page.getByTestId("terminal-picker"), terminalForm = page.getByTestId("WIN_Form_Terminais");
    await picker.getByTestId("Btn_New").click(); await terminalForm.getByTestId("BTN_Cancelar").click(); await picker.getByTestId("BTN_Fechar").click();
    await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
    await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(list).toBeVisible();
    await list.getByTestId("Btn_New").click(); await expect(form.getByTestId("EDT_Codigo")).not.toHaveAttribute("readonly");
    await form.getByTestId("EDT_Codigo").fill(String(code)); await form.getByTestId("EDT_Codigo").press("End"); await form.getByTestId("EDT_Codigo").press("9");
    await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(code));
    await form.getByTestId("EDT_Codigo").press("Enter"); await dismissInfo(page, "Indique uma descrição"); expect(saves).toBe(0);
    await expect(form.getByTestId("EDT_Descricao")).toHaveAttribute("maxlength", "50");
    await expect(form.getByTestId("EDT_Terminal")).toHaveAttribute("readonly", "");
    await expect(form.getByText("Descrição", { exact: true })).toBeVisible();
    await form.getByTestId("EDT_Descricao").fill(marker + " d'Água  "); await expect(page.getByRole("listbox")).toHaveCount(0);
    await form.getByTestId("BTN_NoName1").click();
    for (const id of ["Btn_New", "BTN_Modificar", "BTN_Delete", "BTN_selecionar"]) await expect(picker.getByTestId(id)).toBeVisible();
    // Create and modify through the actual nested picker, then return Codigo rather than its description.
    await picker.getByTestId("Btn_New").click(); await terminalForm.getByTestId("EDT_Codigo").fill(nestedCode);
    await terminalForm.getByTestId("EDT_Descricao").fill("Created nested terminal"); await terminalForm.getByTestId("BTN_Validar").click(); await expect(terminalForm).toHaveCount(0);
    const nested = (await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.find((row: Terminal) => row.Codigo === nestedCode); terminalIds.push(nested.id);
    await expect(picker.getByTestId("BTN_Modificar")).toBeEnabled(); await rowFor(page, picker.getByTestId("TABLE_Terminais"), nestedCode).click(); await picker.getByTestId("BTN_Modificar").click();
    await terminalForm.getByTestId("EDT_Descricao").fill("Edited nested terminal"); await terminalForm.getByTestId("BTN_Validar").click();
    await expect(terminalForm).toHaveCount(0); await expect(picker.getByTestId("BTN_selecionar")).toBeEnabled();
    await expect(rowFor(page, picker.getByTestId("TABLE_Terminais"), nestedCode)).toContainText("Edited nested terminal");
    await rowFor(page, picker.getByTestId("TABLE_Terminais"), nestedCode).dblclick(); await expect(picker).toHaveCount(0);
    await expect(form.getByTestId("EDT_Terminal")).toHaveValue(nestedCode); await expect(form.getByTestId("EDT_Codigo")).not.toHaveAttribute("readonly");
    await expect(form.getByTestId("EDT_Descricao")).toHaveValue(marker + " d'Água  ");
    await form.getByTestId("BTN_NoName1").click(); await rowFor(page, picker.getByTestId("TABLE_Terminais"), terminal.Codigo).click(); await picker.getByTestId("BTN_Delete").click();
    await page.getByTestId("WINDEVDIALOGBOX").getByRole("button", { name: "Sim", exact: true }).click(); await expect(rowFor(page, picker.getByTestId("TABLE_Terminais"), terminal.Codigo)).toHaveCount(0);
    await picker.getByTestId("BTN_Fechar").click(); await expect(form.getByTestId("EDT_Terminal")).toHaveValue(nestedCode);
    await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    const created = (await postos(request, headers)).find(row => row.Codigo === code)!; owned.push(created.id);
    expect(created).toMatchObject({ Descricao: marker + " d'Água  ", terminal: nestedCode, teste: "" }); expect(saves).toBe(1);
    expect(Object.keys(savedPayloads[0].values).sort()).toEqual(["Codigo", "Descricao", "terminal"]);
    await expect(rowFor(page, list.getByTestId("TABLE_postos"), String(code))).toContainText(marker);
    // Successful terminal selection positioned Terminais: a new Postos record is now locked, independent of its own mode.
    await list.getByTestId("Btn_New").click(); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", ""); await form.getByTestId("BTN_Cancelar").click();
    await actualTerminalReset(page); await list.getByTestId("Btn_New").click();
    await form.getByTestId("EDT_Codigo").fill(String(code)); await form.getByTestId("EDT_Descricao").fill("Duplicate"); await form.getByTestId("BTN_Validar").click();
    await dismissInfo(page, `Duplicação:  Este registo não pode ser gravado.\nCampo associado ao erro: Codigo\nValor do campo duplicado: ${code}`);
    await expect(form).toBeVisible(); expect((await postos(request, headers)).filter(row => row.Codigo === code)).toHaveLength(1);
    await form.getByTestId("EDT_Codigo").fill(String(otherCode)); await form.getByTestId("BTN_Cancelar").click();
    expect((await postos(request, headers)).some(row => row.Codigo === otherCode)).toBe(false);
    await page.reload(); await page.getByTestId("postos-open").click(); await expect(rowFor(page, list.getByTestId("TABLE_postos"), String(code))).toContainText(marker);
  } finally {
    const ownRows = (await postos(request, headers)).filter(row => row.Descricao?.startsWith(marker));
    const ownNested = (await (await request.post("/api/terminals/list", { headers, data: {} })).json()).terminals.filter((row: Terminal) => row.Codigo === nestedCode).map((row: Terminal) => row.id);
    await removeOwned(request, headers, [...new Set([...owned, ...ownRows.map(row => row.id)])], [...new Set([...terminalIds, ...ownNested])]);
  }
});

test("SRC-78dffe2a53 existing oversized byte and nullable terminal survive real edits; Terminais reset permits changing an existing Postos code", async ({ page, request }) => {
  const headers = await session(request), [large] = await freeCodes(request, headers, 1, true), [changedCode] = await freeCodes(request, headers, 1);
  const original = await seedPosto(request, headers, large, `Byte ${Date.now()}`), owned = [original.id];
  try {
    await openPostos(page);
    const list = page.getByTestId("WIN_Table_postos"), table = list.getByTestId("TABLE_postos"), form = page.getByTestId("WIN_Form_postos");
    await rowFor(page, table, String(large)).click(); await list.getByTestId("BTN_Modificar").click();
    await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(large)); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
    await form.getByTestId("EDT_Descricao").fill("Preserved byte and NULL"); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    expect((await postos(request, headers)).find(row => row.id === original.id)).toMatchObject({ Codigo: large, terminal: null, teste: "", Descricao: "Preserved byte and NULL" });
    await actualTerminalReset(page); await rowFor(page, table, String(large)).click(); await list.getByTestId("BTN_Modificar").click();
    await expect(form.getByTestId("EDT_Codigo")).not.toHaveAttribute("readonly"); await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(large));
    await form.getByTestId("EDT_Codigo").focus(); await form.getByTestId("EDT_Descricao").focus(); await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(large));
    await form.getByTestId("EDT_Codigo").fill(String(changedCode)); await form.getByTestId("BTN_Validar").click(); await expect(form).toHaveCount(0);
    const stored = (await postos(request, headers)).find(row => row.id === original.id)!;
    expect(stored).toMatchObject({ Codigo: changedCode, terminal: null, Descricao: "Preserved byte and NULL", teste: "" });
    expect((await postos(request, headers)).some(row => row.Codigo === large)).toBe(false);
    await page.reload(); await page.getByTestId("postos-open").click(); await rowFor(page, table, String(changedCode)).click(); await list.getByTestId("BTN_Modificar").click();
    await expect(form.getByTestId("EDT_Codigo")).toHaveValue(String(changedCode)); await expect(form.getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
    await form.getByTestId("BTN_Cancelar").click();
  } finally { await removeOwned(request, headers, owned); }
});

test("SRC-f5f266e00c SRC-55285e57c4 edit waits for real refresh before and after cancellation, new cancellation avoids refresh, delete has exact confirmation", async ({ page, request }) => {
  const headers = await session(request), [code] = await freeCodes(request, headers, 1), original = await seedPosto(request, headers, code, "Before refresh");
  let release = () => {}, listRequests = 0;
  page.on("request", item => { if (item.url().endsWith("/api/postos/list")) listRequests++; });
  const update = async (Descricao: string) => {
    const result = await (await request.post("/api/postos/save", { headers, data: { mode: "update", id: original.id, values: { Codigo: code, Descricao, terminal: null } } })).json(); expect(result.kind).toBe("saved");
  };
  try {
    await openPostos(page);
    const list = page.getByTestId("WIN_Table_postos"), table = list.getByTestId("TABLE_postos"), form = page.getByTestId("WIN_Form_postos");
    await list.getByTestId("BTN_Modificar").click(); await expect(form).toHaveCount(0);
    await rowFor(page, table, String(code)).click(); await update("Fresh before opening");
    let gate = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/api/postos/list", async route => { const response = await route.fetch(); await gate; await route.fulfill({ response }); });
    await list.getByTestId("BTN_Modificar").click();
    await expect(list.getByTestId("Btn_New")).toBeDisabled(); await expect(list.getByTestId("BTN_Delete")).toBeDisabled(); await expect(form).toHaveCount(0);
    release(); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Fresh before opening");
    await update("External change during modal"); await form.getByTestId("EDT_Descricao").fill("Cancelled draft");
    gate = new Promise<void>(resolve => { release = resolve; });
    await form.getByTestId("BTN_Cancelar").click(); await expect(form).toHaveCount(0); await expect(list.getByTestId("BTN_Modificar")).toBeDisabled();
    release(); await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(rowFor(page, table, String(code))).toContainText("External change during modal");
    await page.unroute("**/api/postos/list");
    const before = listRequests; await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Descricao").fill("Cancelled new"); await form.getByTestId("BTN_Cancelar").click();
    await expect(form).toHaveCount(0); await expect(list.getByTestId("Btn_New")).toBeEnabled(); expect(listRequests).toBe(before);
    await list.getByTestId("BTN_Delete").click();
    const confirmation = page.getByTestId("WINDEVDIALOGBOX"); await expect(confirmation).toContainText("Deseja apagar o registo?");
    await confirmation.getByRole("button", { name: "Não", exact: true }).click(); expect((await postos(request, headers)).some(row => row.id === original.id)).toBe(true);
    await list.getByTestId("BTN_Delete").click(); await confirmation.getByRole("button", { name: "Sim", exact: true }).click(); await expect(rowFor(page, table, String(code))).toHaveCount(0);
    expect((await postos(request, headers)).some(row => row.id === original.id)).toBe(false);
  } finally { release(); await page.unroute("**/api/postos/list"); await removeOwned(request, headers, [original.id]); }
});

test("RULE-CF0B8FA5-013 RULE-CD4F0FE3-011 actual Postos columns, numeric/text seek, source scroll options and modal geometry retain their local keys", async ({ page, request }) => {
  const headers = await session(request), codes = await freeCodes(request, headers, 25, true), owned: string[] = [], marker = String(Date.now());
  try {
    for (const [index, code] of codes.entries()) owned.push((await seedPosto(request, headers, code, `${index === 24 ? "Z" : "A"}${marker} ` + "longo ".repeat(5))).id);
    await openPostos(page);
    const list = page.getByTestId("WIN_Table_postos"), table = list.getByTestId("TABLE_postos"), form = page.getByTestId("WIN_Form_postos");
    const count = (await postos(request, headers)).length;
    await expect(table.getByTestId("COL_Descricao")).toContainText("Descrição"); await expect(list.getByTestId("BTN_Imprimir")).toHaveCount(0);
    await rowFor(page, table, String(codes[0])).click(); await table.getByTestId("COL_Codigo__search").click(); await table.getByRole("textbox").fill(String(codes[24]));
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText(String(codes[24]));
    await table.getByRole("textbox").press("Enter"); await expect(form).toHaveCount(0);
    await rowFor(page, table, String(codes[0])).click(); await table.getByTestId("COL_Descricao__search").click(); await table.getByRole("textbox").fill(`Z${marker}`);
    await expect(list.getByTestId("BTN_Modificar")).toBeEnabled(); await expect(table.locator('tr[aria-selected="true"]')).toContainText(String(codes[24]));
    await table.getByRole("textbox").press("Escape"); await expect(list).toBeVisible(); await expect(table.locator("tbody tr")).toHaveCount(count);
    await expect(table).toHaveCSS("overflow-y", "scroll"); await expect(table).toHaveCSS("overflow-x", "auto"); await expect(table).toHaveCSS("touch-action", "none");
    expect(await table.evaluate(element => (element as HTMLElement).offsetWidth - element.clientWidth)).toBeGreaterThanOrEqual(16);
    expect((await table.locator("tbody tr").first().boundingBox())!.height).toBe(19);
    await table.evaluate(element => { element.scrollTop = 7; }); expect(await table.evaluate(element => element.scrollTop)).toBe(7);
    const header = table.getByTestId("COL_Descricao"), initialWidth = (await header.boundingBox())!.width;
    await header.getByRole("separator").press("ArrowRight"); expect((await header.boundingBox())!.width).toBe(initialWidth + 8);
    await header.getByRole("button").first().press("Control+Shift+ArrowLeft"); await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao");
    await table.getByTestId("COL_Codigo").click({ button: "right" }); await table.getByRole("checkbox", { name: "Código", exact: true }).uncheck();
    await page.reload(); await page.getByTestId("postos-open").click(); await expect(table.getByTestId("COL_Codigo")).toHaveCount(0);
    await table.getByRole("button", { name: "Colunas", exact: true }).click(); await table.getByRole("checkbox", { name: "Código", exact: true }).check();
    await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Descricao"); expect((await header.boundingBox())!.width).toBe(initialWidth + 8);
    await table.getByRole("button", { name: "Repor", exact: true }).click(); expect((await header.boundingBox())!.width).toBe(initialWidth);
    await expect(table.getByRole("columnheader").first()).toHaveAttribute("data-testid", "COL_Codigo");
    for (let index = 0; index < 35; index++) await header.getByRole("separator").press("ArrowLeft");
    const target = rowFor(page, table, String(codes[24])).locator("td").nth(1); await target.hover(); await expect(target).toHaveAttribute("title", `Z${marker} ` + "longo ".repeat(5));
    await table.getByRole("button", { name: "Colunas", exact: true }).click(); await table.getByRole("button", { name: "Repor", exact: true }).click();
    await list.getByTestId("Btn_New").click(); await form.getByTestId("EDT_Descricao").fill("Geometry draft");
    const frame = form.locator(".wd-frame"); const initial = (await frame.boundingBox())!;
    await form.getByTestId("posto-form-frame-resize-e").press("ArrowRight");
    expect((await frame.boundingBox())!.width).toBe(initial.width + 8); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Geometry draft");
    await form.getByTestId("EDT_Descricao").focus(); await form.getByTestId("BTN_SYST_MINIMIZE").click(); await page.getByTestId("posto-form-restore").click();
    await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Geometry draft"); await expect(form.getByTestId("EDT_Descricao")).toBeFocused();
    await form.getByTestId("BTN_NoName1").click(); const picker = page.getByTestId("terminal-picker"); await page.keyboard.press("Escape");
    await expect(picker).toHaveCount(0); await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Geometry draft"); await expect(list).toBeVisible();
    await form.getByTestId("BTN_Cancelar").click(); await list.getByTestId("Btn_New").click(); expect((await frame.boundingBox())!.width).toBe(initial.width + 8);
    await page.keyboard.press("Escape"); await expect(form).toHaveCount(0); await expect(list).toBeVisible();
  } finally { await removeOwned(request, headers, owned); }
});

test("SRC-1589c564c4 SRC-7bae671f3d real folder preparation positions Terminais before native-only chooser, affecting the next Postos opening", async ({ page, request }) => {
  const headers = await session(request), terminal = await seedTerminal(request, headers, "Folder position context");
  try {
    await openPostos(page); await page.getByTestId("terminals-open").click();
    const terminalList = page.getByTestId("WIN_Table_Terminais"), terminalForm = page.getByTestId("WIN_Form_Terminais");
    await terminalList.getByTestId("Btn_New").click(); await terminalForm.getByTestId("EDT_Codigo").fill(terminal.Codigo);
    await terminalForm.getByTestId("BTN_procurar_pasta").click(); await expect(terminalForm.getByTestId("terminal-form-diagnostic")).toHaveText("native_only");
    await terminalForm.getByTestId("BTN_Cancelar").click(); await terminalList.getByTestId("BTN_Fechar").click();
    await page.getByTestId("WIN_Table_postos").getByTestId("Btn_New").click();
    await expect(page.getByTestId("WIN_Form_postos").getByTestId("EDT_Codigo")).toHaveAttribute("readonly", "");
    await page.getByTestId("WIN_Form_postos").getByTestId("BTN_Cancelar").click();
  } finally { await removeOwned(request, headers, [], [terminal.id]); }
});

test("SRC-c312a25e20 a closed actual terminal picker cannot position shared context from a late modify read", async ({ page, request }) => {
  const headers = await session(request), terminal = await seedTerminal(request, headers, "Late cancelled modify");
  let release!: () => void, held = false;
  const gate = new Promise<void>(resolve => { release = resolve; });
  try {
    await openPostos(page); await actualTerminalReset(page);
    const list = page.getByTestId("WIN_Table_postos"), form = page.getByTestId("WIN_Form_postos");
    await list.getByTestId("Btn_New").click(); await expect(form.getByTestId("EDT_Codigo")).not.toHaveAttribute("readonly");
    await form.getByTestId("EDT_Descricao").fill("Cancelled picker draft"); await form.getByTestId("BTN_NoName1").click();
    const picker = page.getByTestId("terminal-picker");
    await rowFor(page, picker.getByTestId("TABLE_Terminais"), terminal.Codigo).click();
    await expect(picker.getByTestId("BTN_Modificar")).toBeEnabled();
    await page.route("**/api/terminals/list", async route => {
      const response = await route.fetch(); held = true; await gate; await route.fulfill({ response });
    });
    await picker.getByTestId("BTN_Modificar").click(); await expect.poll(() => held).toBe(true);
    await expect(page.getByTestId("WIN_Form_Terminais")).toHaveCount(0);
    await picker.getByTestId("BTN_Fechar").click(); await expect(picker).toHaveCount(0);
    await expect(form.getByTestId("EDT_Descricao")).toHaveValue("Cancelled picker draft");
    await form.getByTestId("BTN_Cancelar").click();
    const delivered = page.waitForResponse(response => response.url().endsWith("/api/terminals/list"));
    release(); await (await delivered).finished();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(page.getByTestId("WIN_Form_Terminais")).toHaveCount(0);
    // Probe a later opening, since a frozen earlier Postos form would hide a detached context mutation.
    await list.getByTestId("Btn_New").click(); await expect(form.getByTestId("EDT_Codigo")).not.toHaveAttribute("readonly");
    await form.getByTestId("BTN_Cancelar").click();
  } finally { release(); await page.unroute("**/api/terminals/list"); await removeOwned(request, headers, [], [terminal.id]); }
});
