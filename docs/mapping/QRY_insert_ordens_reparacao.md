# Query mapping — QRY_insert_ordens_reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_insert_ordens_reparacao.WDR`; `dossier: QRY_insert_ordens_reparacao/sql`.

## Purpose and rules

Inserts 26 repair-order fields, including customer/third party, service and contact memos, totals, invoice and payment date. It does not create material/time rows or allocate the next order number.

## SQL from the dossier

```sql
INSERT INTO ordem_reparacao
(
numero,
matricula,
km_viatura,
recepcao_util,
recepcao_datahora,
recepcao_cliente,
recepcao_terceiro,
recepacao_contatos,
recepcao_servico,
recepcao_obs,
recepcao_entrega_prevista,
recepcao_prioridade,
reparacao_mecanico,
reparacao_estado,
reparacao_estado_obs,
reparacao_servico,
reparacao_estado_data,
reparacao_estado_historico,
totaL_mao_obra,
total_pecas,
total_desconto,
total_reparacao,
faturado,
total_pago,
numero_fatura,
data_pagamento
)
VALUES
(
{ParamNumero},
{ParamMatricula},
{ParamKM},
{ParamRecepcao_util},
{ParamRecepcao_data_hora},
{ParamRecepcao_cliente},
{ParamRecepcao_Terceiro},
{ParamRecepcao_contactos},
{ParamRecepcao_servico},
{ParamRecepcao_obs},
{ParamRecepcao_entrega},
{ParamRecepcao_prioridade},
{ParamReparacao_mecanico},
{ParamReparacao_estado},
{ParamReparacao_estado_obs},
{ParamReparacao_servico},
{ParamReparacao_estado_data},
{ParamReparacao_estado_historico},
{ParamTotal_mao_obra},
{ParamTotal_pecas},
{ParamTotal_desconto},
{ParamTotal_reparacao},
{ParamFaturado},
{ParamTotal_pago},
{ParamNumero_fatura},
{ParamDataPagamento}
 )
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamNumero, ParamMatricula, ParamKM, ParamRecepcao_util, ParamRecepcao_data_hora, ParamRecepcao_cliente, ParamRecepcao_Terceiro, ParamRecepcao_contactos, ParamRecepcao_servico, ParamRecepcao_obs, ParamRecepcao_entrega, ParamRecepcao_prioridade, ParamReparacao_mecanico, ParamReparacao_estado, ParamReparacao_estado_obs, ParamReparacao_servico, ParamReparacao_estado_data, ParamReparacao_estado_historico, ParamTotal_mao_obra, ParamTotal_pecas, ParamTotal_desconto, ParamTotal_reparacao, ParamFaturado, ParamTotal_pago, ParamNumero_fatura, ParamDataPagamento.
Dossier parameter-table parser returned 16; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1098 | `QRY_insert_ordens_reparacao.ParamFaturado=CBOX_faturado` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1099 | `QRY_insert_ordens_reparacao.ParamKM=EDT_KM` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1100 | `QRY_insert_ordens_reparacao.ParamMatricula=EDT_matricula` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1101 | `QRY_insert_ordens_reparacao.ParamNumero=EDT_Ordem_n` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1102 | `QRY_insert_ordens_reparacao.ParamNumero_fatura=EDT_Nr_Fatura` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1103 | `QRY_insert_ordens_reparacao.ParamRecepcao_contactos=EDT_Contactos` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1104 | `QRY_insert_ordens_reparacao.ParamRecepcao_data_hora=EDT_data_hora_entrada` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1105 | `QRY_insert_ordens_reparacao.ParamRecepcao_entrega=EDT_data_entrega` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1106 | `QRY_insert_ordens_reparacao.ParamRecepcao_obs=EDT_observacao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1107 | `QRY_insert_ordens_reparacao.ParamRecepcao_prioridade=COMBO_Prioridade` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1108 | `QRY_insert_ordens_reparacao.ParamRecepcao_servico=EDT_servico_avaria` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1109 | `QRY_insert_ordens_reparacao.ParamRecepcao_util=COMBO_Recepcionado` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1110 | `QRY_insert_ordens_reparacao.ParamRecepcao_cliente=gnCliente` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1111 | `QRY_insert_ordens_reparacao.ParamRecepcao_Terceiro=EDT_Terceiro` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1112 | `QRY_insert_ordens_reparacao.ParamReparacao_estado=COMBO_estado..StoredValue` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1113 | `//	QRY_insert_ordens_reparacao.ParamReparacao_estado_data=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1114 | `//	QRY_insert_ordens_reparacao.ParamReparacao_estado_historico=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1115 | `//	QRY_insert_ordens_reparacao.ParamReparacao_estado_obs=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1116 | `QRY_insert_ordens_reparacao.ParamReparacao_mecanico=COMBO_mecanico` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1117 | `//	QRY_insert_ordens_reparacao.ParamReparacao_servico=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1118 | `//	QRY_insert_ordens_reparacao.ParamTotal_desconto=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1119 | `//	QRY_insert_ordens_reparacao.ParamTotal_mao_obra=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1120 | `QRY_insert_ordens_reparacao.ParamTotal_pago=EDT_Total_Pago` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1121 | `//	QRY_insert_ordens_reparacao.ParamTotal_pecas=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1122 | `//	QRY_insert_ordens_reparacao.ParamTotal_reparacao=` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1123 | `QRY_insert_ordens_reparacao.Paramdatapagamento=EDT_Data_pagamento` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1124 | `HExecuteQuery(QRY_insert_ordens_reparacao,hQueryDefault)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q03-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q03-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
