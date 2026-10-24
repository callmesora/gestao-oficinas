# Handoff — Gestao Oficinas

## Current stage

MIG-5b.1 shared screen prerequisite closed on main, 2026-10-24. MIG-5 remains open for consumer/native gates. Next: implement MIG-7A Clientes from stage-5.md, then Viaturas and the simplest independent lookup pair, then MIG-7C cleanup. Full migration, routine defaults, commits and pushes remain authorized; no production cutover authorization.

## Delivered

- Read the goal objective attachment and enumerated the local read-only playbook. Resumed existing work; clean checkout and git pull --ff-only was already up to date at 99e098f.
- Split MIG-5b in stage-4.md and ROADMAP: existing verified primitives are the screen prerequisite; full real-window/table/form verification goes with each consumer; remaining native/U-SKIN/dialog/UMC acceptance stays assigned to MIG-15. No feature exclusion or parity status change.
- Actual code inspection: frame/edit/memo/table/workspace and awaited dialogs exist; server app.ts has only liveness. **No customer or other business workflow/save is implemented.** Component galleries are synthetic fixtures.
- Separate sequential self-review by the same agent/context using skills/review/SKILL.md, per ADR-007: reviews/screen-prerequisite.md. Fixed explicit ownership of column visibility/configuration, source table flags and scrollbars. ADRs reread; no new decisions.

## Assumptions and differences

ADR-003 defaults and all U-SKIN-01..06, U-CC16AB27-*, U-C286277B-*, framework-dialog U items remain. Full-window scoring is mandatory in the consuming workflow. No inferred native behavior is verified. Existing schema/import foundation is unchanged (MIG-4 db441ba); generated layouts/assets unchanged (MIG-5a 6f0be86).

## Checks actually executed (Windows)

- Loaded setup/Enter-Prerequisites.ps1; npm run verify: PASS, 40 unit tests, 2 Rust tests, bindings check, parity, 53 layout/154 PNG input checks, 41 browser tests. Existing TanStack incompatible-library lint warning only.
- .venv/Scripts/python.exe scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files: PASS. Unchanged 17/2,273 verified, 481 unmapped, 1,775 specified; all seed IDs retained.
- git diff --check: PASS before closure edits; repeated before commit.
- Both customer unit_evidence.py packs regenerated under ignored analysis-local/units/ for the upcoming implementation.
- Native/package/printer/legacy-runtime/human visual checks not rerun for this documentation-only checkpoint. Existing native and hosted-CDP gaps remain open; no new golden scenario is claimed.

## Remaining work

1. MIG-7A: finish reading whole customer specs/maps/source/schema/callers and relevant library APIs; implement actual authenticated API/PostgreSQL + application + real UI route, required/duplicate messages, search, selection/observation, save/cancel, relationship-protected delete and refresh. Two sequential review passes, real-path/golden/browser/visual/native checks. Auth must deny direct unauthenticated calls; no production credentials or imported legacy-password reuse. Current dev server is liveness only.
2. Keep customer report SRC-4883adab32 open for MIG-13, UMC unresolved; no no-op claims. Native follow-ups and remaining consumer features are enumerated in stage-4.md; MIG-3/2b hosted CDP remains deferred.
3. Viaturas pair, simplest independent lookup pair (choose from mapping/dependencies), cleanup, then remaining ROADMAP slices through acceptance. Do not return to unrelated generic foundation work.

## Decisions needed

No blocking owner decision. Runtime/device/human confirmations remain named U items. Use documented proposals and safe reversible defaults without promoting unknown outcomes to verified.

## Playbook issues

Prior screen_layout.py root-size extraction issue is fixed in application tools; read-only playbook untouched. Some large combined Markdown reads exceeded tool output limits; reread any truncated unit material in bounded chunks before coding. No application implementation began at this checkpoint.
