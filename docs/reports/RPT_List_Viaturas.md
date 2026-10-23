# Report spec — RPT_List_Viaturas

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_List_Viaturas.wde`, `dossier: RPT_List_Viaturas`, `docs/mapping/RPT_List_Viaturas.md`, image `docs/evidence/images/RPT_List_Viaturas.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: WIN_Table_Viaturas (named in its compiled code: predefined action or dynamic call)

Destination: Assumed preview then print from the compiled caller association; proposed: A-e21f3a. No text-source iPrintReport caller was found.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| A4 (210 x 297 mm) | U-R11-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 170.000 | 175.900 / 176.007 / 176.007 | Visible geometry exceeds nominal printable width; orientation/scale/clipping behavior remains U-R11-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Embedded query**. Named source absent; U-R11-03 applies to embedded SQL.

Compiled selected items: `matricula` (caption Matricula), `Cliente` (caption Cliente), `marca` (caption Marca), `modelo` (caption Modelo), `Ano` (caption Ano), `mes` (caption mes). These are selected items, not a SQL query or proof every item is printed.

SQL, filters and order are encoded and absent from text evidence: U-R11-03. No proposed SQL is presented as a verified fact.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | DOCTITLE, STC_Empresa, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.090 | STC_Matricula, STC_Cliente, STC_Marca, STC_Modelo, STC_Ano, STC_Mes |
| BODY | per source record (visibility U-R11-03) | 0.000,26.090,175.900,6.350 | ITEM_Matricula, ITEM_Cliente, ITEM_Marca, ITEM_Modelo, ITEM_Ano, ITEM_Mes |
| PAGE_FOOTER | each page | 0.000,32.440,175.900,6.638 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,39.078,175.900,6.088 | COUNTERSTATIC, COUNTER, PoweredWx |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R11-03 / U-R11-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| DOCTITLE | START_OF_DOCUMENT | Caption | "Viaturas" | image | 66.994,6.615,41.912,9.789 | U-R11-01 | U-R11-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R11-01 | U-R11-01 | no border row text; U-R11-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R11-01 | U-R11-01 | no border row text; U-R11-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Matricula | PAGE_HEADER | Caption | "Matricula" | image | 0.000,0.004,23.400,6.086 | U-R11-01 | U-R11-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Cliente | PAGE_HEADER | Caption | "Cliente" | image | 23.283,0.004,22.069,6.086 | U-R11-01 | U-R11-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Marca | PAGE_HEADER | Caption | "Marca" | image | 45.244,0.004,52.231,6.086 | U-R11-01 | U-R11-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Modelo | PAGE_HEADER | Caption | "Modelo" | image | 97.475,0.004,54.009,6.086 | U-R11-01 | U-R11-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Ano | PAGE_HEADER | Caption | "Ano" | image | 151.484,0.004,11.997,6.086 | U-R11-01 | U-R11-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Mes | PAGE_HEADER | Caption | "Mês" | image | 163.481,0.004,12.526,6.086 | U-R11-01 | U-R11-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Matricula | BODY | Caption | bound `matricula` | dossier | 0.000,0.000,23.400,6.350 | U-R11-01 | U-R11-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Cliente | BODY | Caption | bound `Cliente` | dossier | 23.283,0.000,22.069,6.350 | U-R11-01 | U-R11-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Marca | BODY | Caption | bound `marca` | dossier | 45.244,0.000,52.231,6.350 | U-R11-01 | U-R11-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Modelo | BODY | Caption | bound `modelo` | dossier | 97.475,0.000,54.009,6.350 | U-R11-01 | U-R11-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Ano | BODY | Caption | bound `Ano` | dossier | 151.484,0.000,11.997,6.350 | U-R11-01 | U-R11-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Mes | BODY | Caption | bound `mes` | dossier | 163.481,0.000,12.526,6.350 | U-R11-01 | U-R11-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 143.900,0.000,32.000,6.615 | U-R11-01 | U-R11-01 | no border row text; U-R11-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC | END_OF_DOCUMENT | Caption | "Número de linhas:" | image-observed; inferred control association | 0.000,0.000,30.271,6.085 | U-R11-01 | U-R11-01 | no border row text; U-R11-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,0.000,16.338,6.088 | U-R11-01 | U-R11-01 | no border row text; U-R11-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| PoweredWx | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,0.000,40.902,5.556 | U-R11-01 | U-R11-01 | no border row text; U-R11-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |

Image inspected: `docs/evidence/images/RPT_List_Viaturas.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R11-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R11-02: automatic scope; manual source below | U-R11-01 | RULE-R11-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R11-02: automatic scope; manual source below | U-R11-01 | RULE-R11-012 |
| COUNTER | Calculation | Counter Numeric; item none | U-R11-02: automatic scope; manual source below | U-R11-01 | RULE-R11-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_List_Viaturas.wde:308-308`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R11-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R11-02 / U-R11-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R11-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R11-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R11-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R11-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R11-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R11-03: Data contract: embedded SELECT, WHERE, ORDER BY, deduplication and inherited filters are encoded; compiled selected-item lists are not complete SQL. Export the report embedded query from WINDEV. Blocks faithful row selection; interim default: none; must be answered.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_List_Viaturas.md and separate RULE rows. U-R11-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
