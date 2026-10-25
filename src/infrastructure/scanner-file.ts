import { invoke, isTauri } from "@tauri-apps/api/core";
import { z } from "zod";
import type { ScannerConfig } from "../../packages/domain/src/stock";
import { nativeCommands, type ScannerFileRequest } from "../bindings/native";

export const MAX_SCANNER_TEXT_UNITS = 4 * 1024 * 1024;
const identity = z.string().max(32767).refine(value => !value.includes("\0"));
const requestSchema = z.object({ terminalCode: identity.min(1), sourceFolder: identity, sourceFilename: identity.min(1) }).strict();
const resultSchema = z.object({ text: z.string().max(MAX_SCANNER_TEXT_UNITS) }).strict();
export function nativeScannerFileAvailable(): boolean { return isTauri(); }

/** Source identity only. The native grant owns the host path and explicit decoder. */
export async function readTerminalScannerFile(config: ScannerConfig): Promise<string> {
  const request: ScannerFileRequest = requestSchema.parse({ terminalCode: config.terminalCode, sourceFolder: config.folder, sourceFilename: config.filename });
  if (!isTauri()) throw new Error("native_only");
  return resultSchema.parse(await invoke<unknown>(nativeCommands.readTerminalScannerFile, { request })).text;
}
