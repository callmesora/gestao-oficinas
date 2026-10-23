# Table mapping — Clientes

Customer master and contacts. Business links use Codigo; ClientesID is a distinct automatic identifier.

Evidence: `legacy/GestaoOficinas_TesteIA/GestaoOficinas.xdd`; `docs/schema/schema-draft.md`; `export: docs/data/profile.md#Clientes`.

Export rows read and source count: 2165 / 2165. No source or imported data was repaired.

## Columns

| Column | WINDEV type / code | Size | Key | NULL support | Default | Later decision |
|---|---|---|---|---|---|---|
| ClientesID | Automatic identifier (8 bytes) | 8 | unique | True |  | None |
| Codigo | Unsigned 8-byte integer | 8 | unique | True | 0 | Proposal for later framing, U-T01-02: unsigned 64-bit: SQLite INTEGER is signed (max 2^63-1); values above 2^53 must cross IPC/JSON as strings |
| Descricao | String | 100 | duplicates | True |  | None |
| Morada1 | String | 100 | None | True |  | None |
| Morada2 | String | 100 | None | True |  | None |
| codpostal | String | 50 | None | True |  | None |
| Telefone1 | String | 50 | None | True |  | None |
| Telemovel | String | 50 | None | True |  | None |
| observacao | Text Memo | 8 | None | True |  | None |

## Keys

- ClientesID: unique; columns ClientesID.
- Codigo: unique; columns Codigo.
- Descricao: duplicates; columns Descricao.

## Data findings

- Descricao: 42 values with leading or trailing spaces: keep, or trim in the import? [U-T01-02]
- Morada1: 5 values with leading or trailing spaces: keep, or trim in the import? [U-T01-02]
- Telefone1: 3 values with leading or trailing spaces: keep, or trim in the import? [U-T01-02]
- Telemovel: 2 values with leading or trailing spaces: keep, or trim in the import? [U-T01-02]
- observacao: 1 values with leading or trailing spaces: keep, or trim in the import? [U-T01-02]
- Key profile: {"table": "Clientes", "key": "ClientesID", "columns": ["ClientesID"], "duplicates": 0}
- Key profile: {"table": "Clientes", "key": "Codigo", "columns": ["Codigo"], "duplicates": 0}

Link-profile provenance: scripts/data_profile.py candidate_links proposes name/identifier matches to single-column unique keys; explicit --ref comparisons override candidates, otherwise the minimum-orphan candidate is retained. Zero values are excluded from orphan checks. The XDD has no declared LIAISON elements; a zero-orphan/all-zero result does not prove target identity or enforced integrity (U-T01-01).

## Source usage and implicit contract

- RPT_Materiais: legacy/GestaoOficinas_TesteIA/RPT_Materiais.wde:381-404
- WIN_Form_Clientes: legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:38-71; legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:453-467; legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:470-488
- WIN_Ordens_Reparacao: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1636-1751
- WIN_Ordens_Reparacao_Form: legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1376-1380; legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1424-1467
- WIN_Table_Clientes: legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:233-233; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:300-308; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:332-336; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:361-382; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:608-633; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:650-655; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:675-680; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:700-705; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:725-730; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:772-777; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:797-802; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:827-827; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:870-870

## Unresolved and framing inputs

- U-T01-01: The XDD/dossier describes structure, not deployed referential enforcement or all key collation options. Use code links, profile and a runtime case to settle enforcement. Interim: preserve values and report anomalies; do not add constraints or normalize silently.
- U-T01-02: Decide import representation and treatment of existing zero/empty/date/money/duplicate/orphan values during framing. No schema or data correction approved in Step 0.
- U-T01-03: The export preserves values reported by the official driver, not undocumented FIC storage. Generated composite/link fields can be empty binary values. Validate derived keys from component fields and never treat an empty driver key as a proven meaningful business value.
