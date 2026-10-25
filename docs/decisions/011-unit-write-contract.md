# ADR-011 — Unit record identity and text-key writes

- Date: 2026-10-25
- Status: Accepted (owner may supersede)
- Decided by: default, constrained by source
- Rows: SRC-a5097f5947, SRC-226f5f62f3; no parity promotion

## Evidence and decision

WIN_Form_unidades.wdw:34–62 requires only nonempty Codigo, then HAdd/HModify and source duplicate handling. Lines 332–344 disable code in edit and initialize false return. WIN_Table_unidades.wdw:180–216 resets on creation and refreshes after modal return; lines 241–262 check artigos.unidade then TableDelete the selected record. The schema declares unique Codigo string3, description string50 and automatic unidadesID. Migration 0001 retains text-key indexes without guessed HFSQL collation uniqueness; the imported profile has four distinct unit codes.

Use exact string internal _row_id for selected record writes, as HModify/TableDelete target a current record rather than all records sharing a text key. Preserve unidadesID and provenance on edit. Creation allocates max(existing positive unidadesID,0)+1 under a unidades table write lock and rejects an existing exact Codigo with the source duplicate message. No uppercase/trim, numeric coercion or mandatory description is added. Untouched nullable/text values remain intact under ADR-002. Existing anomalies remain; no schema/index change or data repair. HFSQL case/accent/space key equivalence stays U-C77806F9-03, not verified by this reversible exact-match default.

One save/delete is one transaction, committed success only. Source ambiguous nonduplicate failure fallthrough is replaced by rollback plus typed failure, keeping the form open without invented error text (same safe boundary as ADR-008/010). Deletion locks unidades then artigos, rechecks current source code/article use, then deletes only the selected internal record. Future article writes must honor this order. Preconfirmation is a separate read; safe default cancellation remains ADR-006/U.

List defaults to source unidadesID order with _row_id as deterministic interim tie, not recovered legacy tie ordering. No initial/after-delete fallback selection or table input mode is invented; taCurrentSelection preserves an existing explicit selection where available. Source read-only table input-row handlers remain unverified and visible. Sorting is restricted to mapped column names; complete search/config/mask/native behavior is a separate retained designer obligation.

## Verification

Actual PostgreSQL/API/browser/golden/import checks must prove those boundaries. Test code `0` and blank description as allowed text, exact spaces/case unchanged, competing exact duplicate creates, rollback and article use. No test pins unknown collation, implicit selection or destructive Escape behavior. No source or production database is modified.

The source automatic identifier is signed 8-byte (column mapping sourceCode 24, ADR-002). Allocation must stop at 9223372036854775807, not merely fit PostgreSQL NUMERIC(20,0). Exhaustion returns typed failure and rolls back without a new message; never wrap, reuse or persist an out-of-source-range ID. The immediate MIG-7C audit applies the same source-range check to the already implemented customer/vehicle allocation patterns.

## Repair-state consumer (MIG-7I, before translation)

WIN_Form_estados_reparacao.wdw:38–66/506–536 has the same immutable existing text3 Codigo, optional nullable description50 and guarded signed8 automatic identity pattern. Apply selected internal identity, unchanged provenance and exact text-key duplicate/required messages, with no trim/case conversion, code suggestion, schema change or anomaly repair. Bind tipo byte0..255, Cor unsigned32 (0..4294967295) and all five nullable Boolean flags losslessly; only actual user edits replace NULL/out-of-option values. New defaults follow HReset/schema: Cor0, fivefalse, description empty, then explicit tipo1. ADR-008/C3 owns typed failure and safe lifecycle; lost COMMIT acknowledgement stays U03.

List default follows estados_reparacaoID with internal-id tie under the existing reversible U02 ordering default. Source list258–265 refreshes before editing and after every edit result; new cancellation has no refresh. Deletion checks ordem_reparacao.reparacao_estado by the selected current Codigo before confirmation, then rechecks under the same transaction locks on estados_reparacao followed by ordem_reparacao. Exact associated message is source297. Future repair writes must honor that order. No new relations to time/material records are inferred. Ordinary selecionar mode only shows its source selection button and returns Codigo/default origem: no invented CRUD hiding, arrows, row-height or tipo filter. The separate tipo3 window remains a distinct real-caller dependency.

## Documentos consumer (MIG-7J.1, before translation)

WIN_Form_documentos.wdw:38–66/383–397 uses the same immutable existing text3 code, optional nullable description50 and guarded signed8 documentosID pattern. Save input Codigo remains string, while read records retain nullable source codes; no trim/case conversion or code allocator. Stock is a nullable byte0..255, not a two-value storage enum; obriga_macanico remains its literal nullable Boolean name. New stock1 follows the explicit post-FileToScreen assignment; checkboxfalse follows HReset/schema. Only deliberate changes replace imported NULL/out-of-option values. Preserve selected internal identity, automatic ID/provenance and C3 operation failure/rollback boundaries; no schema/index/data repair.

List browse order is documentosID with the existing interim tie/U02 default. Source274–281 opens the current selected record without a preliminary refresh, then refreshes after every edit return; creation refreshes onlytrue. Delete306–327 checks cab_stocks.documento_codigo against selected current Codigo before confirmation and transactionally rechecks under documentos then cab_stocks locks. Future stock writes honor that order; cab_stocks.DocumentosID and lin_stocks are not source guards. Source selector hides CRUD/print, uses30px rows/closeY503×38/arrows/focus, returns exact code/default string origin and retains literal1-based navigation predicates. NULL buffer/cursor coupling and actual stock caller continuation remain U02/consuming-stage obligations. The mechanic flag's caption does not create a save requirement absent from Lin_Stocks853–931.
