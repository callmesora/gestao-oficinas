# Report spec — RPT_Consumo_Material_Descriminado_Ordens

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Descriminado_Ordens.wde`, `dossier: RPT_Consumo_Material_Descriminado_Ordens`, `docs/mapping/RPT_Consumo_Material_Descriminado_Ordens.md`, image `docs/evidence/images/RPT_Consumo_Material_Descriminado_Ordens.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R01-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 176.056 / 176.056 | Visible geometry exceeds nominal printable width; orientation/scale/clipping behavior remains U-R01-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Query**. Named source: `QRY_union_material_reparacao`.

`dossier: QRY_union_material_reparacao/sql`. Verbatim extracted SQL below; U-R01-06: typography/encoding is evidence, not executable SQL.

```sql
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

Parameter names listed by the parser: ParamAData, ParamAoArtigo, ParamDaData, ParamDoArtigo. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R01-03.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R01-03.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | DOCTITLE, STC_Empresa, CONTROL58 |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.090 | STC_DATA, STC_Viatura, STC_Descricao_doc, STC_Documento_numero, STC_Qnt, STC_Descricao_me |
| BODY | per source record (visibility U-R01-03) | 0.000,26.090,175.900,16.000 | ITEM_DATA, ITEM_Matricula, ITEM_Descricao_doc, ITEM_Documento_numero, ITEM_Descricao_me, ITEM_Quantidade, STC_Artigo1, ITEM_Descricao1, ITEM_Descricao2 |
| PAGE_FOOTER | each page | 0.000,42.090,175.900,6.615 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,48.705,175.900,15.347 | PoweredWx1, COUNTERSTATIC1, COUNTER1, STC_NoName2, STC_total |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R01-03 / U-R01-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R01-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R01-01 | 31.937,6.615,112.027,9.789 | U-R01-01 | U-R01-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R01-01 | U-R01-01 | no border row text; U-R01-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R01-01 | U-R01-01 | no border row text; U-R01-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_DATA | PAGE_HEADER | Caption | "data_hora" | image | 0.000,0.000,33.975,6.085 | U-R01-01 | U-R01-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Viatura | PAGE_HEADER | Caption | "Matricula" | image | 33.867,0.000,28.310,6.085 | U-R01-01 | U-R01-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Descricao_doc | PAGE_HEADER | Caption | "descricao_doc" | image | 62.177,0.000,44.029,6.085 | U-R01-01 | U-R01-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Documento_numero | PAGE_HEADER | Caption | U-R01-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R01-01 | 106.098,0.000,12.700,6.085 | U-R01-01 | U-R01-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Qnt | PAGE_HEADER | Caption | U-R01-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R01-01 | 158.485,0.000,17.571,6.085 | U-R01-01 | U-R01-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Descricao_me | PAGE_HEADER | Caption | "Descrição" | image | 118.798,0.000,39.796,6.085 | U-R01-01 | U-R01-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_DATA | BODY | Caption | bound `DATA` | dossier | 0.000,0.000,33.975,6.200 | U-R01-01 | U-R01-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Matricula | BODY | Caption | bound `matricula` | dossier | 33.867,0.000,28.310,6.200 | U-R01-01 | U-R01-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao_doc | BODY | Caption | bound `descricao_doc` | dossier | 62.177,0.000,44.029,6.200 | U-R01-01 | U-R01-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Documento_numero | BODY | Caption | bound `documento_numero` | dossier | 106.098,0.000,12.700,6.200 | U-R01-01 | U-R01-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao_me | BODY | Caption | bound `Descricao_me` | dossier | 118.798,0.000,39.796,6.200 | U-R01-01 | U-R01-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Quantidade | BODY | Caption | bound `quantidade` | dossier | 158.485,0.000,17.571,6.200 | U-R01-01 | U-R01-01 | 0.10 Solid -BLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Artigo1 | BODY | Caption | U-R01-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R01-01 | 0.000,6.220,33.975,6.200 | U-R01-01 | U-R01-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao1 | BODY | Caption | bound `Codigo_artigo` | dossier | 33.900,6.400,50.908,6.200 | U-R01-01 | U-R01-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao2 | BODY | Caption | bound `Descricao` | dossier | 84.700,6.400,91.125,6.350 | U-R01-01 | U-R01-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R01-01 | U-R01-01 | no border row text; U-R01-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| PoweredWx1 | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,9.791,40.902,5.556 | U-R01-01 | U-R01-01 | no border row text; U-R01-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC1 | END_OF_DOCUMENT | Caption | U-R01-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R01-01 | 0.000,9.262,30.271,6.085 | U-R01-01 | U-R01-01 | no border row text; U-R01-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER1 | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,9.259,16.338,6.088 | U-R01-01 | U-R01-01 | no border row text; U-R01-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_NoName2 | END_OF_DOCUMENT | Caption | U-R01-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R01-01 | 151.173,0.000,11.750,6.879 | U-R01-01 | U-R01-01 | no border row text; U-R01-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_total | END_OF_DOCUMENT | Caption | U-R01-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R01-01 | 155.200,0.000,20.700,6.879 | U-R01-01 | U-R01-01 | no border row text; U-R01-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |

Image inspected: `docs/evidence/images/RPT_Consumo_Material_Descriminado_Ordens.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R01-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R01-02: automatic scope; manual source below | U-R01-01 | RULE-R01-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R01-02: automatic scope; manual source below | U-R01-01 | RULE-R01-012 |
| COUNTER1 | Calculation | Counter Numeric; item none | U-R01-02: automatic scope; manual source below | U-R01-01 | RULE-R01-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Descriminado_Ordens.wde:328-329`, event `327693` on `BODY`. After each body prints, add its quantity to the numeric accumulator and set the total caption; preserve event timing.

```wlanguage
gxSoma=gxSoma+ITEM_Quantidade
STC_total=gxSoma
```

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Descriminado_Ordens.wde:465-465`, event `327693` on `END_OF_DOCUMENT`. After this document/group footer prints, reset the indicated accumulator to numeric zero.

```wlanguage
gxSoma=0
```

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Descriminado_Ordens.wde:476-477`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
gxSoma is numeric
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R01-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R01-02 / U-R01-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R01-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R01-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R01-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R01-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R01-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R01-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.
- U-R01-06: Dossier SQL has typographic quotation/encoding artifacts. Obtain original query SQL before execution; copied SQL is evidence text, not executable replacement. Blocks SQL translation; interim default: none; must be answered.
- U-R01-07: Caller passes a fifth EDT_Descrição argument but dossier query exposes four parameter names and no description filter. Verify WINDEV argument handling and report-specific query version. Blocks exact filtered row parity; interim default: retain caller signature, do not invent a filter.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Consumo_Material_Descriminado_Ordens.md and separate RULE rows. U-R01-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
