# ADR-008 — Customer write identity and failure boundary

- Date: 2026-10-24
- Status: Accepted (owner may supersede)
- Decided by: default, constrained by source evidence
- Parity rows affected: SRC-51085948c6, SRC-c02f88ba18, SRC-0bb0e89335; no status promotion by this ADR

## Context and evidence

WIN_Form_Clientes.wdw:38–71 validates zero code then empty description, maps the file buffer and uses HAdd/HModify with explicit duplicate messages. Lines 470–488 suggest max(code)+1 but do not reserve it. The schema and migration 0001 preserve nullable legacy columns and generated internal _row_id; ClientesID is an automatic legacy identifier without a target default. Imported values must remain intact (ADR-002).

## Decision

Use internal _row_id as the opaque decimal-string record identity; keep Codigo and ClientesID as exact decimal strings. A create allocates ClientesID as max(existing positive identifier,0)+1 while holding a transaction-scoped table write lock; never change imported identities. The suggested editable business code is a separate read and does not reserve a code. A collision returns the legacy Codigo duplicate message. Existing code is immutable during edit, matching InputEnabled=False. Updates change only the eight form-bound values, preserving provenance and unbound values. No migration or existing record repair is needed.

Blank form text stays empty rather than being trimmed or converted to NULL. Untouched nullable imported fields remain NULL in the command. Numeric input shape/range is checked at the API boundary; business required checks preserve source order. Deletion rechecks the vehicle relationship in the transaction and locks both tables against concurrent vehicle writes during that check/delete; all future vehicle writes must honor this database boundary.

The source's nonduplicate failure fallthrough is U-C286277B-03, not evidence of a successful write. A failed target transaction rolls back and returns a typed failure; the form must remain open and must not claim persisted success. This explicitly replaces ambiguous failure fallthrough for data safety; resulting error presentation remains unresolved and cannot be verified from this ADR. No new user-facing error text is approved. Authentication remains deny-by-default under ADR-004; only explicit opt-in isolated development identities may precede the full access slice.

## Verification

Use actual PostgreSQL for validation/no-write, exact strings/nulls, create/update, duplicates, immutable edit codes, rollback, concurrent identifier allocation, relationship-protected deletion and restart persistence. UI, golden and native tests are separately required. Retain existing U items and print/UMC gaps.
