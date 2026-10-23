# Mapping — WIN_Mapa_Vendas

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw`; designer `dossier: WIN_Mapa_Vendas`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Preview sales/receipts.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:858 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
OpenChild(WIN_Mapa_Vendas,"vendas")
type : 32
-
name : OPT_Recebimentos
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:869 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
OpenChild(WIN_Mapa_Vendas,"recebimentos")
type : 32
code_elements :
type_code : 26
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

vendas selects states pedir_data_entrega=1 and delivery report; other modes pedir_data_pag=1/payment. Initially all selected. Codes joined with trailing semicolon. Dates SysDateTime without day expansion. Empty selected list query behavior needs golden case.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw` exact event locations below; `dossier: WIN_Mapa_Vendas/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-e5d92abdf9 — WIN_Mapa_Vendas/EDT_A_data

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:196-196`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: MySelf=SysDateTime(). Authoritative exact branch ledger: docs/mapping/WIN_Mapa_Vendas.md under SRC-e5d92abdf9.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
MySelf=SysDateTime()
```

### SRC-0e5d3411ed — WIN_Mapa_Vendas/EDT_Da_data

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:237-237`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: myself=sysdatetime(). Authoritative exact branch ledger: docs/mapping/WIN_Mapa_Vendas.md under SRC-0e5d3411ed.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
myself=sysdatetime()
```

### SRC-20746c7ede — WIN_Mapa_Vendas/TABLE_Estados

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:337-348`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: sQuery is string; if tipo="vendas" then; sQuery="select * from estados_reparacao where pedir_data_entrega=1"; sQuery="select * from estados_reparacao where pedir_data_pag=1"; dsQry is data source; HExecuteSQLQuery(dsQry,hQueryDefault,sQuery); for EACH dsQry; tableaddline(TABLE_Estados,true,dsQry.descricao,dsQry.codigo); HCancelDeclaration(dsQry). Authoritative exact branch ledger: docs/mapping/WIN_Mapa_Vendas.md under SRC-20746c7ede.

HFSQL: HCancelDeclaration(dsQry); HExecuteSQLQuery(dsQry).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
sQuery is string
if tipo="vendas" then
sQuery="select * from estados_reparacao where pedir_data_entrega=1"
else
sQuery="select * from estados_reparacao where pedir_data_pag=1"
END
dsQry is data source
HExecuteSQLQuery(dsQry,hQueryDefault,sQuery)
for EACH dsQry
tableaddline(TABLE_Estados,true,dsQry.descricao,dsQry.codigo)
END
HCancelDeclaration(dsQry)
```

### SRC-9e2b93ee94 — WIN_Mapa_Vendas/BTN_Visualizar_impressão1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:429-442`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: lista_estados is string; for each row of TABLE_Estados; if TABLE_Estados.COL_checkbox=true then; lista_estados=lista_estados+TABLE_Estados.COL_codigo+";"; iPreview(); IF tipo="vendas" THEN; iInitReportQuery(RPT_Ordens_Reparacao_DataEntrega,EDT_Da_data,EDT_À_data,lista_estados); iPrintReport(RPT_Ordens_Reparacao_DataEntrega); iInitReportQuery(RPT_Ordens_Reparacao_DataPag,EDT_Da_data,EDT_A_data,lista_estados); iPrintReport(RPT_Ordens_Reparacao_DataPag). Authoritative exact branch ledger: docs/mapping/WIN_Mapa_Vendas.md under SRC-9e2b93ee94.

HFSQL: none in this block.

Other calls: iPreview(); iPrintReport(RPT_Ordens_Reparacao_DataEntrega); iPrintReport(RPT_Ordens_Reparacao_DataPag).

Exact executable branch/assignment ledger:
```wlanguage
lista_estados is string
for each row of TABLE_Estados
if TABLE_Estados.COL_checkbox=true then
lista_estados=lista_estados+TABLE_Estados.COL_codigo+";"
END
END
iPreview()
IF tipo="vendas" THEN
iInitReportQuery(RPT_Ordens_Reparacao_DataEntrega,EDT_Da_data,EDT_À_data,lista_estados)
iPrintReport(RPT_Ordens_Reparacao_DataEntrega)
else
iInitReportQuery(RPT_Ordens_Reparacao_DataPag,EDT_Da_data,EDT_A_data,lista_estados)
iPrintReport(RPT_Ordens_Reparacao_DataPag)
end
```

### SRC-04e45acc4d — WIN_Mapa_Vendas [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:476-488`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(tipo); if tipo="vendas" then; RADTitle="Mapa de Vendas"; EDT_Da_data..caption="Da data de entrega"; edt_a_data..caption="À data de entrega"; STC_Titulo_Tabela="Estados de reparação que pedem data de entrega"; RADTitle="Mapa de Recebimentos"; EDT_Da_data..Caption="Da data de pagamento"; EDT_A_data..Caption="À data de pagamento"; STC_Titulo_Tabela="Estados de reparação que pedem data de pagamento". Authoritative exact branch ledger: docs/mapping/WIN_Mapa_Vendas.md under SRC-04e45acc4d.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(tipo)
if tipo="vendas" then
RADTitle="Mapa de Vendas"
EDT_Da_data..caption="Da data de entrega"
edt_a_data..caption="À data de entrega"
STC_Titulo_Tabela="Estados de reparação que pedem data de entrega"
else
RADTitle="Mapa de Recebimentos"
EDT_Da_data..Caption="Da data de pagamento"
EDT_A_data..Caption="À data de pagamento"
STC_Titulo_Tabela="Estados de reparação que pedem data de pagamento"
END
```

### SRC-76275a7384 — WIN_Mapa_Vendas/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-db6c3537d4 — WIN_Mapa_Vendas/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-5ecb42b5a5 — WIN_Mapa_Vendas/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-dcd3d907a3 — WIN_Mapa_Vendas/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HCancelDeclaration: `dsQry` at `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:348`.
- HExecuteSQLQuery: `dsQry` at `legacy/GestaoOficinas_TesteIA/WIN_Mapa_Vendas.wdw:344`.

## Behavior checklist

- Open and native keyboard: U-W7DB489-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-W7DB489-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-W7DB489-03.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W7DB489-02.
- Actual field/mask/type boundaries: U-W7DB489-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W7DB489-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W7DB489-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_Estados; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W7DB489-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteSQLQuery. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W7DB489-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W7DB489-02.
- **U-W7DB489-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

5/5 blocks; 4/4 encoded-only slots retained; 30 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:858`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:869`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Mapa_Vendas.wdw:10`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Mapa_Vendas.wdw:10`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Mapa_Vendas.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Mapa_Vendas.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:653`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:656`
