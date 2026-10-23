# Table mapping — postos

Workstation/terminal association lookup; source form new-record check references Terminais instead of postos.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#postos`.

Export rows read and source count: 0 / 0. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| Codigo | Unsigned 1-byte integer | 1 | unique | True | 0 | None |
| Descricao | String | 50 | None | True |  | None |
| terminal | String | 3 | None | True |  | None |
| teste | String | 50 | None | True |  | None |

## Keys

- Codigo: unique; columns Codigo.

## Data findings

- Key profile: {"table": "postos", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T17-01).

## Source usage and implicit contract

- WIN_Form_postos: legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:38-70; legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:453-471
- WIN_Leitor_cod_barras: legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras.wdw:412-427
- WIN_Table_postos: legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:158-167; legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:219-236; legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:418-429

## Unresolved and framing inputs

- U-T17-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T17-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T17-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
