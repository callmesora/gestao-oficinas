# MIG-5 — skin foundation

Read handoff, AGENTS, ROADMAP, ADR-003/007 and the relevant mapping/spec/parity evidence. Synchronize safely before changes. No business workflow or parity claim follows from a rendered layout.

1. MIG-5a: generate all 53 layouts with screen_layout.py; export referenced project skin images/states with skin_assets.py; reject ambiguous/missing assets; record hashes and unresolved designer metadata. Verify regeneration locally and artifact integrity without private inputs in CI.
2. MIG-5b: adapt shared window/button/edit/table/message primitives to the accepted in-app workspace, generated layouts and real assets. No native-window close/minimize handlers on child windows. Add the temporary launcher, control/caption/asset/keyboard checks and visual comparisons. Unknown dialog properties remain identified U items.

Keep each substage bounded. Do not implement screen-specific saves/queries, invent designer properties, lower visual floors or advance business parity here. Review separately with skills/review; run npm run verify plus relevant source/visual checks; update the roadmap, current parity/progress and concise rolling handoff; commit explicit files and push. MIG-5 remains open until the assigned consumer and acceptance gates pass.

## Rescope checkpoint — 2026-10-24 (MIG-5b)

The owner's migration objective requires a small screen prerequisite and explicit ownership of remaining work. This is a scheduling split, not an exclusion or a parity claim. ADR-003 and ADR-007 still apply.

### MIG-5b.1 — shared screen prerequisite

Available implementations: generated layouts/assets; `wd.tsx` frame/button/edit/memo; `table.tsx` controlled rows, selection/activation and source-gated width/order; `workspace.tsx` instance lifetime/geometry; awaited message/resource dialogs and keyboard scopes. The component gallery and browser flows exercise these primitives. Their existence does not verify a customer behavior.

The first customer consumers are `SRC-01600b8bd1` (row/observation), `SRC-e6389056f0` (activation), `RULE-C286277B-011` and `RULE-CC16AB27-028` (designer controls), `SRC-51085948c6` (validation messages), and `SRC-0bb0e89335` (delete confirmation). No further generic workspace feature is a prerequisite to implement these paths. Verify the existing foundation before closing this prerequisite.

### MIG-5b.2 — with first real consumers

MIG-7A owns complete customer window coverage/scoring, real table sorting/search and display masks, required/null/zero/input rules, form keyboard/default/cancel behavior, observation refresh, and actual save/delete dialog use. This includes auditing every source table flag: column visibility/configuration, fixed-left behavior where enabled, and skinned scrollbars remain obligations of the designer row, not silent omissions. The two designer rows above remain open until their real checks run. `U-CC16AB27-*` and `U-C286277B-*` remain visible; incomplete metadata is not supplied by a library default. Other table/dialog capabilities are implemented with the first evidenced consumer requiring them, under that consumer's bounded brief. Record the exact parity ID before any shared change.

### MIG-5b.3 — native acceptance (MIG-15)

Carry `U-SKIN-01` through `U-SKIN-06` from `foundation-controls.md`: encoded anchor rates/nested containers, native size/grip/key behavior, saved-geometry precedence/lifetime, column interaction and settings lifetime, input mouse/character boundaries. Carry modal system chrome, UMC, clipboard/sound and missing framework-dialog appearance/reference evidence from the message/dialog specs and `ui-check.config.json`. No UMC exclusion is approved. Full-window checks belong to every real workflow; human/native approval remains an acceptance gate. Hosted native startup remains MIG-3/2b.

No parity status, confidence, seed ID, unresolved item or visual floor changes at this checkpoint. The overall skin foundation remains in progress, but customers depend on MIG-5b.1 rather than completion of all native acceptance.
