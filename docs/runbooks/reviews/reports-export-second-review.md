# Second independent review — reports and ANSI HFSQL export

## Parent fix verification — F1 closed

After the independent review below, the main agent added scripts/windows/Assert-ScratchPaths.ps1 and made the exporter call it before connecting. It rejects reparse-point ancestors for input, analysis and output paths, canonicalizes the paths, requires local scratch inputs and an analysis-local output outside the scratch inputs. No machine/user execution policy was changed. tests/test_scratch_paths.py ran in the actual x86 PowerShell host: ordinary scratch paths passed, three lexical output escapes and two junction escapes were rejected, and the junction target remained untouched. All four local test cases (converter plus path checks) pass. This is parent fix verification, not a claim that the independent reviewer reviewed the new helper. The later geometry section records the separate F2 correction; both actionable findings are addressed.

Date: 2026-10-23. Scope: Step 0 evidence and mapping only. No mapper reports, prior review reports or their reasoning were read. Read AGENTS.md, skills/review-mapping/SKILL.md, mapping index, WLanguage traps and porting proposals. docs/runbooks/handoff.md was absent. This review writes only this file; it makes no application, source, dataset, commit or push changes.

## Findings

### F1 — P2: scratch/output containment is lexical and permits directory junctions

Where: scripts/windows/export_hfsql_ansi.ps1:12-20; docs/data/export-runbook.md:7.

The wrapper checks Resolve-Path.Path / GetFullPath followed by StartsWith. Those normalize path text but do not establish the final filesystem target after traversing directory junctions or symbolic links. For example, an existing analysis-local/hfsql-scratch-example junction to another local data directory still satisfies the scratch prefix. An analysis-local/output-link junction permits a fresh output child to land outside analysis-local. Server-name rejection does not close the local-source case. The advertised scratch restriction therefore has a concrete bypass. No such bypass was executed against real data, and this does not invalidate the checked existing export.

Fix: reject reparse points in all existing ancestors of RepFic, Analyse and Out, or resolve final filesystem targets and enforce containment there, before connecting or creating output. Add focused temporary-directory/junction tests for both input and output paths, plus an ordinary scratch-copy success case. Keep the existing server rejection and fresh-output rule.

### F2 — P3: A5 page summaries do not implement their three-extent heading

Where: docs/reports/RPT_Materiais.md:15-19 and docs/reports/RPT_Servico_Avaria.md:15-19.

Both headings promise widest-band / visible-control / all-designer extents, but their cells contain only two numbers. RPT_Materiais also says geometry fits while its visible STC_COL_lancado and INT_COL_lancado right edge is 94.408 + 13.602 = 108.010 mm, greater than the stated 108.000 mm printable width. Other report summaries classify smaller-than-one-millimetre excesses as exceeds, so this is inconsistent evidence presentation. It is not evidence that runtime actually clips.

Fix: supply all three measured extents for both A5 reports and describe the 0.010 mm nominal excess consistently, retaining U-R19-01 for actual orientation/scaling/clipping. Alternatively state and use one explicit measurement tolerance throughout all reports; do not silently treat only A5 differently. Evidence: dossier RPT_Materiais/controls.STC_COL_lancado and controls.INT_COL_lancado; exact source geometry is already reproduced in its spec.

## Mechanical and newer evidence

All 28 per-report commands passed with exit 0 and no ERROR lines:

`.venv/Scripts/python.exe scripts/parity_check.py docs/parity/UNIT.csv --seed docs/parity/parity-seed.csv --element UNIT --check-files --note docs/mapping/UNIT.md`

Fresh evidence packs were built in memory by scripts/unit_evidence.py pack(), using current latest inputs; no analysis-local files were written. Every fresh pack matched its kept pack in every top-level field. All 69 nonempty source blocks and the one encoded-action slot are retained. Each full immutable report source, mapping, report spec and per-unit CSV was read; every non-comment source line in every extracted block occurs in its mapping. No missing SRC row or omitted executable line was found. Status/confidence separation remains specified/unmapped, with inferred footer associations and assumed encoded action distinct from verified source.

| Unit | Validator | Blocks | Encoded slots |
|---|---|---:|---:|
| RPT_Consumo_Material_Descriminado_Ordens | pass | 3 | 0 |
| RPT_Consumo_Material_Descriminado_ordens_saidas | pass | 3 | 0 |
| RPT_Consumo_Material_Descriminado_Saidas | pass | 3 | 0 |
| RPT_Consumo_Material_Resumo_ordem_saidas | pass | 3 | 0 |
| RPT_Consumo_Material_Resumo_ordens | pass | 1 | 0 |
| RPT_Consumo_Material_Resumo_Saidas | pass | 1 | 0 |
| RPT_Consumo_Material_Viatura_Descriminado | pass | 2 | 0 |
| RPT_Consumo_Material_Viatura_Resumo | pass | 2 | 0 |
| RPT_Extrato_artigos | pass | 4 | 1 |
| RPT_inventario | pass | 1 | 0 |
| RPT_List_artigos | pass | 1 | 0 |
| RPT_List_Clientes | pass | 1 | 0 |
| RPT_List_documentos | pass | 1 | 0 |
| RPT_List_estados_descritivos | pass | 1 | 0 |
| RPT_List_estados_reparacao | pass | 1 | 0 |
| RPT_List_mecanicos | pass | 1 | 0 |
| RPT_List_unidades | pass | 1 | 0 |
| RPT_List_utilizadores | pass | 1 | 0 |
| RPT_List_Viaturas | pass | 1 | 0 |
| RPT_Materiais | pass | 1 | 0 |
| RPT_Ordens_Reparacao | pass | 2 | 0 |
| RPT_Ordens_Reparacao_DataEntrega | pass | 1 | 0 |
| RPT_Ordens_Reparacao_DataPag | pass | 1 | 0 |
| RPT_Servico_Avaria | pass | 1 | 0 |
| RPT_Tempos_Ordem_Reparacao | pass | 7 | 0 |
| RPT_Tempos_Ordem_Reparacao_Mecanico | pass | 8 | 0 |
| RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo | pass | 7 | 0 |
| RPT_Tempos_Ordem_Reparacao_viatura | pass | 9 | 0 |

## Source audit and accepted evidence boundaries

- Quantity accumulation: RPT_Consumo_Material_Descriminado_Ordens.wde:328-329,465,476-477 and its ordens_saidas/Saidas counterparts preserve after-body accumulation, after-document reset and numeric declarations. No rounding was invented. RPT_Consumo_Material_Resumo_ordem_saidas.wde:240-241,325-326 preserves the separate group reset followed by COUNTER increment; this is not a row counter replacement.
- Duration calculations: all four time reports retain literal 59.99999999999 / 0.99999999999999 multipliers, RoundUp, the 17-zero end sentinel, string accumulation, one-hour minute carry and numeric-zero resets. Checked the actual procedure source alongside transcription, including RPT_Tempos_Ordem_Reparacao.wde:326-332,358-359,417,545-596; Mecanico.wde:397-403,429-431,503-505,563-564,693-744; Mecanico_Resumo.wde:263-269,287-288,338,466-517; viatura.wde:342-348,366-367,425-427,477,606-657. The mechanic/vehicle group-footer order resets gsTotal_horas before adding STC_total_horas into the broader total; maps preserve the caption operand rather than incorrectly adding the reset accumulator. Decimal boundaries, negative intervals, malformed/zero strings and by-reference effects correctly remain U-R24/25/26/27-04.
- Caller contracts: report-specific query arguments and preview selection are retained from WIN_Filtro_Mapas_Tempos.wdw:266-291, WIN_Filtro_Mapas_Artigos.wdw:348-393 and WIN_Extrato_Artigos.wdw:412-422. The fifth description argument versus four exposed named parameters remains explicit U-R01-07 / U-R02-07 / U-R03-07 rather than an invented filter.
- Historical stock: RPT_Extrato_artigos.wde:263-278,419-429,584-589 retains the 2000-01-01 opening baseline, caller-supplied cutoff, stock=1/2 arithmetic, no other-stock clearing branch and query declaration release. Its same-cutoff inclusive BETWEEN boundary remains U-R09-07. No subtract-one-second repair was introduced.
- Live-table reports: RPT_Ordens_Reparacao keeps caller TABLE_QRY_select_ordens_reparacao and the 1/2/3 priority switch (source:362-369); RPT_Materiais keeps caller TABLE_materiais and caller-provided total string, while separate Open lookups are reproduced (source:381-404). Neither was silently replaced by an independent database listing or recomputed total.
- Hidden geometry: the time summary/vehicle reports separate hidden all-designer extents (281.072 / 242.731 mm) from visible 175.900 mm; Extrato separates 209.716 mm all-designer from 176.117 mm visible. Hidden controls do not justify a printed-overflow assertion. Engine/body visibility, grouping, fonts, masks and runtime page behavior remain identified U-items.
- Directly inspected five supplied designer images: Extrato_artigos, Materiais, Tempos_Ordem_Reparacao_Mecanico_Resumo, Tempos_Ordem_Reparacao_viatura and Consumo_Material_Resumo_ordem_saidas. They support the limited visible captions/geometry observations. They are not golden runtime outputs. This second review did not visually reapprove every other report image.

## Export checks

Read scripts/windows/HfSqlOdbcAnsi.cs, scripts/windows/export_hfsql_ansi.ps1, scripts/windows/convert_hfsql_ansi.py, tests/test_hfsql_converter.py, docs/data/export-runbook.md and docs/data/export-verification.json. Actual legacy/data/manifest.json, SQLite and all 17 CSV files were examined without exposing raw rows or credentials.

Independently recomputed, using SQLite mode=ro and parsed CSV records:

- 17 tables, 159668 rows; all SQLite counts equal manifest count/rows and CSV record counts.
- Every actual SQLite typed-row SHA-256 equals the manifest and docs/data/export-verification.json value.
- 16979 NULL values and 23615 BLOB values, matching the verification summary.
- All 35 original/scratch file pairs rehashed now still match their recorded copy-audit hashes. The review did not make a new ODBC connection or execute legacy code.
- Focused test command: `.venv/Scripts/python.exe -m unittest discover -s tests -p test_hfsql_converter.py`; 3 tests passed. These include temporary fixtures, exact large integer/decimal strings, NULL/empty distinction, binary/NUL, accented multiline text, framed hash distinctions, count failure and connection release.

Type/hash interpretation: SQLite columns deliberately have no affinity, preserving text numeric/date representations, None and bytes without floating coercion. Native SQL_C_FLOAT/DOUBLE values are round-trip strings; decimal/integer values stay driver text. sha256_typed_rows frames row sizes, cell types and payload lengths; the older sha256_rows compatibility digest is ambiguous across NULL/empty, boundaries and separator-containing text and must not be used alone as a fidelity guarantee. Current verification uses the typed digest. Hashes are order-sensitive export-view fingerprints, not proofs of undocumented HFSQL storage representation.

Existing limits remain material: ANSI Windows-1252 is the official driver's view, the generated composite/link BLOBs are driver-empty, and synthetic large-payload native-driver chunking is untested. Three converter tests do not exercise SQLGetData chunk/warning paths in C#. Stable files and before/after counts support this scratch export; they do not prove snapshot isolation for a live server. Driver diagnostics currently embed driver-provided messages (HfSqlOdbcAnsi.cs:34,41); any future diagnostic capture must be screened locally for values before durable notes, as required by AGENTS.md. No secret-bearing diagnostic was emitted in this review.

## Category totals

Mechanical/newer-evidence defects: 0. Missing rows/events: 0. Misread rules: 1 (F2, geometry summary). Wrong confidence labels: 0 newly found. Unresolved items settled or narrowed beyond the existing maps: 0. Implementer/isolation blockers: 1 (F1, scratch containment). Total actionable findings: 2. Existing runtime/designer U-items remain open; this is not implementation approval.


## Geometry fix verification — F2 closed

Applied only the authorized geometry correction to the RPT_Materiais and RPT_Servico_Avaria report specs, mapping notes and existing RULE-R19-012 / RULE-R23-012 parity rows. No parity row IDs or counts changed. Rechecked source coordinates at RPT_Materiais.wde:155-159,241-245 and RPT_Servico_Avaria.wde:157-162,171-176. Independently recomputed each control-table x + width using Decimal arithmetic and selected Visible=True controls separately: Materiais visible/all extent 108.010/108.010 mm; Servico_Avaria 107.950/107.950 mm. Both widest bands are 108.000 mm. Both A5 summary cells now contain all three advertised extents.

Materiais now states the exact 0.010 mm nominal excess over 108.000 mm. No printer tolerance, landscape behavior, scaling or runtime clipping was assumed; U-R19-01 and U-R23-01 remain unresolved for those runtime/designer properties. Servico_Avaria describes nominal fit only.

Both per-unit parity validators were rerun with --check-files and their mapping --note: exit 0, no ERROR lines, 0 missing U-ids, 0 verified-on-assumptions. Materiais remains 7 rows (4 specified/3 unmapped); Servico_Avaria remains 6 rows (3 specified/3 unmapped). No export scripts, original sources, raw data, shared indexes or aggregate parity files were changed by this fix. F1 is assigned to the parent and was not edited here.
