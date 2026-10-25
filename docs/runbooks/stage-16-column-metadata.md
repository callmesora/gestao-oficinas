# MIG-7J.0 — recover literal table-column metadata

Root integrates shared tracking on macOS arm64/main over83deb81. The next Documentos form reuses WdRadControls/WdRadio, but its checkbox column has recoverable source metadata lost by the dossier parser. Fix that bounded prerequisite first; no business translation, schema change, parity promotion, original edit/execution or push.

The dossier prints valid column summaries without an input type. COLUMN_ROW currently requires that final field, discarding width/state/alignments. Canonical evidence is dossier: each window/table/column below. Literal summaries are Active with vertical Center:

| Window | Qualified column | Width | Horizontal |
|---|---|---:|---|
| WIN_Table_mecanicos | TABLE_mecanicos.COL_inativo | 63 | Center |
| WIN_Table_documentos | TABLE_documentos.COL_Obriga_macanico | 102 | Center |
| WIN_Table_artigos | TABLE_artigos.COL_Inativo | 49 | Center |
| WIN_Material_reparacao_form | TABLE_material.COL_Lancado | 47 | Center |
| WIN_Mapa_Vendas | TABLE_Estados.COL_checkbox | 49 | Center |
| WIN_Tempos_Reparacao | TABLE_Estados_reparacao.COL_checkbox | 27 | Center |
| WIN_Ordens_Reparacao | TABLE_Estados_reparacao.COL_checkbox | 35 | Center |
| WIN_Tempos_Reparacao_Estado | TABLE_Estados_reparacao.COL_imagem | 31 | Left |
| WIN_Table_Tempos_materiais_Descricoes | TAB_principal.TABLE_materiais.COL_lancado | 49 | Center |
| WIN_Table_Tempos_materiais_Descricoes | TAB_principal.TABLE_materiais.COL_extra | 43 | Center |

Ordens has duplicate COL_imagem summaries39/50; Tempos has26/33. Their dossier names cannot identify a qualified column. Preserve the generator's duplicate-name guard and all four metadata_unresolved entries; never apply the last matching row to both tables.

Read full extractor/generator/tests and applicable source/spec/map/parity/JPG evidence before edits. One isolated writer owns scripts/dossier_extract.py and Python regressions; root owns regeneration, the actual Mecânicos consumer/browser assertion and all tracking. Make only the trailing input type optional; omit that field in parsed output when absent, retaining supplied Text/Numeric types. No generator redesign. Add a regression that fails on the actual missing-width defect and an actual layout fixture proving unique recovery alongside duplicate-name omission. Tests use synthetic excerpts, no raw/private data committed.

Regenerate through prepare_evidence with explicit primary PDF/compile paths and --docs analysis-local/evidence-docs, then ui_inputs.py --write/--check-source. Never hand-edit generated layouts or overwrite maintained specs/maps. Expected generated changes: nine layouts and ui-inputs manifest; all other layout/PNG bytes stay unchanged. Update only affected metadata statements in maintained specs. Remove Mecânicos' inferred66px override in favor of generated63px, assert its actual header width and retain no-overflow proof. Existing ADR003 inference is superseded by newly recovered primary evidence, not a redesigned table.

Review B found a concrete cross-platform manifest defect during regeneration: native Path sorting chooses different byte-identical asset paths and output order on POSIX/Windows. Before its correction ADR017/porting require explicit as_posix string ordering for those two sites. The same isolated writer additionally owns scripts/ui_inputs.py and a focused pure-path regression; no image/generator redesign. Existing hash ambiguity checks stay intact. Record canonical path/order churn separately from the nine payload hashes; a pure Windows-path check is not actual Windows execution.

Final consumer review found WdTable ignored literal Center despite receiving the recovered property. Root additionally owns the minimal shared cell-alignment correction and a positive real Mecânicos cell assertion, under ADR003/porting recorded before the fix. Retain Left/Right/fallback and all existing geometry/overflow proofs. Repeat final common/browser/bundle gates after this source change; earlier passes are not the final-source gate.

Run focused Python regressions before/after, all application Python checks, source reproducibility, actual Mecânicos flow/visual, full common verification and available debug Mac bundle; no need a new business golden because business behavior/data are unchanged. Preserve all existing goldens and native/Windows/HFSQL/runtime/human gates. Two fresh independent reviews read the complete changed files/evidence; root fixes findings, updates roadmap/handoff/progress, checks guards and commits explicit files locally. Immediately continue Documentos; this prerequisite does not end the assignment.

## Integrated evidence

Root integrated five writer-owned files, the real consumer/browser change and generated metadata. The parser baseline reproduced three failures; its eight focused cases then passed. The native-sort baseline reproduced two Windows-path flavor failures; the actual corrected helper passes both tests/four flavor subcases. Central Python discovery ran16 tests:15 passed, one existing Windows junction skip (column-metadata-python-final.log). Primary prepare_evidence uses explicit originals and ignored generated docs; ui_inputs --write/--check-source reproduces53 layouts/154 PNGs (column-metadata-pipeline.log, column-metadata-inputs-final.log).

Exact payload audit against83deb81 proves nine changed layout hashes/ten width+h_align pairs only, all154 PNGs and four ambiguous image columns unchanged. Manifest path/order canonicalization affects22 byte-identical asset copies; hashes/states/output declarations stay intact (column-metadata-payload-check.json). Maintained ten metadata rows/three recovered Active cells and current/historical width descriptions now agree. Split/aggregate parity has one matching target-description correction; all2273 IDs/statuses/confidences and counts23/208/1561/481/0 remain unchanged.

The actual browser width assertion failed before correction at63 expected/66 received, then the complete Mecânicos designer flow and visual/control test passed (column-metadata-browser-before.log, column-metadata-browser-after.log). Existing overflow, source touch gating/positive panning, column configuration and geometry checks remain. Root inspected the final Darwin list98.5/92.8; visual floors unchanged.

The late Center-consumption assertion reproduced actual left alignment before the primitive fix (column-metadata-alignment-before.log); the final complete Mecânicos flow/visual pair passed with both63px and centered-cell assertions (column-metadata-alignment-after.log). Both reviewers reread the complete primitive and inline checkbox content with no remaining source finding.

Post-Center final npm run verify exited0 on macOS arm64/main over83deb81 plus final MIG-7J.0 tree:194 TS/DB in37 files,9 Rust,122 browser, all eight existing spec-derived goldens and common gates/53 layouts/154 PNGs (column-metadata-verify-final.log). Actual teardown left0 owned postmasters; exact payload/parity scope passed again (column-metadata-lifecycle.json, column-metadata-payload-check.json, column-metadata-parity-final.log). Final debug macOS bundle30.23MiB built successfully (column-metadata-macos-bundle-final.log), still foundation entry. Existing TanStack warning/ts-rs custom-serde diagnostic remain explicit; no assertion/floor was relaxed. Both progress outputs are regenerated, diff checks pass and guards remain absent/hooksPath unset. Final independent tracking/progress closure is recorded in reviews/column-metadata.md. No business golden/data/schema/status change, no Windows/native/human/HFSQL acceptance claim. Continue Documentos immediately after the explicit local commit.
