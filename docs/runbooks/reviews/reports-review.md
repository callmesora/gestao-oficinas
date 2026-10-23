# Independent Step 0 review — reports

Reviewed 28 reports against the original sources, kept unit packs, current extraction, source callers, dossier fields and all 27 available report images. The combined detailed consumption report has no image; its U-R03-05 correctly records that absence. This review does not use the report mapper's handoff or reasoning as evidence. No report mapping, report spec, CSV, legacy file or application file was modified.

**Disposition:** source/event coverage passes. Three grouped documentation findings need correction; exact visual and runtime report parity remains explicitly unresolved. No implementation readiness or runtime verification is asserted.

## 1. Mechanical and newer evidence

All 28 invocations of `parity_check.py docs/parity/UNIT.csv --seed docs/parity/parity-seed.csv --element UNIT --check-files --note docs/mapping/UNIT.md --note docs/reports/UNIT.md` passed. No ERROR lines: no missing/stale SRC IDs, duplicate IDs, unsupported statuses, broken recognized evidence paths, or unlabelled open points. Total reviewed matrix: **236 rows and 69 SRC seed IDs**.

The current `scripts/unit_evidence.py:pack` function regenerated each pack **in memory** from `analysis-local/latest.json`. All 28 objects equal their kept packs after structural JSON comparison. No `.new` or sorted evidence files were written, honoring this review's read-only extraction restriction. There is no newer encoded-action, flag, structured field or event meaning to reconcile. This comparison checks the latest available extracts, not a new PDF/source extraction run.

All 69 nonempty executable blocks were also compared to the mapping notes after removing comments and insignificant whitespace; every original executable block is present. Source reads retain the original line numbers; no legacy code was executed.

Mechanical/newer-evidence findings: **0**.

## 2. Missing rows or events

No missing code block or encoded-action coverage found. `RPT_Extrato_artigos` includes its extra encoded properties at `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:261` separately as `RULE-R09-010`, correctly assumed with `proposed: A-cef8fd`. The nine embedded-query master-list reports keep their encoded caller print actions as assumed rules rather than inventing textual `iPrintReport` calls.

Missing-row/event findings: **0**.

## 3. Misread rules

### RR-01 [P2] Distinguish visible printable extent from hidden designer extent

**Where:** `docs/reports/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.md:17`; the same calculation issue affects `docs/reports/RPT_Extrato_artigos.md:17`.

The mechanic-summary page table concludes that portrait geometry exceeds 175.900 mm because the largest control edge is 281.072 mm. The source/dossier layout puts `STC_Inicio`, `STC_Fim`, `ITEM_Inicio` and `ITEM_Fim` outside the main band, but their `Visible` flags are false. The visible control extent is approximately 175.900 mm, which fits the stated nominal width. The cited report image likewise shows the main visible columns while those start/finish controls are hidden. A hidden control is not evidence of a printed overrun.

For the article statement, the 209.716 mm extent similarly comes from invisible quantity/stock controls; the largest visible extent is approximately 176.117 mm. A small visible overrun still needs investigation, but the 209.716 mm assertion overstates it.

**Evidence:** `dossier: RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo/controls.STC_Fim.flags`, `/controls.ITEM_Fim.flags`, `/controls.STC_Inicio.flags`, `/controls.ITEM_Inicio.flags`; `dossier: RPT_Extrato_artigos/controls.STC_Stock.flags` and `/controls.ITEM_Stock.flags`; each report's Columns and controls table; `docs/evidence/images/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.jpg` and `docs/evidence/images/RPT_Extrato_artigos.jpg`.

**Concrete fix:** report both all-designer and visible-control extents. Base the printed-width warning on visible controls/bands. Retain U-R26-01/U-R09-01 for orientation, clipping and engine behavior; do not infer landscape, resizing or rendering from the hidden extent. Check all 28 page summaries for the same distinction.

Misread-rule findings: **1 grouped finding**.

## 4. Wrong confidence labels or supporting evidence

### RR-02 [P2] Replace the company-global rule's header citation with its executable assignment

**Where:** every `RULE-R01-013` through `RULE-R28-013` in the 28 per-report CSVs. Each cites its `.wde:4` for copying `gsNome_empresa_reports` on report open.

Line 4 is the source's unit name, not the assignment or Open event. The behavior itself is directly evidenced elsewhere, so it need not be downgraded, but the currently cited source location does not substantiate a verified claim.

**Examples of correct evidence:** `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao.wde:524-525`; `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:584-589`; `legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde:381-404`; `legacy/GestaoOficinas_TesteIA/RPT_inventario.wde:287`.

**Concrete fix:** point each company-global rule to its original Open SRC evidence range (already present in that report's matrix). Keep confidence verified once the supporting citation is corrected, or remove the duplicate rule if its behavior is fully represented by the retained SRC row. No SRC ID should be removed.

The remaining inspected labels are consistent: encoded caller destinations and the extra report action are assumed and cite proposals; incomplete embedded SELECT/WHERE/ORDER BY stays unresolved; exact assignments, numeric literals and event reset order are source-supported. Image caption transcriptions in the specs are identified as image evidence, without claiming a runtime golden.

Confidence/evidence findings: **1 grouped finding affecting 28 rules**.

## 5. Unresolved items the evidence settles or narrows

### RR-03 [P2] Resolve legible static footer captions instead of leaving all text under generic visual U items

**Where:** `docs/reports/RPT_inventario.md:51`, `:53`; `docs/reports/RPT_Ordens_Reparacao_DataPag.md:95`, `:97`, `:98`; analogous `COUNTERSTATIC` and `PoweredWx` rows in other report specs where the same text is visible.

These rows describe literal captions as absent/clipped or assigned by code. The supplied images visibly show the footer labels. In inventory, `COUNTERSTATIC` reads **Número de linhas:**, and `PoweredWx` reads **Golfinho Software, Lda**. The payment report image likewise shows the count/vendor labels and a **Total:** label immediately before its numeric total. These are static captions, unlike the adjacent sample numerals and preset page counters.

**Evidence:** `docs/evidence/images/RPT_inventario.jpg`; `docs/evidence/images/RPT_Ordens_Reparacao_DataPag.jpg`; dossier geometry/control names for the corresponding END_OF_DOCUMENT captions. No runtime execution is needed to transcribe a fully legible designer caption.

**Concrete fix:** transcribe these literal strings with image citations and label them image-observed. Narrow U-R28-01/U-R22-01 to the actual remaining font/mask/overflow/orientation uncertainties. Audit the other available report images for the same footer captions. Preserve placeholder `Static`, `Title`, sample numbers and preset tokens as placeholders rather than treating them as runtime values.

The following unresolved items were checked and should remain open:

- Nine embedded list queries: compiled selected-item lists support field inventory, not complete SELECT/WHERE/ORDER BY or inherited filter semantics. Their U-R10-03 through U-R18-03 remain warranted.
- Missing combined detailed consumption image: U-R03-05 remains warranted; similar report images are not proof of its complete captions/layout.
- Automatic break keys, counter reset scope, footer anchoring, no-row pages and actual wrapping/page splits remain outside the direct text-source evidence. Explicit Before/After printing code is known; engine-generated behavior is not inferred.
- The four labor-report duration edge cases remain U-R24-04 through U-R27-04: empty/numeric-zero string totals, malformed colons, negative/subminute intervals and values over 99 hours require legacy golden cases. The literal source formula alone does not establish WINDEV arithmetic/formatting boundaries.

Narrowable-unresolved findings: **1 grouped finding**, with concrete examples above.

## 6. Implementer blockers and focused semantic checks

No additional silent blocker was found beyond the explicit unresolved rows, subject to the three corrections above. These existing blockers must remain visible in the parent Stage 0 decision:

- **Labor timing and resets:** checked the literal `RoundUp((DecimalPart(hours)*59.99999999999)/0.99999999999999,0)` and `02d` formatting in all four reports. `soma_horas` uses 1-based parsing and a single minute carry. Reports initialize string accumulators by declaration and later assign numeric zero; the notes preserve that distinction. In mechanic/vehicle detailed reports, the inner footer resets `gsTotal_horas` before adding the still-displayed `STC_total_horas` to the outer accumulator. That order is correctly mapped; it must not be rewritten as adding the reset variable.
- **Article opening balance:** `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:263-278`, `:419-429`, `:584-589` and the two dossier queries establish inclusive historical/current bounds sharing the same caller cutoff. U-R09-07 correctly flags the overlapping boundary. Stock code 1 adds, 2 subtracts; other codes do not clear entrance/exit cells. `rTotal` is real in the original source. No automatic boundary subtraction, cell clearing or decimal normalization is approved.
- **Query and caller arguments:** material filters expand dates to 00:00:00..23:59:59 and choose reports from the explicit checkbox/mode branch. Labor reports filter labor **start** timestamps, not interval overlap. Sales/payment caller uses its selected datetimes without adding end-of-day expansion and joins checked state codes with a trailing semicolon. The report mappings reproduce the caller handlers and SQL rather than silently changing them.
- **Live table reports:** `RPT_Materiais` reads `WIN_Table_Tempos_materiais_Descricoes.TABLE_materiais` and receives the already formatted totals label. `RPT_Ordens_Reparacao` reads the live filtered table, whose priority column may already contain translated text. Its source only handles strings 1/2/3; U-R20-07 correctly keeps other-value output unresolved. A fresh unfiltered database query would change the documented input contract.
- **Destination:** service report is previewed by the details window but `WIN_Tempos_Reparacao_Informacao.wdw:360` does not choose a destination. U-R23-02 correctly retains that inherited/default destination issue. The nine embedded-list reports' preview-then-print destination is only proposed, not verified.
- **Geometry and page engine:** all controls and bands are listed in millimetres; orientation, anchored footer behavior, rows per page, repeating groups, automatic calculation resets, output masks and long-text/multipage behavior still require designer properties or golden PDFs. Source layout strip y coordinates alone do not determine a printed page's footer location.

Implementer-blocker findings: **0 new silent gaps**. Existing U items remain blockers to exact report implementation and validation.

## Coverage inventory

All 28 units reviewed: the eight material-consumption reports; `RPT_Extrato_artigos`; the nine `RPT_List_*` reports; `RPT_Materiais`; `RPT_Ordens_Reparacao`; `RPT_Ordens_Reparacao_DataEntrega`; `RPT_Ordens_Reparacao_DataPag`; `RPT_Servico_Avaria`; the four `RPT_Tempos_Ordem_Reparacao*` reports; `RPT_inventario`.

Counts by category: mechanical/newer evidence **0**; missing rows/events **0**; misread rules **1**; confidence/supporting evidence **1**; unresolved items narrowed by evidence **1**; new implementer blockers **0**. **Three grouped actionable findings total.** All report source blocks remain covered; none of these checks constitutes implemented or runtime-verified parity.

## Fix verification

All three grouped documentation findings were corrected on 2026-10-23. This section supersedes the initial disposition that the three documentation corrections remain outstanding; it does not close the existing runtime/designer U items.

- **RR-01 corrected:** all 28 page summaries now separately report band extent, Visible=True control extent and all-designer control extent. The fit warning uses visible controls plus bands. The unsupported overrun warning disappears for the mechanic-summary and vehicle labor reports. The article statement retains its smaller visible overrun, with orientation/clipping still unresolved. Hidden control metadata remains in each control table; no layout/source was changed.
- **RR-02 corrected:** read every original company assignment and updated all 28 `RULE-Rxx-013` evidence locations to its actual executable source line. A verification readback confirmed every cited line contains the `STC_Empresa=gsNome_empresa_reports` assignment. Confidence remains verified because the executable evidence directly supports the behavior.
- **RR-03 corrected:** transcribed 41 legible caption facts from the reports' own images into report specs and mapping notes, with separate inferred parity rules. These comprise 26 visible vendor footers, 13 visible count labels, and the two visible delivery/payment total labels. Control association is explicitly inferred from image position and dossier geometry. No caption was copied into the report lacking an image, and no vendor footer was invented for the cropped service-report image. Existing visual U items remain for properties/captions that the evidence still does not establish.

Validation after fixes: **28/28** `parity_check` invocations pass with `--check-files` and both mapping/spec notes. All **69 SRC IDs** remain. The updated report matrices contain **277 rows: 176 specified and 101 unmapped**; the 41 additional caption rows are inferred, not runtime-verified. No application/source, shared consolidation or local extraction file was modified, and no commit or push was made.
