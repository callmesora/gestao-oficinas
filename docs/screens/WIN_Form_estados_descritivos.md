# Screen spec — WIN_Form_estados_descritivos

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_estados_descritivos.wdw`, `dossier: WIN_Form_estados_descritivos`, `docs/mapping/WIN_Form_estados_descritivos.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Form_estados_descritivos.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Form_estados_descritivos.md |

Window properties: {"size": {"x": 0, "y": 0, "width": 500, "height": 104}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Form_estados_descritivos.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CB7C31CC-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| BTN_Validar | 406 | 31 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Cancelar | 406 | 63 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| SC_Form | 14 | 31 | 386 | 129 | U-CB7C31CC-01 | {} |
| EDT_Codigo | 14 | 31 | 82 | 25 | Width | {} |
| EDT_Descricao | 14 | 62 | 300 | 25 | Width | {} |
| RADTitle | 9 | 4 | 351 | 18 | Width | {} |
| SC_SCSystemButtons | 366 | 1 | 128 | 18 | U-CB7C31CC-01 | {} |
| BTN_UMC | 366 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 400 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 426 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 450 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 570 | -19 | 14 | 14 | Right | {} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 3 | BTN_Validar | Button | {"PT": "Validar"} | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-CB7C31CC-011 |
| 4 | BTN_Cancelar | Button | {"PT": "Cancelar"} | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-CB7C31CC-011 |
| U-CB7C31CC-01 | IMG_BTN_Syst_Restore | Image | U-CB7C31CC-01 | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CB7C31CC-011 |
| U-CB7C31CC-01 | RADTitle | Caption | {"PT": "Estados Descritivos"} | — | {'PT': '0'} / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CB7C31CC-011 |
| U-CB7C31CC-01 | SC_Form | None | U-CB7C31CC-01 | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CB7C31CC-011 |
| U-CB7C31CC-01 | SC_SCSystemButtons | None | U-CB7C31CC-01 | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CB7C31CC-011 |
| 1 | SC_Form.EDT_Codigo | Edit control | {"PT": "Código"} | estados_descritivos.Codigo | {'PT': '0'} / U-CB7C31CC-01 | 3 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CB7C31CC-011 |
| 2 | SC_Form.EDT_Descricao | Edit control | {"PT": "Descriçªo"} | estados_descritivos.Descricao | {'PT': '0'} / U-CB7C31CC-01 | 100 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CB7C31CC-011 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CB7C31CC-01 | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CB7C31CC-011 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CB7C31CC-01 | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CB7C31CC-011 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CB7C31CC-01 | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CB7C31CC-011 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CB7C31CC-01 / U-CB7C31CC-01 | U-CB7C31CC-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-CB7C31CC-011 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 63, "width": 80, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Validar | {"kind": "Button", "caption": {"PT": "Validar"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 31, "width": 80, "height": 24, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 570, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Estados Descritivos"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 351, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| EDT_Codigo | {"kind": "Edit control", "path": "SC_Form.EDT_Codigo", "caption": {"PT": "Código"}, "tab_order": 1, "input_size": 3, "input_mask": {"PT": "0"}, "linked_item": "estados_descritivos.Codigo", "anchoring": "Width", "x": 14, "y": 31, "width": 82, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Descricao | {"kind": "Edit control", "path": "SC_Form.EDT_Descricao", "caption": {"PT": "Descriçªo"}, "tab_order": 2, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "estados_descritivos.Descricao", "anchoring": "Width", "x": 14, "y": 62, "width": 300, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 450, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 400, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 426, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 366, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| SC_Form | {"kind": null, "x": 14, "y": 31, "width": 386, "height": 129, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 366, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CB7C31CC-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CB7C31CC-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CB7C31CC-02 |
| Empty result | No invented fallback or selection; U-CB7C31CC-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-CB7C31CC-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CB7C31CC-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CB7C31CC-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Form_estados_descritivos.wdw:39 | Info("Falta indicar o código") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_estados_descritivos.wdw:49 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"estados_descritivos." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_estados_descritivos.wdw:59 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"estados_descritivos." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CB7C31CC-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CB7C31CC-01. Runtime writes must be performed only against a preserved scratch data copy.

## MIG-7E target implementation notes

ADR-015 retains exact text values and source IDs. The designer JPG visibly reads Código/Descrição; only displayed Descrição overrides the corrupted extracted caption, leaving generated metadata immutable (inferred image evidence, human acceptance remains U-*-01). Non-legacy developer instrumentation: descriptive-states-launcher/open/select-open/returned, descriptiveState-form-frame/restore/diagnostic, descriptiveState-list-diagnostic and descriptive-state-picker/frame/restore. Direct development selector launch uses ?workflow=descriptive-states&selecting=1&origin=... against the real repository; it is not the labor caller. Actual labor continuation remains with WIN_Tempos_Reparacao_Estado at MIG-10. Report/UMC and full native designer acceptance are retained, not excluded.
