import { z } from "zod";
import type { UserListRow } from "./users";

const u64 = z.string().regex(/^[0-9]+(?![\s\S])/).refine(value => BigInt(value) <= 18446744073709551615n);
export const systemValuesSchema = z.strictObject({ Tempo_ordem_reparacao: u64.nullable(), Tempo_materiais: u64.nullable(), Tempo_tempos: u64.nullable(), Data_inicio: z.number().int().min(-2147483648).max(2147483647).nullable(), encerrar_tempos1: z.string().nullable(), encerrar_tempos2: z.string().nullable() });
export type SystemValues = z.infer<typeof systemValuesSchema>;
export type SystemRecord = SystemValues & { id: string };
export const systemDefaults: SystemValues = { Tempo_ordem_reparacao: "15", Tempo_materiais: "15", Tempo_tempos: "15", Data_inicio: 7, encerrar_tempos1: "030000", encerrar_tempos2: "030000" };
export type SystemReadResult = { kind: "loaded"; system: SystemRecord | null } | { kind: "invalid" | "failed" };
export type SystemSaveResult = { kind: "saved"; system: SystemRecord } | { kind: "invalid" | "failed" };
export const accessSchema = z.strictObject({ code: z.number().int().min(0).max(255), password: z.string().max(15) });
export type AccessCommand = z.infer<typeof accessSchema>;
export type AccessResult = { kind: "continuar"; user: UserListRow } | { kind: "incorrect"; message: string } | { kind: "missing" | "invalid" | "failed" };
export type StartupResult = { kind: "ready"; system: SystemRecord; bootstrapRequired: boolean } | { kind: "invalid" | "failed" };
export type LaunchMode = "menu" | "articles" | "labor" | "materials";
// WIN_MENU952–975: modulo routes after the artigos presentation transformation.
export function startupLaunchMode(input: { modulo: string | null; artigos: string | null }): LaunchMode {
  return input.modulo === "t" ? "labor" : input.modulo === "m" ? "materials" : input.artigos === "1" ? "articles" : "menu";
}
