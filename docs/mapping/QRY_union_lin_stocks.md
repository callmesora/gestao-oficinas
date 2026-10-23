# Query mapping — QRY_union_lin_stocks

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_union_lin_stocks.WDR`; `dossier: QRY_union_lin_stocks/sql`.

## Purpose and rules

Selects stock document exits (documentos.stock=2), article and header timestamp ranges plus description LIKE. Header-to-line join uses document number without document code, unlike the ledger query, so same-number documents can duplicate/mix results.

## SQL from the dossier

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
ORDER BY
artigo ASC,
data ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamDoArtigo, ParamAoArtigo, ParamDaData, ParamAData, ParamDescricao.
Dossier parameter-table parser returned 5; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| Designer-bound paths below | No literal query-name code caller found | Report binding and report initialization establish the listed paths. |

### Designer-bound report consumers

These named source bindings establish report reachability independently of literal query-name matches. Arguments below are in caller order, not the parameter parser order.

| Report | Source binding and contract |
|---|---|
| RPT_Consumo_Material_Descriminado_Saidas | dossier: RPT_Consumo_Material_Descriminado_Saidas/lines; docs/reports/RPT_Consumo_Material_Descriminado_Saidas.md; docs/mapping/RPT_Consumo_Material_Descriminado_Saidas.md |
| RPT_Consumo_Material_Resumo_Saidas | dossier: RPT_Consumo_Material_Resumo_Saidas/lines; docs/reports/RPT_Consumo_Material_Resumo_Saidas.md; docs/mapping/RPT_Consumo_Material_Resumo_Saidas.md |

| Printing caller | Source | Exact initialization/print statement |
|---|---|---|
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:370 | `iInitReportQuery(RPT_Consumo_Material_Resumo_saidas,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:371 | `iPrintReport(RPT_Consumo_Material_Resumo_saidas)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:388 | `iInitReportQuery(RPT_Consumo_Material_Descriminado_Saidas,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:389 | `iPrintReport(RPT_Consumo_Material_Descriminado_Saidas)` |

The article-report caller sets da_data from EDT_Da_data to hour/minute/second 00/00/00 and a_data from EDT_a_data to 23/59/59 (legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348-355); no explicit subsecond reset appears. tipo_report selects resumo/descriminado, CBOX_doc[1]/[2] select order-only, both, or exit-only branches, and each selected branch calls iPreview before initialization/printing (legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:356-393). Summary uses EDT_Do_artigo/EDT_Ao_artigo and four arguments; detailed uses EDT_Do_artigo2/EDT_Ao_artigo2 plus fifth EDT_Descrição. The summary exit/combined calls omit the description argument; omitted is not empty text.

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q28-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q28-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q28-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.
