# Query mapping — QRY_select_ordens_reparacao_numero

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_ordens_reparacao_numero.WDR`; `dossier: QRY_select_ordens_reparacao_numero/sql`.

## Purpose and rules

Single-order lookup by numero returning the base order fields without vehicle/customer joins. Caller supplies ParamOrdem.

## SQL from the dossier

```sql
SELECT
ordem_reparacao.ordem_reparacaoID AS ordem_reparacaoID,
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
ordem_reparacao.recepcao_cliente AS recepcao_cliente,
ordem_reparacao.data_pagamento AS data_pagamento,
ordem_reparacao.recepcao_terceiro AS recepcao_terceiro
FROM
ordem_reparacao
WHERE
ordem_reparacao.numero = {ParamOrdem}
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamOrdem.
Dossier parameter-table parser returned 1; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:339 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,gNumero_ordem_rep)` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:340 | `IF HReadFirst(QRY_select_ordens_reparacao_numero)=True THEN` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:341 | `item_matricula=QRY_select_ordens_reparacao_numero.matricula` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:342 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:347 | `item_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:348 | `item_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:349 | `item_contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:350 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.recepcao_cliente)` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:356 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:760 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.reparacao_mecanico)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:872 | `QRY_insert_material_reparacao.ParamReparacaoEstado=QRY_select_ordens_reparacao_numero.reparacao_estado` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:883 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:909 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.reparacao_mecanico)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1152 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero_ordem_reparacao)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1153 | `hreadfirst(QRY_select_ordens_reparacao_numero)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1154 | `EDT_matricula=QRY_select_ordens_reparacao_numero.matricula` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1156 | `hreadseek(mecanicos,Codigo,QRY_select_ordens_reparacao_numero.reparacao_mecanico,hIdentical)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1432 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,gOrdem_numero)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1433 | `hreadfirst(QRY_select_ordens_reparacao_numero)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1434 | `EDT_Ordem_n=QRY_select_ordens_reparacao_numero.numero` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1435 | `EDT_data_hora_entrada=QRY_select_ordens_reparacao_numero.recepcao_datahora` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1436 | `EDT_data_entrega=QRY_select_ordens_reparacao_numero.recepcao_entrega_prevista` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1437 | `EDT_KM=QRY_select_ordens_reparacao_numero.km_viatura` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1438 | `EDT_matricula=QRY_select_ordens_reparacao_numero.matricula` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1440 | `EDT_Contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1441 | `EDT_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1442 | `EDT_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1443 | `COMBO_mecanico=QRY_select_ordens_reparacao_numero.reparacao_mecanico` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1444 | `COMBO_Recepcionado=QRY_select_ordens_reparacao_numero.recepcao_util` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1445 | `EDT_Nr_Fatura=QRY_select_ordens_reparacao_numero.numero_fatura` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1446 | `CBOX_faturado=QRY_select_ordens_reparacao_numero.faturado` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1447 | `EDT_Total_Pago=QRY_select_ordens_reparacao_numero.total_pago` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1448 | `EDT_Data_pagamento=QRY_select_ordens_reparacao_numero.data_pagamento` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1449 | `EDT_Terceiro=QRY_select_ordens_reparacao_numero.recepcao_terceiro` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1471 | `listselectplus(COMBO_estado,listseek(COMBO_estado,QRY_select_ordens_reparacao_numero.reparacao_estado))` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1477 | `ListSelectPlus(COMBO_Prioridade,QRY_select_ordens_reparacao_numero.recepcao_prioridade)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1503 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:354 | `if QRY_select_ordens_reparacao_numero.reparacao_estado_historico="" then` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:357 | `sHistorico=QRY_select_ordens_reparacao_numero.reparacao_estado_historico+CR+CR+DateToString(EDT_Data_Hora,"DD/MM/YYYY HH:mm")+"    "+TABLE_Estados_reparacao.COL_Descricao+cr+EDT_descricao` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:725 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:726 | `hreadfirst(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:728 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:730 | `EDT_matricula_marca_modelo=QRY_select_ordens_reparacao_numero.matricula+"      "+QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:733 | `EDT_obs_servico=QRY_select_ordens_reparacao_numero.reparacao_servico` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:734 | `EDT_historico=QRY_select_ordens_reparacao_numero.reparacao_estado_historico` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:739 | `TableSelectPlus(TABLE_Estados_reparacao,TableSeek(TABLE_Estados_reparacao.COL_Codigo,QRY_select_ordens_reparacao_numero.reparacao_estado))` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:764 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:382 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:383 | `if hreadfirst(QRY_select_ordens_reparacao_numero)=true then` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:384 | `EDT_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:385 | `EDT_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:386 | `EDT_contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:387 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.recepcao_Cliente)` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:393 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:334 | `hexecutequery(QRY_select_ordens_reparacao_numero,hQueryDefault,QRY_select_tempos_Reparacao_numero.numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:335 | `if hreadfirst(QRY_select_ordens_reparacao_numero)=true then` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:336 | `SWITCH yesno(0,"Terminar a reparação de "+QRY_select_ordens_reparacao_numero.matricula+" ?")` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:339 | `query="UPDATE tempos_reparacao SET fim ='"+SysDateTime()+"',fim_reparacao_estado ='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"' WHERE tempos_reparacao.numero ='"+QRY_select_tempos_Reparacao_numero.numero+"' AND tempos_reparacao.mecanico ='"+gsMecanico_ativo+"' and tempos_reparacao.fim='00000000000000000'"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:351 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:355 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:356 | `HReadFirst(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:361 | `query="UPDATE tempos_reparacao SET fim ='"+sysdatetime()+"',fim_reparacao_estado ='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"' WHERE tempos_reparacao.numero ='"+numero+"' AND tempos_reparacao.mecanico ='"+gsMecanico_ativo+"' and tempos_reparacao.inicio='"+QRY_select_tempos_Reparacao_numero_mecanico.inicio+"'"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:365 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:366 | `HReadFirst(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:368 | `query="select * from estados_reparacao where codigo='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"'"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:373 | `query="INSERT INTO tempos_reparacao (numero,mecanico,inicio,Inicio_reparacao_estado) VALUES ('"+numero+"','"+gsMecanico_ativo+"','"+SysDateTime()+"','"+QRY_select_ordens_reparacao_numero.reparacao_estado+"')"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:385 | `query="INSERT INTO tempos_reparacao (numero,mecanico,inicio,Inicio_reparacao_estado) VALUES ('"+numero+"','"+gsMecanico_ativo+"','"+SysDateTime()+"','"+QRY_select_ordens_reparacao_numero.reparacao_estado+"')"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:390 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:396 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:399 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:400 | `HReadFirst(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:402 | `query="select * from estados_reparacao where codigo='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"'"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:407 | `query="INSERT INTO tempos_reparacao (numero,mecanico,inicio,Inicio_reparacao_estado) VALUES ('"+numero+"','"+gsMecanico_ativo+"','"+SysDateTime()+"','"+QRY_select_ordens_reparacao_numero.reparacao_estado+"')"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:419 | `query="INSERT INTO tempos_reparacao (numero,mecanico,inicio,Inicio_reparacao_estado) VALUES ('"+numero+"','"+gsMecanico_ativo+"','"+SysDateTime()+"','"+QRY_select_ordens_reparacao_numero.reparacao_estado+"')"` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:424 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:430 | `HCancelDeclaration(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:481 | `HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:482 | `hreadfirst(QRY_select_ordens_reparacao_numero)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:489 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:491 | `EDT_matricula_marca_modelo=QRY_select_ordens_reparacao_numero.matricula+cr+QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q17-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q17-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
