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
