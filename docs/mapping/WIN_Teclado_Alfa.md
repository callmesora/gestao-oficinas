# Mapping — WIN_Teclado_Alfa

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw`; designer `dossier: WIN_Teclado_Alfa`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Touch/physical text/password entry.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:275 (Open in WIN_Acesso)`
```wlanguage
code : |1-
if gsValor_entra="t" or gsValor_entra="m" then
myself=open(WIN_Teclado_Alfa,"Palavra Passe",myself..inputmask,myself..size,myself,true)
END
type : 66049
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:219 (Open in WIN_Inserir_quantidade_password)`
```wlanguage
code : |1-
if lTeclado=true then
myself=open(WIN_Teclado_Alfa,"Palavra-passe",myself..inputmask,myself..size,myself,true)
END
type : 66049
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:364 (Open in WIN_Inserir_quantidade_password)`
```wlanguage
code : |1-
if lTeclado=true then
myself=open(WIN_Teclado_Alfa,"Descricao",myself..inputmask,myself..size,myself,false)
END
type : 66049
menu :
```
- `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:685 (Open in WIN_Table_artigos)`
```wlanguage
code : |1-
if lTeclado=true then
myself=open(WIN_Teclado_Alfa,"Pesquisa",myself..inputmask,myself..Size,myself,false)
ExecuteProcess(EDT_termo_pesquisa,trtChange)
END
type : 66049
```
- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:238 (Open in WIN_Tempos_Reparacao_Estado)`
```wlanguage
code : |1-
if lTeclado=true then
myself=open(WIN_Teclado_Alfa,"Descrição",myself..inputmask,myself..Size,myself,false)
END
type : 66049
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:317 (Open in WIN_Tempos_Reparacao_Estado)`
```wlanguage
code : |1-
IF lTeclado=True THEN
MySelf=Open(WIN_Teclado_Alfa,"Serviço",MySelf..InputMask,MySelf..Size,MySelf,False)
END
type : 66049
-
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry title/mask/maxchars/original/password;cancel original,confirmtext. nomepasta disables slash/backslash/colon/star/question/quote buttons. Caps1lowerwhite,2one-uppercase darkgreen,3persistentuppercase lightgreen. Accents grave/acute/circumflex A,E,I;tilde A;others discard accent;Ç separately. Delete-last truncates one;clear all empties. Physical comma44 dispatches semicolon;caption writes7. Exact all-key mapping in ledger. Size overflow and disabled physical dispatch need golden cases.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw` exact event locations below; `dossier: WIN_Teclado_Alfa/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-46647faa88 — WIN_Teclado_Alfa/BTN_1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:35-36`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("1"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-46647faa88.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("1")
SetFocus(EDT_input_manual)
```

### SRC-251b6fea58 — WIN_Teclado_Alfa/BTN_CapsLock

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:56-67`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: switch nCapsLock; CASE 1; nCapsLock=2; MySelf..Color=DarkGreen; CASE 2; nCapsLock=3; MySelf..Color=LightGreen; OTHER CASE; nCapsLock=1; MySelf..Color=White; SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-251b6fea58.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
switch nCapsLock
CASE 1
nCapsLock=2
MySelf..Color=DarkGreen
CASE 2
nCapsLock=3
MySelf..Color=LightGreen
OTHER CASE
nCapsLock=1
MySelf..Color=White
END
SetFocus(EDT_input_manual)
```

### SRC-0d75702e3f — WIN_Teclado_Alfa/BTN_2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:87-88`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("2"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-0d75702e3f.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("2")
SetFocus(EDT_input_manual)
```

### SRC-ec8689fbdb — WIN_Teclado_Alfa/BTN_3

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:108-109`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("3"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-ec8689fbdb.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("3")
SetFocus(EDT_input_manual)
```

### SRC-d642fd7794 — WIN_Teclado_Alfa/BTN_4

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:129-130`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("4"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-d642fd7794.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("4")
SetFocus(EDT_input_manual)
```

### SRC-fa831a48fd — WIN_Teclado_Alfa/BTN_5

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:150-151`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("5"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-fa831a48fd.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("5")
SetFocus(EDT_input_manual)
```

### SRC-c0259ce687 — WIN_Teclado_Alfa/BTN_6

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:171-172`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("6"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-c0259ce687.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("6")
SetFocus(EDT_input_manual)
```

### SRC-f334040d6e — WIN_Teclado_Alfa/BTN_7

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:192-193`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("7"). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-229e3f79de.; SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-f334040d6e.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("7")
SetFocus(EDT_input_manual)
```

### SRC-4f980137d2 — WIN_Teclado_Alfa/BTN_8

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:213-214`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("8"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-4f980137d2.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("8")
SetFocus(EDT_input_manual)
```

### SRC-62fcd8076b — WIN_Teclado_Alfa/BTN_9

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:234-235`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("9"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-62fcd8076b.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("9")
SetFocus(EDT_input_manual)
```

### SRC-3d41161428 — WIN_Teclado_Alfa/BTN_0

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:255-256`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("0"); setfocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-3d41161428.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("0")
setfocus(EDT_input_manual)
```

### SRC-2db5680c5c — WIN_Teclado_Alfa/BTN_q

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:276-277`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("Q"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-2db5680c5c.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("Q")
setFocus(EDT_input_manual)
```

### SRC-ceeda6ca47 — WIN_Teclado_Alfa/BTN_w

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:297-298`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("W"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-ceeda6ca47.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("W")
setFocus(EDT_input_manual)
```

### SRC-b2493cee2c — WIN_Teclado_Alfa/BTN_e

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:318-319`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("E"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-b2493cee2c.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("E")
setFocus(EDT_input_manual)
```

### SRC-b994c07412 — WIN_Teclado_Alfa/BTN_r

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:339-340`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("R"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-b994c07412.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("R")
setFocus(EDT_input_manual)
```

### SRC-b9f3d7fe17 — WIN_Teclado_Alfa/BTN_t

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:360-361`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("T"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-b9f3d7fe17.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("T")
setFocus(EDT_input_manual)
```

### SRC-396131c111 — WIN_Teclado_Alfa/BTN_y

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:381-382`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("Y"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-396131c111.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("Y")
setFocus(EDT_input_manual)
```

### SRC-59332b5b81 — WIN_Teclado_Alfa/BTN_u

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:402-403`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("U"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-59332b5b81.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("U")
setFocus(EDT_input_manual)
```

### SRC-872ad8f24f — WIN_Teclado_Alfa/BTN_i

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:423-424`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("I"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-872ad8f24f.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("I")
SetFocus(EDT_input_manual)
```

### SRC-a181d115da — WIN_Teclado_Alfa/BTN_o

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:444-445`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("O"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-a181d115da.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("O")
SetFocus(EDT_input_manual)
```

### SRC-d20b969266 — WIN_Teclado_Alfa/BTN_p

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:465-466`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("P"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-d20b969266.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("P")
SetFocus(EDT_input_manual)
```

### SRC-188fd6c6be — WIN_Teclado_Alfa/BTN_a

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:486-487`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("A"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-188fd6c6be.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("A")
setFocus(EDT_input_manual)
```

### SRC-2781ad0eaf — WIN_Teclado_Alfa/BTN_s

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:507-508`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("S"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-2781ad0eaf.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("S")
setFocus(EDT_input_manual)
```

### SRC-1ed7008355 — WIN_Teclado_Alfa/BTN_d

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:528-529`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("D"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-1ed7008355.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("D")
setFocus(EDT_input_manual)
```

### SRC-90fbc1c6b8 — WIN_Teclado_Alfa/BTN_f

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:549-550`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("F"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-90fbc1c6b8.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("F")
setFocus(EDT_input_manual)
```

### SRC-1d7c4de8df — WIN_Teclado_Alfa/BTN_g

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:570-571`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("G"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-1d7c4de8df.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("G")
setFocus(EDT_input_manual)
```

### SRC-6bb2ba69db — WIN_Teclado_Alfa/BTN_h

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:591-592`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("H"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-6bb2ba69db.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("H")
setFocus(EDT_input_manual)
```

### SRC-d684a7974e — WIN_Teclado_Alfa/BTN_j

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:612-613`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("J"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-d684a7974e.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("J")
setFocus(EDT_input_manual)
```

### SRC-798a5463a0 — WIN_Teclado_Alfa/BTN_k

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:633-634`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("K"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-798a5463a0.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("K")
SetFocus(EDT_input_manual)
```

### SRC-ddac94d57f — WIN_Teclado_Alfa/BTN_l

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:654-655`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("L"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-ddac94d57f.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("L")
SetFocus(EDT_input_manual)
```

### SRC-9b6b72894b — WIN_Teclado_Alfa/BTN_c_cedilha

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:675-676`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("Ç"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-9b6b72894b.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("Ç")
SetFocus(EDT_input_manual)
```

### SRC-02c4f1c45f — WIN_Teclado_Alfa/BTN_z

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:696-697`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("Z"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-02c4f1c45f.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("Z")
setFocus(EDT_input_manual)
```

### SRC-81fa574a64 — WIN_Teclado_Alfa/BTN_x

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:717-718`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("X"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-81fa574a64.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("X")
setFocus(EDT_input_manual)
```

### SRC-d48618530e — WIN_Teclado_Alfa/BTN_c

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:738-739`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("C"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-d48618530e.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("C")
setFocus(EDT_input_manual)
```

### SRC-bfedfd004a — WIN_Teclado_Alfa/BTN_v

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:759-760`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("V"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-bfedfd004a.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("V")
setFocus(EDT_input_manual)
```

### SRC-23d028db30 — WIN_Teclado_Alfa/BTN_b

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:780-781`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("B"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-23d028db30.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("B")
setFocus(EDT_input_manual)
```

### SRC-6ae4f209c8 — WIN_Teclado_Alfa/BTN_n

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:801-802`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("N"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-6ae4f209c8.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("N")
setFocus(EDT_input_manual)
```

### SRC-b2ad00098f — WIN_Teclado_Alfa/BTN_m

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:822-823`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("M"); setFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-b2ad00098f.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("M")
setFocus(EDT_input_manual)
```

### SRC-dd0c14c5dd — WIN_Teclado_Alfa/BTN_espaco

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:843-844`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve(" "); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-dd0c14c5dd.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve(" ")
SetFocus(EDT_input_manual)
```

### SRC-812342c346 — WIN_Teclado_Alfa/BTN_acento_grave

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:864-865`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("`"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-812342c346.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("`")
SetFocus(EDT_input_manual)
```

### SRC-deb3586790 — WIN_Teclado_Alfa/BTN_acento_agudo

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:885-886`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("´"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-deb3586790.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("´")
SetFocus(EDT_input_manual)
```

### SRC-dc608b34a3 — WIN_Teclado_Alfa/BTN_acento_til

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:906-907`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("~"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-dc608b34a3.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("~")
SetFocus(EDT_input_manual)
```

### SRC-e437ee95d0 — WIN_Teclado_Alfa/BTN_acento_circunflexo

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:927-928`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("/\"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-e437ee95d0.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("/\")
SetFocus(EDT_input_manual)
```

### SRC-106e0a816a — WIN_Teclado_Alfa/BTN_apagar_ultimo

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:948-949`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("APAGAR_ULTIMO"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-106e0a816a.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("APAGAR_ULTIMO")
SetFocus(EDT_input_manual)
```

### SRC-b36615d7d6 — WIN_Teclado_Alfa/BTN_apagar_tudo

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:969-970`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("APAGAR_TUDO"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-b36615d7d6.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("APAGAR_TUDO")
SetFocus(EDT_input_manual)
```

### SRC-6a5d43d37f — WIN_Teclado_Alfa/BTN_confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:994-994`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Close(WIN_Teclado_Alfa,EDT_Texto). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-6a5d43d37f.

HFSQL: none in this block.

Other calls: Close(WIN_Teclado_Alfa).

Exact executable branch/assignment ledger:
```wlanguage
Close(WIN_Teclado_Alfa,EDT_Texto)
```

### SRC-86700c4499 — WIN_Teclado_Alfa/BTN_cancelar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1014-1014`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: close(WIN_Teclado_Alfa,cValueInicial). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-86700c4499.

HFSQL: none in this block.

Other calls: Close(WIN_Teclado_Alfa).

Exact executable branch/assignment ledger:
```wlanguage
close(WIN_Teclado_Alfa,cValueInicial)
```

### SRC-229e3f79de — WIN_Teclado_Alfa/BTN_Caption

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1034-1034`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("7"). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-229e3f79de.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Escreve("7")
```

### SRC-60fcdd5d0a — WIN_Teclado_Alfa/BTN_asterisco

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1054-1055`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("*"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-60fcdd5d0a.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("*")
SetFocus(EDT_input_manual)
```

### SRC-a49582b053 — WIN_Teclado_Alfa/BTN_mais

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1075-1076`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("+"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-a49582b053.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("+")
SetFocus(EDT_input_manual)
```

### SRC-c1d5975d5e — WIN_Teclado_Alfa/BTN_menos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1096-1097`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("-"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-c1d5975d5e.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("-")
SetFocus(EDT_input_manual)
```

### SRC-874f46976c — WIN_Teclado_Alfa/BTN_under_score

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1117-1118`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("_"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-874f46976c.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("_")
SetFocus(EDT_input_manual)
```

### SRC-06647c282f — WIN_Teclado_Alfa/BTN_barra_esquerda

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1138-1139`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("\"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-06647c282f.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("\")
SetFocus(EDT_input_manual)
```

### SRC-719ec660dd — WIN_Teclado_Alfa/BTN_barra_direita

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1159-1160`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("/"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-719ec660dd.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("/")
SetFocus(EDT_input_manual)
```

### SRC-d6df57a4f3 — WIN_Teclado_Alfa/BTN_ponto

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1180-1181`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("."); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-d6df57a4f3.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve(".")
SetFocus(EDT_input_manual)
```

### SRC-06ba9d515c — WIN_Teclado_Alfa/BTN_virgula

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1201-1202`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve(","); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-06ba9d515c.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve(",")
SetFocus(EDT_input_manual)
```

### SRC-ea304c884b — WIN_Teclado_Alfa/BTN_dois_pontos

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1222-1223`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve(":"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-ea304c884b.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve(":")
SetFocus(EDT_input_manual)
```

### SRC-d6f8d293c0 — WIN_Teclado_Alfa/BTN_ponto_virgula

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1243-1244`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve(";"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-d6f8d293c0.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve(";")
SetFocus(EDT_input_manual)
```

### SRC-7125e4f803 — WIN_Teclado_Alfa/BTN_parentesis_esquerda

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1264-1265`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("("); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-7125e4f803.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("(")
SetFocus(EDT_input_manual)
```

### SRC-b3c39ec455 — WIN_Teclado_Alfa/BTN_parentesis_direita

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1285-1286`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve(")"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-b3c39ec455.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve(")")
SetFocus(EDT_input_manual)
```

### SRC-bafb058763 — WIN_Teclado_Alfa/BTN_arroba

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1306-1307`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("@"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-bafb058763.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("@")
SetFocus(EDT_input_manual)
```

### SRC-02313c03f5 — WIN_Teclado_Alfa/BTN_euro

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1327-1328`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("€"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-02313c03f5.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("€")
SetFocus(EDT_input_manual)
```

### SRC-6212bd1fe3 — WIN_Teclado_Alfa/BTN_percentagem

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1348-1349`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("%"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-6212bd1fe3.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("%")
SetFocus(EDT_input_manual)
```

### SRC-1cc6b12b6c — WIN_Teclado_Alfa/BTN_ponto_interrogacao

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1369-1370`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("?"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-1cc6b12b6c.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("?")
SetFocus(EDT_input_manual)
```

### SRC-a825222e20 — WIN_Teclado_Alfa/BTN_a_cima

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1390-1391`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("ª"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-a825222e20.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("ª")
SetFocus(EDT_input_manual)
```

### SRC-8cb3aa8e5e — WIN_Teclado_Alfa/BTN_o_cima

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1411-1412`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("º"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-8cb3aa8e5e.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("º")
SetFocus(EDT_input_manual)
```

### SRC-9ae1535948 — WIN_Teclado_Alfa/BTN_i_comercial

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1432-1433`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("&"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-9ae1535948.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("&")
SetFocus(EDT_input_manual)
```

### SRC-42b336def5 — WIN_Teclado_Alfa/BTN_aspas

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1453-1454`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve(""""); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-42b336def5.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("""")
SetFocus(EDT_input_manual)
```

### SRC-a7f27e18cf — WIN_Teclado_Alfa/BTN_igual

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1474-1475`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("="); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-a7f27e18cf.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("=")
SetFocus(EDT_input_manual)
```

### SRC-6ea68d15fc — WIN_Teclado_Alfa/BTN_cardinal

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1495-1496`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: Escreve("#"); SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-6ea68d15fc.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
Escreve("#")
SetFocus(EDT_input_manual)
```

### SRC-d7b1caf69a — WIN_Teclado_Alfa/EDT_input_manual

Event `65794`: Key pressed; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1541-1731`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Key pressed [65794]: SWITCH _EVE.wParam; CASE 96; ExecuteProcess(BTN_acento_grave,trtClick); CASE 94; ExecuteProcess(BTN_acento_circunflexo,trtClick); CASE 126; ExecuteProcess(BTN_acento_til,trtClick); case 171; ExecuteProcess(BTN_acento_agudo,trtclick); CASE 219; ExecuteProcess(BTN_euro,trtClick); CASE 187; ExecuteProcess(BTN_a_cima,trtClick); CASE 188; ExecuteProcess(BTN_o_cima,trtClick); case 130; ExecuteProcess(BTN_c_cedilha,trtclick); case 141; ExecuteProcess(BTN_c_cedilha,trtClick); CASE 43; ExecuteProcess(BTN_mais,trtClick); CASE 37; ExecuteProcess(BTN_percentagem,trtClick); CASE 63; ExecuteProcess(BTN_ponto_interrogacao,trtClick); CASE 61; ExecuteProcess(BTN_igual,trtClick); CASE 35; ExecuteProcess(BTN_cardinal,trtClick); CASE 34; ExecuteProcess(BTN_aspas,trtClick); CASE 38; ExecuteProcess(BTN_i_comercial,trtClick); CASE 64; ExecuteProcess(BTN_arroba,trtClick); CASE 40; ExecuteProcess(BTN_parentesis_esquerda,trtClick); CASE 41; ExecuteProcess(BTN_parentesis_direita,trtClick); CASE 59; ExecuteProcess(BTN_ponto_virgula,trtClick); CASE 58; ExecuteProcess(BTN_dois_pontos,trtClick); CASE 44; ExecuteProcess(BTN_ponto_virgula,trtClick); CASE 92; ExecuteProcess(BTN_barra_esquerda,trtClick); CASE 47; Ex. Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-d7b1caf69a.

HFSQL: none in this block.

Other calls: ExecuteProcess(BTN_acento_grave); ExecuteProcess(BTN_acento_circunflexo); ExecuteProcess(BTN_acento_til); ExecuteProcess(BTN_acento_agudo); ExecuteProcess(BTN_euro); ExecuteProcess(BTN_a_cima); ExecuteProcess(BTN_o_cima); ExecuteProcess(BTN_c_cedilha); ExecuteProcess(BTN_c_cedilha); ExecuteProcess(BTN_mais); ExecuteProcess(BTN_percentagem); ExecuteProcess(BTN_ponto_interrogacao); ExecuteProcess(BTN_igual); ExecuteProcess(BTN_cardinal); ExecuteProcess(BTN_aspas); ExecuteProcess(BTN_i_comercial); ExecuteProcess(BTN_arroba); ExecuteProcess(BTN_parentesis_esquerda); ExecuteProcess(BTN_parentesis_direita); ExecuteProcess(BTN_ponto_virgula); ExecuteProcess(BTN_dois_pontos); ExecuteProcess(BTN_ponto_virgula); ExecuteProcess(BTN_barra_esquerda); ExecuteProcess(BTN_barra_direita); ExecuteProcess(BTN_under_score); ExecuteProcess(BTN_asterisco); ExecuteProcess(BTN_ponto); ExecuteProcess(BTN_menos); ExecuteProcess(BTN_espaco); ExecuteProcess(BTN_a); ExecuteProcess(BTN_b); ExecuteProcess(BTN_c); ExecuteProcess(BTN_d); ExecuteProcess(BTN_e); ExecuteProcess(BTN_f); ExecuteProcess(BTN_g); ExecuteProcess(BTN_h); ExecuteProcess(BTN_i); ExecuteProcess(BTN_j); ExecuteProcess(BTN_k); ExecuteProcess(BTN_l); ExecuteProcess(BTN_m); ExecuteProcess(BTN_n); ExecuteProcess(BTN_o); ExecuteProcess(BTN_p); ExecuteProcess(BTN_q); ExecuteProcess(BTN_r); ExecuteProcess(BTN_s); ExecuteProcess(BTN_t); ExecuteProcess(BTN_u); ExecuteProcess(BTN_v); ExecuteProcess(BTN_w); ExecuteProcess(BTN_x); ExecuteProcess(BTN_y); ExecuteProcess(BTN_z); ExecuteProcess(btn_a); ExecuteProcess(BTN_b); ExecuteProcess(BTN_C); ExecuteProcess(BTN_d); ExecuteProcess(BTN_e); ExecuteProcess(BTN_f); ExecuteProcess(BTN_g); ExecuteProcess(BTN_h); ExecuteProcess(BTN_i); ExecuteProcess(BTN_j); ExecuteProcess(BTN_k); ExecuteProcess(BTN_l); ExecuteProcess(BTN_m); ExecuteProcess(BTN_n); ExecuteProcess(BTN_o); ExecuteProcess(BTN_p); ExecuteProcess(BTN_q); ExecuteProcess(BTN_r); ExecuteProcess(BTN_s); ExecuteProcess(BTN_t); ExecuteProcess(BTN_u); ExecuteProcess(BTN_v); ExecuteProcess(BTN_w); ExecuteProcess(BTN_x); ExecuteProcess(BTN_y); ExecuteProcess(BTN_z); ExecuteProcess(btn_0); ExecuteProcess(BTN_1); ExecuteProcess(BTN_2); ExecuteProcess(BTN_3); ExecuteProcess(BTN_4); ExecuteProcess(BTN_5); ExecuteProcess(BTN_6); ExecuteProcess(BTN_7); ExecuteProcess(BTN_8); ExecuteProcess(BTN_9); ExecuteProcess(BTN_apagar_ultimo); ExecuteProcess(BTN_confirmar); ExecuteProcess(BTN_cancelar).

Exact executable branch/assignment ledger:
```wlanguage
SWITCH _EVE.wParam
CASE 96
ExecuteProcess(BTN_acento_grave,trtClick)
CASE 94
ExecuteProcess(BTN_acento_circunflexo,trtClick)
CASE 126
ExecuteProcess(BTN_acento_til,trtClick)
case 171
ExecuteProcess(BTN_acento_agudo,trtclick)
CASE 219
ExecuteProcess(BTN_euro,trtClick)
CASE 187
ExecuteProcess(BTN_a_cima,trtClick)
CASE 188
ExecuteProcess(BTN_o_cima,trtClick)
case 130
ExecuteProcess(BTN_c_cedilha,trtclick)
case 141
ExecuteProcess(BTN_c_cedilha,trtClick)
CASE 43
ExecuteProcess(BTN_mais,trtClick)
CASE 37
ExecuteProcess(BTN_percentagem,trtClick)
CASE 63
ExecuteProcess(BTN_ponto_interrogacao,trtClick)
CASE 61
ExecuteProcess(BTN_igual,trtClick)
CASE 35
ExecuteProcess(BTN_cardinal,trtClick)
CASE 34
ExecuteProcess(BTN_aspas,trtClick)
CASE 38
ExecuteProcess(BTN_i_comercial,trtClick)
CASE 64
ExecuteProcess(BTN_arroba,trtClick)
CASE 40
ExecuteProcess(BTN_parentesis_esquerda,trtClick)
CASE 41
ExecuteProcess(BTN_parentesis_direita,trtClick)
CASE 59
ExecuteProcess(BTN_ponto_virgula,trtClick)
CASE 58
ExecuteProcess(BTN_dois_pontos,trtClick)
CASE 44
ExecuteProcess(BTN_ponto_virgula,trtClick)
CASE 92
ExecuteProcess(BTN_barra_esquerda,trtClick)
CASE 47
ExecuteProcess(BTN_barra_direita,trtClick)
CASE 95
ExecuteProcess(BTN_under_score,trtClick)
case 42
ExecuteProcess(BTN_asterisco,trtclick)
CASE 46
ExecuteProcess(BTN_ponto,trtClick)
CASE 45
ExecuteProcess(BTN_menos,trtClick)
case 32
ExecuteProcess(BTN_espaco,trtclick)
CASE 65
ExecuteProcess(BTN_a,trtClick)
CASE 66
ExecuteProcess(BTN_b,trtClick)
CASE 67
ExecuteProcess(BTN_c,trtClick)
CASE 68
ExecuteProcess(BTN_d,trtClick)
CASE 69
ExecuteProcess(BTN_e,trtClick)
CASE 70
ExecuteProcess(BTN_f,trtClick)
CASE 71
ExecuteProcess(BTN_g,trtClick)
CASE 72
ExecuteProcess(BTN_h,trtClick)
CASE 73
ExecuteProcess(BTN_i,trtClick)
CASE 74
ExecuteProcess(BTN_j,trtClick)
CASE 75
ExecuteProcess(BTN_k,trtClick)
CASE 76
ExecuteProcess(BTN_l,trtClick)
CASE 77
ExecuteProcess(BTN_m,trtClick)
CASE 78
ExecuteProcess(BTN_n,trtClick)
CASE 79
ExecuteProcess(BTN_o,trtClick)
CASE 80
ExecuteProcess(BTN_p,trtClick)
CASE 81
ExecuteProcess(BTN_q,trtClick)
CASE 82
ExecuteProcess(BTN_r,trtClick)
CASE 83
ExecuteProcess(BTN_s,trtClick)
CASE 84
ExecuteProcess(BTN_t,trtClick)
CASE 85
ExecuteProcess(BTN_u,trtClick)
CASE 86
ExecuteProcess(BTN_v,trtClick)
CASE 87
ExecuteProcess(BTN_w,trtClick)
CASE 88
ExecuteProcess(BTN_x,trtClick)
CASE 89
ExecuteProcess(BTN_y,trtClick)
CASE 90
ExecuteProcess(BTN_z,trtClick)
case 97
ExecuteProcess(btn_a,trtClick)
case 98
ExecuteProcess(BTN_b,trtClick)
CASE 99
ExecuteProcess(BTN_C,trtClick)
CASE 100
ExecuteProcess(BTN_d,trtClick)
CASE 101
ExecuteProcess(BTN_e,trtClick)
CASE 102
ExecuteProcess(BTN_f,trtClick)
CASE 103
ExecuteProcess(BTN_g,trtClick)
CASE 104
ExecuteProcess(BTN_h,trtClick)
CASE 105
ExecuteProcess(BTN_i,trtClick)
CASE 106
ExecuteProcess(BTN_j,trtClick)
CASE 107
ExecuteProcess(BTN_k,trtClick)
CASE 108
ExecuteProcess(BTN_l,trtClick)
CASE 109
ExecuteProcess(BTN_m,trtClick)
CASE 110
ExecuteProcess(BTN_n,trtClick)
CASE 111
ExecuteProcess(BTN_o,trtClick)
CASE 112
ExecuteProcess(BTN_p,trtClick)
CASE 113
ExecuteProcess(BTN_q,trtClick)
CASE 114
ExecuteProcess(BTN_r,trtClick)
CASE 115
ExecuteProcess(BTN_s,trtClick)
CASE 116
ExecuteProcess(BTN_t,trtClick)
CASE 117
ExecuteProcess(BTN_u,trtClick)
CASE 118
ExecuteProcess(BTN_v,trtClick)
CASE 119
ExecuteProcess(BTN_w,trtClick)
CASE 120
ExecuteProcess(BTN_x,trtClick)
CASE 121
ExecuteProcess(BTN_y,trtClick)
case 122
ExecuteProcess(BTN_z,trtClick)
case 48
ExecuteProcess(btn_0,trtClick)
case 49
ExecuteProcess(BTN_1,trtClick)
case 50
ExecuteProcess(BTN_2,trtClick)
CASE 51
ExecuteProcess(BTN_3,trtClick)
CASE 52
ExecuteProcess(BTN_4,trtClick)
CASE 53
ExecuteProcess(BTN_5,trtClick)
CASE 54
ExecuteProcess(BTN_6,trtClick)
CASE 55
ExecuteProcess(BTN_7,trtClick)
CASE 56
ExecuteProcess(BTN_8,trtClick)
CASE 57
ExecuteProcess(BTN_9,trtClick)
CASE 8
ExecuteProcess(BTN_apagar_ultimo,trtClick)
CASE 13
ExecuteProcess(BTN_confirmar,trtClick)
CASE 27
ExecuteProcess(BTN_cancelar,trtClick)
END
```

### SRC-9efdb82f68 — WIN_Teclado_Alfa [WIN_Teclado_Alfa]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1771-1794`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE WIN_Teclado_Alfa(cCaption,nMascara,nNumeroCaracteres,cValue,lPasswordChar); nCapsLock is int; nCapsLock = 1; cAcentos is string; cAcentos = ""; cValueInicial is string; cValueInicial = cValue; if lPasswordChar="nomepasta" then; lPasswordChar=False; BTN_barra_direita..Grayed=true; BTN_barra_esquerda..Grayed=True; BTN_dois_pontos..Grayed=True; BTN_asterisco..Grayed=True; BTN_ponto_interrogacao..Grayed=True; BTN_aspas..Grayed=True; BTN_Caption = cCaption; EDT_Texto..Password=lPasswordChar; EDT_Texto..InputMask=nMascara; EDT_Texto..Size=nNumeroCaracteres; EDT_Texto=cValue; SetFocus(EDT_input_manual). Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-9efdb82f68.

HFSQL: none in this block.

Other calls: SetFocus(EDT_input_manual).

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE WIN_Teclado_Alfa(cCaption,nMascara,nNumeroCaracteres,cValue,lPasswordChar)
nCapsLock is int
nCapsLock = 1
cAcentos is string
cAcentos = ""
cValueInicial is string
cValueInicial = cValue
if lPasswordChar="nomepasta" then
lPasswordChar=False
BTN_barra_direita..Grayed=true
BTN_barra_esquerda..Grayed=True
BTN_dois_pontos..Grayed=True
BTN_asterisco..Grayed=True
BTN_ponto_interrogacao..Grayed=True
BTN_aspas..Grayed=True
END
BTN_Caption = cCaption
EDT_Texto..Password=lPasswordChar
EDT_Texto..InputMask=nMascara
EDT_Texto..Size=nNumeroCaracteres
EDT_Texto=cValue
SetFocus(EDT_input_manual)
```

### SRC-ca4828ceb2 — WIN_Teclado_Alfa [Escreve]

Event `458752`: Local procedure; `legacy/GestaoOficinas_TesteIA/WIN_WIN_Teclado.wdw:1819-1979`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Local procedure [458752]: PROCEDURE Escreve(cChar); lEscrever is boolean; lEscrever = True; lUpperLower is boolean; lUpperLower = True; SWITCH cChar; case "APAGAR_TUDO"; EDT_Texto=""; lEscrever = False; CASE "APAGAR_ULTIMO"; iF Length(EDT_Texto)>1 THEN; EDT_Texto = Left(EDT_Texto,Length(EDT_Texto)-1); EDT_Texto = ""; lEscrever = False; CASE "`"; cAcentos="`"; lEscrever = False; CASE "´"; cAcentos="´"; lEscrever = False; CASE "/\"; cAcentos="/\"; lEscrever = False; CASE "~"; cAcentos="~"; lEscrever = False; iF lEscrever = True THEN; If cAcentos not = "" THEN; lUpperLower = False; If cAcentos = "`" THEN; SWITCH cChar; case "A"; IF nCapsLock<>1 THEN; cChar="À"; cChar="à"; CASE "E"; cChar="È"; IF nCapsLock<>1 THEN; cChar="È"; cChar="è"; CASE "I"; IF nCapsLock<>1 THEN; cChar="Ì"; cChar="ì"; OTHER CASE; lUpperLower = True; IF cAcentos = "´" THEN; SWITCH cChar; CASE "A"; IF nCapsLock<>1 THEN; cChar="Á"; cChar="á"; CASE "E"; cChar="É"; IF nCapsLock<>1 THEN; cChar="É"; cChar="é"; CASE "I"; IF nCapsLock<>1 THEN; cChar="Í"; cChar="í"; OTHER CASE; lUpperLower = True; IF cAcentos = "~" THEN; SWITCH cChar; CASE "A"; cChar="Ã"; IF nCapsLock<>1 THEN; cChar="Ã"; cChar="ã"; OTHER CASE; lUpperLower = True; IF cAcentos = "/\". Authoritative exact branch ledger: docs/mapping/WIN_Teclado_Alfa.md under SRC-ca4828ceb2.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE Escreve(cChar)
lEscrever is boolean
lEscrever = True
lUpperLower is boolean
lUpperLower = True
SWITCH cChar
case "APAGAR_TUDO"
EDT_Texto=""
lEscrever = False
CASE "APAGAR_ULTIMO"
iF Length(EDT_Texto)>1 THEN
EDT_Texto = Left(EDT_Texto,Length(EDT_Texto)-1)
ELSE
EDT_Texto = ""
END
lEscrever = False
CASE "`"
cAcentos="`"
lEscrever = False
CASE "´"
cAcentos="´"
lEscrever = False
CASE "/\"
cAcentos="/\"
lEscrever = False
CASE "~"
cAcentos="~"
lEscrever = False
END
iF lEscrever = True THEN
If cAcentos not = "" THEN
lUpperLower = False
If cAcentos = "`" THEN
SWITCH cChar
case "A"
IF nCapsLock<>1 THEN
cChar="À"
ELSE
cChar="à"
END
CASE "E"
cChar="È"
IF nCapsLock<>1 THEN
cChar="È"
ELSE
cChar="è"
END
CASE "I"
IF nCapsLock<>1 THEN
cChar="Ì"
ELSE
cChar="ì"
END
OTHER CASE
lUpperLower = True
END
END
IF cAcentos = "´" THEN
SWITCH cChar
CASE "A"
IF nCapsLock<>1 THEN
cChar="Á"
ELSE
cChar="á"
END
CASE "E"
cChar="É"
IF nCapsLock<>1 THEN
cChar="É"
ELSE
cChar="é"
END
CASE "I"
IF nCapsLock<>1 THEN
cChar="Í"
ELSE
cChar="í"
END
OTHER CASE
lUpperLower = True
END
END
IF cAcentos = "~" THEN
SWITCH cChar
CASE "A"
cChar="Ã"
IF nCapsLock<>1 THEN
cChar="Ã"
ELSE
cChar="ã"
END
OTHER CASE
lUpperLower = True
END
END
IF cAcentos = "/\" THEN
SWITCH cChar
CASE "A"
IF nCapsLock<>1 THEN
cChar="Â"
ELSE
cChar="â"
END
CASE "E"
IF nCapsLock<>1 THEN
cChar="Ê"
ELSE
cChar="ê"
END
CASE "I"
IF nCapsLock<>1 THEN
cChar="Î"
ELSE
cChar="î"
END
OTHER CASE
lUpperLower = True
END
END
else
If cChar="Ç" THEN
IF nCapsLock<>1 THEN
cChar="Ç"
ELSE
cChar="ç"
END
lUpperLower = False
END
END
If lUpperLower = True
IF nCapsLock<>1 THEN
cChar=UPPER(cChar)
ELSE
cChar=LOWER(cChar)
END
end
EDT_Texto=EDT_Texto+cChar
cAcentos=""
EDT_Texto..CursorEnd=Length(EDT_Texto)
If nCapsLock=2 THEN
nCapsLock=1
BTN_CapsLock..Color=White
END
END
```

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W55826C-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W55826C-02.
- Actual field/mask/type boundaries: U-W55826C-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W55826C-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W55826C-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W55826C-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W55826C-02. This is source inspection, not a runtime parity claim.
- **U-W55826C-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W55826C-02.
- **U-W55826C-05** — Golden boundary outcomes for text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

73/73 blocks; 0/0 encoded-only slots retained; 150 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:275`; `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:219`; `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:364`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:678`; `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:685`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:238`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:317`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_WIN_Teclado.wdw:9`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_WIN_Teclado.wdw:9`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_WIN_Teclado.wdw:9`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_WIN_Teclado.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:311`
