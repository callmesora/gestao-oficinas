# Handoff — Gestao Oficinas

## Latest delivery — shared window interactions

macOS arm64, tested main tree over `6d5ce7e`; delivery commit is in Git. No push. Preserve originals/backup/playbook, guards and unowned `.handoff.md.swp`.

Forms and pickers now share the react-rnd adapter used by workspace windows. Native HTML dialog retains focus, Tab/Esc, caller results and lifetime; source frames remain reachable on narrow screens. New default centers round to whole pixels; saved fractional coordinates and source control geometry remain exact. Public enableUserSelectHack=false preserves input selection. The visual harness measures the source frame, retaining all assertions/floors. Earlier skin/table/business delivery is in [history](../migration-history.md#stage-30-usable-desktop).

Checks: isolated 103/103 browser, integrated main 61/61 (30 visual, 16 Date, four nested/modal, 11 workspace), types/full lint/fmt and parity pass. Eight visual scores improve. Mac debug app rebuilt, 30.42 MiB, application executable only; current frontend asset names verified in the executable. Existing TanStack compiler lint warning remains. Logs/manifests: ignored `analysis-local/modal-adoption/`.

Native: final-source diagnostic and uninstrumented WK business checks both pass: offscreen last-row search, save/first-row search, logout/login, 1,001 retained plus one new customer, zero sessions/DEV requests. Earlier stalls remain recorded; their cause is not established. Probe default visibility was restored separately. This does not establish report/device/other-host acceptance.

Parity unchanged: 367/2,273 verified, 396 implemented, 1,029 specified, 481 unmapped, zero excluded; 63 verified assumptions. No whole-window closure. Coordinator self-review under ADR-007.

Use [current stage](current-stage.md). The owner's port 3210 demo/data remain untouched; older assets are retained. Restart `npm run local:start` and refresh to load the skin-serving fix. Native save/print panels/devices, Windows, official HFSQL fidelity, updater/INI and source/designer gates remain open.
