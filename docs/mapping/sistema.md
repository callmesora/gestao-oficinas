# Table mapping — sistema

Application system thresholds/time configuration and start date, distinct from per-user runtime state.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#sistema`.

Export rows read and source count: 1 / 1. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| Tempo_ordem_reparacao | Unsigned 8-byte integer | 8 | None | True | 0 | Proposal for later framing, U-T16-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| Tempo_materiais | Unsigned 8-byte integer | 8 | None | True | 0 | Proposal for later framing, U-T16-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| Tempo_tempos | Unsigned 8-byte integer | 8 | None | True | 0 | Proposal for later framing, U-T16-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| Data_inicio | Unsigned 2-byte integer | 2 | None | True | 0 | None |
| encerrar_tempos1 | Time (hhmmss) | 6 | None | True |  | Proposal for later framing, U-T16-02: kept as WINDEV hhmmss[cc] text, or seconds? |
| encerrar_tempos2 | Time (hhmmss) | 6 | None | True |  | Proposal for later framing, U-T16-02: kept as WINDEV hhmmss[cc] text, or seconds? |

## Keys


## Data findings


Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T16-01).

## Source usage and implicit contract

- WIN_Material_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:679-683
- WIN_MENU: legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:931-949
- WIN_Ordens_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1568-1597
- WIN_sistema: legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:198-214; legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:418-426
- WIN_Tempos_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1368-1389; legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1429-1487

## Unresolved and framing inputs

- U-T16-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T16-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T16-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
