# Mapping — WIN_Form_Viaturas

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Create or edit Viaturas. {"PT": "Viaturas"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1261 (Open in WIN_Ordens_Reparacao_Form)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:301 (Open in WIN_Ordens_Reparacao_Form)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:416 (Open in WIN_Ordens_Reparacao_Form)`; `GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:988 (Open in WIN_Ordens_Reparacao_Form)`; `GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:280 (Open in WIN_Table_Viaturas)`; `GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:312 (Open in WIN_Table_Viaturas)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.

## Rules and risks

Inputs are estado and codigo. NOVO enables and seeds registration; otherwise query QRY_select_viatura_matricula supplies client, year, month, model and make. Registration, client, make and model are required. Registration is uppercased. Edit uses interpolated UPDATE by original codigo and does not check execution success. Client picker refreshes and seeks the returned client code.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-C9675195-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: a missing mandatory value returns before saving. In NOVO mode a detected duplicate from HAdd shows the exact duplicate message and aborts. In edit mode the SQL UPDATE return is unchecked, so the source can fall through to ReturnedValue=True after a failure; resulting engine/dialog behavior remains U-C9675195-03. Cancel/default returns False.

## Events and exact rule expressions

### WIN_Form_Viaturas/BTN_Validar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:34-70`. Validate registration, client, make and model in source order; return on missing input. Uppercase EDT_Matricula, then ScreenToFile. Branch on estado="NOVO": HAdd inserts and only a duplicate failure explicitly aborts. Otherwise execute the concatenated UPDATE of Cliente, marca, modelo, Ano and mes WHERE matricula equals the original codigo parameter; no HModify or NewRecord branch exists and UPDATE success is unchecked. Restore HOnError and set ReturnedValue=True on fallthrough.

```wlanguage
         if EDT_Matricula="" then
         	info("Falta indicar a matrícula")
         	return
         END
         if COMBO_Codigo="" OR COMBO_Codigo=0 THEN
         	Info("Falta indicar o cliente")
         	RETURN
         END
         IF EDT_Marca="" THEN
         	Info("Falta indicar a marca")
         	RETURN
         END
         IF EDT_Modelo="" THEN
         	Info("Falta indicar o modelo")
         	RETURN
         END
         EDT_Matricula=Upper(EDT_Matricula)
         ScreenToFile()
         HOnError(viaturas,hErrDuplicates,"")
         IF estado="NOVO" THEN
         	IF HAdd(viaturas)=False THEN
         		IF HErrorDuplicates() = True THEN 
         			sItemName is string
         			sItemName = HErrorInfo(hErrItem)
         			Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"viaturas." + sItemName})
         			HOnError ("*", hErrAll) 
         			RETURN 
         		END
         	END
         ELSE
         	Query is string
         	Qry_update_viaturas is data source
         	Query="UPDATE Viaturas SET Cliente ='"+COMBO_Codigo+"',marca ='"+EDT_Marca+"',modelo ='"+EDT_Modelo+"',Ano ='"+EDT_Ano+"',mes ='"+EDT_Mes+"' WHERE Viaturas.matricula ='"+codigo+"'"
         	HExecuteSQLQuery(Qry_update_viaturas,hQueryDefault,Query)	
         END
         HOnError ("*", hErrAll)
         MyWindow..ReturnedValue = True
```

### WIN_Form_Viaturas/BTN_Cancelar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:95-95`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=false
```

### WIN_Form_Viaturas/SC_Form/BTN_VISION — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:251-255`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
            sResultado is string=open(WIN_Table_Clientes,true,COMBO_Codigo)
            IF sResultado<>"" THEN
            	ListDisplay(COMBO_Codigo,taStart)
            	listselectplus(COMBO_Codigo,listseek(COMBO_Codigo,sResultado))
            END
```

### WIN_Form_Viaturas — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:441-469`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Form_Viaturas(estado,codigo)
      if estado="NOVO" then
      	EDT_Matricula..InputEnabled=true
      	EDT_Matricula=codigo
      else
      	EDT_Matricula..InputEnabled=false
      	HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,codigo)
      	hreadfirst(QRY_select_viatura_matricula)
      	EDT_Matricula=QRY_select_viatura_matricula.matricula
      	COMBO_Codigo=QRY_select_viatura_matricula.Cliente
      	EDT_Ano=QRY_select_viatura_matricula.ano
      	edt_mes=QRY_select_viatura_matricula.mes
      	EDT_Modelo=QRY_select_viatura_matricula.modelo
      	EDT_Marca=QRY_select_viatura_matricula.marca
      END
```

### WIN_Form_Viaturas — End of initialization (raw 34)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:472-472`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
      MyWindow..ReturnedValue = False
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Form_Viaturas/BTN_Validar/18 | A-34cd5c | Close the window after the code (it returns the value the code sets) | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:32 |
| WIN_Form_Viaturas/BTN_Cancelar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:93 |
| WIN_Form_Viaturas/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:300 |
| WIN_Form_Viaturas/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:323 |
| WIN_Form_Viaturas/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:348 |
| WIN_Form_Viaturas/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:373 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Form_Viaturas/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:1261`

```wlanguage
1258: // Sim
1259: CASE 1
1260: EDT_matricula=UPPER(EDT_matricuLA)
1261: open(WIN_Form_Viaturas,"NOVO",EDT_matricula)
1262: 
1263: HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
1264: IF HReadFirst(QRY_select_viatura_matricula)=True THEN
1265: gnCliente=QRY_select_viatura_matricula.Cliente
1266: HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:301`

```wlanguage
298: // Sim
299: CASE 1
300: EDT_matricula=UPPER(EDT_matricuLA)
301: open(WIN_Form_Viaturas,"NOVO",EDT_matricula)
302: 
303: HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
304: IF HReadFirst(QRY_select_viatura_matricula)=True THEN
305: gnCliente=QRY_select_viatura_matricula.Cliente
306: EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:416`

```wlanguage
413: // Sim
414: CASE 1
415: EDT_matricula=Upper(EDT_matricula)
416: Open(WIN_Form_Viaturas,"NOVO",EDT_matricula)
417: 
418: HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
419: IF HReadFirst(QRY_select_viatura_matricula)=True THEN
420: gnCliente=QRY_select_viatura_matricula.Cliente
421: EDT_Marca_Modelo=QRY_select_viatura_matricula.marca+" "+QRY_select_viatura_matricula.modelo
```

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:988`

```wlanguage
985: // Sim
986: CASE 1
987: EDT_matricula=Upper(EDT_matricula)
988: Open(WIN_Form_Viaturas,"NOVO",EDT_matricula)
989: 
990: HExecuteQuery(QRY_select_viatura_matricula,hQueryDefault,EDT_matricula)
991: IF HReadFirst(QRY_select_viatura_matricula)=True THEN
992: HExecuteQuery(QRY_select_cliente_codigo,hQueryDefault,QRY_select_viatura_matricula.Cliente)
993: IF HReadFirst(QRY_select_cliente_codigo)=True THEN
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:280`

```wlanguage
277: code : |1-
278: matricula_atual is STRING=TABLE_Viaturas.COL_Matricula
279: // Open the form of Viaturas file in creation mode
280: IF Open(WIN_Form_Viaturas,"NOVO","") THEN
281: // Refresh the table
282: TableDisplay(TABLE_Viaturas,taReExecuteQuery)
283: END
284: TableSelectPlus(TABLE_Viaturas,TableSeek(TABLE_Viaturas.COL_Matricula,matricula_atual))
285: type : 18
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:312`

```wlanguage
309: // Is a row selected?
310: IF TableSelect(TABLE_Viaturas)=-1 THEN RETURN
311: // Open the form of Viaturas file in modification mode
312: Open(WIN_Form_Viaturas,"MODIFICAR",TABLE_Viaturas.COL_Matricula)
313: // Refresh the table
314: TableDisplay(TABLE_Viaturas,taReExecuteQuery)
315: TableSelectPlus(TABLE_Viaturas,TableSeek(TABLE_Viaturas.COL_Matricula,matricula_atual))
316: type : 18
317: -
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Error | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:58 → "Duplicação:  Este registo não pode ser gravado." |
| Info | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:35 → "Falta indicar a matrícula"; legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:39 → "Falta indicar o cliente"; legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:43 → "Falta indicar a marca"; legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:47 → "Falta indicar o modelo" |
| HExecuteQuery | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:461 → QRY_select_viatura_matricula |
| HReadFirst | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:462 → QRY_select_viatura_matricula |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:67 → Qry_update_viaturas |
| Open | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:251 → WIN_Table_Clientes |
| ScreenToFile | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:51 →  |
| HOnError | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:52 → viaturas; legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:59 → "*"; legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:69 → "*" |
| HAdd | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:54 → viaturas |
| ListDisplay | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:253 → COMBO_Codigo |
| ListSelectPlus | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:254 → COMBO_Codigo |
| ListSeek | legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:254 → COMBO_Codigo |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-C9675195-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-C9675195-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-C9675195-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-C9675195-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-C9675195-03.

## Proposed changes for later framing

Parameterized SQL, explicit buffer/state contracts and improved write failures are proposals only. No bug fix, behavior exclusion or architecture is approved in Step 0.

## Unresolved

- U-C9675195-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-C9675195-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-C9675195-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.
