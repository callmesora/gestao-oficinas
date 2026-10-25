import type { Locator, Page, Response } from "@playwright/test";
import { expect, test, insertSyntheticOrder } from "./support/repair-orders";

const mainTable = "TABLE_QRY_select_ordens_reparacao", stateTable = "TABLE_Estados_reparacao";
const ranges = { EDT_data_entrada_inicio: "28/02/2024 00:00", EDT_data_entrada_fim: "01/03/2024 23:59", EDT_data_entrega_inicio: "28/02/2024", EDT_data_entrega_fim: "08/03/2024" };
const broadNumbers = ["18446744073709551615", "9007199254740993", "9007199254740992", "20", "11", "10", "2"];
type OrderProjection = { numero: string | null; recepcao_datahora: string | null; recepcao_entrega_prevista: string | null; Descricao_Cliente: string | null; Descricao_Terceiro: string | null };
const listResponse = (response: Response) => response.url().endsWith("/api/repair-orders/list") && response.request().method() === "POST";

async function open(page: Page, origin: string) {
  await page.goto(`${origin}/?workflow=repair-orders`);
  await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao");
  await expect(screen).toBeVisible();
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  return screen;
}
async function settle(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}
async function refresh(page: Page, screen: Locator) {
  const response = page.waitForResponse(listResponse);
  await screen.getByTestId("BTN_Actualizar_Dados").click();
  const actual = await response;
  expect(actual.ok()).toBe(true);
  const body = await actual.json() as { kind: string; orders: OrderProjection[] };
  expect(body.kind).toBe("loaded");
  await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  return { response: actual, orders: body.orders };
}
async function bounds(page: Page, screen: Locator) {
  await screen.getByTestId("BTN_Nenhum").click();
  for (const [name, text] of Object.entries(ranges)) await screen.getByTestId(name).fill(text);
  return refresh(page, screen);
}
async function numbers(screen: Locator, expected: string[]) {
  await expect(screen.getByTestId(mainTable).locator("tbody tr td:nth-child(2)")).toHaveText(expected);
}
function orderRow(page: Page, screen: Locator, numero: string) {
  return screen.getByTestId(mainTable).getByRole("row").filter({ has: page.getByRole("cell", { name: numero, exact: true }) });
}
function state(screen: Locator, code: string) { return screen.getByRole("checkbox", { name: `Selecionar estado ${code}`, exact: true }); }
function closeFrame(page: Page) { return page.locator(".wd-workspace-window").getByTestId("BTN_SYST_FERMER").click(); }

test("RULE-W53605A-1000 actual repair list mounts with qualified39/50px color columns and original geometry", async ({ page, repairServer }) => {
  const screen = await open(page, repairServer.origin), table = screen.getByTestId(mainTable), states = screen.getByTestId(stateTable);
  await expect(table).toBeVisible(); await expect(states).toBeVisible();
  expect((await table.getByTestId("COL_imagem").boundingBox())!.width).toBe(50);
  expect((await states.locator("tbody tr").first().locator("td").last().boundingBox())!.width).toBe(39);
  await expect(states.locator("thead")).toBeHidden();
  const root = (await screen.boundingBox())!;
  for (const [locator, x, y, width, height] of [
    [table, 19, 176, 876, 403], [states, 170, 62, 293, 93],
    [screen.locator('.wd-field[data-control-path="EDT_data_entrada_inicio"]'), 24, 62, 140, 25],
    [screen.locator('.wd-field[data-control-path="EDT_data_entrega_inicio"]'), 493, 53, 127, 25],
    [screen.getByTestId("BTN_Actualizar_Dados"), 911, 61, 94, 93],
  ] as const) {
    const box = (await locator.boundingBox())!;
    expect([box.x - root.x, box.y - root.y, box.width, box.height]).toEqual([x, y, width, height]);
  }
  await expect(screen.getByTestId("repair-order-selected")).toHaveText("9007199254740993");
  await expect(screen.getByTestId("RADIO_prioridade").getByRole("radio", { name: "Todos", exact: true })).toBeChecked();
  expect(await screen.getByTestId("COMBO_mecanico").evaluate(element => (element as HTMLSelectElement).selectedIndex)).toBe(-1);
  await expect(screen.getByTestId("COMBO_mecanico").getByRole("option")).toHaveCount(2);
  const color = table.locator('tbody [data-control-path="TABLE_QRY_select_ordens_reparacao.COL_imagem.SHA_cor"]').first();
  await expect(color).toHaveCSS("width", "18px"); await expect(color).toHaveCSS("height", "18px"); await expect(color).toHaveCSS("border-radius", "50%");
  await expect(color).toHaveCSS("background-color", "rgb(255, 0, 0)");
  const stateColors = states.locator('tbody [data-control-path="TABLE_Estados_reparacao.COL_imagem.SHA_cor"]');
  await expect(stateColors.nth(0)).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(stateColors.nth(1)).toHaveCSS("background-color", "rgb(0, 255, 0)");
  await expect(table.locator("tbody tr").first().locator("td").nth(9)).toHaveText("Normal");
  await expect(table.locator("tbody tr").first().locator("td").first()).toHaveCSS("height", "30px");
  await expect(table.locator("tbody tr").first().locator("td").nth(5).locator("span")).toHaveCSS("font-weight", "700");
  for (const button of ["BTN_Novo", "BTN_Alterar", "BTN_Eliminar", "BTN_informacao", "BTN_Imprimir"]) await expect(screen.getByTestId(button)).toBeDisabled();
  await expect(page.getByTestId("WINDEVMESSAGEBOX")).toHaveCount(0);
});

test("SRC-a2f17b1885 actual four inclusive bounds retain raw17/spaced23 dates, end milliseconds and typed u64 order", async ({ page, repairServer, repairDatabase }) => {
  const screen = await open(page, repairServer.origin), result = await bounds(page, screen);
  await numbers(screen, broadNumbers);
  expect(result.orders.find(row => row.numero === "2")).toMatchObject({ recepcao_datahora: "20240228000000000", recepcao_entrega_prevista: "20240228", Descricao_Cliente: "CLIENTE RECEPÇÃO", Descricao_Terceiro: "TERCEIRO" });
  expect(result.orders.find(row => row.numero === "11")).toMatchObject({ recepcao_datahora: "2024-03-01 23:59:59.000", recepcao_entrega_prevista: "2024-03-08" });
  expect(result.orders.find(row => row.numero === "20")!.recepcao_datahora).toBe("20240229120000?");
  expect(result.orders.some(row => ["12", "13", "14", "15", "16", "17", "21", "22", "23"].includes(row.numero ?? ""))).toBe(false);
  expect((await repairDatabase.query('SELECT "recepcao_datahora" FROM app."ordem_reparacao" WHERE "numero"=12')).rows[0].recepcao_datahora).toBe("20240301235959001");
  const query = result.response.request().postDataJSON();
  expect(query).toMatchObject({ entryStart: "20240228000000", entryEnd: "20240301235959", deliveryStart: "20240228", deliveryEnd: "20240308", priority: 0, mechanic: 0, customer: "", registration: "", states: [] });
  for (const name of Object.keys(ranges)) await screen.getByTestId(name).fill("");
  await refresh(page, screen); await numbers(screen, ["18"]);
  for (const name of Object.keys(ranges)) await screen.getByTestId(name).fill(name.startsWith("EDT_data_entrada") ? "00/00/0000 00:00" : "00/00/0000");
  await refresh(page, screen); await numbers(screen, ["19"]);
});

test("SRC-a2f17b1885 explicit refresh applies uppercase SQL wildcards, priority, mechanic and reception-or-thirdparty filters", async ({ page, repairServer }) => {
  const screen = await open(page, repairServer.origin); await bounds(page, screen);
  let reads = 0; page.on("request", request => { if (request.url().endsWith("/api/repair-orders/list")) reads++; });
  await screen.getByTestId("EDT_matricula").fill("merc%spr");
  await screen.getByTestId("RADIO_prioridade").getByRole("radio", { name: "Urgente", exact: true }).click();
  await settle(page); expect(reads).toBe(0); await numbers(screen, broadNumbers);
  const filtered = await refresh(page, screen); await numbers(screen, ["11"]);
  await expect(screen.getByTestId(mainTable).locator("tbody tr td").nth(9)).toHaveText("Urgente");
  await expect(screen.getByTestId("EDT_matricula")).toHaveValue("MERC%SPR");
  expect(filtered.response.request().postDataJSON()).toMatchObject({ registration: "MERC%SPR", priority: 3 });
  await screen.getByTestId("RADIO_prioridade").getByRole("radio", { name: "Todos", exact: true }).click();
  await screen.getByTestId("EDT_matricula").fill("_"); await screen.getByTestId("COMBO_mecanico").selectOption("10");
  await refresh(page, screen); await numbers(screen, ["18446744073709551615", "11", "10"]);
  await expect(screen.getByTestId(mainTable).locator("tbody tr").first().locator("td").nth(9)).toHaveText("Elevada");
  await screen.getByTestId("BTN_VISION2").click(); await expect(screen.getByTestId("COMBO_mecanico")).toHaveValue("2");
  await refresh(page, screen); await numbers(screen, ["9007199254740993", "9007199254740992", "20", "2"]);
  await screen.getByTestId("EDT_cliente").fill("2"); await refresh(page, screen);
  await numbers(screen, ["9007199254740993", "9007199254740992", "20", "2"]);
  await screen.getByTestId("EDT_cliente").fill("3"); await refresh(page, screen); await numbers(screen, []);
  await screen.getByTestId("BTN_VISION5").click(); await screen.getByTestId("BTN_VISION3").click();
  await expect(screen.getByTestId("EDT_cliente")).toHaveValue(""); await expect(screen.getByTestId("EDT_matricula")).toHaveValue("");
  await refresh(page, screen); await numbers(screen, ["9007199254740993", "9007199254740992", "20", "2"]);
});

test("SRC-9d8aee9401 SRC-f28ab396c9 All and None edit checked-state drafts without refreshing or writing", async ({ page, repairServer, repairDatabase }) => {
  const screen = await open(page, repairServer.origin); await bounds(page, screen);
  const original = (await repairDatabase.query('SELECT to_jsonb(s)::text AS row FROM app."estados_reparacao" s ORDER BY _row_id')).rows;
  let reads = 0; page.on("request", request => { if (request.url().endsWith("/api/repair-orders/list")) reads++; });
  await screen.getByTestId("BTN_Todos").click(); await settle(page); expect(reads).toBe(0);
  for (const code of ["R", "X", "N", ""]) await expect(state(screen, code)).toHaveAttribute("aria-checked", "true");
  await numbers(screen, broadNumbers);
  const all = await refresh(page, screen); expect(all.response.request().postDataJSON().states).toEqual(["R", "X", "N", null]); await numbers(screen, broadNumbers);
  await screen.getByTestId("BTN_Nenhum").click(); await state(screen, "X").click();
  await refresh(page, screen); await numbers(screen, ["18446744073709551615", "10"]);
  await screen.getByTestId("BTN_Nenhum").click(); await refresh(page, screen); await numbers(screen, broadNumbers);
  expect((await repairDatabase.query('SELECT to_jsonb(s)::text AS row FROM app."estados_reparacao" s ORDER BY _row_id')).rows).toEqual(original);
});

test("SRC-974f184730 SRC-6ce4e35c9d Gravar changes only current flags and Defa reloads them while retaining selected state", async ({ page, repairServer, repairDatabase }) => {
  const screen = await open(page, repairServer.origin);
  await repairDatabase.query(`UPDATE app."estados_reparacao" SET "Descricao"='CURRENT X',"confirmacao"=false WHERE "Codigo"='X'`);
  const before = (await repairDatabase.query('SELECT to_jsonb(s) AS row FROM app."estados_reparacao" s ORDER BY _row_id')).rows;
  const save = async () => {
    const saved = page.waitForResponse(response => response.url().endsWith("/api/repair-orders/save-defaults")), read = page.waitForResponse(listResponse);
    await screen.getByTestId("BTN_Gravar").click(); expect((await (await saved).json()).kind).toBe("saved"); await read;
    await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  };
  await save();
  expect((await repairDatabase.query('SELECT to_jsonb(s) AS row FROM app."estados_reparacao" s ORDER BY _row_id')).rows).toEqual(before);
  await state(screen, "R").click(); await state(screen, "X").click(); await save();
  const after = (await repairDatabase.query('SELECT to_jsonb(s) AS row FROM app."estados_reparacao" s ORDER BY _row_id')).rows;
  expect(after).toEqual(before.map((entry, index) => ({ row: { ...entry.row, lancar_defa: index === 0 ? false : index === 1 ? true : entry.row.lancar_defa } })));
  await expect(state(screen, "X").locator("xpath=ancestor::tr")).toHaveAttribute("aria-selected", "true");
  await screen.getByTestId("BTN_Todos").click();
  const reloaded = page.waitForResponse(listResponse); await screen.getByTestId("BTN_Todos1").click(); await reloaded;
  await expect(state(screen, "R")).toHaveAttribute("aria-checked", "false"); await expect(state(screen, "X")).toHaveAttribute("aria-checked", "true");
  await expect(state(screen, "N")).toHaveAttribute("aria-checked", "false");
  await expect(state(screen, "X").locator("xpath=ancestor::tr")).toHaveAttribute("aria-selected", "true");
  await expect(screen.getByTestId(stateTable)).toContainText("CURRENT X");
});

test("ADR-006 delayed real Defa reload disables all four date text/calendar adapters until its frozen draft is returned", async ({ page, repairServer }) => {
  const screen = await open(page, repairServer.origin); await bounds(page, screen);
  const before: Record<string, string> = {};
  for (const name of Object.keys(ranges)) before[name] = await screen.getByTestId(name).inputValue();
  let release!: () => void, fetched!: () => void, completed!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), actualFetched = new Promise<void>(resolve => { fetched = resolve; }), fulfilled = new Promise<void>(resolve => { completed = resolve; });
  await page.route("**/api/repair-orders/initialise", async route => {
    try { const response = await route.fetch(); expect((await response.json()).kind).toBe("loaded"); fetched(); await gate; await route.fulfill({ response }); }
    finally { completed(); }
  });
  try {
    const read = page.waitForResponse(listResponse);
    await screen.getByTestId("BTN_Todos1").click(); await actualFetched;
    for (const [name, value] of Object.entries(before)) {
      await expect(screen.getByTestId(name)).toBeDisabled();
      await expect(screen.getByTestId(`${name}__calendar`)).toBeDisabled();
      await expect(screen.getByTestId(`${name}__calendar-input`)).toBeDisabled();
      await expect(screen.getByTestId(name)).toHaveValue(value);
    }
    release(); await fulfilled; await read;
    for (const [name, value] of Object.entries(before)) {
      await expect(screen.getByTestId(name)).toBeEnabled();
      await expect(screen.getByTestId(`${name}__calendar`)).toBeEnabled();
      await expect(screen.getByTestId(`${name}__calendar-input`)).toBeEnabled();
      await expect(screen.getByTestId(name)).toHaveValue(value);
    }
  } finally { release(); await page.unroute("**/api/repair-orders/initialise"); }
});

test("SRC-a2f17b1885 refresh seeks exact prior numero then falls back last; manual numeric sort never rewrites the effective filter", async ({ page, repairServer, repairDatabase }) => {
  const screen = await open(page, repairServer.origin); await bounds(page, screen);
  await orderRow(page, screen, "10").click(); await refresh(page, screen);
  await expect(screen.getByTestId("repair-order-selected")).toHaveText("10");
  await repairDatabase.query('DELETE FROM app."ordem_reparacao" WHERE "numero"=10'); await refresh(page, screen);
  await expect(screen.getByTestId("repair-order-selected")).toHaveText("2");
  await screen.getByTestId("EDT_matricula").fill("UNAPPLIED");
  const sorted = page.waitForResponse(listResponse); await screen.getByTestId(mainTable).getByTestId("COL_Numero").getByRole("button", { name: "Número", exact: true }).click();
  const response = await sorted; expect(response.request().postDataJSON().registration).toBe("");
  await numbers(screen, ["2", "11", "20", "9007199254740992", "9007199254740993", "18446744073709551615"]);
  await screen.getByTestId("EDT_matricula").fill(""); await refresh(page, screen);
  await numbers(screen, broadNumbers.filter(numero => numero !== "10"));
  await screen.getByTestId("EDT_matricula").fill("NO_MATCH"); await refresh(page, screen); await numbers(screen, []);
  await expect(screen.getByTestId("repair-order-selected")).toHaveText("");
});

for (const obsoleteFailure of [false, true]) test(`ADR-006 obsolete real ${obsoleteFailure ? "transport failure" : "list response"} cannot overwrite the newest repair query`, async ({ page, repairServer }) => {
  const screen = await open(page, repairServer.origin); await bounds(page, screen);
  let release!: () => void, fetched!: () => void, finished!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), oldFetched = new Promise<void>(resolve => { fetched = resolve; }), oldFinished = new Promise<void>(resolve => { finished = resolve; });
  await page.route("**/api/repair-orders/list", async route => {
    if (route.request().postDataJSON().registration !== "AA") { await route.continue(); return; }
    try { const response = await route.fetch(); fetched(); await gate; if (obsoleteFailure) await route.abort("failed"); else await route.fulfill({ response }); }
    finally { finished(); }
  });
  try {
    await screen.getByTestId("EDT_matricula").fill("aa"); await screen.getByTestId("BTN_Actualizar_Dados").click(); await oldFetched;
    await screen.getByTestId("EDT_matricula").fill("bb"); await refresh(page, screen); await numbers(screen, ["18446744073709551615", "10"]);
    release(); await oldFinished; await settle(page);
    await numbers(screen, ["18446744073709551615", "10"]); await expect(screen.getByTestId("repair-order-diagnostic")).toHaveCount(0);
    await expect(screen.getByTestId("EDT_matricula")).toHaveValue("BB");
  } finally { release(); await page.unroute("**/api/repair-orders/list"); }
});

test("ADR-002/003 trusted real DateTime calendar selection preserves hidden59, while Date8 delivery shares the same adapter", async ({ page, repairServer }) => {
  const screen = await open(page, repairServer.origin); await bounds(page, screen);
  const field = screen.getByTestId("EDT_data_entrada_fim"), adapter = screen.getByTestId("EDT_data_entrada_fim__calendar-input");
  await field.fill("28/02/2024 23:59");
  await adapter.evaluate(element => {
    const events: { value: string; trusted: boolean }[] = [];
    (window as unknown as { repairCalendarEvents: typeof events }).repairCalendarEvents = events;
    element.addEventListener("input", event => events.push({ value: (event.target as HTMLInputElement).value, trusted: event.isTrusted }), { passive: true });
  });
  await screen.getByTestId("EDT_data_entrada_fim__calendar").click(); await expect(adapter).toBeFocused();
  // This actual popup selection uses no fill/value assignment/event dispatch/showPicker replacement.
  await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter"); await expect(adapter).toHaveValue("2024-02-29");
  expect(await page.evaluate(() => (window as unknown as { repairCalendarEvents: { value: string; trusted: boolean }[] }).repairCalendarEvents.some(event => event.trusted && event.value === "2024-02-29"))).toBe(true);
  await adapter.press("Escape"); if (await adapter.isVisible()) await adapter.press("Escape");
  await expect(field).toHaveValue("29/02/2024 23:59");
  const actual = await refresh(page, screen); expect(actual.response.request().postDataJSON().entryEnd).toBe("20240229235959");
  await screen.getByTestId("EDT_data_entrega_fim").fill("28/02/2024");
  const delivery = screen.getByTestId("EDT_data_entrega_fim__calendar-input");
  await screen.getByTestId("EDT_data_entrega_fim__calendar").click(); await page.keyboard.press("ArrowRight"); await page.keyboard.press("Enter");
  await expect(delivery).toHaveValue("2024-02-29"); await delivery.press("Escape"); if (await delivery.isVisible()) await delivery.press("Escape");
  await expect(screen.getByTestId("EDT_data_entrega_fim")).toHaveValue("29/02/2024");
  const both = await refresh(page, screen); expect(both.response.request().postDataJSON()).toMatchObject({ entryEnd: "20240229235959", deliveryEnd: "20240229" });
});

test("ADR-003 timer skips actual invalid native segments without focus theft and stops with the repair window", async ({ page, repairServer }) => {
  await page.addInitScript(() => Object.defineProperty(HTMLInputElement.prototype, "showPicker", { configurable: true, value: undefined }));
  await page.clock.install({ time: new Date(2026, 9, 25, 12, 0, 0) });
  const screen = await open(page, repairServer.origin); await bounds(page, screen);
  let reads = 0; page.on("request", request => { if (request.url().endsWith("/api/repair-orders/list")) reads++; });
  const adapter = screen.getByTestId("EDT_data_entrada_fim__calendar-input");
  await screen.getByTestId("EDT_data_entrada_fim__calendar").click(); await adapter.fill("");
  for (let index = 0; index < 4; index++) await adapter.press("ArrowLeft"); await adapter.pressSequentially("02");
  expect(await adapter.evaluate(element => (element as HTMLInputElement).validity.badInput)).toBe(true);
  await page.clock.runFor(60000); await expect(adapter).toBeFocused(); expect(reads).toBe(0);
  expect(await adapter.evaluate(element => (element as HTMLInputElement).validity.badInput)).toBe(true);
  await screen.getByTestId("BTN_Actualizar_Dados").click(); await expect(adapter).toBeFocused(); await expect(adapter).toHaveAttribute("aria-invalid", "true"); expect(reads).toBe(0);
  await adapter.press("Escape"); await screen.getByTestId("EDT_data_entrada_fim").fill(ranges.EDT_data_entrada_fim);
  const timer = page.waitForResponse(listResponse); await page.clock.runFor(60000); await timer;
  expect(reads).toBe(1); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await closeFrame(page); await expect(screen).toHaveCount(0);
  await page.clock.runFor(120000); expect(reads).toBe(1);
});

test("SRC-535e80e403 SRC-b1f760ae86 SRC-3baa432795 real nested pickers assign filters, preserve cancellation and never imply refresh", async ({ page, repairServer }) => {
  const screen = await open(page, repairServer.origin); await bounds(page, screen);
  let reads = 0; page.on("request", request => { if (request.url().endsWith("/api/repair-orders/list")) reads++; });
  await screen.getByTestId("EDT_matricula").fill("origin"); await screen.getByTestId("BTN_VISION1").click();
  const vehicle = page.getByTestId("vehicle-picker"); await expect(vehicle.getByTestId("BTN_selecionar")).toBeEnabled();
  await vehicle.getByTestId("BTN_SYST_FERMER").click(); await expect(vehicle).toHaveCount(0); await expect(screen.getByTestId("EDT_matricula")).toHaveValue("origin");
  await screen.getByTestId("BTN_VISION1").click(); await expect(vehicle.getByTestId("BTN_selecionar")).toBeEnabled();
  await vehicle.getByTestId("TABLE_Viaturas").getByRole("row").filter({ hasText: "AA-00-AA" }).dblclick();
  await expect(vehicle).toHaveCount(0); await expect(screen.getByTestId("EDT_matricula")).toHaveValue("AA-00-AA");
  await screen.getByTestId("EDT_cliente").fill("3"); await screen.getByTestId("BTN_VISION4").click();
  const customer = page.getByTestId("customer-picker"); await expect(customer.getByTestId("BTN_selecionar")).toBeEnabled();
  await customer.getByTestId("BTN_Fechar").click(); await expect(customer).toHaveCount(0); await expect(screen.getByTestId("EDT_cliente")).toHaveValue("3");
  await screen.getByTestId("BTN_VISION4").click(); await expect(customer.getByTestId("BTN_selecionar")).toBeEnabled();
  await customer.getByTestId("TABLE_Clientes").getByRole("row").filter({ hasText: "CLIENTE RECEPÇÃO" }).dblclick();
  await expect(customer).toHaveCount(0); await expect(screen.getByTestId("EDT_cliente")).toHaveValue("1");
  await screen.getByTestId("BTN_VISION").click(); const mechanic = page.getByTestId("mechanic-picker");
  await expect(mechanic.getByTestId("BTN_selecionar")).toBeEnabled(); await mechanic.getByTestId("BTN_Fechar").click();
  await expect(mechanic).toHaveCount(0); expect(await screen.getByTestId("COMBO_mecanico").evaluate(element => (element as HTMLSelectElement).selectedIndex)).toBe(-1);
  await screen.getByTestId("BTN_VISION").click(); await expect(mechanic.getByTestId("BTN_selecionar")).toBeEnabled();
  await mechanic.getByTestId("TABLE_mecanicos").getByRole("row").filter({ hasText: "ANA" }).dblclick();
  await expect(mechanic).toHaveCount(0); await expect(screen.getByTestId("COMBO_mecanico")).toHaveValue("2");
  await settle(page); expect(reads).toBe(0); await numbers(screen, broadNumbers); await expect(screen).toBeVisible();
  await refresh(page, screen); await numbers(screen, ["9007199254740993", "9007199254740992", "20", "2"]);
});

test("ADR-006 closing a vehicle picker while its real check-delete response is delayed cannot create a detached dialog", async ({ page, repairServer, repairDatabase }) => {
  const screen = await open(page, repairServer.origin); await bounds(page, screen); await screen.getByTestId("EDT_matricula").fill("KEEP-DRAFT");
  await screen.getByTestId("BTN_VISION1").click(); const picker = page.getByTestId("vehicle-picker");
  await expect(picker.getByTestId("BTN_Delete")).toBeEnabled(); await picker.getByTestId("TABLE_Viaturas").getByRole("row").filter({ hasText: "DELETE-ME" }).click();
  let release!: () => void, fetched!: () => void, completed!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; }), actualFetched = new Promise<void>(resolve => { fetched = resolve; }), fulfilled = new Promise<void>(resolve => { completed = resolve; });
  let deletes = 0; page.on("request", request => { if (request.url().endsWith("/api/vehicles/delete")) deletes++; });
  await page.route("**/api/vehicles/check-delete", async route => {
    try { const response = await route.fetch(); expect((await response.json()).kind).toBe("ready"); fetched(); await gate; await route.fulfill({ response }); }
    finally { completed(); }
  });
  try {
    await picker.getByTestId("BTN_Delete").click(); await actualFetched;
    await picker.getByTestId("BTN_SYST_FERMER").click(); await expect(picker).toHaveCount(0);
    release(); await fulfilled; await settle(page);
    await expect(page.getByTestId("WINDEVDIALOGBOX")).toHaveCount(0); await expect(page.getByTestId("WINDEVMESSAGEBOX")).toHaveCount(0);
    await expect(screen).toBeVisible(); await expect(screen.getByTestId("EDT_matricula")).toHaveValue("KEEP-DRAFT");
    expect(deletes).toBe(0); expect((await repairDatabase.query('SELECT count(*)::int AS count FROM app."Viaturas" WHERE "matricula"=$1', ["DELETE-ME"])).rows[0].count).toBe(1);
    await screen.getByTestId("EDT_cliente").fill("2"); await expect(screen.getByTestId("EDT_cliente")).toHaveValue("2");
  } finally { release(); await page.unroute("**/api/vehicles/check-delete"); }
});

test("ADR-012/013 real repair table headers preserve source scrollbar, resizing and saved column settings", async ({ page, repairServer, repairDatabase }) => {
  for (let index = 100; index < 125; index++) await insertSyntheticOrder(repairDatabase, { numero: String(index) });
  const screen = await open(page, repairServer.origin); await bounds(page, screen); const table = screen.getByTestId(mainTable);
  await expect(table).toHaveCSS("overflow-y", "scroll"); await expect(table).toHaveCSS("overflow-x", "auto"); await expect(table).toHaveCSS("touch-action", "none");
  const header = table.getByTestId("COL_Numero"); expect((await header.boundingBox())!.width).toBe(80);
  await header.getByRole("separator").press("ArrowRight"); expect((await header.boundingBox())!.width).toBe(88);
  await header.click({ button: "right" }); await table.getByRole("checkbox", { name: "Número", exact: true }).uncheck(); await expect(header).toHaveCount(0);
  await closeFrame(page); await page.getByTestId("repair-orders-open").click(); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await expect(header).toHaveCount(0); await table.getByRole("button", { name: "Colunas", exact: true }).click();
  await table.getByRole("checkbox", { name: "Número", exact: true }).check(); expect((await header.boundingBox())!.width).toBe(88);
  await table.getByRole("button", { name: "Repor", exact: true }).click(); expect((await header.boundingBox())!.width).toBe(80);
  await table.focus(); await table.evaluate(element => { element.scrollTop = 7; }); expect(await table.evaluate(element => element.scrollTop)).toBe(7);
  const key = "gestao-oficinas:table-layout:v1:" + encodeURIComponent("WIN_Ordens_Reparacao/TABLE_QRY_select_ordens_reparacao");
  expect(await page.evaluate(key => Object.keys(JSON.parse(localStorage.getItem(key)!) as object).sort(), key)).toEqual(["order", "version", "widths"]);
});
