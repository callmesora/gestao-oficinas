# Mapping — WIN_Table_Viaturas

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select Viaturas. {"PT": "Tabela de Viaturas"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:704 (Open in WIN_Filtro_Mapas_Artigos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:731 (Open in WIN_Filtro_Mapas_Artigos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:561 (Open in WIN_Filtro_Mapas_Tempos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:585 (Open in WIN_Filtro_Mapas_Tempos)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:261 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:532 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1076 (Open in WIN_Ordens_Reparacao)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:384 (Open in WIN_Ordens_Reparacao_Form)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.


### Reviewed caller continuation

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:370-454` (RULE-C039C545-CALLER01): WIN_Ordens_Reparacao_Form assigns the selector return directly to EDT_matricula. For nonempty return it reloads the vehicle by registration, takes its customer code into gnCliente, joins make and model with one space, reloads that customer and sets customer description/contact text. When both phone numbers are nonblank after NoSpace checks it joins them with CR; otherwise it uses the nonblank phone or empty text. Missing customer clears customer/contact text. Registration is uppercased. Missing vehicle enters the create-vehicle dialog path; after any path reaching the end the named vehicle/customer query declarations are canceled.

Before opening the selector in MODIFICAR mode, the caller queries material/time movements and may return after its confirmation. After a vehicle-creation path it requeries vehicle/customer information; creation canceled displays its source message and returns. This is caller behavior, not additional picker return data. Runtime empty-selection/shared-buffer outcomes remain U-C039C545-02; unhandled query failures remain U-C039C545-03.

## Rules and risks

Table is query-backed. Search filters QRY_select_viaturas; several mode buttons clear Viaturas instead, unlike todos clearing the query. Add stores the prior registration, opens NOVO, reexecutes the query only on true return and always attempts to seek/reselect that prior registration. Modify stores the registration before its no-selection guard, opens MODIFICAR, reexecutes regardless of form return and restores the prior registration. Empty/filtered-out seek outcomes remain U-C039C545-02. Delete uses interpolated SQL only after rejecting vehicles with repair orders. Close cancels the query declaration.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-C039C545-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_Viaturas/TABLE_Viaturas — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:167-171`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_Viaturas..DoubleClick="BTN_selecionar"
         ELSE
         	TABLE_Viaturas..DoubleClick="BTN_Modificar"
         END
```

### WIN_Table_Viaturas/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:278-284`. Capture the current table registration, then open WIN_Form_Viaturas modally with estado="NOVO" and codigo="". Reexecute the table query only if the form returns true. Unconditionally seek and attempt to reselect the captured registration afterward; this handler has no selection guard and no HReset.

```wlanguage
         matricula_atual is STRING=TABLE_Viaturas.COL_Matricula
         IF Open(WIN_Form_Viaturas,"NOVO","") THEN
         	TableDisplay(TABLE_Viaturas,taReExecuteQuery)
         END
         TableSelectPlus(TABLE_Viaturas,TableSeek(TABLE_Viaturas.COL_Matricula,matricula_atual))
```

### WIN_Table_Viaturas/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:308-315`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         matricula_atual is STRING=TABLE_Viaturas.COL_Matricula
         IF TableSelect(TABLE_Viaturas)=-1 THEN RETURN
         Open(WIN_Form_Viaturas,"MODIFICAR",TABLE_Viaturas.COL_Matricula)
         TableDisplay(TABLE_Viaturas,taReExecuteQuery)
         TableSelectPlus(TABLE_Viaturas,TableSeek(TABLE_Viaturas.COL_Matricula,matricula_atual))
```

### WIN_Table_Viaturas/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:340-363`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_Viaturas) = -1 THEN RETURN
         Query is string="SELECT ordem_reparacao.matricula AS matricula,Viaturas.matricula AS matricula_Vi FROM Viaturas,ordem_reparacao WHERE ordem_reparacao.matricula = Viaturas.matricula AND (Viaturas.matricula ='"+TABLE_Viaturas.COL_Matricula+"')"
         Qry_select_viaturas_ordens is data source
         HExecuteSQLQuery(Qry_select_viaturas_ordens,hQueryDefault,Query)
         IF HNbRec(Qry_select_viaturas_ordens)>0 THEN
         	Info("Viatura usada em ordens de reparação, não pode ser eliminada")
         	HCancelDeclaration(Qry_select_viaturas_ordens)
         	RETURN
         ELSE	
         	HCancelDeclaration(Qry_select_viaturas_ordens)
         END
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		Query="delete from viaturas where matricula='"+TABLE_Viaturas.COL_Matricula+"'"
         		Qry_delete_viatura is data source
         		HExecuteSQLQuery(Qry_delete_viatura,hQueryDefault,Query)
         		TableDisplay(TABLE_Viaturas, taReExecuteQuery)
         	CASE 2
         END
```

### WIN_Table_Viaturas/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:573-573`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=TABLE_Viaturas.col_matricula
```

### WIN_Table_Viaturas/BTN_marca_modelo — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:597-602`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         filtrar_viaturas("marca_modelo")
         gsFiltro_Atual="marca_modelo"
         EDT_termo_pesquisa=""
         HDeactivateFilter(Viaturas)
         tabledisplay(TABLE_Viaturas)
         setfocus(EDT_termo_pesquisa)
```

### WIN_Table_Viaturas/BTN_cliente — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:626-631`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         filtrar_viaturas("cliente")
         gsFiltro_Atual="cliente"
         EDT_termo_pesquisa=""
         HDeactivateFilter(Viaturas)
         TableDisplay(TABLE_Viaturas)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_Viaturas/BTN_matricula — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:655-660`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         filtrar_viaturas("matricula")
         gsFiltro_Atual="matricula"
         EDT_termo_pesquisa=""
         HDeactivateFilter(Viaturas)
         TableDisplay(TABLE_Viaturas)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_Viaturas/BTN_todos — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:684-689`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         filtrar_viaturas("todos")
         gsFiltro_Atual="todos"
         EDT_termo_pesquisa=""
         HDeactivateFilter(qry_select_Viaturas)
         TableDisplay(TABLE_Viaturas)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_Viaturas/EDT_termo_pesquisa — Whenever modifying (raw 17)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:730-749`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently.

```wlanguage
         if EDT_termo_pesquisa="" then
         	HDeactivateFilter(QRY_select_viaturas)
         	TableDisplay(TABLE_Viaturas)
         else
         	sFiltro is string
         	switch gsFiltro_Atual
         		case "matricula"
         			sFiltro="matricula ~] '"+EDT_termo_pesquisa+"'"
         			HFilter(QRY_select_viaturas,sFiltro)
         		case "cliente"
         			sFiltro="descricao ~] '"+EDT_termo_pesquisa+"'"
         			HFilter(QRY_select_viaturas,sFiltro)
         		case "marca_modelo"
         			sFiltro="marca ~] '"+EDT_termo_pesquisa+"' or modelo ~] '"+EDT_termo_pesquisa+"'"
         			HFilter(QRY_select_viaturas,sFiltro)
         		OTHER CASE
         			HDeactivateFilter(QRY_select_viaturas)
         	END
         	TableDisplay(TABLE_Viaturas)
         end
```

### WIN_Table_Viaturas — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:768-771`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_Viaturas(selecionar,origem)
      gsFiltro_Atual is string
      BTN_selecionar..Visible=selecionar
      MyWindow..ReturnedValue=origem
```

### WIN_Table_Viaturas — End of initialization (raw 34)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:774-774`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
      ExecuteProcess(BTN_todos,trtClick)
```

### WIN_Table_Viaturas — Close (raw 2)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:788-788`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
      HCancelDeclaration(qry_select_Viaturas)
```

### WIN_Table_Viaturas — Local procedure (raw 458752)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:796-827`. Reset mode buttons to black, 8-point, nonbold, not underlined, retaining the chosen button font family; selected mode becomes DarkBlue, bold and underlined via dynamic control-name access.

```wlanguage
      PROCEDURE filtrar_viaturas(sOpcao is string)
      ConfFont is Font
      ConfFont..Bold=False 
      ConfFont..Color=Black
      ConfFont..Size=8
      ConfFont..Underline=False
      ConfFont..Name={"BTN_"+sOpcao,indcontrol}..FontName
      BTN_todos..Font=ConfFont
      BTN_marca_modelo..Font=ConfFont
      BTN_matricula..Font=ConfFont
      BTN_cliente..Font=ConfFont
      ConfFont..Bold=True
      ConfFont..Color=DarkBlue
      ConfFont..Underline=True 
      {"BTN_"+sOpcao,indcontrol}..Font=ConfFont
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_Viaturas/BTN_Fechar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:252 |
| WIN_Table_Viaturas/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:338 |
| WIN_Table_Viaturas/BTN_Imprimir/18 | A-e21f3a | Print RPT_List_Viaturas (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:386 |
| WIN_Table_Viaturas/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:429 |
| WIN_Table_Viaturas/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:452 |
| WIN_Table_Viaturas/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:477 |
| WIN_Table_Viaturas/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:502 |
| WIN_Table_Viaturas/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:571 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_Viaturas/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:704`

```wlanguage
701: type : 14
702: -
703: code : |1-
704: EDT_Da_viatura=open(WIN_Table_Viaturas,true,EDT_Da_viatura)
705: if EDT_Da_viatura<>"" then
706: EDT_a_viatura=EDT_Da_viatura
707: end
708: type : 18
709: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:731`

```wlanguage
728: type : 14
729: -
730: code : |1-
731: EDT_a_viatura=open(WIN_Table_Viaturas,true,EDT_a_viatura)
732: type : 18
733: -
734: type : 161
735: enabled : false
736: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:561`

```wlanguage
558: type : 14
559: -
560: code : |1-
561: EDT_a_viatura=open(WIN_Table_Viaturas,true,EDT_a_viatura)
562: type : 18
563: -
564: type : 161
565: enabled : false
566: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw:585`

```wlanguage
582: type : 14
583: -
584: code : |1-
585: EDT_Da_viatura=open(WIN_Table_Viaturas,true,EDT_Da_viatura)
586: if EDT_Da_viatura<>"" then
587: EDT_a_viatura=EDT_Da_viatura
588: END
589: type : 18
590: -
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:261`

```wlanguage
258: restore(WIN_Table_Viaturas)
259: WinStatus(WIN_Table_Viaturas,TopActive)
260: CASE NotFound
261: OpenChild(WIN_Table_Viaturas,False,"")
262: END
263: type : 18
264: -
265: type : 161
266: enabled : false
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:532`

```wlanguage
529: Restore(WIN_Table_Viaturas)
530: WinStatus(WIN_Table_Viaturas,TopActive)
531: CASE NotFound
532: OpenChild(WIN_Table_Viaturas,False,"")
533: END
534: type : 32
535: -
536: name : OPT_Clientes
537: identifier : 0x265c68911e45d12f
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao.wdw:1076`

```wlanguage
1073: type : 14
1074: -
1075: code : |1-
1076: EDT_matricula=open(WIN_Table_Viaturas,true,EDT_matricula)
1077: type : 18
1078: -
1079: type : 161
1080: enabled : false
1081: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:384`

```wlanguage
381: END
382: END
383: END
384: EDT_matricula=open(WIN_Table_Viaturas,true,EDT_matricula)
385: IF EDT_matricula<>"" THEN
386: HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
387: IF HReadFirst(QRY_select_viatura_matricula)=True THEN
388: gnCliente=QRY_select_viatura_matricula.Cliente
389: edt_marca_modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Info | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:347 → "Viatura usada em ordens de reparação, não pode ser eliminada" |
| HCancelDeclaration | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:348 → Qry_select_viaturas_ordens; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:351 → Qry_select_viaturas_ordens; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:788 → qry_select_Viaturas |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:345 → Qry_select_viaturas_ordens; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:359 → Qry_delete_viatura |
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:280 → WIN_Form_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:312 → WIN_Form_Viaturas |
| SetFocus | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:602 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:631 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:660 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:689 → EDT_termo_pesquisa |
| HNbRec | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:346 → Qry_select_viaturas_ordens |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:282 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:314 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:360 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:601 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:630 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:659 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:688 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:732 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:748 → TABLE_Viaturas |
| HDeactivateFilter | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:600 → Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:629 → Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:658 → Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:687 → qry_select_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:731 → QRY_select_viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:746 → QRY_select_viaturas |
| HFilter | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:738 → QRY_select_viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:741 → QRY_select_viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:744 → QRY_select_viaturas |
| ExecuteProcess | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:774 → BTN_todos |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:310 → TABLE_Viaturas; legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:341 → TABLE_Viaturas |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:354 → <§?173B299C07B77A03§> |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-C039C545-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-C039C545-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-C039C545-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-C039C545-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-C039C545-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-C039C545-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-C039C545-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-C039C545-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_Viaturas: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of QRY_select_viaturas, no condition, in the order of the table that prints it (WIN_Table_Viaturas); confirm on a legacy printout
- RPT_List_Viaturas: no call in code; named in the compiled code of WIN_Table_Viaturas (a predefined button action there is the likely caller — see encoded actions)
