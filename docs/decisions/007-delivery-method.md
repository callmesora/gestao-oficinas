# ADR-007 — Ordered stages and evidence gates

- Date: 2026-10-23
- Status: Accepted; updated 2026-10-25
- Decided by: human (delivery, subagents and Git policy); guide (evidence gates)
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
Playbook chapters 04–06/10 and stage templates define the workflow. The owner requests unattended progress through the full migration, useful subagents, local commits on main and owner-managed pushing.

## Decision
Follow bounded stages in dependency order: implement, verify, review/fix, synchronize aggregate and affected per-unit parity CSVs, update roadmap/handoff/progress, commit explicit files, then continue. Final tracking review compares exact row IDs and unchanged evidence/confidence fields. Do not stop for routine stage approval. Retain human-only acceptance as an open gate without blocking independent implementation.

Use subagents for useful investigation, implementation and review. The owner's current breadth-first phase prioritizes isolated implementation workers over independent reviewers: coordinator self-review and focused integration checks suffice for initial deliveries; document known gaps and retain final acceptance gates. One coordinator integrates shared tracking; one writer per file. Use separate worktrees for concurrent writers, and serialize heavy checks per checkout.

The owner prioritizes a usable everyday replacement for one or two users, with a thin Media Player theme over mature open-source/framework primitives. Reuse those for generic tables, reports, window interactions, dialogs/focus and inputs; custom code owns source business/data contracts. Fix composed production usability before expanding edge-case coverage.

The owner additionally requests ambitious parallel initial implementations across remaining screen/report families. Fill available isolated writer slots with bounded modules while the coordinator verifies/integrates earlier dependencies; draft work does not close parity or bypass review/cleanup. Reuse existing tracking and rotate idle/checkpointed agents instead of creating a runbook per worker.

Tested local commits may go directly to main; no mandatory codex branch or PR. Never push: the owner will publish when ready. Do not rewrite history, bypass guards or modify hooks/runtime agent settings.

Keep instructions lean: update the existing applicable ADR rather than adding an ADR or runbook for each process preference. Preserve concise current decisions, necessary evidence and a usable handoff. The owner-requested consolidation follows guide04: handoff is the latest closed stage only, one reusable current-stage brief owns active work, and a concise migration-history ledger plus Git retains completed delivery/review history. Do not duplicate past reports across handoff, stage notes and review files. Preserve canonical source/spec/parity/golden/visual evidence and current operational procedures; document consolidation must not change behavior or parity.

The owner approved excluding the 50 hidden WINDEV user macro-code editor actions (A-2fd8eb) on 2026-10-25. This excludes the developer editor only; source hidden-control metadata and workshop functions remain in scope. The current delivery targets all 1,029 understood/unbuilt aggregate rows, using explicit implementation links and retaining unverified/unknown gates.

The four Unidades/Postos raw new-row events have no reachable input branch: the source tables are read-only and every column disables input. Their target implementation keeps actions available across ordinary selection and offers creation through the actual form. This is source applicability, not a new inline-edit feature or an exclusion; native row-event timing remains U02.

## Consequences and verification
The final gate requires every parity row verified or excluded by ADR, full reconciliation, golden scenarios and native/install/restore evidence. Unavailable checks remain explicit. Step 0 validation stays an evidence snapshot and is not substituted for target verification.
