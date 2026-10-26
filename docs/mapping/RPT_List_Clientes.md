# Mapping — RPT_List_Clientes

Step 0 only. Source evidence is mapped; no application functionality is implemented. Review pending.

## Purpose

Print the legacy List Clientes report. Detailed controls, geometry, data selection and formulas are in `docs/reports/RPT_List_Clientes.md`.

## Entry and exit

Assumed preview then print from the compiled caller association; proposed: A-ce2839. No text-source iPrintReport caller was found.

Compiled caller association: WIN_Table_Clientes (named in its compiled code: predefined action or dynamic call). `docs/navigation.md` and `docs/mapping/event-codes.md` record the compiled finding. Exact-name text search of legacy sources found no additional textual print caller; project/backup binary mentions do not establish another active call.

Reports do not return a value explicitly. Closing preview, export destination choices and driver failures belong to U-R10-02. The company caption reads `gsNome_empresa_reports`; it is caller/project state, not a report parameter. No report code writes a business file. Query reads position current HFSQL result buffers; temporary declarations are released where shown. The caller table remains part of the input contract for table-sourced reports.

## Events and exact rules

### SRC-a9f77fe1bc — report, 327680 (Open)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_List_Clientes.wde:331-331`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data and WLanguage semantics

Data source: `Embedded query`. The report specification reproduces the available SQL and bindings; U-R10-03 covers selection/group options absent from extracted evidence.

`iInitReportQuery` initializes the report query with positional arguments; `iPreview` selects print preview; `iPrintReport` runs the report. `HExecuteQuery` runs a named query; `HExecuteSQLQuery` runs the constructed SQL; `HReadFirst` positions/reads its first result; `HCancelDeclaration` releases its temporary declaration. `File.Item` accesses a mutable current-record buffer. `cr` inserts a line break. String `+` expressions include the literal spaces shown in source. None of these calls is a business write or transaction.

## Behavior checklist

| Concern | Evidence / disposition |
|---|---|
| On open | Company global and declarations in Open event above; caller supplies range/order parameters where present. |
| Search or mode change | Callers select this report and reinitialize its query; exact caller branch is preserved above. |
| Add/modify/delete and record leaving filter | No report mutation event; effect of a changing table/result during preview is U-R10-02. |
| Empty result / NULL / keyboard row moves | No explicit report empty-result or keyboard handlers. Engine output is U-R10-02; source tables/caller selection are not invented report state. |
| Refresh, other users, two instances | Isolation/reentrancy and snapshot versus live buffer are U-R10-02. |
| Built-in sorting/search/saved columns | Report control flags are in the spec; inheritance of source table sort/filter/selection is U-R10-03. |
| Dialogs, labels, default, Esc | No custom report dialog literals; preview/driver messages and cancellation are U-R10-02. |
| Write failures | No business writes in report source; query/print failure handling is U-R10-02. |
| Numbers/dates as text | Exact concatenations and numeric masks appear above/spec; remaining engine coercion and masks are U-R10-01 / U-R10-02. |

## Proposed changes

The target engine, arithmetic and parameterized query contract follow accepted ADR-002/005/006. Preserve source literals and event order, including misleading titles, joins, reset timing and durations. Target tests do not decode the remaining legacy properties.

## Unresolved

- **U-R10-01** — Remaining design fidelity: orientation, fonts, alignment, masks and overflow not exposed by the current extraction. Static designer-property export or further decoding can resolve these without executing the legacy application. The implemented layout uses the explicit ADR-005 defaults; exact native appearance remains unconfirmed.
- **U-R10-02** — Remaining engine equivalence: implicit NULL/empty output, counter resets, cancellation and printer-error behavior beyond the sole company-caption event. Properties/documented engine contracts or controlled output can resolve these. Target Paged.js/PDF behavior is implemented and tested under ADR-005; native printing needs host checks. This report uses an embedded query, not a caller table.
- **U-R10-03** — Exact embedded SELECT/filter/order contract is not yet decoded/exported. Source .wde:353–357 retains its 1,965-byte encoded query; selected-item lists are not complete SQL. Static query export or decoding can resolve it without a business-application run. The target uses the separately labelled ADR-005 query proposal.

Coverage: 1/1 nonempty source code blocks; 0/0 encoded slots documented separately. Every report SRC seed ID is retained. Current implementation/verification status is in the per-unit parity CSV; these source questions do not erase built target behavior.

## Image-observed footer captions

The following strings are legible in this report’s own designer image. The control association is inferred by matching footer geometry to the dossier; confidence is inferred, not a runtime verification. Sample numeric values beside the captions remain placeholders.

- `PoweredWx`: **Golfinho Software, Lda** — `RULE-R10-101`; `docs/evidence/images/RPT_List_Clientes.jpg` and `dossier: RPT_List_Clientes/controls.PoweredWx`.
- `COUNTERSTATIC`: **Número de linhas:** — `RULE-R10-102`; `docs/evidence/images/RPT_List_Clientes.jpg` and `dossier: RPT_List_Clientes/controls.COUNTERSTATIC`.

These literal strings are settled as image observations. U-R10-01 remains for exact font, alignment, masks, orientation, clipping and runtime wrapping; it no longer treats the listed caption text as absent.
