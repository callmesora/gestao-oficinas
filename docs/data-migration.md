# Data migration — database foundation

See ADRs 001–002 and apps/server/migrations/AGENTS.md. The schema/import implementation is a foundation; it does not establish business workflow parity or authorize production deployment.

## Evidence and source ownership

The immutable source is legacy/GestaoOficinas_TesteIA. The historical official-driver export is ignored legacy/data/data.sqlite. The current corrected derivative and reproduction command are in docs/data/export-runbook.md; docs/data/ansi-text-correction.json records the reader correction and repeated-export proof. docs/data/profile.md describes the corrected 17 tables/159,668 rows. Never read production or decode FIC manually.

## Schema and import contract

apps/server/src/db/column-mapping.v1.json maps all 135 fields: source type/default/nullability, driver name, PostgreSQL type, conversion and keys. The driver spelling cab_stocks.DATA maps explicitly to analysis field data. apps/server/migrations/0001_legacy_values.sql is schema history; db/migrate.ts applies it transactionally and rejects checksum drift. The generated SQLite draft remains evidence only.

Preserve original IDs, codes, accents, spaces, nulls, date text and monetary values. Duplicated labor IDs require separate internal identity with originals retained. Generated binary composite keys are not business values: reconstruct from components and retain provenance. Do not trust constant unused generated links or totals. Retain negative stock and existing orphans without inventing rejecting constraints. Any unrepresentable record goes into explicit quarantine with its original data kept locally and counted; no silent drops, trimming or repairs.

All tables have an internal _row_id; _import_id/_source_row identify the original row. NUMERIC preserves numeric value; typed UTF-8/base64 provenance also preserves original notation, NULL/empty and bytes. Text/date/time fields are not trimmed or parsed. Source text-key collation remains unresolved: those keys have component lookup indexes, not guessed unique/collation constraints. The duplicate labor ID index stays nonunique. New-record ID/default behavior belongs to its workflow stage; the import never fabricates source values. Legacy password fields are retained privately for provenance, not installed as a new authentication scheme.

## Isolation and repeatability

`npm run db:dry-run -- <copied-export.sqlite>` creates a fresh PostgreSQL 18.4 cluster/database under ignored analysis-local/, with loopback-only access and random credentials. No external database URL or service installation is accepted. It first rolls back a reconciled dry run, then commits a separate scratch rehearsal. Normal application startup never imports. Import locks the target, refuses populated databases and preserves source fingerprints; interruption rolls back the whole import and a clean retry succeeds. Private data/credentials stay out of logs and Git.

## Reconciliation and recovery

Every imported field is compared against source provenance, with exact numeric equality and typed row hashes checked against the manifest. The rehearsal stops PostgreSQL, backs up the complete cluster including WAL, restores a separate copy, restarts and reconciles it. It also runs scripts/compare_exports.py against all 17 CSV pairs: typed cell tags distinguish NULL/empty/binary; numeric notation is canonicalized exactly, with no rounding; every column sets trim=false. Raw CSV/config/cluster files stay ignored. Public count-only results are docs/data/postgres-reconciliation.json and postgres-csv-comparison.json.

## Remaining acceptance

Schema/import, synthetic edge cases, restart/restore and reconciliation are tested by db/legacy-import.test.ts and the real-data rehearsal. The only release is schema v1; upgrades from a future release still need that version's test. Business calculations, concurrency/authorization, runtime collation, golden scenarios, native hardware and production cutover remain later stages. No production access is authorized.
