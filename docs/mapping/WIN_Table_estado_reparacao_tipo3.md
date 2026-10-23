# Mapping — WIN_Table_estado_reparacao_tipo3

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select estado_reparacao_tipo3. {"PT": "Escolha o tipo de reparaçªo a ser efetuada"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:378 (Open in WIN_Tempos_Reparacao_Tempo)`; `GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:412 (Open in WIN_Tempos_Reparacao_Tempo)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": true}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Despite the name, the in-memory table loads types 3 OR 4 OR 5, ordered by tipo ascending; it is not type 3 only. ReturnedValue starts at literal cancelar, while selection returns the displayed code. No empty-selection guard appears in the selection event.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-C52946E4-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_estado_reparacao_tipo3/TABLE_Estados_reparacao — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:239-245`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
         Query is string="select * from estados_reparacao where tipo=3 or tipo=4 or tipo=5 order by tipo asc"
         Qry_select_estados_reparacao is data source
         HExecuteSQLQuery(Qry_select_estados_reparacao,hQueryDefault,Query)
         FOR EACH Qry_select_estados_reparacao 
         	TableAddLine(TABLE_Estados_reparacao,Qry_select_estados_reparacao.codigo,Qry_select_estados_reparacao.descricao)
         END
         HCancelDeclaration(Qry_select_estados_reparacao)
```

### WIN_Table_estado_reparacao_tipo3/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:327-327`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=table_estados_reparacao.COL_Codigo
```

### WIN_Table_estado_reparacao_tipo3/BTN_seguinte — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:376-378`. If TableSelect(table)<TableCount(table), request selection index TableSelect(table)+1 using the exact table assignment or TableSelectPlus call below. There is no lower-bound or no-selection guard in this handler.

```wlanguage
         IF TableSelect(TABLE_Estados_reparacao)<TableCount(TABLE_Estados_reparacao) THEN
         	TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)+1	 
         END
```

### WIN_Table_estado_reparacao_tipo3/BTN_anterior — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:402-404`. Move one row only within the 1-based bounds; do not wrap at either end.

```wlanguage
         IF TableSelect(TABLE_Estados_reparacao)>1 THEN
         	TABLE_Estados_reparacao=TableSelect(TABLE_Estados_reparacao)-1	 
         END
```

### WIN_Table_estado_reparacao_tipo3 — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:425-426`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE MyWindow()
      MyWindow..ReturnedValue="cancelar"
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_estado_reparacao_tipo3/SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:67 |
| WIN_Table_estado_reparacao_tipo3/SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:90 |
| WIN_Table_estado_reparacao_tipo3/SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:115 |
| WIN_Table_estado_reparacao_tipo3/SCSystemButtons/BTN_SYST_FERMER/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:140 |
| WIN_Table_estado_reparacao_tipo3/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:325 |
| WIN_Table_estado_reparacao_tipo3/BTN_Cancelar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:350 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=True: this window owns an independent context. It builds a memory table from a temporary query. Evidence: `dossier: WIN_Table_estado_reparacao_tipo3/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:378`

```wlanguage
375: HCancelDeclaration(Qry_insert_tempos_Reparacao)
376: ELSE
377: sCodigo is string
378: sCodigo=Open(WIN_Table_estado_reparacao_tipo3)
379: IF sCodigo<>"cancelar" THEN
380: query="UPDATE ordem_reparacao SET reparacao_estado ='"+sCodigo+"' WHERE ordem_reparacao.numero = '"+numero+"'"
381: QRY_update_ordens_reparacao_estado is data Source
382: HExecuteSQLQuery(QRY_update_ordens_reparacao_estado,hQueryDefault,query)
383: HCancelDeclaration(QRY_update_ordens_reparacao_estado)
```

`legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:412`

```wlanguage
409: HCancelDeclaration(Qry_insert_tempos_Reparacao)
410: ELSE
411: sCodigo is string
412: sCodigo=Open(WIN_Table_estado_reparacao_tipo3)
413: IF sCodigo<>"cancelar" THEN
414: query="UPDATE ordem_reparacao SET reparacao_estado ='"+sCodigo+"' WHERE ordem_reparacao.numero = '"+numero+"'"
415: QRY_update_ordens_reparacao_estado is data Source
416: HExecuteSQLQuery(QRY_update_ordens_reparacao_estado,hQueryDefault,query)
417: HCancelDeclaration(QRY_update_ordens_reparacao_estado)
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| HCancelDeclaration | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:245 → Qry_select_estados_reparacao |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:241 → Qry_select_estados_reparacao |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:376 → TABLE_Estados_reparacao; legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:377 → TABLE_Estados_reparacao; legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:402 → TABLE_Estados_reparacao; legacy/GestaoOficinas_TesteIA/WIN_Table_estado_reparacao_tipo3.wdw:403 → TABLE_Estados_reparacao |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-C52946E4-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-C52946E4-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-C52946E4-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-C52946E4-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-C52946E4-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-C52946E4-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-C52946E4-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-C52946E4-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.
