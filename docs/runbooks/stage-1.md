# Stage 1 — Framing and method alignment (MIG-2)

First read docs/runbooks/handoff.md, AGENTS.md, ROADMAP.md and the ADRs for this slice. Follow the non-negotiable rules. Start with git pull when the branch has a remote; if the tree is dirty, inspect remote divergence first and do not overwrite local work.

- Evidence: the full playbook README and chapters 00–10; AGENTS/local-instruction/initialization/kickoff/roadmap/stage/handoff templates; docs/mapping/README.md; docs/legacy-inventory.md; docs/data/profile.md; schema draft; project and permissions/report maps.
- Parity rows: no target status changes. Preserve the Step 0 denominator and all 877 SRC seeds.
- Expected result: the template's central-memory sections and applicable local instructions, explicit ADRs decided by evidence/default, accepted repository boundaries, import design contract and dependency-ordered roadmap covering every mapped unit.
- Intentional changes: owner supersedes Step 0-only authorization and delegates safe defaults. No business behavior change or exclusion is approved by this stage.
- Out of scope: foundation implementation, target schema, business screens, target import, production access and cutover.

## Verification and review

Compare all template section headings and rule coverage, check every unit has an owner, run historical Step 0/evidence and ongoing parity gates, and inspect staged changes for secrets/raw data. npm verification and native/UI/golden checks do not exist yet and must not be claimed. Review the docs in a separate pass; disclose whether independent review was possible. Fix discrepancies before closing.

At the end: update docs/parity/parity.csv only if evidence needs correction (none intended), ROADMAP.md and docs/runbooks/handoff.md (Delivered / Assumptions and differences / Checks actually executed / Remaining work / Decisions needed), regenerate progress, then commit explicit files and push under the owner's authorization.
