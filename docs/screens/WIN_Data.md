# Screen spec — WIN_Data

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Data.wdw`, `dossier: WIN_Data`, `docs/mapping/WIN_Data.md`. Source contract; target implementation scope below.

## Contract

Return prompted date.

Entry(gTitulo,gData) sets label, date and ReturnedValue=gData; Confirm assigns EDT_Data. Cancel retains original date; close depends on encoded action.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | unresolved (encoded); U-W16C5A7-01 |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 199, "height": 173} |
| close_icon | No |
| flags | {"Visible": true, "Title bar": false, "System menu": false, "Minimize icon": false, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": false, "Save position": false, "Automatic Scrollbar": false, "Large font management": false, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W16C5A7-02. Saved position versus opening-mode precedence U-W16C5A7-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W16C5A7-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Confirmar | Button | {"PT": "Confirmar"} | unresolved (encoded); U-W16C5A7-01 | unresolved (encoded); U-W16C5A7-01 | {"tab": 2, "column": "—"} | [42, 114, 114, 38] | {"anchoring": "Right, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W16C5A7-01 | unresolved (encoded); U-W16C5A7-01 | {"tab": "unresolved (encoded); U-W16C5A7-01", "column": "—"} | [-31, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| EDT_Data | Edit control | unresolved (encoded); U-W16C5A7-01 | unresolved (encoded); U-W16C5A7-01 | {"input_mask": {"PT": "UseSystemMask"}, "input_type": "Date", "input_size": 0} | {"tab": 1, "column": "—"} | [49, 74, 100, 27] | {"anchoring": "<None>", "state": "Active"} |
| RADTitle | Caption | unresolved (encoded); U-W16C5A7-01 | unresolved (encoded); U-W16C5A7-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W16C5A7-01", "column": "—"} | [9, 4, 50, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_Data | Caption | unresolved (encoded); U-W16C5A7-01 | unresolved (encoded); U-W16C5A7-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W16C5A7-01", "column": "—"} | [19, 36, 161, 28] | {"anchoring": "<None>", "state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Confirmar | {"kind": "Button", "caption": {"PT": "Confirmar"}, "tab_order": 2, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right, height and width", "x": 42, "y": 114, "width": 114, "height": 38, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W16C5A7-1000 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": -31, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W16C5A7-1001 |
| EDT_Data | {"kind": "Edit control", "tab_order": 1, "input_size": 0, "input_mask": {"PT": "UseSystemMask"}, "anchoring": "<None>", "x": 49, "y": 74, "width": 100, "height": 27, "row": "Active Date", "state": "Active", "input_type": "Date", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W16C5A7-1002 |
| RADTitle | {"kind": "Caption", "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 50, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W16C5A7-1003 |
| STC_Data | {"kind": "Caption", "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 36, "width": 161, "height": 28, "row": "Active Center Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W16C5A7-1004 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Data.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-W16C5A7-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W16C5A7-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-W16C5A7-02. |
| Actual field/type edges | U-W16C5A7-05; date/time masks, blank/zero datetime values and workstation locale/time interpretation. |
| Omitted visual metadata | U-W16C5A7-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W16C5A7-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W16C5A7-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W16C5A7-04 |

## MIG-7M.1 implementation scope

`src/ui/date-prompt.tsx` implements the exact runtime prompt/original-on-cancel/Confirm return using shared WdModal/WdRadControls/WdDateEdit. ADR002/003/006 separate raw nullable original, pt-PT display and lifetime editing: untouched Confirm preserves raw anomalies; deliberate blank returns empty, zero returns00000000, valid Gregorian dates returnAAAAMMJJ. Invalid edits block without a new Info/required rule. A native calendar is a separate ISO adapter, never a raw-value binding; actual partial segments and partial→keyboard-clear retain their proper invalid/edited-empty distinction. Opening/navigation/dismissal alone preserve the original. Normal text Enter retains the dialog; Tab date1→Confirm2 and conservative cancel are explicit target defaults/U02.

Generated199×173 geometry, Right date, Center/Center runtime caption and source Normal button remain. No source Cancel/three chrome controls exist; no drag/resize/persisted position. The offcanvas restore remains specified, while native popup appearance/keyboard/mask/Calculator behavior remains U01/02/05. Browser results cannot establish WKWebView/WebView2/legacy or human acceptance. Actual repair save/date-time persistence is separate and cancellation does not abort that caller save.

Non-legacy demonstration IDs: date-prompt-launcher/open/frame/restore/returned/returned-kind; workflow=date-prompt; fixture title/value/kind URL arguments only. Calendar adapter IDs append __calendar/__calendar-input to the actual EDT_Data. Golden GS-DATE-001 is source-derived UI evidence only; no local database scenario exists. Delivery/checks/reviews are recorded in stage-23-date-prompt.md and reviews/date-prompt.md; no verified/whole-window promotion.
