# Query mapping — QRY_select_cliente_codigo

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_cliente_codigo.WDR`; `dossier: QRY_select_cliente_codigo/sql`.

## Purpose and rules

Exact customer business-code lookup. Returns contact and address fields, not an automatic-ID lookup.

## SQL from the dossier

```sql
SELECT
Clientes.Codigo AS Codigo,
Clientes.Descricao AS Descricao,
Clientes.Morada1 AS Morada1,
Clientes.Morada2 AS Morada2,
Clientes.codpostal AS codpostal,
Clientes.Telefone1 AS Telefone1,
Clientes.Telemovel AS Telemovel,
Clientes.observacao AS observacao
FROM
Clientes
WHERE
Clientes.Codigo = {ParamCodigo_Cliente}
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamCodigo_Cliente.
Dossier parameter-table parser returned 1; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:350 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.recepcao_cliente)` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:351 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:352 | `item_cliente=QRY_select_cliente_codigo.Descricao` |
| RPT_Servico_Avaria | legacy/GestaoOficinas_TesteIA/RPT_Servico_Avaria.wde:354 | `HCancelDeclaration(QRY_select_cliente_codigo)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:278 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:279 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:280 | `EDT_Cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:281 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:282 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:284 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:285 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:287 | `IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:288 | `EDT_Contactos=QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:307 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:308 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:309 | `EDT_Cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:310 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:311 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:313 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:314 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:316 | `IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:317 | `EDT_Contactos=QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:336 | `HCancelDeclaration(QRY_select_cliente_codigo)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:390 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:391 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:392 | `EDT_Cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:393 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:394 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:396 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:397 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:399 | `IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:400 | `EDT_Contactos=QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:422 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:423 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:424 | `EDT_Cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:425 | `if NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" and NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" then` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:426 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:428 | `if NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" then` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:429 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:431 | `if NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" then` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:432 | `EDT_Contactos=QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:454 | `HCancelDeclaration(QRY_select_cliente_codigo)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:977 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:978 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:979 | `EDT_Cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:981 | `HCancelDeclaration(QRY_select_cliente_codigo)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:992 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:993 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:994 | `EDT_Cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:996 | `HCancelDeclaration(QRY_select_cliente_codigo)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1011 | `HCancelDeclaration(QRY_select_cliente_codigo)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1238 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1239 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1240 | `EDT_Cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1241 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1242 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1244 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1245 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1247 | `IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1248 | `EDT_Contactos=QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1266 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1267 | `IF HReadFirst(QRY_select_cliente_codigo)=True THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1268 | `EDT_Cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1269 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1270 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1272 | `IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1273 | `EDT_Contactos=QRY_select_cliente_codigo.Telefone1` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1275 | `IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1276 | `EDT_Contactos=QRY_select_cliente_codigo.Telemovel` |
| WIN_Ordens_Reparacao_Form | legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1295 | `HCancelDeclaration(QRY_select_cliente_codigo)` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:387 | `HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.recepcao_Cliente)` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:388 | `if hreadfirst(QRY_select_cliente_codigo)=true then` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:389 | `EDT_cliente=QRY_select_cliente_codigo.Descricao` |
| WIN_Tempos_Reparacao_Informacao | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:391 | `HCancelDeclaration(QRY_select_cliente_codigo)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q07-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q07-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
