# Handoff — Gestao Oficinas

## Current stage

MIG-5b in progress on main; full migration, commits and pushes authorized. Continue ROADMAP.md in order. Hosted native CI diagnosis remains deferred (2b).

## Delivered and checked

- MIG-4 schema/import complete (db441ba); MIG-5a generated inputs complete (6f0be86).
- WdFrame/WdButton/WdEdit/WdMemo and WdTable consume generated geometry/captions/assets. Frame callbacks affect only their in-app instance; table selection uses stable string IDs. DEV gallery: /?skin=controls; no customer workflow/save is implemented.
- Full npm run verify PASS: 15 unit tests, 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 8 Playwright flows. Production build PASS; DEV fixture markers absent. Lint has one TanStack v8 React Compiler compatibility warning; this build does not enable React Compiler.
- Component-region visual floors 90/60 pass; missing-component probe fails without replacing baseline. Screenshot inspected. Separate sequential self-review, same agent/context: reviews/skin.md.
- No parity moves: 17/2,273 verified import rows; 481 unmapped; all 877 SRC IDs retained. Component checks do not prove full-window or native parity.

## Next

Finish MIG-5b: remaining table features (foundation-controls.md), awaited dialogs, temporary launcher and full-window control/caption/keyboard/visual gates. Follow ADR-003; no native-window actions on child frames. Read each unit's full mapping/spec/parity before implementing it. Then MIG-6 queries/helpers and bounded workflows. Corrected import instructions: docs/data/export-runbook.md.

## Decisions needed

No blocking owner decision. Existing U items/proposals remain; native/device/human visual acceptance is still pending.
