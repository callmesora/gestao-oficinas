# Screen spec — WIN_Form_Viaturas

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw`, `dossier: WIN_Form_Viaturas`, `docs/mapping/WIN_Form_Viaturas.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Form_Viaturas.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Form_Viaturas.md |

Window properties: {"title": {"PT": "Viaturas"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 500, "height": 230}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Form_Viaturas.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-C9675195-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Reviewed save contract

`legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:34-70`: validation uppercases the registration and copies controls to the buffer, then uses the explicit estado parameter. NOVO calls HAdd; all other states execute UPDATE by the original codigo registration, updating client, make, model, year and month. No HModify is called. UPDATE is unchecked before the true return; failure outcome remains U-C9675195-03. Editing cannot change the WHERE registration through the disabled control.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| BTN_Validar | 406 | 31 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Cancelar | 406 | 63 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| SC_Form | 14 | 31 | 386 | 186 | U-C9675195-01 | {} |
| EDT_Matricula | 14 | 31 | 205 | 25 | Width | {} |
| EDT_Marca | 14 | 99 | 370 | 25 | Width | {} |
| EDT_Modelo | 14 | 130 | 370 | 25 | Width | {} |
| COMBO_Codigo | 14 | 62 | 323 | 31 | Width | {} |
| EDT_Ano | 14 | 161 | 143 | 25 | Width | {} |
| EDT_Mes | 14 | 192 | 131 | 25 | Width | {} |
| BTN_VISION | 342 | 65 | 42 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 351 | 18 | Width | {} |
| SC_SCSystemButtons | 366 | 1 | 128 | 18 | U-C9675195-01 | {} |
| BTN_UMC | 366 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 400 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 426 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 450 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 570 | -19 | 14 | 14 | Right | {} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 3 | BTN_Validar | Button | {"PT": "Validar"} | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-C9675195-013 |
| 4 | BTN_Cancelar | Button | {"PT": "Cancelar"} | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-C9675195-013 |
| U-C9675195-01 | IMG_BTN_Syst_Restore | Image | U-C9675195-01 | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-C9675195-013 |
| U-C9675195-01 | RADTitle | Caption | {"PT": "Viaturas"} | — | {'PT': '0'} / U-C9675195-01 | U-C9675195-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-C9675195-013 |
| U-C9675195-01 | SC_Form | None | U-C9675195-01 | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-C9675195-013 |
| U-C9675195-01 | SC_SCSystemButtons | None | U-C9675195-01 | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-C9675195-013 |
| 1 | SC_Form.EDT_Matricula | Edit control | {"PT": "Matricula"} | Viaturas.matricula | {'PT': '0'} / U-C9675195-01 | 15 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-C9675195-013 |
| 2 | SC_Form.EDT_Marca | Edit control | {"PT": "Marca"} | Viaturas.marca | {'PT': '0'} / U-C9675195-01 | 50 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-C9675195-013 |
| 3 | SC_Form.EDT_Modelo | Edit control | {"PT": "Modelo"} | Viaturas.modelo | {'PT': '0'} / U-C9675195-01 | 50 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-C9675195-013 |
| 4 | SC_Form.COMBO_Codigo | Combo Box | {"PT": "Descriçªo (Clientes)"} | Viaturas.Cliente | U-C9675195-01 / U-C9675195-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Browse": true, "Sorted": false, "With input": false, "Required input": false, "File assisted input": false, "NULL if empty": false, "Scrollbar tooltip": true, "Horizontal scroll": false} | RULE-C9675195-013 |
| 5 | SC_Form.BTN_VISION | Button | U-C9675195-01 | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C9675195-013 |
| 6 | SC_Form.EDT_Ano | Edit control | {"PT": "Ano"} | Viaturas.Ano | {'PT': '9999'} / {'PT': '9999'} | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-C9675195-013 |
| 7 | SC_Form.EDT_Mes | Edit control | {"PT": "MŒs"} | Viaturas.mes | {'PT': '99'} / {'PT': '99'} | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-C9675195-013 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-C9675195-01 | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C9675195-013 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-C9675195-01 | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C9675195-013 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-C9675195-01 | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C9675195-013 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-C9675195-01 / U-C9675195-01 | U-C9675195-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-C9675195-013 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 63, "width": 80, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Validar | {"kind": "Button", "caption": {"PT": "Validar"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 31, "width": 80, "height": 24, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 570, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Viaturas"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 351, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_VISION | {"kind": "Button", "path": "SC_Form.BTN_VISION", "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_VisionPlus.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 342, "y": 65, "width": 42, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| COMBO_Codigo | {"kind": "Combo Box", "path": "SC_Form.COMBO_Codigo", "caption": {"PT": "Descriçªo (Clientes)"}, "tab_order": 4, "input_size": 0, "input_type": "Text", "linked_item": "Viaturas.Cliente", "browsed_file": "Clientes", "browsed_item": "Codigo", "displayed_item": "Descricao", "stored_item": "Codigo", "anchoring": "Width", "x": 14, "y": 62, "width": 323, "height": 31, "row": "Active File wit", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Sorted": false, "With input": false, "Required input": false, "File assisted input": false, "NULL if empty": false, "Scrollbar tooltip": true, "Horizontal scroll": false}} |
| EDT_Ano | {"kind": "Edit control", "path": "SC_Form.EDT_Ano", "caption": {"PT": "Ano"}, "tab_order": 6, "input_size": 0, "input_mask": {"PT": "9999"}, "display_mask": {"PT": "9999"}, "linked_item": "Viaturas.Ano", "anchoring": "Width", "x": 14, "y": 161, "width": 143, "height": 25, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Marca | {"kind": "Edit control", "path": "SC_Form.EDT_Marca", "caption": {"PT": "Marca"}, "tab_order": 2, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "Viaturas.marca", "anchoring": "Width", "x": 14, "y": 99, "width": 370, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Matricula | {"kind": "Edit control", "path": "SC_Form.EDT_Matricula", "caption": {"PT": "Matricula"}, "tab_order": 1, "input_size": 15, "input_mask": {"PT": "0"}, "linked_item": "Viaturas.matricula", "anchoring": "Width", "x": 14, "y": 31, "width": 205, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Mes | {"kind": "Edit control", "path": "SC_Form.EDT_Mes", "caption": {"PT": "MŒs"}, "tab_order": 7, "input_size": 0, "input_mask": {"PT": "99"}, "display_mask": {"PT": "99"}, "linked_item": "Viaturas.mes", "anchoring": "Width", "x": 14, "y": 192, "width": 131, "height": 25, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Modelo | {"kind": "Edit control", "path": "SC_Form.EDT_Modelo", "caption": {"PT": "Modelo"}, "tab_order": 3, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "Viaturas.modelo", "anchoring": "Width", "x": 14, "y": 130, "width": 370, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 450, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 400, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 426, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 366, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| SC_Form | {"kind": null, "x": 14, "y": 31, "width": 386, "height": 186, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 366, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-C9675195-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-C9675195-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-C9675195-02 |
| Empty result | No invented fallback or selection; U-C9675195-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-C9675195-02 |
| Other window/user change | No automatic refresh beyond source calls; U-C9675195-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-C9675195-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:35 | info("Falta indicar a matrícula") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:39 | Info("Falta indicar o cliente") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:43 | Info("Falta indicar a marca") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:47 | Info("Falta indicar o modelo") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_Viaturas.wdw:58 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"viaturas." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-C9675195-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-C9675195-01. Runtime writes must be performed only against a preserved scratch data copy.
