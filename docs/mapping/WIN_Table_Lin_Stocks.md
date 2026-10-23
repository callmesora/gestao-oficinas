# Mapping — WIN_Table_Lin_Stocks

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw`; designer `dossier: WIN_Table_Lin_Stocks`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Create/replace stock document and lines.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:387 (Open in WIN_Table_cab_stocks)`
```wlanguage
-
code : |1-
open(win_table_lin_stocks,"",0,"NOVO")
tabledisplay(TABLE_cab_stocks,taReExecuteQuery)
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:835 (Open in WIN_Table_cab_stocks)`
```wlanguage
-
code : |1-
open(WIN_Table_Lin_Stocks,QRY_select_cab_stocks.documento_codigo,QRY_select_cab_stocks.documento_numero,"MODIFICAR")
TableDisplay(TABLE_cab_stocks,taReExecuteQuery)
type : 18
-
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry(type,num,state):modify loads lines/header,disables date/type;new first type,maxnumber+1,today. Type select recalculates number and mechanic visibility via obriga_macanico. Article exit barcode before code,description/price/focusqty;qty exit focusprice. Add requires code,maxline+1,resets qty1/price0. Confirm table=-1 =>Documento sem linhas. stock1 adds,every other subtracts. Modify reverses old lines(stock1 minus,other plus),deletes,recreates,applies stock,updates header. New header first then lines. Example old+2,new+3 =>net+1. No mechanic-required check,transaction,write checking or duplicate lock. SQL concatenates text/numeric values. Cancel/delete resource dialogs plus encoded closure.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw` exact event locations below; `dossier: WIN_Table_Lin_Stocks/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-ae1306063e — WIN_Table_Lin_Stocks/COMBO_tipo_doc

Event `33`: Select a row; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:212-233`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Select a row [33]: Query is string="select * from cab_stocks where documento_codigo='"+COMBO_tipo_doc+"'"; QRY_select_cab_stocks_codigo is data source; contador is int; HExecuteSQLQuery(QRY_select_cab_stocks_codigo,hQueryDefault,Query); FOR EACH QRY_select_cab_stocks_codigo; IF QRY_select_cab_stocks_codigo.documento_numero>contador THEN; contador=QRY_select_cab_stocks_codigo.documento_numero; contador++; HCancelDeclaration(QRY_select_cab_stocks_codigo); EDT_Numero=contador; hreadseek(documentos,Codigo,COMBO_tipo_doc); if documentos.obriga_macanico=false then; COMBO_mecanico..visible=false; BTN_VISION2..Visible=False; STC_Mecanico..visible=false; COMBO_mecanico..Visible=true; BTN_VISION2..Visible=true; STC_Mecanico..Visible=true. Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-ae1306063e.

HFSQL: HCancelDeclaration(QRY_select_cab_stocks_codigo); HExecuteSQLQuery(QRY_select_cab_stocks_codigo); HReadSeek(documentos).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Query is string="select * from cab_stocks where documento_codigo='"+COMBO_tipo_doc+"'"
QRY_select_cab_stocks_codigo is data source
contador is int
HExecuteSQLQuery(QRY_select_cab_stocks_codigo,hQueryDefault,Query)
FOR EACH QRY_select_cab_stocks_codigo
IF QRY_select_cab_stocks_codigo.documento_numero>contador THEN
contador=QRY_select_cab_stocks_codigo.documento_numero
END
END
contador++
HCancelDeclaration(QRY_select_cab_stocks_codigo)
EDT_Numero=contador
hreadseek(documentos,Codigo,COMBO_tipo_doc)
if documentos.obriga_macanico=false then
COMBO_mecanico..visible=false
BTN_VISION2..Visible=False
STC_Mecanico..visible=false
else
COMBO_mecanico..Visible=true
BTN_VISION2..Visible=true
STC_Mecanico..Visible=true
END
```

### SRC-c3149e4e20 — WIN_Table_Lin_Stocks/BTN_VISION

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:257-258`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: COMBO_tipo_doc=open(WIN_Table_documentos,true,COMBO_tipo_doc); ExecuteProcess(COMBO_tipo_doc,trtSelection). Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-c3149e4e20.

HFSQL: none in this block.

Other calls: Open(WIN_Table_documentos); ExecuteProcess(COMBO_tipo_doc).

Exact executable branch/assignment ledger:
```wlanguage
COMBO_tipo_doc=open(WIN_Table_documentos,true,COMBO_tipo_doc)
ExecuteProcess(COMBO_tipo_doc,trtSelection)
```

### SRC-997e942018 — WIN_Table_Lin_Stocks/EDT_codigo

Event `16`: Exit; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:601-635`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Exit [16]: IF EDT_codigo<>"" THEN; query is string; Qry_select_artigo_codigobarras is data source; query="select * from artigos where codbarras='"+EDT_codigo+"'"; HExecuteSQLQuery(Qry_select_artigo_codigobarras,hQueryDefault,query); IF HReadFirst(Qry_select_artigo_codigobarras)=False THEN; query="select * from artigos where codigo='"+EDT_codigo+"'"; Qry_select_artigo_codigo is data source; HExecuteSQLQuery(Qry_select_artigo_codigo,hQueryDefault,query); IF HReadFirst(Qry_select_artigo_codigo)=False THEN; Info("Artigo não existente"); EDT_codigo=""; EDT_descricao_Artigo=""; EDT_preco=0; HCancelDeclaration(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigobarras); EDT_codigo=Qry_select_artigo_codigo.codigo; EDT_descricao_Artigo=Qry_select_artigo_codigo.descricao; EDT_preco=Qry_select_artigo_codigo.preco; HCancelDeclaration(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigobarras); EDT_codigo=Qry_select_artigo_codigobarras.codigo; EDT_descricao_Artigo=Qry_select_artigo_codigobarras.descricao; EDT_preco=Qry_select_artigo_codigobarras.preco; HCancelDeclaration(Qry_select_artigo_codigobarras); If EDT_codigo="" THEN; SetFocus(EDT_codigo); SetFocus(EDT_quant). Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-997e942018.

HFSQL: HReadFirst(Qry_select_artigo_codigobarras); HReadFirst(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigobarras); HCancelDeclaration(Qry_select_artigo_codigo); HCancelDeclaration(Qry_select_artigo_codigobarras); HCancelDeclaration(Qry_select_artigo_codigobarras); HExecuteSQLQuery(Qry_select_artigo_codigobarras); HExecuteSQLQuery(Qry_select_artigo_codigo).

Other calls: Info("Artigo não existente"); SetFocus(EDT_codigo); SetFocus(EDT_quant).

Exact executable branch/assignment ledger:
```wlanguage
IF EDT_codigo<>"" THEN
query is string
Qry_select_artigo_codigobarras is data source
query="select * from artigos where codbarras='"+EDT_codigo+"'"
HExecuteSQLQuery(Qry_select_artigo_codigobarras,hQueryDefault,query)
IF HReadFirst(Qry_select_artigo_codigobarras)=False THEN
query="select * from artigos where codigo='"+EDT_codigo+"'"
Qry_select_artigo_codigo is data source
HExecuteSQLQuery(Qry_select_artigo_codigo,hQueryDefault,query)
IF HReadFirst(Qry_select_artigo_codigo)=False THEN
Info("Artigo não existente")
EDT_codigo=""
EDT_descricao_Artigo=""
EDT_preco=0
HCancelDeclaration(Qry_select_artigo_codigo)
HCancelDeclaration(Qry_select_artigo_codigobarras)
ELSE
EDT_codigo=Qry_select_artigo_codigo.codigo
EDT_descricao_Artigo=Qry_select_artigo_codigo.descricao
EDT_preco=Qry_select_artigo_codigo.preco
HCancelDeclaration(Qry_select_artigo_codigo)
HCancelDeclaration(Qry_select_artigo_codigobarras)
END
ELSE
EDT_codigo=Qry_select_artigo_codigobarras.codigo
EDT_descricao_Artigo=Qry_select_artigo_codigobarras.descricao
EDT_preco=Qry_select_artigo_codigobarras.preco
HCancelDeclaration(Qry_select_artigo_codigobarras)
END
If EDT_codigo="" THEN
SetFocus(EDT_codigo)
else
SetFocus(EDT_quant)
END
END
```

### SRC-edcb777596 — WIN_Table_Lin_Stocks/EDT_quant

Event `16`: Exit; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:700-700`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Exit [16]: SetFocus(EDT_preco). Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-edcb777596.

HFSQL: none in this block.

Other calls: SetFocus(EDT_preco).

Exact executable branch/assignment ledger:
```wlanguage
SetFocus(EDT_preco)
```

### SRC-e74bcec065 — WIN_Table_Lin_Stocks/BTN_NoName1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:778-788`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_codigo=open(WIN_Table_artigos,true,edt_codigo); if EDT_codigo<>"" then; Query is string; Query="select * from artigos where codigo='"+EDT_codigo+"'"; Qry_select_artigos_codigo is data source; HExecuteSQLQuery(Qry_select_artigos_codigo,hQueryDefault,Query); hreadfirst(Qry_select_artigos_codigo); EDT_descricao_Artigo=Qry_select_artigos_codigo.descricao; EDT_preco=Qry_select_artigos_codigo.preco; SetFocus(EDT_codigo). Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-e74bcec065.

HFSQL: HReadFirst(Qry_select_artigos_codigo); HExecuteSQLQuery(Qry_select_artigos_codigo).

Other calls: Open(WIN_Table_artigos); SetFocus(EDT_codigo).

Exact executable branch/assignment ledger:
```wlanguage
EDT_codigo=open(WIN_Table_artigos,true,edt_codigo)
if EDT_codigo<>"" then
Query is string
Query="select * from artigos where codigo='"+EDT_codigo+"'"
Qry_select_artigos_codigo is data source
HExecuteSQLQuery(Qry_select_artigos_codigo,hQueryDefault,Query)
hreadfirst(Qry_select_artigos_codigo)
EDT_descricao_Artigo=Qry_select_artigos_codigo.descricao
EDT_preco=Qry_select_artigos_codigo.preco
END
SetFocus(EDT_codigo)
```

### SRC-3745a73857 — WIN_Table_Lin_Stocks/BTN_Adicionar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:812-828`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF EDT_codigo<>"" THEN; nContador is int; for EACH row of TABLE_lin_Stocks; if TABLE_lin_Stocks.COL_linha>nContador THEN; nContador=TABLE_lin_Stocks.COL_linha; nContador++; TableAddLine(TABLE_lin_Stocks,EDT_codigo,EDT_descricao_Artigo,EDT_quant,EDT_preco,nContador); EDT_codigo=""; EDT_descricao_Artigo=""; EDT_quant=1; EDT_preco=0; SetFocus(EDT_codigo). Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-3745a73857.

HFSQL: none in this block.

Other calls: SetFocus(EDT_codigo).

Exact executable branch/assignment ledger:
```wlanguage
IF EDT_codigo<>"" THEN
nContador is int
for EACH row of TABLE_lin_Stocks
if TABLE_lin_Stocks.COL_linha>nContador THEN
nContador=TABLE_lin_Stocks.COL_linha
END
END
nContador++
TableAddLine(TABLE_lin_Stocks,EDT_codigo,EDT_descricao_Artigo,EDT_quant,EDT_preco,nContador)
EDT_codigo=""
EDT_descricao_Artigo=""
EDT_quant=1
EDT_preco=0
SetFocus(EDT_codigo)
END
```

### SRC-26ff5eb37e — WIN_Table_Lin_Stocks/BTN_Confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:853-931`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if TABLE_lin_Stocks=-1 then; info("Documento sem linhas"); return; Query is string; stock is numeric; nMov is int; Query="select * from documentos where codigo='"+COMBO_tipo_doc+"'"; dsQry_Select_docs is data source; HExecuteSQLQuery(dsQry_Select_docs,hQueryDefault,Query); hreadfirst(dsQry_Select_docs); nMov=dsQry_Select_docs.stock; HCancelDeclaration(dsQry_Select_docs); if estado="MODIFICAR" then; Query="select * FROM lin_stocks WHERE lin_stocks.documento_codigo ='"+COMBO_tipo_doc+"' AND lin_stocks.documento_numero ='"+EDT_Numero+"'"; Qry_select_lin_Stock is data source; HExecuteSQLQuery(Qry_select_lin_Stock,hQueryDefault,Query); for each Qry_select_lin_Stock; hreadseek(artigos,codigo,Qry_select_lin_Stock.artigo,hIdentical); if hfound(artigos)=true then; IF nMov=1 THEN; stock=artigos.stock-Qry_select_lin_Stock.quantidade; stock=artigos.stock+Qry_select_lin_Stock.quantidade; artigos.stock=stock; hmodify(artigos); HCancelDeclaration(Qry_select_lin_Stock); Query="DELETE FROM lin_stocks WHERE lin_stocks.documento_codigo ='"+COMBO_tipo_doc+"' AND lin_stocks.documento_numero ='"+EDT_Numero+"'"; Qry_delete_lin_Stocks is data source; HExecuteSQLQuery(Qry_delete_lin_Stocks,hQueryDefault,Qu. Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-26ff5eb37e.

HFSQL: HReadFirst(dsQry_Select_docs); HCancelDeclaration(dsQry_Select_docs); HCancelDeclaration(Qry_select_lin_Stock); HCancelDeclaration(Qry_delete_lin_Stocks); HCancelDeclaration(Qry_insert_lin_stocks); HCancelDeclaration(qry_update_cab_stocks); HCancelDeclaration(Qry_insert_cab_stocks); HCancelDeclaration(Qry_insert_lin_stocks); HExecuteSQLQuery(dsQry_Select_docs); HExecuteSQLQuery(Qry_select_lin_Stock); HExecuteSQLQuery(Qry_delete_lin_Stocks); HExecuteSQLQuery(Qry_insert_lin_stocks); HExecuteSQLQuery(qry_update_cab_stocks); HExecuteSQLQuery(Qry_insert_cab_stocks); HExecuteSQLQuery(Qry_insert_lin_stocks); HReadSeek(artigos); HReadSeek(artigos); HReadSeek(artigos); HFound(artigos); HFound(artigos); HFound(artigos); HModify(artigos); HModify(artigos); HModify(artigos).

Other calls: Info("Documento sem linhas").

Exact executable branch/assignment ledger:
```wlanguage
if TABLE_lin_Stocks=-1 then
info("Documento sem linhas")
return
END
Query is string
stock is numeric
nMov is int
Query="select * from documentos where codigo='"+COMBO_tipo_doc+"'"
dsQry_Select_docs is data source
HExecuteSQLQuery(dsQry_Select_docs,hQueryDefault,Query)
hreadfirst(dsQry_Select_docs)
nMov=dsQry_Select_docs.stock
HCancelDeclaration(dsQry_Select_docs)
if estado="MODIFICAR" then
Query="select * FROM lin_stocks WHERE lin_stocks.documento_codigo ='"+COMBO_tipo_doc+"' AND lin_stocks.documento_numero ='"+EDT_Numero+"'"
Qry_select_lin_Stock is data source
HExecuteSQLQuery(Qry_select_lin_Stock,hQueryDefault,Query)
for each Qry_select_lin_Stock
hreadseek(artigos,codigo,Qry_select_lin_Stock.artigo,hIdentical)
if hfound(artigos)=true then
IF nMov=1 THEN
stock=artigos.stock-Qry_select_lin_Stock.quantidade
ELSE
stock=artigos.stock+Qry_select_lin_Stock.quantidade
END
artigos.stock=stock
hmodify(artigos)
END
END
HCancelDeclaration(Qry_select_lin_Stock)
Query="DELETE FROM lin_stocks WHERE lin_stocks.documento_codigo ='"+COMBO_tipo_doc+"' AND lin_stocks.documento_numero ='"+EDT_Numero+"'"
Qry_delete_lin_Stocks is data source
HExecuteSQLQuery(Qry_delete_lin_Stocks,hQueryDefault,Query)
HCancelDeclaration(Qry_delete_lin_Stocks)
Qry_insert_lin_stocks is data source
FOR EACH ROW OF TABLE_lin_Stocks
Query="INSERT INTO lin_stocks (documento_codigo,documento_numero,linha,artigo,descricao_artigo,quantidade,preco) VALUES ('"+COMBO_tipo_doc+"','"+EDT_Numero+"','"+TABLE_lin_Stocks.COL_linha+"','"+TABLE_lin_Stocks.COL_Codigo+"','"+TABLE_lin_Stocks.COL_Descricao+"','"+TABLE_lin_Stocks.COL_Quant+"','"+TABLE_lin_Stocks.COL_Preco+"')"
HExecuteSQLQuery(Qry_insert_lin_stocks,hQueryDefault,Query)
hreadseek(artigos,Codigo,TABLE_lin_Stocks.COL_Codigo,hIdentical)
if hfound(artigos)=true then
IF nMov=1 THEN
stock=artigos.stock+TABLE_lin_Stocks.COL_Quant
ELSE
stock=artigos.stock-TABLE_lin_Stocks.COL_Quant
END
artigos.stock=stock
hmodify(artigos)
END
END
HCancelDeclaration(Qry_insert_lin_stocks)
Query="UPDATE cab_stocks SET Descricao ='"+EDT_descricao+"',data ='"+EDT_Data+"',mecanico ='"+COMBO_mecanico+"' WHERE cab_stocks.documento_codigo ='"+COMBO_tipo_doc+"' AND cab_stocks.documento_numero ='"+EDT_Numero+"'"
qry_update_cab_stocks is data source
HExecuteSQLQuery(qry_update_cab_stocks,hQueryDefault,Query)
HCancelDeclaration(qry_update_cab_stocks)
else
Query="INSERT INTO cab_stocks (documento_codigo,documento_numero,Descricao,data,mecanico) VALUES ('"+COMBO_tipo_doc+"','"+EDT_Numero+"','"+EDT_descricao+"','"+EDT_Data+"','"+COMBO_mecanico+"')"
Qry_insert_cab_stocks is data source
HExecuteSQLQuery(Qry_insert_cab_stocks,hQueryDefault,Query)
HCancelDeclaration(Qry_insert_cab_stocks)
Qry_insert_lin_stocks is data source
for each row of TABLE_lin_Stocks
Query="INSERT INTO lin_stocks (documento_codigo,documento_numero,linha,artigo,descricao_artigo,quantidade,preco) VALUES ('"+COMBO_tipo_doc+"','"+EDT_Numero+"','"+TABLE_lin_Stocks.COL_linha+"','"+TABLE_lin_Stocks.COL_Codigo+"','"+TABLE_lin_Stocks.COL_Descricao+"','"+TABLE_lin_Stocks.COL_Quant+"','"+TABLE_lin_Stocks.COL_Preco+"')"
HExecuteSQLQuery(Qry_insert_lin_stocks,hQueryDefault,Query)
HReadSeek(artigos,Codigo,TABLE_lin_Stocks.COL_Codigo,hIdentical)
IF HFound(artigos)=True THEN
IF nMov=1 THEN
stock=artigos.stock+TABLE_lin_Stocks.COL_Quant
ELSE
stock=artigos.stock-TABLE_lin_Stocks.COL_Quant
END
artigos.stock=stock
HModify(artigos)
END
END
HCancelDeclaration(Qry_insert_lin_stocks)
end
```

Assumed action following code: Close the window (`proposed: A-2b6ca2`).

### SRC-f01324937e — WIN_Table_Lin_Stocks/BTN_Cancelar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:952-961`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH Dialog(<§?16F66B2A006BA0B6§>); CASE 1; CASE 2; return. Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-f01324937e.

HFSQL: none in this block.

Other calls: Dialog(<§?16F66B2A006BA0B6§>).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH Dialog(<§?16F66B2A006BA0B6§>)
CASE 1
CASE 2
return
END
```

Assumed action following code: Close the window (`proposed: A-2b6ca2`).

### SRC-38f1cfe8f9 — WIN_Table_Lin_Stocks/BTN_VISION2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1004-1004`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico). Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-38f1cfe8f9.

HFSQL: none in this block.

Other calls: Open(WIN_Table_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico)
```

### SRC-5a7e8fa5b0 — WIN_Table_Lin_Stocks/BTN_Adicionar1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1041-1052`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH Dialog(<§?16F68AA100CA8A1A§>); case 1; TableDelete(TABLE_lin_Stocks); TableDisplay(TABLE_lin_Stocks, taCurrentFirst); case 2. Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-5a7e8fa5b0.

HFSQL: none in this block.

Other calls: TableDisplay(TABLE_lin_Stocks); Dialog(<§?16F68AA100CA8A1A§>); TableDelete(TABLE_lin_Stocks).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH Dialog(<§?16F68AA100CA8A1A§>)
case 1
TableDelete(TABLE_lin_Stocks)
TableDisplay(TABLE_lin_Stocks, taCurrentFirst)
case 2
END
```

### SRC-cf10fa993d — WIN_Table_Lin_Stocks/BTN_Artigos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1076-1082`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH WinStatus(WIN_Table_artigos); CASE Active; Restore(WIN_Table_artigos); WinStatus(WIN_Table_artigos,TopActive); CASE NotFound; OpenChild(WIN_Table_artigos,False,""). Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-cf10fa993d.

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

### SRC-472cf8335a — WIN_Table_Lin_Stocks [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1104-1143`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(tipo_doc,num,estado); EDT_quant=1; gsQuery is string; if estado="MODIFICAR" THEN; COMBO_tipo_doc=tipo_doc; ExecuteProcess(COMBO_tipo_doc,trtSelection); EDT_Numero=num; HExecuteQuery(QRY_select_lin_stocks,hQueryDefault,EDT_Numero,COMBO_tipo_doc); for EACH QRY_select_lin_stocks; tableaddline(TABLE_lin_Stocks,QRY_select_lin_stocks.artigo,QRY_select_lin_stocks.descricao_artigo,QRY_select_lin_stocks.quantidade,QRY_select_lin_stocks.preco,QRY_select_lin_stocks.linha); EDT_Data..InputEnabled=false; COMBO_tipo_doc..InputEnabled=False; BTN_VISION..grayed=true; gsQuery="select * from cab_stocks where documento_codigo='"+COMBO_tipo_doc+"' and documento_numero='"+EDT_Numero+"'"; gdsQRY_select_cab_stocks_codigo_numero is data source; HExecuteSQLQuery(gdsQRY_select_cab_stocks_codigo_numero,hQueryDefault,gsQuery); hreadfirst(gdsQRY_select_cab_stocks_codigo_numero); EDT_descricao=gdsQRY_select_cab_stocks_codigo_numero.descricao; EDT_Data=gdsQRY_select_cab_stocks_codigo_numero.data; COMBO_mecanico=gdsQRY_select_cab_stocks_codigo_numero.mecanico; HCancelDeclaration(gdsQRY_select_cab_stocks_codigo_numero); ListSelectPlus(COMBO_tipo_doc,1); ExecuteProcess(COMBO_tipo_doc,trtSelection. Authoritative exact branch ledger: docs/mapping/WIN_Table_Lin_Stocks.md under SRC-472cf8335a.

HFSQL: HExecuteQuery(QRY_select_lin_stocks); HReadFirst(gdsQRY_select_cab_stocks_codigo_numero); HCancelDeclaration(gdsQRY_select_cab_stocks_codigo_numero); HCancelDeclaration(gdsQRY_select_cab_stocks_codigo); HExecuteSQLQuery(gdsQRY_select_cab_stocks_codigo_numero); HExecuteSQLQuery(gdsQRY_select_cab_stocks_codigo).

Other calls: SetFocus(EDT_codigo); ListSelectPlus(COMBO_tipo_doc); ExecuteProcess(COMBO_tipo_doc); ExecuteProcess(COMBO_tipo_doc).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(tipo_doc,num,estado)
EDT_quant=1
gsQuery is string
if estado="MODIFICAR" THEN
COMBO_tipo_doc=tipo_doc
ExecuteProcess(COMBO_tipo_doc,trtSelection)
EDT_Numero=num
HExecuteQuery(QRY_select_lin_stocks,hQueryDefault,EDT_Numero,COMBO_tipo_doc)
for EACH QRY_select_lin_stocks
tableaddline(TABLE_lin_Stocks,QRY_select_lin_stocks.artigo,QRY_select_lin_stocks.descricao_artigo,QRY_select_lin_stocks.quantidade,QRY_select_lin_stocks.preco,QRY_select_lin_stocks.linha)
END
EDT_Data..InputEnabled=false
COMBO_tipo_doc..InputEnabled=False
BTN_VISION..grayed=true
gsQuery="select * from cab_stocks where documento_codigo='"+COMBO_tipo_doc+"' and documento_numero='"+EDT_Numero+"'"
gdsQRY_select_cab_stocks_codigo_numero is data source
HExecuteSQLQuery(gdsQRY_select_cab_stocks_codigo_numero,hQueryDefault,gsQuery)
hreadfirst(gdsQRY_select_cab_stocks_codigo_numero)
EDT_descricao=gdsQRY_select_cab_stocks_codigo_numero.descricao
EDT_Data=gdsQRY_select_cab_stocks_codigo_numero.data
COMBO_mecanico=gdsQRY_select_cab_stocks_codigo_numero.mecanico
HCancelDeclaration(gdsQRY_select_cab_stocks_codigo_numero)
else
ListSelectPlus(COMBO_tipo_doc,1)
ExecuteProcess(COMBO_tipo_doc,trtSelection)
i is int
gsQuery="select * from cab_stocks where documento_codigo='"+COMBO_tipo_doc+"'"
gdsQRY_select_cab_stocks_codigo is data source
HExecuteSQLQuery(gdsQRY_select_cab_stocks_codigo,hQueryDefault,gsQuery)
for EACH gdsQRY_select_cab_stocks_codigo
if gdsQRY_select_cab_stocks_codigo.documento_numero>i then
i=gdsQRY_select_cab_stocks_codigo.documento_numero
END
END
i++
HCancelDeclaration(gdsQRY_select_cab_stocks_codigo)
EDT_Numero=i
EDT_Data=datesys()
end
SetFocus(EDT_codigo)
```

### SRC-bc514468f9 — WIN_Table_Lin_Stocks/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-d7768590aa — WIN_Table_Lin_Stocks/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-31a88e85c7 — WIN_Table_Lin_Stocks/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-a382943e05 — WIN_Table_Lin_Stocks/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HExecuteQuery: `QRY_select_lin_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1111`.
- HReadFirst: `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:606`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:610`; `Qry_select_artigos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:784`; `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:863`; `gdsQRY_select_cab_stocks_codigo_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1121`.
- HCancelDeclaration: `QRY_select_cab_stocks_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:222`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:615`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:616`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:621`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:622`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:628`; `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:865`; `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:882`; `Qry_delete_lin_Stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:887`; `Qry_insert_lin_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:904`; `qry_update_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:908`; `Qry_insert_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:913`; `Qry_insert_lin_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:930`; `gdsQRY_select_cab_stocks_codigo_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1125`; `gdsQRY_select_cab_stocks_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1139`.
- HExecuteSQLQuery: `QRY_select_cab_stocks_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:215`; `Qry_select_artigo_codigobarras` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:605`; `Qry_select_artigo_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:609`; `Qry_select_artigos_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:783`; `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:862`; `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:869`; `Qry_delete_lin_Stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:886`; `Qry_insert_lin_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:891`; `qry_update_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:907`; `Qry_insert_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:912`; `Qry_insert_lin_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:917`; `gdsQRY_select_cab_stocks_codigo_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1120`; `gdsQRY_select_cab_stocks_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1132`.
- HReadSeek: `documentos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:224`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:871`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:893`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:919`.
- HFound: `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:872`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:894`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:920`.
- HModify: `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:879`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:901`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:927`.

## Behavior checklist

- Open and native keyboard: U-W7E91C1-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-W7E91C1-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-W7E91C1-03.
- Explicit message/resource shell outcomes: U-W7E91C1-04.
- Actual field/mask/type boundaries: U-W7E91C1-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W7E91C1-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Parsed browsed_file/browsed_item values shown in the screen Binding cells are established dossier facts and excluded from this item. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W7E91C1-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_lin_Stocks; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W7E91C1-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteQuery, HExecuteSQLQuery, HFound, HModify, HReadFirst, HReadSeek, hfound, hmodify, hreadfirst, hreadseek; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W7E91C1-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W7E91C1-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

12/12 blocks; 4/4 encoded-only slots retained; 67 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:387`; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:835`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Table_Lin_Stocks.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Table_Lin_Stocks.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Table_Lin_Stocks.wdw:9`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Table_Lin_Stocks.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:371`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:374`
