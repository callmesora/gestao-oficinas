import { isAbsolute } from "node:path";
import { parseArgs } from "node:util";
import { startLocalService } from "./service";

// Internal parent/child protocol, not a web endpoint. Closing the parent's pipe
// requests orderly shutdown even on Windows, where child.kill() is abrupt.
let running: Awaited<ReturnType<typeof startLocalService>> | undefined;
let interrupted = false;
let stopping: Promise<void> | undefined;
function stop(): void {
  interrupted = true;
  process.stdin.pause();
  if (running) {
    stopping ??= running.close().catch(() => { process.exitCode = 1; });
  }
}
process.stdin.once("end", stop);
process.stdin.once("error", stop);
process.stdout.on("error", stop);
process.stdin.resume();

try {
  const { values } = parseArgs({ options: { profile: { type: "string" } }, strict: true, allowPositionals: false });
  if (!values.profile || !isAbsolute(values.profile)) throw new Error("invalid profile");
  running = await startLocalService({ directory: values.profile });
  if (interrupted) {
    stop();
    await stopping;
  } else {
    process.stdout.write("READY\n");
  }
} catch {
  // Do not print paths, connection details, tokens or imported values.
  if (!interrupted) process.stdout.write("FAILED\n");
  process.stdin.pause();
  process.exitCode = 1;
}
