# ADR-010 — Vehicle registration operations and failure boundary

- Date: 2026-10-24
- Status: Accepted (owner may supersede)
- Decided by: default, constrained by source evidence
- Rows: SRC-0c045cf25e, SRC-626e614259, SRC-cbded69d95; no parity promotion

## Evidence

WIN_Form_Viaturas.wdw:34–70 validates registration, customer, make and model, uppercases registration, creates with HAdd, or updates by the original registration. WIN_Table_Viaturas.wdw:340–363 checks repair-order use before deleting by registration. The schema declares a unique registration but migration 0001 deliberately retains text keys without guessed HFSQL collation constraints. docs/data/profile.md records 4,544 distinct registrations, zero year/month values, and trailing spaces in make/model. ADR-002 preserves imported anomalies; ADR-008 already locks Clientes then Viaturas for customer deletion.

## Decision

Retain internal string row identities for table rendering. Lookup, edit and delete use the original registration predicate, including every exact matching record, as the source SQL does; do not silently reduce edits/deletes to one internal row. A missing lookup returns missing and never saves an invented blank record. Registration is immutable during edit. Creating allocates ViaturasID as max(existing positive value,0)+1 under a table lock and rejects an existing exact uppercase registration with the source duplicate message. This exact comparison is a reversible interim choice: HFSQL text-key case/accent/space equivalence remains U-C9675195-03, not verified. No migration, cleanup or inferred text-key uniqueness constraint is added.

Writes lock Clientes then Viaturas in SHARE ROW EXCLUSIVE mode. Vehicle deletion additionally locks ordem_reparacao in that order before rechecking and deleting; future order writes must honor that order. The preconfirmation check is repeated in the single delete transaction. No new customer foreign-key or calendar constraint is introduced. Values use exact customer identifier strings, unsigned schema ranges for year/month (including zero), and unchanged imported nullable/text values. Browser masks and locale remain separate U items.

All write failures roll back and return typed failure rather than claiming source fallthrough success. Keep the form open without inventing an approved message. This explicitly replaces ambiguous unchecked failure fallthrough for safety, as ADR-008 does for customers. Destructive dialog defaults stay cancellation under ADR-006 and cannot be marked verified pending runtime confirmation.

Read filtering uses literal parameterized substrings with the ADR-009 lowercase interim comparison, never SQL interpolation. Maintain visible search mode/text separately from the effective query filter: non-todos source buttons deactivate Viaturas, not QRY_select_viaturas; todos or an actual empty text modification removes the query filter. Join/orphan/duplicate behavior and source registration ordering are preserved; deterministic tie order is only an interim default.

## Checks required

Real PostgreSQL/API tests for ordered validation/no-write, exact IDs/nulls/text, duplicate allocation races, edit/delete predicate scope, orphan retention, repair-order protection and rollback. Actual browser tests must cover nested customer selection/cancel, both filter states and stale-read protection. Golden, visual and native evidence remain separate gates; no U item is resolved by this ADR.
