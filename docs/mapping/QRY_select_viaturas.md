# Query mapping — QRY_select_viaturas

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_viaturas.WDR`; `dossier: QRY_select_viaturas/sql`.

## Purpose and rules

Inner joins vehicles to customer business codes and orders registration ascending. Vehicles without matching customer are absent from this result.

## SQL from the dossier

```sql
SELECT
Viaturas.matricula AS matricula,
Viaturas.Cliente AS Cliente,
Viaturas.marca AS marca,
Viaturas.modelo AS modelo,
Viaturas.Ano AS Ano,
Viaturas.mes AS mes,
Clientes.Codigo AS Codigo,
Clientes.Descricao AS Descricao
FROM
Clientes,
Viaturas
WHERE
Viaturas.Cliente = Clientes.Codigo
ORDER BY
matricula ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: none extracted.
Dossier parameter-table parser returned 0; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Table_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:687 | `HDeactivateFilter(qry_select_Viaturas)` |
| WIN_Table_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:731 | `HDeactivateFilter(QRY_select_viaturas)` |
| WIN_Table_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:738 | `HFilter(QRY_select_viaturas,sFiltro)` |
| WIN_Table_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:741 | `HFilter(QRY_select_viaturas,sFiltro)` |
| WIN_Table_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:744 | `HFilter(QRY_select_viaturas,sFiltro)` |
| WIN_Table_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:746 | `HDeactivateFilter(QRY_select_viaturas)` |
| WIN_Table_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:788 | `HCancelDeclaration(qry_select_Viaturas)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q22-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q22-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
