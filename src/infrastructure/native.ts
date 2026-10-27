import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { nativeCommands, type NativeInfo, type StartupArguments } from "../bindings/native";

const nativeInfoSchema = z.object({ appVersion: z.string().min(1), platform: z.string().min(1) }).strict();
export async function readNativeInfo(): Promise<NativeInfo> {
  return nativeInfoSchema.parse(await invoke<unknown>(nativeCommands.nativeInfo));
}

const startupArgumentsSchema = z.object({ modulo: z.enum(["t", "m"]).nullable(), artigos: z.literal("1").nullable() }).strict();
export async function readStartupArguments(): Promise<StartupArguments> {
  return startupArgumentsSchema.parse(await invoke<unknown>(nativeCommands.readStartupArguments));
}
export async function terminateApplication(): Promise<void> {
  z.null().parse(await invoke<unknown>(nativeCommands.terminateApplication));
}
export async function readLocalSetupToken(): Promise<string | null> {
  return z.string().regex(/^[a-f0-9]{64}$/).nullable().parse(await invoke<unknown>(nativeCommands.localSetupToken));
}
export async function acknowledgeLocalSetup(): Promise<void> {
  if (z.boolean().parse(await invoke<unknown>(nativeCommands.ackLocalSetup)) !== true) throw new Error("local_setup_handoff_unavailable");
}
