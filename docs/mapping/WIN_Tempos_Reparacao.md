# Mapping — WIN_Tempos_Reparacao

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw`; designer `dossier: WIN_Tempos_Reparacao`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Monitor orders and labor by mechanic/state.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:393 (OpenChild in WIN_MENU)`
```wlanguage
WinStatus(WIN_Tempos_Reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Tempos_Reparacao)
END
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:968 (Open in WIN_MENU)`
```wlanguage
CASE "t"
win_menu..Visible=false
open(WIN_Tempos_Reparacao)
EndProgram()
CASE "m"
win_menu..visible=False
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: True. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Timer sistema.Tempo_tempos*100. Startup closes prior-day open labor(all-zero fim) using each start date+sistema.encerrar_tempos2+000 and start state. State list types2..6,initially all checked. Mechanic and selected states compose OR filters; no states/no mechanic deactivates filter in some handlers,Todos calls HFilter empty. Row selection refreshes labor child query; navigation explicitly does same. Time button opens selected labor mechanic or order mechanic and reexecutes/refilters/reseeks order. State button refuses type2. Periodic refresh checks current time within inclusive30-minute windows after both configured closure times; loops visible orders/mechanics,finds all their open labor and closes at SysDateTime using visible order state,which can differ from actual labor order state. Timer therefore writes data,not merely refresh. Then reexecutes/refilters/restores selections and child query. No transaction/checked writes. Priority1/2/3 Normal/Elevada/Urgente; state-color row decoration.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw` exact event locations below; `dossier: WIN_Tempos_Reparacao/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-2dea19d0f7 — WIN_Tempos_Reparacao/BTN_seguinte

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:210-214`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_tempos_reparacao)<TableCount(TABLE_tempos_reparacao) THEN; TABLE_tempos_reparacao=TableSelect(TABLE_tempos_reparacao)+1; QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.COL_Numero; TableDisplay(TABLE_tempos_reparacao_ordem,taReExecuteQuery). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-2dea19d0f7.

HFSQL: none in this block.

Other calls: TableDisplay(TABLE_tempos_reparacao_ordem); TableSelect(TABLE_tempos_reparacao); TableSelect(TABLE_tempos_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_tempos_reparacao)<TableCount(TABLE_tempos_reparacao) THEN
TABLE_tempos_reparacao=TableSelect(TABLE_tempos_reparacao)+1
END
QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.COL_Numero
TableDisplay(TABLE_tempos_reparacao_ordem,taReExecuteQuery)
```

### SRC-5eaf0ce88e — WIN_Tempos_Reparacao/BTN_anterior

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:238-242`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_tempos_reparacao)>1 THEN; TABLE_tempos_reparacao=TableSelect(TABLE_tempos_reparacao)-1; QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.COL_Numero; TableDisplay(TABLE_tempos_reparacao_ordem,taReExecuteQuery). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-5eaf0ce88e.

HFSQL: none in this block.

Other calls: TableDisplay(TABLE_tempos_reparacao_ordem); TableSelect(TABLE_tempos_reparacao); TableSelect(TABLE_tempos_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_tempos_reparacao)>1 THEN
TABLE_tempos_reparacao=TableSelect(TABLE_tempos_reparacao)-1
END
QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.COL_Numero
TableDisplay(TABLE_tempos_reparacao_ordem,taReExecuteQuery)
```

### SRC-f21eabb3c2 — WIN_Tempos_Reparacao/LIST_mecanicos

Event `66050`: Left button up; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:294-331`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button up [66050]: numero_linha_tabela is int=TABLE_Estados_reparacao; STC_filtro_atual=LIST_mecanicos..DisplayedValue; sFiltro is string=""; if STC_filtro_atual<>"Todos" then; sFiltro="reparacao_mecanico='"+LIST_mecanicos+"'"; sFiltro2 is string=sFiltro; j is int=1; FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao); IF i>1 THEN; TableSelectMinus(TABLE_Estados_reparacao,i-1); TableSelectPlus(TABLE_Estados_reparacao,i); IF TABLE_Estados_reparacao.COL_checkbox=1 THEN; IF sFiltro<>"" THEN; IF j=1 THEN; sFiltro2=sFiltro+" and reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; sFiltro2=sFiltro2+" or "+sFiltro+" and reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; j++; IF j=1 THEN; sFiltro2=" reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; sFiltro2=sFiltro2+" or reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; j++; IF sFiltro2="" THEN; HDeactivateFilter(QRY_select_ordens_reparacao_tempos); HFilter(QRY_select_ordens_reparacao_tempos,sFiltro2); TableDisplay(TABLE_tempos_reparacao); tableselectplus(TABLE_Estados_reparacao,numero_linha_tabela). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-f21eabb3c2.

HFSQL: HDeactivateFilter(QRY_select_ordens_reparacao_tempos); HFilter(QRY_select_ordens_reparacao_tempos).

Other calls: TableDisplay(TABLE_tempos_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
numero_linha_tabela is int=TABLE_Estados_reparacao
STC_filtro_atual=LIST_mecanicos..DisplayedValue
sFiltro is string=""
if STC_filtro_atual<>"Todos" then
sFiltro="reparacao_mecanico='"+LIST_mecanicos+"'"
end
sFiltro2 is string=sFiltro
j is int=1
FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao)
IF i>1 THEN
TableSelectMinus(TABLE_Estados_reparacao,i-1)
END
TableSelectPlus(TABLE_Estados_reparacao,i)
IF TABLE_Estados_reparacao.COL_checkbox=1 THEN
IF sFiltro<>"" THEN
IF j=1 THEN
sFiltro2=sFiltro+" and reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
ELSE
sFiltro2=sFiltro2+" or "+sFiltro+" and reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
END
j++
ELSE
IF j=1 THEN
sFiltro2=" reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
ELSE
sFiltro2=sFiltro2+" or reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
END
j++
END
END
END
IF sFiltro2="" THEN
HDeactivateFilter(QRY_select_ordens_reparacao_tempos)
ELSE
HFilter(QRY_select_ordens_reparacao_tempos,sFiltro2)
END
TableDisplay(TABLE_tempos_reparacao)
tableselectplus(TABLE_Estados_reparacao,numero_linha_tabela)
```

### SRC-47b82f261a — WIN_Tempos_Reparacao/BTN_seguinte1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:352-354`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_Estados_reparacao)<TableCount(TABLE_Estados_reparacao) THEN; TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)+1. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-47b82f261a.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_Estados_reparacao); TableSelect(TABLE_Estados_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_Estados_reparacao)<TableCount(TABLE_Estados_reparacao) THEN
TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)+1
END
```

### SRC-222ba9d736 — WIN_Tempos_Reparacao/BTN_anterior1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:378-380`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_Estados_reparacao)>1 THEN; TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)-1. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-222ba9d736.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_Estados_reparacao); TableSelect(TABLE_Estados_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_Estados_reparacao)>1 THEN
TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)-1
END
```

### SRC-5c0c820a2e — WIN_Tempos_Reparacao/BTN_Tempos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:404-420`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: nUmero_ordem is int=TABLE_tempos_reparacao.COL_numero; if TABLE_tempos_reparacao_ordem=-1 then; Open(WIN_Tempos_Reparacao_Tempo,QRY_select_ordens_reparacao_tempos.numero,qry_select_ordens_reparacao_tempos.reparacao_mecanico); open(WIN_Tempos_Reparacao_Tempo,QRY_select_tempos_reparacao_ordem.numero,QRY_select_tempos_reparacao_ordem.mecanico); TableDisplay(TABLE_tempos_reparacao,taReExecuteQuery); if STC_filtro_atual="Todos" then; ExecuteProcess(BTN_todos,trtclick); ExecuteProcess(LIST_mecanicos,trtLeftButtonUp); tableselectplus(TABLE_tempos_reparacao,tablecount(TABLE_tempos_reparacao)); TableSelectPlus(TABLE_tempos_reparacao,tableseek(COL_numero,nUmero_ordem)); ExecuteProcess(TABLE_tempos_reparacao,trtSelection). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-5c0c820a2e.

HFSQL: none in this block.

Other calls: Open(WIN_Tempos_Reparacao_Tempo); Open(WIN_Tempos_Reparacao_Tempo); TableDisplay(TABLE_tempos_reparacao); ExecuteProcess(BTN_todos); ExecuteProcess(LIST_mecanicos); ExecuteProcess(TABLE_tempos_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
nUmero_ordem is int=TABLE_tempos_reparacao.COL_numero
if TABLE_tempos_reparacao_ordem=-1 then
Open(WIN_Tempos_Reparacao_Tempo,QRY_select_ordens_reparacao_tempos.numero,qry_select_ordens_reparacao_tempos.reparacao_mecanico)
else
open(WIN_Tempos_Reparacao_Tempo,QRY_select_tempos_reparacao_ordem.numero,QRY_select_tempos_reparacao_ordem.mecanico)
end
TableDisplay(TABLE_tempos_reparacao,taReExecuteQuery)
if STC_filtro_atual="Todos" then
ExecuteProcess(BTN_todos,trtclick)
else
ExecuteProcess(LIST_mecanicos,trtLeftButtonUp)
END
tableselectplus(TABLE_tempos_reparacao,tablecount(TABLE_tempos_reparacao))
TableSelectPlus(TABLE_tempos_reparacao,tableseek(COL_numero,nUmero_ordem))
ExecuteProcess(TABLE_tempos_reparacao,trtSelection)
```

### SRC-25a7d24c72 — WIN_Tempos_Reparacao/BTN_todos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:444-467`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: HDeactivateFilter(QRY_select_ordens_reparacao_tempos); TableDisplay(TABLE_tempos_reparacao); numero_linha_tabela is int=TABLE_Estados_reparacao; sFiltro2 is string; j is int=1; FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao); IF i>1 THEN; TableSelectMinus(TABLE_Estados_reparacao,i-1); TableSelectPlus(TABLE_Estados_reparacao,i); IF TABLE_Estados_reparacao.COL_checkbox=1 THEN; IF j=1 THEN; sFiltro2=" reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; sFiltro2=sFiltro2+" or reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; j++; HFilter(QRY_select_ordens_reparacao_tempos,sFiltro2); TableDisplay(TABLE_tempos_reparacao); STC_filtro_atual="Todos"; tableselectplus(TABLE_Estados_reparacao,numero_linha_tabela). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-25a7d24c72.

HFSQL: HDeactivateFilter(QRY_select_ordens_reparacao_tempos); HFilter(QRY_select_ordens_reparacao_tempos).

Other calls: TableDisplay(TABLE_tempos_reparacao); TableDisplay(TABLE_tempos_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
HDeactivateFilter(QRY_select_ordens_reparacao_tempos)
TableDisplay(TABLE_tempos_reparacao)
numero_linha_tabela is int=TABLE_Estados_reparacao
sFiltro2 is string
j is int=1
FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao)
IF i>1 THEN
TableSelectMinus(TABLE_Estados_reparacao,i-1)
END
TableSelectPlus(TABLE_Estados_reparacao,i)
IF TABLE_Estados_reparacao.COL_checkbox=1 THEN
IF j=1 THEN
sFiltro2=" reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
ELSE
sFiltro2=sFiltro2+" or reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
END
j++
END
END
HFilter(QRY_select_ordens_reparacao_tempos,sFiltro2)
TableDisplay(TABLE_tempos_reparacao)
STC_filtro_atual="Todos"
tableselectplus(TABLE_Estados_reparacao,numero_linha_tabela)
```

### SRC-fafcfa6be8 — WIN_Tempos_Reparacao/BTN_Estado

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:504-517`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if TABLE_tempos_reparacao.COL_tipo=2 then; info("A reparação está a espera do início"); return; numero_linha_tabela is int=TABLE_tempos_reparacao; open(WIN_Tempos_Reparacao_Estado,TABLE_tempos_reparacao.COL_Numero); TableDisplay(TABLE_tempos_reparacao,taReExecuteQuery); IF STC_filtro_atual="Todos" THEN; ExecuteProcess(BTN_todos,trtClick); ExecuteProcess(LIST_mecanicos,trtLeftButtonUp); tableselectplus(TABLE_tempos_reparacao,numero_linha_tabela); executeprocess(TABLE_tempos_reparacao,trtselection). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-fafcfa6be8.

HFSQL: none in this block.

Other calls: Info("A reparação está a espera do início"); Open(WIN_Tempos_Reparacao_Estado); TableDisplay(TABLE_tempos_reparacao); ExecuteProcess(BTN_todos); ExecuteProcess(LIST_mecanicos); ExecuteProcess(TABLE_tempos_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
if TABLE_tempos_reparacao.COL_tipo=2 then
info("A reparação está a espera do início")
return
END
numero_linha_tabela is int=TABLE_tempos_reparacao
open(WIN_Tempos_Reparacao_Estado,TABLE_tempos_reparacao.COL_Numero)
TableDisplay(TABLE_tempos_reparacao,taReExecuteQuery)
IF STC_filtro_atual="Todos" THEN
ExecuteProcess(BTN_todos,trtClick)
ELSE
ExecuteProcess(LIST_mecanicos,trtLeftButtonUp)
END
tableselectplus(TABLE_tempos_reparacao,numero_linha_tabela)
executeprocess(TABLE_tempos_reparacao,trtselection)
```

### SRC-ebb17cacbd — WIN_Tempos_Reparacao/TABLE_Estados_reparacao

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:682-689`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: Query="SELECT estados_reparacao.Codigo AS Codigo,estados_reparacao.Descricao AS Descricao,estados_reparacao.tipo AS tipo,estados_reparacao.cor as cor FROM estados_reparacao "; Query=Query+" WHERE estados_reparacao.tipo =2 or estados_reparacao.tipo =3 or estados_reparacao.tipo =4 or estados_reparacao.tipo =5 or estados_reparacao.tipo =6 order by tipo asc"; Qry_select_estados_reparacao is data source; HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query); FOR EACH Qry_select_estados_reparacao; TableAddLine(TABLE_Estados_reparacao,False,Qry_select_estados_reparacao.codigo,Qry_select_estados_reparacao.descricao,Qry_select_estados_reparacao.tipo,"",Qry_select_estados_reparacao.cor); HCancelDeclaration(Qry_select_estados_reparacao). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-ebb17cacbd.

HFSQL: HCancelDeclaration(Qry_select_estados_reparacao); HExecuteSQLQuery(Qry_select_estados_reparacao).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Query="SELECT estados_reparacao.Codigo AS Codigo,estados_reparacao.Descricao AS Descricao,estados_reparacao.tipo AS tipo,estados_reparacao.cor as cor FROM estados_reparacao "
Query=Query+" WHERE estados_reparacao.tipo =2 or estados_reparacao.tipo =3 or estados_reparacao.tipo =4 or estados_reparacao.tipo =5 or estados_reparacao.tipo =6 order by tipo asc"
Qry_select_estados_reparacao is data source
HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query)
FOR EACH Qry_select_estados_reparacao
TableAddLine(TABLE_Estados_reparacao,False,Qry_select_estados_reparacao.codigo,Qry_select_estados_reparacao.descricao,Qry_select_estados_reparacao.tipo,"",Qry_select_estados_reparacao.cor)
END
HCancelDeclaration(Qry_select_estados_reparacao)
```

### SRC-7ccc88abfb — WIN_Tempos_Reparacao/TABLE_Estados_reparacao

Event `21`: Display a row; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:712-712`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Display a row [21]: TABLE_Estados_reparacao.COL_imagem[TABLE_Estados_reparacao].SHA_cor..BrushColor=TABLE_Estados_reparacao.col_cor. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-7ccc88abfb.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
TABLE_Estados_reparacao.COL_imagem[TABLE_Estados_reparacao].SHA_cor..BrushColor=TABLE_Estados_reparacao.col_cor
```

### SRC-97dd4aa47f — WIN_Tempos_Reparacao/TABLE_Estados_reparacao

Event `66050`: Left button up; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:753-792`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button up [66050]: numero_linha_tabela is int=TABLE_Estados_reparacao; sFiltro is string=""; IF STC_filtro_atual<>"Todos" THEN; sFiltro="reparacao_mecanico='"+LIST_mecanicos+"'"; sFiltro2 is string=sFiltro; j is int=1; FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao); IF i>1 THEN; TableSelectMinus(TABLE_Estados_reparacao,i-1); TableSelectPlus(TABLE_Estados_reparacao,i); IF TABLE_Estados_reparacao.COL_checkbox=1 THEN; IF sFiltro<>"" THEN; IF j=1 THEN; sFiltro2=sFiltro+" and reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; sFiltro2=sFiltro2+" or "+sFiltro+" and reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; j++; IF j=1 THEN; sFiltro2=" reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; sFiltro2=sFiltro2+" or reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"; j++; if sFiltro2="" then; HDeactivateFilter(QRY_select_ordens_reparacao_tempos); HFilter(QRY_select_ordens_reparacao_tempos,sFiltro2); TableDisplay(TABLE_tempos_reparacao); tableselectplus(TABLE_Estados_reparacao,numero_linha_tabela). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-97dd4aa47f.

HFSQL: HDeactivateFilter(QRY_select_ordens_reparacao_tempos); HFilter(QRY_select_ordens_reparacao_tempos).

Other calls: TableDisplay(TABLE_tempos_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
numero_linha_tabela is int=TABLE_Estados_reparacao
sFiltro is string=""
IF STC_filtro_atual<>"Todos" THEN
sFiltro="reparacao_mecanico='"+LIST_mecanicos+"'"
END
sFiltro2 is string=sFiltro
j is int=1
FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao)
IF i>1 THEN
TableSelectMinus(TABLE_Estados_reparacao,i-1)
END
TableSelectPlus(TABLE_Estados_reparacao,i)
IF TABLE_Estados_reparacao.COL_checkbox=1 THEN
IF sFiltro<>"" THEN
IF j=1 THEN
sFiltro2=sFiltro+" and reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
ELSE
sFiltro2=sFiltro2+" or "+sFiltro+" and reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
END
j++
ELSE
IF j=1 THEN
sFiltro2=" reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
ELSE
sFiltro2=sFiltro2+" or reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"'"
END
j++
END
END
END
if sFiltro2="" then
HDeactivateFilter(QRY_select_ordens_reparacao_tempos)
else
HFilter(QRY_select_ordens_reparacao_tempos,sFiltro2)
END
TableDisplay(TABLE_tempos_reparacao)
tableselectplus(TABLE_Estados_reparacao,numero_linha_tabela)
```

### SRC-ef8b3f1bbd — WIN_Tempos_Reparacao/BTN_seguinte2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:813-815`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_tempos_reparacao_ordem)<TableCount(TABLE_tempos_reparacao_ordem) THEN; TABLE_tempos_reparacao_ordem=TableSelect(TABLE_tempos_reparacao_ordem)+1. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-ef8b3f1bbd.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_tempos_reparacao_ordem); TableSelect(TABLE_tempos_reparacao_ordem).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_tempos_reparacao_ordem)<TableCount(TABLE_tempos_reparacao_ordem) THEN
TABLE_tempos_reparacao_ordem=TableSelect(TABLE_tempos_reparacao_ordem)+1
END
```

### SRC-94cfe8d461 — WIN_Tempos_Reparacao/BTN_anterior2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:839-841`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_tempos_reparacao_ordem)>1 THEN; TABLE_tempos_reparacao_ordem=TableSelect(TABLE_tempos_reparacao_ordem)-1. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-94cfe8d461.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_tempos_reparacao_ordem); TableSelect(TABLE_tempos_reparacao_ordem).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_tempos_reparacao_ordem)>1 THEN
TABLE_tempos_reparacao_ordem=TableSelect(TABLE_tempos_reparacao_ordem)-1
END
```

### SRC-642796088c — WIN_Tempos_Reparacao/TABLE_tempos_reparacao_ordem

Event `21`: Display a row; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:931-938`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Display a row [21]: SWITCH TABLE_tempos_reparacao.COL_Prioridade; CASE "1"; TABLE_tempos_reparacao.COL_Prioridade="Normal"; CASE "2"; TABLE_tempos_reparacao.COL_Prioridade="Elevada"; CASE "3"; TABLE_tempos_reparacao.COL_Prioridade="Urgente". Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-642796088c.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
SWITCH TABLE_tempos_reparacao.COL_Prioridade
CASE "1"
TABLE_tempos_reparacao.COL_Prioridade="Normal"
CASE "2"
TABLE_tempos_reparacao.COL_Prioridade="Elevada"
CASE "3"
TABLE_tempos_reparacao.COL_Prioridade="Urgente"
END
```

### SRC-af35a2fb04 — WIN_Tempos_Reparacao/BTN_Informacao

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:996-996`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: open(WIN_Tempos_Reparacao_Informacao,TABLE_tempos_reparacao.COL_Numero). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-af35a2fb04.

HFSQL: none in this block.

Other calls: Open(WIN_Tempos_Reparacao_Informacao).

Exact executable branch/assignment ledger:
```wlanguage
open(WIN_Tempos_Reparacao_Informacao,TABLE_tempos_reparacao.COL_Numero)
```

### SRC-c5ec2288d4 — WIN_Tempos_Reparacao/TABLE_tempos_reparacao

Event `21`: Display a row; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1279-1287`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Display a row [21]: SWITCH TABLE_tempos_reparacao.COL_prioridade; CASE "1"; TABLE_tempos_reparacao.COL_prioridade="Normal"; CASE "2"; TABLE_tempos_reparacao.COL_prioridade="Elevada"; CASE "3"; TABLE_tempos_reparacao.COL_prioridade="Urgente"; TABLE_tempos_reparacao.COL_imagem[TABLE_tempos_reparacao].SHA_cor..BrushColor=QRY_select_ordens_reparacao_tempos.cor. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-c5ec2288d4.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
SWITCH TABLE_tempos_reparacao.COL_prioridade
CASE "1"
TABLE_tempos_reparacao.COL_prioridade="Normal"
CASE "2"
TABLE_tempos_reparacao.COL_prioridade="Elevada"
CASE "3"
TABLE_tempos_reparacao.COL_prioridade="Urgente"
END
TABLE_tempos_reparacao.COL_imagem[TABLE_tempos_reparacao].SHA_cor..BrushColor=QRY_select_ordens_reparacao_tempos.cor
```

### SRC-891ff6fbd3 — WIN_Tempos_Reparacao/TABLE_tempos_reparacao

Event `33`: Select a row; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1303-1304`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Select a row [33]: QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.col_numero; TableDisplay(TABLE_tempos_reparacao_ordem,taReExecuteQuery). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-891ff6fbd3.

HFSQL: none in this block.

Other calls: TableDisplay(TABLE_tempos_reparacao_ordem).

Exact executable branch/assignment ledger:
```wlanguage
QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.col_numero
TableDisplay(TABLE_tempos_reparacao_ordem,taReExecuteQuery)
```

### SRC-9dc5a50262 — WIN_Tempos_Reparacao/BTN_Fechar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1346-1346`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: close(WIN_Tempos_Reparacao). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-9dc5a50262.

HFSQL: none in this block.

Other calls: Close(WIN_Tempos_Reparacao).

Exact executable branch/assignment ledger:
```wlanguage
close(WIN_Tempos_Reparacao)
```

### SRC-d11bf8c9be — WIN_Tempos_Reparacao [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1368-1389`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); HReadFirst(sistema); IF Timer("atualizar", sistema.Tempo_tempos*100, 3) = 0 THEN; Error("Erro ao criar timer de atualização"); gdAta is date; gddata_hora is datetime; gddata_hora=sysdatetime(); query is string; query="SELECT * FROM tempos_reparacao WHERE tempos_reparacao.fim='00000000000000000' and tempos_reparacao.inicio<'"+gddata_hora..date+"000000000'"; QRY_select_tempos_Reparacao_numero is data source; HExecuteSQLQuery(QRY_select_tempos_Reparacao_numero,hQueryDefault,query); FOR EACH QRY_select_tempos_Reparacao_numero; gdata=QRY_select_tempos_Reparacao_numero.inicio..date; query="UPDATE tempos_reparacao SET fim ='"+numtostring(gdAta)+numtostring(sistema.encerrar_tempos2)+"000',fim_reparacao_estado ='"+QRY_select_tempos_Reparacao_numero.Inicio_reparacao_estado+"' WHERE tempos_reparacao.numero ='"+QRY_select_tempos_Reparacao_numero.numero+"' AND tempos_reparacao.mecanico ='"+QRY_select_tempos_Reparacao_numero.mecanico+"' and tempos_reparacao.fim='00000000000000000'"; Qry_update_tempos_reparacao is data source; HExecuteSQLQuery(Qry_update_tempos_reparacao,hQueryDefault,query); HCancelDeclaration(Qry_update_tempos_reparacao); HCancelDeclaration(QRY_select_tempos_Reparacao_numero). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-d11bf8c9be.

HFSQL: HReadFirst(sistema); HCancelDeclaration(Qry_update_tempos_reparacao); HCancelDeclaration(QRY_select_tempos_Reparacao_numero); HExecuteSQLQuery(QRY_select_tempos_Reparacao_numero); HExecuteSQLQuery(Qry_update_tempos_reparacao).

Other calls: Error("Erro ao criar timer de atualização"); Timer("atualizar").

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
HReadFirst(sistema)
IF Timer("atualizar", sistema.Tempo_tempos*100, 3) = 0 THEN
Error("Erro ao criar timer de atualização")
END
gdAta is date
gddata_hora is datetime
gddata_hora=sysdatetime()
query is string
query="SELECT * FROM tempos_reparacao WHERE tempos_reparacao.fim='00000000000000000' and tempos_reparacao.inicio<'"+gddata_hora..date+"000000000'"
QRY_select_tempos_Reparacao_numero is data source
HExecuteSQLQuery(QRY_select_tempos_Reparacao_numero,hQueryDefault,query)
FOR EACH QRY_select_tempos_Reparacao_numero
gdata=QRY_select_tempos_Reparacao_numero.inicio..date
query="UPDATE tempos_reparacao SET fim ='"+numtostring(gdAta)+numtostring(sistema.encerrar_tempos2)+"000',fim_reparacao_estado ='"+QRY_select_tempos_Reparacao_numero.Inicio_reparacao_estado+"' WHERE tempos_reparacao.numero ='"+QRY_select_tempos_Reparacao_numero.numero+"' AND tempos_reparacao.mecanico ='"+QRY_select_tempos_Reparacao_numero.mecanico+"' and tempos_reparacao.fim='00000000000000000'"
Qry_update_tempos_reparacao is data source
HExecuteSQLQuery(Qry_update_tempos_reparacao,hQueryDefault,query)
HCancelDeclaration(Qry_update_tempos_reparacao)
END
HCancelDeclaration(QRY_select_tempos_Reparacao_numero)
```

### SRC-c2c56c6161 — WIN_Tempos_Reparacao

Event `34`: End of initialization; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1392-1396`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): End of initialization [34]: WIN_Tempos_Reparacao.TABLE_tempos_reparacao.COL_Matricula..FontSize=12; WIN_Tempos_Reparacao.TABLE_tempos_reparacao.COL_Matricula..FontBold=true; for EACH row of TABLE_Estados_reparacao; TABLE_Estados_reparacao.COL_checkbox=1. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-c2c56c6161.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
WIN_Tempos_Reparacao.TABLE_tempos_reparacao.COL_Matricula..FontSize=12
WIN_Tempos_Reparacao.TABLE_tempos_reparacao.COL_Matricula..FontBold=true
for EACH row of TABLE_Estados_reparacao
TABLE_Estados_reparacao.COL_checkbox=1
END
```

### SRC-7a8ab06c73 — WIN_Tempos_Reparacao

Event `2`: Close; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1421-1421`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Close [2]: HDeactivateFilter(QRY_select_ordens_reparacao_tempos). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-7a8ab06c73.

HFSQL: HDeactivateFilter(QRY_select_ordens_reparacao_tempos).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
HDeactivateFilter(QRY_select_ordens_reparacao_tempos)
```

### SRC-de53acf761 — WIN_Tempos_Reparacao [atualizar]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1429-1487`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE atualizar(); nCodigo_selecionado is int=TABLE_tempos_reparacao.COL_Numero; numero_linha_tabela is int=TABLE_Estados_reparacao; if hreadfirst(sistema)=true then; tEmpo_inicio_1,tEmpo_fim_1,tEmpo_inicio_2,tEmpo_fim_2 is time; tEmpo_inicio_1=sistema.encerrar_tempos1; tEmpo_fim_1=tEmpo_inicio_1; tEmpo_fim_1..minute+=30; tEmpo_inicio_2=sistema.encerrar_tempos2; tEmpo_fim_2=tEmpo_inicio_2; tEmpo_fim_2..Minute+=30; if (timesys()>=tEmpo_inicio_1 and TimeSys()<=tEmpo_fim_1) or (TimeSys()>=tEmpo_inicio_2 AND TimeSys()<=tEmpo_fim_2) then; FOR EACH ROW OF TABLE_tempos_reparacao; query="SELECT tempos_reparacao.numero AS numero,tempos_reparacao.mecanico AS mecanico,tempos_reparacao.inicio AS inicio,tempos_reparacao.fim AS fim FROM tempos_reparacao"; query=query+" WHERE tempos_reparacao.mecanico ='"+TABLE_tempos_reparacao.COL_mecanico_codigo+"' and tempos_reparacao.fim='00000000000000000'"; HExecuteSQLQuery(QRY_select_tempos_Reparacao_numero,hQueryDefault,query); FOR EACH QRY_select_tempos_Reparacao_numero; HReadSeek(ordem_reparacao,numero,QRY_select_tempos_Reparacao_numero.numero,hIdentical); IF HFound(ordem_reparacao)=True THEN; query="UPDATE tempos_reparacao SET fim ='"+SysDateTime(). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao.md under SRC-de53acf761.

HFSQL: HReadFirst(sistema); HCancelDeclaration(Qry_update_tempos_reparacao); HCancelDeclaration(QRY_select_tempos_Reparacao_numero); HExecuteSQLQuery(QRY_select_tempos_Reparacao_numero); HExecuteSQLQuery(Qry_update_tempos_reparacao); HReadSeek(ordem_reparacao); HFound(ordem_reparacao).

Other calls: TableDisplay(TABLE_tempos_reparacao); TableDisplay(TABLE_tempos_reparacao_ordem); ExecuteProcess(BTN_todos); ExecuteProcess(LIST_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE atualizar()
nCodigo_selecionado is int=TABLE_tempos_reparacao.COL_Numero
numero_linha_tabela is int=TABLE_Estados_reparacao
if hreadfirst(sistema)=true then
tEmpo_inicio_1,tEmpo_fim_1,tEmpo_inicio_2,tEmpo_fim_2 is time
tEmpo_inicio_1=sistema.encerrar_tempos1
tEmpo_fim_1=tEmpo_inicio_1
tEmpo_fim_1..minute+=30
tEmpo_inicio_2=sistema.encerrar_tempos2
tEmpo_fim_2=tEmpo_inicio_2
tEmpo_fim_2..Minute+=30
if (timesys()>=tEmpo_inicio_1 and TimeSys()<=tEmpo_fim_1) or (TimeSys()>=tEmpo_inicio_2 AND TimeSys()<=tEmpo_fim_2) then
FOR EACH ROW OF TABLE_tempos_reparacao
query="SELECT tempos_reparacao.numero AS numero,tempos_reparacao.mecanico AS mecanico,tempos_reparacao.inicio AS inicio,tempos_reparacao.fim AS fim FROM tempos_reparacao"
query=query+" WHERE tempos_reparacao.mecanico ='"+TABLE_tempos_reparacao.COL_mecanico_codigo+"' and tempos_reparacao.fim='00000000000000000'"
HExecuteSQLQuery(QRY_select_tempos_Reparacao_numero,hQueryDefault,query)
FOR EACH QRY_select_tempos_Reparacao_numero
HReadSeek(ordem_reparacao,numero,QRY_select_tempos_Reparacao_numero.numero,hIdentical)
IF HFound(ordem_reparacao)=True THEN
query="UPDATE tempos_reparacao SET fim ='"+SysDateTime()+"',fim_reparacao_estado ='"+TABLE_tempos_reparacao.COL_estado_codigo+"' WHERE tempos_reparacao.numero ='"+QRY_select_tempos_Reparacao_numero.numero+"' AND tempos_reparacao.mecanico ='"+TABLE_tempos_reparacao.COL_mecanico_codigo+"' and tempos_reparacao.fim='00000000000000000'"
HExecuteSQLQuery(Qry_update_tempos_reparacao,hQueryDefault,query)
HCancelDeclaration(Qry_update_tempos_reparacao)
END
END
HCancelDeclaration(QRY_select_tempos_Reparacao_numero)
END
END
END
TableDisplay(TABLE_tempos_reparacao,taReExecuteQuery)
IF STC_filtro_atual="Todos" THEN
ExecuteProcess(BTN_todos,trtClick)
ELSE
ExecuteProcess(LIST_mecanicos,trtLeftButtonUp)
END
TableSelectPlus(TABLE_Estados_reparacao,numero_linha_tabela)
tableselectplus(TABLE_tempos_reparacao,tablecount(TABLE_tempos_reparacao))
TableSelectPlus(TABLE_tempos_reparacao,TableSeek(TABLE_tempos_reparacao.COL_numero,nCodigo_selecionado))
QRY_select_tempos_reparacao_ordem.ParamNumero=TABLE_tempos_reparacao.COL_numero
TableDisplay(TABLE_tempos_reparacao_ordem,taReExecuteQuery)
```

### SRC-2db843cdce — WIN_Tempos_Reparacao/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-54d4dfc592 — WIN_Tempos_Reparacao/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-4be2ddd986 — WIN_Tempos_Reparacao/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-029ac00f71 — WIN_Tempos_Reparacao/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HReadFirst: `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1369`; `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1445`.
- HCancelDeclaration: `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:689`; `Qry_update_tempos_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1387`; `QRY_select_tempos_Reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1389`; `Qry_update_tempos_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1466`; `QRY_select_tempos_Reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1469`.
- HExecuteSQLQuery: `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:685`; `QRY_select_tempos_Reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1381`; `Qry_update_tempos_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1386`; `QRY_select_tempos_Reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1460`; `Qry_update_tempos_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1465`.
- HReadSeek: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1462`.
- HFound: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1463`.
- HDeactivateFilter: `QRY_select_ordens_reparacao_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:326`; `QRY_select_ordens_reparacao_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:444`; `QRY_select_ordens_reparacao_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:787`; `QRY_select_ordens_reparacao_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:1421`.
- HFilter: `QRY_select_ordens_reparacao_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:328`; `QRY_select_ordens_reparacao_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:464`; `QRY_select_ordens_reparacao_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:789`.

## Behavior checklist

- Open and native keyboard: U-W9DD275-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-W9DD275-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-W9DD275-03.
- Explicit message/resource shell outcomes: U-W9DD275-04.
- Actual field/mask/type boundaries: U-W9DD275-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W9DD275-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Parsed browsed_file/browsed_item values shown in the screen Binding cells are established dossier facts and excluded from this item. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W9DD275-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_Estados_reparacao, TABLE_tempos_reparacao, TABLE_tempos_reparacao_ordem; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W9DD275-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HDeactivateFilter, HExecuteSQLQuery, HFilter, HFound, HReadFirst, HReadSeek, hreadfirst; failed or partial writes in the actual save/update blocks; timer overlap and refresh/reentrant effects. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W9DD275-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W9DD275-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

22/22 blocks; 4/4 encoded-only slots retained; 75 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:388`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:390`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:391`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:393`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:968`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:4`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:11`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:4`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:11`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:141`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:266`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:4`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:11`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Tempos_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Tempos_Reparacao_Estado.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Tempos_Reparacao_Informacao.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Tempos_Reparacao_Tempo.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Tempos_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Tempos_Reparacao_Estado.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Tempos_Reparacao_Informacao.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Tempos_Reparacao_Tempo.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Tempos_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Tempos_Reparacao_Estado.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Tempos_Reparacao_Informacao.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Tempos_Reparacao_Tempo.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Tempos_Reparacao.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Tempos_Reparacao_Estado.wdw:12`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Tempos_Reparacao_Informacao.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Tempos_Reparacao_Tempo.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:323`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:326`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:329`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:332`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:335`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:338`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:581`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:584`
