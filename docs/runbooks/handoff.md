# Handoff — Gestao Oficinas

## Current stage

The first six windows are usable: customer list/form (MIG-7A.1), vehicle list/form plus real customer picker (MIG-7B.1), units list/form (MIG-7D.1). Parents remain in progress for exact retained designer/caller/report/native obligations. MIG-7C cleanup is complete (stage-8-cleanup.md); next is the customer designer follow-up, then vehicle/unit designer follow-ups before more leaf workflows. Full migration/commits/pushes authorized; no production cutover. Goal remains active.

Branch main. Customer core b646e15, vehicle core 42763c2 and unit core 95c4794 are pushed. Checkout was clean after the unit push; git pull --ff-only reported already up to date before the cleanup brief. MIG-7C adds tested signed customer/vehicle automatic-ID limits, extracts only repeated HTTP transport and the connected-client type, and corrects stale documentation. Inspect git status before editing; cleanup explicit-file commit/push follows its checks.

## Delivered

- Real authenticated API/PostgreSQL workflows through npm run dev:workflows at http://localhost:1431/?workflow=customers, /?workflow=vehicles and /?workflow=units. Open each list title. Native production navigation/access is still MIG-12; these are opt-in isolated development routes, not completed authentication or native business persistence.
- Customers: real list/search/observation/new/edit/cancel/select/delete. Vehicles: source inner-joined list, exact lookup, uppercase new registrations, required messages, registration-predicate edit/delete and repair-order guard. Vehicle BTN_VISION awaits the same real customer list/form, restores caller values and refreshes/seeks exact Codigo.
- Units: two text fields, only nonempty Codigo required, blank description allowed, no uppercase/trim/numeric conversion; immutable code on edit, selected-record update/delete, article-use precheck plus transactional recheck. Source read-only table gets no invented double-click/input-row behavior. Unchanged nullable/text values and unbound identities/provenance remain intact. No migration or original data repair.
- ADRs 008–011 record target transaction/identity/failure/text-key/development defaults. One save/delete = one operation/transaction; SQL parameterized, runtime schemas, exact string identities. Units automatic identifier exhaustion at signed 8-byte maximum rolls back. MIG-7C now applies the same signed-source guard to customers/vehicles; actual API tests allocate the final valid ID then prove exhaustion does not write. Shared isolatedWorkflowPost and DatabaseConnection retain each workflow’s distinct business boundaries.
- Two separate sequential self-review passes by the same agent/context per ADR-007 for each core, in reviews/customers.md, reviews/vehicles.md and reviews/units.md. No independent fresh-context claim.

## Assumptions and differences

Development sessions are synthetic ADR-009 fixtures; normal server denies protected operations. Exact text keys/lowercase literal search, deterministic ties, safe destructive cancellation and committed-success failure handling are documented defaults, not recovered runtime behavior. Source UMC has no approved exclusion. Complete table search/config/scrollbar/masks/keys/shared-buffer behavior is retained in stage-5-followup.md, stage-6-vehicles-followup.md and stage-7-units-followup.md after cleanup. Repair-order caller continuation stays MIG-8, reports MIG-13, native/installer/devices/human acceptance MIG-15.

## Checks actually executed (Windows)

- MIG-7C final npm run verify PASS, session 87926 terminal: 69 TS/domain/API/PostgreSQL tests including GS-CUSTOMERS-001, GS-VEHICLES-001 and GS-UNITS-001 export comparators; 2 Rust tests; bindings; parity; 53 generated layouts/154 PNGs; 56 actual browser checks. These goldens are spec-derived, not legacy-recorded. Existing TanStack lint warning only.
- MIG-7C native check 40451 PASS/terminal: actual built Tauri/WebView2/Rust IPC metadata and reload. It expressly excludes business data, installer, printing, devices and legacy parity.
- Imported readonly official-driver copy: 2,165 customer check retained; 4,544 original vehicle seven-field projections matched; all 4 original unit identity/code/description projections matched. Actual relationship prechecks passed for customer/vehicle/order/article links; source hashes unchanged. Count-only reports: docs/data/*-import-check.json. Imported browser workflows passed before switching to an empty/synthetic runner for publishable screenshots.
- Inspected empty/synthetic visual captures; unchanged 90/60 floors. Units list pixels 98.8/edges 95.6, form 98.6/96.9. Vehicle list 98.6/94.3, form 98.4/94.0. Every opened screen/dialog is configured; framework-dialog missing references/native appearance remain U items. Committed comparisons contain no original business rows.
- Parity --check-files PASS: all 2,273 rows retained; 23 verified, 90 implemented, 1,679 specified, 481 unmapped, no exclusions. No new unit verified row: its broad source/designer/default details remain open. Only the earlier small customer/vehicle event rows are verified; their positive real-path audits are in the reviews. Zero wholly completed windows is still the honest progress count.
- Earlier unit closure attempts exposed retained-row test timing on the faster empty database: customer/vehicle replay now waits for actual enabled Modificar/Selecionar after reads, retaining stale-action guards. Another attempt exceeded the original 60s stopped-cluster restore limit while fixture files ran concurrently. The unchanged 8-case restore suite passed alone, then the complete 67-case suite passed with Vitest fileParallelism=false. No timeout/assertion/test was raised, deleted, skipped or weakened; explicit Promise.all concurrency cases remain. Final complete browser run also passed. Details: reviews/units.md and docs/porting.md.

## Running state

Prior empty runner 68586 was polled then explicitly interrupted for updated API code. Full verification 87926 started/stopped a fresh isolated real API/PostgreSQL server; no permanent runner is currently active. Focused 36120 passed 23 tests; full 87926 and native 40451 are PASS/terminal. Never restart a job solely because observation timed out.

Commands and all routes: customer-development.md. Load setup/Enter-Prerequisites.ps1 and explicitly set PYTHON to .venv/Scripts/python.exe; Windows py may otherwise lack Pillow. Raw originals, imports, clusters and filled-original screenshots stay ignored. Do not delete preserved inputs.

## Remaining work / next actions

1. Commit/push explicit MIG-7C files, then verify clean status/remote. No guard is installed: scripts/guard.py, .githooks/pre-commit and default .git/hooks/pre-commit absent; core.hooksPath unset. Nothing installed or bypassed.
2. Reread handoff/ROADMAP and stage-5-followup.md; synchronize git pull --ff-only at clean boundary. Complete customer table/search/visibility/scrollbar/mask/key/caller follow-up with real consumer evidence; then equivalent vehicle and units follow-ups. Two sequential same-agent/context reviews for cleanup are in reviews/cleanup.md under ADR-007. ADRs 001–011 reread; no new decision appeared.
3. Continue remaining leaves/orders/material/labor/stock/navigation/reports/acceptance. Preserve every seed and U/default/caller/report/native obligation. No parity promotion follows from cleanup: 23 verified/90 implemented/1679 specified/481 unmapped, zero exclusions. Full migration remains active.

## Decisions needed / limits

No blocking owner decision. Existing skin/customer/vehicle/unit/query U items and human/native/runtime confirmations remain. No legacy code was executed; legacy-recorded golden replay, native business persistence, installer/printer/device and human visual acceptance are unavailable or future gates, not passed checks. The migration is not complete; never mark the goal complete from the six-window milestone.

## Playbook issues / read audit

Read-only playbook unchanged. All 34 Markdown files were enumerated and fully read/re-audited in bounded outputs; the combined 09/10 output that truncated was reread separately. Ignored read/hash inventory is analysis-local/playbook-read-state.json (not published evidence). No need to repeat all 34 unless changed. Whole unit source/maps/specs/parity reads likewise use bounded outputs; do not count truncated material as complete. Root/nearest AGENTS and ADRs govern the project; owner authorization supersedes optional generic guard/review/default-confirmation advice. Never install/alter hooks or agent settings.
