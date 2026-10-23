# Mapping — WIN_Filtro_Mapas_Tempos

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw`; designer `dossier: WIN_Filtro_Mapas_Tempos`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Preview labor by order/mechanic/vehicle.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:814 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
openchild(WIN_Filtro_Mapas_Tempos,"ordem_reparacao")
type : 32
-
name : OPT_Tempos_de_reparação_por_mecânico_resumo
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:825 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
openchild(WIN_Filtro_Mapas_Tempos,"mecanico_resumo")
type : 32
-
name : OPT_Tempos_de_reparação_por_mecânico_descriminado
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:836 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
openchild(WIN_Filtro_Mapas_Tempos,"mecanico_descriminado")
type : 32
-
name : OPT_Tempos_de_reparação_por_viatura
```
- `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:847 (OpenChild in WIN_MENU)`
```wlanguage
-
code : |1-
openchild(WIN_Filtro_Mapas_Tempos,"viatura")
type : 32
-
name : OPT_Vendas
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Modes ordem_reparacao plane1, mecanico_descriminado/mecanico_resumo plane2,viatura plane3. Dates today, order1..9999999999. Expand times 00:00:00..23:59:59. Lower nonempty/nonzero choice copies upper. Exact report argument order in ledger.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw` exact event locations below; `dossier: WIN_Filtro_Mapas_Tempos/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-cee5daa66c — WIN_Filtro_Mapas_Tempos/BTN_Visualizar_impressão

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:266-291`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: da_data is datetime=EDT_Da_data; da_data..Hour=00; da_data..Minute=00; da_data..Second=00; a_data is DateTime=EDT_a_data; a_data..Hour=23; a_data..Minute=59; a_data..Second=59; SWITCH tipo_report; CASE "ordem_reparacao"; iPreview(); iInitReportQuery(RPT_Tempos_Ordem_Reparacao,EDT_Da_ordem,EDT_a_ordem,da_data,a_data); iPrintReport(RPT_Tempos_Ordem_Reparacao); CASE "mecanico_descriminado"; iPreview(); iInitReportQuery(RPT_Tempos_Ordem_Reparacao_Mecanico,EDT_Do_mecanico,EDT_Ao_mecanico,da_data,a_data); iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico); CASE "mecanico_resumo"; iPreview(); iInitReportQuery(RPT_Tempos_Ordem_Reparacao_Mecanico_resumo,EDT_Do_mecanico,EDT_Ao_mecanico,da_data,a_data); iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo); CASE "viatura"; iPreview(); iInitReportQuery(RPT_Tempos_Ordem_Reparacao_viatura,da_data,a_data,EDT_Da_viatura,EDT_a_viatura); iPrintReport(RPT_Tempos_Ordem_Reparacao_viatura). Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Tempos.md under SRC-cee5daa66c.

HFSQL: none in this block.

Other calls: iPreview(); iPreview(); iPreview(); iPreview(); iPrintReport(RPT_Tempos_Ordem_Reparacao); iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico); iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo); iPrintReport(RPT_Tempos_Ordem_Reparacao_viatura).

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
CASE "ordem_reparacao"
iPreview()
iInitReportQuery(RPT_Tempos_Ordem_Reparacao,EDT_Da_ordem,EDT_a_ordem,da_data,a_data)
iPrintReport(RPT_Tempos_Ordem_Reparacao)
CASE "mecanico_descriminado"
iPreview()
iInitReportQuery(RPT_Tempos_Ordem_Reparacao_Mecanico,EDT_Do_mecanico,EDT_Ao_mecanico,da_data,a_data)
iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico)
CASE "mecanico_resumo"
iPreview()
iInitReportQuery(RPT_Tempos_Ordem_Reparacao_Mecanico_resumo,EDT_Do_mecanico,EDT_Ao_mecanico,da_data,a_data)
iPrintReport(RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo)
CASE "viatura"
iPreview()
iInitReportQuery(RPT_Tempos_Ordem_Reparacao_viatura,da_data,a_data,EDT_Da_viatura,EDT_a_viatura)
iPrintReport(RPT_Tempos_Ordem_Reparacao_viatura)
END
```

### SRC-f492814bfe — WIN_Filtro_Mapas_Tempos/BTN_VISION2

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:561-561`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_a_viatura=open(WIN_Table_Viaturas,true,EDT_a_viatura). Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Tempos.md under SRC-f492814bfe.

HFSQL: none in this block.

Other calls: Open(WIN_Table_Viaturas).

Exact executable branch/assignment ledger:
```wlanguage
EDT_a_viatura=open(WIN_Table_Viaturas,true,EDT_a_viatura)
```

### SRC-829f3810f6 — WIN_Filtro_Mapas_Tempos/BTN_VISION1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:585-588`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Da_viatura=open(WIN_Table_Viaturas,true,EDT_Da_viatura); if EDT_Da_viatura<>"" then; EDT_a_viatura=EDT_Da_viatura. Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Tempos.md under SRC-829f3810f6.

HFSQL: none in this block.

Other calls: Open(WIN_Table_Viaturas).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Da_viatura=open(WIN_Table_Viaturas,true,EDT_Da_viatura)
if EDT_Da_viatura<>"" then
EDT_a_viatura=EDT_Da_viatura
END
```

### SRC-a6260ec2c6 — WIN_Filtro_Mapas_Tempos/BTN_VISION3

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:612-612`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Ao_mecanico=open(WIN_Table_mecanicos,true,EDT_Ao_mecanico). Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Tempos.md under SRC-a6260ec2c6.

HFSQL: none in this block.

Other calls: Open(WIN_Table_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Ao_mecanico=open(WIN_Table_mecanicos,true,EDT_Ao_mecanico)
```

### SRC-c77e1c1d8e — WIN_Filtro_Mapas_Tempos/BTN_VISION4

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:636-639`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: EDT_Do_mecanico=open(WIN_Table_mecanicos,true,EDT_Do_mecanico); if EDT_Do_mecanico<>0 then; EDT_Ao_mecanico=EDT_Do_mecanico. Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Tempos.md under SRC-c77e1c1d8e.

HFSQL: none in this block.

Other calls: Open(WIN_Table_mecanicos).

Exact executable branch/assignment ledger:
```wlanguage
EDT_Do_mecanico=open(WIN_Table_mecanicos,true,EDT_Do_mecanico)
if EDT_Do_mecanico<>0 then
EDT_Ao_mecanico=EDT_Do_mecanico
end
```

### SRC-45d4570120 — WIN_Filtro_Mapas_Tempos [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:673-691`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(tipo_report); EDT_Da_data=datesys(); EDT_a_data=datesys(); EDT_Da_ordem=1; EDT_a_ordem=9999999999; SWITCH tipo_report; CASE "ordem_reparacao"; WIN_Filtro_Mapas_Tempos..Plane=1; RADTitle="Tempos por ordem reparação (Descriminado)"; CASE "mecanico_descriminado"; WIN_Filtro_Mapas_Tempos..Plane=2; RADTitle="Tempos por mecânico (Descriminado)"; CASE "mecanico_resumo"; WIN_Filtro_Mapas_Tempos..Plane=2; RADTitle="Tempos por mecânico (Resumo)"; CASE "viatura"; WIN_Filtro_Mapas_Tempos..Plane=3; RADTitle="Tempos por viatura (Descriminado)". Authoritative exact branch ledger: docs/mapping/WIN_Filtro_Mapas_Tempos.md under SRC-45d4570120.

HFSQL: none in this block.

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(tipo_report)
EDT_Da_data=datesys()
EDT_a_data=datesys()
EDT_Da_ordem=1
EDT_a_ordem=9999999999
SWITCH tipo_report
CASE "ordem_reparacao"
WIN_Filtro_Mapas_Tempos..Plane=1
RADTitle="Tempos por ordem reparação (Descriminado)"
CASE "mecanico_descriminado"
WIN_Filtro_Mapas_Tempos..Plane=2
RADTitle="Tempos por mecânico (Descriminado)"
CASE "mecanico_resumo"
WIN_Filtro_Mapas_Tempos..Plane=2
RADTitle="Tempos por mecânico (Resumo)"
CASE "viatura"
WIN_Filtro_Mapas_Tempos..Plane=3
RADTitle="Tempos por viatura (Descriminado)"
END
```

### SRC-c7ec40f70e — WIN_Filtro_Mapas_Tempos/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:54; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-d9c0a7d849 — WIN_Filtro_Mapas_Tempos/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:77; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-32357b6a87 — WIN_Filtro_Mapas_Tempos/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:102; proposed: A-ff0b05`. Proposal remains unconfirmed.

### SRC-a7239621e0 — WIN_Filtro_Mapas_Tempos/SCSystemButtons/BTN_SYST_FERMER [encoded action A-2b6ca2]

Assumed encoded behavior: Close the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:127; proposed: A-2b6ca2`. Proposal remains unconfirmed.

## Data dependencies


## Behavior checklist

- Open and native keyboard: U-WA6D3FA-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- No local HFSQL, persistence, timer or record-lock path; those failure scenarios are not applicable. Caller return flow remains in the ledger.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-WA6D3FA-02.
- Actual field/mask/type boundaries: U-WA6D3FA-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. No database/transaction/lock redesign is proposed for this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-WA6D3FA-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-WA6D3FA-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-WA6D3FA-03** — Source applicability resolved: no local HFSQL access, persistence writes, timer or record-lock operation exists in the complete event ledger. Database/timer/write-failure scenarios do not apply to this unit. Caller result and focus contracts remain in the event ledger and U-WA6D3FA-02. This is source inspection, not a runtime parity claim.
- **U-WA6D3FA-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-WA6D3FA-02.
- **U-WA6D3FA-05** — Golden boundary outcomes for date/time masks, blank/zero datetime values and workstation locale/time interpretation. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

6/6 blocks; 4/4 encoded-only slots retained; 36 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:814`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:825`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:836`; `legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:847`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Filtro_Mapas_Tempos.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Filtro_Mapas_Tempos.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Filtro_Mapas_Tempos.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Filtro_Mapas_Tempos.wdw:13`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:389`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:392`
