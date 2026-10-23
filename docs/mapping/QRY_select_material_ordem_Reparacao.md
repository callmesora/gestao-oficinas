# Query mapping — QRY_select_material_ordem_Reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_material_ordem_Reparacao.WDR`; `dossier: QRY_select_material_ordem_Reparacao/sql`.

## Purpose and rules

Joins material rows to orders, uses order reception time rather than material timestamp for date filtering, emits constant stock=2, sorts article then reception date.

## SQL from the dossier

```sql
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
Dossier parameter-table parser returned 1; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| U-Q10-02 | No literal code caller found | Dynamic/designer usage requires review; do not silently exclude. |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q10-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q10-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q10-02: Establish reachability from project/designer before excluding; interim: retain parity row.
