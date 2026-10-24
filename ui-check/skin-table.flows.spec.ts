import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import list from "../src/ui/legacy/WIN_Table_Clientes.layout.json" with { type: "json" };

test("memo keeps multiline spaces, associates its caption and preserves independent instance state", async ({ page }) => {
  await page.goto("/?skin=controls");
  const a = page.getByTestId("skin-fixture-A"), b = page.getByTestId("skin-fixture-B");
  const memo = a.getByTestId("EDT_Observacao");
  await memo.fill("  Açores\nSegunda linha  ");
  await expect(memo).toHaveValue("  Açores\nSegunda linha  ");
  await expect(b.getByTestId("EDT_Observacao")).toHaveValue("");
  await a.locator("label").filter({ hasText: "Observaçıes" }).click();
  await expect(memo).toBeFocused();
  await a.getByTestId("BTN_SYST_MINIMIZE").click();
  await a.getByTestId("skin-reopen").click();
  await expect(a.getByTestId("EDT_Observacao")).toHaveValue("  Açores\nSegunda linha  ");
  await expect(page.getByTestId("skin-table-fixture").getByTestId("EDT_Observacao")).toHaveAttribute("readonly", "");
});

test("table delegates stable string selection and activation without inventing initial selection or sorting", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-table-fixture"), table = fixture.getByTestId("TABLE_Clientes");
  const rows = table.locator("tbody tr");
  await expect(rows).toHaveCount(2);
  await expect(table.locator('tbody tr[aria-selected="true"]')).toHaveCount(0);
  await rows.first().click();
  await expect(fixture.getByTestId("skin-selection")).toHaveText("9007199254740993");
  await expect(rows.first()).toHaveAttribute("aria-selected", "true");
  await table.press("ArrowDown");
  await expect(fixture.getByTestId("skin-selection")).toHaveText("9007199254740994");
  await table.press("Enter");
  await expect(fixture.getByTestId("skin-activation")).toHaveText("9007199254740994");
  await fixture.getByTestId("skin-reverse").click();
  await expect(rows.first()).toHaveAttribute("aria-selected", "true");
  await expect(rows.first()).toContainText("9007199254740994");
  await rows.last().dblclick();
  await expect(fixture.getByTestId("skin-activation")).toHaveText("9007199254740993");
  await table.getByTestId("COL_Codigo").getByRole("button").click();
  await expect(fixture.getByTestId("skin-sort")).toHaveText("TABLE_Clientes.COL_Codigo");
  await expect(rows.first()).toContainText("9007199254740994");
  await fixture.getByTestId("skin-empty").click();
  await expect(rows).toHaveCount(0);
  await expect(fixture.getByTestId("skin-selection")).toBeEmpty();
});

test("table and read-only memo retain source columns, bounds, captions and component visual floors", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-table-fixture"), canvas = fixture.getByTestId("skin-table-canvas");
  const table = fixture.getByTestId("TABLE_Clientes");
  const source = list.controls.find(control => control.name === "TABLE_Clientes")!;
  for (const column of source.columns!) {
    const header = table.getByTestId(column.name);
    await expect(header).toHaveText(column.title!);
    await expect(header).toHaveAttribute("data-control-path", column.path);
    await expect(header).toHaveCSS("width", `${column.width}px`);
  }
  const box = await canvas.boundingBox();
  expect(await table.boundingBox()).toEqual({ x: box!.x + source.x, y: box!.y + source.y, width: source.width, height: source.height });
  await fixture.getByTestId("skin-empty").click();
  await page.mouse.move(0, 0);
  await canvas.evaluate(async () => { await document.fonts.ready; });
  await canvas.screenshot({ path: "ui-report/skin-table.png" });
  const visual = await promisify(execFile)(process.execPath, ["scripts/py.mjs", "scripts/skin_visual_check.py", "ui-report/skin-table.png", "--fixture", "table"], { windowsHide: true });
  expect(JSON.parse(visual.stdout).passed).toBe(true);
});

test("table and memo consume the frame delta while retaining rows and controlled selection", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-table-fixture"), table = fixture.getByTestId("TABLE_Clientes"), canvas = fixture.getByTestId("skin-table-canvas");
  await table.locator("tbody tr").first().click();
  const base = (await table.boundingBox())!, memo = fixture.getByTestId("EDT_Observacao");
  const baseMemo = await memo.evaluate(element => element.parentElement!.getBoundingClientRect().toJSON() as { y: number; height: number });
  const baseCanvas = (await canvas.boundingBox())!;
  await fixture.getByTestId("skin-table-resize").check();
  const resized = (await table.boundingBox())!, resizedCanvas = (await canvas.boundingBox())!;
  expect(resized.width).toBe(base.width + 120);
  expect(resized.height).toBe(base.height + 60);
  expect(resized.x - resizedCanvas.x).toBe(base.x - baseCanvas.x);
  expect(resized.y - resizedCanvas.y).toBe(base.y - baseCanvas.y);
  const movedMemo = await memo.evaluate(element => element.parentElement!.getBoundingClientRect().toJSON() as { y: number; height: number });
  expect(movedMemo.y - resizedCanvas.y).toBe(baseMemo.y - baseCanvas.y + 60);
  expect(movedMemo.height).toBe(baseMemo.height);
  await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("9007199254740993");
  await fixture.getByTestId("skin-table-resize").uncheck();
  await expect(table).toHaveCSS("width", `${base.width}px`);
  await expect(table).toHaveCSS("height", `${base.height}px`);
  await expect(table.locator("tbody tr")).toHaveCount(2);
});

test("source-enabled column resizing updates controlled widths without sorting or selecting another row", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-table-fixture"), table = fixture.getByTestId("TABLE_Clientes"), code = table.getByTestId("COL_Codigo");
  await table.locator("tbody tr").first().click();
  const handle = code.getByTestId("COL_Codigo__resize"), box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + 2, box.y + 10); await page.mouse.down();
  await page.mouse.move(box.x + 42, box.y + 10, { steps: 4 }); await page.mouse.up();
  await expect(code).toHaveCSS("width", "120px");
  await expect(fixture.getByTestId("skin-column-widths")).toContainText('"TABLE_Clientes.COL_Codigo":120');
  await expect(fixture.getByTestId("skin-sort")).toBeEmpty();
  await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("9007199254740993");
  await handle.focus(); await page.keyboard.press("ArrowRight"); await page.keyboard.press("Shift+ArrowLeft");
  await expect(code).toHaveCSS("width", "127px");
  await expect(table.getByTestId("COL_Descricao")).toHaveCSS("width", "116px");
  await fixture.getByTestId("skin-column-lock").check();
  await expect(handle).toHaveCount(0);
  await expect(code).toHaveCSS("width", "127px");
  await fixture.getByTestId("skin-column-reset").click();
  await expect(code).toHaveCSS("width", "80px");
  await fixture.getByTestId("skin-column-lock").uncheck();
  await handle.scrollIntoViewIfNeeded();
  const reset = (await handle.boundingBox())!;
  await page.mouse.move(reset.x + 2, reset.y + 10); await page.mouse.down();
  await page.mouse.move(reset.x - 98, reset.y + 10, { steps: 4 }); await page.mouse.up();
  await expect(code).toHaveCSS("width", "24px");
  await expect(fixture.getByTestId("skin-sort")).toBeEmpty();
  await fixture.getByTestId("skin-column-reset").click();
  await expect(code).toHaveCSS("width", "80px");
});

test("movable headers reorder real cells and controlled state without losing widths or crossing source barriers", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-table-fixture"), table = fixture.getByTestId("TABLE_Clientes");
  const code = table.getByTestId("COL_Codigo"), description = table.getByTestId("COL_Descricao");
  await table.locator("tbody tr").first().click();
  await code.getByTestId("COL_Codigo__resize").focus(); await page.keyboard.press("ArrowRight");
  await code.getByRole("button").dragTo(description.getByRole("button"));
  await expect(table.locator("thead th").nth(0)).toHaveAttribute("data-testid", "COL_Descricao");
  await expect(table.locator("tbody tr").first().locator("td").nth(0)).toHaveText("  Açores  ");
  await expect(table.locator("tbody tr").first().locator("td").nth(1)).toHaveText("9007199254740993");
  await expect(code).toHaveCSS("width", "88px");
  await expect(fixture.getByTestId("skin-column-order")).toContainText('"TABLE_Clientes.COL_Descricao","TABLE_Clientes.COL_Codigo"');
  await expect(fixture.getByTestId("skin-sort")).toBeEmpty();
  await expect(table.locator('tbody tr[aria-selected="true"]')).toContainText("9007199254740993");
  await code.getByRole("button").focus(); await page.keyboard.press("Control+Shift+ArrowLeft");
  await expect(table.locator("thead th").nth(0)).toHaveAttribute("data-testid", "COL_Codigo");
  await expect(code.getByRole("button")).toBeFocused();
  for (const barrier of ["fixed", "locked"]) {
    await fixture.getByTestId("skin-column-movement").selectOption(barrier);
    await description.getByRole("button").dragTo(code.getByRole("button"));
    await expect(table.locator("thead th").nth(0)).toHaveAttribute("data-testid", "COL_Codigo");
    await description.getByRole("button").focus(); await page.keyboard.press("Control+Shift+ArrowLeft");
    await expect(table.locator("thead th").nth(0)).toHaveAttribute("data-testid", "COL_Codigo");
  }
  await fixture.getByTestId("skin-column-movement").selectOption("free");
  await code.getByRole("button").dragTo(table.getByTestId("COL_Morada1").getByRole("button"));
  await expect(description.getByRole("button")).not.toBeFocused();
  await fixture.getByTestId("skin-column-order-reset").click();
  await description.getByRole("button").focus(); await page.keyboard.press("Control+Shift+ArrowRight");
  await expect(table.locator("thead th").nth(2)).toHaveAttribute("data-testid", "COL_Descricao");
  await expect(description.getByRole("button")).toBeFocused();
  await fixture.getByTestId("skin-column-order-reset").click();
  await expect(table.locator("thead th").nth(1)).toHaveAttribute("data-testid", "COL_Descricao");
  await expect(code).toHaveCSS("width", "88px");
  await expect(fixture.getByTestId("skin-selection")).toHaveText("9007199254740993");
});

test("source-enabled saved column layout survives real reload without saving row selection or data", async ({ page }) => {
  await page.goto("/?skin=controls");
  const fixture = page.getByTestId("skin-table-fixture"), table = fixture.getByTestId("TABLE_Clientes"), code = table.getByTestId("COL_Codigo");
  const key = "gestao-oficinas:table-layout:v1:" + encodeURIComponent(`${list.window.name}/TABLE_Clientes`);
  await table.locator("tbody tr").first().click();
  await code.getByTestId("COL_Codigo__resize").focus(); await page.keyboard.press("ArrowRight");
  await code.getByRole("button").dragTo(table.getByTestId("COL_Descricao").getByRole("button"));
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "null") as { widths?: Record<string, number> } | null, key)).toMatchObject({ widths: { "TABLE_Clientes.COL_Codigo": 88 } });
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!) as Record<string, unknown>, key);
  expect(Object.keys(saved).sort()).toEqual(["order", "version", "widths"]);
  expect(JSON.stringify(saved)).not.toContain("9007199254740993");
  await page.reload();
  await expect(code).toHaveCSS("width", "88px");
  await expect(table.locator("thead th").first()).toHaveAttribute("data-testid", "COL_Descricao");
  await expect(table.locator('tbody tr[aria-selected="true"]')).toHaveCount(0);
  await expect(fixture.getByTestId("skin-sort")).toBeEmpty();
  await fixture.getByTestId("skin-column-layout-reset").click();
  await page.reload();
  await expect(code).toHaveCSS("width", "80px");
  await expect(table.locator("thead th").first()).toHaveAttribute("data-testid", "COL_Codigo");
});

test("column settings reconcile stale keys and disabled config saving never reads or overwrites them", async ({ page }) => {
  await page.goto("/?skin=controls");
  const key = "gestao-oficinas:table-layout:v1:" + encodeURIComponent(`${list.window.name}/TABLE_Clientes`);
  await page.evaluate(key => localStorage.setItem(key, "{"), key);
  await page.reload();
  const fixture = page.getByTestId("skin-table-fixture"), table = fixture.getByTestId("TABLE_Clientes"), code = table.getByTestId("COL_Codigo");
  await expect(code).toHaveCSS("width", "80px");
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe("{");
  const stale = JSON.stringify({ version: 1, widths: { stale: 999, "TABLE_Clientes.COL_Codigo": 91 }, order: ["TABLE_Clientes.COL_Descricao", "stale", "TABLE_Clientes.COL_Codigo"] });
  await page.evaluate(({ key, stale }) => localStorage.setItem(key, stale), { key, stale });
  await page.reload();
  await expect(code).toHaveCSS("width", "91px");
  await expect(table.locator("thead th").first()).toHaveAttribute("data-testid", "COL_Descricao");
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(stale);
  await fixture.getByTestId("skin-column-unsaved").click();
  await expect(code).toHaveCSS("width", "80px");
  await expect(table.locator("thead th").first()).toHaveAttribute("data-testid", "COL_Codigo");
  await code.getByTestId("COL_Codigo__resize").focus(); await page.keyboard.press("ArrowRight");
  await expect(code).toHaveCSS("width", "88px");
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(stale);
});
