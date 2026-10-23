# Table mapping — tempos_reparacao

Labor time rows linked by repair numero and mechanic Codigo; empty/open finish sentinel and duration rounding matter.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#tempos_reparacao`.

Export rows read and source count: 21045 / 21045. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| tempos_reparacaoID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| numero | Unsigned 8-byte integer | 8 | duplicates | True | 0 | Proposal for later framing, U-T06-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| mecanico | Unsigned 1-byte integer | 1 | duplicates | True | 0 | None |
| inicio | Date and Time (yyyymmddhhmmssccc) | 8 | duplicates | True |  | Proposal for later framing, U-T06-02: kept as WINDEV yyyymmddhhmmssccc text, or ISO 8601? Empty/sentinel values keep their meaning |
| fim | Date and Time (yyyymmddhhmmssccc) | 8 | duplicates | True |  | Proposal for later framing, U-T06-02: kept as WINDEV yyyymmddhhmmssccc text, or ISO 8601? Empty/sentinel values keep their meaning |
| Inicio_reparacao_estado | String | 3 | duplicates | True |  | None |
| fim_reparacao_estado | String | 3 | duplicates | True |  | None |

## Keys

- tempos_reparacaoID: unique; columns tempos_reparacaoID.
- numero: duplicates; columns numero.
- mecanico: duplicates; columns mecanico.
- inicio: duplicates; columns inicio.
- fim: duplicates; columns fim.
- Inicio_reparacao_estado: duplicates; columns Inicio_reparacao_estado.
- fim_reparacao_estado: duplicates; columns fim_reparacao_estado.
- numeromecanico: duplicates; columns numero, mecanico.

## Data findings

- Key profile: {"table": "tempos_reparacao", "key": "tempos_reparacaoID", "columns": ["tempos_reparacaoID"], "duplicates": 2}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "tempos_reparacao.mecanico", "to": "mecanicos.Codigo", "orphans": 0, "orphan_values": 0, "zero": 0, "rows": 21045}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T06-01).

## Source usage and implicit contract

- WIN_Ordens_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1174-1195
- WIN_Ordens_Reparacao_Form: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:370-454; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:522-544; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:588-614
- WIN_Table_Tempos_materiais_Descricoes: legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1004-1054
- WIN_Tempos_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1368-1389; legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1429-1487
- WIN_Tempos_Reparacao_Estado: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:353-371
- WIN_Tempos_Reparacao_Tempo: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:304-432

## Unresolved and framing inputs

- U-T06-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T06-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T06-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
