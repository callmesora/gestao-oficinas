# Handoff — Gestao Oficinas

## Current stage

MIG-7A.1 usable customer core delivered on main; MIG-7A parent remains open for MIG-7A.2 (stage-5-followup.md). Next eligible slice: MIG-7B vehicle list/form, then the simplest independent lookup pair, then MIG-7C cleanup and the retained customer designer follow-up before further leaf workflows. Full migration/commits/pushes authorized; production cutover is not.

## Delivered

- Real Clientes list/form at http://localhost:1431/?workflow=customers through npm run dev:workflows. List/search/selection/observation, new/edit/cancel, ordered required messages, duplicates, transactional saves, relationship-protected delete and explicit confirmation, caller return/close paths. Generated source layouts/assets; React Hook Form; real HTTP API and PostgreSQL, not customer mocks. Normal API denies anonymous requests; opt-in development sessions are ADR-009 fixtures, not legacy authentication.
- ADR-008 records exact string identity/atomic write/failure boundary; ADR-009 records isolated development/search defaults. Original records, provenance and unchanged nullable/text values remain intact; edited memo uses Windows CRLF. No migration was edited or added.
- Imported official-driver copy: 2,165 source/target customers matched, linked-customer precheck passed without original mutation (docs/data/customer-import-check.json). Four browser workflows also passed over this imported scratch database. GS-CUSTOMERS-001 is explicitly spec-derived; actual API/PostgreSQL export comparison passes without trimming.
- Two sequential self-review passes by the same agent/context, per ADR-007: reviews/customers.md. Fixed nullable required-description bypass, Codpostal key case, nested Escape closing its owner, clipped source-height list, stale-selection actions while reads are pending, system-close caller return and CRLF preservation on unrelated edits.
- Parent customer ticket stays in progress. The exact designer/table/caller/mask gaps are assigned to MIG-7A.2 after early workflows/cleanup; native/framework-dialog/human acceptance stays MIG-15, print stays MIG-13, UMC has no approved exclusion. No feature or seed row removed.

## Checks actually executed (Windows)

- Full npm run verify passed after the golden/API/import work: 49 unit tests, 2 Rust tests, bindings, parity, 53 layouts/154 PNGs, 47 browser checks. Final full rerun after the CRLF fix also PASS: 49 unit tests, 2 Rust tests and 47 browser checks, with bindings/parity/layout checks. Session 70041 is terminal. Final focused typecheck/lint and four customer browser flows also passed.
- npm run native:check PASS: actual built Tauri/WebView2/Rust IPC metadata and reload. Its evidence explicitly excludes business data, installer, reports/printing, devices and legacy parity; customer native persistence is not verified.
- Visual controls/captions/assets and 90/60 floors passed for both real windows. Latest scores: list pixels 98.6 / edges 94.0, form 98.3 / 94.9. Screenshots inspected; comparisons in docs/evidence/visual/. Stable list scoring uses an actual search/empty result, with unchanged floor/tolerance.
- Parity --check-files PASS: 2,273 rows; 21 verified, 34 implemented, 1,737 specified, 481 unmapped, zero exclusions; all SRC seeds retained. Four newly verified rows are only double-click routing, observation display, Fechar origin and selected-code return. reviews/customers.md records the five-point positive real-path audit. Broad save/search/designer/default/U behavior is not overclaimed.
- Previous failed checks were fixed: PYTHON needed the .venv interpreter for Pillow; accumulated synthetic rows changed a visual capture; nested modal Escape and stale-selection/caller-return defects have positive regressions. Existing TanStack lint warning only. git diff --check passed; repeat before commit.

## Running state and next actions

The imported-copy development runner is live in unified exec session 26835 at port 1431. The prior empty runner 39099 was explicitly interrupted and is terminal. This runner's database is isolated; the corrected copied export is read-only. Poll the live handle before restarting; do not infer process state from this note alone. Commands: customer-development.md. Raw clusters/exports remain ignored.

1. Final verification 70041 passed; progress regenerated. Commit/push contains only this chat's explicit customer files. No guard script/hook exists: scripts/guard.py and .githooks/pre-commit absent; core.hooksPath unset. The absent-script attempt was file-not-found, not an approval/guard rejection; nothing was installed/bypassed.
2. Reread ROADMAP/handoff and write a bounded MIG-7B brief before vehicle coding. Full vehicle maps/specs/parity/source/query evidence and ADRs still need their read/audit. Some vehicle mapping has been read, but no vehicle implementation has begun.
3. Deliver the vehicle pair and simplest independent lookup pair, then cleanup and the exact retained customer follow-up. Do not expand generic launcher/workspace capabilities without a consuming parity ID. Customer source/system controls belong to their owning frame; non-legacy development/restore/diagnostic identifiers are recorded in screen specs.

## Decisions needed and limits

No blocking owner decision. U-SKIN-01..06, customer U items and runtime/device/human confirmations remain. Locale equivalence, cross-window HFSQL/filter edge outcomes, full masks/keys/table features, modal native behavior and framework-dialog visuals remain unverified. Proposed/safe defaults are not recovered runtime evidence. Recorded legacy golden replay was unavailable and legacy code was not executed. The whole migration is not complete.

## Playbook issues

Read-only playbook unchanged. Earlier root-size extraction fix remains in application tooling. Large combined reads can truncate: use bounded chunks for whole unit files. The prerequisite script loads .venv on PATH but Windows py may still select another interpreter; explicitly set PYTHON to .venv/Scripts/python.exe when running npm visual checks.
