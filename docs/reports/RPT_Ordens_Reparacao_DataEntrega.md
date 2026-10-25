# Report spec — RPT_Ordens_Reparacao_DataEntrega

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Ordens_Reparacao_DataEntrega.wde`, `dossier: RPT_Ordens_Reparacao_DataEntrega`, `docs/mapping/RPT_Ordens_Reparacao_DataEntrega.md`, image `docs/evidence/images/RPT_Ordens_Reparacao_DataEntrega.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:429`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R21-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 175.900 / 175.900 | Visible geometry fits nominal printable width; orientation/scale/clipping behavior remains U-R21-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Query**. Named source: `QRY_select_ordens_reparacao_data_entrega`.

`dossier: QRY_select_ordens_reparacao_data_entrega/sql`. Verbatim extracted SQL below; U-R21-06: typography/encoding is evidence, not executable SQL.

```sql
SELECT
ordem_reparacao.numero AS numero,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.recepcao_datahora AS recepcao_datahora,
ordem_reparacao.recepcao_entrega_prevista AS recepcao_entrega_prevista,
ordem_reparacao.reparacao_estado AS reparacao_estado,
ordem_reparacao.total_pago AS total_pago,
Clientes.Descricao AS Cliente,
estados_reparacao.Descricao AS Estado,
( ( Viaturas.marca +  ’ ’) + Viaturas.modelo )  AS marcamodelo
FROM
Clientes,
Viaturas,
estados_reparacao,
ordem_reparacao
WHERE
Clientes.Codigo = Viaturas.Cliente
AND ordem_reparacao.reparacao_estado = estados_reparacao.Codigo
AND Viaturas.matricula = ordem_reparacao.matricula
AND
(
ordem_reparacao.recepcao_entrega_prevista BETWEEN {ParamDaData} AND {ParamAData}
AND ordem_reparacao.reparacao_estado IN ({ParamEstados})
)
ORDER BY
recepcao_entrega_prevista DESC
```

Parameter names listed by the parser: ParamAData, ParamDaData, ParamEstados. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R21-03.

The target preserves source delivery-date DESC using ADR002 Date comparison keys before printing; supported compact8/ISO10 values retain their exact raw output. PostgreSQL source-row ties and NULLS LAST stay explicit target defaults. The distinct payment report still has no added ORDER BY.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R21-03.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | DOCTITLE, STC_Empresa, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,175.900,10.850 | STC_Numero, STC_Cliente, STC_Marcamodelo, STC_Matricula, STC_Recepcao_datahora, STC_Estado, STC_Valor, STC_Recepcao_entrega_prevista |
| BODY | per source record (visibility U-R21-03) | 0.000,30.850,175.900,6.200 | ITEM_Numero, ITEM_Cliente, ITEM_Marcamodelo, ITEM_Matricula, ITEM_Recepcao_datahora, ITEM_Recepcao_entrega_prevista, ITEM_Estado, ITEM_Total_pago |
| PAGE_FOOTER | each page | 0.000,37.050,175.900,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,43.664,175.900,15.350 | STC_NoName, CALC_Total_pago, COUNTERSTATIC1, COUNTER1, PoweredWx1 |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R21-03 / U-R21-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| DOCTITLE | START_OF_DOCUMENT | Caption | "Ordens de Reparação por data de entrega" | image | 23.338,7.615,129.225,9.789 | U-R21-01 | U-R21-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R21-01 | U-R21-01 | no border row text; U-R21-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R21-01 | U-R21-01 | no border row text; U-R21-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Numero | PAGE_HEADER | Caption | "Número" | image | 0.000,0.000,12.965,10.848 | U-R21-01 | U-R21-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Cliente | PAGE_HEADER | Caption | "Cliente" | image | 12.965,0.000,29.477,10.848 | U-R21-01 | U-R21-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Marcamodelo | PAGE_HEADER | Caption | "Marca e Modelo" | image | 42.333,0.000,26.832,10.848 | U-R21-01 | U-R21-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Matricula | PAGE_HEADER | Caption | "Matrícula" | image | 69.165,0.000,16.248,10.848 | U-R21-01 | U-R21-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Recepcao_datahora | PAGE_HEADER | Caption | "Data/Hora recepção" | image | 85.413,0.000,30.800,10.848 | U-R21-01 | U-R21-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Estado | PAGE_HEADER | Caption | "Estado" | image | 134.781,0.000,23.099,10.848 | U-R21-01 | U-R21-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Valor | PAGE_HEADER | Caption | "Valor" | image | 157.692,0.000,17.991,10.848 | U-R21-01 | U-R21-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Recepcao_entrega_prevista | PAGE_HEADER | Caption | "Data entrega" | image | 116.152,0.000,18.629,10.848 | U-R21-01 | U-R21-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Numero | BODY | Caption | bound `numero` | dossier | 0.000,0.000,12.965,6.200 | U-R21-01 | U-R21-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Cliente | BODY | Caption | bound `cliente` | dossier | 12.965,0.000,29.477,6.200 | U-R21-01 | U-R21-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Marcamodelo | BODY | Caption | bound `marcamodelo` | dossier | 42.333,0.000,26.832,6.200 | U-R21-01 | U-R21-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Matricula | BODY | Caption | bound `matricula` | dossier | 69.165,0.000,16.248,6.200 | U-R21-01 | U-R21-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Recepcao_datahora | BODY | Caption | bound `recepcao_datahora` | dossier | 85.413,0.000,30.800,6.200 | U-R21-01 | U-R21-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Recepcao_entrega_prevista | BODY | Caption | bound `recepcao_entrega_prevista` | dossier | 116.152,0.000,18.629,6.200 | U-R21-01 | U-R21-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Estado | BODY | Caption | bound `Estado` | dossier | 134.781,0.000,23.099,6.200 | U-R21-01 | U-R21-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Total_pago | BODY | Caption | bound `total_pago` | dossier | 157.692,0.000,17.991,6.200 | U-R21-01 | U-R21-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R21-01 | U-R21-01 | no border row text; U-R21-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName | END_OF_DOCUMENT | Caption | "Total:" | image-observed; inferred control association | 142.081,0.000,15.719,6.350 | U-R21-01 | U-R21-01 | no border row text; U-R21-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CALC_Total_pago | END_OF_DOCUMENT | Calculation | bound `QRY_select_ordens_reparacao_data_entrega.total_pago` | dossier | 157.692,0.000,17.991,6.715 | U-R21-01 | U-R21-01 | no border row text; U-R21-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC1 | END_OF_DOCUMENT | Caption | "Número de linhas:" | image-observed; inferred control association | 0.000,9.260,31.329,6.086 | U-R21-01 | U-R21-01 | no border row text; U-R21-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER1 | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,9.262,16.338,6.088 | U-R21-01 | U-R21-01 | no border row text; U-R21-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| PoweredWx1 | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,9.794,40.902,5.556 | U-R21-01 | U-R21-01 | no border row text; U-R21-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |

Image inspected: `docs/evidence/images/RPT_Ordens_Reparacao_DataEntrega.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R21-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R21-02: automatic scope; manual source below | U-R21-01 | RULE-R21-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R21-02: automatic scope; manual source below | U-R21-01 | RULE-R21-012 |
| CALC_Total_pago | Calculation | Sum Numeric; item QRY_select_ordens_reparacao_data_entrega.total_pago | U-R21-02: automatic scope; manual source below | U-R21-01 | RULE-R21-012 |
| COUNTER1 | Calculation | Counter Numeric; item none | U-R21-02: automatic scope; manual source below | U-R21-01 | RULE-R21-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Ordens_Reparacao_DataEntrega.wde:371-371`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R21-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R21-02 / U-R21-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R21-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R21-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R21-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R21-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R21-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R21-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R21-06: Dossier SQL has typographic quotation/encoding artifacts. Obtain original query SQL before execution; copied SQL is evidence text, not executable replacement. Blocks SQL translation; interim default: none; must be answered.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Ordens_Reparacao_DataEntrega.md and separate RULE rows. U-R21-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
