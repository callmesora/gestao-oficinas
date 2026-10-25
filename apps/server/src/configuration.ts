import { readFile, stat } from "node:fs/promises";
import { isAbsolute } from "node:path";
export type ServiceConfiguration = { databaseUrl: string; host: "127.0.0.1"; port: number; origins: string[]; setupToken?: string };
export class ServiceConfigurationError extends Error { constructor(readonly code: string) { super(`Workshop service configuration: ${code}`); } }
const nativeOrigins = ["tauri://localhost", "http://tauri.localhost", "https://tauri.localhost"];
export async function readServiceConfiguration(environment: NodeJS.ProcessEnv = process.env): Promise<ServiceConfiguration> {
  const databaseUrl = environment.WORKSHOP_DATABASE_URL;
  if (!databaseUrl) throw new ServiceConfigurationError("database_required");
  try { const url = new URL(databaseUrl); if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error(); } catch { throw new ServiceConfigurationError("database_invalid"); }
  if (environment.WORKSHOP_HOST && environment.WORKSHOP_HOST !== "127.0.0.1") throw new ServiceConfigurationError("loopback_host_required");
  const port = Number(environment.WORKSHOP_PORT ?? "3210");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ServiceConfigurationError("port_invalid");
  const origins = [...nativeOrigins];
  for (const value of (environment.WORKSHOP_ALLOWED_ORIGINS ?? "").split(",").filter(Boolean)) {
    try { const url = new URL(value); if ((url.protocol !== "https:" && !(url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname))) || url.username || url.password || url.origin !== value) throw new Error(); origins.push(value); }
    catch { throw new ServiceConfigurationError("origin_invalid"); }
  }
  let setupToken: string | undefined;
  if (environment.WORKSHOP_SETUP_TOKEN_FILE) {
    if (!isAbsolute(environment.WORKSHOP_SETUP_TOKEN_FILE)) throw new ServiceConfigurationError("setup_file_absolute_required");
    try {
      const metadata = await stat(environment.WORKSHOP_SETUP_TOKEN_FILE);
      if (!metadata.isFile() || metadata.size > 256 || (process.platform !== "win32" && (metadata.mode & 0o077) !== 0)) throw new Error();
      setupToken = (await readFile(environment.WORKSHOP_SETUP_TOKEN_FILE, "utf8")).trim();
      if (!/^[a-f0-9]{64}$/.test(setupToken)) throw new Error();
    } catch { throw new ServiceConfigurationError("setup_file_invalid"); }
  }
  return { databaseUrl, host: "127.0.0.1", port, origins: [...new Set(origins)], ...(setupToken ? { setupToken } : {}) };
}
