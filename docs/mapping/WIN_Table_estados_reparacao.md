# Mapping — WIN_Table_estados_reparacao

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select estados_reparacao. {"PT": "Tabela de Estados de Reparaçªo"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_MENU.wdw:600 (OpenChild in WIN_MENU)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

COL_Tipo displays 1 Recepçao; 2 Aguardar início reparação; 3 Em reparação; 6 Reparação suspensa; 7 Reparação finalizada; 4 Teste; 5 Lavagem; 8 Orçamento. Delete rejects codes referenced by ordem_reparacao.reparacao_estado.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CEBED898-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_estados_reparacao/TABLE_estados_reparacao — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:101-105`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_estados_reparacao..DoubleClick="BTN_selecionar"
         ELSE
         	TABLE_estados_reparacao..DoubleClick="BTN_Modificar"
         END
```

### WIN_Table_estados_reparacao/TABLE_estados_reparacao — Display a row (raw 21)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:129-146`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
         switch TABLE_estados_reparacao.COL_Tipo
         	case 1
         		TABLE_estados_reparacao.COL_Tipo="Recepçao"
         	case 2
         		TABLE_estados_reparacao.COL_Tipo="Aguardar início reparação"
         	case 3
         		TABLE_estados_reparacao.COL_Tipo="Em reparação"
         	case 6
         		TABLE_estados_reparacao.COL_Tipo="Reparação suspensa"
         	case 7
         		TABLE_estados_reparacao.COL_Tipo="Reparação finalizada"
         	case 4
         		TABLE_estados_reparacao.COL_Tipo="Teste"
         	case 5
         		TABLE_estados_reparacao.COL_Tipo="Lavagem"
         	case 8
         		TABLE_estados_reparacao.COL_Tipo="Orçamento"
         END
```

### WIN_Table_estados_reparacao/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:225-234`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(estados_reparacao)
         IF Open(WIN_Form_estados_reparacao) THEN
         	TableDisplay(TABLE_estados_reparacao,taCurrentFirst)
         END
```

### WIN_Table_estados_reparacao/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:258-265`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_estados_reparacao)=-1 THEN RETURN
         TableDisplay(TABLE_estados_reparacao,taCurrentSelection)
         Open(WIN_Form_estados_reparacao)
         TableDisplay(TABLE_estados_reparacao,taCurrentSelection)
```

### WIN_Table_estados_reparacao/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:290-311`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_estados_reparacao) = -1 THEN RETURN
         Query is string="SELECT ordem_reparacao.reparacao_estado AS reparacao_estado,estados_reparacao.Codigo AS Codigo FROM estados_reparacao,ordem_reparacao WHERE estados_reparacao.Codigo = ordem_reparacao.reparacao_estado AND (estados_reparacao.Codigo ='"+TABLE_estados_reparacao.COL_Codigo+"')"
         Qry_select_ordens_reparacao_estado is data source
         HExecuteSQLQuery(Qry_select_ordens_reparacao_estado,hQueryDefault,Query)
         IF HNbRec(Qry_select_ordens_reparacao_estado)>0 THEN
         	Info("Estado de reparação associado a ordens de reparação, não pode ser eliminado")
         	HCancelDeclaration(Qry_select_ordens_reparacao_estado)
         	RETURN
         ELSE
         	HCancelDeclaration(Qry_select_ordens_reparacao_estado)
         END
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_estados_reparacao)
         		TableDisplay(TABLE_estados_reparacao, taCurrentFirst)
         	CASE 2
         END
```

### WIN_Table_estados_reparacao/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:515-515`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=estados_reparacao.codigo
```

### WIN_Table_estados_reparacao — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:537-550`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_estados_reparacao(selecionar,origem)
      BTN_selecionar..Visible=selecionar
      MyWindow..ReturnedValue=origem
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_estados_reparacao/BTN_Fechar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:203 |
| WIN_Table_estados_reparacao/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:288 |
| WIN_Table_estados_reparacao/BTN_Imprimir/18 | A-2a7375 | Print RPT_List_estados_reparacao (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:330 |
| WIN_Table_estados_reparacao/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:371 |
| WIN_Table_estados_reparacao/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:394 |
| WIN_Table_estados_reparacao/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:419 |
| WIN_Table_estados_reparacao/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:444 |
| WIN_Table_estados_reparacao/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:513 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_estados_reparacao/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:600`

```wlanguage
597: Restore(WIN_Table_estados_reparacao)
598: WinStatus(WIN_Table_estados_reparacao,TopActive)
599: CASE NotFound
600: OpenChild(WIN_Table_estados_reparacao,False,"")
601: END
602: type : 32
603: -
604: name : OPT_Documentos
605: identifier : 0x265c68f71f035f12
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Info | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:297 → "Estado de reparação associado a ordens de reparação, não pode ser eliminado" |
| HCancelDeclaration | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:298 → Qry_select_ordens_reparacao_estado; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:301 → Qry_select_ordens_reparacao_estado |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:295 → Qry_select_ordens_reparacao_estado |
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:229 → WIN_Form_estados_reparacao; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:262 → WIN_Form_estados_reparacao |
| HNbRec | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:296 → Qry_select_ordens_reparacao_estado |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:226 → estados_reparacao |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:232 → TABLE_estados_reparacao; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:260 → TABLE_estados_reparacao; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:265 → TABLE_estados_reparacao; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:308 → TABLE_estados_reparacao |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:259 → TABLE_estados_reparacao; legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:291 → TABLE_estados_reparacao |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:304 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_estados_reparacao.wdw:307 → TABLE_estados_reparacao |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CEBED898-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CEBED898-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CEBED898-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CEBED898-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CEBED898-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CEBED898-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CEBED898-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CEBED898-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_estados_reparacao: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of estados_reparacao, no condition, in the order of the table that prints it (WIN_Table_estados_reparacao, by estados_reparacaoID); confirm on a legacy printout
- RPT_List_estados_reparacao: no call in code; named in the compiled code of WIN_Table_estados_reparacao (a predefined button action there is the likely caller — see encoded actions)
