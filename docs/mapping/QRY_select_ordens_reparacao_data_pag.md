# Query mapping — QRY_select_ordens_reparacao_data_pag

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_ordens_reparacao_data_pag.WDR`; `dossier: QRY_select_ordens_reparacao_data_pag/sql`.

## Purpose and rules

Filters payment date inclusively and state IN list, joins vehicle owner customer. Dossier SQL has no explicit ORDER BY.

## SQL from the dossier

```sql
SELECT
ordem_reparacao.numero AS numero,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.recepcao_datahora AS recepcao_datahora,
ordem_reparacao.data_pagamento AS data_pagamento,
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
Viaturas.matricula = ordem_reparacao.matricula
AND Clientes.Codigo = Viaturas.Cliente
AND ordem_reparacao.reparacao_estado = estados_reparacao.Codigo
AND
(
ordem_reparacao.data_pagamento BETWEEN {ParamDaData} AND {ParamAData}
AND ordem_reparacao.reparacao_estado IN ({ParamEstados})
)
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
| RPT_Ordens_Reparacao_DataPag | dossier: RPT_Ordens_Reparacao_DataPag/lines; docs/reports/RPT_Ordens_Reparacao_DataPag.md; docs/mapping/RPT_Ordens_Reparacao_DataPag.md |

| Printing caller | Source | Exact initialization/print statement |
|---|---|---|
| WIN_Mapa_Vendas | legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:440 | `iInitReportQuery(RPT_Ordens_Reparacao_DataPag,EDT_Da_data,EDT_A_data,lista_estados)` |
| WIN_Mapa_Vendas | legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:441 | `iPrintReport(RPT_Ordens_Reparacao_DataPag)` |

WIN_Mapa_Vendas builds lista_estados by appending each checked TABLE_Estados.COL_codigo plus a semicolon (legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:429-434), selects preview, then prints the delivery report when tipo="vendas", otherwise the payment report (lines 435-442). Preserve the distinct EDT_À_data versus EDT_A_data argument spellings and the positional date/date/list contract.

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q15-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q15-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q15-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.
