# Workflow consolidation

These are observed legacy contracts, not the target roadmap or approved behavior changes.

| Workflow | Evidence maps | Critical contract |
|---|---|---|
| Startup and login | [Project](My_GestaoOficinas.md), [menu](WIN_MENU.md), [access](WIN_Acesso.md) | Optional legacy schema-update marker/process and server connection; menu initialization, selected-user authentication and command-line modes. No legacy executable was run. |
| Lookup CRUD and selectors | [mapping index](README.md), all WIN_Form/most WIN_Table notes | Shared file buffers, NewRecord flags, validations, caller-specific returned codes, post-save refresh and failure fallthrough. |
| Repair reception and state changes | [orders](WIN_Ordens_Reparacao.md), [form](WIN_Ordens_Reparacao_Form.md), [state](WIN_Mudar_Estado.md) | Header fields, customer/vehicle links, state history and flags, material/time side effects and deletion. |
| Materials consumed | [list](WIN_Material_Reparacao.md), [detail](WIN_Material_reparacao_form.md), [live detail](WIN_Table_Tempos_materiais_Descricoes.md) | Save versus system-close, row replacement and stock effects; multiple unchecked writes are preserved as facts. |
| Stock documents | [headers](WIN_Table_cab_stocks.md), [lines](WIN_Table_Lin_Stocks.md), [reconstruction](WIN_Reconstrucao_Stocks.md) | Document-code/number identity, stock direction, old-line reversal and reapplication, delete sign concerns, reconstruction. |
| Inventory | [inventory](WIN_Inventario.md), [reconstruction](WIN_Inventario_Reconstrucao.md) | Menu sequencing, quantity accumulation and stock changes; not exercised on live data. |
| Labor and mechanic state | [labor](WIN_Tempos_Reparacao.md), [time](WIN_Tempos_Reparacao_Tempo.md), [state](WIN_Tempos_Reparacao_Estado.md), [information](WIN_Tempos_Reparacao_Informacao.md) | Clock-driven automatic writes, open-time sentinel, state transitions, query/current buffers, locks and date/unit semantics. |
| Reporting and statements | [report inventory](reports.md), [material filters](WIN_Filtro_Mapas_Artigos.md), [labor filters](WIN_Filtro_Mapas_Tempos.md), [sales](WIN_Mapa_Vendas.md), [statement](WIN_Extrato_Artigos.md) | Exact query source/parameters, date boundary expansion, live UI table input, quantity and duration totals and print destination. |
| Touch/barcode entry | [numeric keyboard](WIN_Teclado_numerico.md), [alpha keyboard](WIN_Teclado_Alfa.md), [reader](WIN_Leitor_cod_barras.md), [unrecognized code](WIN_Leitor_cod_barras_desconhecidos.md) | Modal returned values, masks, scanner input and caller-specific state. Device timing remains to be observed. |

High-risk behavior must be brought to framing as preserve-versus-change decisions. No source bug is silently corrected by this mapping, and none of these rows represents completed implementation.
