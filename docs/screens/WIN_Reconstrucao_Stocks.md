# Screen spec — WIN_Reconstrucao_Stocks

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw`, `dossier: WIN_Reconstrucao_Stocks`, `docs/mapping/WIN_Reconstrucao_Stocks.md`. Step 0 only.

## Contract

Reconstruct all article stock.

Zero every article/write first. Per article sum lin_stocks: document stock1 adds,2 subtracts,other no effect; subtract every repair material regardless launched/extra. Example10-3-2=5. HFound checks line query after seeking document query; missing document may reuse buffer. No transaction,rollback or write checks. Shows Reconstrução terminada then closes.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Reconstruçªo de Stocks"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 285, "height": 173} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W541EAA-02. Saved position versus opening-mode precedence U-W541EAA-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W541EAA-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Reconstruir | Button | {"PT": "Reconstruir"} | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | {"tab": 2, "column": "—"} | [69, 64, 149, 64] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | {"tab": "unresolved (encoded); U-W541EAA-01", "column": "—"} | [55, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| RADTitle | Caption | {"PT": "Reconstruçªo de Stocks"} | unresolved (encoded); U-W541EAA-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W541EAA-01", "column": "—"} | [9, 4, 169, 18] | {"anchoring": "Width", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | {"tab": "-1", "column": "—"} | [235, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | {"tab": "-1", "column": "—"} | [185, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | {"tab": "-1", "column": "—"} | [211, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | {"tab": 1, "column": "—"} | [151, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | unresolved (encoded); U-W541EAA-01 | {"tab": "unresolved (encoded); U-W541EAA-01", "column": "—"} | [151, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Reconstruir | {"kind": "Button", "caption": {"PT": "Reconstruir"}, "tab_order": 2, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 69, "y": 64, "width": 149, "height": 64, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W541EAA-1000 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 55, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W541EAA-1001 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Reconstruçªo de Stocks"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 169, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W541EAA-1002 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 235, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W541EAA-1003 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 185, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W541EAA-1004 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 211, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W541EAA-1005 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 151, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W541EAA-1006 |
| SCSystemButtons | {"kind": null, "x": 151, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W541EAA-1007 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Reconstrucao_Stocks.md. Title/default/Esc/language: U-W541EAA-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W541EAA-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | U-W541EAA-03 |
| Local message shell/resource wiring | U-W541EAA-04 |
| Actual field/type edges | U-W541EAA-05; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-W541EAA-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W541EAA-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W541EAA-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_Reconstrucao_Stocks.wdw:259 | "Reconstrução terminada" | Info | U-W541EAA-04; exact branch result in mapping event ledger |
