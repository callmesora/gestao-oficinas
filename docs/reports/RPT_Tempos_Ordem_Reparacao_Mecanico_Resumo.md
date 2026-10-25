# Report spec — RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde`, `dossier: RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo`, `docs/mapping/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.md`, image `docs/evidence/images/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:266`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R26-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 175.900 / 281.072 | Visible geometry fits nominal printable width; orientation/scale/clipping behavior remains U-R26-01 |

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

Parameter names listed by the parser: ParamAData, ParamDaData. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R26-03.

The target preserves source mechanic key ASC then reception DateTime ASC using ADR002 comparison keys before the existing subtotal events. Compact14/17 and spaced23 values retain their exact raw output; no hidden summary body or new aggregation is inferred.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R26-03.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | CONTROL58, STC_Empresa, DOCTITLE |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.090 | STC_Recepcao_datahora, STC_Inicio, STC_Fim, STC_NoName |
| BREAK_HEADER1 | per encoded group key U-R26-03 | 0.000,26.090,175.900,7.000 | STC_mecanico |
| BODY | per source record (visibility U-R26-03) | 0.000,33.090,175.900,6.200 | ITEM_Recepcao_datahora, ITEM_Inicio, ITEM_Fim, ITEM_tempo |
| BREAK_FOOTER1 | per encoded group key U-R26-03 | 0.000,39.290,175.900,10.000 | STC_NoName2, STC_total_horas1 |
| PAGE_FOOTER | each page | 0.000,49.290,175.900,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,55.904,175.900,12.909 | PoweredWx, COUNTERSTATIC, COUNTER |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R26-03 / U-R26-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.723 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 31.143,6.760,113.615,9.789 | U-R26-01 | U-R26-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Recepcao_datahora | PAGE_HEADER | Caption | "Data/Hora recepção" | image | 0.000,0.005,70.620,6.085 | U-R26-01 | U-R26-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Inicio | PAGE_HEADER | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 175.792,0.005,55.640,6.085 | U-R26-01 | U-R26-01 | 0.10 Solid TBL- | Table=False, Visible=False, Divisible=False, Auto.Resiz=False |
| STC_Fim | PAGE_HEADER | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 231.432,0.005,49.640,6.085 | U-R26-01 | U-R26-01 | 0.10 Solid TBL- | Table=False, Visible=False, Divisible=False, Auto.Resiz=False |
| STC_NoName | PAGE_HEADER | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 70.644,0.005,105.148,6.085 | U-R26-01 | U-R26-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_mecanico | BREAK_HEADER1 | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 0.000,0.000,32.015,7.000 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Recepcao_datahora | BODY | Caption | bound `recepcao_datahora` | dossier | 0.000,0.000,70.620,6.200 | U-R26-01 | U-R26-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Inicio | BODY | Caption | bound `inicio` | dossier | 175.792,0.000,55.640,6.200 | U-R26-01 | U-R26-01 | 0.10 Solid -BL- | Table=False, Visible=False, Divisible=False, Auto.Resiz=False |
| ITEM_Fim | BODY | Caption | bound `fim` | dossier | 231.432,0.000,49.640,6.200 | U-R26-01 | U-R26-01 | 0.10 Solid -BLR | Table=False, Visible=False, Divisible=False, Auto.Resiz=False |
| ITEM_tempo | BODY | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 70.644,0.000,105.148,6.200 | U-R26-01 | U-R26-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName2 | BREAK_FOOTER1 | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 144.679,0.000,14.444,6.879 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_total_horas1 | BREAK_FOOTER1 | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 159.123,0.000,16.560,6.879 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| PoweredWx | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,5.821,40.902,5.556 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC | END_OF_DOCUMENT | Caption | U-R26-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R26-01 | 0.000,5.821,30.271,6.085 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,5.821,16.338,6.088 | U-R26-01 | U-R26-01 | no border row text; U-R26-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |

Image inspected: `docs/evidence/images/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R26-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R26-02: automatic scope; manual source below | U-R26-01 | RULE-R26-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R26-02: automatic scope; manual source below | U-R26-01 | RULE-R26-012 |
| COUNTER | Calculation | Counter Numeric; item none | U-R26-02: automatic scope; manual source below | U-R26-01 | RULE-R26-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:188-188`, event `327692` on `BREAK_HEADER1`. Assign the named captions from the current query buffer exactly as shown, preserving spaces and event order.

```wlanguage
STC_mecanico=QRY_tempos_ordem_reparacao_mecanico.Descricao
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:263-269`, event `327692` on `BODY/ITEM_tempo`. Read row start/end as DateTime; an end equal to the 17-zero sentinel prints 00:00; otherwise call the custom duration formatter.

```wlanguage
dtini is datetime = ITEM_Inicio
dtfim is datetime = ITEM_Fim
IF dtfim="00000000000000000" THEN
	MySelf="00:00"
ELSE
	MySelf=Intervalo_datas_para_horas(dtini,dtfim)
END
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:287-288`, event `327693` on `BODY`. After each body prints, add its formatted row duration into the running string total and update the indicated subtotal caption.

```wlanguage
gsTotal_horas=soma_horas(gsTotal_horas,ITEM_tempo)
STC_total_horas1=gsTotal_horas
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:338-338`, event `327693` on `BREAK_FOOTER1`. After this document/group footer prints, reset the indicated accumulator to numeric zero.

```wlanguage
gsTotal_horas=0
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:445-446`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
gsTotal_horas is string
STC_Empresa=gsNome_empresa_reports
```

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:466-493`, event `458752` on `report/local procedure`. Parse hours before the colon and two minutes after it using 1-based string positions; add minutes, carry exactly one hour when minutes >=60, add hours and format HH:MM. Parameters are by-reference by default; no explicit LOCAL is present.

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

`legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:500-517`, event `458752` on `report/local procedure`. Subtract start from end; take fractional hours; round the fractional part upward using the literal multipliers; format whole hours and minutes as two-digit integers separated by a colon.

```wlanguage
PROCEDURE Intervalo_datas_para_horas(StartDate is datetime,EndDate is datetime)
MyDuration is Duration = EndDate - StartDate
nParteDecimal is numeric = DecimalPart(MyDuration..InHours)
nMinutos is numeric  = RoundUp((nParteDecimal * 59.99999999999)/0.99999999999999,0)
RESULT NumToString(IntegerPart(MyDuration..InHours),"02d")+":"+NumToString(nMinutos,"02d")
```

Literal string-sum follow-through (ADR-002/005/006): `laborSumHours` reads the full hour prefix and exactly two minute characters from both operands at each addition, including the previously rendered accumulator. It preserves one positive minute carry without normalizing negative minutes. Under the existing literal row-rounding default, a negative half-hour displays `00:-29`; five such rows produce `00:-10`, and a sixth re-reads `-1` from that accumulator and produces `00:-3`. The BODY assignment supplies `STC_total_horas1` directly; BREAK_FOOTER1 resets the accumulator without another sum call. `apps/server/src/reports/labor-events.test.ts` runs actual PostgreSQL and offline PDFs twice per family, checking signed totals, separate groups, zero17, full 100-hour prefixes and unchanged raw dates. Native negative/coercion/overflow, by-reference and designer/group acceptance remain U-R26-02/03/04; these tests do not close them.

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R26-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R26-02 / U-R26-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R26-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R26-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R26-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R26-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R26-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R26-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R26-04: Duration edge cases: characterize empty and numeric-zero string totals, missing colon, negative intervals, sub-minute rounding, 60-minute carry, >99-hour formatting and by-reference side effects in WINDEV. Blocks exact duration parity; interim default: literal algorithm only, no normalization.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.md and separate RULE rows. U-R26-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
