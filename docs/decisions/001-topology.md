# ADR-001 — Windows desktop with a shared service

- Date: 2026-10-23
- Status: Accepted (owner may supersede with a new ADR)
- Decided by: default
- Parity rows affected: no status changes during framing; affected units retain their existing IDs.

## Context and evidence
docs/mapping/My_GestaoOficinas.md cites legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:697–774: optional HOpenConnection/HChangeConnection and servidor.ini. Local FIC copies do not establish single-user operation. Actual deployed topology remains U-PRJ-01. Playbook chapters 03 and 08 prescribe an API for shared data.

## Decision
Windows is the first supported OS. Use React/TypeScript/Vite with Tauri 2; a TypeScript Fastify API owns PostgreSQL and all business transactions. The API may run on the same machine for a local installation; clients never receive database credentials. packages/domain is the single home for pure business rules shared with the API. No SQLite on a share, no offline synchronization inferred from legacy files. This is a conservative default, not evidence that production is shared.

## Consequences and verification
Create real isolated PostgreSQL integration tests, including rollback, concurrent writes and restart persistence. Verify native Windows IPC separately from browser preview. No production endpoint is contacted. A different deployed topology requires a superseding ADR before changing persistence.
