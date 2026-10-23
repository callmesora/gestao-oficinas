# MIG-5a review — UI inputs

Separate sequential self-review, same agent/context per owner preference; skills/review checklist and ADR-003/007 applied. No behavior rows advanced.

- Fixed screen_layout.py dropping repeated column names across tables in WIN_Ordens_Reparacao and WIN_Tempos_Reparacao. Source hierarchy now supplies qualified identities; ambiguous dossier captions/flags are omitted and recorded against the existing unit U items. Unknown visibility is no longer invented as true.
- Generator checks every source layout control/column survives, refuses conflicting asset names/invalid state strips, and records all source/output hashes. Generated JSON uses LF. CI checks the 53-spec denominator and exact image/state inventory without private inputs or Pillow.
- Verified all 53 layouts/154 PNGs regenerate; private-input access-denied probe passes; altered hash/dimensions/inventory probes fail. Six Python tests and full npm run verify pass (13 Vitest, Rust, bindings, parity, inputs and 2 Playwright flows). Sample frame image inspected.

MIG-5b remains open: adapt primitives to the in-app workspace, launcher, keyboard/dialog semantics and visual scores. Two WDFAA windows lack dossier entries; duplicate-name metadata and fonts/colors remain explicit unknowns. No visual/native/business parity is established by these files.
