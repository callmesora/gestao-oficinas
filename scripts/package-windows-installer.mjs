#!/usr/bin/env node
// Build a per-user installer from the same clean, verified portable payload.
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = resolve(dirname(fileURLToPath(import.meta.url)), ".."), scratch = join(root, "analysis-local");
const { values } = parseArgs({ options: { runtime: { type: "string" }, portable: { type: "string" } }, strict: true });
if (process.platform !== "win32" || process.arch !== "x64" || !values.runtime || !values.portable || !isAbsolute(values.runtime) || !isAbsolute(values.portable)) throw new Error("Absolute runtime and fresh portable paths on Windows x64 are required");
const runtime = resolve(values.runtime), portable = resolve(values.portable);
const inside = (parent, child) => { const path = relative(parent, child); return path !== "" && path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path); };
if (!inside(scratch, runtime) || !inside(scratch, portable) || dirname(portable).toLowerCase() !== scratch.toLowerCase()) throw new Error("Inputs must be under this checkout's analysis-local");
const info = JSON.parse(await readFile(join(root, "src-tauri/tauri.conf.json"), "utf8"));
const installer = join(root, "src-tauri/target/release/bundle/nsis", `${info.productName}_${info.version}_x64-setup.exe`);
try { await access(installer); throw new Error("Installer output already exists; preserve it before building"); } catch (error) { if (error.code !== "ENOENT") throw error; }
const run = (file, args) => { const result = spawnSync(file, args, { cwd: root, stdio: "inherit", windowsHide: true }); if (result.status !== 0) throw new Error("Required build step failed"); };
// The portable assembler rebuilds both executables, checks the source commit,
// verifies all runtime hashes and compares the freshly built frontend.
run(process.execPath, [join(root, "scripts/package-windows-trial.mjs"), "--runtime", runtime, "--output", portable]);
const manifest = JSON.parse(await readFile(join(portable, "trial-manifest.json"), "utf8"));
const config = JSON.parse(await readFile(join(root, "src-tauri/tauri.windows-packaged.conf.json"), "utf8"));
const fromTauri = path => relative(join(root, "src-tauri"), path).split(sep).join("/");
config.bundle.resources = { [`${fromTauri(join(portable, "service"))}/`]: "service/", [fromTauri(join(portable, "gestao-oficinas.exe"))]: "gestao-oficinas.exe", [fromTauri(join(portable, "LEIA-PRIMEIRO.txt"))]: "LEIA-PRIMEIRO.txt" };
const configFile = join(scratch, `installer-config-${manifest.sourceCommit.slice(0, 12)}.json`);
await writeFile(configFile, JSON.stringify(config, null, 2) + "\n", { flag: "wx" });
run(process.execPath, [join(root, "node_modules/@tauri-apps/cli/tauri.js"), "bundle", "--bundles", "nsis", "--features", "customer-launcher", "--config", configFile, "--ci"]);
const script = await readFile(join(root, "src-tauri/target/release/nsis/x64/installer.nsi"), "utf8");
if (!script.includes('!define MAINBINARYNAME "gestao-oficinas-launcher"') || !script.includes("gestao-oficinas.exe") || !script.includes("service\\")) throw new Error("Installer does not contain the expected launcher, client and service");
const hash = createHash("sha256"); for await (const chunk of createReadStream(installer)) hash.update(chunk);
await writeFile(join(portable, "installer-build.json"), JSON.stringify({ sourceCommit: manifest.sourceCommit, installer, sha256: hash.digest("hex"), unsigned: true }, null, 2) + "\n", { flag: "wx" });
console.log(`Installer built from ${manifest.sourceCommit}: ${installer}`);
