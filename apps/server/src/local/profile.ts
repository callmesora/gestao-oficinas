import { randomBytes, randomUUID } from "node:crypto";
import { readFile, writeFile, stat, realpath } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
export const defaultLocalDirectory = fileURLToPath(new URL("../../../../analysis-local/local-service/", import.meta.url));
export class LocalServiceError extends Error { constructor(readonly code: string) { super(`Local workshop service: ${code}`); } }
const port = z.number().int().min(1).max(65535);
const profileSchema = z.strictObject({ version: z.literal(1), id: z.uuid(), databasePort: port, apiPort: port, databaseName: z.literal("gestao_oficinas"), databaseUser: z.literal("gestao_local"), databasePassword: z.string().regex(/^[a-f0-9]{64}$/) });
export type LocalProfile = z.infer<typeof profileSchema>;
export const profilePaths = (directory: string) => ({ directory: resolve(directory), profile: join(resolve(directory), "profile.json"), owner: join(resolve(directory), "owner.json"), data: join(resolve(directory), "cluster"), clusterOwner: join(resolve(directory), "cluster", "workshop-owner.json"), token: join(resolve(directory), "operator-token"), lock: join(resolve(directory), "runner.lock"), log: join(resolve(directory), "postgres.log"), report: join(resolve(directory), "import-report.json") });
export async function privateFile(file: string, contents: string): Promise<void> { await writeFile(file, contents, { flag: "wx", mode: 0o600 }); }
export async function assertProtected(file: string, directory = false): Promise<void> {
  const metadata = await stat(file);
  if ((directory ? !metadata.isDirectory() : !metadata.isFile()) || (process.platform !== "win32" && (metadata.mode & 0o077) !== 0) || await realpath(file) !== resolve(file)) throw new LocalServiceError("private_state_invalid");
}
export function newProfile(databasePort = 54329, apiPort = 3210): LocalProfile {
  const result = profileSchema.safeParse({ version: 1, id: randomUUID(), databasePort, apiPort, databaseName: "gestao_oficinas", databaseUser: "gestao_local", databasePassword: randomBytes(32).toString("hex") });
  if (!result.success || databasePort === apiPort) throw new LocalServiceError("ports_invalid"); return result.data;
}
export async function readLocalProfile(directory = defaultLocalDirectory): Promise<LocalProfile> {
  const paths = profilePaths(directory);
  try {
    await assertProtected(paths.directory, true); await assertProtected(paths.profile); await assertProtected(paths.owner);
    const metadata = await stat(paths.profile); if (metadata.size > 4096 || (await stat(paths.owner)).size > 256) throw new Error();
    const profile = profileSchema.parse(JSON.parse(await readFile(paths.profile, "utf8"))), owner = z.strictObject({ version: z.literal(1), id: z.uuid() }).parse(JSON.parse(await readFile(paths.owner, "utf8")));
    if (profile.id !== owner.id || profile.apiPort === profile.databasePort) throw new Error();
    await assertProtected(paths.data, true); await assertProtected(paths.clusterOwner);
    const clusterOwner = z.strictObject({ version: z.literal(1), id: z.uuid() }).parse(JSON.parse(await readFile(paths.clusterOwner, "utf8")));
    if (clusterOwner.id !== profile.id) throw new Error();
    if ((await readFile(join(paths.data, "PG_VERSION"), "utf8")).trim() !== "18") throw new Error();
    return profile;
  } catch { throw new LocalServiceError("existing_profile_required"); }
}
export function databaseUrl(profile: LocalProfile, database: string = profile.databaseName): string {
  const url = new URL(`postgresql://127.0.0.1:${profile.databasePort}/${database}`); url.username = profile.databaseUser; url.password = profile.databasePassword; return url.href;
}
