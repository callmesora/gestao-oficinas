import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

if (!["darwin", "win32"].includes(process.platform)) throw new Error("Native startup probe requires Windows/macOS");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
await access(join(root, "dist/index.html"));
const build = spawnSync("cargo", ["build", "--locked", "--manifest-path", "src-tauri/Cargo.toml", "--features", "tauri/custom-protocol,development-tools", "--bin", "native-probe"], { cwd: root, encoding: "utf8", timeout: 180_000 });
if (build.status !== 0) throw new Error(build.stderr || "Native probe build failed");
const executable = join(root, "src-tauri/target/debug", `native-probe${process.platform === "win32" ? ".exe" : ""}`);
const cases = [
  { args: [], expected: { modulo: null, artigos: null } },
  { args: ["/modulo=m", "/artigos=1"], expected: { modulo: "m", artigos: "1" } },
  { args: ["-modulo", "=", "t", "-artigos=1"], expected: { modulo: "t", artigos: "1" } },
  { args: ["/modulo=m", "-modulo=t", "/artigos=2", "/unrelated=synthetic"], expected: { modulo: null, artigos: null } },
];
const results = [];
for (const scenario of cases) {
  const profile = await mkdtemp(join(await realpath(tmpdir()), "gestao-native-probe-"));
  try {
    const child = spawnSync(executable, scenario.args, { cwd: root, encoding: "utf8", windowsHide: true, timeout: 30_000, env: { ...process.env, GESTAO_NATIVE_PROBE_MODE: "startup", GESTAO_NATIVE_PROBE_DATA_DIRECTORY: profile } });
    assert.equal(child.status, 0, child.stderr || "Native probe did not exit successfully");
    const line = child.stdout.split(/\r?\n/).find(value => value.startsWith("NATIVE_PROBE "));
    assert.ok(line, "Actual native IPC result missing");
    const result = JSON.parse(line.slice("NATIVE_PROBE ".length));
    assert.equal(result.passed, true);
    assert.deepEqual(result.result.arguments, scenario.expected);
    assert.equal(result.result.info.platform, process.platform === "darwin" ? "macos" : "windows");
    results.push({ arguments: scenario.expected, nativeInfo: result.result.info, exitCode: child.status });
  } finally { await rm(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); }
}
await mkdir(join(root, "analysis-local"), { recursive: true });
const commit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
await writeFile(join(root, "analysis-local/native-startup-probe.json"), JSON.stringify({ platform: process.platform, architecture: process.arch, baseCommit: commit.stdout.trim(), workingTree: true, passed: true, results, limits: "Real native IPC/arguments/exit only; no business, dialog or physical-printer acceptance." }, null, 2) + "\n");
console.log(`Native startup probe: ${results.length} real ${process.platform}/${process.arch} IPC/argument/exit cases passed.`);
