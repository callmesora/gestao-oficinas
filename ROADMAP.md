# ROADMAP — Gestao Oficinas

Order follows templates/ROADMAP.template.md and accepted ADR-007. Step 0 commits: 7d3a5c7 and 637fc6b. Framing must close before foundation. No business functionality is implemented.

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
| 3b.2 | Foundation | Shared primitives, temporary launcher and visual/keyboard checks | MIG-5b | template/dialog rows | implementer/reviewer | docs/runbooks/stage-4.md | shared controls, table base, awaited dialogs and text/input sizing including optional character-limit width checked; scoped caption shortcuts checked; remaining table/dialog features, launcher and full-window gates pending | 3b.1 | In progress |
| 4 | Slice | Query semantics and shared WLanguage helpers | MIG-6 | QRY rows; named helper rules | implementer/reviewer | templates/prompt-stage.md | real parameter/filter tests against complete schema | 3 | To do |
| 5 | Slice | Leaf lookups and list/form workflows | MIG-7 | assigned units below | implementer/reviewer | templates/prompt-stage.md | bounded sub-slice per list/form pair; end-to-end saves and failures | 3, 3b, 4 | To do |
| 6 | Cleanup | Cleanup checkpoint after first 2–3 leaf workflows, then resume remaining leaves | MIG-7C | unchanged behavior | implementer/reviewer | templates/prompt-stage.md | shared components and concrete docs/porting patterns; checkpoint gates the next leaf workflow | 5 | To do |
| 7 | Slice | Repair order list/form and caller contracts | MIG-8 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | complete workflow; persistence; concurrent/failure paths | 5, 6 | To do |
| 8 | Slice | Repair materials and quantity/password workflows | MIG-9 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | material writes, stock effects and caller results | 7 | To do |
| 9 | Slice | Labor timers, state transitions and descriptions | MIG-10 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | clock/state/locking workflows and duration checks | 7, 8 | To do |
| 10 | Slice | Stock documents, scanners, inventory and reconstruction | MIG-11 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | stock saves/deletes/rebuilds and native input checks | 8, 9 | To do |
| 11 | Slice | Startup, access, system, menu and launch modes | MIG-12 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | all navigation/permissions/configuration paths | 5, 7, 8, 9, 10 | To do |
| 12 | Slice | Every report/filter and print destination | MIG-13 | assigned units below | implementer + 2 reviews | templates/prompt-stage.md | bounded report-family slices; all 28 reports; native print evidence | 7, 8, 9, 10, 11 | To do |
| 13 | Cleanup | Resolve remaining U items and review all parity claims | MIG-14 | all remaining rows | planner/reviewers | templates/prompt-stage.md | no silent exclusions; assumed choices traced to proposals/ADRs | 12 | To do |
| 14 | Acceptance | Installer, upgrade, restore, devices and full reconciliation | MIG-15 | all plus platform rows | implementer + owner | templates/prompt-stage.md | native Windows acceptance and data reconciliation artifacts | 13 | To do |
| 15 | Cutover | Rehearsal and explicit production transition plan | MIG-16 | all | owner + implementer | 08-data-migration.md | complete gate; freeze/rollback plan; owner acceptance | 14 | To do |

## Complete unit ownership

All 143 per-unit CSVs retain their seed IDs. This assignment is a scheduling index, not a claim of implementation. Shared dialogs/helpers remain dependencies of their callers; authentication/authorization must guard protected server operations before exposure even though full access-screen parity comes later. The first leaf slices are customer, vehicle and simple lookup list/form pairs; later briefs state exact IDs from their CSVs.

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

Within MIG-7, close the first 2–3 bounded list/form stages, run MIG-7C, then continue the remaining leaf stages. Its dependency is those completed sub-stages rather than the entire group; group completion includes this checkpoint. The group-level table is a summary, not permission to postpone cleanup.

After every next 2–3 bounded workflows across MIG-8 through MIG-13, insert a numbered cleanup brief owned by that group's ticket (suffix C1, C2…). Extract only patterns repeated by completed workflows, keep behavior unchanged, update docs/porting.md and run the existing relevant tests. The next dependent workflow waits for that cleanup/review checkpoint. Record each checkpoint in this roadmap as its concrete sub-slices are scheduled.
