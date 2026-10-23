# Mapping — WIN_Inventario_Reconstrucao

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw`; designer `dossier: WIN_Inventario_Reconstrucao`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Reconstruct stock before inventory.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:802 (Open in WIN_MENU)`
```wlanguage
-
code : |1-
Open(WIN_Inventario_Reconstrucao)
Open(WIN_Inventario)
type : 32
-
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Matches WIN_Reconstrucao_Stocks: zero all; movement1 plus,2 minus; subtract repair material; update each article. HFound incorrectly names line query after document seek. Menu opens inventory afterward without inspecting result. No transaction or checks.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw` exact event locations below; `dossier: WIN_Inventario_Reconstrucao/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-a1328f1bb2 — WIN_Inventario_Reconstrucao/BTN_Reconstruir

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:197-260`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: FOR EACH artigos; artigos.stock=0; HModify(artigos); Query is string; xStock is numeric; sCodigo_doc_atual is string; Query="select * from documentos"; dsQry_Select_docs is data source; HExecuteSQLQuery(dsQry_Select_docs,hQueryDefault,Query); Query="select * from artigos"; dsQry_select_artigos is Data Source; Qry_select_lin_Stock is data source; dsQry_update_artigos is Data Source; dsQry_select_material_rep is data source; HExecuteSQLQuery(dsQry_select_artigos,hQueryDefault,Query); FOR EACH dsQry_select_artigos; xStock=0; Query="select * from lin_stocks where artigo='"+dsQry_select_artigos.codigo+"' order by documento_codigo asc"; HExecuteSQLQuery(Qry_select_lin_Stock,hQueryDefault,Query); IF HReadFirst(Qry_select_lin_Stock)=True THEN; HReadSeek(dsQry_Select_docs,codigo,Qry_select_lin_Stock.documento_codigo); IF HFound(Qry_select_lin_Stock)=True THEN; sCodigo_doc_atual=Qry_select_lin_Stock.documento_codigo; FOR EACH Qry_select_lin_Stock; IF sCodigo_doc_atual<>Qry_select_lin_Stock.documento_codigo THEN; HReadSeek(dsQry_Select_docs,codigo,Qry_select_lin_Stock.documento_codigo); IF HFound(Qry_select_lin_Stock)=True THEN; sCodigo_doc_atual=Qry_select_lin_Stock.documento_codigo; sCodigo. Authoritative exact branch ledger: docs/mapping/WIN_Inventario_Reconstrucao.md under SRC-a1328f1bb2.

HFSQL: HReadFirst(Qry_select_lin_Stock); HCancelDeclaration(Qry_select_lin_Stock); HCancelDeclaration(dsQry_select_material_rep); HCancelDeclaration(dsQry_update_artigos); HCancelDeclaration(dsQry_select_artigos); HExecuteSQLQuery(dsQry_Select_docs); HExecuteSQLQuery(dsQry_select_artigos); HExecuteSQLQuery(Qry_select_lin_Stock); HExecuteSQLQuery(dsQry_select_material_rep); HExecuteSQLQuery(dsQry_update_artigos); HReadSeek(dsQry_Select_docs); HReadSeek(dsQry_Select_docs); HFound(Qry_select_lin_Stock); HFound(Qry_select_lin_Stock); HModify(artigos).

Other calls: Info("Reconstrução terminada"); Close(WIN_Inventario_Reconstrucao).

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
Close(WIN_Inventario_Reconstrucao)
```

### SRC-99805cb492 — WIN_Inventario_Reconstrucao [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:319-319`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(). Authoritative exact branch ledger: docs/mapping/WIN_Inventario_Reconstrucao.md under SRC-99805cb492.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
```

### SRC-99982ec38e — WIN_Inventario_Reconstrucao/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-3efb57adb1 — WIN_Inventario_Reconstrucao/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-4b6c8c6208 — WIN_Inventario_Reconstrucao/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-992d42e29b — WIN_Inventario_Reconstrucao/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

### SRC-217d193335 — WIN_Inventario_Reconstrucao/BTN_Reconstruir1 [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:283; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HReadFirst: `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:219`.
- HCancelDeclaration: `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:244`; `dsQry_select_material_rep` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:251`; `dsQry_update_artigos` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:255`; `dsQry_select_artigos` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:257`.
- HExecuteSQLQuery: `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:207`; `dsQry_select_artigos` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:214`; `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:218`; `dsQry_select_material_rep` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:247`; `dsQry_update_artigos` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:254`.
- HReadSeek: `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:220`; `dsQry_Select_docs` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:227`.
- HFound: `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:221`; `Qry_select_lin_Stock` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:228`.
- HModify: `artigos` at `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:199`.

## Behavior checklist

- Open and native keyboard: U-WB2F707-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- Actual data/timer/lock/write failure cases: U-WB2F707-03.
- Explicit message/resource shell outcomes: U-WB2F707-04.
- Actual field/mask/type boundaries: U-WB2F707-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-WB2F707-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-WB2F707-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-WB2F707-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteSQLQuery, HFound, HModify, HReadFirst, HReadSeek; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-WB2F707-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-WB2F707-05** — Golden boundary outcomes for quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

2/2 blocks; 5/5 encoded-only slots retained; 22 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:802`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_inventario_Reconstrucao.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_inventario_Reconstrucao.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_inventario_Reconstrucao.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_inventario_Reconstrucao.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:617`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:620`
