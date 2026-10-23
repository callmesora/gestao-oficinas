# Independent framing review — MIG-2

23 October 2026. Separate review-only agent using skills/review/SKILL.md. Scope: framing docs/instructions/roadmap, not incomplete scaffold. No parity status changes.

## Findings and fixes

1. Blocking: AGENTS referenced duration representation absent from ADR-002. Fixed before first commit: exact integer/string duration counts, explicit unit tag chosen from each unit evidence, explicit lossless conversions and tests.
2. Naming/convention: porting.md still described framing as future. Fixed: accepted boundaries and concrete reserved homes/owning stages; actual file/function/tests required before translating each construct. No implementation claim.
3. Business/cosmetic: cleanup followed the whole leaf group and was absent later. Fixed: first checkpoint after 2–3 bounded leaf workflows, then checkpoints every 2–3 workflows; next dependent workflow waits.

No parity-gap finding. All changes are documentation only; no native/data/application verification claimed. Follow-up independent review requested after fixes; its outcome is recorded below before closure.

Follow-up independent review: all three findings resolved; no residual findings in the documentation scope. No files changed by reviewer and no application verification claimed.
