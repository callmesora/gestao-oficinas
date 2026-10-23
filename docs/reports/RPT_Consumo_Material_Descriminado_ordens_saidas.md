# Report spec — RPT_Consumo_Material_Descriminado_ordens_saidas

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Descriminado_ordens_saidas.wde`, `dossier: RPT_Consumo_Material_Descriminado_ordens_saidas`, `docs/mapping/RPT_Consumo_Material_Descriminado_ordens_saidas.md`. Image absent: U-R03-05.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R03-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 176.004 / 176.004 | Visible geometry exceeds nominal printable width; orientation/scale/clipping behavior remains U-R03-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Query**. Named source: `QRY_Union_lin_stocks_material_reparacao`.

`dossier: QRY_Union_lin_stocks_material_reparacao/sql`. Verbatim extracted SQL below; U-R03-06: typography/encoding is evidence, not executable SQL.

```sql
SELECT
lin_stocks.documento_numero AS documento_numero,
cab_stocks.data AS data,
lin_stocks.artigo AS artigo,
lin_stocks.quantidade AS quantidade,
artigos.Codigo AS Codigo_artigo,
artigos.Descricao AS Descricao,
artigos.codbarras AS codbarras,
artigos.unidade AS unidade,
artigos.preco AS preco,
artigos.inativo AS inativo,
documentos.Descricao AS descricao_doc,
 ’’ AS matricula,
mecanicos.Descricao AS Descricao_me
FROM
(
(
cab_stocks
INNER JOIN
(
lin_stocks
INNER JOIN
documentos
ON lin_stocks.documento_codigo = documentos.Codigo
)
ON cab_stocks.documento_numero = lin_stocks.documento_numero
)
INNER JOIN
artigos
ON lin_stocks.artigo = artigos.Codigo
)
LEFT OUTER JOIN
mecanicos
ON cab_stocks.mecanico = mecanicos.Codigo
WHERE
(
documentos.stock = 2
AND lin_stocks.artigo BETWEEN {ParamDoArtigo} AND {ParamAoArtigo}
AND cab_stocks.data BETWEEN {ParamDaData} AND {ParamAData}
AND lin_stocks.descricao_artigo LIKE %{ParamDescricao}%
)
UNION ALL
SELECT
material_reparacao.numero AS documento_numero,
material_reparacao.data_hora AS data,
material_reparacao.artigo AS artigo,
material_reparacao.quantidade AS quantidade,
artigos.Codigo AS Codigo_artigo,
artigos.Descricao AS Descricao,
artigos.codbarras AS codbarras,
artigos.unidade AS unidade,
artigos.preco AS preco,
artigos.inativo AS inativo,
’Ordem de reparaçªo’ AS descricao_doc,
ordem_reparacao.matricula AS matricula,
mecanicos.Descricao AS Descricao_me
FROM
mecanicos,
material_reparacao,
artigos,
ordem_reparacao
WHERE
material_reparacao.artigo = artigos.Codigo
AND ordem_reparacao.numero = material_reparacao.numero
AND ordem_reparacao.reparacao_mecanico = mecanicos.Codigo
AND
(
material_reparacao.artigo BETWEEN {ParamDoArtigo} AND {ParamAoArtigo}
AND material_reparacao.data_hora BETWEEN {ParamDaData} AND {ParamAData}
)
ORDER BY
artigo ASC,
data ASC
```

Parameter names listed by the parser: ParamAData, ParamAoArtigo, ParamDaData, ParamDescricao, ParamDoArtigo. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R03-03.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R03-03.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | DOCTITLE, STC_Empresa, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.090 | STC_DATA, STC_Matricula, STC_Descricao_doc, STC_Documento_numero, STC_Descricao_me, STC_Qnt |
| BODY | per source record (visibility U-R03-03) | 0.000,26.090,175.900,16.000 | ITEM_DATA, ITEM_Matricula, ITEM_Descricao_doc, ITEM_Documento_numero, ITEM_Descricao_me, ITEM_Quantidade, ITEM_Descricao1, STC_Artigo1, ITEM_Descricao2 |
| PAGE_FOOTER | each page | 0.000,42.090,175.900,6.615 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,48.705,175.900,15.347 | COUNTERSTATIC1, COUNTER1, PoweredWx1, STC_NoName2, STC_total |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R03-03 / U-R03-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 19.369,6.615,137.163,9.789 | U-R03-01 | U-R03-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R03-01 | U-R03-01 | no border row text; U-R03-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R03-01 | U-R03-01 | no border row text; U-R03-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_DATA | PAGE_HEADER | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 0.000,0.000,33.975,6.085 | U-R03-01 | U-R03-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Matricula | PAGE_HEADER | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 33.975,0.000,28.310,6.085 | U-R03-01 | U-R03-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Descricao_doc | PAGE_HEADER | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 62.177,0.000,44.029,6.085 | U-R03-01 | U-R03-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Documento_numero | PAGE_HEADER | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 106.206,0.000,12.696,6.085 | U-R03-01 | U-R03-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Descricao_me | PAGE_HEADER | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 118.902,0.000,39.531,6.085 | U-R03-01 | U-R03-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Qnt | PAGE_HEADER | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 158.433,0.000,17.571,6.085 | U-R03-01 | U-R03-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_DATA | BODY | Caption | bound `DATA` | dossier | 0.000,0.000,33.975,6.200 | U-R03-01 | U-R03-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Matricula | BODY | Caption | bound `matricula` | dossier | 33.975,0.000,28.310,6.200 | U-R03-01 | U-R03-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao_doc | BODY | Caption | bound `descricao_doc` | dossier | 62.177,0.000,44.029,6.200 | U-R03-01 | U-R03-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Documento_numero | BODY | Caption | bound `documento_numero` | dossier | 106.206,0.000,12.696,6.200 | U-R03-01 | U-R03-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao_me | BODY | Caption | bound `Descricao_me` | dossier | 118.902,0.000,39.531,6.200 | U-R03-01 | U-R03-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Quantidade | BODY | Caption | bound `quantidade` | dossier | 158.433,0.000,17.571,6.200 | U-R03-01 | U-R03-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao1 | BODY | Caption | bound `Codigo_artigo` | dossier | 33.900,6.400,50.908,6.200 | U-R03-01 | U-R03-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Artigo1 | BODY | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 0.000,6.220,33.975,6.200 | U-R03-01 | U-R03-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao2 | BODY | Caption | bound `Descricao` | dossier | 84.700,6.400,91.125,6.350 | U-R03-01 | U-R03-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R03-01 | U-R03-01 | no border row text; U-R03-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC1 | END_OF_DOCUMENT | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 0.000,9.262,30.271,6.085 | U-R03-01 | U-R03-01 | no border row text; U-R03-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER1 | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,9.259,16.338,6.088 | U-R03-01 | U-R03-01 | no border row text; U-R03-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| PoweredWx1 | END_OF_DOCUMENT | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 134.998,9.791,40.902,5.556 | U-R03-01 | U-R03-01 | no border row text; U-R03-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_NoName2 | END_OF_DOCUMENT | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 151.173,0.000,11.750,6.879 | U-R03-01 | U-R03-01 | no border row text; U-R03-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_total | END_OF_DOCUMENT | Caption | U-R03-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R03-01 | 155.200,0.000,20.700,6.879 | U-R03-01 | U-R03-01 | no border row text; U-R03-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R03-02: automatic scope; manual source below | U-R03-01 | RULE-R03-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R03-02: automatic scope; manual source below | U-R03-01 | RULE-R03-012 |
| COUNTER1 | Calculation | Counter Numeric; item none | U-R03-02: automatic scope; manual source below | U-R03-01 | RULE-R03-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Descriminado_ordens_saidas.wde:328-329`, event `327693` on `BODY`. After each body prints, add its quantity to the numeric accumulator and set the total caption; preserve event timing.

```wlanguage
gxSoma=gxSoma+ITEM_Quantidade
STC_total=gxSoma
```

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Descriminado_ordens_saidas.wde:465-465`, event `327693` on `END_OF_DOCUMENT`. After this document/group footer prints, reset the indicated accumulator to numeric zero.

```wlanguage
gxsoma=0
```

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Descriminado_ordens_saidas.wde:476-477`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
gxSoma is numeric
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R03-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R03-02 / U-R03-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R03-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R03-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R03-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R03-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R03-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R03-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R03-05: The dossier contains no report image. Capture the full report designer/PDF for captions and style. Blocks visual parity; interim default: source geometry and dossier bindings only.
- U-R03-06: Dossier SQL has typographic quotation/encoding artifacts. Obtain original query SQL before execution; copied SQL is evidence text, not executable replacement. Blocks SQL translation; interim default: none; must be answered.
