import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, it } from "vitest";

it("ODBC ANSI length decoder excludes the driver empty-string terminator and preserves spaces/chunks", async () => {
  const windows = process.platform === "win32";
  const result = await promisify(execFile)(windows ? "powershell.exe" : process.execPath, windows
    ? ["-NoProfile", "-ExecutionPolicy", "RemoteSigned", "-File", "scripts/windows/test_ansi_text.ps1"]
    : ["scripts/check-ansi-text.mjs"], { windowsHide: true });
  expect(result.stdout).toContain("ANSI text regression checks: 11 passed");
}, 60000);
