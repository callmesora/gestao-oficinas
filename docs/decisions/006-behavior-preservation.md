# ADR-006 — Preserve observed rules with safe unresolved choices

- Date: 2026-10-23
- Status: Accepted (owner may supersede with a new ADR)
- Decided by: default
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
docs/legacy-inventory.md lists stock/deletion, CRUD error, timer, max+1 and Escape risks. docs/evidence/encoded-actions.md holds proposals rather than observed answers. The owner authorized assumptions and defaults, not unrecorded redesign.

## Decision
Preserve source-observed behavior including apparent business bugs unless a later ADR explicitly changes the particular behavior. Parameterize SQL and keep credentials out of diagnostics as required by the guide. Apply its destructive-choice exception: unresolved Escape/default/overwrite choices choose cancellation and stay implemented with a U item until resolved. All other proposed behaviors cite their proposal and assumed confidence. No feature exclusions are accepted during framing.

## Consequences and verification
Slice tests must distinguish source-backed results, assumed proposals and spec-derived expectations. Unknown choices cannot become verified by pinning the implementer choice in a test. Every intentional change names its ADR; keep every SRC seed.
