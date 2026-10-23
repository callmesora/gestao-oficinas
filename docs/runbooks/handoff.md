# Handoff — Gestao Oficinas

## Stage — MIG-4 database foundation complete

24 October 2026. Branch main; this report accompanies the MIG-4 stage commit. Commit/push authorized. Full migration remains the goal; continue sequentially from ROADMAP.md, without expanding documentation or tooling beyond the current stage.

### 1. Delivered

- All 17 tables/135 fields mapped in apps/server/src/db/column-mapping.v1.json; schema v1 in apps/server/migrations/. Transactional, checksum-checked migration runner.
- Fresh local PostgreSQL 18.4 test engine; opt-in atomic import, typed provenance, quarantine and refusal to overwrite. Source data/credentials stay ignored and private.
- Fixed an ANSI export reader defect: empty HFSQL strings reported length 1 including the C terminator. Two corrected driver exports agree; comparing every historical/new cell changes only 97,774 single-NUL cells to empty strings. All other cells and 39 scratch files agree. Details: docs/data/ansi-text-correction.json and export-runbook.md.
- Full copied dataset imported, reconciled, backed up cold, restored and reconciled again; CSV comparator passes all 17 tables. Reports: docs/data/postgres-reconciliation.json and postgres-csv-comparison.json.

### 2. Assumptions and differences

ADRs 001–007 unchanged. Exact numeric values plus original notation/provenance; dates/text/NULL/empty/binary preserved. Existing duplicate IDs, negative stock and orphans retained. Text-key collation, runtime integrity and new-record ID/default behavior remain workflow work; no invented constraints or credential scheme.

Parity: 2,273 rows — 17 table-import rows verified, 1,775 specified, 481 unmapped; all 877 SRC IDs retained. No screen or business workflow is verified. Per-unit CSVs are historical Step 0 snapshots; the consolidated matrix is current.

### 3. Checks actually executed

- npm run verify: PASS — 13 Vitest tests (real PostgreSQL), Rust format/clippy/unit/integration, generated bindings, parity and 2 Playwright flows.
- Python extraction/path tests: 4 PASS. ANSI buffer regression cases: 11 PASS. Independent XDD audit: all 135 fields match.
- `npm run db:dry-run -- analysis-local/data-20261024-nulfix/data.sqlite`: PASS — 159,668 rows, zero quarantine/mismatches; rollback, committed rehearsal, cold backup/restore and all-table CSV comparison. Original/historical exports retained.
- Two separate self-review passes, same agent/context as requested; findings/fixes in reviews/database.md. Initial UI navigation timeouts were fixed by restricting Vite's entry scan/watcher to application inputs; no timeout/assertion was relaxed.

Not run: business golden scenarios, native installer/device/printing acceptance, production cutover. Hosted native CDP check still fails; its test is unchanged (roadmap 2b). Hosted core verify/build previously passed; no claim that the overall hosted workflow is green.

### 4. Remaining work

1. MIG-5: shared MediaPlayer skin, all generated layouts/assets, temporary launcher and visual/control checks. Then MIG-6 queries/helpers and bounded leaf workflows in roadmap order.
2. Runtime evidence/U items and business/native acceptance remain open. Do not regenerate the current matrix from Step 0 snapshots or use the historical zero-target-status validator as an implementation gate.

### 5. Decisions needed

No blocking owner decision for the next stage. Keep existing proposals/ADRs and outstanding runtime/device acceptance questions visible; do not infer legacy answers from target tests.
