import { invoke, isTauri } from "@tauri-apps/api/core";
import { z } from "zod";
import { nativeCommands, type RepairStateColorRequest, type RepairStateColorResult } from "../bindings/native";

export type { RepairStateColorResult } from "../bindings/native";
export type RepairStateColorChooser = (color: number | null) => Promise<RepairStateColorResult>;

const rawColorSchema = z.number().int().min(0).max(0xffffffff).nullable();
const colorResultSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("selected"), color: z.number().int().min(0).max(0xffffff) }).strict(),
  z.object({ kind: z.literal("cancelled"), color: rawColorSchema }).strict(),
]);

// SRC-899177adfa / ADR-005: no browser substitute for the awaited OS chooser.
export async function selectRepairStateColor(color: number | null): Promise<RepairStateColorResult> {
  const request: RepairStateColorRequest = { color: rawColorSchema.parse(color) };
  if (!isTauri()) throw new Error("native_only");
  const result = colorResultSchema.parse(await invoke<unknown>(nativeCommands.selectRepairStateColor, { request }));
  if (result.kind === "cancelled" && result.color !== request.color) throw new Error("invalid_color_cancellation");
  return result;
}
