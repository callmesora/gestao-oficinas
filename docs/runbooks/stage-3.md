# Stage 3 — Database foundation (MIG-4)

Read handoff.md, AGENTS.md, ROADMAP.md, ADRs 001–002/004/007, all table maps, the XDD, export manifest and profile before changes. Synchronize safely; never overwrite dirty work.

- Scope: all 17 tables and 135 analysis fields, driver columns and component keys. Preserve all SRC IDs; move no business behavior to verified on schema/import evidence alone.
- Deliver: explicit column mappings; transactional PostgreSQL schema history; isolated test engine; synthetic edge fixtures; opt-in import from the read-only official export; provenance and quarantine; reconciliation; interruption/retry and backup/restore tests.
- Values: ADR-002; preserve null/empty/sentinel dates, text spaces, exact numeric strings, duplicate labor IDs, negative stock and existing orphans. Retain generated binary values as opaque provenance; indexes use component fields.
- Isolation: a fresh local test cluster/database only. No external connection strings, production access, automatic startup import or overwriting existing records. Never print records, credentials or SQL error details containing values.
- Out of scope: screens, business workflows, authentication implementation and production cutover.

Dependency: roadmap 2a is complete (hosted verify/build and local actual native IPC). Hosted native automation remains open as 2b; the failing test stays intact and the overall workflow is not claimed green. This follow-up does not block independent database work, per the owner's 24 October steering.

Close only after actual database/reconciliation/recovery checks, npm run verify and two separate self-review passes (owner preference). Update parity only to the scope proved; regenerate progress; keep the rolling handoff concise; commit explicit files and push. List unavailable checks.
