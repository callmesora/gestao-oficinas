# Report spec — RPT_Ordens_Reparacao_DataPag

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Ordens_Reparacao_DataPag.wde`, `dossier: RPT_Ordens_Reparacao_DataPag`, `docs/mapping/RPT_Ordens_Reparacao_DataPag.md`, image `docs/evidence/images/RPT_Ordens_Reparacao_DataPag.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:429`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R22-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 176.007 / 176.007 | Visible geometry exceeds nominal printable width; orientation/scale/clipping behavior remains U-R22-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Query**. Named source: `QRY_select_ordens_reparacao_data_pag`.

`dossier: QRY_select_ordens_reparacao_data_pag/sql`. Verbatim extracted SQL below; U-R22-06: typography/encoding is evidence, not executable SQL.

```sql
SELECT
ordem_reparacao.numero AS numero,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.recepcao_datahora AS recepcao_datahora,
ordem_reparacao.data_pagamento AS data_pagamento,
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
Viaturas.matricula = ordem_reparacao.matricula
AND Clientes.Codigo = Viaturas.Cliente
AND ordem_reparacao.reparacao_estado = estados_reparacao.Codigo
AND
(
ordem_reparacao.data_pagamento BETWEEN {ParamDaData} AND {ParamAData}
AND ordem_reparacao.reparacao_estado IN ({ParamEstados})
)
```

Parameter names listed by the parser: ParamAData, ParamDaData, ParamEstados. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R22-03.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R22-03.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | DOCTITLE, STC_Empresa, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,175.900,10.850 | STC_Numero, STC_Cliente, STC_Marcamodelo, STC_Matricula, STC_Recepcao_datahora, STC_Recepcao_entrega_prevista, STC_Estado, STC_Total_pago |
| BODY | per source record (visibility U-R22-03) | 0.000,30.850,175.900,6.200 | ITEM_Numero, ITEM_Cliente, ITEM_Marcamodelo, ITEM_Matricula, ITEM_Recepcao_datahora, ITEM_Recepcao_entrega_prevista, ITEM_Estado, ITEM_Total_pago |
| PAGE_FOOTER | each page | 0.000,37.050,175.900,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,43.664,175.900,15.350 | CALC_Total_pago, COUNTERSTATIC1, COUNTER1, PoweredWx1, STC_NoName |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R22-03 / U-R22-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| DOCTITLE | START_OF_DOCUMENT | Caption | "Ordens de Reparação por data de entrega" | image | 23.338,7.615,129.225,9.789 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R22-01 | U-R22-01 | no border row text; U-R22-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R22-01 | U-R22-01 | no border row text; U-R22-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Numero | PAGE_HEADER | Caption | "Número" | image | 0.000,0.000,13.073,10.848 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Cliente | PAGE_HEADER | Caption | "Cliente" | image | 12.965,0.000,29.477,10.848 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Marcamodelo | PAGE_HEADER | Caption | "Marca e Modelo" | image | 42.333,0.000,26.832,10.848 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Matricula | PAGE_HEADER | Caption | "Matrícula" | image | 69.056,0.000,16.248,10.848 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Recepcao_datahora | PAGE_HEADER | Caption | "Data/Hora recepção" | image | 85.196,0.000,30.800,10.848 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Recepcao_entrega_prevista | PAGE_HEADER | Caption | "Data pagamento" | image | 115.887,0.000,18.630,10.848 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Estado | PAGE_HEADER | Caption | "Estado" | image | 134.408,0.000,23.392,10.848 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Total_pago | PAGE_HEADER | Caption | "Valor" | image | 157.800,0.000,18.207,10.848 | U-R22-01 | U-R22-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Numero | BODY | Caption | bound `numero` | dossier | 0.000,0.000,13.073,6.200 | U-R22-01 | U-R22-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Cliente | BODY | Caption | bound `Cliente` | dossier | 12.965,0.000,29.477,6.200 | U-R22-01 | U-R22-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Marcamodelo | BODY | Caption | bound `marcamodelo` | dossier | 42.333,0.000,26.832,6.200 | U-R22-01 | U-R22-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Matricula | BODY | Caption | bound `matricula` | dossier | 69.056,0.000,16.248,6.200 | U-R22-01 | U-R22-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Recepcao_datahora | BODY | Caption | bound `recepcao_datahora` | dossier | 85.196,0.000,30.800,6.200 | U-R22-01 | U-R22-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Recepcao_entrega_prevista | BODY | Caption | bound `data_pagamento` | dossier | 115.887,0.000,18.630,6.200 | U-R22-01 | U-R22-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Estado | BODY | Caption | bound `Estado` | dossier | 134.408,0.000,23.392,6.200 | U-R22-01 | U-R22-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Total_pago | BODY | Caption | bound `total_pago` | dossier | 157.800,0.000,18.207,6.200 | U-R22-01 | U-R22-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R22-01 | U-R22-01 | no border row text; U-R22-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CALC_Total_pago | END_OF_DOCUMENT | Calculation | bound `QRY_select_ordens_reparacao_data_pag.total_pago` | dossier | 157.800,0.000,17.991,6.715 | U-R22-01 | U-R22-01 | no border row text; U-R22-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC1 | END_OF_DOCUMENT | Caption | "Número de linhas:" | image-observed; inferred control association | 0.000,9.260,31.329,6.086 | U-R22-01 | U-R22-01 | no border row text; U-R22-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER1 | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,9.262,16.338,6.088 | U-R22-01 | U-R22-01 | no border row text; U-R22-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| PoweredWx1 | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,9.794,40.902,5.556 | U-R22-01 | U-R22-01 | no border row text; U-R22-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName | END_OF_DOCUMENT | Caption | "Total:" | image-observed; inferred control association | 142.081,0.000,15.719,6.350 | U-R22-01 | U-R22-01 | no border row text; U-R22-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |

Image inspected: `docs/evidence/images/RPT_Ordens_Reparacao_DataPag.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R22-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

The payment-date report designer visibly retains the title **Ordens de Reparação por data de entrega**, while the column caption is **Data pagamento**. Preserve this mismatch until an explicit change is accepted.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R22-02: automatic scope; manual source below | U-R22-01 | RULE-R22-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R22-02: automatic scope; manual source below | U-R22-01 | RULE-R22-012 |
| CALC_Total_pago | Calculation | Sum Numeric; item QRY_select_ordens_reparacao_data_pag.total_pago | U-R22-02: automatic scope; manual source below | U-R22-01 | RULE-R22-012 |
| COUNTER1 | Calculation | Counter Numeric; item none | U-R22-02: automatic scope; manual source below | U-R22-01 | RULE-R22-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Ordens_Reparacao_DataPag.wde:372-372`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R22-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R22-02 / U-R22-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R22-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R22-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R22-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R22-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R22-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R22-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R22-06: Dossier SQL has typographic quotation/encoding artifacts. Obtain original query SQL before execution; copied SQL is evidence text, not executable replacement. Blocks SQL translation; interim default: none; must be answered.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Ordens_Reparacao_DataPag.md and separate RULE rows. U-R22-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
