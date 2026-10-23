# Report spec — RPT_Ordens_Reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Ordens_Reparacao.wde`, `dossier: RPT_Ordens_Reparacao`, `docs/mapping/RPT_Ordens_Reparacao.md`, image `docs/evidence/images/RPT_Ordens_Reparacao.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1386`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R20-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 175.900 / 175.900 | Visible geometry fits nominal printable width; orientation/scale/clipping behavior remains U-R20-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Table control**. Named source: `WIN_Ordens_Reparacao.TABLE_QRY_select_ordens_reparacao`.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | STC_Empresa, DOCTITLE, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,175.900,10.850 | STC_COL_Numero, STC_COL_Matricula, STC_COL_Recepcao_datahora, STC_COL_Recepcao_entrega_prevista, STC_COL_Reparacao_estado, STC_COL_Recepcao_prioridade, STC_COL_Reparacao_mecanico, STC_COL_Cliente, STC_COL_marca_modelo |
| BODY | per source record (visibility U-R20-03) | 0.000,30.850,175.900,6.200 | ITEM_COL_Numero, ITEM_COL_Matricula, ITEM_COL_Recepcao_datahora, ITEM_COL_Recepcao_entrega_prevista, ITEM_COL_Reparacao_estado, ITEM_COL_Recepcao_prioridade, ITEM_COL_Reparacao_mecanico, ITEM_COL_Cliente, ITEM_COL_marca_modelo |
| PAGE_FOOTER | each page | 0.000,37.050,175.900,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,43.664,175.900,15.349 | COUNTERSTATIC1, COUNTER1, PoweredWx1 |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R20-03 / U-R20-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R20-01 | U-R20-01 | no border row text; U-R20-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| DOCTITLE | START_OF_DOCUMENT | Caption | "Ordens de Reparação" | image | 52.045,6.615,71.810,9.789 | U-R20-01 | U-R20-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R20-01 | U-R20-01 | no border row text; U-R20-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_COL_Numero | PAGE_HEADER | Caption | "Número" | image | 0.000,0.000,13.602,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_Matricula | PAGE_HEADER | Caption | "Matrícula" | image | 56.465,0.000,15.984,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_Recepcao_datahora | PAGE_HEADER | Caption | "Data/Hora recepção" | image | 72.449,0.000,31.064,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_Recepcao_entrega_prevista | PAGE_HEADER | Caption | "Data prevista para entrega" | image | 103.513,0.000,20.746,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_Reparacao_estado | PAGE_HEADER | Caption | "Estado" | image | 124.259,0.000,20.481,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_Recepcao_prioridade | PAGE_HEADER | Caption | "Prioridade" | image | 144.740,0.000,16.248,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_Reparacao_mecanico | PAGE_HEADER | Caption | "Mecânico" | image | 160.867,0.000,14.925,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_Cliente | PAGE_HEADER | Caption | "Cliente" | image | 13.494,0.000,21.275,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_marca_modelo | PAGE_HEADER | Caption | "Marca e Modelo" | image | 34.660,0.000,21.805,10.848 | U-R20-01 | U-R20-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_Numero | BODY | Caption | bound `COL_Numero` | dossier | 0.000,0.000,13.602,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_Matricula | BODY | Caption | bound `COL_Matricula` | dossier | 56.465,0.000,15.984,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_Recepcao_datahora | BODY | Caption | bound `COL_Recepcao_datahora` | dossier | 72.449,0.000,31.064,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_Recepcao_entrega_prevista | BODY | Caption | bound `COL_Recepcao_entrega_prevista` | dossier | 103.513,0.000,20.746,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_Reparacao_estado | BODY | Caption | bound `COL_Reparacao_estado` | dossier | 124.259,0.000,20.481,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_Recepcao_prioridade | BODY | Caption | bound `COL_Recepcao_prioridade` | dossier | 144.740,0.000,16.248,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_Reparacao_mecanico | BODY | Caption | bound `COL_Reparacao_mecanico` | dossier | 160.867,0.000,14.925,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_Cliente | BODY | Caption | bound `COL_Cliente` | dossier | 13.494,0.000,21.275,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_marca_modelo | BODY | Caption | bound `COL_marca_modelo` | dossier | 34.660,0.000,21.805,6.085 | U-R20-01 | U-R20-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R20-01 | U-R20-01 | no border row text; U-R20-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC1 | END_OF_DOCUMENT | Caption | "Número de linhas:" | image-observed; inferred control association | 0.000,9.262,30.271,6.085 | U-R20-01 | U-R20-01 | no border row text; U-R20-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER1 | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,9.259,16.338,6.088 | U-R20-01 | U-R20-01 | no border row text; U-R20-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| PoweredWx1 | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,9.791,40.902,5.556 | U-R20-01 | U-R20-01 | no border row text; U-R20-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |

Image inspected: `docs/evidence/images/RPT_Ordens_Reparacao.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R20-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R20-02: automatic scope; manual source below | U-R20-01 | RULE-R20-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R20-02: automatic scope; manual source below | U-R20-01 | RULE-R20-012 |
| COUNTER1 | Calculation | Counter Numeric; item none | U-R20-02: automatic scope; manual source below | U-R20-01 | RULE-R20-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Ordens_Reparacao.wde:362-369`, event `327692` on `BODY`. Translate live table priority strings 1/2/3 to Normal/Elevada/Urgente before printing; other values have no assignment branch.

```wlanguage
SWITCH WIN_Ordens_Reparacao.TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade
	CASE "1"
		item_COL_Recepcao_prioridade="Normal"
	CASE "2"
		ITEM_COL_Recepcao_prioridade="Elevada"
	CASE "3"
		ITEM_COL_Recepcao_prioridade="Urgente"
END
```

`legacy/GestaoOficinas_TesteIA/RPT_Ordens_Reparacao.wde:480-480`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R20-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R20-02 / U-R20-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R20-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R20-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R20-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R20-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R20-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R20-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R20-07: Priority outside strings 1/2/3 has no assignment branch; determine whether prior printed text persists or the bound control clears. Blocks unsupported-priority output; interim default: no invented default label.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Ordens_Reparacao.md and separate RULE rows. U-R20-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
