# MIG-5a review — UI inputs

Separate sequential self-review, same agent/context per owner preference; skills/review checklist and ADR-003/007 applied. No behavior rows advanced.

- Fixed screen_layout.py dropping repeated column names across tables in WIN_Ordens_Reparacao and WIN_Tempos_Reparacao. Source hierarchy now supplies qualified identities; ambiguous dossier captions/flags are omitted and recorded against the existing unit U items. Unknown visibility is no longer invented as true.
- Generator checks every source layout control/column survives, refuses conflicting asset names/invalid state strips, and records all source/output hashes. Generated JSON uses LF. CI checks the 53-spec denominator and exact image/state inventory without private inputs or Pillow.
- Verified all 53 layouts/154 PNGs regenerate; private-input access-denied probe passes; altered hash/dimensions/inventory probes fail. Six Python tests and full npm run verify pass (13 Vitest, Rust, bindings, parity, inputs and 2 Playwright flows). Sample frame image inspected.

MIG-5b remains open: adapt primitives to the in-app workspace, launcher, keyboard/dialog semantics and visual scores. Two WDFAA windows lack dossier entries; duplicate-name metadata and fonts/colors remain explicit unknowns. No visual/native/business parity is established by these files.

## MIG-5b — frame/button/edit checkpoint

Separate sequential self-review, same agent/context, against ADR-003/007 and the stage brief; no parity rows moved. Fixed frame borders clipping chrome hit targets by drawing the border in a pointer-transparent layer. Static icons resolve their actual single PNG rather than a nonexistent state filename; repeated controls require qualified paths. Screenshot capture waits for fonts and decoded state images. The component fixture preserves strings and independent instance state without native commands; no business handlers are claimed.

Full verify passed: 15 unit tests, 2 Rust tests, bindings/parity/input checks and 5 Playwright flows. Production build excludes fixture markers. Component regions pass the unchanged 90/60 floors; a blank-frame probe fails and preserves the passing baseline. Screenshot inspected. Memo/table/dialogs, launcher, full-window coverage and native/human acceptance remain open; this checkpoint does not close MIG-5.

## MIG-5b — memo/table base checkpoint

Separate sequential self-review, same agent/context. WdMemo preserves multiline spaces and source read-only state; WdTable keeps qualified columns, exact string identities and caller-controlled selection/activation/sorting. Fixed a test selector that looked below, rather than at, selected rows; visual capture uses actual empty fixture state, never DOM value replacement. Full verify passes (15 unit, 2 Rust, 8 browser flows); production build excludes fixtures. Component regions pass 90/60 unchanged. TanStack v8 emits one compiler-compatibility lint warning; React Compiler is not enabled and table functions are not passed to memoized components. Remaining table features are explicit in foundation-controls.md; no full-window/business parity moved.

## MIG-5b — awaited messages checkpoint

Two separate sequential self-review passes, same agent/context. Preserved source results including OKCancel's 7; queued callers cannot overwrite or finish each other's request. Fixed focus restoration by closing before DOM removal. Coverage now scopes controls to the actual window, checks pseudo-element images and uses committed generated inputs in CI; a missing screenshot needs an explicit U reason, not a fabricated score. Recovered root source sizes omitted without dossier metadata; seven Python tests and full source regeneration pass. Full verify passes (18 unit, 2 Rust, 11 browser checks). Captions/assets are labeled Q-12 assumptions. No parity rows moved: dynamic sizing, clipboard, sounds, remaining chrome and resource dialogs are unfinished; no source image exists for visual scoring.

## MIG-5b — resource return/input checkpoint

Two separate sequential self-review passes, same agent/context. Resource and message requests share one queue. Source click/Esc button values remain distinct from the raw close index; explicit input output preserves FermeDialogue's cancellation side effect. Browser tests cover actual text/checkbox/multiline controls, initial focus, Enter/Esc and close; corrected the multiline assertion to read textContent (innerText collapses spaces) and check exact CRLF/space content. Source input right margin is 16px, not borrowed from the label width. Full verify passes: 20 unit, 2 Rust, 14 browser checks; stricter multiline check also passes. Screenshot inspected, no reference image means no visual score. Masks/coercion, automatic-close/input flags, calculator, icons, accelerators, full fitting and chrome remain pending; no parity rows moved.

## MIG-5b — message and button sizing

Separate sequential self-review, same agent/context. Checked source caps, minimums, icon centering and bottom anchoring against pure geometry helpers and the actual renderers. Preserved initial coordinates until fonts finish loading; fixed nullable geometry types. Long-message/browser checks prove wrapping without clipping and clickable buttons; long resource captions preserve the source gap. Full verify: 22 unit, 2 Rust, 16 browser checks pass. Font/DPI/minimum-title geometry and full resource text/input fitting remain unresolved; no visual score or parity row advanced.

## MIG-5b — resource text/input fitting

Separate sequential self-review and screenshot pass, same agent/context. Ported the ten-pass ratio loop, frame bounds and input reservation. Screenshot review found the last input line clipped by target edit padding/border; measured insets now reserve that space and textarea resizing is disabled like the kit memo. Native insets and label anchoring remain marked U-W0075A5-05/01 fallbacks. Actual browser checks assert no input overflow, buttons below the input and exact unchanged CRLF output. Full verify passes: 23 unit, 2 Rust, 17 browser checks. No visual/native claim or parity move.

## MIG-5b — message copy action

Separate sequential self-review, same agent/context. Exact source separator/CRLF payload is shared by the hidden copy action and browser copy event. Platform writes were moved to src/infrastructure/clipboard.ts to preserve the accepted boundary; failure remains a false result, as the source ignores it. ADR-003 labels the shortcut/tab defaults as assumed. Full verify passes: 25 unit, 2 Rust, 18 browser checks; affected unit tests pass after the boundary correction. The event test uses DataTransfer and leaves the desktop clipboard untouched; physical/native clipboard acceptance is still pending. No parity row moved.

## MIG-5b — resource icons

Separate sequential self-review, same agent/context, against source :663–697 and sizing formulas. Preserved the unusual 0x30 error branch. Fixed external paths silently aliasing project basenames and custom images selecting cropped button states; checked custom images now use the complete export. Browser checks exercise all three source branches and a decoded PNG. Full verify passes (26 unit, 2 Rust, 19 browser checks); affected unit tests, production build and lint pass after the complete-image correction (one existing TanStack warning). Symbols/stretching and unknown initial images remain Q-12/U-W0075A5-01; no native visual claim or parity move.
