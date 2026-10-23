# Mapping — WIN_Material_Reparacao

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw`; designer `dossier: WIN_Material_Reparacao`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Choose order/material editor.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:426 (OpenChild in WIN_MENU)`
```wlanguage
WinStatus(WIN_Material_Reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Material_Reparacao)
END
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:972 (Open in WIN_MENU)`
```wlanguage
CASE "m"
win_menu..visible=False
open(WIN_Material_Reparacao)
endprogram()
other case
END
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

ParamLancarMat true; nonempty gsValor_entrada types3;5;2 (initialization trailing semicolon),else1..8. Todos removes mechanic filter; mechanic click filters reparacao_mecanico. Material action reexecutes then seeks selected order key, rejects unavailable; write-locks order; rejects matching details window when material table has rows; Open editor modal. Early returns after lock may skip unlock. Timer sistema.Tempo_materiais*100; refresh preserves key and reapplies filter. Close removes filter/query.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw` exact event locations below; `dossier: WIN_Material_Reparacao/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-2a6708ad6f — WIN_Material_Reparacao/BTN_todos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:210-219`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: QRY_select_ordens_reparacao_matricula.ParamLancarMat=True; IF gsValor_entrada<>"" THEN; QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"; QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"; TableDisplay(TABLE_ordens_reparacao,taReExecuteQuery); HDeactivateFilter(QRY_select_ordens_reparacao_matricula); tabledisplay(TABLE_ordens_reparacao); STC_filtro_atual="Todos". Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-2a6708ad6f.

HFSQL: HDeactivateFilter(QRY_select_ordens_reparacao_matricula).

Other calls: TableDisplay(TABLE_ordens_reparacao); TableDisplay(TABLE_ordens_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
QRY_select_ordens_reparacao_matricula.ParamLancarMat=True
IF gsValor_entrada<>"" THEN
QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"
ELSE
QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"
END
TableDisplay(TABLE_ordens_reparacao,taReExecuteQuery)
HDeactivateFilter(QRY_select_ordens_reparacao_matricula)
tabledisplay(TABLE_ordens_reparacao)
STC_filtro_atual="Todos"
```

### SRC-26d646dccd — WIN_Material_Reparacao/LIST_mecanicos

Event `66050`: Left button up; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:271-280`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button up [66050]: QRY_select_ordens_reparacao_matricula.ParamLancarMat=True; IF gsValor_entrada<>"" THEN; QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"; QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"; tabledisplay(TABLE_ordens_reparacao,taReExecuteQuery); HFilter(QRY_select_ordens_reparacao_matricula,reparacao_mecanico,LIST_mecanicos); TableDisplay(TABLE_ordens_reparacao); STC_filtro_atual=LIST_mecanicos..DisplayedValue. Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-26d646dccd.

HFSQL: HFilter(QRY_select_ordens_reparacao_matricula).

Other calls: TableDisplay(TABLE_ordens_reparacao); TableDisplay(TABLE_ordens_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
QRY_select_ordens_reparacao_matricula.ParamLancarMat=True
IF gsValor_entrada<>"" THEN
QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"
ELSE
QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"
END
tabledisplay(TABLE_ordens_reparacao,taReExecuteQuery)
HFilter(QRY_select_ordens_reparacao_matricula,reparacao_mecanico,LIST_mecanicos)
TableDisplay(TABLE_ordens_reparacao)
STC_filtro_atual=LIST_mecanicos..DisplayedValue
```

### SRC-8f547da1b9 — WIN_Material_Reparacao/TABLE_ordens_reparacao

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:365-370`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: QRY_select_ordens_reparacao_matricula.ParamLancarMat=1; IF gsValor_entrada<>"" THEN; QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2;"; QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8". Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-8f547da1b9.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
QRY_select_ordens_reparacao_matricula.ParamLancarMat=1
IF gsValor_entrada<>"" THEN
QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2;"
else
QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"
END
```

### SRC-5b7c9d17d1 — WIN_Material_Reparacao/BTN_Material

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:465-527`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: nCodigo_selecionado is int=TABLE_ordens_reparacao.COL_Numero; QRY_select_ordens_reparacao_matricula.ParamLancarMat=True; IF gsValor_entrada<>"" THEN; QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"; QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"; tabledisplay(TABLE_ordens_reparacao,taReExecuteQuery); nResultado is int=tableseek(TABLE_ordens_reparacao.COL_Numero,nCodigo_selecionado); if nResultado<>-1 then; tableselectplus(TABLE_ordens_reparacao,nResultado); info("A ordem já não está disponível"); return; nLinha_Tabela is int=TABLE_ordens_reparacao; HOnError(ordem_reparacao,hErrLock,""); HReadSeek(ordem_reparacao,numero,TABLE_ordens_reparacao.COL_Numero); nRegistoatual is int=HRecNum(ordem_reparacao); IF HErrorLock()=False THEN; HLockRecNum(ordem_reparacao,nRegistoatual,hLockWrite); if HErrorLock()=true THEN; Info("Ordem de reparação em uso por outro utilizador"); RETURN; numero_ordem_rep is int=TABLE_ordens_reparacao.COL_Numero; SWITCH WinStatus(WIN_Table_Tempos_materiais_Descricoes); CASE Active; IF WIN_Table_Tempos_materiais_Descricoes.numero_ordem_reparacao=TABLE_ordens_reparacao.COL_Numero THEN; if tablecount(WIN_Table_Tempos_materiais_Descricoes.TABL. Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-5b7c9d17d1.

HFSQL: HReadSeek(ordem_reparacao); HOnError(ordem_reparacao); HUnlockRecNum(ordem_reparacao).

Other calls: Info("A ordem já não está disponível"); Info("Ordem de reparação em uso por outro utilizador"); Info("Documento em edição, por favor feche a janela"); Info("Ordem de reparação em uso por outro utilizador"); Open(WIN_Material_reparacao_form); Open(WIN_Material_reparacao_form); Open(WIN_Material_reparacao_form); TableDisplay(TABLE_ordens_reparacao); TableDisplay(TABLE_ordens_reparacao); WinStatus(WIN_Table_Tempos_materiais_Descricoes); ExecuteProcess(BTN_todos); ExecuteProcess(LIST_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
nCodigo_selecionado is int=TABLE_ordens_reparacao.COL_Numero
QRY_select_ordens_reparacao_matricula.ParamLancarMat=True
IF gsValor_entrada<>"" THEN
QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"
ELSE
QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"
END
tabledisplay(TABLE_ordens_reparacao,taReExecuteQuery)
nResultado is int=tableseek(TABLE_ordens_reparacao.COL_Numero,nCodigo_selecionado)
if nResultado<>-1 then
tableselectplus(TABLE_ordens_reparacao,nResultado)
else
info("A ordem já não está disponível")
return
END
nLinha_Tabela is int=TABLE_ordens_reparacao
HOnError(ordem_reparacao,hErrLock,"")
HReadSeek(ordem_reparacao,numero,TABLE_ordens_reparacao.COL_Numero)
nRegistoatual is int=HRecNum(ordem_reparacao)
IF HErrorLock()=False THEN
HLockRecNum(ordem_reparacao,nRegistoatual,hLockWrite)
if HErrorLock()=true THEN
Info("Ordem de reparação em uso por outro utilizador")
RETURN
else
numero_ordem_rep is int=TABLE_ordens_reparacao.COL_Numero
SWITCH WinStatus(WIN_Table_Tempos_materiais_Descricoes)
CASE Active
IF WIN_Table_Tempos_materiais_Descricoes.numero_ordem_reparacao=TABLE_ordens_reparacao.COL_Numero THEN
if tablecount(WIN_Table_Tempos_materiais_Descricoes.TABLE_materiais)>0 then
Info("Documento em edição, por favor feche a janela")
RETURN
else
Open(WIN_Material_reparacao_form,numero_ordem_rep)
end
ELSE
Open(WIN_Material_reparacao_form,numero_ordem_rep)
END
CASE NotFound
Open(WIN_Material_reparacao_form,numero_ordem_rep)
END
end
ELSE
Info("Ordem de reparação em uso por outro utilizador")
RETURN
END
HUnlockRecNum(ordem_reparacao,nRegistoatual)
QRY_select_ordens_reparacao_matricula.ParamLancarMat=True
IF gsValor_entrada<>"" THEN
QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"
ELSE
QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"
END
TableDisplay(TABLE_ordens_reparacao,taReExecuteQuery)
IF STC_filtro_atual="Todos" THEN
ExecuteProcess(BTN_todos,trtClick)
ELSE
ExecuteProcess(LIST_mecanicos,trtLeftButtonUp)
END
tableselectplus(TABLE_ordens_reparacao,nLinha_Tabela)
```

### SRC-4aa238c0e1 — WIN_Material_Reparacao/BTN_seguinte

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:551-553`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_ordens_reparacao)<TableCount(TABLE_ordens_reparacao) THEN; TABLE_ordens_reparacao=TableSelect(TABLE_ordens_reparacao)+1. Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-4aa238c0e1.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_ordens_reparacao); TableSelect(TABLE_ordens_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_ordens_reparacao)<TableCount(TABLE_ordens_reparacao) THEN
TABLE_ordens_reparacao=TableSelect(TABLE_ordens_reparacao)+1
END
```

### SRC-75a5b4aeb3 — WIN_Material_Reparacao/BTN_anterior

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:577-579`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_ordens_reparacao)>1 THEN; TABLE_ordens_reparacao=tableselect(TABLE_ordens_reparacao)-1. Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-75a5b4aeb3.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_ordens_reparacao); TableSelect(TABLE_ordens_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_ordens_reparacao)>1 THEN
TABLE_ordens_reparacao=tableselect(TABLE_ordens_reparacao)-1
END
```

### SRC-ea84e17c9a — WIN_Material_Reparacao/BTN_seguinte1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:603-606`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF ListSelect(LIST_mecanicos)<ListCount(LIST_mecanicos) THEN; ListSelectPlus(LIST_mecanicos,ListSelect(LIST_mecanicos)+1); executeprocess(LIST_mecanicos,trtLeftButtonUp). Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-ea84e17c9a.

HFSQL: none in this block.

Other calls: ListSelectPlus(LIST_mecanicos); ExecuteProcess(LIST_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
IF ListSelect(LIST_mecanicos)<ListCount(LIST_mecanicos) THEN
ListSelectPlus(LIST_mecanicos,ListSelect(LIST_mecanicos)+1)
END
executeprocess(LIST_mecanicos,trtLeftButtonUp)
```

### SRC-f07658692c — WIN_Material_Reparacao/BTN_anterior1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:630-633`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF ListSelect(LIST_mecanicos)>1 THEN; ListSelectPlus(LIST_mecanicos,ListSelect(LIST_mecanicos)-1); ExecuteProcess(LIST_mecanicos,trtLeftButtonUp). Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-f07658692c.

HFSQL: none in this block.

Other calls: ListSelectPlus(LIST_mecanicos); ExecuteProcess(LIST_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
IF ListSelect(LIST_mecanicos)>1 THEN
ListSelectPlus(LIST_mecanicos,ListSelect(LIST_mecanicos)-1)
END
ExecuteProcess(LIST_mecanicos,trtLeftButtonUp)
```

### SRC-c975f74b1f — WIN_Material_Reparacao/BTN_Fechar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:657-657`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: close(WIN_Material_Reparacao). Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-c975f74b1f.

HFSQL: none in this block.

Other calls: Close(WIN_Material_Reparacao).

Exact executable branch/assignment ledger:
```wlanguage
close(WIN_Material_Reparacao)
```

### SRC-9904a0b1fb — WIN_Material_Reparacao [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:679-683`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); hreadfirst(sistema); IF Timer("atualizar", sistema.Tempo_materiais*100, 1) = 0 THEN; Error("Erro ao criar timer de atualização"). Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-9904a0b1fb.

HFSQL: HReadFirst(sistema).

Other calls: Error("Erro ao criar timer de atualização"); Timer("atualizar").

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
hreadfirst(sistema)
IF Timer("atualizar", sistema.Tempo_materiais*100, 1) = 0 THEN
Error("Erro ao criar timer de atualização")
END
```

### SRC-475554680f — WIN_Material_Reparacao

Event `34`: End of initialization; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:686-687`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): End of initialization [34]: TABLE_ordens_reparacao.COL_matricula..FontSize=12; TABLE_ordens_reparacao.COL_matricula..FontBold=True. Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-475554680f.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
TABLE_ordens_reparacao.COL_matricula..FontSize=12
TABLE_ordens_reparacao.COL_matricula..FontBold=True
```

### SRC-04858601fc — WIN_Material_Reparacao

Event `2`: Close; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:712-713`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Close [2]: HDeactivateFilter(QRY_select_ordens_reparacao_matricula); HCancelDeclaration(QRY_select_ordens_reparacao_matricula). Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-04858601fc.

HFSQL: HCancelDeclaration(QRY_select_ordens_reparacao_matricula); HDeactivateFilter(QRY_select_ordens_reparacao_matricula).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
HDeactivateFilter(QRY_select_ordens_reparacao_matricula)
HCancelDeclaration(QRY_select_ordens_reparacao_matricula)
```

### SRC-28226e588f — WIN_Material_Reparacao [atualizar]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:721-750`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE atualizar(); nCodigo_selecionado is int=TABLE_ordens_reparacao.COL_Numero; QRY_select_ordens_reparacao_matricula.ParamLancarMat=True; IF gsValor_entrada<>"" THEN; QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"; QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"; TableDisplay(TABLE_ordens_reparacao,taReExecuteQuery); IF STC_filtro_atual="Todos" THEN; ExecuteProcess(BTN_todos,trtClick); ExecuteProcess(LIST_mecanicos,trtLeftButtonUp); tableselectplus(TABLE_ordens_reparacao,tablecount(TABLE_ordens_reparacao)); TableSelectPlus(TABLE_ordens_reparacao,tableseek(TABLE_ordens_reparacao.COL_Numero,nCodigo_selecionado)). Authoritative exact branch ledger: docs/mapping/WIN_Material_Reparacao.md under SRC-28226e588f.

HFSQL: none in this block.

Other calls: TableDisplay(TABLE_ordens_reparacao); ExecuteProcess(BTN_todos); ExecuteProcess(LIST_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE atualizar()
nCodigo_selecionado is int=TABLE_ordens_reparacao.COL_Numero
QRY_select_ordens_reparacao_matricula.ParamLancarMat=True
IF gsValor_entrada<>"" THEN
QRY_select_ordens_reparacao_matricula.ParamTipo="3;5;2"
ELSE
QRY_select_ordens_reparacao_matricula.ParamTipo="1;2;3;4;5;6;7;8"
END
TableDisplay(TABLE_ordens_reparacao,taReExecuteQuery)
IF STC_filtro_atual="Todos" THEN
ExecuteProcess(BTN_todos,trtClick)
ELSE
ExecuteProcess(LIST_mecanicos,trtLeftButtonUp)
END
tableselectplus(TABLE_ordens_reparacao,tablecount(TABLE_ordens_reparacao))
TableSelectPlus(TABLE_ordens_reparacao,tableseek(TABLE_ordens_reparacao.COL_Numero,nCodigo_selecionado))
```

### SRC-57e0b48ab7 — WIN_Material_Reparacao/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-ef85f8d20d — WIN_Material_Reparacao/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-b45a8be17a — WIN_Material_Reparacao/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-4319b6927f — WIN_Material_Reparacao/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HReadFirst: `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:680`.
- HCancelDeclaration: `QRY_select_ordens_reparacao_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:713`.
- HReadSeek: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:484`.
- HOnError: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:483`.
- HDeactivateFilter: `QRY_select_ordens_reparacao_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:217`; `QRY_select_ordens_reparacao_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:712`.
- HFilter: `QRY_select_ordens_reparacao_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:278`.
- HUnlockRecNum: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:513`.

## Behavior checklist

- Open and native keyboard: U-WE6E1AD-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-WE6E1AD-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-WE6E1AD-03.
- Explicit message/resource shell outcomes: U-WE6E1AD-04.
- Actual field/mask/type boundaries: U-WE6E1AD-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-WE6E1AD-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Parsed browsed_file/browsed_item values shown in the screen Binding cells are established dossier facts and excluded from this item. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-WE6E1AD-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_ordens_reparacao; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-WE6E1AD-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HDeactivateFilter, HErrorLock, HFilter, HLockRecNum, HOnError, HReadSeek, HRecNum, HUnlockRecNum, hreadfirst; timer overlap and refresh/reentrant effects; lock acquisition/error paths and explicit unlock omissions. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-WE6E1AD-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-WE6E1AD-05** — Golden boundary outcomes for empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

13/13 blocks; 4/4 encoded-only slots retained; 47 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:4`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:11`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:884`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:421`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:423`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:424`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:426`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:972`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1346`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1348`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1190`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1192`; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:740`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Material_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Material_reparacao_form.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Material_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Material_reparacao_form.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Material_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Material_reparacao_form.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Material_Reparacao.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Material_reparacao_form.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:269`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:272`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:281`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:284`
