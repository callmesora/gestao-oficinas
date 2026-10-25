import { invoke, isTauri } from "@tauri-apps/api/core";
import { z } from "zod";
import { nativeCommands, type TerminalFolderRequest } from "../bindings/native";

export async function selectTerminalFolder(initialDirectory: string): Promise<string> {
  if (!isTauri()) throw new Error("native_only");
  const request: TerminalFolderRequest = { initialDirectory };
  return z.string().parse(await invoke<unknown>(nativeCommands.selectTerminalFolder, { request }));
}
