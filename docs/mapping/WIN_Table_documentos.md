# Mapping — WIN_Table_documentos

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select documentos. {"PT": "Tabela de Documentos"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_MENU.wdw:617 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:257 (Open in WIN_Table_Lin_Stocks)`; `GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:483 (Open in WIN_Table_cab_stocks)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

COL_Stock displays 1→Entrada, 2→Saída. Delete rejects document types used by cab_stocks. Selector mode hides CRUD/print, sets row height 30, and enlarges/repositions close button; selected return is documentos.Codigo.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CFEE768B-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_documentos/TABLE_documentos — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:139-143`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_documentos..DoubleClick="BTN_selecionar"
         ELSE
         	TABLE_documentos..DoubleClick="BTN_Modificar"
         END
```

### WIN_Table_documentos/TABLE_documentos — Display a row (raw 21)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:167-172`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
         switch TABLE_documentos.COL_Stock
         	case 1
         		TABLE_documentos.COL_Stock="Entrada"
         	CASE 2
         		TABLE_documentos.COL_Stock="Saída"
         END
```

### WIN_Table_documentos/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:245-254`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(documentos)
         IF Open(WIN_Form_documentos) THEN
         	TableDisplay(TABLE_documentos,taCurrentFirst)
         END
```

### WIN_Table_documentos/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:274-281`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_documentos)=-1 THEN RETURN
         Open(WIN_Form_documentos)
         TableDisplay(TABLE_documentos,taCurrentSelection)
```

### WIN_Table_documentos/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:306-327`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_documentos) = -1 THEN RETURN
         Query is string="SELECT cab_stocks.documento_codigo AS documento_codigo,documentos.Codigo AS Codigo FROM documentos,cab_stocks WHERE cab_stocks.documento_codigo = documentos.Codigo AND (documentos.Codigo ='"+TABLE_documentos.COL_Codigo+"')"
         Qry_select_cab_stocks_tipodoc is data source
         HExecuteSQLQuery(Qry_select_cab_stocks_tipodoc,hQueryDefault,Query)
         IF HNbRec(Qry_select_cab_stocks_tipodoc)>0 THEN
         	Info("Tipo de documento associado a documentos, não pode ser eliminado")
         	HCancelDeclaration(Qry_select_cab_stocks_tipodoc)
         	RETURN
         ELSE
         	HCancelDeclaration(Qry_select_cab_stocks_tipodoc)
         END
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_documentos)
         		TableDisplay(TABLE_documentos, taCurrentFirst)
         	CASE 2
         END
```

### WIN_Table_documentos/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:531-531`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=documentos.Codigo
```

### WIN_Table_documentos/BTN_seguinte — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:555-557`. If TableSelect(table)<TableCount(table), request selection index TableSelect(table)+1 using the exact table assignment or TableSelectPlus call below. There is no lower-bound or no-selection guard in this handler.

```wlanguage
         IF TableSelect(TABLE_documentos)<TableCount(TABLE_documentos) THEN
         	tableselectplus(TABLE_documentos,TableSelect(TABLE_documentos)+1)	 
         END
```

### WIN_Table_documentos/BTN_anterior — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:581-583`. Move one row only within the 1-based bounds; do not wrap at either end.

```wlanguage
         IF TableSelect(TABLE_documentos)>1 THEN
         	TableSelectPlus(TABLE_documentos,TableSelect(TABLE_documentos)-1)
         END
```

### WIN_Table_documentos — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:605-632`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_documentos(selecionar,origem)
      lTeclado is boolean =false
      IF selecionar=True THEN
      	lTeclado=True
      	BTN_selecionar..Visible=selecionar
      	MyWindow..ReturnedValue=origem
      	BTN_Delete..Visible=False
      	Btn_New..Visible=False
      	BTN_Modificar..Visible=False
      	BTN_Imprimir..Visible=False
      	TABLE_documentos..LineHeight=30
      	BTN_Fechar..Y=503
      	BTN_Fechar..Height=38
      	BTN_anterior..Visible=True
      	BTN_seguinte..Visible=True
      	SetFocus(BTN_selecionar)
      END
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_documentos/BTN_Fechar/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:225 |
| WIN_Table_documentos/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:304 |
| WIN_Table_documentos/BTN_Imprimir/18 | A-424f7f | Print RPT_List_documentos (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:346 |
| WIN_Table_documentos/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:387 |
| WIN_Table_documentos/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:410 |
| WIN_Table_documentos/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:435 |
| WIN_Table_documentos/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:460 |
| WIN_Table_documentos/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:529 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_documentos/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:617`

```wlanguage
614: Restore(WIN_Table_documentos)
615: WinStatus(WIN_Table_documentos,TopActive)
616: CASE NotFound
617: OpenChild(WIN_Table_documentos,False,"")
618: END
619: type : 32
620: -
621: name : OPT_Terminais
622: identifier : 0x266061c83600b45b
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:257`

```wlanguage
254: type : 14
255: -
256: code : |1-
257: COMBO_tipo_doc=open(WIN_Table_documentos,true,COMBO_tipo_doc)
258: ExecuteProcess(COMBO_tipo_doc,trtSelection)
259: type : 18
260: -
261: type : 161
262: enabled : false
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_cab_stocks.wdw:483`

```wlanguage
480: type : 14
481: -
482: code : |1-
483: COMBO_tipo_doc=Open(WIN_Table_documentos,True,combo_tipo_doc)
484: sFiltro is string
485: IF COMBO_tipo_doc<>"" THEN
486: sFiltro="documento_codigo ='"+COMBO_tipo_doc+"'"
487: END
488: IF EDT_Do_n=0 THEN
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Info | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:313 → "Tipo de documento associado a documentos, não pode ser eliminado" |
| HCancelDeclaration | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:314 → Qry_select_cab_stocks_tipodoc; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:317 → Qry_select_cab_stocks_tipodoc |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:311 → Qry_select_cab_stocks_tipodoc |
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:249 → WIN_Form_documentos; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:278 → WIN_Form_documentos |
| SetFocus | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:631 → BTN_selecionar |
| HNbRec | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:312 → Qry_select_cab_stocks_tipodoc |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:246 → documentos |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:252 → TABLE_documentos; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:281 → TABLE_documentos; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:324 → TABLE_documentos |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:275 → TABLE_documentos; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:307 → TABLE_documentos; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:555 → TABLE_documentos; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:556 → TABLE_documentos; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:581 → TABLE_documentos; legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:582 → TABLE_documentos |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:320 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:323 → TABLE_documentos |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CFEE768B-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CFEE768B-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CFEE768B-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CFEE768B-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CFEE768B-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CFEE768B-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CFEE768B-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CFEE768B-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_documentos: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of documentos, no condition, in the order of the table that prints it (WIN_Table_documentos, by documentosID); confirm on a legacy printout
- RPT_List_documentos: no call in code; named in the compiled code of WIN_Table_documentos (a predefined button action there is the likely caller — see encoded actions)
