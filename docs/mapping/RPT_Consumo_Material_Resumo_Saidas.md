# Mapping — RPT_Consumo_Material_Resumo_Saidas

Step 0 only. Source evidence is mapped; no application functionality is implemented. Review pending.

## Purpose

Print the legacy Consumo Material Resumo Saidas report. Detailed controls, geometry, data selection and formulas are in `docs/reports/RPT_Consumo_Material_Resumo_Saidas.md`.

## Entry and exit

Preview is explicitly selected immediately before printing in the caller.

Caller: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348-393`. Full print handler, including parameter preparation and branch selection:

```wlanguage
da_data is datetime=EDT_Da_data
da_data..Hour=00
da_data..Minute=00
da_data..Second=00
a_data is DateTime=EDT_a_data
a_data..Hour=23
a_data..Minute=59
a_data..Second=59
SWITCH tipo_report
	CASE "resumo"
		if CBOX_doc[1]=1 and CBOX_doc[2]=0 then
			iPreview()
			iInitReportQuery(RPT_Consumo_Material_Resumo_ordens,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data)
			iPrintReport(RPT_Consumo_Material_Resumo_ordens)
		else
			IF CBOX_doc[1]=1 AND CBOX_doc[2]=1 THEN
				iPreview()
				iInitReportQuery(RPT_Consumo_Material_Resumo_ordem_saidas,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data)
				iPrintReport(RPT_Consumo_Material_Resumo_ordem_saidas)
			ELSE
				IF CBOX_doc[1]=0 AND CBOX_doc[2]=1 THEN
					iPreview()
					iInitReportQuery(RPT_Consumo_Material_Resumo_saidas,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data)
					iPrintReport(RPT_Consumo_Material_Resumo_saidas)
				END
			END
		END
	CASE "descriminado"
		IF CBOX_doc[1]=1 AND CBOX_doc[2]=0 THEN
			iPreview()
			iInitReportQuery(RPT_Consumo_Material_Descriminado_Ordens,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição)
			iprintreport(RPT_Consumo_Material_Descriminado_Ordens)
		ELSE
			IF CBOX_doc[1]=1 AND CBOX_doc[2]=1 THEN
				ipreview()
				iInitReportQuery(RPT_Consumo_Material_Descriminado_ordens_saidas,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição)
				iprintreport(RPT_Consumo_Material_Descriminado_ordens_saidas)
			ELSE
				IF CBOX_doc[1]=0 AND CBOX_doc[2]=1 THEN
					ipreview()
					iInitReportQuery(RPT_Consumo_Material_Descriminado_Saidas,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição)
					iPrintReport(RPT_Consumo_Material_Descriminado_Saidas)
				END
			END
		END
END
```

Reports do not return a value explicitly. Closing preview, export destination choices and driver failures belong to U-R04-02. The company caption reads `gsNome_empresa_reports`; it is caller/project state, not a report parameter. No report code writes a business file. Query reads position current HFSQL result buffers; temporary declarations are released where shown. The caller table remains part of the input contract for table-sourced reports.

## Events and exact rules

### SRC-367a7ccbd8 — report, 327680 (Open)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Resumo_Saidas.wde:321-321`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data and WLanguage semantics

Data source: `QRY_union_lin_stocks`. The report specification reproduces the available SQL and bindings; U-R04-03 covers selection/group options absent from extracted evidence.

`iInitReportQuery` initializes the report query with positional arguments; `iPreview` selects print preview; `iPrintReport` runs the report. `HExecuteQuery` runs a named query; `HExecuteSQLQuery` runs the constructed SQL; `HReadFirst` positions/reads its first result; `HCancelDeclaration` releases its temporary declaration. `File.Item` accesses a mutable current-record buffer. `cr` inserts a line break. String `+` expressions include the literal spaces shown in source. None of these calls is a business write or transaction.

## Behavior checklist

| Concern | Evidence / disposition |
|---|---|
| On open | Company global and declarations in Open event above; caller supplies range/order parameters where present. |
| Search or mode change | Callers select this report and reinitialize its query; exact caller branch is preserved above. |
| Add/modify/delete and record leaving filter | No report mutation event; effect of a changing table/result during preview is U-R04-02. |
| Empty result / NULL / keyboard row moves | No explicit report empty-result or keyboard handlers. Engine output is U-R04-02; source tables/caller selection are not invented report state. |
| Refresh, other users, two instances | Isolation/reentrancy and snapshot versus live buffer are U-R04-02. |
| Built-in sorting/search/saved columns | Report control flags are in the spec; inheritance of source table sort/filter/selection is U-R04-03. |
| Dialogs, labels, default, Esc | No custom report dialog literals; preview/driver messages and cancellation are U-R04-02. |
| Write failures | No business writes in report source; query/print failure handling is U-R04-02. |
| Numbers/dates as text | Exact concatenations and numeric masks appear above/spec; remaining engine coercion and masks are U-R04-01 / U-R04-02. |

## Proposed changes

No business or architecture change is accepted. Parameterized SQL, a new report engine, decimal and date helpers remain framing proposals in `docs/porting.md`. Preserve observed literals and event order; do not silently repair misleading titles, join conditions, reset timing or durations.

## Unresolved

- **U-R04-01** — Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- **U-R04-02** — Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- **U-R04-03** — Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- **U-R04-06** — Dossier SQL has typographic quotation/encoding artifacts. Obtain original query SQL before execution; copied SQL is evidence text, not executable replacement. Blocks SQL translation; interim default: none; must be answered.

Coverage: 1/1 nonempty source code blocks; 0/0 encoded slots documented separately. Every report SRC seed ID is retained. Status is specified/unmapped only.

## Image-observed footer captions

The following strings are legible in this report’s own designer image. The control association is inferred by matching footer geometry to the dossier; confidence is inferred, not a runtime verification. Sample numeric values beside the captions remain placeholders.

- `PoweredWx`: **Golfinho Software, Lda** — `RULE-R04-101`; `docs/evidence/images/RPT_Consumo_Material_Resumo_Saidas.jpg` and `dossier: RPT_Consumo_Material_Resumo_Saidas/controls.PoweredWx`.

These literal strings are settled as image observations. U-R04-01 remains for exact font, alignment, masks, orientation, clipping and runtime wrapping; it no longer treats the listed caption text as absent.
