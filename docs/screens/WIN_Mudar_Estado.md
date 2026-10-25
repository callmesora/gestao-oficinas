# Screen spec — WIN_Mudar_Estado

## Target implementation — MIG-10P.1

The reusable `RepairStateConfirmationDialog` consumes the generated layout through WdModal/WdRadControls, including actual Center letter and Center/Center runtime prompt. Source default result0, leading case-insensitive comparison, exact awaited Info and success1 are explicit; no trim/accent folding or draft conversion. ADR003/006 retain assumed focus/keys/message title and conservative empty-prefix/NULL refusal under existing U items. Normal edit Enter does not auto-confirm; nested Info owns focus and parent close stays guarded. Custom minimize/maximize preserve the mounted draft; no resize/saved geometry. Actual repair running-labor/restore continuation remains its consuming stage.

Non-legacy development IDs: repair-confirmation-launcher/open, repair-confirmation-frame/restore and repair-confirmation-returned/returned-kind. They demonstrate typed numeric returns, not a migrated repair caller. GS-STATE-CONFIRM-001 is spec-derived UI evidence only; this source has no local data/write path. Stage22 records executed checks and retained native/runtime/human/UMC gates; no whole-window or verified promotion.

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw`, `dossier: WIN_Mudar_Estado`, `docs/mapping/WIN_Mudar_Estado.md`. Step 0 only.

## Contract

Confirm state via leading character.

Entry displays target state and result0. Confirm StringStartsWith(estado,EDT_Letra,ccignorecase); failure Verifique o carater de validação; success result1 and assumed encoded close. Empty text requires golden case.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | unresolved (encoded); U-W20AB1F-01 |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 302, "height": 186} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": false, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": false, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": false, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W20AB1F-02. Saved position versus opening-mode precedence U-W20AB1F-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W20AB1F-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Cancelar | Button | {"PT": "Cancelar"} | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"tab": 4, "column": "—"} | [154, 120, 129, 45] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Confirmar | Button | {"PT": "Confirmar"} | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"tab": 3, "column": "—"} | [19, 120, 129, 45] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"tab": "unresolved (encoded); U-W20AB1F-01", "column": "—"} | [72, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| EDT_Letra | Edit control | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 1} | {"tab": 2, "column": "—"} | [140, 85, 23, 27] | {"anchoring": "<None>", "state": "Active"} |
| RADTitle | Caption | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W20AB1F-01", "column": "—"} | [9, 4, 153, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_Titulo | Caption | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W20AB1F-01", "column": "—"} | [31, 39, 240, 37] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"tab": "-1", "column": "—"} | [252, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"tab": "-1", "column": "—"} | [202, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"tab": "-1", "column": "—"} | [228, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"tab": 1, "column": "—"} | [168, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | unresolved (encoded); U-W20AB1F-01 | {"tab": "unresolved (encoded); U-W20AB1F-01", "column": "—"} | [168, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 154, "y": 120, "width": 129, "height": 45, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W20AB1F-1000 |
| BTN_Confirmar | {"kind": "Button", "caption": {"PT": "Confirmar"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 19, "y": 120, "width": 129, "height": 45, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W20AB1F-1001 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 72, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W20AB1F-1002 |
| EDT_Letra | {"kind": "Edit control", "tab_order": 2, "input_size": 1, "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 140, "y": 85, "width": 23, "height": 27, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W20AB1F-1003 |
| RADTitle | {"kind": "Caption", "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 153, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W20AB1F-1004 |
| STC_Titulo | {"kind": "Caption", "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 31, "y": 39, "width": 240, "height": 37, "row": "Active Center Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W20AB1F-1005 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 252, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W20AB1F-1006 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 202, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W20AB1F-1007 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 228, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W20AB1F-1008 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 168, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W20AB1F-1009 |
| SCSystemButtons | {"kind": null, "x": 168, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W20AB1F-1010 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Mudar_Estado.md. Title/default/Esc/language: U-W20AB1F-04; explicit result values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W20AB1F-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | Not applicable locally; complete source contains none of these operations. |
| Local message shell/resource wiring | U-W20AB1F-04 |
| Actual field/type edges | U-W20AB1F-05; text length/mask/whitespace/accents and control-to-return coercion for the actual inputs. |
| Omitted visual metadata | U-W20AB1F-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W20AB1F-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W20AB1F-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| legacy/GestaoOficinas_TesteIA/WIN_Mudar_Estado.wdw:199 | "Verifique o carater de validação" | Info | U-W20AB1F-04; exact branch result in mapping event ledger |

## Target implementation and actual repair caller

`src/ui/repair-state-confirmation.tsx::RepairStateConfirmationDialog` preserves the exact runtime prompt, unchanged leading-prefix comparison, awaited source Info, numeric1 confirmation and numeric0 cancellation. The actual repair form restores its opening state on refusal/cancellation and resumes with the chosen state after confirmation. Custom close/minimize/maximize use the recorded proposals and preserve the mounted draft. The per-unit CSV links positive standalone and actual repair cases; empty/NULL fallback, native key/locale/message shell and whole-designer U gates remain open under ADR003/006.
