# Mapping — WIN_Inventario

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw`; designer `dossier: WIN_Inventario`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

View and print inventory.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:803 (Open in WIN_MENU)`
```wlanguage
code : |1-
Open(WIN_Inventario_Reconstrucao)
Open(WIN_Inventario)
type : 32
-
name : OPT_Tempos_de_reparação_por_ordem
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Code only declares entry and preview/print RPT_inventario. Menu opens reconstruction before this unit. Native binding/columns in dossier.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw` exact event locations below; `dossier: WIN_Inventario/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-c437f42e25 — WIN_Inventario/BTN_Imprimir

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw:311-312`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: ipreview(); iPrintReport(RPT_inventario). Authoritative exact branch ledger: docs/mapping/WIN_Inventario.md under SRC-c437f42e25.

HFSQL: none in this block.

Other calls: iPreview(); iPrintReport(RPT_inventario).

Exact executable branch/assignment ledger:
```wlanguage
ipreview()
iPrintReport(RPT_inventario)
```

### SRC-6b39d8b23f — WIN_Inventario [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw:358-358`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(). Authoritative exact branch ledger: docs/mapping/WIN_Inventario.md under SRC-6b39d8b23f.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
```

### SRC-4485999810 — WIN_Inventario/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-7965ee7972 — WIN_Inventario/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-0727a93bf2 — WIN_Inventario/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-345272503c — WIN_Inventario/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

### SRC-b107b3b8a1 — WIN_Inventario/BTN_Sair [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw:335; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W450C10-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-W450C10-02. Preserve the event-specific refresh and selection calls.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W450C10-02.
- Actual field/mask/type boundaries: U-W450C10-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W450C10-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Parsed browsed_file/browsed_item values shown in the screen Binding cells are established dossier facts and excluded from this item. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W450C10-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_Artigos; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W450C10-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W450C10-02. This is source inspection, not a runtime parity claim.
- **U-W450C10-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W450C10-02.
- **U-W450C10-05** — Golden boundary outcomes for text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

2/2 blocks; 5/5 encoded-only slots retained; 25 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:4`; `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:11`; `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:260`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:802`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:803`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Inventario.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_inventario_Reconstrucao.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Inventario.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_inventario_Reconstrucao.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Inventario.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_inventario_Reconstrucao.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Inventario.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_inventario_Reconstrucao.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:611`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:614`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:617`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:620`
