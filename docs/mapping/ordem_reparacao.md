# Table mapping — ordem_reparacao

Repair order header, reception/service memos, workflow states, customer/third party, money totals, invoice and payment information. Workflows link by numero.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#ordem_reparacao`.

Export rows read and source count: 15719 / 15719. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| ordem_reparacaoID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| numero | Unsigned 8-byte integer | 8 | unique | True | 0 | Proposal for later framing, U-T05-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| matricula | String | 15 | duplicates | True |  | None |
| km_viatura | Unsigned 8-byte integer | 8 | None | True | 0 | Proposal for later framing, U-T05-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| recepcao_util | Unsigned 1-byte integer | 1 | duplicates | True | 0 | None |
| recepcao_datahora | Date and Time (yyyymmddhhmmssccc) | 8 | duplicates | True |  | Proposal for later framing, U-T05-02: kept as WINDEV yyyymmddhhmmssccc text, or ISO 8601? Empty/sentinel values keep their meaning |
| recepcao_cliente | Unsigned 8-byte integer | 8 | duplicates | True | 0 | Proposal for later framing, U-T05-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| recepcao_terceiro | Unsigned 8-byte integer | 8 | duplicates | True | 0 | Proposal for later framing, U-T05-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| recepacao_contatos | Text Memo | 8 | None | True |  | None |
| recepcao_servico | Text Memo | 8 | None | True |  | None |
| recepcao_obs | Text Memo | 8 | None | True |  | None |
| recepcao_entrega_prevista | Date (yyyymmdd) | 8 | None | True |  | Proposal for later framing, U-T05-02: kept as WINDEV yyyymmdd text, or ISO 8601? Empty date ("" / 00000000) is not NULL by default |
| recepcao_prioridade | Unsigned 1-byte integer | 1 | None | True | 0 | None |
| reparacao_mecanico | Unsigned 1-byte integer | 1 | duplicates | True | 0 | None |
| reparacao_estado | String | 3 | duplicates | True | 0 | None |
| reparacao_estado_obs | String | 100 | None | True |  | None |
| reparacao_servico | Text Memo | 8 | None | True |  | None |
| reparacao_estado_data | Date and Time (yyyymmddhhmmssccc) | 8 | None | True |  | Proposal for later framing, U-T05-02: kept as WINDEV yyyymmddhhmmssccc text, or ISO 8601? Empty/sentinel values keep their meaning |
| reparacao_estado_historico | Text Memo | 8 | None | True |  | None |
| totaL_mao_obra | 8-byte real | 8 | None | True | 0 | Proposal for later framing, U-T05-02: binary floating point: if this holds money or quantities, use integer minor units or TEXT decimals |
| total_pecas | 8-byte real | 8 | None | True | 0 | Proposal for later framing, U-T05-02: binary floating point: if this holds money or quantities, use integer minor units or TEXT decimals |
| total_desconto | 8-byte real | 8 | None | True | 0 | Proposal for later framing, U-T05-02: binary floating point: if this holds money or quantities, use integer minor units or TEXT decimals |
| total_reparacao | 8-byte real | 8 | None | True | 0 | Proposal for later framing, U-T05-02: binary floating point: if this holds money or quantities, use integer minor units or TEXT decimals |
| faturado | Boolean | 1 | None | True | 0 | None |
| total_pago | 8-byte real | 8 | None | True | 0 | Proposal for later framing, U-T05-02: binary floating point: if this holds money or quantities, use integer minor units or TEXT decimals |
| Estados_reparacaoID | 8-byte integer | 8 | duplicates | True |  | None |
| numero_fatura | String | 20 | None | True |  | None |
| data_pagamento | Date (yyyymmdd) | 8 | duplicates | True |  | Proposal for later framing, U-T05-02: kept as WINDEV yyyymmdd text, or ISO 8601? Empty date ("" / 00000000) is not NULL by default |

## Keys

- ordem_reparacaoID: unique; columns ordem_reparacaoID.
- numero: unique; columns numero.
- matricula: duplicates; columns matricula.
- recepcao_util: duplicates; columns recepcao_util.
- recepcao_datahora: duplicates; columns recepcao_datahora.
- recepcao_cliente: duplicates; columns recepcao_cliente.
- recepcao_terceiro: duplicates; columns recepcao_terceiro.
- reparacao_mecanico: duplicates; columns reparacao_mecanico.
- reparacao_estado: duplicates; columns reparacao_estado.
- Estados_reparacaoID: duplicates; columns Estados_reparacaoID.
- data_pagamento: duplicates; columns data_pagamento.

## Data findings

- km_viatura: maximum 9.64085e+08 is over 20 × the 99th percentile (594326): typo or real? [U-T05-02]
- recepcao_util: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T05-02]
- recepcao_servico: 2154 values with leading or trailing spaces: keep, or trim in the import? [U-T05-02]
- recepcao_servico: 7333 values with line breaks (WINDEV writes CR LF)
- recepcao_obs: 286 values with leading or trailing spaces: keep, or trim in the import? [U-T05-02]
- recepcao_obs: 1046 values with line breaks (WINDEV writes CR LF)
- reparacao_estado_historico: 713 values with leading or trailing spaces: keep, or trim in the import? [U-T05-02]
- reparacao_estado_historico: 714 values with line breaks (WINDEV writes CR LF)
- recepacao_contatos: 58 values with leading or trailing spaces: keep, or trim in the import? [U-T05-02]
- recepacao_contatos: 1378 values with line breaks (WINDEV writes CR LF)
- totaL_mao_obra: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T05-02]
- total_pecas: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T05-02]
- total_desconto: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T05-02]
- total_reparacao: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T05-02]
- total_pago: maximum 525920 is over 20 × the 99th percentile (1658.7): typo or real? [U-T05-02]
- Estados_reparacaoID: one value in every row; uniformity alone does not establish unused/default semantics. Confirm historical/default meaning and any additional consumers before changing representation [U-T05-02]
- numero_fatura: 1 values with leading or trailing spaces: keep, or trim in the import? [U-T05-02]
- recepcao_terceiro: 15648 zeros of 15719: does 0 mean empty here (dossier 'Blank if zero')? [U-T05-02]
- Key profile: {"table": "ordem_reparacao", "key": "ordem_reparacaoID", "columns": ["ordem_reparacaoID"], "duplicates": 0}
- Key profile: {"table": "ordem_reparacao", "key": "numero", "columns": ["numero"], "duplicates": 0}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "ordem_reparacao.Estados_reparacaoID", "to": "estados_reparacao.estados_reparacaoID", "orphans": 0, "orphan_values": 0, "zero": 15719, "rows": 15719}
- Link profile (candidate/explicit-ref comparison, not a declared constraint): {"from": "ordem_reparacao.matricula", "to": "Viaturas.matricula", "orphans": 52, "orphan_values": 36, "zero": 0, "rows": 15719}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T05-01).

Business relationships: dossier: QRY_select_ordens_reparacao/sql joins reparacao_estado to estados_reparacao.Codigo and matricula to Viaturas.matricula, both mandatory; recepcao_cliente joins Clientes.Codigo, reparacao_mecanico optionally joins mecanicos.Codigo, and recepcao_terceiro optionally joins the customer alias Codigo. Estados_reparacaoID is all zero in the profile and is not the state join field in this SQL. The profile reports 52 order rows / 36 registration values without a matching vehicle; the mandatory vehicle join suppresses those rows in that query. These joins establish business usage, not referential enforcement (U-T05-01).

## Source usage and implicit contract

- RPT_Materiais: legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde:381-404
- WIN_Filtro_Mapas_Tempos: legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:266-291; legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:673-691
- WIN_Material_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:465-527
- WIN_MENU: legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:814-814; legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:899-911
- WIN_Ordens_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1174-1195; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1337-1362; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1636-1751
- WIN_Ordens_Reparacao_Form: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:943-1125; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1181-1206; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1424-1467
- WIN_Table_estados_reparacao: legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:290-311
- WIN_Table_Tempos_materiais_Descricoes: legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:721-767; legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1004-1054
- WIN_Table_Viaturas: legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:340-363
- WIN_Tempos_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1429-1487
- WIN_Tempos_Reparacao_Estado: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:353-371
- WIN_Tempos_Reparacao_Tempo: legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:304-432

## Unresolved and framing inputs

- U-T05-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T05-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T05-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
