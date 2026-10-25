# ADR-007 — Ordered stages and evidence gates

- Date: 2026-10-23
- Status: Accepted; updated 2026-10-25
- Decided by: human (delivery, subagents and Git policy); guide (evidence gates)
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
Playbook chapters 04–06/10 and stage templates define the workflow. The owner requests unattended progress through the full migration, useful subagents, local commits on main and owner-managed pushing.

## Decision
Follow bounded stages in dependency order: implement, verify, review/fix, synchronize aggregate and affected per-unit parity CSVs, update roadmap/handoff/progress, commit explicit files, then continue. Final tracking review compares exact row IDs and unchanged evidence/confidence fields. Do not stop for routine stage approval. Retain human-only acceptance as an open gate without blocking independent implementation.

Use subagents for useful independent investigation, implementation and review. Prefer an independent reviewer per stage and two reviews for risky work; disclose self-review if delegation is unavailable. One coordinator integrates shared tracking; one writer per file. Use separate worktrees for concurrent writers, and serialize heavy checks per checkout.

Tested local commits may go directly to main; no mandatory codex branch or PR. Never push: the owner will publish when ready. Do not rewrite history, bypass guards or modify hooks/runtime agent settings.

Keep instructions lean: update the existing applicable ADR rather than adding an ADR or runbook for each process preference. Preserve concise current decisions, necessary evidence and a usable handoff.

## Consequences and verification
The final gate requires every parity row verified or excluded by ADR, full reconciliation, golden scenarios and native/install/restore evidence. Unavailable checks remain explicit. Step 0 validation stays an evidence snapshot and is not substituted for target verification.
