# Query mapping — QRY_union_extrato_artigos

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_union_extrato_artigos.WDR`; `dossier: QRY_union_extrato_artigos/sql`.

## Purpose and rules

UNION ALL preserves duplicate movement rows: document movements joined on BOTH code and number, plus order material movements with constant stock=2 and order reception date. Sorts article then date.

## SQL from the dossier

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

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamDaData, ParamAData, ParamDoArtigo, ParamAoArtigo.
Dossier parameter-table parser returned 0; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:263 | `STC_artigo=QRY_union_extrato_artigos.artigo+" - "+QRY_union_extrato_artigos.descricao_artigo` |
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:264 | `HExecuteQuery(QRY_union_extrato_artigos_calcular_total,hQueryDefault,gddata_antiga,gddata_limite,QRY_union_extrato_artigos.artigo,QRY_union_extrato_artigos.artigo)` |

### Designer-bound report consumers

These named source bindings establish report reachability independently of literal query-name matches. Arguments below are in caller order, not the parameter parser order.

| Report | Source binding and contract |
|---|---|
| RPT_Extrato_artigos | dossier: RPT_Extrato_artigos/lines; docs/reports/RPT_Extrato_artigos.md; docs/mapping/RPT_Extrato_artigos.md |

| Printing caller | Source | Exact initialization/print statement |
|---|---|---|
| WIN_Extrato_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:421 | `iInitReportQuery(RPT_Extrato_artigos,da_data,a_data,EDT_Do_artigo,EDT_Ao_artigo)` |
| WIN_Extrato_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:422 | `iPrintReport(RPT_Extrato_artigos,da_data)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q26-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q26-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q26-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.
