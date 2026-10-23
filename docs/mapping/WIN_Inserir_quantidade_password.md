# Mapping — WIN_Inserir_quantidade_password

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw`; designer `dossier: WIN_Inserir_quantidade_password`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Return quantity/price/password/description.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1095 (Open in WIN_Material_reparacao_form)`
```wlanguage
preco is numeric
preco=TABLE_material.COL_preco
preco=open(WIN_Inserir_quantidade_password,"preco",preco)
TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,TABLE_material.COL_descricao_artigo,TABLE_material.COL_quant,preco,false)
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1126 (Open in WIN_Material_reparacao_form)`
```wlanguage
END
descricao is string=TABLE_material.COL_descricao_artigo
descricao=open(WIN_Inserir_quantidade_password,"descricao",descricao)
TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,descricao,TABLE_material.COL_quant,TABLE_material.COL_preco,false)
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:296 (Open in WIN_Material_reparacao_form)`
```wlanguage
ELSE
sPassword is string
sPassword=Open(WIN_Inserir_quantidade_password,"password","")
IF sPassword<>"" THEN
IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN
gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo
```
- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:768 (Open in WIN_Material_reparacao_form)`
```wlanguage
END
sPassword is string
sPassword=Open(WIN_Inserir_quantidade_password,"password","")
IF sPassword<>"" THEN
IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN
gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo
```
- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:912 (Open in WIN_Material_reparacao_form)`
```wlanguage
HReadFirst(QRY_select_mecanicos_codigo)
sPassword is string
sPassword=Open(WIN_Inserir_quantidade_password,"password","")
IF sPassword<>"" THEN
IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN
gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo
```
- `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:978 (Open in WIN_Material_reparacao_form)`
```wlanguage
Quantidade is numeric
Quantidade=TABLE_material.COL_quant
Quantidade=open(WIN_Inserir_quantidade_password,"quantidade",Quantidade)
TableModifyLine(TABLE_material,TABLE_material,TABLE_material.COL_data_hora,TABLE_material.COL_mecanico_codigo,TABLE_material.COL_mecanico_descricao,TABLE_material.COL_codigo_artigo,TABLE_material.COL_descricao_artigo,Quantidade,TABLE_material.COL_preco,false)
type : 18
-
```
- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:250 (Open in WIN_Tempos_Reparacao_Tempo)`
```wlanguage
else
sPassword is string
sPassword=open(WIN_Inserir_quantidade_password,"password","")
if sPassword<>"" then
if sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN
gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo
```
- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:309 (Open in WIN_Tempos_Reparacao_Tempo)`
```wlanguage
HReadFirst(QRY_select_mecanicos_codigo)
sPassword is string
sPassword=Open(WIN_Inserir_quantidade_password,"password","")
IF sPassword<>"" THEN
IF sPassword=QRY_select_mecanicos_codigo.palavra_passe THEN
gsMecanico_ativo=QRY_select_mecanicos_codigo.Codigo
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Default result incoming valor; selected field only visible. Quantity mask999999,999; price9999999999,99; password blank. Description adds200 width to window/field and cancel x. Numeric keyboard always3 decimals,bounds0..999999, even price mode. Confirm assigns selected field; close encoded.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw` exact event locations below; `dossier: WIN_Inserir_quantidade_password/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-2011a97eec — WIN_Inserir_quantidade_password/EDT_password

Event `66049`: Left button down; `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:218-220`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button down [66049]: if lTeclado=true then; myself=open(WIN_Teclado_Alfa,"Palavra-passe",myself..inputmask,myself..size,myself,true). Authoritative exact branch ledger: docs/mapping/WIN_Inserir_quantidade_password.md under SRC-2011a97eec.

HFSQL: none in this block.

Other calls: Open(WIN_Teclado_Alfa).

Exact executable branch/assignment ledger:
```wlanguage
if lTeclado=true then
myself=open(WIN_Teclado_Alfa,"Palavra-passe",myself..inputmask,myself..size,myself,true)
END
```

### SRC-6bf71f445e — WIN_Inserir_quantidade_password/BTN_Confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:267-274`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: SWITCH tipo_janela; CASE "quantidade","preco"; MyWindow..ReturnedValue=EDT_quantidade; CASE "password"; MyWindow..ReturnedValue=EDT_password; case "descricao"; mywindow..ReturnedValue=EDT_descricao. Authoritative exact branch ledger: docs/mapping/WIN_Inserir_quantidade_password.md under SRC-6bf71f445e.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
SWITCH tipo_janela
CASE "quantidade","preco"
MyWindow..ReturnedValue=EDT_quantidade
CASE "password"
MyWindow..ReturnedValue=EDT_password
case "descricao"
mywindow..ReturnedValue=EDT_descricao
END
```

Assumed action following code: Close the window (`proposed: A-d61aa1`).

### SRC-517e7660ea — WIN_Inserir_quantidade_password/EDT_quantidade

Event `66049`: Left button down; `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:319-321`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button down [66049]: IF lTeclado=True THEN; MySelf=Open(WIN_Teclado_numerico,"Quantidade",MySelf,3,0,999999). Authoritative exact branch ledger: docs/mapping/WIN_Inserir_quantidade_password.md under SRC-517e7660ea.

HFSQL: none in this block.

Other calls: Open(WIN_Teclado_numerico).

Exact executable branch/assignment ledger:
```wlanguage
IF lTeclado=True THEN
MySelf=Open(WIN_Teclado_numerico,"Quantidade",MySelf,3,0,999999)
END
```

### SRC-a5152a0572 — WIN_Inserir_quantidade_password/EDT_descricao

Event `66049`: Left button down; `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:363-365`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button down [66049]: if lTeclado=true then; myself=open(WIN_Teclado_Alfa,"Descricao",myself..inputmask,myself..size,myself,false). Authoritative exact branch ledger: docs/mapping/WIN_Inserir_quantidade_password.md under SRC-a5152a0572.

HFSQL: none in this block.

Other calls: Open(WIN_Teclado_Alfa).

Exact executable branch/assignment ledger:
```wlanguage
if lTeclado=true then
myself=open(WIN_Teclado_Alfa,"Descricao",myself..inputmask,myself..size,myself,false)
END
```

### SRC-757d791537 — WIN_Inserir_quantidade_password [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:383-414`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(tipo_janela,valor); EDT_password..Visible=False; EDT_quantidade..Visible=False; EDT_descricao..Visible=False; lTeclado is boolean =true; MyWindow..ReturnedValue=valor; switch tipo_janela; CASE "quantidade"; EDT_quantidade..Caption="Quantidade"; EDT_quantidade..InputMask="999999,999"; EDT_quantidade..Visible=true; EDT_quantidade=valor; RADTitle="Alterar quantidade"; CASE "preco"; EDT_quantidade..Caption="Preç"; EDT_quantidade..InputMask="9999999999,99"; EDT_quantidade..Visible=True; EDT_quantidade=valor; RADTitle="Alterar preço"; CASE "password"; EDT_password..Caption="Palavra-passe"; EDT_password..Visible=True; RADTitle="Inserir palavra-passe"; CASE "descricao"; EDT_descricao..Caption="Descrição"; EDT_descricao..Visible=True; EDT_descricao=valor; RADTitle="Alterar descrição"; mywindow..Width=MyWindow..Width+200; EDT_descricao..width=EDT_descricao..Width+200; BTN_Cancelar..x=BTN_Cancelar..X+200. Authoritative exact branch ledger: docs/mapping/WIN_Inserir_quantidade_password.md under SRC-757d791537.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(tipo_janela,valor)
EDT_password..Visible=False
EDT_quantidade..Visible=False
EDT_descricao..Visible=False
lTeclado is boolean =true
MyWindow..ReturnedValue=valor
switch tipo_janela
CASE "quantidade"
EDT_quantidade..Caption="Quantidade"
EDT_quantidade..InputMask="999999,999"
EDT_quantidade..Visible=true
EDT_quantidade=valor
RADTitle="Alterar quantidade"
CASE "preco"
EDT_quantidade..Caption="Preç"
EDT_quantidade..InputMask="9999999999,99"
EDT_quantidade..Visible=True
EDT_quantidade=valor
RADTitle="Alterar preço"
CASE "password"
EDT_password..Caption="Palavra-passe"
EDT_password..Visible=True
RADTitle="Inserir palavra-passe"
CASE "descricao"
EDT_descricao..Caption="Descrição"
EDT_descricao..Visible=True
EDT_descricao=valor
RADTitle="Alterar descrição"
mywindow..Width=MyWindow..Width+200
EDT_descricao..width=EDT_descricao..Width+200
BTN_Cancelar..x=BTN_Cancelar..X+200
END
```

### SRC-1d2af8678c — WIN_Inserir_quantidade_password/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-a88172bf86 — WIN_Inserir_quantidade_password/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-ec7c2ff4bf — WIN_Inserir_quantidade_password/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-40b69c5782 — WIN_Inserir_quantidade_password/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

### SRC-113b96884d — WIN_Inserir_quantidade_password/BTN_Cancelar [encoded action A-d61aa1]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw:240; proposed: A-d61aa1`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-W7DB208-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W7DB208-02.
- Actual field/mask/type boundaries: U-W7DB208-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W7DB208-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W7DB208-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W7DB208-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-W7DB208-02. This is source inspection, not a runtime parity claim.
- **U-W7DB208-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W7DB208-02.
- **U-W7DB208-05** — Golden boundary outcomes for quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

5/5 blocks; 5/5 encoded-only slots retained; 29 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:296`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:768`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:912`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:978`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1095`; `legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:1126`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:250`; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:309`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Inserir_quantidade_password.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Inserir_quantidade_password.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Inserir_quantidade_password.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Inserir_quantidade_password.wdw:12`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:299`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:302`
