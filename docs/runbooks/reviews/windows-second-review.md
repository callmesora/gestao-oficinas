# Second independent window mapping review

2026-10-23. Scope: Step 0 evidence and mapping only. Reviewed independently from source, retained packs, parsed dossier, final unit mapping/spec/parity files and docs/mapping/event-codes.md. No previous reviewer reports or mapper reasoning reports were consulted. Root AGENTS.md, skills/review-mapping/SKILL.md, docs/mapping/README.md, docs/wlanguage-traps.md and docs/porting.md read. docs/runbooks/handoff.md was absent. The available answer sheet is docs/evidence-report.md sections 3–4; its questions and action groups remain unchecked, with proposed answers. No runtime answer was inferred from those proposals.

## Mechanical and newer evidence

All 53 per-window parity_check invocations passed (exit 0). All 746 SRC seed IDs retained. Reviewed population: 1820 rows, 513 source blocks and 280 encoded action slots. Every fresh in-memory unit pack equaled its retained pack in every top-level field. No regenerated evidence files were written. All 53 original supplied source files match the corresponding immutable legacy copies byte-for-byte.

Normalized executable block text (blank lines, indentation and comments excluded) was compared with the mapping fenced ledgers across all 513 blocks. No executable omission was found, allowing the intentional credential redaction. All 664 `Designer properties` parity payloads match actual parsed control objects exactly. No verified row cites a proposed action as verified evidence.

Mechanical findings: 0. Newer-evidence findings: 0. Missing code/action slots: 0.

## Misread rules

### F-W2-01 — correct the other-order labor state in the summary (P2)

Where: docs/mapping/WIN_Tempos_Reparacao_Tempo.md:34 and docs/screens/WIN_Tempos_Reparacao_Tempo.md:9, wording “Yes closes that work with now/current order state”.

Evidence: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:332-341 first finds an open labor row whose numero differs from the form numero, reloads QRY_select_ordens_reparacao_numero for that other numero (334), then uses that reloaded order's reparacao_estado in the UPDATE (339). The form's order is loaded again only at 355. The exact ledger is already correct.

Fix: say “Yes closes that other order's open labor with SysDateTime() and that other order's reparacao_estado.” Preserve the later current-order close as a separate branch. This is a source-settled documentation correction; no new runtime U item is needed.

### F-W2-02 — the labor state chooser offers types 3, 4 and 5 (P2)

Where: the same two summary paragraphs, wording “Other state types open type3 chooser”.

Evidence: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:378 and :412 open WIN_Table_estado_reparacao_tipo3. That window's actual loading SQL includes `tipo=3 or tipo=4 or tipo=5`, ordered by tipo (see exact initialization ledger in docs/mapping/WIN_Table_estado_reparacao_tipo3.md and its DOMAIN parity row). The selector mapping already explicitly warns its name is misleading.

Fix: use “opens WIN_Table_estado_reparacao_tipo3, whose choices include types 3/4/5” in both summaries. This prevents a later implementer from limiting the chooser to type 3. No runtime question is required.

## Wrong confidence labels

No additional verified/assumed conflation found in the checked rows. Encoded closure and print actions correctly remain assumed, and actual native Enter/Escape/resource wiring remains unresolved.

## Unresolved items evidence settles or narrows

### F-W2-03 — 13 screen binding cells incorrectly call available browse metadata unresolved (P2)

The following Binding cells say “unresolved (encoded)” although the parsed dossier supplies browsed_file and, where shown, browsed_item. The corresponding parity Designer properties rows already preserve these values correctly. Evidence for each row is `dossier: UNIT/controls/CONTROL/browsed_file` and `/browsed_item`.

| Screen location | Control | browsed_file | browsed_item |
| --- | --- | --- | --- |
| docs/screens/WIN_Inventario.md:32 | TABLE_Artigos | `artigos` | `Codigo` |
| docs/screens/WIN_Material_Reparacao.md:32 | TABLE_ordens_reparacao | `QRY_select_ordens_reparacao_matricula` | `numero` |
| docs/screens/WIN_Material_Reparacao.md:41 | LIST_mecanicos | `mecanicos` | `Codigo` |
| docs/screens/WIN_Ordens_Reparacao.md:51 | COMBO_mecanico | `mecanicos` | `Codigo` |
| docs/screens/WIN_Ordens_Reparacao_Form.md:43 | COMBO_Recepcionado | `utilizadores` | `Codigo` |
| docs/screens/WIN_Ordens_Reparacao_Form.md:45 | COMBO_mecanico | `mecanicos` | `Codigo` |
| docs/screens/WIN_Table_Lin_Stocks.md:42 | COMBO_mecanico | `mecanicos` | `Codigo` |
| docs/screens/WIN_Table_Lin_Stocks.md:43 | COMBO_tipo_doc | `documentos` | `Codigo` |
| docs/screens/WIN_Table_cab_stocks.md:32 | TABLE_cab_stocks | `QRY_select_cab_stocks` | `not extracted` |
| docs/screens/WIN_Table_cab_stocks.md:38 | COMBO_tipo_doc | `documentos` | `Codigo` |
| docs/screens/WIN_Tempos_Reparacao.md:33 | TABLE_tempos_reparacao | `QRY_select_ordens_reparacao_tempos` | `not extracted` |
| docs/screens/WIN_Tempos_Reparacao.md:34 | TABLE_tempos_reparacao_ordem | `QRY_select_tempos_reparacao_ordem` | `not extracted` |
| docs/screens/WIN_Tempos_Reparacao.md:47 | LIST_mecanicos | `mecanicos` | `inativo` |

Fix: retain linked_item as the scalar field binding where present, and display browsed_file/browsed_item separately for file/query tables, lists and combos. Replace only the incorrect unknown Binding cells; retain unknown masks or missing fields. Narrow the corresponding U-UNIT-01 scope so it does not request rediscovery of these known fields. This requires document correction, not running the legacy app. Do not infer displayed/stored columns solely from browsed_item; use the separate parsed fields or leave those unknown.

## Implementer blockers and risk checks

No additional silent blocker identified beyond the documented U items. Independent source examination covered stock-document save/replace/delete signs and ordering; stock reconstruction's mismatched HFound target; repair material restore/delete/reinsert/subtract; order deletion without stock restoration; form write failures and duplicate-specific aborts; labor start/finish and state choice; timer startup catch-up and periodic writes; order/material locks and early-return unlock bypasses; native buffer sharing and modal caller continuation. Those observed defects and absence of transactions/checks are already preserved in the final exact ledgers; this review does not approve changing them.

Especially checked: legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:853-931; WIN_Table_cab_stocks.wdw:860-907; WIN_Reconstrucao_Stocks.wdw:197-260; WIN_Inventario_Reconstrucao.wdw:197-260; WIN_Material_reparacao_form.wdw:758-884, :908-947; WIN_Ordens_Reparacao.wdw:1174-1195, :1636-1751; WIN_Ordens_Reparacao_Form.wdw:943-1125, :1181-1206; WIN_Material_Reparacao.wdw:465-527; WIN_Table_Tempos_materiais_Descricoes.wdw:721-767, :963-1054, :1103-1141; WIN_Tempos_Reparacao.wdw:1368-1389, :1441-1487; WIN_Tempos_Reparacao_Tempo.wdw:241-432; WIN_Tempos_Reparacao_Estado.wdw:353-371; WIN_sistema.wdw:198-214. These paths all have the legacy/GestaoOficinas_TesteIA/ prefix.

Dialog resources retain cancel_button=1 while actual WDFAA binding is unproved. WINDEVDIALOGBOX uses cancel index/explicit Note differently; therefore no destructive Escape outcome was promoted to verified. Missing-record buffer contents, native refresh/selection, query error dialogs, timer runtime reentrancy and numeric/date coercions still need isolated observations under their existing U identifiers. No execution of legacy code, production connection, app build or schema implementation occurred.

## Units checked and limits

All maps, specs, per-unit CSVs, current packs and actual source block ledgers were checked for:

WINDEVDIALOGBOX, WINDEVMESSAGEBOX, WIN_Acesso, WIN_Data, WIN_Extrato_Artigos, WIN_Filtro_Mapas_Artigos, WIN_Filtro_Mapas_Tempos, WIN_Form_Clientes, WIN_Form_Terminais, WIN_Form_Viaturas, WIN_Form_artigos, WIN_Form_documentos, WIN_Form_estados_descritivos, WIN_Form_estados_reparacao, WIN_Form_mecanicos, WIN_Form_postos, WIN_Form_unidades, WIN_Form_utilizadores, WIN_Inserir_quantidade_password, WIN_Inventario, WIN_Inventario_Reconstrucao, WIN_Leitor_cod_barras, WIN_Leitor_cod_barras_desconhecidos, WIN_MENU, WIN_Mapa_Vendas, WIN_Material_Reparacao, WIN_Material_reparacao_form, WIN_Mudar_Estado, WIN_Ordens_Reparacao, WIN_Ordens_Reparacao_Form, WIN_Reconstrucao_Stocks, WIN_Table_Clientes, WIN_Table_Lin_Stocks, WIN_Table_Tempos_materiais_Descricoes, WIN_Table_Terminais, WIN_Table_Viaturas, WIN_Table_artigos, WIN_Table_cab_stocks, WIN_Table_documentos, WIN_Table_estado_reparacao_tipo3, WIN_Table_estados_descritivos, WIN_Table_estados_reparacao, WIN_Table_mecanicos, WIN_Table_postos, WIN_Table_unidades, WIN_Table_utilizadores, WIN_Teclado_Alfa, WIN_Teclado_numerico, WIN_Tempos_Reparacao, WIN_Tempos_Reparacao_Estado, WIN_Tempos_Reparacao_Informacao, WIN_Tempos_Reparacao_Tempo, WIN_sistema.

The exhaustive portion is the mechanical/evidence/ledger comparison. Human semantic review concentrated on the financially/destructively risky and shared-state handlers listed above; this is not a claim that every designer pixel, every formatting boundary or every possible runtime path was experimentally verified. No application execution or visual approval occurred. No compiled blob was decoded. Open runtime questions remain Step 0 questions, not implementation approval.

Counts: mechanical 0; newer evidence 0; missing rows/events 0; misread rules 2; wrong confidence labels 0; evidence-narrowable unresolved groups 1 (13 cells across 7 units); new silent implementer blockers 0. Total actionable findings: 3. Only this review file was authored; no mapping edits or commits/pushes.

## Fix verification

Applied the three source-supported corrections as the assigned single fixer. No runtime U item was promoted, and no SRC ID, source, dataset, analysis-local, consolidated or generator file changed.

- F-W2-01 and F-W2-02: corrected the other-order state attribution and chooser types 3/4/5 in docs/mapping/WIN_Tempos_Reparacao_Tempo.md:34 and docs/screens/WIN_Tempos_Reparacao_Tempo.md:9. Exact ledgers and parity source rows were already correct and left unchanged.
- F-W2-03: corrected 13 Binding cells in the seven screen files listed below, copying only actual dossier browsed_file/browsed_item. Existing scalar field bindings, masks and unknown fields were retained. The matching mapping U-01 paragraphs and per-unit RULE-*-001 CSV rows now explicitly exclude the established browse metadata from unresolved scope; their unresolved status remains unchanged.

- docs/screens/WIN_Inventario.md: TABLE_Artigos (line 32).
- docs/screens/WIN_Material_Reparacao.md: TABLE_ordens_reparacao (line 32), LIST_mecanicos (line 41).
- docs/screens/WIN_Ordens_Reparacao.md: COMBO_mecanico (line 51).
- docs/screens/WIN_Ordens_Reparacao_Form.md: COMBO_Recepcionado (line 43), COMBO_mecanico (line 45).
- docs/screens/WIN_Table_cab_stocks.md: TABLE_cab_stocks (line 32), COMBO_tipo_doc (line 38).
- docs/screens/WIN_Table_Lin_Stocks.md: COMBO_mecanico (line 42), COMBO_tipo_doc (line 43).
- docs/screens/WIN_Tempos_Reparacao.md: TABLE_tempos_reparacao (line 33), TABLE_tempos_reparacao_ordem (line 34), LIST_mecanicos (line 47).

Verification after edits: all 53 per-unit parity_check commands returned exit 0 with --seed, --element, --check-files and --note. Each corrected screen value was copied directly from its retained parsed dossier control object. All 13 cells corrected; no binding remains falsely unresolved among that finding set. No commit or push.
