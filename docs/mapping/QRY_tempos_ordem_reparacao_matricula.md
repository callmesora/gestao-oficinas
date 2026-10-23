# Query mapping — QRY_tempos_ordem_reparacao_matricula

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_tempos_ordem_reparacao_matricula.WDR`; `dossier: QRY_tempos_ordem_reparacao_matricula/sql`.

## Purpose and rules

Same labor joins, filters vehicle registration and labor-start timestamp inclusive ranges; sorts registration then order number.

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
tempos_reparacao.mecanico = mecanicos.Codigo
AND ordem_reparacao.matricula = Viaturas.matricula
AND ordem_reparacao.numero = tempos_reparacao.numero
AND
(
ordem_reparacao.matricula BETWEEN {ParamDaViatura} AND {ParamAViatura}
AND tempos_reparacao.inicio BETWEEN {ParamDaData} AND {ParamAData}
)
ORDER BY
matricula ASC,
numero ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamDaViatura, ParamAViatura, ParamDaData, ParamAData.
Dossier parameter-table parser returned 2; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| RPT_Tempos_Ordem_Reparacao_viatura | legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_viatura.wde:194 | `STC_marca_modelo=QRY_tempos_ordem_reparacao_matricula.marca+" "+QRY_tempos_ordem_reparacao_matricula.modelo` |
| RPT_Tempos_Ordem_Reparacao_viatura | legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_viatura.wde:195 | `STC_matricula=QRY_tempos_ordem_reparacao_matricula.matricula` |
| RPT_Tempos_Ordem_Reparacao_viatura | legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_viatura.wde:266 | `STC_numero=QRY_tempos_ordem_reparacao_matricula.numero` |
| RPT_Tempos_Ordem_Reparacao_viatura | legacy/GestaoOficinas_TesteIA/RPT_Tempos_Ordem_Reparacao_viatura.wde:267 | `DATA=QRY_tempos_ordem_reparacao_matricula.recepcao_datahora` |

### Designer-bound report consumers

These named source bindings establish report reachability independently of literal query-name matches. Arguments below are in caller order, not the parameter parser order.

| Report | Source binding and contract |
|---|---|
| RPT_Tempos_Ordem_Reparacao_viatura | dossier: RPT_Tempos_Ordem_Reparacao_viatura/lines; docs/reports/RPT_Tempos_Ordem_Reparacao_viatura.md; docs/mapping/RPT_Tempos_Ordem_Reparacao_viatura.md |

| Printing caller | Source | Exact initialization/print statement |
|---|---|---|
| WIN_Filtro_Mapas_Tempos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:289 | `iInitReportQuery(RPT_Tempos_Ordem_Reparacao_viatura,da_data,a_data,EDT_Da_viatura,EDT_a_viatura)` |
| WIN_Filtro_Mapas_Tempos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:290 | `iPrintReport(RPT_Tempos_Ordem_Reparacao_viatura)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q24-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q24-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q24-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.
