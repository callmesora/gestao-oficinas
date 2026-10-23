# Table mapping — cab_stocks

Stock document header. Its business identity includes document code and number; generated ID/link fields are not interchangeable with those keys.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#cab_stocks`.

Export rows read and source count: 4217 / 4217. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| cab_stocksID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| documento_codigo | String | 3 | duplicates | True |  | None |
| documento_numero | Unsigned 8-byte integer | 8 | duplicates | True | 0 | Proposal for later framing, U-T11-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| Descricao | String | 100 | None | True |  | None |
| data | Date and Time (yyyymmddhhmmssccc) | 8 | duplicates | True |  | Proposal for later framing, U-T11-02: kept as WINDEV yyyymmddhhmmssccc text, or ISO 8601? Empty/sentinel values keep their meaning |
| mecanico | Unsigned 1-byte integer | 1 | duplicates | True | 0 | None |
| DocumentosID | 8-byte integer | 8 | duplicates | True |  | None |
| MecanicosID | 8-byte integer | 8 | duplicates | True |  | None |

## Keys

- cab_stocksID: unique; columns cab_stocksID.
- documento_codigo: duplicates; columns documento_codigo.
- documento_numero: duplicates; columns documento_numero.
- data: duplicates; columns data.
- mecanico: duplicates; columns mecanico.
- DocumentosID: duplicates; columns DocumentosID.
- documento_codigodocumento_numero: unique; columns documento_codigo, documento_numero.
- MecanicosID: duplicates; columns MecanicosID.

## Data findings

- mecanico: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T11-02]
- DocumentosID: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T11-02]
- MecanicosID: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T11-02]
- Descricao: 4 values with leading or trailing spaces: keep, or trim in the import? [U-T11-02]
- Key profile: {"table": "cab_stocks", "key": "cab_stocksID", "columns": ["cab_stocksID"], "duplicates": 0}
- Key profile: {"table": "cab_stocks", "key": "documento_codigodocumento_numero", "columns": ["documento_codigo", "documento_numero"], "duplicates": 0}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "cab_stocks.mecanico", "to": "mecanicos.mecanicosID", "orphans": 0, "orphan_values": 0, "zero": 4217, "rows": 4217}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "cab_stocks.DocumentosID", "to": "documentos.documentosID", "orphans": 0, "orphan_values": 0, "zero": 4217, "rows": 4217}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "cab_stocks.MecanicosID", "to": "mecanicos.mecanicosID", "orphans": 0, "orphan_values": 0, "zero": 4217, "rows": 4217}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T11-01).

Business relationships: dossier: QRY_union_lin_stocks/sql joins cab_stocks.mecanico to mecanicos.Codigo, not mecanicosID; cab_stocks.documento_codigo joins documentos.Codigo (also dossier: QRY_select_cab_stocks/sql). The profiled mecanico, DocumentosID and MecanicosID fields are all zero in this snapshot. The generated ID fields are not the join fields in those SQL bodies; this does not prove they are globally unused. The mechanic inner join can suppress zero/unmatched codes even though the heuristic mecanicosID comparison reports zero orphans. The code/number pair is the ledger header-to-line relationship in dossier: QRY_select_cab_lin_stocks/sql; the consumption query joins number alone, with the mixing/duplicate caveat in docs/mapping/QRY_union_lin_stocks.md. U-T11-01 retains enforcement/collation uncertainty.

## Source usage and implicit contract

- WIN_Table_cab_stocks: legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:860-907
- WIN_Table_documentos: legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:306-327
- WIN_Table_Lin_Stocks: legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:212-233; legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:853-931; legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1104-1143

## Unresolved and framing inputs

- U-T11-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T11-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T11-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
