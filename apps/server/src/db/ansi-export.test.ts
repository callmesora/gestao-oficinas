import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, it } from "vitest";

it("ODBC ANSI length decoder excludes the driver empty-string terminator and preserves spaces/chunks", async () => {
  const result = await promisify(execFile)("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "RemoteSigned", "-File", "scripts/windows/test_ansi_text.ps1"], { windowsHide: true });
  expect(result.stdout).toContain("ANSI text regression checks: 11 passed");
}, 30000);
