# Stage 5 — First real workflow: Clientes (MIG-7A)

## Objective

After the shared screen prerequisite MIG-5b.1 closes (see the rescope checkpoint in stage-4.md), deliver the first usable business workflow: the actual customer list and customer form connected to the application, server and PostgreSQL. It must be reachable from the running app using the temporary development entry point. This replaces synthetic customer fixtures as the proof of progress; it does not implement the full legacy menu. MIG-5b.2 consumer checks are part of this workflow; MIG-5b.3 native acceptance remains open.

This is the first business slice, not a reason to finish MIG-6's unrelated backlog first. Implement only the query/helper behavior these customer units consume. Keep each new concrete pattern in `docs/porting.md`. Leave other QRY units assigned to MIG-6 for their first consuming workflow.

## Read before changing code

Read `docs/runbooks/handoff.md`, `AGENTS.md`, `ROADMAP.md`, ADRs 001–007, `docs/porting.md`, `docs/wlanguage-traps.md`, and the full files:

- `docs/screens/WIN_Table_Clientes.md` and `docs/mapping/WIN_Table_Clientes.md`
- `docs/screens/WIN_Form_Clientes.md` and `docs/mapping/WIN_Form_Clientes.md`
- `docs/parity/WIN_Table_Clientes.csv` and `docs/parity/WIN_Form_Clientes.csv`
- `docs/schema/schema-draft.md`, `docs/navigation.md`, and the database ADR

Run `python3 scripts/unit_evidence.py WIN_Table_Clientes` and `python3 scripts/unit_evidence.py WIN_Form_Clientes`; read real source, database schema and relevant API/library signatures before implementing. Use existing database records only through the isolated scratch/test setup. Never connect to production or mutate the private original.

## Scope

- Build `WIN_Table_Clientes` and `WIN_Form_Clientes` from their generated layouts and skin assets, using legacy control names as `data-testid`. Replace customer-specific synthetic fixture use with a real route through the app's development launcher.
- Load customer rows through the real application/repository/API path. Implement the mapped search modes and blank-search behavior, row selection and observation, add, edit, cancel, required-field validation, next-code suggestion, successful save, duplicate-key message, and caller refresh/return behavior.
- Implement customer delete and the “customers with vehicles cannot be deleted” rule through one authenticated server operation and one transaction. Preserve confirmation flow and exact known Portuguese text. This is a delete slice: perform two separate sequential self-review passes as required by AGENTS.md.
- Implement the precise table/form layouts, source flags, focus and call order supported by committed evidence. Keep `U-CC16AB27-*` and `U-C286277B-*` outcomes visible; do not invent tests for unresolved behavior or mark it verified without the proposal/evidence and real-path test required by AGENTS.md.
- Add or update only the domain/application/API/UI code and evidence needed for these customer behaviors. New data access must be parameterized. Follow ADR-002 value representation and ADR-001 authorization/transaction boundaries.

## Explicit limits

- Do not expand the generic workspace, launcher or skin kit. A proposed shared change must cite the exact customer parity row it unblocks; otherwise record it for its actual consumer or native acceptance stage.
- Do not implement other screens, all MIG-6 query units, the legacy menu, or report families in this stage.
- `WIN_Table_Clientes` has an encoded Print action for `RPT_List_Clientes`. Keep that row open for MIG-13 unless the report is separately briefed with its full mapping/evidence; do not replace it with a no-op and do not claim the whole window is at parity while it remains open.
- Do not resolve missing legacy evidence by guessing. Follow AGENTS.md “No guessing”, preserve U-items and keep a row `implemented` when its behavior remains unresolved.

## Done means

- The running app opens the real customer list from a reachable development entry point; it reads and changes real rows in an isolated PostgreSQL test setup. No synthetic customer data stands in for the feature.
- Add, edit, cancel, each mapped search mode, selection/observation, validation, duplicate handling, relationship-protected delete and caller refresh are exercised through their real UI/use-case/API path. One customer save is one command and one server transaction.
- Browser flows cover the real screens and dialogs; visual comparisons use the generated layouts and retain the existing visual floor. Relevant isolated PostgreSQL checks prove persistence and rollback. Run `npm run verify`, `npm run ui:check`, the required native check when available, and `scripts/parity_check.py docs/parity/parity.csv --seed docs/parity/parity-seed.csv --check-files`; report only checks actually run.
- Update only parity rows proved by tests that exercise the actual behavior. Leave print/report rows and unresolved U-items visible. Complete two sequential self-review passes for this delete-bearing slice, fix findings, update the handoff and progress page, then commit explicit files and push as authorized.
- Follow `skills/review/SKILL.md` during both review passes and reread `docs/decisions/` before closing the stage.

## Review mode

Owner permits self-review. Since this workflow includes deleting records, make two separate sequential passes; state in the handoff that the same agent performed both passes and list any remaining findings or unavailable native/person checks.

## Delivery checkpoint and retained follow-up — 2026-10-24

MIG-7A.1 is the usable customer workflow: real list/form/session/API/PostgreSQL, the mapped business actions above, source-based visuals, imported-copy replay and spec-derived golden comparison. It may unblock Viaturas after its review and checks close; it does not declare the entire customer unit at parity.

MIG-7A.2, brief stage-5-followup.md, retains the full designer/table-feature obligation (RULE-CC16AB27-028/RULE-C286277B-011), column search/visibility/scrollbar gaps and unresolved selection/caller/mask/keyboard outcomes. Schedule it after the first three usable workflows/cleanup and before further leaf workflows. Native, framework-dialog reference and human approvals stay with MIG-15; report printing stays MIG-13. No parity row or U item is removed or excluded by this scheduling split. The MIG-7A parent remains in progress until its owned follow-up closes.
