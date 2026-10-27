#!/usr/bin/env node
// Assemble a fresh, private-data-free portable folder from a verified runtime stage.
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = resolve(dirname(fileURLToPath(import.meta.url)), ".."), ignored = join(root, "analysis-local");
const { values } = parseArgs({ options: { runtime: { type: "string" }, output: { type: "string" } }, strict: true });
if (process.platform !== "win32" || process.arch !== "x64" || !values.runtime || !values.output || !isAbsolute(values.runtime) || !isAbsolute(values.output)) throw new Error("Absolute runtime and output paths on Windows x64 are required");
const runtime = resolve(values.runtime), output = resolve(values.output);
const inside = (parent, child) => { const path = relative(parent, child); return path !== "" && path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path); };
if (!inside(ignored, runtime) || !inside(ignored, output) || dirname(output).toLowerCase() !== ignored.toLowerCase() || inside(runtime, output)) throw new Error("Runtime and fresh output must be under this checkout's analysis-local");
const metadata = await lstat(runtime); if (!metadata.isDirectory() || metadata.isSymbolicLink()) throw new Error("Invalid runtime stage");
const manifest = JSON.parse(await readFile(join(runtime, "runtime-manifest.json"), "utf8"));
const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", windowsHide: true });
const status = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: root, encoding: "utf8", windowsHide: true });
if (head.status !== 0 || status.status !== 0 || status.stdout.trim() || manifest.sourceDirty || manifest.sourceCommit !== head.stdout.trim() || manifest.platform !== "win32" || manifest.architecture !== "x64" || !Array.isArray(manifest.files)) throw new Error("A clean stage from the current commit is required");
const digest = async file => { const hash = createHash("sha256"); for await (const chunk of createReadStream(file)) hash.update(chunk); return hash.digest("hex"); };
// Rebuild both executables from this clean checkout in this invocation. A stale
// target/release executable is never accepted as evidence for the source commit.
const client = spawnSync("cmd.exe", ["/d", "/s", "/c", "npm run tauri -- build --no-bundle"], { cwd: root, stdio: "inherit", windowsHide: true });
if (client.status !== 0) throw new Error("Desktop client build failed");
const launcher = spawnSync("cargo", ["build", "--release", "--manifest-path", "src-tauri/Cargo.toml", "--features", "customer-launcher", "--bin", "gestao-oficinas-launcher"], { cwd: root, stdio: "inherit", windowsHide: true });
if (launcher.status !== 0) throw new Error("Customer launcher build failed");
const afterBuild = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: root, encoding: "utf8", windowsHide: true });
const afterHead = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", windowsHide: true });
if (afterBuild.status !== 0 || afterBuild.stdout.trim() || afterHead.status !== 0 || afterHead.stdout.trim() !== manifest.sourceCommit) throw new Error("Source changed during the build");
for (const item of manifest.files.filter(item => item.path.startsWith("dist/"))) {
  if (await digest(join(root, ...item.path.split("/"))) !== item.sha256) throw new Error(`Frontend differs from the staged build: ${item.path}`);
}
const records = new Map();
for (const record of manifest.files) {
  if (typeof record.path !== "string" || !/^[a-z0-9._@+#/-]+$/i.test(record.path) || record.path.split("/").some(part => !part || part === "." || part === "..") || !/^[a-f0-9]{64}$/.test(record.sha256) || records.has(record.path.toLowerCase())) throw new Error("Invalid runtime inventory");
  records.set(record.path.toLowerCase(), record);
}
async function inventory(directory, prefix = "") {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name, path = join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Runtime contains a link: ${name}`);
    if (entry.isDirectory()) await inventory(path, name);
    else if (entry.isFile() && name === "runtime-manifest.json") continue;
    else if (entry.isFile()) {
      const item = records.get(name.toLowerCase());
      if (!item || item.path !== name || await digest(path) !== item.sha256 || (await lstat(path)).size !== item.bytes) throw new Error(`Runtime inventory mismatch: ${name}`);
      records.delete(name.toLowerCase());
    } else throw new Error(`Invalid runtime entry: ${name}`);
  }
}
await inventory(runtime); if (records.size) throw new Error("Runtime stage is missing files");
await mkdir(output); // Never replace an existing trial or its contents.
const copied = [];
async function put(source, name) {
  const target = join(output, ...name.split("/")); if (!inside(output, target)) throw new Error("Invalid output path");
  const info = await lstat(source); if (!info.isFile() || info.isSymbolicLink()) throw new Error("Invalid package input");
  const hash = await digest(source); await mkdir(dirname(target), { recursive: true }); await copyFile(source, target, 1);
  if (await digest(target) !== hash) throw new Error("Copy verification failed");
  copied.push({ path: name, bytes: info.size, sha256: hash });
}
for (const record of manifest.files) await put(join(runtime, ...record.path.split("/")), `service/${record.path}`);
await put(join(runtime, "runtime-manifest.json"), "service/runtime-manifest.json");
await put(join(root, "src-tauri/target/release/gestao-oficinas-launcher.exe"), "INICIAR.exe");
await put(join(root, "src-tauri/target/release/gestao-oficinas.exe"), "gestao-oficinas.exe");
await put(join(root, "setup/customer-trial-README.pt.txt"), "LEIA-PRIMEIRO.txt");
copied.sort((a, b) => a.path.localeCompare(b.path, "en"));
await writeFile(join(output, "trial-manifest.json"), JSON.stringify({ schema: 1, sourceCommit: manifest.sourceCommit, unsigned: true, files: copied }, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ output, sourceCommit: manifest.sourceCommit, files: copied.length, bytes: copied.reduce((sum, file) => sum + file.bytes, 0) }));
