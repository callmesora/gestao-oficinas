# Query mapping — QRY_select_ordens_reparacao_matricula

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_ordens_reparacao_matricula.WDR`; `dossier: QRY_select_ordens_reparacao_matricula/sql`.

## Purpose and rules

Despite its name, SQL has no registration parameter. It filters state type IN ParamTipo and lancar_material=ParamLancarMat, joins vehicles and optional mechanics, orders numero ascending.

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
mecanicos.Codigo AS Codigo_me,
mecanicos.Descricao AS Descricao_me,
estados_reparacao.lancar_material AS lancar_material
FROM
(
(
ordem_reparacao
INNER JOIN
estados_reparacao
ON ordem_reparacao.reparacao_estado = estados_reparacao.Codigo
)
INNER JOIN
Viaturas
ON ordem_reparacao.matricula = Viaturas.matricula
)
LEFT OUTER JOIN
mecanicos
ON mecanicos.Codigo = ordem_reparacao.reparacao_mecanico
WHERE
(
estados_reparacao.tipo IN ({ParamTipo})
AND estados_reparacao.lancar_material = {ParamLancarMat}
)
ORDER BY
numero ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamTipo, ParamLancarMat.
Dossier parameter-table parser returned 2; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:210 | `QRY_select_ordens_reparacao_matricula.ParamLancarMat=True` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:212 | `QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:214 | `QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:217 | `HDeactivateFilter(QRY_select_ordens_reparacao_matricula)` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:271 | `QRY_select_ordens_reparacao_matricula.ParamLancarMat=True` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:273 | `QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:275 | `QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:278 | `HFilter(QRY_select_ordens_reparacao_matricula,reparacao_mecanico,LIST_mecanicos)` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:365 | `QRY_select_ordens_reparacao_matricula.ParamLancarMat=1` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:367 | `QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2;"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:369 | `QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:466 | `QRY_select_ordens_reparacao_matricula.ParamLancarMat=True` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:468 | `QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:470 | `QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:515 | `QRY_select_ordens_reparacao_matricula.ParamLancarMat=True` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:517 | `QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:519 | `QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:712 | `HDeactivateFilter(QRY_select_ordens_reparacao_matricula)` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:713 | `HCancelDeclaration(QRY_select_ordens_reparacao_matricula)` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:735 | `QRY_select_ordens_reparacao_matricula.ParamLancarMat=True` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:737 | `QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"` |
| WIN_Material_Reparacao | legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:739 | `QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q16-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q16-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
