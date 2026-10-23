# Mapping — WIN_Table_utilizadores

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select utilizadores. {"PT": "Tabela de utilizadores"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Acesso.wdw:331 (Open in WIN_Acesso)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:668 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:849 (Open in WIN_Ordens_Reparacao_Form)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Selector returns utilizadores.Codigo; default return is origem. Selector mode hides CRUD and printing and uses 30-pixel rows and previous/next; no relationship guard precedes deletion.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CD9683DC-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_utilizadores/TABLE_utilizadores — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:79-83`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_utilizadores..DoubleClick="BTN_selecionar"
         ELSE
         	TABLE_utilizadores..DoubleClick="BTN_Modificar"
         END
```

### WIN_Table_utilizadores/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:186-195`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(utilizadores)
         IF Open(WIN_Form_utilizadores) THEN
         	TableDisplay(TABLE_utilizadores,taCurrentFirst)
         END
```

### WIN_Table_utilizadores/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:215-222`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_utilizadores)=-1 THEN RETURN
         Open(WIN_Form_utilizadores)
         TableDisplay(TABLE_utilizadores,taCurrentSelection)
```

### WIN_Table_utilizadores/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:247-257`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_utilizadores) = -1 THEN RETURN
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_utilizadores)
         		TableDisplay(TABLE_utilizadores, taCurrentFirst)
         	CASE 2
         END
```

### WIN_Table_utilizadores/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:461-461`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=utilizadores.Codigo
```

### WIN_Table_utilizadores/BTN_seguinte — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:485-487`. If TableSelect(table)<TableCount(table), request selection index TableSelect(table)+1 using the exact table assignment or TableSelectPlus call below. There is no lower-bound or no-selection guard in this handler.

```wlanguage
         IF TableSelect(TABLE_utilizadores)<TableCount(TABLE_utilizadores) THEN
         	TABLE_utilizadores=TableSelect(TABLE_utilizadores)+1	 
         END
```

### WIN_Table_utilizadores/BTN_anterior — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:511-513`. Move one row only within the 1-based bounds; do not wrap at either end.

```wlanguage
         IF TableSelect(TABLE_utilizadores)>1 THEN
         	TABLE_utilizadores=TableSelect(TABLE_utilizadores)-1	 
         END
```

### WIN_Table_utilizadores — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:535-560`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_utilizadores(selecionar,origem)
      if selecionar=true then
      	BTN_selecionar..Visible=True
      	TABLE_utilizadores..LineHeight=30
      	BTN_Fechar..y=506
      	BTN_Fechar..Height=38
      	BTN_Imprimir..visible=false
      	BTN_Modificar..visible=false
      	Btn_New..visible=false
      	BTN_Delete..Visible=False
      	BTN_anterior..Visible=true
      	BTN_seguinte..Visible=True
      	SetFocus(BTN_selecionar)
      end
      MyWindow..ReturnedValue=origem
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_utilizadores/BTN_Fechar/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:164 |
| WIN_Table_utilizadores/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:245 |
| WIN_Table_utilizadores/BTN_Imprimir/18 | A-057f73 | Print RPT_List_utilizadores (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:276 |
| WIN_Table_utilizadores/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:317 |
| WIN_Table_utilizadores/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:340 |
| WIN_Table_utilizadores/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:365 |
| WIN_Table_utilizadores/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:390 |
| WIN_Table_utilizadores/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:459 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_utilizadores/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Acesso.wdw:331`

```wlanguage
328: type : 14
329: -
330: code : |1-
331: gnUtilizador=open(WIN_Table_utilizadores,true,gnUtilizador)
332: if gnUtilizador<>0 then
333: hreadseek(utilizadores,Codigo,gnUtilizador,hIdentical)
334: if hfound(utilizadores)=true then
335: EDT_utilizador=utilizadores.descricao
336: END
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:668`

```wlanguage
665: Restore(WIN_Table_utilizadores)
666: WinStatus(WIN_Table_utilizadores,TopActive)
667: CASE NotFound
668: OpenChild(WIN_Table_utilizadores,false,"")
669: END
670: type : 32
671: -
672: name : OPT_Mecânicos
673: identifier : 0x265c690e1f09bbb9
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:849`

```wlanguage
846: type : 14
847: -
848: code : |1-
849: COMBO_Recepcionado=open(WIN_Table_utilizadores,true,COMBO_Recepcionado)
850: type : 18
851: -
852: type : 161
853: enabled : false
854: -
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:190 → WIN_Form_utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:219 → WIN_Form_utilizadores |
| SetFocus | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:558 → BTN_selecionar |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:187 → utilizadores |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:193 → TABLE_utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:222 → TABLE_utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:254 → TABLE_utilizadores |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:216 → TABLE_utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:248 → TABLE_utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:485 → TABLE_utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:486 → TABLE_utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:511 → TABLE_utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:512 → TABLE_utilizadores |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:250 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:253 → TABLE_utilizadores |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CD9683DC-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CD9683DC-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CD9683DC-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CD9683DC-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CD9683DC-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CD9683DC-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CD9683DC-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CD9683DC-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_utilizadores: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of utilizadores, no condition, in the order of the table that prints it (WIN_Table_utilizadores, by utilizadoresID); confirm on a legacy printout
- RPT_List_utilizadores: no call in code; named in the compiled code of WIN_Table_utilizadores (a predefined button action there is the likely caller — see encoded actions)
