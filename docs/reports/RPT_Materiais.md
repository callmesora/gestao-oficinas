# Report spec — RPT_Materiais

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde`, `dossier: RPT_Materiais`, `docs/mapping/RPT_Materiais.md`, image `docs/evidence/images/RPT_Materiais.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:791`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| A5 paper (148 x 210 mm) | U-R19-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 108.000 | 108.000 / 108.010 / 108.010 | Visible geometry exceeds nominal printable width by 0.010 mm; orientation/scale/clipping behavior remains U-R19-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

Nominal portrait printable width is 108.000 mm; widest band / visible control / all-designer right edge are 108.000 / 108.010 / 108.010 mm. The visible extent is 94.408 + 13.602 = 108.010 mm for STC_COL_lancado and INT_COL_lancado (legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde:155-159,241-245). This is a 0.010 mm nominal design excess, without an assumed printer tolerance; actual orientation, scaling and clipping remain U-R19-01.

## Data source

Type: **Table control**. Named source: `WIN_Table_Tempos_materiais_Descricoes.TABLE_materiais`.

Rows come from the caller TABLE_materiais. Open separately reads ordem_reparacao by numero, Viaturas by matricula and Clientes by recepcao_cliente through concatenated SQL; STC_Total_material is the caller-provided string, not a report sum.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,108.000,30.803 | STC_Empresa, DOCTITLE, CONTROL58, STC_informacao |
| PAGE_HEADER | each page | 0.000,30.803,108.000,6.199 | STC_COL_cod_art, STC_COL_desc_artigo, STC_COL_quant, STC_COL_preco, STC_COL_lancado |
| BODY | per source record (visibility U-R19-03) | 0.000,37.002,108.000,6.350 | ITEM_COL_cod_art, ITEM_COL_desc_artigo, ITEM_COL_quant, ITEM_COL_preco, INT_COL_lancado |
| PAGE_FOOTER | each page | 0.000,43.352,108.000,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,49.966,108.000,19.380 | COUNTERSTATIC, COUNTER, PoweredWx, STC_Total_material |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R19-03 / U-R19-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R19-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R19-01 | 31.697,6.615,44.606,9.789 | U-R19-01 | U-R19-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 76.280,0.000,31.720,6.760 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_informacao | START_OF_DOCUMENT | Caption | U-R19-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R19-01 | 2.910,20.108,102.767,7.938 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_COL_cod_art | PAGE_HEADER | Caption | "Artigo" | image | 0.000,0.000,18.365,6.085 | U-R19-01 | U-R19-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_desc_artigo | PAGE_HEADER | Caption | "Descrição" | image | 18.256,0.000,42.069,6.085 | U-R19-01 | U-R19-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_quant | PAGE_HEADER | Caption | "Quantidade" | image | 60.325,0.000,18.100,6.085 | U-R19-01 | U-R19-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_preco | PAGE_HEADER | Caption | "Preço" | image | 78.425,0.000,15.983,6.085 | U-R19-01 | U-R19-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_COL_lancado | PAGE_HEADER | Caption | "Lançado" | image | 94.408,0.000,13.602,6.085 | U-R19-01 | U-R19-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_cod_art | BODY | Caption | bound `COL_cod_art` | dossier | 0.000,0.000,18.365,6.350 | U-R19-01 | U-R19-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_desc_artigo | BODY | Caption | bound `COL_desc_artigo` | dossier | 18.256,0.000,42.069,6.350 | U-R19-01 | U-R19-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_quant | BODY | Caption | bound `COL_quant` | dossier | 60.325,0.000,18.100,6.350 | U-R19-01 | U-R19-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_COL_preco | BODY | Caption | bound `COL_lancado` | dossier | 78.425,0.000,15.983,6.350 | U-R19-01 | U-R19-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| INT_COL_lancado | BODY | None | U-R19-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R19-01 | 94.408,0.000,13.602,6.350 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 63.873,0.000,44.127,6.615 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC | END_OF_DOCUMENT | Caption | U-R19-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R19-01 | 0.000,12.965,31.594,6.085 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 31.594,12.965,16.338,6.088 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| PoweredWx | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 67.098,12.821,40.902,5.555 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Total_material | END_OF_DOCUMENT | Caption | U-R19-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R19-01 | 2.220,2.910,103.560,8.202 | U-R19-01 | U-R19-01 | no border row text; U-R19-01 | Table=False, Visible=True, Divisible=True, Auto.Resiz=True |

Image inspected: `docs/evidence/images/RPT_Materiais.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R19-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R19-02: automatic scope; manual source below | U-R19-01 | RULE-R19-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R19-02: automatic scope; manual source below | U-R19-01 | RULE-R19-012 |
| COUNTER | Calculation | Counter Numeric; item none | U-R19-02: automatic scope; manual source below | U-R19-01 | RULE-R19-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde:381-404`, event `327680` on `report/local procedure`. Load repair order, then vehicle and reception customer through concatenated SQL and first-record reads; set information lines conditionally; release each temporary declaration; copy caller-provided material total text without recalculating it.

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

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R19-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R19-02 / U-R19-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R19-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R19-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R19-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R19-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R19-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R19-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Materiais.md and separate RULE rows. U-R19-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
