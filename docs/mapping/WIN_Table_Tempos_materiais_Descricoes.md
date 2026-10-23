# Mapping — WIN_Table_Tempos_materiais_Descricoes

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw`; designer `dossier: WIN_Table_Tempos_materiais_Descricoes`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Inspect labor/service/history and edit material flags/prices.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1352 (Open in WIN_Ordens_Reparacao)`
```wlanguage
return
else
Open(WIN_Table_Tempos_materiais_Descricoes,TABLE_QRY_select_ordens_reparacao.COL_Numero)
END
CASE NotFound
Open(WIN_Table_Tempos_materiais_Descricoes,TABLE_QRY_select_ordens_reparacao.COL_Numero)
```
- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1355 (Open in WIN_Ordens_Reparacao)`
```wlanguage
END
CASE NotFound
Open(WIN_Table_Tempos_materiais_Descricoes,TABLE_QRY_select_ordens_reparacao.COL_Numero)
END
END
ELSE
```
- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1196 (Open in WIN_Ordens_Reparacao_Form)`
```wlanguage
return
else
Open(WIN_Table_Tempos_materiais_Descricoes,gOrdem_numero)
END
CASE NotFound
Open(WIN_Table_Tempos_materiais_Descricoes,gOrdem_numero)
```
- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1199 (Open in WIN_Ordens_Reparacao_Form)`
```wlanguage
END
CASE NotFound
Open(WIN_Table_Tempos_materiais_Descricoes,gOrdem_numero)
END
END
ELSE
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Labor inner-joins mechanic; all-zero finish displays blank duration. Duration integer hours and RoundUp((DecimalPart(hours)*59.99999999999)/0.99999999999999,0) minutes. HH:MM sum parses1-based substrings,single carry>=60. Totals separate extra from ordinary qty*price; VAT ordinary*1.23,format .2f excludes extras. Ordinary2*10,extra1*5 =>extras5,total20,VAT24.60 subjectlocale. Recompute extra change,row exit/display. Sair writes launched/extra/price matching order+article+timestamp; duplicate matches all update. System close closes directly without Sair,losing edits. Material lock/state.lancar_material guard can early-return without unlock; modal edit then reload. Report gets order and total label.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw` exact event locations below; `dossier: WIN_Table_Tempos_materiais_Descricoes/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-336177cc8a — WIN_Table_Tempos_materiais_Descricoes/SCSystemButtons/BTN_SYST_FERMER

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:141-141`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: close(WIN_Table_Tempos_materiais_Descricoes). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-336177cc8a.

HFSQL: none in this block.

Other calls: Close(WIN_Table_Tempos_materiais_Descricoes).

Exact executable branch/assignment ledger:
```wlanguage
close(WIN_Table_Tempos_materiais_Descricoes)
```

### SRC-4cb0ad4a02 — WIN_Table_Tempos_materiais_Descricoes/TAB_principal/TABLE_materiais/COL_extra

Event `17`: Whenever modifying; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:591-600`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Whenever modifying [17]: xTotal is numeric; xExtra is numeric; FOR EACH ROW OF TABLE_materiais; IF TABLE_materiais.COL_extra=False THEN; xTotal=xTotal+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco); xExtra=xExtra+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco); STC_total_material="Extras: "+NumToString(xExtra,".2f")+"    "+"Total: "+NumToString(xTotal,".2f")+"    "+"Total c/iva: "+NumToString(xTotal*1.23,".2f"). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-4cb0ad4a02.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
xTotal is numeric
xExtra is numeric
FOR EACH ROW OF TABLE_materiais
IF TABLE_materiais.COL_extra=False THEN
xTotal=xTotal+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco)
ELSE
xExtra=xExtra+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco)
END
END
STC_total_material="Extras: "+NumToString(xExtra,".2f")+"    "+"Total: "+NumToString(xTotal,".2f")+"    "+"Total c/iva: "+NumToString(xTotal*1.23,".2f")
```

### SRC-fea1ec2e20 — WIN_Table_Tempos_materiais_Descricoes/TAB_principal/TABLE_materiais

Event `20`: Exit from a row; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:628-637`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Exit from a row [20]: xTotal is numeric; xExtra is numeric; for each row of TABLE_materiais; if TABLE_materiais.COL_extra=false then; xTotal=xTotal+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco); xExtra=xExtra+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco); STC_total_material="Extras: "+NumToString(xExtra,".2f")+"    "+"Total: "+NumToString(xTotal,".2f")+"    "+"Total c/iva: "+NumToString(xTotal*1.23,".2f"). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-fea1ec2e20.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
xTotal is numeric
xExtra is numeric
for each row of TABLE_materiais
if TABLE_materiais.COL_extra=false then
xTotal=xTotal+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco)
else
xExtra=xExtra+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco)
end
END
STC_total_material="Extras: "+NumToString(xExtra,".2f")+"    "+"Total: "+NumToString(xTotal,".2f")+"    "+"Total c/iva: "+NumToString(xTotal*1.23,".2f")
```

### SRC-3afa481720 — WIN_Table_Tempos_materiais_Descricoes/TAB_principal/TABLE_materiais

Event `21`: Display a row; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:641-650`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Display a row [21]: xTotal is numeric; xExtra is numeric; FOR EACH ROW OF TABLE_materiais; IF TABLE_materiais.COL_extra=False THEN; xTotal=xTotal+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco); xExtra=xExtra+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco); STC_total_material="Extras: "+NumToString(xExtra,".2f")+"    "+"Total: "+NumToString(xTotal,".2f")+"    "+"Total c/iva: "+NumToString(xTotal*1.23,".2f"). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-3afa481720.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
xTotal is numeric
xExtra is numeric
FOR EACH ROW OF TABLE_materiais
IF TABLE_materiais.COL_extra=False THEN
xTotal=xTotal+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco)
ELSE
xExtra=xExtra+(TABLE_materiais.COL_quant*TABLE_materiais.COL_preco)
END
END
STC_total_material="Extras: "+NumToString(xExtra,".2f")+"    "+"Total: "+NumToString(xTotal,".2f")+"    "+"Total c/iva: "+NumToString(xTotal*1.23,".2f")
```

### SRC-0f2fcff124 — WIN_Table_Tempos_materiais_Descricoes/TAB_principal/BTN_Material

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:721-767`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: HOnError(ordem_reparacao,hErrLock,""); HReadSeek(ordem_reparacao,numero,numero_ordem_reparacao); nRegistoatual is int=HRecNum(ordem_reparacao); IF HErrorLock()=False THEN; HLockRecNum(ordem_reparacao,nRegistoatual,hLockWrite); IF HErrorLock()=True THEN; Info("Ordem de reparação em uso por outro utilizador"); RETURN; Query="select * from estados_reparacao where codigo='"+ordem_reparacao.reparacao_estado+"'"; dsQry_select_Estado_Rep is data source; HExecuteSQLQuery(dsQry_select_Estado_Rep,hQueryDefault,query); if hreadfirst(dsQry_select_Estado_Rep)=true then; if dsQry_select_Estado_Rep.lancar_material=false then; Info("Não pode ser inserido material nesta ordem de reparação"); HCancelDeclaration(dsQry_select_Estado_Rep); return; nUmero_ord_rep is int=numero_ordem_reparacao; Open(WIN_Material_reparacao_form,nUmero_ord_rep); HCancelDeclaration(dsQry_select_Estado_Rep); Info("Ordem de reparação em uso por outro utilizador"); RETURN; HUnlockRecNum(ordem_reparacao,nRegistoatual); TableDeleteAll(TABLE_materiais); gxTotal_material=0; gxExtra=0; Query="SELECT material_reparacao.numero AS numero,material_reparacao.lancado as lancado,material_reparacao.mecanico AS mecanico,material_reparacao.a. Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-0f2fcff124.

HFSQL: HReadFirst(dsQry_select_Estado_Rep); HCancelDeclaration(dsQry_select_Estado_Rep); HCancelDeclaration(dsQry_select_Estado_Rep); HCancelDeclaration(Qry_select_materiais_ordem_reparacao); HExecuteSQLQuery(dsQry_select_Estado_Rep); HExecuteSQLQuery(Qry_select_materiais_ordem_reparacao); HReadSeek(ordem_reparacao); HOnError(ordem_reparacao); HUnlockRecNum(ordem_reparacao).

Other calls: Info("Ordem de reparação em uso por outro utilizador"); Info("Não pode ser inserido material nesta ordem de reparação"); Info("Ordem de reparação em uso por outro utilizador"); Open(WIN_Material_reparacao_form).

Exact executable branch/assignment ledger:
```wlanguage
HOnError(ordem_reparacao,hErrLock,"")
HReadSeek(ordem_reparacao,numero,numero_ordem_reparacao)
nRegistoatual is int=HRecNum(ordem_reparacao)
IF HErrorLock()=False THEN
HLockRecNum(ordem_reparacao,nRegistoatual,hLockWrite)
IF HErrorLock()=True THEN
Info("Ordem de reparação em uso por outro utilizador")
RETURN
ELSE
Query="select * from estados_reparacao where codigo='"+ordem_reparacao.reparacao_estado+"'"
dsQry_select_Estado_Rep is data source
HExecuteSQLQuery(dsQry_select_Estado_Rep,hQueryDefault,query)
if hreadfirst(dsQry_select_Estado_Rep)=true then
if dsQry_select_Estado_Rep.lancar_material=false then
Info("Não pode ser inserido material nesta ordem de reparação")
HCancelDeclaration(dsQry_select_Estado_Rep)
return
end
nUmero_ord_rep is int=numero_ordem_reparacao
Open(WIN_Material_reparacao_form,nUmero_ord_rep)
END
HCancelDeclaration(dsQry_select_Estado_Rep)
END
ELSE
Info("Ordem de reparação em uso por outro utilizador")
RETURN
END
HUnlockRecNum(ordem_reparacao,nRegistoatual)
TableDeleteAll(TABLE_materiais)
gxTotal_material=0
gxExtra=0
Query="SELECT material_reparacao.numero AS numero,material_reparacao.lancado as lancado,material_reparacao.mecanico AS mecanico,material_reparacao.artigo AS artigo,material_reparacao.descricao_artigo AS descricao_artigo,material_reparacao.quantidade AS quantidade,"
Query=Query+"material_reparacao.data_hora AS data_hora,material_reparacao.reparacao_estado AS reparacao_estado,material_reparacao.extra AS extra,material_reparacao.preco AS preco "
Query=Query+" FROM material_reparacao WHERE material_reparacao.numero ='"+numero_ordem_reparacao+"' order by data_hora asc"
HExecuteSQLQuery(Qry_select_materiais_ordem_reparacao,hQueryDefault,Query)
FOR EACH Qry_select_materiais_ordem_reparacao
IF Qry_select_materiais_ordem_reparacao.extra=0 THEN
gxTotal_material=gxTotal_material+(Qry_select_materiais_ordem_reparacao.preco*Qry_select_materiais_ordem_reparacao.quantidade)
ELSE
gxExtra=gxExtra+(Qry_select_materiais_ordem_reparacao.preco*Qry_select_materiais_ordem_reparacao.quantidade)
END
TableAddLine(TABLE_materiais,Qry_select_materiais_ordem_reparacao.data_hora,Qry_select_materiais_ordem_reparacao.artigo,Qry_select_materiais_ordem_reparacao.descricao_artigo,Qry_select_materiais_ordem_reparacao.quantidade,Qry_select_materiais_ordem_reparacao.preco,Qry_select_materiais_ordem_reparacao.lancado,Qry_select_materiais_ordem_reparacao.extra)
END
STC_total_material="Extras: "+NumToString(gxExtra,".2f")+"    "+"Total: "+NumToString(gxTotal_material,".2f")+"    "+"Total c/iva: "+NumToString(gxTotal_material*1.23,".2f")
HCancelDeclaration(Qry_select_materiais_ordem_reparacao)
```

### SRC-5f26405f73 — WIN_Table_Tempos_materiais_Descricoes/TAB_principal/BTN_Imprimir

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:791-792`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: iPreview(); iPrintReport(RPT_Materiais,numero_ordem_reparacao,STC_total_material). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-5f26405f73.

HFSQL: none in this block.

Other calls: iPreview(); iPrintReport(RPT_Materiais).

Exact executable branch/assignment ledger:
```wlanguage
iPreview()
iPrintReport(RPT_Materiais,numero_ordem_reparacao,STC_total_material)
```

### SRC-c28dcbf38f — WIN_Table_Tempos_materiais_Descricoes/TAB_principal/BTN_listagem

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:889-890`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: iPreview(); iPrintReport(RPT_Servico_Avaria,numero_ordem_reparacao). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-c28dcbf38f.

HFSQL: none in this block.

Other calls: iPreview(); iPrintReport(RPT_Servico_Avaria).

Exact executable branch/assignment ledger:
```wlanguage
iPreview()
iPrintReport(RPT_Servico_Avaria,numero_ordem_reparacao)
```

### SRC-307490d383 — WIN_Table_Tempos_materiais_Descricoes/BTN_Sair

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:963-969`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: for each row of TABLE_materiais; query="UPDATE material_reparacao SET lancado ='"+TABLE_materiais.COL_lancado+"',extra ='"+TABLE_materiais.COL_extra+"',preco='"+TABLE_materiais.COL_preco+"' WHERE material_reparacao.numero ='"+numero_ordem_reparacao+"'"; query=query+" AND material_reparacao.artigo ='"+TABLE_materiais.COL_cod_art+"' AND material_reparacao.data_hora ='"+TABLE_materiais.COL_datahora+"'"; Qry_update_materiais_reparacao is data source; HExecuteSQLQuery(Qry_update_materiais_reparacao,hQueryDefault,query); close(WIN_Table_Tempos_materiais_Descricoes). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-307490d383.

HFSQL: HExecuteSQLQuery(Qry_update_materiais_reparacao).

Other calls: Close(WIN_Table_Tempos_materiais_Descricoes).

Exact executable branch/assignment ledger:
```wlanguage
for each row of TABLE_materiais
query="UPDATE material_reparacao SET lancado ='"+TABLE_materiais.COL_lancado+"',extra ='"+TABLE_materiais.COL_extra+"',preco='"+TABLE_materiais.COL_preco+"' WHERE material_reparacao.numero ='"+numero_ordem_reparacao+"'"
query=query+" AND material_reparacao.artigo ='"+TABLE_materiais.COL_cod_art+"' AND material_reparacao.data_hora ='"+TABLE_materiais.COL_datahora+"'"
Qry_update_materiais_reparacao is data source
HExecuteSQLQuery(Qry_update_materiais_reparacao,hQueryDefault,query)
END
close(WIN_Table_Tempos_materiais_Descricoes)
```

### SRC-02ca01d2a4 — WIN_Table_Tempos_materiais_Descricoes [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1004-1054`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(numero_ordem_reparacao); Query is string; Qry_select_observacoes_ordem_reparacao is data source; query="SELECT ordem_reparacao.numero AS numero,ordem_reparacao.matricula AS matricula,ordem_reparacao.recepcao_servico AS recepcao_servico,ordem_reparacao.recepcao_obs AS recepcao_obs,"; query=query+"ordem_reparacao.reparacao_estado_historico AS reparacao_estado_historico FROM ordem_reparacao WHERE ordem_reparacao.numero ='"+numero_ordem_reparacao+"'"; HExecuteSQLQuery(Qry_select_observacoes_ordem_reparacao,hQueryDefault,Query); if hreadfirst(Qry_select_observacoes_ordem_reparacao)=true then; EDT_servico_avaria=Qry_select_observacoes_ordem_reparacao.recepcao_servico; EDT_observacao=Qry_select_observacoes_ordem_reparacao.recepcao_obs; EDT_historico_estado=Qry_select_observacoes_ordem_reparacao.reparacao_estado_historico; STC_matricula=Qry_select_observacoes_ordem_reparacao.matricula; HCancelDeclaration(Qry_select_observacoes_ordem_reparacao); Qry_select_tempos_ordem_reparacao is data source; query="SELECT tempos_reparacao.numero AS numero,tempos_reparacao.mecanico AS mecanico,tempos_reparacao.inicio AS inicio,tempos_reparacao.fim AS fim,tempos_reparacao.Inicio_reparaca. Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-02ca01d2a4.

HFSQL: HReadFirst(Qry_select_observacoes_ordem_reparacao); HCancelDeclaration(Qry_select_observacoes_ordem_reparacao); HCancelDeclaration(Qry_select_tempos_ordem_reparacao); HCancelDeclaration(Qry_select_materiais_ordem_reparacao); HExecuteSQLQuery(Qry_select_observacoes_ordem_reparacao); HExecuteSQLQuery(Qry_select_tempos_ordem_reparacao); HExecuteSQLQuery(Qry_select_materiais_ordem_reparacao).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(numero_ordem_reparacao)
Query is string
Qry_select_observacoes_ordem_reparacao is data source
query="SELECT ordem_reparacao.numero AS numero,ordem_reparacao.matricula AS matricula,ordem_reparacao.recepcao_servico AS recepcao_servico,ordem_reparacao.recepcao_obs AS recepcao_obs,"
query=query+"ordem_reparacao.reparacao_estado_historico AS reparacao_estado_historico FROM ordem_reparacao WHERE ordem_reparacao.numero ='"+numero_ordem_reparacao+"'"
HExecuteSQLQuery(Qry_select_observacoes_ordem_reparacao,hQueryDefault,Query)
if hreadfirst(Qry_select_observacoes_ordem_reparacao)=true then
EDT_servico_avaria=Qry_select_observacoes_ordem_reparacao.recepcao_servico
EDT_observacao=Qry_select_observacoes_ordem_reparacao.recepcao_obs
EDT_historico_estado=Qry_select_observacoes_ordem_reparacao.reparacao_estado_historico
STC_matricula=Qry_select_observacoes_ordem_reparacao.matricula
END
HCancelDeclaration(Qry_select_observacoes_ordem_reparacao)
Qry_select_tempos_ordem_reparacao is data source
query="SELECT tempos_reparacao.numero AS numero,tempos_reparacao.mecanico AS mecanico,tempos_reparacao.inicio AS inicio,tempos_reparacao.fim AS fim,tempos_reparacao.Inicio_reparacao_estado AS Inicio_reparacao_estado,"
query=query+"tempos_reparacao.fim_reparacao_estado AS fim_reparacao_estado,mecanicos.Codigo AS Codigo,mecanicos.Descricao AS Descricao FROM mecanicos,tempos_reparacao "
query=query+" WHERE mecanicos.Codigo = tempos_reparacao.mecanico AND (tempos_reparacao.numero ='"+numero_ordem_reparacao+"')"
HExecuteSQLQuery(Qry_select_tempos_ordem_reparacao,hQueryDefault,Query)
gsTotal is string="00:00"
for each Qry_select_tempos_ordem_reparacao
dtini is datetime = Qry_select_tempos_ordem_reparacao.inicio
dtfim is datetime = Qry_select_tempos_ordem_reparacao.fim
if dtfim="00000000000000000" then
tableaddline(TABLE_Tempos,Qry_select_tempos_ordem_reparacao.descricao,Qry_select_tempos_ordem_reparacao.inicio,dtfim,"")
else
gsDiferenca is string=Intervalo_datas_para_horas(dtini,dtfim)
TableAddLine(TABLE_Tempos,Qry_select_tempos_ordem_reparacao.descricao,Qry_select_tempos_ordem_reparacao.inicio,Qry_select_tempos_ordem_reparacao.fim,gsDiferenca)
gsTotal=soma_horas(gsTotal,gsDiferenca)
END
END
HCancelDeclaration(Qry_select_tempos_ordem_reparacao)
STC_total="Total: "+gsTotal
gxExtra is numeric
gxTotal_material is numeric
Qry_select_materiais_ordem_reparacao is data source
Query="SELECT material_reparacao.numero AS numero,material_reparacao.lancado as lancado,material_reparacao.mecanico AS mecanico,material_reparacao.artigo AS artigo,material_reparacao.descricao_artigo AS descricao_artigo,material_reparacao.quantidade AS quantidade,"
query=query+"material_reparacao.data_hora AS data_hora,material_reparacao.reparacao_estado AS reparacao_estado,material_reparacao.extra AS extra,material_reparacao.preco AS preco "
Query=Query+" FROM material_reparacao WHERE material_reparacao.numero ='"+numero_ordem_reparacao+"' order by data_hora asc"
HExecuteSQLQuery(Qry_select_materiais_ordem_reparacao,hQueryDefault,Query)
FOR EACH Qry_select_materiais_ordem_reparacao
if Qry_select_materiais_ordem_reparacao.extra=0 then
gxTotal_material=gxTotal_material+(Qry_select_materiais_ordem_reparacao.preco*Qry_select_materiais_ordem_reparacao.quantidade)
else
gxExtra=gxExtra+(Qry_select_materiais_ordem_reparacao.preco*Qry_select_materiais_ordem_reparacao.quantidade)
end
tableaddline(TABLE_materiais,Qry_select_materiais_ordem_reparacao.data_hora,Qry_select_materiais_ordem_reparacao.artigo,Qry_select_materiais_ordem_reparacao.descricao_artigo,Qry_select_materiais_ordem_reparacao.quantidade,Qry_select_materiais_ordem_reparacao.preco,Qry_select_materiais_ordem_reparacao.lancado,Qry_select_materiais_ordem_reparacao.extra)
END
STC_total_material="Extras: "+NumToString(gxExtra,".2f")+"    "+"Total: "+NumToString(gxTotal_material,".2f")+"    "+"Total c/iva: "+numtostring(gxTotal_material*1.23,".2f")
HCancelDeclaration(Qry_select_materiais_ordem_reparacao)
```

### SRC-2ffa4ede18 — WIN_Table_Tempos_materiais_Descricoes [Intervalo_datas_para_horas]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1090-1107`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE Intervalo_datas_para_horas(StartDate is DateTime,EndDate is DateTime); MyDuration is Duration = EndDate - StartDate; nParteDecimal is numeric = DecimalPart(MyDuration..InHours); nMinutos is numeric  = RoundUp((nParteDecimal * 59.99999999999)/0.99999999999999,0); RESULT NumToString(IntegerPart(MyDuration..InHours),"02d")+":"+NumToString(nMinutos,"02d"). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-2ffa4ede18.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE Intervalo_datas_para_horas(StartDate is DateTime,EndDate is DateTime)
MyDuration is Duration = EndDate - StartDate
nParteDecimal is numeric = DecimalPart(MyDuration..InHours)
nMinutos is numeric  = RoundUp((nParteDecimal * 59.99999999999)/0.99999999999999,0)
RESULT NumToString(IntegerPart(MyDuration..InHours),"02d")+":"+NumToString(nMinutos,"02d")
```

### SRC-be7f7c9b10 — WIN_Table_Tempos_materiais_Descricoes [soma_horas]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1114-1141`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE soma_horas(hora_ini, hora_soma); nHoraIni is int = Val(Middle(hora_ini,1,Position(hora_ini,":",1,FromBeginning)-1)); nMinutosIni is int = Val(Middle(hora_ini,Position(hora_ini,":",1,FromBeginning)+1,2)); nHoraSoma is int = Val(Middle(hora_soma,1,Position(hora_soma,":",1,FromBeginning)-1)); nMinutosSoma is int = Val(Middle(hora_soma,Position(hora_soma,":",1,FromBeginning)+1,2)); nMinutosIni = nMinutosIni + nMinutosSoma; IF nMinutosIni>=60 THEN; nHoraIni = nHoraIni + 1; nMinutosIni = nMinutosIni - 60; nHoraIni = nHoraIni + nHoraSoma; RESULT NumToString(nHoraIni, "02d")+":"+NumToString(nMinutosIni, "02d"). Authoritative exact branch ledger: docs/mapping/WIN_Table_Tempos_materiais_Descricoes.md under SRC-be7f7c9b10.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE soma_horas(hora_ini, hora_soma)
nHoraIni is int = Val(Middle(hora_ini,1,Position(hora_ini,":",1,FromBeginning)-1))
nMinutosIni is int = Val(Middle(hora_ini,Position(hora_ini,":",1,FromBeginning)+1,2))
nHoraSoma is int = Val(Middle(hora_soma,1,Position(hora_soma,":",1,FromBeginning)-1))
nMinutosSoma is int = Val(Middle(hora_soma,Position(hora_soma,":",1,FromBeginning)+1,2))
nMinutosIni = nMinutosIni + nMinutosSoma
IF nMinutosIni>=60 THEN
nHoraIni = nHoraIni + 1
nMinutosIni = nMinutosIni - 60
END
nHoraIni = nHoraIni + nHoraSoma
RESULT NumToString(nHoraIni, "02d")+":"+NumToString(nMinutosIni, "02d")
```

### SRC-979f85ef96 — WIN_Table_Tempos_materiais_Descricoes/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-7bd9aaab79 — WIN_Table_Tempos_materiais_Descricoes/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-5bde38ffcf — WIN_Table_Tempos_materiais_Descricoes/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

## Data dependencies

- HReadFirst: `dsQry_select_Estado_Rep` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:733`; `Qry_select_observacoes_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1010`.
- HCancelDeclaration: `dsQry_select_Estado_Rep` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:736`; `dsQry_select_Estado_Rep` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:742`; `Qry_select_materiais_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:767`; `Qry_select_observacoes_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1016`; `Qry_select_tempos_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1035`; `Qry_select_materiais_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1054`.
- HExecuteSQLQuery: `dsQry_select_Estado_Rep` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:732`; `Qry_select_materiais_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:757`; `Qry_update_materiais_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:967`; `Qry_select_observacoes_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1009`; `Qry_select_tempos_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1022`; `Qry_select_materiais_ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:1044`.
- HReadSeek: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:722`.
- HOnError: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:721`.
- HUnlockRecNum: `ordem_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:748`.

## Behavior checklist

- Open and native keyboard: U-WBBC9D9-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-WBBC9D9-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-WBBC9D9-03.
- Explicit message/resource shell outcomes: U-WBBC9D9-04.
- Actual field/mask/type boundaries: U-WBBC9D9-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-WBBC9D9-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-WBBC9D9-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_Tempos, TABLE_materiais; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-WBBC9D9-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HErrorLock, HExecuteSQLQuery, HLockRecNum, HOnError, HReadSeek, HRecNum, HUnlockRecNum, hreadfirst; failed or partial writes in the actual save/update blocks; lock acquisition/error paths and explicit unlock omissions. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-WBBC9D9-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-WBBC9D9-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

11/11 blocks; 3/3 encoded-only slots retained; 54 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:493`; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:495`; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:496`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1352`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1355`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1196`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1199`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Table_Tempos_materiais_Descricoes.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Table_Tempos_materiais_Descricoes.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Table_Tempos_materiais_Descricoes.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Table_Tempos_materiais_Descricoes.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:527`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:530`
