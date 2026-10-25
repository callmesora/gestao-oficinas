import { test, expect } from "./support/large-table";
import type { Locator } from "@playwright/test";

const lastId = (count: number) => String(9007199254740993n + BigInt(count - 1));
const dataRows = (table: Locator) => table.locator('tbody tr[aria-selected]');

for (const [family, name, count, height] of [
  ["articles", "TABLE_artigos", 15558, 19], ["customers", "TABLE_Clientes", 2165, 19],
  ["orders", "TABLE_QRY_select_ordens_reparacao", 15000, 30],
] as const) {
  test(`${family} large source table bounds DOM while retaining every row and exact height`, async ({ page, largeTableOrigin }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error" || message.type() === "warning") errors.push(message.text()); });
    await page.goto(`${largeTableOrigin}/large-table?family=${family}`);
    const fixture = page.getByTestId(`large-${family}`), table = fixture.getByTestId(name), rows = dataRows(table);
    await expect(rows.first()).toBeVisible();
    const metrics = await table.evaluate(element => ({ rows: element.querySelectorAll('tbody tr[aria-selected]').length,
      nodes: element.querySelectorAll("*").length, height: element.querySelector("tbody tr[aria-selected]")!.getBoundingClientRect().height,
      scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, outerHeight: element.getBoundingClientRect().height,
      headerHeight: element.querySelector("thead")!.getBoundingClientRect().height }));
    await testInfo.attach("initial-dom", { body: JSON.stringify(metrics), contentType: "application/json" });
    expect(metrics.height).toBe(height);
    expect(metrics.rows).toBeLessThan(100);
    await expect(table.locator("table")).toHaveAttribute("aria-rowcount", String(count + 1));
    expect(metrics.headerHeight).toBe(39);
    expect(metrics.scrollHeight).toBe(count * height + metrics.headerHeight);
    await fixture.getByTestId("snapshot").click();
    await expect(fixture.getByTestId("snapshot-result")).toHaveText(JSON.stringify({ count, first: "9007199254740993", last: lastId(count), selectedId: null }));
    await fixture.getByTestId("select-last").click();
    const selected = table.locator('tr[aria-selected="true"]');
    await expect(selected).toContainText(String(count));
    await expect(selected).toHaveAttribute("aria-rowindex", String(count + 1));
    const end = await table.evaluate(element => ({ scrollTop: element.scrollTop, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
    expect(end.scrollTop + end.clientHeight).toBe(end.scrollHeight);
    await table.press("ArrowUp");
    await expect(fixture.getByTestId("selection")).toHaveText(lastId(count - 1));
    await table.press("Enter");
    await expect(fixture.getByTestId("activation")).toHaveText(lastId(count - 1));
    await table.press("ArrowDown"); await table.press("ArrowDown");
    await expect(fixture.getByTestId("selection")).toHaveText(lastId(count));
    await fixture.getByTestId("reverse").click();
    await expect(selected).toHaveAttribute("aria-rowindex", "2");
    await expect.poll(() => table.evaluate(element => element.scrollTop)).toBe(0);
    await expect.poll(() => rows.count()).toBeLessThan(100);
    await fixture.getByTestId("resize").click();
    await expect(table).toHaveCSS("height", `${metrics.outerHeight + 80}px`);
    await expect(selected).toHaveAttribute("aria-rowindex", "2");
    expect(await selected.evaluate(element => element.getBoundingClientRect().height)).toBe(height);
    for (let step = 0; step < 40; step++) await table.press("ArrowDown");
    await expect(selected).toHaveAttribute("aria-rowindex", "42");
    await expect(fixture.getByTestId("selection")).toHaveText(lastId(count - 40));
    const visible = await selected.boundingBox(), viewport = await table.boundingBox();
    expect(visible!.y).toBeGreaterThanOrEqual(viewport!.y + metrics.headerHeight);
    expect(visible!.y + visible!.height).toBeLessThanOrEqual(viewport!.y + viewport!.height - 1);
    const beforePage = await table.evaluate(element => element.scrollTop);
    await table.press("PageDown");
    await expect.poll(() => table.evaluate(element => element.scrollTop)).toBeGreaterThan(beforePage);
    await expect(fixture.getByTestId("selection")).toHaveText(lastId(count - 40));
    await table.press("ArrowDown");
    await expect(selected).toHaveAttribute("aria-rowindex", "43");
    expect(errors).toEqual([]);
  });
}

test("virtual source headers retain sort, full-model prefix search, saved columns and exact selection", async ({ page, largeTableOrigin }) => {
  await page.goto(`${largeTableOrigin}/large-table?family=articles`);
  const fixture = page.getByTestId("large-articles"), table = fixture.getByTestId("TABLE_artigos");
  const code = table.getByTestId("COL_Codigo"), description = table.getByTestId("COL_Descricao");
  await code.getByTestId("COL_Codigo__search").click();
  const input = code.getByRole("textbox"); await input.fill("15558"); await input.press("Enter");
  await expect(fixture.getByTestId("selection")).toHaveText(lastId(15558));
  await expect(table.locator('tr[aria-selected="true"]')).toContainText("  articles 15558 ação d'Água  ");
  await code.getByRole("button").first().click();
  await expect(fixture.getByTestId("sort")).toHaveText("TABLE_artigos.COL_Codigo");
  await expect(table.locator('tr[aria-selected="true"]')).toHaveAttribute("aria-rowindex", "2");
  const width = (await code.boundingBox())!.width;
  await code.getByRole("separator").press("ArrowRight");
  await expect(code).toHaveCSS("width", `${width + 8}px`);
  await code.getByRole("button").first().press("Control+Shift+ArrowRight");
  await expect(table.locator("thead th").first()).toHaveAttribute("data-testid", "COL_Descricao");
  await description.click({ button: "right" });
  await table.getByRole("group", { name: "Colunas", exact: true }).getByRole("checkbox", { name: "Código", exact: true }).uncheck();
  await expect(code).toHaveCount(0);
  await table.getByRole("group", { name: "Colunas", exact: true }).press("Escape");
  await fixture.getByTestId("snapshot").click();
  await expect(fixture.getByTestId("snapshot-result")).toHaveText(JSON.stringify({ count: 15558, first: lastId(15558), last: "9007199254740993", selectedId: lastId(15558) }));
  await page.reload();
  await expect(code).toHaveCount(0);
  await expect(table.locator("thead th").first()).toHaveAttribute("data-testid", "COL_Descricao");
  await expect(table.locator('tr[aria-selected="true"]')).toHaveCount(0);
});

test("500 row boundary retains native rows and crosses virtualization in both directions without changing inputs", async ({ page, largeTableOrigin }) => {
  await page.goto(`${largeTableOrigin}/large-table?family=articles&count=500`);
  const fixture = page.getByTestId("large-articles"), table = fixture.getByTestId("TABLE_artigos");
  await expect(dataRows(table)).toHaveCount(500);
  await expect(table.locator('tbody tr[aria-hidden="true"]')).toHaveCount(0);
  await expect(table.locator("table")).not.toHaveAttribute("aria-rowcount");
  await fixture.getByTestId("select-last").click();
  await fixture.getByTestId("limit-501").click();
  await expect.poll(() => dataRows(table).count()).toBeLessThan(100);
  await expect(table.locator('tr[aria-selected="true"]')).toContainText("500");
  await table.press("ArrowDown"); await table.press("Enter");
  await expect(fixture.getByTestId("activation")).toHaveText(lastId(501));
  await fixture.getByTestId("headers").click();
  await expect(table.locator("table")).toHaveAttribute("aria-rowcount", "501");
  expect(await table.evaluate(element => element.scrollHeight)).toBe(501 * 19);
  await fixture.getByTestId("limit-500").click();
  await expect(dataRows(table)).toHaveCount(500);
  await expect(table.locator('tbody tr[aria-hidden="true"]')).toHaveCount(0);
  await expect(fixture.getByTestId("selection")).toHaveText(lastId(501));
});

test("three independent large tables keep bounded DOM, native scrolling and selection", async ({ page, largeTableOrigin }) => {
  await page.goto(`${largeTableOrigin}/large-table?family=all`);
  const articles = page.getByTestId("large-articles"), customers = page.getByTestId("large-customers"), orders = page.getByTestId("large-orders");
  await expect.poll(() => page.locator('tbody tr[aria-selected]').count()).toBeGreaterThan(20);
  await expect.poll(() => page.locator('tbody tr[aria-selected]').count()).toBeLessThan(300);
  await articles.getByTestId("select-last").click();
  await customers.getByTestId("select-last").click();
  await orders.getByTestId("select-last").click();
  await expect(articles.getByTestId("selection")).toHaveText(lastId(15558));
  await expect(customers.getByTestId("selection")).toHaveText(lastId(2165));
  await expect(orders.getByTestId("selection")).toHaveText(lastId(15000));
  const table = articles.getByTestId("TABLE_artigos");
  await table.evaluate(element => { element.scrollTop = 19 * 10000 + 7; });
  await expect.poll(() => dataRows(table).first().getAttribute("aria-rowindex")).toBe("9992");
  expect(await table.evaluate(element => element.scrollTop)).toBe(19 * 10000 + 7);
  await dataRows(table).nth(10).dblclick();
  await expect(articles.getByTestId("activation")).toHaveText(await articles.getByTestId("selection").textContent() ?? "");
});

test("an initial offscreen selection settles at the exact end after the actual header is measured", async ({ page, largeTableOrigin }) => {
  await page.goto(`${largeTableOrigin}/large-table?family=orders&selected=last`);
  const fixture = page.getByTestId("large-orders"), table = fixture.getByTestId("TABLE_QRY_select_ordens_reparacao");
  await expect(table.locator('tr[aria-selected="true"]')).toHaveAttribute("aria-rowindex", "15001");
  await expect(fixture.getByTestId("selection")).toHaveText(lastId(15000));
  await expect.poll(() => table.evaluate(element => element.scrollTop + element.clientHeight - element.scrollHeight)).toBe(0);
});

test("changed source row heights invalidate offsets, including the actual fractional material scale", async ({ page, largeTableOrigin }) => {
  await page.goto(`${largeTableOrigin}/large-table?family=articles&selected=last`);
  const fixture = page.getByTestId("large-articles"), table = fixture.getByTestId("TABLE_artigos"), selected = table.locator('tr[aria-selected="true"]');
  await expect(selected).toHaveAttribute("aria-rowindex", "15559");
  for (const [scale, requested] of [["31", 31], ["material", 31 * (680 / 600)], ["source", 19]] as const) {
    await fixture.getByRole("combobox", { name: "Altura das linhas", exact: true }).selectOption(scale);
    await expect.poll(() => selected.evaluate(element => element.getBoundingClientRect().height)).toBeCloseTo(requested, 1);
    await expect.poll(async () => table.evaluate(element => {
      const row = element.querySelector('tr[aria-selected="true"]');
      if (!row) return null;
      return Math.abs(element.scrollHeight - Math.round(15558 * row.getBoundingClientRect().height + element.querySelector("thead")!.getBoundingClientRect().height));
    })).toBe(0);
    await expect.poll(() => table.evaluate(element => element.scrollTop + element.clientHeight - element.scrollHeight)).toBe(0);
    await table.press("ArrowUp"); await table.press("Enter");
    await expect(fixture.getByTestId("activation")).toHaveText(lastId(15557));
    await table.press("ArrowDown");
    await expect(selected).toHaveAttribute("aria-rowindex", "15559");
  }
});

test("a large workspace table retains selected scroll and header draft through minimize/restore, then selects and activates another offscreen record", async ({ page, largeTableOrigin }, testInfo) => {
  await page.setViewportSize({ width: 1160, height: 1000 });
  await page.goto(`${largeTableOrigin}/large-table?workspace=1`);
  await page.getByTestId("large-workspace-open").click();
  const window = page.getByTestId("workspace-window-1"), table = window.getByTestId("TABLE_artigos");
  const selected = table.locator('tr[aria-selected="true"]');
  await table.getByTestId("COL_Codigo__search").click();
  const code = table.getByTestId("COL_Codigo").getByRole("textbox"); await code.fill("15000"); await code.press("Enter");
  await expect(selected).toHaveAttribute("aria-rowindex", "15001");
  await expect(window.getByTestId("selection")).toHaveText(lastId(15000));
  await table.getByTestId("COL_Descricao__search").click();
  const draft = table.getByTestId("COL_Descricao").getByRole("textbox"); await draft.fill("articles 15000");
  const before = await table.evaluate(element => ({ scrollTop: element.scrollTop, scrollLeft: element.scrollLeft, scrollHeight: element.scrollHeight }));
  expect(before.scrollTop).toBeGreaterThan(280000);
  await window.getByTestId("BTN_SYST_MINIMIZE").click();
  await expect(window).toBeHidden();
  await expect(page.getByTestId("workspace-window-1-task")).toContainText("minimizada");
  await page.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); });
  await page.getByTestId("workspace-window-1-task").click();
  await expect(window).toBeVisible();
  await expect(draft).toHaveValue("articles 15000");
  await testInfo.attach("restore-scroll", { body: JSON.stringify({ before, after: await table.evaluate(element => ({ scrollTop: element.scrollTop, scrollLeft: element.scrollLeft,
    scrollHeight: element.scrollHeight, clientHeight: element.clientHeight, firstIndex: element.querySelector('tr[aria-selected]')?.getAttribute("aria-rowindex") })) }), contentType: "application/json" });
  await expect(selected).toHaveAttribute("aria-rowindex", "15001");
  await expect(window.getByTestId("selection")).toHaveText(lastId(15000));
  await expect.poll(() => table.evaluate(element => ({ scrollTop: element.scrollTop, scrollLeft: element.scrollLeft, scrollHeight: element.scrollHeight }))).toEqual(before);
  await draft.press("Enter");
  await table.getByTestId("COL_Codigo__search").click();
  await code.fill("42"); await code.press("Enter");
  await expect(selected).toHaveAttribute("aria-rowindex", "43");
  await expect(window.getByTestId("selection")).toHaveText(lastId(42));
  await table.press("Enter");
  await expect(window.getByTestId("activation")).toHaveText(lastId(42));
  await expect.poll(() => dataRows(table).count()).toBeLessThan(100);
  await window.getByTestId("snapshot").click();
  await expect(window.getByTestId("snapshot-result")).toHaveText(JSON.stringify({ count: 15558, first: "9007199254740993", last: lastId(15558), selectedId: lastId(42) }));
});
