# Mapping — WIN_Leitor_cod_barras_desconhecidos

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw`; designer `dossier: WIN_Leitor_cod_barras_desconhecidos`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Show unrecognized scanner rows.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:943 (Open in WIN_Material_reparacao_form)`
```wlanguage
END
IF h>0 THEN
Open(WIN_Leitor_cod_barras_desconhecidos)
HCancelDeclaration({"desconhecidos"})
ELSE
HCancelDeclaration({"desconhecidos"})
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry dynamically iterates desconhecidos into table; caller creates and cancels this source. Confirm closes; no article correction.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw` exact event locations below; `dossier: WIN_Leitor_cod_barras_desconhecidos/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-4bf917d0f9 — WIN_Leitor_cod_barras_desconhecidos/BTN_Confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:197-197`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Close(WIN_Leitor_cod_barras_desconhecidos). Authoritative exact branch ledger: docs/mapping/WIN_Leitor_cod_barras_desconhecidos.md under SRC-4bf917d0f9.

HFSQL: none in this block.

Other calls: Close(WIN_Leitor_cod_barras_desconhecidos).

Exact executable branch/assignment ledger:
```wlanguage
Close(WIN_Leitor_cod_barras_desconhecidos)
```

### SRC-a8ca5cd474 — WIN_Leitor_cod_barras_desconhecidos [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:326-329`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); FOR EACH {"desconhecidos"}; TableAddLine(TABLE_Leitura,{"desconhecidos.codbarras"},{"desconhecidos.quantidade"}). Authoritative exact branch ledger: docs/mapping/WIN_Leitor_cod_barras_desconhecidos.md under SRC-a8ca5cd474.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
FOR EACH {"desconhecidos"}
TableAddLine(TABLE_Leitura,{"desconhecidos.codbarras"},{"desconhecidos.quantidade"})
END
```

### SRC-92a59d68d7 — WIN_Leitor_cod_barras_desconhecidos/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-bbdcac82f2 — WIN_Leitor_cod_barras_desconhecidos/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-df51331452 — WIN_Leitor_cod_barras_desconhecidos/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-d58cb35cde — WIN_Leitor_cod_barras_desconhecidos/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-WB2879B-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-WB2879B-02. Preserve the event-specific refresh and selection calls.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-WB2879B-02.
- Actual field/mask/type boundaries: U-WB2879B-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-WB2879B-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-WB2879B-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_Leitura; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-WB2879B-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-WB2879B-02. This is source inspection, not a runtime parity claim.
- **U-WB2879B-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-WB2879B-02.
- **U-WB2879B-05** — Golden boundary outcomes for quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

2/2 blocks; 4/4 encoded-only slots retained; 23 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:943`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Leitor_cod_barras_desconhecidos.wdw:10`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Leitor_cod_barras_desconhecidos.wdw:10`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Leitor_cod_barras_desconhecidos.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Leitor_cod_barras_desconhecidos.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:539`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:542`
