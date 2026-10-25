import { test, expect } from "./support/repair-orders";

// Native IPC is explicitly simulated here. API/PostgreSQL/report rendering are actual paths;
// these assertions cover only the preview caller and do not prove OS save/print behavior.
test("native-output caller awaits the fixed PDF snapshot, blocks duplicate actions and retains cancellation", async ({ page, repairServer }) => {
  let renderRequests = 0;
  page.on("request", request => { if (request.url().endsWith("/api/reports/render")) renderRequests++; });
  await page.goto(`${repairServer.origin}/?workflow=repair-orders`); await page.getByTestId("repair-orders-open").click();
  const screen = page.getByTestId("WIN_Ordens_Reparacao"); await expect(screen.getByTestId("repair-order-read-state")).toHaveText("ready");
  await page.evaluate(() => {
    const state = window as unknown as { isTauri: boolean; __reportCalls: unknown[]; __finishReport: (result: unknown) => void; __TAURI_INTERNALS__: { invoke: (command: string, payload?: unknown) => Promise<unknown> } };
    state.isTauri = true; state.__reportCalls = [];
    const original = state.__TAURI_INTERNALS__.invoke;
    state.__TAURI_INTERNALS__.invoke = (command, payload) => {
      if (command !== "save_report_pdf" && command !== "print_report_pdf") return original(command, payload);
      state.__reportCalls.push({ command, payload }); return new Promise(resolve => { state.__finishReport = resolve; });
    };
  });
  const response = page.waitForResponse(value => value.url().endsWith("/api/reports/render"));
  await screen.getByTestId("BTN_Imprimir").click(); const rendered = await (await response).json(); expect(rendered.kind).toBe("rendered");
  const preview = page.locator("dialog.report-preview"), save = preview.getByTestId("report-save-pdf"), print = preview.getByTestId("report-print-pdf");
  await save.click(); await expect(save).toBeDisabled(); await expect(print).toBeDisabled(); await expect(preview.getByRole("button", { name: "Fechar", exact: true })).toBeDisabled();
  await page.keyboard.press("Escape"); await expect(preview).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __reportCalls: unknown[] }).__reportCalls)).toEqual([{ command: "save_report_pdf", payload: { request: { reportId: rendered.reportId, pdfBase64: rendered.pdfBase64 } } }]);
  await page.evaluate(() => (window as unknown as { __finishReport: (result: unknown) => void }).__finishReport({ kind: "cancelled" }));
  await expect(save).toBeEnabled(); await expect(preview.getByTestId("report-output-result")).toHaveCount(0); await expect(preview).toBeVisible();
  await print.click(); await page.evaluate(() => (window as unknown as { __finishReport: (result: unknown) => void }).__finishReport({ kind: "requested" }));
  await expect(preview.getByTestId("report-output-result")).toHaveText("Pedido de impressão enviado");
  expect(await page.evaluate(() => (window as unknown as { __reportCalls: unknown[] }).__reportCalls)).toEqual([
    { command: "save_report_pdf", payload: { request: { reportId: rendered.reportId, pdfBase64: rendered.pdfBase64 } } },
    { command: "print_report_pdf", payload: { request: { reportId: rendered.reportId, pdfBase64: rendered.pdfBase64 } } },
  ]);
  await save.click(); await page.evaluate(() => (window as unknown as { __finishReport: (result: unknown) => void }).__finishReport({ kind: "saved" }));
  await expect(preview.getByTestId("report-output-result")).toHaveText("PDF guardado");
  expect(renderRequests).toBe(1);
});

test("native-output caller never turns not-requested, malformed or rejected IPC results into printed success", async ({ page, repairServer }) => {
  await page.goto(`${repairServer.origin}/?workflow=customers`); await page.getByTestId("customers-open").click();
  await page.evaluate(() => {
    const state = window as unknown as { isTauri: boolean; __reportAnswer: unknown; __reportReject: boolean; __TAURI_INTERNALS__: { invoke: (command: string, payload?: unknown) => Promise<unknown> } };
    state.isTauri = true; state.__reportAnswer = { kind: "not_requested" }; state.__reportReject = false;
    const original = state.__TAURI_INTERNALS__.invoke;
    state.__TAURI_INTERNALS__.invoke = async (command, payload) => {
      if (command !== "print_report_pdf") return original(command, payload);
      if (state.__reportReject) throw new Error("report_print_handler_missing");
      return state.__reportAnswer;
    };
  });
  await page.getByTestId("BTN_Imprimir").click(); const preview = page.locator("dialog.report-preview"); await expect(preview).toBeVisible();
  for (const answer of [{ kind: "not_requested" }, { kind: "printed" }]) {
    await page.evaluate(value => { (window as unknown as { __reportAnswer: unknown }).__reportAnswer = value; }, answer);
    await preview.getByTestId("report-print-pdf").click(); await expect(preview.getByTestId("report-output-result")).toHaveText("Pedido não concluído");
    await expect(preview.getByRole("button", { name: "Fechar", exact: true })).toBeEnabled();
  }
  await page.evaluate(() => { (window as unknown as { __reportReject: boolean }).__reportReject = true; });
  await preview.getByTestId("report-print-pdf").click(); await expect(preview.getByTestId("report-output-result")).toHaveText("Pedido não concluído");
});
