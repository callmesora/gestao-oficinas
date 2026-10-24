# Handoff — Gestao Oficinas

## Current stage

MIG-5b in progress on main; full migration, commits and pushes authorized. Continue ROADMAP.md in order. Hosted native CI diagnosis remains deferred (2b).

## Delivered and checked

- MIG-4 schema/import complete (db441ba); MIG-5a generated inputs complete (6f0be86).
- Shared frame/button/edit/memo/table base and awaited message/resource dialogs are exercised at /?skin=controls. One queue preserves result values and resource click/Esc/close input differences; appearance remains a labeled Q-12 default. No customer workflow/save is implemented.
- Full npm run verify PASS: 20 unit tests, 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 14 browser checks. Exact multiline space/CRLF check also PASS. Lint retains one TanStack v8 compatibility warning; React Compiler is not enabled.
- Component-region visual floors 90/60 pass; missing-component probe fails without replacing baseline. Screenshot inspected. Separate sequential self-review, same agent/context: reviews/skin.md.
- No parity moves: 17/2,273 verified import rows; 481 unmapped; all 877 SRC IDs retained. Component checks do not prove full-window or native parity.

## Next

Finish MIG-5b: remaining table features (foundation-controls.md); dialog text/button fitting, masks/coercion, automatic-close/input flags, calculator, icons, accelerators, clipboard/sounds/chrome; launcher and full-window gates. Both dialog checks list pending controls and missing visual references; they are not complete parity. Then MIG-6 queries/helpers and bounded workflows. Import instructions: docs/data/export-runbook.md.

## Decisions needed

No blocking owner decision. Existing U items/proposals remain; native/device/human visual acceptance is still pending.

## Playbook issues

scripts/screen_layout.py omitted root source sizes when the dossier entry was missing. Fixed locally with scoped parsing/tests; read-only playbook checkout unchanged.
