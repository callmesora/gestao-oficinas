# Handoff — Gestao Oficinas

## Current stage

MIG-5b in progress on main; full migration, commits and pushes authorized. Continue ROADMAP.md in order. Hosted native CI diagnosis remains deferred (2b).

## Delivered and checked

- MIG-4 schema/import complete (db441ba); MIG-5a generated inputs complete (6f0be86).
- Shared controls and awaited dialogs are exercised at /?skin=controls. Resource text sizing now preserves initial multiline width and optional character-limit width adaptation; return/input semantics remain intact. Message copy events produce the exact source payload. Caption shortcuts are scoped to the focused frame/modal, with escaping and collision defaults in ADR-003. Resource icons follow source flag precedence and load checked project images; symbols/stretching remain Q-12 assumptions. Native clipboard, skin/font appearance and missing designer metadata remain unverified. No customer workflow/save is implemented.
- Full npm run verify PASS: 29 unit tests, 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 22 browser checks. Production build and parity file checks also pass after the caption-shortcut change. Lint retains one TanStack v8 compatibility warning; React Compiler is not enabled.
- Component-region visual floors 90/60 pass; missing-component probe fails without replacing baseline. Screenshot inspected. Separate sequential self-review, same agent/context: reviews/skin.md.
- No parity moves: 17/2,273 verified import rows; 481 unmapped; all 877 SRC IDs retained. Component checks do not prove full-window or native parity.

## Next

Finish MIG-5b: remaining table features (foundation-controls.md); masks/coercion, remaining optional input flags/automatic-close behavior, calculator, external/file images, encoded custom shortcuts, sounds/chrome; launcher and full-window gates. Physical clipboard and dialog font/wrapping/DPI, anchoring, insets and minimum-title geometry need acceptance; missing source images prevent visual scores. Then MIG-6 queries/helpers and bounded workflows. Import instructions: docs/data/export-runbook.md.

## Decisions needed

No blocking owner decision. Existing U items/proposals remain; native/device/human visual acceptance is still pending.

## Playbook issues

scripts/screen_layout.py omitted root source sizes when the dossier entry was missing. Fixed locally with scoped parsing/tests; read-only playbook checkout unchanged.
