# ADR-018 — Autonomous delivery with subagents

- Date: 2026-10-25
- Status: Accepted
- Decided by: human — owner now permits spawning subagents as the migration guide suggests and requests a kickoff that carries the existing migration through end-to-end delivery without routine intervention.
- Supersedes: only ADR-007's preference against review subagents/sequential-only execution, and matching preferences in AGENTS. Stage order, evidence, review, privacy, safety and acceptance requirements remain in force.
- Parity changes: none.

## Decision

The main agent is the migration coordinator and integration owner. It may spawn subagents for bounded source investigation, mapping, implementation, testing and independent review whenever helpful. Prefer separate reviewer agents for each completed slice; use two independent review passes for money, stock, totals, imports, delete/overwrite or multi-window work as the guide prescribes. The coordinator applies or assigns fixes, reruns affected checks and resolves findings before integrating dependent work. If delegation is unavailable, disclose sequential self-review; never invent independent review evidence.

Roadmap dependencies and bounded stage briefs still govern implementation. Parallelize independent work, not conflicting changes or dependent business stages. Separate writing sessions use separate branches/worktrees and one writer per file. Give each agent a ticket, base commit, owned paths, evidence, expected output and checks. Run heavy verification serially per checkout. Main agent alone integrates shared parity/roadmap/handoff/progress; subagents use isolated scratch directories and report results rather than overwriting shared analysis. Windows and Mac agents follow the coordination runbook, identifying platform and commit in every check.

The kickoff in `setup/RESUME-MIGRATION.md` authorizes the future session to continue across all remaining stages, not stop after the next stage. Use evidence, existing proposals and safe reversible defaults; record decisions and continue independent work without routine permission requests. Preserve the accepted architecture and original behavior. No implicit feature exclusions, relaxed tests, invented native evidence or production cutover authorization.

For this unattended run, the guide's one-slice-per-session recommendation means bounded stage briefs and fresh subagent contexts inside a continuing coordinator run, not a requirement to end the owner's chat after each slice. Replace per-stage human check-ins with agent implementation/review/verification so work continues; retain actual human visual/runtime acceptance as an honestly pending acceptance gate, never fabricate it or require it before unrelated implementation can proceed.

There are two distinct outcomes: (1) a complete, buildable and runnable implementation with packaged native application and API/database startup instructions; (2) full legacy/data/platform acceptance under the guide. A working implementation with unavailable legacy/printer/other-OS checks must be delivered with those precise gates still open, never described as fully verified parity. Keep implementing everything independently achievable before stopping for a truly external blocker. Usage limits, unavailable permissions or absent machines are checkpoint conditions, not proof that the app is finished.

## Scope

This decision does not bypass sandbox/approval restrictions or authorize production changes, force-pushes, dropping data, guard edits or credential reuse. The prior remote push attempt was blocked by environment approval review; record such blocks and continue local implementation. New chats do not inherit another machine's tools, permissions or live sessions automatically.

Historical handoff/review records describing sequential work remain accurate records of those runs. They do not restrict future subagent use. No migration implementation is performed by the prompt-writing stage itself.
