# Query mapping — QRY_select_ordens_reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_ordens_reparacao.WDR`; `dossier: QRY_select_ordens_reparacao/sql`.

## Purpose and rules

General order list with vehicle/state/customer joins, optional mechanic via RIGHT OUTER join and third-party customer via LEFT OUTER join. Mandatory joins may hide orphaned orders. Orders numero descending.

## SQL from the dossier

```sql
SELECT
ordem_reparacao.numero AS numero,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.km_viatura AS km_viatura,
ordem_reparacao.recepcao_util AS recepcao_util,
ordem_reparacao.recepcao_datahora AS recepcao_datahora,
ordem_reparacao.recepacao_contatos AS recepacao_contatos,
ordem_reparacao.recepcao_servico AS recepcao_servico,
ordem_reparacao.recepcao_obs AS recepcao_obs,
ordem_reparacao.recepcao_entrega_prevista AS recepcao_entrega_prevista,
ordem_reparacao.recepcao_prioridade AS recepcao_prioridade,
ordem_reparacao.reparacao_mecanico AS reparacao_mecanico,
ordem_reparacao.reparacao_estado AS reparacao_estado,
ordem_reparacao.reparacao_estado_obs AS reparacao_estado_obs,
ordem_reparacao.reparacao_servico AS reparacao_servico,
ordem_reparacao.reparacao_estado_data AS reparacao_estado_data,
ordem_reparacao.reparacao_estado_historico AS reparacao_estado_historico,
ordem_reparacao.totaL_mao_obra AS totaL_mao_obra,
ordem_reparacao.total_pecas AS total_pecas,
ordem_reparacao.total_desconto AS total_desconto,
ordem_reparacao.total_reparacao AS total_reparacao,
ordem_reparacao.faturado AS faturado,
ordem_reparacao.total_pago AS total_pago,
ordem_reparacao.Estados_reparacaoID AS Estados_reparacaoID,
ordem_reparacao.numero_fatura AS numero_fatura,
Viaturas.matricula AS matricula_Vi,
Viaturas.Cliente AS Cliente,
Viaturas.marca AS marca,
Viaturas.modelo AS modelo,
Viaturas.Ano AS Ano,
Viaturas.mes AS mes,
( ( Viaturas.marca +  ’ ’) + Viaturas.modelo )  AS marcamodelo,
estados_reparacao.Codigo AS Codigo,
estados_reparacao.Descricao AS Descricao,
estados_reparacao.tipo AS tipo,
estados_reparacao.Cor AS Cor,
mecanicos.Codigo AS Codigo_me,
mecanicos.Descricao AS Descricao_me,
Clientes.Codigo AS Codigo_Cliente,
Clientes.Descricao AS Descricao_Cliente,
ordem_reparacao.recepcao_cliente AS recepcao_cliente,
ordem_reparacao.recepcao_terceiro AS recepcao_terceiro,
Terceiro.Codigo AS Codigo_Terceiro,
Terceiro.Descricao AS Descricao_Terceiro
FROM
(
Clientes
INNER JOIN
(
(
(
mecanicos
RIGHT OUTER JOIN
ordem_reparacao
ON mecanicos.Codigo = ordem_reparacao.reparacao_mecanico
)
INNER JOIN
estados_reparacao
ON ordem_reparacao.reparacao_estado = estados_reparacao.Codigo
)
INNER JOIN
Viaturas
ON ordem_reparacao.matricula = Viaturas.matricula
)
ON Clientes.Codigo = ordem_reparacao.recepcao_cliente
)
LEFT OUTER JOIN
Clientes Terceiro
ON Terceiro.Codigo = ordem_reparacao.recepcao_terceiro
ORDER BY
numero DESC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: none extracted.
Dossier parameter-table parser returned 0; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:899 | `HExecuteQuery(QRY_select_ordens_reparacao,hQueryDefault)` |
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:900 | `for each QRY_select_ordens_reparacao` |
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:901 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao.matricula)` |
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:903 | `sQuery is string="update ordem_reparacao set recepcao_cliente='"+QRY_select_viatura_matricula.Cliente+"' where numero='"+QRY_select_ordens_reparacao.numero+"'"` |
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:910 | `HCancelDeclaration(QRY_select_ordens_reparacao)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q13-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q13-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
