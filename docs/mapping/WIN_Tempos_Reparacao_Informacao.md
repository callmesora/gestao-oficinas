# Mapping — WIN_Tempos_Reparacao_Informacao

Step 0 only. Source `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw`; designer `dossier: WIN_Tempos_Reparacao_Informacao`. Confidence concerns legacy evidence; no functionality is implemented.

## Purpose

Read service/observations/contacts/client and print.

## Entry and exit

- `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:996 (Open in WIN_Tempos_Reparacao)`
```wlanguage
-
code : |1-
open(WIN_Tempos_Reparacao_Informacao,TABLE_tempos_reparacao.COL_Numero)
type : 18
-
type : 161
```

Open is modal and resumes caller afterward; OpenChild permits both windows alive. Independent HFSQL context: False. False shares file/query current buffers,positions and filters across windows. Modal return does not restore a buffer.

## Rules and implicit state

Entry(number) loads order fields and customer description then cancels both query declarations. Close and system close explicitly close. Print calls RPT_Servico_Avaria(number) without local iPreview invocation; inherited print destination is not explicitly reset.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw` exact event locations below; `dossier: WIN_Tempos_Reparacao_Informacao/flags`.

HReadSeek positions the named file buffer; HFound tests that source. HModify/HAdd write current buffers. HExecuteQuery executes named queries with parameters; HExecuteSQLQuery runs constructed SQL. HFilter persists until deactivated; TableDisplay refresh/selection ordering matters. ExecuteProcess synchronously runs another event. Workstation clock supplies DateSys/SysDateTime. Middle/Position/table indices are 1-based; numeric-to-text conversions retain masks and locale. Exact transactions,locks,error checks and absence of checks are visible per block. See docs/wlanguage-traps.md and docs/porting.md (proposals only).

## Events and ordered operation ledger

### SRC-7dd8d8bce5 — WIN_Tempos_Reparacao_Informacao/SCSystemButtons/BTN_SYST_FERMER

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:141-141`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: close(WIN_Tempos_Reparacao_Informacao). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Informacao.md under SRC-afe079e245.. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Informacao.md under SRC-7dd8d8bce5.

HFSQL: none in this block.

Other calls: Close(WIN_Tempos_Reparacao_Informacao).

Exact executable branch/assignment ledger:
```wlanguage
close(WIN_Tempos_Reparacao_Informacao)
```

### SRC-afe079e245 — WIN_Tempos_Reparacao_Informacao/BTN_Fechar

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:266-266`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: close(WIN_Tempos_Reparacao_Informacao). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Informacao.md under SRC-afe079e245.. Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Informacao.md under SRC-7dd8d8bce5.

HFSQL: none in this block.

Other calls: Close(WIN_Tempos_Reparacao_Informacao).

Exact executable branch/assignment ledger:
```wlanguage
close(WIN_Tempos_Reparacao_Informacao)
```

### SRC-5b5a9f170c — WIN_Tempos_Reparacao_Informacao/BTN_Imprimir1

Event `18`: Click; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:360-360`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Click [18]: iPrintReport(RPT_Servico_Avaria,numero). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Informacao.md under SRC-5b5a9f170c.

HFSQL: none in this block.

Other calls: iPrintReport(RPT_Servico_Avaria).

Exact executable branch/assignment ledger:
```wlanguage
iPrintReport(RPT_Servico_Avaria,numero)
```

### SRC-7ee7886777 — WIN_Tempos_Reparacao_Informacao [MyWindow]

Event `none`: Global declarations; `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:381-393`.

Abbreviated source index (ELSE/END and branch nesting omitted; not unconditional execution order): Global declarations [declarations]: PROCEDURE MyWindow(numero); HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero); if hreadfirst(QRY_select_ordens_reparacao_numero)=true then; EDT_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico; EDT_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs; EDT_contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos; HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.recepcao_Cliente); if hreadfirst(QRY_select_cliente_codigo)=true then; EDT_cliente=QRY_select_cliente_codigo.Descricao; HCancelDeclaration(QRY_select_cliente_codigo); HCancelDeclaration(QRY_select_ordens_reparacao_numero). Authoritative exact branch ledger: docs/mapping/WIN_Tempos_Reparacao_Informacao.md under SRC-7ee7886777.

HFSQL: HExecuteQuery(QRY_select_ordens_reparacao_numero); HExecuteQuery(QRY_select_cliente_codigo); HReadFirst(QRY_select_ordens_reparacao_numero); HReadFirst(QRY_select_cliente_codigo); HCancelDeclaration(QRY_select_cliente_codigo); HCancelDeclaration(QRY_select_ordens_reparacao_numero).

Other calls: none indexed.

Exact executable branch/assignment ledger:
```wlanguage
PROCEDURE MyWindow(numero)
HExecuteQuery(QRY_select_ordens_reparacao_numero,hQueryDefault,numero)
if hreadfirst(QRY_select_ordens_reparacao_numero)=true then
EDT_servico_avaria=QRY_select_ordens_reparacao_numero.recepcao_servico
EDT_observacao=QRY_select_ordens_reparacao_numero.recepcao_obs
EDT_contactos=QRY_select_ordens_reparacao_numero.recepacao_contatos
HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_ordens_reparacao_numero.recepcao_Cliente)
if hreadfirst(QRY_select_cliente_codigo)=true then
EDT_cliente=QRY_select_cliente_codigo.Descricao
END
HCancelDeclaration(QRY_select_cliente_codigo)
END
HCancelDeclaration(QRY_select_ordens_reparacao_numero)
```

### SRC-f8a0560e47 — WIN_Tempos_Reparacao_Informacao/SCSystemButtons/BTN_UMC [encoded action A-2fd8eb]

Assumed encoded behavior: Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:67; proposed: A-2fd8eb`. Proposal remains unconfirmed.

### SRC-33a7e5d88d — WIN_Tempos_Reparacao_Informacao/SCSystemButtons/BTN_SYST_MINIMIZE [encoded action A-48d568]

Assumed encoded behavior: Minimize the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:90; proposed: A-48d568`. Proposal remains unconfirmed.

### SRC-70af4e92ab — WIN_Tempos_Reparacao_Informacao/SCSystemButtons/BTN_Syst_Maximize [encoded action A-ff0b05]

Assumed encoded behavior: Maximize or restore the window. Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:115; proposed: A-ff0b05`. Proposal remains unconfirmed.

## Data dependencies

- HExecuteQuery: `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:382`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:387`.
- HReadFirst: `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:383`; `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:388`.
- HCancelDeclaration: `QRY_select_cliente_codigo` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:391`; `QRY_select_ordens_reparacao_numero` at `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw:393`.

## Behavior checklist

- Open and native keyboard: U-W24748E-02; explicit procedure values, focus and action proposals remain in the ledger.
- Grid sorting, per-column search, saved columns and empty-row handling: not applicable; no extracted grid exists.
- Actual data/timer/lock/write failure cases: U-W24748E-03.
- No explicit local business-message call; encoded close/default/Esc contracts remain in the action rows and U-W24748E-02.
- Actual field/mask/type boundaries: U-W24748E-05.

## Proposed changes for framing

Source buffer/result contracts and UI edge cases are recorded for later framing. Parameterized SQL, atomic write scope or lock cleanup are candidate topics only where those operations exist in this unit. No behavior fix or architecture decision is approved.

## Unresolved

- **U-W24748E-01** — Entry callers and their arguments are identified in Entry and exit; only designer fields absent from the extract and visual skin details remain open. Resolve missing properties with designer/raw dossier/image inspection. Blocks those missing visual details only; interim default: preserve extracted values and explicit source overrides.
- **U-W24748E-02** — Native input focus and keyboard traversal; no grid sort/search/empty-row scenario applies. Saved-position versus opening-mode precedence; confirm Enter/Esc routing and effective focus against explicit assignments/button types. Resolve with keyboard walkthrough. Blocks only these UI edges; interim default: explicit source event behavior and extracted flags.
- **U-W24748E-03** — Runtime outcomes for missing/orphan records and shared file/query current buffers for HCancelDeclaration, HExecuteQuery, hreadfirst. Resolve with isolated scratch-session observations and controlled failures. Blocks those failure/concurrency edges; interim default: exact source order and checks, no invented rollback.
- **U-W24748E-04** — Source applicability resolved: this unit has no explicit Info/Error/YesNo/Dialog call and does not implement a WDFAA message framework. A local business-message/resource-wiring test is not applicable. Encoded window closure and Enter/Esc behavior remain separately recorded under the action proposals and U-W24748E-02.
- **U-W24748E-05** — Golden boundary outcomes for empty/NULL and key text/accents at actual file/query boundaries. Resolve against declared field/control types and boundary captures. Blocks those edge cases only; interim default: exact source masks, formulas, literals and comparison order. No unrelated money/minute/SQL scenario is implied.

## Coverage

4/4 blocks; 3/3 encoded-only slots retained; 30 rows. Independent semantic review is a separate Stage 0 gate.

## Source-reference cross-check

`legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao.wdw:996`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/WIN_Tempos_Reparacao_Informacao.wdw:8`; `legacy/GestaoOficinas_TesteIA/cache.gestion de sources/WIN_Tempos_Reparacao_Informacao.wdw:8`; `legacy/GestaoOficinas_TesteIA/Bkp_20261022_1405/cache.gestion de sources/WIN_Tempos_Reparacao_Informacao.wdw:8`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.cpl/GONCALO/WIN_Tempos_Reparacao_Informacao.wdw:11`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:581`; `legacy/GestaoOficinas_TesteIA/My_GestaoOficinas.wdp:584`
