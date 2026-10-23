# Query mapping — QRY_update_ordens_reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_update_ordens_reparacao.WDR`; `dossier: QRY_update_ordens_reparacao/sql`.

## Purpose and rules

Updates 26 repair-order fields selected by the old order number ParamNumero_antigo. The new numero can differ. The SQL does not cascade that rename into material/time rows.

## SQL from the dossier

```sql
UPDATE
ordem_reparacao
SET
numero = {ParamNumero},
matricula = {ParamMatricula},
km_viatura = {ParamKM},
recepcao_util = {ParamRecepcao_util},
recepcao_datahora = {ParamRecepcao_data_hora},
recepcao_cliente = {ParamRecepcao_cliente},
recepcao_terceiro = {ParamRecepcao_Terceiro},
recepacao_contatos = {ParamRecepcao_contactos},
recepcao_servico = {ParamRecepcao_servico},
recepcao_obs = {ParamRecepcao_obs},
recepcao_entrega_prevista = {ParamRecepcao_entrega},
recepcao_prioridade = {ParamRecepcao_prioridade},
reparacao_mecanico = {ParamReparacao_mecanico},
reparacao_estado = {ParamReparacao_estado},
reparacao_estado_obs = {ParamReparacao_estado_obs},
reparacao_servico = {ParamReparacao_servico},
reparacao_estado_data = {ParamReparacao_estado_data},
reparacao_estado_historico = {ParamReparacao_estado_historico},
totaL_mao_obra = {ParamTotal_mao_obra},
total_pecas = {ParamTotal_pecas},
total_desconto = {ParamTotal_desconto},
total_reparacao = {ParamTotal_reparacao},
faturado = {ParamFaturado},
total_pago = {ParamTotal_pago},
numero_fatura = {ParamNumero_fatura},
data_pagamento = {ParamDataPagamento}
WHERE
ordem_reparacao.numero = {ParamNumero_antigo}
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamNumero, ParamMatricula, ParamKM, ParamRecepcao_util, ParamRecepcao_data_hora, ParamRecepcao_cliente, ParamRecepcao_Terceiro, ParamRecepcao_contactos, ParamRecepcao_servico, ParamRecepcao_obs, ParamRecepcao_entrega, ParamRecepcao_prioridade, ParamReparacao_mecanico, ParamReparacao_estado, ParamReparacao_estado_obs, ParamReparacao_servico, ParamReparacao_estado_data, ParamReparacao_estado_historico, ParamTotal_mao_obra, ParamTotal_pecas, ParamTotal_desconto, ParamTotal_reparacao, ParamFaturado, ParamTotal_pago, ParamNumero_fatura, ParamDataPagamento, ParamNumero_antigo.
Dossier parameter-table parser returned 17; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1068 | `QRY_update_ordens_reparacao.ParamNumero_antigo=EDT_Ordem_n` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1070 | `QRY_update_ordens_reparacao.ParamFaturado=CBOX_faturado` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1071 | `QRY_update_ordens_reparacao.ParamKM=EDT_KM` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1072 | `QRY_update_ordens_reparacao.ParamMatricula=EDT_matricula` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1073 | `QRY_update_ordens_reparacao.ParamNumero=EDT_Ordem_n` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1074 | `QRY_update_ordens_reparacao.ParamNumero_fatura=EDT_Nr_Fatura` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1075 | `QRY_update_ordens_reparacao.ParamRecepcao_contactos=EDT_Contactos` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1076 | `QRY_update_ordens_reparacao.ParamRecepcao_data_hora=EDT_data_HORA_entrada` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1077 | `QRY_update_ordens_reparacao.ParamRecepcao_entrega=EDT_data_entrega` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1078 | `QRY_update_ordens_reparacao.ParamRecepcao_obs=EDT_observacao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1079 | `QRY_update_ordens_reparacao.ParamRecepcao_cliente=gnCliente` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1080 | `QRY_update_ordens_reparacao.ParamRecepcao_Terceiro=EDT_Terceiro` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1081 | `QRY_update_ordens_reparacao.ParamRecepcao_prioridade=COMBO_Prioridade` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1082 | `QRY_update_ordens_reparacao.ParamRecepcao_servico=EDT_servico_avaria` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1083 | `QRY_update_ordens_reparacao.ParamRecepcao_util=COMBO_Recepcionado` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1084 | `QRY_update_ordens_reparacao.ParamReparacao_estado=COMBO_estado..StoredValue` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1085 | `//	QRY_update_ordens_reparacao.ParamReparacao_estado_data=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1086 | `//	QRY_update_ordens_reparacao.ParamReparacao_estado_historico=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1087 | `//	QRY_update_ordens_reparacao.ParamReparacao_estado_obs=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1088 | `QRY_update_ordens_reparacao.ParamReparacao_mecanico=COMBO_mecanico` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1089 | `//	QRY_update_ordens_reparacao.ParamReparacao_servico=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1090 | `//	QRY_update_ordens_reparacao.ParamTotal_desconto=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1091 | `//	QRY_update_ordens_reparacao.ParamTotal_mao_obra=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1092 | `QRY_update_ordens_reparacao.ParamTotal_pago=EDT_Total_Pago` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1093 | `//	QRY_update_ordens_reparacao.ParamTotal_pecas=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1094 | `//	QRY_update_ordens_reparacao.ParamTotal_reparacao=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1095 | `QRY_update_ordens_reparacao.ParamDataPagamento=EDT_Data_pagamento` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1096 | `HExecuteQuery(QRY_update_ordens_reparacao,hQueryDefault)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q30-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q30-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
