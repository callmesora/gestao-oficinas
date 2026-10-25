# ADR-012 — Table search and saved visibility defaults

- Date: 2026-10-25
- Status: Accepted by delegated default; runtime confirmation remains open
- Rows: RULE-CC16AB27-028, U-CC16AB27-01/02; no parity promotion
- Supersedes only ADR-003's width/order-only saved payload restriction, adding visibility from the evidenced configuration affordance; all other ADR-003 rules remain.

## Evidence

The complete customer list dossier/spec enables With search on all seven columns and Saves col. config. on TABLE_Clientes. docs/evidence/images/WIN_Table_Clientes.jpg shows header magnifiers and the right-edge configuration affordance. The [PC SOFT AAF manual](https://www.pcsoft-windev-webdev.com/windev-user-documentation-for-aaf.pdf), search-column section, describes header entry, sorting by that column and selecting the first prefix match. This is distinct from the source EDT_termo_pesquisa HFilter. Exact current-version menus, captions, keyboard precedence and locale remain U items; documentation alone is not a recorded legacy runtime.

## Decision

Implement search in the column header, preserving all rows of the active server filter. Request ascending sorting through the existing validated real API, then select the first prefix match in that result. Use raw decimal code strings and ADR-009 lowercase text comparison without trimming or accent normalization. No match/blank input preserves existing selection; no arbitrary fallback. Escape closes only the header input, Enter returns focus to the table; both stop propagation to list activation/closure. These interaction edges are assumed reversible defaults. Do not persist search text, sort, selection or business data as column configuration.

Extend the existing version-1 TableLayout with optional hidden qualified column paths. Older width/order settings remain valid and retain their values; no destructive storage migration. Reconciliation discards stale/source-invisible paths. A source-hidden column cannot be exposed; hiding does not discard width/order. A compact configuration panel lists source column captions as checkboxes. Keep at least one column visible so the table remains usable; allow recovery through the panel and Repor reset. New captions Colunas/Pesquisar/Repor and panel geometry/icons are target defaults, not verified legacy text or appearance. Only the customer consumer enables these new controls in this slice.

## Verification

Exercise actual customer/session/API/PostgreSQL data through header search, selected observation, unchanged row set and caller result. Hide a column, resize/reorder others, reload and restore visibility without losing the layout. Preserve stale-read guards, actual golden/browser checks and visual floors. No business or production auth/schema change. Broader context-menu filters/exports and original runtime/native behavior remain explicit follow-up obligations; this ADR does not exclude them.
