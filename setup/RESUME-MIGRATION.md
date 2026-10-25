# Autonomous kickoff — complete the existing Gestao Oficinas migration

Open the application checkout `gestao-oficinas/` in a new Codex chat, with this branch's changes present. Paste the block below. This is a resume prompt; it does not initialize an empty project.

```text
Goal: complete the existing Gestao Oficinas WINDEV-to-TypeScript/Tauri migration end to end.
Playbook: ./migrate-windev-javascript (separate read-only checkout).
Stop after: all independently achievable implementation, integration, verification and packaging.
Working mode: autonomous coordinator with useful subagents, following ADR-018.
Data policy: private originals and raw records stay ignored/local; publish only synthetic fixtures and non-sensitive evidence.

I will be away. Do the work, not only a plan. Continue across bounded stages without asking me
whether to proceed. Do not end after the next screen, first successful build, one stage or a status
report. Use the migration guide's procedures and the accepted project decisions to deliver the
actual usable application. The coordinator owns planning, delegation, integration, review/fixes,
verification and durable memory until the complete deliverable or a genuine external blocker.

1. ESTABLISH THE REAL STATE

Work inside the application checkout, not its parent legacy folder. Read AGENTS.md and nearest
instructions, ROADMAP.md, docs/runbooks/handoff.md, setup/LOCAL-WORKSPACE.md,
docs/runbooks/cross-platform-agents.md, docs/architecture.md, docs/porting.md, and accepted ADRs.
Read ADR-018: my former preference against subagents/sequential-only execution is superseded.
Use subagents when helpful, including independent reviewers. Historical self-review notes describe
past runs and do not restrict this one.

Inspect git status/log/remotes, actual source, tests, migrations, parity and environment. Preserve
existing changes, editor files and other sessions' work. Synchronize only when safe; no blind pull
into a dirty/diverged checkout. Use your own codex/<ticket>-<slug> branch/worktree. The prepared
Mac branch is codex/local-macos-setup; verify the current history instead of trusting old hashes.
The last known next implementation is MIG-7C2, docs/runbooks/stage-11-designer-checkpoint.md.
Reconcile that with the latest handoff/roadmap, then finish it before a third new leaf workflow.
Do not restart mapping/framing or scaffold over the existing application.

2. READ AND APPLY THE GUIDE

Read the playbook README, chapters 06, 05 and 10, templates/kickoff-prompt.md,
templates/PromptInit.md, templates/mapping-prompt.md and templates/prompt-stage.md. Then read
chapters 00-04 and 07-09 for source preparation, memory, architecture, platform replacements,
data/cutover and WLanguage semantics. Read the project skills for mapping/review when applicable.
Keep a read ledger with paths and playbook revision so later stages resume without unnecessary rereads.

The project architecture and ADRs specialize the generic guide: React/TypeScript UI, pure domain
package, TypeScript API owning PostgreSQL transactions, thin Tauri native layer. Do not replace
business persistence with SQLite merely because the temporary source snapshot is SQLite.
Preserve existing copied tools/skills/templates; do not silently upgrade them from the guide.
Follow guide upgrade checks if an evidence-backed upgrade is actually needed.

Treat one-slice-per-session advice as bounded briefs and fresh subagent contexts inside this
continuing coordinator run. Per-stage human check-ins are deferred owner acceptance, not a reason
to stop implementation. Do not claim that I ran, visually approved or accepted something I did not.

3. ORCHESTRATE THE WORK

Maintain a dependency-aware execution plan from the existing roadmap through the final deliverable.
For each stage write/update docs/runbooks/stage-<id>.md using the guide template: owned parity rows,
real evidence, expected normal/boundary/failure behavior, deliverables, dependencies and limits.
Keep stages bounded; the overall assignment includes all remaining stages.

Delegate useful independent investigations, mapping, implementation or test work. Give each
subagent its ticket, base commit, owned paths, evidence, acceptance checks and reporting contract.
Parallel writers use isolated worktrees; never assign competing edits to a shared file. The main
coordinator alone integrates parity/roadmap/handoff/progress and shared evidence outputs. Subagents
use isolated scratch namespaces. Serialize heavy verification per checkout.

Use an independent reviewer per slice where available, reading the actual diff/source/ADRs/evidence.
Money, stock, totals, imports, delete/overwrite and multi-window work receive two independent
reviews as the stage template requires. Assign a fixer, resolve findings, rerun affected checks,
then integrate. If delegation is unavailable, disclose separate self-review passes and continue;
never pretend self-review was independent. Do not launch unrelated sidebar chats or assume that
a subagent can access a different physical Windows/Mac host.

4. COMPLETE REAL WORKFLOWS

Build every remaining applicable list/form, picker/caller, repair order, material/quantity/password,
labor/timer/state, stock/inventory/scanner, access/menu/startup/configuration and report workflow
from the source inventory. Preserve legacy names, Portuguese captions/messages, layout, keyboard
behavior, rules, decimal/ID semantics and caller state. No redesign, invented source behavior,
omitted feature or unapproved exclusion. Include the source-hidden/UMC and retained U obligations.

Each workflow must be reachable through the actual application, use the real API/database/native
path for its scope, handle errors/rollback/concurrency, and persist across application/server restart.
Consume only necessary helpers at the first real consumer. Keep cleanup/designer checkpoints in
dependency order; do not hide known missing behavior behind a generic native-acceptance label.

Finish production navigation/access and startup, not just development URL routes or a skin launcher.
The current packaged app only exposes the foundation diagnostic and the current dev runner makes a
fresh database each run. Those are not the final deliverable: implement the actual application entry
point, persistent non-production installation configuration, API/database provisioning/startup and
documented first-run/backup/restore behavior, following the existing ADRs and remaining stages.

5. USE LOCAL DATA AND BOTH PLATFORMS HONESTLY

On macOS source setup/Enter-Prerequisites.sh. On Windows use setup/Enter-Prerequisites.ps1.
Honor the exact runtime/lockfile pins. Use relative paths and platform configs. Label every result
with OS/architecture, command and tested commit/working tree. Preserve both OS build paths and
platform visual histories/floors. Validate Windows native/WebView2 and macOS native behavior on
their actual hosts when available; a browser or Mac result is not Windows native evidence.

Read the prepared analysis-local/latest.json and committed evidence. Preserve originals. When
refreshing evidence, use the explicit primary dossier/compile paths and isolated docs output in
setup/LOCAL-WORKSPACE.md, not an accidental backup or an overwrite of reviewed answers/seed.

The existing SQLite snapshot inside legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/ is provisional.
Its adapted importer source is analysis-local/sqlite-development/data.sqlite. Recreate a missing
projection with scripts/prepare_local_sqlite.py into a fresh ignored directory. Keep originals
read-only. The prepared import accounts for 159,668 rows: 136,053 imported and 23,615 stock rows
quarantined because text link values do not match the authoritative binary contract. Do not guess
their encoding, erase quarantine or present this snapshot as a verified official HFSQL export.
Use synthetic stock scenarios for implementation while the real export remains unavailable.
On Windows, recover/export from a scratch HFSQL copy with the proper driver if available, with
count/hash reconciliation. Never connect to production or reuse legacy credentials.

6. VERIFY, REVIEW, RECORD, CONTINUE

For every stage run npm run verify, relevant golden comparators, real UI click-through/control/
caption/visual checks, and applicable native/packaging checks. Stop a populated manual runner
before full browser tests so the tests use a clean synthetic database. Build the actual native
app and exercise reachable workflows, not only mocked IPC. Keep spec-derived and legacy-recorded
golden evidence distinct. Fix failures; never skip/delete tests, weaken floors, bypass guards or
promote parity to obtain green. Use scripts/parity_check.py with --seed and --check-files.
Every verified row must meet AGENTS.md's five evidence checks and cite the test that actually ran.

After review/fixes update parity, roadmap, handoff, ADRs/porting where needed and progress dashboard.
Record Delivered / Assumptions and differences / Checks actually executed / Remaining work /
Decisions needed / Playbook issues. Keep exact next tasks and blockers durable across compaction
or interruption. Commit explicit owned files in small tested commits. You may push your delivery
branch when environment policy permits; no force-push, main-branch rewrite or production deployment.
The previous push was blocked by automatic approval review: if still blocked, record it, preserve
commits locally and continue migration work. Do not bypass policy or repeatedly request permission.
Then immediately select the next ready stage and continue. A stage handoff is not the end of this task.

7. DEFAULTS, BLOCKERS AND FINISH LINE

Make routine implementation choices autonomously. For missing behavior use existing source evidence,
answered runtime questions, proposals and accepted safe defaults in that order. Record new reversible
choices as ADRs/defaults with honest assumed confidence, following No guessing. Preserve existing
behavior unless an accepted decision changes it. Do not ask me to approve routine plans or progress.

When a check needs an unavailable OS, legacy runtime, driver, credential, printer/device or human
visual acceptance, record exactly what is missing, the affected U/parity IDs, and how it can be checked.
Continue every independent task and any safe implementation supported by existing evidence. Ask only
when no evidence/proposal/safe reversible default covers a genuinely blocking decision; do not use
one unavailable check as a blanket reason to stop the rest of the application.

Deliver the runnable native application on the current host, reproducible Windows/macOS build and
startup instructions, packaged artifacts where build tools are available, a persistent isolated
non-production API/database installation, all applicable workflows/reports, automated tests,
reconciliation/backup-restore evidence and an up-to-date migration/progress/acceptance report.
The final app must launch through its normal entry point; a diagnostic, TODO screen, fixture,
development-only link, placeholder backend or empty report does not count as delivery.

Full migration acceptance additionally requires the complete parity gate:
python scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files --require-complete
(use the configured Python interpreter), all required golden/data/native/platform checks, and the
guide's outstanding human/device acceptance. No feature exclusion without an existing or explicitly
owner-approved ADR. Do not call the migration fully complete when required acceptance is unavailable.
Deliver all achievable implementation with precise remaining acceptance gates instead of fabricating
success. Prepare a cutover/rollback rehearsal plan; do not execute production cutover while I am away.

Only end when the deliverable is actually complete, every remaining actionable item is externally
blocked after independent work is exhausted, or a real environment/usage interruption forces a
checkpoint. A context compaction is not completion. At interruption save exact state and resume
instructions without claiming background work will continue after the run stops. The final report
must give artifact locations, launch steps, tested platforms, actual checks, source-data limitations,
open acceptance gates and Git delivery state. Start now and keep progressing through the roadmap.
```

This prompt cannot supply missing hardware, credentials, permissions or execution time. Keep the Codex run available; its saved roadmap/handoff allow resumption if an external limit interrupts it.

Prompting references: [OpenAI Codex prompting guide](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide), [OpenAI subagent guidance](https://learn.chatgpt.com/docs/agent-configuration/subagents). Project procedure remains the separate migration playbook and accepted ADRs.
