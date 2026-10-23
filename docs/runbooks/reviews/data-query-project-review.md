# Independent review — data, queries, project and templates

Review date: 2026-10-23. Scope: 30 query maps, 17 table maps, one project map and 14 binary template maps, 62 units / 176 parity rows. Reviewed source evidence and outputs; no generator reasoning was used as proof. Only this review file is written by this reviewer. No raw credential/data values are copied here.

## Mechanical and newer evidence

Initially 48/62 scoped validations passed. All 14 MediaPlayer template validations failed because the bare binary evidence file path contained a space in `120 MediaPlayer` and the evidence validator rejected that form. Each failure was the same recognized-evidence error at its SRC row, rather than a missing file or dropped seed. The parent corrected the template references to `docs/source-manifest.json` plus each template mapping note, which retains the actual source path. Independent recheck of all 14 now exits 0 with --seed, --element, --check-files and --note. **Current mechanical result: 62/62 pass.** RQ-01 is fixed.

All 29 supplied dossier query SQL texts exactly match their mapping fenced SQL. Placeholder inventories independently collected from SQL match all 29 notes; the parameter-table parser count is explicitly subordinate to SQL placeholders. This correctly covers parameters missing from the parsed parameter tables (notably vehicle consumption and all three labor queries). QRY_noname has no supplied dossier SQL and remains unmapped; no invented query is offered.

All 17 source XDD table definitions were read structurally. Physical column names, sizes, nullable/default properties, single/composite keys and supplied profile findings were compared with maps. All17 mapped row/source counts match both committed export verification and profile; all17 profiles' key/link dictionaries are retained. The XDD contains no declared LIAISON elements, so profiler candidate links must not be treated as declared foreign keys. The code28 label problem below is the only detected lost physical type code; composite key-only XDD rubriques are represented in Keys, rather than invented physical columns.

## Missing rows or events

No dropped seed found. Templates remain inferred template assets with an unresolved runtime-inheritance question and unmapped parity status, never excluded. Project startup has one nonempty source block; all query/table source seeds remain covered. Missing report associations below are a caller-inventory gap, not missing query SQL.

## Misread rules

### RQ-02 — P2: project prose denies a raw event code present in the source

Where: `docs/mapping/My_GestaoOficinas.md`, Events and operational rules; `SRC-a18ed57430` already carries raw event 196608.

The note says the initialization block “has no raw event code”. The actual source block context in `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:697-773` records type **196608**. This is a factual contradiction between note, source and parity.

Fix: state raw event 196608 and the evidenced startup meaning; do not delete/rewrite the seed event. Also clarify the phase distinction already visible in source: the `port` setting is passed into the WDModFic server command, but the later connection sets Server=servidor without combining the separate port. The code reads that port again but does not explicitly apply it to HOpenConnection. Runtime endpoint behavior remains U-PRJ-01, not an invented server:port connection.

The rest of startup mapping matches source: act.txt gates updates; server updater uses exeWait and deletes the marker only after a true ExeRun result, failure returns; local updater has no explicit exeWait and reports falha on false; server startup HOpenConnection failure ends the program before HChangeConnection. No schema-update success beyond the evidenced process return is established.

### RQ-03 — P2: generated/link column loses its actual WINDEV type code

Where: `docs/mapping/lin_stocks.md`, Columns row Documento_codigodocumento_numero.

The map shows WINDEV type/code **None**, size 11. Actual `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`, FICHIER lin_stocks/RUBRIQUE Documento_codigodocumento_numero, explicitly contains TYPE **28**, TYPE_CLE 2 and TAILLE 11. It is separate from the unique composite key documento_codigodocumento_numerolinha. Export verification also reports 23615 binary values, matching the documented driver-fidelity caveat.

Fix: preserve `code 28 (generated/link representation; semantics unresolved under U-T12-03)` rather than None. Keep raw component identity (documento_codigo, documento_numero, linha), observed driver bytes and later interpretation separate. No decoding or constraint correction is authorized.

## Wrong confidence labels

No extra standalone finding: SQL facts and table counts are evidenced; template classification is inferred and inheritance stays unresolved. The incorrect project statement/type label above need correction rather than changing all evidence to assumed. The note's generic typography warning and U-Qnn-03 correctly prevent treating extracted smart quotes/garbled accents as verified executable SQL literals.

## Unresolved items settled or narrowed by available evidence

### RQ-04 — P2: five query notes miss eight evidenced designer/report consumers

The literal-code search is correctly labeled, but these notes leave reachability as U-Qnn-02 although the dossier's report Source name and caller's iInitReportQuery/iPrintReport establish active report paths:

| Query map | Dossier reports omitted from the query note | Caller evidence |
|---|---|---|
| QRY_union_material_reparacao | RPT_Consumo_Material_Descriminado_Ordens; RPT_Consumo_Material_Resumo_ordens | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348-395 |
| QRY_union_lin_stocks | RPT_Consumo_Material_Descriminado_Saidas; RPT_Consumo_Material_Resumo_Saidas | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348-395 |
| QRY_Union_lin_stocks_material_reparacao | RPT_Consumo_Material_Descriminado_ordens_saidas; RPT_Consumo_Material_Resumo_ordem_saidas | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348-395 |
| QRY_select_ordens_reparacao_data_entrega | RPT_Ordens_Reparacao_DataEntrega | legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:429-443 |
| QRY_select_ordens_reparacao_data_pag | RPT_Ordens_Reparacao_DataPag | legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:429-443 |

Each dossier reference is `dossier: REPORT/lines` (the Source name line). The report specifications already identify their query sources and exact positional arguments.

Fix: add designer consumers and the actual printing caller/parameter preparation, with durable dossier/source or reviewed report-spec references. Narrow the U-Qnn-02 statements: exact invocation is evidenced, while additional dynamic/designer consumers can still require discovery. Query QRY_union_material_reparacao has four SQL placeholders but its detailed report initializer passes five arguments (including description); link its report gap rather than assuming a fifth SQL parameter. Keep QRY_noname and the truly unlocated cab/line and material/order component query reachability pending.

### RQ-05 — P2: table profile questions are copied without per-point U references

Examples: `docs/mapping/artigos.md` asks whether stock 0 means empty and whether maximum stock is a typo; `docs/mapping/Viaturas.md` asks whether year/month zero means empty; `docs/mapping/mecanicos.md` asks whether the single password value means unused/defaulted; the Later decision cells also contain unanswered date/decimal representation questions. These are open interpretations, not established facts of the read-only export. Generic U-Tnn-02 at the end covers import decisions but is not attached to the actual question lines.

Fix: keep the observed counts, append the appropriate existing U-Tnn-02 to each copied interpretation question/Later decision prompt, and replace “check the code before mapping” with the actual known use or a scoped U question. In particular the mechanic password field is used by form/workflow validation, so a profile of one value cannot establish that it is unused. Do not expose values while resolving this. No new data repair is approved.

## Implementer blockers

### RQ-06 — P2: profiler candidate links need explicit code-based relationship qualification

Where: `docs/mapping/cab_stocks.md` and `docs/mapping/ordem_reparacao.md`, Link profile sections.

The dictionaries are faithfully copied observations but lack the profiler provenance needed to avoid turning guessed links into target constraints. The XDD declares no LIAISON. `scripts/data_profile.py` candidate_links heuristically tries identifier/name candidates (or supplied --ref) and chooses minimum orphans; all-zero fields do not establish target identity. For example cab_stocks.mecanico is profiled against mecanicos.mecanicosID, but `dossier: QRY_union_lin_stocks/sql` joins it to **mecanicos.Codigo**. Orders use reparacao_estado → estados_reparacao.Codigo in `dossier: QRY_select_ordens_reparacao/sql`, while the profile also lists a dormant all-zero Estados_reparacaoID candidate link. cab_stocks.documento_codigo → documentos.Codigo is the query's actual document relationship.

Fix: label the profile dictionaries as candidate/explicit-ref comparisons, not declared constraints; add the code/query-supported business relationships, including which zero generated links are unused in this snapshot. Link the observed orphan counts to inner-join row suppression where relevant. Preserve existing U integrity/collation enforcement items: source SQL is evidence of a join, not proof of enforced referential integrity.

## Evidence checks that passed

- All29 SQL bodies and their placeholder inventories match the dossier exactly. No automatic parameter reordering or null/omitted conflation was added.
- SQL review confirms join caveats already mapped: document-only joins lacking document code can mix repeated document numbers; ledger joins include code and number; union queries preserve duplicates; document description LIKE does not constrain the repair branch; assigned-order mechanic differs from per-material mechanic; delivery/payment reports use vehicle-owner customer while the general order list uses reception customer. No unauthorized SQL fix is implied.
- No ORDER BY was fabricated for payment-date/header queries or within-document line order. Open-labor query uses the exact 17-zero sentinel, not NULL.
- Table profiles preserve two excess duplicate key rows for tempos_reparacaoID; 8 stock-line article orphan rows, 54 material article orphan rows and 52 order vehicle orphan rows. No deduplication or repairs are claimed.
- All17 row/source counts are exact and no profile key/link dictionaries were silently dropped. Nullable XDD declarations are distinguished from observed data shapes; empty Terminais/postos are not called absent tables.
- QRY_noname and all14 binary templates stay unmapped with explicit U IDs; template path classification is inferred rather than a behavior-exclusion decision.
- Startup connection/update branches are mapped without running either branch. No actual credentials appear in notes/this review.

## Scope inventory

Queries:

- QRY_Union_lin_stocks_material_reparacao
- QRY_insert_material_reparacao
- QRY_insert_ordens_reparacao
- QRY_noname
- QRY_select_cab_lin_stocks
- QRY_select_cab_stocks
- QRY_select_cliente_codigo
- QRY_select_consumo_material_viatura
- QRY_select_lin_stocks
- QRY_select_material_ordem_Reparacao
- QRY_select_material_reparacao
- QRY_select_mecanicos_codigo
- QRY_select_ordens_reparacao
- QRY_select_ordens_reparacao_data_entrega
- QRY_select_ordens_reparacao_data_pag
- QRY_select_ordens_reparacao_matricula
- QRY_select_ordens_reparacao_numero
- QRY_select_ordens_reparacao_tempos
- QRY_select_tempos_Reparacao_numero_mecanico
- QRY_select_tempos_reparacao_ordem
- QRY_select_viatura_matricula
- QRY_select_viaturas
- QRY_tempos_ordem_reparacao
- QRY_tempos_ordem_reparacao_matricula
- QRY_tempos_ordem_reparacao_mecanico
- QRY_union_extrato_artigos
- QRY_union_extrato_artigos_calcular_total
- QRY_union_lin_stocks
- QRY_union_material_reparacao
- QRY_update_ordens_reparacao

Tables: Clientes, Viaturas, mecanicos, artigos, ordem_reparacao, tempos_reparacao, material_reparacao, utilizadores, unidades, documentos, cab_stocks, lin_stocks, estados_reparacao, estados_descritivos, Terminais, sistema, postos.

Project: My_GestaoOficinas.

Templates: MediaPlayer_0_D, MediaPlayer_1, MediaPlayer_13, MediaPlayer_22, MediaPlayer_23, MediaPlayer_24, MediaPlayer_Etiquette, MediaPlayer_Fiche, MediaPlayer_Form, MediaPlayer_Label, MediaPlayer_Mailing, MediaPlayer_MailingUS, MediaPlayer_Table, MediaPlayer_TableUS.

## Category counts and disposition

| Category | Findings |
|---|---:|
| Mechanical | 1 systemic / 14 CSVs, fixed and independently rechecked |
| Newer evidence | 0 detected; SQL/XDD/current profile compared |
| Missing rows/events | 0 |
| Misread rules | 2 (RQ-02, RQ-03) |
| Wrong confidence | 0 additional |
| Unresolved settled/narrowed | 2 (RQ-04, RQ-05) |
| Implementer blockers | 1 (RQ-06) |

Six finding groups: one already fixed, five semantic/documentation corrections remain. All62 mechanical checks currently pass; semantic signoff remains conditional on RQ-02 through RQ-06. Existing runtime/designer/query-literal and import-framing questions remain explicit limits. No architecture choice, database repair, new application or migration implementation is authorized by this review.

## Fix verification — 2026-10-23

The assigned mapper applied RQ-02 through RQ-06 after the independent review above. This appendix records the fixes and mechanical/source checks; it does not replace the independent review with a new independent signoff.

- **RQ-02 corrected:** My_GestaoOficinas now names raw event 196608 and cites the source type at `.wdp:774`, preserving the existing source-seed event. Startup prose distinguishes the updater's separate port argument from the later Server=servidor assignment and HOpenConnection. U-PRJ-01 explicitly retains deployed endpoint/port uncertainty.
- **RQ-03 corrected:** the table generator retains raw code 28 when the schema type label is absent. lin_stocks now separates that generated/link representation, the three-component unique business key and driver fidelity under U-T12-03. No representation was decoded or repaired.
- **RQ-04 corrected:** the generator reads report dossier Source name bindings in addition to literal query code hits and emits exact iInitReportQuery/iPrintReport caller statements. The five affected query notes include all eight reported consumers, article date/branch preparation and sales state-list construction. U-Qnn-02 is narrowed to additional consumers. QRY_union_material_reparacao links U-R01-07 for the four-placeholder/five-argument mismatch; no fifth SQL parameter was invented. Existing other named-query report bindings are also retained by this generic discovery (15 reports across 10 queries). QRY_noname and unlocated component-query paths remain unresolved.
- **RQ-05 corrected:** every copied profile interpretation question and every nonempty Later decision cell now cites its table's existing U-Tnn-02. Uniform-value findings no longer claim unused fields or defer an unscoped code check. Mechanic password comparisons cite `.wdw:298,770,914` without values; repair-state date flags cite their actual caller reads. Observed profile counts/dictionaries remain intact, and representation suggestions are explicitly proposals for later framing.
- **RQ-06 corrected:** all link-profile dictionaries are labeled candidate/explicit-ref comparisons with the profiler's name matching, minimum-orphan selection and zero exclusion explained. No XDD LIAISON exists. cab_stocks distinguishes mechanic Codigo/document Codigo SQL joins from heuristic generated-ID comparisons; ordem_reparacao distinguishes reparacao_estado → Codigo from the all-zero generated state ID. The maps explain mandatory-join suppression for 52 vehicle-orphan orders, 8 stock-line article-orphan rows and 54 material article-orphan rows. U integrity/collation items remain open; no new constraint is accepted.

`scripts/build_step0_data_notes.py` was corrected before regenerating its 30 query and 17 table maps/CSVs. A repeat generation produced byte-identical content across all 94 owned outputs. The project note was edited separately. No window/report maps, consolidated parity, original/legacy/playbook files, data extracts or application code were written by this fixer.

Validation after regeneration: **62/62 scoped per-unit parity checks pass**, with `--seed`, `--element`, `--check-files` and `--note`, covering **176 rows**. All **29 supplied query SQL bodies and placeholder inventories remain exact**; QRY_noname remains unresolved. Source XML confirms code/key/size **28 / 2 / 11** for the lin_stocks generated column and **zero LIAISON elements**. Copied table question lines contain U references, and no old “check the code before mapping” instruction remains in the scoped maps. All statuses remain Step 0 specified/unmapped. Runtime, visual/designer, literal encoding, enforcement and later framing questions still require their recorded evidence; no implementation, repair, commit or push was performed.
