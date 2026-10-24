# MIG-7B — vehicle review

Mode: two separate sequential self-review passes by the same agent/context, as authorized by ADR-007; no independent fresh-context claim. Followed skills/review/SKILL.md against stage-6-vehicles.md, source, schema, generated layouts, ADRs and actual tests. No parity promotion during implementation.

## Pass 1 — 2026-10-25

- Blocking: fixed typecheck ref typing and lint render-time ref mutation; changed RHF watch to the installed useWatch API. Focused typecheck/lint passed afterward.
- Blocking: nested customer form cancellation must not close its picker/vehicle owner. Added cancel-event propagation boundaries and nested dialog keyboard scope checks. The real browser test opens a customer form inside the picker, cancels each child separately, selects an actual customer, and saves the vehicle.
- Parity gap: preserved the query/file filter distinction rather than copying customer reset behavior. Positive actual-browser checks assert the prior query result survives a non-todos mode change with cleared visible term.
- Business/cosmetic: inspected both actual screenshots; scores list 98.6/94.3, form 98.4/94.0. Native select drawing, source caption encoding, table built-ins and masks/keys remain U/designer follow-up; print/UMC are not complete.

## Pass 2 — 2026-10-25

- Blocking: async registration lookup allowed New/selection/filter changes to race the form response. Added a list busy state and guards during lookup/delete; source-row actions also require the latest list response. The actual-response delay regression and full browser rerun passed after this fix.
- Naming/convention: replaced a fixed combo DOM ID with useId for independent instances; legacy data-testid remains COMBO_Codigo. Documented all new developer identifiers in the specs.
- Parity/data boundary: source edit/delete predicates intentionally retain all exact-registration matches. Real PostgreSQL tests prove duplicate retention and predicate scope, unchanged unbound identity, orphan lookup/list distinction, parameterized apostrophes, concurrent duplicate rejection, relationship recheck and rollback. ADR-010 explicitly covers target failure/collation choices; they are not recovered legacy behavior.
- Checks executed so far: nine focused domain/PostgreSQL/API tests including spec-derived GS-VEHICLES-001 comparator PASS; typecheck/lint PASS before latest small UI guards; three real browser workflows plus two visual/control checks PASS before latest guards. Imported replay compared all 4,544 original vehicle projections (seven fields), exact string IDs/text and numeric values through actual authenticated API; repair-order precheck PASS and source hash unchanged. Final full verify/native gates and parity audit still pending.

No unknown legacy locale/selection/default/Esc outcome is made verified by testing a target choice. Native metadata is not native business persistence; recorded legacy replay and human/printer/device checks remain unavailable acceptance work.

## Five-point parity audit

Only SRC-e835e54c37 and SRC-a61ff747bb are promoted: both double-click routes and the exact registration return. The real browser cases explicitly choose a known API/PostgreSQL row and assert the opened edit form or returned registration, so removing the handlers fails them. These event assignments do not depend on unknown initial/empty-result selection, locale, destructive defaults or a new message. They preserve the mapped source behavior and need no change ADR. The source-backed query/save/designer and all assumed rows stay implemented, not verified; query U items, report, UMC and repair-order caller rows retain their prior status. ADRs 001–010 were reread during closure; none silently changes this audit. Final full-suite results are recorded below when terminal.

## Final checks

Full npm run verify PASS on the reviewed state: 58 TypeScript/domain/API/PostgreSQL tests (including both golden comparators), 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 52 browser checks. Existing TanStack warning only. Separate parity --check-files PASS after status updates: 2,273 rows, 23 verified, 71 implemented, 1,698 specified, 481 unmapped, zero excluded. Two added verified rows have the positive audit above. npm run native:check PASS: built Tauri/WebView2/Rust IPC metadata and reload only; business persistence, installer, reports/printing, devices and legacy parity expressly remain outside that result. Full verify session 76866 and native session 72123 are terminal.
