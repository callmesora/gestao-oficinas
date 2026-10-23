# Mapping — WIN_Table_estados_descritivos

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select estados_descritivos. {"PT": "Tabela de Estados descritivos"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_MENU.wdw:583 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:416 (Open in WIN_Tempos_Reparacao_Estado)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Selector returns estados_descritivos.Descricao, not Codigo. Selector mode hides CRUD and printing, uses 30-pixel rows and previous/next controls; no relationship guard precedes deletion.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CC5618D6-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_estados_descritivos/TABLE_estados_descritivos — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:101-105`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_estados_descritivos..DoubleClick="BTN_selecionar"
         ELSE
         	TABLE_estados_descritivos..DoubleClick="BTN_Modificar"
         END
```

### WIN_Table_estados_descritivos/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:202-211`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(estados_descritivos)
         IF Open(WIN_Form_estados_descritivos) THEN
         	TableDisplay(TABLE_estados_descritivos,taCurrentFirst)
         END
```

### WIN_Table_estados_descritivos/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:231-238`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_estados_descritivos)=-1 THEN RETURN
         Open(WIN_Form_estados_descritivos)
         TableDisplay(TABLE_estados_descritivos,taCurrentSelection)
```

### WIN_Table_estados_descritivos/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:263-280`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_estados_descritivos) = -1 THEN RETURN
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_estados_descritivos)
         		TableDisplay(TABLE_estados_descritivos, taCurrentFirst)
         	CASE 2
         END
```

### WIN_Table_estados_descritivos/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:484-484`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=estados_descritivos.Descricao
```

### WIN_Table_estados_descritivos/BTN_seguinte — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:508-510`. If TableSelect(table)<TableCount(table), request selection index TableSelect(table)+1 using the exact table assignment or TableSelectPlus call below. There is no lower-bound or no-selection guard in this handler.

```wlanguage
         IF TableSelect(TABLE_estados_descritivos)<TableCount(TABLE_estados_descritivos) THEN
         	TABLE_estados_descritivos=TableSelect(TABLE_estados_descritivos)+1	 
         END
```

### WIN_Table_estados_descritivos/BTN_anterior — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:534-536`. Move one row only within the 1-based bounds; do not wrap at either end.

```wlanguage
         IF TableSelect(TABLE_estados_descritivos)>1 THEN
         	TABLE_estados_descritivos=TableSelect(TABLE_estados_descritivos)-1	 
         END
```

### WIN_Table_estados_descritivos — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:558-585`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_estados_descritivos(selecionar,origem)
      lTeclado is boolean =false
      IF selecionar=True THEN
      	lTeclado=True
      	BTN_selecionar..Visible=selecionar
      	MyWindow..ReturnedValue=origem
      	BTN_Delete..Visible=False
      	Btn_New..Visible=False
      	BTN_Modificar..Visible=False
      	BTN_Imprimir..Visible=False
      	TABLE_estados_descritivos..LineHeight=30
      	BTN_Fechar..Y=506
      	BTN_Fechar..Height=38
      	BTN_anterior..Visible=True
      	BTN_seguinte..Visible=True
      	SetFocus(BTN_selecionar)
      END
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_estados_descritivos/BTN_Fechar/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:182 |
| WIN_Table_estados_descritivos/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:261 |
| WIN_Table_estados_descritivos/BTN_Imprimir/18 | A-d2d708 | Print RPT_List_estados_descritivos (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:299 |
| WIN_Table_estados_descritivos/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:340 |
| WIN_Table_estados_descritivos/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:363 |
| WIN_Table_estados_descritivos/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:388 |
| WIN_Table_estados_descritivos/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:413 |
| WIN_Table_estados_descritivos/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:482 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_estados_descritivos/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:583`

```wlanguage
580: Restore(WIN_Table_estados_descritivos)
581: WinStatus(WIN_Table_estados_descritivos,TopActive)
582: CASE NotFound
583: OpenChild(WIN_Table_estados_descritivos,False,"")
584: END
585: type : 32
586: -
587: name : OPT_Estados_de_Reparação
588: identifier : 0x265c69e01f3cef2e
```

`legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Estado.wdw:416`

```wlanguage
413: p_codes :
414: -
415: code : |1-
416: EDT_descricao=open(WIN_Table_estados_descritivos,true,"")
417: type : 18
418: -
419: type : 161
420: enabled : false
421: -
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:206 → WIN_Form_estados_descritivos; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:235 → WIN_Form_estados_descritivos |
| SetFocus | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:584 → BTN_selecionar |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:203 → estados_descritivos |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:209 → TABLE_estados_descritivos; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:238 → TABLE_estados_descritivos; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:275 → TABLE_estados_descritivos |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:232 → TABLE_estados_descritivos; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:264 → TABLE_estados_descritivos; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:508 → TABLE_estados_descritivos; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:509 → TABLE_estados_descritivos; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:534 → TABLE_estados_descritivos; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:535 → TABLE_estados_descritivos |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:268 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_descritivos.wdw:272 → TABLE_estados_descritivos |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CC5618D6-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CC5618D6-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CC5618D6-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CC5618D6-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CC5618D6-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CC5618D6-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CC5618D6-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CC5618D6-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_estados_descritivos: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of estados_descritivos, no condition, in the order of the table that prints it (WIN_Table_estados_descritivos, by estados_descritivosID); confirm on a legacy printout
- RPT_List_estados_descritivos: no call in code; named in the compiled code of WIN_Table_estados_descritivos (a predefined button action there is the likely caller — see encoded actions)
