# Query mapping — QRY_tempos_ordem_reparacao_mecanico

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_tempos_ordem_reparacao_mecanico.WDR`; `dossier: QRY_tempos_ordem_reparacao_mecanico/sql`.

## Purpose and rules

Same labor joins, filters mechanic code and labor-start timestamp inclusive ranges; sorts mechanic then order reception timestamp.

## SQL from the dossier

```sql
SELECT
ordem_reparacao.numero AS numero,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.recepcao_datahora AS recepcao_datahora,
Viaturas.matricula AS matricula_Vi,
Viaturas.marca AS marca,
Viaturas.modelo AS modelo,
tempos_reparacao.numero AS numero_te,
tempos_reparacao.mecanico AS mecanico,
tempos_reparacao.inicio AS inicio,
tempos_reparacao.fim AS fim,
mecanicos.Codigo AS Codigo,
mecanicos.Descricao AS Descricao
FROM
Viaturas,
tempos_reparacao,
mecanicos,
ordem_reparacao
WHERE
ordem_reparacao.numero = tempos_reparacao.numero
AND ordem_reparacao.matricula = Viaturas.matricula
AND tempos_reparacao.mecanico = mecanicos.Codigo
AND
(
mecanicos.Codigo BETWEEN {ParamDoMecanico} AND {ParamAoMecanico}
AND tempos_reparacao.inicio BETWEEN {ParamDaData} AND {ParamAData}
)
ORDER BY
mecanico ASC,
recepcao_datahora ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamDoMecanico, ParamAoMecanico, ParamDaData, ParamAData.
Dossier parameter-table parser returned 2; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| RPT_Tempos_Ordem_Reparacao_Mecanico | legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:252 | `STC_NoName=QRY_tempos_ordem_reparacao_mecanico.Descricao` |
| RPT_Tempos_Ordem_Reparacao_Mecanico | legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico.wde:429 | `data=QRY_tempos_ordem_reparacao_mecanico.recepcao_datahora` |
| RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo | legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.wde:188 | `STC_mecanico=QRY_tempos_ordem_reparacao_mecanico.Descricao` |

### Designer-bound report consumers

These named source bindings establish report reachability independently of literal query-name matches. Arguments below are in caller order, not the parameter parser order.

| Report | Source binding and contract |
|---|---|
| RPT_Tempos_Ordem_Reparacao_Mecanico | dossier: RPT_Tempos_Ordem_Reparacao_Mecanico/lines; docs/reports/RPT_Tempos_Ordem_Reparacao_Mecanico.md; docs/mapping/RPT_Tempos_Ordem_Reparacao_Mecanico.md |
| RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo | dossier: RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo/lines; docs/reports/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.md; docs/mapping/RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo.md |

| Printing caller | Source | Exact initialization/print statement |
|---|---|---|
| WIN_Filtro_Mapas_Tempos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:281 | `iInitReportQuery(RPT_Tempos_Ordem_Reparacao_Mecanico,EDT_Do_mecanico,EDT_Ao_mecanico,da_data,a_data)` |
| WIN_Filtro_Mapas_Tempos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:282 | `iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico)` |
| WIN_Filtro_Mapas_Tempos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:285 | `iInitReportQuery(RPT_Tempos_Ordem_Reparacao_Mecanico_resumo,EDT_Do_mecanico,EDT_Ao_mecanico,da_data,a_data)` |
| WIN_Filtro_Mapas_Tempos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:286 | `iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q25-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q25-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q25-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.
