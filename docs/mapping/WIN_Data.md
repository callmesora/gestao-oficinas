# Mapping — WIN_Data

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Data.wdw`; designer `dossier: WIN_Data`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Return prompted date.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1034 (Open in WIN_Ordens_Reparacao_Form)`
```wlanguage
END
if Qry_select_estados_reparacao.pedir_data_entrega=true THEN
EDT_data_entrega=open(win_data,"Data de entrega",EDT_data_entrega)
END
if Qry_select_estados_reparacao.pedir_data_pag=True THEN
edt_Data_pagamento=open(win_data,"Data de pagamento",EDT_Data_pagamento)
```
- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1037 (Open in WIN_Ordens_Reparacao_Form)`
```wlanguage
END
if Qry_select_estados_reparacao.pedir_data_pag=True THEN
edt_Data_pagamento=open(win_data,"Data de pagamento",EDT_Data_pagamento)
END
END
HCancelDeclaration(Qry_select_estados_reparacao)
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry(gTitulo,gData) sets label, date and ReturnedValue=gData; Confirm assigns EDT_Data. Cancel retains original date; close depends on encoded action.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Data.wdw` exact event locations below; `dossier: WIN_Data/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-11e5297e6b — WIN_Data/BTN_Confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Data.wdw:102-102`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: mywindow..ReturnedValue=EDT_Data. Authoritative exact branch ledger: docs/mapping/WIN_Data.md under SRC-11e5297e6b.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
mywindow..ReturnedValue=EDT_Data
```

Assumed action following code: Close the window (`proposed: A-2b6ca2`).

### SRC-f238b5fac8 — WIN_Data [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Data.wdw:123-126`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(gTitulo,gData); STC_Data=gTitulo; edt_data=gdata; mywindow..ReturnedValue=gdata. Authoritative exact branch ledger: docs/mapping/WIN_Data.md under SRC-f238b5fac8.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(gTitulo,gData)
STC_Data=gTitulo
edt_data=gdata
mywindow..ReturnedValue=gdata
```

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W16C5A7-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W16C5A7-02.
- Actual field/mask/type boundaries: U-W16C5A7-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W16C5A7-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W16C5A7-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W16C5A7-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W16C5A7-02. This is source inspection, not a runtime parity claim.
- **U-W16C5A7-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W16C5A7-02.
- **U-W16C5A7-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

2/2 blocks; 0/0 encoded-only slots retained; 13 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1034`; `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1037`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Data.wdw:10`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Data.wdw:10`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Data.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Data.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:635`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:638`
