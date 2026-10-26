# Mapping — WIN_Table_artigos

Stage 0 only. No behavior implemented or runtime verified. Source read in full: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw`; code extracted and compared with source; parsed dossier and full direct caller/callee source read.

## Purpose

Browse, maintain or select artigos. {"PT": "Tabela de artigos"}

## Entry and exit

Callers: `GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:197 (Open in WIN_Extrato_Artigos)`; `GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:303 (Open in WIN_Extrato_Artigos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:755 (Open in WIN_Filtro_Mapas_Artigos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:779 (Open in WIN_Filtro_Mapas_Artigos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:806 (Open in WIN_Filtro_Mapas_Artigos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:830 (Open in WIN_Filtro_Mapas_Artigos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:930 (Open in WIN_Filtro_Mapas_Artigos)`; `GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:995 (Open in WIN_Filtro_Mapas_Artigos)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:327 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_MENU.wdw:566 (OpenChild in WIN_MENU)`; `GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:702 (Open in WIN_Material_reparacao_form)`; `GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1081 (OpenChild in WIN_Table_Lin_Stocks)`; `GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:778 (Open in WIN_Table_Lin_Stocks)`

Modal `Open` blocks the caller until close; `OpenChild` leaves the parent running. The exact caller operation is included below. HFSQL buffer, cursor and filter use is implicit; no independent context may be presumed from a missing field. Window flags: {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}. FileToScreen reads the positioned record; ScreenToFile writes controls into that buffer. Returned values and defaults are recorded in the event ledger.


### Reviewed caller continuations

`legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:778-788` (RULE-C7738076-CALLER01): WIN_Table_Lin_Stocks assigns the modal article selector result directly to EDT_codigo before checking nonempty. A nonempty result runs SELECT by Codigo, HReadFirst, then copies descricao to EDT_descricao_Artigo and preco to EDT_preco; SetFocus(EDT_codigo) runs afterward. The query declaration is not canceled in this event.

`legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:701-712` (RULE-C7738076-CALLER02): WIN_Material_reparacao_form first stores selector return in sArtigo; only a nonempty return overwrites EDT_artigo and reloads its description by SELECT/HReadFirst. It cancels the query declaration after copying descricao and does not copy the article price in this event. An empty return leaves the existing article code untouched.

The returned identifier does not carry price or description itself. These callers re-read current query buffers. Unchecked query execution/HReadFirst, missing records and number/text conversion outcomes remain U-C7738076-03; selector buffer/filter coupling remains U-C7738076-02. Schema evidence `docs/schema/schema-draft.md` records artigos.preco as 8-byte real and stock as Decimal; the two-decimal price mask is a display/input format, not proof of decimal storage.

## Rules and risks

Initial CBOX_ativo=1; search combines code/description/barcode with inativo=0 or 1. Turning either checkbox off forces the other on, so UI events prohibit both off. Mode buttons clear filters directly; active-only filtering is reapplied only when change handler runs. Selection mode hides CRUD/print, uses 30-pixel rows, and enables previous/next; gsValor_entrada t or m enables the virtual keyboard. Article deletion checks repair materials then stock lines in that order.

HReset clears the file buffer and marks a new record. HReadSeek/queries reposition buffers. HAdd inserts and HModify writes the current buffer. HOnError replaces file/global error handling; duplicate errors explicitly restore handlers and abort. HFilter persists until deactivated; ~] is the source flexible contains operator, whose locale edge behavior belongs to U-C7738076-02. TableSelect is 1-based and -1 means no selection; TableDisplay modes taCurrentFirst, taCurrentSelection and taReExecuteQuery are distinct and retained verbatim. TableDelete deletes the selected bound record. HNbRec counts query rows; HCancelDeclaration frees its declaration. Open is modal, ListSeek/TableSeek find rows, SetFocus changes input focus, and ExecuteProcess runs another event. No transaction is introduced by this mapping.

Concrete checks: blank mandatory input returns before any write; an existing duplicate key raises the exact duplicate message and does not set success; cancel keeps the source default return expression. Refer to the event-specific examples and literal expressions below for other cases.

## Events and exact rule expressions

### WIN_Table_artigos/TABLE_artigos — Initialization (raw 14)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:158-162`. Route double-click to selection in selecionar=True mode and modification otherwise.

```wlanguage
         IF selecionar=True THEN
         	TABLE_artigos..DoubleClick="BTN_selecionar"
         else
         	TABLE_artigos..doubleclick="BTN_Modificar"
         END
```

### WIN_Table_artigos/Btn_New — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:259-268`. Reset the file buffer to creation mode, open the form modally, and refresh only when it returns true.

```wlanguage
         HReset(artigos)
         IF Open(WIN_Form_artigos) THEN
         	TableDisplay(TABLE_artigos,taCurrentFirst)
         END
```

### WIN_Table_artigos/BTN_Modificar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:292-295`. If a row is selected, edit its current record modally; refresh afterward with the source TableDisplay mode, irrespective of the form result unless the code explicitly tests it.

```wlanguage
         IF TableSelect(TABLE_artigos)=-1 THEN RETURN
         Open(WIN_Form_artigos)
         TableDisplay(TABLE_artigos,taCurrentSelection)
```

### WIN_Table_artigos/BTN_Delete — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:320-352`. Reject no selection first. Run the relationship checks shown below; a positive count displays the exact message and aborts. Dialog result 1 performs deletion and refresh; result 2 makes no change. No explicit transaction or delete-result check is present.

```wlanguage
         IF TableSelect(TABLE_artigos) = -1 THEN RETURN
         Query is string="SELECT material_reparacao.artigo AS artigo,artigos.Codigo AS Codigo FROM artigos,material_reparacao WHERE artigos.Codigo = material_reparacao.artigo and artigos.Codigo='"+TABLE_artigos.COL_Codigo+"'"
         Qry_select_materiais_artigo is data source
         HExecuteSQLQuery(Qry_select_materiais_artigo,hQueryDefault,Query)
         IF HNbRec(Qry_select_materiais_artigo)>0 THEN
         	Info("Artigo usado em ordens de reparação, não pode ser eliminado")
         	HCancelDeclaration(Qry_select_materiais_artigo)
         	RETURN
         ELSE	
         	HCancelDeclaration(Qry_select_materiais_artigo)
         END
         Query="SELECT lin_stocks.artigo AS artigo,artigos.Codigo AS Codigo FROM artigos,lin_stocks WHERE artigos.Codigo = lin_stocks.artigo AND (artigos.Codigo ='"+TABLE_artigos.COL_Codigo+"')"
         Qry_select_lin_stocks_artigo is data source
         HExecuteSQLQuery(Qry_select_lin_stocks_artigo,hQueryDefault,Query)
         IF HNbRec(Qry_select_lin_stocks_artigo)>0 THEN
         	Info("Artigo usado em documentos, não pode ser eliminado")
         	HCancelDeclaration(Qry_select_lin_stocks_artigo)
         	RETURN
         ELSE	
         	HCancelDeclaration(Qry_select_lin_stocks_artigo)
         END
         SWITCH Dialog(<§?173B299C07B77A03§>)
         	CASE 1
         		TableDelete(TABLE_artigos)		
         		TableDisplay(TABLE_artigos, taCurrentFirst)
         	CASE 2	
         END
```

### WIN_Table_artigos/BTN_todos — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:555-560`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         filtrar_artigos("todos")
         gsFiltro_Atual="todos"
         EDT_termo_pesquisa=""
         HDeactivateFilter(artigos)
         TableDisplay(TABLE_artigos)
         setfocus(EDT_termo_pesquisa)
```

### WIN_Table_artigos/EDT_termo_pesquisa — Whenever modifying (raw 17)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:601-680`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently.

```wlanguage
         sFiltro is string
         if EDT_termo_pesquisa="" then
         	IF CBOX_ativo=1 AND CBOX_inativo=1 THEN
         		HDeactivateFilter(artigos)
         	ELSE
         		IF CBOX_ativo=1 AND CBOX_inativo=0 THEN
         			sFiltro="inativo=0"
         			HFilter(artigos,sFiltro)
         		ELSE
         			IF CBOX_ativo=0 AND CBOX_inativo=1 THEN
         				sFiltro="inativo=1"
         				HFilter(artigos,sFiltro)
         			END
         		END
         	END
         	TableDisplay(TABLE_artigos)
         else
         	switch gsFiltro_Atual
         		case "codigo"
         			if CBOX_ativo=1 and CBOX_inativo=1 then
         				sFiltro="codigo ~] '"+EDT_termo_pesquisa+"'"
         				HFilter(artigos,sFiltro)
         			else
         				if CBOX_ativo=1 and CBOX_inativo=0 then
         					sFiltro="codigo ~] '"+EDT_termo_pesquisa+"' and inativo=0"
         					HFilter(artigos,sFiltro)
         				else
         					if CBOX_ativo=0 and CBOX_inativo=1 then
         						sFiltro="codigo ~] '"+EDT_termo_pesquisa+"' and inativo=1"
         						HFilter(artigos,sFiltro)
         					END
         				END
         			END
         		case "descricao"
         			IF CBOX_ativo=1 AND CBOX_inativo=1 THEN
         				sFiltro="descricao ~] '"+EDT_termo_pesquisa+"'"
         				HFilter(artigos,sFiltro)
         			ELSE
         				IF CBOX_ativo=1 AND CBOX_inativo=0 THEN
         					sFiltro="descricao ~] '"+EDT_termo_pesquisa+"' and inativo=0"
         					HFilter(artigos,sFiltro)
         				ELSE
         					IF CBOX_ativo=0 AND CBOX_inativo=1 THEN
         						sFiltro="descricao ~] '"+EDT_termo_pesquisa+"' and inativo=1"
         						HFilter(artigos,sFiltro)
         					END
         				END
         			END
         		case "codigobarras"
         			IF CBOX_ativo=1 AND CBOX_inativo=1 THEN
         				sFiltro="codbarras ~] '"+EDT_termo_pesquisa+"'"
         				HFilter(artigos,sFiltro)
         			ELSE
         				IF CBOX_ativo=1 AND CBOX_inativo=0 THEN
         					sFiltro="codbarras ~] '"+EDT_termo_pesquisa+"' and inativo=0"
         					HFilter(artigos,sFiltro)
         				ELSE
         					IF CBOX_ativo=0 AND CBOX_inativo=1 THEN
         						sFiltro="codbarras ~] '"+EDT_termo_pesquisa+"' and inativo=1"
         						HFilter(artigos,sFiltro)
         					END
         				END
         			END
         		OTHER CASE
         			IF CBOX_ativo=1 AND CBOX_inativo=1 THEN
         				HDeactivateFilter(artigos)
         			ELSE
         				IF CBOX_ativo=1 AND CBOX_inativo=0 THEN
         					sFiltro="inativo=0"
         					HFilter(artigos,sFiltro)
         				ELSE
         					IF CBOX_ativo=0 AND CBOX_inativo=1 THEN
         						sFiltro="inativo=1"
         						HFilter(artigos,sFiltro)
         					END
         				END
         			END
         	END
         	TableDisplay(TABLE_artigos)
         end
```

### WIN_Table_artigos/EDT_termo_pesquisa — Left button down (raw 66049)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:684-687`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
         if lTeclado=true then
         	myself=open(WIN_Teclado_Alfa,"Pesquisa",myself..inputmask,myself..Size,myself,false)
         	ExecuteProcess(EDT_termo_pesquisa,trtChange)
         END
```

### WIN_Table_artigos/BTN_codigo — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:704-709`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         filtrar_artigos("codigo")
         gsFiltro_Atual="codigo"
         EDT_termo_pesquisa=""
         HDeactivateFilter(artigos)
         TableDisplay(TABLE_artigos)
         setfocus(EDT_termo_pesquisa)
```

### WIN_Table_artigos/BTN_descricao — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:729-734`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         filtrar_artigos("descricao")
         gsFiltro_Atual="descricao"
         EDT_termo_pesquisa=""
         HDeactivateFilter(artigos)
         TableDisplay(TABLE_artigos)
         SetFocus(EDT_termo_pesquisa)
```

### WIN_Table_artigos/BTN_codigobarras — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:754-759`. Apply or clear the persistent HFSQL filter exactly as shown, then redisplay; search strings are interpolated directly and the ~] comparison is retained. Do not normalize apostrophes, accents or empty input silently. Change search mode, clear the search text and filter, refresh, and focus the search input. Mode font styling is updated through the local filter procedure.

```wlanguage
         filtrar_artigos("codigobarras")
         gsFiltro_Atual="codigobarras"
         EDT_termo_pesquisa=""
         HDeactivateFilter(artigos)
         tabledisplay(TABLE_artigos)
         setfocus(EDT_termo_pesquisa)
```

### WIN_Table_artigos/BTN_selecionar — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:784-784`. Set the exact return expression shown below; closing behavior is separately mapped from the encoded action.

```wlanguage
         mywindow..ReturnedValue=artigos.Codigo
```

### WIN_Table_artigos/BTN_anterior — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:808-810`. Move one row only within the 1-based bounds; do not wrap at either end.

```wlanguage
         IF TableSelect(TABLE_artigos)>1 THEN
         	TABLE_artigos=TableSelect(TABLE_artigos)-1	 
         END
```

### WIN_Table_artigos/BTN_seguinte — Click (raw 18)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:834-836`. If TableSelect(table)<TableCount(table), request selection index TableSelect(table)+1 using the exact table assignment or TableSelectPlus call below. There is no lower-bound or no-selection guard in this handler.

```wlanguage
         IF TableSelect(TABLE_Artigos)<TableCount(TABLE_Artigos) THEN
         	TABLE_Artigos=TableSelect(TABLE_Artigos)+1	 
         END
```

### WIN_Table_artigos/CBOX_ativo — Whenever modifying (raw 17)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:872-875`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
         if myself=0 then
         	CBOX_inativo=1
         END
         ExecuteProcess(EDT_termo_pesquisa,trtChange)
```

### WIN_Table_artigos/CBOX_inativo — Whenever modifying (raw 17)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:908-911`. Perform the assignments and calls in the exact source sequence transcribed below; no additional validation or error handling is present in this block.

```wlanguage
         IF MySelf=0 THEN
         	CBOX_ativo=1
         END
         ExecuteProcess(EDT_termo_pesquisa,trtChange)
```

### WIN_Table_artigos — Global declarations (raw None)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:930-959`. Declare the window inputs and initialize its local state; the exact signature and state assignments are transcribed below.

```wlanguage
      PROCEDURE WIN_Table_artigos(selecionar,origem)
      lTeclado is boolean =false
      if selecionar=true then
      	SWITCH gsValor_entrada
      		CASE "t"
      			lTeclado=True
      		CASE "m"
      			lTeclado=True
      		OTHER CASE
      	END
      	BTN_selecionar..Visible=selecionar
      	MyWindow..ReturnedValue=origem
      	btn_delete..Visible=False
      	btn_new..Visible=False
      	BTN_Modificar..Visible=False
      	BTN_Imprimir..visible=false
      	TABLE_artigos..LineHeight=30
      	BTN_Fechar..y=503
      	btn_fechar..Height=38
      	BTN_anterior..visible=true
      	BTN_seguinte..visible=true
      	SetFocus(BTN_selecionar)
      end
      CBOX_ativo=1
      gsFiltro_Atual is string
      filtrar_artigos("todos")
      gsFiltro_Atual="todos"
      ExecuteProcess(EDT_termo_pesquisa,trtChange)
```

### WIN_Table_artigos — Local procedure (raw 458752)

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:984-1015`. Reset mode buttons to black, 8-point, nonbold, not underlined, retaining the chosen button font family; selected mode becomes DarkBlue, bold and underlined via dynamic control-name access.

```wlanguage
      PROCEDURE filtrar_artigos(sOpcao is string)
      ConfFont is Font
      ConfFont..Bold=False 
      ConfFont..Color=Black
      ConfFont..Size=8
      ConfFont..Underline=False
      ConfFont..Name={"BTN_"+sOpcao}..FontName
      BTN_todos..Font=ConfFont
      BTN_codigo..Font=ConfFont
      BTN_descricao..Font=ConfFont
      BTN_codigobarras..Font=ConfFont
      ConfFont..Bold=True
      ConfFont..Color=DarkBlue
      ConfFont..Underline=True 
      {"BTN_"+sOpcao}..Font=ConfFont
```

## Encoded actions and runtime proposals

| Control/event | Action | Proposed behavior (assumed) | Evidence |
|---|---|---|---|
| WIN_Table_artigos/BTN_Fechar/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:239 |
| WIN_Table_artigos/BTN_Delete/18 | A-41b483 | Nothing beyond the code next to it | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:318 |
| WIN_Table_artigos/BTN_Imprimir/18 | A-17c226 | Print RPT_List_artigos (preview first, as the app's own print calls do) | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:371 |
| WIN_Table_artigos/SC_SCSystemButtons/BTN_UMC/18 | A-2fd8eb | Open WINDEV's user macro-code editor (U.M.C., a WINDEV developer feature): propose to exclude | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:412 |
| WIN_Table_artigos/SC_SCSystemButtons/BTN_SYST_MINIMIZE/18 | A-48d568 | Minimize the window | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:435 |
| WIN_Table_artigos/SC_SCSystemButtons/BTN_Syst_Maximize/18 | A-ff0b05 | Maximize or restore the window | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:460 |
| WIN_Table_artigos/SC_SCSystemButtons/BTN_SYST_FERMER/18 | A-2b6ca2 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:485 |
| WIN_Table_artigos/BTN_selecionar/18 | A-d61aa1 | Close the window | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:782 |

## HFSQL context contract

The dossier explicitly sets independent HFSQL context=False: current records, cursor positions and persistent filters are shared with the calling/opened windows. Preserve this contract; do not silently isolate a new form. Evidence: `dossier: WIN_Table_artigos/flags.Indep. HFSQL ctx.`.

## Direct caller context

`legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:197`

```wlanguage
194: type : 14
195: -
196: code : |1-
197: EDT_Ao_artigo=open(WIN_Table_artigos,true,EDT_Ao_artigo)
198: type : 18
199: -
200: type : 161
201: enabled : false
202: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw:303`

```wlanguage
300: type : 14
301: -
302: code : |1-
303: EDT_Do_artigo=open(WIN_Table_artigos,true,EDT_Do_artigo)
304: if EDT_Do_artigo<>"" then
305: EDT_Ao_artigo=EDT_Do_artigo
306: end
307: type : 18
308: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:755`

```wlanguage
752: type : 14
753: -
754: code : |1-
755: EDT_Ao_artigo1=open(WIN_Table_artigos,true,EDT_Ao_artigo1)
756: type : 18
757: -
758: type : 161
759: enabled : false
760: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:779`

```wlanguage
776: type : 14
777: -
778: code : |1-
779: EDT_Do_artigo1=open(WIN_Table_artigos,true,EDT_Do_artigo1)
780: if EDT_Do_artigo1<>"" then
781: EDT_Ao_artigo1=EDT_Do_artigo1
782: end
783: type : 18
784: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:806`

```wlanguage
803: type : 14
804: -
805: code : |1-
806: EDT_Ao_artigo=open(WIN_Table_artigos,true,EDT_Ao_artigo)
807: type : 18
808: -
809: type : 161
810: enabled : false
811: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:830`

```wlanguage
827: type : 14
828: -
829: code : |1-
830: EDT_Do_artigo=open(WIN_Table_artigos,true,EDT_Do_artigo)
831: if EDT_Do_artigo<>"" then
832: EDT_Ao_artigo=EDT_Do_artigo
833: end
834: type : 18
835: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:930`

```wlanguage
927: type : 14
928: -
929: code : |1-
930: EDT_Ao_artigo2=open(WIN_Table_artigos,true,EDT_Ao_artigo2)
931: type : 18
932: -
933: type : 161
934: enabled : false
935: -
```

`legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Artigos.wdw:995`

```wlanguage
992: type : 14
993: -
994: code : |1-
995: EDT_Do_artigo2=open(WIN_Table_artigos,true,EDT_Do_artigo2)
996: if EDT_Do_artigo2<>"" then
997: EDT_Ao_artigo2=EDT_Do_artigo2
998: end
999: type : 18
1000: -
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:327`

```wlanguage
324: Restore(WIN_Table_artigos)
325: WinStatus(WIN_Table_artigos,TopActive)
326: CASE NotFound
327: OpenChild(WIN_Table_artigos,False,"")
328: END
329: type : 18
330: -
331: type : 161
332: enabled : false
```

`legacy/GestaoOficinas_TesteIA/WIN_MENU.wdw:566`

```wlanguage
563: Restore(WIN_Table_artigos)
564: WinStatus(WIN_Table_artigos,TopActive)
565: CASE NotFound
566: OpenChild(WIN_Table_artigos,False,"")
567: END
568: type : 32
569: -
570: name : OPT_Estados_descritivos
571: identifier : 0x265c69fe1f7c64fb
```

`legacy/GestaoOficinas_TesteIA/WIN_Material_reparacao_form.wdw:702`

```wlanguage
699: -
700: code : |1-
701: sArtigo is string
702: sArtigo=open(WIN_Table_artigos,true,EDT_artigo)
703: if sArtigo<>"" then
704: EDT_artigo=sArtigo
705: query is string
706: query="select * from artigos where codigo='"+sArtigo+"'"
707: Qry_select_artigo_codigo is data source
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1081`

```wlanguage
1078: Restore(WIN_Table_artigos)
1079: WinStatus(WIN_Table_artigos,TopActive)
1080: CASE NotFound
1081: OpenChild(WIN_Table_artigos,False,"")
1082: END
1083: type : 18
1084: -
1085: type : 161
1086: enabled : false
```

`legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:778`

```wlanguage
775: type : 14
776: -
777: code : |1-
778: EDT_codigo=open(WIN_Table_artigos,true,edt_codigo)
779: if EDT_codigo<>"" then
780: Query is string
781: Query="select * from artigos where codigo='"+EDT_codigo+"'"
782: Qry_select_artigos_codigo is data source
783: HExecuteSQLQuery(Qry_select_artigos_codigo,hQueryDefault,Query)
```

## Data and calls out

| Function | Source call sites and first argument |
|---|---|
| Info | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:327 → "Artigo usado em ordens de reparação, não pode ser eliminado"; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:338 → "Artigo usado em documentos, não pode ser eliminado" |
| HCancelDeclaration | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:328 → Qry_select_materiais_artigo; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:331 → Qry_select_materiais_artigo; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:339 → Qry_select_lin_stocks_artigo; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:342 → Qry_select_lin_stocks_artigo |
| HExecuteSQLQuery | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:325 → Qry_select_materiais_artigo; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:336 → Qry_select_lin_stocks_artigo |
| Open | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:263 → WIN_Form_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:294 → WIN_Form_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:685 → WIN_Teclado_Alfa |
| SetFocus | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:560 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:709 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:734 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:759 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:953 → BTN_selecionar |
| HNbRec | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:326 → Qry_select_materiais_artigo; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:337 → Qry_select_lin_stocks_artigo |
| HReset | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:260 → artigos |
| TableDisplay | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:266 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:295 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:349 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:559 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:616 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:679 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:708 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:733 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:758 → TABLE_artigos |
| HDeactivateFilter | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:558 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:604 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:666 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:707 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:732 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:757 → artigos |
| HFilter | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:608 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:612 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:622 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:626 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:630 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:637 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:641 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:645 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:652 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:656 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:660 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:670 → artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:674 → artigos |
| ExecuteProcess | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:686 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:875 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:911 → EDT_termo_pesquisa; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:959 → EDT_termo_pesquisa |
| TableSelect | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:292 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:321 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:808 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:809 → TABLE_artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:834 → TABLE_Artigos; legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:835 → TABLE_Artigos |
| Dialog | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:345 → <§?173B299C07B77A03§> |
| TableDelete | legacy/GestaoOficinas_TesteIA/WIN_Table_artigos.wdw:348 → TABLE_artigos |

## Behavior checklist

On open: global declarations precede control initialization and end-of-initialization; use the exact initial values above. After search/mode change: source clear/filter/display sequence applies; selected row and dependent controls in the empty result need U-C7738076-02. After writes: preserve the exact refresh and seek modes, including current row leaving filter. Keyboard navigation: source previous/next bounds and table flags in screen spec; OS focus/default-key edge cases need U-C7738076-01. Other-window/user updates and simultaneous instances: shared HFSQL buffers/filters and lack of explicit refresh timers are part of the evidence; observed isolation and stale-data outcome need U-C7738076-02. Built-in sorting/search/saved columns/Enter are listed individually in the spec. Dialog resource data and exact text are below; shell appearance is an assumed Q-12 proposal and Esc deletion an assumed Q-01 proposal where applicable. Each unchecked write/query failure is U-C7738076-03. SQL concatenation preserves source implicit text conversion; quote/locale boundaries require U-C7738076-03.

## Proposed changes for later framing

Source expressions above remain legacy evidence. Accepted ADR-002/003/006/008/011/012 now define parameterized SQL and explicit target identity/state/write-failure handling. These decisions settle target behavior, while unspecified legacy HFSQL coercion, generated-error presentation and shared-cursor outcomes remain scoped U questions.

## Unresolved

- U-C7738076-01 — Designer properties absent from parsed fields, effective cross-container tab order, skin font/RGB/icon rendering, opening focus and default/cancel key precedence require dossier-image review and a keyboard walkthrough. Blocks visual/keyboard acceptance; interim default: preserve supplied values and source event overrides, no fabricated metadata.
- U-C7738076-02 — Capture empty/filtered selection, keyboard row transitions, a record leaving its filter, concurrent writes, two instances and parent/callee buffer/filter coupling with before/after records. Blocks those edge acceptance cases; interim default: source call order and refresh modes, no extra refresh.
- U-C7738076-03 — Exercise duplicate, nonduplicate write failure, deleted-current-record, SQL apostrophes and locale numeric/date input; capture generated dialogs and resulting buffer/return state. Blocks failure-path acceptance; interim default: preserve source fallthrough rather than claim success evidence.

Related extraction findings (report mappings own their resolution):
- RPT_List_artigos: embedded query — its SQL is not in the dossier (the items it selects are in docs/mapping/event-codes.md from the compile folder; export the conditions and sort from the report editor, or derive them from a legacy printout on known data) — proposed: every record of artigos, no condition, in the order of the table that prints it (WIN_Table_artigos, by artigosID); confirm on a legacy printout
- RPT_List_artigos: no call in code; named in the compiled code of WIN_Table_artigos (a predefined button action there is the likely caller — see encoded actions)
