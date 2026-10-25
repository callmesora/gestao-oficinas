# Local macOS setup review

Mode: separate sequential self-review passes in the same agent/context, per ADR-007 and `skills/review/SKILL.md`; no independent or fresh-context review claim. macOS arm64, `codex/local-macos-setup`, uncommitted working tree based on `335a44d`. Scope: `stage-local-macos.md` and ADR-017.

## Blocking findings and fixes

- Windows-only mandatory PostgreSQL package prevented npm installation on Darwin. Changed to pinned optional platform packages and selected the host module before creating the same isolated cluster. Actual integration suite exercises startup, transactions and backup/restore; Windows path/lifecycle stays intact.
- The C# regression test invoked `powershell.exe` unconditionally. Windows retains that full-adapter test; macOS compiles the actual decoder method and runs the same eleven accepted/rejected-buffer assertions through .NET. No ODBC/driver execution is claimed on Mac.
- Native dispatch test hardcoded the Windows origin and failed on Mac with `native_info not allowed`. Replaced the origin with the actual mock webview URL. Handler dispatch and both response assertions remain; focused Mac test passes.
- Evidence auto-discovery selected a backup analysis compile folder, yielding an empty event legend. Regenerated only the local event legend/report from the primary compile folder, then regenerated the three unit evidence packs; expected 79 elements recovered. Tracked source evidence/answers/schema/seed untouched. Future refresh commands specify primary paths.

## Parity and evidence

No business parity status changed, no committed migration/schema/binding was edited, and no source record was published. The SQLite projection is explicitly provisional. Unsupported stock link storage is quarantined rather than coerced; all source rows are accounted for. The real imported customer UI/API smoke returns 2,165 customers, with the source hash unchanged. This does not prove HFSQL export fidelity or complete workflow parity.

Native macOS binary and .app builds succeeded. Actual Windows native/WebView2, macOS interactive picker, devices/printing, production access and hosted CI remain distinct acceptance gates. The packaged app exposes the existing foundation diagnostic; real workflows remain development-only.

## Conventions and collaboration

The application architecture, pins, legacy names, contracts and business stage ordering are preserved. Separate OS visual histories keep the same legacy images/floors/tolerance. Shell helpers use LF. Windows/Mac ownership/branch/integration/evidence instructions are documented and discoverable from root/application AGENTS and the handoff. No guard/hooks/runtime agent settings changed. No commit/push made.

The second pass checked complete changed source/test/config files, package-lock scope, source adapter failure paths and preservation, ignored private artifacts, immutable schema/parity/bindings, and the handoff's platform/working-tree disclosures. No remaining code blocker identified in that review; final executed verification results live in `setup/LOCAL-WORKSPACE.md`.

Final checks: full common verify exited 0 (87 TS, 3 Rust, 71 browser); the two component browser tests passed again after their output paths were separated by OS. Full Windows visual records remain unchanged. Native Mac development startup was observed, then both owned native/server processes were stopped. Original SQLite hash was rechecked unchanged. Hosted/Windows and interactive native acceptance are not claimed.
