# ADR-008 — Customer write identity and failure boundary

- Date: 2026-10-24
- Status: Accepted (owner may supersede)
- Decided by: default, constrained by source evidence
- Parity rows affected: SRC-51085948c6, SRC-c02f88ba18, SRC-0bb0e89335; no status promotion by this ADR

## Context and evidence

WIN_Form_Clientes.wdw:38–71 validates zero code then empty description, maps the file buffer and uses HAdd/HModify with explicit duplicate messages. Lines 470–488 suggest max(code)+1 but do not reserve it. The schema and migration 0001 preserve nullable legacy columns and generated internal _row_id; ClientesID is an automatic legacy identifier without a target default. Imported values must remain intact (ADR-002).

## Decision

Use internal _row_id as the opaque decimal-string record identity; keep Codigo and ClientesID as exact decimal strings. A create allocates ClientesID as max(existing positive identifier,0)+1 while holding a transaction-scoped table write lock; never change imported identities. The suggested editable business code is a separate read and does not reserve a code. A collision returns the legacy Codigo duplicate message. Existing code is immutable during edit, matching InputEnabled=False. Updates change only the eight form-bound values, preserving provenance and unbound values. No migration or existing record repair is needed.

Blank form text stays empty rather than being trimmed or converted to NULL. Untouched nullable imported fields remain NULL in the command. Numeric input shape/range is checked at the API boundary; business required checks preserve source order. Deletion rechecks the vehicle relationship in the transaction and locks both tables against concurrent vehicle writes during that check/delete; all future vehicle writes must honor this database boundary.

The source's nonduplicate failure fallthrough is U-C286277B-03, not evidence of a successful write. A failed target transaction rolls back and returns a typed failure; the form must remain open and must not claim persisted success. This explicitly replaces ambiguous failure fallthrough for data safety; resulting error presentation remains unresolved and cannot be verified from this ADR. No new user-facing error text is approved. Authentication remains deny-by-default under ADR-004; only explicit opt-in isolated development identities may precede the full access slice.

## Verification

Use actual PostgreSQL for validation/no-write, exact strings/nulls, create/update, duplicates, immutable edit codes, rollback, concurrent identifier allocation, relationship-protected deletion and restart persistence. UI, golden and native tests are separately required. Retain existing U items and print/UMC gaps.

## Mecânicos consumer (MIG-7H, before translation)

WIN_Form_mecanicos.wdw:38–74/382–393 binds Codigo, Descricao, palavra_passe and inativo, locks code on existing records and preserves password case. Apply the same selected internal-id transaction, guarded signed8-byte automatic mecanicosID allocation and typed rollback boundary. Preserve source identity/provenance on update; reject supplied automatic IDs/extra properties. No business-code suggestion or relationship delete guard exists (list286–297). Byte API range remains0..255, mask99 is only live entry. Source compares numeric EDT_Codigo="", not<=0: assumed safe conversion is empty draft→0, NULL/0 required before exact-empty description then password. This is not recovered numeric coercion; U-C17FCA03-03 remains. Read anomalies unchanged; do not unlock or repair them.

Under ADR-004, list/picker/save replies contain only internal id, Codigo, Descricao and inativo. An authenticated selected-id read alone additionally returns mecanicosID and palavra_passe for masked FileToScreen editing, with Cache-Control:no-store and no request/response logging. Save accepts exact nullable password≤15 and description≤100; no trim/uppercase/rehash. Do not put original credentials in goldens/screenshots/logs. Authentication comparisons/query and supported password transition remain with their real consumer/access stage.

## Operation lifecycle checkpoint (MIG-7C3, before translation)

Across actual workflow operations, a failure in ROLLBACK/close must not replace the original typed failure or duplicate classification. Use narrow shared acquisition/connection-error ownership and best-effort failure cleanup; preserve intentional business-branch rollbacks, per-operation locks/SQL/transactions and validation. An operation owns its connected pg Client until close; an unexpected connection error must reach pending queries/typed failure without an unhandled process event or credential diagnostics. This is lifecycle handling, not a generic transaction wrapper. A lost COMMIT acknowledgement remains uncertain U03: never automatically retry or claim persisted/rolled-back state without evidence. Actual AFTER-write/backend-termination tests distinguish known rollback-before-commit from that unresolved acknowledgement boundary.

## Utilizadores consumer (MIG-7L.1, before translation)

WIN_Form_utilizadores.wdw:34–71/364–376 binds Codigo, Descricao (caption Nome) and palavra_passe. Apply selected internal-id writes, guarded signed8-byte automatic utilizadoresID allocation, immutable existing code, exact source identity/provenance and typed rollback. No business-code suggestion or relationship/self/last-user guard exists (list248–257); do not infer one from access/bootstrap. Code remains nullable byte0..255, retaining255 despite live mask99. Source EDT_Codigo="" uses the explicit assumed empty→0/NULL-or0-required conversion before exact-empty name then password; this is not recovered numeric coercion. Whitespace remains exact, no trimming. Read anomalies stay unchanged/immutable; no schema change or data repair.

After all three required checks, source unconditionally assigns Upper(password), including an untouched loaded password, before ScreenToFile and either write. Share one pure conversion in UI/server, using toLocaleUpperCase("pt-PT") as an explicit reversible target default; exact workstation locale/Unicode behavior remains U-CE3323C9-03. The UI visibly retains that transformed draft even after duplicate/nonduplicate refusal. Server repeats the conversion after required checks. The bound raw input is≤15characters; if conversion expands past15, return existing typed invalid without acquiring/writing, no truncation or invented user message. This safe boundary is assumed/U03, not recovered overflow behavior. All synthetic tests distinguish transformation from Mecânicos' case-preserving rule.

Under ADR004, public list/picker/save returns only id/Codigo/Descricao; selected authenticated read alone adds utilizadoresID/password with no-store/no logs. Creation writes exactly the three bound values plus allocated source ID; update writes only name/uppercased password, preserving current identity/provenance. No original credential fixture/report/screenshot. Access comparisons, actual repair combo continuation and bootstrap/session transition stay at their real consuming stages.
