import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const result = spawnSync("cargo", ["run", "--quiet", "--locked", "--manifest-path", "src-tauri/Cargo.toml", "--bin", "export-bindings"], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
if (result.status !== 0) { process.stderr.write(result.stderr || "bindings generator failed"); process.exit(result.status ?? 1); }
const path = "src/bindings/native.ts";
if (process.argv.includes("--write")) { writeFileSync(path, result.stdout); }
else {
  let current;
  try { current = readFileSync(path, "utf8"); } catch { throw new Error("Native bindings missing: run npm run bindings:generate"); }
  if (current !== result.stdout) throw new Error("Native bindings drift: run npm run bindings:generate and commit the result");
  const unexpected = readdirSync("src/bindings").filter(name => name.endsWith(".ts") && name !== "native.ts");
  if (unexpected.length) throw new Error(`Unregistered generated bindings: ${unexpected.join(", ")}`);
  console.log("Native bindings match the Rust contract.");
}
