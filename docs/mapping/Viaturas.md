# Table mapping — Viaturas

Vehicle master keyed for workflows by matricula; Cliente references customer Codigo.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#Viaturas`.

Export rows read and source count: 4544 / 4544. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| ViaturasID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| matricula | String | 15 | unique | True |  | None |
| Cliente | Unsigned 8-byte integer | 8 | duplicates | True | 0 | Proposal for later framing, U-T02-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| marca | String | 50 | None | True |  | None |
| modelo | String | 50 | None | True |  | None |
| Ano | Unsigned 2-byte integer | 2 | None | True | 0 | None |
| mes | Unsigned 1-byte integer | 1 | None | True | 0 | None |

## Keys

- ViaturasID: unique; columns ViaturasID.
- matricula: unique; columns matricula.
- Cliente: duplicates; columns Cliente.

## Data findings

- marca: 365 values with leading or trailing spaces: keep, or trim in the import? [U-T02-02]
- modelo: 13 values with leading or trailing spaces: keep, or trim in the import? [U-T02-02]
- Ano: 4526 zeros of 4544: does 0 mean empty here (dossier 'Blank if zero')? [U-T02-02]
- mes: 4528 zeros of 4544: does 0 mean empty here (dossier 'Blank if zero')? [U-T02-02]
- Key profile: {"table": "Viaturas", "key": "ViaturasID", "columns": ["ViaturasID"], "duplicates": 0}
- Key profile: {"table": "Viaturas", "key": "matricula", "columns": ["matricula"], "duplicates": 0}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "Viaturas.Cliente", "to": "Clientes.Codigo", "orphans": 0, "orphan_values": 0, "zero": 0, "rows": 4544}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T02-01).

## Source usage and implicit contract

- RPT_Materiais: legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde:381-404
- WIN_Form_Viaturas: legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:34-70; legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:441-469
- WIN_Material_reparacao_form: legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1149-1208
- WIN_Ordens_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1636-1751
- WIN_Table_Clientes: legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:361-382
- WIN_Table_Viaturas: legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:278-284; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:308-315; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:340-363; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:597-602; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:626-631; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:655-660
- WIN_Tempos_Reparacao_Tempo: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:304-432

## Unresolved and framing inputs

- U-T02-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T02-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T02-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
