# Handoff — Gestao Oficinas

## Current stage

The first six windows are usable: customer list/form (MIG-7A.1), vehicle list/form plus real customer picker (MIG-7B.1), units list/form (MIG-7D.1). Parents remain in progress for exact retained designer/caller/report/native obligations. Next eligible stage is MIG-7C cleanup, then customer/vehicle/unit designer follow-ups before more leaf workflows. Full migration/commits/pushes authorized; no production cutover. Goal remains active.

Branch main. Customer core b646e15 and vehicle core 42763c2 are pushed. This reviewed unit core is ready for its explicit-file commit/push; inspect git log/status rather than assuming that action from this note.

## Delivered

- Real authenticated API/PostgreSQL workflows through npm run dev:workflows at http://localhost:1431/?workflow=customers, /?workflow=vehicles and /?workflow=units. Open each list title. Native production navigation/access is still MIG-12; these are opt-in isolated development routes, not completed authentication or native business persistence.
- Customers: real list/search/observation/new/edit/cancel/select/delete. Vehicles: source inner-joined list, exact lookup, uppercase new registrations, required messages, registration-predicate edit/delete and repair-order guard. Vehicle BTN_VISION awaits the same real customer list/form, restores caller values and refreshes/seeks exact Codigo.
- Units: two text fields, only nonempty Codigo required, blank description allowed, no uppercase/trim/numeric conversion; immutable code on edit, selected-record update/delete, article-use precheck plus transactional recheck. Source read-only table gets no invented double-click/input-row behavior. Unchanged nullable/text values and unbound identities/provenance remain intact. No migration or original data repair.
- ADRs 008–011 record target transaction/identity/failure/text-key/development defaults. One save/delete = one operation/transaction; SQL parameterized, runtime schemas, exact string identities. Units automatic identifier exhaustion at signed 8-byte maximum rolls back. The same source-range audit/fix for older customer/vehicle allocation patterns is required first in MIG-7C.
- Two separate sequential self-review passes by the same agent/context per ADR-007 for each core, in reviews/customers.md, reviews/vehicles.md and reviews/units.md. No independent fresh-context claim.

## Assumptions and differences

Development sessions are synthetic ADR-009 fixtures; normal server denies protected operations. Exact text keys/lowercase literal search, deterministic ties, safe destructive cancellation and committed-success failure handling are documented defaults, not recovered runtime behavior. Source UMC has no approved exclusion. Complete table search/config/scrollbar/masks/keys/shared-buffer behavior is retained in stage-5-followup.md, stage-6-vehicles-followup.md and stage-7-units-followup.md after cleanup. Repair-order caller continuation stays MIG-8, reports MIG-13, native/installer/devices/human acceptance MIG-15.

## Checks actually executed (Windows)

- Final npm run verify PASS, session 28822 terminal: 67 TS/domain/API/PostgreSQL tests including GS-CUSTOMERS-001, GS-VEHICLES-001 and GS-UNITS-001 export comparators; 2 Rust tests; bindings; parity; 53 generated layouts/154 PNGs; 56 actual browser checks. These goldens are spec-derived, not legacy-recorded. Existing TanStack lint warning only.
- Native check 94516 PASS/terminal: actual built Tauri/WebView2/Rust IPC metadata and reload. It expressly excludes business data, installer, printing, devices and legacy parity.
- Imported readonly official-driver copy: 2,165 customer check retained; 4,544 original vehicle seven-field projections matched; all 4 original unit identity/code/description projections matched. Actual relationship prechecks passed for customer/vehicle/order/article links; source hashes unchanged. Count-only reports: docs/data/*-import-check.json. Imported browser workflows passed before switching to an empty/synthetic runner for publishable screenshots.
- Inspected empty/synthetic visual captures; unchanged 90/60 floors. Units list pixels 98.8/edges 95.6, form 98.6/96.9. Vehicle list 98.6/94.3, form 98.4/94.0. Every opened screen/dialog is configured; framework-dialog missing references/native appearance remain U items. Committed comparisons contain no original business rows.
- Parity --check-files PASS: all 2,273 rows retained; 23 verified, 90 implemented, 1,679 specified, 481 unmapped, no exclusions. No new unit verified row: its broad source/designer/default details remain open. Only the earlier small customer/vehicle event rows are verified; their positive real-path audits are in the reviews. Zero wholly completed windows is still the honest progress count.
- Earlier unit closure attempts exposed retained-row test timing on the faster empty database: customer/vehicle replay now waits for actual enabled Modificar/Selecionar after reads, retaining stale-action guards. Another attempt exceeded the original 60s stopped-cluster restore limit while fixture files ran concurrently. The unchanged 8-case restore suite passed alone, then the complete 67-case suite passed with Vitest fileParallelism=false. No timeout/assertion/test was raised, deleted, skipped or weakened; explicit Promise.all concurrency cases remain. Final complete browser run also passed. Details: reviews/units.md and docs/porting.md.

## Running state

Current empty real PostgreSQL development runner: unified exec session 68586, port1431, includes final units allocation guard. Poll the actual handle before restart. Prior runners 26835, 33923, 63045 and 42690 were explicitly interrupted and are terminal. 73520, 69867 and 33686 failed/terminal; 35946 focused regressions, 79333 isolated restore, 28822 final full verify and 94516 native are successful/terminal. Never restart a job solely because observation timed out.

Commands and all routes: customer-development.md. Load setup/Enter-Prerequisites.ps1 and explicitly set PYTHON to .venv/Scripts/python.exe; Windows py may otherwise lack Pillow. Raw originals, imports, clusters and filled-original screenshots stay ignored. Do not delete preserved inputs.

## Remaining work / next actions

1. Finish explicit-file unit commit/push and verify status/remote. No guard is installed: scripts/guard.py, .githooks/pre-commit and default .git/hooks/pre-commit absent; core.hooksPath unset. Nothing installed or bypassed.
2. Reread handoff/ROADMAP, git pull --ff-only on the clean stage boundary, write bounded MIG-7C brief. Audit/fix signed automatic-ID allocation in customer and vehicle operations with actual max-boundary tests. Extract only patterns already repeated by the three actual workflows (HTTP transport/session and database connection type are candidates); no generic CRUD rewrite. Correct stale architecture/porting claims that no business implementation exists.
3. Complete MIG-7C verification/two reviews and commit/push, then exact retained designer/table follow-ups for all three pairs before remaining leaf workflows. Preserve U/default/caller/report/native obligations and all seeds. Continue through orders/material/labor/stock/navigation/reports/acceptance without waiting for a restart request.

## Decisions needed / limits

No blocking owner decision. Existing skin/customer/vehicle/unit/query U items and human/native/runtime confirmations remain. No legacy code was executed; legacy-recorded golden replay, native business persistence, installer/printer/device and human visual acceptance are unavailable or future gates, not passed checks. The migration is not complete; never mark the goal complete from the six-window milestone.

## Playbook issues / read audit

Read-only playbook unchanged. All 34 Markdown files were enumerated and fully read/re-audited in bounded outputs; the combined 09/10 output that truncated was reread separately. Ignored read/hash inventory is analysis-local/playbook-read-state.json (not published evidence). No need to repeat all 34 unless changed. Whole unit source/maps/specs/parity reads likewise use bounded outputs; do not count truncated material as complete. Root/nearest AGENTS and ADRs govern the project; owner authorization supersedes optional generic guard/review/default-confirmation advice. Never install/alter hooks or agent settings.
