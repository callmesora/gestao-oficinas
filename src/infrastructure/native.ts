import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { nativeCommands, type NativeInfo } from "../bindings/native";

const nativeInfoSchema = z.object({ appVersion: z.string().min(1), platform: z.string().min(1) }).strict();
export async function readNativeInfo(): Promise<NativeInfo> {
  return nativeInfoSchema.parse(await invoke<unknown>(nativeCommands.nativeInfo));
}
