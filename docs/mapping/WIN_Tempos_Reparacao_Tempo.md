# Mapping — WIN_Tempos_Reparacao_Tempo

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw`; designer `dossier: WIN_Tempos_Reparacao_Tempo`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Authenticate mechanic and start/finish labor.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:407 (Open in WIN_Tempos_Reparacao)`
```wlanguage

if TABLE_tempos_reparacao_ordem=-1 then
Open(WIN_Tempos_Reparacao_Tempo,QRY_select_ordens_reparacao_tempos.numero,qry_select_ordens_reparacao_tempos.reparacao_mecanico)
else
open(WIN_Tempos_Reparacao_Tempo,QRY_select_tempos_reparacao_ordem.numero,QRY_select_tempos_reparacao_ordem.mecanico)
end
```
- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:409 (Open in WIN_Tempos_Reparacao)`
```wlanguage
Open(WIN_Tempos_Reparacao_Tempo,QRY_select_ordens_reparacao_tempos.numero,qry_select_ordens_reparacao_tempos.reparacao_mecanico)
else
open(WIN_Tempos_Reparacao_Tempo,QRY_select_tempos_reparacao_ordem.numero,QRY_select_tempos_reparacao_ordem.mecanico)
end
TableDisplay(TABLE_tempos_reparacao,taReExecuteQuery)
if STC_filtro_atual="Todos" then
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry(number,mechanic) loads order/vehicle/mechanic; latest labor row all-zero finish sets caption Finalizar else Iniciar. Selector/password caches active mechanic and recalculates latest caption. Start action first authenticates; blank/wrong password rejects. Iterates other open work for active mechanic and asks Terminar a reparação de <plate> ?; Yes closes that other order's open labor with SysDateTime() and that other order's reparacao_estado,No continues without closing or blocking new work. Current order latest open row gets finish now; otherwise state type3/4/5 permits insert. Other state types open WIN_Table_estado_reparacao_tipo3,whose choices include types3/4/5; cancelar aborts,else updates order state then inserts labor. Insert Inicio_reparacao_estado still reads earlier order query buffer,not reexecuted after state UPDATE,so can retain old state. No transaction/locks/checked writes. Encoded button action closes after completed code only as assumption.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw` exact event locations below; `dossier: WIN_Tempos_Reparacao_Tempo/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-c0cc54232e — WIN_Tempos_Reparacao_Tempo/BTN_NoName1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:241-279`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: sMecanico is string; sMecanico=open(WIN_Table_mecanicos,true,""); if sMecanico<>"" then; HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,sMecanico); hreadfirst(QRY_select_mecanicos_codigo); if QRY_select_mecanicos_codigo.Codigo=gsMecanico_ativo then; EDT_mecanico=QRY_select_mecanicos_codigo.Descricao; sPassword is string; sPassword=open(WIN_Inserir_quantidade_password,"password",""); if sPassword<>"" then; if sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN; gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo; EDT_mecanico=QRY_select_mecanicos_codigo.Descricao; info("Palavra-passe incorreta"); HCancelDeclaration(QRY_select_mecanicos_codigo); return; HCancelDeclaration(QRY_select_mecanicos_codigo); if gsMecanico_ativo="" then; HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,mecanico); HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,gsMecanico_ativo); IF HReadLast(QRY_select_tempos_Reparacao_numero_mecanico)=True THEN; IF QRY_select_tempos_Reparacao_numero_mecanico.fim="00000000000000000" THEN; BTN_Iniciar..Caption="Finalizar"; BTN_Iniciar..Caption="Iniciar"; BTN_Iniciar..Caption="Iniciar"; HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Tempo.md under SRC-c0cc54232e.

HFSQL: HExecuteQuery(QRY_select_mecanicos_codigo); HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico); HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico); HReadFirst(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico); HReadLast(QRY_select_tempos_Reparacao_numero_mecanico).

Other calls: Info("Palavra-passe incorreta"); Open(WIN_Table_mecanicos); Open(WIN_Inserir_quantidade_password).

Exact executable branch/assignment ledger:
```wlanguage
sMecanico is string
sMecanico=open(WIN_Table_mecanicos,true,"")
if sMecanico<>"" then
HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,sMecanico)
hreadfirst(QRY_select_mecanicos_codigo)
if QRY_select_mecanicos_codigo.Codigo=gsMecanico_ativo then
EDT_mecanico=QRY_select_mecanicos_codigo.Descricao
else
sPassword is string
sPassword=open(WIN_Inserir_quantidade_password,"password","")
if sPassword<>"" then
if sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN
gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo
EDT_mecanico=QRY_select_mecanicos_codigo.Descricao
else
info("Palavra-passe incorreta")
HCancelDeclaration(QRY_select_mecanicos_codigo)
return
END
end
END
HCancelDeclaration(QRY_select_mecanicos_codigo)
END
if gsMecanico_ativo="" then
HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,mecanico)
else
HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,gsMecanico_ativo)
end
IF HReadLast(QRY_select_tempos_Reparacao_numero_mecanico)=True THEN
IF QRY_select_tempos_Reparacao_numero_mecanico.fim="00000000000000000" THEN
BTN_Iniciar..Caption="Finalizar"
else
BTN_Iniciar..Caption="Iniciar"
END
ELSE
BTN_Iniciar..Caption="Iniciar"
END
HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)
```

### SRC-39eeaad136 — WIN_Tempos_Reparacao_Tempo/BTN_Iniciar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:304-432`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF gsMecanico_ativo="" THEN; HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,mecanico); HReadFirst(QRY_select_mecanicos_codigo); sPassword is string; sPassword=Open(WIN_Inserir_quantidade_password,"password",""); IF sPassword<>"" THEN; IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN; gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo; EDT_mecanico=QRY_select_mecanicos_codigo.Descricao; HCancelDeclaration(QRY_select_mecanicos_codigo); Info("Palavra-passe incorreta"); HCancelDeclaration(QRY_select_mecanicos_codigo); RETURN; Info("Palavra-passe incorreta"); HCancelDeclaration(QRY_select_mecanicos_codigo); RETURN; query is string="SELECT tempos_reparacao.numero AS numero,tempos_reparacao.mecanico AS mecanico,tempos_reparacao.inicio AS inicio,tempos_reparacao.fim AS fim FROM tempos_reparacao"; query=query+" WHERE tempos_reparacao.mecanico ='"+gsMecanico_ativo+"' and tempos_reparacao.fim='00000000000000000'"; QRY_select_tempos_Reparacao_numero is data source; HExecutesqlQuery(QRY_select_tempos_Reparacao_numero,hQueryDefault,query); for each QRY_select_tempos_Reparacao_numero; if QRY_select_tempos_Reparacao_numero.numero<>numero; hexecutequery(QRY_select_ordens_repara. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Tempo.md under SRC-39eeaad136.

HFSQL: HExecuteQuery(QRY_select_mecanicos_codigo); HExecuteQuery(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico); HExecuteQuery(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_ordens_reparacao_numero); HReadFirst(QRY_select_mecanicos_codigo); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(Qry_select_estados_reparacao_codigo); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(Qry_select_estados_reparacao_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(Qry_update_tempos_reparacao); HCancelDeclaration(QRY_select_ordens_reparacao_numero); HCancelDeclaration(QRY_select_tempos_Reparacao_numero); HCancelDeclaration(Qry_update_tempos_Reparacao); HCancelDeclaration(Qry_insert_tempos_Reparacao); HCancelDeclaration(QRY_update_ordens_reparacao_estado); HCancelDeclaration(Qry_insert_tempos_Reparacao); HCancelDeclaration(Qry_select_estados_reparacao_codigo); HCancelDeclaration(QRY_select_ordens_reparacao_numero); HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico); HCancelDeclaration(Qry_select_estados_reparacao_codigo); HCancelDeclaration(QRY_select_ordens_reparacao_numero); HCancelDeclaration(Qry_insert_tempos_Reparacao); HCancelDeclaration(QRY_update_ordens_reparacao_estado); HCancelDeclaration(Qry_insert_tempos_Reparacao); HCancelDeclaration(Qry_select_estados_reparacao_codigo); HCancelDeclaration(QRY_select_ordens_reparacao_numero); HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico); HCancelDeclaration(Qry_select_estados_reparacao_codigo); HCancelDeclaration(QRY_select_ordens_reparacao_numero); HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico); HExecuteSQLQuery(QRY_select_tempos_Reparacao_numero); HExecuteSQLQuery(Qry_update_tempos_reparacao); HExecuteSQLQuery(Qry_update_tempos_Reparacao); HExecuteSQLQuery(Qry_select_estados_reparacao_codigo); HExecuteSQLQuery(Qry_insert_tempos_Reparacao); HExecuteSQLQuery(QRY_update_ordens_reparacao_estado); HExecuteSQLQuery(Qry_insert_tempos_Reparacao); HExecuteSQLQuery(Qry_select_estados_reparacao_codigo); HExecuteSQLQuery(Qry_insert_tempos_Reparacao); HExecuteSQLQuery(QRY_update_ordens_reparacao_estado); HExecuteSQLQuery(Qry_insert_tempos_Reparacao); HReadLast(QRY_select_tempos_Reparacao_numero_mecanico).

Other calls: Info("Palavra-passe incorreta"); Info("Palavra-passe incorreta"); Open(WIN_Inserir_quantidade_password); Open(WIN_Table_estado_reparacao_tipo3); Open(WIN_Table_estado_reparacao_tipo3); YesNo(0).

Exact executable branch/assignment ledger:
```wlanguage
IF gsMecanico_ativo="" THEN
HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,mecanico)
HReadFirst(QRY_select_mecanicos_codigo)
sPassword is string
sPassword=Open(WIN_Inserir_quantidade_password,"password","")
IF sPassword<>"" THEN
IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN
gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo
EDT_mecanico=QRY_select_mecanicos_codigo.Descricao
HCancelDeclaration(QRY_select_mecanicos_codigo)
ELSE
Info("Palavra-passe incorreta")
HCancelDeclaration(QRY_select_mecanicos_codigo)
RETURN
END
ELSE
Info("Palavra-passe incorreta")
HCancelDeclaration(QRY_select_mecanicos_codigo)
RETURN
END
END
query is string="SELECT tempos_reparacao.numero AS numero,tempos_reparacao.mecanico AS mecanico,tempos_reparacao.inicio AS inicio,tempos_reparacao.fim AS fim FROM tempos_reparacao"
query=query+" WHERE tempos_reparacao.mecanico ='"+gsMecanico_ativo+"' and tempos_reparacao.fim='00000000000000000'"
QRY_select_tempos_Reparacao_numero is data source
HExecutesqlQuery(QRY_select_tempos_Reparacao_numero,hQueryDefault,query)
for each QRY_select_tempos_Reparacao_numero
if QRY_select_tempos_Reparacao_numero.numero<>numero
hexecutequery(QRY_select_ordens_reparacao_numero,hQueryDefault,QRY_select_tempos_Reparacao_numero.numero)
if hreadfirst(QRY_select_ordens_reparacao_numero)=true then
SWITCH yesno(0,"Terminar a reparação de "+QRY_select_ordens_reparacao_numero.matricula+" ?")
CASE 1
query="UPDATE tempos_reparacao SET fim ='"+SysDateTime()+"',fim_reparacao_estado ='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"' WHERE tempos_reparacao.numero ='"+QRY_select_tempos_Reparacao_numero.numero+"' AND tempos_reparacao.mecanico ='"+gsMecanico_ativo+"' and tempos_reparacao.fim='00000000000000000'"
Qry_update_tempos_reparacao is data source
HExecuteSQLQuery(Qry_update_tempos_reparacao,hQueryDefault,query)
HCancelDeclaration(Qry_update_tempos_reparacao)
CASE 0
END
end
end
END
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
HCancelDeclaration(QRY_select_tempos_Reparacao_numero)
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)
HReadFirst(QRY_select_ordens_reparacao_numero)
HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,gsMecanico_ativo)
if hreadlast(QRY_select_tempos_Reparacao_numero_mecanico)=true then
if QRY_select_tempos_Reparacao_numero_mecanico.fim="00000000000000000" then
Qry_update_tempos_Reparacao is data source
query="UPDATE tempos_reparacao SET fim ='"+sysdatetime()+"',fim_reparacao_estado ='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"' WHERE tempos_reparacao.numero ='"+numero+"' AND tempos_reparacao.mecanico ='"+gsMecanico_ativo+"' and tempos_reparacao.inicio='"+QRY_select_tempos_Reparacao_numero_mecanico.inicio+"'"
HExecuteSQLQuery(Qry_update_tempos_Reparacao,hQueryDefault,query)
HCancelDeclaration(Qry_update_tempos_Reparacao)
else
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)
HReadFirst(QRY_select_ordens_reparacao_numero)
Qry_select_estados_reparacao_codigo is data source
query="select * from estados_reparacao where codigo='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"'"
HExecuteSQLQuery(Qry_select_estados_reparacao_codigo,hQueryDefault,query)
HReadFirst(Qry_select_estados_reparacao_codigo)
IF Qry_select_estados_reparacao_codigo.tipo=3 OR Qry_select_estados_reparacao_codigo.tipo=4 OR Qry_select_estados_reparacao_codigo.tipo=5 THEN
Qry_insert_tempos_Reparacao is data source
query="INSERT INTO tempos_reparacao (numero,mecanico,inicio,Inicio_reparacao_estado) VALUES ('"+numero+"','"+gsMecanico_ativo+"','"+SysDateTime()+"','"+QRY_select_ordens_reparacao_numero.reparacao_estado+"')"
HExecuteSQLQuery(Qry_insert_tempos_Reparacao,hQueryDefault,query)
HCancelDeclaration(Qry_insert_tempos_Reparacao)
ELSE
sCodigo is string
sCodigo=Open(WIN_Table_estado_reparacao_tipo3)
IF sCodigo<>"cancelar" THEN
query="UPDATE ordem_reparacao SET reparacao_estado ='"+sCodigo+"' WHERE ordem_reparacao.numero = '"+numero+"'"
QRY_update_ordens_reparacao_estado is data Source
HExecuteSQLQuery(QRY_update_ordens_reparacao_estado,hQueryDefault,query)
HCancelDeclaration(QRY_update_ordens_reparacao_estado)
Qry_insert_tempos_Reparacao is data source
query="INSERT INTO tempos_reparacao (numero,mecanico,inicio,Inicio_reparacao_estado) VALUES ('"+numero+"','"+gsMecanico_ativo+"','"+SysDateTime()+"','"+QRY_select_ordens_reparacao_numero.reparacao_estado+"')"
HExecuteSQLQuery(Qry_insert_tempos_Reparacao,hQueryDefault,query)
HCancelDeclaration(Qry_insert_tempos_Reparacao)
ELSE
HCancelDeclaration(Qry_select_estados_reparacao_codigo)
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)
RETURN
END
END
HCancelDeclaration(Qry_select_estados_reparacao_codigo)
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
END
else
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)
HReadFirst(QRY_select_ordens_reparacao_numero)
Qry_select_estados_reparacao_codigo is data source
query="select * from estados_reparacao where codigo='"+QRY_select_ordens_reparacao_numero.reparacao_estado+"'"
HExecuteSQLQuery(Qry_select_estados_reparacao_codigo,hQueryDefault,query)
HReadFirst(Qry_select_estados_reparacao_codigo)
IF Qry_select_estados_reparacao_codigo.tipo=3 OR Qry_select_estados_reparacao_codigo.tipo=4 OR Qry_select_estados_reparacao_codigo.tipo=5 THEN
Qry_insert_tempos_Reparacao is data source
query="INSERT INTO tempos_reparacao (numero,mecanico,inicio,Inicio_reparacao_estado) VALUES ('"+numero+"','"+gsMecanico_ativo+"','"+SysDateTime()+"','"+QRY_select_ordens_reparacao_numero.reparacao_estado+"')"
HExecuteSQLQuery(Qry_insert_tempos_Reparacao,hQueryDefault,query)
HCancelDeclaration(Qry_insert_tempos_Reparacao)
ELSE
sCodigo is string
sCodigo=Open(WIN_Table_estado_reparacao_tipo3)
IF sCodigo<>"cancelar" THEN
query="UPDATE ordem_reparacao SET reparacao_estado ='"+sCodigo+"' WHERE ordem_reparacao.numero = '"+numero+"'"
QRY_update_ordens_reparacao_estado is data Source
HExecuteSQLQuery(QRY_update_ordens_reparacao_estado,hQueryDefault,query)
HCancelDeclaration(QRY_update_ordens_reparacao_estado)
Qry_insert_tempos_Reparacao is data source
query="INSERT INTO tempos_reparacao (numero,mecanico,inicio,Inicio_reparacao_estado) VALUES ('"+numero+"','"+gsMecanico_ativo+"','"+SysDateTime()+"','"+QRY_select_ordens_reparacao_numero.reparacao_estado+"')"
HExecuteSQLQuery(Qry_insert_tempos_Reparacao,hQueryDefault,query)
HCancelDeclaration(Qry_insert_tempos_Reparacao)
else
HCancelDeclaration(Qry_select_estados_reparacao_codigo)
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)
return
END
END
HCancelDeclaration(Qry_select_estados_reparacao_codigo)
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
END
HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)
```

Assumed action following code: Close the window (`proposed: A-2b6ca2`).

### SRC-a6d0145e4a — WIN_Tempos_Reparacao_Tempo [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:479-500`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(numero,mecanico); gsMecanico_ativo is string; HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero); hreadfirst(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,mecanico); HReadFirst(QRY_select_mecanicos_codigo); EDT_mecanico=QRY_select_mecanicos_codigo.Descricao; HCancelDeclaration(QRY_select_mecanicos_codigo); HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula); HReadFirst(QRY_select_viatura_matricula); EDT_matricula_marca_modelo=QRY_select_ordens_reparacao_numero.matricula+cr+QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo; HCancelDeclaration(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,mecanico); IF HReadLast(QRY_select_tempos_Reparacao_numero_mecanico)=True THEN; IF QRY_select_tempos_Reparacao_numero_mecanico.fim="00000000000000000" THEN; BTN_Iniciar..Caption="Finalizar"; HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Tempo.md under SRC-a6d0145e4a.

HFSQL: HExecuteQuery(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_mecanicos_codigo); HExecuteQuery(QRY_select_viatura_matricula); HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(QRY_select_mecanicos_codigo); HReadFirst(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico); HReadLast(QRY_select_tempos_Reparacao_numero_mecanico).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(numero,mecanico)
gsMecanico_ativo is string
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)
hreadfirst(QRY_select_ordens_reparacao_numero)
HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,mecanico)
HReadFirst(QRY_select_mecanicos_codigo)
EDT_mecanico=QRY_select_mecanicos_codigo.Descricao
HCancelDeclaration(QRY_select_mecanicos_codigo)
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)
HReadFirst(QRY_select_viatura_matricula)
EDT_matricula_marca_modelo=QRY_select_ordens_reparacao_numero.matricula+cr+QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
HCancelDeclaration(QRY_select_viatura_matricula)
HExecuteQuery(QRY_select_tempos_Reparacao_numero_mecanico,hQueryDefault,numero,mecanico)
IF HReadLast(QRY_select_tempos_Reparacao_numero_mecanico)=True THEN
IF QRY_select_tempos_Reparacao_numero_mecanico.fim="00000000000000000" THEN
BTN_Iniciar..Caption="Finalizar"
END
END
HCancelDeclaration(QRY_select_tempos_Reparacao_numero_mecanico)
```

### SRC-0bd33ecec2 — WIN_Tempos_Reparacao_Tempo/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-014ede4c1a — WIN_Tempos_Reparacao_Tempo/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-d8becf9e7d — WIN_Tempos_Reparacao_Tempo/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-06b2aa933b — WIN_Tempos_Reparacao_Tempo/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

### SRC-3674328653 — WIN_Tempos_Reparacao_Tempo/BTN_Cancelar [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:455; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HExecuteQuery: `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:244`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:266`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:268`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:306`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:334`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:355`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:357`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:365`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:399`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:481`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:484`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:489`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:494`.
- HReadFirst: `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:245`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:307`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:335`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:356`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:366`; `Qry_select_estados_reparacao_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:370`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:400`; `Qry_select_estados_reparacao_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:404`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:482`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:485`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:490`.
- HCancelDeclaration: `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:257`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:262`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:279`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:314`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:317`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:322`; `Qry_update_tempos_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:342`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:351`; `QRY_select_tempos_Reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:352`; `Qry_update_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:363`; `Qry_insert_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:375`; `QRY_update_ordens_reparacao_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:383`; `Qry_insert_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:387`; `Qry_select_estados_reparacao_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:389`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:390`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:391`; `Qry_select_estados_reparacao_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:395`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:396`; `Qry_insert_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:409`; `QRY_update_ordens_reparacao_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:417`; `Qry_insert_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:421`; `Qry_select_estados_reparacao_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:423`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:424`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:425`; `Qry_select_estados_reparacao_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:429`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:430`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:432`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:487`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:492`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:500`.
- HExecuteSQLQuery: `QRY_select_tempos_Reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:331`; `Qry_update_tempos_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:341`; `Qry_update_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:362`; `Qry_select_estados_reparacao_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:369`; `Qry_insert_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:374`; `QRY_update_ordens_reparacao_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:382`; `Qry_insert_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:386`; `Qry_select_estados_reparacao_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:403`; `Qry_insert_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:408`; `QRY_update_ordens_reparacao_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:416`; `Qry_insert_tempos_Reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:420`.
- HReadLast: `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:270`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:358`; `QRY_select_tempos_Reparacao_numero_mecanico` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:495`.

## Behavior checklist

- Open and native keyboard: U-W6D3B26-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- Actual data/timer/lock/write failure cases: U-W6D3B26-03.
- Explicit message/resource shell outcomes: U-W6D3B26-04.
- Actual field/mask/type boundaries: U-W6D3B26-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W6D3B26-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W6D3B26-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W6D3B26-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteQuery, HExecuteSQLQuery, HExecutesqlQuery, HReadFirst, HReadLast, hexecutequery, hreadfirst, hreadlast; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W6D3B26-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W6D3B26-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

3/3 blocks; 5/5 encoded-only slots retained; 26 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:407`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:409`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Tempos_Reparacao_Tempo.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Tempos_Reparacao_Tempo.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Tempos_Reparacao_Tempo.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Tempos_Reparacao_Tempo.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:329`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:332`
