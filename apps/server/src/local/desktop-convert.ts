import { isAbsolute } from "node:path";
import { parseArgs } from "node:util";
import { convertHfsqlExport } from "./hfsql-convert";

const abort = new AbortController();
const stop = () => abort.abort();
process.stdin.once("end", stop);
process.stdin.once("error", stop);
process.stdout.on("error", stop);
process.stdin.resume();
try {
  const { values } = parseArgs({ options: { source: { type: "string" }, output: { type: "string" } }, strict: true, allowPositionals: false });
  if (!values.source || !values.output || !isAbsolute(values.source) || !isAbsolute(values.output)) throw new Error("invalid paths");
  await convertHfsqlExport(values.source, values.output, abort.signal);
  if (abort.signal.aborted) throw new Error("conversion interrupted");
  process.stdout.write("READY\n");
} catch {
  if (!abort.signal.aborted) process.stdout.write("FAILED\n");
  process.exitCode = 1;
} finally { process.stdin.pause(); }
