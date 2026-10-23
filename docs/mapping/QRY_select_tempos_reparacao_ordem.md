# Query mapping — QRY_select_tempos_reparacao_ordem

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_tempos_reparacao_ordem.WDR`; `dossier: QRY_select_tempos_reparacao_ordem/sql`.

## Purpose and rules

Finds open labor rows for an order using exact all-zero 17-character fim sentinel and a mechanic join. SQL does not compare NULL or empty string.

## SQL from the dossier

```sql
SELECT
tempos_reparacao.numero AS numero,
tempos_reparacao.mecanico AS mecanico,
tempos_reparacao.inicio AS inicio,
tempos_reparacao.fim AS fim,
mecanicos.Codigo AS Codigo,
mecanicos.Descricao AS Descricao
FROM
mecanicos,
tempos_reparacao
WHERE
mecanicos.Codigo = tempos_reparacao.mecanico
AND
(
tempos_reparacao.numero = {ParamNumero}
AND tempos_reparacao.fim = ’00000000000000000’
)
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamNumero.
Dossier parameter-table parser returned 1; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Tempos_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:213 | `QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.COL_Numero` |
| WIN_Tempos_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:241 | `QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.COL_Numero` |
| WIN_Tempos_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:409 | `open(WIN_Tempos_Reparacao_Tempo,QRY_select_tempos_reparacao_ordem.numero,QRY_select_tempos_reparacao_ordem.mecanico)` |
| WIN_Tempos_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1303 | `QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.col_numero` |
| WIN_Tempos_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1486 | `QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.COL_numero` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q20-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q20-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
