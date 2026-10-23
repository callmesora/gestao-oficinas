# Screen spec — WIN_Table_documentos

Evidence: `legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw`, `dossier: WIN_Table_documentos`, `docs/mapping/WIN_Table_documentos.md`. Step 0 specification only.

## Contract

| Direction | Contract | Evidence |
|---|---|---|
| in | Source procedure parameters and current HFSQL buffer, cursor and filters; exact signature and caller context in mapping note | docs/mapping/WIN_Table_documentos.md |
| out | Source ReturnedValue and file mutations; no output normalization | docs/mapping/WIN_Table_documentos.md |

Window properties: {"title": {"PT": "Tabela de Documentos"}, "window_type": "Free window", "opening_mode": "Centered in the parent window", "size": {"x": 0, "y": 0, "width": 663, "height": 600}, "close_icon": "Yes", "flags": {"Visible": true, "Title bar": true, "System menu": true, "Minimize icon": true, "Maximize icon": true, "Icon for ctx.-sensitive help": false, "Status Bar": false, "Clip background": true, "9-slice scaling": true, "Resizable": true, "With grip": true, "Grip in image": false, "Move/Background": true, "Save position": true, "Automatic Scrollbar": false, "Large font management": true, "XP Theme": false, "Indep. HFSQL ctx.": false}, "image_file": "images\\WIN_Table_documentos.jpg"}.

Missing fields throughout this spec mean unresolved (encoded), tracked by U-CFEE768B-01; they never mean false or zero. Defaults and all runtime overrides are transcribed in the mapping event ledger. Original captions retain extracted encoding artifacts until image approval.

## Layout

| Name | x | y | width | height | Anchoring | Images |
|---|---|---|---|---|---|---|
| TABLE_documentos | 14 | 31 | 538 | 554 | Width and height | {} |
| COL_DocumentosID | 14 | 31 | None | None | <None> | {} |
| COL_Codigo | 14 | 31 | None | None | <None> | {} |
| COL_Descricao | 14 | 31 | None | None | <None> | {} |
| COL_Stock | 14 | 31 | None | None | <None> | {} |
| COL_Obriga_macanico | 14 | 31 | None | None | <None> | {} |
| BTN_Fechar | 558 | 150 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| Btn_New | 558 | 31 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Modificar | 558 | 61 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Delete | 558 | 90 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_Imprimir | 558 | 120 | 90 | 24 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| RADTitle | 9 | 4 | 429 | 18 | Width | {} |
| SC_SCSystemButtons | 529 | 1 | 128 | 18 | U-CFEE768B-01 | {} |
| BTN_UMC | 529 | 0 | 24 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}} |
| BTN_SYST_MINIMIZE | 563 | 0 | 26 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}} |
| BTN_Syst_Maximize | 589 | 0 | 25 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}} |
| BTN_SYST_FERMER | 613 | 0 | 44 | 19 | <None> | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}} |
| IMG_BTN_Syst_Restore | 431 | -19 | 14 | 14 | Right | {} |
| BTN_selecionar | 558 | 547 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_seguinte | 558 | 459 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |
| BTN_anterior | 558 | 415 | 90 | 38 | Right | {"image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}} |

## Controls (tab order within each container)

| Tab | Name/path | Type | Caption/title | Linked item | Input / display mask | Max len | State / button type | Flags | Parity |
|---|---|---|---|---|---|---|---|---|---|
| 2 | TABLE_documentos | Table | U-CFEE768B-01 | documentos | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Read-only / — | {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false} | RULE-CFEE768B-021 |
| 3 | Btn_New | Button | {"PT": "Novo"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CFEE768B-021 |
| 4 | BTN_Modificar | Button | {"PT": "Modificar"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CFEE768B-021 |
| 5 | BTN_Delete | Button | {"PT": "Apagar"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CFEE768B-021 |
| 6 | BTN_Imprimir | Button | {"PT": "Imprimir"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Normal | {"Visible": true, "TAB Key": true} | RULE-CFEE768B-021 |
| 7 | BTN_Fechar | Button | {"PT": "Fechar"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Abort | {"Visible": true, "TAB Key": true} | RULE-CFEE768B-021 |
| 8 | BTN_selecionar | Button | {"PT": "Selecionar"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-CFEE768B-021 |
| 9 | BTN_seguinte | Button | {"PT": "Seguinte"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-CFEE768B-021 |
| 10 | BTN_anterior | Button | {"PT": "Anterior"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Validate | {"Visible": false, "TAB Key": true} | RULE-CFEE768B-021 |
| U-CFEE768B-01 | IMG_BTN_Syst_Restore | Image | U-CFEE768B-01 | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / — | {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false} | RULE-CFEE768B-021 |
| U-CFEE768B-01 | RADTitle | Caption | {"PT": "Tabela de Documentos"} | — | {'PT': '0'} / U-CFEE768B-01 | U-CFEE768B-01 | Active / — | {"Visible": true, "RTF format": false, "Default animation": false} | RULE-CFEE768B-021 |
| U-CFEE768B-01 | SC_SCSystemButtons | None | U-CFEE768B-01 | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / — | {"Visible": true, "TAB Key": true} | RULE-CFEE768B-021 |
| -1 | SC_SCSystemButtons.BTN_SYST_FERMER | Button | U-CFEE768B-01 | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CFEE768B-021 |
| -1 | SC_SCSystemButtons.BTN_SYST_MINIMIZE | Button | U-CFEE768B-01 | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CFEE768B-021 |
| -1 | SC_SCSystemButtons.BTN_Syst_Maximize | Button | U-CFEE768B-01 | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Normal | {"Visible": true, "TAB Key": false} | RULE-CFEE768B-021 |
| 1 | SC_SCSystemButtons.BTN_UMC | Button | {"PT": "&Bouton"} | — | U-CFEE768B-01 / U-CFEE768B-01 | U-CFEE768B-01 | Active / Normal | {"Visible": false, "TAB Key": true} | RULE-CFEE768B-021 |
| U-CFEE768B-01 | TABLE_documentos.COL_Codigo | Table column | {"PT": "Código"} | documentos.Codigo | {'PT': '0'} / U-CFEE768B-01 | 3 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CFEE768B-021 |
| U-CFEE768B-01 | TABLE_documentos.COL_Descricao | Table column | {"PT": "Descriçªo"} | documentos.Descricao | {'PT': '0'} / U-CFEE768B-01 | 50 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CFEE768B-021 |
| U-CFEE768B-01 | TABLE_documentos.COL_DocumentosID | Table column | {"PT": "Identifier of documentos"} | documentos.documentosID | {'PT': '+9 999 999 999 999 999 999'} / U-CFEE768B-01 | 0 | Read-onl / — | {"Visible": false, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CFEE768B-021 |
| U-CFEE768B-01 | TABLE_documentos.COL_Obriga_macanico | Table column | {"PT": "Obriga mecânico"} | documentos.obriga_macanico | {'PT': '0'} / U-CFEE768B-01 | 0 | U-CFEE768B-01 / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false} | RULE-CFEE768B-021 |
| U-CFEE768B-01 | TABLE_documentos.COL_Stock | Table column | {"PT": "Stock"} | documentos.stock | {'PT': '0'} / U-CFEE768B-01 | 0 | Active / — | {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true} | RULE-CFEE768B-021 |

## Complete parsed designer metadata

| Control | All extracted properties |
|---|---|
| TABLE_documentos | {"kind": "Table", "tab_order": 2, "browsed_file": "documentos", "browsed_item": "documentosID", "stored_item": "documentosID", "anchoring": "Width and height", "x": 14, "y": 31, "width": 538, "height": 554, "row": "Read-onl File loa 3", "state": "Read-only", "flags": {"Visible": true, "TAB Key": true, "Browse": true, "Use HFilter()": true, "Lock record": false, "Save on exit": true, "Multi-selection": false, "Display/Scrollbar": false, "Proportional scrollbar": true, "Scrollbar tooltip": true, "Cascading input": true, "ENTER Management": true, "Saves col. config.": true, "Anchored column": false, "5.5-compatible": false}} |
| BTN_Delete | {"kind": "Button", "caption": {"PT": "Apagar"}, "tab_order": 5, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Delete.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 558, "y": 90, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Fechar | {"kind": "Button", "caption": {"PT": "Fechar"}, "tab_order": 7, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 558, "y": 150, "width": 90, "height": 24, "row": "Active Abort", "state": "Active", "button_type": "Abort", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Imprimir | {"kind": "Button", "caption": {"PT": "Imprimir"}, "tab_order": 6, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Print.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 558, "y": 120, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_Modificar | {"kind": "Button", "caption": {"PT": "Modificar"}, "tab_order": 4, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_Modif.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 558, "y": 61, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| BTN_anterior | {"kind": "Button", "caption": {"PT": "Anterior"}, "tab_order": 10, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01372.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 558, "y": 415, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_seguinte | {"kind": "Button", "caption": {"PT": "Seguinte"}, "tab_order": 9, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\VST01370.png"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 558, "y": 459, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| BTN_selecionar | {"kind": "Button", "caption": {"PT": "Selecionar"}, "tab_order": 8, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_OK.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 558, "y": 547, "width": 90, "height": 38, "row": "Active Validate", "state": "Active", "button_type": "Validate", "flags": {"Visible": false, "TAB Key": true}} |
| Btn_New | {"kind": "Button", "caption": {"PT": "Novo"}, "tab_order": 3, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\Btn_New.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_anim.gif"}, "anchoring": "Right", "x": 558, "y": 31, "width": 90, "height": 24, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": true}} |
| IMG_BTN_Syst_Restore | {"kind": "Image", "initial_value": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Restore.gif"}, "anchoring": "Right", "x": 431, "y": -19, "width": 14, "height": 14, "row": "Active", "state": "Active", "flags": {"Visible": true, "With click": true, "Priority for click": false, "Default animation": false, "With focus": false}} |
| RADTitle | {"kind": "Caption", "caption": {"PT": "Tabela de Documentos"}, "input_type": "Text", "input_mask": {"PT": "0"}, "anchoring": "Width", "x": 9, "y": 4, "width": 429, "height": 18, "row": "Active Left Center", "state": "Active", "flags": {"Visible": true, "RTF format": false, "Default animation": false}} |
| BTN_SYST_FERMER | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_FERMER", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Close_Anim.gif"}, "anchoring": "<None>", "x": 613, "y": 0, "width": 44, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_SYST_MINIMIZE | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_SYST_MINIMIZE", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Minimize_Anim.gif"}, "anchoring": "<None>", "x": 563, "y": 0, "width": 26, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_Syst_Maximize | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_Syst_Maximize", "tab_order": "-1", "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximise.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_Maximize_Anim.gif"}, "anchoring": "<None>", "x": 589, "y": 0, "width": 25, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": true, "TAB Key": false}} |
| BTN_UMC | {"kind": "Button", "path": "SC_SCSystemButtons.BTN_UMC", "caption": {"PT": "&Bouton"}, "tab_order": 1, "image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC.gif"}, "background_image": {"PT": "C:\\My Projects\\GestaoOficinas\\MediaPlayer_Btn_UMC_Anim.gif"}, "anchoring": "<None>", "x": 529, "y": 0, "width": 24, "height": 19, "row": "Active Normal", "state": "Active", "button_type": "Normal", "flags": {"Visible": false, "TAB Key": true}} |
| COL_DocumentosID | {"kind": "Table column", "path": "TABLE_documentos.COL_DocumentosID", "column_index": 1, "title": {"PT": "Identifier of documentos"}, "input_size": 0, "input_mask": {"PT": "+9 999 999 999 999 999 999"}, "linked_item": "documentos.documentosID", "anchoring": "<None>", "width": 158, "state": "Read-onl", "h_align": "Right", "v_align": "Center", "input_type": "Numeric", "flags": {"Visible": false, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Codigo | {"kind": "Table column", "path": "TABLE_documentos.COL_Codigo", "column_index": 2, "title": {"PT": "Código"}, "input_size": 3, "input_mask": {"PT": "0"}, "linked_item": "documentos.Codigo", "anchoring": "<None>", "width": 79, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Descricao | {"kind": "Table column", "path": "TABLE_documentos.COL_Descricao", "column_index": 3, "title": {"PT": "Descriçªo"}, "input_size": 50, "input_mask": {"PT": "0"}, "linked_item": "documentos.Descricao", "anchoring": "<None>", "width": 244, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Stock | {"kind": "Table column", "path": "TABLE_documentos.COL_Stock", "column_index": 4, "title": {"PT": "Stock"}, "input_size": 0, "input_mask": {"PT": "0"}, "linked_item": "documentos.stock", "anchoring": "<None>", "width": 93, "state": "Active", "h_align": "Left", "v_align": "Center", "input_type": "Text", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": true}} |
| COL_Obriga_macanico | {"kind": "Table column", "path": "TABLE_documentos.COL_Obriga_macanico", "column_index": 5, "title": {"PT": "Obriga mecânico"}, "input_size": 0, "input_mask": {"PT": "0"}, "linked_item": "documentos.obriga_macanico", "anchoring": "<None>", "flags": {"Visible": true, "Fixed left": false, "Movable": true, "Adjustable width": true, "Sortable column": true, "With search": true, "Multiline": false, "RTF format": false, "Sorted": false, "With input": false, "File assisted input": false}} |
| SC_SCSystemButtons | {"kind": null, "x": 529, "y": 1, "width": 128, "height": 18, "row": "Active", "state": "Active", "flags": {"Visible": true, "TAB Key": true}} |

## Tables and built-in features

| Control | Source / browse key / stored item | Feature | Enabled | Interaction |
|---|---|---|---|---|
| TABLE_documentos | documentos / documentosID / documentosID | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | TAB Key | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Browse | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Use HFilter() | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Lock record | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Save on exit | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Multi-selection | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Display/Scrollbar | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Proportional scrollbar | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Scrollbar tooltip | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Cascading input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | ENTER Management | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Saves col. config. | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | Anchored column | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| TABLE_documentos | documentos / documentosID / documentosID | 5.5-compatible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Visible | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_DocumentosID | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Codigo | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Descricao | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Stock | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | File assisted input | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Visible | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Fixed left | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Movable | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Adjustable width | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sortable column | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With search | True | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Multiline | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | RTF format | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | Sorted | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | With input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |
| COL_Obriga_macanico | memory or not extracted / U-CFEE768B-01 / U-CFEE768B-01 | File assisted input | False | Source filters and refresh sequence remain authoritative; header interaction edge cases U-CFEE768B-02 |

## Selection and display state

| Moment | Contract |
|---|---|
| Open | Exact globals/control/end-init sequence in mapping; implicit initial selection U-CFEE768B-02 |
| Search/mode change | Exact filters, focus and TableDisplay in mapping; empty result selection U-CFEE768B-02 |
| Add/modify/delete | Exact TableDisplay/seek mode in mapping; vanished row U-CFEE768B-02 |
| Empty result | No invented fallback or selection; U-CFEE768B-02 |
| Keyboard row move | Previous requires current>1; next tests only current<count and requests current+1, with no no-selection/lower-bound guard. Invalid-index/empty-result engine outcome and dependent event order U-CFEE768B-02 |
| Other window/user change | No automatic refresh beyond source calls; U-CFEE768B-02 |
| Second instance | Shared buffer/filter behavior requires runtime capture; U-CFEE768B-02 |

## Messages

| Source | Exact message expression | Dialog shell |
|---|---|---|
| legacy/GestaoOficinas_TesteIA/WIN_Table_documentos.wdw:313 | Info("Tipo de documento associado a documentos, não pode ser eliminado") | Info/Error is blocking; proposed: Q-12 (assumed). No field values copied. |

| Dialog resource | Extracted properties |
|---|---|
| 1 | {"identifier": "0x173b299c07b77a03", "label": {"en-GB": "Do you want to delete the record?", "pt-PT": "Deseja apagar o registo?"}, "buttons": [{"label": {"en-GB": "&Delete", "pt-PT": "Sim"}, "value": 1}, {"label": {"en-GB": "Do &not delete", "pt-PT": "Não"}, "value": 2}], "cancel_button": 1} |

Delete resource CASE 1 deletes and CASE 2 makes no change when present. Default/Esc outcome is assumed from `proposed: Q-01` when listed in the mapping; exact untranslated resource labels above take precedence over source comments.

## Data edge cases and acceptance checks

Blank strings are compared exactly by source, with no trimming; absent NULL coercion rules and number/text locale boundaries belong to U-CFEE768B-03. Required controls are those guarded explicitly in mapping, never inferred from a caption. Observe mask/size above and compare schema types. Keyboard-only test: open, traverse by container tab order, trigger mandatory validation, select/change/cancel, then repeat with an empty filter result and first/last row. Visual approval is outstanding under U-CFEE768B-01. Runtime writes must be performed only against a preserved scratch data copy.
