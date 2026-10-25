# Handoff — Gestao Oficinas

## Latest delivery — understood behaviour implementation

macOS arm64, main over `27bb487`; delivery commit is in Git. Three isolated writers, root integration/self-review under ADR-007. No push. Owner demo port3210/data, original evidence and unowned `.handoff.md.swp` remain untouched.

All 1,029 aggregate specified rows addressed: 979 initial implementations and 50 owner-approved macro-editor exclusions. Aggregate now: 1,742/2,273 built (76.6%), 367 verified (16.1%), zero specified, 481 unresolved. No verified promotions or whole-window acceptance. Existing 17 per-unit import copies retain their historical difference from the already-verified aggregate rows.

Fixed repair/material/stock save ordering, surviving drafts, decimal masks, keyboard and Tab actions, material list positioning/filter refresh/timer lifetime and source resize formulas. Added all 25 fixed internal query equivalents. System/resource dialogs reuse the shared native HTML dialog/react-rnd host; Windows sounds use a narrow system adapter. The generated pipeline now recovers literal Image initial-value assets. Progress shows built and verified separately.

Checks: 41 integrated browser flows, all30 configured screen/visual checks and both final picker regressions pass; worker stock7/query12/repair25 and other focused checks pass; types/full lint (existing TanStack warning), 28 Rust tests, clippy/fmt/bindings, parity, generated source reproduction and Python tests pass. Full integrated TypeScript/API/PostgreSQL suite: 588/588 passed. Python: 44 checks, one Windows-only skip. The full suite preceded the final UI-only visibility correction; final types/lint, picker and visual checks cover that correction. The initial combined stock/visual run caught the visibility regression and polluted visual fixtures; its failures are retained, the original baselines restored, and fresh-fixture checks pass without weaker thresholds. Logs/manifests are ignored under `analysis-local/understood-wave/`.

Known limits: source U/native/Windows/HFSQL, updater/INI, device printing and packaged report acceptance remain open. Resource typed return-format/calculator fidelity remains U05. Use [current stage](current-stage.md); no migration-complete claim.
