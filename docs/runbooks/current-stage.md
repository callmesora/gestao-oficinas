# Active integration — parallel functional breadth

Root owns localmain, macOS arm64, overd2e3e0f/MIG9–10; no push. Owner prioritizes initial usable screen families and fewer independent reviewers (ADR007). Coordinator reviews integration, runs focused real checks and commits tested batches; keep known gaps in existing specs, no per-agent runbooks. Drafts do not close parity/native acceptance.

| Owner | Isolated worktree / scope | State |
|---|---|---|
| root | main: repair form then materials/labor callers and shared tracking | Materials/labor integrated;33focused+52browser passed |
| materials_initial | /private/tmp/gestao-oficinas-repair-materials | Integrated: list/editor/password prompt, actual nested callers |
| labor_initial | /private/tmp/gestao-oficinas-repair-labor | Integrated six windows; actual start/stop/state/pickers tested |
| stock_initial | /private/tmp/gestao-oficinas-stock-initial | Eight stock/document/inventory/scanner windows |
| startup_initial | /private/tmp/gestao-oficinas-startup-initial | Access/menu/system and two touch keyboards |
| reports_initial | /private/tmp/gestao-oficinas-report-engine | Paged.js+existing Chromium; real two-report evaluation then reusable families |

Queue startup/access/menu/system, touch keyboards and remaining report filters as slots free. Root owns main heavy/browser/native checks; independent ephemeral PG/API tests may run in isolated trees. Keep one writer per file and merge shared wiring selectively. Preserve originals/backup/playbook, existing floors/seed/source IDs and unowned handoff swap. Label checks by OS/revision; unrun gates stay open.
