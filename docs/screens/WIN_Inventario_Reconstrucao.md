# Screen spec — WIN_Inventario_Reconstrucao

Evidence `legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw`, `dossier: WIN_Inventario_Reconstrucao`, `docs/mapping/WIN_Inventario_Reconstrucao.md`. Step 0 only.

## Contract

Reconstruct stock before inventory.

Matches WIN_Reconstrucao_Stocks: zero all; movement1 plus,2 minus; subtract repair material; update each article. HFound incorrectly names line query after document seek. Menu opens inventory afterward without inspecting result. No transaction or checks.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Reconstruçªo de Stocks"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 318, "height": 192} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-WB2F707-02. Saved position versus opening-mode precedence U-WB2F707-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-WB2F707-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Reconstruir | Button | {"PT": "Sim"} | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | {"tab": 2, "column": "—"} | [34, 118, 117, 48] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Reconstruir1 | Button | {"PT": "Nªo"} | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | {"tab": 3, "column": "—"} | [164, 118, 117, 48] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | {"tab": "unresolved (encoded); U-WB2F707-01", "column": "—"} | [88, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| RADTitle | Caption | {"PT": "Reconstruçªo de Stocks"} | unresolved (encoded); U-WB2F707-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WB2F707-01", "column": "—"} | [9, 4, 191, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_reconstrucao_stocks | Caption | {"PT": "É aconselhada a reconstruçªo dos stocks."} | unresolved (encoded); U-WB2F707-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-WB2F707-01", "column": "—"} | [19, 36, 287, 79] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | {"tab": "-1", "column": "—"} | [268, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | {"tab": "-1", "column": "—"} | [218, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | {"tab": "-1", "column": "—"} | [244, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | {"tab": 1, "column": "—"} | [184, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | unresolved (encoded); U-WB2F707-01 | {"tab": "unresolved (encoded); U-WB2F707-01", "column": "—"} | [184, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Reconstruir | {"kind": "Button", "caption": {"PT": "Sim"}, "tab_order": 2, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 34, "y": 118, "width": 117, "height": 48, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WB2F707-1000 |
| BTN_Reconstruir1 | {"kind": "Button", "caption": {"PT": "Nªo"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 164, "y": 118, "width": 117, "height": 48, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-WB2F707-1001 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 88, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-WB2F707-1002 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Reconstruçªo de Stocks"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 191, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WB2F707-1003 |
| STC_reconstrucao_stocks | {"kind": "Caption", "caption": {"PT": "É aconselhada a reconstruçªo dos stocks."}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 36, "width": 287, "height": 79, "row": "Active Center Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-WB2F707-1004 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 268, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WB2F707-1005 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 218, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WB2F707-1006 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 244, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-WB2F707-1007 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 184, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-WB2F707-1008 |
| SCSystemButtons | {"kind": null, "x": 184, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-WB2F707-1009 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Inventario_Reconstrucao.md. Title/default/Esc/language: U-WB2F707-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-WB2F707-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | U-WB2F707-03 |
| Local message shell/resource wiring | U-WB2F707-04 |
| Actual field/type edges | U-WB2F707-05; quantity/price/stock/duration formulas and numeric-to-text rounding/coercion actually used in the ledger; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-WB2F707-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-WB2F707-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-WB2F707-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_inventario_Reconstrucao.wdw:259 | "Reconstrução terminada" | Info | U-WB2F707-04; exact branch result in mapping event ledger |


## Initial MIG11 implementation and retained gaps

Initial implementation reuses the actual protected rebuild operation and source success Info before close; Não/chrome closure continue into inventory because the source menu ignores the dialog result. Source JPG supplies the full two-line advisory and Sim/Não captions. The underlying arithmetic is the WIN_Reconstrucao_Stocks operation.

U-WB2F707-03/05: ADR006 refuses before zeroing stock if movement document lookup is missing/ambiguous/empty or quantity is NULL; no unknown HFSQL buffer/coercion is guessed. All supported quantities rebuild atomically with rollback on failure. Native/designer/message-shell U01/02/04 remain open.
