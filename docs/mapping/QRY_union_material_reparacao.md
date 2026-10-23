# Query mapping — QRY_union_material_reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_union_material_reparacao.WDR`; `dossier: QRY_union_material_reparacao/sql`.

## Purpose and rules

Selects order material exits joined to articles/order and the order assigned mechanic (reparacao_mecanico), not the material row mechanic. Filters article and material timestamp; no description parameter.

## SQL from the dossier

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

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamDoArtigo, ParamAoArtigo, ParamDaData, ParamAData.
Dossier parameter-table parser returned 4; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| Designer-bound paths below | No literal query-name code caller found | Report binding and report initialization establish the listed paths. |

### Designer-bound report consumers

These named source bindings establish report reachability independently of literal query-name matches. Arguments below are in caller order, not the parameter parser order.

| Report | Source binding and contract |
|---|---|
| RPT_Consumo_Material_Descriminado_Ordens | dossier: RPT_Consumo_Material_Descriminado_Ordens/lines; docs/reports/RPT_Consumo_Material_Descriminado_Ordens.md; docs/mapping/RPT_Consumo_Material_Descriminado_Ordens.md |
| RPT_Consumo_Material_Resumo_ordens | dossier: RPT_Consumo_Material_Resumo_ordens/lines; docs/reports/RPT_Consumo_Material_Resumo_ordens.md; docs/mapping/RPT_Consumo_Material_Resumo_ordens.md |

| Printing caller | Source | Exact initialization/print statement |
|---|---|---|
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:360 | `iInitReportQuery(RPT_Consumo_Material_Resumo_ordens,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:361 | `iPrintReport(RPT_Consumo_Material_Resumo_ordens)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:378 | `iInitReportQuery(RPT_Consumo_Material_Descriminado_Ordens,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:379 | `iprintreport(RPT_Consumo_Material_Descriminado_Ordens)` |

The article-report caller sets da_data from EDT_Da_data to hour/minute/second 00/00/00 and a_data from EDT_a_data to 23/59/59 (legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348-355); no explicit subsecond reset appears. tipo_report selects resumo/descriminado, CBOX_doc[1]/[2] select order-only, both, or exit-only branches, and each selected branch calls iPreview before initialization/printing (legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:356-393). Summary uses EDT_Do_artigo/EDT_Ao_artigo and four arguments; detailed uses EDT_Do_artigo2/EDT_Ao_artigo2 plus fifth EDT_Descrição. The summary exit/combined calls omit the description argument; omitted is not empty text.

U-R01-07 in docs/mapping/RPT_Consumo_Material_Descriminado_Ordens.md records the detailed initializer passing five arguments while this SQL has four placeholders and no description predicate. Preserve both pieces of evidence; do not invent a fifth SQL parameter or assume how WINDEV handles the extra argument.

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q29-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q29-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q29-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.
