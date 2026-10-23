# Screen spec — WIN_Table_Viaturas

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw`, `dossier: WIN_Table_Viaturas`, `docs/mapping/WIN_Table_Viaturas.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Table_Viaturas.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Table_Viaturas.md |

Window properties: {"title": {"PT": "Tabela de Viaturas"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 800, "height": 600}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Table_Viaturas.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-C039C545-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Reviewed creation and selection contract

`legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:278-284`: New opens WIN_Form_Viaturas("NOVO", "") without a selection guard or HReset. Only a true form return reexecutes the query; seeking/reselecting the previously captured registration runs afterward in either case. Invalid/filtered-out restoration remains U-C039C545-02.

## Reviewed caller continuation

`legacy/GestaoOficinas_TesteIA/WIN_Ordens_Reparacao_Form.wdw:370-454`: the caller assigns registration from the picker, then for a nonempty value reloads vehicle, customer, make/model and contact text. It may offer vehicle creation if lookup finds none. The picker returns an identifier; it does not return a complete vehicle/customer/contact form. Shared-buffer/empty-result and query failure outcomes remain U-C039C545-02 / U-C039C545-03. Full branch details are in the mapping contract.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| TABLE_Viaturas | 14 | 117 | 678 | 468 | Width and height | {} |
| COL_Matricula | 14 | 117 | None | None | <None> | {} |
| COL_Cliente | 14 | 117 | None | None | <None> | {} |
| COL_Marca | 14 | 117 | None | None | <None> | {} |
| COL_Modelo | 14 | 117 | None | None | <None> | {} |
| COL_Ano | 14 | 117 | None | None | <None> | {} |
| COL_Mes | 14 | 117 | None | None | <None> | {} |
| BTN_Fechar | 698 | 236 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| Btn_New | 698 | 117 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Modificar | 698 | 147 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Delete | 698 | 176 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Imprimir | 698 | 206 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 565 | 18 | Width | {} |
| SC_SCSystemButtons | 666 | 1 | 128 | 18 | U-C039C545-01 | {} |
| BTN_UMC | 666 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 700 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 726 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 750 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 567 | -19 | 14 | 14 | Right | {} |
| BTN_selecionar | 698 | 561 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_marca_modelo | 277 | 28 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_cliente | 189 | 28 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_matricula | 102 | 28 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_todos | 14 | 28 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| EDT_termo_pesquisa | 14 | 87 | 678 | 24 | Width | {} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 2 | TABLE_Viaturas | Table | {"PT": "RADFileB Table"} | QRY_select_viaturas | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Read-only / — | {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false} | RULE-C039C545-025 |
| 3 | Btn_New | Button | {"PT": "Novo"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 4 | BTN_Modificar | Button | {"PT": "Modificar"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 5 | BTN_Delete | Button | {"PT": "Apagar"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 6 | BTN_Imprimir | Button | {"PT": "Imprimir"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 7 | BTN_Fechar | Button | {"PT": "Fechar"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 8 | BTN_selecionar | Button | {"PT": "Selecionar"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 9 | BTN_marca_modelo | Button | {"PT": "Pesquisar por marca/modelo"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 10 | BTN_cliente | Button | {"PT": "Pesquisar por cliente"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 11 | BTN_matricula | Button | {"PT": "Pesquisar por matrícula"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 12 | BTN_todos | Button | {"PT": "Ver Todos"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| 13 | EDT_termo_pesquisa | Edit control | U-C039C545-01 | — | {'PT': '0'} / U-C039C545-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-C039C545-025 |
| U-C039C545-01 | IMG_BTN_Syst_Restore | Image | U-C039C545-01 | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-C039C545-025 |
| U-C039C545-01 | RADTitle | Caption | {"PT": "Tabela de Viaturas"} | — | {'PT': '0'} / U-C039C545-01 | U-C039C545-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-C039C545-025 |
| U-C039C545-01 | SC_SCSystemButtons | None | U-C039C545-01 | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-C039C545-025 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-C039C545-01 | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C039C545-025 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-C039C545-01 | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C039C545-025 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-C039C545-01 | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-C039C545-025 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-C039C545-01 / U-C039C545-01 | U-C039C545-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-C039C545-025 |
| U-C039C545-01 | TABLE_Viaturas.COL_Ano | Table column | {"PT": "Ano"} | QRY_select_viaturas.Ano | {'PT': '9999'} / {'PT': '9999'} | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C039C545-025 |
| U-C039C545-01 | TABLE_Viaturas.COL_Cliente | Table column | {"PT": "Cliente"} | QRY_select_viaturas.Descricao | {'PT': '0'} / U-C039C545-01 | 100 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false} | RULE-C039C545-025 |
| U-C039C545-01 | TABLE_Viaturas.COL_Marca | Table column | {"PT": "Marca"} | QRY_select_viaturas.marca | {'PT': '0'} / U-C039C545-01 | 50 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C039C545-025 |
| U-C039C545-01 | TABLE_Viaturas.COL_Matricula | Table column | {"PT": "Matricula"} | QRY_select_viaturas.matricula | {'PT': '0'} / U-C039C545-01 | 15 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C039C545-025 |
| U-C039C545-01 | TABLE_Viaturas.COL_Mes | Table column | {"PT": "MŒs"} | QRY_select_viaturas.mes | {'PT': '99'} / U-C039C545-01 | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C039C545-025 |
| U-C039C545-01 | TABLE_Viaturas.COL_Modelo | Table column | {"PT": "Modelo"} | QRY_select_viaturas.modelo | {'PT': '0'} / U-C039C545-01 | 50 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-C039C545-025 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| TABLE_Viaturas | {"kind": "Table", "caption": {"PT": "RADFileB Table"}, "tab_order": 2, "browsed_file": "QRY_select_viaturas", "anchoring": "Width and height", "x": 14, "y": 117, "width": 678, "height": 468, "row": "Read-onl File loa 2", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} |
| BTN_Delete | {"kind": "Button", "caption": {"PT": "Apagar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 176, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 236, "width": 90, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Imprimir | {"kind": "Button", "caption": {"PT": "Imprimir"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 206, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Modificar | {"kind": "Button", "caption": {"PT": "Modificar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 147, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_cliente | {"kind": "Button", "caption": {"PT": "Pesquisar por cliente"}, "tab_order": 10, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 189, "y": 28, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_marca_modelo | {"kind": "Button", "caption": {"PT": "Pesquisar por marca/modelo"}, "tab_order": 9, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 277, "y": 28, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_matricula | {"kind": "Button", "caption": {"PT": "Pesquisar por matrícula"}, "tab_order": 11, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 102, "y": 28, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_selecionar | {"kind": "Button", "caption": {"PT": "Selecionar"}, "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 561, "width": 90, "height": 24, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_todos | {"kind": "Button", "caption": {"PT": "Ver Todos"}, "tab_order": 12, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 14, "y": 28, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| Btn_New | {"kind": "Button", "caption": {"PT": "Novo"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 117, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| EDT_termo_pesquisa | {"kind": "Edit control", "tab_order": 13, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 14, "y": 87, "width": 678, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 567, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Tabela de Viaturas"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 565, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 750, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 700, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 726, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 666, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| COL_Matricula | {"kind": "Table column", "path": "TABLE_Viaturas.COL_Matricula", "column_index": 1, "title": {"PT": "Matricula"}, "input_size": 15, "input_mask": {"PT": "0"}, "linked_item": "QRY_select_viaturas.matricula", "anchoring": "<None>", "width": 99, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Cliente | {"kind": "Table column", "path": "TABLE_Viaturas.COL_Cliente", "column_index": 2, "title": {"PT": "Cliente"}, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "QRY_select_viaturas.Descricao", "anchoring": "<None>", "width": 196, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} |
| COL_Marca | {"kind": "Table column", "path": "TABLE_Viaturas.COL_Marca", "column_index": 3, "title": {"PT": "Marca"}, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "QRY_select_viaturas.marca", "anchoring": "<None>", "width": 129, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Modelo | {"kind": "Table column", "path": "TABLE_Viaturas.COL_Modelo", "column_index": 4, "title": {"PT": "Modelo"}, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "QRY_select_viaturas.modelo", "anchoring": "<None>", "width": 123, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Ano | {"kind": "Table column", "path": "TABLE_Viaturas.COL_Ano", "column_index": 5, "title": {"PT": "Ano"}, "input_size": 0, "input_mask": {"PT": "9999"}, "display_mask": {"PT": "9999"}, "linked_item": "QRY_select_viaturas.Ano", "anchoring": "<None>", "width": 67, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Mes | {"kind": "Table column", "path": "TABLE_Viaturas.COL_Mes", "column_index": 6, "title": {"PT": "MŒs"}, "input_size": 0, "input_mask": {"PT": "99"}, "linked_item": "QRY_select_viaturas.mes", "anchoring": "<None>", "width": 43, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 666, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | TAB Key | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Browse | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Use HFilter() | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Lock record | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Save on exit | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Multi-selection | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Display/Scrollbar | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Proportional scrollbar | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Scrollbar tooltip | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Cascading input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | ENTER Management | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Saves col. config. | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | Anchored column | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| TABLE_Viaturas | QRY_select_viaturas / U-C039C545-01 / U-C039C545-01 | 5.5-compatible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Matricula | memory or not extracted / U-C039C545-01 / U-C039C545-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Cliente | memory or not extracted / U-C039C545-01 / U-C039C545-01 | File assisted input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Marca | memory or not extracted / U-C039C545-01 / U-C039C545-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Modelo | memory or not extracted / U-C039C545-01 / U-C039C545-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Ano | memory or not extracted / U-C039C545-01 / U-C039C545-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |
| COL_Mes | memory or not extracted / U-C039C545-01 / U-C039C545-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-C039C545-02 |

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-C039C545-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-C039C545-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-C039C545-02 |
| Empty result | No invented fallback or selection; U-C039C545-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-C039C545-02 |
| Other window/user change | No automatic refresh beyond source calls; U-C039C545-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-C039C545-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Table_Viaturas.wdw:347 | Info("Viatura usada em ordens de reparação, não pode ser eliminada") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|
| 1 | {"identifier": "0x173b299c07b77a03", "label": {"en-GB": "Do you want to delete the record?", "pt-PT": "Deseja apagar o registo?"}, "buttons": [{"label": {"en-GB": "&Delete", "pt-PT": "Sim"}, "value": 1}, {"label": {"en-GB": "Do &not delete", "pt-PT": "Não"}, "value": 2}], "cancel_button": 1} |

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-C039C545-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-C039C545-01. Runtime writes must be performed only against a preserved scratch data copy.
