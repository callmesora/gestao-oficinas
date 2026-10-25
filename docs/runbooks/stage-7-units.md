# MIG-7D — Unidades, third independent real list/form pair

Customer core b646e15 and vehicle core 42763c2 are pushed. Read current handoff/ROADMAP, ADRs and docs/porting.md. Work sequentially, with real authenticated API/PostgreSQL and source-generated layouts. No generic CRUD abstraction before MIG-7C.

## Selection and evidence

Unidades is the simplest independent pair: WIN_Form_unidades has two text fields, only Codigo required, no query or picker dependency. Unlike documentos it has no stock-direction radio; unlike postos it has no terminal picker; no access/password or state/color model is involved. Its full two maps/specs/parity CSVs and actual source were read; source table is read-only with no explicit double-click handler. The new-row GR_ACTION handlers remain recorded without fabricating an input mode that the designer disables.

Own WIN_Table_unidades and WIN_Form_unidades rows. Generate unit packs and inspect both source images; confirm unidades schema (unidadesID automatic 8 bytes, Codigo string3 unique, Descricao string50), actual migration/plain text-key indexes, artigos.unidade link and profile. Direct caller WIN_MENU.wdw:640–651 restores or opens the table; production menu implementation stays MIG-12. No standalone query backlog is needed.

## Implementation contract

- Reachable isolated development route, actual list data, source columns and per-record selection. Browse order unidadesID; sorting only mapped source columns. No invented selection/default/double-click or editable table row.
- Novo resets to empty create values, opens a blocking form, refreshes only on true with source taCurrentFirst semantics (unknown initial/after-refresh selection stays U). Modificar requires a selected record, disables Codigo editing, loads its exact original values and refreshes retaining explicit selection on either result.
- Required Codigo uses exact `Falta indicar o código`; no description requirement, trimming, numeric interpretation or uppercasing. HAdd/HModify duplicates show source three-line text. Record target identity/text-key/failure decisions in an ADR before coding, retaining imported anomalies and provenance; never edit migration 0001.
- Delete checks artigos.unidade before confirmation with exact `Unidade usada em artigos, não pode ser eliminada`, then one transaction locks/rechecks/deletes the selected internal row. Safe destructive defaults remain assumed/U. No new error message is approved.
- Preserve source skin, generated control names, max lengths, automatic erase and modal cancellation ownership. Source-enabled column config/search/scrollbars and exact keys/masks stay visible in the designer rows and are audited with the immediate post-six-window cleanup/follow-up; do not mark them verified from a screenshot alone.

## Gates

Real database/API tests for required/no-write, blank description, text/NULL preservation, exact large identities, duplicates and concurrent creates, immutable code, rollback and article-protected delete. Actual browser add/edit/cancel/delete/reload and keyboard flows, imported-copy comparison, spec-derived golden comparator, every opened window in visual/control config without reduced floors. Two sequential self-review passes; npm run verify, applicable native check, parity/roadmap/handoff/progress, explicit-file commit/push.

Keep U-C77806F9-* / U-CCB16084-*, dormant input-row events, print/RPT_List_unidades (MIG-13), UMC (no exclusion) and native/human gates (MIG-15). After this usable pair, do MIG-7C and retained customer/vehicle/unit designer work before further leaf workflows. Full migration remains the goal.

Delivery boundary: MIG-7D.1 is the usable core after these tests/reviews close. MIG-7D.2 is the exact retained designer/table/keyboard brief stage-7-units-followup.md, immediately after MIG-7C and before further leaf workflows. The parent stays in progress; no complete-window or report parity follows from the six-window milestone.
