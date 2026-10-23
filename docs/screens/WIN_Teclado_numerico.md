# Screen spec — WIN_Teclado_numerico

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw`, `dossier: WIN_Teclado_numerico`, `docs/mapping/WIN_Teclado_numerico.md`. Step 0 only.

## Contract

Touch/physical bounded number entry.

Entry(title,original,decimals,lower,upper),format16.<decimals>f,manual focus. First write replaces with0.;period fractional mode;C/Backspace clear all;minus toggles sign;digits append with precision and inclusive range gate. Confirm Val bounds else Valor fora dos limites;cancel original. Caption writes7. Minus disabled lower>0 only. Physical digits48..57,C67/c99/Backspace8 clear,period46,minus45,Enter13,Esc27.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Teclado"} |
| window_type | Free window |
| opening_mode | Centered in the screen |
| size | {"x": 0, "y": 0, "width": 330, "height": 425} |
| close_icon | No |
| flags | {"Visible": true, "Title bar": false, "System menu": false, "Minimize icon": false, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": false, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": false, "Save position": true, "Automatic Scrollbar": false, "Large font management": false, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W291790-02. Saved position versus opening-mode precedence U-W291790-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W291790-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Caption | Button | {"PT": "Numero"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": "-1", "column": "—"} | [6, 6, 312, 55] | {"anchoring": "Width and height", "state": "Read-only", "button_type": "Normal"} |
| BTN_cancelar | Button | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 12, "column": "—"} | [236, 207, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_cinco | Button | {"PT": "5"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 5, "column": "—"} | [88, 207, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_confirmar | Button | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 11, "column": "—"} | [236, 274, 68, 128] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_dois | Button | {"PT": "2"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 2, "column": "—"} | [88, 274, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_limpar | Button | {"PT": "C"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 16, "column": "—"} | [236, 140, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_menos | Button | {"PT": "-"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 15, "column": "—"} | [162, 341, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_nove | Button | {"PT": "9"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 9, "column": "—"} | [162, 140, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_oito | Button | {"PT": "8"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 8, "column": "—"} | [88, 140, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_ponto | Button | {"PT": "."} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 14, "column": "—"} | [88, 341, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_quatro | Button | {"PT": "4"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 4, "column": "—"} | [14, 207, 68, 61] | {"anchoring": "Bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_seis | Button | {"PT": "6"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 6, "column": "—"} | [162, 207, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_sete | Button | {"PT": "7"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 7, "column": "—"} | [14, 140, 68, 61] | {"anchoring": "Bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_tres | Button | {"PT": "3"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 3, "column": "—"} | [162, 274, 68, 61] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_um | Button | {"PT": "1"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 1, "column": "—"} | [14, 274, 68, 61] | {"anchoring": "Bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_zero | Button | {"PT": "0"} | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"tab": 10, "column": "—"} | [14, 341, 68, 61] | {"anchoring": "Bottom, height and width", "state": "Active", "button_type": "Normal"} |
| EDT_Texto | Edit control | unresolved (encoded); U-W291790-01 | unresolved (encoded); U-W291790-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": "-1", "column": "—"} | [14, 68, 292, 60] | {"anchoring": "Bottom, height and width", "state": "Read-only"} |
| EDT_input_manual | Edit control | {"PT": "Imput Manual (nªo visivel em runtime)"} | unresolved (encoded); U-W291790-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": "-1", "column": "—"} | [97, -33, 221, 24] | {"anchoring": "<None>", "state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Caption | {"kind": "Button", "caption": {"PT": "Numero"}, "tab_order": "-1", "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_Andy_Frame.png"}, "anchoring": "Width and height", "x": 6, "y": 6, "width": 312, "height": 55, "row": "Read-onl Normal", "state": "Read-only", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W291790-1000 |
| BTN_cancelar | {"kind": "Button", "tab_order": 12, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01620.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 236, "y": 207, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1001 |
| BTN_cinco | {"kind": "Button", "caption": {"PT": "5"}, "tab_order": 5, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 88, "y": 207, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1002 |
| BTN_confirmar | {"kind": "Button", "tab_order": 11, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01610.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 236, "y": 274, "width": 68, "height": 128, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1003 |
| BTN_dois | {"kind": "Button", "caption": {"PT": "2"}, "tab_order": 2, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 88, "y": 274, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1004 |
| BTN_limpar | {"kind": "Button", "caption": {"PT": "C"}, "tab_order": 16, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 236, "y": 140, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1005 |
| BTN_menos | {"kind": "Button", "caption": {"PT": "-"}, "tab_order": 15, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 162, "y": 341, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1006 |
| BTN_nove | {"kind": "Button", "caption": {"PT": "9"}, "tab_order": 9, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 162, "y": 140, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1007 |
| BTN_oito | {"kind": "Button", "caption": {"PT": "8"}, "tab_order": 8, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 88, "y": 140, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1008 |
| BTN_ponto | {"kind": "Button", "caption": {"PT": "."}, "tab_order": 14, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 88, "y": 341, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1009 |
| BTN_quatro | {"kind": "Button", "caption": {"PT": "4"}, "tab_order": 4, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Bottom, height and width", "x": 14, "y": 207, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1010 |
| BTN_seis | {"kind": "Button", "caption": {"PT": "6"}, "tab_order": 6, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 162, "y": 207, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1011 |
| BTN_sete | {"kind": "Button", "caption": {"PT": "7"}, "tab_order": 7, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Bottom, height and width", "x": 14, "y": 140, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1012 |
| BTN_tres | {"kind": "Button", "caption": {"PT": "3"}, "tab_order": 3, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Right and bottom, height and width", "x": 162, "y": 274, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1013 |
| BTN_um | {"kind": "Button", "caption": {"PT": "1"}, "tab_order": 1, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Bottom, height and width", "x": 14, "y": 274, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1014 |
| BTN_zero | {"kind": "Button", "caption": {"PT": "0"}, "tab_order": 10, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\CA_WidgetVista.png"}, "anchoring": "Bottom, height and width", "x": 14, "y": 341, "width": 68, "height": 61, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W291790-1015 |
| EDT_Texto | {"kind": "Edit control", "tab_order": "-1", "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Bottom, height and width", "x": 14, "y": 68, "width": 292, "height": 60, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": false, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": false, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W291790-1016 |
| EDT_input_manual | {"kind": "Edit control", "caption": {"PT": "Imput Manual (nªo visivel em runtime)"}, "tab_order": "-1", "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 97, "y": -33, "width": 221, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": false, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W291790-1017 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Teclado_numerico.md. Title/default/Esc/language: U-W291790-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W291790-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | U-W291790-04 |
| Actual field/type edges | U-W291790-05; numeric keyboard bounds, decimal separator and mask precision actually used in the ledger. |
| Omitted visual metadata | U-W291790-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W291790-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W291790-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_Teclado_numerico.wdw:282 | "Valor fora dos limites ("+nLimiteInferior+" - "+nLimiteSuperior+")" | Info | U-W291790-04; exact branch result in mapping event ledger |
