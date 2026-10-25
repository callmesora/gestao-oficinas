import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { MAX_REPORT_PDF_BASE64, printReportPdf, saveReportPdf } from "./report-output";

const request = { reportId: "RPT_inventario", pdfBase64: btoa("%PDF-1.7\nexact snapshot\n%%EOF\n") };
beforeEach(() => { vi.stubGlobal("window", { crypto: globalThis.crypto }); vi.stubGlobal("isTauri", true); });
afterEach(() => { clearMocks(); vi.unstubAllGlobals(); });
it("mocked IPC boundary awaits the fixed command and preserves the exact PDF snapshot", async () => {
  for (const [action, command, result] of [[saveReportPdf, "save_report_pdf", { kind: "saved" }], [printReportPdf, "print_report_pdf", { kind: "requested" }]] as const) {
    let finish!: (value: unknown) => void;
    mockIPC((actual, payload) => { expect(actual).toBe(command); expect(payload).toEqual({ request }); return new Promise(resolve => { finish = resolve; }); });
    let settled = false; const pending = action(request).finally(() => { settled = true; }); await Promise.resolve(); expect(settled).toBe(false);
    finish(result); await expect(pending).resolves.toEqual(result);
  }
});
it("mocked IPC retains save cancellation and the distinct not-requested print result", async () => {
  mockIPC(() => ({ kind: "cancelled" })); await expect(saveReportPdf(request)).resolves.toEqual({ kind: "cancelled" });
  mockIPC(() => ({ kind: "not_requested" })); await expect(printReportPdf(request)).resolves.toEqual({ kind: "not_requested" });
});
it("invalid IDs/base64/bounds and browser usage never invoke an OS action", async () => {
  const invoked = vi.fn(); mockIPC(invoked);
  for (const patch of [{ reportId: "../outside" }, { pdfBase64: "bad\nbase64" }, { pdfBase64: "A" }, { pdfBase64: "" }, { pdfBase64: "A".repeat(MAX_REPORT_PDF_BASE64 + 1) }, { path: "untrusted" }]) await expect(saveReportPdf({ ...request, ...patch })).rejects.toThrow();
  vi.stubGlobal("isTauri", false); await expect(printReportPdf(request)).rejects.toThrow("native_only"); expect(invoked).not.toHaveBeenCalled();
});
it("malformed/mismatched IPC results and native errors cannot become print-success claims", async () => {
  for (const value of [{ kind: "printed" }, { kind: "saved" }, { kind: "requested", path: "/untrusted" }, {}]) {
    mockIPC(() => value); await expect(printReportPdf(request)).rejects.toThrow();
  }
  mockIPC(() => ({ kind: "requested" })); await expect(saveReportPdf(request)).rejects.toThrow("invalid_report_output_result");
  mockIPC(() => { throw new Error("report_print_handler_missing"); }); await expect(printReportPdf(request)).rejects.toThrow("report_print_handler_missing");
});
