# Report spec — RPT_Extrato_artigos

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde`, `dossier: RPT_Extrato_artigos`, `docs/mapping/RPT_Extrato_artigos.md`, image `docs/evidence/images/RPT_Extrato_artigos.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:412`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R09-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 176.117 / 209.716 | Visible geometry exceeds nominal printable width; orientation/scale/clipping behavior remains U-R09-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Query**. Named source: `QRY_union_extrato_artigos`.

`dossier: QRY_union_extrato_artigos/sql`. Verbatim extracted SQL below; U-R09-06: typography/encoding is evidence, not executable SQL.

```sql
SELECT
lin_stocks.documento_numero AS numero,
lin_stocks.artigo AS artigo,
lin_stocks.descricao_artigo AS descricao_artigo,
lin_stocks.quantidade AS quantidade,
documentos.Descricao AS Descricao,
cab_stocks.data AS data,
documentos.stock AS stock
FROM
documentos,
cab_stocks,
lin_stocks
WHERE
cab_stocks.documento_numero = lin_stocks.documento_numero
AND cab_stocks.documento_codigo = lin_stocks.documento_codigo
AND documentos.Codigo = cab_stocks.documento_codigo
AND
(
cab_stocks.data BETWEEN {ParamDaData} AND {ParamAData}
AND lin_stocks.artigo BETWEEN {ParamDoArtigo} AND {ParamAoArtigo}
)
UNION ALL
SELECT
material_reparacao.numero AS numero,
material_reparacao.artigo AS artigo,
material_reparacao.descricao_artigo AS descricao_artigo,
material_reparacao.quantidade AS quantidade,
 ’Ordem de reparaçªo’ AS Descricao,
ordem_reparacao.recepcao_datahora AS data,
 2 AS stock
FROM
ordem_reparacao,
material_reparacao
WHERE
material_reparacao.numero = ordem_reparacao.numero
AND
(
ordem_reparacao.recepcao_datahora BETWEEN {ParamDaData} AND {ParamAData}
AND material_reparacao.artigo BETWEEN {ParamDoArtigo} AND {ParamAoArtigo}
)
ORDER BY
artigo ASC,
data ASC
```

Parameter names listed by the parser: none. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R09-03.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R09-03.

Opening balance also reads `dossier: QRY_union_extrato_artigos_calcular_total/sql`:

```sql
SELECT
lin_stocks.documento_numero AS numero,
lin_stocks.artigo AS artigo,
lin_stocks.descricao_artigo AS descricao_artigo,
lin_stocks.quantidade AS quantidade,
documentos.Descricao AS Descricao,
cab_stocks.data AS data,
documentos.stock AS stock
FROM
documentos,
cab_stocks,
lin_stocks
WHERE
cab_stocks.documento_numero = lin_stocks.documento_numero
AND cab_stocks.documento_codigo = lin_stocks.documento_codigo
AND documentos.Codigo = cab_stocks.documento_codigo
AND
(
cab_stocks.data BETWEEN {ParamDaData} AND {ParamAData}
AND lin_stocks.artigo BETWEEN {ParamDoArtigo} AND {ParamAoArtigo}
)
UNION ALL
SELECT
material_reparacao.numero AS numero,
material_reparacao.artigo AS artigo,
material_reparacao.descricao_artigo AS descricao_artigo,
material_reparacao.quantidade AS quantidade,
 ’Ordem de reparaçªo’ AS Descricao,
ordem_reparacao.recepcao_datahora AS data,
 2 AS stock
FROM
ordem_reparacao,
material_reparacao
WHERE
material_reparacao.numero = ordem_reparacao.numero
AND
(
ordem_reparacao.recepcao_datahora BETWEEN {ParamDaData} AND {ParamAData}
AND material_reparacao.artigo BETWEEN {ParamDoArtigo} AND {ParamAoArtigo}
)
ORDER BY
artigo ASC,
data ASC
```

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | DOCTITLE, STC_Empresa, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.090 | STC_Qnt, STC_Descricao, STC_DATA, STC_Stock, STC_NoName, STC_NoName1, STC_NoName2, STC_Numero |
| BREAK_HEADER1 | per encoded group key U-R09-03 | 0.000,26.090,175.900,7.000 | STC_artigo, STC_total_anterior |
| BODY | per source record (visibility U-R09-03) | 0.000,33.090,175.900,6.350 | ITEM_Quantidade, ITEM_Descricao, ITEM_DATA, ITEM_Stock, ITEM_entrada, ITEM_saida, ITEM_total, ITEM_Numero |
| BREAK_FOOTER1 | per encoded group key U-R09-03 | 0.000,39.440,175.900,12.000 | STC_total_final |
| PAGE_FOOTER | each page | 0.000,51.440,175.900,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,58.054,175.900,12.909 | COUNTERSTATIC, COUNTER, PoweredWx |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R09-03 / U-R09-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 54.427,6.615,67.046,9.789 | U-R09-01 | U-R09-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Qnt | PAGE_HEADER | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 176.117,0.000,24.979,6.085 | U-R09-01 | U-R09-01 | 0.10 Solid TBL- | Table=False, Visible=False, Divisible=False, Auto.Resiz=False |
| STC_Descricao | PAGE_HEADER | Caption | "Descrição" | image | 41.804,0.000,70.752,6.085 | U-R09-01 | U-R09-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_DATA | PAGE_HEADER | Caption | "Data" | image | 0.000,0.000,21.010,6.085 | U-R09-01 | U-R09-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Stock | PAGE_HEADER | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 201.096,0.000,8.620,6.085 | U-R09-01 | U-R09-01 | 0.10 Solid TBLR | Table=False, Visible=False, Divisible=False, Auto.Resiz=False |
| STC_NoName | PAGE_HEADER | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 112.556,0.000,20.481,6.085 | U-R09-01 | U-R09-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName1 | PAGE_HEADER | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 133.037,0.000,20.217,6.085 | U-R09-01 | U-R09-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName2 | PAGE_HEADER | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 153.254,0.000,22.863,6.085 | U-R09-01 | U-R09-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Numero | PAGE_HEADER | Caption | "Número" | image | 20.902,0.000,21.010,6.085 | U-R09-01 | U-R09-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_artigo | BREAK_HEADER1 | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 0.000,0.000,120.494,6.879 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_total_anterior | BREAK_HEADER1 | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 126.050,0.000,49.898,6.879 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Quantidade | BODY | Caption | bound `quantidade` | dossier | 176.117,0.000,24.979,6.350 | U-R09-01 | U-R09-01 | 0.10 Solid -BL- | Table=False, Visible=False, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao | BODY | Caption | bound `Descricao` | dossier | 41.804,0.000,70.752,6.350 | U-R09-01 | U-R09-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_DATA | BODY | Caption | bound `DATA` | dossier | 0.000,0.000,21.010,6.350 | U-R09-01 | U-R09-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Stock | BODY | Caption | bound `stock` | dossier | 201.096,0.000,8.620,6.350 | U-R09-01 | U-R09-01 | 0.10 Solid -BLR | Table=False, Visible=False, Divisible=False, Auto.Resiz=False |
| ITEM_entrada | BODY | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 112.556,0.000,20.481,6.350 | U-R09-01 | U-R09-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_saida | BODY | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 133.037,0.000,20.217,6.350 | U-R09-01 | U-R09-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_total | BODY | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 153.254,0.000,22.863,6.350 | U-R09-01 | U-R09-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Numero | BODY | Caption | bound `numero` | dossier | 20.902,0.000,21.010,6.350 | U-R09-01 | U-R09-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_total_final | BREAK_FOOTER1 | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 125.942,0.000,49.850,6.879 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC | END_OF_DOCUMENT | Caption | U-R09-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R09-01 | 0.000,6.005,30.271,6.085 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,6.005,16.338,6.088 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| PoweredWx | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,6.005,40.902,5.556 | U-R09-01 | U-R09-01 | no border row text; U-R09-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |

Image inspected: `docs/evidence/images/RPT_Extrato_artigos.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R09-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R09-02: automatic scope; manual source below | U-R09-01 | RULE-R09-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R09-02: automatic scope; manual source below | U-R09-01 | RULE-R09-012 |
| COUNTER | Calculation | Counter Numeric; item none | U-R09-02: automatic scope; manual source below | U-R09-01 | RULE-R09-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:263-278`, event `327692` on `BREAK_HEADER1`. Set article heading and calculate opening balance from 2000-01-01 through the supplied cutoff: stock=1 adds, stock=2 subtracts, other stock codes do nothing; set running balance and release the historical query.

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

`legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:419-429`, event `327692` on `BODY`. Before each printed movement, set entrance/exit text for stock=1/2 and increase/decrease the running balance; no branch resets cells for any other stock code.

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

`legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:473-473`, event `327692` on `BREAK_FOOTER1`. Set Total Final: followed by the current running balance before the group footer prints.

```wlanguage
STC_total_final="Total Final: "+ITEM_total
```

`legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:584-589`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
procedure RPT_Extrato_artigos(gData_limite)
gddata_limite is datetime
gddata_limite=gData_limite
gddata_antiga is datetime
gddata_antiga="20000101000000"
STC_Empresa=gsNome_empresa_reports
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R09-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R09-02 / U-R09-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R09-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R09-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R09-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R09-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R09-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R09-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R09-06: Dossier SQL has typographic quotation/encoding artifacts. Obtain original query SQL before execution; copied SQL is evidence text, not executable replacement. Blocks SQL translation; interim default: none; must be answered.
- U-R09-07: Opening-balance query ends at the same da_data passed as the main report range start and uses inclusive BETWEEN; establish boundary duplication and repeated-preview/reset behavior. Blocks opening-balance edge parity; interim default: preserve both inclusive bounds.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Extrato_artigos.md and separate RULE rows. U-R09-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
