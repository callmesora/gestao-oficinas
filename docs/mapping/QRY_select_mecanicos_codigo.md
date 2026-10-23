# Query mapping — QRY_select_mecanicos_codigo

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_mecanicos_codigo.WDR`; `dossier: QRY_select_mecanicos_codigo/sql`.

## Purpose and rules

Exact mechanic Codigo lookup, including inactive and password fields. Never expose actual password values in documentation or UI previews.

## SQL from the dossier

```sql
SELECT
mecanicos.Codigo AS Codigo,
mecanicos.Descricao AS Descricao,
mecanicos.palavra_passe AS palavra_passe,
mecanicos.inativo AS inativo
FROM
mecanicos
WHERE
mecanicos.Codigo = {ParamCodigo}
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamCodigo.
Dossier parameter-table parser returned 1; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:287 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,sMecanico)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:288 | `hreadfirst(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:289 | `if QRY_select_mecanicos_codigo.inativo=true then` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:292 | `IF QRY_select_mecanicos_codigo.Codigo=gsMecanico_ativo THEN` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:293 | `EDT_mecanico=QRY_select_mecanicos_codigo.Descricao` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:298 | `IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:299 | `gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:300 | `EDT_mecanico=QRY_select_mecanicos_codigo.Descricao` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:307 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:760 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.reparacao_mecanico)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:761 | `HReadFirst(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:762 | `if QRY_select_mecanicos_codigo.inativo=true then` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:764 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:770 | `IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:771 | `gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:772 | `EDT_mecanico=QRY_select_mecanicos_codigo.Descricao` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:773 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:776 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:780 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:909 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.reparacao_mecanico)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:910 | `HReadFirst(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:914 | `IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:915 | `gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:916 | `EDT_mecanico=QRY_select_mecanicos_codigo.Descricao` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:917 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:920 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:924 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1169 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_material_reparacao.mecanico)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1170 | `hreadfirst(QRY_select_mecanicos_codigo)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1171 | `tableaddline(table_material,QRY_select_material_reparacao.data_hora,QRY_select_material_reparacao.mecanico,QRY_select_mecanicos_codigo.Descricao,QRY_select_material_reparacao.artigo,QRY_select_material_reparacao.descricao_artigo,QRY_select_material_reparacao.quantidade,QRY_select_material_reparacao.preco,QRY_select_material_reparacao.lancado)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1172 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:244 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,sMecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:245 | `hreadfirst(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:246 | `if QRY_select_mecanicos_codigo.Codigo=gsMecanico_ativo then` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:247 | `EDT_mecanico=QRY_select_mecanicos_codigo.Descricao` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:252 | `if sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:253 | `gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:254 | `EDT_mecanico=QRY_select_mecanicos_codigo.Descricao` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:257 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:262 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:306 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,mecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:307 | `HReadFirst(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:311 | `IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:312 | `gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:313 | `EDT_mecanico=QRY_select_mecanicos_codigo.Descricao` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:314 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:317 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:322 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:484 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,mecanico)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:485 | `HReadFirst(QRY_select_mecanicos_codigo)` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:486 | `EDT_mecanico=QRY_select_mecanicos_codigo.Descricao` |
| WIN_Tempos_Reparacao_Tempo | legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:487 | `HCancelDeclaration(QRY_select_mecanicos_codigo)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q12-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q12-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
