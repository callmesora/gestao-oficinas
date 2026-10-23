# Mapping — WIN_Table_Terminais

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select Terminais. {"PT": "Tabela de terminais de recolha de dados"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Form_postos.wdw:239 (Open in WIN_Form_postos)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:634 (OpenChild in WIN_MENU)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Selector returns Terminais.Codigo; default return is origem. Double-click selects in selector mode or modifies otherwise. No relationship guard precedes deletion.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-C33B299B-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_Terminais/TABLE_Terminais — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:79-83`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_Terminais..DoubleClick="BTN_selecionar"
         ELSE
         	TABLE_Terminais..DoubleClick="BTN_Modificar"
         END
```

### WIN_Table_Terminais/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:180-189`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(Terminais)
         IF Open(WIN_Form_Terminais) THEN
         	TableDisplay(TABLE_Terminais,taCurrentFirst)
         END
```

### WIN_Table_Terminais/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:213-220`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_Terminais)=-1 THEN RETURN
         TableDisplay(TABLE_Terminais,taCurrentSelection)
         Open(WIN_Form_Terminais)
         TableDisplay(TABLE_Terminais,taCurrentSelection)
```

### WIN_Table_Terminais/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:245-262`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_Terminais) = -1 THEN RETURN
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_Terminais)
         		TableDisplay(TABLE_Terminais, taCurrentFirst)
         	CASE 2
         END
```

### WIN_Table_Terminais/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:447-447`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=Terminais.Codigo
```

### WIN_Table_Terminais — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:469-483`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_Terminais(selecionar,origem)
      BTN_selecionar..visible=selecionar
      mywindow..ReturnedValue=origem
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_Terminais/BTN_Fechar/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:160 |
| WIN_Table_Terminais/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:243 |
| WIN_Table_Terminais/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:303 |
| WIN_Table_Terminais/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:326 |
| WIN_Table_Terminais/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:351 |
| WIN_Table_Terminais/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:376 |
| WIN_Table_Terminais/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:445 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_Terminais/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:239`

```wlanguage
236: type : 14
237: -
238: code : |1-
239: EDT_Terminal=open(WIN_Table_Terminais,true,EDT_Terminal)
240: type : 18
241: -
242: type : 161
243: enabled : false
244: type : 40
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:634`

```wlanguage
631: Restore(WIN_Table_Terminais)
632: WinStatus(WIN_Table_Terminais,TopActive)
633: CASE NotFound
634: OpenChild(WIN_Table_Terminais,false,"")
635: END
636: type : 32
637: -
638: name : OPT_Unidades
639: identifier : 0x265c68ff1f057eb0
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:184 → WIN_Form_Terminais; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:217 → WIN_Form_Terminais |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:181 → Terminais |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:187 → TABLE_Terminais; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:215 → TABLE_Terminais; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:220 → TABLE_Terminais; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:257 → TABLE_Terminais |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:214 → TABLE_Terminais; legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:246 → TABLE_Terminais |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:250 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_Terminais.wdw:254 → TABLE_Terminais |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-C33B299B-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-C33B299B-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-C33B299B-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-C33B299B-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-C33B299B-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-C33B299B-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-C33B299B-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-C33B299B-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.
