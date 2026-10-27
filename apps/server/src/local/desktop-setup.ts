import { isAbsolute } from "node:path";
import { parseArgs } from "node:util";
import { setupLocalService } from "./service";

// A private setup child: only the owning native launcher supplies these paths.
const abort = new AbortController();
const stop = () => abort.abort();
process.stdin.once("end", stop);
process.stdin.once("error", stop);
process.stdout.on("error", stop);
process.stdin.resume();

try {
  const { values } = parseArgs({
    options: { profile: { type: "string" }, snapshot: { type: "string" }, "database-port": { type: "string" }, "api-port": { type: "string" } },
    strict: true,
    allowPositionals: false,
  });
  if (!values.profile || !isAbsolute(values.profile) || (values.snapshot !== undefined && !isAbsolute(values.snapshot))) throw new Error("invalid setup path");
  await setupLocalService({
    directory: values.profile,
    snapshot: values.snapshot,
    ...(values["database-port"] !== undefined ? { databasePort: Number(values["database-port"]) } : {}),
    ...(values["api-port"] !== undefined ? { apiPort: Number(values["api-port"]) } : {}),
    signal: abort.signal,
  });
  if (abort.signal.aborted) throw new Error("setup interrupted");
  process.stdout.write("READY\n");
} catch {
  // Fixed marker only; paths, connection details, tokens and source rows stay private.
  if (!abort.signal.aborted) process.stdout.write("FAILED\n");
  process.exitCode = 1;
} finally {
  process.stdin.pause();
}
