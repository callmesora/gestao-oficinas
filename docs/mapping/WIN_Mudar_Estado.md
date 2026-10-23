# Mapping — WIN_Mudar_Estado

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw`; designer `dossier: WIN_Mudar_Estado`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Confirm state via leading character.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:600 (Open in WIN_Ordens_Reparacao_Form)`
```wlanguage
IF HReadFirst(dsQry_select_estados_reparacao)=True THEN
IF dsQry_select_estados_reparacao.confirmacao=True THEN
nResultado is int=open(win_mudar_estado,dsQry_select_estados_reparacao.descricao)
SWITCH nResultado
//				YesNo(0,"Mudar estado da reparação para '"+dsQry_select_estados_reparacao.descricao+"'?")
CASE 0
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry displays target state and result0. Confirm StringStartsWith(estado,EDT_Letra,ccignorecase); failure Verifique o carater de validação; success result1 and assumed encoded close. Empty text requires golden case.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw` exact event locations below; `dossier: WIN_Mudar_Estado/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-107f49bb66 — WIN_Mudar_Estado/BTN_Confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:198-202`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if StringStartsWith(estado,EDT_Letra,ccignorecase)=0 then; info("Verifique o carater de validação"); return; mywindow..ReturnedValue=1. Authoritative exact branch ledger: docs/mapping/WIN_Mudar_Estado.md under SRC-107f49bb66.

HFSQL: none in this block.

Other calls: Info("Verifique o carater de validação").

Exact executable branch/assignment ledger:
```wlanguage
if StringStartsWith(estado,EDT_Letra,ccignorecase)=0 then
info("Verifique o carater de validação")
return
end
mywindow..ReturnedValue=1
```

Assumed action following code: Close the window (`proposed: A-2b6ca2`).

### SRC-deff9a0792 — WIN_Mudar_Estado [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:283-284`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(estado); STC_Titulo="Mudar estado da reparação para '"+estado+"'?". Authoritative exact branch ledger: docs/mapping/WIN_Mudar_Estado.md under SRC-deff9a0792.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(estado)
STC_Titulo="Mudar estado da reparação para '"+estado+"'?"
```

### SRC-550b8c0090 — WIN_Mudar_Estado

Event `34`: End of initialization; `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:287-287`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): End of initialization [34]: mywindow..ReturnedValue=0. Authoritative exact branch ledger: docs/mapping/WIN_Mudar_Estado.md under SRC-550b8c0090.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
mywindow..ReturnedValue=0
```

### SRC-18aed8dc67 — WIN_Mudar_Estado/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:41; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-63a9d89884 — WIN_Mudar_Estado/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:64; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-493ec73822 — WIN_Mudar_Estado/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:89; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-ce43a94882 — WIN_Mudar_Estado/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:114; proposed: A-2b6ca2`. Proposal remains unconfirmed.

### SRC-94deeaef1d — WIN_Mudar_Estado/BTN_Cancelar [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:225; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W20AB1F-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- Explicit message/resource shell outcomes: U-W20AB1F-04.
- Actual field/mask/type boundaries: U-W20AB1F-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W20AB1F-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W20AB1F-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W20AB1F-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W20AB1F-02. This is source inspection, not a runtime parity claim.
- **U-W20AB1F-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W20AB1F-05** — Golden boundary outcomes for text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

3/3 blocks; 5/5 encoded-only slots retained; 25 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:600`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Mudar_Estado.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Mudar_Estado.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Mudar_Estado.wdw:9`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Mudar_Estado.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:671`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:674`
