# Screen spec — WIN_Table_Clientes

DEV component fixture only: skin-table-fixture and skin-table-canvas borrow the source table/memo. Synthetic rows and non-legacy skin-empty, skin-reverse, skin-selection, skin-activation, skin-sort, skin-table-resize, skin-column-reset/widths/lock/order/order-reset/movement controls test component callbacks; no customer query, refresh or business action is implemented by this fixture.

The non-legacy shared helpers anchoredControl/useAnchoredControl and FrameDeltaContext resize the table and move the memo using source labels with ADR-003 rate defaults; U-SKIN-01 remains open.

Non-legacy columnWidths/onColumnWidthsChange and columnOrder/onColumnOrderChange expose qualified-path layout state. moveColumn and COL_*__resize handles implement source Adjustable width/Movable flags with ADR-003/U-SKIN-04 target defaults. Synthetic lock/movement variants test capability gates; Width/order persistence now follows Saves col. config. through non-legacy useTableLayout/reconcileTableLayout, TableLayout/TableLayoutStore and createTableLayoutStore. skin-column-layout-reset and skin-column-unsaved are synthetic controls; visibility/native configuration and fixed-left scrolling remain pending (U-SKIN-05).

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw`, `dossier: WIN_Table_Clientes`, `docs/mapping/WIN_Table_Clientes.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Table_Clientes.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Table_Clientes.md |

Window properties: {"title": {"PT": "Tabela de Clientes"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 800, "height": 600}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Table_Clientes.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CC16AB27-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| TABLE_Clientes | 14 | 119 | 678 | 386 | Width and height | {} |
| COL_Codigo | 14 | 119 | None | None | <None> | {} |
| COL_Descricao | 14 | 119 | None | None | <None> | {} |
| COL_Morada1 | 14 | 119 | None | None | <None> | {} |
| COL_Morada2 | 14 | 119 | None | None | <None> | {} |
| COL_Codpostal | 14 | 119 | None | None | <None> | {} |
| COL_Telefone1 | 14 | 119 | None | None | <None> | {} |
| COL_Telemovel | 14 | 119 | None | None | <None> | {} |
| BTN_Fechar | 698 | 238 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| Btn_New | 698 | 119 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Modificar | 698 | 149 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Delete | 698 | 178 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Imprimir | 698 | 208 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 569 | 18 | Width | {} |
| SC_SCSystemButtons | 666 | 1 | 128 | 18 | U-CC16AB27-01 | {} |
| BTN_UMC | 666 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 700 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 726 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 750 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 571 | -19 | 14 | 14 | Right | {} |
| EDT_termo_pesquisa | 14 | 89 | 678 | 24 | Width | {} |
| BTN_morada | 277 | 30 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_descricao | 189 | 30 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_codigo | 102 | 30 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_todos | 14 | 30 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| EDT_Observacao | 14 | 511 | 677 | 79 | Bottom | {} |
| BTN_codigopostal | 364 | 30 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_telefone | 451 | 30 | 81 | 53 | <None> | {"background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_selecionar | 698 | 467 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 2 | TABLE_Clientes | Table | {"PT": "RADFileB Table"} | Clientes | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Read-only / — | {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false} | RULE-CC16AB27-028 |
| 3 | Btn_New | Button | {"PT": "Novo"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 4 | BTN_Modificar | Button | {"PT": "Modificar"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 5 | BTN_Delete | Button | {"PT": "Apagar"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 6 | BTN_Imprimir | Button | {"PT": "Imprimir"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 7 | BTN_Fechar | Button | {"PT": "Fechar"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 8 | EDT_termo_pesquisa | Edit control | U-CC16AB27-01 | — | {'PT': '0'} / U-CC16AB27-01 | 0 | Active / — | {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CC16AB27-028 |
| 9 | BTN_morada | Button | {"PT": "Pesquisar por morada"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 10 | BTN_descricao | Button | {"PT": "Pesquisar por descriçªo"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 11 | BTN_codigo | Button | {"PT": "Pesquisar por código"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 12 | BTN_todos | Button | {"PT": "Ver Todos"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 13 | EDT_Observacao | Edit control | {"PT": "Observaçªo"} | — | {'PT': '0'} / U-CC16AB27-01 | 0 | Read-only / — | {"Visible": true, "TAB Key": true, "Multiline": true, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": true, "Horz. scrollbar": false, "Vert. scrollbar": false} | RULE-CC16AB27-028 |
| 14 | BTN_codigopostal | Button | {"PT": "Pesquisar por código postal"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 15 | BTN_telefone | Button | {"PT": "Pesquisar por telefone"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| 16 | BTN_selecionar | Button | {"PT": "Selecionar"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Validate | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | IMG_BTN_Syst_Restore | Image | U-CC16AB27-01 | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | RADTitle | Caption | {"PT": "Tabela de Clientes"} | — | {'PT': '0'} / U-CC16AB27-01 | U-CC16AB27-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | SC_SCSystemButtons | None | U-CC16AB27-01 | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CC16AB27-028 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CC16AB27-01 | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CC16AB27-028 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CC16AB27-01 | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CC16AB27-028 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CC16AB27-01 | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CC16AB27-028 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CC16AB27-01 / U-CC16AB27-01 | U-CC16AB27-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | TABLE_Clientes.COL_Codigo | Table column | {"PT": "Código"} | Clientes.Codigo | {'PT': '9 999 999 999'} / U-CC16AB27-01 | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | TABLE_Clientes.COL_Codpostal | Table column | {"PT": "Código Postal"} | Clientes.codpostal | {'PT': '0'} / U-CC16AB27-01 | 50 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | TABLE_Clientes.COL_Descricao | Table column | {"PT": "Descriçªo"} | Clientes.Descricao | {'PT': '0'} / U-CC16AB27-01 | 100 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | TABLE_Clientes.COL_Morada1 | Table column | {"PT": "Morada 1"} | Clientes.Morada1 | {'PT': '0'} / U-CC16AB27-01 | 100 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | TABLE_Clientes.COL_Morada2 | Table column | {"PT": "Morada 2"} | Clientes.Morada2 | {'PT': '0'} / U-CC16AB27-01 | 100 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | TABLE_Clientes.COL_Telefone1 | Table column | {"PT": "Telefone"} | Clientes.Telefone1 | {'PT': '0'} / U-CC16AB27-01 | 50 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CC16AB27-028 |
| U-CC16AB27-01 | TABLE_Clientes.COL_Telemovel | Table column | {"PT": "Telemóvel"} | Clientes.Telemovel | {'PT': '0'} / U-CC16AB27-01 | 50 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CC16AB27-028 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| TABLE_Clientes | {"kind": "Table", "caption": {"PT": "RADFileB Table"}, "tab_order": 2, "browsed_file": "Clientes", "browsed_item": "ClientesID", "stored_item": "ClientesID", "anchoring": "Width and height", "x": 14, "y": 119, "width": 678, "height": 386, "row": "Read-onl File loa 2", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} |
| BTN_Delete | {"kind": "Button", "caption": {"PT": "Apagar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 178, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 238, "width": 90, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Imprimir | {"kind": "Button", "caption": {"PT": "Imprimir"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 208, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Modificar | {"kind": "Button", "caption": {"PT": "Modificar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 149, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_codigo | {"kind": "Button", "caption": {"PT": "Pesquisar por código"}, "tab_order": 11, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 102, "y": 30, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_codigopostal | {"kind": "Button", "caption": {"PT": "Pesquisar por código postal"}, "tab_order": 14, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 364, "y": 30, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_descricao | {"kind": "Button", "caption": {"PT": "Pesquisar por descriçªo"}, "tab_order": 10, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 189, "y": 30, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_morada | {"kind": "Button", "caption": {"PT": "Pesquisar por morada"}, "tab_order": 9, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 277, "y": 30, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_selecionar | {"kind": "Button", "caption": {"PT": "Selecionar"}, "tab_order": 16, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 467, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_telefone | {"kind": "Button", "caption": {"PT": "Pesquisar por telefone"}, "tab_order": 15, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 451, "y": 30, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_todos | {"kind": "Button", "caption": {"PT": "Ver Todos"}, "tab_order": 12, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "<None>", "x": 14, "y": 30, "width": 81, "height": 53, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| Btn_New | {"kind": "Button", "caption": {"PT": "Novo"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 698, "y": 119, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| EDT_Observacao | {"kind": "Edit control", "caption": {"PT": "Observaçªo"}, "tab_order": 13, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Bottom", "x": 14, "y": 511, "width": 677, "height": 79, "row": "Read-onl Text", "state": "Read-only", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": true, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": true, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| EDT_termo_pesquisa | {"kind": "Edit control", "tab_order": 8, "input_size": 0, "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 14, "y": 89, "width": 678, "height": 24, "row": "Active Text", "state": "Active", "input_type": "Text", "flags": {"Visible": true, "TAB Key": true, "Multiline": false, "RTF format": false, "Password": false, "Required input": false, "Blank if zero": false, "NULL if empty": false, "File assisted input": false, "Automatic erase": true, "End of automatic input": false, "Horizontal scroll": true, "Vertical scroll": false, "Horz. scrollbar": false, "Vert. scrollbar": false}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 571, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Tabela de Clientes"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 569, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 750, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 700, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 726, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 666, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| COL_Codigo | {"kind": "Table column", "path": "TABLE_Clientes.COL_Codigo", "column_index": 1, "title": {"PT": "Código"}, "input_size": 0, "input_mask": {"PT": "9 999 999 999"}, "linked_item": "Clientes.Codigo", "anchoring": "<None>", "width": 80, "state": "Active", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Descricao | {"kind": "Table column", "path": "TABLE_Clientes.COL_Descricao", "column_index": 2, "title": {"PT": "Descriçªo"}, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "Clientes.Descricao", "anchoring": "<None>", "width": 116, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Morada1 | {"kind": "Table column", "path": "TABLE_Clientes.COL_Morada1", "column_index": 3, "title": {"PT": "Morada 1"}, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "Clientes.Morada1", "anchoring": "<None>", "width": 110, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Morada2 | {"kind": "Table column", "path": "TABLE_Clientes.COL_Morada2", "column_index": 4, "title": {"PT": "Morada 2"}, "input_size": 100, "input_mask": {"PT": "0"}, "linked_item": "Clientes.Morada2", "anchoring": "<None>", "width": 95, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Codpostal | {"kind": "Table column", "path": "TABLE_Clientes.COL_Codpostal", "column_index": 5, "title": {"PT": "Código Postal"}, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "Clientes.codpostal", "anchoring": "<None>", "width": 96, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Telefone1 | {"kind": "Table column", "path": "TABLE_Clientes.COL_Telefone1", "column_index": 6, "title": {"PT": "Telefone"}, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "Clientes.Telefone1", "anchoring": "<None>", "width": 79, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Telemovel | {"kind": "Table column", "path": "TABLE_Clientes.COL_Telemovel", "column_index": 7, "title": {"PT": "Telemóvel"}, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "Clientes.Telemovel", "anchoring": "<None>", "width": 80, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| SC_SCSystemButtons | {"kind": null, "x": 666, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | TAB Key | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Browse | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Use HFilter() | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Lock record | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Save on exit | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Multi-selection | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Display/Scrollbar | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Proportional scrollbar | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Scrollbar tooltip | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Cascading input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | ENTER Management | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Saves col. config. | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | Anchored column | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| TABLE_Clientes | Clientes / ClientesID / ClientesID | 5.5-compatible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codigo | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Descricao | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Morada2 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Codpostal | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telefone1 | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |
| COL_Telemovel | memory or not extracted / U-CC16AB27-01 / U-CC16AB27-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CC16AB27-02 |

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CC16AB27-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CC16AB27-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CC16AB27-02 |
| Empty result | No invented fallback or selection; U-CC16AB27-02 |
| Keyboard row move | 1-based source bounds and table flags; dependent event order U-CC16AB27-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CC16AB27-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CC16AB27-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Table_Clientes.wdw:368 | Info("Cliente com viaturas associadas, não pode ser eliminado") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|
| 1 | {"identifier": "0x173b299c07b77a03", "label": {"en-GB": "Do you want to delete the record?", "pt-PT": "Deseja apagar o registo?"}, "buttons": [{"label": {"en-GB": "&Delete", "pt-PT": "Sim"}, "value": 1}, {"label": {"en-GB": "Do &not delete", "pt-PT": "Não"}, "value": 2}], "cancel_button": 1} |

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CC16AB27-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CC16AB27-01. Runtime writes must be performed only against a preserved scratch data copy.
