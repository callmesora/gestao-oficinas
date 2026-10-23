# Mapping — RPT_List_documentos

Step 0 only. Source evidence is mapped; no application functionality is implemented. Review pending.

## Purpose

Print the legacy List documentos report. Detailed controls, geometry, data selection and formulas are in `docs/reports/RPT_List_documentos.md`.

## Entry and exit

Assumed preview then print from the compiled caller association; proposed: A-424f7f. No text-source iPrintReport caller was found.

Compiled caller association: WIN_Table_documentos (named in its compiled code: predefined action or dynamic call). `docs/navigation.md` and `docs/mapping/event-codes.md` record the compiled finding. Exact-name text search of legacy sources found no additional textual print caller; project/backup binary mentions do not establish another active call.

Reports do not return a value explicitly. Closing preview, export destination choices and driver failures belong to U-R13-02. The company caption reads `gsNome_empresa_reports`; it is caller/project state, not a report parameter. No report code writes a business file. Query reads position current HFSQL result buffers; temporary declarations are released where shown. The caller table remains part of the input contract for table-sourced reports.

## Events and exact rules

### SRC-e173c612b5 — report, 327680 (Open)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_List_documentos.wde:214-214`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data and WLanguage semantics

Data source: `Embedded query`. The report specification reproduces the available SQL and bindings; U-R13-03 covers selection/group options absent from extracted evidence.

`iInitReportQuery` initializes the report query with positional arguments; `iPreview` selects print preview; `iPrintReport` runs the report. `HExecuteQuery` runs a named query; `HExecuteSQLQuery` runs the constructed SQL; `HReadFirst` positions/reads its first result; `HCancelDeclaration` releases its temporary declaration. `File.Item` accesses a mutable current-record buffer. `cr` inserts a line break. String `+` expressions include the literal spaces shown in source. None of these calls is a business write or transaction.

## Behavior checklist

| Concern | Evidence / disposition |
|---|---|
| On open | Company global and declarations in Open event above; caller supplies range/order parameters where present. |
| Search or mode change | Callers select this report and reinitialize its query; exact caller branch is preserved above. |
| Add/modify/delete and record leaving filter | No report mutation event; effect of a changing table/result during preview is U-R13-02. |
| Empty result / NULL / keyboard row moves | No explicit report empty-result or keyboard handlers. Engine output is U-R13-02; source tables/caller selection are not invented report state. |
| Refresh, other users, two instances | Isolation/reentrancy and snapshot versus live buffer are U-R13-02. |
| Built-in sorting/search/saved columns | Report control flags are in the spec; inheritance of source table sort/filter/selection is U-R13-03. |
| Dialogs, labels, default, Esc | No custom report dialog literals; preview/driver messages and cancellation are U-R13-02. |
| Write failures | No business writes in report source; query/print failure handling is U-R13-02. |
| Numbers/dates as text | Exact concatenations and numeric masks appear above/spec; remaining engine coercion and masks are U-R13-01 / U-R13-02. |

## Proposed changes

No business or architecture change is accepted. Parameterized SQL, a new report engine, decimal and date helpers remain framing proposals in `docs/porting.md`. Preserve observed literals and event order; do not silently repair misleading titles, join conditions, reset timing or durations.

## Unresolved

- **U-R13-01** — Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- **U-R13-02** — Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- **U-R13-03** — Data contract: embedded SELECT, WHERE, ORDER BY, deduplication and inherited filters are encoded; compiled selected-item lists are not complete SQL. Export the report embedded query from WINDEV. Blocks faithful row selection; interim default: none; must be answered.

Coverage: 1/1 nonempty source code blocks; 0/0 encoded slots documented separately. Every report SRC seed ID is retained. Status is specified/unmapped only.

## Image-observed footer captions

The following strings are legible in this report’s own designer image. The control association is inferred by matching footer geometry to the dossier; confidence is inferred, not a runtime verification. Sample numeric values beside the captions remain placeholders.

- `PoweredWx`: **Golfinho Software, Lda** — `RULE-R13-101`; `docs/evidence/images/RPT_List_documentos.jpg` and `dossier: RPT_List_documentos/controls.PoweredWx`.
- `COUNTERSTATIC`: **Número de linhas:** — `RULE-R13-102`; `docs/evidence/images/RPT_List_documentos.jpg` and `dossier: RPT_List_documentos/controls.COUNTERSTATIC`.

These literal strings are settled as image observations. U-R13-01 remains for exact font, alignment, masks, orientation, clipping and runtime wrapping; it no longer treats the listed caption text as absent.
