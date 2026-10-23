# Mapping — WIN_Teclado_numerico

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw`; designer `dossier: WIN_Teclado_numerico`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Touch/physical bounded number entry.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:320 (Open in WIN_Inserir_quantidade_password)`
```wlanguage
code : |1-
IF lTeclado=True THEN
MySelf=Open(WIN_Teclado_numerico,"Quantidade",MySelf,3,0,999999)
END
type : 66049
-
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry(title,original,decimals,lower,upper),format16.<decimals>f,manual focus. First write replaces with0.;period fractional mode;C/Backspace clear all;minus toggles sign;digits append with precision and inclusive range gate. Confirm Val bounds else Valor fora dos limites;cancel original. Caption writes7. Minus disabled lower>0 only. Physical digits48..57,C67/c99/Backspace8 clear,period46,minus45,Enter13,Esc27.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw` exact event locations below; `dossier: WIN_Teclado_numerico/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-4ea020b78f — WIN_Teclado_numerico/BTN_um

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:35-36`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("1"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-4ea020b78f.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("1")
SetFocus(EDT_input_manual)
```

### SRC-3e31b12910 — WIN_Teclado_numerico/EDT_Texto

Event `15`: Entry; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:56-62`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Entry [15]: SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-3e31b12910.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
SetFocus(EDT_input_manual)
```

### SRC-ba5ef7d179 — WIN_Teclado_numerico/BTN_dois

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:88-89`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("2"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-ba5ef7d179.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("2")
SetFocus(EDT_input_manual)
```

### SRC-5d4c3598f5 — WIN_Teclado_numerico/BTN_tres

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:109-110`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("3"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-5d4c3598f5.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("3")
SetFocus(EDT_input_manual)
```

### SRC-710b94b5e7 — WIN_Teclado_numerico/BTN_quatro

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:130-131`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("4"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-710b94b5e7.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("4")
SetFocus(EDT_input_manual)
```

### SRC-d3cbd5974c — WIN_Teclado_numerico/BTN_cinco

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:151-152`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("5"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-d3cbd5974c.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("5")
SetFocus(EDT_input_manual)
```

### SRC-7066ec8057 — WIN_Teclado_numerico/BTN_seis

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:172-173`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("6"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-7066ec8057.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("6")
SetFocus(EDT_input_manual)
```

### SRC-c0a7483726 — WIN_Teclado_numerico/BTN_sete

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:193-194`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("7"). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-8cb68c182c.; SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-c0a7483726.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("7")
SetFocus(EDT_input_manual)
```

### SRC-4141216a3b — WIN_Teclado_numerico/BTN_oito

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:214-215`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("8"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-4141216a3b.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("8")
SetFocus(EDT_input_manual)
```

### SRC-372c2d3faa — WIN_Teclado_numerico/BTN_nove

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:235-236`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("9"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-372c2d3faa.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("9")
SetFocus(EDT_input_manual)
```

### SRC-ea65cb18bd — WIN_Teclado_numerico/BTN_zero

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:256-257`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("0"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-ea65cb18bd.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("0")
SetFocus(EDT_input_manual)
```

### SRC-0c715c00ca — WIN_Teclado_numerico/BTN_confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:281-287`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: if val(edt_texto)<nLimiteInferior or val(edt_texto)>nLimiteSuperior then; info("Valor fora dos limites ("+nLimiteInferior+" - "+nLimiteSuperior+")"); SetFocus(EDT_input_manual); return; Close(WIN_Teclado_numerico,VAL(EDT_Texto)). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-0c715c00ca.

HFSQL: none in this block.

Other calls: Info("Valor fora dos limites ("+nLimiteInferior+" - "+nLimiteSuperior+")"); SetFocus(EDT_input_manual); Close(WIN_Teclado_numerico).

Exact executable branch/assignment ledger:
```wlanguage
if val(edt_texto)<nLimiteInferior or val(edt_texto)>nLimiteSuperior then
info("Valor fora dos limites ("+nLimiteInferior+" - "+nLimiteSuperior+")")
SetFocus(EDT_input_manual)
return
END
Close(WIN_Teclado_numerico,VAL(EDT_Texto))
```

### SRC-7fd4b80de9 — WIN_Teclado_numerico/BTN_cancelar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:311-311`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: close(WIN_Teclado_numerico,nNumero). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-7fd4b80de9.

HFSQL: none in this block.

Other calls: Close(WIN_Teclado_numerico).

Exact executable branch/assignment ledger:
```wlanguage
close(WIN_Teclado_numerico,nNumero)
```

### SRC-8cb68c182c — WIN_Teclado_numerico/BTN_Caption

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:331-331`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("7"). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-8cb68c182c.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Escreve("7")
```

### SRC-7d837aacde — WIN_Teclado_numerico/BTN_ponto

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:351-352`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("."); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-7d837aacde.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve(".")
SetFocus(EDT_input_manual)
```

### SRC-868fab935f — WIN_Teclado_numerico/BTN_menos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:372-373`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("-"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-868fab935f.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("-")
SetFocus(EDT_input_manual)
```

### SRC-45d344dcc8 — WIN_Teclado_numerico/BTN_limpar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:393-395`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("C"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-45d344dcc8.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("C")
SetFocus(EDT_input_manual)
```

### SRC-49ee2912c4 — WIN_Teclado_numerico/EDT_input_manual

Event `65794`: Key pressed; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:424-463`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Key pressed [65794]: SWITCH _EVE.wParam; case 48; ExecuteProcess(BTN_zero,trtClick); case 49; ExecuteProcess(BTN_um,trtClick); case 50; ExecuteProcess(BTN_dois,trtClick); CASE 51; ExecuteProcess(BTN_tres,trtClick); CASE 52; ExecuteProcess(BTN_quatro,trtClick); CASE 53; ExecuteProcess(BTN_cinco,trtClick); CASE 54; ExecuteProcess(BTN_seis,trtClick); CASE 55; ExecuteProcess(BTN_sete,trtClick); CASE 56; ExecuteProcess(BTN_oito,trtClick); CASE 57; ExecuteProcess(BTN_nove,trtClick); CASE 67; ExecuteProcess(BTN_limpar,trtClick); CASE 99; ExecuteProcess(BTN_limpar,trtClick); CASE 8; ExecuteProcess(BTN_limpar,trtClick); CASE 46; ExecuteProcess(BTN_ponto,trtClick); CASE 45; ExecuteProcess(BTN_menos,trtClick); CASE 13; ExecuteProcess(BTN_confirmar,trtClick); CASE 27; ExecuteProcess(BTN_cancelar,trtClick). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-49ee2912c4.

HFSQL: none in this block.

Other calls: ExecuteProcess(BTN_zero); ExecuteProcess(BTN_um); ExecuteProcess(BTN_dois); ExecuteProcess(BTN_tres); ExecuteProcess(BTN_quatro); ExecuteProcess(BTN_cinco); ExecuteProcess(BTN_seis); ExecuteProcess(BTN_sete); ExecuteProcess(BTN_oito); ExecuteProcess(BTN_nove); ExecuteProcess(BTN_limpar); ExecuteProcess(BTN_limpar); ExecuteProcess(BTN_limpar); ExecuteProcess(BTN_ponto); ExecuteProcess(BTN_menos); ExecuteProcess(BTN_confirmar); ExecuteProcess(BTN_cancelar).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH _EVE.wParam
case 48
ExecuteProcess(BTN_zero,trtClick)
case 49
ExecuteProcess(BTN_um,trtClick)
case 50
ExecuteProcess(BTN_dois,trtClick)
CASE 51
ExecuteProcess(BTN_tres,trtClick)
CASE 52
ExecuteProcess(BTN_quatro,trtClick)
CASE 53
ExecuteProcess(BTN_cinco,trtClick)
CASE 54
ExecuteProcess(BTN_seis,trtClick)
CASE 55
ExecuteProcess(BTN_sete,trtClick)
CASE 56
ExecuteProcess(BTN_oito,trtClick)
CASE 57
ExecuteProcess(BTN_nove,trtClick)
CASE 67
ExecuteProcess(BTN_limpar,trtClick)
CASE 99
ExecuteProcess(BTN_limpar,trtClick)
CASE 8
ExecuteProcess(BTN_limpar,trtClick)
CASE 46
ExecuteProcess(BTN_ponto,trtClick)
CASE 45
ExecuteProcess(BTN_menos,trtClick)
CASE 13
ExecuteProcess(BTN_confirmar,trtClick)
CASE 27
ExecuteProcess(BTN_cancelar,trtClick)
END
```

### SRC-cbb939b412 — WIN_Teclado_numerico [WIN_Teclado_numerico]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:481-500`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE WIN_Teclado_numerico(cTitulo,nNumero,nDecimais,nLimiteInferior,nLimiteSuperior); lPrimeiravez is boolean; lPrimeiravez=True; lPartedecimal is boolean; lPartedecimal = False; BTN_Caption=cTitulo; If nLimiteInferior>0 THEN; BTN_menos..State=Grayed; cFormat is string; cFormat = "16."+NumToString(nDecimais)+"f"; EDT_Texto = NumToString(nNumero, cFormat); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-cbb939b412.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE WIN_Teclado_numerico(cTitulo,nNumero,nDecimais,nLimiteInferior,nLimiteSuperior)
lPrimeiravez is boolean
lPrimeiravez=True
lPartedecimal is boolean
lPartedecimal = False
BTN_Caption=cTitulo
If nLimiteInferior>0 THEN
BTN_menos..State=Grayed
END
cFormat is string
cFormat = "16."+NumToString(nDecimais)+"f"
EDT_Texto = NumToString(nNumero, cFormat)
SetFocus(EDT_input_manual)
```

### SRC-d4c076708a — WIN_Teclado_numerico [Escreve]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:525-593`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE Escreve(cChar); cNumero is string; nPosicaoPonto is int; cLadoEsquerdo is string; cLadoDireito is string; If lPrimeiravez=True THEN; EDT_Texto="0."; lPrimeiravez=False; cNumero = NoSpace(EDT_Texto); If cChar="." THEN; lPartedecimal=True; return; If cChar="C" THEN; lPartedecimal=False; EDT_Texto="0."; return; IF cChar="<" AND EDT_Texto="0." THEN; RETURN; IF cChar = "-" THEN; IF Middle(cNumero,1,1) NOT = "-"; cNumero="-"+cNumero; cNumero=Middle(cNumero,2); nPosicaoPonto = Position(cNumero,".",1); cLadoEsquerdo = Middle(cNumero,1,nPosicaoPonto-1); cLadoDireito  = Middle(cNumero,nPosicaoPonto+1); IF lPartedecimal = True THEN; IF Length(cLadoDireito)<nDecimais THEN; cLadoDireito=cLadoDireito+cChar; IF cLadoEsquerdo="0" AND Length(cLadoEsquerdo)=1 THEN; cLadoEsquerdo=""; cLadoEsquerdo=cLadoEsquerdo+cChar; cNumero = cLadoEsquerdo + "." +	cLadoDireito; IF Val(cNumero)>=nLimiteInferior AND Val(cNumero)<=nLimiteSuperior; EDT_Texto=cNumero. Authoritative exact branch ledger: docs/mapping/WIN_Teclado_numerico.md under SRC-d4c076708a.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE Escreve(cChar)
cNumero is string
nPosicaoPonto is int
cLadoEsquerdo is string
cLadoDireito is string
If lPrimeiravez=True THEN
EDT_Texto="0."
lPrimeiravez=False
END
cNumero = NoSpace(EDT_Texto)
If cChar="." THEN
lPartedecimal=True
return
end
If cChar="C" THEN
lPartedecimal=False
EDT_Texto="0."
return
end
IF cChar="<" AND EDT_Texto="0." THEN
RETURN
END
IF cChar = "-" THEN
IF Middle(cNumero,1,1) NOT = "-"
cNumero="-"+cNumero
ELSE
cNumero=Middle(cNumero,2)
END
ELSE
nPosicaoPonto = Position(cNumero,".",1)
cLadoEsquerdo = Middle(cNumero,1,nPosicaoPonto-1)
cLadoDireito  = Middle(cNumero,nPosicaoPonto+1)
IF lPartedecimal = True THEN
IF Length(cLadoDireito)<nDecimais THEN
cLadoDireito=cLadoDireito+cChar
END
ELSE
IF cLadoEsquerdo="0" AND Length(cLadoEsquerdo)=1 THEN
cLadoEsquerdo=""
END
cLadoEsquerdo=cLadoEsquerdo+cChar
END
cNumero = cLadoEsquerdo + "." +	cLadoDireito
END
IF Val(cNumero)>=nLimiteInferior AND Val(cNumero)<=nLimiteSuperior
EDT_Texto=cNumero
END
```

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W291790-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- Explicit message/resource shell outcomes: U-W291790-04.
- Actual field/mask/type boundaries: U-W291790-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W291790-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W291790-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W291790-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W291790-02. This is source inspection, not a runtime parity claim.
- **U-W291790-04** — Runtime shell title, icon, language and default/Esc behavior for the explicit Info/Error/YesNo/Dialog calls inventoried in this unit remain open. Resolve actual call-to-WDFAA variant wiring and observe one relevant instance; source arguments/resource labels and CASE results are known. Blocks message-shell/cancel fidelity; interim default: exact source arguments and recorded proposals, no destructive default invented.
- **U-W291790-05** — Golden boundary outcomes for numeric keyboard bounds, decimal separator and mask precision actually used in the ledger. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

20/20 blocks; 0/0 encoded-only slots retained; 43 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:320`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:603`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Teclado_numerico.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Teclado_numerico.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Teclado_numerico.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Teclado_numerico.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:317`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:320`
