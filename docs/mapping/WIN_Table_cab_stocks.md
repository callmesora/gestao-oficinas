# Mapping — WIN_Table_cab_stocks

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw`; designer `dossier: WIN_Table_cab_stocks`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Browse stock headers.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:360 (OpenChild in WIN_MENU)`
```wlanguage
WinStatus(WIN_Table_cab_stocks,TopActive)
CASE NotFound
OpenChild(WIN_Table_cab_stocks)
END
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:727 (OpenChild in WIN_MENU)`
```wlanguage
WinStatus(WIN_Table_cab_stocks,TopActive)
CASE NotFound
OpenChild(WIN_Table_cab_stocks)
END
type : 32
code_elements :
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Filters exact document,number inclusive defaults1..9999999999,exact description. Date events rebuild same filter without dates. New/modify modal then query reexecution. Delete stock1 adds old qty,other subtracts,matching save sign rather than reversal. Stock10 deleting incoming2 =>12,not8. Then deletes lines/header. Missing document movement0 takes subtract branch. No transaction/check/lock.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw` exact event locations below; `dossier: WIN_Table_cab_stocks/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-eae374809e — WIN_Table_cab_stocks/BTN_novo

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:387-388`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: open(win_table_lin_stocks,"",0,"NOVO"); tabledisplay(TABLE_cab_stocks,taReExecuteQuery). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-eae374809e.

HFSQL: none in this block.

Other calls: Open(win_table_lin_stocks); TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
open(win_table_lin_stocks,"",0,"NOVO")
tabledisplay(TABLE_cab_stocks,taReExecuteQuery)
```

### SRC-f5e863350e — WIN_Table_cab_stocks/COMBO_tipo_doc

Event `33`: Select a row; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:440-459`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Select a row [33]: sFiltro is string; if COMBO_tipo_doc<>"" then; sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"; IF EDT_Do_n=0 THEN; EDT_Do_n=1; IF EDT_Ao_n=0 THEN; EDT_ao_n=9999999999; if sFiltro="" then; sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; if EDT_descricao<>"" then; sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"; hfilter(QRY_select_cab_stocks,sFiltro); tabledisplay(TABLE_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-f5e863350e.

HFSQL: HFilter(QRY_select_cab_stocks).

Other calls: TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
sFiltro is string
if COMBO_tipo_doc<>"" then
sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"
END
IF EDT_Do_n=0 THEN
EDT_Do_n=1
END
IF EDT_Ao_n=0 THEN
EDT_ao_n=9999999999
END
if sFiltro="" then
sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
else
sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
end
if EDT_descricao<>"" then
sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"
END
hfilter(QRY_select_cab_stocks,sFiltro)
tabledisplay(TABLE_cab_stocks)
```

### SRC-5d9f623fd6 — WIN_Table_cab_stocks/BTN_VISION

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:483-503`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: COMBO_tipo_doc=Open(WIN_Table_documentos,True,combo_tipo_doc); sFiltro is string; IF COMBO_tipo_doc<>"" THEN; sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"; IF EDT_Do_n=0 THEN; EDT_Do_n=1; IF EDT_Ao_n=0 THEN; EDT_Ao_n=9999999999; IF sFiltro="" THEN; sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; IF EDT_descricao<>"" THEN; sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"; HFilter(QRY_select_cab_stocks,sFiltro); TableDisplay(TABLE_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-5d9f623fd6.

HFSQL: HFilter(QRY_select_cab_stocks).

Other calls: Open(WIN_Table_documentos); TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
COMBO_tipo_doc=Open(WIN_Table_documentos,True,combo_tipo_doc)
sFiltro is string
IF COMBO_tipo_doc<>"" THEN
sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"
END
IF EDT_Do_n=0 THEN
EDT_Do_n=1
END
IF EDT_Ao_n=0 THEN
EDT_Ao_n=9999999999
END
IF sFiltro="" THEN
sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
ELSE
sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
END
IF EDT_descricao<>"" THEN
sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"
END
HFilter(QRY_select_cab_stocks,sFiltro)
TableDisplay(TABLE_cab_stocks)
```

### SRC-ad153810b1 — WIN_Table_cab_stocks/EDT_Do_n

Event `17`: Whenever modifying; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:544-563`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Whenever modifying [17]: sFiltro is string; IF COMBO_tipo_doc<>"" THEN; sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"; IF EDT_Do_n=0 THEN; EDT_Do_n=1; IF EDT_Ao_n=0 THEN; EDT_Ao_n=9999999999; IF sFiltro="" THEN; sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; IF EDT_descricao<>"" THEN; sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"; HFilter(QRY_select_cab_stocks,sFiltro); TableDisplay(TABLE_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-7acb5ca222.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-07fb96c4dc.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-912fd4a0a4.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-8f38161f99.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-ad153810b1.

HFSQL: HFilter(QRY_select_cab_stocks).

Other calls: TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
sFiltro is string
IF COMBO_tipo_doc<>"" THEN
sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"
END
IF EDT_Do_n=0 THEN
EDT_Do_n=1
END
IF EDT_Ao_n=0 THEN
EDT_Ao_n=9999999999
END
IF sFiltro="" THEN
sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
ELSE
sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
END
IF EDT_descricao<>"" THEN
sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"
END
HFilter(QRY_select_cab_stocks,sFiltro)
TableDisplay(TABLE_cab_stocks)
```

### SRC-8f38161f99 — WIN_Table_cab_stocks/EDT_Ao_n

Event `17`: Whenever modifying; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:601-620`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Whenever modifying [17]: sFiltro is string; IF COMBO_tipo_doc<>"" THEN; sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"; IF EDT_Do_n=0 THEN; EDT_Do_n=1; IF EDT_Ao_n=0 THEN; EDT_Ao_n=9999999999; IF sFiltro="" THEN; sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; IF EDT_descricao<>"" THEN; sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"; HFilter(QRY_select_cab_stocks,sFiltro); TableDisplay(TABLE_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-7acb5ca222.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-07fb96c4dc.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-912fd4a0a4.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-8f38161f99.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-ad153810b1.

HFSQL: HFilter(QRY_select_cab_stocks).

Other calls: TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
sFiltro is string
IF COMBO_tipo_doc<>"" THEN
sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"
END
IF EDT_Do_n=0 THEN
EDT_Do_n=1
END
IF EDT_Ao_n=0 THEN
EDT_Ao_n=9999999999
END
IF sFiltro="" THEN
sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
ELSE
sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
END
IF EDT_descricao<>"" THEN
sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"
END
HFilter(QRY_select_cab_stocks,sFiltro)
TableDisplay(TABLE_cab_stocks)
```

### SRC-912fd4a0a4 — WIN_Table_cab_stocks/EDT_Da_data

Event `17`: Whenever modifying; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:661-680`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Whenever modifying [17]: sFiltro is string; IF COMBO_tipo_doc<>"" THEN; sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"; IF EDT_Do_n=0 THEN; EDT_Do_n=1; IF EDT_Ao_n=0 THEN; EDT_Ao_n=9999999999; IF sFiltro="" THEN; sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; IF EDT_descricao<>"" THEN; sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"; HFilter(QRY_select_cab_stocks,sFiltro); TableDisplay(TABLE_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-7acb5ca222.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-07fb96c4dc.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-912fd4a0a4.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-8f38161f99.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-ad153810b1.

HFSQL: HFilter(QRY_select_cab_stocks).

Other calls: TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
sFiltro is string
IF COMBO_tipo_doc<>"" THEN
sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"
END
IF EDT_Do_n=0 THEN
EDT_Do_n=1
END
IF EDT_Ao_n=0 THEN
EDT_Ao_n=9999999999
END
IF sFiltro="" THEN
sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
ELSE
sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
END
IF EDT_descricao<>"" THEN
sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"
END
HFilter(QRY_select_cab_stocks,sFiltro)
TableDisplay(TABLE_cab_stocks)
```

### SRC-07fb96c4dc — WIN_Table_cab_stocks/EDT_a_data

Event `17`: Whenever modifying; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:721-740`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Whenever modifying [17]: sFiltro is string; IF COMBO_tipo_doc<>"" THEN; sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"; IF EDT_Do_n=0 THEN; EDT_Do_n=1; IF EDT_Ao_n=0 THEN; EDT_Ao_n=9999999999; IF sFiltro="" THEN; sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; IF EDT_descricao<>"" THEN; sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"; HFilter(QRY_select_cab_stocks,sFiltro); TableDisplay(TABLE_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-7acb5ca222.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-07fb96c4dc.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-912fd4a0a4.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-8f38161f99.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-ad153810b1.

HFSQL: HFilter(QRY_select_cab_stocks).

Other calls: TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
sFiltro is string
IF COMBO_tipo_doc<>"" THEN
sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"
END
IF EDT_Do_n=0 THEN
EDT_Do_n=1
END
IF EDT_Ao_n=0 THEN
EDT_Ao_n=9999999999
END
IF sFiltro="" THEN
sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
ELSE
sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
END
IF EDT_descricao<>"" THEN
sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"
END
HFilter(QRY_select_cab_stocks,sFiltro)
TableDisplay(TABLE_cab_stocks)
```

### SRC-7acb5ca222 — WIN_Table_cab_stocks/EDT_descricao

Event `17`: Whenever modifying; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:795-814`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Whenever modifying [17]: sFiltro is string; IF COMBO_tipo_doc<>"" THEN; sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"; IF EDT_Do_n=0 THEN; EDT_Do_n=1; IF EDT_Ao_n=0 THEN; EDT_Ao_n=9999999999; IF sFiltro="" THEN; sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"; IF EDT_descricao<>"" THEN; sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"; HFilter(QRY_select_cab_stocks,sFiltro); TableDisplay(TABLE_cab_stocks). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-7acb5ca222.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-07fb96c4dc.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-912fd4a0a4.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-8f38161f99.. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-ad153810b1.

HFSQL: HFilter(QRY_select_cab_stocks).

Other calls: TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
sFiltro is string
IF COMBO_tipo_doc<>"" THEN
sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"
END
IF EDT_Do_n=0 THEN
EDT_Do_n=1
END
IF EDT_Ao_n=0 THEN
EDT_Ao_n=9999999999
END
IF sFiltro="" THEN
sFiltro="documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
ELSE
sFiltro=sFiltro+" and documento_numero>='"+EDT_Do_n+"' and documento_numero <='"+EDT_Ao_n+"'"
END
IF EDT_descricao<>"" THEN
sFiltro=sFiltro+" and descricao='"+EDT_descricao+"'"
END
HFilter(QRY_select_cab_stocks,sFiltro)
TableDisplay(TABLE_cab_stocks)
```

### SRC-3d36069483 — WIN_Table_cab_stocks/BTN_alterar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:835-836`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: open(WIN_Table_Lin_Stocks,QRY_select_cab_stocks.documento_codigo,QRY_select_cab_stocks.documento_numero,"MODIFICAR"); TableDisplay(TABLE_cab_stocks,taReExecuteQuery). Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-3d36069483.

HFSQL: none in this block.

Other calls: Open(WIN_Table_Lin_Stocks); TableDisplay(TABLE_cab_stocks).

Exact executable branch/assignment ledger:
```wlanguage
open(WIN_Table_Lin_Stocks,QRY_select_cab_stocks.documento_codigo,QRY_select_cab_stocks.documento_numero,"MODIFICAR")
TableDisplay(TABLE_cab_stocks,taReExecuteQuery)
```

### SRC-ee97be64de — WIN_Table_cab_stocks/BTN_Eliminar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:860-907`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_cab_stocks) = -1 THEN RETURN; SWITCH YesNo(0,"Eliminar Documento?"); CASE 0; RETURN; CASE 1; OTHER CASE; Query is string; stock is numeric; nMov is int; hreadseek(documentos,Codigo,TABLE_cab_stocks.COL_codigo_doc,hIdentical); if hfound(documentos)=true then; nMov=documentos.stock; Query="select * FROM lin_stocks WHERE lin_stocks.documento_codigo ='"+TABLE_cab_stocks.COL_codigo_doc+"' AND lin_stocks.documento_numero ='"+TABLE_cab_stocks.col_numero+"'"; Qry_select_lin_Stock is data source; HExecuteSQLQuery(Qry_select_lin_Stock,hQueryDefault,Query); FOR EACH Qry_select_lin_Stock; HReadSeek(artigos,Codigo,Qry_select_lin_Stock.artigo,hIdentical); IF HFound(artigos)=True THEN; IF nMov=1 THEN; stock=artigos.stock+Qry_select_lin_Stock.quantidade; stock=artigos.stock-Qry_select_lin_Stock.quantidade; artigos.stock=stock; HModify(artigos); HCancelDeclaration(Qry_select_lin_Stock); Query="DELETE FROM lin_stocks WHERE lin_stocks.documento_codigo ='"+TABLE_cab_stocks.COL_codigo_doc+"' AND lin_stocks.documento_numero ='"+TABLE_cab_stocks.COL_Numero+"'"; Qry_delete_lin_Stocks is data source; HExecuteSQLQuery(Qry_delete_lin_Stocks,hQueryDefault,Query); HCancelDeclaration(Qry_de. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-ee97be64de.

HFSQL: HCancelDeclaration(Qry_select_lin_Stock); HCancelDeclaration(Qry_delete_lin_Stocks); HCancelDeclaration(dsQry_delete_cab_Stocks); HExecuteSQLQuery(Qry_select_lin_Stock); HExecuteSQLQuery(Qry_delete_lin_Stocks); HExecuteSQLQuery(dsQry_delete_cab_Stocks); HReadSeek(documentos); HReadSeek(artigos); HFound(documentos); HFound(artigos); HModify(artigos).

Other calls: TableDisplay(TABLE_cab_stocks); TableSelect(TABLE_cab_stocks); YesNo(0).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_cab_stocks) = -1 THEN RETURN
SWITCH YesNo(0,"Eliminar Documento?")
CASE 0
RETURN
CASE 1
OTHER CASE
END
Query is string
stock is numeric
nMov is int
hreadseek(documentos,Codigo,TABLE_cab_stocks.COL_codigo_doc,hIdentical)
if hfound(documentos)=true then
nMov=documentos.stock
END
Query="select * FROM lin_stocks WHERE lin_stocks.documento_codigo ='"+TABLE_cab_stocks.COL_codigo_doc+"' AND lin_stocks.documento_numero ='"+TABLE_cab_stocks.col_numero+"'"
Qry_select_lin_Stock is data source
HExecuteSQLQuery(Qry_select_lin_Stock,hQueryDefault,Query)
FOR EACH Qry_select_lin_Stock
HReadSeek(artigos,Codigo,Qry_select_lin_Stock.artigo,hIdentical)
IF HFound(artigos)=True THEN
IF nMov=1 THEN
stock=artigos.stock+Qry_select_lin_Stock.quantidade
ELSE
stock=artigos.stock-Qry_select_lin_Stock.quantidade
END
artigos.stock=stock
HModify(artigos)
END
END
HCancelDeclaration(Qry_select_lin_Stock)
Query="DELETE FROM lin_stocks WHERE lin_stocks.documento_codigo ='"+TABLE_cab_stocks.COL_codigo_doc+"' AND lin_stocks.documento_numero ='"+TABLE_cab_stocks.COL_Numero+"'"
Qry_delete_lin_Stocks is data source
HExecuteSQLQuery(Qry_delete_lin_Stocks,hQueryDefault,Query)
HCancelDeclaration(Qry_delete_lin_Stocks)
Query="DELETE FROM cab_stocks WHERE cab_stocks.documento_codigo ='"+TABLE_cab_stocks.COL_codigo_doc+"' AND cab_stocks.documento_numero ='"+TABLE_cab_stocks.COL_Numero+"'"
dsQry_delete_cab_Stocks is data source
HExecuteSQLQuery(dsQry_delete_cab_Stocks,hQueryDefault,Query)
HCancelDeclaration(dsQry_delete_cab_Stocks)
TableDisplay(TABLE_cab_stocks,taReExecuteQuery)
```

### SRC-dbbffadf63 — WIN_Table_cab_stocks [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:929-933`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); EDT_Da_data=datesys(); EDT_a_data=DateSys(); EDT_Do_n=1; EDT_Ao_n=9999999999. Authoritative exact branch ledger: docs/mapping/WIN_Table_cab_stocks.md under SRC-dbbffadf63.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
EDT_Da_data=datesys()
EDT_a_data=DateSys()
EDT_Do_n=1
EDT_Ao_n=9999999999
```

### SRC-64b86ba7bb — WIN_Table_cab_stocks/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-3c7ca76c82 — WIN_Table_cab_stocks/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-bffff177d8 — WIN_Table_cab_stocks/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-47fe9fea35 — WIN_Table_cab_stocks/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HCancelDeclaration: `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:895`; `Qry_delete_lin_Stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:900`; `dsQry_delete_cab_Stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:905`.
- HExecuteSQLQuery: `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:882`; `Qry_delete_lin_Stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:899`; `dsQry_delete_cab_Stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:904`.
- HReadSeek: `documentos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:875`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:884`.
- HFound: `documentos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:876`; `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:885`.
- HModify: `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:892`.
- HFilter: `QRY_select_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:458`; `QRY_select_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:502`; `QRY_select_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:562`; `QRY_select_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:619`; `QRY_select_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:679`; `QRY_select_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:739`; `QRY_select_cab_stocks` at `legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:813`.

## Behavior checklist

- Open and native keyboard: U-W7C9411-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-W7C9411-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-W7C9411-03.
- Explicit message/resource shell outcomes: U-W7C9411-04.
- Actual field/mask/type boundaries: U-W7C9411-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W7C9411-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Parsed browsed_file/browsed_item values shown in the screen Binding cells are established dossier facts and excluded from this item. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W7C9411-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_cab_stocks; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W7C9411-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteSQLQuery, HFilter, HFound, HModify, HReadSeek, hfilter, hfound, hreadseek; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W7C9411-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W7C9411-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

11/11 blocks; 4/4 encoded-only slots retained; 45 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:355`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:357`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:358`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:360`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:722`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:724`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:725`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:727`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Table_cab_stocks.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Table_cab_stocks.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Table_cab_stocks.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Table_cab_stocks.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:359`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:362`
