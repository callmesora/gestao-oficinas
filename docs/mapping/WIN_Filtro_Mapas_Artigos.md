# Mapping — WIN_Filtro_Mapas_Artigos

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw`; designer `dossier: WIN_Filtro_Mapas_Artigos`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Preview material consumption reports.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:747 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
openchild(WIN_Filtro_Mapas_Artigos,"resumo")
type : 32
-
name : OPT_Consumo_material_descriminado
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:758 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
Openchild(WIN_Filtro_Mapas_Artigos,"descriminado")
type : 32
-
name : OPT_Consumo_material_por_viatura_resumo
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:769 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
Openchild(WIN_Filtro_Mapas_Artigos,"resumo_viatura")
type : 32
-
name : OPT_Consumo_material_por_viatura_descriminado
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:780 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
Openchild(WIN_Filtro_Mapas_Artigos,"descriminado_viatura")
type : 32
-
name : OPT_Extrato_de_artigos
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

tipo_report selects resumo plane1, descriminado plane3, resumo_viatura/descriminado_viatura plane2. Dates today, upper article zzzzzzzzzz. Checkbox 1/0 orders,1/1 combined,0/1 exits,0/0 no print. Detailed receives description; vehicle receives vehicle bounds. Expand dates 00:00:00..23:59:59. Nonempty lower picker copies upper.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw` exact event locations below; `dossier: WIN_Filtro_Mapas_Artigos/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-9079af9bc2 — WIN_Filtro_Mapas_Artigos/BTN_Visualizar_impressão

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:348-393`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: da_data is datetime=EDT_Da_data; da_data..Hour=00; da_data..Minute=00; da_data..Second=00; a_data is DateTime=EDT_a_data; a_data..Hour=23; a_data..Minute=59; a_data..Second=59; SWITCH tipo_report; CASE "resumo"; if CBOX_doc[1]=1 and CBOX_doc[2]=0 then; iPreview(); iInitReportQuery(RPT_Consumo_Material_Resumo_ordens,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data); iPrintReport(RPT_Consumo_Material_Resumo_ordens); IF CBOX_doc[1]=1 AND CBOX_doc[2]=1 THEN; iPreview(); iInitReportQuery(RPT_Consumo_Material_Resumo_ordem_saidas,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data); iPrintReport(RPT_Consumo_Material_Resumo_ordem_saidas); IF CBOX_doc[1]=0 AND CBOX_doc[2]=1 THEN; iPreview(); iInitReportQuery(RPT_Consumo_Material_Resumo_saidas,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data); iPrintReport(RPT_Consumo_Material_Resumo_saidas); CASE "descriminado"; IF CBOX_doc[1]=1 AND CBOX_doc[2]=0 THEN; iPreview(); iInitReportQuery(RPT_Consumo_Material_Descriminado_Ordens,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição); iprintreport(RPT_Consumo_Material_Descriminado_Ordens); IF CBOX_doc[1]=1 AND CBOX_doc[2]=1 THEN; ipreview(); iInitReportQuery(RPT_Consumo_Material_Descriminado_ordens_saidas,EDT_Do_ar. Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-9079af9bc2.

HFSQL: none in this block.

Other calls: iPreview(); iPreview(); iPreview(); iPreview(); iPreview(); iPreview(); iPrintReport(RPT_Consumo_Material_Resumo_ordens); iPrintReport(RPT_Consumo_Material_Resumo_ordem_saidas); iPrintReport(RPT_Consumo_Material_Resumo_saidas); iPrintReport(RPT_Consumo_Material_Descriminado_Ordens); iPrintReport(RPT_Consumo_Material_Descriminado_ordens_saidas); iPrintReport(RPT_Consumo_Material_Descriminado_Saidas).

Exact executable branch/assignment ledger:
```wlanguage
da_data is datetime=EDT_Da_data
da_data..Hour=00
da_data..Minute=00
da_data..Second=00
a_data is DateTime=EDT_a_data
a_data..Hour=23
a_data..Minute=59
a_data..Second=59
SWITCH tipo_report
CASE "resumo"
if CBOX_doc[1]=1 and CBOX_doc[2]=0 then
iPreview()
iInitReportQuery(RPT_Consumo_Material_Resumo_ordens,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data)
iPrintReport(RPT_Consumo_Material_Resumo_ordens)
else
IF CBOX_doc[1]=1 AND CBOX_doc[2]=1 THEN
iPreview()
iInitReportQuery(RPT_Consumo_Material_Resumo_ordem_saidas,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data)
iPrintReport(RPT_Consumo_Material_Resumo_ordem_saidas)
ELSE
IF CBOX_doc[1]=0 AND CBOX_doc[2]=1 THEN
iPreview()
iInitReportQuery(RPT_Consumo_Material_Resumo_saidas,EDT_Do_artigo,EDT_Ao_artigo,da_data,a_data)
iPrintReport(RPT_Consumo_Material_Resumo_saidas)
END
END
END
CASE "descriminado"
IF CBOX_doc[1]=1 AND CBOX_doc[2]=0 THEN
iPreview()
iInitReportQuery(RPT_Consumo_Material_Descriminado_Ordens,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição)
iprintreport(RPT_Consumo_Material_Descriminado_Ordens)
ELSE
IF CBOX_doc[1]=1 AND CBOX_doc[2]=1 THEN
ipreview()
iInitReportQuery(RPT_Consumo_Material_Descriminado_ordens_saidas,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição)
iprintreport(RPT_Consumo_Material_Descriminado_ordens_saidas)
ELSE
IF CBOX_doc[1]=0 AND CBOX_doc[2]=1 THEN
ipreview()
iInitReportQuery(RPT_Consumo_Material_Descriminado_Saidas,EDT_Do_artigo2,EDT_Ao_artigo2,da_data,a_data,EDT_Descrição)
iPrintReport(RPT_Consumo_Material_Descriminado_Saidas)
END
END
END
END
```

### SRC-b160751af6 — WIN_Filtro_Mapas_Artigos/BTN_Visualizar_impressão1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:417-434`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: da_data is datetime=EDT_Da_data1; da_data..Hour=00; da_data..Minute=00; da_data..Second=00; a_data is DateTime=EDT_a_data1; a_data..Hour=23; a_data..Minute=59; a_data..Second=59; SWITCH tipo_report; CASE "resumo_viatura"; iPreview(); iInitReportQuery(RPT_Consumo_Material_Viatura_Resumo,da_data,a_data,EDT_do_artigo1,EDT_Ao_artigo1,EDT_Da_viatura,EDT_a_viatura); iPrintReport(RPT_Consumo_Material_Viatura_Resumo); CASE "descriminado_viatura"; iPreview(); iInitReportQuery(RPT_Consumo_Material_Viatura_Descriminado,da_data,a_data,EDT_Do_artigo1,EDT_Ao_artigo1,EDT_Da_viatura,EDT_a_viatura); iPrintReport(RPT_Consumo_Material_Viatura_Descriminado). Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-b160751af6.

HFSQL: none in this block.

Other calls: iPreview(); iPreview(); iPrintReport(RPT_Consumo_Material_Viatura_Resumo); iPrintReport(RPT_Consumo_Material_Viatura_Descriminado).

Exact executable branch/assignment ledger:
```wlanguage
da_data is datetime=EDT_Da_data1
da_data..Hour=00
da_data..Minute=00
da_data..Second=00
a_data is DateTime=EDT_a_data1
a_data..Hour=23
a_data..Minute=59
a_data..Second=59
SWITCH tipo_report
CASE "resumo_viatura"
iPreview()
iInitReportQuery(RPT_Consumo_Material_Viatura_Resumo,da_data,a_data,EDT_do_artigo1,EDT_Ao_artigo1,EDT_Da_viatura,EDT_a_viatura)
iPrintReport(RPT_Consumo_Material_Viatura_Resumo)
CASE "descriminado_viatura"
iPreview()
iInitReportQuery(RPT_Consumo_Material_Viatura_Descriminado,da_data,a_data,EDT_Do_artigo1,EDT_Ao_artigo1,EDT_Da_viatura,EDT_a_viatura)
iPrintReport(RPT_Consumo_Material_Viatura_Descriminado)
END
```

### SRC-1c6b73c15d — WIN_Filtro_Mapas_Artigos/BTN_VISION1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:704-707`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Da_viatura=open(WIN_Table_Viaturas,true,EDT_Da_viatura); if EDT_Da_viatura<>"" then; EDT_a_viatura=EDT_Da_viatura. Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-1c6b73c15d.

HFSQL: none in this block.

Other calls: Open(WIN_Table_Viaturas).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Da_viatura=open(WIN_Table_Viaturas,true,EDT_Da_viatura)
if EDT_Da_viatura<>"" then
EDT_a_viatura=EDT_Da_viatura
end
```

### SRC-e3877c0ce1 — WIN_Filtro_Mapas_Artigos/BTN_VISION2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:731-731`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_a_viatura=open(WIN_Table_Viaturas,true,EDT_a_viatura). Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-e3877c0ce1.

HFSQL: none in this block.

Other calls: Open(WIN_Table_Viaturas).

Exact executable branch/assignment ledger:
```wlanguage
EDT_a_viatura=open(WIN_Table_Viaturas,true,EDT_a_viatura)
```

### SRC-c32551ad46 — WIN_Filtro_Mapas_Artigos/BTN_VISION3

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:755-755`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Ao_artigo1=open(WIN_Table_artigos,true,EDT_Ao_artigo1). Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-c32551ad46.

HFSQL: none in this block.

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Ao_artigo1=open(WIN_Table_artigos,true,EDT_Ao_artigo1)
```

### SRC-95f34a95eb — WIN_Filtro_Mapas_Artigos/BTN_VISION4

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:779-782`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Do_artigo1=open(WIN_Table_artigos,true,EDT_Do_artigo1); if EDT_Do_artigo1<>"" then; EDT_Ao_artigo1=EDT_Do_artigo1. Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-95f34a95eb.

HFSQL: none in this block.

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Do_artigo1=open(WIN_Table_artigos,true,EDT_Do_artigo1)
if EDT_Do_artigo1<>"" then
EDT_Ao_artigo1=EDT_Do_artigo1
end
```

### SRC-45b9930bc2 — WIN_Filtro_Mapas_Artigos/BTN_VISION5

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:806-806`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Ao_artigo=open(WIN_Table_artigos,true,EDT_Ao_artigo). Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-45b9930bc2.

HFSQL: none in this block.

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Ao_artigo=open(WIN_Table_artigos,true,EDT_Ao_artigo)
```

### SRC-6c92aa7fbd — WIN_Filtro_Mapas_Artigos/BTN_VISION6

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:830-833`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Do_artigo=open(WIN_Table_artigos,true,EDT_Do_artigo); if EDT_Do_artigo<>"" then; EDT_Ao_artigo=EDT_Do_artigo. Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-6c92aa7fbd.

HFSQL: none in this block.

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Do_artigo=open(WIN_Table_artigos,true,EDT_Do_artigo)
if EDT_Do_artigo<>"" then
EDT_Ao_artigo=EDT_Do_artigo
end
```

### SRC-c3e75d06fb — WIN_Filtro_Mapas_Artigos/BTN_VISION7

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:930-930`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Ao_artigo2=open(WIN_Table_artigos,true,EDT_Ao_artigo2). Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-c3e75d06fb.

HFSQL: none in this block.

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Ao_artigo2=open(WIN_Table_artigos,true,EDT_Ao_artigo2)
```

### SRC-345ad3647f — WIN_Filtro_Mapas_Artigos/BTN_VISION8

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:995-998`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Do_artigo2=open(WIN_Table_artigos,true,EDT_Do_artigo2); if EDT_Do_artigo2<>"" then; EDT_Ao_artigo2=EDT_Do_artigo2. Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-345ad3647f.

HFSQL: none in this block.

Other calls: Open(WIN_Table_artigos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Do_artigo2=open(WIN_Table_artigos,true,EDT_Do_artigo2)
if EDT_Do_artigo2<>"" then
EDT_Ao_artigo2=EDT_Do_artigo2
end
```

### SRC-c1cbdc2650 — WIN_Filtro_Mapas_Artigos [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:1060-1081`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(tipo_report); EDT_Da_data=DateSys(); EDT_Da_data1=DateSys(); EDT_a_data=DateSys(); EDT_a_data1=DateSys(); EDT_Ao_artigo="zzzzzzzzzz"; EDT_Ao_artigo1="zzzzzzzzzz"; EDT_Ao_artigo2="zzzzzzzzzz"; switch tipo_report; CASE "resumo"; RADTitle="Consumo Material (Resumo)"; WIN_Filtro_Mapas_Artigos..Plane=1; case "descriminado"; RADTitle="Consumo Material (Descriminado)"; WIN_Filtro_Mapas_Artigos..Plane=3; case "resumo_viatura"; RADTitle="Consumo Material (Resumo por viatura)"; WIN_Filtro_Mapas_Artigos..Plane=2; case "descriminado_viatura"; RADTitle="Consumo Material (Descriminado por viatura)"; WIN_Filtro_Mapas_Artigos..Plane=2. Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Artigos.md under SRC-c1cbdc2650.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(tipo_report)
EDT_Da_data=DateSys()
EDT_Da_data1=DateSys()
EDT_a_data=DateSys()
EDT_a_data1=DateSys()
EDT_Ao_artigo="zzzzzzzzzz"
EDT_Ao_artigo1="zzzzzzzzzz"
EDT_Ao_artigo2="zzzzzzzzzz"
switch tipo_report
CASE "resumo"
RADTitle="Consumo Material (Resumo)"
WIN_Filtro_Mapas_Artigos..Plane=1
case "descriminado"
RADTitle="Consumo Material (Descriminado)"
WIN_Filtro_Mapas_Artigos..Plane=3
case "resumo_viatura"
RADTitle="Consumo Material (Resumo por viatura)"
WIN_Filtro_Mapas_Artigos..Plane=2
case "descriminado_viatura"
RADTitle="Consumo Material (Descriminado por viatura)"
WIN_Filtro_Mapas_Artigos..Plane=2
END
```

### SRC-763e993bf9 — WIN_Filtro_Mapas_Artigos/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:54; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-55bedebab2 — WIN_Filtro_Mapas_Artigos/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:77; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-9789cac993 — WIN_Filtro_Mapas_Artigos/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:102; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-0df1eb75a9 — WIN_Filtro_Mapas_Artigos/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:127; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-WCD4890-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-WCD4890-02.
- Actual field/mask/type boundaries: U-WCD4890-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-WCD4890-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-WCD4890-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-WCD4890-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-WCD4890-02. This is source inspection, not a runtime parity claim.
- **U-WCD4890-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-WCD4890-02.
- **U-WCD4890-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

11/11 blocks; 4/4 encoded-only slots retained; 54 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:747`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:758`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:769`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:780`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Filtro_Mapas_Artigos.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Filtro_Mapas_Artigos.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Filtro_Mapas_Artigos.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Filtro_Mapas_Artigos.wdw:10`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:383`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:386`
