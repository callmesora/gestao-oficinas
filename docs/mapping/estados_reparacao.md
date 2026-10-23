# Table mapping — estados_reparacao

Repair state master with type, colors and flags controlling material launch and delivery/payment prompts.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#estados_reparacao`.

Export rows read and source count: 11 / 11. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| estados_reparacaoID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| Codigo | String | 3 | unique | True |  | None |
| Descricao | String | 50 | duplicates | True |  | None |
| tipo | Unsigned 1-byte integer | 1 | duplicates | True | 0 | None |
| Cor | Unsigned 4-byte integer | 4 | None | True | 0 | None |
| lancar_defa | Boolean | 1 | None | True | 0 | None |
| lancar_material | Boolean | 1 | None | True | 0 | None |
| confirmacao | Boolean | 1 | None | True | 0 | None |
| pedir_data_entrega | Boolean | 1 | None | True | 0 | None |
| pedir_data_pag | Boolean | 1 | None | True | 0 | None |

## Keys

- estados_reparacaoID: unique; columns estados_reparacaoID.
- Codigo: unique; columns Codigo.
- Descricao: duplicates; columns Descricao.
- tipo: duplicates; columns tipo.

## Data findings

- pedir_data_entrega: one value in every row; the flag is read by legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1033-1039. Uniform snapshot values do not establish that the flag is unused [U-T13-02]
- pedir_data_pag: one value in every row; the flag is read by legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1033-1039. Uniform snapshot values do not establish that the flag is unused [U-T13-02]
- Key profile: {"table": "estados_reparacao", "key": "estados_reparacaoID", "columns": ["estados_reparacaoID"], "duplicates": 0}
- Key profile: {"table": "estados_reparacao", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T13-01).

## Source usage and implicit contract

- WIN_Form_estados_reparacao: legacy/GestaoOficinas_TesteIA/WIN_Form_estados_reparacao.wdw:38-66; legacy/GestaoOficinas_TesteIA/WIN_Form_estados_reparacao.wdw:506-525; legacy/GestaoOficinas_TesteIA/WIN_Form_estados_reparacao.wdw:528-536
- WIN_Mapa_Vendas: legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:337-348
- WIN_Ordens_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:782-789; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1438-1447; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1636-1751
- WIN_Ordens_Reparacao_Form: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:522-544; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:567-573; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:588-614; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:943-1125
- WIN_Table_estados_reparacao: legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:225-234; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:258-265; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:290-311; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:515-515; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:537-550
- WIN_Table_estado_reparacao_tipo3: legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:239-245
- WIN_Table_Tempos_materiais_Descricoes: legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:721-767
- WIN_Tempos_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:682-689
- WIN_Tempos_Reparacao_Estado: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:639-645
- WIN_Tempos_Reparacao_Tempo: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:304-432

## Unresolved and framing inputs

- U-T13-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T13-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T13-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
