# Screen spec — WIN_Tempos_Reparacao_Tempo

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw`, `dossier: WIN_Tempos_Reparacao_Tempo`, `docs/mapping/WIN_Tempos_Reparacao_Tempo.md`. Step 0 only.

## Contract

Authenticate mechanic and start/finish labor.

Entry(number,mechanic) loads order/vehicle/mechanic; latest labor row all-zero finish sets caption Finalizar else Iniciar. Selector/password caches active mechanic and recalculates latest caption. Start action first authenticates; blank/wrong password rejects. Iterates other open work for active mechanic and asks Terminar a reparação de <plate> ?; Yes closes that other order's open labor with SysDateTime() and that other order's reparacao_estado,No continues without closing or blocking new work. Current order latest open row gets finish now; otherwise state type3/4/5 permits insert. Other state types open WIN_Table_estado_reparacao_tipo3,whose choices include types3/4/5; cancelar aborts,else updates order state then inserts labor. Insert Inicio_reparacao_estado still reads earlier order query buffer,not reexecuted after state UPDATE,so can retain old state. No transaction/locks/checked writes. Encoded button action closes after completed code only as assumption.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Tempo"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 307, "height": 312} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W6D3B26-02. Saved position versus opening-mode precedence U-W6D3B26-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W6D3B26-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Cancelar | Button | {"PT": "Cancelar"} | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": 6, "column": "—"} | [105, 246, 102, 42] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Iniciar | Button | {"PT": "Iniciar"} | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": 5, "column": "—"} | [83, 170, 147, 55] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_NoName1 | Button | {"PT": "..."} | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": 4, "column": "—"} | [216, 117, 59, 32] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": "unresolved (encoded); U-W6D3B26-01", "column": "—"} | [77, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| EDT_matricula_marca_modelo | Edit control | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": 2, "column": "—"} | [38, 51, 237, 56] | {"anchoring": "<None>", "state": "Read-only"} |
| EDT_mecanico | Edit control | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": 3, "column": "—"} | [38, 117, 172, 32] | {"anchoring": "<None>", "state": "Read-only"} |
| RADTitle | Caption | {"PT": "Tempo"} | unresolved (encoded); U-W6D3B26-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W6D3B26-01", "column": "—"} | [9, 4, 158, 18] | {"anchoring": "Width", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": "-1", "column": "—"} | [257, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": "-1", "column": "—"} | [207, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": "-1", "column": "—"} | [233, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": 1, "column": "—"} | [173, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | unresolved (encoded); U-W6D3B26-01 | {"tab": "unresolved (encoded); U-W6D3B26-01", "column": "—"} | [173, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 105, "y": 246, "width": 102, "height": 42, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W6D3B26-1000 |
| BTN_Iniciar | {"kind": "Button", "caption": {"PT": "Iniciar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 83, "y": 170, "width": 147, "height": 55, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W6D3B26-1001 |
| BTN_NoName1 | {"kind": "Button", "caption": {"PT": "..."}, "tab_order": 4, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 216, "y": 117, "width": 59, "height": 32, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W6D3B26-1002 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 77, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W6D3B26-1003 |
| EDT_matricula_marca_modelo | {"kind": "Edit control", "tab_order": 2, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 38, "y": 51, "width": 237, "height": 56, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": true, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": false, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": true, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W6D3B26-1004 |
| EDT_mecanico | {"kind": "Edit control", "tab_order": 3, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 38, "y": 117, "width": 172, "height": 32, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W6D3B26-1005 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Tempo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 158, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W6D3B26-1006 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 257, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W6D3B26-1007 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 207, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W6D3B26-1008 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 233, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W6D3B26-1009 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 173, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W6D3B26-1010 |
| SCSystemButtons | {"kind": null, "x": 173, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W6D3B26-1011 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Tempos_Reparacao_Tempo.md. Title/default/Esc/language: U-W6D3B26-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W6D3B26-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | U-W6D3B26-03 |
| Local message shell/resource wiring | U-W6D3B26-04 |
| Actual field/type edges | U-W6D3B26-05; date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-W6D3B26-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W6D3B26-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W6D3B26-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:256 | "Palavra-passe incorreta" | Info | U-W6D3B26-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:316 | "Palavra-passe incorreta" | Info | U-W6D3B26-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:321 | "Palavra-passe incorreta" | Info | U-W6D3B26-04; exact branch result in mapping event ledger |
| legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Tempo.wdw:336 | 0 | YesNo | U-W6D3B26-04; exact branch result in mapping event ledger |

## Initial target checkpoint

The initial target is `src/ui/repair-labor.tsx::RepairLaborTimeDialog`, using the actual `RepairMaterialPrompt` password child and `RepairLaborStatePicker`. Volatile proof is server checked again at mutation, and the plan baseline is rechecked after consent/state dialogs. Start/finish/other-order consent and the old query-buffer start-state behavior are implemented under ADR002/004/006. Browser/native/visual and U gates remain open; no parity rows are promoted. Non-legacy diagnostics/frame helpers use `repair-labor-time-*`.
