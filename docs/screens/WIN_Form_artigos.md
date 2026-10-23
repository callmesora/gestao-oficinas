# Screen spec — WIN_Form_artigos

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw`, `dossier: WIN_Form_artigos`, `docs/mapping/WIN_Form_artigos.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Form_artigos.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Form_artigos.md |

Window properties: {"title": {"PT": "Artigos"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 500, "height": 260}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Form_artigos.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CAA44622-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| BTN_Validar | 406 | 31 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Cancelar | 406 | 63 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| SC_Form | 14 | 31 | 386 | 215 | U-CAA44622-01 | {} |
| EDT_Codigo | 14 | 31 | 283 | 25 | Width | {} |
| EDT_Descricao | 14 | 62 | 376 | 25 | Width | {} |
| EDT_Codbaras | 14 | 93 | 283 | 25 | Width | {} |
| COMBO_Unidade | 14 | 124 | 222 | 31 | Width | {} |
| EDT_Preco | 14 | 161 | 193 | 25 | Width | {} |
| CBOX_Inativo | 14 | 220 | 157 | 26 | Width | {"image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif"} |
| EDT_Preco1 | 14 | 192 | 193 | 25 | Width | {} |
| RADTitle | 9 | 4 | 351 | 18 | Width | {} |
| SC_SCSystemButtons | 366 | 1 | 128 | 18 | U-CAA44622-01 | {} |
| BTN_UMC | 366 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 400 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 426 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 450 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 570 | -19 | 14 | 14 | Right | {} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 3 | BTN_Validar | Button | {"PT": "Validar"} | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CAA44622-010 |
| 4 | BTN_Cancelar | Button | {"PT": "Cancelar"} | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CAA44622-010 |
| U-CAA44622-01 | IMG_BTN_Syst_Restore | Image | U-CAA44622-01 | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CAA44622-010 |
| U-CAA44622-01 | RADTitle | Caption | {"PT": "Artigos"} | — | {'PT': '0'} / U-CAA44622-01 | U-CAA44622-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CAA44622-010 |
| U-CAA44622-01 | SC_Form | None | U-CAA44622-01 | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CAA44622-010 |
| U-CAA44622-01 | SC_SCSystemButtons | None | U-CAA44622-01 | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CAA44622-010 |
| 1 | SC_Form.EDT_Codigo | Edit control | {"PT": "Código"} | artigos.Codigo | {'PT': '0'} / U-CAA44622-01 | 30 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CAA44622-010 |
| 2 | SC_Form.EDT_Descricao | Edit control | {"PT": "Descriçªo"} | artigos.Descricao | {'PT': '0'} / U-CAA44622-01 | 100 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CAA44622-010 |
| 3 | SC_Form.EDT_Codbaras | Edit control | {"PT": "Código de barras"} | artigos.codbarras | {'PT': '0'} / U-CAA44622-01 | 30 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CAA44622-010 |
| 4 | SC_Form.COMBO_Unidade | Combo Box | {"PT": "Código (unidades)"} | artigos.unidade | U-CAA44622-01 / U-CAA44622-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Browse": true, "Sorted": false, "With input": false, "Required input": false, "File assisted input": false, "NULL if empty": false, "Scrollbar tooltip": true, "Horizontal scroll": false} | RULE-CAA44622-010 |
| 5 | SC_Form.EDT_Preco | Edit control | {"PT": "Preço"} | artigos.preco | {'PT': '+999 999 999,99'} / U-CAA44622-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CAA44622-010 |
| 6 | SC_Form.CBOX_Inativo | Check Box | {"PT": "inativo"} | artigos.inativo | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / — | {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false} | RULE-CAA44622-010 |
| 7 | SC_Form.EDT_Preco1 | Edit control | {"PT": "Stock"} | artigos.stock | {'PT': '999 999 999,999'} / U-CAA44622-01 | 0 | Read-only / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CAA44622-010 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CAA44622-01 | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CAA44622-010 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CAA44622-01 | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CAA44622-010 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CAA44622-01 | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CAA44622-010 |
| -1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CAA44622-01 / U-CAA44622-01 | U-CAA44622-01 | Active / Normal | {"Visible": false, "TAB Key": false} | RULE-CAA44622-010 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 63, "width": 80, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Validar | {"kind": "Button", "caption": {"PT": "Validar"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 31, "width": 80, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 570, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Artigos"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 351, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| CBOX_Inativo | {"kind": "Check Box", "path": "SC_Form.CBOX_Inativo", "caption": {"PT": "inativo"}, "initial_value": "0", "tab_order": 6, "linked_item": "artigos.inativo", "image": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Cbox_Anim.gif", "anchoring": "Width", "x": 14, "y": 220, "width": 157, "height": 26, "row": "Active 1", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Proportional column": true, "Three states": false}} |
| COMBO_Unidade | {"kind": "Combo Box", "path": "SC_Form.COMBO_Unidade", "caption": {"PT": "Código (unidades)"}, "tab_order": 4, "input_size": 0, "input_type": "Text", "linked_item": "artigos.unidade", "browsed_file": "unidades", "browsed_item": "Codigo", "displayed_item": "Codigo", "stored_item": "Codigo", "anchoring": "Width", "x": 14, "y": 124, "width": 222, "height": 31, "row": "Active File wit", "state": "Active", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Sorted": false, "With input": false, "Required input": false, "File assisted input": false, "NULL if empty": false, "Scrollbar tooltip": true, "Horizontal scroll": false}} |
| EDT_Codbaras | {"kind": "Edit control", "path": "SC_Form.EDT_Codbaras", "caption": {"PT": "Código de barras"}, "tab_order": 3, "input_size": 30, "input_mask": {"PT": "0"}, "linked_item": "artigos.codbarras", "anchoring": "Width", "x": 14, "y": 93, "width": 283, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Codigo | {"kind": "Edit control", "path": "SC_Form.EDT_Codigo", "caption": {"PT": "Código"}, "tab_order": 1, "input_size": 30, "input_mask": {"PT": "0"}, "linked_item": "artigos.Codigo", "anchoring": "Width", "x": 14, "y": 31, "width": 283, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Descricao | {"kind": "Edit control", "path": "SC_Form.EDT_Descricao", "caption": {"PT": "Descriçªo"}, "tab_order": 2, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "artigos.Descricao", "anchoring": "Width", "x": 14, "y": 62, "width": 376, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Preco | {"kind": "Edit control", "path": "SC_Form.EDT_Preco", "caption": {"PT": "Preço"}, "tab_order": 5, "input_size": 0, "input_mask": {"PT": "+999 999 999,99"}, "linked_item": "artigos.preco", "anchoring": "Width", "x": 14, "y": 161, "width": 193, "height": 25, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Preco1 | {"kind": "Edit control", "path": "SC_Form.EDT_Preco1", "caption": {"PT": "Stock"}, "tab_order": 7, "input_size": 0, "input_mask": {"PT": "999 999 999,999"}, "linked_item": "artigos.stock", "anchoring": "Width", "x": 14, "y": 192, "width": 193, "height": 25, "row": "Read-onl Numeric", "state": "Read-only", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 450, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 400, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 426, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 366, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": false}} |
| SC_Form | {"kind": null, "x": 14, "y": 31, "width": 386, "height": 215, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 366, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CAA44622-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CAA44622-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CAA44622-02 |
| Empty result | No invented fallback or selection; U-CAA44622-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-CAA44622-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CAA44622-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CAA44622-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:39 | Info("Indique um código") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:43 | Info("Indique uma descrição") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:47 | Info("Indique uma unidade") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:57 | info("Código de barras já associado a outro artigo") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:67 | Info("Código de barras já associado a outro artigo") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:81 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"artigos." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_artigos.wdw:91 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"artigos." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CAA44622-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CAA44622-01. Runtime writes must be performed only against a preserved scratch data copy.
