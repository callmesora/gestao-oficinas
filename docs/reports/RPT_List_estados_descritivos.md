# Report spec — RPT_List_estados_descritivos

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_List_estados_descritivos.wde`, `dossier: RPT_List_estados_descritivos`, `docs/mapping/RPT_List_estados_descritivos.md`, image `docs/evidence/images/RPT_List_estados_descritivos.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: WIN_Table_estados_descritivos (named in its compiled code: predefined action or dynamic call)

Destination: Assumed preview then print from the compiled caller association; proposed: A-d2d708. No text-source iPrintReport caller was found.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| A4 (210 x 297 mm) | U-R14-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 170.000 | 175.900 / 175.900 / 175.900 | Visible geometry exceeds nominal printable width; orientation/scale/clipping behavior remains U-R14-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Embedded query**. Named source absent; U-R14-03 applies to embedded SQL.

Compiled selected items: `Codigo` (caption Código), `Descricao` (caption Descrição). These are selected items, not a SQL query or proof every item is printed.

SQL, filters and order are encoded and absent from text evidence: U-R14-03. No proposed SQL is presented as a verified fact.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | DOCTITLE, STC_Empresa, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.090 | STC_Codigo, STC_Descricao |
| BODY | per source record (visibility U-R14-03) | 0.000,26.090,175.900,6.200 | ITEM_Codigo, ITEM_Descricao |
| PAGE_FOOTER | each page | 0.000,32.290,175.900,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,38.904,175.900,6.088 | COUNTERSTATIC, COUNTER, PoweredWx |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R14-03 / U-R14-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| DOCTITLE | START_OF_DOCUMENT | Caption | "Estados descritivos" | image | 55.749,6.615,64.401,9.789 | U-R14-01 | U-R14-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R14-01 | U-R14-01 | no border row text; U-R14-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R14-01 | U-R14-01 | no border row text; U-R14-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Codigo | PAGE_HEADER | Caption | "Código" | image | 0.000,0.004,19.158,6.086 | U-R14-01 | U-R14-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Descricao | PAGE_HEADER | Caption | "Descrição" | image | 19.050,0.004,156.742,6.086 | U-R14-01 | U-R14-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Codigo | BODY | Caption | bound `Codigo` | dossier | 0.000,0.000,19.158,6.200 | U-R14-01 | U-R14-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao | BODY | Caption | bound `Descricao` | dossier | 19.050,0.000,156.742,6.200 | U-R14-01 | U-R14-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 143.900,0.000,32.000,6.615 | U-R14-01 | U-R14-01 | no border row text; U-R14-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC | END_OF_DOCUMENT | Caption | "Número de linhas:" | image-observed; inferred control association | 0.000,0.000,30.271,6.085 | U-R14-01 | U-R14-01 | no border row text; U-R14-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,0.000,16.338,6.088 | U-R14-01 | U-R14-01 | no border row text; U-R14-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| PoweredWx | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,0.000,40.902,5.556 | U-R14-01 | U-R14-01 | no border row text; U-R14-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |

Image inspected: `docs/evidence/images/RPT_List_estados_descritivos.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R14-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R14-02: automatic scope; manual source below | U-R14-01 | RULE-R14-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R14-02: automatic scope; manual source below | U-R14-01 | RULE-R14-012 |
| COUNTER | Calculation | Counter Numeric; item none | U-R14-02: automatic scope; manual source below | U-R14-01 | RULE-R14-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_List_estados_descritivos.wde:216-216`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R14-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R14-02 / U-R14-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R14-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R14-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R14-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R14-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R14-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R14-03: Data contract: embedded SELECT, WHERE, ORDER BY, deduplication and inherited filters are encoded; compiled selected-item lists are not complete SQL. Export the report embedded query from WINDEV. Blocks faithful row selection; interim default: none; must be answered.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_List_estados_descritivos.md and separate RULE rows. U-R14-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
