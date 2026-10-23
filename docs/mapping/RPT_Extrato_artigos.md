# Mapping — RPT_Extrato_artigos

Step 0 only. Source evidence is mapped; no application functionality is implemented. Review pending.

## Purpose

Print the legacy Extrato artigos report. Detailed controls, geometry, data selection and formulas are in `docs/reports/RPT_Extrato_artigos.md`.

## Entry and exit

Preview is explicitly selected immediately before printing in the caller.

Caller: `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:412-422`. Full print handler, including parameter preparation and branch selection:

```wlanguage
da_data is datetime=EDT_Da_data
da_data..Hour=00
da_data..Minute=00
da_data..Second=00
a_data is DateTime=EDT_a_data
a_data..Hour=23
a_data..minute=59
a_data..second=59
iPreview()
iInitReportQuery(RPT_Extrato_artigos,da_data,a_data,EDT_Do_artigo,EDT_Ao_artigo)
iPrintReport(RPT_Extrato_artigos,da_data)
```

Reports do not return a value explicitly. Closing preview, export destination choices and driver failures belong to U-R09-02. The company caption reads `gsNome_empresa_reports`; it is caller/project state, not a report parameter. No report code writes a business file. Query reads position current HFSQL result buffers; temporary declarations are released where shown. The caller table remains part of the input contract for table-sourced reports.

## Events and exact rules

### SRC-6d3380d7f5 — BREAK_HEADER1, 327692 (Before printing)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:263-278`. Set article heading and calculate opening balance from 2000-01-01 through the supplied cutoff: stock=1 adds, stock=2 subtracts, other stock codes do nothing; set running balance and release the historical query.

```wlanguage
STC_artigo=QRY_union_extrato_artigos.artigo+" - "+QRY_union_extrato_artigos.descricao_artigo
HExecuteQuery(QRY_union_extrato_artigos_calcular_total,hQueryDefault,gddata_antiga,gddata_limite,QRY_union_extrato_artigos.artigo,QRY_union_extrato_artigos.artigo)
rTotal is real=0
hreadfirst(QRY_union_extrato_artigos_calcular_total)
for EACH QRY_union_extrato_artigos_calcular_total 
	if QRY_union_extrato_artigos_calcular_total.stock=1 then
		rTotal=rTotal+QRY_union_extrato_artigos_calcular_total.quantidade
	else
		if QRY_union_extrato_artigos_calcular_total.stock=2 then
			rTotal=rTotal-QRY_union_extrato_artigos_calcular_total.quantidade
		END
	END
END
STC_total_anterior="Total Anterior: "+rTotal
ITEM_total=rTotal
HCancelDeclaration(QRY_union_extrato_artigos_calcular_total)
```

### SRC-9a9ad8b7ec — BODY, 327692 (Before printing)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:419-429`. Before each printed movement, set entrance/exit text for stock=1/2 and increase/decrease the running balance; no branch resets cells for any other stock code.

```wlanguage
if ITEM_Stock=1 then
	ITEM_entrada=ITEM_Quantidade
	ITEM_saida=""
	ITEM_total=ITEM_total+ITEM_Quantidade
else
	if ITEM_Stock=2
		ITEM_entrada=""
		ITEM_saida=ITEM_Quantidade
		ITEM_total=ITEM_total-ITEM_Quantidade
	end
END
```

### SRC-bfee0de2e0 — BREAK_FOOTER1, 327692 (Before printing)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:473-473`. Set Total Final: followed by the current running balance before the group footer prints.

```wlanguage
STC_total_final="Total Final: "+ITEM_total
```

### SRC-edb61e8442 —  [RPT_Extrato_artigos], 327680 (Open)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:584-589`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
procedure RPT_Extrato_artigos(gData_limite)
gddata_limite is datetime
gddata_limite=gData_limite
gddata_antiga is datetime
gddata_antiga="20000101000000"
STC_Empresa=gsNome_empresa_reports
```

Encoded action `A-cef8fd` at `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:261`: **assumed**, proposed behavior “Nothing beyond the code next to it”. The adjacent source code is separately verified evidence, not proof of the hidden action. RULE-R09-010.

## Data and WLanguage semantics

Data source: `QRY_union_extrato_artigos`. The report specification reproduces the available SQL and bindings; U-R09-03 covers selection/group options absent from extracted evidence.

`iInitReportQuery` initializes the report query with positional arguments; `iPreview` selects print preview; `iPrintReport` runs the report. `HExecuteQuery` runs a named query; `HExecuteSQLQuery` runs the constructed SQL; `HReadFirst` positions/reads its first result; `HCancelDeclaration` releases its temporary declaration. `File.Item` accesses a mutable current-record buffer. `cr` inserts a line break. String `+` expressions include the literal spaces shown in source. None of these calls is a business write or transaction.

Concrete balance example: prior entries 10 and exits 3 initialize 7; a printed entry 2 then exit 4 yields running balances 9 then 5. `rTotal` is real, not decimal; row/query ordering and inclusive cutoffs are significant. Opening caption is exactly `Total Anterior: `, closing caption `Total Final: `.

## Behavior checklist

| Concern | Evidence / disposition |
|---|---|
| On open | Company global and declarations in Open event above; caller supplies range/order parameters where present. |
| Search or mode change | Callers select this report and reinitialize its query; exact caller branch is preserved above. |
| Add/modify/delete and record leaving filter | No report mutation event; effect of a changing table/result during preview is U-R09-02. |
| Empty result / NULL / keyboard row moves | No explicit report empty-result or keyboard handlers. Engine output is U-R09-02; source tables/caller selection are not invented report state. |
| Refresh, other users, two instances | Isolation/reentrancy and snapshot versus live buffer are U-R09-02. |
| Built-in sorting/search/saved columns | Report control flags are in the spec; inheritance of source table sort/filter/selection is U-R09-03. |
| Dialogs, labels, default, Esc | No custom report dialog literals; preview/driver messages and cancellation are U-R09-02. |
| Write failures | No business writes in report source; query/print failure handling is U-R09-02. |
| Numbers/dates as text | Exact concatenations and numeric masks appear above/spec; remaining engine coercion and masks are U-R09-01 / U-R09-02. |

## Proposed changes

No business or architecture change is accepted. Parameterized SQL, a new report engine, decimal and date helpers remain framing proposals in `docs/porting.md`. Preserve observed literals and event order; do not silently repair misleading titles, join conditions, reset timing or durations.

## Unresolved

- **U-R09-01** — Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- **U-R09-02** — Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- **U-R09-03** — Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- **U-R09-06** — Dossier SQL has typographic quotation/encoding artifacts. Obtain original query SQL before execution; copied SQL is evidence text, not executable replacement. Blocks SQL translation; interim default: none; must be answered.
- **U-R09-07** — Opening-balance query ends at the same da_data passed as the main report range start and uses inclusive BETWEEN; establish boundary duplication and repeated-preview/reset behavior. Blocks opening-balance edge parity; interim default: preserve both inclusive bounds.

Coverage: 4/4 nonempty source code blocks; 1/1 encoded slots documented separately. Every report SRC seed ID is retained. Status is specified/unmapped only.

## Image-observed footer captions

The following strings are legible in this report’s own designer image. The control association is inferred by matching footer geometry to the dossier; confidence is inferred, not a runtime verification. Sample numeric values beside the captions remain placeholders.

- `PoweredWx`: **Golfinho Software, Lda** — `RULE-R09-101`; `docs/evidence/images/RPT_Extrato_artigos.jpg` and `dossier: RPT_Extrato_artigos/controls.PoweredWx`.

These literal strings are settled as image observations. U-R09-01 remains for exact font, alignment, masks, orientation, clipping and runtime wrapping; it no longer treats the listed caption text as absent.
