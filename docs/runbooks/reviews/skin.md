# MIG-5a review — UI inputs

Separate sequential self-review, same agent/context per owner preference; skills/review checklist and ADR-003/007 applied. No behavior rows advanced.

- Fixed screen_layout.py dropping repeated column names across tables in WIN_Ordens_Reparacao and WIN_Tempos_Reparacao. Source hierarchy now supplies qualified identities; ambiguous dossier captions/flags are omitted and recorded against the existing unit U items. Unknown visibility is no longer invented as true.
- Generator checks every source layout control/column survives, refuses conflicting asset names/invalid state strips, and records all source/output hashes. Generated JSON uses LF. CI checks the 53-spec denominator and exact image/state inventory without private inputs or Pillow.
- Verified all 53 layouts/154 PNGs regenerate; private-input access-denied probe passes; altered hash/dimensions/inventory probes fail. Six Python tests and full npm run verify pass (13 Vitest, Rust, bindings, parity, inputs and 2 Playwright flows). Sample frame image inspected.

MIG-5b remains open: adapt primitives to the in-app workspace, launcher, keyboard/dialog semantics and visual scores. Two WDFAA windows lack dossier entries; duplicate-name metadata and fonts/colors remain explicit unknowns. No visual/native/business parity is established by these files.

## MIG-5b — frame/button/edit checkpoint

Separate sequential self-review, same agent/context, against ADR-003/007 and the stage brief; no parity rows moved. Fixed frame borders clipping chrome hit targets by drawing the border in a pointer-transparent layer. Static icons resolve their actual single PNG rather than a nonexistent state filename; repeated controls require qualified paths. Screenshot capture waits for fonts and decoded state images. The component fixture preserves strings and independent instance state without native commands; no business handlers are claimed.

Full verify passed: 15 unit tests, 2 Rust tests, bindings/parity/input checks and 5 Playwright flows. Production build excludes fixture markers. Component regions pass the unchanged 90/60 floors; a blank-frame probe fails and preserves the passing baseline. Screenshot inspected. Memo/table/dialogs, launcher, full-window coverage and native/human acceptance remain open; this checkpoint does not close MIG-5.
