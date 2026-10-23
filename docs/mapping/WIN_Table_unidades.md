# Mapping — WIN_Table_unidades

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select unidades. {"PT": "Tabela de Unidades"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_MENU.wdw:651 (OpenChild in WIN_MENU)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Deletion queries artigos.unidade and rejects units in use. New table-row input grays GR_ACTION; exit reactivates it.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CCB16084-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_unidades/TABLE_unidades — Enter input mode in a row (raw 19)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:101-106`. Disable the action group while entering a new table row and reactivate it on leaving the row.

```wlanguage
         IF MySelf..NewLine THEN
         	GR_ACTION..State = Grayed
         END
```

### WIN_Table_unidades/TABLE_unidades — Exit from a row (raw 20)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:110-111`. Disable the action group while entering a new table row and reactivate it on leaving the row.

```wlanguage
         GR_ACTION..State = Active
```

### WIN_Table_unidades/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:180-189`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(unidades)
         IF Open(WIN_Form_unidades) THEN
         	TableDisplay(TABLE_unidades,taCurrentFirst)
         END
```

### WIN_Table_unidades/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:209-216`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_unidades)=-1 THEN RETURN
         Open(WIN_Form_unidades)
         TableDisplay(TABLE_unidades,taCurrentSelection)
```

### WIN_Table_unidades/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:241-262`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_unidades) = -1 THEN RETURN
         Query is string="SELECT artigos.unidade AS unidade,unidades.Codigo AS Codigo FROM unidades,artigos WHERE artigos.unidade = unidades.Codigo AND (unidades.Codigo ='"+TABLE_unidades.COL_Codigo+"')"
         Qry_select_artigos_unidade is data source
         HExecuteSQLQuery(Qry_select_artigos_unidade,hQueryDefault,Query)
         IF HNbRec(Qry_select_artigos_unidade)>0 THEN
         	Info("Unidade usada em artigos, não pode ser eliminada")
         	HCancelDeclaration(Qry_select_artigos_unidade)
         	RETURN
         ELSE	
         	HCancelDeclaration(Qry_select_artigos_unidade)
         END
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_unidades)
         		TableDisplay(TABLE_unidades, taCurrentFirst)		
         	CASE 2
         END
```

### WIN_Table_unidades — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:462-475`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_unidades()
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_unidades/BTN_Fechar/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:160 |
| WIN_Table_unidades/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:239 |
| WIN_Table_unidades/BTN_Imprimir/18 | A-69d0df | Print RPT_List_unidades (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:281 |
| WIN_Table_unidades/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:322 |
| WIN_Table_unidades/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:345 |
| WIN_Table_unidades/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:370 |
| WIN_Table_unidades/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:395 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_unidades/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:651`

```wlanguage
648: Restore(WIN_Table_unidades)
649: WinStatus(WIN_Table_unidades,TopActive)
650: CASE NotFound
651: OpenChild(WIN_Table_unidades)
652: END
653: type : 32
654: -
655: name : OPT_Utilizadores
656: identifier : 0x265c69061f079b8f
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Info | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:248 → "Unidade usada em artigos, não pode ser eliminada" |
| HCancelDeclaration | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:249 → Qry_select_artigos_unidade; legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:252 → Qry_select_artigos_unidade |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:246 → Qry_select_artigos_unidade |
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:184 → WIN_Form_unidades; legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:213 → WIN_Form_unidades |
| HNbRec | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:247 → Qry_select_artigos_unidade |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:181 → unidades |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:187 → TABLE_unidades; legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:216 → TABLE_unidades; legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:259 → TABLE_unidades |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:210 → TABLE_unidades; legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:242 → TABLE_unidades |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:255 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_unidades.wdw:258 → TABLE_unidades |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CCB16084-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CCB16084-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CCB16084-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CCB16084-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CCB16084-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CCB16084-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CCB16084-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CCB16084-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_unidades: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of unidades, no condition, in the order of the table that prints it (WIN_Table_unidades, by unidadesID); confirm on a legacy printout
- RPT_List_unidades: no call in code; named in the compiled code of WIN_Table_unidades (a predefined button action there is the likely caller — see encoded actions)
