import { mkdtemp, writeFile, chmod, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { readServiceConfiguration } from "./configuration";
const base = { WORKSHOP_DATABASE_URL: "postgresql://synthetic:synthetic@127.0.0.1/synthetic" };
it("ADR004 persistent configuration requires explicit database and exact origins; safe errors omit private configuration", async () => {
  await expect(readServiceConfiguration({})).rejects.toThrow("database_required"); const configuration = await readServiceConfiguration(base); expect(configuration.host).toBe("127.0.0.1"); expect(configuration.port).toBe(3210); expect(configuration.setupToken).toBeUndefined();
  expect((await readServiceConfiguration({ ...base, WORKSHOP_ALLOWED_ORIGINS: "https://workshop.example,http://127.0.0.1:1435,http://localhost:3210" })).origins).toEqual(expect.arrayContaining(["https://workshop.example", "http://127.0.0.1:1435", "http://localhost:3210"]));
  for (const values of [{ WORKSHOP_DATABASE_URL: "secret-connection" }, { ...base, WORKSHOP_HOST: "0.0.0.0" }, { ...base, WORKSHOP_PORT: "0" }, { ...base, WORKSHOP_ALLOWED_ORIGINS: "http://untrusted.example" }, { ...base, WORKSHOP_ALLOWED_ORIGINS: "https://untrusted.example/path" }]) {
    await expect(readServiceConfiguration(values)).rejects.toThrow(/^Workshop service configuration: [a-z_]+$/);
  }
});
it("ADR004 setup token comes only from an explicit protected operator file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workshop-auth-")), file = join(directory, "operator-token");
  try {
    await writeFile(file, "a".repeat(64), { mode: 0o600 }); expect((await readServiceConfiguration({ ...base, WORKSHOP_SETUP_TOKEN_FILE: file })).setupToken).toBe("a".repeat(64));
    await writeFile(file, "bad"); await expect(readServiceConfiguration({ ...base, WORKSHOP_SETUP_TOKEN_FILE: file })).rejects.toThrow("setup_file_invalid");
    if (process.platform !== "win32") { await writeFile(file, "b".repeat(64)); await chmod(file, 0o644); await expect(readServiceConfiguration({ ...base, WORKSHOP_SETUP_TOKEN_FILE: file })).rejects.toThrow("setup_file_invalid"); }
  } finally { await rm(directory, { recursive: true }); }
});
