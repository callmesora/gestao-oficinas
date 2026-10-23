# Query mapping — QRY_select_tempos_Reparacao_numero_mecanico

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_tempos_Reparacao_numero_mecanico.WDR`; `dossier: QRY_select_tempos_Reparacao_numero_mecanico/sql`.

## Purpose and rules

Filters labor by order AND mechanic, sorts automatic time-row ID ascending. No explicit open/closed time predicate.

## SQL from the dossier

```sql
SELECT
tempos_reparacao.numero AS numero,
tempos_reparacao.mecanico AS mecanico,
tempos_reparacao.inicio AS inicio,
tempos_reparacao.fim AS fim,
tempos_reparacao.Inicio_reparacao_estado AS Inicio_reparacao_estado,
tempos_reparacao.fim_reparacao_estado AS fim_reparacao_estado,
tempos_reparacao.tempos_reparacaoID AS tempos_reparacaoID
FROM
tempos_reparacao
WHERE
tempos_reparacao.numero = {ParamNumero}
AND tempos_reparacao.mecanico = {ParamMecanico}
ORDER BY
tempos_reparacaoID ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamNumero, ParamMecanico.
Dossier parameter-table parser returned 0; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:266 | `HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,mecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:268 | `HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,gsMecanico_ativo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:270 | `IF HReadLast(QRY_select_tempos_Reparacao_numero_mecanico)=True THEN` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:271 | `IF QRY_select_tempos_Reparacao_numero_mecanico.fim="00000000000000000" THEN` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:279 | `HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:357 | `HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,gsMecanico_ativo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:358 | `if hreadlast(QRY_select_tempos_Reparacao_numero_mecanico)=true then` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:359 | `if QRY_select_tempos_Reparacao_numero_mecanico.fim="00000000000000000" then` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:361 | `query="UPDATE tempos_reparacao SET fim ='"+sysdatetime()+"',fim_reparacao_estado ='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"' WHERE tempos_reparacao.numero ='"+numero+"' AND tempos_reparacao.mecanico ='"+gsMecanico_ativo+"' and tempos_reparacao.inicio='"+QRY_select_tempos_Reparacao_numero_mecanico.inicio+"'"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:391 | `HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:425 | `HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:432 | `HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:494 | `HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,mecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:495 | `IF HReadLast(QRY_select_tempos_Reparacao_numero_mecanico)=True THEN` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:496 | `IF QRY_select_tempos_Reparacao_numero_mecanico.fim="00000000000000000" THEN` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:500 | `HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q19-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q19-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
