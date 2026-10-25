import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { mkdtemp, rm, access } from "node:fs/promises";
import { resolve, join } from "node:path";
import { expect, it } from "vitest";
const execute = promisify(execFile), root = fileURLToPath(new URL("../../../../", import.meta.url));
it("ADR017 actual Node24 command loader imports ordinary service dependencies and reaches strict missing-profile refusal without creating state", async () => {
  const directory = await mkdtemp(resolve(root, "analysis-local/node-loader-test-")), missing = join(directory, "missing");
  const script = `import { startLocalService } from ${JSON.stringify(new URL("./service.ts", import.meta.url).href)}; try { await startLocalService({directory:${JSON.stringify(missing)},environment:{}}); process.exitCode=2; } catch(error) { if(error?.code==='existing_profile_required') console.log('strict-profile-refusal'); else process.exitCode=3; }`;
  try { const result = await execute(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", script], { cwd: root, timeout: 30000, windowsHide: true }); expect(result.stdout.trim()).toBe("strict-profile-refusal"); expect(await access(missing).then(() => true, () => false)).toBe(false); }
  finally { await rm(directory, { recursive: true }); }
});
it("ADR017 actual ordinary CLI entry loads JSON imports before rejecting unsupported arguments, without touching any default profile", async () => {
  for (const command of ["start", "setup"]) {
    const result = await execute(process.execPath, ["--import", "tsx", `apps/server/src/local/${command}.ts`, "--unexpected"], { cwd: root, timeout: 30000, windowsHide: true }).then(() => ({ code: 0, stderr: "" }), error => ({ code: error.code, stderr: String(error.stderr) }));
    expect(result.code).toBe(1); expect(result.stderr).not.toContain("ERR_IMPORT_ATTRIBUTE_MISSING"); expect(result.stderr).not.toContain("SyntaxError"); expect(result.stderr).toContain(command === "start" ? "unexpected_arguments" : "Não foi possível preparar o serviço local.");
  }
});
