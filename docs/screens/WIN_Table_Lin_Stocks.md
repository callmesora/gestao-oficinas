# Screen spec — WIN_Table_Lin_Stocks

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw`, `dossier: WIN_Table_Lin_Stocks`, `docs/mapping/WIN_Table_Lin_Stocks.md`. Step 0 only.

## Contract

Create/replace stock document and lines.

Entry(type,num,state):modify loads lines/header,disables date/type;new first type,maxnumber+1,today. Type select recalculates number and mechanic visibility via obriga_macanico. Article exit barcode before code,description/price/focusqty;qty exit focusprice. Add requires code,maxline+1,resets qty1/price0. Confirm table=-1 =>Documento sem linhas. stock1 adds,every other subtracts. Modify reverses old lines(stock1 minus,other plus),deletes,recreates,applies stock,updates header. New header first then lines. Example old+2,new+3 =>net+1. No mechanic-required check,transaction,write checking or duplicate lock. SQL concatenates text/numeric values. Cancel/delete resource dialogs plus encoded closure.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Movimentos de Stocks"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 800, "height": 600} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W7E91C1-02. Saved position versus opening-mode precedence U-W7E91C1-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W7E91C1-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TABLE_lin_Stocks | Table | {"PT": "Tabela"} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 9, "column": "—"} | [19, 171, 762, 277] | {"anchoring": "Width and height", "state": "Active"} |
| BTN_Adicionar | Button | {"PT": "Adicionar"} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 16, "column": "—"} | [701, 498, 80, 36] | {"anchoring": "Bottom", "state": "Active", "button_type": "Validate"} |
| BTN_Adicionar1 | Button | {"PT": "Eliminar linha"} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 10, "column": "—"} | [19, 450, 100, 20] | {"anchoring": "Bottom", "state": "Active", "button_type": "Normal"} |
| BTN_Artigos | Button | {"PT": "Criar Artigo..."} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 17, "column": "—"} | [19, 541, 91, 38] | {"anchoring": "Right and bottom", "state": "Active", "button_type": "Normal"} |
| BTN_Cancelar | Button | {"PT": "Cancelar"} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 19, "column": "—"} | [691, 547, 90, 38] | {"anchoring": "Right and bottom", "state": "Active", "button_type": "Normal"} |
| BTN_Confirmar | Button | {"PT": "Gravar documento"} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 18, "column": "—"} | [542, 547, 143, 38] | {"anchoring": "Right and bottom", "state": "Active", "button_type": "Normal"} |
| BTN_NoName1 | Button | {"PT": "..."} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 12, "column": "—"} | [155, 498, 47, 36] | {"anchoring": "Bottom", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [570, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| BTN_VISION | Button | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 5, "column": "—"} | [339, 65, 42, 24] | {"anchoring": "Right", "state": "Active", "button_type": "Normal"} |
| BTN_VISION2 | Button | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 7, "column": "—"} | [710, 126, 42, 24] | {"anchoring": "Right", "state": "Active", "button_type": "Normal"} |
| COMBO_mecanico | Combo Box | unresolved (encoded); U-W7E91C1-01 | {"browsed_file": "mecanicos", "browsed_item": "Codigo"} | {"input_type": "Text", "input_size": 0} | {"tab": 6, "column": "—"} | [503, 120, 206, 36] | {"anchoring": "Right", "state": "Active"} |
| COMBO_tipo_doc | Combo Box | unresolved (encoded); U-W7E91C1-01 | {"browsed_file": "documentos", "browsed_item": "Codigo"} | {"input_type": "Text", "input_size": 0} | {"tab": 2, "column": "—"} | [19, 59, 319, 36] | {"anchoring": "Right", "state": "Active"} |
| EDT_Data | Edit control | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "UseSystemMask"}, "input_type": "Date", "input_size": 0} | {"tab": 4, "column": "—"} | [613, 64, 139, 24] | {"anchoring": "Right", "state": "Active"} |
| EDT_Numero | Edit control | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "9999999999"}, "input_type": "Numeric", "input_size": 0} | {"tab": 3, "column": "—"} | [421, 64, 140, 24] | {"anchoring": "Right", "state": "Read-only"} |
| EDT_codigo | Edit control | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 30} | {"tab": 11, "column": "—"} | [19, 498, 130, 36] | {"anchoring": "Bottom", "state": "Active"} |
| EDT_descricao | Edit control | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 100} | {"tab": 8, "column": "—"} | [19, 127, 460, 24] | {"anchoring": "Right", "state": "Active"} |
| EDT_descricao_Artigo | Edit control | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 100} | {"tab": 13, "column": "—"} | [208, 498, 318, 36] | {"anchoring": "Bottom", "state": "Active"} |
| EDT_preco | Edit control | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "999999999,99"}, "input_type": "Numeric", "input_size": 0} | {"tab": 15, "column": "—"} | [614, 498, 81, 36] | {"anchoring": "Bottom", "state": "Active"} |
| EDT_quant | Edit control | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "999999,999"}, "input_type": "Numeric", "input_size": 0} | {"tab": 14, "column": "—"} | [532, 498, 76, 36] | {"anchoring": "Bottom", "state": "Active"} |
| RADTitle | Caption | {"PT": "Movimentos de Stocks"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [9, 4, 651, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_Código | Caption | {"PT": "Código"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [19, 483, 100, 20] | {"anchoring": "Bottom", "state": "Active"} |
| STC_Data | Caption | {"PT": "Data"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [613, 36, 100, 20] | {"anchoring": "<None>", "state": "Active"} |
| STC_Descricao | Caption | {"PT": "Descriçªo"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [19, 104, 100, 20] | {"anchoring": "Right", "state": "Active"} |
| STC_Descriçªo_do_Artigo | Caption | {"PT": "Descriçªo do Artigo"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [208, 483, 183, 20] | {"anchoring": "Bottom", "state": "Active"} |
| STC_Mecanico | Caption | {"PT": "Mecânico"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [503, 101, 100, 20] | {"anchoring": "Right", "state": "Active"} |
| STC_Nœmero | Caption | {"PT": "Nœmero"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [421, 36, 100, 20] | {"anchoring": "<None>", "state": "Active"} |
| STC_Preço | Caption | {"PT": "Preço"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [614, 483, 42, 20] | {"anchoring": "Bottom", "state": "Active"} |
| STC_Quantidade | Caption | {"PT": "Quantidade"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [532, 483, 65, 20] | {"anchoring": "Bottom", "state": "Active"} |
| STC_Tipo_de_Documento | Caption | {"PT": "Tipo de Documento"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [19, 36, 100, 20] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": "-1", "column": "—"} | [750, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": "-1", "column": "—"} | [700, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": "-1", "column": "—"} | [726, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": 1, "column": "—"} | [666, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TABLE_lin_Stocks.COL_Codigo | Table column | {"PT": "Código"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": 1} | ["unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", 126, "unresolved (encoded); U-W7E91C1-01"] | {"anchoring": "<None>", "state": "Read-onl", "h_align": "Left", "v_align": "Center"} |
| TABLE_lin_Stocks.COL_Descricao | Table column | {"PT": "Descriçªo do artigo"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": 2} | ["unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", 416, "unresolved (encoded); U-W7E91C1-01"] | {"anchoring": "<None>", "state": "Read-onl", "h_align": "Left", "v_align": "Center"} |
| TABLE_lin_Stocks.COL_Quant | Table column | {"PT": "Quant"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "999999,999"}, "input_type": "Numeric", "input_size": 0} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": 3} | ["unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", 100, "unresolved (encoded); U-W7E91C1-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Right", "v_align": "Center"} |
| TABLE_lin_Stocks.COL_Preco | Table column | {"PT": "Preço"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "999999999,99"}, "input_type": "Numeric", "input_size": 0} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": 4} | ["unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", 100, "unresolved (encoded); U-W7E91C1-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Right", "v_align": "Center"} |
| TABLE_lin_Stocks.COL_linha | Table column | {"PT": "linha"} | unresolved (encoded); U-W7E91C1-01 | {"input_mask": {"PT": "9999"}, "input_type": "Numeric", "input_size": 0} | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": 5} | ["unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", 100, "unresolved (encoded); U-W7E91C1-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Right", "v_align": "Center"} |
| SCSystemButtons | None | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | [666, 1, 128, 18] | {"state": "Active"} |
| STC_Descrição_do_Artigo | None | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | ["unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01"] | unresolved (encoded); U-W7E91C1-01 |
| STC_Número | None | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | unresolved (encoded); U-W7E91C1-01 | {"tab": "unresolved (encoded); U-W7E91C1-01", "column": "—"} | ["unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01", "unresolved (encoded); U-W7E91C1-01"] | unresolved (encoded); U-W7E91C1-01 |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| TABLE_lin_Stocks | {"kind": "Table", "caption": {"PT": "Tabela"}, "tab_order": 9, "anchoring": "Width and height", "x": 19, "y": 171, "width": 762, "height": 277, "row": "Active Memory 2", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": false, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} | RULE-W7E91C1-1000 |
| BTN_Adicionar | {"kind": "Button", "caption": {"PT": "Adicionar"}, "tab_order": 16, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01605.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Bottom", "x": 701, "y": 498, "width": 80, "height": 36, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1001 |
| BTN_Adicionar1 | {"kind": "Button", "caption": {"PT": "Eliminar linha"}, "tab_order": 10, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Bottom", "x": 19, "y": 450, "width": 100, "height": 20, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1002 |
| BTN_Artigos | {"kind": "Button", "caption": {"PT": "Criar Artigo..."}, "tab_order": 17, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\inventory_categories_16.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom", "x": 19, "y": 541, "width": 91, "height": 38, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1003 |
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 19, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom", "x": 691, "y": 547, "width": 90, "height": 38, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1004 |
| BTN_Confirmar | {"kind": "Button", "caption": {"PT": "Gravar documento"}, "tab_order": 18, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom", "x": 542, "y": 547, "width": 143, "height": 38, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1005 |
| BTN_NoName1 | {"kind": "Button", "caption": {"PT": "..."}, "tab_order": 12, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Bottom", "x": 155, "y": 498, "width": 47, "height": 36, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1006 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 570, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W7E91C1-1007 |
| BTN_VISION | {"kind": "Button", "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 339, "y": 65, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1008 |
| BTN_VISION2 | {"kind": "Button", "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 710, "y": 126, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1009 |
| COMBO_mecanico | {"kind": "Combo Box", "tab_order": 6, "input_size": 0, "input_type": "Text", "browsed_file": "mecanicos", "browsed_item": "Codigo", "displayed_item": "Descricao", "stored_item": "Codigo", "anchoring": "Right", "x": 503, "y": 120, "width": 206, "height": 36, "row": "Active File wit", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Sorted": false, "With input": false, "Required input": false, "File assisted input": false, "NULL if empty": false, "Scrollbar tooltip": true, "Horizontal scroll": false}} | RULE-W7E91C1-1010 |
| COMBO_tipo_doc | {"kind": "Combo Box", "tab_order": 2, "input_size": 0, "input_type": "Text", "linked_item": "Viaturas.Cliente", "browsed_file": "documentos", "browsed_item": "Codigo", "displayed_item": "Descricao", "stored_item": "Codigo", "anchoring": "Right", "x": 19, "y": 59, "width": 319, "height": 36, "row": "Active File wit", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Sorted": false, "With input": false, "Required input": false, "File assisted input": false, "NULL if empty": false, "Scrollbar tooltip": true, "Horizontal scroll": false}} | RULE-W7E91C1-1011 |
| EDT_Data | {"kind": "Edit control", "tab_order": 4, "input_size": 0, "input_mask": {"PT": "UseSystemMask"}, "anchoring": "Right", "x": 613, "y": 64, "width": 139, "height": 24, "row": "Active Date", "state": "Active", "input_type": "Date", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7E91C1-1012 |
| EDT_Numero | {"kind": "Edit control", "tab_order": 3, "input_size": 0, "input_mask": {"PT": "9999999999"}, "anchoring": "Right", "x": 421, "y": 64, "width": 140, "height": 24, "row": "Read-onl Numeric", "state": "Read-only", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7E91C1-1013 |
| EDT_codigo | {"kind": "Edit control", "tab_order": 11, "input_size": 30, "input_mask": {"PT": "0"}, "anchoring": "Bottom", "x": 19, "y": 498, "width": 130, "height": 36, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7E91C1-1014 |
| EDT_descricao | {"kind": "Edit control", "tab_order": 8, "input_size": 100, "input_mask": {"PT": "0"}, "anchoring": "Right", "x": 19, "y": 127, "width": 460, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7E91C1-1015 |
| EDT_descricao_Artigo | {"kind": "Edit control", "tab_order": 13, "input_size": 100, "input_mask": {"PT": "0"}, "anchoring": "Bottom", "x": 208, "y": 498, "width": 318, "height": 36, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7E91C1-1016 |
| EDT_preco | {"kind": "Edit control", "tab_order": 15, "input_size": 0, "input_mask": {"PT": "999999999,99"}, "anchoring": "Bottom", "x": 614, "y": 498, "width": 81, "height": 36, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7E91C1-1017 |
| EDT_quant | {"kind": "Edit control", "tab_order": 14, "input_size": 0, "input_mask": {"PT": "999999,999"}, "anchoring": "Bottom", "x": 532, "y": 498, "width": 76, "height": 36, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7E91C1-1018 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Movimentos de Stocks"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 651, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1019 |
| STC_Código | {"kind": "Caption", "caption": {"PT": "Código"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Bottom", "x": 19, "y": 483, "width": 100, "height": 20, "row": "Active Left Top", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1020 |
| STC_Data | {"kind": "Caption", "caption": {"PT": "Data"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 613, "y": 36, "width": 100, "height": 20, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1021 |
| STC_Descricao | {"kind": "Caption", "caption": {"PT": "Descriçªo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Right", "x": 19, "y": 104, "width": 100, "height": 20, "row": "Active Left Top", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1022 |
| STC_Descriçªo_do_Artigo | {"kind": "Caption", "caption": {"PT": "Descriçªo do Artigo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Bottom", "x": 208, "y": 483, "width": 183, "height": 20, "row": "Active Left Top", "state": "Active"} | RULE-W7E91C1-1023 |
| STC_Mecanico | {"kind": "Caption", "caption": {"PT": "Mecânico"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Right", "x": 503, "y": 101, "width": 100, "height": 20, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1024 |
| STC_Nœmero | {"kind": "Caption", "caption": {"PT": "Nœmero"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 421, "y": 36, "width": 100, "height": 20, "row": "Active Left Center", "state": "Active"} | RULE-W7E91C1-1025 |
| STC_Preço | {"kind": "Caption", "caption": {"PT": "Preço"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Bottom", "x": 614, "y": 483, "width": 42, "height": 20, "row": "Active Left Top", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1026 |
| STC_Quantidade | {"kind": "Caption", "caption": {"PT": "Quantidade"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Bottom", "x": 532, "y": 483, "width": 65, "height": 20, "row": "Active Left Top", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1027 |
| STC_Tipo_de_Documento | {"kind": "Caption", "caption": {"PT": "Tipo de Documento"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 36, "width": 100, "height": 20, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1028 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 750, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7E91C1-1029 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 700, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7E91C1-1030 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 726, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7E91C1-1031 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 666, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W7E91C1-1032 |
| TABLE_lin_Stocks.COL_Codigo | {"kind": "Table column", "path": "TABLE_lin_Stocks.COL_Codigo", "column_index": 1, "title": {"PT": "Código"}, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "width": 126, "state": "Read-onl", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-W7E91C1-1033 |
| TABLE_lin_Stocks.COL_Descricao | {"kind": "Table column", "path": "TABLE_lin_Stocks.COL_Descricao", "column_index": 2, "title": {"PT": "Descriçªo do artigo"}, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "width": 416, "state": "Read-onl", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-W7E91C1-1034 |
| TABLE_lin_Stocks.COL_Quant | {"kind": "Table column", "path": "TABLE_lin_Stocks.COL_Quant", "column_index": 3, "title": {"PT": "Quant"}, "input_size": 0, "input_mask": {"PT": "999999,999"}, "anchoring": "<None>", "width": 100, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-W7E91C1-1035 |
| TABLE_lin_Stocks.COL_Preco | {"kind": "Table column", "path": "TABLE_lin_Stocks.COL_Preco", "column_index": 4, "title": {"PT": "Preço"}, "input_size": 0, "input_mask": {"PT": "999999999,99"}, "anchoring": "<None>", "width": 100, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-W7E91C1-1036 |
| TABLE_lin_Stocks.COL_linha | {"kind": "Table column", "path": "TABLE_lin_Stocks.COL_linha", "column_index": 5, "title": {"PT": "linha"}, "input_size": 0, "input_mask": {"PT": "9999"}, "anchoring": "<None>", "width": 100, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": false, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-W7E91C1-1037 |
| SCSystemButtons | {"kind": null, "x": 666, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7E91C1-1038 |
| STC_Descrição_do_Artigo | {"kind": null, "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1039 |
| STC_Número | {"kind": null, "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7E91C1-1040 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Table_Lin_Stocks.md. Title/default/Esc/language: U-W7E91C1-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W7E91C1-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | U-W7E91C1-02 |
| Data/timer/lock/write-failure scope | U-W7E91C1-03 |
| Local message shell/resource wiring | U-W7E91C1-04 |
| Actual field/type edges | U-W7E91C1-05; date/time masks, blank/zero datetime values and workstation locale/time interpretation; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-W7E91C1-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W7E91C1-02. Include first/last/empty grid rows and native headers.
- Compare baseline/resized designer image and missing visual properties under U-W7E91C1-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:611 | "Artigo não existente" | Info | U-W7E91C1-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:854 | "Documento sem linhas" | Info | U-W7E91C1-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:954 | <§?16F66B2A006BA0B6§> | Dialog | U-W7E91C1-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:1043 | <§?16F68AA100CA8A1A§> | Dialog | U-W7E91C1-04; exact branch result in mapping event ledger |

Resource metadata from original source (localized labels retained):
```json
{
  "identifier": "0x16f66b2a006ba0b6",
  "label": {
    "pt-PT": "Confirma o cancelamento das alterações?"
  },
  "buttons": [
    {
      "label": {
        "pt-PT": "Sim"
      },
      "value": 1
    },
    {
      "label": {
        "pt-PT": "Não"
      },
      "value": 2
    }
  ],
  "cancel_button": 1
}
```
Cancellation field is metadata; resource-to-runtime mapping remains U-W7E91C1-04.

Resource metadata from original source (localized labels retained):
```json
{
  "identifier": "0x16f68aa100ca8a1a",
  "label": {
    "pt-PT": "Confirma a eliminação da linha?"
  },
  "buttons": [
    {
      "label": {
        "pt-PT": "Sim"
      },
      "value": 1
    },
    {
      "label": {
        "pt-PT": "Não"
      },
      "value": 2
    }
  ],
  "cancel_button": 1
}
```
Cancellation field is metadata; resource-to-runtime mapping remains U-W7E91C1-04.


## Initial MIG11 implementation and retained gaps

Initial implementation supplies source document/mechanic/article pickers, real barcode-before-code lookup, line addition/deletion and editable quantities/prices. Save performs source old-line reversal → replacement → new-line application → header update in one short transaction; stock1 adds, every other stock value subtracts (legacy/GestaoOficinas_TesteIA/WIN_Table_Lin_Stocks.wdw:853–931). No mechanic-required/nonnegative-stock rule is invented. Readonly date/type and current nullable/raw values are preserved.

U-W7E91C1-03: a read baseline must still match before replacement; a new number collision, missing/ambiguous document lookup or duplicate header scope refuses the write. IDs use guarded signed8 allocation; existing provenance on the header survives. U02 retains native grid sort/keyboard/refresh edges and the temporary nested article-maintenance modal adaptation to source OpenChild. U04 uses source resource text/labels with conservative Não dismissal/default. U05 retains native quantity/price/date/NULL coercion; untouched exact decimals are never rounded. Inline cell inputs use non-legacy test IDs COL_Quant-{index}/COL_Preco-{index}; other stock-* diagnostics/restores/launchers are non-legacy. Report/whole-window/native acceptance remains open.

MIG11 continuation: mapped memory-table headers now sort/search exact raw cell values, including current decimal cell drafts, with no Number conversion. Document/mechanic picker returns refresh their public options before resolving the returned code. The existing source quantity Exit still focuses price; Add alone appends max-linha+1 and resets code/description/quantity1/price0. Actual browser flows exercise missing lookup/focus, line sort/search, empty refusal and both explicit confirmation branches. Native collation/NULL tie order and the documented conservative resource defaults remain U02/U04; those defaults are not promoted by a clicked-button test.
