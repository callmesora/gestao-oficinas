# ADR-009 — Isolated real workflow development

- Date: 2026-10-24
- Status: Accepted (owner may supersede)
- Decided by: default
- Parity rows: no authentication parity promotion; customer search U-CC16AB27-02 remains open

## Context

ADR-004 permits opt-in synthetic local identities before the full access slice, but protected operations must deny anonymous requests. MIG-7A must use real PostgreSQL, not a browser fake backend. The existing isolated PostgreSQL helper and official-driver import provide a safe local destination.

## Decision

An explicit development runner creates a fresh loopback PostgreSQL database, applies migrations and optionally imports the copied official-driver export. It never uses an external database URL. It starts the same API used by the workflow and proxies /api through Vite. A visible developer banner identifies this environment. Only this runner enables an in-memory synthetic development identity bootstrap, restricted to its exact browser origin and an explicit custom request header. It issues random expiring bearer sessions; normal server startup has neither bootstrap nor authorized customer operations. Never reuse legacy credentials. This is a development fixture identity, not WIN_Acesso implementation or production authentication.

Customer reads use a validated filter DTO with the source's exact mode/field mapping (WIN_Table_Clientes.wdw:608–633). Blank term and todos remove filtering. Use parameterized literal substring matching, with lowercase comparison as a reversible interim choice under U-CC16AB27-02; accent/locale/flexible-comparison equivalence remains unverified. Do not pin unknown locale behavior in tests. Source browse order is ClientesID; deterministic ties use _row_id without claiming recovered tie order. New-code suggestion uses the active filter's rows, preserving the shared HFilter context rather than silently scanning unrelated rows. Sorting accepts only mapped column names.

## Verification

Real session/API/database and browser tests must prove anonymous denial, origin restrictions, read/filter/save/delete and persistence. No authentication, locale, native or full-window parity follows from this fixture. Stop the runner to invalidate sessions; the scratch database remains under analysis-local for inspection.
