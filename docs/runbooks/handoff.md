# Handoff — Gestao Oficinas

## Stage — MIG-5a UI inputs complete; MIG-5 remains open

Branch main; this report accompanies the MIG-5a commit. Full migration, commits and pushes remain authorized. Follow ROADMAP.md sequentially; keep documentation limited to the current stage.

### 1. Delivered

- Generated 53 src/ui/legacy/*.layout.json files and 154 public/skin/ PNGs from 45 referenced source images. Hashes, state files and unknowns: docs/evidence/ui-inputs.json.
- scripts/ui_inputs.py --write regenerates; --check-source compares private evidence; default verification needs committed inputs only and is included in npm run verify.
- Fixed repeated-name column loss in two windows; qualified parent paths preserve all source controls/columns. Ambiguous dossier metadata remains unknown, not copied between columns. Original sources unchanged.

### 2. Assumptions and differences

ADR-003/007 unchanged. These are UI inputs, not implemented screens. Two WDFAA windows have no dossier entries; their missing metadata, duplicate-name fields and font/color gaps remain associated with existing unit U items. No parity status changes: 17/2,273 verified import rows, 481 unmapped; all 877 SRC IDs retained.

### 3. Checks actually executed

- Full npm run verify: PASS — 13 Vitest tests, Rust checks, bindings, parity, UI-input integrity and 2 Playwright flows.
- Python tests: 6 PASS, including repeated columns/parents and code-literal shielding.
- Source regeneration: all 53 layouts/154 PNGs reproduce. CI probe with private-source access denied passes; corrupt hash/dimensions/inventory probes are rejected. Sample frame image inspected.
- Separate self-review, same agent/context: reviews/skin.md.

Not run: new screen rendering, visual scores, child-window/dialog behavior or native acceptance. Hosted native CI debugging remains deferred as roadmap 2b; test unchanged.

### 4. Remaining work

1. MIG-5b: adapt the shared primitives to ADR-003's in-app workspace, then temporary launcher and control/caption/keyboard/visual checks. Do not copy the template's native-window actions onto child windows or hardcoded message geometry as legacy facts.
2. After MIG-5 closes, continue MIG-6 queries/helpers and bounded workflows. MIG-4 database foundation is complete (db441ba); corrected source/import commands remain in docs/data/export-runbook.md. Current parity is the consolidated matrix, not historical Step 0 CSV snapshots.

### 5. Decisions needed

No blocking owner decision. Preserve the existing proposals/U items; human visual/runtime/device acceptance remains later work.
