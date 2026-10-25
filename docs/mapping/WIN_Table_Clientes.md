# Mapping — WIN_Table_Clientes

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select Clientes. {"PT": "Tabela de Clientes"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:251 (Open in WIN_Form_Viaturas)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:228 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:549 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1471 (Open in WIN_Ordens_Reparacao)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1376 (Open in WIN_Ordens_Reparacao_Form)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Search modes: codigo, descricao, codigopostal→codpostal, telefone→telefone1 OR telemovel, morada→morada1 OR morada2, todos. A blank term clears filtering. Observation displays from the current Clientes buffer on row selection and after writes. Customers with vehicles cannot be deleted. Closing deactivates Clientes filter.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-CC16AB27-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_Clientes/TABLE_Clientes — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:189-193`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_Clientes..DoubleClick="BTN_selecionar"
         ELSE
         	TABLE_Clientes..DoubleClick="BTN_Modificar"
         END
```

### WIN_Table_Clientes/TABLE_Clientes — Select a row (raw 33)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:233-233`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
         EDT_Observacao=clientes.observacao
```

### WIN_Table_Clientes/BTN_Fechar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:276-276`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=origem
```

### WIN_Table_Clientes/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:300-308`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(Clientes)
         IF Open(WIN_Form_Clientes) THEN
         	TableDisplay(TABLE_Clientes,taCurrentFirst)
         	EDT_Observacao=Clientes.observacao
         END
```

### WIN_Table_Clientes/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:332-336`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_Clientes)=-1 THEN RETURN
         TableDisplay(TABLE_Clientes,taCurrentSelection)
         Open(WIN_Form_Clientes)
         TableDisplay(TABLE_Clientes,taCurrentSelection)
         EDT_Observacao=Clientes.observacao
```

### WIN_Table_Clientes/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:361-382`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_Clientes) = -1 THEN RETURN
         Query is string="SELECT Viaturas.Cliente AS Cliente,Clientes.Codigo AS Codigo FROM Clientes,Viaturas WHERE Clientes.Codigo = Viaturas.Cliente AND (Clientes.Codigo = '"+TABLE_Clientes.COL_Codigo+"')"
         Qry_select_artigos_unidade is data source
         HExecuteSQLQuery(Qry_select_artigos_unidade,hQueryDefault,Query)
         IF HNbRec(Qry_select_artigos_unidade)>0 THEN
         	Info("Cliente com viaturas associadas, não pode ser eliminado")
         	HCancelDeclaration(Qry_select_artigos_unidade)
         	RETURN
         END
         HCancelDeclaration(Qry_select_artigos_unidade)
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_Clientes)
         		TableDisplay(TABLE_Clientes, taCurrentFirst)
         		EDT_Observacao=Clientes.observacao
         	CASE 2
         END
```

### WIN_Table_Clientes/EDT_termo_pesquisa — Whenever modifying (raw 17)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:608-633`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently.

```wlanguage
         if EDT_termo_pesquisa="" then
         	HDeactivateFilter(Clientes)
         	TableDisplay(TABLE_Clientes)
         else
         	sFiltro is string
         	switch gsFiltro_Atual
         		case "codigo"
         			sFiltro="codigo ~] '"+EDT_termo_pesquisa+"'"
         			HFilter(Clientes,sFiltro)
         		case "descricao"
         			sFiltro="descricao ~] '"+EDT_termo_pesquisa+"'"
         			HFilter(Clientes,sFiltro)
         		CASE "codigopostal"
         			sFiltro="codpostal ~] '"+EDT_termo_pesquisa+"'"
         			HFilter(Clientes,sFiltro)
         		CASE "telefone"
         			sFiltro="telefone1 ~] '"+EDT_termo_pesquisa+"' or telemovel ~] '"+EDT_termo_pesquisa+"'"
         			HFilter(Clientes,sFiltro)
         		CASE "morada"
         			sFiltro="morada1 ~] '"+EDT_termo_pesquisa+"' or morada2 ~] '"+EDT_termo_pesquisa+"'"
         			HFilter(Clientes,sFiltro)
         		OTHER CASE
         			HDeactivateFilter(Clientes)
         	END
         	TableDisplay(TABLE_Clientes)
         end
```

### WIN_Table_Clientes/BTN_morada — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:650-655`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         Filtrar_Clientes("morada")
         gsFiltro_Atual="morada"
         EDT_termo_pesquisa=""
         HDeactivateFilter(Clientes)
         tabledisplay(TABLE_Clientes)
         setfocus(EDT_termo_pesquisa)
```

### WIN_Table_Clientes/BTN_descricao — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:675-680`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         Filtrar_Clientes("descricao")
         gsFiltro_Atual="descricao"
         EDT_termo_pesquisa=""
         HDeactivateFilter(Clientes)
         TableDisplay(TABLE_Clientes)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_Clientes/BTN_codigo — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:700-705`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         Filtrar_Clientes("codigo")
         gsFiltro_Atual="codigo"
         EDT_termo_pesquisa=""
         HDeactivateFilter(Clientes)
         TableDisplay(TABLE_Clientes)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_Clientes/BTN_todos — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:725-730`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         Filtrar_Clientes("todos")
         gsFiltro_Atual="todos"
         EDT_termo_pesquisa=""
         HDeactivateFilter(clientes)
         TableDisplay(TABLE_Clientes)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_Clientes/BTN_codigopostal — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:772-777`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         Filtrar_Clientes("codigopostal")
         gsFiltro_Atual="codigopostal"
         EDT_termo_pesquisa=""
         HDeactivateFilter(Clientes)
         tabledisplay(TABLE_Clientes)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_Clientes/BTN_telefone — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:797-802`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         Filtrar_Clientes("telefone")
         gsFiltro_Atual="telefone"
         EDT_termo_pesquisa=""
         HDeactivateFilter(Clientes)
         tabledisplay(TABLE_Clientes)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_Clientes/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:827-827`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=clientes.Codigo
```

### WIN_Table_Clientes — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:849-853`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_Clientes(selecionar,origem)
      gsFiltro_Atual is string
      BTN_selecionar..visible=selecionar
      ExecuteProcess(BTN_todos,trtclick)
      MyWindow..ReturnedValue=origem
```

### WIN_Table_Clientes — Close (raw 2)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:870-870`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently.

```wlanguage
      HDeactivateFilter(Clientes)
```

### WIN_Table_Clientes — Local procedure (raw 458752)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:878-899`. Reset mode buttons to black, 8-point, nonbold, not underlined, retaining the chosen button font family; selected mode becomes DarkBlue, bold and underlined via dynamic control-name access.

```wlanguage
      PROCEDURE Filtrar_Clientes(sOpcao is string)
      ConfFont is Font
      ConfFont..Bold=False 
      ConfFont..Color=Black
      ConfFont..Size=8
      ConfFont..Underline=False
      ConfFont..Name={"BTN_"+sOpcao,indcontrol}..FontName
      BTN_todos..Font=ConfFont
      BTN_codigo..Font=ConfFont
      BTN_codigopostal..Font=ConfFont
      BTN_descricao..Font=ConfFont
      BTN_morada..Font=ConfFont
      BTN_telefone..Font=ConfFont
      ConfFont..Bold=True
      ConfFont..Color=DarkBlue
      ConfFont..Underline=True 
      {"BTN_"+sOpcao,indControl}..Font=ConfFont
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_Clientes/BTN_Fechar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:274 |
| WIN_Table_Clientes/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:359 |
| WIN_Table_Clientes/BTN_Imprimir/18 | A-ce2839 | Print RPT_List_Clientes (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:405 |
| WIN_Table_Clientes/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:448 |
| WIN_Table_Clientes/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:471 |
| WIN_Table_Clientes/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:496 |
| WIN_Table_Clientes/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:521 |
| WIN_Table_Clientes/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:825 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_Clientes/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:251`

```wlanguage
248: type : 14
249: -
250: code : |1-
251: sResultado is string=open(WIN_Table_Clientes,true,COMBO_Codigo)
252: IF sResultado<>"" THEN
253: ListDisplay(COMBO_Codigo,taStart)
254: listselectplus(COMBO_Codigo,listseek(COMBO_Codigo,sResultado))
255: END
256: type : 18
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:228`

```wlanguage
225: Restore(WIN_Table_Clientes)
226: WinStatus(WIN_Table_Clientes,TopActive)
227: CASE NotFound
228: OpenChild(WIN_Table_Clientes,False,"")
229: END
230: type : 18
231: -
232: type : 161
233: enabled : false
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:549`

```wlanguage
546: Restore(WIN_Table_Clientes)
547: WinStatus(WIN_Table_Clientes,TopActive)
548: CASE NotFound
549: OpenChild(WIN_Table_Clientes,False,"")
550: END
551: type : 32
552: -
553: name : OPT_Artigos
554: identifier : 0x265c689e1e47038a
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1471`

```wlanguage
1468: type : 14
1469: -
1470: code : |1-
1471: edt_cliente=open(WIN_Table_Clientes,true,edt_cliente)
1472: type : 18
1473: -
1474: type : 161
1475: enabled : false
1476: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1376`

```wlanguage
1373: type : 14
1374: -
1375: code : |1-
1376: EDT_Terceiro=open(WIN_Table_Clientes,true,EDT_Terceiro)
1377: hreadseek(clientes,Codigo,EDT_Terceiro,hIdentical)
1378: if hfound(Clientes)=true then
1379: EDT_Terceiro_Descricao=clientes.Descricao
1380: END
1381: type : 18
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Info | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:368 → "Cliente com viaturas associadas, não pode ser eliminado" |
| HCancelDeclaration | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:369 → Qry_select_artigos_unidade; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:372 → Qry_select_artigos_unidade |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:366 → Qry_select_artigos_unidade |
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:303 → WIN_Form_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:334 → WIN_Form_Clientes |
| SetFocus | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:655 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:680 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:705 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:730 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:777 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:802 → EDT_termo_pesquisa |
| HNbRec | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:367 → Qry_select_artigos_unidade |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:300 → Clientes |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:306 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:333 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:335 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:378 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:610 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:632 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:654 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:679 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:704 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:729 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:776 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:801 → TABLE_Clientes |
| HDeactivateFilter | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:609 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:630 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:653 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:678 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:703 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:728 → clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:775 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:800 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:870 → Clientes |
| HFilter | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:616 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:619 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:622 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:625 → Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:628 → Clientes |
| ExecuteProcess | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:852 → BTN_todos |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:332 → TABLE_Clientes; legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:362 → TABLE_Clientes |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:374 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:377 → TABLE_Clientes |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-CC16AB27-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-CC16AB27-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-CC16AB27-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-CC16AB27-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-CC16AB27-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-CC16AB27-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-CC16AB27-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-CC16AB27-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_Clientes: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of Clientes, no condition, in the order of the table that prints it (WIN_Table_Clientes, by ClientesID); confirm on a legacy printout
- RPT_List_Clientes: no call in code; named in the compiled code of WIN_Table_Clientes (a predefined button action there is the likely caller — see encoded actions)


## Designer raw-detail audit (MIG-7A.2b)

Verified source evidence: `dossier: WIN_Table_Clientes/controls.TABLE_Clientes.raw`. The unparsed detail lines explicitly specify Search magnifier mode, automatic horizontal/always-visible vertical scrollbar, per-pixel scrolling, truncated-text tooltips, column context menu enabled and no remembered filters/sorts. These exact values narrow U-CC16AB27-01; they are not inferred from the screenshot. Full control values belong to the screen spec. Source single-row selection remains distinct from column/cell selection, both disabled. This evidence does not resolve runtime no-match/locale/shared-buffer behavior, native tooltip/scrollbar appearance or the exact enabled automatic menu commands (U-CC16AB27-01/02).
