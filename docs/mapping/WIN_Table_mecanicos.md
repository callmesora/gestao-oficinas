# Mapping — WIN_Table_mecanicos

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select mecanicos. {"PT": "Tabela de mecânicos"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:612 (Open in WIN_Filtro_Mapas_Tempos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:636 (Open in WIN_Filtro_Mapas_Tempos)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:685 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:285 (Open in WIN_Material_reparacao_form)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1052 (Open in WIN_Ordens_Reparacao)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:766 (Open in WIN_Ordens_Reparacao_Form)`; `GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1004 (Open in WIN_Table_Lin_Stocks)`; `GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:242 (Open in WIN_Tempos_Reparacao_Tempo)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

TableSort by col_inativo runs on initialization and after add, modify and delete. Selector returns mecanicos.codigo and close explicitly returns origem. Selector layout hides CRUD/print and enlarges rows; no relationship guard precedes deletion.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-C44F7892-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_mecanicos/TABLE_mecanicos — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:117-121`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_mecanicos..DoubleClick="BTN_selecionar"
         ELSE
         	TABLE_mecanicos..DoubleClick="BTN_Modificar"
         END
```

### WIN_Table_mecanicos/BTN_Fechar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:200-200`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=origem
```

### WIN_Table_mecanicos/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:224-233`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(mecanicos)
         IF Open(WIN_Form_mecanicos) THEN
         	TableDisplay(TABLE_mecanicos,taCurrentFirst)
         	TableSort(TABLE_mecanicos,"col_inativo")
         END
```

### WIN_Table_mecanicos/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:253-261`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_mecanicos)=-1 THEN RETURN
         Open(WIN_Form_mecanicos)
         TableDisplay(TABLE_mecanicos,taCurrentSelection)
         tablesort(TABLE_mecanicos,"col_inativo")
```

### WIN_Table_mecanicos/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:286-297`. Reject no selection first. There is no relationship guard in this source. Dialog result 1 performs deletion, refresh and inactive sort; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_mecanicos) = -1 THEN RETURN
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_mecanicos)
         		TableDisplay(TABLE_mecanicos, taCurrentFirst)
         		TableSort(TABLE_mecanicos,"col_inativo")
         	CASE 2
         END
```

### WIN_Table_mecanicos/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:507-507`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=mecanicos.codigo
```

### WIN_Table_mecanicos/BTN_seguinte — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:531-533`. If TableSelect(table)<TableCount(table), request selection index TableSelect(table)+1 using the exact table assignment or TableSelectPlus call below. There is no lower-bound or no-selection guard in this handler.

```wlanguage
         IF TableSelect(TABLE_mecanicos)<TableCount(TABLE_mecanicos) THEN
         	TABLE_mecanicos=TableSelect(TABLE_mecanicos)+1	 
         END
```

### WIN_Table_mecanicos/BTN_anterior — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:557-559`. Move one row only within the 1-based bounds; do not wrap at either end.

```wlanguage
         IF TableSelect(TABLE_mecanicos)>1 THEN
         	TABLE_mecanicos=TableSelect(TABLE_mecanicos)-1	 
         END
```

### WIN_Table_mecanicos — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:580-605`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_mecanicos(selecionar,origem)
      if selecionar=true then
      	BTN_selecionar..Visible=true
      	MyWindow..ReturnedValue=origem
      	BTN_Fechar..y=506
      	BTN_Fechar..Height=38
      	btn_new..Visible=False
      	BTN_Modificar..Visible=False
      	BTN_Delete..Visible=False
      	BTN_Imprimir..visible=false
      	BTN_anterior..Visible=True
      	BTN_seguinte..Visible=True
      	TABLE_mecanicos..LineHeight=30
      	setfocus(BTN_selecionar)
      end
```

### WIN_Table_mecanicos — End of initialization (raw 34)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:608-608`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
      TableSort(TABLE_mecanicos,"col_inativo")
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_mecanicos/BTN_Fechar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:198 |
| WIN_Table_mecanicos/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:284 |
| WIN_Table_mecanicos/BTN_Imprimir/18 | A-897b90 | Print RPT_List_mecanicos (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:320 |
| WIN_Table_mecanicos/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:363 |
| WIN_Table_mecanicos/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:386 |
| WIN_Table_mecanicos/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:411 |
| WIN_Table_mecanicos/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:436 |
| WIN_Table_mecanicos/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:505 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_mecanicos/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:612`

```wlanguage
609: type : 14
610: -
611: code : |1-
612: EDT_Ao_mecanico=open(WIN_Table_mecanicos,true,EDT_Ao_mecanico)
613: type : 18
614: -
615: type : 161
616: enabled : false
617: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:636`

```wlanguage
633: type : 14
634: -
635: code : |1-
636: EDT_Do_mecanico=open(WIN_Table_mecanicos,true,EDT_Do_mecanico)
637: if EDT_Do_mecanico<>0 then
638: EDT_Ao_mecanico=EDT_Do_mecanico
639: end
640: type : 18
641: -
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:685`

```wlanguage
682: Restore(WIN_Table_mecanicos)
683: WinStatus(WIN_Table_mecanicos,TopActive)
684: CASE NotFound
685: OpenChild(WIN_Table_mecanicos,False,"")
686: END
687: type : 32
688: code_elements :
689: type_code : 26
690: p_codes : []
```

`legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:285`

```wlanguage
282: -
283: code : |1-
284: sMecanico is string
285: sMecanico=open(WIN_Table_mecanicos,true,"")
286: if sMecanico<>"" then
287: HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,sMecanico)
288: hreadfirst(QRY_select_mecanicos_codigo)
289: if QRY_select_mecanicos_codigo.inativo=true then
290: info("Mecânico inativo")
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1052`

```wlanguage
1049: type : 14
1050: -
1051: code : |1-
1052: COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico)
1053: type : 18
1054: -
1055: type : 161
1056: enabled : false
1057: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:766`

```wlanguage
763: type : 14
764: -
765: code : |1-
766: COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico)
767: type : 18
768: -
769: type : 161
770: enabled : false
771: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1004`

```wlanguage
1001: type : 14
1002: -
1003: code : |1-
1004: COMBO_mecanico=open(WIN_Table_mecanicos,true,COMBO_mecanico)
1005: type : 18
1006: -
1007: type : 161
1008: enabled : false
1009: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:242`

```wlanguage
239: -
240: code : |1-
241: sMecanico is string
242: sMecanico=open(WIN_Table_mecanicos,true,"")
243: if sMecanico<>"" then
244: HExecuteQuery(QRY_select_mecanicos_codigo,hQueryDefault,sMecanico)
245: hreadfirst(QRY_select_mecanicos_codigo)
246: if QRY_select_mecanicos_codigo.Codigo=gsMecanico_ativo then
247: EDT_mecanico=QRY_select_mecanicos_codigo.Descricao
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:228 → WIN_Form_mecanicos; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:257 → WIN_Form_mecanicos |
| SetFocus | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:604 → BTN_selecionar |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:225 → mecanicos |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:231 → TABLE_mecanicos; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:260 → TABLE_mecanicos; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:293 → TABLE_mecanicos |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:254 → TABLE_mecanicos; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:287 → TABLE_mecanicos; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:531 → TABLE_mecanicos; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:532 → TABLE_mecanicos; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:557 → TABLE_mecanicos; legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:558 → TABLE_mecanicos |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:289 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_mecanicos.wdw:292 → TABLE_mecanicos |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-C44F7892-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-C44F7892-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-C44F7892-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-C44F7892-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-C44F7892-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-C44F7892-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-C44F7892-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-C44F7892-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_mecanicos: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of mecanicos, no condition, in the order of the table that prints it (WIN_Table_mecanicos, by Codigo); confirm on a legacy printout
- RPT_List_mecanicos: no call in code; named in the compiled code of WIN_Table_mecanicos (a predefined button action there is the likely caller — see encoded actions)
