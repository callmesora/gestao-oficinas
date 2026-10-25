# MIG-7C — three-workflow cleanup review

Mode: two separate sequential self-review passes by the same agent/context, permitted by ADR-007 and owner instructions. Applied skills/review/SKILL.md; no independent fresh-context claim. Scope is stage-8-cleanup.md, existing customer/vehicle/unit write boundaries, repeated HTTP transport and connection type. No mapping/parity status changes.

## Pass 1 — 2026-10-25

- Blocking/data: checked sourceCode 24 automatic identifiers against column-mapping.v1.json, ADR-002/008/010/011 and the existing unit allocation guard. Customer and vehicle inserts now use the same signed maximum inside their existing transaction/table lock; no allocated row returns failed after rollback. Existing imported rows and provenance are untouched. No migration/index repair, wrap or ID reuse.
- Real boundary tests positively allocate 9223372036854775807 through the authenticated Fastify/API/PostgreSQL path, then assert typed failure and unchanged persisted identities on the next create. They would fail if allocation or exhaustion handling were removed. Sentinels and created boundary records exist only in the isolated test database and are cleaned before subsequent scenarios. Existing competing-create tests and all three golden comparators remain intact. Focused run 36120 passed 23 tests.
- Naming/conventions: DatabaseConnection moves the exact connected-client factory type to db/connection.ts. All actual imports were checked; no CustomerConnection reference remains. Each operation still owns its client and transaction. Customer selected-row, vehicle original-registration and unit selected-row predicates remain different.
- Business/cosmetic: stale architecture/porting and Playwright comments incorrectly described all browser behavior as fake/unimplemented. Corrected to distinguish actual business API/database flows from native metadata fixtures and pending acceptance. No new UI controls, messages, geometry or visual floors.

## Pass 2 — 2026-10-25

- Re-read final operations and adapter diff against ADRs. isolatedWorkflowPost preserves per-repository bootstrap, resource paths, operation bodies, explicit opt-in header, bearer and JSON headers, response handling and original failure text. Server origin restriction, session expiry and anonymous denial code are unchanged; there is no token cache, retry or production authentication claim.
- Checked the allocation predicate at max-1/max, empty/all-null/negative source maxima and concurrent lock ordering. Exact numeric SQL and string RETURNING avoid JS rounding. Customer business Codigo remains unsigned and separate from signed automatic identity. Update/delete predicates, source messages and parameterization are unchanged.
- Parity: no row is promoted; existing U/default/designer/caller/report/native obligations remain. No new test pins unknown collation, selection or destructive defaults. No generated, guard, hook, agent setting, migration or original source file changed.
- Final complete verification/native/parity results are recorded below after execution. No remaining code finding in this bounded cleanup; full application acceptance remains open.


Closure checks (2026-10-25): focused 36120 PASS, 23 real domain/API/PostgreSQL tests; full npm run verify 87926 PASS, 69 TS tests including all three spec-derived golden comparators, 2 Rust tests, bindings, 2,273-row parity, 53 layouts/154 PNGs and 56 browser checks against a newly started real API/PostgreSQL runner. Native check 40451 PASS: actual built Tauri/WebView2/Rust metadata and reload only, expressly excluding business data, installer, printing, devices and legacy parity. Existing TanStack lint warning only. parity --check-files and git diff --check passed. ADRs 001–011 reread; no parity statuses changed. Two sequential same-agent/context reviews are in reviews/cleanup.md. Remaining designer and acceptance obligations stay open.
