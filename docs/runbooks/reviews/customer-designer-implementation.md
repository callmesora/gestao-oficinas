# MIG-7A.2b bounded metadata/scroll delivery — implementation review

Two separate sequential self-review passes, same agent/context under ADR-007; used skills/review/SKILL.md. Mapping review is separately recorded in customer-designer-mapping.md. Full parent follow-up remains open under ADR-014; no fresh-context or full-window parity claim.

## Pass 1

- Checked raw-value extraction against the actual dossier. Horizontal/vertical scrollbar options are distinct from the boolean Display/Scrollbar flag. Exact named values are preserved as strings, with no missing-value defaults or accidental match of Column context menu versus Context menu mode. Four Python generator tests pass.
- Checked actual regenerated layouts/manifest: 24 layouts, 28 table descriptors differ only by additive table_options; original geometry, captions, flags, images and assets are unchanged. ui_inputs --check-source passes against preserved private originals. No generated JSON edited by hand.
- Actual customer consumer opts into descriptor behavior; other workflows do not acquire unreviewed interaction changes. Real test covers 25 persisted synthetic customers, always-visible vertical mode with data/empty results, horizontal automatic mode, pixel scroll and actual overflow-only tooltip content. No SQL/auth/migration/business write change.
- Tooltip uses textContent and the DOM title property, never HTML. Remove title on mouse leave to avoid stale text when cell data/width changes later. Native tooltip timing/skin and scrollbar tooltip remain precise U-CC16AB27-01 obligations.

## Pass 2

- Rechecked descriptor scope and right-click source gate: only the customer-enabled column configuration panel opens; no arbitrary automatic export/filter command is inferred. Source caption/layout configuration is preserved and exact native menu composition stays U. No keyboard event consumes save/delete paths.
- Actual added keyboard test verifies ordered known fields within SC_Form, max-length metadata, grouped decimal string above 2^53, memo newline and real API persisted code/memo, plus customer list maximize/restore/minimize without losing its data. Cross-container/native key precedence is not inferred from this browser run.
- Actual vehicle consumer test creates a customer through the real nested form, selects it, verifies refreshed combo options include both the new and previous customer, and checks filtered empty-picker cancellation preserves the origin. This tests caller coupling, not a fabricated labor/repair caller.
- Scheduling finding: full modal manual resize/saved geometry and live numeric-mask entry are known remaining target work; they cannot be labeled native-only. ADR-014 schedules retained customer/vehicle/unit follow-ups at MIG-7C2 after two more real leaves, before a third, while parents remain In progress. No feature/U/parity row removed or promoted.
- Focused evidence: 15 customer/control/visual cases passed (82282), then 12 actual customer/vehicle flows including keyboard and new-customer caller passed (42380). Full/golden/native final results are recorded at closure after execution. No remaining code finding in this bounded metadata/scroll increment.


## Final verification findings and fixes

- Stronger empty-result scrollbar-width assertion failed in 43702 (15 other cases passed): CSS requested 16px but the browser exposed only the 2px border. Read installed Playwright coreBundle.js: headless launch adds --hide-scrollbars. The same actual page with that single default omitted exposes 18px border plus track. Keep the positive width assertion and omit that default in the test launch; no visual floor/tolerance/assertion changed.
- Final typecheck caught the strengthened locator's HTMLElement/SVGElement union; cast the source-proven table div to HTMLDivElement for offsetWidth. No runtime assertion weakened.
- Complete unhidden-scrollbar browser run 55757 passed 59/61 and exposed two pre-existing actual dialog layout defects: static caption overflow=auto creates an unnecessary scrollbar (6px overflow); an initially undersized multiline resource field creates a scrollbar that narrows its text and keeps itself present (12px overflow). Existing source-fit behavior requires neither. Static measured captions now stay overflow-visible; multiline resource input suppresses the initial pre-fit scrollbar only until font/layout measurement completes, then retains normal overflow-auto for subsequent entry. The 12 unchanged dialog regression tests pass in 4414. This is required by actual source scrollbar verification and the customer validation/duplicate message path SRC-51085948c6, not unrelated helper work.
- Native 18454 passed before the final scrollbar/dialog fixes; it is historical only. Final complete verification/native are being rerun on the final files. No failed command is represented as a final pass.

## Closure evidence

- Complete verify phase in 8706 PASS: 70 TS/domain/API/PostgreSQL tests including three spec-derived golden comparators; 2 Rust tests, bindings, parity, 53 layouts/154 PNGs and 61 browser checks with visible scrollbars. The combined command exited 1 because the following native helper could not initially write native-metadata-check.json before native execution. This is not reported as a passed combined command. Standalone helper retry on the built executable passed at 2026-10-25T07:22:47.406Z.
- Final visual inspection found the last-column magnifier overlapped by the configuration affordance after the real scrollbar reserved width. Reserved header space under ADR-013; strengthened the actual header-search regression to seek Telemovel through its last-column magnifier. Original earlier-column selection assertions remain.
- Final 48812 exited 0: all 20 customer/vehicle/control/visual browser cases, followed by npm run native:check including rebuilt executable and actual WebView2/Rust metadata/reload PASS at 2026-10-25T07:27:52.785Z. No business/installer/printing/device/legacy-native parity claim.
- Inspected all six final empty/synthetic target captures and refreshed their comparison PNGs. Unchanged 90/60 floors. No original business rows published. Re-read ADR directory through 014; no conflicting new decision. No remaining finding in this bounded delivery; full parent designer work remains scheduled at MIG-7C2.
