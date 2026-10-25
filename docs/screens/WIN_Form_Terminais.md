# Screen spec — WIN_Form_Terminais

MIG-7C2.2: explicit `WdEdit integerMask` consumes the generated numeric masks under ADR-003; strings/loaded overflow/NULLs and schema/API ranges remain intact. Actual entry/caret/paste and persistence tests: `ui-check/numeric-entry.flows.spec.ts`. Vehicle conversion uses `vehicleFormValues` before transport; exact native locale/coercion remains U01/U03. Text fields and lookup keys retain their existing behavior.

MIG-7C2.1: actual modal geometry uses `WdModal`/`WdModalHandle` and the source Resizable/With grip/Save position flags under ADR-003. Non-legacy `${instance}-resize-${edge}` handles preserve source Tab traversal; existing frame/restore IDs stay unchanged. Hidden mounted controls retain drafts; own-dialog focus and pointer/key ownership prevent ancestor interference. `ui-check/modal-geometry.flows.spec.ts` covers actual consumers. Exact native limits, parent centering, persistence lifetime and existing unit U01 remain open; broad designer parity is not promoted.

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw`, `dossier: WIN_Form_Terminais`, `docs/mapping/WIN_Form_Terminais.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Form_Terminais.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Form_Terminais.md |

Window properties: {"title": {"PT": "Terminais de recolha de dados"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 500, "height": 297}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Form_Terminais.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CDF1C34F-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| BTN_Validar | 406 | 31 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Cancelar | 406 | 63 | 80 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| SC_Form | 14 | 31 | 386 | 252 | U-CDF1C34F-01 | {} |
| EDT_Codigo | 14 | 31 | 148 | 25 | Width | {} |
| EDT_Descricao | 14 | 62 | 283 | 25 | Width | {} |
| EDT_Posicao_Inicial_do_Codigo_de_Barras | 14 | 93 | 202 | 25 | Width | {} |
| EDT_Posicao_Final_do_Codigo_de_Barras | 14 | 124 | 202 | 25 | Width | {} |
| EDT_Posicao_Inicial_da_Quantidade | 14 | 155 | 202 | 25 | Width | {} |
| EDT_Posicao_Final_da_Quantidade | 14 | 186 | 202 | 25 | Width | {} |
| EDT_Localizacao_da_pasta | 14 | 217 | 318 | 25 | Width | {} |
| EDT_Nome_do_ficheiro | 14 | 248 | 318 | 25 | Width | {} |
| BTN_procurar_pasta | 336 | 217 | 40 | 24 | Right | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 351 | 18 | Width | {} |
| SC_SCSystemButtons | 366 | 1 | 128 | 18 | U-CDF1C34F-01 | {} |
| BTN_UMC | 366 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 400 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 426 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 450 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 326 | -20 | 14 | 14 | Right | {} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 3 | BTN_Validar | Button | {"PT": "Validar"} | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-CDF1C34F-012 |
| 4 | BTN_Cancelar | Button | {"PT": "Cancelar"} | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-CDF1C34F-012 |
| U-CDF1C34F-01 | IMG_BTN_Syst_Restore | Image | U-CDF1C34F-01 | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CDF1C34F-012 |
| U-CDF1C34F-01 | RADTitle | Caption | {"PT": "Terminais de recolha de dados"} | — | {'PT': '0'} / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CDF1C34F-012 |
| U-CDF1C34F-01 | SC_Form | None | U-CDF1C34F-01 | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CDF1C34F-012 |
| U-CDF1C34F-01 | SC_SCSystemButtons | None | U-CDF1C34F-01 | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CDF1C34F-012 |
| 1 | SC_Form.EDT_Codigo | Edit control | {"PT": "Código"} | Terminais.Codigo | {'PT': '0'} / U-CDF1C34F-01 | 3 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CDF1C34F-012 |
| 2 | SC_Form.EDT_Descricao | Edit control | {"PT": "Descriçªo"} | Terminais.Descricao | {'PT': '0'} / U-CDF1C34F-01 | 30 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CDF1C34F-012 |
| 3 | SC_Form.EDT_Posicao_Inicial_do_Codigo_de_Barras | Edit control | {"PT": "Posiçªo Inicial do Código de Barras"} | Terminais.codbarras_inicio | {'PT': '99'} / U-CDF1C34F-01 | 0 | U-CDF1C34F-01 / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CDF1C34F-012 |
| 4 | SC_Form.EDT_Posicao_Final_do_Codigo_de_Barras | Edit control | {"PT": "Posiçªo Final do Código de Barras"} | Terminais.codbarras_fim | {'PT': '99'} / U-CDF1C34F-01 | 0 | U-CDF1C34F-01 / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CDF1C34F-012 |
| 5 | SC_Form.EDT_Posicao_Inicial_da_Quantidade | Edit control | {"PT": "Posiçªo Inicial da Quantidade"} | Terminais.quant_inicio | {'PT': '99'} / U-CDF1C34F-01 | 0 | U-CDF1C34F-01 / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CDF1C34F-012 |
| 6 | SC_Form.EDT_Posicao_Final_da_Quantidade | Edit control | {"PT": "Posiçªo Final da Quantidade"} | Terminais.quant_fim | {'PT': '99'} / U-CDF1C34F-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CDF1C34F-012 |
| 7 | SC_Form.EDT_Localizacao_da_pasta | Edit control | {"PT": "Localizaçªo da pasta"} | Terminais.pasta_localizacao | {'PT': '0'} / U-CDF1C34F-01 | 200 | Read-only / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CDF1C34F-012 |
| 8 | SC_Form.EDT_Nome_do_ficheiro | Edit control | {"PT": "Nome do ficheiro"} | Terminais.nome_ficheiro | {'PT': '0'} / U-CDF1C34F-01 | 50 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CDF1C34F-012 |
| 9 | SC_Form.BTN_procurar_pasta | Button | {"PT": "..."} | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CDF1C34F-012 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CDF1C34F-01 | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CDF1C34F-012 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CDF1C34F-01 | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CDF1C34F-012 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CDF1C34F-01 | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CDF1C34F-012 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CDF1C34F-01 / U-CDF1C34F-01 | U-CDF1C34F-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-CDF1C34F-012 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| BTN_Cancelar | {"kind": "Button", "caption": {"PT": "Cancelar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Cancel.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 63, "width": 80, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Validar | {"kind": "Button", "caption": {"PT": "Validar"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 406, "y": 31, "width": 80, "height": 24, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 326, "y": -20, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Terminais de recolha de dados"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 351, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_procurar_pasta | {"kind": "Button", "path": "SC_Form.BTN_procurar_pasta", "caption": {"PT": "..."}, "tab_order": 9, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 336, "y": 217, "width": 40, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| EDT_Codigo | {"kind": "Edit control", "path": "SC_Form.EDT_Codigo", "caption": {"PT": "Código"}, "tab_order": 1, "input_size": 3, "input_mask": {"PT": "0"}, "linked_item": "Terminais.Codigo", "anchoring": "Width", "x": 14, "y": 31, "width": 148, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Descricao | {"kind": "Edit control", "path": "SC_Form.EDT_Descricao", "caption": {"PT": "Descriçªo"}, "tab_order": 2, "input_size": 30, "input_mask": {"PT": "0"}, "linked_item": "Terminais.Descricao", "anchoring": "Width", "x": 14, "y": 62, "width": 283, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Localizacao_da_pasta | {"kind": "Edit control", "path": "SC_Form.EDT_Localizacao_da_pasta", "caption": {"PT": "Localizaçªo da pasta"}, "tab_order": 7, "input_size": 200, "input_mask": {"PT": "0"}, "linked_item": "Terminais.pasta_localizacao", "anchoring": "Width", "x": 14, "y": 217, "width": 318, "height": 25, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Nome_do_ficheiro | {"kind": "Edit control", "path": "SC_Form.EDT_Nome_do_ficheiro", "caption": {"PT": "Nome do ficheiro"}, "tab_order": 8, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "Terminais.nome_ficheiro", "anchoring": "Width", "x": 14, "y": 248, "width": 318, "height": 25, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Posicao_Final_da_Quantidade | {"kind": "Edit control", "path": "SC_Form.EDT_Posicao_Final_da_Quantidade", "caption": {"PT": "Posiçªo Final da Quantidade"}, "tab_order": 6, "input_size": 0, "input_mask": {"PT": "99"}, "linked_item": "Terminais.quant_fim", "anchoring": "Width", "x": 14, "y": 186, "width": 202, "height": 25, "row": "Active Numeric", "state": "Active", "input_type": "Numeric", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Posicao_Final_do_Codigo_de_Barras | {"kind": "Edit control", "path": "SC_Form.EDT_Posicao_Final_do_Codigo_de_Barras", "caption": {"PT": "Posiçªo Final do Código de Barras"}, "tab_order": 4, "input_size": 0, "input_mask": {"PT": "99"}, "linked_item": "Terminais.codbarras_fim", "anchoring": "Width", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Posicao_Inicial_da_Quantidade | {"kind": "Edit control", "path": "SC_Form.EDT_Posicao_Inicial_da_Quantidade", "caption": {"PT": "Posiçªo Inicial da Quantidade"}, "tab_order": 5, "input_size": 0, "input_mask": {"PT": "99"}, "linked_item": "Terminais.quant_inicio", "anchoring": "Width", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_Posicao_Inicial_do_Codigo_de_Barras | {"kind": "Edit control", "path": "SC_Form.EDT_Posicao_Inicial_do_Codigo_de_Barras", "caption": {"PT": "Posiçªo Inicial do Código de Barras"}, "tab_order": 3, "input_size": 0, "input_mask": {"PT": "99"}, "linked_item": "Terminais.codbarras_inicio", "anchoring": "Width", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": true, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 450, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 400, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 426, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 366, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| SC_Form | {"kind": null, "x": 14, "y": 31, "width": 386, "height": 252, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 366, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CDF1C34F-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CDF1C34F-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CDF1C34F-02 |
| Empty result | No invented fallback or selection; U-CDF1C34F-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-CDF1C34F-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CDF1C34F-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CDF1C34F-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:39 | Info("Indique um código") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:43 | Info("Indique uma descrição") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:53 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"terminais." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |
| legacy/GestaoOficinas_TesteIA/WIN_Form_Terminais.wdw:63 | Error("Duplicação:  Este registo não pode ser gravado.","Campo associado ao erro: " + sItemName, "Valor do campo duplicado: " + {"terminais." + sItemName}) | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CDF1C34F-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CDF1C34F-01. Runtime writes must be performed only against a preserved scratch data copy.

## MIG-7F implementation/default notes

ADR-016 preserves all eight fields, explicit save buffer identity and actual native folder seek/selection/cancellation. Source JPG-backed captions use Portuguese Posição/Descrição/Localização only in presentation, retaining extracted metadata unchanged. Generic prefix lookup and unmatched safe fallback remain assumed/U-CDF1C34F-02. Source 99 numeric live mask/input assistance and modal manual resize/saved geometry remain known target work at MIG-7C2; exact native/runtime/U/actual postos caller gates stay open. No report/print control is invented for this list. Non-legacy developer instrumentation: terminals-launcher/open/select-open/returned, terminal-form-frame/restore/diagnostic, terminal-list-diagnostic, terminal-picker/frame/restore. Shared derived header __search/__resize/__columns helpers are target instrumentation, not legacy controls. Direct development selector uses ?workflow=terminals&selecting=1&origin=... against the actual repository; it is not the postos caller.
