# Mapping — RPT_Materiais

Source inventory; current implementation and intentional target changes follow ADR-005. Original evidence and unresolved legacy questions remain recorded below.

## Purpose

Print the legacy Materiais report. Detailed controls, geometry, data selection and formulas are in `docs/reports/RPT_Materiais.md`.

Nominal portrait printable width is 108.000 mm; widest band / visible control / all-designer right edge are 108.000 / 108.010 / 108.010 mm. The visible extent is 94.408 + 13.602 = 108.010 mm for STC_COL_lancado and INT_COL_lancado (legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde:155-159,241-245). This is a 0.010 mm nominal design excess, without an assumed printer tolerance; actual orientation, scaling and clipping remain U-R19-01.

## Entry and exit

Preview is explicitly selected immediately before printing in the caller.

Caller: `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:791-792`. Full print handler, including parameter preparation and branch selection:

```wlanguage
iPreview()
iPrintReport(RPT_Materiais,numero_ordem_reparacao,STC_total_material)
```

Reports do not return a value explicitly. Closing preview, export destination choices and driver failures belong to U-R19-02. The company caption reads `gsNome_empresa_reports`; it is caller/project state, not a report parameter. No report code writes a business file. Query reads position current HFSQL result buffers; temporary declarations are released where shown. The caller table remains part of the input contract for table-sourced reports.

## Events and exact rules

### SRC-0cd14f2b0f —  [myreport], 327680 (Open)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde:381-404`. Load repair order, then vehicle and reception customer through concatenated SQL and first-record reads; set information lines conditionally; release each temporary declaration; copy caller-provided material total text without recalculating it.

```wlanguage
procedure myreport(gNumero_ordem,gsTotais is string)
STC_Empresa=gsNome_empresa_reports
gsQuery is string="select * from ordem_reparacao where numero='"+gnumero_ordem+"'"
gdsQry_select_ordem_rep is data source
HExecuteSQLQuery(gdsQry_select_ordem_rep,hQueryDefault,gsQuery)
if hreadfirst(gdsQry_select_ordem_rep)=true then
	STC_informacao="Nrº Ordem Reparação: "+gdsQry_select_ordem_rep.numero
	gsQuery="select * from viaturas where matricula='"+gdsQry_select_ordem_rep.matricula+"'"
	gdsQry_Select_matricula is data source
	HExecuteSQLQuery(gdsQry_Select_matricula,hQueryDefault,gsQuery)
	IF HReadFirst(gdsQry_Select_matricula)=True THEN
		STC_informacao=STC_informacao+cr+"Matrícula: "+gdsQry_select_ordem_rep.matricula+"   "+gdsQry_Select_matricula.marca+"/"+gdsQry_Select_matricula.modelo
	END
	HCancelDeclaration(gdsQry_Select_matricula)
	gsquery="select * from clientes where codigo='"+gdsQry_select_ordem_rep.recepcao_cliente+"'"
	gdsQry_Select_cliente is data source
	HExecuteSQLQuery(gdsQry_Select_cliente,hQueryDefault,gsQuery)
	if hreadfirst(gdsQry_Select_cliente)=true then
		STC_informacao=STC_informacao+cr+"Cliente: "+gdsQry_Select_cliente.descricao
	END
	HCancelDeclaration(gdsQry_Select_cliente)
END
HCancelDeclaration(gdsQry_select_ordem_rep)
STC_Total_material=gsTotais
```

## Data and WLanguage semantics

Data source: `WIN_Table_Tempos_materiais_Descricoes.TABLE_materiais`. The report specification reproduces the available SQL and bindings; U-R19-03 covers selection/group options absent from extracted evidence.

`iInitReportQuery` initializes the report query with positional arguments; `iPreview` selects print preview; `iPrintReport` runs the report. `HExecuteQuery` runs a named query; `HExecuteSQLQuery` runs the constructed SQL; `HReadFirst` positions/reads its first result; `HCancelDeclaration` releases its temporary declaration. `File.Item` accesses a mutable current-record buffer. `cr` inserts a line break. String `+` expressions include the literal spaces shown in source. None of these calls is a business write or transaction.

## Behavior checklist

| Concern | Evidence / disposition |
|---|---|
| On open | Company global and declarations in Open event above; caller supplies range/order parameters where present. |
| Search or mode change | Callers select this report and reinitialize its query; exact caller branch is preserved above. |
| Add/modify/delete and record leaving filter | No report mutation event; effect of a changing table/result during preview is U-R19-02. |
| Empty result / NULL / keyboard row moves | No explicit report empty-result or keyboard handlers. Engine output is U-R19-02; source tables/caller selection are not invented report state. |
| Refresh, other users, two instances | Isolation/reentrancy and snapshot versus live buffer are U-R19-02. |
| Built-in sorting/search/saved columns | Report control flags are in the spec; inheritance of source table sort/filter/selection is U-R19-03. |
| Dialogs, labels, default, Esc | No custom report dialog literals; preview/driver messages and cancellation are U-R19-02. |
| Write failures | No business writes in report source; query/print failure handling is U-R19-02. |
| Numbers/dates as text | Exact concatenations and numeric masks appear above/spec; remaining engine coercion and masks are U-R19-01 / U-R19-02. |

## Proposed changes

Accepted runtime/report choices are in ADR-005. Its explicit price-column correction supersedes the misleading extracted binding; preserve the original evidence, other literals, event order, joins, totals and durations.

## Unresolved

- **U-R19-01** — Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- **U-R19-02** — Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- **U-R19-03** — Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.

Coverage: 1/1 nonempty source code blocks; 0/0 encoded slots documented separately. Every report SRC seed ID is retained. Status is specified/unmapped only.

## Image-observed footer captions

The following strings are legible in this report’s own designer image. The control association is inferred by matching footer geometry to the dossier; confidence is inferred, not a runtime verification. Sample numeric values beside the captions remain placeholders.

- `PoweredWx`: **Golfinho Software, Lda** — `RULE-R19-101`; `docs/evidence/images/RPT_Materiais.jpg` and `dossier: RPT_Materiais/controls.PoweredWx`.

These literal strings are settled as image observations. U-R19-01 remains for exact font, alignment, masks, orientation, clipping and runtime wrapping; it no longer treats the listed caption text as absent.
