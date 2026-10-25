import { readFile } from "node:fs/promises";
import { test, expect } from "./support/repair-orders";

test("MIG13 actual repair Print uses current table order/effective filter and downloads the rendered PDF", async ({ page, repairServer }) => {
  await page.goto(`${repairServer.origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao"); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  // Exercise the actual desktop policy in Chrome; this is not a WKWebView acceptance claim.
  const policy = JSON.parse(await readFile(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8")).app.security.csp as string;
  await page.evaluate(content => { const meta = document.createElement("meta"); meta.httpEquiv = "Content-Security-Policy"; meta.content = content; document.head.append(meta); }, policy);
  const table = screen.getByTestId("TABLE_QRY_select_ordens_reparacao");
  const numberColumn = await table.getByTestId("COL_Numero").evaluate(node => Array.from(node.parentElement!.children).indexOf(node));
  const numbers = await table.locator("tbody tr").evaluateAll((rows, index) => rows.map(row => row.children[index].textContent), numberColumn);
  await screen.getByTestId("EDT_matricula").fill("DRAFT-NOT-APPLIED");
  const rendered = page.waitForResponse(response => response.url().endsWith("/api/reports/render") && response.request().method() === "POST");
  await screen.getByTestId("BTN_Imprimir").click(); const response = await rendered;
  const input = response.request().postDataJSON(); expect(input.source.kind).toBe("window-table");
  expect(input.source.filter.registration).toBe(""); expect(input.source.rows.map((row: { COL_Numero: string }) => row.COL_Numero)).toEqual(numbers);
  expect(input.source.rows.length).toBeGreaterThan(0); expect((await response.json()).kind).toBe("rendered");
  const preview = page.locator("dialog.report-preview"); await expect(preview).toBeVisible();
  await expect(preview.frameLocator("iframe").locator(".pagedjs_page").first()).toBeVisible();
  await expect(preview.frameLocator("iframe").locator("body")).toContainText(numbers[0]);
  const fonts = await preview.frameLocator("iframe").locator("body").evaluate(async node => {
    await node.ownerDocument.fonts.ready;
    return Array.from(node.ownerDocument.fonts).filter(font => font.family === "ReportSans").map(font => `${font.weight}:${font.status}`);
  });
  expect([...new Set(fonts)].sort()).toEqual(["400:loaded", "700:loaded"]);
  const downloading = page.waitForEvent("download"); await preview.getByRole("link", { name: "PDF", exact: true }).click();
  const download = await downloading, file = await download.path(); expect(file).not.toBeNull();
  expect((await readFile(file!)).subarray(0, 5).toString()).toBe("%PDF-");
  await preview.getByRole("button", { name: "Fechar", exact: true }).click(); await expect(preview).toHaveCount(0);
});

test("MIG13 actual customer Print runs its embedded query and opens the same paginated preview", async ({ page, repairServer }) => {
  await page.goto(`${repairServer.origin}/?workflow=customers`); await page.getByTestId("customers-open").click();
  const rendered = page.waitForResponse(response => response.url().endsWith("/api/reports/render") && response.request().method() === "POST");
  await page.getByTestId("BTN_Imprimir").click(); const response = await rendered;
  expect(response.request().postDataJSON().source).toEqual({ kind: "embedded-query" }); expect((await response.json()).kind).toBe("rendered");
  const preview = page.locator("dialog.report-preview"); await expect(preview).toBeVisible();
  await expect(preview.frameLocator("iframe").locator("body")).toContainText("CLIENTE RECEPÇÃO");
});
