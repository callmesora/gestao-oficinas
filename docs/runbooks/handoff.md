# Handoff — Gestao Oficinas

## Latest delivery — functional readiness

**227/227 required checks verified (100.0%)** on macOS arm64, covering all53 screens and28 reports. The227 requirements and scope are unchanged. Three isolated implementation workers, root integration and fresh independent reviews closed the19 pending real callers. Tested application/test state:`d45ab60` on main; no push. Prior delivery:`docs/migration-history.md#stage-35-functional-readiness`.

Fixed menu dropdowns intercepting later actions and two report price fields printing status flags; prices and flags now have separate explicit bindings (ADR-005). New checks cover eight list/PDF callers, menu Exit/routes/restricted mode, priorities, stock cancel/picker return, inventory, article statements, invalid filters and detail reports.

Evidence:757/757 TS/API/PG/PDF and28 Rust passes. Initial browser run491/505; first corrected replay34/35; final complete-file replay35/35 yields505 unique passing cases. Both failed attempts are retained. Only two test files changed after the initial run; all759 input hashes were checked, with complete changed-file replay and393 exact witnesses supporting the227 cases. Stock tests now await the source Add completion; all existing data/mask assertions remain. No automatic retries or verification-rule changes.

Fresh native macOS business probe passes enrollment, virtual list/offscreen search, persisted save, logout/login and preview/PDF. Its26-page A4 PDF contains all1,002 customer codes exactly once. This proves the built business probe;11 other platform checks remain pending, including installation, OS dialogs/printing/devices/recovery and Windows. Hosted CI was not run. Original/copy fingerprints128/128, source fields and seed are preserved; strict statuses remain764/2,273 verified,2,200 built,458 defaults,481 source questions,23 unmapped and50 exclusions. Owner demo3210/profile and unowned swap remain untouched.

Functional completion is separate from strict WINDEV parity and cutover/import reconciliation, including17 historical import-copy differences. Use `python scripts/functional_acceptance.py --require-complete`; app/test changes expire witnesses. Continue the remaining host/deployment/source gates without inventing proof. Private logs/manifests:`analysis-local/functional-sweep/`; concise history:`docs/migration-history.md#stage-36-functional-sweep`. Existing guide/template checkout and patch are unchanged.

Final gates pass:Python55 + one Windows skip, functional/parity/files/input checks and Chrome progress filters/evidence/layout at1440/390. No new runbook.
