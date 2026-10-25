import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, it } from "vitest";
const execute = promisify(execFile);
for (const entry of ["backup", "restore"]) it(`Node24 loads the actual ${entry} CLI and refuses missing/unsupported arguments before any profile operation`, async () => {
  for (const args of [[], ["--unsupported"]]) {
    const result = await execute(process.execPath, ["--import", "tsx", `apps/server/src/local/${entry}.ts`, ...args]).then(value => ({ ...value, code: 0 }), error => ({ stdout: String(error.stdout), stderr: String(error.stderr), code: error.code }));
    expect(result.code).toBe(1); expect(result.stdout).toBe(""); expect(result.stderr).not.toMatch(/ERR_IMPORT_ATTRIBUTE_MISSING|SyntaxError|password_hash|postgresql:\/\//);
    expect(result.stderr).toMatch(entry === "backup" ? /backup_arguments_required|Não foi possível criar/ : /restore_arguments_required|Não foi possível restaurar/);
  }
});
