# Mapping — WIN_MENU

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw`; designer `dossier: WIN_MENU`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Initialize, authenticate and navigate.

## Entry and exit

No explicit Open caller in pack; framework/project routing: U-WCB13D1-01.

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Empty sistema creates refresh15/15/15,lookback7,closure times030000 twice. Empty utilizadores creates administrator; credential values omitted. Login cancelar ends program. Master/workflow actions Restore/TopActive existing Active or OpenChild NotFound; other statuses no case. Report filters OpenChild mode parameters. Inventory sequentially Open reconstruction then inventory regardless result. Utility updates order reception client from current vehicle owner, shows Terminado. artigos=1 removes menus and hides nonarticle buttons; modulo t/m hides menu, opens time/material modally then ends program.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw` exact event locations below; `dossier: WIN_MENU/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-7d51a650ff — WIN_MENU/TAB_NoName1/LAYOUT_NoName1/BTN_Clientes

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:223-229`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH WinStatus(WIN_Table_Clientes); CASE Active; Restore(WIN_Table_Clientes); WinStatus(WIN_Table_Clientes,TopActive); CASE NotFound; OpenChild(WIN_Table_Clientes,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-7d51a650ff.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_Clientes); WinStatus(WIN_Table_Clientes); Restore(WIN_Table_Clientes); OpenChild(WIN_Table_Clientes).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_Clientes)
CASE Active
Restore(WIN_Table_Clientes)
WinStatus(WIN_Table_Clientes,TopActive)
CASE NotFound
OpenChild(WIN_Table_Clientes,False,"")
END
```

### SRC-927f1ae365 — WIN_MENU/TAB_NoName1/LAYOUT_NoName1/BTN_Viaturas

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:256-262`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH WinStatus(WIN_Table_Viaturas); CASE Active; restore(WIN_Table_Viaturas); WinStatus(WIN_Table_Viaturas,TopActive); CASE NotFound; OpenChild(WIN_Table_Viaturas,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-927f1ae365.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_Viaturas); WinStatus(WIN_Table_Viaturas); Restore(WIN_Table_Viaturas); OpenChild(WIN_Table_Viaturas).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_Viaturas)
CASE Active
restore(WIN_Table_Viaturas)
WinStatus(WIN_Table_Viaturas,TopActive)
CASE NotFound
OpenChild(WIN_Table_Viaturas,False,"")
END
```

### SRC-ec175a2444 — WIN_MENU/TAB_NoName1/LAYOUT_NoName1/BTN_Ordens_reparacao

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:289-295`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH WinStatus(WIN_Ordens_Reparacao); CASE Active; Restore(WIN_Ordens_Reparacao); WinStatus(WIN_Ordens_Reparacao,TopActive); CASE NotFound; OpenChild(WIN_Ordens_Reparacao). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-ec175a2444.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Ordens_Reparacao); WinStatus(WIN_Ordens_Reparacao); Restore(WIN_Ordens_Reparacao); OpenChild(WIN_Ordens_Reparacao).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Ordens_Reparacao)
CASE Active
Restore(WIN_Ordens_Reparacao)
WinStatus(WIN_Ordens_Reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Ordens_Reparacao)
END
```

### SRC-e028d70833 — WIN_MENU/TAB_NoName1/LAYOUT_NoName1/BTN_Artigos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:322-328`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH WinStatus(WIN_Table_artigos); CASE Active; Restore(WIN_Table_artigos); WinStatus(WIN_Table_artigos,TopActive); CASE NotFound; OpenChild(WIN_Table_artigos,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-e028d70833.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_artigos); WinStatus(WIN_Table_artigos); Restore(WIN_Table_artigos); OpenChild(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_artigos)
CASE Active
Restore(WIN_Table_artigos)
WinStatus(WIN_Table_artigos,TopActive)
CASE NotFound
OpenChild(WIN_Table_artigos,False,"")
END
```

### SRC-03607912bd — WIN_MENU/TAB_NoName1/LAYOUT_NoName1/BTN_movimentos_stock

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:355-361`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH WinStatus(WIN_Table_cab_stocks); CASE Active; Restore(WIN_Table_cab_stocks); WinStatus(WIN_Table_cab_stocks,TopActive); CASE NotFound; OpenChild(WIN_Table_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-03607912bd.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_cab_stocks); WinStatus(WIN_Table_cab_stocks); Restore(WIN_Table_cab_stocks); OpenChild(WIN_Table_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_cab_stocks)
CASE Active
Restore(WIN_Table_cab_stocks)
WinStatus(WIN_Table_cab_stocks,TopActive)
CASE NotFound
OpenChild(WIN_Table_cab_stocks)
END
```

### SRC-5f76c51321 — WIN_MENU/TAB_NoName1/LAYOUT_NoName1/BTN_tempos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:388-394`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH WinStatus(WIN_Tempos_Reparacao); CASE Active; Restore(WIN_Tempos_Reparacao); WinStatus(WIN_Tempos_Reparacao,TopActive); CASE NotFound; OpenChild(WIN_Tempos_Reparacao). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-5f76c51321.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Tempos_Reparacao); WinStatus(WIN_Tempos_Reparacao); Restore(WIN_Tempos_Reparacao); OpenChild(WIN_Tempos_Reparacao).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Tempos_Reparacao)
CASE Active
Restore(WIN_Tempos_Reparacao)
WinStatus(WIN_Tempos_Reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Tempos_Reparacao)
END
```

### SRC-59704205b3 — WIN_MENU/TAB_NoName1/LAYOUT_NoName1/BTN_material

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:421-427`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH WinStatus(WIN_Material_Reparacao); CASE Active; Restore(WIN_Material_Reparacao); WinStatus(WIN_Material_Reparacao,TopActive); CASE NotFound; OpenChild(WIN_Material_Reparacao). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-59704205b3.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Material_Reparacao); WinStatus(WIN_Material_Reparacao); Restore(WIN_Material_Reparacao); OpenChild(WIN_Material_Reparacao).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Material_Reparacao)
CASE Active
Restore(WIN_Material_Reparacao)
WinStatus(WIN_Material_Reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Material_Reparacao)
END
```

### SRC-87763b02d7 — WIN_MENU/MENU__Menu/MENU_OPT_Menu/OPT_Postos

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:486-486`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: open(WIN_Table_postos). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-87763b02d7.

HFSQL: none in this block.

Other calls: Open(WIN_Table_postos).

Exact executable branch/assignment ledger:
```wlanguage
open(WIN_Table_postos)
```

### SRC-f8aecb8a9f — WIN_MENU/MENU__Menu/MENU_OPT_Menu/OPT_Sistema

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:497-497`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: open(win_sistema). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-f8aecb8a9f.

HFSQL: none in this block.

Other calls: Open(win_sistema).

Exact executable branch/assignment ledger:
```wlanguage
open(win_sistema)
```

### SRC-c5bd61f129 — WIN_MENU/MENU__Menu/MENU_OPT_Menu/MENU_OPT_Exit

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:508-508`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: EndProgram(). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-c5bd61f129.

HFSQL: none in this block.

Other calls: EndProgram().

Exact executable branch/assignment ledger:
```wlanguage
EndProgram()
```

### SRC-6448eb3213 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Viaturas

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:527-533`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_Viaturas); CASE Active; Restore(WIN_Table_Viaturas); WinStatus(WIN_Table_Viaturas,TopActive); CASE NotFound; OpenChild(WIN_Table_Viaturas,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-6448eb3213.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_Viaturas); WinStatus(WIN_Table_Viaturas); Restore(WIN_Table_Viaturas); OpenChild(WIN_Table_Viaturas).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_Viaturas)
CASE Active
Restore(WIN_Table_Viaturas)
WinStatus(WIN_Table_Viaturas,TopActive)
CASE NotFound
OpenChild(WIN_Table_Viaturas,False,"")
END
```

### SRC-08cc189746 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Clientes

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:544-550`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_Clientes); CASE Active; Restore(WIN_Table_Clientes); WinStatus(WIN_Table_Clientes,TopActive); CASE NotFound; OpenChild(WIN_Table_Clientes,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-08cc189746.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_Clientes); WinStatus(WIN_Table_Clientes); Restore(WIN_Table_Clientes); OpenChild(WIN_Table_Clientes).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_Clientes)
CASE Active
Restore(WIN_Table_Clientes)
WinStatus(WIN_Table_Clientes,TopActive)
CASE NotFound
OpenChild(WIN_Table_Clientes,False,"")
END
```

### SRC-91e8dc14f8 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Artigos

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:561-567`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_artigos); CASE Active; Restore(WIN_Table_artigos); WinStatus(WIN_Table_artigos,TopActive); CASE NotFound; OpenChild(WIN_Table_artigos,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-91e8dc14f8.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_artigos); WinStatus(WIN_Table_artigos); Restore(WIN_Table_artigos); OpenChild(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_artigos)
CASE Active
Restore(WIN_Table_artigos)
WinStatus(WIN_Table_artigos,TopActive)
CASE NotFound
OpenChild(WIN_Table_artigos,False,"")
END
```

### SRC-1d83b076e7 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Estados_descritivos

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:578-584`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_estados_descritivos); CASE Active; Restore(WIN_Table_estados_descritivos); WinStatus(WIN_Table_estados_descritivos,TopActive); CASE NotFound; OpenChild(WIN_Table_estados_descritivos,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-1d83b076e7.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_estados_descritivos); WinStatus(WIN_Table_estados_descritivos); Restore(WIN_Table_estados_descritivos); OpenChild(WIN_Table_estados_descritivos).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_estados_descritivos)
CASE Active
Restore(WIN_Table_estados_descritivos)
WinStatus(WIN_Table_estados_descritivos,TopActive)
CASE NotFound
OpenChild(WIN_Table_estados_descritivos,False,"")
END
```

### SRC-71de633816 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Estados_de_Reparação

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:595-601`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_estados_reparacao); CASE Active; Restore(WIN_Table_estados_reparacao); WinStatus(WIN_Table_estados_reparacao,TopActive); CASE NotFound; OpenChild(WIN_Table_estados_reparacao,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-71de633816.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_estados_reparacao); WinStatus(WIN_Table_estados_reparacao); Restore(WIN_Table_estados_reparacao); OpenChild(WIN_Table_estados_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_estados_reparacao)
CASE Active
Restore(WIN_Table_estados_reparacao)
WinStatus(WIN_Table_estados_reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Table_estados_reparacao,False,"")
END
```

### SRC-242a5b7484 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Documentos

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:612-618`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_documentos); CASE Active; Restore(WIN_Table_documentos); WinStatus(WIN_Table_documentos,TopActive); CASE NotFound; OpenChild(WIN_Table_documentos,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-242a5b7484.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_documentos); WinStatus(WIN_Table_documentos); Restore(WIN_Table_documentos); OpenChild(WIN_Table_documentos).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_documentos)
CASE Active
Restore(WIN_Table_documentos)
WinStatus(WIN_Table_documentos,TopActive)
CASE NotFound
OpenChild(WIN_Table_documentos,False,"")
END
```

### SRC-34942ef6f0 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Terminais

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:629-635`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_Terminais); CASE Active; Restore(WIN_Table_Terminais); WinStatus(WIN_Table_Terminais,TopActive); CASE NotFound; OpenChild(WIN_Table_Terminais,false,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-34942ef6f0.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_Terminais); WinStatus(WIN_Table_Terminais); Restore(WIN_Table_Terminais); OpenChild(WIN_Table_Terminais).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_Terminais)
CASE Active
Restore(WIN_Table_Terminais)
WinStatus(WIN_Table_Terminais,TopActive)
CASE NotFound
OpenChild(WIN_Table_Terminais,false,"")
END
```

### SRC-84b951a5b2 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Unidades

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:646-652`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_unidades); CASE Active; Restore(WIN_Table_unidades); WinStatus(WIN_Table_unidades,TopActive); CASE NotFound; OpenChild(WIN_Table_unidades). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-84b951a5b2.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_unidades); WinStatus(WIN_Table_unidades); Restore(WIN_Table_unidades); OpenChild(WIN_Table_unidades).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_unidades)
CASE Active
Restore(WIN_Table_unidades)
WinStatus(WIN_Table_unidades,TopActive)
CASE NotFound
OpenChild(WIN_Table_unidades)
END
```

### SRC-99826c3ba9 — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Utilizadores

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:663-669`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_utilizadores); CASE Active; Restore(WIN_Table_utilizadores); WinStatus(WIN_Table_utilizadores,TopActive); CASE NotFound; OpenChild(WIN_Table_utilizadores,false,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-99826c3ba9.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_utilizadores); WinStatus(WIN_Table_utilizadores); Restore(WIN_Table_utilizadores); OpenChild(WIN_Table_utilizadores).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_utilizadores)
CASE Active
Restore(WIN_Table_utilizadores)
WinStatus(WIN_Table_utilizadores,TopActive)
CASE NotFound
OpenChild(WIN_Table_utilizadores,false,"")
END
```

### SRC-f1671747dc — WIN_MENU/MENU__Menu/OPT_Tabelas/OPT_Mecânicos

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:680-686`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_mecanicos); CASE Active; Restore(WIN_Table_mecanicos); WinStatus(WIN_Table_mecanicos,TopActive); CASE NotFound; OpenChild(WIN_Table_mecanicos,False,""). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-f1671747dc.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_mecanicos); WinStatus(WIN_Table_mecanicos); Restore(WIN_Table_mecanicos); OpenChild(WIN_Table_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_mecanicos)
CASE Active
Restore(WIN_Table_mecanicos)
WinStatus(WIN_Table_mecanicos,TopActive)
CASE NotFound
OpenChild(WIN_Table_mecanicos,False,"")
END
```

### SRC-6e1630ec80 — WIN_MENU/MENU__Menu/OPT_Movimentos/OPT_Ordens_de_Reparação

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:705-711`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Ordens_Reparacao); CASE Active; Restore(WIN_Ordens_Reparacao); WinStatus(WIN_Ordens_Reparacao,TopActive); CASE NotFound; OpenChild(WIN_Ordens_Reparacao). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-6e1630ec80.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Ordens_Reparacao); WinStatus(WIN_Ordens_Reparacao); Restore(WIN_Ordens_Reparacao); OpenChild(WIN_Ordens_Reparacao).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Ordens_Reparacao)
CASE Active
Restore(WIN_Ordens_Reparacao)
WinStatus(WIN_Ordens_Reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Ordens_Reparacao)
END
```

### SRC-db14524700 — WIN_MENU/MENU__Menu/OPT_Movimentos/OPT_Entradas_e_Saídas_de_Stock

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:722-728`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: SWITCH WinStatus(WIN_Table_cab_stocks); CASE Active; Restore(WIN_Table_cab_stocks); WinStatus(WIN_Table_cab_stocks,TopActive); CASE NotFound; OpenChild(WIN_Table_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-db14524700.

HFSQL: none in this block.

Other calls: WinStatus(WIN_Table_cab_stocks); WinStatus(WIN_Table_cab_stocks); Restore(WIN_Table_cab_stocks); OpenChild(WIN_Table_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH WinStatus(WIN_Table_cab_stocks)
CASE Active
Restore(WIN_Table_cab_stocks)
WinStatus(WIN_Table_cab_stocks,TopActive)
CASE NotFound
OpenChild(WIN_Table_cab_stocks)
END
```

### SRC-82a7a6d6e3 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Consumo_material_resumo

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:747-747`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: openchild(WIN_Filtro_Mapas_Artigos,"resumo"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-82a7a6d6e3.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Filtro_Mapas_Artigos).

Exact executable branch/assignment ledger:
```wlanguage
openchild(WIN_Filtro_Mapas_Artigos,"resumo")
```

### SRC-65bf3c58a5 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Consumo_material_descriminado

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:758-758`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: Openchild(WIN_Filtro_Mapas_Artigos,"descriminado"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-65bf3c58a5.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Filtro_Mapas_Artigos).

Exact executable branch/assignment ledger:
```wlanguage
Openchild(WIN_Filtro_Mapas_Artigos,"descriminado")
```

### SRC-d3627f95a7 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Consumo_material_por_viatura_resumo

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:769-769`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: Openchild(WIN_Filtro_Mapas_Artigos,"resumo_viatura"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-d3627f95a7.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Filtro_Mapas_Artigos).

Exact executable branch/assignment ledger:
```wlanguage
Openchild(WIN_Filtro_Mapas_Artigos,"resumo_viatura")
```

### SRC-9123ab6123 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Consumo_material_por_viatura_descriminado

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:780-780`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: Openchild(WIN_Filtro_Mapas_Artigos,"descriminado_viatura"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-9123ab6123.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Filtro_Mapas_Artigos).

Exact executable branch/assignment ledger:
```wlanguage
Openchild(WIN_Filtro_Mapas_Artigos,"descriminado_viatura")
```

### SRC-24eae92ab4 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Extrato_de_artigos

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:791-791`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: openchild(WIN_Extrato_Artigos). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-24eae92ab4.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Extrato_Artigos).

Exact executable branch/assignment ledger:
```wlanguage
openchild(WIN_Extrato_Artigos)
```

### SRC-beeaf5ae4b — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Inventário1

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:802-803`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: Open(WIN_Inventario_Reconstrucao); Open(WIN_Inventario). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-beeaf5ae4b.

HFSQL: none in this block.

Other calls: Open(WIN_Inventario_Reconstrucao); Open(WIN_Inventario).

Exact executable branch/assignment ledger:
```wlanguage
Open(WIN_Inventario_Reconstrucao)
Open(WIN_Inventario)
```

### SRC-11f364b554 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Tempos_de_reparação_por_ordem

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:814-814`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: openchild(WIN_Filtro_Mapas_Tempos,"ordem_reparacao"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-11f364b554.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Filtro_Mapas_Tempos).

Exact executable branch/assignment ledger:
```wlanguage
openchild(WIN_Filtro_Mapas_Tempos,"ordem_reparacao")
```

### SRC-87c5b84dce — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Tempos_de_reparação_por_mecânico_resumo

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:825-825`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: openchild(WIN_Filtro_Mapas_Tempos,"mecanico_resumo"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-87c5b84dce.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Filtro_Mapas_Tempos).

Exact executable branch/assignment ledger:
```wlanguage
openchild(WIN_Filtro_Mapas_Tempos,"mecanico_resumo")
```

### SRC-e89b460c01 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Tempos_de_reparação_por_mecânico_descriminado

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:836-836`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: openchild(WIN_Filtro_Mapas_Tempos,"mecanico_descriminado"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-e89b460c01.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Filtro_Mapas_Tempos).

Exact executable branch/assignment ledger:
```wlanguage
openchild(WIN_Filtro_Mapas_Tempos,"mecanico_descriminado")
```

### SRC-47e33b2ab7 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Tempos_de_reparação_por_viatura

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:847-847`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: openchild(WIN_Filtro_Mapas_Tempos,"viatura"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-47e33b2ab7.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Filtro_Mapas_Tempos).

Exact executable branch/assignment ledger:
```wlanguage
openchild(WIN_Filtro_Mapas_Tempos,"viatura")
```

### SRC-b66e224ab2 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Vendas

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:858-858`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: OpenChild(WIN_Mapa_Vendas,"vendas"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-b66e224ab2.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Mapa_Vendas).

Exact executable branch/assignment ledger:
```wlanguage
OpenChild(WIN_Mapa_Vendas,"vendas")
```

### SRC-8c32f67662 — WIN_MENU/MENU__Menu/OPT_Mapas/OPT_Recebimentos

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:869-869`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: OpenChild(WIN_Mapa_Vendas,"recebimentos"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-8c32f67662.

HFSQL: none in this block.

Other calls: OpenChild(WIN_Mapa_Vendas).

Exact executable branch/assignment ledger:
```wlanguage
OpenChild(WIN_Mapa_Vendas,"recebimentos")
```

### SRC-5aa2f40303 — WIN_MENU/MENU__Menu/OPT_Utilitários/OPT_Reconstrução_de_Stocks

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:888-888`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: open(win_Reconstrucao_Stocks). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-5aa2f40303.

HFSQL: none in this block.

Other calls: Open(win_Reconstrucao_Stocks).

Exact executable branch/assignment ledger:
```wlanguage
open(win_Reconstrucao_Stocks)
```

### SRC-1d228089f7 — WIN_MENU/MENU__Menu/OPT_Utilitários/OPT_Clientes_Reparação

Event `32`: Inferred menu activation; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:899-911`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Inferred menu activation [32]: HExecuteQuery(QRY_select_ordens_reparacao,hQueryDefault); for each QRY_select_ordens_reparacao; HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao.matricula); if hreadfirst(QRY_select_viatura_matricula)=true then; sQuery is string="update ordem_reparacao set recepcao_cliente='"+QRY_select_viatura_matricula.Cliente+"' where numero='"+QRY_select_ordens_reparacao.numero+"'"; dsQry_update is data source; HExecuteSQLQuery(dsQry_update,hQueryDefault,sQuery); HCancelDeclaration(dsQry_update); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_ordens_reparacao); info("Terminado"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-1d228089f7.

HFSQL: HExecuteQuery(QRY_select_ordens_reparacao); HExecuteQuery(QRY_select_viatura_matricula); HReadFirst(QRY_select_viatura_matricula); HCancelDeclaration(dsQry_update); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_ordens_reparacao); HExecuteSQLQuery(dsQry_update).

Other calls: Info("Terminado").

Exact executable branch/assignment ledger:
```wlanguage
HExecuteQuery(QRY_select_ordens_reparacao,hQueryDefault)
for each QRY_select_ordens_reparacao
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao.matricula)
if hreadfirst(QRY_select_viatura_matricula)=true then
sQuery is string="update ordem_reparacao set recepcao_cliente='"+QRY_select_viatura_matricula.Cliente+"' where numero='"+QRY_select_ordens_reparacao.numero+"'"
dsQry_update is data source
HExecuteSQLQuery(dsQry_update,hQueryDefault,sQuery)
HCancelDeclaration(dsQry_update)
END
HCancelDeclaration(QRY_select_viatura_matricula)
END
HCancelDeclaration(QRY_select_ordens_reparacao)
info("Terminado")
```

### SRC-e0dfacbe65 — WIN_MENU

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:931-949`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: if hreadfirst(sistema)=false THEN; sistema.Tempo_materiais=15; sistema.Tempo_ordem_reparacao=15; sistema.Tempo_tempos=15; sistema.Data_inicio=7; sistema.encerrar_tempos1=030000; sistema.encerrar_tempos2=030000; hadd(sistema); if hreadfirst(utilizadores)=false then; utilizadores.Codigo=1; utilizadores.Descricao="Administrador"; [credential assignment omitted; original source location only]; hadd(utilizadores); if open(WIN_Acesso)="cancelar" then; endprogram(); gsValor_entrada=CommandLine("modulo"). Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-e0dfacbe65.

HFSQL: HReadFirst(sistema); HReadFirst(utilizadores); HAdd(sistema); HAdd(utilizadores).

Other calls: EndProgram(); Open(WIN_Acesso); CommandLine("modulo").

Exact executable branch/assignment ledger:
```wlanguage
if hreadfirst(sistema)=false THEN
sistema.Tempo_materiais=15
sistema.Tempo_ordem_reparacao=15
sistema.Tempo_tempos=15
sistema.Data_inicio=7
sistema.encerrar_tempos1=030000
sistema.encerrar_tempos2=030000
hadd(sistema)
END
if hreadfirst(utilizadores)=false then
utilizadores.Codigo=1
utilizadores.Descricao="Administrador"
[credential assignment omitted; original source location only]
hadd(utilizadores)
END
if open(WIN_Acesso)="cancelar" then
endprogram()
END
gsValor_entrada=CommandLine("modulo")
```

### SRC-b6a81add98 — WIN_MENU

Event `34`: End of initialization; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:952-975`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): End of initialization [34]: IF CommandLine("artigos")="1" THEN; TAB_NoName1..y=27; MenuDelete(WIN_MENU.MENU__Menu.MENU_OPT_Menu); MenuDelete(WIN_MENU.MENU__Menu.OPT_Mapas); MenuDelete(WIN_MENU.MENU__Menu.OPT_Movimentos); MenuDelete(WIN_MENU.MENU__Menu.OPT_Tabelas); MenuDelete(WIN_MENU.MENU__Menu.OPT_Utilitários); BTN_Clientes..visible=false; BTN_Viaturas..Visible=False; BTN_Ordens_reparacao..Visible=False; BTN_tempos..Visible=False; BTN_material..Visible=False; SWITCH gsValor_entrada; CASE "t"; win_menu..Visible=false; open(WIN_Tempos_Reparacao); EndProgram(); CASE "m"; win_menu..visible=False; open(WIN_Material_Reparacao); endprogram(); other case. Authoritative exact branch ledger: docs/mapping/WIN_MENU.md under SRC-b6a81add98.

HFSQL: none in this block.

Other calls: EndProgram(); EndProgram(); Open(WIN_Tempos_Reparacao); Open(WIN_Material_Reparacao); CommandLine("artigos"); MenuDelete(WIN_MENU.MENU__Menu.MENU_OPT_Menu); MenuDelete(WIN_MENU.MENU__Menu.OPT_Mapas); MenuDelete(WIN_MENU.MENU__Menu.OPT_Movimentos); MenuDelete(WIN_MENU.MENU__Menu.OPT_Tabelas); MenuDelete(WIN_MENU.MENU__Menu.OPT_Utilitários).

Exact executable branch/assignment ledger:
```wlanguage
IF CommandLine("artigos")="1" THEN
TAB_NoName1..y=27
MenuDelete(WIN_MENU.MENU__Menu.MENU_OPT_Menu)
MenuDelete(WIN_MENU.MENU__Menu.OPT_Mapas)
MenuDelete(WIN_MENU.MENU__Menu.OPT_Movimentos)
MenuDelete(WIN_MENU.MENU__Menu.OPT_Tabelas)
MenuDelete(WIN_MENU.MENU__Menu.OPT_Utilitários)
BTN_Clientes..visible=false
BTN_Viaturas..Visible=False
BTN_Ordens_reparacao..Visible=False
BTN_tempos..Visible=False
BTN_material..Visible=False
END
SWITCH gsValor_entrada
CASE "t"
win_menu..Visible=false
open(WIN_Tempos_Reparacao)
EndProgram()
CASE "m"
win_menu..visible=False
open(WIN_Material_Reparacao)
endprogram()
other case
END
```

### SRC-2e4ff82ba8 — WIN_MENU/SC_SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:54; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-4661c234d0 — WIN_MENU/SC_SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:77; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-0629a65928 — WIN_MENU/SC_SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:102; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-67eac2408b — WIN_MENU/SC_SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:127; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HExecuteQuery: `QRY_select_ordens_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:899`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:901`.
- HReadFirst: `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:902`; `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:931`; `utilizadores` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:940`.
- HCancelDeclaration: `dsQry_update` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:906`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:908`; `QRY_select_ordens_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:910`.
- HExecuteSQLQuery: `dsQry_update` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:905`.
- HAdd: `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:938`; `utilizadores` at `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:944`.

## Behavior checklist

- Open and native keyboard: U-WCB13D1-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- Actual data/timer/lock/write failure cases: U-WCB13D1-03.
- Explicit message/resource shell outcomes: U-WCB13D1-04.
- Actual field/mask/type boundaries: U-WCB13D1-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-WCB13D1-01** — No explicit source caller is indexed; resolve the framework/launch entry route separately from the known procedure parameters and event order. Missing designer fields require designer/raw dossier/image inspection. Blocks the missing routing/visual details only; interim default: preserve extracted fields and procedure contract, none for absent properties.
- **U-WCB13D1-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-WCB13D1-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteQuery, HExecuteSQLQuery, hadd, hreadfirst; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-WCB13D1-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-WCB13D1-05** — Golden boundary outcomes for empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

38/38 blocks; 4/4 encoded-only slots retained; 63 rows. Independent semantic review is a separate Stage 0 gate.

Event meaning 32 is inferred from its menu-option owners and navigation code; compile legend does not confirm it. Event trigger confirmation belongs to U-WCB13D1-02; executable operations are directly evidenced.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_MENU.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_MENU.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_MENU.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_MENU.wdw:12`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:83`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:86`
