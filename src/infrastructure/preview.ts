import { mockIPC } from "@tauri-apps/api/mocks";
import { nativeCommands } from "../bindings/native";

export function installBrowserPreview(): boolean {
  if (!import.meta.env.DEV || "__TAURI_INTERNALS__" in window) return false;
  mockIPC((command) => {
    if (command === nativeCommands.nativeInfo) return { appVersion: "0.1.0", platform: "browser-preview" };
    throw new Error(`Unsupported browser-preview command: ${command}`);
  });
  return true;
}
