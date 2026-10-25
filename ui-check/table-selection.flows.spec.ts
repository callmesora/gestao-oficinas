import { expect, test, type APIRequestContext, type Locator, type Page, type Route } from "@playwright/test";
import type { DocumentTypeValues } from "../packages/domain/src/document-types";
import type { RepairStateValues } from "../packages/domain/src/repair-states";

const workflows = [
  { resource: "repair-states", screen: "WIN_Table_estados_reparacao", table: "TABLE_estados_reparacao", open: "repair-states-open",
    rows: "repairStates", row: "repairState", diagnostic: "repair-state-list-diagnostic",
    values: (Codigo: string, Descricao: string): RepairStateValues => ({ Codigo, Descricao, tipo: 1, Cor: 0, lancar_defa: false, lancar_material: false, confirmacao: false, pedir_data_entrega: false, pedir_data_pag: false }) },
  { resource: "document-types", screen: "WIN_Table_documentos", table: "TABLE_documentos", open: "document-types-open",
    rows: "documentTypes", row: "documentType", diagnostic: "document-type-list-diagnostic",
    values: (Codigo: string, Descricao: string): DocumentTypeValues => ({ Codigo, Descricao, stock: 1, obriga_macanico: false }) },
] as const;
type Workflow = typeof workflows[number];
type Headers = { Authorization: string };
type Row = { id: string; Codigo: string | null };

async function session(request: APIRequestContext): Promise<Headers> {
  const result = await request.post("/api/development/session", { headers: { Origin: "http://localhost:1431", "X-Isolated-Development": "1" } });
  expect(result.ok()).toBe(true); return { Authorization: `Bearer ${(await result.json()).token}` };
}
async function api(request: APIRequestContext, headers: Headers, workflow: Workflow, operation: string, data: unknown): Promise<Record<string, unknown>> {
  const result = await request.post(`/api/${workflow.resource}/${operation}`, { headers, data });
  expect(result.ok()).toBe(true); return result.json() as Promise<Record<string, unknown>>;
}
async function rows(request: APIRequestContext, headers: Headers, workflow: Workflow): Promise<Row[]> {
  const result = await api(request, headers, workflow, "list", {}); expect(result.kind).toBe("loaded"); return result[workflow.rows] as Row[];
}
async function create(request: APIRequestContext, headers: Headers, workflow: Workflow, code: string, description: string): Promise<Row> {
  const result = await api(request, headers, workflow, "save", { mode: "create", values: workflow.values(code, description) });
  expect(result.kind).toBe("saved"); return result[workflow.row] as Row;
}
const rowFor = (page: Page, table: Locator, code: string) => table.getByRole("row").filter({ has: page.getByRole("cell", { name: code, exact: true }) });
async function codesIn(table: Locator) {
  return (await table.locator("tbody tr").evaluateAll(elements => elements.map(row => row.querySelector("td")?.textContent ?? ""))).sort();
}
async function rendered(page: Page) {
  // A completed response precedes fetch's React update; wait for rendered frames, never an arbitrary timeout.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

for (const workflow of workflows) test(`MIG-7C4 ${workflow.resource} preserves explicit selection and newest real read over obsolete snapshots/failures`, async ({ page, request }) => {
  const headers = await session(request), used = new Set((await rows(request, headers, workflow)).map(row => row.Codigo));
  const available = Array.from({ length: 1296 }, (_, index) => "Y" + index.toString(36).padStart(2, "0")).filter(code => !used.has(code));
  expect(available.length).toBeGreaterThanOrEqual(3);
  const owned: string[] = [], marker = `C4 ${Date.now()}`, pattern = `**/api/${workflow.resource}/list`;
  type Held = { fetched: boolean; snapshot: Row[]; release: () => void; done: Promise<void> };
  const held: Held[] = [];
  let delivery: "pass" | "hold" | "fail" | "hold-failure" = "pass";
  const handler = async (route: Route) => {
    const action = delivery;
    if (action === "pass") { await route.continue(); return; }
    let release = () => {}, completed = () => {};
    const gate = new Promise<void>(resolve => { release = resolve; }), done = new Promise<void>(resolve => { completed = resolve; });
    const read: Held = { fetched: false, snapshot: [], release, done };
    // Register before fetching so finally can release even a still-running genuine request.
    held.push(read);
    try {
      const response = await route.fetch(); expect(response.ok()).toBe(true);
      const result = await response.json() as Record<string, unknown>; expect(result.kind).toBe("loaded");
      read.snapshot = result[workflow.rows] as Row[]; read.fetched = true;
      if (action !== "fail") await gate;
      if (action === "fail" || action === "hold-failure") await route.abort("failed");
      else await route.fulfill({ response });
    } finally { completed(); }
  };
  const listResponse = () => page.waitForResponse(response => response.url().endsWith(`/api/${workflow.resource}/list`));
  const failedRequest = () => page.waitForEvent("requestfailed", item => item.url().endsWith(`/api/${workflow.resource}/list`));
  try {
    const first = await create(request, headers, workflow, available[0], `${marker} first`), second = await create(request, headers, workflow, available[1], `${marker} second`);
    owned.push(first.id, second.id);
    await page.goto(`/?workflow=${workflow.resource}`); await page.getByTestId(workflow.open).click();
    const list = page.getByTestId(workflow.screen), table = list.getByTestId(workflow.table), ready = list.getByTestId("Btn_New"), diagnostic = list.getByTestId(workflow.diagnostic);
    await expect(ready).toBeEnabled(); await expect(table.locator("tbody tr")).toHaveCount((await rows(request, headers, workflow)).length);
    await expect(table.locator('tr[aria-selected="true"]')).toHaveCount(0);
    const originalCodes = await codesIn(table);
    await rowFor(page, table, available[1]).click();
    await table.getByTestId("COL_Descricao__search").click(); const search = table.getByRole("textbox");
    const unmatched = listResponse(); await search.fill(`${marker} absent`); await (await unmatched).finished(); await expect(ready).toBeEnabled();
    await expect(rowFor(page, table, available[1])).toHaveAttribute("aria-selected", "true"); expect(await codesIn(table)).toEqual(originalCodes);
    await search.fill(""); await search.press("Enter");
    const sorted = listResponse(); await table.getByTestId("COL_Codigo").getByRole("button").first().click(); await (await sorted).finished(); await expect(ready).toBeEnabled();
    await expect(rowFor(page, table, available[1])).toHaveAttribute("aria-selected", "true"); expect(await codesIn(table)).toEqual(originalCodes);

    // Both effects are already mounted; every request entering a hold phase is retained, including any replay.
    await page.route(pattern, handler); await table.getByTestId("COL_Descricao__search").click();
    delivery = "hold"; await search.fill(`${marker} first`);
    await expect.poll(() => held.filter(read => read.fetched).length).toBeGreaterThan(0);
    const olderSuccess = [...held];
    for (const read of olderSuccess) expect(read.snapshot.some(row => row.Codigo === available[2])).toBe(false);
    const third = await create(request, headers, workflow, available[2], `${marker} third`); owned.push(third.id);
    delivery = "pass";
    const newest = listResponse(); await search.fill(`${marker} third`); await (await newest).finished(); await expect(ready).toBeEnabled();
    await expect(rowFor(page, table, available[2])).toHaveAttribute("aria-selected", "true");
    const newestCodes = await codesIn(table); expect(newestCodes).toEqual([...originalCodes, available[2]].sort());
    const obsolete = listResponse(); for (const read of olderSuccess) read.release(); await (await obsolete).finished(); await Promise.all(olderSuccess.map(read => read.done)); await rendered(page);
    await expect(rowFor(page, table, available[2])).toHaveAttribute("aria-selected", "true"); expect(await codesIn(table)).toEqual(newestCodes); await expect(diagnostic).toHaveCount(0);

    // Positive control: a genuine current read delivered as a transport failure must expose its diagnostic.
    delivery = "fail"; const activeFailure = failedRequest(); await search.fill(`${marker} active failure`); await activeFailure;
    await expect(diagnostic).toHaveText("transport");
    delivery = "pass"; const recovered = listResponse(); await search.fill(`${marker} third`); await (await recovered).finished(); await expect(ready).toBeEnabled(); await expect(diagnostic).toHaveCount(0);

    const earlierCount = held.length; delivery = "hold-failure"; await search.fill(`${marker} obsolete failure`);
    await expect.poll(() => held.slice(earlierCount).filter(read => read.fetched).length).toBeGreaterThan(0);
    const olderFailures = held.slice(earlierCount); delivery = "pass";
    const current = listResponse(); await search.fill(`${marker} third`); await (await current).finished(); await expect(ready).toBeEnabled();
    await expect(rowFor(page, table, available[2])).toHaveAttribute("aria-selected", "true"); await expect(diagnostic).toHaveCount(0);
    const staleFailure = failedRequest(); for (const read of olderFailures) read.release(); await staleFailure; await Promise.all(olderFailures.map(read => read.done)); await rendered(page);
    await expect(diagnostic).toHaveCount(0); await expect(rowFor(page, table, available[2])).toHaveAttribute("aria-selected", "true"); expect(await codesIn(table)).toEqual(newestCodes);
  } finally {
    delivery = "pass"; for (const read of held) read.release(); await Promise.all(held.map(read => read.done)); await page.unroute(pattern, handler);
    for (const id of owned) await request.post(`/api/${workflow.resource}/delete`, { headers, data: { id } });
  }
});
