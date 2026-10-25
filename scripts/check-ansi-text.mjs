// Compile and test the actual C# decoder method on macOS without loading Windows ODBC.
// Windows keeps its full-adapter PowerShell test. No copied decoder implementation.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync("scripts/windows/HfSqlOdbcAnsi.cs", "utf8");
const signature = "public static int CharacterCount(byte[] buffer, int reported, short rc)";
const start = source.indexOf(signature);
if (start < 0) throw new Error("ANSI decoder method signature changed; review the native regression harness");
const opening = source.indexOf("{", start);
let end = opening + 1, depth = 1;
for (; end < source.length && depth > 0; end++) {
  if (source[end] === "{") depth++;
  if (source[end] === "}") depth--;
}
if (depth !== 0) throw new Error("Cannot extract complete ANSI decoder method");
mkdirSync("analysis-local", { recursive: true });
const directory = mkdtempSync(resolve("analysis-local/ansi-text-"));
writeFileSync(resolve(directory, "Check.csproj"), `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net9.0</TargetFramework><EnableDefaultCompileItems>true</EnableDefaultCompileItems></PropertyGroup></Project>`);
writeFileSync(resolve(directory, "Program.cs"), `using System;
public static class HfSqlOdbcAnsi {
${source.slice(start, end)}
}
public static class Program {
  public static void Main() {
    var valid = new (byte[] Bytes, int Reported, short Rc, int Expected)[] {
      (new byte[]{0,0,0},1,0,0), (new byte[]{0,0,0},0,0,0),
      (new byte[]{65,32,32,0},3,0,3), (new byte[]{231,227,111,0},3,0,3),
      (new byte[]{65,66,67,0},20,1,3), (new byte[]{68,69,0,0},2,0,2)
    };
    foreach (var c in valid)
      if (HfSqlOdbcAnsi.CharacterCount(c.Bytes,c.Reported,c.Rc)!=c.Expected)
        throw new Exception("ANSI text length regression");
    var invalid = new (byte[] Bytes, int Reported, short Rc)[] {
      (new byte[]{65,66,67},3,0), (new byte[]{0,0,0},20,1),
      (new byte[]{65,66,0},1,0), (new byte[]{65,0,66,0},3,0), (new byte[]{0,0,0},2,0)
    };
    foreach (var c in invalid) {
      bool rejected=false;
      try { HfSqlOdbcAnsi.CharacterCount(c.Bytes,c.Reported,c.Rc); }
      catch (InvalidOperationException) { rejected=true; }
      if (!rejected) throw new Exception("Invalid ANSI buffer accepted");
    }
    Console.WriteLine("ANSI text regression checks: 11 passed");
  }
}`);
const stdout = execFileSync("dotnet", ["run", "--project", resolve(directory, "Check.csproj"), "--verbosity", "quiet"], {
  encoding: "utf8", timeout: 45000,
  env: { ...process.env, DOTNET_CLI_HOME: resolve("analysis-local/dotnet"), DOTNET_NOLOGO: "1", DOTNET_CLI_TELEMETRY_OPTOUT: "1" },
});
process.stdout.write(stdout);
