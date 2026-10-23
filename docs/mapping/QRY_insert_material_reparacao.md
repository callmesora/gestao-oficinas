# Query mapping — QRY_insert_material_reparacao

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_insert_material_reparacao.WDR`; `dossier: QRY_insert_material_reparacao/sql`.

## Purpose and rules

Inserts nine material fields into material_reparacao, including order number, mechanic, article, quantity, timestamp, state, price and lancado flag. It does not adjust stock in this SQL; callers own those mutations.

## SQL from the dossier

```sql
INSERT INTO material_reparacao
(
numero,
mecanico,
artigo,
descricao_artigo,
quantidade,
data_hora,
reparacao_estado,
preco,
lancado
)
VALUES
(
{ParamNumero},
{ParamMecanico},
{ParamArtigo},
{ParamDescricaoArtigo},
{ParamQuantidade},
{ParamDataHora},
{ParamReparacaoEstado},
{ParamPreco},
{ParamLancado}
 )
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamNumero, ParamMecanico, ParamArtigo, ParamDescricaoArtigo, ParamQuantidade, ParamDataHora, ParamReparacaoEstado, ParamPreco, ParamLancado.
Dossier parameter-table parser returned 0; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:865 | `QRY_insert_material_reparacao.ParamArtigo=TABLE_material.COL_codigo_artigo` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:866 | `QRY_insert_material_reparacao.ParamDataHora=TABLE_material.COL_data_hora` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:867 | `QRY_insert_material_reparacao.ParamDescricaoArtigo=TABLE_material.COL_descricao_artigo` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:868 | `QRY_insert_material_reparacao.ParamMecanico=TABLE_material.COL_mecanico_codigo` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:869 | `QRY_insert_material_reparacao.ParamNumero=numero_ordem_reparacao` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:870 | `QRY_insert_material_reparacao.ParamPreco=TABLE_material.COL_preco` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:871 | `QRY_insert_material_reparacao.ParamQuantidade=TABLE_material.COL_quant` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:872 | `QRY_insert_material_reparacao.ParamReparacaoEstado=QRY_select_ordens_reparacao_numero.reparacao_estado` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:873 | `QRY_insert_material_reparacao.ParamLancado=TABLE_material.COL_Lancado` |
| WIN_Material_reparacao_form | legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:874 | `HExecuteQuery(QRY_insert_material_reparacao,hQueryDefault)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q02-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q02-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
