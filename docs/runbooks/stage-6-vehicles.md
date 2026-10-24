# MIG-7B — real Viaturas list and form

Read handoff, AGENTS, ROADMAP, all applicable ADRs and docs/porting.md. Customer core b646e15 is pushed; the customer parent/designer follow-up remains open and is not a reason to substitute customer fixtures. Inspect current Git/process state and preserve changes. Work sequentially; no generic CRUD abstraction before the cleanup checkpoint.

## Evidence before coding

Read full maps/specs/parity CSVs and real source for WIN_Table_Viaturas and WIN_Form_Viaturas, their dossier images and direct caller/callee contracts, schema/data/profile and the relevant query dossier definitions. Build both unit evidence packs. Include QRY_select_viaturas and QRY_select_viatura_matricula only with this actual consumer (their maps and CSVs retain their MIG-6 ownership). Reuse the real customer workflow for the form's BTN_VISION picker, including an awaited modal return and combo refresh/seek.

## Scope and important source differences

- Reachable development route with generated MediaPlayer layouts/assets, all mapped business inputs/actions, current-row selection and source caller returns. Use the real authenticated API/PostgreSQL path and actual imported-copy replay.
- List query is an inner join Viaturas.Cliente=Clientes.Codigo ordered by matricula; preserve duplicate retention and absence of orphan vehicles from that result. Exact registration lookup has no customer join. Inspect text-key/collation anomalies before choosing a create-duplicate invariant; do not add guessed constraints or edit migration 0001.
- Form accepts estado/codigo: NOVO seeds/enables registration, edit loads by original registration and locks that field. Validate registration, client, make, model in the exact source order/messages; uppercase registration. New HAdd duplicate error differs from edit's SQL update by original registration (which can affect matching duplicates). Year/month zero values and source sizes follow evidence; do not invent calendar/business constraints.
- Preserve the list's source filter distinction: typing filters QRY_select_viaturas, but non-todos mode buttons clear Viaturas, whereas todos clears the query. Do not automatically apply the customer screen's clear-filter handler. Preserve the prior-registration refresh/reselect sequence after add/modify; unresolved missing-row outcomes keep their U items.
- Delete first checks repair-order use and shows `Viatura usada em ordens de reparação, não pode ser eliminada`; explicit confirmation then one authenticated transaction rechecks/deletes. Coordinate table-lock order with customer deletion/vehicle ownership writes. Parameterize SQL and return committed state only; record any necessary failure/identity/collation choice in an ADR before implementation.
- Implement BTN_VISION through the actual customer selector and customer combo data; no mock or fixed selected code. Cancel/system close must retain caller values and leave the vehicle form alive. Delayed reads must not permit stale-record actions; preserve original unchanged text/NULL and Windows memo semantics.

## Gates and limits

Two separate sequential self-review passes (delete-bearing slice), fixing findings; real PostgreSQL/API tests for writes, rollback, duplicate/orphan/relationship/concurrency cases; spec-derived golden export comparison; actual browser search/add/edit/cancel/picker/delete/return flows; configured control/caption/assets and visual scores without lowering floors; npm run verify and applicable native checks. Distinguish native metadata from business-native persistence. Reread ADRs before closure, update only proved parity statuses, roadmap, handoff/progress, commit explicit files and push.

Print/RPT_List_Viaturas stays assigned to MIG-13; UMC has no approved exclusion. Keep U-C039C545-*, U-C9675195-*, U-Q21-* and U-Q22-* visible. Do not implement repair-order screens, unrelated queries, a permission redesign or generic launcher improvements. No production operations. After this pair, choose the simplest independent lookup pair from full mapping/dependencies, deliver it, then MIG-7C and retained follow-ups before further leaf work.

## Delivery boundary

MIG-7B.1 delivers the usable real vehicle pair and the actual customer picker consumer after the checks above. MIG-7B.2 (stage-6-vehicles-followup.md) retains exact designer/table/mask/key and cross-window coupling work after the early three workflows/cleanup and before more leaf screens. Repair-order caller continuation stays assigned to MIG-8, print to MIG-13 and native/human gates to MIG-15. Parent MIG-7B remains in progress; no complete-window parity claim or seed exclusion follows from this split.
