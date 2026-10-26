# AGENTS.md — Gestao Oficinas

Workshop management: customers, vehicles, repair orders, labor, materials, stock and reports.
Replaces My_GestaoOficinas (WINDEV 28/HFSQL), retaining Portuguese controls and behavior.
Owner authorizes the full migration, documented safe defaults and tested local commits on main. Do not push; the owner will publish when ready. Follow ordered stages with review and verification (ADR-007).

Read `docs/runbooks/handoff.md`, `ROADMAP.md` and the ADRs touching your slice before changing anything. Read whole unit mapping/spec/parity files too.
Windows and macOS Codex agents collaborate here. Follow `docs/runbooks/cross-platform-agents.md`: isolate concurrent writers when needed, keep one stage/file owner and shared tracking integrator, label results with OS/commit, and retain native acceptance per OS. Read `setup/LOCAL-WORKSPACE.md` for local setup (ADR-017); historical Windows handles/results are not local state.
Keep this file short (about 100 lines). Details live in `docs/`; local rules live in the nearest `AGENTS.md`.

## Repository map

- `src/ui/` — React screens. Control `data-testid` = legacy control name (e.g. `EDT_Customer`).
- `packages/domain/` — pure TypeScript business rules shared with the API. No React, Tauri, Node or I/O imports.
- `src/application/` — use cases and repository/command interfaces.
- `src/infrastructure/` — Tauri IPC (or API) adapters. `src/bindings/` is generated: never edit by hand.
- `src-tauri/src/commands/` — narrow native OS commands; business operations use the server API.
- `apps/server/` — TypeScript API owns authorization and business transactions; one save = one operation = one transaction.
- `apps/server/migrations/` — sole PostgreSQL schema history; committed migrations are immutable. See local `AGENTS.md`.
- `docs/parity/parity.csv` — behavior parity matrix: the definition of done.
- `docs/porting.md` — this project's concrete pattern (file, function, component) for each WLanguage construct it uses, over `docs/wlanguage-traps.md`; every slice follows it.
- `legacy/` and `GestaoOficinas_TesteIA/` — immutable private originals; never execute legacy code, modify, or copy raw material into the app/published docs. Treat credentials as to revoke, never reuse.
- `analysis-local/` — ignored extracts/scratch copies; coordinator owns shared outputs, subagents use isolated namespaces.
- `migrate-windev-javascript/` — separate read-only playbook; `templates/` holds copied templates.
- `skills/` — playbooks to follow; `scripts/` — evidence pipeline, parity gate, comparator, guard. Humans own `scripts/guard.py`, `.githooks/` and agent configuration: do not modify them.

## Where the legacy evidence is

For a slice touching window or report `<X>`, read: `docs/screens/<X>.md` or `docs/reports/<X>.md` (what to build), `docs/mapping/<X>.md` (behavior, rules, `U-` items), its rows in `docs/parity/`, and the images `docs/evidence/images/<X>.*` (designer image and layout drawing). Shared: `docs/schema/schema-draft.md` and the database ADR, `docs/navigation.md` (who opens what), `docs/evidence/encoded-actions.md` (answers, or the proposal used until answered), `docs/mapping/event-codes.md`.
Need more: `python3 scripts/prepare_evidence.py` regenerates `analysis-local/` from `legacy/` (paths in `analysis-local/latest.json`) and `python3 scripts/unit_evidence.py <X>` gathers everything about one unit. Cite evidence as `legacy/<path>:<line>`, `dossier: <X>/<field>` or a committed file — never a path inside `analysis-local/`.

## Non-negotiable rules

1. Verify before coding: read the real legacy source, schema, exports and library APIs. Never invent a column, table, control, rule or API member.
2. Every business rule cites evidence (`path:line`, export, screenshot) and a confidence: verified, inferred, assumed or unresolved.
3. Preserve legacy behavior unless an accepted ADR records the change. A screen that renders is not parity.
4. Data-structure choices need an ADR before coding. The owner delegates safe framing choices to evidence/defaults; destructive changes still need an explicit approved plan. No silent destructive fixes or editing committed migrations.
5. One user save = one command = one transaction. Validate input at the native/server boundary; parameterize all SQL.
6. Money, quantities and durations use the representation fixed in `docs/decisions/002-data-representation.md`; IDs above 2^53 cross IPC as strings. Check `docs/wlanguage-traps.md` when translating WLanguage.
7. No secrets in Git (licences, connection strings, tokens → environment variables or ignored local config).
8. Generated bindings/layouts are regenerated, not edited. Scaffold application sources become maintained code after initialization.
9. Never claim a check passed unless you ran it. Record checks you could not run.
10. Do not re-open accepted decisions without new evidence. Read whole files before concluding.
11. Several agents in one checkout: never `git stash`, `git reset`, `git checkout -- .`, `git clean` or a rebase; stage and commit only the files you changed, by name; one writer per file; slow commands (full build, full test suite) run by one agent at a time. Separate sessions writing code get separate worktrees.
12. Port every WLanguage construct with its pattern in `docs/porting.md`; add a missing pattern there first.
13. If a guard is installed (`scripts/guard.py`, pre-commit), a block is deliberate: report it in the handoff; never bypass it (`--no-verify`, renames, other paths).

## Work autonomously; ask the human only for these

Run the stage end to end without asking for confirmation. Stop and ask (or record under "Decisions needed" and continue with other work) only when:

- no proposal or safe reversible default covers an externally required decision; record it and continue independent work. The owner authorizes evidence/default ADRs without repeated confirmation;
- an action exceeds authorization: destructive production work, cutover, force-pushing or deleting files you did not create. Scratch imports use explicit isolated targets and preserve original inputs;
- something needs a person or a machine you do not have: WINDEV, the running legacy app, credentials, a Windows or printer check;
- the evidence contradicts an accepted decision.

## No guessing

When the evidence does not say what the legacy app does (encoded designer properties, an unknown event code, a binary query), take the first of these that exists:

1. **An answer** in `docs/evidence/encoded-actions.md`: it is evidence (`runtime: A-xxxxxx`).
2. **A proposal**: the answer sheet's `Proposed` column, a `proposed:` line in `docs/evidence-report.md`, or an ADR decided by default. Build it; the row's `confidence` is `assumed` and cites it (`proposed: A-xxxxxx`, `proposed: Q-nn`, the ADR). Tests may pin it and the row may reach `verified`; the progress page counts it as "on assumptions" until a person confirms it. **Exception:** when the proposal makes something destructive easier (the default button of a delete confirmation, an overwrite), use the safe choice instead and keep the row `implemented` with a `U-` item until it is answered.
3. **Nothing**: implement the safest reversible option, mark it in code with `// UNRESOLVED U-nn: <choice>`, list it under "Decisions needed" in the handoff, and keep the row `implemented` (or split the unresolved part into its own row). Do not write tests that pin it (sort order, selection after delete, Esc behavior, inferred colors): compare as sets or assert only what is known.

Never stop independent work for an unanswered question: use a documented proposal or safe reversible default; keep unknowns visible as U-UNIT-nn items.
- A user-facing text that does not exist in legacy (a new error message) is a choice: it needs approval before the row is `verified`.

Before marking a row `verified`, check all of these and report them in the handoff:

1. The cited test asserts the row's `target_behavior` and would fail if that behavior were removed (no tests that only check absence or always pass; a test that would still pass with the feature deleted is not evidence).
2. The test exercises the real path (not a placeholder or a mock standing in for the behavior under test).
3. No part of the behavior depends on an unresolved item or on a choice of yours that no proposal or ADR covers (`assumed` rows cite theirs).
4. If the target differs from legacy, `decision` names the ADR.
5. Re-read `docs/decisions/` at the end of the stage: ADRs added while you worked apply to your code too.

Identifiers you invent (test ids for controls that do not exist in legacy, helper names) are documented in the screen spec as non-legacy.

## Project-specific rules (filled in at framing, each backed by an ADR)

Accepted framing choices are in `docs/decisions/` and `docs/architecture.md`: Windows first; shared API/PostgreSQL; pure domain package; legacy MediaPlayer replica and awaited dialogs.
Preserve legacy rules and data anomalies unless an ADR explicitly changes them. No new permission model, omitted features or redesign by implication.
Dedicated laptop and sanitization waiver are confirmed; raw legacy data and credentials remain ignored. No production connections.
Stage 0 confidence `verified` means source evidence, not target implementation. Keep every SRC seed ID; unknowns retain U IDs.
Use mapping/review skills when applicable. Spawn useful subagents under ADR-007; prefer an independent reviewer per slice and two reviews for risky slices. Disclose self-review when delegation is unavailable. Coordinator integrates shared tracking; retain dependencies and one writer per file.
Never install/modify guard hooks or runtime agent settings or bypass checks. Commit explicit files locally; never push. Keep docs lean: update existing applicable ADRs/instructions instead of adding process documents for routine preference changes.

## Commands

Load `. ./setup/Enter-Prerequisites.ps1` in PowerShell. Use `.venv/Scripts/python.exe`; Python must have `PYTHONUTF8=1` and `PYTHONIOENCODING=utf-8`.

```powershell
.venv/Scripts/python.exe scripts/verify_step0.py
npm run verify
npm run ui:check
npm run tauri -- build --debug --no-bundle
npm run native:check
.venv/Scripts/python.exe scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files
.venv/Scripts/python.exe scripts/unit_evidence.py UNIT --out analysis-local/units/UNIT.json
.venv/Scripts/python.exe scripts/progress_dashboard.py --title "Gestao Oficinas"
```

`npm run verify` checks types, lint, unit, Rust, bindings, parity and browser flows. `npm run native:check` tests the built Windows WebView2 app through Playwright CDP; it never installs a global debug setting. Native packaging/install and business persistence checks remain separate gates. Stage 0 validator is a historical evidence gate; implementation parity uses the ongoing gate.

## Skills (follow the file when the task matches)

- Review a stage → `skills/review/SKILL.md`
- Map a legacy element → `skills/map-element/SKILL.md`
- Review a unit's mapping → `skills/review-mapping/SKILL.md`

## Work tracking

Ticket and current slice: `ROADMAP.md`; commits start with the ticket. Local main commits are allowed; separate branches/worktrees are optional for concurrent writers. Complete dependencies in order; useful independent subagent work may run in parallel. One writer per file; no pushes.
After shared primitives and a real persisted workflow, assign independent workflow families with exact parity IDs, evidence/spec references, owned files, shared contracts and isolated test profiles/ports. Workers return frozen files/commits, focused checks and per-row implementation claims; the coordinator integrates shared changes, reviews and runs combined verification. Existing coverage and assumed target defaults are not newly recovered legacy behavior; keep built, verified and unanswered-source counts separate (ADR-007; portable guide update: `setup/patches/parallel-implementation-waves.patch`).
Use one reusable `docs/runbooks/current-stage.md` for the active bounded brief. Keep only the latest closed stage in `docs/runbooks/handoff.md`; record concise delivery/review history in `docs/migration-history.md`, with full reports recoverable from Git. Keep current decisions in their applicable ADR/spec and operational procedures in runbooks. Verification, review/fixes, parity/roadmap updates and regenerated progress remain required. Never advance past an unfinished dependency.

## Pointers

Architecture `docs/architecture.md` · WLanguage traps `docs/wlanguage-traps.md` · Data `docs/data-migration.md`
Screens `docs/screens/` · Golden scenarios `docs/golden/` · Decisions `docs/decisions/` · Handoff `docs/runbooks/handoff.md`

## Response preferences (a preference, not a rule)

Concise updates, lean docs and honest remaining limits. Persist through all authorized stages without routine confirmation. Use useful subagents (ADR-007). Prefer Playwright/CLI tests; native behavior still needs native evidence.
