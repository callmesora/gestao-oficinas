# Handoff — Gestao Oficinas

## Current stage

Full migration goal remains active. First six real windows are usable (customers, vehicles and units list/form), not complete parity. Cleanup MIG-7C ec9599e and customer header search/visibility MIG-7A.2a ecc4fe9 are pushed. Bounded MIG-7A.2b is implemented, reviewed, checked and pushed as 0c3576f; the accompanying generated progress JSON is included in this closure update. Next independent leaf: MIG-7E, stage-9-descriptive-states.md. ADR-014 schedules mandatory MIG-7C2 after two additional leaf workflows, before a third; it retains customer/vehicle/unit modal geometry, numeric entry, exact menu/scrollbar tooltip and caller/context obligations. Full parents remain In progress; no exclusions or status promotions.

## Delivered and opening

Run npm run dev:workflows; actual authenticated isolated API/PostgreSQL routes: http://localhost:1431/?workflow=customers, /?workflow=vehicles and /?workflow=units. Open the list title. Real list/search/new/edit/cancel/select/delete and vehicle customer picker work. Units preserve text keys, blank description, immutable edit code and article-protected deletion. Transactions, exact string IDs/provenance and signed source automatic-ID exhaustion are tested. Production navigation/access remains MIG-12; these routes are development-only under ADR-009.

MIG-7A.2b preserves exact raw named table options through the regenerated pipeline (24 layouts, 28 table descriptors additive metadata only), with customer-only opt-in. Actual visible vertical track, horizontal automatic mode, pixel scroll, truncated cell tooltip and column right-click configuration are checked. Known keyboard/code/memo/chrome behavior and real vehicle nested customer creation/selection/filter restoration are tested. Dialog sizing defects exposed by visible scrollbars and the last-column magnifier overlap were fixed. Native tooltip/skin/menu composition and missing full designer work remain precise U obligations. See ADR-013 and reviews/customer-designer-mapping.md / customer-designer-implementation.md.

## Checks actually executed

- Complete npm run verify phase 8706 PASS: 70 TS/domain/API/PostgreSQL tests including three spec-derived golden comparators; 2 Rust tests; bindings; parity; 53 layouts/154 PNGs; 61 browser cases. The following native phase initially failed opening its report before native execution, so combined command exited 1. Standalone helper retry passed at 07:22:47 UTC.
- Final 48812 exited 0 after latest header-spacing change: 20 actual customer/vehicle/control/visual browser checks and npm run native:check, rebuilt Tauri executable/actual WebView2/Rust IPC metadata/reload at 2026-10-25T07:27:52.785Z. Native report explicitly excludes business data, installer, printing, devices and legacy parity.
- Four Python generator tests and ui_inputs --check-source passed. Generated original geometry/captions/flags/assets unchanged. All six final empty/synthetic target images inspected and comparison PNGs refreshed; unchanged 90/60 floors.
- Stronger scrollbar assertion first failed (2px border instead of track): installed Playwright hides scrollbars by default. Omit that single launcher default, keep positive width assertion. This exposed two real dialog fit defects; fixed without weakening assertions or floors. Failures and fixes recorded in the review.
- Earlier read-only imported checks: 2,165 customer, 4,544 vehicle seven-field and 4 unit identity/code/description projections matched; actual relationship prechecks passed and source hashes unchanged. Count-only docs/data/*-import-check.json; original imports/screenshots stay ignored. Current runner contains empty/synthetic records only.
- Parity remains all 2,273 rows: 23 verified, 90 implemented, 1,679 specified, 481 unmapped, zero exclusions. Zero wholly completed windows is still honest. No broad designer row promoted.

Two sequential same-agent/context implementation reviews under ADR-007, not independent fresh-context reviews. Mapping skills applied before mapping changes. ADRs through 014 rechecked at closure. Final progress/parity/diff checks accompany the commit.

## Running state and commands

Main checkout. No other writer known. Empty/synthetic real API/PostgreSQL/Vite runner 59781 has current HMR frontend; poll actual handle before restart. Final 48812 terminal successful. Never restart merely because observation timed out. Load setup/Enter-Prerequisites.ps1 and set PYTHON to .venv/Scripts/python.exe (Windows py may lack Pillow); UTF8 required. Preserve ignored originals/import clusters/evidence packs.

No guard installed at checked boundary: scripts/guard.py, .githooks/pre-commit, .git/hooks/pre-commit absent; core.hooksPath unset. Nothing installed, modified or bypassed. Commit explicit owned files only, push authorized, then clean-boundary git pull --ff-only before next slice.

## Next actions and limits

1. MIG-7A.2b 0c3576f pushed; git pull --ff-only reported already up to date. Closure also retains the generated docs/progress/index.json visual scores. Read current roadmap and stage-9-descriptive-states.md before implementation.
2. MIG-7E: full maps already read; full specs/parity/original source/images/caller/schema still required before code. Selector returns Descricao, not Codigo; 30px rows/previous-next and source mode rules retained. Record write/identity/failure defaults in an ADR first. No schema migration expected. Inspect source image for corrupted extracted field captions rather than silently normalizing them. Later real labor caller stays with its consumer, report MIG-13. No leaf implementation code yet.
3. Then one additional evidenced leaf, mandatory MIG-7C2, remaining orders/material/labor/stock/navigation/reports/acceptance. Do not stop at another milestone.

No blocking owner decision. Known target gaps are scheduled work, not native-only. Legacy-recorded golden replay, installer/printing/devices/native business persistence and human/runtime visual acceptance are future/unavailable gates, never passed claims. No production connections/cutover or legacy execution.

## Read audit

All 34 read-only playbook Markdown files fully read/re-audited previously; ignored hash inventory analysis-local/playbook-read-state.json. Do not repeat unless changed. Customer full maps/specs/parity/source and generator/tests read; raw dossier rechecked and unit evidence before/after identical (17 blocks, 8 encoded actions, 22 seeds); actual customer CSV has 32 rows. Truncated combined outputs never count as whole reads. Whole states maps read in bounded outputs; continue remaining evidence. Root/nearest AGENTS, relevant ADRs and porting patterns govern every slice. Preserve all seed/U IDs, no secrets or raw legacy material published.

MIG-7E read continuation: combined specs/source outputs truncated, so do not count those as whole reads. Table spec lines 1–90 were read in a bounded output; remaining lines must be read separately. Form spec and both parity CSVs were visible in the earlier combined output, but use separate bounded reads before coding. No leaf code changed.
