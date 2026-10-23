# MIG-4 review

Two separate sequential self-review passes using skills/review/SKILL.md and ADRs 001–002/004/007, per owner preference. Same agent/context; not an independent-agent review. Source/XDD, complete changed code and actual test results were checked.

Findings corrected:

- Export: HFSQL empty ANSI strings report length 1 including the terminator. CharacterCount excludes only that known mismatch and rejects other embedded terminators; eleven buffer cases cover it. Two complete scratch-driver reads agree. All 159,668 historical/new rows compared; only 97,774 single-NUL cells differ. See docs/data/ansi-text-correction.json.
- Quarantine: JSONB cannot hold embedded NUL text. Provenance now encodes UTF-8 text and binary separately as base64, retaining actual embedded NUL values without stripping them; a real PostgreSQL test checks quarantine and reconciliation.
- Test lifecycle: Windows pg_ctl children inherited captured output handles, delaying completion until timeout. Utilities now use ignored stdio and bounded exit events; startup failure stops only the newly created cluster. Backup uses a clean stopped cluster, not a live-file copy.
- Verification: Vite was scanning copied evidence/test clusters, repeatedly timing out on first navigation. Its optimizer now starts at index.html and its watcher excludes private/tool/runtime directories. Both existing browser tests pass without assertion or timeout changes.
- Evidence: migration SQL uses LF; all 135 column names/types/nullability are asserted against actual PostgreSQL. Failed rehearsal starts invalidate the prior success report. CSV comparison disables trimming on every column and distinguishes NULL/empty/binary.

Final checks: npm run verify passes (13 Vitest tests, Rust format/clippy/unit/integration, bindings, parity, 2 Playwright flows); 4 Python tests pass. Database tests include interruption across tables, populated-target refusal and simultaneous imports. Full-data dry run/committed import/restore/CSV comparison pass for 159,668 rows with zero quarantine/mismatches. The 17 verified table rows cover import/value preservation only; all 481 unresolved rows and 877 source IDs remain. The five verified-row checks were applied: executed assertions, real PostgreSQL path, unknown runtime enforcement outside these rows, ADR-002 differences cited, and all ADRs reread.

Runtime collation/integrity, source ID generation on new writes, authentication, business arithmetic, legacy golden scenarios and production/native acceptance remain outside this import stage. No business parity is claimed verified. Hosted native CDP failure is unchanged and remains roadmap 2b.
