# Mapping — WIN_Table_postos

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Maintain postos through the bound list and modal form. {"PT": "Tabela de postos"}. The complete source has no selector parameter/button/return contract or print control; the earlier generic selection wording does not apply.

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_MENU.wdw:486 (Open in WIN_MENU)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Creation resets postos, edit repositions the current selection, then opens the form. Table row entry grays actions for a new row; exit restores them. No relationship guard precedes deletion.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CF0B8FA5-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_postos/TABLE_postos — Enter input mode in a row (raw 19)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:79-84`. Disable the action group while entering a new table row and reactivate it on leaving the row.

```wlanguage
         IF MySelf..NewLine THEN
         	GR_ACTION..State = Grayed
         END
```

### WIN_Table_postos/TABLE_postos — Exit from a row (raw 20)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:88-89`. Disable the action group while entering a new table row and reactivate it on leaving the row.

```wlanguage
         GR_ACTION..State = Active
```

### WIN_Table_postos/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:158-167`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(postos)
         IF Open(WIN_Form_postos) THEN
         	TableDisplay(TABLE_postos,taCurrentFirst)
         END
```

### WIN_Table_postos/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:191-194`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_postos)=-1 THEN RETURN
         TableDisplay(TABLE_postos,taCurrentSelection)
         Open(WIN_Form_postos)
         TableDisplay(TABLE_postos,taCurrentSelection)
```

### WIN_Table_postos/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:219-236`. Reject no selection first. There is no relationship check. Dialog result1 deletes the selected bound record and refreshes taCurrentFirst; result2 makes no change. No explicit transaction or delete-result check is present. This corrects generic mapping prose against the literal source below; the seed ID and source behavior remain unchanged.

```wlanguage
         IF TableSelect(TABLE_postos) = -1 THEN RETURN
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_postos)
         		TableDisplay(TABLE_postos, taCurrentFirst)
         	CASE 2
         END
```

### WIN_Table_postos — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:418-429`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_postos()
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_postos/BTN_Fechar/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:138 |
| WIN_Table_postos/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:217 |
| WIN_Table_postos/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:277 |
| WIN_Table_postos/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:300 |
| WIN_Table_postos/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:325 |
| WIN_Table_postos/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:350 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_postos/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:486`

```wlanguage
483: p_codes :
484: -
485: code : |1-
486: open(WIN_Table_postos)
487: type : 32
488: -
489: name : OPT_Sistema
490: identifier : 0x2665cb543f04fca9
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:162 → WIN_Form_postos; legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:193 → WIN_Form_postos |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:159 → postos |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:165 → TABLE_postos; legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:192 → TABLE_postos; legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:194 → TABLE_postos; legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:231 → TABLE_postos |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:191 → TABLE_postos; legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:220 → TABLE_postos |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:224 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_postos.wdw:228 → TABLE_postos |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CF0B8FA5-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CF0B8FA5-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CF0B8FA5-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CF0B8FA5-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CF0B8FA5-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CF0B8FA5-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CF0B8FA5-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CF0B8FA5-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.
