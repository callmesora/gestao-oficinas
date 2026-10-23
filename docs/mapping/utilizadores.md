# Table mapping — utilizadores

Legacy application users and password field; no new permission model is chosen during Step 0.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#utilizadores`.

Export rows read and source count: 1 / 1. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| utilizadoresID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| Codigo | Unsigned 1-byte integer | 1 | unique | True | 0 | None |
| Descricao | String | 100 | duplicates | True |  | None |
| palavra_passe | String | 15 | None | True |  | None |

## Keys

- utilizadoresID: unique; columns utilizadoresID.
- Codigo: unique; columns Codigo.
- Descricao: duplicates; columns Descricao.

## Data findings

- Key profile: {"table": "utilizadores", "key": "utilizadoresID", "columns": ["utilizadoresID"], "duplicates": 0}
- Key profile: {"table": "utilizadores", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T08-01).

## Source usage and implicit contract

- WIN_Acesso: legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:331-347; legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:371-395
- WIN_Form_utilizadores: legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:34-71; legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:350-369
- WIN_MENU: legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:931-949
- WIN_Table_utilizadores: legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:186-195; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:215-222; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:461-461; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:535-560

## Unresolved and framing inputs

- U-T08-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T08-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T08-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
