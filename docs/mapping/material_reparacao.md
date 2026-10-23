# Table mapping — material_reparacao

Material consumption per repair numero, article business code, quantity, price, mechanic and timestamp. Save/delete code also changes article stock.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#material_reparacao`.

Export rows read and source count: 72768 / 72768. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| material_reparacaoID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| numero | Unsigned 8-byte integer | 8 | duplicates | True | 0 | Proposal for later framing, U-T07-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| mecanico | Unsigned 1-byte integer | 1 | duplicates | True | 0 | None |
| artigo | String | 30 | duplicates | True |  | None |
| descricao_artigo | String | 100 | None | True |  | None |
| quantidade | Decimal | 4 | None | True | 0 | Proposal for later framing, U-T07-02: exact decimal: SQLite has none; choose integer minor units (scale?) or TEXT decimals |
| data_hora | Date and Time (yyyymmddhhmmssccc) | 8 | None | True |  | Proposal for later framing, U-T07-02: kept as WINDEV yyyymmddhhmmssccc text, or ISO 8601? Empty/sentinel values keep their meaning |
| reparacao_estado | String | 3 | None | True |  | None |
| preco | 8-byte real | 8 | None | True | 0 | Proposal for later framing, U-T07-02: binary floating point: if this holds money or quantities, use integer minor units or TEXT decimals |
| lancado | Boolean | 1 | None | True | 0 | None |
| extra | Boolean | 1 | None | True | 0 | None |

## Keys

- material_reparacaoID: unique; columns material_reparacaoID.
- numero: duplicates; columns numero.
- mecanico: duplicates; columns mecanico.
- artigo: duplicates; columns artigo.

## Data findings

- artigo: 5 values with leading or trailing spaces: keep, or trim in the import? [U-T07-02]
- descricao_artigo: 3240 values with leading or trailing spaces: keep, or trim in the import? [U-T07-02]
- Key profile: {"table": "material_reparacao", "key": "material_reparacaoID", "columns": ["material_reparacaoID"], "duplicates": 0}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "material_reparacao.mecanico", "to": "mecanicos.Codigo", "orphans": 0, "orphan_values": 0, "zero": 0, "rows": 72768}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "material_reparacao.artigo", "to": "artigos.Codigo", "orphans": 54, "orphan_values": 12, "zero": 0, "rows": 72768}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "material_reparacao.numero", "to": "ordem_reparacao.numero", "orphans": 0, "orphan_values": 0, "zero": 0, "rows": 72768}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T07-01).

The 54 profiled article-orphan rows can be suppressed by the mandatory article join in dossier: QRY_union_material_reparacao/sql. U-T07-01 retains enforcement uncertainty.

## Source usage and implicit contract

- WIN_Inventario_Reconstrucao: legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:197-260
- WIN_Material_reparacao_form: legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:845-884
- WIN_Ordens_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1174-1195
- WIN_Ordens_Reparacao_Form: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:370-454
- WIN_Reconstrucao_Stocks: legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:197-260
- WIN_Table_artigos: legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:320-352
- WIN_Table_Tempos_materiais_Descricoes: legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:721-767; legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:963-969; legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1004-1054

## Unresolved and framing inputs

- U-T07-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T07-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T07-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
