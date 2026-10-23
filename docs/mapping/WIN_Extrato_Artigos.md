# Mapping — WIN_Extrato_Artigos

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw`; designer `dossier: WIN_Extrato_Artigos`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Preview article statement.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:791 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
openchild(WIN_Extrato_Artigos)
type : 32
-
name : OPT_Inventário1
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Both dates start today, upper article zzzzzzzzzz. Nonempty lower picker copies to upper. Preview expands dates to 00:00:00 and 23:59:59; initializes report with date/article bounds and passes start date to report. No reversed-range guard.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw` exact event locations below; `dossier: WIN_Extrato_Artigos/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-54028abf00 — WIN_Extrato_Artigos/BTN_VISION3

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:197-197`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Ao_artigo=open(WIN_Table_artigos,true,EDT_Ao_artigo). Authoritative exact branch ledger: docs/mapping/WIN_Extrato_Artigos.md under SRC-54028abf00.

HFSQL: none in this block.

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Ao_artigo=open(WIN_Table_artigos,true,EDT_Ao_artigo)
```

### SRC-7a22c7e2f3 — WIN_Extrato_Artigos/BTN_VISION4

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:303-306`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Do_artigo=open(WIN_Table_artigos,true,EDT_Do_artigo); if EDT_Do_artigo<>"" then; EDT_Ao_artigo=EDT_Do_artigo. Authoritative exact branch ledger: docs/mapping/WIN_Extrato_Artigos.md under SRC-7a22c7e2f3.

HFSQL: none in this block.

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Do_artigo=open(WIN_Table_artigos,true,EDT_Do_artigo)
if EDT_Do_artigo<>"" then
EDT_Ao_artigo=EDT_Do_artigo
end
```

### SRC-c5cc7577c0 — WIN_Extrato_Artigos/BTN_Visualizar_impressão

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:412-422`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: da_data is datetime=EDT_Da_data; da_data..Hour=00; da_data..Minute=00; da_data..Second=00; a_data is DateTime=EDT_a_data; a_data..Hour=23; a_data..minute=59; a_data..second=59; iPreview(); iInitReportQuery(RPT_Extrato_artigos,da_data,a_data,EDT_Do_artigo,EDT_Ao_artigo); iPrintReport(RPT_Extrato_artigos,da_data). Authoritative exact branch ledger: docs/mapping/WIN_Extrato_Artigos.md under SRC-c5cc7577c0.

HFSQL: none in this block.

Other calls: iPreview(); iPrintReport(RPT_Extrato_artigos).

Exact executable branch/assignment ledger:
```wlanguage
da_data is datetime=EDT_Da_data
da_data..Hour=00
da_data..Minute=00
da_data..Second=00
a_data is DateTime=EDT_a_data
a_data..Hour=23
a_data..minute=59
a_data..second=59
iPreview()
iInitReportQuery(RPT_Extrato_artigos,da_data,a_data,EDT_Do_artigo,EDT_Ao_artigo)
iPrintReport(RPT_Extrato_artigos,da_data)
```

### SRC-ad1408d544 — WIN_Extrato_Artigos [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:443-446`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); EDT_Da_data=DateSys(); EDT_a_data=DateSys(); EDT_Ao_artigo="zzzzzzzzzz". Authoritative exact branch ledger: docs/mapping/WIN_Extrato_Artigos.md under SRC-ad1408d544.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
EDT_Da_data=DateSys()
EDT_a_data=DateSys()
EDT_Ao_artigo="zzzzzzzzzz"
```

### SRC-52e987aaad — WIN_Extrato_Artigos/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-31d447ccf8 — WIN_Extrato_Artigos/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-ec73e65381 — WIN_Extrato_Artigos/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-36de48ee31 — WIN_Extrato_Artigos/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W13F458-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W13F458-02.
- Actual field/mask/type boundaries: U-W13F458-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W13F458-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W13F458-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W13F458-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W13F458-02. This is source inspection, not a runtime parity claim.
- **U-W13F458-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W13F458-02.
- **U-W13F458-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

4/4 blocks; 4/4 encoded-only slots retained; 28 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:791`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Extrato_Artigos.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Extrato_Artigos.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Extrato_Artigos.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Extrato_Artigos.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:521`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:524`
