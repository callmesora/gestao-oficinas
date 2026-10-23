# Query mapping — QRY_select_consumo_material_viatura

Evidence: `legacy/GestaoOficinas_TesteIA/QRY_select_consumo_material_viatura.WDR`; `dossier: QRY_select_consumo_material_viatura/sql`.

## Purpose and rules

Inner joins materials, articles, orders, mechanics and vehicles. Filters material timestamp, article and registration inclusive ranges, sorts registration then order reception time. Missing join partners suppress rows.

## SQL from the dossier

```sql
SELECT
material_reparacao.numero AS numero,
material_reparacao.data_hora AS data_hora,
material_reparacao.mecanico AS mecanico,
material_reparacao.artigo AS artigo,
material_reparacao.descricao_artigo AS descricao_artigo,
material_reparacao.quantidade AS quantidade,
artigos.Codigo AS Codigo,
artigos.Descricao AS Descricao,
artigos.codbarras AS codbarras,
artigos.unidade AS unidade,
artigos.preco AS preco,
artigos.inativo AS inativo,
ordem_reparacao.numero AS numero_or,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.reparacao_mecanico AS reparacao_mecanico,
mecanicos.Codigo AS Codigo_me,
mecanicos.Descricao AS Descricao_me,
Viaturas.matricula AS matricula_Vi,
Viaturas.marca AS marca,
Viaturas.modelo AS modelo,
ordem_reparacao.recepcao_datahora AS recepcao_datahora
FROM
artigos,
ordem_reparacao,
mecanicos,
Viaturas,
material_reparacao
WHERE
artigos.Codigo = material_reparacao.artigo
AND material_reparacao.numero = ordem_reparacao.numero
AND material_reparacao.mecanico = mecanicos.Codigo
AND ordem_reparacao.matricula = Viaturas.matricula
AND
(
material_reparacao.data_hora BETWEEN {ParamDaData} AND {ParamAData}
AND material_reparacao.artigo BETWEEN {ParamDoArtigo} AND {ParamAoArtigo}
AND ordem_reparacao.matricula BETWEEN {ParamDaViatura} AND {ParamAViatura}
)
ORDER BY
matricula ASC,
recepcao_datahora ASC
```

This is evidence text, not executable target SQL. Preserve join type, duplicate retention, filter inclusion and ordering. Dossier typography may distort quotes or accents; reconcile literal text with callers and designer imagery before porting.

## Parameters and callers

Placeholders read directly from SQL: ParamDaData, ParamAData, ParamDoArtigo, ParamAoArtigo, ParamDaViatura, ParamAViatura.
Dossier parameter-table parser returned 0; SQL placeholders above take precedence for inventory completeness.

| Caller | Source | Matching line |
|---|---|---|
| RPT_Consumo_Material_Viatura_Descriminado | legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Viatura_Descriminado.wde:208 | `STC_matricula=QRY_select_consumo_material_viatura.matricula` |
| RPT_Consumo_Material_Viatura_Descriminado | legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Viatura_Descriminado.wde:209 | `STC_marca_modelo=QRY_select_consumo_material_viatura.marca+" "+QRY_select_consumo_material_viatura.modelo` |
| RPT_Consumo_Material_Viatura_Resumo | legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Viatura_Resumo.wde:194 | `STC_matricula=QRY_select_consumo_material_viatura.matricula` |
| RPT_Consumo_Material_Viatura_Resumo | legacy/GestaoOficinas_TesteIA/RPT_Consumo_Material_Viatura_Resumo.wde:195 | `STC_marca_modelo=QRY_select_consumo_material_viatura.marca+" "+QRY_select_consumo_material_viatura.modelo` |

### Designer-bound report consumers

These named source bindings establish report reachability independently of literal query-name matches. Arguments below are in caller order, not the parameter parser order.

| Report | Source binding and contract |
|---|---|
| RPT_Consumo_Material_Viatura_Descriminado | dossier: RPT_Consumo_Material_Viatura_Descriminado/lines; docs/reports/RPT_Consumo_Material_Viatura_Descriminado.md; docs/mapping/RPT_Consumo_Material_Viatura_Descriminado.md |
| RPT_Consumo_Material_Viatura_Resumo | dossier: RPT_Consumo_Material_Viatura_Resumo/lines; docs/reports/RPT_Consumo_Material_Viatura_Resumo.md; docs/mapping/RPT_Consumo_Material_Viatura_Resumo.md |

| Printing caller | Source | Exact initialization/print statement |
|---|---|---|
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:428 | `iInitReportQuery(RPT_Consumo_Material_Viatura_Resumo,da_data,a_data,EDT_do_artigo1,EDT_Ao_artigo1,EDT_Da_viatura,EDT_a_viatura)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:429 | `iPrintReport(RPT_Consumo_Material_Viatura_Resumo)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:432 | `iInitReportQuery(RPT_Consumo_Material_Viatura_Descriminado,da_data,a_data,EDT_Do_artigo1,EDT_Ao_artigo1,EDT_Da_viatura,EDT_a_viatura)` |
| WIN_Filtro_Mapas_Artigos | legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:433 | `iPrintReport(RPT_Consumo_Material_Viatura_Descriminado)` |

## Data and behavior checklist

- Query results depend on the caller assigning parameters and executing/re-executing; SQL by itself does not define table selection, refresh or current-buffer behavior.
- Omitted/null parameter conditions follow HFSQL semantics; empty text, numeric zero and an omitted argument are distinct. No runtime query was executed in Step 0.
- Money, duration, date sentinels, accented text and trailing-space behavior follow docs/wlanguage-traps.md and docs/porting.md. No conversion is approved here.

## Unresolved and proposed changes

- U-Q08-03: Confirm runtime omission/null/collation behavior and any PDF quote/character substitutions on known inputs. Resolution: WINDEV query test or recorded caller scenario; interim: preserve source semantics; does not prevent mapping.
- U-Q08-04: Caller failure/empty-result paths and UI state must be covered by each caller screen spec; a standalone SQL result cannot settle them. No redesign or bug fix approved.
- U-Q08-02: Listed designer bindings and printing calls establish these paths. Only additional dynamic/designer consumers remain to be inventoried; interim: retain known paths, do not exclude this query. No known report reachability blocker remains.
