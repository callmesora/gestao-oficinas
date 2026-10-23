# Mapping — WIN_Ordens_Reparacao_Form

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw`; designer `dossier: WIN_Ordens_Reparacao_Form`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Create/edit reception,state,invoice/payment.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1124 (Open in WIN_Ordens_Reparacao)`
```wlanguage
-
code : |1-
open(WIN_Ordens_Reparacao_Form,"NOVO",0)
atualizar()
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1149 (Open in WIN_Ordens_Reparacao)`
```wlanguage
-
code : |1-
Open(WIN_Ordens_Reparacao_Form,"MODIFICAR",TABLE_QRY_select_ordens_reparacao.COL_Numero)
atualizar()
type : 18
-
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

MODIFICAR loads existing and disables plate typing; NOVO max(numero)+1/current dates without number lock. Plate loads vehicle/client; contact phone+CR+mobile if both nonblank else available. Missing vehicle offers create then reread. Movement guard SQL cross-joins material and labor with unqualified numero. State caches old stored key at dropdown; checks open labor fim empty string (other screens all-zero); required confirmation opens WIN_Mudar_Estado,denial restores old. Save checks entry/delivery dates,nonzero km,state,receptionist; new non-today date prompts; same-vehicle non-type7 order blocks create. State type>1 needs mechanic; flags prompt delivery/payment dates. New inactive mechanic blocks; edit offers continue. Insert/update parameter mapping exact ledger. Invoice checkbox controls invoice-number visibility. No checked write result/transaction; cancel closure encoded.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw` exact event locations below; `dossier: WIN_Ordens_Reparacao_Form/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-f349dfb841 — WIN_Ordens_Reparacao_Form/EDT_matricula

Event `16`: Exit; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:273-336`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Exit [16]: if EDT_matricula<>"" then; HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula); IF HReadFirst(QRY_select_viatura_matricula)=True THEN; gnCliente=QRY_select_viatura_matricula.Cliente; EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo; HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente); IF HReadFirst(QRY_select_cliente_codigo)=True THEN; EDT_Cliente=QRY_select_cliente_codigo.Descricao; IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN; EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel; IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN; EDT_Contactos=QRY_select_cliente_codigo.Telefone1; IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN; EDT_Contactos=QRY_select_cliente_codigo.Telemovel; EDT_Contactos=""; EDT_matricula=Upper(EDT_matricula); SWITCH Dialog(<§?1665728B004B2BDF§>); CASE 1; EDT_matricula=UPPER(EDT_matricuLA); open(WIN_Form_Viaturas,"NOVO",EDT_matricula); HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula); IF HReadFirst(QRY_select_viatura_mat. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-f349dfb841.

HFSQL: HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_cliente_codigo); HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_cliente_codigo); HReadFirst(QRY_select_viatura_matricula); HReadFirst(QRY_select_cliente_codigo); HReadFirst(QRY_select_viatura_matricula); HReadFirst(QRY_select_cliente_codigo); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_cliente_codigo).

Other calls: Info("Criação de matrícula cancelada"); Open(WIN_Form_Viaturas); Dialog(<§?1665728B004B2BDF§>).

Exact executable branch/assignment ledger:
```wlanguage
if EDT_matricula<>"" then
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
IF HReadFirst(QRY_select_viatura_matricula)=True THEN
gnCliente=QRY_select_viatura_matricula.Cliente
EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
IF HReadFirst(QRY_select_cliente_codigo)=True THEN
EDT_Cliente=QRY_select_cliente_codigo.Descricao
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telemovel
ELSE
EDT_Contactos=""
END
END
END
END
EDT_matricula=Upper(EDT_matricula)
ELSE
SWITCH Dialog(<§?1665728B004B2BDF§>)
CASE 1
EDT_matricula=UPPER(EDT_matricuLA)
open(WIN_Form_Viaturas,"NOVO",EDT_matricula)
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
IF HReadFirst(QRY_select_viatura_matricula)=True THEN
gnCliente=QRY_select_viatura_matricula.Cliente
EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
IF HReadFirst(QRY_select_cliente_codigo)=True THEN
EDT_Cliente=QRY_select_cliente_codigo.Descricao
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telemovel
ELSE
EDT_Contactos=""
END
END
END
END
EDT_matricula=Upper(EDT_matricula)
ELSE
Info("Criação de matrícula cancelada")
RETURN
END
CASE 2
END
END
end
HCancelDeclaration(QRY_select_viatura_matricula)
HCancelDeclaration(QRY_select_cliente_codigo)
```

### SRC-b0064a0577 — WIN_Ordens_Reparacao_Form/BTN_VISION1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:370-454`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF gEstadoforn="MODIFICAR" THEN; sQuery is string="select * from material_reparacao,tempos_reparacao where numero='"+EDT_Ordem_n+"'"; dsQry_select_material_tempos is data source; HExecuteSQLQuery(dsQry_select_material_tempos,hQueryDefault,sQuery); if hreadfirst(dsQry_select_material_tempos)=true then; switch yesno(0,"Ordem de reparação já tem movimentos de material e/ou tempos.","Tem a certeza que pretende alterar a matrícula?"); case 1; HCancelDeclaration(dsQry_select_material_tempos); case 0; HCancelDeclaration(dsQry_select_material_tempos); return; EDT_matricula=open(WIN_Table_Viaturas,true,EDT_matricula); IF EDT_matricula<>"" THEN; HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula); IF HReadFirst(QRY_select_viatura_matricula)=True THEN; gnCliente=QRY_select_viatura_matricula.Cliente; edt_marca_modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo; HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente); IF HReadFirst(QRY_select_cliente_codigo)=True THEN; EDT_Cliente=QRY_select_cliente_codigo.Descricao; IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Tel. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-b0064a0577.

HFSQL: HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_cliente_codigo); HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_cliente_codigo); HReadFirst(dsQry_select_material_tempos); HReadFirst(QRY_select_viatura_matricula); HReadFirst(QRY_select_cliente_codigo); HReadFirst(QRY_select_viatura_matricula); HReadFirst(QRY_select_cliente_codigo); HCancelDeclaration(dsQry_select_material_tempos); HCancelDeclaration(dsQry_select_material_tempos); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_cliente_codigo); HExecuteSQLQuery(dsQry_select_material_tempos).

Other calls: Info("Criação de matrícula cancelada"); Open(WIN_Table_Viaturas); Open(WIN_Form_Viaturas); Dialog(<§?1665728B004B2BDF§>); YesNo(0).

Exact executable branch/assignment ledger:
```wlanguage
IF gEstadoforn="MODIFICAR" THEN
sQuery is string="select * from material_reparacao,tempos_reparacao where numero='"+EDT_Ordem_n+"'"
dsQry_select_material_tempos is data source
HExecuteSQLQuery(dsQry_select_material_tempos,hQueryDefault,sQuery)
if hreadfirst(dsQry_select_material_tempos)=true then
switch yesno(0,"Ordem de reparação já tem movimentos de material e/ou tempos.","Tem a certeza que pretende alterar a matrícula?")
case 1
HCancelDeclaration(dsQry_select_material_tempos)
case 0
HCancelDeclaration(dsQry_select_material_tempos)
return
END
END
END
EDT_matricula=open(WIN_Table_Viaturas,true,EDT_matricula)
IF EDT_matricula<>"" THEN
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
IF HReadFirst(QRY_select_viatura_matricula)=True THEN
gnCliente=QRY_select_viatura_matricula.Cliente
edt_marca_modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
IF HReadFirst(QRY_select_cliente_codigo)=True THEN
EDT_Cliente=QRY_select_cliente_codigo.Descricao
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telemovel
ELSE
EDT_Contactos=""
END
END
END
else
EDT_Cliente=""
EDT_Contactos=""
END
EDT_matricula=Upper(EDT_matricula)
ELSE
SWITCH Dialog(<§?1665728B004B2BDF§>)
CASE 1
EDT_matricula=Upper(EDT_matricula)
Open(WIN_Form_Viaturas,"NOVO",EDT_matricula)
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
IF HReadFirst(QRY_select_viatura_matricula)=True THEN
gnCliente=QRY_select_viatura_matricula.Cliente
EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
IF HReadFirst(QRY_select_cliente_codigo)=True THEN
EDT_Cliente=QRY_select_cliente_codigo.Descricao
if NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" and NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" then
EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel
else
if NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" then
EDT_Contactos=QRY_select_cliente_codigo.Telefone1
else
if NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" then
EDT_Contactos=QRY_select_cliente_codigo.Telemovel
else
EDT_Contactos=""
END
END
end
ELSE
EDT_Cliente=""
EDT_Contactos=""
END
EDT_matricula=Upper(EDT_matricula)
ELSE
Info("Criação de matrícula cancelada")
RETURN
END
CASE 2
END
END
END
HCancelDeclaration(QRY_select_viatura_matricula)
HCancelDeclaration(QRY_select_cliente_codigo)
```

### SRC-26eea8e8cb — WIN_Ordens_Reparacao_Form/BTN_VISION

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:522-544`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: gsQuery="select * from tempos_Reparacao where numero='"+EDT_Ordem_n+"' and fim=''"; dsQry_select_Tempo is data source; HExecuteSQLQuery(dsQry_select_Tempo,hQueryDefault,gsQuery); IF HReadFirst(dsQry_select_Tempo)=True THEN; Info("Ordem de reparação tem mecânico a trabalhar na viatura"); gsQuery="select * from estados_reparacao where codigo='"+COMBO_estado..StoredValue+"'"; dsQry_select_estados_reparacao is data source; HExecuteSQLQuery(dsQry_select_estados_reparacao,hQueryDefault,gsQuery); IF HReadFirst(dsQry_select_estados_reparacao)=True THEN; IF dsQry_select_estados_reparacao.confirmacao=True THEN; SWITCH YesNo(0,"Mudar estado de reparação para '"+dsQry_select_estados_reparacao.descricao+"'?"); CASE 0; COMBO_estado=gestado_Atual; CASE 1; OTHER CASE; COMBO_estado=gestado_Atual; HCancelDeclaration(dsQry_select_Tempo). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-26eea8e8cb.

HFSQL: HReadFirst(dsQry_select_Tempo); HReadFirst(dsQry_select_estados_reparacao); HCancelDeclaration(dsQry_select_Tempo); HExecuteSQLQuery(dsQry_select_Tempo); HExecuteSQLQuery(dsQry_select_estados_reparacao).

Other calls: Info("Ordem de reparação tem mecânico a trabalhar na viatura"); YesNo(0).

Exact executable branch/assignment ledger:
```wlanguage
gsQuery="select * from tempos_Reparacao where numero='"+EDT_Ordem_n+"' and fim=''"
dsQry_select_Tempo is data source
HExecuteSQLQuery(dsQry_select_Tempo,hQueryDefault,gsQuery)
IF HReadFirst(dsQry_select_Tempo)=True THEN
Info("Ordem de reparação tem mecânico a trabalhar na viatura")
ELSE
gsQuery="select * from estados_reparacao where codigo='"+COMBO_estado..StoredValue+"'"
dsQry_select_estados_reparacao is data source
HExecuteSQLQuery(dsQry_select_estados_reparacao,hQueryDefault,gsQuery)
IF HReadFirst(dsQry_select_estados_reparacao)=True THEN
IF dsQry_select_estados_reparacao.confirmacao=True THEN
SWITCH YesNo(0,"Mudar estado de reparação para '"+dsQry_select_estados_reparacao.descricao+"'?")
CASE 0
COMBO_estado=gestado_Atual
CASE 1
OTHER CASE
COMBO_estado=gestado_Atual
END
END
END
END
HCancelDeclaration(dsQry_select_Tempo)
```

### SRC-902e218846 — WIN_Ordens_Reparacao_Form/COMBO_estado

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:567-573`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: Query is string="select * from estados_reparacao order by tipo asc"; Qry_select_estados_reparacao is data source; HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query); FOR EACH Qry_select_estados_reparacao; listadd(COMBO_estado,Qry_select_estados_reparacao.descricao+glink(Qry_select_estados_reparacao.codigo)); HCancelDeclaration(Qry_select_estados_reparacao). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-902e218846.

HFSQL: HCancelDeclaration(Qry_select_estados_reparacao); HExecuteSQLQuery(Qry_select_estados_reparacao).

Other calls: ListAdd(COMBO_estado).

Exact executable branch/assignment ledger:
```wlanguage
Query is string="select * from estados_reparacao order by tipo asc"
Qry_select_estados_reparacao is data source
HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query)
FOR EACH Qry_select_estados_reparacao
listadd(COMBO_estado,Qry_select_estados_reparacao.descricao+glink(Qry_select_estados_reparacao.codigo))
end
HCancelDeclaration(Qry_select_estados_reparacao)
```

### SRC-d0b8d7715c — WIN_Ordens_Reparacao_Form/COMBO_estado

Event `33`: Select a row; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:588-614`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Select a row [33]: gsquery="select * from tempos_Reparacao where numero='"+EDT_Ordem_n+"' and fim=''"; dsQry_select_Tempo is data source; HExecuteSQLQuery(dsQry_select_Tempo,hQueryDefault,gsQuery); if hreadfirst(dsQry_select_Tempo)=true then; COMBO_estado=gestado_Atual; info("Ordem de reparação tem mecânico a trabalhar na viatura"); gsQuery="select * from estados_reparacao where codigo='"+COMBO_estado..StoredValue+"'"; dsQry_select_estados_reparacao is data source; HExecuteSQLQuery(dsQry_select_estados_reparacao,hQueryDefault,gsQuery); IF HReadFirst(dsQry_select_estados_reparacao)=True THEN; IF dsQry_select_estados_reparacao.confirmacao=True THEN; nResultado is int=open(win_mudar_estado,dsQry_select_estados_reparacao.descricao); SWITCH nResultado; CASE 0; COMBO_estado=gestado_Atual; CASE 1; OTHER CASE; COMBO_estado=gestado_Atual; HCancelDeclaration(dsQry_select_estados_reparacao); HCancelDeclaration(dsQry_select_Tempo). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-d0b8d7715c.

HFSQL: HReadFirst(dsQry_select_Tempo); HReadFirst(dsQry_select_estados_reparacao); HCancelDeclaration(dsQry_select_estados_reparacao); HCancelDeclaration(dsQry_select_Tempo); HExecuteSQLQuery(dsQry_select_Tempo); HExecuteSQLQuery(dsQry_select_estados_reparacao).

Other calls: Info("Ordem de reparação tem mecânico a trabalhar na viatura"); Open(win_mudar_estado).

Exact executable branch/assignment ledger:
```wlanguage
gsquery="select * from tempos_Reparacao where numero='"+EDT_Ordem_n+"' and fim=''"
dsQry_select_Tempo is data source
HExecuteSQLQuery(dsQry_select_Tempo,hQueryDefault,gsQuery)
if hreadfirst(dsQry_select_Tempo)=true then
COMBO_estado=gestado_Atual
info("Ordem de reparação tem mecânico a trabalhar na viatura")
else
gsQuery="select * from estados_reparacao where codigo='"+COMBO_estado..StoredValue+"'"
dsQry_select_estados_reparacao is data source
HExecuteSQLQuery(dsQry_select_estados_reparacao,hQueryDefault,gsQuery)
IF HReadFirst(dsQry_select_estados_reparacao)=True THEN
IF dsQry_select_estados_reparacao.confirmacao=True THEN
nResultado is int=open(win_mudar_estado,dsQry_select_estados_reparacao.descricao)
SWITCH nResultado
CASE 0
COMBO_estado=gestado_Atual
CASE 1
OTHER CASE
COMBO_estado=gestado_Atual
END
END
END
HCancelDeclaration(dsQry_select_estados_reparacao)
END
HCancelDeclaration(dsQry_select_Tempo)
```

### SRC-255857e0db — WIN_Ordens_Reparacao_Form/COMBO_estado

Event `116`: Open the drop-down list; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:621-621`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Open the drop-down list [116]: gestado_Atual=COMBO_estado..StoredValue. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-255857e0db.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
gestado_Atual=COMBO_estado..StoredValue
```

### SRC-3b91d48432 — WIN_Ordens_Reparacao_Form/BTN_VISION2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:766-766`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-3b91d48432.

HFSQL: none in this block.

Other calls: Open(WIN_Table_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico)
```

### SRC-bd007c5650 — WIN_Ordens_Reparacao_Form/COMBO_Prioridade

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:789-791`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: ListAdd(COMBO_Prioridade, "Normal" + gLink("1")); ListAdd(COMBO_Prioridade, "Elevada" + gLink("2")); ListAdd(COMBO_Prioridade, "Urgente" + gLink("3")). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-bd007c5650.

HFSQL: none in this block.

Other calls: ListAdd(COMBO_Prioridade); ListAdd(COMBO_Prioridade); ListAdd(COMBO_Prioridade).

Exact executable branch/assignment ledger:
```wlanguage
ListAdd(COMBO_Prioridade, "Normal" + gLink("1"))
ListAdd(COMBO_Prioridade, "Elevada" + gLink("2"))
ListAdd(COMBO_Prioridade, "Urgente" + gLink("3"))
```

### SRC-e3d1e3ce67 — WIN_Ordens_Reparacao_Form/BTN_VISION3

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:849-849`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: COMBO_Recepcionado=open(WIN_Table_utilizadores,true,COMBO_Recepcionado). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-e3d1e3ce67.

HFSQL: none in this block.

Other calls: Open(WIN_Table_utilizadores).

Exact executable branch/assignment ledger:
```wlanguage
COMBO_Recepcionado=open(WIN_Table_utilizadores,true,COMBO_Recepcionado)
```

### SRC-3318d47225 — WIN_Ordens_Reparacao_Form/CBOX_faturado

Event `17`: Whenever modifying; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:873-877`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Whenever modifying [17]: if CBOX_faturado=1 then; EDT_Nr_Fatura..visible=true; EDT_Nr_Fatura..Visible=false. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-3318d47225.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
if CBOX_faturado=1 then
EDT_Nr_Fatura..visible=true
else
EDT_Nr_Fatura..Visible=false
END
```

### SRC-55e462b0d2 — WIN_Ordens_Reparacao_Form/BTN_Gravar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:943-1125`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF EDT_data_hora_entrada=000000000000 or EDT_data_hora_entrada="" THEN; Info("Indique a data de entrada"); RETURN; IF EDT_data_entrega=00000000 or EDT_data_entrega="" THEN; Info("Indique a data de entrega"); RETURN; IF EDT_km=0 THEN; Info("Indique os km da viatura"); RETURN; if COMBO_estado="" then; Info("Indique o estado"); RETURN; IF COMBO_Recepcionado="" THEN; Info("Indique o recepcionista"); RETURN; IF COMBO_estado=-1 THEN; Info("Indique o estado de reparação"); RETURN; IF gEstadoforn="NOVO" THEN; if datetostring(EDT_data_hora_entrada,"YYYYMMDD")<>DateSys() THEN; if YesNo(0,"Data de entrada diferente da data do computador.","Deseja continuar?")=no then; return; HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula); IF HReadFirst(QRY_select_viatura_matricula)=True THEN; HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente); IF HReadFirst(QRY_select_cliente_codigo)=True THEN; EDT_Cliente=QRY_select_cliente_codigo.Descricao; HCancelDeclaration(QRY_select_cliente_codigo); EDT_matricula=Upper(EDT_matricula); SWITCH Dialog(<§?1665728B004B2BDF§>); CASE 1; EDT_matricula=Upper(EDT_matricula); Open(WIN_Form_Viaturas,"NOVO",EDT_matri. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-55e462b0d2.

HFSQL: HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_cliente_codigo); HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_cliente_codigo); HExecuteQuery(QRY_update_ordens_reparacao); HExecuteQuery(QRY_insert_ordens_reparacao); HReadFirst(QRY_select_viatura_matricula); HReadFirst(QRY_select_cliente_codigo); HReadFirst(QRY_select_viatura_matricula); HReadFirst(QRY_select_cliente_codigo); HReadFirst(dsQry_select_ordem_estado); HReadFirst(Qry_select_estados_reparacao); HReadFirst(dsQry_Select_Mecanico); HReadFirst(dsQry_Select_Mecanico); HCancelDeclaration(QRY_select_cliente_codigo); HCancelDeclaration(QRY_select_cliente_codigo); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_cliente_codigo); HCancelDeclaration(dsQry_select_ordem_estado); HCancelDeclaration(dsQry_select_ordem_estado); HCancelDeclaration(Qry_select_estados_reparacao); HCancelDeclaration(dsQry_Select_Mecanico); HCancelDeclaration(dsQry_Select_Mecanico); HExecuteSQLQuery(dsQry_select_ordem_estado); HExecuteSQLQuery(Qry_select_estados_reparacao); HExecuteSQLQuery(dsQry_Select_Mecanico); HExecuteSQLQuery(dsQry_Select_Mecanico).

Other calls: Info("Indique a data de entrada"); Info("Indique a data de entrega"); Info("Indique os km da viatura"); Info("Indique o estado"); Info("Indique o recepcionista"); Info("Indique o estado de reparação"); Info("Criação de matrícula cancelada"); Info("Viatura já em reparação"); Info("Este estado de reparação requer um mecânico"); Info("Mecânico inativo"); Open(WIN_Form_Viaturas); Open(win_data); Open(win_data); Dialog(<§?1665728B004B2BDF§>); YesNo(0); YesNo("Mecânico está inativo quer continuar?").

Exact executable branch/assignment ledger:
```wlanguage
IF EDT_data_hora_entrada=000000000000 or EDT_data_hora_entrada="" THEN
Info("Indique a data de entrada")
RETURN
END
IF EDT_data_entrega=00000000 or EDT_data_entrega="" THEN
Info("Indique a data de entrega")
RETURN
END
IF EDT_km=0 THEN
Info("Indique os km da viatura")
RETURN
END
if COMBO_estado="" then
Info("Indique o estado")
RETURN
END
IF COMBO_Recepcionado="" THEN
Info("Indique o recepcionista")
RETURN
END
IF COMBO_estado=-1 THEN
Info("Indique o estado de reparação")
RETURN
END
IF gEstadoforn="NOVO" THEN
if datetostring(EDT_data_hora_entrada,"YYYYMMDD")<>DateSys() THEN
if YesNo(0,"Data de entrada diferente da data do computador.","Deseja continuar?")=no then
return
END
END
end
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
IF HReadFirst(QRY_select_viatura_matricula)=True THEN
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
IF HReadFirst(QRY_select_cliente_codigo)=True THEN
EDT_Cliente=QRY_select_cliente_codigo.Descricao
END
HCancelDeclaration(QRY_select_cliente_codigo)
EDT_matricula=Upper(EDT_matricula)
ELSE
SWITCH Dialog(<§?1665728B004B2BDF§>)
CASE 1
EDT_matricula=Upper(EDT_matricula)
Open(WIN_Form_Viaturas,"NOVO",EDT_matricula)
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
IF HReadFirst(QRY_select_viatura_matricula)=True THEN
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
IF HReadFirst(QRY_select_cliente_codigo)=True THEN
EDT_Cliente=QRY_select_cliente_codigo.Descricao
END
HCancelDeclaration(QRY_select_cliente_codigo)
EDT_matricula=Upper(EDT_matricula)
ELSE
info("Criação de matrícula cancelada")
HCancelDeclaration(QRY_select_viatura_matricula)
return
END
CASE 2
HCancelDeclaration(QRY_select_viatura_matricula)
RETURN
END
END
HCancelDeclaration(QRY_select_viatura_matricula)
HCancelDeclaration(QRY_select_cliente_codigo)
IF gEstadoforn<>"MODIFICAR" THEN
gsQuery="SELECT * FROM estados_reparacao,ordem_reparacao WHERE estados_reparacao.Codigo = ordem_reparacao.reparacao_estado AND (ordem_reparacao.matricula = '"+EDT_matricula+"') AND estados_reparacao.tipo<>7"
dsQry_select_ordem_estado is data source
HExecuteSQLQuery(dsQry_select_ordem_estado,hQueryDefault,gsQuery)
if hreadfirst(dsQry_select_ordem_estado)=true then
info("Viatura já em reparação")
HCancelDeclaration(dsQry_select_ordem_estado)
return
END
HCancelDeclaration(dsQry_select_ordem_estado)
end
gsQuery="select * from estados_reparacao where estados_reparacao.codigo='"+COMBO_estado[COMBO_estado]..StoredValue+"'"
Qry_select_estados_reparacao is data source
HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,gsQuery)
if hreadfirst(Qry_select_estados_reparacao)=true then
if Qry_select_estados_reparacao.tipo>1 and COMBO_mecanico="" then
info("Este estado de reparação requer um mecânico")
return
END
if Qry_select_estados_reparacao.pedir_data_entrega=true THEN
EDT_data_entrega=open(win_data,"Data de entrega",EDT_data_entrega)
END
if Qry_select_estados_reparacao.pedir_data_pag=True THEN
edt_Data_pagamento=open(win_data,"Data de pagamento",EDT_Data_pagamento)
END
END
HCancelDeclaration(Qry_select_estados_reparacao)
if gEstadoforn="NOVO" THEN
gsquery="select * from mecanicos where codigo='"+COMBO_mecanico+"'"
dsQry_Select_Mecanico is data source
HExecuteSQLQuery(dsQry_Select_Mecanico,hQueryDefault,gsQuery)
if hreadfirst(dsQry_Select_Mecanico)=true then
if dsQry_Select_Mecanico.inativo=true then
Info("Mecânico inativo")
RETURN
END
END
HCancelDeclaration(dsQry_Select_Mecanico)
ELSE
gsQuery="select * from mecanicos where codigo='"+COMBO_mecanico+"'"
dsQry_Select_Mecanico is data source
HExecuteSQLQuery(dsQry_Select_Mecanico,hQueryDefault,gsQuery)
IF HReadFirst(dsQry_Select_Mecanico)=True THEN
IF dsQry_Select_Mecanico.inativo=True THEN
IF YESNO("Mecânico está inativo quer continuar?")=0 then
return
END
end
END
HCancelDeclaration(dsQry_Select_Mecanico)
END
if gestadoforn="MODIFICAR" THEN
QRY_update_ordens_reparacao.ParamNumero_antigo=EDT_Ordem_n
QRY_update_ordens_reparacao.ParamFaturado=CBOX_faturado
QRY_update_ordens_reparacao.ParamKM=EDT_KM
QRY_update_ordens_reparacao.ParamMatricula=EDT_matricula
QRY_update_ordens_reparacao.ParamNumero=EDT_Ordem_n
QRY_update_ordens_reparacao.ParamNumero_fatura=EDT_Nr_Fatura
QRY_update_ordens_reparacao.ParamRecepcao_contactos=EDT_Contactos
QRY_update_ordens_reparacao.ParamRecepcao_data_hora=EDT_data_HORA_entrada
QRY_update_ordens_reparacao.ParamRecepcao_entrega=EDT_data_entrega
QRY_update_ordens_reparacao.ParamRecepcao_obs=EDT_observacao
QRY_update_ordens_reparacao.ParamRecepcao_cliente=gnCliente
QRY_update_ordens_reparacao.ParamRecepcao_Terceiro=EDT_Terceiro
QRY_update_ordens_reparacao.ParamRecepcao_prioridade=COMBO_Prioridade
QRY_update_ordens_reparacao.ParamRecepcao_servico=EDT_servico_avaria
QRY_update_ordens_reparacao.ParamRecepcao_util=COMBO_Recepcionado
QRY_update_ordens_reparacao.ParamReparacao_estado=COMBO_estado..StoredValue
QRY_update_ordens_reparacao.ParamReparacao_mecanico=COMBO_mecanico
QRY_update_ordens_reparacao.ParamTotal_pago=EDT_Total_Pago
QRY_update_ordens_reparacao.ParamDataPagamento=EDT_Data_pagamento
HExecuteQuery(QRY_update_ordens_reparacao,hQueryDefault)
ELSE
QRY_insert_ordens_reparacao.ParamFaturado=CBOX_faturado
QRY_insert_ordens_reparacao.ParamKM=EDT_KM
QRY_insert_ordens_reparacao.ParamMatricula=EDT_matricula
QRY_insert_ordens_reparacao.ParamNumero=EDT_Ordem_n
QRY_insert_ordens_reparacao.ParamNumero_fatura=EDT_Nr_Fatura
QRY_insert_ordens_reparacao.ParamRecepcao_contactos=EDT_Contactos
QRY_insert_ordens_reparacao.ParamRecepcao_data_hora=EDT_data_hora_entrada
QRY_insert_ordens_reparacao.ParamRecepcao_entrega=EDT_data_entrega
QRY_insert_ordens_reparacao.ParamRecepcao_obs=EDT_observacao
QRY_insert_ordens_reparacao.ParamRecepcao_prioridade=COMBO_Prioridade
QRY_insert_ordens_reparacao.ParamRecepcao_servico=EDT_servico_avaria
QRY_insert_ordens_reparacao.ParamRecepcao_util=COMBO_Recepcionado
QRY_insert_ordens_reparacao.ParamRecepcao_cliente=gnCliente
QRY_insert_ordens_reparacao.ParamRecepcao_Terceiro=EDT_Terceiro
QRY_insert_ordens_reparacao.ParamReparacao_estado=COMBO_estado..StoredValue
QRY_insert_ordens_reparacao.ParamReparacao_mecanico=COMBO_mecanico
QRY_insert_ordens_reparacao.ParamTotal_pago=EDT_Total_Pago
QRY_insert_ordens_reparacao.Paramdatapagamento=EDT_Data_pagamento
HExecuteQuery(QRY_insert_ordens_reparacao,hQueryDefault)
END
```

Assumed action following code: Close the window (`proposed: A-2b6ca2`).

### SRC-77db2a5b94 — WIN_Ordens_Reparacao_Form/BTN_Cancelar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1150-1157`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: switch YesNo(0,"Cancelar ordem de reparação?"); case 0; return; case 1; OTHER CASE. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-77db2a5b94.

HFSQL: none in this block.

Other calls: YesNo(0).

Exact executable branch/assignment ledger:
```wlanguage
switch YesNo(0,"Cancelar ordem de reparação?")
case 0
return
case 1
OTHER CASE
END
```

Assumed action following code: Close the window (`proposed: A-2b6ca2`).

### SRC-6b343b3c1d — WIN_Ordens_Reparacao_Form/BTN_informacao

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1181-1206`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: HOnError(ordem_reparacao,hErrLock,""); HReadSeek(ordem_reparacao,numero,gOrdem_numero); nRegistoatual is int=HRecNum(ordem_reparacao); IF HErrorLock()=false THEN; HLockRecNum(ordem_reparacao,nRegistoatual,hLockWrite); IF HErrorLock()=true THEN; Info("Ordem de reparação em uso por outro utilizador"); RETURN; switch WinStatus(WIN_Material_reparacao_form); CASE Active; if WIN_Material_reparacao_form.numero_ordem_reparacao=gOrdem_numero then; info("Documento em edição, por favor feche a janela"); return; Open(WIN_Table_Tempos_materiais_Descricoes,gOrdem_numero); CASE NotFound; Open(WIN_Table_Tempos_materiais_Descricoes,gOrdem_numero); Info("Ordem de reparação em uso por outro utilizador"); return; HUnlockRecNum(ordem_reparacao,nRegistoatual). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-6b343b3c1d.

HFSQL: HReadSeek(ordem_reparacao); HOnError(ordem_reparacao); HUnlockRecNum(ordem_reparacao).

Other calls: Info("Ordem de reparação em uso por outro utilizador"); Info("Documento em edição, por favor feche a janela"); Info("Ordem de reparação em uso por outro utilizador"); Open(WIN_Table_Tempos_materiais_Descricoes); Open(WIN_Table_Tempos_materiais_Descricoes); WinStatus(WIN_Material_reparacao_form).

Exact executable branch/assignment ledger:
```wlanguage
HOnError(ordem_reparacao,hErrLock,"")
HReadSeek(ordem_reparacao,numero,gOrdem_numero)
nRegistoatual is int=HRecNum(ordem_reparacao)
IF HErrorLock()=false THEN
HLockRecNum(ordem_reparacao,nRegistoatual,hLockWrite)
IF HErrorLock()=true THEN
Info("Ordem de reparação em uso por outro utilizador")
RETURN
ELSE
switch WinStatus(WIN_Material_reparacao_form)
CASE Active
if WIN_Material_reparacao_form.numero_ordem_reparacao=gOrdem_numero then
info("Documento em edição, por favor feche a janela")
return
else
Open(WIN_Table_Tempos_materiais_Descricoes,gOrdem_numero)
END
CASE NotFound
Open(WIN_Table_Tempos_materiais_Descricoes,gOrdem_numero)
END
END
ELSE
Info("Ordem de reparação em uso por outro utilizador")
return
END
HUnlockRecNum(ordem_reparacao,nRegistoatual)
```

### SRC-8bd3f318a9 — WIN_Ordens_Reparacao_Form/EDT_Marca_Modelo

Event `16`: Exit; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1234-1295`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Exit [16]: if EDT_matricula<>"" then; HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula); IF HReadFirst(QRY_select_viatura_matricula)=True THEN; gnCliente=QRY_select_viatura_matricula.Cliente; HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente); IF HReadFirst(QRY_select_cliente_codigo)=True THEN; EDT_Cliente=QRY_select_cliente_codigo.Descricao; IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN; EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel; IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN; EDT_Contactos=QRY_select_cliente_codigo.Telefone1; IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN; EDT_Contactos=QRY_select_cliente_codigo.Telemovel; EDT_Contactos=""; EDT_matricula=Upper(EDT_matricula); SWITCH Dialog(<§?1665728B004B2BDF§>); CASE 1; EDT_matricula=UPPER(EDT_matricuLA); open(WIN_Form_Viaturas,"NOVO",EDT_matricula); HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula); IF HReadFirst(QRY_select_viatura_matricula)=True THEN; gnCliente=QRY_select_viatura_matricula.Cliente; HExecuteQuery(QRY_select_c. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-8bd3f318a9.

HFSQL: HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_cliente_codigo); HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_cliente_codigo); HReadFirst(QRY_select_viatura_matricula); HReadFirst(QRY_select_cliente_codigo); HReadFirst(QRY_select_viatura_matricula); HReadFirst(QRY_select_cliente_codigo); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_cliente_codigo).

Other calls: Info("Criação de matrícula cancelada"); Open(WIN_Form_Viaturas); Dialog(<§?1665728B004B2BDF§>).

Exact executable branch/assignment ledger:
```wlanguage
if EDT_matricula<>"" then
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
IF HReadFirst(QRY_select_viatura_matricula)=True THEN
gnCliente=QRY_select_viatura_matricula.Cliente
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
IF HReadFirst(QRY_select_cliente_codigo)=True THEN
EDT_Cliente=QRY_select_cliente_codigo.Descricao
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telemovel
ELSE
EDT_Contactos=""
END
END
END
END
EDT_matricula=Upper(EDT_matricula)
ELSE
SWITCH Dialog(<§?1665728B004B2BDF§>)
CASE 1
EDT_matricula=UPPER(EDT_matricuLA)
open(WIN_Form_Viaturas,"NOVO",EDT_matricula)
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
IF HReadFirst(QRY_select_viatura_matricula)=True THEN
gnCliente=QRY_select_viatura_matricula.Cliente
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
IF HReadFirst(QRY_select_cliente_codigo)=True THEN
EDT_Cliente=QRY_select_cliente_codigo.Descricao
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" AND NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1+CR+QRY_select_cliente_codigo.Telemovel
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telefone1)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telefone1
ELSE
IF NoSpace(QRY_select_cliente_codigo.Telemovel)<>"" THEN
EDT_Contactos=QRY_select_cliente_codigo.Telemovel
ELSE
EDT_Contactos=""
END
END
END
END
EDT_matricula=Upper(EDT_matricula)
ELSE
Info("Criação de matrícula cancelada")
RETURN
END
CASE 2
END
END
end
HCancelDeclaration(QRY_select_viatura_matricula)
HCancelDeclaration(QRY_select_cliente_codigo)
```

### SRC-11d401c5a4 — WIN_Ordens_Reparacao_Form/BTN_VISION4

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1376-1380`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Terceiro=open(WIN_Table_Clientes,true,EDT_Terceiro); hreadseek(clientes,Codigo,EDT_Terceiro,hIdentical); if hfound(Clientes)=true then; EDT_Terceiro_Descricao=clientes.Descricao. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-11d401c5a4.

HFSQL: HReadSeek(clientes); HFound(Clientes).

Other calls: Open(WIN_Table_Clientes).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Terceiro=open(WIN_Table_Clientes,true,EDT_Terceiro)
hreadseek(clientes,Codigo,EDT_Terceiro,hIdentical)
if hfound(Clientes)=true then
EDT_Terceiro_Descricao=clientes.Descricao
END
```

### SRC-b2e6eeadd9 — WIN_Ordens_Reparacao_Form [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1424-1467`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(gEstadoforn is string,gOrdem_numero); gestado_Atual is string; gnCliente is int; if gEstadoforn="MODIFICAR" THEN; EDT_Ordem_n=gOrdem_numero; EDT_matricula..InputEnabled=false; HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,gOrdem_numero); hreadfirst(QRY_select_ordens_reparacao_numero); EDT_Ordem_n=QRY_select_ordens_reparacao_numero.numero; EDT_data_hora_entrada=QRY_select_ordens_reparacao_numero.recepcao_datahora; EDT_data_entrega=QRY_select_ordens_reparacao_numero.recepcao_entrega_prevista; EDT_KM=QRY_select_ordens_reparacao_numero.km_viatura; EDT_matricula=QRY_select_ordens_reparacao_numero.matricula; ExecuteProcess(EDT_matricula,trtExit); EDT_Contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos; EDT_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico; EDT_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs; COMBO_mecanico=QRY_select_ordens_reparacao_numero.reparacao_mecanico; COMBO_Recepcionado=QRY_select_ordens_reparacao_numero.recepcao_util; EDT_Nr_Fatura=QRY_select_ordens_reparacao_numero.numero_fatura; CBOX_faturado=QRY_select_ordens_reparacao_numero.faturado; EDT_Total_Pago=QRY_select_ordens_reparacao_numer. Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-b2e6eeadd9.

HFSQL: HExecuteQuery(QRY_select_ordens_reparacao_numero); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(gdsQRY_select_maximo_ordens_reparacao); HCancelDeclaration(gdsQRY_select_maximo_ordens_reparacao); HExecuteSQLQuery(gdsQRY_select_maximo_ordens_reparacao); HReadSeek(Clientes); HFound(Clientes).

Other calls: ExecuteProcess(EDT_matricula).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(gEstadoforn is string,gOrdem_numero)
gestado_Atual is string
gnCliente is int
if gEstadoforn="MODIFICAR" THEN
EDT_Ordem_n=gOrdem_numero
EDT_matricula..InputEnabled=false
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,gOrdem_numero)
hreadfirst(QRY_select_ordens_reparacao_numero)
EDT_Ordem_n=QRY_select_ordens_reparacao_numero.numero
EDT_data_hora_entrada=QRY_select_ordens_reparacao_numero.recepcao_datahora
EDT_data_entrega=QRY_select_ordens_reparacao_numero.recepcao_entrega_prevista
EDT_KM=QRY_select_ordens_reparacao_numero.km_viatura
EDT_matricula=QRY_select_ordens_reparacao_numero.matricula
ExecuteProcess(EDT_matricula,trtExit)
EDT_Contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos
EDT_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico
EDT_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs
COMBO_mecanico=QRY_select_ordens_reparacao_numero.reparacao_mecanico
COMBO_Recepcionado=QRY_select_ordens_reparacao_numero.recepcao_util
EDT_Nr_Fatura=QRY_select_ordens_reparacao_numero.numero_fatura
CBOX_faturado=QRY_select_ordens_reparacao_numero.faturado
EDT_Total_Pago=QRY_select_ordens_reparacao_numero.total_pago
EDT_Data_pagamento=QRY_select_ordens_reparacao_numero.data_pagamento
EDT_Terceiro=QRY_select_ordens_reparacao_numero.recepcao_terceiro
HReadSeek(Clientes,Codigo,EDT_Terceiro,hIdentical)
IF HFound(Clientes)=True THEN
EDT_Terceiro_Descricao=Clientes.Descricao
END
else
EDT_data_hora_entrada=sysdatetime()
EDT_data_entrega=SysDateTime()
gnUm_ordem_rep is int
gsQuery is string="select max(ordem_reparacao.numero) as numero_maximo from ordem_reparacao"
gdsQRY_select_maximo_ordens_reparacao is data source
HExecuteSQLQuery(gdsQRY_select_maximo_ordens_reparacao,hQueryDefault,gsquery)
if hreadfirst(gdsQRY_select_maximo_ordens_reparacao)=true then
gnUm_ordem_rep=gdsQRY_select_maximo_ordens_reparacao.numero_maximo
END
HCancelDeclaration(gdsQRY_select_maximo_ordens_reparacao)
gnUm_ordem_rep++
EDT_Ordem_n=gnUm_ordem_rep
END
```

### SRC-7bbd4b10b4 — WIN_Ordens_Reparacao_Form

Event `34`: End of initialization; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1470-1478`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): End of initialization [34]: IF gEstadoforn="MODIFICAR" THEN; listselectplus(COMBO_estado,listseek(COMBO_estado,QRY_select_ordens_reparacao_numero.reparacao_estado)); IF gEstadoforn="NOVO" THEN; ListSelectplus(COMBO_Prioridade,1); combo_estado=-1; ListSelectPlus(COMBO_Prioridade,QRY_select_ordens_reparacao_numero.recepcao_prioridade). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-7bbd4b10b4.

HFSQL: none in this block.

Other calls: ListSelectPlus(COMBO_estado); ListSelectPlus(COMBO_Prioridade); ListSelectPlus(COMBO_Prioridade); ListSeek(COMBO_estado).

Exact executable branch/assignment ledger:
```wlanguage
IF gEstadoforn="MODIFICAR" THEN
listselectplus(COMBO_estado,listseek(COMBO_estado,QRY_select_ordens_reparacao_numero.reparacao_estado))
END
IF gEstadoforn="NOVO" THEN
ListSelectplus(COMBO_Prioridade,1)
combo_estado=-1
else
ListSelectPlus(COMBO_Prioridade,QRY_select_ordens_reparacao_numero.recepcao_prioridade)
END
```

### SRC-e8259ab6ea — WIN_Ordens_Reparacao_Form

Event `2`: Close; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1503-1503`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Close [2]: HCancelDeclaration(QRY_select_ordens_reparacao_numero). Authoritative exact branch ledger: docs/mapping/WIN_Ordens_Reparacao_Form.md under SRC-e8259ab6ea.

HFSQL: HCancelDeclaration(QRY_select_ordens_reparacao_numero).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
```

### SRC-f790894532 — WIN_Ordens_Reparacao_Form/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-932c6ed809 — WIN_Ordens_Reparacao_Form/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-0fa5d7d241 — WIN_Ordens_Reparacao_Form/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-5914e7247e — WIN_Ordens_Reparacao_Form/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HExecuteQuery: `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:274`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:278`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:303`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:307`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:386`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:390`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:418`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:422`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:975`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:977`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:990`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:992`; `QRY_update_ordens_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1096`; `QRY_insert_ordens_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1124`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1235`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1238`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1263`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1266`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1432`.
- HReadFirst: `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:275`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:279`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:304`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:308`; `dsQry_select_material_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:374`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:387`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:391`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:419`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:423`; `dsQry_select_Tempo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:525`; `dsQry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:531`; `dsQry_select_Tempo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:591`; `dsQry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:598`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:976`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:978`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:991`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:993`; `dsQry_select_ordem_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1017`; `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1028`; `dsQry_Select_Mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1046`; `dsQry_Select_Mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1057`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1236`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1239`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1264`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1267`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1433`; `gdsQRY_select_maximo_ordens_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1461`.
- HCancelDeclaration: `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:335`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:336`; `dsQry_select_material_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:377`; `dsQry_select_material_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:379`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:453`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:454`; `dsQry_select_Tempo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:544`; `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:573`; `dsQry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:612`; `dsQry_select_Tempo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:614`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:981`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:996`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1000`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1006`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1010`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1011`; `dsQry_select_ordem_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1019`; `dsQry_select_ordem_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1022`; `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1040`; `dsQry_Select_Mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1052`; `dsQry_Select_Mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1064`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1294`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1295`; `gdsQRY_select_maximo_ordens_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1464`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1503`.
- HExecuteSQLQuery: `dsQry_select_material_tempos` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:373`; `dsQry_select_Tempo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:524`; `dsQry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:530`; `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:569`; `dsQry_select_Tempo` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:590`; `dsQry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:597`; `dsQry_select_ordem_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1016`; `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1027`; `dsQry_Select_Mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1045`; `dsQry_Select_Mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1056`; `gdsQRY_select_maximo_ordens_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1460`.
- HReadSeek: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1182`; `clientes` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1377`; `Clientes` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1450`.
- HFound: `Clientes` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1378`; `Clientes` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1451`.
- HOnError: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1181`.
- HUnlockRecNum: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1206`.

## Behavior checklist

- Open and native keyboard: U-W61831D-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- Actual data/timer/lock/write failure cases: U-W61831D-03.
- Explicit message/resource shell outcomes: U-W61831D-04.
- Actual field/mask/type boundaries: U-W61831D-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W61831D-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Parsed browsed_file/browsed_item values shown in the screen Binding cells are established dossier facts and excluded from this item. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W61831D-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W61831D-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HErrorLock, HExecuteQuery, HExecuteSQLQuery, HFound, HLockRecNum, HOnError, HReadFirst, HReadSeek, HRecNum, HUnlockRecNum, hfound, hreadfirst, hreadseek; failed or partial writes in the actual save/update blocks; lock acquisition/error paths and explicit unlock omissions. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W61831D-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W61831D-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

18/18 blocks; 4/4 encoded-only slots retained; 69 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1124`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1149`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Ordens_Reparacao_Form.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Ordens_Reparacao_Form.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Ordens_Reparacao_Form.wdw:9`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Ordens_Reparacao_Form.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:227`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:230`
