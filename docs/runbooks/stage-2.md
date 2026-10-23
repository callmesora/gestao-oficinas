# Stage 2 — Scaffold and verification wiring (MIG-3)

First read docs/runbooks/handoff.md, AGENTS.md, ROADMAP.md and the ADRs for this slice. Follow the non-negotiable rules. Start with git pull when the branch has a remote; inspect dirty work and remote divergence before synchronization.

- Parity rows: no legacy business status moves. Add only meaningful foundation tests, not invented legacy claims.
- Evidence: guide 06 section 7; templates/ui-check; ADRs 001–007; architecture boundaries.
- Behavior: identify desktop build through a narrow native command, visibly distinguish development browser preview; check response shape and failure/retry. API liveness must not imply database readiness.
- Deliverables: maintained React/Tauri scaffold in accepted paths, generated native DTO/command catalog, deterministic binding drift check, pinned lockfiles, TypeScript/lint/unit/Rust/parity/UI scripts and Windows CI workflow. Real built native command implementation; browser mocks are presentation evidence only.
- Constraints: no arbitrary SQL/files/shell capability, no business rules outside domain, deliberate CSP, no default starter features. Follow library APIs verified in official docs.
- Out of scope: schema/import, legacy skin/screens, production connections and business functionality. No feature stubs.

Verification: run npm run verify, npm run ui:check and build. Inspect preview as well as assertions. Native IPC/installer smoke and CI success are recorded honestly if not yet run. Review in a separate sequential pass per the owner's instruction; fix findings. Regenerate progress and update roadmap/handoff before explicit-file commit/push. Foundation may not be Done while required wiring/checks are missing.
