# ADR-002 — Lossless values and exact arithmetic

- Date: 2026-10-23
- Status: Accepted (owner may supersede with a new ADR)
- Decided by: default
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
docs/schema/schema-draft.md and docs/data/profile.md record 17 tables/135 items, money-like reals and decimals, sentinel dates, trailing spaces, duplicate labor identifiers and orphan links. docs/legacy-inventory.md records driver-generated binary keys and unused generated IDs.

## Decision
Use decimal strings across JSON and decimal.js for money and quantities; PostgreSQL NUMERIC stores exact values. Keep signed/unsigned large identifiers as decimal strings at all JS boundaries. Preserve legacy date/time text and empty/zero/NULL distinctions until each mapped operation converts explicitly. Calculated durations use an exact integer count transported as a decimal string with an explicit unit tag (centiseconds, milliseconds, seconds or minutes). Each unit map chooses its legacy-evidenced unit before implementation; conversion is explicit and lossless, never an unlabelled JS number. PostgreSQL stores the count as NUMERIC(scale 0) with its unit, while original legacy duration/time fields remain preserved. No blanket trim or rounding. Preserve duplicate original IDs with a separate internal identity and original-value columns; rebuild business indexes from component columns, retaining import provenance. Do not silently remove or repair anomalous records. Import decisions per column must be explicit before schema v1.

## Consequences and verification
Test positive/negative half rounding from evidence, extreme IDs, duration unit conversions/overflow and negative values, null/empty values, accents and spaces. Reconcile counts, keys, quantities and durations; quarantine/report records that cannot be represented without loss. No invented constraints that reject current negative stock or orphans.
