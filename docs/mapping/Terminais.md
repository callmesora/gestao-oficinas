# Table mapping — Terminais

Barcode terminal configuration, including barcode start/finish positions and input filenames/directories.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#Terminais`.

Export rows read and source count: 0 / 0. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| Codigo | String | 3 | unique | True |  | None |
| Descricao | String | 30 | None | True |  | None |
| codbarras_inicio | Unsigned 1-byte integer | 1 | None | True | 0 | None |
| codbarras_fim | Unsigned 1-byte integer | 1 | None | True | 0 | None |
| quant_inicio | Unsigned 1-byte integer | 1 | None | True | 0 | None |
| quant_fim | Unsigned 1-byte integer | 1 | None | True | 0 | None |
| pasta_localizacao | String | 200 | None | True |  | None |
| nome_ficheiro | String | 50 | None | True |  | None |

## Keys

- Codigo: unique; columns Codigo.

## Data findings

- Key profile: {"table": "Terminais", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T15-01).

## Source usage and implicit contract

- WIN_Form_postos: legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:453-471
- WIN_Form_Terminais: legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:38-70; legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:296-299; legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:503-521
- WIN_Leitor_cod_barras: legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:412-427
- WIN_Table_Terminais: legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:180-189; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:213-220; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:245-262; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:447-447; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:469-483

## Unresolved and framing inputs

- U-T15-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T15-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T15-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
