#!/usr/bin/env node
// Build a private-free, relocatable Windows service payload for ADR-017.
// All inputs are explicit. The output must be a fresh directory under this checkout's
// ignored analysis-local/; the Tauri override expects analysis-local/windows-runtime/.
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, copyFile, lstat, mkdir, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const checkout = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flags = ["source-root", "output", "dependency-root", "frontend", "node-executable", "node-license", "backup-root", "browser-root", "browser-executable", "browser-sha256"];
const { values, positionals } = parseArgs({ options: Object.fromEntries(flags.map(name => [name, { type: "string" }])), strict: true, allowPositionals: true });
if (positionals.length || flags.some(name => !values[name])) throw new Error(`Required options: ${flags.map(name => `--${name}`).join(" ")}`);
if (process.platform !== "win32" || process.arch !== "x64") throw new Error("Windows x64 staging is required");
const contained = (parent, child) => { const rel = relative(parent, child); return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
const samePath = (left, right) => resolve(left).toLowerCase() === resolve(right).toLowerCase();
async function checkedPath(input, kind) {
  if (!isAbsolute(input) || !/^[a-z]:[\\/]/i.test(input)) throw new Error("Input must be an absolute local drive path");
  const full = resolve(input), root = parse(full).root;
  let part = root;
  for (const component of relative(root, full).split(sep).filter(Boolean)) {
    part = join(part, component);
    const entry = await lstat(part);
    if (entry.isSymbolicLink()) throw new Error(`Reparse point is not allowed: ${part}`);
  }
  const metadata = await lstat(full);
  if ((kind === "file" && !metadata.isFile()) || (kind === "directory" && !metadata.isDirectory()) || !samePath(await realpath(full), full)) throw new Error(`Invalid ${kind}: ${full}`);
  return full;
}
async function digest(path) { const hash = createHash("sha256"); for await (const chunk of createReadStream(path)) hash.update(chunk); return hash.digest("hex"); }
function run(file, args) {
  const result = spawnSync(file, args, { encoding: "utf8", windowsHide: true, timeout: 30000 });
  if (result.error || result.status !== 0) throw new Error(`Required executable failed: ${file}`);
  return result.stdout.trim();
}
const source = await checkedPath(values["source-root"], "directory");
const dependencies = await checkedPath(values["dependency-root"], "directory");
const frontend = await checkedPath(values.frontend, "directory");
const node = await checkedPath(values["node-executable"], "file");
const nodeLicense = await checkedPath(values["node-license"], "file");
const backup = await checkedPath(values["backup-root"], "directory");
const browser = await checkedPath(values["browser-root"], "directory");
const browserExe = await checkedPath(values["browser-executable"], "file");
if (!contained(browser, browserExe) || !/^[a-f\d]{64}$/i.test(values["browser-sha256"])) throw new Error("Browser executable or expected SHA-256 is invalid");
if (run(node, ["--version"]) !== "v24.22.1" || run(node, ["-p", "process.platform + '/' + process.arch"]) !== "win32/x64") throw new Error("Node 24.22.1 Windows x64 is required");
if (!(await readFile(nodeLicense, "utf8")).startsWith("Node.js is licensed")) throw new Error("Node license notice is required");
if (await digest(browserExe) !== values["browser-sha256"].toLowerCase()) throw new Error("Browser executable fingerprint mismatch");
const ignored = resolve(checkout, "analysis-local"), output = resolve(values.output);
if (!isAbsolute(values.output) || !contained(ignored, output) || !samePath(dirname(output), ignored)) throw new Error("Output must be a fresh direct child of this checkout's analysis-local directory");
await mkdir(ignored, { recursive: true }); await checkedPath(ignored, "directory");
try { await access(output); throw new Error("Output already exists"); } catch (error) { if (error.code !== "ENOENT") throw error; }

const readJson = async path => JSON.parse(await readFile(await checkedPath(path, "file"), "utf8"));
const packageJson = await readJson(join(source, "package.json")), lock = await readJson(join(source, "package-lock.json"));
const initialLockHash = await digest(join(source, "package-lock.json"));
if (packageJson.name !== "gestao-oficinas" || lock.lockfileVersion !== 3 || lock.name !== packageJson.name) throw new Error("Unexpected project or lockfile");
for (const file of ["desktop-host.ts", "desktop-setup.ts"]) await checkedPath(join(source, "apps/server/src/local", file), "file");
await checkedPath(join(frontend, "index.html"), "file");
const tracked = spawnSync("git", ["-C", source, "ls-files", "-z", "--", "apps/server/src", "packages/domain/src", "apps/server/migrations"], { encoding: "utf8", windowsHide: true });
const initialHead = spawnSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true });
if (tracked.status !== 0 || initialHead.status !== 0 || !/^[a-f0-9]{40}$/.test(initialHead.stdout.trim())) throw new Error("Source Git inventory unavailable");
const trackedFiles = tracked.stdout.split("\0").filter(Boolean).filter(path => path.startsWith("apps/server/migrations/") ? /^apps\/server\/migrations\/\d{4}_[a-z_]+\.sql$/.test(path) : /\.(?:ts|json)$/.test(path) && !path.endsWith(".test.ts") && !path.endsWith("/development.ts"));
// The coordinator's two new entrypoints may be uncommitted during an isolated
// staging probe; their exact contents are hashed and sourceDirty is recorded.
for (const file of ["desktop-host.ts", "desktop-setup.ts"]) {
  const path = `apps/server/src/local/${file}`;
  if (!trackedFiles.includes(path)) trackedFiles.push(path);
}
const skinInventory = await readJson(join(source, "docs/evidence/ui-inputs.json"));
const skinNames = new Set(Object.values(skinInventory.source_assets).flatMap(asset => asset.outputs));
if (!skinNames.size || [...skinNames].some(name => typeof name !== "string" || !/^[a-z0-9._-]+\.png$/i.test(name))) throw new Error("Invalid committed skin inventory");
const backupInfo = await readJson(join(backup, "provisioning.json"));
if (backupInfo.postgresVersion !== "18.4" || backupInfo.sourceSha256 !== "81a81ec695fb0c7901407defaa1d2f7973617154cf27ba74e3a7ab8e64436094") throw new Error("Checked PostgreSQL 18.4 backup tools are required");
for (const name of ["pg_dump", "pg_restore"]) {
  const file = await checkedPath(join(backup, "bin", `${name}.exe`), "file");
  if (run(file, ["--version"]) !== `${name} (PostgreSQL) 18.4` || await digest(file) !== backupInfo.tools?.[name]?.sha256) throw new Error(`Backup tool mismatch: ${name}`);
}
await checkedPath(join(backup, "bin/libpq.dll"), "file");
await checkedPath(join(backup, "notices/PostgreSQL-COPYRIGHT"), "file");
const generatorNotice = await checkedPath(join(backup, "notices/win-flex-bison-2.5.25.zip"), "file");
if (await digest(generatorNotice) !== "8d324b62be33604b2c45ad1dd34ab93d722534448f55a16ca7292de32b6ac135") throw new Error("Windows generator notice fingerprint mismatch");
await checkedPath(join(browser, "LICENSE.headless_shell"), "file");

// Resolve actual installed dependency locations exactly as Node does, preserving any
// nested node_modules path and checking each installed version against the lockfile.
const roots = ["@fastify/cors", "fastify", "decimal.js", "pg", "zod", "pagedjs", "playwright-core", "@fontsource/noto-sans", "tsx", "@embedded-postgres/windows-x64", "@esbuild/win32-x64"];
const known = new Map(), missingOptional = new Set();
function matchesPlatform(values, value) {
  if (!Array.isArray(values)) return true;
  const allowed = values.filter(item => !item.startsWith("!"));
  return !values.includes(`!${value}`) && (!allowed.length || allowed.includes(value));
}
async function locate(name, from, optional = false) {
  if (!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name)) throw new Error("Invalid dependency name");
  let current = from;
  while (samePath(current, dependencies) || contained(dependencies, current)) {
    const candidate = samePath(current, dependencies) ? join(dependencies, name) : join(current, "node_modules", name);
    try {
      const meta = await lstat(candidate);
      if (!meta.isDirectory() || meta.isSymbolicLink()) throw new Error(`Unsafe package: ${name}`);
      const directory = await checkedPath(candidate, "directory"), pkg = await readJson(join(directory, "package.json"));
      const key = `node_modules/${relative(dependencies, directory).split(sep).join("/")}`;
      if (pkg.name !== name || !lock.packages?.[key] || lock.packages[key].version !== pkg.version) throw new Error(`Lockfile mismatch: ${key}`);
      if (!matchesPlatform(pkg.os, "win32") || !matchesPlatform(pkg.cpu, "x64")) {
        if (optional) { missingOptional.add(name); return; }
        throw new Error(`Dependency does not support Windows x64: ${name}`);
      }
      if (!known.has(key)) { known.set(key, { directory, pkg }); for (const child of Object.keys(pkg.dependencies ?? {})) await locate(child, directory); for (const child of Object.keys(pkg.optionalDependencies ?? {})) await locate(child, directory, true); }
      return;
    } catch (error) { if (error.code !== "ENOENT") throw error; }
    if (samePath(current, dependencies)) break;
    current = dirname(current);
  }
  if (optional) { missingOptional.add(name); return; }
  throw new Error(`Missing required dependency: ${name}`);
}
for (const name of roots) await locate(name, dependencies);
const pinned = name => known.get(`node_modules/${name}`)?.pkg.version;
for (const [name, version] of Object.entries({ "@fastify/cors": packageJson.dependencies["@fastify/cors"], fastify: packageJson.dependencies.fastify, "decimal.js": packageJson.dependencies["decimal.js"], pg: packageJson.dependencies.pg, zod: packageJson.dependencies.zod, pagedjs: "0.4.3", "playwright-core": "1.64.1", "@fontsource/noto-sans": "5.3.0", tsx: packageJson.devDependencies.tsx, "@embedded-postgres/windows-x64": "18.4.0-beta.17", "@esbuild/win32-x64": "0.28.2" })) if (pinned(name) !== version) throw new Error(`Pinned dependency mismatch: ${name}`);
const postgres = await checkedPath(join(dependencies, "@embedded-postgres/windows-x64/native/bin/postgres.exe"), "file");
if (!/^postgres \(PostgreSQL\) 18\.4(?:\s|$)/.test(run(postgres, ["--version"]))) throw new Error("Embedded PostgreSQL 18.4 is required");
const browsers = await readJson(join(dependencies, "playwright-core/browsers.json"));
const expectedBrowser = browsers.browsers.find(item => item.name === "chromium-headless-shell")?.browserVersion;
if (!/^\d+\.\d+\.\d+\.\d+$/.test(expectedBrowser ?? "")) throw new Error("Pinned Chromium version unavailable");
const playwright = await import(pathToFileURL(join(dependencies, "playwright-core/index.mjs")).href);
const instance = await playwright.chromium.launch({ executablePath: browserExe, headless: true, timeout: 30000 });
try { if (instance.version() !== expectedBrowser) throw new Error("Chromium version differs from the pinned Playwright release"); }
finally { await instance.close(); }

// Only newly created output is touched. A failed stage is retained for inspection
// and lacks the final manifest; a retry must choose a different fresh directory.
await mkdir(output);
const records = [];
const forbidden = /^(?:\.env(?:\..*)?|operator-token|runner\.lock|profile\.json|import-report\.json)$/i;
const browserPrivate = /^(?:local state|cookies|login data|history|preferences|user data|default|profile \d+|crashpad|cache|code cache|gpucache)$/i;
const privateBrowserEntry = (destination, name) => destination.split(sep).join("/").startsWith("runtime/chromium/") && browserPrivate.test(name);
const omittedPackageDirs = new Set(["node_modules", "test", "tests", "__tests__", "benchmark", "benchmarks", "examples", "coverage", ".git", ".github", ".cache"]);
async function copyOne(input, destination) {
  const file = await checkedPath(input, "file"), target = resolve(output, destination);
  if (!contained(output, target) || forbidden.test(parse(file).base) || privateBrowserEntry(destination, parse(file).base) || /\.(?:sqlite|sqlite3|db|fic|ndx|mmo|p12|pfx|pem)$/i.test(file)) throw new Error(`Unsafe payload file: ${destination}`);
  const before = await digest(file), meta = await lstat(file);
  await mkdir(dirname(target), { recursive: true }); await copyFile(file, target, 1);
  if (await digest(file) !== before || await digest(target) !== before) throw new Error(`Input changed during staging: ${destination}`);
  records.push({ path: relative(output, target).split(sep).join("/"), bytes: meta.size, sha256: before });
}
async function copyTree(input, destination, filter = () => true) {
  const directory = await checkedPath(input, "directory");
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    if (entry.isSymbolicLink() || forbidden.test(entry.name) || privateBrowserEntry(join(destination, entry.name), entry.name)) throw new Error(`Unsafe payload entry: ${join(destination, entry.name)}`);
    if (!filter(entry, join(destination, entry.name))) continue;
    if (entry.isDirectory()) await copyTree(join(directory, entry.name), join(destination, entry.name), filter);
    else if (entry.isFile()) await copyOne(join(directory, entry.name), join(destination, entry.name));
    else throw new Error(`Unsupported payload entry: ${join(destination, entry.name)}`);
  }
}
const fixedSourceFiles = ["package.json", "apps/server/package.json", "packages/domain/package.json", "src-tauri/tauri.conf.json", "docs/evidence/ui-inputs.json"];
for (const file of fixedSourceFiles) await copyOne(join(source, file), file);
for (const file of trackedFiles.sort()) await copyOne(join(source, file), file);
await copyOne(join(frontend, "index.html"), "dist/index.html");
const assetEntries = await readdir(await checkedPath(join(frontend, "assets"), "directory"), { withFileTypes: true });
for (const entry of assetEntries.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
  if (!entry.isFile() || entry.isSymbolicLink() || !/^[a-z0-9._-]+-[a-z0-9_-]{8,}\.(?:js|css|woff2|png|jpe?g|svg|webp|ico)$/i.test(entry.name)) throw new Error(`Unexpected frontend asset: ${entry.name}`);
  await copyOne(join(frontend, "assets", entry.name), join("dist/assets", entry.name));
}
const actualSkin = await readdir(await checkedPath(join(frontend, "skin"), "directory"), { withFileTypes: true });
if (actualSkin.length !== skinNames.size || actualSkin.some(entry => !entry.isFile() || entry.isSymbolicLink() || !skinNames.has(entry.name))) throw new Error("Built skin files differ from the committed inventory");
for (const entry of actualSkin.sort((a, b) => a.name.localeCompare(b.name, "en"))) await copyOne(join(frontend, "skin", entry.name), join("dist/skin", entry.name));
for (const [key, { directory }] of [...known.entries()].sort(([a], [b]) => a.localeCompare(b, "en"))) {
  if (key === "node_modules/@fontsource/noto-sans") {
    for (const file of ["package.json", "LICENSE", "files/noto-sans-latin-400-normal.woff2", "files/noto-sans-latin-700-normal.woff2"]) await copyOne(join(directory, file), join(key, file));
  } else await copyTree(directory, key, entry => !entry.isDirectory() || !omittedPackageDirs.has(entry.name));
}
await copyOne(node, "runtime/node.exe"); await copyOne(nodeLicense, "runtime/notices/Node-LICENSE");
for (const name of ["pg_dump.exe", "pg_restore.exe", "libpq.dll"]) await copyOne(join(backup, "bin", name), join("runtime/postgres-tools/bin", name));
for (const name of ["PostgreSQL-COPYRIGHT", "win-flex-bison-2.5.25.zip"]) await copyOne(join(backup, "notices", name), join("runtime/postgres-tools/notices", name));
// Chromium may create this diagnostic file next to its executable during the
// version check. It is machine-generated and is not part of the redistributable.
await copyTree(browser, "runtime/chromium", entry => entry.name.toLowerCase() !== "debug.log");
records.sort((a, b) => a.path.localeCompare(b.path, "en"));
const git = spawnSync("git", ["-C", source, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true });
if (git.status !== 0 || git.stdout.trim() !== initialHead.stdout.trim()) throw new Error("Source Git commit changed during staging");
for (const file of [...trackedFiles, ...fixedSourceFiles]) {
  const record = records.find(item => item.path === file);
  if (!record || await digest(join(source, file)) !== record.sha256) throw new Error(`Source changed during staging: ${file}`);
}
if (await digest(join(source, "package-lock.json")) !== initialLockHash) throw new Error("Source lockfile changed during staging");
for (const [path, value] of known) {
  const staged = JSON.parse(await readFile(join(output, path, "package.json"), "utf8"));
  if (staged.name !== value.pkg.name || staged.version !== value.pkg.version) throw new Error(`Staged package identity changed: ${path}`);
}
const status = spawnSync("git", ["-C", source, "status", "--porcelain", "--untracked-files=all", "--", "apps/server/src", "packages/domain/src", "apps/server/migrations", "package.json", "package-lock.json", "src-tauri/tauri.conf.json", "docs/evidence/ui-inputs.json"], { encoding: "utf8", windowsHide: true });
if (status.status !== 0) throw new Error("Source Git status unavailable");
const manifest = { schema: 1, platform: "win32", architecture: "x64", sourceCommit: git.stdout.trim(), sourceDirty: Boolean(status.stdout.trim()), frontendVerifiedAgainstSource: false, lockSha256: initialLockHash, nodeVersion: "24.22.1", nodeSha256: await digest(node), postgresVersion: "18.4", playwrightVersion: "1.64.1", browserVersion: expectedBrowser, browserSha256: values["browser-sha256"].toLowerCase(), browserExecutable: `runtime/chromium/${relative(browser, browserExe).split(sep).join("/")}`, backupTools: "runtime/postgres-tools/bin", packages: [...known.entries()].map(([path, value]) => ({ path, version: value.pkg.version })).sort((a, b) => a.path.localeCompare(b.path, "en")), files: records, absentOptionalDependencies: [...missingOptional].sort() };
await writeFile(join(output, "runtime-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ output, files: records.length, bytes: records.reduce((sum, item) => sum + item.bytes, 0), packages: known.size, nodeVersion: manifest.nodeVersion, postgresVersion: manifest.postgresVersion, browserVersion: manifest.browserVersion, browserSha256: manifest.browserSha256 }));
