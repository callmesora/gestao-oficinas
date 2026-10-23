# Independent workflow mapping review

Reviewed 23 October 2026. Scope: all 30 workflow, reporting-filter, stock-document, time-entry, keyboard and WDFAA windows mapped by another agent. No mappings, scripts, original sources, evidence packs or datasets were edited. This report is the only written artifact.

## Result

All 30 unit parity gates pass, all 474 source seed IDs remain covered, and all 124 encoded action slots are represented (11 also have executable code). The mappings contain 361 code blocks and 1,378 parity rows. No missing event, stale evidence pack, falsified designer metadata, verified runtime-proposal claim, or concrete stock/labor business-rule reversal was found.

There are two documentation findings below. They concern per-row evidence scope and overbroad unresolved questions; the full source ledgers preserve the legacy branch behavior. They do not establish runtime parity, and no application implementation has been approved.

## 1. Mechanical and newer evidence

Ran `scripts/parity_check.py` separately for every unit with its per-unit CSV, the seed matrix, `--element`, `--check-files`, and both mapping/screen notes. Every invocation returned exit 0 and no ERROR lines.

Regenerated current packs entirely in memory using `scripts/unit_evidence.py`'s `pack(unit, latest)` function and compared complete objects against the retained packs. All 30 were identical. This is equivalent to a sorted JSON structural diff without writing new files or touching the ignored evidence tree. No newly available flags, action proposals, event meanings or dossier fields were missed.

## 2. Missing rows or events

None found. Independently checked every encoded action's action ID and control context against its parity row, including slots that also have code. Every extracted designer control has a matching property parity row; parsing that row's JSON reproduces the pack's complete control object exactly.

Compared every executable branch/assignment ledger with the exact legacy block range after trimming indentation, blank lines and comments. 360 of 361 blocks matched exactly. The remaining `WIN_MENU` initialization block (`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:931-949`) deliberately redacts credential assignments; no credential value is repeated here. No other executable source line was omitted.

## 3. Misread rules

No concrete business-rule misread found in the audited flows. In particular, the mappings correctly retain these counterintuitive legacy facts rather than silently fixing them:

- `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:875-904`: document deletion applies the same movement sign as creation (incoming quantity increases stock again), then deletes lines/header. Missing document type leaves the default movement branch; no transaction or checked result is added.
- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1174-1195`: deleting an order deletes order/material/labor rows without restoring article stock. The mapping records this separately from the material editor's stock compensation.
- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:845-884`: save restores quantities for old material rows, deletes old rows, inserts memory rows and reapplies stock. The example stock 10 + old quantity 2 - replacement quantity 3 = 9 is correct under that entry-state interpretation.
- `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:591-600`: extra and ordinary material totals are separate, VAT multiplier 1.23 applies only to the ordinary subtotal, and `.2f` controls display. The mapping does not add extras into the VAT subtotal.
- `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:141` versus `:963-969`: system close bypasses the Sair write loop; ordinary close is therefore not equivalent to saving edited flags/prices.
- `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1103-1141`: labor durations keep the exact unusual RoundUp minute formula and single carry in HH:MM summation. The mapping does not replace it with conventional floor/round duration arithmetic.
- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:328-350`: declining closure of another job does not abort starting further work; the No branch is empty. At `:378-385` and `:412-419`, a state UPDATE is followed by insertion using the earlier order query buffer; stale state remains an evidence-based risk rather than a verified repaired result.
- `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:721-748`: a RETURN after successful write-lock acquisition can bypass the explicit unlock. The note flags the risk without claiming runtime lock release or inventing a finally block.
- `WINDEVDIALOGBOX` maps cancel button indices separately from explicit button return values. It leaves the resource-to-runtime connection unresolved rather than turning cancel_button=1 into an unproven safe destructive-dialog answer.

Keyboard summaries preserve observed quirks (physical comma dispatch, caption click writing 7, case-state behavior). Barcode parsing preserves 1-based Middle arguments as lengths, and the reader-created dynamic file contract is documented. These are source checks, not golden runtime observations.

## 4. Wrong confidence / evidence scope

**WF-01 — P2: Long event summaries append unit-wide claims outside the cited source range.** Example: `docs/parity/WIN_Ordens_Reparacao_Form.csv`, `SRC-f349dfb841` is verified and cites only `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:273-336`, the plate exit event. Its description appends the unit-wide outline, including MODIFICAR entry mode and NOVO max(numero)+1 allocation, whose evidence is in other blocks. It even ends mid-sentence at `Movement guard S`. There are 26 summaries generated in this shape; the affected IDs are listed below.

The appended outline is broadly correct elsewhere in the note, but it is not established by the row's source range. Fix by removing the unrelated/truncated unit outline from that event row, keeping a concise event-specific summary and a durable note reference; alternatively split each added fact into a separately evidenced rule row. Do not downgrade directly read event code merely because unrelated claims were appended.

The flattened token summaries also discard ELSE/END before joining branches. For example `SRC-ae1306063e` in `WIN_Table_Lin_Stocks` lists both mechanic visibility assignments in one linear sentence although they are mutually exclusive. The complete fenced ledger is correct. Mark these strings explicitly as an abbreviated source index with branch structure in the named ledger, or replace them with branch-aware prose; do not present the flattened token list as unconditional operation order.

## 5. Unresolved items evidence settles or narrows

**WF-02 — P2: The same broad runtime blockers are copied to units with no relevant operation.** Example: `docs/mapping/WIN_Data.md:83` routes failed/partial writes, current-buffer errors and concurrent edits to `U-W16C5A7-03`; its Unresolved section says concurrent sessions, timer reentrancy, locks and failed writes block parity. Yet the entire unit has only a parameter/global initialization block and a confirm assignment, with no HFSQL calls, timers, locks or persistence (`legacy/GestaoOficinas_TesteIA/WIN_Data.wdw`, both mapped blocks). Similar generic money/minute questions appear on this date picker.

Fix by narrowing each U-item to operations actually present and marking nonexistent HFSQL/timer/write/money paths not applicable. Keep actual date coercion/default-return/focus questions. The retained caller evidence already resolves many entry routes; a generic entry-route U-item should name only the missing route/property rather than implying every route is unknown. This is documentation scope correction, not a request to run the legacy app.

## 6. Implementer blockers and limits

Existing U-items correctly retain the remaining runtime/visual limits: first/empty/filtered-out selection, keyboard/default/Esc routing, resource wiring, concurrent buffers, partial writes, locale coercion and image approval. No additional silent blocker was found beyond the two documentation findings. Shared-HFSQL-context claims match the dossier flags when available. Source-only WDFAA windows keep missing designer information unresolved rather than manufacturing flags.

Style, runtime shell appearance and end-to-end data effects were not certified by this review. The presence of complete token ledgers is evidence preservation, not a substitute for implementing and testing behavior later. No migration, scaffolding, ADR or bug fix is authorized by this report.

## Unit coverage

| Unit | Code blocks | Encoded slots (including with-code) | Parity rows | Mechanical / pack diff |
|---|---:|---:|---:|---|
| WIN_Acesso | 4 | 5 | 28 | Pass / identical |
| WIN_Data | 2 | 1 | 13 | Pass / identical |
| WIN_Extrato_Artigos | 4 | 4 | 28 | Pass / identical |
| WIN_Filtro_Mapas_Artigos | 11 | 4 | 54 | Pass / identical |
| WIN_Filtro_Mapas_Tempos | 6 | 4 | 36 | Pass / identical |
| WIN_Inserir_quantidade_password | 5 | 6 | 29 | Pass / identical |
| WIN_Inventario | 2 | 5 | 25 | Pass / identical |
| WIN_Leitor_cod_barras | 4 | 4 | 26 | Pass / identical |
| WIN_Leitor_cod_barras_desconhecidos | 2 | 4 | 23 | Pass / identical |
| WIN_MENU | 38 | 4 | 63 | Pass / identical |
| WIN_Mapa_Vendas | 5 | 4 | 30 | Pass / identical |
| WIN_Material_Reparacao | 13 | 4 | 47 | Pass / identical |
| WIN_Material_reparacao_form | 19 | 3 | 70 | Pass / identical |
| WIN_Mudar_Estado | 3 | 6 | 25 | Pass / identical |
| WIN_Ordens_Reparacao | 23 | 5 | 95 | Pass / identical |
| WIN_Ordens_Reparacao_Form | 18 | 6 | 70 | Pass / identical |
| WIN_Reconstrucao_Stocks | 2 | 4 | 19 | Pass / identical |
| WIN_Table_Lin_Stocks | 12 | 6 | 69 | Pass / identical |
| WIN_Table_Tempos_materiais_Descricoes | 11 | 3 | 54 | Pass / identical |
| WIN_Table_cab_stocks | 11 | 4 | 45 | Pass / identical |
| WIN_Teclado_numerico | 20 | 0 | 43 | Pass / identical |
| WIN_Tempos_Reparacao | 22 | 4 | 75 | Pass / identical |
| WIN_Tempos_Reparacao_Estado | 11 | 6 | 50 | Pass / identical |
| WIN_Tempos_Reparacao_Informacao | 4 | 3 | 30 | Pass / identical |
| WIN_Tempos_Reparacao_Tempo | 3 | 6 | 26 | Pass / identical |
| WIN_Teclado_Alfa | 73 | 0 | 150 | Pass / identical |
| WIN_Inventario_Reconstrucao | 2 | 5 | 22 | Pass / identical |
| WIN_sistema | 2 | 6 | 30 | Pass / identical |
| WINDEVDIALOGBOX | 20 | 4 | 64 | Pass / identical |
| WINDEVMESSAGEBOX | 9 | 4 | 39 | Pass / identical |

## WF-01 affected event rows

- `WIN_Filtro_Mapas_Artigos` / `SRC-9079af9bc2`
- `WIN_Leitor_cod_barras` / `SRC-43303c5e91`
- `WIN_Material_Reparacao` / `SRC-5b7c9d17d1`
- `WIN_Material_reparacao_form` / `SRC-eb5a859599`
- `WIN_Material_reparacao_form` / `SRC-ccd6dd9cc2`
- `WIN_Ordens_Reparacao` / `SRC-a2f17b1885`
- `WIN_Ordens_Reparacao_Form` / `SRC-f349dfb841`
- `WIN_Ordens_Reparacao_Form` / `SRC-b0064a0577`
- `WIN_Ordens_Reparacao_Form` / `SRC-55e462b0d2`
- `WIN_Ordens_Reparacao_Form` / `SRC-8bd3f318a9`
- `WIN_Ordens_Reparacao_Form` / `SRC-b2e6eeadd9`
- `WIN_Reconstrucao_Stocks` / `SRC-a8e5103dd4`
- `WIN_Table_Lin_Stocks` / `SRC-26ff5eb37e`
- `WIN_Table_Lin_Stocks` / `SRC-472cf8335a`
- `WIN_Table_Tempos_materiais_Descricoes` / `SRC-0f2fcff124`
- `WIN_Table_Tempos_materiais_Descricoes` / `SRC-02ca01d2a4`
- `WIN_Table_cab_stocks` / `SRC-ee97be64de`
- `WIN_Tempos_Reparacao` / `SRC-de53acf761`
- `WIN_Tempos_Reparacao_Tempo` / `SRC-39eeaad136`
- `WIN_Teclado_Alfa` / `SRC-d7b1caf69a`
- `WIN_Teclado_Alfa` / `SRC-ca4828ceb2`
- `WIN_Inventario_Reconstrucao` / `SRC-a1328f1bb2`
- `WINDEVDIALOGBOX` / `SRC-318c693490`
- `WINDEVDIALOGBOX` / `SRC-2e0e702cf2`
- `WINDEVDIALOGBOX` / `SRC-68a9e0c43f`
- `WINDEVMESSAGEBOX` / `SRC-bd5274ab50`

## Finding counts

Mechanical: 0. Newer evidence: 0. Missing rows/events: 0. Confirmed business-rule misreads: 0. Confidence/evidence-scope findings: 1 (WF-01). Unresolved-scope findings: 1 (WF-02). Additional silent implementer blockers: 0. Total: 2 documentation findings, with no source/mapping edits performed by this reviewer.

## Fix verification — WF-01 and WF-02

Applied the documentation fixes to all 30 workflow units. Removed 26 truncated/unrelated unit outlines from event descriptions. All 361 source-event descriptions are explicitly abbreviated indexes whose omitted ELSE/END nesting is authoritative only in the exact fenced source ledger; no source branch, seed ID or encoded proposal was changed.

Narrowed the five per-unit applicability/U categories using actual source functions, named mutation queries, timers, locks, explicit message calls, grids and field types. Known caller routes are no longer described as unknown. Source-proven absent local database/timer/write or message paths are specified as not applicable (24 non-SRC rules), while genuine runtime/visual/type-edge questions remain unresolved and unmapped. Screen checklists and acceptance scenarios now follow the same scope. No runtime test is claimed and no unknown behavior is promoted to verified.

Revalidated all 30 per-unit matrices with seed coverage, file checks and both mapping/screen notes: PASS, no ERROR lines. Source seeds and encoded-action confidence/status values were asserted unchanged. No source/application/shared index or consolidated parity file was edited.
