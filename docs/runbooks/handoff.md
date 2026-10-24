# Handoff — Gestao Oficinas

## Current stage

MIG-5b in progress on main; full migration, commits and pushes authorized. Continue ROADMAP.md in order. Hosted native CI diagnosis remains deferred (2b).

## Delivered and checked

- MIG-4 schema/import complete (db441ba); MIG-5a generated inputs complete (6f0be86).
- Shared controls/dialogs at /?skin=controls and the temporary workspace launcher at /?skin=workspace. Workspace instances stack, drag, resize via edges/corners/keyboard, minimize/restore and maximize locally while retaining input; close affects only its instance. Save position persists only validated bounds/maximize state; precedence/lifecycle defaults remain ADR-003/U-SKIN-03 assumptions. Both dialogs have explicit Tab loops; table width/order changes are controlled and gated by source flags. Shared controls apply source anchor flags and explicit rates; encoded-rate defaults remain ADR-003/U-SKIN-01 assumptions. ADR-003 records workspace/caption defaults. No customer workflow/save is implemented; native clipboard, appearance and missing designer metadata remain unverified.
- Full npm run verify PASS: 35 unit tests, 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 36 browser checks. Production build and parity file checks also pass after the column-layout change. Lint retains one TanStack v8 compatibility warning; React Compiler is not enabled.
- Component-region visual floors 90/60 pass; missing-component probe fails without replacing baseline. Screenshot inspected. Separate sequential self-review, same agent/context: reviews/skin.md.
- No parity moves: 17/2,273 verified import rows; 481 unmapped; all 877 SRC IDs retained. Component checks do not prove full-window or native parity.

## Next

Finish MIG-5b: remaining table features and native column-layout acceptance (foundation-controls.md, U-SKIN-04); masks/coercion, remaining optional input flags/automatic-close behavior, calculator, external/file images, encoded custom shortcuts, sounds/chrome; native resize limits/appearance (U-SKIN-02), geometry precedence/storage lifetime (U-SKIN-03), unresolved anchor rates/containers and full-window gates. Physical clipboard and dialog font/wrapping/DPI, anchoring, insets and minimum-title geometry need acceptance; missing source images prevent visual scores. Then MIG-6 queries/helpers and bounded workflows. Import instructions: docs/data/export-runbook.md.

## Decisions needed

No blocking owner decision. Existing U items/proposals remain; native/device/human visual acceptance is still pending.

## Playbook issues

scripts/screen_layout.py omitted root source sizes when the dossier entry was missing. Fixed locally with scoped parsing/tests; read-only playbook checkout unchanged.
