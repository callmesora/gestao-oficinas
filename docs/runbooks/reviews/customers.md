# MIG-7A — customer review in progress

Review mode: same agent/context, separate sequential passes as authorized by ADR-007. Followed skills/review/SKILL.md. This file does not close the slice; a second pass and final checks remain required.

## Pass 1 — 2026-10-24

Compared the new operation/domain/API/form/list code, command schemas, generated layouts, actual migration columns and source guards with stage-5.md and ADRs 001–009. No business parity rows have been promoted.

- Blocking: fixed nullable imported Descricao bypassing the required-description check when displayed as an empty edit. The pure rule now rejects NULL/empty descriptions in source order; the regression test passed.
- Parity gap: fixed Escape from a nested customer form reaching the list's close handler. The browser flow now opens/cancels the form and asserts the owning list remains visible. Four customer browser flows passed after the fix.
- Naming/convention: fixed COL_Codpostal mapping to the actual lowercase codpostal field for read/display/sort; other keys follow their exact source spelling. Added non-legacy control identifiers to the specs.
- Business/cosmetic: fixed the 560px foundation canvas clipping the 600px real list by deriving a customer-only minimum from generated source geometry. Inspected both screenshots. Reproducible visual capture uses a real description search/empty result, avoiding accumulated synthetic test rows; the visual floor/tolerance is unchanged. Latest pixel/edge scores: list 98.6/94.0, form 98.3/94.9.

Remaining review/acceptance work: actual imported-copy run, spec-derived golden scenario, full table-feature audit (column search/visibility/scrollbars), keyboard/mask/null edge cases, source modal/system controls and caller/filter coupling, final two-pass findings closure and parity audit. Native metadata/IPC check passed but explicitly does not cover business data. Framework-dialog visual references, native behavior and human approval remain U items. Print remains assigned to MIG-13; UMC has no approved exclusion.

The full verify attempt passed types/lint, 48 unit tests, 2 Rust tests, bindings, parity and inputs, then failed one visual stability assertion due accumulated data. After the reproducible real-UI capture fix, all 46 UI checks passed. Final typecheck and four customer browser flows passed after the Escape fix. A final complete verify still needs to run on the final reviewed state.

## Pass 2 — 2026-10-24

Separate sequential pass by the same agent/context, against the final code, source contracts, schema, ADRs and positive tests; no fresh-context independence is claimed.

- Blocking: fixed stale-record actions while a new filter/refresh is pending. Modification/deletion/selection and row activation now require the latest read; the browser regression delays an actual API response and asserts the dangerous actions are disabled.
- Parity gap: fixed the system-close path not returning the original caller value after a previous selection. ReturnedValue is initialized per instance and delivered on unmount; the real selection flow now covers both system close and Fechar.
- Parity gap/data preservation: unchanged imported fields now remain byte-for-byte strings/NULL rather than being read back through browser normalization. Changed Windows memo text uses CRLF. The real browser/API test asserts the raw memo after create and an unrelated description edit.
- Naming/convention: no remaining blocker. New development/restore/diagnostic identifiers and the source-frame ownership are recorded in the specs/configuration.
- Business/cosmetic: retained exact table/designer follow-up in stage-5-followup.md and ROADMAP, after the early three workflows/cleanup and before further leaf workflows. The parent customer slice stays open. Native metadata/IPC is not business-native acceptance; framework dialogs, native keys/appearance, report and UMC gaps remain open.

Actual checks: full verify PASS (49 unit tests including GS-CUSTOMERS-001 comparator replay, 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 47 browser checks) on the imported scratch runner. After the final CRLF preservation fix: typecheck/lint and all four customer browser flows PASS. Imported source/target count check PASS (2,165 customers) and linked-customer precheck PASS, with no original mutation. Native metadata/IPC PASS as recorded separately. Existing TanStack lint warning only.

### Five-point verification audit

Only four small source-backed rows are promoted: SRC-e6389056f0 (both double-click modes), SRC-01600b8bd1 (positive observation display), SRC-e0b6683735 (Fechar returns origin), SRC-0e07efbaa4 (returns actual selected code). Their real browser tests assert the positive result and fail if the handler/display is removed; actual session/API/PostgreSQL provides the records. Each test explicitly selects a known row, so it does not depend on unresolved initial/after-delete selection. No target change is claimed for these event assignments; broader ADR/default-dependent save/search/designer behavior stays implemented. All seeds and U rows remain; no exclusions. ADRs 001–009 reread before closure. The two windows are usable, not at complete legacy parity.
