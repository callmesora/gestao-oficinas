# Mapping — WIN_Material_reparacao_form

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw`; designer `dossier: WIN_Material_reparacao_form`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Edit materials in memory and save on exit.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:500 (Open in WIN_Material_Reparacao)`
```wlanguage
RETURN
else
Open(WIN_Material_reparacao_form,numero_ordem_rep)
end
ELSE
Open(WIN_Material_reparacao_form,numero_ordem_rep)
```
- `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:503 (Open in WIN_Material_Reparacao)`
```wlanguage
end
ELSE
Open(WIN_Material_reparacao_form,numero_ordem_rep)
END
CASE NotFound
Open(WIN_Material_reparacao_form,numero_ordem_rep)
```
- `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:506 (Open in WIN_Material_Reparacao)`
```wlanguage
END
CASE NotFound
Open(WIN_Material_reparacao_form,numero_ordem_rep)
END
end
ELSE
```
- `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:740 (Open in WIN_Table_Tempos_materiais_Descricoes)`
```wlanguage
end
nUmero_ord_rep is int=numero_ordem_reparacao
Open(WIN_Material_reparacao_form,nUmero_ord_rep)
END
HCancelDeclaration(dsQry_select_Estado_Rep)
END
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Load order/vehicle/mechanic/existing rows; qty1,authenticated mechanic blank. Mechanic selector rejects inactive and prompts password unless active. Add requires article and authenticated mechanic; appends timestamp,mechanic,article,description,qty,current price,lancado=false; resets editor and focus. Article exit searches barcode first then code. Launched rows reject edit/delete. Cancel clears editor only. Sair/system close restores stock for old rows, deletes all order materials, reinserts memory rows and subtracts quantities. Example stock10 oldqty2 newqty3 =>9. No transaction/checked returns. Reader path lacks Add inactive guard. Scale fonts/row height by800x600 and subsequent resize ratios.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw` exact event locations below; `dossier: WIN_Material_reparacao_form/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-b4bc3b0b62 — WIN_Material_reparacao_form/SCSystemButtons/BTN_SYST_FERMER

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:141-141`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: ExecuteProcess(btn_sair,trtClick). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-b4bc3b0b62.

HFSQL: none in this block.

Other calls: ExecuteProcess(btn_sair).

Exact executable branch/assignment ledger:
```wlanguage
ExecuteProcess(btn_sair,trtClick)
```

### SRC-08f76d0b2c — WIN_Material_reparacao_form/BTN_NoName1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:284-308`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: sMecanico is string; sMecanico=open(WIN_Table_mecanicos,true,""); if sMecanico<>"" then; HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,sMecanico); hreadfirst(QRY_select_mecanicos_codigo); if QRY_select_mecanicos_codigo.inativo=true then; info("Mecânico inativo"); IF QRY_select_mecanicos_codigo.Codigo=gsMecanico_ativo THEN; EDT_mecanico=QRY_select_mecanicos_codigo.Descricao; sPassword is string; sPassword=Open(WIN_Inserir_quantidade_password,"password",""); IF sPassword<>"" THEN; IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN; gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo; EDT_mecanico=QRY_select_mecanicos_codigo.Descricao; Info("Palavra-passe incorreta"); HCancelDeclaration(QRY_select_mecanicos_codigo). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-08f76d0b2c.

HFSQL: HExecuteQuery(QRY_select_mecanicos_codigo); HReadFirst(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo).

Other calls: Info("Mecânico inativo"); Info("Palavra-passe incorreta"); Open(WIN_Table_mecanicos); Open(WIN_Inserir_quantidade_password).

Exact executable branch/assignment ledger:
```wlanguage
sMecanico is string
sMecanico=open(WIN_Table_mecanicos,true,"")
if sMecanico<>"" then
HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,sMecanico)
hreadfirst(QRY_select_mecanicos_codigo)
if QRY_select_mecanicos_codigo.inativo=true then
info("Mecânico inativo")
else
IF QRY_select_mecanicos_codigo.Codigo=gsMecanico_ativo THEN
EDT_mecanico=QRY_select_mecanicos_codigo.Descricao
ELSE
sPassword is string
sPassword=Open(WIN_Inserir_quantidade_password,"password","")
IF sPassword<>"" THEN
IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN
gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo
EDT_mecanico=QRY_select_mecanicos_codigo.Descricao
ELSE
Info("Palavra-passe incorreta")
END
END
END
END
HCancelDeclaration(QRY_select_mecanicos_codigo)
END
```

### SRC-da40931006 — WIN_Material_reparacao_form/EDT_quant

Event `66049`: Left button down; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:602-609`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button down [66049]: Comment-only block; no active statement. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-7d83c5a509. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-da40931006.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
// No executable statement.
```

### SRC-4703c55bdf — WIN_Material_reparacao_form/EDT_artigo

Event `16`: Exit; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:660-660`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Exit [16]: verificar_Artigo(). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-4703c55bdf.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
verificar_Artigo()
```

### SRC-7d83c5a509 — WIN_Material_reparacao_form/EDT_artigo

Event `66049`: Left button down; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:677-684`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button down [66049]: Comment-only block; no active statement. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-7d83c5a509. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-da40931006.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
// No executable statement.
```

### SRC-3e86653214 — WIN_Material_reparacao_form/BTN_NoName2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:701-712`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: sArtigo is string; sArtigo=open(WIN_Table_artigos,true,EDT_artigo); if sArtigo<>"" then; EDT_artigo=sArtigo; query is string; query="select * from artigos where codigo='"+sArtigo+"'"; Qry_select_artigo_codigo is data source; HExecuteSQLQuery(Qry_select_artigo_codigo,hQueryDefault,query); hreadfirst(Qry_select_artigo_codigo); EDT_artigo_descricao=Qry_select_artigo_codigo.descricao; HCancelDeclaration(Qry_select_artigo_codigo). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-3e86653214.

HFSQL: HReadFirst(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigo); HExecuteSQLQuery(Qry_select_artigo_codigo).

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
sArtigo is string
sArtigo=open(WIN_Table_artigos,true,EDT_artigo)
if sArtigo<>"" then
EDT_artigo=sArtigo
query is string
query="select * from artigos where codigo='"+sArtigo+"'"
Qry_select_artigo_codigo is data source
HExecuteSQLQuery(Qry_select_artigo_codigo,hQueryDefault,query)
hreadfirst(Qry_select_artigo_codigo)
EDT_artigo_descricao=Qry_select_artigo_codigo.descricao
HCancelDeclaration(Qry_select_artigo_codigo)
END
```

### SRC-24e17a93a6 — WIN_Material_reparacao_form/BTN_Adicionar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:758-795`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if EDT_artigo="" then return; if gsMecanico_ativo="" then; HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.reparacao_mecanico); HReadFirst(QRY_select_mecanicos_codigo); if QRY_select_mecanicos_codigo.inativo=true then; Info("Mecânico inativo"); HCancelDeclaration(QRY_select_mecanicos_codigo); RETURN; sPassword is string; sPassword=Open(WIN_Inserir_quantidade_password,"password",""); IF sPassword<>"" THEN; IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN; gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo; EDT_mecanico=QRY_select_mecanicos_codigo.Descricao; HCancelDeclaration(QRY_select_mecanicos_codigo); Info("Palavra-passe incorreta"); HCancelDeclaration(QRY_select_mecanicos_codigo); RETURN; HCancelDeclaration(QRY_select_mecanicos_codigo); return; query is string; query="select * from artigos where codigo='"+EDT_artigo+"'"; Qry_select_artigo_codigo is data source; HExecuteSQLQuery(Qry_select_artigo_codigo,hQueryDefault,query); hreadfirst(Qry_select_artigo_codigo); tableaddline(TABLE_material,SysDateTime(),gsMecanico_ativo,EDT_mecanico,EDT_artigo,EDT_artigo_descricao,EDT_quant,Qry_select_artigo_codigo.preco,False); HCancelDeclaration(Qry_select_artigo_codigo); EDT_artigo=""; EDT_artigo_descricao=""; EDT_quant=1; TableSelectPlus(TABLE_material,tablecount(TABLE_material)); SetFocus(EDT_artigo). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-24e17a93a6.

HFSQL: HExecuteQuery(QRY_select_mecanicos_codigo); HReadFirst(QRY_select_mecanicos_codigo); HReadFirst(Qry_select_artigo_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(Qry_select_artigo_codigo); HExecuteSQLQuery(Qry_select_artigo_codigo).

Other calls: Info("Mecânico inativo"); Info("Palavra-passe incorreta"); Open(WIN_Inserir_quantidade_password); SetFocus(EDT_artigo).

Exact executable branch/assignment ledger:
```wlanguage
if EDT_artigo="" then return
if gsMecanico_ativo="" then
HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.reparacao_mecanico)
HReadFirst(QRY_select_mecanicos_codigo)
if QRY_select_mecanicos_codigo.inativo=true then
Info("Mecânico inativo")
HCancelDeclaration(QRY_select_mecanicos_codigo)
RETURN
END
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
End
else
HCancelDeclaration(QRY_select_mecanicos_codigo)
return
END
END
query is string
query="select * from artigos where codigo='"+EDT_artigo+"'"
Qry_select_artigo_codigo is data source
HExecuteSQLQuery(Qry_select_artigo_codigo,hQueryDefault,query)
hreadfirst(Qry_select_artigo_codigo)
tableaddline(TABLE_material,SysDateTime(),gsMecanico_ativo,EDT_mecanico,EDT_artigo,EDT_artigo_descricao,EDT_quant,Qry_select_artigo_codigo.preco,False)
HCancelDeclaration(Qry_select_artigo_codigo)
EDT_artigo=""
EDT_artigo_descricao=""
EDT_quant=1
TableSelectPlus(TABLE_material,tablecount(TABLE_material))
SetFocus(EDT_artigo)
```

### SRC-f6ac86e246 — WIN_Material_reparacao_form/BTN_Cancelar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:819-821`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_quant=1; EDT_artigo=""; EDT_artigo_descricao="". Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-f6ac86e246.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
EDT_quant=1
EDT_artigo=""
EDT_artigo_descricao=""
```

### SRC-eb5a859599 — WIN_Material_reparacao_form/BTN_Sair

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:845-884`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: sQuery is string; stock is numeric; sQuery="select * from material_reparacao where numero='"+numero_ordem_reparacao+"'"; dsQry_select_material_reparacao is data source; HExecuteSQLQuery(dsQry_select_material_reparacao,hQueryDefault,sQuery); for each dsQry_select_material_reparacao; hreadseek(artigos,codigo,dsQry_select_material_reparacao.artigo,hIdentical); if hfound(artigos)=true then; stock=artigos.stock+dsQry_select_material_reparacao.quantidade; artigos.stock=stock; HModify(artigos); HCancelDeclaration(dsQry_select_material_reparacao); sQuery="delete from material_reparacao where numero='"+numero_ordem_reparacao+"'"; dsQry_delete_material_reparacao is data source; HExecuteSQLQuery(dsQry_delete_material_reparacao,hQueryDefault,sQuery); for EACH row of TABLE_material; QRY_insert_material_reparacao.ParamArtigo=TABLE_material.COL_codigo_artigo; QRY_insert_material_reparacao.ParamDataHora=TABLE_material.COL_data_hora; QRY_insert_material_reparacao.ParamDescricaoArtigo=TABLE_material.COL_descricao_artigo; QRY_insert_material_reparacao.ParamMecanico=TABLE_material.COL_mecanico_codigo; QRY_insert_material_reparacao.ParamNumero=numero_ordem_reparacao; QRY_insert_material_reparacao.Param. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-eb5a859599.

HFSQL: HExecuteQuery(QRY_insert_material_reparacao); HCancelDeclaration(dsQry_select_material_reparacao); HCancelDeclaration(QRY_select_ordens_reparacao_numero); HExecuteSQLQuery(dsQry_select_material_reparacao); HExecuteSQLQuery(dsQry_delete_material_reparacao); HReadSeek(artigos); HReadSeek(artigos); HFound(artigos); HFound(artigos); HModify(artigos); HModify(artigos).

Other calls: Close(WIN_Material_reparacao_form).

Exact executable branch/assignment ledger:
```wlanguage
sQuery is string
stock is numeric
sQuery="select * from material_reparacao where numero='"+numero_ordem_reparacao+"'"
dsQry_select_material_reparacao is data source
HExecuteSQLQuery(dsQry_select_material_reparacao,hQueryDefault,sQuery)
for each dsQry_select_material_reparacao
hreadseek(artigos,codigo,dsQry_select_material_reparacao.artigo,hIdentical)
if hfound(artigos)=true then
stock=artigos.stock+dsQry_select_material_reparacao.quantidade
artigos.stock=stock
HModify(artigos)
END
END
HCancelDeclaration(dsQry_select_material_reparacao)
sQuery="delete from material_reparacao where numero='"+numero_ordem_reparacao+"'"
dsQry_delete_material_reparacao is data source
HExecuteSQLQuery(dsQry_delete_material_reparacao,hQueryDefault,sQuery)
for EACH row of TABLE_material
QRY_insert_material_reparacao.ParamArtigo=TABLE_material.COL_codigo_artigo
QRY_insert_material_reparacao.ParamDataHora=TABLE_material.COL_data_hora
QRY_insert_material_reparacao.ParamDescricaoArtigo=TABLE_material.COL_descricao_artigo
QRY_insert_material_reparacao.ParamMecanico=TABLE_material.COL_mecanico_codigo
QRY_insert_material_reparacao.ParamNumero=numero_ordem_reparacao
QRY_insert_material_reparacao.ParamPreco=TABLE_material.COL_preco
QRY_insert_material_reparacao.ParamQuantidade=TABLE_material.COL_quant
QRY_insert_material_reparacao.ParamReparacaoEstado=QRY_select_ordens_reparacao_numero.reparacao_estado
QRY_insert_material_reparacao.ParamLancado=TABLE_material.COL_Lancado
HExecuteQuery(QRY_insert_material_reparacao,hQueryDefault)
hreadseek(artigos,Codigo,TABLE_material.COL_codigo_artigo,hIdentical)
if hfound(artigos)=true then
stock=artigos.stock-TABLE_material.COL_quant
artigos.stock=stock
hmodify(artigos)
END
END
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
close(WIN_Material_reparacao_form)
```

### SRC-88600ec880 — WIN_Material_reparacao_form/BTN_Leitor

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:908-947`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF gsMecanico_ativo="" THEN; HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.reparacao_mecanico); HReadFirst(QRY_select_mecanicos_codigo); sPassword is string; sPassword=Open(WIN_Inserir_quantidade_password,"password",""); IF sPassword<>"" THEN; IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN; gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo; EDT_mecanico=QRY_select_mecanicos_codigo.Descricao; HCancelDeclaration(QRY_select_mecanicos_codigo); Info("Palavra-passe incorreta"); HCancelDeclaration(QRY_select_mecanicos_codigo); RETURN; HCancelDeclaration(QRY_select_mecanicos_codigo); RETURN; IF Open(WIN_leitor_cod_barras)<>"fechou" THEN; FOR EACH {"conhecidos"}; TableAddLine(TABLE_material,SysDateTime(),gsMecanico_ativo,EDT_mecanico,{"conhecidos.codartigo"},{"conhecidos.descricao"},{"conhecidos.quantidade"},{"conhecidos.preco"},false); HCancelDeclaration({"conhecidos"}); RETURN; h is int=0; FOR EACH {"desconhecidos"}; h=h+1; IF h>0 THEN; Open(WIN_Leitor_cod_barras_desconhecidos); HCancelDeclaration({"desconhecidos"}); HCancelDeclaration({"desconhecidos"}). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-88600ec880.

HFSQL: HExecuteQuery(QRY_select_mecanicos_codigo); HReadFirst(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration({"conhecidos"}); HCancelDeclaration({"desconhecidos"}); HCancelDeclaration({"desconhecidos"}).

Other calls: Info("Palavra-passe incorreta"); Open(WIN_Inserir_quantidade_password); Open(WIN_leitor_cod_barras); Open(WIN_Leitor_cod_barras_desconhecidos).

Exact executable branch/assignment ledger:
```wlanguage
IF gsMecanico_ativo="" THEN
HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.reparacao_mecanico)
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
HCancelDeclaration(QRY_select_mecanicos_codigo)
RETURN
END
END
IF Open(WIN_leitor_cod_barras)<>"fechou" THEN
FOR EACH {"conhecidos"}
TableAddLine(TABLE_material,SysDateTime(),gsMecanico_ativo,EDT_mecanico,{"conhecidos.codartigo"},{"conhecidos.descricao"},{"conhecidos.quantidade"},{"conhecidos.preco"},false)
END
HCancelDeclaration({"conhecidos"})
ELSE
RETURN
END
h is int=0
FOR EACH {"desconhecidos"}
h=h+1
END
IF h>0 THEN
Open(WIN_Leitor_cod_barras_desconhecidos)
HCancelDeclaration({"desconhecidos"})
ELSE
HCancelDeclaration({"desconhecidos"})
END
```

### SRC-f7457e6a1c — WIN_Material_reparacao_form/BTN_Quantidade

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:971-979`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if TABLE_material=-1 then return; IF TABLE_material.COL_Lancado=True THEN; Info("Artigo já lançado, não pode ser alterado"); RETURN; Quantidade is numeric; Quantidade=TABLE_material.COL_quant; Quantidade=open(WIN_Inserir_quantidade_password,"quantidade",Quantidade); TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,TABLE_material.COL_descricao_artigo,Quantidade,TABLE_material.COL_preco,false). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-f7457e6a1c.

HFSQL: none in this block.

Other calls: Info("Artigo já lançado, não pode ser alterado"); Open(WIN_Inserir_quantidade_password).

Exact executable branch/assignment ledger:
```wlanguage
if TABLE_material=-1 then return
IF TABLE_material.COL_Lancado=True THEN
Info("Artigo já lançado, não pode ser alterado")
RETURN
END
Quantidade is numeric
Quantidade=TABLE_material.COL_quant
Quantidade=open(WIN_Inserir_quantidade_password,"quantidade",Quantidade)
TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,TABLE_material.COL_descricao_artigo,Quantidade,TABLE_material.COL_preco,false)
```

### SRC-199720cd56 — WIN_Material_reparacao_form/BTN_Eliminar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1003-1012`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_material) = -1 THEN RETURN; if TABLE_material.COL_Lancado=true then; info("Artigo já lançado, não pode ser eliminado"); return; SWITCH Dialog(<§?173B299C07B77A03§>); CASE 1; TableDelete(TABLE_material); CASE 2. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-199720cd56.

HFSQL: none in this block.

Other calls: Info("Artigo já lançado, não pode ser eliminado"); TableSelect(TABLE_material); Dialog(<§?173B299C07B77A03§>); TableDelete(TABLE_material).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_material) = -1 THEN RETURN
if TABLE_material.COL_Lancado=true then
info("Artigo já lançado, não pode ser eliminado")
return
END
SWITCH Dialog(<§?173B299C07B77A03§>)
CASE 1
TableDelete(TABLE_material)
CASE 2
END
```

### SRC-89e26eed26 — WIN_Material_reparacao_form/BTN_anterior

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1036-1038`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_material)>1 THEN; TABLE_material=TableSelect(TABLE_material)-1. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-89e26eed26.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_material); TableSelect(TABLE_material).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_material)>1 THEN
TABLE_material=TableSelect(TABLE_material)-1
END
```

### SRC-d38bb48866 — WIN_Material_reparacao_form/BTN_seguinte

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1062-1064`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_material)<TableCount(TABLE_material) THEN; TABLE_material=TableSelect(TABLE_material)+1. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-d38bb48866.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_material); TableSelect(TABLE_material).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_material)<TableCount(TABLE_material) THEN
TABLE_material=TableSelect(TABLE_material)+1
END
```

### SRC-0f727cefd6 — WIN_Material_reparacao_form/BTN_Preço

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1088-1096`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if TABLE_material=-1 then return; IF TABLE_material.COL_Lancado=True THEN; Info("Artigo já lançado, não pode ser alterado"); RETURN; preco is numeric; preco=TABLE_material.COL_preco; preco=open(WIN_Inserir_quantidade_password,"preco",preco); TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,TABLE_material.COL_descricao_artigo,TABLE_material.COL_quant,preco,false). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-0f727cefd6.

HFSQL: none in this block.

Other calls: Info("Artigo já lançado, não pode ser alterado"); Open(WIN_Inserir_quantidade_password).

Exact executable branch/assignment ledger:
```wlanguage
if TABLE_material=-1 then return
IF TABLE_material.COL_Lancado=True THEN
Info("Artigo já lançado, não pode ser alterado")
RETURN
END
preco is numeric
preco=TABLE_material.COL_preco
preco=open(WIN_Inserir_quantidade_password,"preco",preco)
TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,TABLE_material.COL_descricao_artigo,TABLE_material.COL_quant,preco,false)
```

### SRC-ca66909c26 — WIN_Material_reparacao_form/BTN_Descricao

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1120-1127`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if TABLE_material=-1 then return; IF TABLE_material.COL_Lancado=True THEN; Info("Artigo já lançado, não pode ser alterado"); RETURN; descricao is string=TABLE_material.COL_descricao_artigo; descricao=open(WIN_Inserir_quantidade_password,"descricao",descricao); TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,descricao,TABLE_material.COL_quant,TABLE_material.COL_preco,false). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-ca66909c26.

HFSQL: none in this block.

Other calls: Info("Artigo já lançado, não pode ser alterado"); Open(WIN_Inserir_quantidade_password).

Exact executable branch/assignment ledger:
```wlanguage
if TABLE_material=-1 then return
IF TABLE_material.COL_Lancado=True THEN
Info("Artigo já lançado, não pode ser alterado")
RETURN
END
descricao is string=TABLE_material.COL_descricao_artigo
descricao=open(WIN_Inserir_quantidade_password,"descricao",descricao)
TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,descricao,TABLE_material.COL_quant,TABLE_material.COL_preco,false)
```

### SRC-ccd6dd9cc2 — WIN_Material_reparacao_form [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1149-1208`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(numero_ordem_reparacao is int); lTeclado is boolean =true; gsMecanico_ativo is string; HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero_ordem_reparacao); hreadfirst(QRY_select_ordens_reparacao_numero); EDT_matricula=QRY_select_ordens_reparacao_numero.matricula; hreadseek(mecanicos,Codigo,QRY_select_ordens_reparacao_numero.reparacao_mecanico,hIdentical); if hfound(mecanicos)=true then; EDT_mecanico=mecanicos.Descricao; hreadseek(Viaturas,matricula,EDT_matricula,hIdentical); if hfound(Viaturas)=true then; EDT_marca_modelo=Viaturas.marca+" "+Viaturas.modelo; HExecuteQuery(QRY_select_material_reparacao,hQueryDefault,numero_ordem_reparacao); hreadfirst(QRY_select_material_reparacao); for each QRY_select_material_reparacao; HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_material_reparacao.mecanico); hreadfirst(QRY_select_mecanicos_codigo); tableaddline(table_material,QRY_select_material_reparacao.data_hora,QRY_select_material_reparacao.mecanico,QRY_select_mecanicos_codigo.Descricao,QRY_select_material_reparacao.artigo,QRY_select_material_reparacao.descricao_artigo,QRY_select_material_reparacao.quantidade,QRY_select_material_repa. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-ccd6dd9cc2.

HFSQL: HExecuteQuery(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_material_reparacao); HExecuteQuery(QRY_select_mecanicos_codigo); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(QRY_select_material_reparacao); HReadFirst(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_mecanicos_codigo); HCancelDeclaration(QRY_select_material_reparacao); HReadSeek(mecanicos); HReadSeek(Viaturas); HFound(mecanicos); HFound(Viaturas).

Other calls: TableDisplay(TABLE_material).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(numero_ordem_reparacao is int)
lTeclado is boolean =true
gsMecanico_ativo is string
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero_ordem_reparacao)
hreadfirst(QRY_select_ordens_reparacao_numero)
EDT_matricula=QRY_select_ordens_reparacao_numero.matricula
hreadseek(mecanicos,Codigo,QRY_select_ordens_reparacao_numero.reparacao_mecanico,hIdentical)
if hfound(mecanicos)=true then
EDT_mecanico=mecanicos.Descricao
END
hreadseek(Viaturas,matricula,EDT_matricula,hIdentical)
if hfound(Viaturas)=true then
EDT_marca_modelo=Viaturas.marca+" "+Viaturas.modelo
END
HExecuteQuery(QRY_select_material_reparacao,hQueryDefault,numero_ordem_reparacao)
hreadfirst(QRY_select_material_reparacao)
for each QRY_select_material_reparacao
HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,QRY_select_material_reparacao.mecanico)
hreadfirst(QRY_select_mecanicos_codigo)
tableaddline(table_material,QRY_select_material_reparacao.data_hora,QRY_select_material_reparacao.mecanico,QRY_select_mecanicos_codigo.Descricao,QRY_select_material_reparacao.artigo,QRY_select_material_reparacao.descricao_artigo,QRY_select_material_reparacao.quantidade,QRY_select_material_reparacao.preco,QRY_select_material_reparacao.lancado)
HCancelDeclaration(QRY_select_mecanicos_codigo)
end
EDT_quant=1
TableDisplay(TABLE_material)
HCancelDeclaration(QRY_select_material_reparacao)
grRacioaltura is numeric=myself..Height/600
grRaciolargura is numeric=myself..Width/800
grAltura_atual is numeric=myself..Height
grLargura_atual is numeric=myself..Width
STC_Artigo..FontSize=STC_Artigo..FontSize*grRaciolargura
STC_Mecanico..FontSize=STC_Mecanico..FontSize*grRaciolargura
STC_Quant..FontSize=STC_Quant..FontSize*grRaciolargura
STC_Viatura..FontSize=STC_Viatura..FontSize*grRaciolargura
TABLE_material..LineHeight=TABLE_material..LineHeight*grRacioaltura
EDT_matricula..FontSize=EDT_matricula..FontSize*grRaciolargura
EDT_marca_modelo..FontSize=EDT_marca_modelo..FontSize*grRaciolargura
EDT_mecanico..FontSize=EDT_mecanico..FontSize*grRaciolargura
EDT_quant..FontSize=EDT_quant..FontSize*grRaciolargura
EDT_artigo..FontSize=EDT_artigo..FontSize*grRaciolargura
EDT_artigo_descricao..FontSize=EDT_artigo_descricao..FontSize*grRaciolargura
BTN_NoName1..FontSize=BTN_NoName1..FontSize*grRaciolargura
BTN_NoName2..FontSize=BTN_NoName2..FontSize*grRaciolargura
BTN_Sair..FontSize=BTN_Sair..FontSize*grRaciolargura
BTN_Adicionar..FontSize=BTN_Adicionar..FontSize*grRaciolargura
BTN_Cancelar..FontSize=BTN_Cancelar..FontSize*grRaciolargura
BTN_Eliminar..FontSize=BTN_Eliminar..FontSize*grRaciolargura
BTN_seguinte..FontSize=BTN_seguinte..FontSize*grRaciolargura
BTN_anterior..FontSize=BTN_anterior..FontSize*grRaciolargura
BTN_Leitor..FontSize=BTN_Leitor..FontSize*grRaciolargura
BTN_Quantidade..FontSize=BTN_Quantidade..FontSize*grRaciolargura
TABLE_material.COL_data_hora..FontSize=TABLE_material.COL_data_hora..FontSize*grRaciolargura
TABLE_material.COL_mecanico_descricao..FontSize=TABLE_material.COL_mecanico_descricao..FontSize*grRaciolargura
TABLE_material.COL_descricao_artigo..FontSize=TABLE_material.COL_descricao_artigo..FontSize*grRaciolargura
TABLE_material.COL_quant..FontSize=TABLE_material.COL_quant..FontSize*grRaciolargura
TABLE_material.COL_preco..FontSize=TABLE_material.COL_preco..FontSize*grRaciolargura
```

### SRC-26f61f6bf0 — WIN_Material_reparacao_form

Event `13`: Resize; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1240-1266`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Resize [13]: grRacioaltura=myself..Height/grAltura_atual; grRaciolargura=myself..Width/grLargura_atual; STC_Artigo..FontSize=STC_Artigo..FontSize*grRaciolargura; STC_Mecanico..FontSize=STC_Mecanico..FontSize*grRaciolargura; STC_Quant..FontSize=STC_Quant..FontSize*grRaciolargura; STC_Viatura..FontSize=STC_Viatura..FontSize*grRaciolargura; TABLE_material..LineHeight=TABLE_material..LineHeight*grRacioaltura; EDT_matricula..FontSize=EDT_matricula..FontSize*grRaciolargura; EDT_marca_modelo..FontSize=EDT_marca_modelo..FontSize*grRaciolargura; EDT_mecanico..FontSize=EDT_mecanico..FontSize*grRaciolargura; EDT_quant..FontSize=EDT_quant..FontSize*grRaciolargura; EDT_artigo..FontSize=EDT_artigo..FontSize*grRaciolargura; EDT_artigo_descricao..FontSize=EDT_artigo_descricao..FontSize*grRaciolargura; BTN_NoName1..FontSize=BTN_NoName1..FontSize*grRaciolargura; BTN_NoName2..FontSize=BTN_NoName2..FontSize*grRaciolargura; BTN_Sair..FontSize=BTN_Sair..FontSize*grRaciolargura; BTN_Adicionar..FontSize=BTN_Adicionar..FontSize*grRaciolargura; BTN_Cancelar..FontSize=BTN_Cancelar..FontSize*grRaciolargura; BTN_Eliminar..FontSize=BTN_Eliminar..FontSize*grRaciolargura; BTN_Leitor..FontSize=BTN_Leitor..FontSize*grRaciolargura; BTN_seguinte..FontSize=BTN_seguinte..FontSize*grRaciolargura; BTN_anterior..FontSize=BTN_anterior..FontSize*grRaciolargura; BTN_Quantidade..FontSize=BTN_Quantidade..FontSize*grRaciolargura; grAltura_atual=myself..Height; grLargura_atual=myself..Width. Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-26f61f6bf0.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
grRacioaltura=myself..Height/grAltura_atual
grRaciolargura=myself..Width/grLargura_atual
STC_Artigo..FontSize=STC_Artigo..FontSize*grRaciolargura
STC_Mecanico..FontSize=STC_Mecanico..FontSize*grRaciolargura
STC_Quant..FontSize=STC_Quant..FontSize*grRaciolargura
STC_Viatura..FontSize=STC_Viatura..FontSize*grRaciolargura
TABLE_material..LineHeight=TABLE_material..LineHeight*grRacioaltura
EDT_matricula..FontSize=EDT_matricula..FontSize*grRaciolargura
EDT_marca_modelo..FontSize=EDT_marca_modelo..FontSize*grRaciolargura
EDT_mecanico..FontSize=EDT_mecanico..FontSize*grRaciolargura
EDT_quant..FontSize=EDT_quant..FontSize*grRaciolargura
EDT_artigo..FontSize=EDT_artigo..FontSize*grRaciolargura
EDT_artigo_descricao..FontSize=EDT_artigo_descricao..FontSize*grRaciolargura
BTN_NoName1..FontSize=BTN_NoName1..FontSize*grRaciolargura
BTN_NoName2..FontSize=BTN_NoName2..FontSize*grRaciolargura
BTN_Sair..FontSize=BTN_Sair..FontSize*grRaciolargura
BTN_Adicionar..FontSize=BTN_Adicionar..FontSize*grRaciolargura
BTN_Cancelar..FontSize=BTN_Cancelar..FontSize*grRaciolargura
BTN_Eliminar..FontSize=BTN_Eliminar..FontSize*grRaciolargura
BTN_Leitor..FontSize=BTN_Leitor..FontSize*grRaciolargura
BTN_seguinte..FontSize=BTN_seguinte..FontSize*grRaciolargura
BTN_anterior..FontSize=BTN_anterior..FontSize*grRaciolargura
BTN_Quantidade..FontSize=BTN_Quantidade..FontSize*grRaciolargura
grAltura_atual=myself..Height
grLargura_atual=myself..Width
```

### SRC-91067de207 — WIN_Material_reparacao_form [verificar_Artigo]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1274-1313`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE verificar_Artigo(); if EDT_artigo<>"" then; Query is string; Qry_select_artigo_codigobarras is data source; Query="select * from artigos where codbarras='"+EDT_artigo+"'"; HExecuteSQLQuery(Qry_select_artigo_codigobarras,hQueryDefault,Query); IF HReadFirst(Qry_select_artigo_codigobarras)=False THEN; Query="select * from artigos where codigo='"+EDT_artigo+"'"; Qry_select_artigo_codigo is data source; HExecuteSQLQuery(Qry_select_artigo_codigo,hQueryDefault,Query); IF HReadFirst(Qry_select_artigo_codigo)=False THEN; Info("Artigo não existente"); EDT_artigo=""; EDT_artigo_descricao=""; HCancelDeclaration(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigobarras); EDT_artigo=Qry_select_artigo_codigo.codigo; EDT_artigo_descricao=Qry_select_artigo_codigo.descricao; HCancelDeclaration(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigobarras); EDT_artigo=Qry_select_artigo_codigobarras.codigo; EDT_artigo_descricao=Qry_select_artigo_codigobarras.descricao; HCancelDeclaration(Qry_select_artigo_codigobarras). Authoritative exact branch ledger: docs/mapping/WIN_Material_reparacao_form.md under SRC-91067de207.

HFSQL: HReadFirst(Qry_select_artigo_codigobarras); HReadFirst(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigobarras); HCancelDeclaration(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigobarras); HCancelDeclaration(Qry_select_artigo_codigobarras); HExecuteSQLQuery(Qry_select_artigo_codigobarras); HExecuteSQLQuery(Qry_select_artigo_codigo).

Other calls: Info("Artigo não existente").

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE verificar_Artigo()
if EDT_artigo<>"" then
Query is string
Qry_select_artigo_codigobarras is data source
Query="select * from artigos where codbarras='"+EDT_artigo+"'"
HExecuteSQLQuery(Qry_select_artigo_codigobarras,hQueryDefault,Query)
IF HReadFirst(Qry_select_artigo_codigobarras)=False THEN
Query="select * from artigos where codigo='"+EDT_artigo+"'"
Qry_select_artigo_codigo is data source
HExecuteSQLQuery(Qry_select_artigo_codigo,hQueryDefault,Query)
IF HReadFirst(Qry_select_artigo_codigo)=False THEN
Info("Artigo não existente")
EDT_artigo=""
EDT_artigo_descricao=""
HCancelDeclaration(Qry_select_artigo_codigo)
HCancelDeclaration(Qry_select_artigo_codigobarras)
ELSE
EDT_artigo=Qry_select_artigo_codigo.codigo
EDT_artigo_descricao=Qry_select_artigo_codigo.descricao
HCancelDeclaration(Qry_select_artigo_codigo)
HCancelDeclaration(Qry_select_artigo_codigobarras)
END
ELSE
EDT_artigo=Qry_select_artigo_codigobarras.codigo
EDT_artigo_descricao=Qry_select_artigo_codigobarras.descricao
HCancelDeclaration(Qry_select_artigo_codigobarras)
END
end
```

### SRC-e050711a23 — WIN_Material_reparacao_form/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-50c1dd67fd — WIN_Material_reparacao_form/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-9fd424dfce — WIN_Material_reparacao_form/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

## Data dependencies

- HExecuteQuery: `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:287`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:760`; `QRY_insert_material_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:874`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:909`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1152`; `QRY_select_material_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1166`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1169`.
- HReadFirst: `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:288`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:709`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:761`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:788`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:910`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1153`; `QRY_select_material_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1167`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1170`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1292`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1296`.
- HCancelDeclaration: `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:307`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:711`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:764`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:773`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:776`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:780`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:790`; `dsQry_select_material_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:858`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:883`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:917`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:920`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:924`; `{"conhecidos"}` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:933`; `{"desconhecidos"}` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:944`; `{"desconhecidos"}` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:946`; `QRY_select_mecanicos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1172`; `QRY_select_material_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1176`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1300`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1301`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1305`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1306`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1311`.
- HExecuteSQLQuery: `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:708`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:787`; `dsQry_select_material_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:849`; `dsQry_delete_material_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:862`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1291`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1295`.
- HReadSeek: `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:851`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:876`; `mecanicos` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1156`; `Viaturas` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1161`.
- HFound: `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:852`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:877`; `mecanicos` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1157`; `Viaturas` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1162`.
- HModify: `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:855`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:880`.

## Behavior checklist

- Open and native keyboard: U-W27273E-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-W27273E-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-W27273E-03.
- Explicit message/resource shell outcomes: U-W27273E-04.
- Actual field/mask/type boundaries: U-W27273E-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W27273E-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W27273E-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_material; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W27273E-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteQuery, HExecuteSQLQuery, HModify, HReadFirst, hfound, hmodify, hreadfirst, hreadseek; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W27273E-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W27273E-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

19/19 blocks; 3/3 encoded-only slots retained; 69 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:500`; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:503`; `legacy/GestaoOficinas_TesteIA/WIN_Material_Reparacao.wdw:506`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1346`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1348`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1190`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1192`; `legacy/GestaoOficinas_TesteIA/WIN_Table_Tempos_materiais_Descricoes.wdw:740`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Material_reparacao_form.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Material_reparacao_form.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Material_reparacao_form.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Material_reparacao_form.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:281`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:284`
