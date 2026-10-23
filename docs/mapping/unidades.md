# Table mapping — unidades

Unit-code lookup used by article master.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#unidades`.

Export rows read and source count: 4 / 4. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| unidadesID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| Codigo | String | 3 | unique | True |  | None |
| Descricao | String | 50 | duplicates | True |  | None |

## Keys

- unidadesID: unique; columns unidadesID.
- Codigo: unique; columns Codigo.
- Descricao: duplicates; columns Descricao.

## Data findings

- Key profile: {"table": "unidades", "key": "unidadesID", "columns": ["unidadesID"], "duplicates": 0}
- Key profile: {"table": "unidades", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T09-01).

## Source usage and implicit contract

- WIN_Form_unidades: legacy/GestaoOficinas_TesteIA/WIN_Form_unidades.wdw:34-62; legacy/GestaoOficinas_TesteIA/WIN_Form_unidades.wdw:318-337
- WIN_Table_unidades: legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:180-189; legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:209-216; legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:241-262; legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:462-475

## Unresolved and framing inputs

- U-T09-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T09-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T09-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
