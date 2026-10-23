# Query mapping — QRY_select_material_reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_material_reparacao.WDR`; `dossier: QRY_select_material_reparacao/sql`.

## Purpose and rules

Filters material rows by order number and sorts material timestamp ascending. Includes per-line mechanic, state, price and lancado.

## SQL from the dossier

```sql
SELECT
material_reparacao.numero AS numero,
material_reparacao.mecanico AS mecanico,
material_reparacao.artigo AS artigo,
material_reparacao.descricao_artigo AS descricao_artigo,
material_reparacao.quantidade AS quantidade,
material_reparacao.data_hora AS data_hora,
material_reparacao.reparacao_estado AS reparacao_estado,
material_reparacao.lancado AS lancado,
material_reparacao.preco AS preco
FROM
material_reparacao
WHERE
material_reparacao.numero = {ParamNumero}
ORDER BY
data_hora ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamNumero.
Dossier parameter-table parser returned 1; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1166 | `HExecuteQuery(QRY_select_material_reparacao,hQueryDefault,numero_ordem_reparacao)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1167 | `hreadfirst(QRY_select_material_reparacao)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1168 | `for each QRY_select_material_reparacao` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1169 | `HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_material_reparacao.mecanico)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1171 | `tableaddline(table_material,QRY_select_material_reparacao.data_hora,QRY_select_material_reparacao.mecanico,QRY_select_mecanicos_codigo.Descricao,QRY_select_material_reparacao.artigo,QRY_select_material_reparacao.descricao_artigo,QRY_select_material_reparacao.quantidade,QRY_select_material_reparacao.preco,QRY_select_material_reparacao.lancado)` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1176 | `HCancelDeclaration(QRY_select_material_reparacao)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q11-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q11-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
