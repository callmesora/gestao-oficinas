# Mapping — WIN_Tempos_Reparacao_Estado

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw`; designer `dossier: WIN_Tempos_Reparacao_Estado`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Change state and append order history/service notes.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:509 (Open in WIN_Tempos_Reparacao)`
```wlanguage
END
numero_linha_tabela is int=TABLE_tempos_reparacao
open(WIN_Tempos_Reparacao_Estado,TABLE_tempos_reparacao.COL_Numero)
TableDisplay(TABLE_tempos_reparacao,taReExecuteQuery)
IF STC_filtro_atual="Todos" THEN
ExecuteProcess(BTN_todos,trtClick)
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry(number) loads order,vehicle,current service/history and SysDateTime; selects current state,scrolls history end. Choices types3..7 ordered type. Confirm builds history: date DD/MM/YYYY HH:mm+four spaces+state caption+CR+description,or prior history+CR+CR+new entry. Concatenated UPDATE sets state,notes,service,date/history; types6/7 also finish all open(all-zero) labor at SysDateTime and selected state. No authentication,required selection guard,transaction or checked SQL result here. Confirm close encoded assumed; Close cancels query declaration.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw` exact event locations below; `dossier: WIN_Tempos_Reparacao_Estado/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-f19f71c51e — WIN_Tempos_Reparacao_Estado/EDT_descricao

Event `66049`: Left button down; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:237-239`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button down [66049]: if lTeclado=true then; myself=open(WIN_Teclado_Alfa,"Descrição",myself..inputmask,myself..Size,myself,false). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-f19f71c51e.

HFSQL: none in this block.

Other calls: Open(WIN_Teclado_Alfa).

Exact executable branch/assignment ledger:
```wlanguage
if lTeclado=true then
myself=open(WIN_Teclado_Alfa,"Descrição",myself..inputmask,myself..Size,myself,false)
END
```

### SRC-877b8436df — WIN_Tempos_Reparacao_Estado/EDT_obs_servico

Event `66049`: Left button down; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:316-318`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Left button down [66049]: IF lTeclado=True THEN; MySelf=Open(WIN_Teclado_Alfa,"Serviço",MySelf..InputMask,MySelf..Size,MySelf,False). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-877b8436df.

HFSQL: none in this block.

Other calls: Open(WIN_Teclado_Alfa).

Exact executable branch/assignment ledger:
```wlanguage
IF lTeclado=True THEN
MySelf=Open(WIN_Teclado_Alfa,"Serviço",MySelf..InputMask,MySelf..Size,MySelf,False)
END
```

### SRC-4dab88c740 — WIN_Tempos_Reparacao_Estado/BTN_Confirmar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:353-371`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: sHistorico is string; if QRY_select_ordens_reparacao_numero.reparacao_estado_historico="" then; sHistorico=DateToString(EDT_Data_Hora,"DD/MM/YYYY HH:mm")+"    "+TABLE_Estados_reparacao.COL_Descricao+CR+EDT_descricao; sHistorico=QRY_select_ordens_reparacao_numero.reparacao_estado_historico+CR+CR+DateToString(EDT_Data_Hora,"DD/MM/YYYY HH:mm")+"    "+TABLE_Estados_reparacao.COL_Descricao+cr+EDT_descricao; Query is string="UPDATE ordem_reparacao SET reparacao_estado ='"+TABLE_Estados_reparacao.COL_Codigo+"',reparacao_estado_obs ='"+EDT_descricao+"',reparacao_servico ='"+EDT_obs_servico+"',reparacao_estado_data ='"+EDT_Data_Hora+"',reparacao_estado_historico = '"+sHistorico+"' WHERE ordem_reparacao.numero ='"+numero+"'"; QRY_update_ordens_reparacao_estado is data source; HExecuteSQLQuery(QRY_update_ordens_reparacao_estado,hQueryDefault,Query); if TABLE_Estados_reparacao.COL_Tipo=6 or TABLE_Estados_reparacao.COL_Tipo=7 then; Query="UPDATE tempos_reparacao SET fim='"+sysdatetime()+"',fim_reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"' where numero='"+numero+"' and fim='00000000000000000'"; Qry_update_tempos_reparacao is data source; HExecuteSQLQuery(Qry_update_tempos_reparacao,hQueryDefault,Query); HCancelDeclaration(Qry_update_tempos_reparacao); HCancelDeclaration(QRY_update_ordens_reparacao_estado). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-4dab88c740.

HFSQL: HCancelDeclaration(Qry_update_tempos_reparacao); HCancelDeclaration(QRY_update_ordens_reparacao_estado); HExecuteSQLQuery(QRY_update_ordens_reparacao_estado); HExecuteSQLQuery(Qry_update_tempos_reparacao).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
sHistorico is string
if QRY_select_ordens_reparacao_numero.reparacao_estado_historico="" then
sHistorico=DateToString(EDT_Data_Hora,"DD/MM/YYYY HH:mm")+"    "+TABLE_Estados_reparacao.COL_Descricao+CR+EDT_descricao
else
sHistorico=QRY_select_ordens_reparacao_numero.reparacao_estado_historico+CR+CR+DateToString(EDT_Data_Hora,"DD/MM/YYYY HH:mm")+"    "+TABLE_Estados_reparacao.COL_Descricao+cr+EDT_descricao
END
Query is string="UPDATE ordem_reparacao SET reparacao_estado ='"+TABLE_Estados_reparacao.COL_Codigo+"',reparacao_estado_obs ='"+EDT_descricao+"',reparacao_servico ='"+EDT_obs_servico+"',reparacao_estado_data ='"+EDT_Data_Hora+"',reparacao_estado_historico = '"+sHistorico+"' WHERE ordem_reparacao.numero ='"+numero+"'"
QRY_update_ordens_reparacao_estado is data source
HExecuteSQLQuery(QRY_update_ordens_reparacao_estado,hQueryDefault,Query)
if TABLE_Estados_reparacao.COL_Tipo=6 or TABLE_Estados_reparacao.COL_Tipo=7 then
Query="UPDATE tempos_reparacao SET fim='"+sysdatetime()+"',fim_reparacao_estado='"+TABLE_Estados_reparacao.COL_Codigo+"' where numero='"+numero+"' and fim='00000000000000000'"
Qry_update_tempos_reparacao is data source
HExecuteSQLQuery(Qry_update_tempos_reparacao,hQueryDefault,Query)
HCancelDeclaration(Qry_update_tempos_reparacao)
end
HCancelDeclaration(QRY_update_ordens_reparacao_estado)
```

Assumed action following code: Close the window (`proposed: A-d61aa1`).

### SRC-20dcc20f20 — WIN_Tempos_Reparacao_Estado/BTN_NoName1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:416-416`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_descricao=open(WIN_Table_estados_descritivos,true,""). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-20dcc20f20.

HFSQL: none in this block.

Other calls: Open(WIN_Table_estados_descritivos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_descricao=open(WIN_Table_estados_descritivos,true,"")
```

### SRC-3adea49651 — WIN_Tempos_Reparacao_Estado/BTN_seguinte

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:440-442`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_Estados_reparacao)<TableCount(TABLE_Estados_reparacao) THEN; TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)+1. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-3adea49651.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_Estados_reparacao); TableSelect(TABLE_Estados_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_Estados_reparacao)<TableCount(TABLE_Estados_reparacao) THEN
TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)+1
END
```

### SRC-4ef08b9f1c — WIN_Tempos_Reparacao_Estado/BTN_anterior

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:466-468`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: IF TableSelect(TABLE_Estados_reparacao)>1 THEN; TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)-1. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-4ef08b9f1c.

HFSQL: none in this block.

Other calls: TableSelect(TABLE_Estados_reparacao); TableSelect(TABLE_Estados_reparacao).

Exact executable branch/assignment ledger:
```wlanguage
IF TableSelect(TABLE_Estados_reparacao)>1 THEN
TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)-1
END
```

### SRC-31943e73cd — WIN_Tempos_Reparacao_Estado/TABLE_Estados_reparacao

Event `14`: Initialization; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:639-645`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Initialization [14]: Query is string="select * from estados_reparacao where tipo=3 or tipo=4 or tipo=5 or tipo=6 or tipo=7 order by tipo asc"; Qry_select_estados_reparacao is data source; HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query); FOR EACH Qry_select_estados_reparacao; TableAddLine(TABLE_Estados_reparacao,Qry_select_estados_reparacao.descricao,Qry_select_estados_reparacao.codigo,Qry_select_estados_reparacao.tipo,"",Qry_select_estados_reparacao.cor); HCancelDeclaration(Qry_select_estados_reparacao). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-31943e73cd.

HFSQL: HCancelDeclaration(Qry_select_estados_reparacao); HExecuteSQLQuery(Qry_select_estados_reparacao).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
Query is string="select * from estados_reparacao where tipo=3 or tipo=4 or tipo=5 or tipo=6 or tipo=7 order by tipo asc"
Qry_select_estados_reparacao is data source
HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query)
FOR EACH Qry_select_estados_reparacao
TableAddLine(TABLE_Estados_reparacao,Qry_select_estados_reparacao.descricao,Qry_select_estados_reparacao.codigo,Qry_select_estados_reparacao.tipo,"",Qry_select_estados_reparacao.cor)
END
HCancelDeclaration(Qry_select_estados_reparacao)
```

### SRC-797fe1c6d5 — WIN_Tempos_Reparacao_Estado/TABLE_Estados_reparacao

Event `21`: Display a row; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:668-668`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Display a row [21]: TABLE_Estados_reparacao.COL_imagem[TABLE_Estados_reparacao].SHA_cor..BrushColor=TABLE_Estados_reparacao.COL_cor. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-797fe1c6d5.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
TABLE_Estados_reparacao.COL_imagem[TABLE_Estados_reparacao].SHA_cor..BrushColor=TABLE_Estados_reparacao.COL_cor
```

### SRC-ed637cd256 — WIN_Tempos_Reparacao_Estado [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:723-735`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(numero); lTeclado is boolean =true; HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero); hreadfirst(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula); HReadFirst(QRY_select_viatura_matricula); EDT_matricula_marca_modelo=QRY_select_ordens_reparacao_numero.matricula+"      "+QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo; HCancelDeclaration(QRY_select_viatura_matricula); EDT_obs_servico=QRY_select_ordens_reparacao_numero.reparacao_servico; EDT_historico=QRY_select_ordens_reparacao_numero.reparacao_estado_historico; EDT_Data_Hora=SysDateTime(). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-ed637cd256.

HFSQL: HExecuteQuery(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_viatura_matricula); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(QRY_select_viatura_matricula); HCancelDeclaration(QRY_select_viatura_matricula).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(numero)
lTeclado is boolean =true
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)
hreadfirst(QRY_select_ordens_reparacao_numero)
HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,QRY_select_ordens_reparacao_numero.matricula)
HReadFirst(QRY_select_viatura_matricula)
EDT_matricula_marca_modelo=QRY_select_ordens_reparacao_numero.matricula+"      "+QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
HCancelDeclaration(QRY_select_viatura_matricula)
EDT_obs_servico=QRY_select_ordens_reparacao_numero.reparacao_servico
EDT_historico=QRY_select_ordens_reparacao_numero.reparacao_estado_historico
EDT_Data_Hora=SysDateTime()
```

### SRC-6403344a20 — WIN_Tempos_Reparacao_Estado

Event `34`: End of initialization; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:738-739`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): End of initialization [34]: EDT_historico..Cursor=999999999999999999999999999999999999; TableSelectPlus(TABLE_Estados_reparacao,TableSeek(TABLE_Estados_reparacao.COL_Codigo,QRY_select_ordens_reparacao_numero.reparacao_estado)). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-6403344a20.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
EDT_historico..Cursor=999999999999999999999999999999999999
TableSelectPlus(TABLE_Estados_reparacao,TableSeek(TABLE_Estados_reparacao.COL_Codigo,QRY_select_ordens_reparacao_numero.reparacao_estado))
```

### SRC-11cad0b2e6 — WIN_Tempos_Reparacao_Estado

Event `2`: Close; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:764-764`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Close [2]: HCancelDeclaration(QRY_select_ordens_reparacao_numero). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Estado.md under SRC-11cad0b2e6.

HFSQL: HCancelDeclaration(QRY_select_ordens_reparacao_numero).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
```

### SRC-f225fc6234 — WIN_Tempos_Reparacao_Estado/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-20928c0adb — WIN_Tempos_Reparacao_Estado/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-5c85a88492 — WIN_Tempos_Reparacao_Estado/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-859b708789 — WIN_Tempos_Reparacao_Estado/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:140; proposed: A-2b6ca2`. Proposal remains unconfirmed.

### SRC-e52d04d440 — WIN_Tempos_Reparacao_Estado/BTN_Cancelar [encoded action A-d61aa1]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:394; proposed: A-d61aa1`. Proposal remains unconfirmed.

## Data dependencies

- HExecuteQuery: `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:725`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:728`.
- HReadFirst: `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:726`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:729`.
- HCancelDeclaration: `Qry_update_tempos_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:368`; `QRY_update_ordens_reparacao_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:371`; `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:645`; `QRY_select_viatura_matricula` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:731`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:764`.
- HExecuteSQLQuery: `QRY_update_ordens_reparacao_estado` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:362`; `Qry_update_tempos_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:367`; `Qry_select_estados_reparacao` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:641`.

## Behavior checklist

- Open and native keyboard: U-W6946F0-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid open/search/filter/save/empty/keyboard selection: U-W6946F0-02. Preserve the event-specific refresh and selection calls.
- Actual data/timer/lock/write failure cases: U-W6946F0-03.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W6946F0-02.
- Actual field/mask/type boundaries: U-W6946F0-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W6946F0-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W6946F0-02** — Grid selection on empty/filter-removed rows and native header/keyboard behavior for TABLE_Estados_reparacao; Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W6946F0-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteQuery, HExecuteSQLQuery, HReadFirst, hreadfirst; failed or partial writes in the actual save/update blocks. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W6946F0-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W6946F0-02.
- **U-W6946F0-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

11/11 blocks; 5/5 encoded-only slots retained; 50 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:509`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Tempos_Reparacao_Estado.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Tempos_Reparacao_Estado.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Tempos_Reparacao_Estado.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Tempos_Reparacao_Estado.wdw:12`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:335`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:338`
