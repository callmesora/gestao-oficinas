# Screen spec — WIN_Filtro_Mapas_Tempos

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Filtro_Mapas_Tempos.wdw`, `dossier: WIN_Filtro_Mapas_Tempos`, `docs/mapping/WIN_Filtro_Mapas_Tempos.md`. Step 0 only.

## Contract

Preview labor by order/mechanic/vehicle.

Modes ordem_reparacao plane1, mecanico_descriminado/mecanico_resumo plane2,viatura plane3. Dates today, order1..9999999999. Expand times 00:00:00..23:59:59. Lower nonempty/nonzero choice copies upper. Exact report argument order in ledger.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | unresolved (encoded); U-WA6D3FA-01 |
| window_type | unresolved (encoded); U-WA6D3FA-01 |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 400, "height": 281} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-WA6D3FA-02. Saved position versus opening-mode precedence U-WA6D3FA-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-WA6D3FA-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": "unresolved (encoded); U-WA6D3FA-01", "column": "—"} | [48, -19, 14, 14] | {"anchoring": "<None>", "state": "Active"} |
| BTN_VISION1 | Button | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": 12, "column": "—"} | [257, 51, 42, 24] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_VISION2 | Button | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": 14, "column": "—"} | [257, 81, 42, 24] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_VISION3 | Button | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": 10, "column": "—"} | [230, 81, 42, 24] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_VISION4 | Button | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": 8, "column": "—"} | [230, 51, 42, 24] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Visualizar_impressªo | Button | {"PT": "Visualizar impressªo"} | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": 4, "column": "—"} | [111, 212, 179, 37] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| EDT_Ao_mecanico | Edit control | {"PT": "Ao mecânico"} | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "99"}, "input_type": "Numeric", "input_size": 0} | {"tab": 9, "column": "—"} | [128, 81, 96, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Da_data | Edit control | {"PT": "Da data"} | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "UseSystemMask"}, "input_type": "Date", "input_size": 0} | {"tab": 2, "column": "—"} | [128, 132, 144, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Da_ordem | Edit control | {"PT": "Da ordem"} | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "9999999999"}, "input_type": "Numeric", "input_size": 0} | {"tab": 5, "column": "—"} | [128, 51, 144, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Da_viatura | Edit control | {"PT": "Da viatura"} | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 15} | {"tab": 11, "column": "—"} | [101, 51, 150, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Do_mecanico | Edit control | {"PT": "Do mecânico"} | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "99"}, "input_type": "Numeric", "input_size": 0} | {"tab": 7, "column": "—"} | [128, 51, 96, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_a_data | Edit control | {"PT": "À data"} | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "UseSystemMask"}, "input_type": "Date", "input_size": 0} | {"tab": 3, "column": "—"} | [128, 162, 144, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_a_ordem | Edit control | {"PT": "À ordem"} | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "9999999999"}, "input_type": "Numeric", "input_size": 0} | {"tab": 6, "column": "—"} | [128, 81, 144, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_a_viatura | Edit control | {"PT": "À viatura"} | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 15} | {"tab": 13, "column": "—"} | [101, 81, 150, 24] | {"anchoring": "<None>", "state": "Active"} |
| RADTitle | Caption | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WA6D3FA-01", "column": "—"} | [9, 4, 284, 18] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": "-1", "column": "—"} | [349, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": "-1", "column": "—"} | [299, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": "-1", "column": "—"} | [325, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": 1, "column": "—"} | [265, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": "unresolved (encoded); U-WA6D3FA-01", "column": "—"} | [265, 1, 128, 18] | {"state": "Active"} |
| BTN_Visualizar_impressão | None | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | unresolved (encoded); U-WA6D3FA-01 | {"tab": "unresolved (encoded); U-WA6D3FA-01", "column": "—"} | ["unresolved (encoded); U-WA6D3FA-01", "unresolved (encoded); U-WA6D3FA-01", "unresolved (encoded); U-WA6D3FA-01", "unresolved (encoded); U-WA6D3FA-01"] | unresolved (encoded); U-WA6D3FA-01 |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "<None>", "x": 48, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-WA6D3FA-1000 |
| BTN_VISION1 | {"kind": "Button", "tab_order": 12, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 257, "y": 51, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WA6D3FA-1001 |
| BTN_VISION2 | {"kind": "Button", "tab_order": 14, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 257, "y": 81, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WA6D3FA-1002 |
| BTN_VISION3 | {"kind": "Button", "tab_order": 10, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 230, "y": 81, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WA6D3FA-1003 |
| BTN_VISION4 | {"kind": "Button", "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 230, "y": 51, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WA6D3FA-1004 |
| BTN_Visualizar_impressªo | {"kind": "Button", "caption": {"PT": "Visualizar impressªo"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 111, "y": 212, "width": 179, "height": 37, "row": "Active Normal", "state": "Active", "button_type": "Normal"} | RULE-WA6D3FA-1005 |
| EDT_Ao_mecanico | {"kind": "Edit control", "caption": {"PT": "Ao mecânico"}, "tab_order": 9, "input_size": 0, "input_mask": {"PT": "99"}, "anchoring": "<None>", "x": 128, "y": 81, "width": 96, "height": 24, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-WA6D3FA-1006 |
| EDT_Da_data | {"kind": "Edit control", "caption": {"PT": "Da data"}, "tab_order": 2, "input_size": 0, "input_mask": {"PT": "UseSystemMask"}, "anchoring": "<None>", "x": 128, "y": 132, "width": 144, "height": 24, "row": "Active Date", "state": "Active", "input_type": "Date", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-WA6D3FA-1007 |
| EDT_Da_ordem | {"kind": "Edit control", "caption": {"PT": "Da ordem"}, "tab_order": 5, "input_size": 0, "input_mask": {"PT": "9999999999"}, "anchoring": "<None>", "x": 128, "y": 51, "width": 144, "height": 24, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-WA6D3FA-1008 |
| EDT_Da_viatura | {"kind": "Edit control", "caption": {"PT": "Da viatura"}, "tab_order": 11, "input_size": 15, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 101, "y": 51, "width": 150, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": false, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-WA6D3FA-1009 |
| EDT_Do_mecanico | {"kind": "Edit control", "caption": {"PT": "Do mecânico"}, "tab_order": 7, "input_size": 0, "input_mask": {"PT": "99"}, "anchoring": "<None>", "x": 128, "y": 51, "width": 96, "height": 24, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-WA6D3FA-1010 |
| EDT_a_data | {"kind": "Edit control", "caption": {"PT": "À data"}, "tab_order": 3, "input_size": 0, "input_mask": {"PT": "UseSystemMask"}, "anchoring": "<None>", "x": 128, "y": 162, "width": 144, "height": 24, "row": "Active Date", "state": "Active", "input_type": "Date", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-WA6D3FA-1011 |
| EDT_a_ordem | {"kind": "Edit control", "caption": {"PT": "À ordem"}, "tab_order": 6, "input_size": 0, "input_mask": {"PT": "9999999999"}, "anchoring": "<None>", "x": 128, "y": 81, "width": 144, "height": 24, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-WA6D3FA-1012 |
| EDT_a_viatura | {"kind": "Edit control", "caption": {"PT": "À viatura"}, "tab_order": 13, "input_size": 15, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 101, "y": 81, "width": 150, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": false, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-WA6D3FA-1013 |
| RADTitle | {"kind": "Caption", "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 9, "y": 4, "width": 284, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WA6D3FA-1014 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 349, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WA6D3FA-1015 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 299, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WA6D3FA-1016 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 325, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WA6D3FA-1017 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 265, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-WA6D3FA-1018 |
| SCSystemButtons | {"kind": null, "x": 265, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-WA6D3FA-1019 |
| BTN_Visualizar_impressão | {"kind": null, "flags": {"Visible": true, "TAB Key": true}} | RULE-WA6D3FA-1020 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Filtro_Mapas_Tempos.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-WA6D3FA-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-WA6D3FA-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-WA6D3FA-02. |
| Actual field/type edges | U-WA6D3FA-05; date/time masks, blank/zero datetime values and workstation locale/time interpretation. |
| Omitted visual metadata | U-WA6D3FA-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-WA6D3FA-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-WA6D3FA-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-WA6D3FA-04 |
