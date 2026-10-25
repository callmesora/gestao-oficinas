# Windows and macOS agent collaboration

Windows and Mac Codex agents work on the same migration. Both follow the shared ADRs, roadmap, parity matrix and handoff. Local environments, legacy copies, databases and process handles are separate.

ADR-007 permits useful subagents and independent review. Delegation does not grant access to another physical machine. Use available tools and OS-labelled evidence; historical sequential-review notes do not restrict future delegation.

## Ownership and integration

1. Read `AGENTS.md`, `ROADMAP.md`, `docs/runbooks/handoff.md`, the stage's ADRs and local setup notes. Check actual Git status/log and remote state; never assume the other machine's latest work is present.
2. Tested local commits on main are allowed; no mandatory codex branch or PR. Isolate simultaneous writers with separate checkouts/worktrees when needed. Claim a bounded stage/files and record owner, OS and base commit in the existing brief/handoff. A local note alone is not a shared lock.
3. One integration owner consolidates `ROADMAP.md`, handoff, parity and generated progress after the code/reviews. Preserve every valid contribution; do not regenerate shared tracking from a stale checkout.
4. Keep commits local; the owner will push when ready. Coordinate local integration without overwriting other agents' changes. No push, history rewrite, production operation or unsolicited inter-chat messaging.

## Platform responsibilities

| Shared requirement | macOS agent | Windows agent |
|---|---|---|
| Exact Node/npm/Rust pins and lockfile | Source `setup/Enter-Prerequisites.sh`; matching Darwin PostgreSQL | Source `setup/Enter-Prerequisites.ps1`; Windows x64 PostgreSQL |
| Full `npm run verify`, real database/browser tests, unchanged visual floors | Mac visual history: `docs/evidence/visual/darwin/` | Retain existing Windows visual history |
| Same native request/result contracts | Build with `tauri.macos.conf.json`; exercise actual Mac window/picker | Windows build and `npm run native:check`; actual WebView2/picker |
| Same API/PostgreSQL behavior | Temporary SQLite projection for development, explicit limits | Official HFSQL export from scratch copy; legacy/device/printing evidence |
| Same review discipline | Review the other platform's changes and limitations | Review the other platform's changes and limitations |

The Mac C# harness tests the actual decoder method with the same eleven assertions; Windows keeps the full-adapter PowerShell harness. Mac tests do not exercise Windows ODBC. CI runs common verification on both systems with their native build/check steps. Neither OS substitutes for the other's native acceptance.

## Evidence and portability

- Label checks with **OS/architecture, branch, commit or explicit uncommitted working tree, command, result and limitations**. Distinguish local/CI and browser/native results. Never copy another host's pass and imply it ran here.
- Do not reuse another machine's PIDs, session handles, absolute paths, ports, venv, node_modules, Rust target output or PostgreSQL clusters. Poll/stop only processes owned by your session.
- Use relative project paths, `node:path`, `scripts/py.mjs`/`PYTHON`, and platform config overrides. Preserve `.gitattributes` and avoid case-only filename collisions.
- Commit source/specs/tests and non-sensitive evidence. Keep raw data, SQLite, credentials and local logs ignored. Each machine provisions its own private evidence; the current SQLite snapshot is provisional, not an official HFSQL export.
- Lockfile, shared-helper or native-contract changes require checks on both OSes. If one is unavailable, name the missing check for the other agent/CI; do not declare the stage fully accepted from one OS.
- Retain U IDs, quarantine and native gates. Platform work must not silently change legacy behavior, weaken tests/floors or promote parity.

## Handoff checklist

```text
Stage / owner / OS-architecture:
Branch / base commit / delivered commit (or uncommitted):
Files and shared tracking owned:
Change and reason:
Checks run here (command / result):
Other-platform checks needed:
Private input limitations (no raw records):
Review mode and fixes:
Next stage / integration owner:
```

Next business implementation after setup remains MIG-7C2; reconcile with the latest shared roadmap/handoff before starting.
