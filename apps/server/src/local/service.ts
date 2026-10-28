import { randomBytes } from "node:crypto";
import { mkdir, unlink, access, realpath } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assertCurrentMigrations, migrate } from "../db/migrate";
import { SqliteLegacySource, importLegacy, type ImportResult } from "../db/legacy-import";
import { readServiceConfiguration } from "../configuration";
import { createBusinessApp } from "../business-app";
import { createLocalReportRenderer } from "./report-runtime";
import { mountLocalFrontend, validateLocalFrontend } from "./frontend";
import { defaultLocalDirectory, newProfile, privateFile, profilePaths, readLocalProfile, databaseUrl, LocalServiceError } from "./profile";
import { acquireRunner, assertPortFree, connectLocal, installedPostgres, postgresCommand, startOwnedPostgres } from "./postgres";
const defaultFrontend = fileURLToPath(new URL("../../../../dist/", import.meta.url));
export async function setupLocalService(options: { directory?: string; snapshot?: string; databasePort?: number; apiPort?: number; signal?: AbortSignal } = {}) {
  const paths = profilePaths(options.directory ?? defaultLocalDirectory), profile = newProfile(options.databasePort, options.apiPort);
  const assertActive = () => { if (options.signal?.aborted) throw new LocalServiceError("setup_interrupted"); };
  assertActive();
  const binaries = await installedPostgres(); await assertPortFree(profile.databasePort); await assertPortFree(profile.apiPort);
  assertActive();
  let source: SqliteLegacySource | undefined;
  try { if (options.snapshot) source = new SqliteLegacySource(resolve(options.snapshot)); } catch { throw new LocalServiceError("snapshot_invalid"); }
  let stop: (() => Promise<void>) | undefined, release: (() => Promise<void>) | undefined;
  try {
    assertActive();
    await mkdir(dirname(paths.directory), { recursive: true });
    try { await mkdir(paths.directory, { mode: 0o700 }); } catch { throw new LocalServiceError("fresh_directory_required"); }
    if (await realpath(paths.directory) !== paths.directory) throw new LocalServiceError("canonical_directory_required");
    await privateFile(paths.owner, JSON.stringify({ version: 1, id: profile.id }) + "\n"); release = await acquireRunner(paths.directory, profile.id);
    const passwordFile = join(paths.directory, "initial-password"); await privateFile(passwordFile, profile.databasePassword);
    try { await postgresCommand(binaries.initdb, ["-D", paths.data, `--username=${profile.databaseUser}`, "--auth=scram-sha-256", `--pwfile=${passwordFile}`, "--locale=C", "--encoding=UTF8"]); }
    finally { await unlink(passwordFile); }
    await privateFile(paths.clusterOwner, JSON.stringify({ version: 1, id: profile.id }) + "\n");
    assertActive();
    const postgres = await startOwnedPostgres(paths.directory, profile, binaries); stop = postgres.stop; assertActive();
    const admin = await connectLocal(profile, "postgres"); try { await admin.query('CREATE DATABASE "gestao_oficinas"'); } finally { await admin.end(); }
    const database = await connectLocal(profile); let report: ImportResult | undefined;
    try {
      await migrate(database);
      assertActive();
      if (source) { report = await importLegacy(database, source, { checkActive: assertActive }); assertActive(); await privateFile(paths.report, JSON.stringify(report, null, 2) + "\n"); if (Object.values(report.tables).some(table => table.quarantined !== 0 || table.mismatches !== 0)) throw new LocalServiceError("snapshot_requires_review"); }
    } finally { await database.end(); }
    assertActive();
    await privateFile(paths.token, randomBytes(32).toString("hex") + "\n");
    assertActive();
    // Publish the strict startup profile only after the one-time initialization/import succeeds.
    await privateFile(paths.profile, JSON.stringify(profile, null, 2) + "\n");
    assertActive();
    return { directory: paths.directory, tokenFile: paths.token, imported: report ? Object.values(report.tables).reduce((sum, table) => sum + table.imported, 0) : 0 };
  } catch (error) { if (error instanceof LocalServiceError) throw error; throw new LocalServiceError("setup_failed"); }
  finally { source?.close(); try { await stop?.(); } finally { await release?.(); } }
}
export async function startLocalService(options: { directory?: string; frontend?: string; environment?: NodeJS.ProcessEnv } = {}) {
  const paths = profilePaths(options.directory ?? defaultLocalDirectory), profile = await readLocalProfile(paths.directory), environment = options.environment ?? process.env;
  // Validate built output/configuration before starting any process. Normal startup never initializes/imports.
  const frontend = await validateLocalFrontend(options.frontend ?? defaultFrontend);
  const configuration = await readServiceConfiguration({ ...environment, WORKSHOP_DATABASE_URL: databaseUrl(profile), WORKSHOP_HOST: "127.0.0.1", WORKSHOP_PORT: String(profile.apiPort), WORKSHOP_ALLOWED_ORIGINS: [environment.WORKSHOP_ALLOWED_ORIGINS ?? "", `http://127.0.0.1:${profile.apiPort}`, `http://localhost:${profile.apiPort}`].filter(Boolean).join(","), ...(await access(paths.token).then(() => true, () => false) ? { WORKSHOP_SETUP_TOKEN_FILE: paths.token } : { WORKSHOP_SETUP_TOKEN_FILE: undefined }) });
  await assertPortFree(profile.apiPort);
  const release = await acquireRunner(paths.directory, profile.id); let postgres: Awaited<ReturnType<typeof startOwnedPostgres>> | undefined, app: Awaited<ReturnType<typeof createBusinessApp>> | undefined, closed: Promise<void> | undefined;
  const close = () => closed ??= (async () => { try { await app?.close(); } finally { try { await postgres?.stop(); } finally { await release(); } } })();
  try {
    const renderer = await createLocalReportRenderer(paths.directory, environment), binaries = await installedPostgres();
    postgres = await startOwnedPostgres(paths.directory, profile, binaries);
    const check = await connectLocal(profile); try { await assertCurrentMigrations(check); } catch { throw new LocalServiceError("schema_update_required"); } finally { await check.end(); }
    app = await createBusinessApp(configuration, renderer); await mountLocalFrontend(app, frontend); await app.listen({ host: configuration.host, port: configuration.port });
    return { origin: `http://127.0.0.1:${configuration.port}`, close };
  } catch (error) { await close(); if (error instanceof LocalServiceError) throw error; throw new LocalServiceError("start_failed"); }
}
