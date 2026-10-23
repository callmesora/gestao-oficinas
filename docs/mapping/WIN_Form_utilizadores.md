# Mapping — WIN_Form_utilizadores

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Create or edit utilizadores. {}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:190 (Open in WIN_Table_utilizadores)`; `GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:219 (Open in WIN_Table_utilizadores)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Code, name and password are required. Password is uppercased before ScreenToFile. Do not publish field values in evidence.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CE3323C9-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Form_utilizadores/BTN_Validar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:34-71`. Validate in source order, stop on RETURN, then copy controls into the current file buffer. NewRecord selects HAdd versus HModify; duplicate failures show the item name and its current value, restore the global error handler and return. Other failure kinds are not explicitly stopped before success=True. Uppercase the source field before saving; preserve workstation locale semantics rather than JavaScript default assumptions.

```wlanguage
         IF EDT_Codigo="" THEN
         	Info("Falta indicar o código")
         	RETURN
         END
         IF EDT_Descricao="" THEN
         	Info("Falta indicar o nome")
         	RETURN
         END
         IF EDT_Palavra_passe="" THEN
         	Info("Falta indicar a palavra-passe")
         	RETURN
         END
         EDT_Palavra_passe=upper(EDT_Palavra_passe)
         ScreenToFile()
         HOnError(utilizadores,hErrDuplicates,"")
         IF utilizadores..NewRecord THEN
         	IF HAdd(utilizadores)=False THEN
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"utilizadores." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END
         ELSE
         	IF HModify(utilizadores)=False
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"utilizadores." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END 	
         END
         HOnError ("*", hErrAll)
         MyWindow..ReturnedValue = True
```

### WIN_Form_utilizadores/BTN_Cancelar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:92-92`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=false
```

### WIN_Form_utilizadores — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:350-369`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Form_utilizadores()
      IF utilizadores..NewRecord THEN
      	EDT_Codigo..InputEnabled=True
      ELSE
      	EDT_Codigo..InputEnabled=False
      END
```

### WIN_Form_utilizadores — End of initialization (raw 34)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:372-376`. Copy the current HFSQL file buffer into linked controls; default ReturnedValue=False means cancellation unless validation changes it.

```wlanguage
      FileToScreen()
      MyWindow..ReturnedValue = False
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Form_utilizadores/BTN_Validar/18 | A-34cd5c | Close the window after the code (it returns the value the code sets) | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:32 |
| WIN_Form_utilizadores/BTN_Cancelar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:90 |
| WIN_Form_utilizadores/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:209 |
| WIN_Form_utilizadores/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:232 |
| WIN_Form_utilizadores/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:257 |
| WIN_Form_utilizadores/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:282 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Form_utilizadores/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:190`

```wlanguage
187: HReset(utilizadores)
188: 
189: // Open the form of utilizadores file in creation mode
190: IF Open(WIN_Form_utilizadores) THEN
191: 
192: // Refresh the table
193: TableDisplay(TABLE_utilizadores,taCurrentFirst)
194: 
195: END
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_utilizadores.wdw:219`

```wlanguage
216: IF TableSelect(TABLE_utilizadores)=-1 THEN RETURN
217: 
218: // Open the form of utilizadores file in modification mode
219: Open(WIN_Form_utilizadores)
220: 
221: // Refresh the table
222: TableDisplay(TABLE_utilizadores,taCurrentSelection)
223: type : 18
224: -
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Error | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:54 → "Duplicação:  Este registo não pode ser gravado."; legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:64 → "Duplicação:  Este registo não pode ser gravado." |
| Info | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:35 → "Falta indicar o código"; legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:39 → "Falta indicar o nome"; legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:43 → "Falta indicar a palavra-passe" |
| ScreenToFile | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:47 →  |
| HOnError | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:48 → utilizadores; legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:55 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:65 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:70 → "*" |
| HAdd | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:50 → utilizadores |
| HModify | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:60 → utilizadores |
| FileToScreen | legacy/GestaoOficinas_TesteIA/WIN_Form_utilizadores.wdw:373 →  |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CE3323C9-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CE3323C9-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CE3323C9-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CE3323C9-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CE3323C9-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CE3323C9-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CE3323C9-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CE3323C9-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.
