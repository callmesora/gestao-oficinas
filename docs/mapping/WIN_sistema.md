# Mapping — WIN_sistema

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw`; designer `dossier: WIN_sistema`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Edit singleton workshop refresh and closure configuration.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:497 (Open in WIN_MENU)`
```wlanguage
-
code : |1-
open(win_sistema)
type : 32
-
name : MENU_OPT_Exit
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry reads first sistema record into three refresh controls,lookback days and two closure times. Guardar rereads first; HModify existing or HAdd when none,assigning exactly same six values. No explicit validation,transaction,return checking or multirow guard. Existing refresh windows create timers at their own entry,so changed interval does not explicitly recreate active timers; labor updater rereads closure times each refresh. Save close is encoded assumed.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw` exact event locations below; `dossier: WIN_sistema/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-d9a33f8b29 — WIN_sistema/BTN_Guardar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:198-214`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if hreadfirst(sistema)=true then; sistema.Tempo_ordem_reparacao=EDT_Atualizacao_ordens_reparacao; sistema.Tempo_materiais=EDT_Atualizacao_materiais; sistema.Tempo_tempos=EDT_Atualizacao_tempos; sistema.Data_inicio=EDT_Data_inicio; sistema.encerrar_tempos1=EDT_encerrar_tempos_1; sistema.encerrar_tempos2=EDT_encerrar_tempos_2; hmodify(sistema); sistema.Tempo_ordem_reparacao=EDT_Atualizacao_ordens_reparacao; sistema.Tempo_materiais=EDT_Atualizacao_materiais; sistema.Tempo_tempos=EDT_Atualizacao_tempos; sistema.Data_inicio=EDT_Data_inicio; sistema.encerrar_tempos1=EDT_encerrar_tempos_1; sistema.encerrar_tempos2=EDT_encerrar_tempos_2; hadd(sistema). Authoritative exact branch ledger: docs/mapping/WIN_sistema.md under SRC-d9a33f8b29.

HFSQL: HReadFirst(sistema); HAdd(sistema); HModify(sistema).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
if hreadfirst(sistema)=true then
sistema.Tempo_ordem_reparacao=EDT_Atualizacao_ordens_reparacao
sistema.Tempo_materiais=EDT_Atualizacao_materiais
sistema.Tempo_tempos=EDT_Atualizacao_tempos
sistema.Data_inicio=EDT_Data_inicio
sistema.encerrar_tempos1=EDT_encerrar_tempos_1
sistema.encerrar_tempos2=EDT_encerrar_tempos_2
hmodify(sistema)
else
sistema.Tempo_ordem_reparacao=EDT_Atualizacao_ordens_reparacao
sistema.Tempo_materiais=EDT_Atualizacao_materiais
sistema.Tempo_tempos=EDT_Atualizacao_tempos
sistema.Data_inicio=EDT_Data_inicio
sistema.encerrar_tempos1=EDT_encerrar_tempos_1
sistema.encerrar_tempos2=EDT_encerrar_tempos_2
hadd(sistema)
END
```

Assumed action following code: Close the window (`proposed: A-2b6ca2`).

### SRC-9890c46def — WIN_sistema [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:418-426`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); if hreadfirst(sistema)=true then; EDT_Atualizacao_materiais=sistema.Tempo_materiais; EDT_Atualizacao_ordens_reparacao=sistema.Tempo_ordem_reparacao; EDT_Atualizacao_tempos=sistema.Tempo_tempos; EDT_Data_inicio=sistema.Data_inicio; EDT_encerrar_tempos_1=sistema.encerrar_tempos1; EDT_encerrar_tempos_2=sistema.encerrar_tempos2. Authoritative exact branch ledger: docs/mapping/WIN_sistema.md under SRC-9890c46def.

HFSQL: HReadFirst(sistema).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
if hreadfirst(sistema)=true then
EDT_Atualizacao_materiais=sistema.Tempo_materiais
EDT_Atualizacao_ordens_reparacao=sistema.Tempo_ordem_reparacao
EDT_Atualizacao_tempos=sistema.Tempo_tempos
EDT_Data_inicio=sistema.Data_inicio
EDT_encerrar_tempos_1=sistema.encerrar_tempos1
EDT_encerrar_tempos_2=sistema.encerrar_tempos2
END
```

### SRC-0fc470751c — WIN_sistema/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-45eacef786 — WIN_sistema/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-46870aa3b1 — WIN_sistema/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-adaae93e0b — WIN_sistema/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

### SRC-70b6561cc6 — WIN_sistema/BTN_Cancelar [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:237; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HReadFirst: `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:198`; `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:419`.
- HAdd: `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:213`.
- HModify: `sistema` at `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw:205`.

## Behavior checklist

- Open and native keyboard: U-W3BC89B-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- Actual data/timer/lock/write failure cases: U-W3BC89B-03.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W3BC89B-02.
- Actual field/mask/type boundaries: U-W3BC89B-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W3BC89B-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W3BC89B-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W3BC89B-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for hadd, hmodify, hreadfirst; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W3BC89B-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W3BC89B-02.
- **U-W3BC89B-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

2/2 blocks; 5/5 encoded-only slots retained; 30 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:497`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_sistema.wdw:10`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_sistema.wdw:10`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_sistema.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_sistema.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:587`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:590`
