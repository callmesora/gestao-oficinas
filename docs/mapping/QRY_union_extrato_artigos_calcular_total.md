# Query mapping — QRY_union_extrato_artigos_calcular_total

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_union_extrato_artigos_calcular_total.WDR`; `dossier: QRY_union_extrato_artigos_calcular_total/sql`.

## Purpose and rules

Dossier SQL is the same UNION ALL movement shape, not an SQL SUM aggregate. Opening-balance arithmetic is performed by the caller, and inclusive cutoff can affect boundary rows.

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
Dossier parameter-table parser returned 4; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:264 | `HExecuteQuery(QRY_union_extrato_artigos_calcular_total,hQueryDefault,gddata_antiga,gddata_limite,QRY_union_extrato_artigos.artigo,QRY_union_extrato_artigos.artigo)` |
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:266 | `hreadfirst(QRY_union_extrato_artigos_calcular_total)` |
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:267 | `for EACH QRY_union_extrato_artigos_calcular_total` |
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:268 | `if QRY_union_extrato_artigos_calcular_total.stock=1 then` |
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:269 | `rTotal=rTotal+QRY_union_extrato_artigos_calcular_total.quantidade` |
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:271 | `if QRY_union_extrato_artigos_calcular_total.stock=2 then` |
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:272 | `rTotal=rTotal-QRY_union_extrato_artigos_calcular_total.quantidade` |
| RPT_Extrato_artigos | legacy/GestaoOficinas_TesteIA/RPT_Extrato_artigos.wde:278 | `HCancelDeclaration(QRY_union_extrato_artigos_calcular_total)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q27-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q27-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
