import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { MAX_SCANNER_TEXT_UNITS, readTerminalScannerFile } from "./scanner-file";

const config = { terminalCode: "T01", folder: "C:\\Synthetic d'água", filename: "scan.txt", barcodeStart: 1, barcodeLength: 4, quantityStart: 5, quantityLength: 3 };
beforeEach(() => { vi.stubGlobal("window", { crypto: globalThis.crypto }); vi.stubGlobal("isTauri", true); });
afterEach(() => { clearMocks(); vi.unstubAllGlobals(); });
it("mocked IPC sends only exact source identity and retains the explicit native decoded text", async () => {
  let resolve!: (value: unknown) => void;
  mockIPC((command, payload) => {
    expect(command).toBe("read_terminal_scanner_file");
    expect(payload).toEqual({ request: { terminalCode: "T01", sourceFolder: "C:\\Synthetic d'água", sourceFilename: "scan.txt" } });
    return new Promise(finish => { resolve = finish; });
  });
  let settled = false; const pending = readTerminalScannerFile(config).finally(() => { settled = true; });
  await Promise.resolve(); expect(settled).toBe(false); resolve({ text: "Água €  2.25\r\n\r\nretained" });
  await expect(pending).resolves.toBe("Água €  2.25\r\n\r\nretained");
});
it("missing/null/oversized identities and browser usage cannot invoke a native read", async () => {
  const invoked = vi.fn(); mockIPC(invoked);
  for (const patch of [{ terminalCode: "" }, { folder: null }, { filename: null }, { filename: "" }, { folder: "bad\0path" }, { terminalCode: "x".repeat(32768) }]) {
    await expect(readTerminalScannerFile({ ...config, ...patch })).rejects.toThrow();
  }
  vi.stubGlobal("isTauri", false); await expect(readTerminalScannerFile(config)).rejects.toThrow("native_only"); expect(invoked).not.toHaveBeenCalled();
});
it("strict bounded responses and fixed native failures never silently select a different input", async () => {
  for (const value of [{ text: "ok", localFile: "/untrusted" }, { bytes: "123" }, { text: 123 }, { text: "x".repeat(MAX_SCANNER_TEXT_UNITS + 1) }]) {
    mockIPC(() => value); await expect(readTerminalScannerFile(config)).rejects.toThrow();
  }
  for (const failure of ["scanner_file_unavailable", "scanner_file_encoding", "scanner_file_read_failed"]) {
    mockIPC(() => { throw new Error(failure); }); await expect(readTerminalScannerFile(config)).rejects.toThrow(failure);
  }
});
