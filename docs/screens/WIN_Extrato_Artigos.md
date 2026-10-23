# Screen spec — WIN_Extrato_Artigos

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Extrato_Artigos.wdw`, `dossier: WIN_Extrato_Artigos`, `docs/mapping/WIN_Extrato_Artigos.md`. Step 0 only.

## Contract

Preview article statement.

Both dates start today, upper article zzzzzzzzzz. Nonempty lower picker copies to upper. Preview expands dates to 00:00:00 and 23:59:59; initializes report with date/article bounds and passes start date to report. No reversed-range guard.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Extrato de Artigos"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 370, "height": 262} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W13F458-02. Saved position versus opening-mode precedence U-W13F458-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W13F458-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": "unresolved (encoded); U-W13F458-01", "column": "—"} | [140, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| BTN_VISION3 | Button | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": 7, "column": "—"} | [296, 159, 42, 24] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_VISION4 | Button | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": 5, "column": "—"} | [296, 129, 42, 24] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Visualizar_impressªo | Button | {"PT": "Visualizar impressªo"} | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": 8, "column": "—"} | [99, 204, 179, 37] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| EDT_Ao_artigo | Edit control | {"PT": "Ao artigo"} | unresolved (encoded); U-W13F458-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 30} | {"tab": 6, "column": "—"} | [36, 159, 254, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Da_data | Edit control | {"PT": "Da data"} | unresolved (encoded); U-W13F458-01 | {"input_mask": {"PT": "UseSystemMask"}, "input_type": "Date", "input_size": 0} | {"tab": 2, "column": "—"} | [36, 48, 144, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Do_artigo | Edit control | {"PT": "Do artigo"} | unresolved (encoded); U-W13F458-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 30} | {"tab": 4, "column": "—"} | [36, 129, 254, 24] | {"anchoring": "<None>", "state": "Active"} |
| EDT_a_data | Edit control | {"PT": "À data"} | unresolved (encoded); U-W13F458-01 | {"input_mask": {"PT": "UseSystemMask"}, "input_type": "Date", "input_size": 0} | {"tab": 3, "column": "—"} | [36, 78, 144, 24] | {"anchoring": "<None>", "state": "Active"} |
| RADTitle | Caption | {"PT": "Extrato de Artigos"} | unresolved (encoded); U-W13F458-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W13F458-01", "column": "—"} | [9, 4, 221, 18] | {"anchoring": "Width", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": "-1", "column": "—"} | [320, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": "-1", "column": "—"} | [270, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": "-1", "column": "—"} | [296, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": 1, "column": "—"} | [236, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": "unresolved (encoded); U-W13F458-01", "column": "—"} | [236, 1, 128, 18] | {"state": "Active"} |
| BTN_Visualizar_impressão | None | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | unresolved (encoded); U-W13F458-01 | {"tab": "unresolved (encoded); U-W13F458-01", "column": "—"} | ["unresolved (encoded); U-W13F458-01", "unresolved (encoded); U-W13F458-01", "unresolved (encoded); U-W13F458-01", "unresolved (encoded); U-W13F458-01"] | unresolved (encoded); U-W13F458-01 |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 140, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W13F458-1000 |
| BTN_VISION3 | {"kind": "Button", "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 296, "y": 159, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W13F458-1001 |
| BTN_VISION4 | {"kind": "Button", "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 296, "y": 129, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W13F458-1002 |
| BTN_Visualizar_impressªo | {"kind": "Button", "caption": {"PT": "Visualizar impressªo"}, "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 99, "y": 204, "width": 179, "height": 37, "row": "Active Normal", "state": "Active", "button_type": "Normal"} | RULE-W13F458-1003 |
| EDT_Ao_artigo | {"kind": "Edit control", "caption": {"PT": "Ao artigo"}, "tab_order": 6, "input_size": 30, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 36, "y": 159, "width": 254, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": false, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W13F458-1004 |
| EDT_Da_data | {"kind": "Edit control", "caption": {"PT": "Da data"}, "tab_order": 2, "input_size": 0, "input_mask": {"PT": "UseSystemMask"}, "anchoring": "<None>", "x": 36, "y": 48, "width": 144, "height": 24, "row": "Active Date", "state": "Active", "input_type": "Date", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W13F458-1005 |
| EDT_Do_artigo | {"kind": "Edit control", "caption": {"PT": "Do artigo"}, "tab_order": 4, "input_size": 30, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 36, "y": 129, "width": 254, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": false, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W13F458-1006 |
| EDT_a_data | {"kind": "Edit control", "caption": {"PT": "À data"}, "tab_order": 3, "input_size": 0, "input_mask": {"PT": "UseSystemMask"}, "anchoring": "<None>", "x": 36, "y": 78, "width": 144, "height": 24, "row": "Active Date", "state": "Active", "input_type": "Date", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W13F458-1007 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Extrato de Artigos"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 221, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W13F458-1008 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 320, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W13F458-1009 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 270, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W13F458-1010 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 296, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W13F458-1011 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 236, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W13F458-1012 |
| SCSystemButtons | {"kind": null, "x": 236, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W13F458-1013 |
| BTN_Visualizar_impressão | {"kind": null, "flags": {"Visible": true, "TAB Key": true}} | RULE-W13F458-1014 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Extrato_Artigos.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-W13F458-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W13F458-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-W13F458-02. |
| Actual field/type edges | U-W13F458-05; date/time masks, blank/zero datetime values and workstation locale/time interpretation. |
| Omitted visual metadata | U-W13F458-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W13F458-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W13F458-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W13F458-04 |
