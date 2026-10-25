# ADR-017 — macOS development and temporary SQLite snapshot

- Date: 2026-10-25
- Status: Accepted for local development
- Decided by: human — owner requested Windows/macOS compatibility and use of the available SQLite snapshot while the official export is unavailable.
- Parity rows affected: none; no behavior status promotion or production schema change.

## Context

The cloned application has Windows-specific PostgreSQL binaries, a Windows PowerShell decoder test, an NSIS bundle target and a Windows-only native folder picker. Tauri supports macOS with Xcode Command Line Tools; this Mac already has those tools. The existing separate playbook and migration work must be preserved.

An existing `GestaoOficinas.sqlite` was found both in Downloads and in the original project's `Bkp_20261022_1405/` folder. The files match by SHA-256, pass SQLite quick_check, and contain 17 business tables and 159,668 rows plus metadata. The snapshot has no importer `__export` manifest. It includes extra composite columns, case differences such as `data`/`DATA`, and text storage for a column mapped as binary. Its equivalence to the official HFSQL driver export has not been established.

## Decision

1. Support local development on Windows x64 and macOS arm64/x64 using matching optional packages from the same pinned PostgreSQL release. Keep fresh loopback clusters, random credentials, explicit synthetic sessions and the existing API/PostgreSQL architecture. Do not use system/production database credentials.
2. Keep the exact Node/npm/Rust project pins. Use an ignored local Node/npm toolchain and project Python venv on this Mac; no global Node setting changes.
3. Keep the Windows PowerShell adapter regression test. On macOS compile the actual `CharacterCount` method extracted from the existing C# source with .NET 9 and run the same eleven assertions. This tests the decoder method, not Windows ODBC loading or driver behavior. No test is skipped to make the suite pass.
4. Add a macOS Tauri bundle override (`app`/`dmg`) and compile the existing `rfd` picker on macOS as well as Windows. The request/result contract stays unchanged. Windows native/WebView2 acceptance remains required; macOS build success alone does not establish native workflow parity.
5. Preserve Windows visual records. macOS records go under `docs/evidence/visual/darwin/`, with the same legacy reference images, pixel/layout floors, control/caption checks and regression tolerance. Compare rasterization history within each OS.
6. Adapt the copied SQLite snapshot only into a fresh `analysis-local/` directory. Read the source in a read-only transaction, retain exact mapped text/BLOB/NULL values and row order, match column identifiers case-insensitively, and record omitted extra columns/metadata. Preserve the entire original snapshot. Refuse numeric storage that would require an unreviewed conversion. Label the manifest as a development snapshot, never an official HFSQL export.
7. Feed that projection through the existing importer. Keep unsupported values in its original-value quarantine; never infer an encoding or repair production data. On this snapshot 136,053 rows import and all 23,615 stock rows with text instead of binary link values quarantine with zero reconciliation mismatches.

## Consequences and validation

Future agents can inspect evidence and build/test the application on this Mac. `npm run dev:local` starts real imported customer/vehicle/lookup workflows in a new database; `npm run desktop:mac` uses that running server in a native development window. Restarting the runner intentionally starts another fresh database and retains old scratch directories.

The packaged release still exposes the foundation diagnostic; workflow routes remain development-only under existing `import.meta.env.DEV` gates. This setup does not invent production navigation/authentication or bypass MIG-12. The official HFSQL export, exact Windows behavior, device/printing/native acceptance and remaining designer checkpoint are still migration responsibilities.

Checks and local run instructions are in `setup/LOCAL-WORKSPACE.md`. CI is extended to macOS using synthetic fixtures; Windows native checks remain in its Windows job. Hosted CI has not been dispatched by this setup.

MIG-7I test-runner lifecycle: a final rerun reproduced initdb failure from exhausted macOS shared-memory IDs. Read-only process/IPC inspection found32 orphaned postmasters, all using this application's exact embedded binary and ignored postgres-test-* directories. Installed Playwright documents default webServer shutdown as SIGKILL; detached PostgreSQL daemons escape that kill and the runner's existing SIGTERM cleanup cannot run. Enable Playwright's supported gracefulShutdown SIGTERM/10s so development.ts closes its owned Vite/API/client/cluster. Verify an actual browser run leaves no owned postmaster; Windows ignores this option and retains its own acceptance gate. Stop only explicitly identified disposable project clusters with pg_ctl; retain scratch directories/originals, never alter kernel limits or unrelated services.

The first positive teardown check still left1 postmaster with graceful shutdown alone. Installed tsx4.23.15 CLI relays signals through a child and can escalate to SIGKILL after short acknowledgement waits. Use its existing supported `node --import tsx` loader directly for dev:workflows/dev:local, retaining dependency/version/source semantics and avoiding that CLI relay. Keep idempotent process.on signal handlers throughout async cleanup so repeated npm/group signals cannot restore the default early-exit behavior. Prove shutdown after a real browser run before accepting this fix; normal persistent startup remains MIG-12.

Direct loader alone also left1 owned daemon. Installed Vite8.3.5 registers its own SIGTERM/stdin-end callback that calls process.exit after server.close; it races the runner's later API/database cleanup. Attach the same idempotent owned-data cleanup promise to Vite's supported async closeServer hook for reason=close (not restart), so Vite cannot exit before its disposable cluster stops. Verify the actual postmaster state within the configured shutdown bound, rather than merely observing npm/Playwright exit. Earlier unsuccessful teardown proofs remain recorded; none is acceptance evidence.

The final real CRUD/title browser run passed with the Vite hook and an actual0→0 owned-postmaster check (repair-states-titles-runner-final-3.log and repair-states-runner-lifecycle.json, macOS arm64/base8dcaa12 plus MIG-7I tree). Both independent reviewers inspected the installed awaited-hook implementation and final runner. This establishes this runner shutdown path; it does not establish native Windows or persistent-startup acceptance.

MIG-7J.0 regeneration exposed native pathlib ordering in ui_inputs.py: POSIX compares case sensitively while Windows folds case. Byte-identical MediaPlayer assets under the backup root and cache folder therefore selected different committed source paths; output-map ordering also differed. Use one explicit POSIX-string ordering for both candidate selection and output enumeration, preserving hash-based ambiguity refusal and all asset bytes/states. Test the actual ordering helper with both PurePosixPath/PureWindowsPath; regenerate and check source reproducibility. This is a bounded deterministic-tooling correction, not native Windows execution or a source asset change.
