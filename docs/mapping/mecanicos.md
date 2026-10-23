# Table mapping — mecanicos

Mechanic code/name, inactive flag and legacy password field. Used for labor/material authorizations and reporting.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#mecanicos`.

Export rows read and source count: 11 / 11. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| mecanicosID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| Codigo | Unsigned 1-byte integer | 1 | unique | True | 0 | None |
| Descricao | String | 100 | duplicates | True |  | None |
| palavra_passe | String | 15 | None | True |  | None |
| inativo | Boolean | 1 | duplicates | True | 0 | None |

## Keys

- mecanicosID: unique; columns mecanicosID.
- Codigo: unique; columns Codigo.
- Descricao: duplicates; columns Descricao.
- inativo: duplicates; columns inativo.

## Data findings

- Descricao: 1 values with leading or trailing spaces: keep, or trim in the import? [U-T03-02]
- palavra_passe: one value in every row; this does not mean unused. Password comparisons are present in legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:298,770,914; the form field is documented in docs/screens/WIN_Form_mecanicos.md. Meaning/treatment of the uniform snapshot remains open [U-T03-02]
- Key profile: {"table": "mecanicos", "key": "mecanicosID", "columns": ["mecanicosID"], "duplicates": 0}
- Key profile: {"table": "mecanicos", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T03-01).

## Source usage and implicit contract

- WIN_Form_mecanicos: legacy/GestaoOficinas_TesteIA/WIN_Form_mecanicos.wdw:38-74; legacy/GestaoOficinas_TesteIA/WIN_Form_mecanicos.wdw:367-386
- WIN_Material_reparacao_form: legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1149-1208
- WIN_Ordens_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1636-1751
- WIN_Ordens_Reparacao_Form: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:943-1125
- WIN_Table_mecanicos: legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:224-233; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:253-261; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:507-507; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:580-605
- WIN_Table_Tempos_materiais_Descricoes: legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1004-1054

## Unresolved and framing inputs

- U-T03-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T03-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T03-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
