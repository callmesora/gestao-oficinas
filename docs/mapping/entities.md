# Entities and data contracts

The 17 tables are mapped individually in this folder. The XDD declares no relationships; joins in source/query SQL establish business links, not proof of enforced foreign keys. Generated IDs must not replace business codes automatically.

| Area | Tables and maps | Principal business identity |
|---|---|---|
| Customers and vehicles | [Clientes](Clientes.md), [Viaturas](Viaturas.md) | Customer Codigo; vehicle matricula; Viaturas.Cliente joins Clientes.Codigo. |
| Catalog and configuration | [artigos](artigos.md), [unidades](unidades.md), [documentos](documentos.md) | Article Codigo, unit Codigo and document Codigo. |
| Repair workflow | [ordem_reparacao](ordem_reparacao.md), [material_reparacao](material_reparacao.md), [tempos_reparacao](tempos_reparacao.md) | Order numero; materials and labor reference that number and mechanic/article codes. |
| Workflow lookups | [mecanicos](mecanicos.md), [estados_reparacao](estados_reparacao.md), [estados_descritivos](estados_descritivos.md) | Mechanic/state codes, types, inactive flags and state-specific workflow flags. |
| Stock documents | [cab_stocks](cab_stocks.md), [lin_stocks](lin_stocks.md) | Document code + number; line identity also needs linha. Queries that omit document code are explicitly flagged. |
| Users and environment | [utilizadores](utilizadores.md), [sistema](sistema.md), [Terminais](Terminais.md), [postos](postos.md) | User codes and local system/terminal configuration; no replacement auth/topology decision is made. |

See [profile](../data/profile.md) for observed zero/empty/memo, duplicate and orphan findings and [schema draft](../schema/schema-draft.md) for type decisions. The draft is not a production migration. Existing anomalies are preserved in the export.
