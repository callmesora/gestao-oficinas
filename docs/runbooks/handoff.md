# Handoff — Gestao Oficinas

## Latest checkpoint — MIG-15I migration wizard

Windows x64, source `b898b5b`: the unsigned trial installer includes the desktop app, local service and a guided migration screen. The wizard shows the selected database, import stages and success before first access. Its release launcher passed native WebView preparation, cancellation refusal, reload recovery and continuation checks without a development server; failure/retry passed in the development launcher. A separate guided HFSQL import reconciled 159,668 rows across 17 tables with no quarantine or mismatches. The delivery copy is hash-verified in `Downloads/Gestao-Oficinas-Assistente-Teste-b898b5b`.

The exact installer still needs interactive installation and a clean-PC check. The official HFSQL 28 32-bit ODBC driver and matching `.WDD` are required. Backups, safe upgrades, crash recovery, signing, devices and the colleague's actual-data reconciliation remain open; this is a trial, not production acceptance. Preserve the existing profiles and legacy originals. The user tested an earlier installer; that does not establish acceptance of this candidate.

Focused Windows Rust, typecheck, lint and native checks passed; full suites were not rerun. Earlier independent review and the automatic approval rejection of test-folder deletion remain recorded in [migration history](../migration-history.md). No parity/source-confidence promotion was made. The earlier local `main` checkout has unrelated uncommitted work and must not be overwritten.
