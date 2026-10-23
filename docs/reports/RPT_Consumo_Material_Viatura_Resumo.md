# Report spec — RPT_Consumo_Material_Viatura_Resumo

Evidence: `legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Viatura_Resumo.wde`, `dossier: RPT_Consumo_Material_Viatura_Resumo`, `docs/mapping/RPT_Consumo_Material_Viatura_Resumo.md`, image `docs/evidence/images/RPT_Consumo_Material_Viatura_Resumo.jpg`.

Stage 0 specification; independent review pending. No report implementation or accepted renderer decision.

Printed by: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:417`

Destination: Preview is explicitly selected immediately before printing in the caller.

Parameters and preparation: see the complete caller handlers in the mapping note. Report Open signature and all calculated assignments are reproduced below.

## Page

| Format | Orientation | Margins T/B/L/R mm | Nominal portrait printable width mm | Widest band / visible control / all designer right edge mm | Fits? |
|---|---|---|---|---|---|
| US Letter (8 1/2 x 11 inches) | U-R08-01: orientation absent from extracted fields | 20.0/20.0/20.0/20.0 | 175.900 | 175.900 / 176.007 / 176.007 | Visible geometry exceeds nominal printable width; orientation/scale/clipping behavior remains U-R08-01 |

The comparison uses the dossier paper width and margins; it does not infer orientation from a cropped designer strip. Bands have source coordinates in millimetres; control y is relative to its band. Printed-width assessment uses the band and Visible=True control extent. The separate all-designer extent includes hidden/off-band controls and is not evidence of printed overflow.

## Data source

Type: **Query**. Named source: `QRY_select_consumo_material_viatura`.

`dossier: QRY_select_consumo_material_viatura/sql`. Verbatim extracted SQL below; No SQL has been executed by this mapping.

```sql
SELECT
material_reparacao.numero AS numero,
material_reparacao.data_hora AS data_hora,
material_reparacao.mecanico AS mecanico,
material_reparacao.artigo AS artigo,
material_reparacao.descricao_artigo AS descricao_artigo,
material_reparacao.quantidade AS quantidade,
artigos.Codigo AS Codigo,
artigos.Descricao AS Descricao,
artigos.codbarras AS codbarras,
artigos.unidade AS unidade,
artigos.preco AS preco,
artigos.inativo AS inativo,
ordem_reparacao.numero AS numero_or,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.reparacao_mecanico AS reparacao_mecanico,
mecanicos.Codigo AS Codigo_me,
mecanicos.Descricao AS Descricao_me,
Viaturas.matricula AS matricula_Vi,
Viaturas.marca AS marca,
Viaturas.modelo AS modelo,
ordem_reparacao.recepcao_datahora AS recepcao_datahora
FROM
artigos,
ordem_reparacao,
mecanicos,
Viaturas,
material_reparacao
WHERE
artigos.Codigo = material_reparacao.artigo
AND material_reparacao.numero = ordem_reparacao.numero
AND material_reparacao.mecanico = mecanicos.Codigo
AND ordem_reparacao.matricula = Viaturas.matricula
AND
(
material_reparacao.data_hora BETWEEN {ParamDaData} AND {ParamAData}
AND material_reparacao.artigo BETWEEN {ParamDoArtigo} AND {ParamAoArtigo}
AND ordem_reparacao.matricula BETWEEN {ParamDaViatura} AND {ParamAViatura}
)
ORDER BY
matricula ASC,
recepcao_datahora ASC
```

Parameter names listed by the parser: none. SQL placeholders are authoritative evidence of additional names; argument order must follow caller/designer rather than this sorted list. U-R08-03.

Sort/filter/join semantics are the literal WHERE/ORDER BY above. No implicit sort is added when SQL has no ORDER BY. Omitted/null parameter condition removal is a WLanguage trap requiring U-R08-03.

## Bands

| Band | Repetition / trigger | x,y,width,height mm | Controls |
|---|---|---|---|
| START_OF_DOCUMENT | once at document start | 0.000,0.000,175.900,20.000 | CONTROL58, DOCTITLE, STC_Empresa |
| PAGE_HEADER | each page | 0.000,20.000,175.900,6.085 | STC_Artigo, STC_Descricao_artigo, STC_Unidade, STC_Quantidade |
| BREAK_HEADER1 | per encoded group key U-R08-03 | 0.000,26.085,175.900,7.000 | STC_matricula, STC_marca_modelo |
| BODY | per source record (visibility U-R08-03) | 0.000,33.085,175.900,6.200 | ITEM_Artigo, ITEM_Descricao_artigo, ITEM_Unidade, ITEM_Quantidade |
| BREAK_FOOTER1 | per encoded group key U-R08-03 | 0.000,39.285,175.900,5.000 |  |
| PAGE_FOOTER | each page | 0.000,44.285,175.900,6.614 | NUMNBPAGES |
| END_OF_DOCUMENT | once at document end | 0.000,50.899,175.900,12.909 | PoweredWx, COUNTERSTATIC, COUNTER |

Break key/order, automatic hidden-body/group aggregates and counter reset scope are U-R08-03 / U-R08-02. Manual resets are listed verbatim under calculations.

## Columns and controls

| Control | Band | Type | Text / bound item | Text source | x,y,width,height mm | Alignment | Mask / format | Borders | Overflow |
|---|---|---|---|---|---|---|---|---|---|
| CONTROL58 | START_OF_DOCUMENT | Preset | preset `Date` | dossier | 144.180,0.000,31.720,6.760 | U-R08-01 | U-R08-01 | no border row text; U-R08-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| DOCTITLE | START_OF_DOCUMENT | Caption | U-R08-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R08-01 | 35.376,6.760,105.148,9.789 | U-R08-01 | U-R08-01 | 0.10 Solid TBLR | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| STC_Empresa | START_OF_DOCUMENT | Caption | gsNome_empresa_reports | code | 0.000,0.000,60.000,6.615 | U-R08-01 | U-R08-01 | no border row text; U-R08-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Artigo | PAGE_HEADER | Caption | "artigo" | image | 0.000,0.000,50.379,6.085 | U-R08-01 | U-R08-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Descricao_artigo | PAGE_HEADER | Caption | "descricao_artigo" | image | 50.271,0.000,90.066,6.085 | U-R08-01 | U-R08-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Unidade | PAGE_HEADER | Caption | "unidade" | image | 140.337,0.000,15.189,6.085 | U-R08-01 | U-R08-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_Quantidade | PAGE_HEADER | Caption | "quantidade" | image | 155.526,0.000,20.481,6.085 | U-R08-01 | U-R08-01 | 0.10 Solid TBL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_matricula | BREAK_HEADER1 | Caption | U-R08-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R08-01 | 0.000,0.000,32.015,7.000 | U-R08-01 | U-R08-01 | no border row text; U-R08-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| STC_marca_modelo | BREAK_HEADER1 | Caption | U-R08-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R08-01 | 32.015,0.000,89.272,7.000 | U-R08-01 | U-R08-01 | no border row text; U-R08-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Artigo | BODY | Caption | bound `artigo` | dossier | 0.000,0.000,50.379,6.200 | U-R08-01 | U-R08-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Descricao_artigo | BODY | Caption | bound `descricao_artigo` | dossier | 50.271,0.000,90.066,6.200 | U-R08-01 | U-R08-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Unidade | BODY | Caption | bound `unidade` | dossier | 140.337,0.000,15.189,6.200 | U-R08-01 | U-R08-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| ITEM_Quantidade | BODY | Caption | bound `quantidade` | dossier | 155.526,0.000,20.481,6.200 | U-R08-01 | U-R08-01 | 0.10 Solid -BL- | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| NUMNBPAGES | PAGE_FOOTER | Preset | preset `[PAGENUM]/[NBPAGES]` | dossier | 131.773,0.000,44.127,6.615 | U-R08-01 | U-R08-01 | no border row text; U-R08-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| PoweredWx | END_OF_DOCUMENT | Caption | "Golfinho Software, Lda" | image-observed; inferred control association | 134.998,5.821,40.902,5.556 | U-R08-01 | U-R08-01 | no border row text; U-R08-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=False |
| COUNTERSTATIC | END_OF_DOCUMENT | Caption | U-R08-01: literal caption absent/clipped or assigned by code below | code where assigned; remaining U-R08-01 | 0.000,5.821,30.271,6.085 | U-R08-01 | U-R08-01 | no border row text; U-R08-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |
| COUNTER | END_OF_DOCUMENT | Calculation | calculation `Counter Numeric` | dossier | 30.271,5.821,16.338,6.088 | U-R08-01 | U-R08-01 | no border row text; U-R08-01 | Table=False, Visible=True, Divisible=False, Auto.Resiz=True |

Image inspected: `docs/evidence/images/RPT_Consumo_Material_Viatura_Resumo.jpg`. It is a designer strip, not a runtime golden. Blue header cells and pale-blue body cells with white grid edges and grey-gradient title/footer are visible. The full right edge and literal captions outside the strip remain U-R08-01. Placeholder text such as `Static`, `Title`, `DD/MM/YYYY`, sample numerals and `[PAGENUM]/[NBPAGES]` must not be mistaken for runtime data.

## Calculations and presets

| Control | Kind | Formula / preset | Reset on | Mask | Parity ID |
|---|---|---|---|---|---|
| CONTROL58 | Preset | Date; item none | U-R08-02: automatic scope; manual source below | U-R08-01 | RULE-R08-012 |
| NUMNBPAGES | Preset | [PAGENUM]/[NBPAGES]; item none | U-R08-02: automatic scope; manual source below | U-R08-01 | RULE-R08-012 |
| COUNTER | Calculation | Counter Numeric; item none | U-R08-02: automatic scope; manual source below | U-R08-01 | RULE-R08-012 |

Manual computations, input signatures and explicit reset timing (verified source; no rounding has been added):

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Viatura_Resumo.wde:194-195`, event `327692` on `BREAK_HEADER1`. Assign the named captions from the current query buffer exactly as shown, preserving spaces and event order.

```wlanguage
STC_matricula=QRY_select_consumo_material_viatura.matricula
STC_marca_modelo=QRY_select_consumo_material_viatura.marca+" "+QRY_select_consumo_material_viatura.modelo
```

`legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Viatura_Resumo.wde:396-396`, event `327680` on `report/local procedure`. Read the project company-name global into STC_Empresa on report open; declarations and any cutoff initialization execute in the exact order below.

```wlanguage
STC_Empresa=gsNome_empresa_reports
```

## Data edge cases

| Case | Legacy behavior | Evidence or U-id |
|---|---|---|
| No rows | No custom empty-result handler; report engine/bands need a golden sample | U-R08-02 |
| Empty / NULL | No report-wide NULL normalizer; preserve conditional assignments and source SQL | U-R08-02 / U-R08-03 |
| Long text | Per-control Divisible/Auto.Resiz flags above; actual wrapping/ellipsis/page split | U-R08-01 |
| Cancellation/error or concurrent table change | No explicit report-wide failure/concurrency handler | U-R08-02 |

## Acceptance checks

- Produce a legacy PDF with known rows; compare headers, values, grouping, totals, date text, page count and final page.
- Produce no-row, long-description, multi-page and repeated-preview samples. Exercise every caller branch, preserving caller argument order.
- Verify source geometry against the complete designer and compare visual layout to the dossier image. Human visual approval remains pending; see U-R08-01.
- Do not execute dossier SQL verbatim as a target migration. Framing and implementation are outside Step 0.

## Open points

- U-R08-01: Designer fidelity: orientation, fonts, alignment, exact display masks, clipped/unprinted captions and control-level overflow beyond supplied flags need WINDEV properties or a complete golden PDF. Blocks visual implementation. Interim default: preserve listed geometry, bindings and flags; no inferred typography.
- U-R08-02: Runtime/engine contract: no-row output, NULL formatting, first/last page behavior, counter/sum automatic reset scope, report cancellation, printer errors/default dialogs, snapshot versus live-table iteration and concurrent changes require controlled legacy print samples. Blocks engine edge-case implementation. Interim default: none; must be answered.
- U-R08-03: Data contract: named query SQL is reproduced below when supplied; persistent filters, omitted/empty parameters, report-specific break keys, whether summary bodies are hidden and automatic grouping/aggregation options need report designer or runtime confirmation. Blocks row-group/empty-parameter edge cases; interim default: preserve exact caller arguments and SQL, no extra grouping.

## Footer caption evidence

Image-observed footer strings above have inferred control association, recorded in docs/mapping/RPT_Consumo_Material_Viatura_Resumo.md and separate RULE rows. U-R08-01 is narrowed to remaining designer/runtime properties rather than these legible strings.
