# Handoff — Step 0

23 October 2026. Authorized scope completed: scratch HFSQL export, source/dossier/schema/compiler evidence, complete unit mapping, review/fixes and validation. **Stop here. No framing ADR, application scaffold, production schema migration or application implementation is authorized.**

## Delivered

Completeness recheck after the owner's question: added the previously missing docs/mapping/event-codes-inferred.md for raw codes 32 and 196608 and added a validator check that every non-compiler-backed raw code has an entry. The menu source rows already had inferred confidence; their evidence now also cites the separate note. Counts and their overlap are documented in docs/evidence/question-summary.md/.json: 12 runtime questions, 17 action groups, 481 unmapped rows referencing 425 distinct U IDs, and 326 assumed rows. These are not additive counts or a claim that runtime answers were confirmed.

- Entry point: docs/runbooks/step0-report.md; all unit links: docs/mapping/README.md.
- Complete evidence pipeline outputs; canonical local paths are recorded in ignored analysis-local/latest.json. Durable coverage/navigation/schema/visual evidence, hashed source inventory, per-unit mappings/specs and consolidated parity are under docs/.
- 143 units, 877 source seeds, 2,273 parity rows (1,792 specified/481 unmapped); 53 screen specs and 28 report specs. No target behavior marked implemented, verified or excluded.
- Local legacy/data/data.sqlite, 17 CSVs and manifest.json: 159,668 rows. Raw data and original legacy inputs remain ignored. docs/data/profile.md and export-verification.json hold the reviewed non-record findings.
- Copied scripts/templates/skills with attribution; project-specific ANSI HFSQL export and tests; Step 0 consolidation/validation tools. Root AGENTS.md bounds the scope.
- Review records in docs/runbooks/reviews/: CRUD, workflows, reports, data/query/project/template, extraction/data, second window and second report/export passes. First and second review findings were fixed and checks rerun. Parent verified the final containment helper with real Windows junction tests.

## Assumptions and differences

- Dedicated laptop and sanitization preference were confirmed by owner. No raw data or credential values are published. Owner subsequently authorized committing and pushing completed Step 0 changes.
- Playbook snapshot: cce71fa. Original checkout is read-only and unchanged. Its automatic compile-folder selection would choose a backup; actual extraction explicitly used legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl and the current dossier path.
- Python/HFSQL x64 crashed. The 32-bit Python installer was rejected by automatic approval review, so no extra Python was installed. Existing Windows x86 PowerShell plus the official driver's ANSI ODBC API succeeded; .NET Unicode queries did not. Export tooling and limitations are documented in docs/data/export-runbook.md.
- Generated source/schema type and event codes remain raw alongside evidenced meanings. PDF quote/accent substitutions are evidence imperfections, not approved executable SQL or UI literals.
- docs/porting.md contains proposed patterns only. No persistence, auth, reports, UI redesign or bug-fix decision has been accepted.

## Checks actually executed

- python scripts/verify_step0.py: PASS; 143 units, 877 seeds, all evidence files, mapping/spec U lints, 17 export tables/counts/hashes, 128 unchanged source fingerprints and in-memory draft DDL checked.
- python scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files: PASS.
- python -m unittest discover -s tests -v: 4 local tests PASS (typed converter fidelity, hash boundaries, missing/count-mismatched input, deterministic handle close and scratch/junction containment).
- Playbook checkout unittest discovery: 75 tests PASS; nonfatal upstream Pillow warnings noted.
- Actual data: complete table inventory, repeated driver export, before/after counts, typed/compatibility hashes, null/binary/CSV checks; 35 scratch data files unchanged. Independent reviewer recomputed counts/hashes from the actual read-only SQLite copy.
- Progress dashboard generated at docs/progress/index.html. Its 0% implementation is intentional: this stage was analysis only.
- Not run: legacy application, native Tauri build/IPC/UI tests, golden runtime scenarios, printers/devices, live-server extraction, target import or cutover.
- Git whitespace check reports 728 lines inside preserved source/code quotations. These were audited and retained as evidence rather than reformatted or hidden by disabling the check. The unrelated extra EOF blank line in the historical prerequisite report was removed. Functional/parity checks remain passing.

## Remaining work / next-session instructions

The owner wants to review whether Step 0 works before using a kickoff prompt. Read this file, AGENTS.md, docs/runbooks/step0-report.md, docs/legacy-inventory.md and the mapping index first. Do not interpret a passing mechanical gate as resolved runtime behavior. Existing U rows and assumed proposals remain visible.

When the owner authorizes the next phase, confirm the intended stopping point (for example framing only). Reuse the completed extraction/mapping unless inputs/tools change; do not discard reviewed notes or encoded-action answers. The new scope must explicitly supersede the Step 0-only instruction before scaffolding or implementation. No ROADMAP.md was created because framing has not begun.

## Decisions needed

- Actual deployed topology and shared users/data ownership; source can be local or Client/Server.
- Preserve versus change for the source-observed stock, delete, timer/state, CRUD failure and Escape behaviors. Each later decision needs evidence and an ADR.
- Legacy access for runtime questions, embedded report SQL/sort confirmation, device/printer behavior and golden scenarios when the relevant slice needs them.
- Treatment of duplicate/orphan/sentinel data and driver-generated composite keys during an explicit import design. No data repair is approved by this handoff.

## Playbook issues

- Auto-discovery picks a backup compile folder; use explicit --compile-dir and --dossier-pdf.
- Some dossier parameter tables omit parameters that remain present in SQL. Query inventories derive full placeholders from SQL and retain both counts.
- Binary evidence paths with spaces fail the validator's bare-file syntax. Template rows cite durable source-manifest.json plus their source-backed notes; no fake binary line numbers were added.
- Windows cp1252 terminal output broke one help command; setup helper now enables UTF-8.
- HFSQL DSN creation ignored supplied path properties; dedicated scratch DSN paths were explicitly checked/set. The ANSI bridge is a local compatibility addition; no FIC decoding was attempted.
- Generated/copy toolkit imagery has existing Pillow deprecation/resource warnings. These did not fail tests; the original playbook was not modified.
