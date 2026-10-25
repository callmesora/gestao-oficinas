# Screen spec — WIN_Tempos_Reparacao_Informacao

Evidence `legacy/GestaoOficinas_TesteIA/WIN_Tempos_Reparacao_Informacao.wdw`, `dossier: WIN_Tempos_Reparacao_Informacao`, `docs/mapping/WIN_Tempos_Reparacao_Informacao.md`. Step 0 only.

## Contract

Read service/observations/contacts/client and print.

Entry(number) loads order fields and customer description then cancels both query declarations. Close and system close explicitly close. Print calls RPT_Servico_Avaria(number) without local iPreview invocation; inherited print destination is not explicitly reset.

Caller arguments/results and native buffer changes: mapping entry/event ledger.

## Window/layout

| Field | Extracted value |
| --- | --- |
| title | {"PT": "Informaçıes"} |
| window_type | Free window |
| opening_mode | Centered in the parent window |
| size | {"x": 0, "y": 0, "width": 622, "height": 492} |
| close_icon | Yes |
| flags | {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false} |

Default/Abort button types below; actual native routing and first focus U-W24748E-02. Saved position versus opening-mode precedence U-W24748E-02.

## Controls

Every extracted control/column retained. Tab order is container-local. Missing metadata: unresolved (encoded), U-W24748E-01; never false.

| Control/container | Kind | Caption/title/value | Binding | Mask/type/size | Tab/column | x,y,w,h | Anchor/state/button |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BTN_Fechar | Button | {"PT": "Fechar"} | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": 7, "column": "—"} | [497, 441, 106, 30] | {"anchoring": "Right and bottom, height and width", "state": "Active", "button_type": "Normal"} |
| BTN_Imprimir1 | Button | {"PT": "Imprimir"} | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": 6, "column": "—"} | [19, 441, 106, 30] | {"anchoring": "Bottom", "state": "Active", "button_type": "Abort"} |
| BTN_Syst_Restore | Image | {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"} | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": "unresolved (encoded); U-W24748E-01", "column": "—"} | [488, -19, 14, 14] | {"anchoring": "Right", "state": "Active"} |
| EDT_cliente | Edit control | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": 4, "column": "—"} | [19, 306, 584, 27] | {"anchoring": "Width", "state": "Read-only"} |
| EDT_contactos | Edit control | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": 5, "column": "—"} | [19, 365, 584, 70] | {"anchoring": "Width", "state": "Read-only"} |
| EDT_observacao | Edit control | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": 3, "column": "—"} | [19, 184, 584, 90] | {"anchoring": "Width", "state": "Read-only"} |
| EDT_servico_avaria | Edit control | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text", "input_size": 0} | {"tab": 2, "column": "—"} | [19, 62, 584, 90] | {"anchoring": "Width", "state": "Read-only"} |
| RADTitle | Caption | {"PT": "Informaçıes"} | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W24748E-01", "column": "—"} | [9, 4, 473, 18] | {"anchoring": "Width", "state": "Active"} |
| STC_Cliente | Caption | {"PT": "Cliente"} | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W24748E-01", "column": "—"} | [19, 280, 100, 20] | {"anchoring": "<None>", "state": "Active"} |
| STC_Contactos_do_cliente | Caption | {"PT": "Contactos do cliente"} | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W24748E-01", "column": "—"} | [19, 339, 156, 20] | {"anchoring": "<None>", "state": "Active"} |
| STC_Observaçªo | Caption | {"PT": "Observaçªo"} | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W24748E-01", "column": "—"} | [19, 158, 100, 20] | {"anchoring": "<None>", "state": "Active"} |
| STC_Serviço_Avaria | Caption | {"PT": "Serviço / Avaria"} | unresolved (encoded); U-W24748E-01 | {"input_mask": {"PT": "0"}, "input_type": "Text"} | {"tab": "unresolved (encoded); U-W24748E-01", "column": "—"} | [19, 36, 100, 20] | {"anchoring": "<None>", "state": "Active"} |
| SCSystemButtons.BTN_SYST_FERMER | Button | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": "-1", "column": "—"} | [572, 0, 44, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_SYST_MINIMIZE | Button | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": "-1", "column": "—"} | [522, 0, 26, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_Syst_Maximize | Button | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": "-1", "column": "—"} | [548, 0, 25, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": 1, "column": "—"} | [488, 0, 24, 19] | {"anchoring": "<None>", "state": "Active", "button_type": "Normal"} |
| SCSystemButtons | None | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": "unresolved (encoded); U-W24748E-01", "column": "—"} | [488, 1, 128, 18] | {"state": "Active"} |
| STC_Observação | None | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | unresolved (encoded); U-W24748E-01 | {"tab": "unresolved (encoded); U-W24748E-01", "column": "—"} | ["unresolved (encoded); U-W24748E-01", "unresolved (encoded); U-W24748E-01", "unresolved (encoded); U-W24748E-01", "unresolved (encoded); U-W24748E-01"] | unresolved (encoded); U-W24748E-01 |

## Built-in features and full designer metadata

| Control | Complete extracted properties/flags | Parity |
| --- | --- | --- |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right and bottom, height and width", "x": 497, "y": 441, "width": 106, "height": 30, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} | RULE-W24748E-1000 |
| BTN_Imprimir1 | {"kind": "Button", "caption": {"PT": "Imprimir"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Bottom", "x": 19, "y": 441, "width": 106, "height": 30, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} | RULE-W24748E-1001 |
| BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 488, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} | RULE-W24748E-1002 |
| EDT_cliente | {"kind": "Edit control", "tab_order": 4, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 19, "y": 306, "width": 584, "height": 27, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W24748E-1003 |
| EDT_contactos | {"kind": "Edit control", "tab_order": 5, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 19, "y": 365, "width": 584, "height": 70, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": true, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": true, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W24748E-1004 |
| EDT_observacao | {"kind": "Edit control", "tab_order": 3, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 19, "y": 184, "width": 584, "height": 90, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": true, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": true, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W24748E-1005 |
| EDT_servico_avaria | {"kind": "Edit control", "tab_order": 2, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 19, "y": 62, "width": 584, "height": 90, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": true, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": true, "Horz. scrollbar": false, "Vert. scrollbar": false}} | RULE-W24748E-1006 |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Informaçıes"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 473, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W24748E-1007 |
| STC_Cliente | {"kind": "Caption", "caption": {"PT": "Cliente"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 280, "width": 100, "height": 20, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W24748E-1008 |
| STC_Contactos_do_cliente | {"kind": "Caption", "caption": {"PT": "Contactos do cliente"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 339, "width": 156, "height": 20, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W24748E-1009 |
| STC_Observaçªo | {"kind": "Caption", "caption": {"PT": "Observaçªo"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 158, "width": 100, "height": 20, "row": "Active Left Center", "state": "Active"} | RULE-W24748E-1010 |
| STC_Serviço_Avaria | {"kind": "Caption", "caption": {"PT": "Serviço / Avaria"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "<None>", "x": 19, "y": 36, "width": 100, "height": 20, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W24748E-1011 |
| SCSystemButtons.BTN_SYST_FERMER | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 572, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W24748E-1012 |
| SCSystemButtons.BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 522, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W24748E-1013 |
| SCSystemButtons.BTN_Syst_Maximize | {"kind": "Button", "path": "SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 548, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} | RULE-W24748E-1014 |
| SCSystemButtons.BTN_UMC | {"kind": "Button", "path": "SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 488, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} | RULE-W24748E-1015 |
| SCSystemButtons | {"kind": null, "x": 488, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} | RULE-W24748E-1016 |
| STC_Observação | {"kind": null, "flags": {"Visible": true, "RTF format": false, "Default animation": false}} | RULE-W24748E-1017 |

## Interactions/messages

Every SRC event/message has exact arguments,sequence,focus,visibility,refresh and writes in docs/mapping/WIN_Tempos_Reparacao_Informacao.md. No explicit local business-message shell applies. Window focus/default/Esc follows U-W24748E-02 and the encoded action proposals; explicit return values remain distinct.

## State/data edge cases

| Case | Evidence or remaining point |
| --- | --- |
| Open/focus/Enter/Esc | U-W24748E-02; source assignments/action proposals remain authoritative. |
| Grid selection/filter/header features | Not applicable: no extracted grid. |
| Data/timer/lock/write-failure scope | U-W24748E-03 |
| Local message shell/resource wiring | Not applicable: no explicit local message call. Window closure remains U-W24748E-02. |
| Actual field/type edges | U-W24748E-05; empty/NULL and key text/accents at actual file/query boundaries. |
| Omitted visual metadata | U-W24748E-01; extracted fields and known callers remain established. |

## Acceptance checks

- Walk the actual event branches and result handoffs listed in the mapping; use scratch data for data-writing cases only.
- Confirm keyboard/focus/Enter/Esc outcomes under U-W24748E-02. No grid test applies.
- Compare baseline/resized designer image and missing visual properties under U-W24748E-01.
- Resolve only the applicable U-items above before claiming runtime parity; no test is claimed executed here.

## Message and dialog inventory

| Trigger/source | Exact argument/resource | Kind and buttons | Default/Esc |
| --- | --- | --- | --- |
| — | No explicit message calls in this unit | Framework calls may originate in callees | U-W24748E-04 |

## Initial target checkpoint

The initial target is `src/ui/repair-labor.tsx::RepairLaborInformationDialog`, an actual protected order/customer read. The JPG establishes Informações/Observação accents; the unique primary source STC_Observação retains its identity with a narrow Caption overlay. Printing accepts an actual supplied callback and stays disabled while absent. Browser/native/visual and U gates remain open; no parity rows are promoted. Non-legacy diagnostics/frame helpers use `repair-labor-info-*`.
