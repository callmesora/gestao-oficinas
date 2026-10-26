# Handoff — Gestao Oficinas

## Latest delivery — functional readiness

Owner approved practical functional readiness as the primary report measure (ADR-007). macOS arm64/main over `fd76baa`; no push. Two scope workers cover all 53 screens / 28 reports; root owns integration/tracking and an independent reviewer checks evidence/denominators. Prior delivery: `docs/migration-history.md#stage-34-verification-wave`.

**208/227 required checks verified (91.6%)**; 37/53 screens and 26/28 reports pass all applicable cases. This new scoped measure reuses existing executed evidence; it does not claim additional application features or exact WINDEV equivalence. The 19 pending checks remain explicit in `docs/functional-acceptance.json`: eight list-to-PDF callers, menu Exit/report routes, repair priority edit, stock cancel/picker return, inventory grid/print, positive article statement, invalid labor filter and detail-report callers and restricted articles-toolbar return.

Canonical cases cite exact tests, OS and the compatible delivery commit. Omitted units remain pending; changed application/tests/runtime inputs invalidate prior evidence. Primary workflow coverage, strict parity and per-host installation/dialog/printing/device/recovery acceptance are displayed separately. The native macOS business probe passes; packaged installation and the other native capabilities are pending in this inventory. Hosted CI and Windows were not run here.

Strict matrix/source/seed untouched:764/2,273 verified(33.6%),814 strict(35.8%),2,200 built(96.8%),458 target defaults,481 unresolved-source rows, 23 unmapped and50 approved exclusions. Existing fd76baa proof:756 TS/API/PG/PDF tests and 486 unique browser cases across initial+corrected runs, plus native WK enrollment/1001-row list/save/logout/login/26-page PDF. Source/legacy data and owner demo3210/profile remain untouched; preserve unowned swap.

Next: exercise the 19 pending real callers/interactions and record fresh exact witnesses. Check `python scripts/functional_acceptance.py --check`, run relevant tests, regenerate progress; keep all source/native gaps distinct. Checks: Python 55 pass + 1 Windows skip, parity/files and functional gates; Chrome 1440/390 filters/evidence/layout pass. Guide 96/96; local 6fbaf56 and portable `setup/patches/functional-readiness.patch` against be3a8d9. Details in `docs/migration-history.md#stage-35-functional-readiness`.
