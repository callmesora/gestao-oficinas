# Screen spec — WIN_Form_postos

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw`, `dossier: WIN_Form_postos`, `docs/mapping/WIN_Form_postos.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Form_postos.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Form_postos.md |

Window properties: {"size": {"x": 0, "y": 0, "width": 500, "height": 133}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Form_postos.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CD4F0FE3-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| BTN_Validar | 406 | 31 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Cancelar | 406 | 63 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| SC_Form | 14 | 31 | 381 | 91 | U-CD4F0FE3-01 | {} |
| EDT_Codigo | 14 | 31 | 82 | 25 | Width | {} |
| EDT_Descricao | 14 | 62 | 313 | 25 | Width | {} |
| EDT_Terminal | 14 | 93 | 103 | 25 | Width | {} |
| BTN_NoName1 | 123 | 93 | 37 | 24 | Right | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 243 | 18 | Width | {} |
| SC_SCSystemButtons | 366 | 1 | 128 | 18 | U-CD4F0FE3-01 | {} |
| BTN_UMC | 366 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 400 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 426 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 450 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 462 | -19 | 14 | 14 | Right | {} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 3 | BTN_Validar | Button | {"PT": "Validar"} | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-CD4F0FE3-011 |
| 4 | BTN_Cancelar | Button | {"PT": "Cancelar"} | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-CD4F0FE3-011 |
| U-CD4F0FE3-01 | IMG_BTN_Syst_Restore | Image | U-CD4F0FE3-01 | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CD4F0FE3-011 |
| U-CD4F0FE3-01 | RADTitle | Caption | {"PT": "Postos"} | — | {'PT': '0'} / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CD4F0FE3-011 |
| U-CD4F0FE3-01 | SC_Form | None | U-CD4F0FE3-01 | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CD4F0FE3-011 |
| U-CD4F0FE3-01 | SC_SCSystemButtons | None | U-CD4F0FE3-01 | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CD4F0FE3-011 |
| 1 | SC_Form.EDT_Codigo | Edit control | {"PT": "Código"} | postos.Codigo | {'PT': '99'} / U-CD4F0FE3-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CD4F0FE3-011 |
| 2 | SC_Form.EDT_Descricao | Edit control | {"PT": "Descriçªo"} | postos.Descricao | {'PT': '0'} / U-CD4F0FE3-01 | 50 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CD4F0FE3-011 |
| 3 | SC_Form.EDT_Terminal | Edit control | {"PT": "Terminal"} | postos.terminal | {'PT': '0'} / U-CD4F0FE3-01 | 3 | Read-only / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CD4F0FE3-011 |
| 4 | SC_Form.BTN_NoName1 | Button | {"PT": "..."} | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CD4F0FE3-011 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CD4F0FE3-01 | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CD4F0FE3-011 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CD4F0FE3-01 | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CD4F0FE3-011 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CD4F0FE3-01 | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CD4F0FE3-011 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CD4F0FE3-01 / U-CD4F0FE3-01 | U-CD4F0FE3-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-CD4F0FE3-011 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 63, "width": 80, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Validar | {"kind": "Button", "caption": {"PT": "Validar"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 31, "width": 80, "height": 24, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 462, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Postos"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 243, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_NoName1 | {"kind": "Button", "path": "SC_Form.BTN_NoName1", "caption": {"PT": "..."}, "tab_order": 4, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 123, "y": 93, "width": 37, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| EDT_Codigo | {"kind": "Edit control", "path": "SC_Form.EDT_Codigo", "caption": {"PT": "Código"}, "tab_order": 1, "input_size": 0, "input_mask": {"PT": "99"}, "linked_item": "postos.Codigo", "anchoring": "Width", "x": 14, "y": 31, "width": 82, "height": 25, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Descricao | {"kind": "Edit control", "path": "SC_Form.EDT_Descricao", "caption": {"PT": "Descriçªo"}, "tab_order": 2, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "postos.Descricao", "anchoring": "Width", "x": 14, "y": 62, "width": 313, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Terminal | {"kind": "Edit control", "path": "SC_Form.EDT_Terminal", "caption": {"PT": "Terminal"}, "tab_order": 3, "input_size": 3, "input_mask": {"PT": "0"}, "linked_item": "postos.terminal", "anchoring": "Width", "x": 14, "y": 93, "width": 103, "height": 25, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 450, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 400, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 426, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 366, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| SC_Form | {"kind": null, "x": 14, "y": 31, "width": 381, "height": 91, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 366, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CD4F0FE3-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CD4F0FE3-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CD4F0FE3-02 |
| Empty result | No invented fallback or selection; U-CD4F0FE3-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-CD4F0FE3-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CD4F0FE3-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CD4F0FE3-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:39 | Info("Indique um código") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:43 | Info("Indique uma descrição") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:53 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"postos." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_postos.wdw:63 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"postos." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CD4F0FE3-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CD4F0FE3-01. Runtime writes must be performed only against a preserved scratch data copy.

## MIG-7G.1 implementation scope

Actual PostoRepository/API/PostgreSQL form under ADR-016. Source code entry depends on Terminais.NewRecord captured once at opening, not Postos mode; unknown is readonly as an assumed safe default/U02. Actual terminal Novo/cancel establishes new, explicit edit/select/save/found-folder operations position the shared client context under labelled defaults. Picker changes cannot retoggle the open form. Numeric99 entry retains bound100..255, description required exact50, optional terminal readonly3, hidden teste preserved by selected-id update and empty on create. No description/nonkey suggestions, auto-code or terminal-existence rule. Scope-specific JPG Descrição override retains generated metadata unchanged.

Nonlegacy identifiers: postos-launcher/open, posto-form-frame/restore/diagnostic, posto-list-diagnostic; WdModal derives posto-form-frame-resize-<edge> handles and the existing restore test ID. TerminalFileContext/snapshot/reset/position/deleted, FormOpening/codeEditableAtOpen and repository helpers are target state/instrumentation, not legacy controls. Actual nested TerminalPicker retains its documented terminal identifiers. Geometry/keys/presentation and precise native/runtime/default/UMC U01/02/03 gates remain; no whole-window parity claim.
