# ROADMAP — Gestao Oficinas

Order follows templates/ROADMAP.template.md and accepted ADR-007. Step 0 commits: 7d3a5c7 and 637fc6b. Framing must close before foundation. The database/import and shared UI foundations and a usable customer workflow exist. Customer designer/native/report parity remains open; its core delivery and follow-up are tracked separately below.

## Trajectory guardrails

- The next business deliverable after the shared screen prerequisite MIG-5b.1 is the first real workflow: `WIN_Table_Clientes` + `WIN_Form_Clientes`, backed by the real application/API/database path. The brief is `docs/runbooks/stage-5.md`.
- MIG-6 is a query/helper backlog, not a gate to the first screen. Implement only the specific query/helper behavior a workflow needs, at its first consuming workflow, and record the concrete pattern in `docs/porting.md`. Do not port all 30 query units before a screen just to complete a foundation stage.
- After MIG-5b.1 closes, do not add more generic launcher/workspace/skin capabilities unless a cited customer parity row proves they block the customer workflow. Log other foundation gaps and handle them when a later screen needs them or at native acceptance.
- Every workflow stage must end with a user-visible route to the real screen, real data/actions for its stated scope, and parity rows/tests that prove those actions. Synthetic fixtures and rendered layouts are not screen implementation.
- Keep one workflow per brief. Do not build speculative shared abstractions; extract a pattern at the cleanup checkpoint only after at least two real workflows use it. Keep print/report behavior assigned to MIG-13 unless a brief explicitly includes its report and evidence.

Each group below must be split into bounded stage briefs for individual workflows before coding; a group is Done only when every owned unit meets the guide gates. No feature is excluded. Review/fix is part of each slice.

| # | Phase | Slice | Ticket | Parity rows | Owner | Prompt | Deliverable | Depends on | Status |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Mapping | Full inventory, extraction and reviewed mapping | STEP0 | all SRC seeds | implementer/reviewers | templates/mapping-prompt.md | 143 maps; evidence; 2,273 parity rows | — | Done |
| 1 | Framing | Guide/template alignment and accepted framing | MIG-2 | no parity moves | planner | docs/runbooks/stage-1.md | AGENTS, ADRs, architecture/data contract and roadmap | 0 | Done |
| 2 | Foundation | Scaffold, verification, generated contracts, preview and CI | MIG-3 | foundation tests; no business parity | implementer | docs/runbooks/stage-2.md | verify green; bindings drift check; native health command; UI harness | 1 | In progress |
| 2a | Foundation | Core verification and Windows build | MIG-3 | no business parity | implementer | docs/runbooks/stage-2.md | full verify/build pass locally and hosted; actual native IPC passes locally | 1 | Done |
| 2b | Verification follow-up | Hosted native WebView2 automation | MIG-3 | no business parity | implementer | docs/runbooks/stage-2.md | resolve hosted CDP startup failure; keep existing test intact | 2a | To do |
| 3 | Foundation | Every table/field, schema v1, fixtures and import dry run | MIG-4 | table rows | implementer + 2 reviews | docs/runbooks/stage-3.md | column mappings; real PostgreSQL import/reconciliation/restore tests | 2a | Done |
| 3b | Foundation | Skin primitives, every generated layout and skin assets | MIG-5 | template/dialog rows | implementer/reviewer | docs/runbooks/stage-4.md | skin kit; scored windows; asset inventory; temporary launcher | 2a | In progress |
| 3b.1 | Foundation | Generated layouts and referenced skin images | MIG-5a | no behavior status moves | implementer/reviewer | docs/runbooks/stage-4.md | 53 reproducible layouts; checked image/state inventory | 2a | Done |
| 3b.2 | Foundation | Shared primitives, temporary launcher and visual/keyboard checks | MIG-5b | template/dialog rows | implementer/reviewer | docs/runbooks/stage-4.md | shared controls, table base, awaited dialogs and text/input sizing including optional character-limit width checked; scoped caption shortcuts and temporary workspace launcher checked; shared anchor defaults checked; column width/order persistence, manual resize/saved geometry and edit password/length/Tab/selection defaults checked; remaining table/dialog features, native limits/lifetime and full-window gates pending | 3b.1 | In progress |
| 3b.2a | Foundation | Shared screen prerequisite | MIG-5b.1 | no parity moves | implementer/reviewer | docs/runbooks/stage-4.md | existing generated controls, table, workspace and awaited dialogs pass foundation verification | 3b.1 | Done |
| 3b.2b | Consumer verification | Full windows and evidenced table/form behavior | MIG-5b.2 | consumer rows, first RULE-C286277B-011 and RULE-CC16AB27-028 | implementer/reviewer | docs/runbooks/stage-4.md | implement/check with each real workflow; first consumer MIG-7A | 3b.2a | To do |
| 3b.2c | Native acceptance follow-up | Remaining shared native and unresolved skin behavior | MIG-5b.3 | existing dialog/template/U rows retained | implementer + owner | docs/runbooks/stage-4.md | U-SKIN-01..06, native dialog/chrome/clipboard/appearance accepted under MIG-15 | 13 | To do |
| 4 | Slice backlog | Query semantics and shared WLanguage helpers, implemented with their first consuming workflow | MIG-6 | QRY rows; named helper rules | implementer/reviewer | templates/prompt-stage.md | bounded query/helper behavior with real consumer-path evidence; this group is not a prerequisite for the first customer screen | 3 | To do — incremental, not a screen gate |
| 5 | Slice | First real workflow: customer list and form | MIG-7A | `docs/parity/WIN_Table_Clientes.csv`; `docs/parity/WIN_Form_Clientes.csv` | implementer/reviewer | docs/runbooks/stage-5.md | real customer list/form, customer data path, add/edit/search/select/delete behavior in scope, visible app route and parity evidence | 3, 3b.2a | In progress |
| 5.1 | Slice delivery | Usable customer list/form core | MIG-7A.1 | tested customer business rows; designer/U/report rows retained | implementer + 2 reviews | docs/runbooks/stage-5.md | real customer/session/API/PostgreSQL, imported replay, golden and UI checks | 3, 3b.2a | Done |
| 5.2 | Consumer follow-up | Customer designer/table features and caller audit | MIG-7A.2 | RULE-CC16AB27-028; RULE-C286277B-011; existing customer U rows | implementer + 2 reviews | docs/runbooks/stage-5-followup.md | column search/config/scrollbars, masks/keys and real vehicle caller coupling | 6 | In progress |
| 5.2a | Bounded consumer delivery | Customer header search and saved visibility | MIG-7A.2a | RULE-CC16AB27-028 remains implemented | implementer + 2 reviews | docs/runbooks/stage-5-table-details.md | real API prefix seek/observation/return; visibility/width/order/reset; 70 TS/DB, 58 browser, native metadata; parent remainder retained | 6 | Done |
| 5.2b | Bounded consumer delivery | Source table options, visible scrollbar and truncated tooltip | MIG-7A.2b | RULE-CC16AB27-028 remains implemented | implementer + 2 reviews | docs/runbooks/stage-5-designer-audit.md | reproducible metadata; actual scroll/tooltip/context/keys/picker checks; final 20 browser and native pass; full parent retained under ADR-014 | 5.2a | Done |
| 5a | Slice | Vehicle list and form | MIG-7B | WIN_Table_Viaturas and WIN_Form_Viaturas CSVs | implementer/reviewer | docs/runbooks/stage-6-vehicles.md | real vehicle workflow after customers, required helpers only | 3, 3b.2a, 5.1 | In progress |
| 5a.1 | Slice delivery | Usable vehicle list/form and actual customer picker | MIG-7B.1 | tested vehicle events; designer/U/report/caller retained | implementer + 2 reviews | docs/runbooks/stage-6-vehicles.md | real API/PostgreSQL, imported replay, golden, browser/visual/native metadata checks | 3, 3b.2a, 5.1 | Done |
| 5a.2 | Consumer follow-up | Vehicle designer/table and caller audit | MIG-7B.2 | RULE-C039C545-025; RULE-C9675195-013; existing U rows | implementer + 2 reviews | docs/runbooks/stage-6-vehicles-followup.md | masks/keys/table/config/scrollbars/coupling; repair-order continuation with MIG-8 | 6 | To do |
| 5b | Slice | Unidades: simplest independent lookup list/form | MIG-7D | WIN_Table_unidades and WIN_Form_unidades CSVs | implementer + 2 reviews | docs/runbooks/stage-7-units.md | third real workflow; two text fields, no picker/query dependency, article-protected delete | 5a.1 | In progress |
| 5b.1 | Slice delivery | Usable unit list/form core | MIG-7D.1 | implemented unit business rows; designer/U/report retained | implementer + 2 reviews | docs/runbooks/stage-7-units.md | real API/PostgreSQL, article-safe delete, imported/golden/browser/visual gates | 5a.1 | Done |
| 5b.2 | Consumer follow-up | Units designer/table and keyboard audit | MIG-7D.2 | RULE-CCB16084-014; RULE-C77806F9-010; existing U/input-row rows | implementer + 2 reviews | docs/runbooks/stage-7-units-followup.md | source-enabled search/config/scrollbars and exact key/context obligations | 6 | To do |
| 6 | Cleanup | Cleanup checkpoint after the first 2–3 real workflows | MIG-7C | existing customer/vehicle/unit rows; no status promotion | implementer + 2 reviews | docs/runbooks/stage-8-cleanup.md | signed source ID exhaustion guarded/tested; three-consumer HTTP/connection extraction; architecture/porting current; 69 TS/DB + 56 browser + native metadata checks | 5.1, 5a.1, 5b.1 | Done |
| 6a | Slice | Remaining leaf lookups and list/form workflows | MIG-7 | assigned units below, excluding completed pairs | implementer/reviewer | templates/prompt-stage.md | one bounded workflow brief per pair; pull only its required query/helper units | 6, 5.2a, bounded 5.2b delivery (ADR-014) | To do |
| 6a.1 | Slice | Estados descritivos list/form and description picker | MIG-7E | WIN_Table_estados_descritivos; WIN_Form_estados_descritivos | implementer + 2 reviews | docs/runbooks/stage-9-descriptive-states.md | real text-key writes and source description-returning selector; full evidence first | 6, bounded 5.2b delivery | To do |
| 6a.C2 | Scheduled cleanup | Designer/caller checkpoint after two additional leaf workflows | MIG-7C2 | retained customer/vehicle/unit designer/U rows | implementer + 2 reviews | docs/decisions/014-nonblocking-designer-followups.md | modal geometry, numeric entry, exact menu/scrollbar tooltip and caller/context work; full parents remain open | 6a.1 and the next evidenced leaf workflow | To do — gates a third leaf |
| 7 | Slice | Repair order list/form and caller contracts | MIG-8 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | complete workflow; persistence; concurrent/failure paths | 6, 6a | To do |
| 8 | Slice | Repair materials and quantity/password workflows | MIG-9 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | material writes, stock effects and caller results | 7 | To do |
| 9 | Slice | Labor timers, state transitions and descriptions | MIG-10 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | clock/state/locking workflows and duration checks | 7, 8 | To do |
| 10 | Slice | Stock documents, scanners, inventory and reconstruction | MIG-11 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | stock saves/deletes/rebuilds and native input checks | 8, 9 | To do |
| 11 | Slice | Startup, access, system, menu and launch modes | MIG-12 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | all navigation/permissions/configuration paths | 5, 7, 8, 9, 10 | To do |
| 12 | Slice | Every report/filter and print destination | MIG-13 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | bounded report-family slices; all 28 reports; native print evidence | 7, 8, 9, 10, 11 | To do |
| 13 | Cleanup | Resolve remaining U items and review all parity claims | MIG-14 | all remaining rows | planner/reviewers | templates/prompt-stage.md | no silent exclusions; assumed choices traced to proposals/ADRs | 12 | To do |
| 14 | Acceptance | Installer, upgrade, restore, devices and full reconciliation | MIG-15 | all plus platform rows | implementer + owner | templates/prompt-stage.md | native Windows acceptance and data reconciliation artifacts | 13 | To do |
| 15 | Cutover | Rehearsal and explicit production transition plan | MIG-16 | all | owner + implementer | 08-data-migration.md | complete gate; freeze/rollback plan; owner acceptance | 14 | To do |

## Complete unit ownership

All 143 per-unit CSVs retain their seed IDs. This assignment is a scheduling index, not a claim of implementation or a blanket dependency. MIG-6 rows stay assigned to MIG-6, but each is implemented alongside its first real consumer; the first customer brief may cover only the behaviors it needs. Shared dialogs/helpers remain dependencies of their callers; authentication/authorization must guard protected server operations before exposure even though full access-screen parity comes later. The first leaf slices are customer, vehicle and simple lookup list/form pairs; later briefs state exact IDs from their CSVs.

| Unit | Ticket |
|---|---|
| Clientes | MIG-4 |
| MediaPlayer_0_D | MIG-5 |
| MediaPlayer_1 | MIG-5 |
| MediaPlayer_13 | MIG-5 |
| MediaPlayer_22 | MIG-5 |
| MediaPlayer_23 | MIG-5 |
| MediaPlayer_24 | MIG-5 |
| MediaPlayer_Etiquette | MIG-5 |
| MediaPlayer_Fiche | MIG-5 |
| MediaPlayer_Form | MIG-5 |
| MediaPlayer_Label | MIG-5 |
| MediaPlayer_Mailing | MIG-5 |
| MediaPlayer_MailingUS | MIG-5 |
| MediaPlayer_Table | MIG-5 |
| MediaPlayer_TableUS | MIG-5 |
| My_GestaoOficinas | MIG-12 |
| QRY_Union_lin_stocks_material_reparacao | MIG-6 |
| QRY_insert_material_reparacao | MIG-6 |
| QRY_insert_ordens_reparacao | MIG-6 |
| QRY_noname | MIG-6 |
| QRY_select_cab_lin_stocks | MIG-6 |
| QRY_select_cab_stocks | MIG-6 |
| QRY_select_cliente_codigo | MIG-6 |
| QRY_select_consumo_material_viatura | MIG-6 |
| QRY_select_lin_stocks | MIG-6 |
| QRY_select_material_ordem_Reparacao | MIG-6 |
| QRY_select_material_reparacao | MIG-6 |
| QRY_select_mecanicos_codigo | MIG-6 |
| QRY_select_ordens_reparacao | MIG-6 |
| QRY_select_ordens_reparacao_data_entrega | MIG-6 |
| QRY_select_ordens_reparacao_data_pag | MIG-6 |
| QRY_select_ordens_reparacao_matricula | MIG-6 |
| QRY_select_ordens_reparacao_numero | MIG-6 |
| QRY_select_ordens_reparacao_tempos | MIG-6 |
| QRY_select_tempos_Reparacao_numero_mecanico | MIG-6 |
| QRY_select_tempos_reparacao_ordem | MIG-6 |
| QRY_select_viatura_matricula | MIG-6 |
| QRY_select_viaturas | MIG-6 |
| QRY_tempos_ordem_reparacao | MIG-6 |
| QRY_tempos_ordem_reparacao_matricula | MIG-6 |
| QRY_tempos_ordem_reparacao_mecanico | MIG-6 |
| QRY_union_extrato_artigos | MIG-6 |
| QRY_union_extrato_artigos_calcular_total | MIG-6 |
| QRY_union_lin_stocks | MIG-6 |
| QRY_union_material_reparacao | MIG-6 |
| QRY_update_ordens_reparacao | MIG-6 |
| RPT_Consumo_Material_Descriminado_Ordens | MIG-13 |
| RPT_Consumo_Material_Descriminado_Saidas | MIG-13 |
| RPT_Consumo_Material_Descriminado_ordens_saidas | MIG-13 |
| RPT_Consumo_Material_Resumo_Saidas | MIG-13 |
| RPT_Consumo_Material_Resumo_ordem_saidas | MIG-13 |
| RPT_Consumo_Material_Resumo_ordens | MIG-13 |
| RPT_Consumo_Material_Viatura_Descriminado | MIG-13 |
| RPT_Consumo_Material_Viatura_Resumo | MIG-13 |
| RPT_Extrato_artigos | MIG-13 |
| RPT_List_Clientes | MIG-13 |
| RPT_List_Viaturas | MIG-13 |
| RPT_List_artigos | MIG-13 |
| RPT_List_documentos | MIG-13 |
| RPT_List_estados_descritivos | MIG-13 |
| RPT_List_estados_reparacao | MIG-13 |
| RPT_List_mecanicos | MIG-13 |
| RPT_List_unidades | MIG-13 |
| RPT_List_utilizadores | MIG-13 |
| RPT_Materiais | MIG-13 |
| RPT_Ordens_Reparacao | MIG-13 |
| RPT_Ordens_Reparacao_DataEntrega | MIG-13 |
| RPT_Ordens_Reparacao_DataPag | MIG-13 |
| RPT_Servico_Avaria | MIG-13 |
| RPT_Tempos_Ordem_Reparacao | MIG-13 |
| RPT_Tempos_Ordem_Reparacao_Mecanico | MIG-13 |
| RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo | MIG-13 |
| RPT_Tempos_Ordem_Reparacao_viatura | MIG-13 |
| RPT_inventario | MIG-13 |
| Terminais | MIG-4 |
| Viaturas | MIG-4 |
| WINDEVDIALOGBOX | MIG-5 |
| WINDEVMESSAGEBOX | MIG-5 |
| WIN_Acesso | MIG-12 |
| WIN_Data | MIG-7 |
| WIN_Extrato_Artigos | MIG-11 |
| WIN_Filtro_Mapas_Artigos | MIG-13 |
| WIN_Filtro_Mapas_Tempos | MIG-10 |
| WIN_Form_Clientes | MIG-7 |
| WIN_Form_Terminais | MIG-7 |
| WIN_Form_Viaturas | MIG-7 |
| WIN_Form_artigos | MIG-7 |
| WIN_Form_documentos | MIG-7 |
| WIN_Form_estados_descritivos | MIG-7 |
| WIN_Form_estados_reparacao | MIG-7 |
| WIN_Form_mecanicos | MIG-7 |
| WIN_Form_postos | MIG-7 |
| WIN_Form_unidades | MIG-7 |
| WIN_Form_utilizadores | MIG-7 |
| WIN_Inserir_quantidade_password | MIG-7 |
| WIN_Inventario | MIG-11 |
| WIN_Inventario_Reconstrucao | MIG-11 |
| WIN_Leitor_cod_barras | MIG-11 |
| WIN_Leitor_cod_barras_desconhecidos | MIG-11 |
| WIN_MENU | MIG-12 |
| WIN_Mapa_Vendas | MIG-13 |
| WIN_Material_Reparacao | MIG-9 |
| WIN_Material_reparacao_form | MIG-9 |
| WIN_Mudar_Estado | MIG-10 |
| WIN_Ordens_Reparacao | MIG-8 |
| WIN_Ordens_Reparacao_Form | MIG-8 |
| WIN_Reconstrucao_Stocks | MIG-11 |
| WIN_Table_Clientes | MIG-7 |
| WIN_Table_Lin_Stocks | MIG-11 |
| WIN_Table_Tempos_materiais_Descricoes | MIG-10 |
| WIN_Table_Terminais | MIG-7 |
| WIN_Table_Viaturas | MIG-7 |
| WIN_Table_artigos | MIG-7 |
| WIN_Table_cab_stocks | MIG-11 |
| WIN_Table_documentos | MIG-7 |
| WIN_Table_estado_reparacao_tipo3 | MIG-7 |
| WIN_Table_estados_descritivos | MIG-7 |
| WIN_Table_estados_reparacao | MIG-7 |
| WIN_Table_mecanicos | MIG-7 |
| WIN_Table_postos | MIG-7 |
| WIN_Table_unidades | MIG-7 |
| WIN_Table_utilizadores | MIG-7 |
| WIN_Teclado_Alfa | MIG-7 |
| WIN_Teclado_numerico | MIG-7 |
| WIN_Tempos_Reparacao | MIG-10 |
| WIN_Tempos_Reparacao_Estado | MIG-10 |
| WIN_Tempos_Reparacao_Informacao | MIG-10 |
| WIN_Tempos_Reparacao_Tempo | MIG-10 |
| WIN_sistema | MIG-12 |
| artigos | MIG-4 |
| cab_stocks | MIG-4 |
| documentos | MIG-4 |
| estados_descritivos | MIG-4 |
| estados_reparacao | MIG-4 |
| lin_stocks | MIG-4 |
| material_reparacao | MIG-4 |
| mecanicos | MIG-4 |
| ordem_reparacao | MIG-4 |
| postos | MIG-4 |
| sistema | MIG-4 |
| tempos_reparacao | MIG-4 |
| unidades | MIG-4 |
| utilizadores | MIG-4 |

## Stage closure

Follow templates/prompt-stage.md: read handoff/instructions/ADRs; synchronize safely; bounded behavior and evidence; implement; actual verify/UI/golden/native checks; independent review/fixes (two for risky slices); update parity, roadmap, handoff and progress; commit explicit files and push. Do not overwrite a dirty checkout to synchronize.


## Recurring cleanup checkpoints

Within MIG-7, close the customer pair and the vehicle pair and simplest independent lookup pair, run MIG-7C, then continue the remaining leaf stages. Its dependency is those completed sub-stages rather than the entire group; group completion includes this checkpoint. The group-level table is a summary, not permission to postpone cleanup.

After every next 2–3 bounded workflows across MIG-8 through MIG-13, insert a numbered cleanup brief owned by that group's ticket (suffix C1, C2…). Extract only patterns repeated by completed workflows, keep behavior unchanged, update docs/porting.md and run the existing relevant tests. The next dependent workflow waits for that cleanup/review checkpoint. Record each checkpoint in this roadmap as its concrete sub-slices are scheduled.
