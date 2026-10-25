# Report spec — RPT_Tempos_Ordem_Reparacao_Mecanico

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde`, `dossier: RPT_Tempos_Ordem_Reparacao_Mecanico`, `docs/mapping/RPT_Tempos_Ordem_Reparacao_Mecanico.md`, image `docs/evidence/images/RPT_Tempos_Ordem_Reparacao_Mecanico.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:266`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R25-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 175.919 / 175.919 | Visible geometry exceeds nominal printable width; orientation/scale/clipping behavior remains U-R25-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Query**. Named source: `QRY_tempos_ordem_reparacao_mecanico`.

`dossier: QRY_tempos_ordem_reparacao_mecanico/sql`. Verbatim extracted SQL below; No SQL has been executed by this mapping.

```sql
SELECT
ordem_reparacao.numero AS numero,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.recepcao_datahora AS recepcao_datahora,
Viaturas.matricula AS matricula_Vi,
Viaturas.marca AS marca,
Viaturas.modelo AS modelo,
tempos_reparacao.numero AS numero_te,
tempos_reparacao.mecanico AS mecanico,
tempos_reparacao.inicio AS inicio,
tempos_reparacao.fim AS fim,
mecanicos.Codigo AS Codigo,
mecanicos.Descricao AS Descricao
FROM
Viaturas,
tempos_reparacao,
mecanicos,
ordem_reparacao
WHERE
ordem_reparacao.numero = tempos_reparacao.numero
AND ordem_reparacao.matricula = Viaturas.matricula
AND tempos_reparacao.mecanico = mecanicos.Codigo
AND
(
mecanicos.Codigo BETWEEN {ParamDoMecanico} AND {ParamAoMecanico}
AND tempos_reparacao.inicio BETWEEN {ParamDaData} AND {ParamAData}
)
ORDER BY
mecanico ASC,
recepcao_datahora ASC
```

Parameter names listed by the parser: ParamAData, ParamDaData. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R25-03.

The target preserves source mechanic key ASC then reception DateTime ASC using ADR002 comparison keys before the existing subtotal events. Compact14/17 and spaced23 values retain their exact raw output; group-key/designer/runtime U items are unchanged.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R25-03.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | CONTROL58, STC_Empresa, DOCTITLE |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.090 | STC_Inicio, STC_Fim, STC_Matricula, STC_Marca, STC_Modelo, STC_Recepcao_datahora, STC_Núm, STC_NoName3 |
| BREAK_HEADER1 | per encoded group key U-R25-03 | 0.000,26.090,175.900,7.000 | STC_NoName |
| BREAK_HEADER2 | per encoded group key U-R25-03 | 0.000,33.090,175.900,0.001 |  |
| BODY | per source record (visibility U-R25-03) | 0.000,33.091,175.900,7.523 | ITEM_Inicio, ITEM_Fim, ITEM_Numero, ITEM_Matricula, ITEM_Marca, ITEM_Modelo, ITEM_Recepcao_datahora, ITEM_tempo |
| BREAK_FOOTER2 | per encoded group key U-R25-03 | 0.000,40.614,175.900,10.000 | STC_total_horas, DATA, STC_NoName2 |
| BREAK_FOOTER1 | per encoded group key U-R25-03 | 0.000,50.614,175.900,9.999 | STC_NoName1, STC_total_horas1 |
| PAGE_FOOTER | each page | 0.000,60.613,175.900,6.615 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,67.228,175.900,12.909 | PoweredWx, COUNTERSTATIC, COUNTER |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R25-03 / U-R25-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.723 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R25-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R25-01 | 32.201,6.760,111.498,9.790 | U-R25-01 | U-R25-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Inicio | PAGE_HEADER | Caption | "Data/hora inicio" | image | 21.275,0.005,31.329,6.085 | U-R25-01 | U-R25-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Fim | PAGE_HEADER | Caption | "Data/hora fim" | image | 52.604,0.005,31.221,6.085 | U-R25-01 | U-R25-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Matricula | PAGE_HEADER | Caption | "Matricula" | image | 96.369,0.005,20.482,6.085 | U-R25-01 | U-R25-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Marca | PAGE_HEADER | Caption | "Marca" | image | 116.851,0.005,23.661,6.085 | U-R25-01 | U-R25-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Modelo | PAGE_HEADER | Caption | "Modelo" | image | 140.512,0.005,21.805,6.085 | U-R25-01 | U-R25-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Recepcao_datahora | PAGE_HEADER | Caption | "Data" | image | 0.000,0.005,21.275,6.085 | U-R25-01 | U-R25-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Núm | PAGE_HEADER | None | "Núm" | image | 83.825,0.005,12.544,6.085 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName3 | PAGE_HEADER | Caption | "Tempo" | image | 162.317,0.005,13.602,6.085 | U-R25-01 | U-R25-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName | BREAK_HEADER1 | Caption | U-R25-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R25-01 | 0.000,0.000,32.015,7.000 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Inicio | BODY | Caption | bound `inicio` | dossier | 21.275,0.000,31.000,7.408 | U-R25-01 | U-R25-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Fim | BODY | Caption | bound `fim` | dossier | 52.604,0.000,31.221,7.408 | U-R25-01 | U-R25-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Numero | BODY | Caption | bound `numero` | dossier | 83.825,0.000,12.544,7.408 | U-R25-01 | U-R25-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Matricula | BODY | Caption | bound `matricula` | dossier | 96.369,0.000,20.482,7.408 | U-R25-01 | U-R25-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Marca | BODY | Caption | bound `marca` | dossier | 116.851,0.000,23.661,7.408 | U-R25-01 | U-R25-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Modelo | BODY | Caption | bound `modelo` | dossier | 140.512,0.000,21.805,7.408 | U-R25-01 | U-R25-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Recepcao_datahora | BODY | Caption | bound `recepcao_datahora` | dossier | 0.000,0.000,21.275,7.408 | U-R25-01 | U-R25-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_tempo | BODY | Caption | U-R25-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R25-01 | 162.317,0.000,13.602,7.408 | U-R25-01 | U-R25-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_total_horas | BREAK_FOOTER2 | Caption | U-R25-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R25-01 | 155.000,0.000,20.700,6.879 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| DATA | BREAK_FOOTER2 | Preset | preset `Date` | dossier | 130.283,0.000,24.498,7.144 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName2 | BREAK_FOOTER2 | Caption | U-R25-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R25-01 | 110.949,0.000,22.334,7.144 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName1 | BREAK_FOOTER1 | Caption | U-R25-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R25-01 | 140.602,0.000,14.444,6.879 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_total_horas1 | BREAK_FOOTER1 | Caption | U-R25-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R25-01 | 155.200,0.000,20.700,6.879 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| PoweredWx | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,5.821,40.902,5.556 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC | END_OF_DOCUMENT | Caption | U-R25-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R25-01 | 0.000,5.821,30.271,6.085 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,5.821,16.338,6.088 | U-R25-01 | U-R25-01 | no border row text; U-R25-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |

Image inspected: `docs/evidence/images/RPT_Tempos_Ordem_Reparacao_Mecanico.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R25-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R25-02: automatic scope; manual source below | U-R25-01 | RULE-R25-012 |
| DATA | Preset | Date; item none | U-R25-02: automatic scope; manual source below | U-R25-01 | RULE-R25-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R25-02: automatic scope; manual source below | U-R25-01 | RULE-R25-012 |
| COUNTER | Calculation | Counter Numeric; item none | U-R25-02: automatic scope; manual source below | U-R25-01 | RULE-R25-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:252-252`, event `327692` on `BREAK_HEADER1`. Assign the named captions from the current query buffer exactly as shown, preserving spaces and event order.

```wlanguage
STC_NoName=QRY_tempos_ordem_reparacao_mecanico.Descricao
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:397-403`, event `327692` on `BODY/ITEM_tempo`. Read row start/end as DateTime; an end equal to the 17-zero sentinel prints 00:00; otherwise call the custom duration formatter.

```wlanguage
dtini is datetime = ITEM_Inicio
dtfim is datetime = ITEM_Fim                   
IF dtfim="00000000000000000" THEN
	MySelf="00:00"
ELSE
	MySelf=Intervalo_datas_para_horas(dtini,dtfim)
END
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:429-431`, event `327693` on `BODY`. After each body prints, add its formatted row duration into the running string total and update the indicated subtotal caption.

```wlanguage
data=QRY_tempos_ordem_reparacao_mecanico.recepcao_datahora
gsTotal_horas=soma_horas(gsTotal_horas,ITEM_tempo)
STC_total_horas=gsTotal_horas
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:503-505`, event `327693` on `BREAK_FOOTER2`. After the inner footer prints, reset the row subtotal string to numeric zero, then accumulate the already displayed subtotal caption into the outer total; preserve this order.

```wlanguage
gsTotal_horas=0
gsTotal_total_horas=soma_horas(gsTotal_total_horas,STC_total_horas)
STC_total_horas1=gsTotal_total_horas
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:563-564`, event `327693` on `BREAK_FOOTER1`. After the outer footer prints, reset subtotal/grand-total string accumulators as shown; numeric zero is assigned to strings.

```wlanguage
gsTotal_horas=0
gsTotal_total_horas=0
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:671-673`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
gsTotal_horas is string
gsTotal_total_horas is string
STC_Empresa=gsNome_empresa_reports
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:693-710`, event `458752` on `report/local procedure`. Subtract start from end; take fractional hours; round the fractional part upward using the literal multipliers; format whole hours and minutes as two-digit integers separated by a colon.

```wlanguage
PROCEDURE Intervalo_datas_para_horas(StartDate is datetime,EndDate is datetime)
MyDuration is Duration = EndDate - StartDate
nParteDecimal is numeric = DecimalPart(MyDuration..InHours)
nMinutos is numeric  = RoundUp((nParteDecimal * 59.99999999999)/0.99999999999999,0)
RESULT NumToString(IntegerPart(MyDuration..InHours),"02d")+":"+NumToString(nMinutos,"02d")
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:717-744`, event `458752` on `report/local procedure`. Parse hours before the colon and two minutes after it using 1-based string positions; add minutes, carry exactly one hour when minutes >=60, add hours and format HH:MM. Parameters are by-reference by default; no explicit LOCAL is present.

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

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R25-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R25-02 / U-R25-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R25-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R25-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R25-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R25-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R25-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R25-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R25-04: Duration edge cases: characterize empty and numeric-zero string totals, missing colon, negative intervals, sub-minute rounding, 60-minute carry, >99-hour formatting and by-reference side effects in WINDEV. Blocks exact duration parity; interim default: literal algorithm only, no normalization.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Tempos_Ordem_Reparacao_Mecanico.md and separate RULE rows. U-R25-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
