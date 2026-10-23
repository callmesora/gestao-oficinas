# Query mapping — QRY_select_lin_stocks

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_lin_stocks.WDR`; `dossier: QRY_select_lin_stocks/sql`.

## Purpose and rules

Filters document number AND document code, returns stock lines and orders by document number only. Does not establish line-number ordering within a document.

## SQL from the dossier

```sql
SELECT
lin_stocks.lin_stocksID AS lin_stocksID,
lin_stocks.documento_codigo AS documento_codigo,
lin_stocks.documento_numero AS documento_numero,
lin_stocks.linha AS linha,
lin_stocks.artigo AS artigo,
lin_stocks.descricao_artigo AS descricao_artigo,
lin_stocks.quantidade AS quantidade,
lin_stocks.preco AS preco,
lin_stocks.documento_codigodocumento_numero AS documento_codigodocumento_numero
FROM
lin_stocks
WHERE
lin_stocks.documento_numero = {ParamNumero}
AND lin_stocks.documento_codigo = {ParamDoc}
ORDER BY
documento_numero ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamNumero, ParamDoc.
Dossier parameter-table parser returned 2; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Table_Lin_Stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1111 | `HExecuteQuery(QRY_select_lin_stocks,hQueryDefault,EDT_Numero,COMBO_tipo_doc)` |
| WIN_Table_Lin_Stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1112 | `for EACH QRY_select_lin_stocks` |
| WIN_Table_Lin_Stocks | legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1113 | `tableaddline(TABLE_lin_Stocks,QRY_select_lin_stocks.artigo,QRY_select_lin_stocks.descricao_artigo,QRY_select_lin_stocks.quantidade,QRY_select_lin_stocks.preco,QRY_select_lin_stocks.linha)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q09-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q09-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
