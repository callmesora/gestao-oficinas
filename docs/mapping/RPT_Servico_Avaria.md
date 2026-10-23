# Mapping — RPT_Servico_Avaria

Step 0 only. Source evidence is mapped; no application functionality is implemented. Review pending.

## Purpose

Print the legacy Servico Avaria report. Detailed controls, geometry, data selection and formulas are in `docs/reports/RPT_Servico_Avaria.md`.

Nominal portrait printable width is 108.000 mm; widest band / visible control / all-designer right edge are 108.000 / 107.950 / 107.950 mm. The source includes 107.950 mm controls at x=0 (legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:157-162,171-176), within the 108.000 mm band. This nominal design comparison does not settle actual orientation, scaling or clipping, which remain U-R23-01.

## Entry and exit

WIN_Table_Tempos_materiais_Descricoes explicitly selects preview; WIN_Tempos_Reparacao_Informacao calls iPrintReport without setting a destination. U-R23-02 covers its inherited/default destination.

Caller: `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:889-890`. Full print handler, including parameter preparation and branch selection:

```wlanguage
iPreview()
iPrintReport(RPT_Servico_Avaria,numero_ordem_reparacao)
```

Caller: `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:360-360`. Full print handler, including parameter preparation and branch selection:

```wlanguage
iPrintReport(RPT_Servico_Avaria,numero)
```

Reports do not return a value explicitly. Closing preview, export destination choices and driver failures belong to U-R23-02. The company caption reads `gsNome_empresa_reports`; it is caller/project state, not a report parameter. No report code writes a business file. Query reads position current HFSQL result buffers; temporary declarations are released where shown. The caller table remains part of the input contract for table-sourced reports.

## Events and exact rules

### SRC-de2dec99cd —  [MyReport], 327680 (Open)

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:337-356`. Load the requested repair order, vehicle and reception customer using named queries; set service, observation, contact and customer captions only on successful first-record reads; release declarations.

```wlanguage
procedure MyReport(gNumero_ordem_rep)
STC_Empresa=gsNome_empresa_reports
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,gNumero_ordem_rep)
IF HReadFirst(QRY_select_ordens_reparacao_numero)=True THEN
	item_matricula=QRY_select_ordens_reparacao_numero.matricula
	HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)
	IF HReadFirst(QRY_select_viatura_matricula)=True THEN
		ITEM_Marca_Modelo=QRY_select_viatura_matricula.marca+"  "+QRY_select_viatura_matricula.modelo
	END
	HCancelDeclaration(QRY_select_viatura_matricula)
	item_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico
	item_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs
	item_contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos
	HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.recepcao_cliente)
	IF HReadFirst(QRY_select_cliente_codigo)=True THEN
		item_cliente=QRY_select_cliente_codigo.Descricao
	END
	HCancelDeclaration(QRY_select_cliente_codigo)
END
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
```

## Data and WLanguage semantics

Data source: `No data source`. The report specification reproduces the available SQL and bindings; U-R23-03 covers selection/group options absent from extracted evidence.

`iInitReportQuery` initializes the report query with positional arguments; `iPreview` selects print preview; `iPrintReport` runs the report. `HExecuteQuery` runs a named query; `HExecuteSQLQuery` runs the constructed SQL; `HReadFirst` positions/reads its first result; `HCancelDeclaration` releases its temporary declaration. `File.Item` accesses a mutable current-record buffer. `cr` inserts a line break. String `+` expressions include the literal spaces shown in source. None of these calls is a business write or transaction.

## Behavior checklist

| Concern | Evidence / disposition |
|---|---|
| On open | Company global and declarations in Open event above; caller supplies range/order parameters where present. |
| Search or mode change | Callers select this report and reinitialize its query; exact caller branch is preserved above. |
| Add/modify/delete and record leaving filter | No report mutation event; effect of a changing table/result during preview is U-R23-02. |
| Empty result / NULL / keyboard row moves | No explicit report empty-result or keyboard handlers. Engine output is U-R23-02; source tables/caller selection are not invented report state. |
| Refresh, other users, two instances | Isolation/reentrancy and snapshot versus live buffer are U-R23-02. |
| Built-in sorting/search/saved columns | Report control flags are in the spec; inheritance of source table sort/filter/selection is U-R23-03. |
| Dialogs, labels, default, Esc | No custom report dialog literals; preview/driver messages and cancellation are U-R23-02. |
| Write failures | No business writes in report source; query/print failure handling is U-R23-02. |
| Numbers/dates as text | Exact concatenations and numeric masks appear above/spec; remaining engine coercion and masks are U-R23-01 / U-R23-02. |

## Proposed changes

No business or architecture change is accepted. Parameterized SQL, a new report engine, decimal and date helpers remain framing proposals in `docs/porting.md`. Preserve observed literals and event order; do not silently repair misleading titles, join conditions, reset timing or durations.

## Unresolved

- **U-R23-01** — Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- **U-R23-02** — Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- **U-R23-03** — Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.

Coverage: 1/1 nonempty source code blocks; 0/0 encoded slots documented separately. Every report SRC seed ID is retained. Status is specified/unmapped only.
