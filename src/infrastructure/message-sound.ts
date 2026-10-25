import { invoke, isTauri } from "@tauri-apps/api/core";
import { nativeCommands } from "../bindings/native";

/** Source sound is Windows-only. Native failure never changes the awaited dialog result. */
export async function playMessageSound(type: number): Promise<void> {
  if (!isTauri()) return;
  await invoke<void>(nativeCommands.playMessageSound, { messageType: type });
}
