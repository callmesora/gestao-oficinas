# Prompt for the next coding session

Open the `gestao-oficinas/` application checkout and paste:

```text
Resume the existing Gestao Oficinas WINDEV-to-TypeScript migration in this repository.
Playbook: ./migrate-windev-javascript (read-only).
Read setup/LOCAL-WORKSPACE.md first for this machine's capabilities and missing inputs.
Treat legacy/ as private, immutable evidence; keep raw records and credentials out of Git and published docs.

Read AGENTS.md, ROADMAP.md, docs/runbooks/handoff.md, the relevant ADRs and git status/log.
Windows and macOS agents collaborate: read docs/runbooks/cross-platform-agents.md.
Claim a bounded stage on your own branch/worktree, coordinate shared-file ownership,
and identify OS/architecture and commit in each check/handoff report.
This is an ongoing migration, not a new project: preserve existing architecture, stage history, parity rows and tests.
The checkout at local setup was 335a44d; its next implementation is MIG-7C2,
docs/runbooks/stage-11-designer-checkpoint.md. Reconcile that with the current checkout before starting.

Read the playbook README, chapters 06, 05 and 10, templates/PromptInit.md and
templates/kickoff-prompt.md to understand the method, then use its resume path.
Use existing copied scripts/skills/templates; don't upgrade them just because the separate guide is newer.
Use analysis-local/latest.json for the regenerated private evidence. Do not overwrite the tracked
mapping, schema, answer sheet or parity seed merely to regenerate evidence.

Work through one bounded roadmap stage with real source/map/spec/parity evidence, implementation,
appropriate tests, a separate disclosed review pass, and updates to roadmap/parity/handoff/progress.
ADR-017 adds macOS development and an ignored temporary SQLite projection. Load
setup/Enter-Prerequisites.sh, then use npm run dev:local and npm run desktop:mac.
The original SQLite snapshot stays unchanged; its adapted data is provisional and stock rows
with incompatible text/binary storage stay quarantined. Never claim native Windows behavior
from macOS or browser results. Record unavailable Windows/HFSQL checks and continue independent work.
Do not install or alter guards/hooks/agent settings. Do not push, perform production work or change
accepted application behavior without authorization for that action in the current session.
```
