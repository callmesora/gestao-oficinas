# Screen spec — WIN_Leitor_cod_barras_desconhecidos

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw`, `dossier: WIN_Leitor_cod_barras_desconhecidos`, `docs/mapping/WIN_Leitor_cod_barras_desconhecidos.md`. Step 0 only.

## Contract

Show unrecognized scanner rows.

Entry dynamically iterates desconhecidos into table; caller creates and cancels this source. Confirm closes; no article correction.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Códigos de barras"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 388, "height": 600} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-WB2879B-02. Saved position versus opening-mode precedence U-WB2879B-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-WB2879B-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TABLE_Leitura | Table | {"PT": "Quantidade"} | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | {"tab": 2, "column": "—"} | [19, 67, 350, 457] | {"anchoring": "Width and height", "state": "Read-only"} |
| BTN_Confirmar | Button | {"PT": "Confirmar"} | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | {"tab": 3, "column": "—"} | [281, 541, 88, 38] | {"anchoring": "Right and bottom", "state": "Active", "button_type": "Validate"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | {"tab": "unresolved (encoded); U-WB2879B-01", "column": "—"} | [158, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| RADTitle | Caption | {"PT": "Códigos de barras"} | unresolved (encoded); U-WB2879B-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WB2879B-01", "column": "—"} | [9, 4, 239, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_Códigos_de_barras_desconhecidos | Caption | {"PT": "Códigos de barras desconhecidos"} | unresolved (encoded); U-WB2879B-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WB2879B-01", "column": "—"} | [19, 36, 350, 25] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | {"tab": "-1", "column": "—"} | [338, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | {"tab": "-1", "column": "—"} | [288, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | {"tab": "-1", "column": "—"} | [314, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | {"tab": 1, "column": "—"} | [254, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| TABLE_Leitura.COL_cod_barras | Table column | {"PT": "Código Barras"} | unresolved (encoded); U-WB2879B-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": "unresolved (encoded); U-WB2879B-01", "column": 1} | ["unresolved (encoded); U-WB2879B-01", "unresolved (encoded); U-WB2879B-01", 231, "unresolved (encoded); U-WB2879B-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Left", "v_align": "Center"} |
| TABLE_Leitura.COL_quantidade | Table column | {"PT": "Quantidade"} | unresolved (encoded); U-WB2879B-01 | {"input_mask": {"PT": "999999,999"}, "input_type": "Numeric", "input_size": 0} | {"tab": "unresolved (encoded); U-WB2879B-01", "column": 2} | ["unresolved (encoded); U-WB2879B-01", "unresolved (encoded); U-WB2879B-01", 100, "unresolved (encoded); U-WB2879B-01"] | {"anchoring": "<None>", "state": "Active", "h_align": "Right", "v_align": "Center"} |
| SCSystemButtons | None | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | unresolved (encoded); U-WB2879B-01 | {"tab": "unresolved (encoded); U-WB2879B-01", "column": "—"} | [254, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| TABLE_Leitura | {"kind": "Table", "caption": {"PT": "Quantidade"}, "tab_order": 2, "anchoring": "Width and height", "x": 19, "y": 67, "width": 350, "height": 457, "row": "Read-onl Memory 1", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": false, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} | RULE-WB2879B-1000 |
| BTN_Confirmar | {"kind": "Button", "caption": {"PT": "Confirmar"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom", "x": 281, "y": 541, "width": 88, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} | RULE-WB2879B-1001 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 158, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-WB2879B-1002 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Códigos de barras"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 239, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WB2879B-1003 |
| STC_Códigos_de_barras_desconhecidos | {"kind": "Caption", "caption": {"PT": "Códigos de barras desconhecidos"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 36, "width": 350, "height": 25, "row": "Active Left Top", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WB2879B-1004 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 338, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WB2879B-1005 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 288, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WB2879B-1006 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 314, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WB2879B-1007 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 254, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-WB2879B-1008 |
| TABLE_Leitura.COL_cod_barras | {"kind": "Table column", "path": "TABLE_Leitura.COL_cod_barras", "column_index": 1, "title": {"PT": "Código Barras"}, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "width": 231, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-WB2879B-1009 |
| TABLE_Leitura.COL_quantidade | {"kind": "Table column", "path": "TABLE_Leitura.COL_quantidade", "column_index": 2, "title": {"PT": "Quantidade"}, "input_size": 0, "input_mask": {"PT": "999999,999"}, "anchoring": "<None>", "width": 100, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} | RULE-WB2879B-1010 |
| SCSystemButtons | {"kind": null, "x": 254, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-WB2879B-1011 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Leitor_cod_barras_desconhecidos.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-WB2879B-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-WB2879B-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | U-WB2879B-02 |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-WB2879B-02. |
| Actual field/type edges | U-WB2879B-05; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger. |
| Omitted visual metadata | U-WB2879B-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-WB2879B-02. Include first/last/empty grid rows and native headers.
- Compare baseline/resized designer image and missing visual properties under U-WB2879B-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-WB2879B-04 |


## Initial MIG11 implementation and retained gaps

Initial implementation renders the actual partition's unknown barcode/quantity rows with original TABLE_Leitura and Confirmar close; it adds no correction or article creation, matching legacy/GestaoOficinas_TesteIA/WIN_Leitor_cod_barras_desconhecidos.wdw:197/326–329. The memory result has explicit caller ownership instead of a shared dynamic HFSQL source.

U-WB2879B-01/02/05 retain designer/native table/input coercion and actual repair caller acceptance. This screen opens after a real nonempty unknown result from the scanner development bridge; no fixture supplies its rendered rows.
