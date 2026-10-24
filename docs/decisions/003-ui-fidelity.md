# ADR-003 — Legacy MediaPlayer replica and window behavior

- Date: 2026-10-23
- Status: Accepted (owner may supersede with a new ADR)
- Decided by: default
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
docs/screens/, docs/navigation.md, docs/evidence/images/ and docs/mapping/event-codes.md describe the controls and caller contracts; templates/ui-kit/ supplies the MediaPlayer primitives. Runtime appearance and several actions remain unresolved.

## Decision
Reproduce the Portuguese legacy captions, geometry, masks, tab order, keyboard behavior and MediaPlayer skin. Use generated layouts and exported project assets. Maintain non-modal windows in an in-app desktop workspace with independent window state; modal Open/Close and message boxes use awaited dialog results. Use TanStack Table for reusable table state and React Hook Form with zod for forms, behind legacy primitives. No business behavior derives solely from library defaults. Controls keep exact legacy data-testid values.

Message clipboard default (Q-12; decided by default): route the standard copy event/Control+C to the mapped hidden copy action, retaining its exact title/separator/message payload. Keep that off-canvas control out of tab traversal. The encoded legacy shortcut/tab flags are still U-W36869F-02, so this route is assumed until confirmed. Use the WebView clipboard API for the hidden action; packaged Windows clipboard behavior requires native acceptance.

Caption mnemonic default (decided by default): interpret the first unescaped & in button captions as Alt+letter, && as a literal &, and keep a trailing & literal. Render an underlined letter; the native Windows underline-visibility preference remains unverified. Scope activation to the focused in-app frame/modal, ignore disabled/hidden/inert controls and Ctrl+Alt (AltGr), and leave duplicate eligible letters unhandled rather than choose an unknown winner. These defaults do not recover encoded custom shortcuts or resolve the existing keyboard U items. Explicitly literal captions can opt out.

Workspace defaults (decided by default): center a newly opened instance with a small cascade for subsequent instances; bring the focused/clicked instance forward. Drag its title within the workspace, keep its title reachable, and retain component state while minimized. Task buttons restore minimized instances and the last focused non-chrome control; closing removes only that instance and focuses the top remaining one. Maximize fills the workspace with at least the source base dimensions, restoring prior coordinates afterwards. These are in-app adaptations, not recovered legacy window-manager behavior. Geometry persistence and native window-manager acceptance remain separate obligations.

Control anchor-rate default (decided by default): use generated anchor flags and explicit percentage rates when supplied. Where rates are encoded, use 100% for an enabled stretch axis; move 100% on an enabled right/bottom axis only if that axis does not also stretch. This avoids doubling displacement on combined flags and remains assumed, not recovered metadata. Missing/unrecognized anchor flags keep original geometry; resulting dimensions have a zero minimum. Per-control rates override this default; nested-container/rate recovery and native resized comparisons remain U-SKIN-01 in foundation-controls.md. Source base geometry is never overwritten.

Workspace resize default (decided by default): enable manual sizing only when generated Resizable is true. Edges/corners support sizing, including windows without a grip. A generated With grip flag draws the bottom-right grip; its target drawing/keyboard behavior is assumed. North/west sizing preserves the opposite edge and stops at the workspace origin. Drag changes width/height; arrow keys change dimensions by 8 pixels (Shift: 1). Use source base dimensions as the reversible minimum until native minimum-size metadata is confirmed. Maximize retains manual dimensions for restore. Missing flags do not enable sizing; saved geometry remains pending. Native limits/drawing/keys remain U-SKIN-02 in foundation-controls.md.

## Consequences and verification
Skin kit precedes business screens. Every opened window/dialog needs control/caption checks, keyboard flows, image-load checks and recorded visual scores. Human visual acceptance remains pending; no score or browser mock proves native parity. Test multiple windows and cancellation explicitly.
