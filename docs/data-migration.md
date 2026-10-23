# Data migration — framing contract

This is the import design boundary, not a production migration or a claim of completed reconciliation. See ADRs 001–002 and apps/server/migrations/AGENTS.md.

## Evidence and source ownership

The immutable source is legacy/GestaoOficinas_TesteIA. The official-driver export is ignored legacy/data/data.sqlite with its manifest/CSVs. docs/data/export-verification.json and docs/data/profile.md describe the 17 tables and 159,668 rows. Never re-read production or decode FIC manually. The ANSI x86 export exception is documented in docs/data/export-runbook.md.

## Required schema/import stage

Before schema v1, inventory every one of the 135 fields and additional driver fields into an explicit mapping: source type, target type, key/identity, null/empty/sentinel semantics, conversion, provenance and reconciliation key. The generated SQLite DDL is evidence only. PostgreSQL is the authoritative target family.

Preserve original IDs, codes, accents, spaces, nulls, date text and monetary values. Duplicated labor IDs require separate internal identity with originals retained. Generated binary composite keys are not business values: reconstruct from components and retain provenance. Do not trust constant unused generated links or totals. Retain negative stock and existing orphans without inventing rejecting constraints. Any unrepresentable record goes into explicit quarantine with its original data kept locally and counted; no silent drops, trimming or repairs.

## Isolation and repeatability

Use a fresh dedicated local target for dry run/import; validate its identity before writing. A normal startup never imports the legacy data automatically. Track source fingerprint, import version, table counts, keys and row identities. Reject overwrite/retry on a populated target unless a documented resumable transaction plan covers it. Test interruption, rollback and repeat execution.

## Reconciliation and recovery

Store machine-readable counts, null/binary counts, key/quantity/duration/balance comparisons and declared transformations. Compare source and target exports with scripts/compare_exports.py using explicit normalization settings; its trim default must not silently erase differences. Preserve a source-to-target identity map where necessary. Test a real PostgreSQL backup and restore plus migration upgrade before acceptance. Raw reports with record data remain ignored.

## Acceptance remaining

No target import has run. Column mappings, schema v1, isolated engine, fixtures, interruption tests and reconciliation are foundation work. Live cutover needs a later explicit plan with freeze, final backup, acceptance and rollback ownership; this authorization does not authorize production access.
