# Mapping — WIN_Form_Terminais

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Create or edit Terminais. {"PT": "Terminais de recolha de dados"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:184 (Open in WIN_Table_Terminais)`; `GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:217 (Open in WIN_Table_Terminais)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Code and description are required; code becomes noneditable in existing-record mode. Folder chooser first HReadSeek on Terminais, which can change the shared buffer used by later saves.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CDF1C34F-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Form_Terminais/BTN_Validar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:38-70`. Validate in source order, stop on RETURN, then copy controls into the current file buffer. NewRecord selects HAdd versus HModify; duplicate failures show the item name and its current value, restore the global error handler and return. Other failure kinds are not explicitly stopped before success=True.

```wlanguage
         IF EDT_Codigo="" THEN
         	Info("Indique um código")
         	RETURN
         END
         IF EDT_Descricao="" THEN
         	Info("Indique uma descrição")
         	RETURN
         END
         ScreenToFile()
         HOnError(terminais,hErrDuplicates,"")
         IF terminais..NewRecord THEN
         	IF HAdd(terminais)=False THEN
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"terminais." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END
         ELSE
         	IF HModify(terminais)=False
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"terminais." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END 	
         END
         HOnError ("*", hErrAll)
         MyWindow..ReturnedValue = True
```

### WIN_Form_Terminais/SC_Form/BTN_procurar_pasta — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:296-299`. Seek Terminais by the entered code, open the folder chooser initially at that record folder, and assign its result directly to the folder control.

```wlanguage
            HReadSeek(Terminais,Codigo,EDT_Codigo)
            sCaminho_pasta is string
            sCaminho_pasta=fSelectDir(Terminais.pasta_localizacao,"Pasta de Localização do Ficheiro")
            EDT_Localizacao_da_pasta=sCaminho_pasta
```

### WIN_Form_Terminais — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:503-521`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Form_Terminais()
      IF Terminais..NewRecord THEN
      else
      	EDT_Codigo..InputEnabled=false
      END
```

### WIN_Form_Terminais — End of initialization (raw 34)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:524-527`. Copy the current HFSQL file buffer into linked controls; default ReturnedValue=False means cancellation unless validation changes it.

```wlanguage
      FileToScreen()
      MyWindow..ReturnedValue = False
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Form_Terminais/BTN_Validar/18 | A-34cd5c | Close the window after the code (it returns the value the code sets) | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:36 |
| WIN_Form_Terminais/BTN_Cancelar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:93 |
| WIN_Form_Terminais/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:352 |
| WIN_Form_Terminais/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:377 |
| WIN_Form_Terminais/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:402 |
| WIN_Form_Terminais/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:427 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Form_Terminais/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:184`

```wlanguage
181: HReset(Terminais)
182: 
183: // Open the form of Terminais file in creation mode
184: IF Open(WIN_Form_Terminais) THEN
185: 
186: // Refresh the table
187: TableDisplay(TABLE_Terminais,taCurrentFirst)
188: 
189: END
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:217`

```wlanguage
214: IF TableSelect(TABLE_Terminais)=-1 THEN RETURN
215: TableDisplay(TABLE_Terminais,taCurrentSelection)
216: // Open the form of Terminais file in modification mode
217: Open(WIN_Form_Terminais)
218: 
219: // Refresh the table
220: TableDisplay(TABLE_Terminais,taCurrentSelection)
221: type : 18
222: -
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Error | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:53 → "Duplicação:  Este registo não pode ser gravado."; legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:63 → "Duplicação:  Este registo não pode ser gravado." |
| Info | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:39 → "Indique um código"; legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:43 → "Indique uma descrição" |
| HReadSeek | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:296 → Terminais |
| ScreenToFile | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:46 →  |
| HOnError | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:47 → terminais; legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:54 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:64 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:69 → "*" |
| HAdd | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:49 → terminais |
| HModify | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:59 → terminais |
| FileToScreen | legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:525 →  |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CDF1C34F-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CDF1C34F-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CDF1C34F-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CDF1C34F-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CDF1C34F-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CDF1C34F-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CDF1C34F-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CDF1C34F-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.
