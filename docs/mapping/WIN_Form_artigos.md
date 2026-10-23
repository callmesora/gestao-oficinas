# Mapping — WIN_Form_artigos

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Create or edit artigos. {"PT": "Artigos"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:263 (Open in WIN_Table_artigos)`; `GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:294 (Open in WIN_Table_artigos)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Code, description and unit are required. A nonempty barcode is checked for duplicates; editing excludes the same article code. Blank barcodes bypass the duplicate query. Query execution results are not checked before HNbRec.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CAA44622-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Form_artigos/BTN_Validar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:38-98`. Validate in source order, stop on RETURN, then copy controls into the current file buffer. NewRecord selects HAdd versus HModify; duplicate failures show the item name and its current value, restore the global error handler and return. Other failure kinds are not explicitly stopped before success=True.

```wlanguage
         IF EDT_Codigo="" THEN
         	Info("Indique um código")
         	RETURN
         END
         IF EDT_Descricao="" THEN
         	Info("Indique uma descrição")
         	RETURN
         END
         IF COMBO_Unidade="" THEN
         	Info("Indique uma unidade")
         	RETURN
         END
         if EDT_Codbaras<>"" then
         	sQuery is string
         	IF artigos..NewRecord THEN
         		sQuery="select * from artigos where codbarras='"+EDT_Codbaras+"'"
         		dsQry_select_cod_barras is data source
         		HExecuteSQLQuery(dsQry_select_cod_barras,hQueryDefault,sQuery)
         		if HNbRec(dsQry_select_cod_barras)>0 then
         			info("Código de barras já associado a outro artigo")
         			HCancelDeclaration(dsQry_select_cod_barras)
         			return
         		END
         		HCancelDeclaration(dsQry_select_cod_barras)
         	else
         		sQuery="select * from artigos where codbarras='"+EDT_Codbaras+"' and codigo<>'"+EDT_Codigo+"'"
         		dsQry_select_cod_barras is data source
         		HExecuteSQLQuery(dsQry_select_cod_barras,hQueryDefault,sQuery)
         		IF HNbRec(dsQry_select_cod_barras)>0 THEN
         			Info("Código de barras já associado a outro artigo")
         			HCancelDeclaration(dsQry_select_cod_barras)
         			RETURN
         		END
         		HCancelDeclaration(dsQry_select_cod_barras)
         	END
         end
         ScreenToFile()
         HOnError(artigos,hErrDuplicates,"")
         IF artigos..NewRecord THEN
         	IF HAdd(artigos)=False THEN
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"artigos." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END
         ELSE
         	IF HModify(artigos)=False
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"artigos." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END 	
         END
         HOnError ("*", hErrAll)
         MyWindow..ReturnedValue = True
```

### WIN_Form_artigos — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:451-470`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Form_artigos()
      IF artigos..NewRecord THEN
      	EDT_Codigo..InputEnabled=True
      ELSE
      	EDT_Codigo..InputEnabled=False
      END
```

### WIN_Form_artigos — End of initialization (raw 34)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:473-477`. Copy the current HFSQL file buffer into linked controls; default ReturnedValue=False means cancellation unless validation changes it.

```wlanguage
      FileToScreen()
      MyWindow..ReturnedValue = False
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Form_artigos/BTN_Validar/18 | A-34cd5c | Close the window after the code (it returns the value the code sets) | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:36 |
| WIN_Form_artigos/BTN_Cancelar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:117 |
| WIN_Form_artigos/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:310 |
| WIN_Form_artigos/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:333 |
| WIN_Form_artigos/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:358 |
| WIN_Form_artigos/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:383 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Form_artigos/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:263`

```wlanguage
260: HReset(artigos)
261: 
262: // Open the form of artigos file in creation mode
263: IF Open(WIN_Form_artigos) THEN
264: 
265: // Refresh the table
266: TableDisplay(TABLE_artigos,taCurrentFirst)
267: 
268: END
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:294`

```wlanguage
291: code : |1-
292: IF TableSelect(TABLE_artigos)=-1 THEN RETURN
293: //TableDisplay(TABLE_artigos,taCurrentSelection)
294: Open(WIN_Form_artigos)
295: TableDisplay(TABLE_artigos,taCurrentSelection)
296: type : 18
297: -
298: type : 161
299: enabled : false
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Error | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:81 → "Duplicação:  Este registo não pode ser gravado."; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:91 → "Duplicação:  Este registo não pode ser gravado." |
| Info | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:39 → "Indique um código"; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:43 → "Indique uma descrição"; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:47 → "Indique uma unidade"; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:57 → "Código de barras já associado a outro artigo"; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:67 → "Código de barras já associado a outro artigo" |
| HCancelDeclaration | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:58 → dsQry_select_cod_barras; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:61 → dsQry_select_cod_barras; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:68 → dsQry_select_cod_barras; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:71 → dsQry_select_cod_barras |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:55 → dsQry_select_cod_barras; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:65 → dsQry_select_cod_barras |
| HNbRec | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:56 → dsQry_select_cod_barras; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:66 → dsQry_select_cod_barras |
| ScreenToFile | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:74 →  |
| HOnError | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:75 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:82 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:92 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:97 → "*" |
| HAdd | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:77 → artigos |
| HModify | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:87 → artigos |
| FileToScreen | legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:474 →  |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CAA44622-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CAA44622-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CAA44622-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CAA44622-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CAA44622-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CAA44622-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CAA44622-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CAA44622-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.
