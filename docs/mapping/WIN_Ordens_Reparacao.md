# Mapping — WIN_Ordens_Reparacao

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw`; designer `dossier: WIN_Ordens_Reparacao`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Browse/filter/maintain repair orders.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:294 (OpenChild in WIN_MENU)`
```wlanguage
WinStatus(WIN_Ordens_Reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Ordens_Reparacao)
END
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:710 (OpenChild in WIN_MENU)`
```wlanguage
WinStatus(WIN_Ordens_Reparacao,TopActive)
CASE NotFound
OpenChild(WIN_Ordens_Reparacao)
END
type : 32
-
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Initial entry end today23:59:59,start today-system.Data_inicio midnight; delivery start same, end today+7 midnight. Timer Tempo_ordem_reparacao*100. SQL inner client/vehicle/state joins omit orphans,left mechanic/third-party. Inclusive datetime ranges,optional priority/mechanic/client-or-thirdparty/uppercased plate-or-brandmodel LIKE substring. Selected states OR group; none selected no restriction. numero DESC; first initially,else fallback last then old-key seek. Delete order,materials,labor without restoring article stock,transaction or checked returns. Gravar persists lancar_defa defaults. Information lock and matching editor guard have early-return unlock risks. Priority1/2/3 Normal/Elevada/Urgente,state row color.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw` exact event locations below; `dossier: WIN_Ordens_Reparacao/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-390dd6c737 — WIN_Ordens_Reparacao/TABLE_QRY_select_ordens_reparacao

Event `21`: Display a row; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:499-507`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Display a row [21]: switch TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade; case "1"; TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade="Normal"; case "2"; TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade="Elevada"; case "3"; TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade="Urgente"; TABLE_QRY_select_ordens_reparacao.COL_imagem[TABLE_QRY_select_ordens_reparacao].SHA_cor..BrushColor=TABLE_QRY_select_ordens_reparacao.col_Cor. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-390dd6c737.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
switch TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade
case "1"
TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade="Normal"
case "2"
TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade="Elevada"
case "3"
TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade="Urgente"
END
TABLE_QRY_select_ordens_reparacao.COL_imagem[TABLE_QRY_select_ordens_reparacao].SHA_cor..BrushColor=TABLE_QRY_select_ordens_reparacao.col_Cor
```

### SRC-98518984e2 — WIN_Ordens_Reparacao/TABLE_Estados_reparacao

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:782-789`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: TableDeleteAll(TABLE_Estados_reparacao); Query is string="select lancar_defa,codigo,descricao,tipo,cor from estados_reparacao order by tipo asc"; Qry_select_estados_reparacao is data source; HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query); for EACH Qry_select_estados_reparacao; tableaddline(TABLE_Estados_reparacao,Qry_select_estados_reparacao.lancar_defa,Qry_select_estados_reparacao.codigo,Qry_select_estados_reparacao.descricao,Qry_select_estados_reparacao.tipo,"",Qry_select_estados_reparacao.cor); HCancelDeclaration(Qry_select_estados_reparacao). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-98518984e2.

HFSQL: HCancelDeclaration(Qry_select_estados_reparacao); HExecuteSQLQuery(Qry_select_estados_reparacao).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
TableDeleteAll(TABLE_Estados_reparacao)
Query is string="select lancar_defa,codigo,descricao,tipo,cor from estados_reparacao order by tipo asc"
Qry_select_estados_reparacao is data source
HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query)
for EACH Qry_select_estados_reparacao
tableaddline(TABLE_Estados_reparacao,Qry_select_estados_reparacao.lancar_defa,Qry_select_estados_reparacao.codigo,Qry_select_estados_reparacao.descricao,Qry_select_estados_reparacao.tipo,"",Qry_select_estados_reparacao.cor)
END
HCancelDeclaration(Qry_select_estados_reparacao)
```

Assumed action following code: Nothing beyond the code next to it (`proposed: A-cef8fd`).

### SRC-240e874995 — WIN_Ordens_Reparacao/TABLE_Estados_reparacao

Event `21`: Display a row; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:812-812`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Display a row [21]: TABLE_Estados_reparacao.COL_imagem[TABLE_Estados_reparacao].SHA_cor..BrushColor=TABLE_Estados_reparacao.col_cor[TABLE_Estados_reparacao]. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-240e874995.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
TABLE_Estados_reparacao.COL_imagem[TABLE_Estados_reparacao].SHA_cor..BrushColor=TABLE_Estados_reparacao.col_cor[TABLE_Estados_reparacao]
```

### SRC-535e80e403 — WIN_Ordens_Reparacao/BTN_VISION

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1052-1052`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-535e80e403.

HFSQL: none in this block.

Other calls: Open(WIN_Table_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico)
```

### SRC-b1f760ae86 — WIN_Ordens_Reparacao/BTN_VISION1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1076-1076`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_matricula=open(WIN_Table_Viaturas,true,EDT_matricula). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-b1f760ae86.

HFSQL: none in this block.

Other calls: Open(WIN_Table_Viaturas).

Exact executable branch/assignment ledger:
```wlanguage
EDT_matricula=open(WIN_Table_Viaturas,true,EDT_matricula)
```

### SRC-b30336fe4b — WIN_Ordens_Reparacao/BTN_Actualizar_Dados

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1100-1100`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: atualizar(). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-b30336fe4b.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
atualizar()
```

### SRC-385d90c6c0 — WIN_Ordens_Reparacao/BTN_Novo

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1124-1125`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: open(WIN_Ordens_Reparacao_Form,"NOVO",0); atualizar(). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-385d90c6c0.

HFSQL: none in this block.

Other calls: Open(WIN_Ordens_Reparacao_Form).

Exact executable branch/assignment ledger:
```wlanguage
open(WIN_Ordens_Reparacao_Form,"NOVO",0)
atualizar()
```

### SRC-21d283fcfc — WIN_Ordens_Reparacao/BTN_Alterar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1149-1150`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Open(WIN_Ordens_Reparacao_Form,"MODIFICAR",TABLE_QRY_select_ordens_reparacao.COL_Numero); atualizar(). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-21d283fcfc.

HFSQL: none in this block.

Other calls: Open(WIN_Ordens_Reparacao_Form).

Exact executable branch/assignment ledger:
```wlanguage
Open(WIN_Ordens_Reparacao_Form,"MODIFICAR",TABLE_QRY_select_ordens_reparacao.COL_Numero)
atualizar()
```

### SRC-eb9499fa91 — WIN_Ordens_Reparacao/BTN_Eliminar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1174-1195`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_QRY_select_ordens_reparacao) = -1 THEN RETURN; SWITCH Dialog(<§?173B299C07B77A03§>); CASE 1; Query is string; Query="delete from ordem_reparacao where numero='"+TABLE_QRY_select_ordens_reparacao.COL_Numero+"'"; Qry_delete_ordens is data source; HExecuteSQLQuery(Qry_delete_ordens,hQueryDefault,Query); Query="DELETE FROM material_reparacao WHERE material_reparacao.numero ='"+TABLE_QRY_select_ordens_reparacao.COL_Numero+"'"; Qry_delete_materiais is data source; HExecuteSQLQuery(Qry_delete_materiais,hQueryDefault,Query); Query="DELETE FROM tempos_reparacao WHERE tempos_reparacao.numero ='"+TABLE_QRY_select_ordens_reparacao.COL_Numero+"'"; Qry_delete_tempos is data source; HExecuteSQLQuery(Qry_delete_tempos,hQueryDefault,Query); atualizar(); CASE 2. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-eb9499fa91.

HFSQL: HExecuteSQLQuery(Qry_delete_ordens); HExecuteSQLQuery(Qry_delete_materiais); HExecuteSQLQuery(Qry_delete_tempos).

Other calls: TableSelect(TABLE_QRY_select_ordens_reparacao); Dialog(<§?173B299C07B77A03§>).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_QRY_select_ordens_reparacao) = -1 THEN RETURN
SWITCH Dialog(<§?173B299C07B77A03§>)
CASE 1
Query is string
Query="delete from ordem_reparacao where numero='"+TABLE_QRY_select_ordens_reparacao.COL_Numero+"'"
Qry_delete_ordens is data source
HExecuteSQLQuery(Qry_delete_ordens,hQueryDefault,Query)
Query="DELETE FROM material_reparacao WHERE material_reparacao.numero ='"+TABLE_QRY_select_ordens_reparacao.COL_Numero+"'"
Qry_delete_materiais is data source
HExecuteSQLQuery(Qry_delete_materiais,hQueryDefault,Query)
Query="DELETE FROM tempos_reparacao WHERE tempos_reparacao.numero ='"+TABLE_QRY_select_ordens_reparacao.COL_Numero+"'"
Qry_delete_tempos is data source
HExecuteSQLQuery(Qry_delete_tempos,hQueryDefault,Query)
atualizar()
CASE 2
END
```

### SRC-f28ab396c9 — WIN_Ordens_Reparacao/BTN_Nenhum

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1219-1230`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: nRegisto_atual is int; nRegisto_atual=TABLE_Estados_reparacao; FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao); IF i>1 THEN; TableSelectMinus(TABLE_Estados_reparacao,i-1); TableSelectPlus(TABLE_Estados_reparacao,i); TABLE_Estados_reparacao.COL_checkbox=0; TableSelectPlus(TABLE_Estados_reparacao,nRegisto_atual). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-f28ab396c9.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
nRegisto_atual is int
nRegisto_atual=TABLE_Estados_reparacao
FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao)
IF i>1 THEN
TableSelectMinus(TABLE_Estados_reparacao,i-1)
END
TableSelectPlus(TABLE_Estados_reparacao,i)
TABLE_Estados_reparacao.COL_checkbox=0
END
TableSelectPlus(TABLE_Estados_reparacao,nRegisto_atual)
```

### SRC-9d8aee9401 — WIN_Ordens_Reparacao/BTN_Todos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1254-1265`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: nRegisto_atual is int; nRegisto_atual=TABLE_Estados_reparacao; FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao); IF i>1 THEN; TableSelectMinus(TABLE_Estados_reparacao,i-1); TableSelectPlus(TABLE_Estados_reparacao,i); TABLE_Estados_reparacao.COL_checkbox=1; TableSelectPlus(TABLE_Estados_reparacao,nRegisto_atual). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-9d8aee9401.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
nRegisto_atual is int
nRegisto_atual=TABLE_Estados_reparacao
FOR i = 1 _TO_ TableCount(TABLE_Estados_reparacao)
IF i>1 THEN
TableSelectMinus(TABLE_Estados_reparacao,i-1)
END
TableSelectPlus(TABLE_Estados_reparacao,i)
TABLE_Estados_reparacao.COL_checkbox=1
END
TableSelectPlus(TABLE_Estados_reparacao,nRegisto_atual)
```

### SRC-4c5e51adc4 — WIN_Ordens_Reparacao/BTN_VISION2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1289-1289`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: listselectplus(COMBO_mecanico,1). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-4c5e51adc4.

HFSQL: none in this block.

Other calls: ListSelectPlus(COMBO_mecanico).

Exact executable branch/assignment ledger:
```wlanguage
listselectplus(COMBO_mecanico,1)
```

### SRC-5c7ac16dd8 — WIN_Ordens_Reparacao/BTN_VISION3

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1313-1313`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_matricula="". Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-5c7ac16dd8.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
EDT_matricula=""
```

### SRC-09bc2d45fd — WIN_Ordens_Reparacao/BTN_informacao

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1337-1362`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: HOnError(ordem_reparacao,hErrLock,""); HReadSeek(ordem_reparacao,numero,TABLE_QRY_select_ordens_reparacao.COL_Numero); nRegistoatual is int=HRecNum(ordem_reparacao); IF HErrorLock()=false THEN; HLockRecNum(ordem_reparacao,nRegistoatual,hLockWrite); IF HErrorLock()=true THEN; Info("Ordem de reparação em uso por outro utilizador"); RETURN; switch WinStatus(WIN_Material_reparacao_form); CASE Active; if WIN_Material_reparacao_form.numero_ordem_reparacao=TABLE_QRY_select_ordens_reparacao.COL_Numero then; info("Documento em edição, por favor feche a janela"); return; Open(WIN_Table_Tempos_materiais_Descricoes,TABLE_QRY_select_ordens_reparacao.COL_Numero); CASE NotFound; Open(WIN_Table_Tempos_materiais_Descricoes,TABLE_QRY_select_ordens_reparacao.COL_Numero); Info("Ordem de reparação em uso por outro utilizador"); return; HUnlockRecNum(ordem_reparacao,nRegistoatual). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-09bc2d45fd.

HFSQL: HReadSeek(ordem_reparacao); HOnError(ordem_reparacao); HUnlockRecNum(ordem_reparacao).

Other calls: Info("Ordem de reparação em uso por outro utilizador"); Info("Documento em edição, por favor feche a janela"); Info("Ordem de reparação em uso por outro utilizador"); Open(WIN_Table_Tempos_materiais_Descricoes); Open(WIN_Table_Tempos_materiais_Descricoes); WinStatus(WIN_Material_reparacao_form).

Exact executable branch/assignment ledger:
```wlanguage
HOnError(ordem_reparacao,hErrLock,"")
HReadSeek(ordem_reparacao,numero,TABLE_QRY_select_ordens_reparacao.COL_Numero)
nRegistoatual is int=HRecNum(ordem_reparacao)
IF HErrorLock()=false THEN
HLockRecNum(ordem_reparacao,nRegistoatual,hLockWrite)
IF HErrorLock()=true THEN
Info("Ordem de reparação em uso por outro utilizador")
RETURN
ELSE
switch WinStatus(WIN_Material_reparacao_form)
CASE Active
if WIN_Material_reparacao_form.numero_ordem_reparacao=TABLE_QRY_select_ordens_reparacao.COL_Numero then
info("Documento em edição, por favor feche a janela")
return
else
Open(WIN_Table_Tempos_materiais_Descricoes,TABLE_QRY_select_ordens_reparacao.COL_Numero)
END
CASE NotFound
Open(WIN_Table_Tempos_materiais_Descricoes,TABLE_QRY_select_ordens_reparacao.COL_Numero)
END
END
ELSE
Info("Ordem de reparação em uso por outro utilizador")
return
END
HUnlockRecNum(ordem_reparacao,nRegistoatual)
```

### SRC-837adec308 — WIN_Ordens_Reparacao/BTN_Imprimir

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1386-1387`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: ipreview(); iPrintReport(RPT_Ordens_Reparacao). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-837adec308.

HFSQL: none in this block.

Other calls: iPreview(); iPrintReport(RPT_Ordens_Reparacao).

Exact executable branch/assignment ledger:
```wlanguage
ipreview()
iPrintReport(RPT_Ordens_Reparacao)
```

### SRC-6ce4e35c9d — WIN_Ordens_Reparacao/BTN_Todos1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1411-1414`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: sPosicao_atual is string=TABLE_Estados_reparacao.COL_Codigo; TableDisplay(TABLE_Estados_reparacao,tainit); TableSelectPlus(TABLE_Estados_reparacao,TableSeek(TABLE_Estados_reparacao.COL_Codigo,sPosicao_atual)); atualizar(). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-6ce4e35c9d.

HFSQL: none in this block.

Other calls: TableDisplay(TABLE_Estados_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
sPosicao_atual is string=TABLE_Estados_reparacao.COL_Codigo
TableDisplay(TABLE_Estados_reparacao,tainit)
TableSelectPlus(TABLE_Estados_reparacao,TableSeek(TABLE_Estados_reparacao.COL_Codigo,sPosicao_atual))
atualizar()
```

### SRC-974f184730 — WIN_Ordens_Reparacao/BTN_Gravar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1438-1447`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: sPosicao_atual is string=TABLE_Estados_reparacao.COL_Codigo; for each row of TABLE_Estados_reparacao; HReadSeek(estados_reparacao,codigo,TABLE_Estados_reparacao.COL_Codigo,hidentical); if hfound(estados_reparacao)=true then; estados_reparacao.lancar_defa=TABLE_Estados_reparacao.COL_checkbox; hmodify(estados_reparacao); TableSelectPlus(TABLE_Estados_reparacao,TableSeek(TABLE_Estados_reparacao.COL_Codigo,sPosicao_atual)); atualizar(). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-974f184730.

HFSQL: HReadSeek(estados_reparacao); HFound(estados_reparacao); HModify(estados_reparacao).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
sPosicao_atual is string=TABLE_Estados_reparacao.COL_Codigo
for each row of TABLE_Estados_reparacao
HReadSeek(estados_reparacao,codigo,TABLE_Estados_reparacao.COL_Codigo,hidentical)
if hfound(estados_reparacao)=true then
estados_reparacao.lancar_defa=TABLE_Estados_reparacao.COL_checkbox
hmodify(estados_reparacao)
END
END
TableSelectPlus(TABLE_Estados_reparacao,TableSeek(TABLE_Estados_reparacao.COL_Codigo,sPosicao_atual))
atualizar()
```

### SRC-3baa432795 — WIN_Ordens_Reparacao/BTN_VISION4

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1471-1471`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: edt_cliente=open(WIN_Table_Clientes,true,edt_cliente). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-3baa432795.

HFSQL: none in this block.

Other calls: Open(WIN_Table_Clientes).

Exact executable branch/assignment ledger:
```wlanguage
edt_cliente=open(WIN_Table_Clientes,true,edt_cliente)
```

### SRC-ab282c1e8e — WIN_Ordens_Reparacao/BTN_VISION5

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1546-1546`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_cliente="". Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-ab282c1e8e.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
EDT_cliente=""
```

### SRC-9b6239c2c7 — WIN_Ordens_Reparacao [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1568-1597`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); HReadFirst(sistema); IF Timer("atualizar", sistema.Tempo_ordem_reparacao*100, 2) = 0 THEN; Error("Erro ao criar temporizador de atualização"); gdsQry_Select_ordens_reparacao_tabela is data source; data is datetime=SysDateTime(); data..hour=23; data..minute=59; data..Second=59; EDT_data_entrada_fim=data; data=SysDateTime(); data..Day -= sistema.Data_inicio; data..Hour=00; data..Minute=00; data..Second=00; EDT_data_entrada_inicio=data; EDT_data_entrega_inicio=data; data=DateSys(); data..day+=7; data..Hour=00; data..Minute=00; data..Second=00; edt_data_entrega_fim=data; RADIO_prioridade=0. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-9b6239c2c7.

HFSQL: HReadFirst(sistema).

Other calls: Error("Erro ao criar temporizador de atualização"); Timer("atualizar").

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
HReadFirst(sistema)
IF Timer("atualizar", sistema.Tempo_ordem_reparacao*100, 2) = 0 THEN
Error("Erro ao criar temporizador de atualização")
END
gdsQry_Select_ordens_reparacao_tabela is data source
data is datetime=SysDateTime()
data..hour=23
data..minute=59
data..Second=59
EDT_data_entrada_fim=data
data=SysDateTime()
data..Day -= sistema.Data_inicio
data..Hour=00
data..Minute=00
data..Second=00
EDT_data_entrada_inicio=data
EDT_data_entrega_inicio=data
data=DateSys()
data..day+=7
data..Hour=00
data..Minute=00
data..Second=00
edt_data_entrega_fim=data
RADIO_prioridade=0
```

### SRC-13810913de — WIN_Ordens_Reparacao

Event `34`: End of initialization; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1600-1603`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): End of initialization [34]: TABLE_QRY_select_ordens_reparacao.COL_matricula..FontSize=12; TABLE_QRY_select_ordens_reparacao.COL_matricula..FontBold=True; TABLE_QRY_select_ordens_reparacao..LineHeight=30; atualizar(true). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-13810913de.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
TABLE_QRY_select_ordens_reparacao.COL_matricula..FontSize=12
TABLE_QRY_select_ordens_reparacao.COL_matricula..FontBold=True
TABLE_QRY_select_ordens_reparacao..LineHeight=30
atualizar(true)
```

### SRC-bf1d967f4f — WIN_Ordens_Reparacao

Event `2`: Close; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1628-1628`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Close [2]: HCancelDeclaration(gdsQry_Select_ordens_reparacao_tabela). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-bf1d967f4f.

HFSQL: HCancelDeclaration(gdsQry_Select_ordens_reparacao_tabela).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
HCancelDeclaration(gdsQry_Select_ordens_reparacao_tabela)
```

### SRC-a2f17b1885 — WIN_Ordens_Reparacao [atualizar]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1636-1751`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE atualizar(bEntrada is boolean=False); WIN_Ordens_Reparacao.TABLE_QRY_select_ordens_reparacao..DisplayEnabled=False; nPosicao_atual_tabela is int=TABLE_QRY_select_ordens_reparacao.COL_Numero; sQuery is string=[; SELECT; ordem_reparacao.numero AS numero,; ordem_reparacao.matricula AS matricula,; ordem_reparacao.km_viatura AS km_viatura,; ordem_reparacao.recepcao_util AS recepcao_util,; ordem_reparacao.recepcao_datahora AS recepcao_datahora,; ordem_reparacao.recepacao_contatos AS recepacao_contatos,; ordem_reparacao.recepcao_servico AS recepcao_servico,; ordem_reparacao.recepcao_obs AS recepcao_obs,; ordem_reparacao.recepcao_entrega_prevista AS recepcao_entrega_prevista,; ordem_reparacao.recepcao_prioridade AS recepcao_prioridade,; ordem_reparacao.reparacao_mecanico AS reparacao_mecanico,; ordem_reparacao.reparacao_estado AS reparacao_estado,; ordem_reparacao.reparacao_estado_obs AS reparacao_estado_obs,; ordem_reparacao.reparacao_servico AS reparacao_servico,; ordem_reparacao.reparacao_estado_data AS reparacao_estado_data,; ordem_reparacao.reparacao_estado_historico AS reparacao_estado_historico,; ordem_reparacao.totaL_mao_obra AS totaL_mao_obra,; ordem_reparacao.total_peca. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao.md under SRC-a2f17b1885.

HFSQL: HExecuteSQLQuery(gdsQry_Select_ordens_reparacao_tabela).

Other calls: TableDisplay(TABLE_QRY_select_ordens_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE atualizar(bEntrada is boolean=False)
WIN_Ordens_Reparacao.TABLE_QRY_select_ordens_reparacao..DisplayEnabled=False
nPosicao_atual_tabela is int=TABLE_QRY_select_ordens_reparacao.COL_Numero
sQuery is string=[
SELECT
ordem_reparacao.numero AS numero,
ordem_reparacao.matricula AS matricula,
ordem_reparacao.km_viatura AS km_viatura,
ordem_reparacao.recepcao_util AS recepcao_util,
ordem_reparacao.recepcao_datahora AS recepcao_datahora,
ordem_reparacao.recepacao_contatos AS recepacao_contatos,
ordem_reparacao.recepcao_servico AS recepcao_servico,
ordem_reparacao.recepcao_obs AS recepcao_obs,
ordem_reparacao.recepcao_entrega_prevista AS recepcao_entrega_prevista,
ordem_reparacao.recepcao_prioridade AS recepcao_prioridade,
ordem_reparacao.reparacao_mecanico AS reparacao_mecanico,
ordem_reparacao.reparacao_estado AS reparacao_estado,
ordem_reparacao.reparacao_estado_obs AS reparacao_estado_obs,
ordem_reparacao.reparacao_servico AS reparacao_servico,
ordem_reparacao.reparacao_estado_data AS reparacao_estado_data,
ordem_reparacao.reparacao_estado_historico AS reparacao_estado_historico,
ordem_reparacao.totaL_mao_obra AS totaL_mao_obra,
ordem_reparacao.total_pecas AS total_pecas,
ordem_reparacao.total_desconto AS total_desconto,
ordem_reparacao.total_reparacao AS total_reparacao,
ordem_reparacao.faturado AS faturado,
ordem_reparacao.total_pago AS total_pago,
ordem_reparacao.Estados_reparacaoID AS Estados_reparacaoID,
ordem_reparacao.numero_fatura AS numero_fatura,
Viaturas.matricula AS matricula_Vi,
Viaturas.Cliente AS Cliente,
Viaturas.marca AS marca,
Viaturas.modelo AS modelo,
Viaturas.Ano AS Ano,
Viaturas.mes AS mes,
( ( Viaturas.marca +  ' ') + Viaturas.modelo )  AS marcamodelo,
estados_reparacao.Codigo AS Codigo,
estados_reparacao.Descricao AS Descricao,
estados_reparacao.tipo AS tipo,
estados_reparacao.Cor AS Cor,
mecanicos.Codigo AS Codigo_me,
mecanicos.Descricao AS Descricao_me,
Clientes.Codigo AS Codigo_Cliente,
Clientes.Descricao AS Descricao_Cliente,
ordem_reparacao.recepcao_cliente AS recepcao_cliente,
ordem_reparacao.recepcao_terceiro AS recepcao_terceiro,
Terceiro.Codigo AS Codigo_Terceiro,
Terceiro.Descricao AS Descricao_Terceiro
FROM
ordem_reparacao
JOIN Clientes ON ordem_reparacao.recepcao_cliente=Clientes.Codigo
JOIN Viaturas ON ordem_reparacao.matricula=Viaturas.matricula
JOIN estados_reparacao ON ordem_reparacao.reparacao_estado=estados_reparacao.Codigo
LEFT JOIN mecanicos ON ordem_reparacao.reparacao_mecanico=mecanicos.Codigo
LEFT JOIN Clientes Terceiro ON ordem_reparacao.recepcao_terceiro=Terceiro.Codigo
WHERE
]
EDT_matricula=Upper(EDT_matricula)
sFiltro is string
sFiltro=" recepcao_datahora >= '"+EDT_data_entrada_inicio+"' and recepcao_datahora <='"+EDT_data_entrada_fim+"' and recepcao_entrega_prevista >='"+EDT_data_entrega_inicio+"' and recepcao_entrega_prevista<='"+EDT_data_entrega_fim+"'"
IF RADIO_prioridade>0 THEN
sFiltro+=" and recepcao_prioridade='"+RADIO_prioridade+"'"
END
IF COMBO_mecanico>=1 THEN
sFiltro+=" and reparacao_mecanico='"+COMBO_mecanico+"'"
END
IF EDT_cliente<>0 and EDT_cliente<>"" THEN
sFiltro+=" and (recepcao_cliente="+EDT_cliente+" or recepcao_terceiro="+EDT_cliente+")"
END
if EDT_matricula<>"" THEN
sFiltro+=" and (matricula LIKE '%"+EDT_matricula+"%' or marcamodelo LIKE '%"+EDT_matricula+"%')"
END
j is int=0
FOR i=1 _TO_ TableCount(TABLE_Estados_reparacao)
IF TABLE_Estados_reparacao[i].COL_checkbox=1 THEN
j++
IF j=1 THEN
sFiltro+=" and (reparacao_estado='"+TABLE_Estados_reparacao[i].COL_Codigo+"'"
ELSE
sFiltro+=" or reparacao_estado='"+TABLE_Estados_reparacao[i].COL_Codigo+"'"
END
END
END
if j>0 then
sFiltro+=") "
END
sQuery+=" "+sFiltro+" ORDER BY numero DESC"
HExecutesqlQuery(gdsQry_Select_ordens_reparacao_tabela,hquerydefault,sQuery)
TABLE_QRY_select_ordens_reparacao..BrowsedFile=gdsQry_Select_ordens_reparacao_tabela..name
TABLE_QRY_select_ordens_reparacao.COL_Numero..filelink="numero"
TABLE_QRY_select_ordens_reparacao.COL_Cliente..filelink="descricao_cliente"
TABLE_QRY_select_ordens_reparacao.COL_Terceiro..filelink="descricao_Terceiro"
TABLE_QRY_select_ordens_reparacao.COL_marca_modelo..filelink="marcamodelo"
TABLE_QRY_select_ordens_reparacao.COL_Matricula..filelink="matricula"
TABLE_QRY_select_ordens_reparacao.COL_Recepcao_datahora..filelink="recepcao_datahora"
TABLE_QRY_select_ordens_reparacao.COL_Recepcao_entrega_prevista..filelink="recepcao_entrega_prevista"
TABLE_QRY_select_ordens_reparacao.COL_Reparacao_estado..filelink="descricao"
TABLE_QRY_select_ordens_reparacao.COL_Recepcao_prioridade..filelink="recepcao_prioridade"
TABLE_QRY_select_ordens_reparacao.COL_Reparacao_mecanico..filelink="descricao_me"
TABLE_QRY_select_ordens_reparacao.col_cor..filelink="cor"
TableDisplay(TABLE_QRY_select_ordens_reparacao)
if bEntrada=True or nPosicao_atual_tabela=0 then
TableSelectPlus(TABLE_QRY_select_ordens_reparacao,1)
else
TableSelectPlus(TABLE_QRY_select_ordens_reparacao,TableCount(TABLE_QRY_select_ordens_reparacao))
TableSelectPlus(TABLE_QRY_select_ordens_reparacao,TableSeek(TABLE_QRY_select_ordens_reparacao.COL_Numero,nPosicao_atual_tabela))
END
WIN_Ordens_Reparacao.TABLE_QRY_select_ordens_reparacao..DisplayEnabled=True
EDT_matricula..Cursor=9999
EDT_matricula..CursorEnd=9999
```

### SRC-1fd54f9cbe — WIN_Ordens_Reparacao/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-0b389badba — WIN_Ordens_Reparacao/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-a1dedd7274 — WIN_Ordens_Reparacao/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-e86351f85f — WIN_Ordens_Reparacao/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HReadFirst: `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1569`.
- HCancelDeclaration: `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:789`; `gdsQry_Select_ordens_reparacao_tabela` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1628`.
- HExecuteSQLQuery: `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:785`; `Qry_delete_ordens` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1181`; `Qry_delete_materiais` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1185`; `Qry_delete_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1189`; `gdsQry_Select_ordens_reparacao_tabela` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1726`.
- HReadSeek: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1338`; `estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1440`.
- HFound: `estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1441`.
- HOnError: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1337`.
- HModify: `estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1443`.
- HUnlockRecNum: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1362`.

## Behavior checklist

- Open and native keyboard: U-W53605A-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-W53605A-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-W53605A-03.
- Explicit message/resource shell outcomes: U-W53605A-04.
- Actual field/mask/type boundaries: U-W53605A-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W53605A-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Parsed browsed_file/browsed_item values shown in the screen Binding cells are established dossier facts and excluded from this item. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W53605A-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_Estados_reparacao, TABLE_QRY_select_ordens_reparacao; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W53605A-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HErrorLock, HExecuteSQLQuery, HExecutesqlQuery, HLockRecNum, HOnError, HReadFirst, HReadSeek, HRecNum, HUnlockRecNum, hfound, hmodify; failed or partial writes in the actual save/update blocks; timer overlap and refresh/reentrant effects; lock acquisition/error paths and explicit unlock omissions. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W53605A-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W53605A-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

23/23 blocks; 4/4 encoded-only slots retained; 94 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:289`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:291`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:292`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:294`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:705`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:707`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:708`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:710`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:4`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:11`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Ordens_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Ordens_Reparacao_Form.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Ordens_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Ordens_Reparacao_Form.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Ordens_Reparacao.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Ordens_Reparacao_Form.wdw:9`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Ordens_Reparacao.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Ordens_Reparacao_Form.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:215`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:218`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:227`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:230`
