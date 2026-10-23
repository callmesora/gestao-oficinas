# Mapping — WIN_Acesso

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw`; designer `dossier: WIN_Acesso`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Authenticate selected user.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:946 (Open in WIN_MENU)`
```wlanguage
hadd(utilizadores)
END
if open(WIN_Acesso)="cancelar" then
endprogram()
END
gsValor_entrada=CommandLine("modulo")
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Confirm uppercases typed password and compares selected utilizadores buffer; success returns continuar and closes. Default cancelar. Missing user has no explicit error. Touch keyboard only for modulo t/m. Credential values are omitted.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw` exact event locations below; `dossier: WIN_Acesso/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-c9144a3e08 — WIN_Acesso/EDT_palavra_passe

Event `66049`: Left button down; `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:274-276`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button down [66049]: if gsValor_entra="t" or gsValor_entra="m" then; myself=open(WIN_Teclado_Alfa,"Palavra Passe",myself..inputmask,myself..size,myself,true). Authoritative exact branch ledger: docs/mapping/WIN_Acesso.md under SRC-c9144a3e08.

HFSQL: none in this block.

Other calls: Open(WIN_Teclado_Alfa).

Exact executable branch/assignment ledger:
```wlanguage
if gsValor_entra="t" or gsValor_entra="m" then
myself=open(WIN_Teclado_Alfa,"Palavra Passe",myself..inputmask,myself..size,myself,true)
END
```

### SRC-0ca1dfb2e6 — WIN_Acesso/BTN_NoName1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:331-347`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: gnUtilizador=open(WIN_Table_utilizadores,true,gnUtilizador); if gnUtilizador<>0 then; hreadseek(utilizadores,Codigo,gnUtilizador,hIdentical); if hfound(utilizadores)=true then; EDT_utilizador=utilizadores.descricao; SetFocus(EDT_palavra_passe). Authoritative exact branch ledger: docs/mapping/WIN_Acesso.md under SRC-0ca1dfb2e6.

HFSQL: HReadSeek(utilizadores); HFound(utilizadores).

Other calls: Open(WIN_Table_utilizadores); SetFocus(EDT_palavra_passe).

Exact executable branch/assignment ledger:
```wlanguage
gnUtilizador=open(WIN_Table_utilizadores,true,gnUtilizador)
if gnUtilizador<>0 then
hreadseek(utilizadores,Codigo,gnUtilizador,hIdentical)
if hfound(utilizadores)=true then
EDT_utilizador=utilizadores.descricao
END
SetFocus(EDT_palavra_passe)
END
```

### SRC-7891e7fd29 — WIN_Acesso/BTN_Confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:371-395`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_palavra_passe=upper(EDT_palavra_passe); hreadseek(utilizadores,Codigo,gnUtilizador,hIdentical); if hfound(utilizadores)=true then; if utilizadores.palavra_passe=EDT_palavra_passe then; mywindow..ReturnedValue="continuar"; close(WIN_Acesso); info("Utilizador e/ou palavra-passe incorreto(s)"); return. Authoritative exact branch ledger: docs/mapping/WIN_Acesso.md under SRC-7891e7fd29.

HFSQL: HReadSeek(utilizadores); HFound(utilizadores).

Other calls: Info("Utilizador e/ou palavra-passe incorreto(s)"); Close(WIN_Acesso).

Exact executable branch/assignment ledger:
```wlanguage
EDT_palavra_passe=upper(EDT_palavra_passe)
hreadseek(utilizadores,Codigo,gnUtilizador,hIdentical)
if hfound(utilizadores)=true then
if utilizadores.palavra_passe=EDT_palavra_passe then
mywindow..ReturnedValue="continuar"
close(WIN_Acesso)
else
info("Utilizador e/ou palavra-passe incorreto(s)")
return
END
END
```

### SRC-64e6f50f16 — WIN_Acesso [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:441-445`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(); gsValor_entra is string; gsValor_entra=CommandLine("modulo"); gnUtilizador is int; mywindow..ReturnedValue="cancelar". Authoritative exact branch ledger: docs/mapping/WIN_Acesso.md under SRC-64e6f50f16.

HFSQL: none in this block.

Other calls: CommandLine("modulo").

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow()
gsValor_entra is string
gsValor_entra=CommandLine("modulo")
gnUtilizador is int
mywindow..ReturnedValue="cancelar"
```

### SRC-625323b545 — WIN_Acesso/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:83; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-81427aa063 — WIN_Acesso/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:108; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-60b4845e16 — WIN_Acesso/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:133; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-2fa7080070 — WIN_Acesso/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:158; proposed: A-2b6ca2`. Proposal remains unconfirmed.

### SRC-4604a4a437 — WIN_Acesso/BTN_Cancelar [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:418; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies

- HReadSeek: `utilizadores` at `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:333`; `utilizadores` at `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:372`.
- HFound: `utilizadores` at `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:334`; `utilizadores` at `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:373`.

## Behavior checklist

- Open and native keyboard: U-W9D7053-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- Actual data/timer/lock/write failure cases: U-W9D7053-03.
- Explicit message/resource shell outcomes: U-W9D7053-04.
- Actual field/mask/type boundaries: U-W9D7053-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W9D7053-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W9D7053-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W9D7053-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for hfound, hreadseek. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W9D7053-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W9D7053-05** — Golden boundary outcomes for empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

4/4 blocks; 5/5 encoded-only slots retained; 28 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:946`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Acesso.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Acesso.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Acesso.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Acesso.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:575`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:578`
