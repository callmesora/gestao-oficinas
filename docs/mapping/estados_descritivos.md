# Table mapping — estados_descritivos

Descriptive repair state lookup.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#estados_descritivos`.

Export rows read and source count: 5 / 5. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| estados_descritivosID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| Codigo | String | 3 | unique | True |  | None |
| Descricao | String | 100 | duplicates | True |  | None |

## Keys

- estados_descritivosID: unique; columns estados_descritivosID.
- Codigo: unique; columns Codigo.
- Descricao: duplicates; columns Descricao.

## Data findings

- Key profile: {"table": "estados_descritivos", "key": "estados_descritivosID", "columns": ["estados_descritivosID"], "duplicates": 0}
- Key profile: {"table": "estados_descritivos", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T14-01).

## Source usage and implicit contract

- WIN_Form_estados_descritivos: legacy/GestaoOficinas_TesteIA/WIN_Form_estados_descritivos.wdw:38-66; legacy/GestaoOficinas_TesteIA/WIN_Form_estados_descritivos.wdw:322-341
- WIN_Table_estados_descritivos: legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:202-211; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:231-238; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:263-280; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:484-484; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:558-585

## Unresolved and framing inputs

- U-T14-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T14-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T14-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
