import { createHash } from "node:crypto";
import { createReadStream, constants } from "node:fs";
import { access, stat } from "node:fs/promises";
import { posix, win32 } from "node:path";
import { chromium, type Browser } from "playwright-core";
import { createReportRenderer, loadReportAssets, type ReportRenderer } from "./renderer";

type RuntimeEnvironment = Record<string, string | undefined>;
export type ReportRuntimeConfiguration = { executablePath: string; sha256: string; version: string };
type RuntimeErrorCode = "configuration" | "executable" | "fingerprint" | "assets" | "launch" | "version";

/** Operator configuration errors contain a fixed code, never environment values or launch logs. */
export class ReportRuntimeConfigurationError extends Error {
  constructor(readonly code: RuntimeErrorCode) {
    super(`Report runtime configuration failed (${code})`);
    this.name = "ReportRuntimeConfigurationError";
  }
}

/** ADR005: explicit service-host provisioning only; no channel/cache/download fallback. */
export function reportRuntimeConfiguration(environment: RuntimeEnvironment, platform: NodeJS.Platform = process.platform): ReportRuntimeConfiguration | undefined {
  const executablePath = environment.GESTAO_REPORT_CHROMIUM_EXECUTABLE;
  const sha256 = environment.GESTAO_REPORT_CHROMIUM_SHA256;
  const version = environment.GESTAO_REPORT_CHROMIUM_VERSION;
  if ([executablePath, sha256, version].every(value => value === undefined)) return undefined;
  if (!executablePath || executablePath.includes("\0") || !(platform === "win32" ? win32 : posix).isAbsolute(executablePath)
    || platform === "win32" && !/^[a-z]:[\\/]/i.test(executablePath)
    || !sha256 || !/^[a-f\d]{64}$/i.test(sha256) || !version || !/^\d+\.\d+\.\d+\.\d+$/.test(version)) throw new ReportRuntimeConfigurationError("configuration");
  return { executablePath, sha256: sha256.toLowerCase(), version };
}

async function executableFingerprint(configuration: ReportRuntimeConfiguration): Promise<void> {
  try {
    if (!(await stat(configuration.executablePath)).isFile()) throw new Error();
    await access(configuration.executablePath, constants.R_OK | (process.platform === "win32" ? 0 : constants.X_OK));
  } catch { throw new ReportRuntimeConfigurationError("executable"); }
  let fingerprint: string;
  try {
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(configuration.executablePath)) hash.update(chunk);
    fingerprint = hash.digest("hex");
  } catch { throw new ReportRuntimeConfigurationError("executable"); }
  if (fingerprint !== configuration.sha256) throw new ReportRuntimeConfigurationError("fingerprint");
}

export async function createConfiguredReportRenderer(environment: RuntimeEnvironment = process.env): Promise<ReportRenderer | undefined> {
  const configuration = reportRuntimeConfiguration(environment);
  if (!configuration) return undefined;
  await executableFingerprint(configuration);
  const assets = await loadReportAssets().catch(() => { throw new ReportRuntimeConfigurationError("assets"); });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({ executablePath: configuration.executablePath, headless: true, timeout: 30_000 });
    if (browser.version() !== configuration.version) throw new ReportRuntimeConfigurationError("version");
  } catch (error) {
    if (error instanceof ReportRuntimeConfigurationError) throw error;
    throw new ReportRuntimeConfigurationError("launch");
  } finally { try { await browser?.close(); } catch { /* No persistent browser is shared with business startup. */ } }
  return createReportRenderer({ executablePath: configuration.executablePath, expectedVersion: configuration.version, assets: Promise.resolve(assets) });
}
