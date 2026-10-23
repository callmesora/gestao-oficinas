# Query mapping — QRY_select_viatura_matricula

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_viatura_matricula.WDR`; `dossier: QRY_select_viatura_matricula/sql`.

## Purpose and rules

Exact registration lookup returning vehicle ownership and descriptive fields. No customer join here.

## SQL from the dossier

```sql
SELECT
Viaturas.matricula AS matricula,
Viaturas.Cliente AS Cliente,
Viaturas.marca AS marca,
Viaturas.modelo AS modelo,
Viaturas.Ano AS Ano,
Viaturas.mes AS mes
FROM
Viaturas
WHERE
Viaturas.matricula = {ParamMatricula}
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamMatricula.
Dossier parameter-table parser returned 1; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:342 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:343 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:344 | `ITEM_Marca_Modelo=QRY_select_viatura_matricula.marca+"  "+QRY_select_viatura_matricula.modelo` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:346 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Form_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:461 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,codigo)` |
| WIN_Form_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:462 | `hreadfirst(QRY_select_viatura_matricula)` |
| WIN_Form_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:463 | `EDT_Matricula=QRY_select_viatura_matricula.matricula` |
| WIN_Form_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:464 | `COMBO_Codigo=QRY_select_viatura_matricula.Cliente` |
| WIN_Form_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:465 | `EDT_Ano=QRY_select_viatura_matricula.ano` |
| WIN_Form_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:466 | `edt_mes=QRY_select_viatura_matricula.mes` |
| WIN_Form_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:467 | `EDT_Modelo=QRY_select_viatura_matricula.modelo` |
| WIN_Form_Viaturas | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:468 | `EDT_Marca=QRY_select_viatura_matricula.marca` |
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:901 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao.matricula)` |
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:902 | `if hreadfirst(QRY_select_viatura_matricula)=true then` |
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:903 | `sQuery is string="update ordem_reparacao set recepcao_cliente='"+QRY_select_viatura_matricula.Cliente+"' where numero='"+QRY_select_ordens_reparacao.numero+"'"` |
| WIN_MENU | legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:908 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:274 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:275 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:276 | `gnCliente=QRY_select_viatura_matricula.Cliente` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:277 | `EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:278 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:303 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:304 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:305 | `gnCliente=QRY_select_viatura_matricula.Cliente` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:306 | `EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:307 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:335 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:386 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:387 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:388 | `gnCliente=QRY_select_viatura_matricula.Cliente` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:389 | `edt_marca_modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:390 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:418 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:419 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:420 | `gnCliente=QRY_select_viatura_matricula.Cliente` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:421 | `EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:422 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:453 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:975 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:976 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:977 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:990 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:991 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:992 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1000 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1006 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1010 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1235 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1236 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1237 | `gnCliente=QRY_select_viatura_matricula.Cliente` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1238 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1263 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1264 | `IF HReadFirst(QRY_select_viatura_matricula)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1265 | `gnCliente=QRY_select_viatura_matricula.Cliente` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1266 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1294 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:728 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:729 | `HReadFirst(QRY_select_viatura_matricula)` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:730 | `EDT_matricula_marca_modelo=QRY_select_ordens_reparacao_numero.matricula+"      "+QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo` |
| WIN_Tempos_Reparacao_Estado | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:731 | `HCancelDeclaration(QRY_select_viatura_matricula)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:489 | `HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:490 | `HReadFirst(QRY_select_viatura_matricula)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:491 | `EDT_matricula_marca_modelo=QRY_select_ordens_reparacao_numero.matricula+cr+QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:492 | `HCancelDeclaration(QRY_select_viatura_matricula)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q21-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q21-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
