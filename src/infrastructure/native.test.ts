import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { readNativeInfo } from "./native";

beforeEach(() => vi.stubGlobal("window", { crypto: globalThis.crypto }));
afterEach(() => { clearMocks(); vi.unstubAllGlobals(); });
describe("foundation native adapter contract (mocked IPC only)", () => {
  it("calls the registered command and validates its response", async () => {
    mockIPC(command => { expect(command).toBe("native_info"); return { appVersion: "0.1.0", platform: "windows" }; });
    await expect(readNativeInfo()).resolves.toEqual({ appVersion: "0.1.0", platform: "windows" });
  });
  it("rejects incomplete or unexpected data instead of treating it as native readiness", async () => {
    mockIPC(() => ({ appVersion: "0.1.0", arbitrary: true }));
    await expect(readNativeInfo()).rejects.toThrow();
  });
  it("propagates a native command failure", async () => {
    mockIPC(() => { throw new Error("native unavailable"); });
    await expect(readNativeInfo()).rejects.toThrow("native unavailable");
  });
});
