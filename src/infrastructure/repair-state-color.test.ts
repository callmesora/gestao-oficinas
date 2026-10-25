import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { selectRepairStateColor } from "./repair-state-color";

beforeEach(() => {
  vi.stubGlobal("window", { crypto: globalThis.crypto });
  vi.stubGlobal("isTauri", true);
});
afterEach(() => { clearMocks(); vi.unstubAllGlobals(); });

describe("repair-state native color boundary (mocked IPC only)", () => {
  it("awaits the exact narrow command and validates a selected RGB value", async () => {
    let finish!: (result: unknown) => void;
    mockIPC((command, payload) => {
      expect(command).toBe("select_repair_state_color");
      expect(payload).toEqual({ request: { color: 0x332211 } });
      return new Promise(resolve => { finish = resolve; });
    });
    let settled = false;
    const pending = selectRepairStateColor(0x332211).finally(() => { settled = true; });
    await Promise.resolve();
    expect(settled).toBe(false);
    finish({ kind: "selected", color: 255 });
    await expect(pending).resolves.toEqual({ kind: "selected", color: 255 });
  });

  it("preserves NULL and all unsigned32 bits on cancellation", async () => {
    for (const color of [null, 0, 0x1000000, 0xffffffff]) {
      mockIPC(() => ({ kind: "cancelled", color }));
      await expect(selectRepairStateColor(color)).resolves.toEqual({ kind: "cancelled", color });
    }
  });

  it("rejects invalid requests before invoking the native boundary", async () => {
    const invoked = vi.fn();
    mockIPC(invoked);
    for (const color of [-1, 0x100000000, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      await expect(selectRepairStateColor(color)).rejects.toThrow();
    }
    expect(invoked).not.toHaveBeenCalled();
  });

  it("rejects malformed responses, high-bit selections and changed cancellation values", async () => {
    for (const result of [
      {}, { kind: "selected", color: null }, { kind: "selected", color: 0x1000000 },
      { kind: "selected", color: -1 }, { kind: "selected", color: 1.5 },
      { kind: "cancelled" }, { kind: "cancelled", color: 0 },
      { kind: "cancelled", color: null, extra: true },
    ]) {
      mockIPC(() => result);
      await expect(selectRepairStateColor(null)).rejects.toThrow();
    }
  });

  it("rejects browser use and propagates native failures without substituting a chooser", async () => {
    const invoked = vi.fn();
    mockIPC(invoked);
    vi.stubGlobal("isTauri", false);
    await expect(selectRepairStateColor(null)).rejects.toThrow("native_only");
    expect(invoked).not.toHaveBeenCalled();
    vi.stubGlobal("isTauri", true);
    mockIPC(() => { throw new Error("color_dialog_failed"); });
    await expect(selectRepairStateColor(0)).rejects.toThrow("color_dialog_failed");
  });
});
