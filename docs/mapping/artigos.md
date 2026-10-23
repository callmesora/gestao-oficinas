# Table mapping — artigos

Article master with code, description, barcode, unit, price, inactive flag and stock quantity. Stock is maintained by workflow code.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#artigos`.

Export rows read and source count: 15558 / 15558. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| artigosID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| Codigo | String | 30 | unique | True |  | None |
| Descricao | String | 100 | duplicates | True |  | None |
| codbarras | String | 30 | None | True |  | None |
| unidade | String | 3 | duplicates | True |  | None |
| preco | 8-byte real | 8 | None | True | 0 | Proposal for later framing, U-T04-02: binary floating point: if this holds money or quantities, use integer minor units or TEXT decimals |
| inativo | Boolean | 1 | None | True | 0 | None |
| stock | Decimal | 7 | None | True | 0 | Proposal for later framing, U-T04-02: exact decimal: SQLite has none; choose integer minor units (scale?) or TEXT decimals |

## Keys

- artigosID: unique; columns artigosID.
- Codigo: unique; columns Codigo.
- Descricao: duplicates; columns Descricao.
- unidade: duplicates; columns unidade.

## Data findings

- Codigo: 4 values with leading or trailing spaces: keep, or trim in the import? [U-T04-02]
- Descricao: 2008 values with leading or trailing spaces: keep, or trim in the import? [U-T04-02]
- stock: 7885 zeros of 15558: does 0 mean empty here (dossier 'Blank if zero')? [U-T04-02]
- stock: maximum 713609 is over 20 × the 99th percentile (2): typo or real? [U-T04-02]
- Key profile: {"table": "artigos", "key": "artigosID", "columns": ["artigosID"], "duplicates": 0}
- Key profile: {"table": "artigos", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "artigos.unidade", "to": "unidades.Codigo", "orphans": 0, "orphan_values": 0, "zero": 0, "rows": 15558}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T04-01).

## Source usage and implicit contract

- WIN_Form_artigos: legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:38-98; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:451-470
- WIN_Inventario_Reconstrucao: legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:197-260
- WIN_Leitor_cod_barras: legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:329-390
- WIN_Material_reparacao_form: legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:701-712; legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:758-795; legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:845-884; legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1274-1313
- WIN_MENU: legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:952-975
- WIN_Reconstrucao_Stocks: legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:197-260
- WIN_Table_artigos: legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:259-268; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:320-352; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:555-560; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:601-680; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:704-709; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:729-734; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:754-759; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:784-784
- WIN_Table_cab_stocks: legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:860-907
- WIN_Table_Lin_Stocks: legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:601-635; legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:778-788; legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:853-931
- WIN_Table_unidades: legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:241-262

## Unresolved and framing inputs

- U-T04-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T04-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T04-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
