# Mapping — RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo

Step 0 only. Source evidence is mapped; no application functionality is implemented. Review pending.

## Purpose

Print the legacy Tempos Ordem Reparacao Mecanico Resumo report. Detailed controls, geometry, data selection and formulas are in `docs/reports/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.md`.

## Entry and exit

Preview is explicitly selected immediately before printing in the caller.

Caller: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:266-291`. Full print handler, including parameter preparation and branch selection:

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
	CASE "ordem_reparacao"
		iPreview()
		iInitReportQuery(RPT_Tempos_Ordem_Reparacao,EDT_Da_ordem,EDT_a_ordem,da_data,a_data)
		iPrintReport(RPT_Tempos_Ordem_Reparacao)
	CASE "mecanico_descriminado"
		iPreview()
		iInitReportQuery(RPT_Tempos_Ordem_Reparacao_Mecanico,EDT_Do_mecanico,EDT_Ao_mecanico,da_data,a_data)
		iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico)
	CASE "mecanico_resumo"
		iPreview()
		iInitReportQuery(RPT_Tempos_Ordem_Reparacao_Mecanico_resumo,EDT_Do_mecanico,EDT_Ao_mecanico,da_data,a_data)
		iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo)
	CASE "viatura"
		iPreview()
		iInitReportQuery(RPT_Tempos_Ordem_Reparacao_viatura,da_data,a_data,EDT_Da_viatura,EDT_a_viatura)
		iPrintReport(RPT_Tempos_Ordem_Reparacao_viatura)
END
```

Reports do not return a value explicitly. Closing preview, export destination choices and driver failures belong to U-R26-02. The company caption reads `gsNome_empresa_reports`; it is caller/project state, not a report parameter. No report code writes a business file. Query reads position current HFSQL result buffers; temporary declarations are released where shown. The caller table remains part of the input contract for table-sourced reports.

## Events and exact rules

### SRC-ac08c7c70b — BREAK_HEADER1, 327692 (Before printing)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:188-188`. Assign the named captions from the current query buffer exactly as shown, preserving spaces and event order.

```wlanguage
STC_mecanico=QRY_tempos_ordem_reparacao_mecanico.Descricao
```

### SRC-6e239b7530 — BODY/ITEM_tempo, 327692 (Before printing)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:263-269`. Read row start/end as DateTime; an end equal to the 17-zero sentinel prints 00:00; otherwise call the custom duration formatter.

```wlanguage
dtini is datetime = ITEM_Inicio
dtfim is datetime = ITEM_Fim
IF dtfim="00000000000000000" THEN
	MySelf="00:00"
ELSE
	MySelf=Intervalo_datas_para_horas(dtini,dtfim)
END
```

### SRC-81f293ec29 — BODY, 327693 (After printing)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:287-288`. After each body prints, add its formatted row duration into the running string total and update the indicated subtotal caption.

```wlanguage
gsTotal_horas=soma_horas(gsTotal_horas,ITEM_tempo)
STC_total_horas1=gsTotal_horas
```

### SRC-be3b9e2d2e — BREAK_FOOTER1, 327693 (After printing)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:338-338`. After this document/group footer prints, reset the indicated accumulator to numeric zero.

```wlanguage
gsTotal_horas=0
```

### SRC-faaff1a444 — report, 327680 (Open)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:445-446`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
gsTotal_horas is string
STC_Empresa=gsNome_empresa_reports
```

### SRC-790eea7010 —  [soma_horas], 458752 (Local procedure)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:466-493`. Parse hours before the colon and two minutes after it using 1-based string positions; add minutes, carry exactly one hour when minutes >=60, add hours and format HH:MM. Parameters are by-reference by default; no explicit LOCAL is present.

```wlanguage
PROCEDURE soma_horas(hora_ini, hora_soma)

nHoraIni is int = Val(Middle(hora_ini,1,Position(hora_ini,":",1,FromBeginning)-1)) 
nMinutosIni is int = Val(Middle(hora_ini,Position(hora_ini,":",1,FromBeginning)+1,2)) 

nHoraSoma is int = Val(Middle(hora_soma,1,Position(hora_soma,":",1,FromBeginning)-1)) 
nMinutosSoma is int = Val(Middle(hora_soma,Position(hora_soma,":",1,FromBeginning)+1,2)) 

nMinutosIni = nMinutosIni + nMinutosSoma
IF nMinutosIni>=60 THEN
	nHoraIni = nHoraIni + 1
	nMinutosIni = nMinutosIni - 60
END
nHoraIni = nHoraIni + nHoraSoma
RESULT NumToString(nHoraIni, "02d")+":"+NumToString(nMinutosIni, "02d")
```

### SRC-791358c5a3 —  [Intervalo_datas_para_horas], 458752 (Local procedure)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:500-517`. Subtract start from end; take fractional hours; round the fractional part upward using the literal multipliers; format whole hours and minutes as two-digit integers separated by a colon.

```wlanguage
PROCEDURE Intervalo_datas_para_horas(StartDate is datetime,EndDate is datetime)
MyDuration is Duration = EndDate - StartDate
nParteDecimal is numeric = DecimalPart(MyDuration..InHours)
nMinutos is numeric  = RoundUp((nParteDecimal * 59.99999999999)/0.99999999999999,0)
RESULT NumToString(IntegerPart(MyDuration..InHours),"02d")+":"+NumToString(nMinutos,"02d")
```

## Data and WLanguage semantics

Data source: `QRY_tempos_ordem_reparacao_mecanico`. The report specification reproduces the available SQL and bindings; U-R26-03 covers selection/group options absent from extracted evidence.

`iInitReportQuery` initializes the report query with positional arguments; `iPreview` selects print preview; `iPrintReport` runs the report. `HExecuteQuery` runs a named query; `HExecuteSQLQuery` runs the constructed SQL; `HReadFirst` positions/reads its first result; `HCancelDeclaration` releases its temporary declaration. `File.Item` accesses a mutable current-record buffer. `cr` inserts a line break. String `+` expressions include the literal spaces shown in source. None of these calls is a business write or transaction.

`Duration..InHours` supplies hours; `DecimalPart` and `IntegerPart` split fractional/whole parts; `RoundUp(x,0)` rounds upward; `NumToString(...,"02d")` pads numeric output. `Position`/`Middle` are 1-based; `Val` parses a numeric value. All time totals are strings despite assignments of numeric `0`. The row end sentinel is exactly `00000000000000000`. No conversion to elapsed decimal hours is authorized.

Concrete source-algorithm example: `01:40` + `02:35` becomes `04:15` (75 minutes carries one hour). A 90-minute interval has fractional hours 0.5, nominal formatted result `01:30`; actual decimal/rounding boundary behavior remains U-R26-04.

## Behavior checklist

| Concern | Evidence / disposition |
|---|---|
| On open | Company global and declarations in Open event above; caller supplies range/order parameters where present. |
| Search or mode change | Callers select this report and reinitialize its query; exact caller branch is preserved above. |
| Add/modify/delete and record leaving filter | No report mutation event; effect of a changing table/result during preview is U-R26-02. |
| Empty result / NULL / keyboard row moves | No explicit report empty-result or keyboard handlers. Engine output is U-R26-02; source tables/caller selection are not invented report state. |
| Refresh, other users, two instances | Isolation/reentrancy and snapshot versus live buffer are U-R26-02. |
| Built-in sorting/search/saved columns | Report control flags are in the spec; inheritance of source table sort/filter/selection is U-R26-03. |
| Dialogs, labels, default, Esc | No custom report dialog literals; preview/driver messages and cancellation are U-R26-02. |
| Write failures | No business writes in report source; query/print failure handling is U-R26-02. |
| Numbers/dates as text | Exact concatenations and numeric masks appear above/spec; remaining engine coercion and masks are U-R26-01 / U-R26-02. |

## Proposed changes

No business or architecture change is accepted. Parameterized SQL, a new report engine, decimal and date helpers remain framing proposals in `docs/porting.md`. Preserve observed literals and event order; do not silently repair misleading titles, join conditions, reset timing or durations.

## Unresolved

- **U-R26-01** — Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- **U-R26-02** — Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- **U-R26-03** — Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- **U-R26-04** — Duration edge cases: characterize empty and numeric-zero string totals, missing colon, negative intervals, sub-minute rounding, 60-minute carry, >99-hour formatting and by-reference side effects in WINDEV. Blocks exact duration parity; interim default: literal algorithm only, no normalization.

Coverage: 7/7 nonempty source code blocks; 0/0 encoded slots documented separately. Every report SRC seed ID is retained. Status is specified/unmapped only.

## Image-observed footer captions

The following strings are legible in this report’s own designer image. The control association is inferred by matching footer geometry to the dossier; confidence is inferred, not a runtime verification. Sample numeric values beside the captions remain placeholders.

- `PoweredWx`: **Golfinho Software, Lda** — `RULE-R26-101`; `docs/evidence/images/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.jpg` and `dossier: RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo/controls.PoweredWx`.

These literal strings are settled as image observations. U-R26-01 remains for exact font, alignment, masks, orientation, clipping and runtime wrapping; it no longer treats the listed caption text as absent.
