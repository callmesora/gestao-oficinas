# Screen spec — WIN_sistema

Evidence `legacy/GestaoOficinas_TesteIA/WIN_sistema.wdw`, `dossier: WIN_sistema`, `docs/mapping/WIN_sistema.md`. Source inventory plus scoped target implementation proof.

## Contract

Edit singleton workshop refresh and closure configuration.

Entry reads first sistema record into three refresh controls,lookback days and two closure times. Guardar rereads first; HModify existing or HAdd when none,assigning exactly same six values. No explicit validation,transaction,return checking or multirow guard. Existing refresh windows create timers at their own entry,so changed interval does not explicitly recreate active timers; labor updater rereads closure times each refresh. Save close is encoded assumed.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Sistema"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 366, "height": 350} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W3BC89B-02. Saved position versus opening-mode precedence U-W3BC89B-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W3BC89B-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Cancelar | Button | {"PT": "Cancelar"} | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"tab": 9, "column": "—"} | [185, 284, 96, 45] | {"anchoring": "Right", "state": "Active", "button_type": "Normal"} |
| BTN_Guardar | Button | {"PT": "Guardar"} | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"tab": 8, "column": "—"} | [83, 284, 96, 45] | {"anchoring": "Right", "state": "Active", "button_type": "Normal"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"tab": "unresolved (encoded); U-W3BC89B-01", "column": "—"} | [136, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| EDT_Atualizacao_materiais | Edit control | {"PT": "Atualizaçªo materiais (segundos)"} | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "9999999999"}, "input_type": "Numeric", "input_size": 0} | {"tab": 3, "column": "—"} | [32, 90, 300, 25] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Atualizacao_ordens_reparacao | Edit control | {"PT": "Atualizaçªo ordens de reparaçªo (segundos)"} | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "9999999999"}, "input_size": 0} | {"tab": 2, "column": "—"} | ["unresolved (encoded); U-W3BC89B-01", "unresolved (encoded); U-W3BC89B-01", "unresolved (encoded); U-W3BC89B-01", "unresolved (encoded); U-W3BC89B-01"] | {"anchoring": "<None>"} |
| EDT_Atualizacao_tempos | Edit control | {"PT": "Atualizaçªo tempos (segundos)"} | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "9999999999"}, "input_type": "Numeric", "input_size": 0} | {"tab": 4, "column": "—"} | [32, 132, 300, 25] | {"anchoring": "<None>", "state": "Active"} |
| EDT_Data_inicio | Edit control | {"PT": "Mostrar movimentos atØ dias anteriores"} | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "999"}, "input_type": "Numeric", "input_size": 0} | {"tab": 5, "column": "—"} | [32, 174, 300, 25] | {"anchoring": "<None>", "state": "Active"} |
| EDT_encerrar_tempos_1 | Edit control | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "HH:MM:SS"}, "input_type": "Time", "input_size": 0} | {"tab": 6, "column": "—"} | [32, 242, 63, 25] | {"anchoring": "Right", "state": "Active"} |
| EDT_encerrar_tempos_2 | Edit control | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "HH:MM:SS"}, "input_type": "Time", "input_size": 0} | {"tab": 7, "column": "—"} | [120, 242, 63, 25] | {"anchoring": "Right", "state": "Active"} |
| RADTitle | Caption | {"PT": "Sistema"} | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W3BC89B-01", "column": "—"} | [9, 4, 217, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_E | Caption | {"PT": "e"} | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W3BC89B-01", "column": "—"} | [102, 242, 13, 25] | {"anchoring": "Right", "state": "Active"} |
| STC_Encerrar_tempos_automaticamente_a | Caption | {"PT": "Encerrar tempos automaticamente a partir das:"} | unresolved (encoded); U-W3BC89B-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W3BC89B-01", "column": "—"} | [32, 214, 249, 25] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"tab": "-1", "column": "—"} | [316, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"tab": "-1", "column": "—"} | [266, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"tab": "-1", "column": "—"} | [292, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"tab": 1, "column": "—"} | [232, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | unresolved (encoded); U-W3BC89B-01 | {"tab": "unresolved (encoded); U-W3BC89B-01", "column": "—"} | [232, 1, 128, 18] | {"state": "Active"} |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 9, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 185, "y": 284, "width": 96, "height": 45, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W3BC89B-1000 |
| BTN_Guardar | {"kind": "Button", "caption": {"PT": "Guardar"}, "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 83, "y": 284, "width": 96, "height": 45, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W3BC89B-1001 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 136, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W3BC89B-1002 |
| EDT_Atualizacao_materiais | {"kind": "Edit control", "caption": {"PT": "Atualizaçªo materiais (segundos)"}, "tab_order": 3, "input_size": 0, "input_mask": {"PT": "9999999999"}, "anchoring": "<None>", "x": 32, "y": 90, "width": 300, "height": 25, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W3BC89B-1003 |
| EDT_Atualizacao_ordens_reparacao | {"kind": "Edit control", "caption": {"PT": "Atualizaçªo ordens de reparaçªo (segundos)"}, "tab_order": 2, "input_size": 0, "input_mask": {"PT": "9999999999"}, "anchoring": "<None>", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W3BC89B-1004 |
| EDT_Atualizacao_tempos | {"kind": "Edit control", "caption": {"PT": "Atualizaçªo tempos (segundos)"}, "tab_order": 4, "input_size": 0, "input_mask": {"PT": "9999999999"}, "anchoring": "<None>", "x": 32, "y": 132, "width": 300, "height": 25, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W3BC89B-1005 |
| EDT_Data_inicio | {"kind": "Edit control", "caption": {"PT": "Mostrar movimentos atØ dias anteriores"}, "tab_order": 5, "input_size": 0, "input_mask": {"PT": "999"}, "anchoring": "<None>", "x": 32, "y": 174, "width": 300, "height": 25, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W3BC89B-1006 |
| EDT_encerrar_tempos_1 | {"kind": "Edit control", "tab_order": 6, "input_size": 0, "input_mask": {"PT": "HH:MM:SS"}, "anchoring": "Right", "x": 32, "y": 242, "width": 63, "height": 25, "row": "Active Time", "state": "Active", "input_type": "Time", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W3BC89B-1007 |
| EDT_encerrar_tempos_2 | {"kind": "Edit control", "tab_order": 7, "input_size": 0, "input_mask": {"PT": "HH:MM:SS"}, "anchoring": "Right", "x": 120, "y": 242, "width": 63, "height": 25, "row": "Active Time", "state": "Active", "input_type": "Time", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W3BC89B-1008 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Sistema"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 217, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W3BC89B-1009 |
| STC_E | {"kind": "Caption", "caption": {"PT": "e"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Right", "x": 102, "y": 242, "width": 13, "height": 25, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W3BC89B-1010 |
| STC_Encerrar_tempos_automaticamente_a | {"kind": "Caption", "caption": {"PT": "Encerrar tempos automaticamente a partir das:"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 32, "y": 214, "width": 249, "height": 25, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W3BC89B-1011 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 316, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W3BC89B-1012 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 266, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W3BC89B-1013 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 292, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W3BC89B-1014 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 232, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W3BC89B-1015 |
| SCSystemButtons | {"kind": null, "x": 232, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W3BC89B-1016 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_sistema.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-W3BC89B-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W3BC89B-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | U-W3BC89B-03 |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-W3BC89B-02. |
| Actual field/type edges | U-W3BC89B-05; date/time masks, blank/zero datetime values and workstation locale/time interpretation; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-W3BC89B-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W3BC89B-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W3BC89B-01.
- Resolve only the applicable U-items above before claiming runtime parity; executed target checks below do not resolve the remaining native/source U items.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W3BC89B-04 |

## Current implementation and executed proof

`SystemDialog` and protected startup read/save operations use the first internal sistema row under the explicit ADR006 target fallback. `SRC-d9a33f8b29` is verified for its write contract: reread first; assign exactly the six source values; create when missing; preserve all other rows and untouched raw/NULL data; report committed success only. Real PostgreSQL assertions in `apps/server/src/operations/startup.test.ts` compare all six exact values, including maximum-size integer text, NULL, opaque time and retained second-row data, then inject failure to prove rollback. `ui-check/startup.flows.spec.ts` opens the actual system menu/editor, saves interval/time, reopens and retains a value beyond JavaScript integer precision. Atomic failure behavior is an approved ADR006 target difference, not captured source rollback behavior.

`SRC-9890c46def` remains implemented: actual first-row/missing reads and an actual dialog interval are asserted, but all six UI assignments are not individually exercised. Edited time validation and integer-mask presentation follow ADR002/003; no native mask/coercion or undefined buffer outcome is claimed. Active windows retain their original timer lifetime; neither read nor save restarts those windows.

Separately, the service factory performs the six empty-file source defaults before access under ADR004. Real PostgreSQL and `ui-check/startup-system.flows.spec.ts` assert source15/15/15/7/030000/030000, no account/credential creation, anonymous denial, persistence after access Cancel and no duplication on service restart. This supports the menu global checkpoint; it does not verify its remaining startup branches.

The executed browser paths and focused PostgreSQL checks passed on macOS arm64, root e7d26c7 plus integration tree. U01/U02/U03/U05, all encoded actions and native Windows acceptance stay open. `system-diagnostic` and helper names are target-only identities; generated legacy control IDs remain unchanged. The five AGENTS criteria were checked for the save contract and current decisions re-read at stage end.
