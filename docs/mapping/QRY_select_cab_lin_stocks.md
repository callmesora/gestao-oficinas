# Query mapping — QRY_select_cab_lin_stocks

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_cab_lin_stocks.WDR`; `dossier: QRY_select_cab_lin_stocks/sql`.

## Purpose and rules

Joins header and lines on BOTH document number and code, adds document stock direction, restricts timestamp and article inclusive ranges, sorts article then date ascending.

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
ORDER BY
artigo ASC,
data ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamDaData, ParamAData, ParamDoArtigo, ParamAoArtigo.
Dossier parameter-table parser returned 1; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| U-Q05-02 | No literal code caller found | Dynamic/designer usage requires review; do not silently exclude. |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q05-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q05-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q05-02: Establish reachability from project/designer before excluding; interim: retain parity row.
