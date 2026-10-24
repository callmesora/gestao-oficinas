# Handoff — Gestao Oficinas

## Current stage

MIG-7A.1 customer core and MIG-7B.1 vehicle core delivered; parents remain open for retained designer/caller work. Next: select and deliver the simplest independent lookup pair, then MIG-7C cleanup, customer MIG-7A.2 and vehicle MIG-7B.2 before further leaf workflows. Full migration/commits/pushes authorized; production cutover is not. The goal remains active and the full application is not complete.

## Delivered

- Real customer list/form and vehicle list/form at http://localhost:1431/?workflow=customers and /?workflow=vehicles through npm run dev:workflows. Authenticated real API/PostgreSQL, source-generated layouts/assets, actual add/edit/cancel/search/select/delete and caller-origin returns. Vehicle BTN_VISION awaits the actual customer list/form, refreshes customer data and seeks the returned exact Codigo.
- Vehicle list preserves the inner join/orphan distinction, registration order and separate visible mode/text versus effective query filter. Edits/deletes preserve the source original-registration predicate (including matching duplicates). Required registration/customer/make/model messages and uppercase create behavior follow source. ADR-010 records exact text-key/identity/lock/failure defaults; no migration or imported anomaly repair.
- Customer/vehicle writes are single transactions. Vehicle delete rechecks repair-order use under ordered table locks; customer links use the same boundary. Rollback returns typed failure without invented legacy message or false persisted success. Normal server denies protected operations; opt-in ADR-009 development identity is not access-screen parity.
- Imported readonly copied export: 2,165 customer match check retained; all 4,544 original vehicle query projections matched the seven actual API fields, including spaces/exact IDs, with repair-order precheck and unchanged source hash (docs/data/vehicle-import-check.json). GS-CUSTOMERS-001 and GS-VEHICLES-001 are spec-derived real API/PostgreSQL comparator replays, not legacy-recorded goldens.
- Two separate sequential self-review passes by the same agent/context per ADR-007 for each core: reviews/customers.md and reviews/vehicles.md. Vehicle fixes include nested cancel/key ownership, preserved picker state during minimize, async lookup action races, stable per-instance combo ID and immutable original-registration writes.

## Checks actually executed

- Final full npm run verify PASS (session 76866 terminal): 58 domain/API/PostgreSQL/TS tests including both golden comparators, 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 52 browser checks. Existing TanStack warning only. Focused vehicle run also passed 9 tests; three real vehicle browser flows and both visual checks passed separately.
- npm run native:check PASS (session 72123 terminal): actual built Tauri/WebView2/Rust IPC metadata and reload. This excludes business data, installer, printing, devices and legacy parity; no native business persistence claim.
- Visual controls/captions/assets and unchanged 90/60 floors PASS. Inspected images: vehicle list pixels 98.6/edges 94.3, form 98.4/94.0. Customer scores retained 98.6/94.0 and 98.3/94.9. Committed JSON and comparison images under docs/evidence/visual. List checkpoints use actual empty search results, not mock data.
- Parity --check-files PASS after changes: 2,273 retained rows; 23 verified, 71 implemented, 1,698 specified, 481 unmapped, zero excluded. Only two new vehicle verified rows: SRC-e835e54c37 both double-click routes and SRC-a61ff747bb exact selected registration return. Positive real-path five-point audit in reviews/vehicles.md. Broad save/query/filter/designer/assumed behavior stays implemented. Progress still counts zero wholly completed windows.
- Failed type/lint/browser attempt was fixed (ref typing/render-time ref, nested modal ownership and waiting for source-required reload after edit cancellation). Final full suite includes the actual delayed-lookup regression. No tests weakened/skipped; no visual floors changed. git diff --check passed; repeat at commit.

## Running state

Imported-copy development runner is live in unified exec session 33923 on port 1431, with new vehicle API routes. Previous runner 26835 was explicitly interrupted and is terminal. Poll the actual handle before any restart; observer timeout is not process termination. Original and copied export inputs remain intact; scratch databases remain ignored. Commands and both routes: customer-development.md. Set PYTHON explicitly to .venv/Scripts/python.exe after loading prerequisites (Windows py may lack Pillow).

## Next actions

1. Finish explicit-file vehicle commit/push after progress/status review. No guard exists: scripts/guard.py and .githooks/pre-commit absent; core.hooksPath unset. Nothing installed or bypassed.
2. Reread this handoff/ROADMAP. Unidades is the leading simplest lookup candidate: full two unit maps read; table is source read-only, form has two text fields, only code required, delete checks artigos. Partial spec reads truncated and must be completed in bounded chunks before coding; still need full parity/source/dossier/schema/images and bounded brief. Other candidate excerpts do not count as full reads. No lookup code yet.
3. Deliver the third pair, then MIG-7C and exact customer/vehicle follow-ups. Preserve report/native/UMC/U obligations and all seeds; do not use generic infrastructure as a substitute for real workflows. Commit/push each reviewed slice and continue autonomously.

## Decisions needed and limits

No blocking owner decision. Existing skin/customer/vehicle/query U items remain; locale equivalence, two-instance HFSQL buffer/filter coupling, empty/missing selection, complete table built-ins/masks/keys and native/framework-dialog/human acceptance are unverified. Specific retained work: stage-5-followup.md and stage-6-vehicles-followup.md after cleanup, before more leaf screens; repair-order caller continuation with MIG-8, printing MIG-13, native/installer/device/human MIG-15. UMC has no approved exclusion. Legacy runtime was not executed; recorded golden/native business persistence still unavailable. Defaults are assumptions, not recovered evidence.

## Playbook notes

Read-only playbook unchanged. Main agent is the sole writer. Large combined reads may truncate; do not count those as complete. Never install/alter guard hooks or agent settings. Preserve raw originals and scratch evidence under existing handling rules; cite committed/source/dossier paths, never analysis-local paths as published evidence.
