# Report spec — RPT_Consumo_Material_Resumo_ordem_saidas

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Resumo_ordem_saidas.wde`, `dossier: RPT_Consumo_Material_Resumo_ordem_saidas`, `docs/mapping/RPT_Consumo_Material_Resumo_ordem_saidas.md`, image `docs/evidence/images/RPT_Consumo_Material_Resumo_ordem_saidas.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R05-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 175.900 / 175.900 | Visible geometry fits nominal printable width; orientation/scale/clipping behavior remains U-R05-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Query**. Named source: `QRY_Union_lin_stocks_material_reparacao`.

`dossier: QRY_Union_lin_stocks_material_reparacao/sql`. Verbatim extracted SQL below; U-R05-06: typography/encoding is evidence, not executable SQL.

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

Parameter names listed by the parser: ParamAData, ParamAoArtigo, ParamDaData, ParamDescricao, ParamDoArtigo. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R05-03.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R05-03.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | CONTROL58, DOCTITLE, STC_Empresa |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.085 | STC_Codigo_artigo, STC_Descricao, STC_Unidade, STC_Quantidade |
| BREAK_HEADER1 | per encoded group key U-R05-03 | 0.000,26.085,175.900,10.000 |  |
| BODY | per source record (visibility U-R05-03) | 0.000,36.085,175.900,6.200 | ITEM_Codigo_artigo, ITEM_Descricao, ITEM_Unidade, ITEM_Quantidade |
| BREAK_FOOTER1 | per encoded group key U-R05-03 | 0.000,42.285,175.900,6.200 | ITEM_Codigo_artigo1, ITEM_Descricao1, ITEM_Unidade1, ITEM_Soma |
| PAGE_FOOTER | each page | 0.000,48.485,175.900,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,55.099,175.900,12.909 | PoweredWx, COUNTERSTATIC, COUNTER |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R05-03 / U-R05-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R05-01 | U-R05-01 | no border row text; U-R05-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R05-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R05-01 | 19.501,6.760,136.898,9.789 | U-R05-01 | U-R05-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R05-01 | U-R05-01 | no border row text; U-R05-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Codigo_artigo | PAGE_HEADER | Caption | "Código" | image | 0.000,0.000,57.600,6.085 | U-R05-01 | U-R05-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Descricao | PAGE_HEADER | Caption | "Descrição" | image | 57.600,0.000,77.975,6.085 | U-R05-01 | U-R05-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Unidade | PAGE_HEADER | Caption | U-R05-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R05-01 | 135.575,0.000,21.852,6.085 | U-R05-01 | U-R05-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Quantidade | PAGE_HEADER | Caption | "quantidade" | image | 157.427,0.000,18.460,6.085 | U-R05-01 | U-R05-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Codigo_artigo | BODY | Caption | bound `Codigo_artigo` | dossier | 0.000,0.000,57.600,6.200 | U-R05-01 | U-R05-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao | BODY | Caption | bound `Descricao` | dossier | 57.600,0.000,77.975,6.200 | U-R05-01 | U-R05-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Unidade | BODY | Caption | bound `unidade` | dossier | 135.575,0.000,21.852,6.200 | U-R05-01 | U-R05-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Quantidade | BODY | Caption | bound `quantidade` | dossier | 157.427,0.000,18.460,6.200 | U-R05-01 | U-R05-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Codigo_artigo1 | BREAK_FOOTER1 | Caption | bound `Codigo_artigo` | dossier | 0.000,0.000,57.600,6.200 | U-R05-01 | U-R05-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao1 | BREAK_FOOTER1 | Caption | bound `Descricao` | dossier | 57.600,0.000,77.975,6.200 | U-R05-01 | U-R05-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Unidade1 | BREAK_FOOTER1 | Caption | bound `unidade` | dossier | 135.575,0.000,21.852,6.200 | U-R05-01 | U-R05-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Soma | BREAK_FOOTER1 | Caption | U-R05-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R05-01 | 157.440,0.000,18.460,6.200 | U-R05-01 | U-R05-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R05-01 | U-R05-01 | no border row text; U-R05-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| PoweredWx | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,5.821,40.902,5.556 | U-R05-01 | U-R05-01 | no border row text; U-R05-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC | END_OF_DOCUMENT | Caption | U-R05-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R05-01 | 0.000,5.821,30.271,6.085 | U-R05-01 | U-R05-01 | no border row text; U-R05-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER | END_OF_DOCUMENT | Calculation | calculation `Programmatically Numeric` | dossier | 30.271,5.821,16.338,6.088 | U-R05-01 | U-R05-01 | no border row text; U-R05-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |

Image inspected: `docs/evidence/images/RPT_Consumo_Material_Resumo_ordem_saidas.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R05-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R05-02: automatic scope; manual source below | U-R05-01 | RULE-R05-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R05-02: automatic scope; manual source below | U-R05-01 | RULE-R05-012 |
| COUNTER | Calculation | Programmatically Numeric; item none | U-R05-02: automatic scope; manual source below | U-R05-01 | RULE-R05-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Resumo_ordem_saidas.wde:240-241`, event `327693` on `BODY`. After each body prints, add its quantity and update ITEM_Soma; no rounding call is present.

```wlanguage
soma=Soma+ITEM_Quantidade
ITEM_Soma=soma
```

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Resumo_ordem_saidas.wde:325-326`, event `327693` on `BREAK_FOOTER1`. After the group footer prints, reset quantity sum to zero and manually increment the programmatic counter.

```wlanguage
soma=0
COUNTER=COUNTER+1
```

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Resumo_ordem_saidas.wde:433-434`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
soma is numeric
STC_Empresa=gsNome_empresa_reports
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R05-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R05-02 / U-R05-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R05-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R05-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R05-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R05-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R05-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R05-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R05-06: Dossier SQL has typographic quotation/encoding artifacts. Obtain original query SQL before execution; copied SQL is evidence text, not executable replacement. Blocks SQL translation; interim default: none; must be answered.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Consumo_Material_Resumo_ordem_saidas.md and separate RULE rows. U-R05-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
