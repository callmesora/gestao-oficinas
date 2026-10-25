import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { readNativeInfo, readStartupArguments, terminateApplication } from "./native";

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

describe("startup native adapter contracts (mocked IPC only)", () => {
  it("returns only validated source mode values through the registered command", async () => {
    mockIPC(command => { expect(command).toBe("read_startup_arguments"); return { modulo: "m", artigos: "1" }; });
    await expect(readStartupArguments()).resolves.toEqual({ modulo: "m", artigos: "1" });
    mockIPC(() => ({ modulo: null, artigos: null }));
    await expect(readStartupArguments()).resolves.toEqual({ modulo: null, artigos: null });
  });
  it("rejects raw argv, unsupported modes and incomplete responses", async () => {
    for (const value of [{ modulo: "other", artigos: null }, { modulo: null }, { modulo: null, artigos: null, argv: [] }]) {
      mockIPC(() => value); await expect(readStartupArguments()).rejects.toThrow();
    }
  });
  it("requests only fixed application termination and propagates native errors", async () => {
    mockIPC((command, payload) => { expect(command).toBe("terminate_application"); expect(payload).toEqual({}); return null; });
    await expect(terminateApplication()).resolves.toBeUndefined();
    mockIPC(() => { throw new Error("exit unavailable"); });
    await expect(terminateApplication()).rejects.toThrow("exit unavailable");
  });
});
