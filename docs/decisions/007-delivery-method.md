# ADR-007 — Ordered stages and evidence gates

- Date: 2026-10-23
- Status: Accepted (owner may supersede with a new ADR)
- Update 2026-10-25: ADR-018 supersedes the sequential-only/subagent-avoidance preference below. Its staged delivery and evidence requirements remain active; historical wording is retained as decision history.
- Decided by: default
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
Playbook README, chapters 04–06/10, templates/AGENTS.template.md, templates/ROADMAP.template.md and templates/prompt-stage.md define the workflow. The owner now requests all steps, templates and structure and permits commits/pushes.

## Decision
Follow the template structure and staged loop: framing, scaffold/verification/bindings, complete schema/import/reconciliation, skin kit, leaf screens towards workflows, periodic cleanup, then native acceptance and cutover rehearsal. Each slice has a bounded brief, implementation, actual verification, review/fixes, parity/roadmap/handoff/progress and explicit-file commit/push. Work sequentially. The owner explicitly permits separate self-review passes and asks to avoid review subagents unless they would substantially improve success; this overrides the skill preference for a separate agent. Follow its evidence/checklist discipline, disclose review mode, and make two passes for risky slices. Never modify/install guards or agent settings.

## Consequences and verification
The final gate requires every parity row verified or excluded by ADR, full reconciliation, golden scenarios and native/install/restore evidence. Unavailable checks remain explicit. Step 0 validation stays an evidence snapshot and is not substituted for target verification.
