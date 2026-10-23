# Mapping — WIN_Reconstrucao_Stocks

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw`; designer `dossier: WIN_Reconstrucao_Stocks`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Reconstruct all article stock.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:888 (Open in WIN_MENU)`
```wlanguage
-
code : |1-
open(win_Reconstrucao_Stocks)
type : 32
-
name : OPT_Clientes_Reparação
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Zero every article/write first. Per article sum lin_stocks: document stock1 adds,2 subtracts,other no effect; subtract every repair material regardless launched/extra. Example10-3-2=5. HFound checks line query after seeking document query; missing document may reuse buffer. No transaction,rollback or write checks. Shows Reconstrução terminada then closes.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw` exact event locations below; `dossier: WIN_Reconstrucao_Stocks/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-a8e5103dd4 — WIN_Reconstrucao_Stocks/BTN_Reconstruir

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:197-260`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: FOR EACH artigos; artigos.stock=0; HModify(artigos); Query is string; xStock is numeric; sCodigo_doc_atual is string; Query="select * from documentos"; dsQry_Select_docs is data source; HExecuteSQLQuery(dsQry_Select_docs,hQueryDefault,Query); Query="select * from artigos"; dsQry_select_artigos is Data Source; Qry_select_lin_Stock is data source; dsQry_update_artigos is Data Source; dsQry_select_material_rep is data source; HExecuteSQLQuery(dsQry_select_artigos,hQueryDefault,Query); FOR EACH dsQry_select_artigos; xStock=0; Query="select * from lin_stocks where artigo='"+dsQry_select_artigos.codigo+"' order by documento_codigo asc"; HExecuteSQLQuery(Qry_select_lin_Stock,hQueryDefault,Query); IF HReadFirst(Qry_select_lin_Stock)=True THEN; HReadSeek(dsQry_Select_docs,codigo,Qry_select_lin_Stock.documento_codigo); IF HFound(Qry_select_lin_Stock)=True THEN; sCodigo_doc_atual=Qry_select_lin_Stock.documento_codigo; FOR EACH Qry_select_lin_Stock; IF sCodigo_doc_atual<>Qry_select_lin_Stock.documento_codigo THEN; HReadSeek(dsQry_Select_docs,codigo,Qry_select_lin_Stock.documento_codigo); IF HFound(Qry_select_lin_Stock)=True THEN; sCodigo_doc_atual=Qry_select_lin_Stock.documento_codigo; sCodigo. Authoritative exact branch ledger: docs/mapping/WIN_Reconstrucao_Stocks.md under SRC-a8e5103dd4.

HFSQL: HReadFirst(Qry_select_lin_Stock); HCancelDeclaration(Qry_select_lin_Stock); HCancelDeclaration(dsQry_select_material_rep); HCancelDeclaration(dsQry_update_artigos); HCancelDeclaration(dsQry_select_artigos); HExecuteSQLQuery(dsQry_Select_docs); HExecuteSQLQuery(dsQry_select_artigos); HExecuteSQLQuery(Qry_select_lin_Stock); HExecuteSQLQuery(dsQry_select_material_rep); HExecuteSQLQuery(dsQry_update_artigos); HReadSeek(dsQry_Select_docs); HReadSeek(dsQry_Select_docs); HFound(Qry_select_lin_Stock); HFound(Qry_select_lin_Stock); HModify(artigos).

Other calls: Info("Reconstrução terminada"); Close(WIN_Reconstrucao_Stocks).

Exact executable branch/assignment ledger:
```wlanguage
FOR EACH artigos
artigos.stock=0
HModify(artigos)
END
Query is string
xStock is numeric
sCodigo_doc_atual is string
Query="select * from documentos"
dsQry_Select_docs is data source
HExecuteSQLQuery(dsQry_Select_docs,hQueryDefault,Query)
Query="select * from artigos"
dsQry_select_artigos is Data Source
Qry_select_lin_Stock is data source
dsQry_update_artigos is Data Source
dsQry_select_material_rep is data source
HExecuteSQLQuery(dsQry_select_artigos,hQueryDefault,Query)
FOR EACH dsQry_select_artigos
xStock=0
Query="select * from lin_stocks where artigo='"+dsQry_select_artigos.codigo+"' order by documento_codigo asc"
HExecuteSQLQuery(Qry_select_lin_Stock,hQueryDefault,Query)
IF HReadFirst(Qry_select_lin_Stock)=True THEN
HReadSeek(dsQry_Select_docs,codigo,Qry_select_lin_Stock.documento_codigo)
IF HFound(Qry_select_lin_Stock)=True THEN
sCodigo_doc_atual=Qry_select_lin_Stock.documento_codigo
END
END
FOR EACH Qry_select_lin_Stock
IF sCodigo_doc_atual<>Qry_select_lin_Stock.documento_codigo THEN
HReadSeek(dsQry_Select_docs,codigo,Qry_select_lin_Stock.documento_codigo)
IF HFound(Qry_select_lin_Stock)=True THEN
sCodigo_doc_atual=Qry_select_lin_Stock.documento_codigo
ELSE
sCodigo_doc_atual=""
END
END
IF sCodigo_doc_atual<>"" THEN
IF dsQry_Select_docs.stock=1 THEN
xStock=xStock+Qry_select_lin_Stock.quantidade
ELSE
IF dsQry_Select_docs.stock=2 THEN
xStock=xStock-Qry_select_lin_Stock.quantidade
END
END
END
END
HCancelDeclaration(Qry_select_lin_Stock)
Query="select * from material_reparacao where artigo='"+dsQry_select_artigos.codigo+"'"
HExecuteSQLQuery(dsQry_select_material_rep,hQueryDefault,Query)
FOR EACH dsQry_select_material_rep
xStock=xStock-dsQry_select_material_rep.quantidade
END
HCancelDeclaration(dsQry_select_material_rep)
Query="update artigos set stock='"+xStock+"' where codigo='"+dsQry_select_artigos.codigo+"'"
HExecuteSQLQuery(dsQry_update_artigos,hQueryDefault,Query)
HCancelDeclaration(dsQry_update_artigos)
END
HCancelDeclaration(dsQry_select_artigos)
Info("Reconstrução terminada")
close(WIN_Reconstrucao_Stocks)
```

### SRC-6c5813bc1b — WIN_Reconstrucao_Stocks [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:281-281`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(). Authoritative exact branch ledger: docs/mapping/WIN_Reconstrucao_Stocks.md under SRC-6c5813bc1b.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
```

### SRC-ee015ff9c2 — WIN_Reconstrucao_Stocks/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-54d40b0b26 — WIN_Reconstrucao_Stocks/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-de48ab4940 — WIN_Reconstrucao_Stocks/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-ef807bd40c — WIN_Reconstrucao_Stocks/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HReadFirst: `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:219`.
- HCancelDeclaration: `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:244`; `dsQry_select_material_rep` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:251`; `dsQry_update_artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:255`; `dsQry_select_artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:257`.
- HExecuteSQLQuery: `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:207`; `dsQry_select_artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:214`; `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:218`; `dsQry_select_material_rep` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:247`; `dsQry_update_artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:254`.
- HReadSeek: `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:220`; `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:227`.
- HFound: `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:221`; `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:228`.
- HModify: `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:199`.

## Behavior checklist

- Open and native keyboard: U-W541EAA-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- Actual data/timer/lock/write failure cases: U-W541EAA-03.
- Explicit message/resource shell outcomes: U-W541EAA-04.
- Actual field/mask/type boundaries: U-W541EAA-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W541EAA-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W541EAA-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W541EAA-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteSQLQuery, HFound, HModify, HReadFirst, HReadSeek; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W541EAA-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W541EAA-05** — Golden boundary outcomes for quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

2/2 blocks; 4/4 encoded-only slots retained; 19 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:888`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Reconstrucao_Stocks.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Reconstrucao_Stocks.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Reconstrucao_Stocks.wdw:9`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Reconstrucao_Stocks.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:605`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:608`
