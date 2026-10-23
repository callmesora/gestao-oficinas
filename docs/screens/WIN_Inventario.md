# Screen spec — WIN_Inventario

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inventario.wdw`, `dossier: WIN_Inventario`, `docs/mapping/WIN_Inventario.md`. Step 0 only.

## Contract

View and print inventory.

Code only declares entry and preview/print RPT_inventario. Menu opens reconstruction before this unit. Native binding/columns in dossier.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "InventÆrio"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 634, "height": 530} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W450C10-02. Saved position versus opening-mode precedence U-W450C10-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W450C10-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TABLE_Artigos | Table | {"PT": "artigos Tabela"} | {"browsed_file": "artigos", "browsed_item": "Codigo"} | unresolved (encoded); U-W450C10-01 | {"tab": 2, "column": "—"} | [19, 36, 596, 421] | {"anchoring": "Right and bottom, height and width", "state": "Read-only"} |
| BTN_Imprimir | Button | {"PT": "Imprimir"} | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | {"tab": 3, "column": "—"} | [19, 466, 94, 43] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_Sair | Button | {"PT": "Sair"} | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | {"tab": 4, "column": "—"} | [521, 466, 94, 43] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Abort"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | {"tab": "unresolved (encoded); U-W450C10-01", "column": "—"} | [404, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| RADTitle | Caption | {"PT": "InventÆrio"} | unresolved (encoded); U-W450C10-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W450C10-01", "column": "—"} | [9, 4, 485, 18] | {"anchoring": "Width", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | {"tab": "-1", "column": "—"} | [584, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | {"tab": "-1", "column": "—"} | [534, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | {"tab": "-1", "column": "—"} | [560, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | {"tab": 1, "column": "—"} | [500, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TABLE_Artigos.COL_Codigo | Table column | {"PT": "Código"} | unresolved (encoded); U-W450C10-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 30} | {"tab": "unresolved (encoded); U-W450C10-01", "column": 1} | ["unresolved (encoded); U-W450C10-01", "unresolved (encoded); U-W450C10-01", 160, "unresolved (encoded); U-W450C10-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Left", "v_align": "Center"} |
| TABLE_Artigos.COL_Descricao | Table column | {"PT": "Descriçªo"} | unresolved (encoded); U-W450C10-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 100} | {"tab": "unresolved (encoded); U-W450C10-01", "column": 2} | ["unresolved (encoded); U-W450C10-01", "unresolved (encoded); U-W450C10-01", 327, "unresolved (encoded); U-W450C10-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Left", "v_align": "Center"} |
| TABLE_Artigos.COL_Stock | Table column | {"PT": "Stock"} | unresolved (encoded); U-W450C10-01 | {"input_mask": {"PT": "+999 999 999 999,999"}, "input_type": "High-pre", "input_size": 0} | {"tab": "unresolved (encoded); U-W450C10-01", "column": 3} | ["unresolved (encoded); U-W450C10-01", "unresolved (encoded); U-W450C10-01", 86, "unresolved (encoded); U-W450C10-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Right", "v_align": "Center"} |
| SCSystemButtons | None | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | unresolved (encoded); U-W450C10-01 | {"tab": "unresolved (encoded); U-W450C10-01", "column": "—"} | [500, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| TABLE_Artigos | {"kind": "Table", "caption": {"PT": "artigos Tabela"}, "tab_order": 2, "browsed_file": "artigos", "browsed_item": "Codigo", "anchoring": "Right and bottom, height and width", "x": 19, "y": 36, "width": 596, "height": 421, "row": "Read-onl File loa 2", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": false, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} | RULE-W450C10-1000 |
| BTN_Imprimir | {"kind": "Button", "caption": {"PT": "Imprimir"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom, height and width", "x": 19, "y": 466, "width": 94, "height": 43, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W450C10-1001 |
| BTN_Sair | {"kind": "Button", "caption": {"PT": "Sair"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom, height and width", "x": 521, "y": 466, "width": 94, "height": 43, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} | RULE-W450C10-1002 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 404, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W450C10-1003 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "InventÆrio"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 485, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W450C10-1004 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 584, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W450C10-1005 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 534, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W450C10-1006 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 560, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W450C10-1007 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 500, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W450C10-1008 |
| TABLE_Artigos.COL_Codigo | {"kind": "Table column", "path": "TABLE_Artigos.COL_Codigo", "column_index": 1, "title": {"PT": "Código"}, "input_size": 30, "input_mask": {"PT": "0"}, "linked_item": "artigos.Codigo", "anchoring": "<None>", "width": 160, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} | RULE-W450C10-1009 |
| TABLE_Artigos.COL_Descricao | {"kind": "Table column", "path": "TABLE_Artigos.COL_Descricao", "column_index": 2, "title": {"PT": "Descriçªo"}, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "artigos.Descricao", "anchoring": "<None>", "width": 327, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} | RULE-W450C10-1010 |
| TABLE_Artigos.COL_Stock | {"kind": "Table column", "path": "TABLE_Artigos.COL_Stock", "column_index": 3, "title": {"PT": "Stock"}, "input_size": 0, "input_mask": {"PT": "+999 999 999 999,999"}, "linked_item": "artigos.stock", "anchoring": "<None>", "width": 86, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "High-pre", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} | RULE-W450C10-1011 |
| SCSystemButtons | {"kind": null, "x": 500, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W450C10-1012 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Inventario.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-W450C10-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W450C10-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | U-W450C10-02 |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-W450C10-02. |
| Actual field/type edges | U-W450C10-05; text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. |
| Omitted visual metadata | U-W450C10-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W450C10-02. Include first/last/empty grid rows and native headers.
- Compare baseline/resized designer image and missing visual properties under U-W450C10-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W450C10-04 |
