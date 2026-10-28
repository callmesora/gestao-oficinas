import { isAbsolute } from "node:path";
import { parseArgs } from "node:util";
import { provisionLocalReportRuntime } from "./report-runtime";

// Internal launcher child. Pipe closure aborts provisioning before publication.
const abort = new AbortController();
const stop = () => abort.abort();
process.stdin.once("end", stop);
process.stdin.once("error", stop);
process.stdout.on("error", stop);
process.stdin.resume();
try {
  const { values } = parseArgs({ options: { profile: { type: "string" }, browser: { type: "string" } }, strict: true, allowPositionals: false });
  if (!values.profile || !isAbsolute(values.profile) || !values.browser || !isAbsolute(values.browser)) throw new Error("invalid paths");
  await provisionLocalReportRuntime({ directory: values.profile, executable: values.browser, ensureManaged: true, signal: abort.signal });
  if (abort.signal.aborted) throw new Error("interrupted");
  process.stdout.write("READY\n");
} catch {
  if (!abort.signal.aborted) process.stdout.write("FAILED\n");
  process.exitCode = 1;
} finally { process.stdin.pause(); }
