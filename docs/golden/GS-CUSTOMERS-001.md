# GS-CUSTOMERS-001 — customer command and caller workflow

Status: **spec-derived**, not recorded from the legacy runtime. Source: WIN_Form_Clientes.wdw:38–71/470–488 and WIN_Table_Clientes.wdw:300–382/608–633/825–853. Owned rows include SRC-51085948c6, SRC-01600b8bd1, SRC-284e9feb26 and SRC-0e07efbaa4. ADRs 008/009 cover target identity, transactions and isolated development.

Start in a fresh isolated migrated PostgreSQL database. Through the real session/API path create Codigo 812 with Descricao `Golden inicial`, addresses M1/M2, postal code 1234, phone 0012, mobile 0034 and observation Nota. Edit its description to `Golden final`. An attempted duplicate must leave that row unchanged. Export the eight form-bound fields of Codigo 812 and compare with the committed after/Clientes.csv using compare.json (no trimming or normalization). Technical/internal identifiers are outside this logical projection per ADR-008; no source value is rewritten.

The executed replay is the named GS-CUSTOMERS-001 test in apps/server/src/operations/customers.test.ts. It uses the actual API, operation and PostgreSQL path and invokes scripts/compare_exports.py. Actual exports/results stay under ignored analysis-local. The committed expected CSV is synthetic, derived from source assignments, not customer data.

Browser replay in ui-check/customers.flows.spec.ts additionally exercises required messages in source order, form cancel/Escape without closing its owner, add/edit/reload persistence, observation selection, every search mode, duplicate dialog, explicit delete cancellation/confirmation, and selection/caller-origin return. These tests also run against the imported scratch copy. docs/data/customer-import-check.json records the copied-data customer-count and relationship precheck evidence.

Unresolved locale/filter coupling, native keyboard/modal behavior, default/destructive dismissal, table built-ins and framework-dialog appearance remain U items. No test pins an unknown legacy outcome. Replace this characterization with a recorded legacy before/after replay when that runtime is available; it does not claim complete legacy parity.
