# Table mapping — documentos

Document-code master; stock direction and obriga_macanico control stock-entry workflows.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#documentos`.

Export rows read and source count: 4 / 4. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| documentosID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| Codigo | String | 3 | unique | True |  | None |
| Descricao | String | 50 | duplicates | True |  | None |
| stock | Unsigned 1-byte integer | 1 | duplicates | True | 0 | None |
| obriga_macanico | Boolean | 1 | None | True | 0 | None |

## Keys

- documentosID: unique; columns documentosID.
- Codigo: unique; columns Codigo.
- Descricao: duplicates; columns Descricao.
- stock: duplicates; columns stock.

## Data findings

- Key profile: {"table": "documentos", "key": "documentosID", "columns": ["documentosID"], "duplicates": 0}
- Key profile: {"table": "documentos", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T10-01).

## Source usage and implicit contract

- WIN_Form_documentos: legacy/GestaoOficinas_TesteIA/WIN_Form_documentos.wdw:38-66; legacy/GestaoOficinas_TesteIA/WIN_Form_documentos.wdw:369-388; legacy/GestaoOficinas_TesteIA/WIN_Form_documentos.wdw:391-397
- WIN_Inventario_Reconstrucao: legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:197-260
- WIN_Reconstrucao_Stocks: legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:197-260
- WIN_Table_artigos: legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:320-352
- WIN_Table_cab_stocks: legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:860-907
- WIN_Table_documentos: legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:245-254; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:274-281; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:306-327; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:531-531; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:605-632
- WIN_Table_Lin_Stocks: legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:212-233; legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:853-931

## Unresolved and framing inputs

- U-T10-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T10-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T10-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
