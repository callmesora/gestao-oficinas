# Handoff — Gestao Oficinas

## Current stage

MIG-5b in progress on main; full migration, commits and pushes authorized. Continue ROADMAP.md in order. Hosted native CI diagnosis remains deferred (2b).

## Delivered and checked

- MIG-4 schema/import complete (db441ba); MIG-5a generated inputs complete (6f0be86).
- Shared controls/dialogs at /?skin=controls and the temporary workspace launcher at /?skin=workspace. Workspace instances stack, drag, resize via edges/corners/keyboard, minimize/restore and maximize locally while retaining input; close affects only its instance. Save position persists only validated bounds/maximize state; precedence/lifecycle defaults remain ADR-003/U-SKIN-03 assumptions. Both dialogs have explicit Tab loops; table width/order changes are controlled and persisted only under Saves col. config. (ADR-003/U-SKIN-05). Shared controls apply source anchor flags and explicit rates; encoded-rate defaults remain ADR-003/U-SKIN-01 assumptions. ADR-003 records workspace/caption defaults. No customer workflow/save is implemented; native clipboard, appearance and missing designer metadata remain unverified.
- Full npm run verify PASS: 40 unit tests, 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 41 browser checks. Production build and parity file checks also pass after the input-control change; source reproduction, input-metadata-only audit and 3 Python layout tests also pass. Lint retains one TanStack v8 compatibility warning; React Compiler is not enabled.
- Edit primitives preserve password masking, positive Text entry limits, Tab exclusion and automatic selection without clearing bound values. Resource inputs share the selection helper; ADR-003/U-SKIN-06 retain native mouse/character-count uncertainty.
- Component-region visual floors 90/60 pass; missing-component probe fails without replacing baseline. Screenshot inspected. Separate sequential self-review, same agent/context: reviews/skin.md.
- No parity moves: 17/2,273 verified import rows; 481 unmapped; all 877 SRC IDs retained. Component checks do not prove full-window or native parity.

## Next

Finish MIG-5b within its current brief. Keep its remaining foundation gaps visible; do not add generic launcher/workspace/skin features without evidence that a customer parity row needs them. After MIG-5b, the next business deliverable is the real `WIN_Table_Clientes` + `WIN_Form_Clientes` workflow in `docs/runbooks/stage-5.md`. Do not wait for all MIG-6 queries/helpers: implement only the patterns this workflow consumes, then add other query/helper units with their first real consumers. The customer print action remains open for MIG-13 unless separately scoped with its report evidence. Import instructions: docs/data/export-runbook.md.

## Decisions needed

No blocking owner decision. Existing U items/proposals remain; native/device/human visual acceptance is still pending.

## Playbook issues

scripts/screen_layout.py omitted root source sizes when the dossier entry was missing. Fixed locally with scoped parsing/tests; read-only playbook checkout unchanged.
