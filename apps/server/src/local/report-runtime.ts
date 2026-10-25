import { createHash, randomUUID } from "node:crypto";
import { constants, createReadStream } from "node:fs";
import { access, link, lstat, open, rename, stat, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { chromium, type Browser } from "playwright-core";
import { z } from "zod";
import { createConfiguredReportRenderer, reportRuntimeConfiguration, ReportRuntimeConfigurationError, type ReportRuntimeConfiguration } from "../reports/runtime";
import type { ReportRenderer } from "../reports/renderer";
import { acquireRunner } from "./postgres";
import { assertProtected, defaultLocalDirectory, LocalServiceError, profilePaths, readLocalProfile } from "./profile";

const names = ["GESTAO_REPORT_CHROMIUM_EXECUTABLE", "GESTAO_REPORT_CHROMIUM_SHA256", "GESTAO_REPORT_CHROMIUM_VERSION"] as const;
const MAX_PIN_BYTES = 64 * 1024;
const pinSchema = z.strictObject({ version: z.literal(1), profileId: z.uuid(), executablePath: z.string().min(1).max(32767), sha256: z.string().regex(/^[a-f0-9]{64}$/), browserVersion: z.string().regex(/^\d+\.\d+\.\d+\.\d+$/) });
export const localReportPinPath = (directory: string) => join(profilePaths(directory).directory, "report-runtime.json");
const environmentFor = (pin: ReportRuntimeConfiguration): NodeJS.ProcessEnv => ({ GESTAO_REPORT_CHROMIUM_EXECUTABLE: pin.executablePath, GESTAO_REPORT_CHROMIUM_SHA256: pin.sha256, GESTAO_REPORT_CHROMIUM_VERSION: pin.version });

async function optionalPin(file: string, profileId: string): Promise<ReportRuntimeConfiguration | undefined> {
  try { await lstat(file); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined; throw new LocalServiceError("report_pin_invalid"); }
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    await assertProtected(file);
    handle = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const before = await handle.stat({ bigint: true });
    if (!before.isFile() || before.size > BigInt(MAX_PIN_BYTES)) throw new Error();
    const buffer = Buffer.alloc(MAX_PIN_BYTES + 1); let used = 0;
    while (used < buffer.length) { const { bytesRead } = await handle.read(buffer, used, buffer.length - used, null); if (!bytesRead) break; used += bytesRead; }
    const after = await handle.stat({ bigint: true });
    if (used > MAX_PIN_BYTES || BigInt(used) !== before.size || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) throw new Error();
    const pin = pinSchema.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, used))));
    if (pin.profileId !== profileId) throw new Error();
    return reportRuntimeConfiguration(environmentFor({ executablePath: pin.executablePath, sha256: pin.sha256, version: pin.browserVersion }));
  } catch { throw new LocalServiceError("report_pin_invalid"); }
  finally { await handle?.close(); }
}

async function configured(environment: NodeJS.ProcessEnv): Promise<ReportRenderer | undefined> {
  try { return await createConfiguredReportRenderer(environment); }
  catch (error) { throw new LocalServiceError(error instanceof ReportRuntimeConfigurationError ? `report_runtime_${error.code}` : "report_runtime_invalid"); }
}

/** Caller owns the profile runner lock before reading pins, and before starting PostgreSQL. */
export async function createLocalReportRenderer(directory: string, environment: NodeJS.ProcessEnv): Promise<ReportRenderer | undefined> {
  // Even empty/partial explicit values take precedence. Invalid explicit settings
  // fail in the existing configured renderer and never consult a saved pin.
  if (names.some(name => environment[name] !== undefined)) return configured(environment);
  const profile = await readLocalProfile(directory), pin = await optionalPin(localReportPinPath(directory), profile.id);
  return configured(pin ? { ...environment, ...environmentFor(pin) } : environment);
}

async function fingerprint(executablePath: string): Promise<string> {
  try {
    const metadata = await stat(executablePath);
    if (!metadata.isFile()) throw new Error();
    await access(executablePath, constants.R_OK | (process.platform === "win32" ? 0 : constants.X_OK));
    const hash = createHash("sha256"); for await (const chunk of createReadStream(executablePath)) hash.update(chunk);
    return hash.digest("hex");
  } catch { throw new LocalServiceError("report_runtime_executable"); }
}

async function publish(file: string, contents: string, replace: boolean): Promise<void> {
  const temporary = join(dirname(file), `.report-runtime-${randomUUID()}.tmp`);
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(temporary, "wx", 0o600); await handle.writeFile(contents, "utf8"); await handle.sync(); await handle.close(); handle = undefined;
    if (replace) await rename(temporary, file);
    else await link(temporary, file); // Atomic no-clobber publication; another file is never overwritten.
  } catch (error) { throw new LocalServiceError((error as NodeJS.ErrnoException).code === "EEXIST" ? "report_pin_exists" : "report_pin_write_failed"); }
  finally { await handle?.close().catch(() => undefined); await unlink(temporary).catch(() => undefined); }
}

export async function provisionLocalReportRuntime(options: { directory?: string; executable: string; replace?: boolean; signal?: AbortSignal }): Promise<{ pinFile: string }> {
  const directory = options.directory ?? defaultLocalDirectory, profile = await readLocalProfile(directory);
  const release = await acquireRunner(directory, profile.id), pinFile = localReportPinPath(directory);
  const active = () => { if (options.signal?.aborted) throw new LocalServiceError("report_provision_interrupted"); };
  try {
    active();
    const exists = await lstat(pinFile).then(() => true, error => { if (error.code === "ENOENT") return false; throw new LocalServiceError("report_pin_invalid"); });
    if (exists) { if (!options.replace) throw new LocalServiceError("report_pin_exists"); await assertProtected(pinFile); }
    try { reportRuntimeConfiguration(environmentFor({ executablePath: options.executable, sha256: "0".repeat(64), version: "0.0.0.0" })); }
    catch { throw new LocalServiceError("report_runtime_configuration"); }
    const sha256 = await fingerprint(options.executable); active();
    let browser: Browser | undefined, version: string;
    try {
      browser = await chromium.launch({ executablePath: options.executable, headless: true, timeout: 30_000 });
      version = browser.version();
    } catch { throw new LocalServiceError("report_runtime_launch"); }
    finally { await browser?.close().catch(() => undefined); }
    active();
    const renderer = await configured(environmentFor({ executablePath: options.executable, sha256, version }));
    if (!renderer) throw new LocalServiceError("report_runtime_invalid");
    // Fixed synthetic offline smoke: same engine/assets, no database/customer data.
    const smoke = await renderer({ reportId: "RPT_inventario", html: '<article style="font-family:ReportSans"><h1>Gestão de Oficinas — PDF</h1><p>Verificação local 9007199254740993</p></article>', css: "@page{size:A4;margin:20mm;}h1{font-weight:700;}p{font-weight:400;}", unresolved: [] });
    if (smoke.kind !== "rendered") throw new LocalServiceError("report_runtime_smoke_failed");
    active();
    if (await fingerprint(options.executable) !== sha256) throw new LocalServiceError("report_runtime_fingerprint");
    active();
    const contents = JSON.stringify(pinSchema.parse({ version: 1, profileId: profile.id, executablePath: options.executable, sha256, browserVersion: version }), null, 2) + "\n";
    if (Buffer.byteLength(contents, "utf8") > MAX_PIN_BYTES) throw new LocalServiceError("report_pin_invalid");
    await publish(pinFile, contents, options.replace === true);
    return { pinFile };
  } catch (error) { if (error instanceof LocalServiceError) throw error; throw new LocalServiceError("report_provision_failed"); }
  finally { await release(); }
}
