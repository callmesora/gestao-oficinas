# Mapping — WIN_Form_Clientes

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Create or edit Clientes. {"PT": "Clientes"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:303 (Open in WIN_Table_Clientes)`; `GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:334 (Open in WIN_Table_Clientes)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

New customer code is max(existing Codigo)+1 in a FOR EACH scan, then HReset; no lock or transaction protects simultaneous allocations. If existing maximum is 41, suggested code is 42. EDT_Codigo is editable only in new mode; focus moves to description.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-C286277B-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Form_Clientes/BTN_Validar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:38-71`. Validate in source order, stop on RETURN, then copy controls into the current file buffer. NewRecord selects HAdd versus HModify; duplicate failures show the item name and its current value, restore the global error handler and return. Other failure kinds are not explicitly stopped before success=True.

```wlanguage
         IF EDT_Codigo=0 THEN
         	Info("Falta indicar o código")
         	RETURN
         END
         IF EDT_Descricao="" THEN
         	Info("Falta indicar a descrição")
         	RETURN
         END
         ScreenToFile()
         clientes.Codigo=EDT_Codigo
         HOnError(clientes,hErrDuplicates,"")
         IF clientes..NewRecord THEN
         	IF HAdd(clientes)=False THEN
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"clientes." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END
         ELSE
         	IF HModify(clientes)=False
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"clientes." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END 	
         END
         HOnError ("*", hErrAll)
         MyWindow..ReturnedValue = True
```

### WIN_Form_Clientes — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:453-467`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Form_Clientes()
```

### WIN_Form_Clientes — End of initialization (raw 34)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:470-488`. Copy the current HFSQL file buffer into linked controls; default ReturnedValue=False means cancellation unless validation changes it.

```wlanguage
      IF Clientes..NewRecord THEN
      	EDT_Codigo..InputEnabled=True
      	i is int
      	FOR EACH Clientes  
      		IF Clientes.Codigo>i THEN
      			i=Clientes.Codigo
      		END
      	END
      	i++
      	EDT_Codigo=i
      	HReset(Clientes)
      	SetFocus(EDT_Descricao)
      ELSE
      	EDT_Codigo..InputEnabled=False
      	FileToScreen()
      END
      MyWindow..ReturnedValue = False
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Form_Clientes/BTN_Validar/18 | A-34cd5c | Close the window after the code (it returns the value the code sets) | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:36 |
| WIN_Form_Clientes/BTN_Cancelar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:90 |
| WIN_Form_Clientes/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:312 |
| WIN_Form_Clientes/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:335 |
| WIN_Form_Clientes/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:360 |
| WIN_Form_Clientes/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:385 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Form_Clientes/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:303`

```wlanguage
300: HReset(Clientes)
301: 
302: // Open the form of Clientes file in creation mode
303: IF Open(WIN_Form_Clientes) THEN
304: 
305: // Refresh the table
306: TableDisplay(TABLE_Clientes,taCurrentFirst)
307: EDT_Observacao=Clientes.observacao
308: END
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:334`

```wlanguage
331: code : |1-
332: IF TableSelect(TABLE_Clientes)=-1 THEN RETURN
333: TableDisplay(TABLE_Clientes,taCurrentSelection)
334: Open(WIN_Form_Clientes)
335: TableDisplay(TABLE_Clientes,taCurrentSelection)
336: EDT_Observacao=Clientes.observacao
337: type : 18
338: -
339: type : 161
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Error | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:54 → "Duplicação:  Este registo não pode ser gravado."; legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:64 → "Duplicação:  Este registo não pode ser gravado." |
| Info | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:39 → "Falta indicar o código"; legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:43 → "Falta indicar a descrição" |
| SetFocus | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:481 → EDT_Descricao |
| ScreenToFile | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:46 →  |
| HOnError | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:48 → clientes; legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:55 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:65 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:70 → "*" |
| HAdd | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:50 → clientes |
| HModify | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:60 → clientes |
| FileToScreen | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:484 →  |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Form_Clientes.wdw:480 → Clientes |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-C286277B-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-C286277B-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-C286277B-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-C286277B-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-C286277B-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-C286277B-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-C286277B-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-C286277B-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.
