# Screen spec — WIN_Inserir_quantidade_password

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Inserir_quantidade_password.wdw`, `dossier: WIN_Inserir_quantidade_password`, `docs/mapping/WIN_Inserir_quantidade_password.md`. Step 0 only.

## Contract

Return quantity/price/password/description.

Default result incoming valor; selected field only visible. Quantity mask999999,999; price9999999999,99; password blank. Description adds200 width to window/field and cancel x. Numeric keyboard always3 decimals,bounds0..999999, even price mode. Confirm assigns selected field; close encoded.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | unresolved (encoded); U-W7DB208-01 |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 370, "height": 162} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W7DB208-02. Saved position versus opening-mode precedence U-W7DB208-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W7DB208-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Cancelar | Button | {"PT": "Cancelar"} | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"tab": 6, "column": "—"} | [255, 103, 88, 38] | {"anchoring": "<None>", "state": "Active", "button_type": "Abort"} |
| BTN_Confirmar | Button | {"PT": "Confirmar"} | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"tab": 5, "column": "—"} | [26, 103, 88, 38] | {"anchoring": "<None>", "state": "Active", "button_type": "Validate"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"tab": "unresolved (encoded); U-W7DB208-01", "column": "—"} | [140, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| EDT_descricao | Edit control | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": 4, "column": "—"} | [26, 45, 317, 38] | {"anchoring": "<None>", "state": "Active"} |
| EDT_password | Edit control | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 15} | {"tab": 2, "column": "—"} | [26, 45, 317, 38] | {"anchoring": "<None>", "state": "Active"} |
| EDT_quantidade | Edit control | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"input_mask": {"PT": "MoneySystemMask"}, "input_type": "Numeric", "input_size": 0} | {"tab": 3, "column": "—"} | [26, 45, 317, 38] | {"anchoring": "<None>", "state": "Active"} |
| RADTitle | Caption | {"PT": "Titre de la fenŒtre"} | unresolved (encoded); U-W7DB208-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W7DB208-01", "column": "—"} | [9, 4, 221, 18] | {"anchoring": "Width", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"tab": "-1", "column": "—"} | [320, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"tab": "-1", "column": "—"} | [270, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"tab": "-1", "column": "—"} | [296, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"tab": 1, "column": "—"} | [236, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | unresolved (encoded); U-W7DB208-01 | {"tab": "unresolved (encoded); U-W7DB208-01", "column": "—"} | [236, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 255, "y": 103, "width": 88, "height": 38, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7DB208-1000 |
| BTN_Confirmar | {"kind": "Button", "caption": {"PT": "Confirmar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 26, "y": 103, "width": 88, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7DB208-1001 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 140, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W7DB208-1002 |
| EDT_descricao | {"kind": "Edit control", "tab_order": 4, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 26, "y": 45, "width": 317, "height": 38, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7DB208-1003 |
| EDT_password | {"kind": "Edit control", "tab_order": 2, "input_size": 15, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 26, "y": 45, "width": 317, "height": 38, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": true, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7DB208-1004 |
| EDT_quantidade | {"kind": "Edit control", "tab_order": 3, "input_size": 0, "input_mask": {"PT": "MoneySystemMask"}, "anchoring": "<None>", "x": 26, "y": 45, "width": 317, "height": 38, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W7DB208-1005 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Titre de la fenŒtre"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 221, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W7DB208-1006 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 320, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7DB208-1007 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 270, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7DB208-1008 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 296, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W7DB208-1009 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 236, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W7DB208-1010 |
| SCSystemButtons | {"kind": null, "x": 236, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W7DB208-1011 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Inserir_quantidade_password.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-W7DB208-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W7DB208-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-W7DB208-02. |
| Actual field/type edges | U-W7DB208-05; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger. |
| Omitted visual metadata | U-W7DB208-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W7DB208-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W7DB208-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W7DB208-04 |
