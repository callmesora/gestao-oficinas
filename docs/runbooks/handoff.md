# Handoff — latest stage (Gestao Oficinas)

## Stage — Framing and guide alignment (MIG-2)

Date: 23 October 2026. Branch: main. Commit: the MIG-2 commit containing this report (resolve with git log). Push is authorized; delivery result is checked after commit. The working tree contains an unfinished, uncommitted Tauri scaffold intended for MIG-3; it is not a completed foundation.

Parity unchanged: 2,273 rows, 1,792 specified, 481 unmapped, zero implemented/verified/excluded. Step 0 baseline commits: 7d3a5c7 and 637fc6b. **Latest owner authorization supersedes Step 0 only: follow the full guide, templates and structure through completion using documented defaults.**

### 1. Delivered

- Read the guide README and chapters 00–10 in full, plus the method templates listed in guide-alignment.md.
- Root AGENTS.md adapted from the complete template: all section headings and the No guessing verification conditions retained. Actual commands and accepted project paths replace setup placeholders.
- Applicable local instructions: packages/domain/AGENTS.md, src/bindings/AGENTS.md, apps/server/migrations/AGENTS.md. CI instructions belong with the future workflow. No guard/hooks/settings were installed or changed.
- Seven accepted evidence/default ADRs; docs/architecture.md, docs/data-migration.md; bounded stage-1.md; ROADMAP.md with every one of 143 units assigned and explicit foundation/cleanup dependencies.
- docs/porting.md now distinguishes accepted boundaries and reserved concrete homes from functions not yet implemented; the owner stage must add actual symbols/tests before translating a construct.
- README/mapping entry points reflect the new scope. Dependency/build output is ignored. Original sources and data remain unchanged/private.
- Independent framing review followed skills/review/SKILL.md in a separate review-only agent. Three findings were fixed: duration representation, stale porting proposal wording, and cleanup checkpoints after 2–3 workflows. Review record: docs/runbooks/reviews/framing.md.

### 2. Assumptions and differences

ADRs 001–007 are defaults the owner may supersede. Windows first, shared TypeScript API/PostgreSQL, pure shared domain, MediaPlayer replica, preserved access checks, fixed reports and narrow native adapters. Source supports server configuration but actual deployed topology remains U-PRJ-01; the chosen family is not proof of shared production deployment.

No deliberate business-rule changes or feature exclusions were accepted. Unknown destructive defaults use cancellation and stay unresolved/implemented until observed. Do not mark source confidence as target verification. Every new default remains traceable to an ADR/proposal.

The partial scaffold/dependency installation predates this framing correction. It is uncommitted and has stock greeting/name/CSP/capability defaults; do not present it as the application or build on it without completing MIG-3.

### 3. Checks actually executed

Windows, setup/Enter-Prerequisites.ps1 loaded:

- python scripts/verify_step0.py: PASS, all 143 units, 877 source seeds, 17 exported tables/159,668 rows, 128 source fingerprints, 106 dossier images and 53 layouts; draft DDL loads in memory.
- python scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files: PASS, unchanged statuses.
- python -m unittest discover -s tests -v: 4 tests PASS, including actual Windows junction containment and typed export conversion.
- Template-heading and ownership comparison: PASS; every template section retained, all 143 unit CSVs assigned exactly once, seven ADR files present.
- python scripts/progress_dashboard.py --title "Gestao Oficinas": generated, 0/2,273 target behaviors complete as expected.
- git fetch origin and git rev-list --left-right --count HEAD...origin/main: 0/0 before this commit; no remote divergence and no destructive synchronization.

Not run: npm run verify (not wired), application/native build, IPC/UI/golden workflows, target PostgreSQL import/reconciliation, installer, printer/device checks or legacy runtime. None is claimed by framing. Historical Step 0 draft/evidence checks do not prove the target application.

### 4. Remaining work

1. Start MIG-3 with a bounded stage brief from templates/prompt-stage.md; complete the existing scaffold in accepted structure, pin/lock dependencies, remove starter code and broad unused capabilities, establish deliberate CSP, generated native contracts, real native health path, verify scripts, preview/UI harness and Windows CI. Add local CI instructions then.
2. MIG-4: explicit mapping of every schema/driver field; isolated real PostgreSQL; complete schema v1, synthetic fixtures, import dry run, quarantine/provenance, failure/retry/rollback tests, full reconciliation and backup/restore. Do not silently repair source anomalies.
3. MIG-5: skin kit, all generated layouts/assets and temporary launcher before business screens. Follow ROADMAP dependencies and split groups into bounded workflow stages.
4. Each stage needs actual checks, separate review/fix passes (two for risky slices; the owner permits self-review and prefers no review subagents), parity/roadmap/handoff/progress updates, explicit-file commit and authorized push.

### 5. Decisions needed from the human

No blocking framing decision: the owner delegates defaults. Confirm/correct when available: actual shared users/offline needs; source-observed bug preserve/change choices; unused screens/reports (none excluded by default); real printers/scanners; integrations beyond source inventory; who accepts results; production freeze/go-live plan. Current defaults preserve full scope and behavior and do not grant production access.

The 12 runtime questions and 17 encoded action groups remain in docs/evidence/encoded-actions.md with assumed proposals. Missing report/template evidence and unknown credential format remain explicit. Never pin an unproposed unknown in a test and call it verified.

## Playbook issues

- Automatic compile discovery selects a backup: reuse the actual My_GestaoOficinas.cpl path recorded in the export/evidence runbooks.
- Windows x64 HFSQL Python export crashes; the documented existing x86 official-driver ANSI bridge succeeded. Do not repeat installers or decode FIC manually.
- Foundation template commands target generic src/domain and SQLite migration paths; accepted shared topology uses packages/domain and apps/server/migrations. Local instructions were adapted accordingly.
- Historical maps retain Step 0 wording as provenance; current AGENTS, roadmap, ADRs and this handoff govern the newly authorized scope.
