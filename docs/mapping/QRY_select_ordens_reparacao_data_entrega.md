# Query mapping — QRY_select_ordens_reparacao_data_entrega

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_ordens_reparacao_data_entrega.WDR`; `dossier: QRY_select_ordens_reparacao_data_entrega/sql`.

## Purpose and rules

Filters expected delivery date inclusively and state IN list, joins vehicle owner customer, sorts expected delivery date descending.

## SQL from the dossier

```sql
SELECT
ordem_reparacao.numero AS numero,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.recepcao_datahora AS recepcao_datahora,
ordem_reparacao.recepcao_entrega_prevista AS recepcao_entrega_prevista,
ordem_reparacao.reparacao_estado AS reparacao_estado,
ordem_reparacao.total_pago AS total_pago,
Clientes.Descricao AS Cliente,
estados_reparacao.Descricao AS Estado,
( ( Viaturas.marca +  ’ ’) + Viaturas.modelo )  AS marcamodelo
FROM
Clientes,
Viaturas,
estados_reparacao,
ordem_reparacao
WHERE
Clientes.Codigo = Viaturas.Cliente
AND ordem_reparacao.reparacao_estado = estados_reparacao.Codigo
AND Viaturas.matricula = ordem_reparacao.matricula
AND
(
ordem_reparacao.recepcao_entrega_prevista BETWEEN {ParamDaData} AND {ParamAData}
AND ordem_reparacao.reparacao_estado IN ({ParamEstados})
)
ORDER BY
recepcao_entrega_prevista DESC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamDaData, ParamAData, ParamEstados.
Dossier parameter-table parser returned 3; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| Designer-bound paths below | No literal query-name code caller found | Report binding and report initialization establish the listed paths. |

### Designer-bound report consumers

These named source bindings establish report reachability independently of literal query-name matches. Arguments below are in caller order, not the parameter parser order.

| Report | Source binding and contract |
|---|---|
| RPT_Ordens_Reparacao_DataEntrega | dossier: RPT_Ordens_Reparacao_DataEntrega/lines; docs/reports/RPT_Ordens_Reparacao_DataEntrega.md; docs/mapping/RPT_Ordens_Reparacao_DataEntrega.md |

| Printing caller | Source | Exact initialization/print statement |
|---|---|---|
| WIN_Mapa_Vendas | legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:437 | `iInitReportQuery(RPT_Ordens_Reparacao_DataEntrega,EDT_Da_data,EDT_À_data,lista_estados)` |
| WIN_Mapa_Vendas | legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:438 | `iPrintReport(RPT_Ordens_Reparacao_DataEntrega)` |

WIN_Mapa_Vendas builds lista_estados by appending each checked TABLE_Estados.COL_codigo plus a semicolon (legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:429-434), selects preview, then prints the delivery report when tipo="vendas", otherwise the payment report (lines 435-442). Preserve the distinct EDT_À_data versus EDT_A_data argument spellings and the positional date/date/list contract.

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q14-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q14-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q14-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.
