# Query mapping — QRY_select_cab_stocks

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_cab_stocks.WDR`; `dossier: QRY_select_cab_stocks/sql`.

## Purpose and rules

Inner joins stock headers with document codes and returns document stock direction and mechanic requirement. No explicit ORDER BY in dossier SQL.

## SQL from the dossier

```sql
SELECT
cab_stocks.cab_stocksID AS cab_stocksID,
cab_stocks.documento_codigo AS documento_codigo,
cab_stocks.documento_numero AS documento_numero,
cab_stocks.data AS data,
cab_stocks.Descricao AS Descricao_ca,
cab_stocks.mecanico AS mecanico,
cab_stocks.documentosID AS documentosID,
cab_stocks.mecanicosID AS mecanicosID,
documentos.documentosID AS documentosID_do,
documentos.Codigo AS Codigo,
documentos.Descricao AS Descricao,
documentos.stock AS stock,
documentos.obriga_macanico AS obriga_macanico
FROM
documentos,
cab_stocks
WHERE
cab_stocks.documento_codigo = documentos.Codigo
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: none extracted.
Dossier parameter-table parser returned 0; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Table_cab_stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:458 | `hfilter(QRY_select_cab_stocks,sFiltro)` |
| WIN_Table_cab_stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:502 | `HFilter(QRY_select_cab_stocks,sFiltro)` |
| WIN_Table_cab_stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:562 | `HFilter(QRY_select_cab_stocks,sFiltro)` |
| WIN_Table_cab_stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:619 | `HFilter(QRY_select_cab_stocks,sFiltro)` |
| WIN_Table_cab_stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:679 | `HFilter(QRY_select_cab_stocks,sFiltro)` |
| WIN_Table_cab_stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:739 | `HFilter(QRY_select_cab_stocks,sFiltro)` |
| WIN_Table_cab_stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:813 | `HFilter(QRY_select_cab_stocks,sFiltro)` |
| WIN_Table_cab_stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:835 | `open(WIN_Table_Lin_Stocks,QRY_select_cab_stocks.documento_codigo,QRY_select_cab_stocks.documento_numero,"MODIFICAR")` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q06-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q06-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
